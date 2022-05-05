/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/m/MessageBox",
	"sap/ui/base/Event",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4"
], function(
	RtaQunitUtils,
	MessageBox,
	Event,
	PersistenceWriteAPI,
	ReloadInfoAPI,
	Version,
	VersionsAPI,
	FlexUtils,
	JSONModel,
	RuntimeAuthoring,
	Utils,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	var oComp = RtaQunitUtils.createAndStubAppComponent(sinon);

	function givenAnFLP(fnFLPReloadStub, mShellParams) {
		sandbox.stub(FlexUtils, "getUshellContainer").returns({
			getServiceAsync: function() {
				return Promise.resolve({
					toExternal: function() {},
					getHash: function() {
						return "Action-somestring";
					},
					parseShellHash: function() {
						var mHash = {
							semanticObject: "Action",
							action: "somestring"
						};

						if (mShellParams) {
							mHash.params = mShellParams;
						}
						return mHash;
					},
					unregisterNavigationFilter: function() {},
					registerNavigationFilter: function() {},
					reloadCurrentApp: fnFLPReloadStub,
					getUser: function() {}
				});
			}
		});
	}

	function whenUserConfirmsMessage(sExpectedMessageKey, assert) {
		return sandbox.stub(Utils, "showMessageBox").callsFake(
			function(oMessageType, sMessageKey) {
				assert.equal(sMessageKey, sExpectedMessageKey, "then expected message is shown");
				return Promise.resolve();
			}
		);
	}

	function mockStateCallIsDraftAvailableAndCheckResult(assert, oRta, bIsVersioningEnabled, bIsDraftAvailable, bCanUndo, bExpectedResult) {
		oRta._bVersioningEnabled = bIsVersioningEnabled;
		sandbox.stub(VersionsAPI, "isDraftAvailable").returns(bIsDraftAvailable);
		sandbox.stub(oRta, "canUndo").returns(bCanUndo);
		assert.equal(oRta._isDraftAvailable(), bExpectedResult);
	}

	QUnit.module("Given that RuntimeAuthoring wants to determine if a draft is available", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and versioning is not available", function(assert) {
			return mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, false, false, false, false);
		});
		QUnit.test("and versioning is available but no draft and no undo is available", function(assert) {
			return mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, false, false, false);
		});
		QUnit.test("and versioning and a draft is available", function(assert) {
			return mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, true, false, true);
		});
		QUnit.test("and versioning and a undo is available", function(assert) {
			return mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, false, true, false);
		});
		QUnit.test("and versioning, a draft and undo is available", function(assert) {
			return mockStateCallIsDraftAvailableAndCheckResult(assert, this.oRta, true, true, true, true);
		});
	});

	QUnit.module("Given that RuntimeAuthoring calls _triggerReloadOnStart", {
		beforeEach: function() {
			givenAnFLP();
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			this.mParsedHash = {params: {}};

			this.oURLParsingService = {
				parseShellHash: function() {
					var mHash = {
						semanticObject: "Action",
						action: "somestring"
					};

					mHash.params = {};
					return mHash;
				}
			};

			this.oReloadInfo = {
				hasHigherLayerChanges: false,
				isDraftAvailable: true,
				layer: this.oRta.getLayer(),
				selector: this.oRta.getRootControlInstance(),
				ignoreMaxLayerParameter: false,
				includeCtrlVariants: true,
				parsedHash: this.mParsedHash,
				URLParsingService: this.oURLParsingService
			};

			sandbox.stub(this.oRta, "_getUShellService").withArgs("CrossApplicationNavigation").returns({
				toExternal: function() {
					return true;
				}
			});
			this.oLoadDraftForApplication = sandbox.stub(VersionsAPI, "loadDraftForApplication").resolves();
			this.oLoadVersionForApplication = sandbox.stub(VersionsAPI, "loadVersionForApplication").resolves();
			return this.oRta._initVersioning();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a reload is needed on start because of draft changes", function(assert) {
			this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);

			whenUserConfirmsMessage.call(this, "MSG_DRAFT_EXISTS", assert);

			var oReloadInfo = {
				isDraftAvailable: true,
				hasHigherLayerChanges: false,
				URLParsingService: this.oURLParsingService
			};
			return this.oRta._triggerReloadOnStart(oReloadInfo).then(function(bReloadResult) {
				assert.ok(bReloadResult, "then the reload is successful");
				assert.equal(this.oLoadDraftForApplication.callCount, 1, "then loadDraftForApplication is called once");
				assert.equal(this.oLoadVersionForApplication.callCount, 0, "then loadVersionForApplication is not called");
			}.bind(this));
		});

		QUnit.test("and a reload is needed on start because of personalization changes", function(assert) {
			var oConfirmMessageStub = whenUserConfirmsMessage.call(this, "MSG_HIGHER_LAYER_CHANGES_EXIST", assert);

			var oReloadInfo = {
				isDraftAvailable: false,
				hasHigherLayerChanges: true,
				URLParsingService: this.oURLParsingService
			};

			var oFlexSettings = this.oRta.getFlexSettings();
			oFlexSettings.developerMode = false;
			this.oRta.setFlexSettings(oFlexSettings);

			return this.oRta._triggerReloadOnStart(oReloadInfo).then(function(bReloadResult) {
				assert.ok(bReloadResult, "then the reload is successful");
				assert.equal(this.oLoadDraftForApplication.callCount, 0, "then loadDraftForApplication is not called");
				assert.equal(this.oLoadVersionForApplication.callCount, 0, "then loadVersionForApplication is not called");
				assert.equal(oConfirmMessageStub.callCount, 1, "then messagebox was shown and confirmed");
			}.bind(this));
		});

		QUnit.test("and a reload is needed on start because of personalization changes in visual editor", function(assert) {
			var oFlexSettings = this.oRta.getFlexSettings();
			oFlexSettings.developerMode = true;
			this.oRta.setFlexSettings(oFlexSettings);

			var oConfirmMessageStub = whenUserConfirmsMessage.call(this, "MSG_HIGHER_LAYER_CHANGES_EXIST", assert);

			var oReloadInfo = {
				isDraftAvailable: false,
				hasHigherLayerChanges: true,
				URLParsingService: this.oURLParsingService
			};
			return this.oRta._triggerReloadOnStart(oReloadInfo).then(function(bReloadResult) {
				assert.ok(bReloadResult, "then the reload is successful");
				assert.equal(this.oLoadDraftForApplication.callCount, 0, "then loadDraftForApplication is not called");
				assert.equal(this.oLoadVersionForApplication.callCount, 0, "then loadVersionForApplication is not called");
				assert.equal(oConfirmMessageStub.callCount, 0, "then messagebox is not called");
			}.bind(this));
		});
	});

	QUnit.module("Given that RuntimeAuthoring in the CUSTOMER layer was started within an FLP and wants to determine if a reload is needed on exit", {
		beforeEach: function() {
			givenAnFLP();
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and nothing has changed", function(assert) {
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox");
			return this.oRta._handleReloadOnExit()
				.then(function(oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "NO_RELOAD", "then no reload is triggered");
					assert.equal(oShowMessageBoxStub.callCount, 0, "and no message was shown");
				});
		});

		QUnit.test("a higher layer changes exist but no dirty draft changes", function(assert) {
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_PERSONALIZATION_AND_VIEWS", assert);
			return this.oRta._handleReloadOnExit()
				.then(function(oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("a higher layer changes exist with dirty draft changes", function(assert) {
			sandbox.stub(ReloadInfoAPI, "hasMaxLayerParameterWithValue").returns(true);
			this.oRta._oVersionsModel.setProperty("/draftAvailable", true);
			this.oRta._oVersionsModel.setProperty("/dirtyChanges", true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_VIEWS_PERSONALIZATION_AND_WITHOUT_DRAFT", assert);
			return this.oRta._handleReloadOnExit()
				.then(function(oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("a higher layer changes exist with dirty draft changes", function(assert) {
			sandbox.stub(VersionsAPI, "isDraftAvailable").returns(true);
			var mInitialParsedHash = {
				params: {
					"sap-ui-fl-version": [Version.Number.Draft]
				}
			};
			var oReloadCurrentAppStub = sandbox.stub(this.oRta._getUShellService("AppLifeCycle"), "reloadCurrentApp").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITH_VIEWS_PERSONALIZATION_AND_WITHOUT_DRAFT", assert);
			var mParsedHash = this.oRta._removeVersionParameterForFLP({deleteMaxLayer: true, hasHigherLayerChanges: true}, mInitialParsedHash);
			assert.equal(mInitialParsedHash, mParsedHash, "hash didnt change");
			assert.equal(oReloadCurrentAppStub.calledOnce, false, "no hash reload");
		});

		QUnit.test("and the initial draft got activated", function(assert) {
			sandbox.stub(ReloadInfoAPI, "initialDraftGotActivated").returns(true);
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_ACTIVATED_DRAFT", assert);
			return this.oRta._handleReloadOnExit()
				.then(function(oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
				});
		});

		QUnit.test("and draft changes exist", function(assert) {
			this.oRta._oVersionsModel.setProperty("/draftAvailable", true);
			this.oRta._oVersionsModel.setProperty("/dirtyChanges", true);
			var oShowMessageBoxStub = whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);

			return this.oRta._handleReloadOnExit()
				.then(function(oReloadInfo) {
					assert.equal(oShowMessageBoxStub.calledOnce, true, "A Popup was shown");
					assert.equal(oReloadInfo.reloadMethod, "CROSS_APP_NAVIGATION", "then a cross app is triggered");
					assert.equal(oReloadInfo.isDraftAvailable, true, "Reload reason for isDraftAvailable is true");
				});
		});

		QUnit.test("and active version is not selected", function(assert) {
			this.oRta._oVersionsModel.setProperty("/draftAvailable", true);
			this.oRta._oVersionsModel.setProperty("/activeVersion", "2");
			var oShowMessageBoxStub = whenUserConfirmsMessage.call(this, "MSG_RELOAD_WITHOUT_DRAFT", assert);
			return this.oRta._handleReloadOnExit()
				.then(function(oReloadInfo) {
					assert.equal(oShowMessageBoxStub.calledOnce, true, "A Popup was shown");
					assert.equal(oReloadInfo.activeVersionNotSelected, true, "the active version is not selected");
				});
		});

		QUnit.test("and changes need a reload", function(assert) {
			this.oRta._bReloadNeeded = true;
			whenUserConfirmsMessage.call(this, "MSG_RELOAD_NEEDED", assert);
			return this.oRta._handleReloadOnExit()
				.then(function(oReloadInfo) {
					assert.equal(oReloadInfo.reloadMethod, "HARD_RELOAD", "then a hard reload is triggered");
				});
		});
	});

	QUnit.module("Given that RuntimeAuthoring gets a switch version event from the toolbar in the FLP", {
		beforeEach: function() {
			this.oRestartFlpStub = sandbox.stub();
			givenAnFLP(this.oRestartFlpStub, {});
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.oSwitchVersionStub = sandbox.stub(this.oRta, "_switchVersion");
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when something can be undone", function(assert) {
			var oEvent = new Event("someEventId", undefined, {
				version: "1"
			});

			sandbox.stub(this.oRta, "canUndo").returns(true);
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);

			this.oRta._onSwitchVersion(oEvent);

			assert.equal(oShowMessageBoxStub.callCount, 1, "a MessageBox was opened");
			assert.equal(this.oEnableRestartStub.callCount, 0, "then no restart is enabled");
		});

		QUnit.test("when the displayed version and the in the event are the same", function(assert) {
			var oEvent = new Event("someEventId", undefined, {
				version: "1"
			});

			this.oRta._oVersionsModel.setProperty("/displayedVersion", "1");
			this.oRta._onSwitchVersion(oEvent);

			assert.equal(this.oEnableRestartStub.callCount, 0, "then no restart is enabled");
		});

		QUnit.test("when no version is in the url and the app", function(assert) {
			var fnDone = assert.async();
			var oEvent = new Event("someEventId", undefined, {
				version: "1"
			});

			var oCrossAppNavigationStub = sandbox.stub(this.oRta, "_triggerCrossAppNavigation").resolves();
			var oLoadVersionStub = sandbox.stub(VersionsAPI, "loadVersionForApplication");

			this.oSwitchVersionStub.callsFake(function() {
				this.oRta._switchVersion.wrappedMethod.apply(this.oRta, arguments);
				assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is enabled");
				assert.equal(oLoadVersionStub.callCount, 1, "a reload for versions as triggered");
				var oLoadVersionArguments = oLoadVersionStub.getCall(0).args[0];
				assert.equal(oLoadVersionArguments.control, oComp, "with the control");
				assert.equal(oLoadVersionArguments.version, "1", ", the version number");
				assert.equal(oLoadVersionArguments.layer, this.oRta.getLayer(), "and the layer");
				assert.equal(oCrossAppNavigationStub.callCount, 1, "a cross app navigation was triggered");
				fnDone();
			}.bind(this));

			this.oRta._onSwitchVersion(oEvent);
		});

		QUnit.test("when a version is in the url and the same version should be loaded again (i.e. loaded the app with " +
			"the 'Original App' version, create a draft and switch to 'Original Version' again)", function(assert) {
			var fnDone = assert.async();
			var oEvent = new Event("someEventId", undefined, {
				version: Version.Number.Original
			});

			var oLoadVersionStub = sandbox.stub(VersionsAPI, "loadVersionForApplication");
			var mParsedUrlHash = {
				params: {}
			};
			this.oRta._oVersionsModel.setProperty("/displayedVersion", Version.Number.Draft);
			mParsedUrlHash.params["sap-ui-fl-version"] = [Version.Number.Original.toString()];
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedUrlHash);

			this.oSwitchVersionStub.callsFake(function() {
				this.oRta._switchVersion.wrappedMethod.apply(this.oRta, arguments);
				assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is mentioned");
				assert.equal(oLoadVersionStub.callCount, 1, "a reload for versions as triggered");
				var oLoadVersionArguments = oLoadVersionStub.getCall(0).args[0];
				assert.equal(oLoadVersionArguments.control, oComp, "with the control");
				assert.equal(oLoadVersionArguments.version, Version.Number.Original, ", the version number");
				assert.equal(oLoadVersionArguments.layer, this.oRta.getLayer(), "and the layer");
				assert.equal(this.oRestartFlpStub.callCount, 1, "a app restart was triggered");
				fnDone();
			}.bind(this));

			this.oRta._onSwitchVersion(oEvent);
		});
	});

	QUnit.module("Given that RuntimeAuthoring gets a switch version event from the toolbar in the FLP, something can be undone and a dialog fires an event", {
		beforeEach: function() {
			givenAnFLP(sandbox.stub(), {});
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});
			sandbox.stub(this.oRta, "canUndo").returns(true);
			this.oSerializeStub = sandbox.stub(this.oRta, "_serializeToLrep").resolves();
			this.oSwitchVersionStub = sandbox.stub(this.oRta, "_switchVersion");
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.nVersionParameter = 1;
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when save was called", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.YES);

			var oEvent = new Event("someEventId", undefined, {
				version: this.nVersionParameter
			});

			this.oSwitchVersionStub.callsFake(function() {
				this.oRta._switchVersion.wrappedMethod.apply(this.oRta, arguments);
				assert.equal(this.oSerializeStub.callCount, 1, "the changes were saved");
				assert.equal(this.oSwitchVersionStub.callCount, 1, "the version switch was triggered");
				var aSwitchVersionArguments = this.oSwitchVersionStub.getCall(0).args;
				assert.equal(aSwitchVersionArguments[0], this.nVersionParameter, "the version parameter was passed correct");
				fnDone();
			}.bind(this));

			this.oRta._onSwitchVersion(oEvent);
		});

		QUnit.test("when changes should not be saved", function(assert) {
			var fnDone = assert.async();
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.NO);

			var oEvent = new Event("someEventId", undefined, {
				version: this.nVersionParameter
			});

			this.oSwitchVersionStub.callsFake(function() {
				this.oRta._switchVersion.wrappedMethod.apply(this.oRta, arguments);
				assert.equal(this.oSerializeStub.callCount, 0, "the changes were not saved");
				assert.equal(this.oSwitchVersionStub.callCount, 1, "the version switch was triggered");
				var aSwitchVersionArguments = this.oSwitchVersionStub.getCall(0).args;
				assert.equal(aSwitchVersionArguments[0], this.nVersionParameter, "the version parameter was passed correct");
				fnDone();
			}.bind(this));

			this.oRta._onSwitchVersion(oEvent);
		});

		QUnit.test("when cancel was called", function(assert) {
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);

			var oEvent = new Event("someEventId", undefined, {
				version: this.nVersionParameter
			});

			this.oRta._onSwitchVersion(oEvent);
			assert.equal(this.oSerializeStub.callCount, 0, "the changes were not saved");
			assert.equal(this.oSwitchVersionStub.callCount, 0, "the version switch was not triggered");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with a draft", {
		beforeEach: function() {
			givenAnFLP();
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp
			});

			sandbox.stub(this.oRta, "_setVersionsModel").callsFake(function(oModel) {
				oModel.setProperty("/versions", [{
					version: Version.Number.Draft,
					type: "draft"
				}]);
				oModel.setProperty("/backendDraft", true);
				oModel.setProperty("/versioningEnabled", true);
				this.oRta._oVersionsModel = oModel;
				return Promise.resolve();
			}.bind(this));
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when _onActivate is called on draft", function(assert) {
			var oActivateStub;
			var oShowMessageToastStub;
			var sVersionTitle = "aVersionTitle";
			var oEvent = {
				getParameter: function() {
					return sVersionTitle;
				}
			};

			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);

			return this.oRta
				.start()
				.then(function() {
					oActivateStub = sandbox.stub(VersionsAPI, "activate").resolves(true);
					oShowMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");
					return this.oRta._onActivate(oEvent);
				}.bind(this))
				.then(function() {
					assert.equal(oActivateStub.callCount, 1, "then the activate() method is called once");
					var oActivationCallPropertyBag = oActivateStub.getCall(0).args[0];
					assert.equal(oActivationCallPropertyBag.control, this.oRta.getRootControlInstance(), "with the correct control");
					assert.equal(oActivationCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
					assert.equal(oActivationCallPropertyBag.title, sVersionTitle, "and version title");
					assert.equal(this.oRta.bInitialResetEnabled, true, "and the initialRestEnabled is true");
					assert.equal(this.oRta.getToolbar().getModel("controls").getProperty("/restoreEnabled"), true, "RestoreEnabled is correctly set in Model");
					assert.equal(oShowMessageToastStub.callCount, 1, "and a message is shown");
				}.bind(this));
		});

		QUnit.test("when _onActivate is called on an older version with backend draft", function(assert) {
			var sVersionTitle = "aVersionTitle";
			var oEvent = {
				getParameter: function() {
					return sVersionTitle;
				}
			};

			sandbox.stub(this.oRta, "_isOldVersionDisplayed").returns(true);
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(PersistenceWriteAPI, "save").resolves();
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);
			var oSerializeAndSaveSpy = sandbox.spy(this.oRta, "_serializeAndSave");
			var oActivateStub = sandbox.stub(VersionsAPI, "activate").resolves(true);
			var oShowMessageToastStub = sandbox.stub(this.oRta, "_showMessageToast");

			return this.oRta
				.start()
				.then(function() {
					return this.oRta._onActivate(oEvent);
				}.bind(this))
				.then(function() {
					assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown and click on CANCEL");
					assert.equal(oShowMessageBoxStub.lastCall.args[1], "MSG_DRAFT_DISCARD_ON_REACTIVATE_DIALOG", "the message text is correct");
					assert.equal(oSerializeAndSaveSpy.callCount, 0, "serializeAndSave was not called");
					assert.equal(oActivateStub.callCount, 0, "activate() method was not called");

					oShowMessageBoxStub.reset();
					oShowMessageBoxStub.resolves(MessageBox.Action.OK);
					return this.oRta._onActivate(oEvent);
				}.bind(this))
				.then(function() {
					assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown and click on OK");
					assert.equal(oSerializeAndSaveSpy.callCount, 1, "serializeAndSave is called once");
					assert.equal(oActivateStub.callCount, 1, "activate() method is called once");
					assert.equal(oSerializeAndSaveSpy.calledBefore(oActivateStub), true, "serialize was called before activating the verison");
					var oActivationCallPropertyBag = oActivateStub.getCall(0).args[0];
					assert.equal(oActivationCallPropertyBag.control, this.oRta.getRootControlInstance(), "with the correct control");
					assert.equal(oActivationCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
					assert.equal(oActivationCallPropertyBag.title, sVersionTitle, "and version title");
					assert.equal(this.oRta.bInitialResetEnabled, true, "and the initialRestEnabled is true");
					assert.equal(this.oRta.getToolbar().getModel("controls").getProperty("/restoreEnabled"), true, "RestoreEnabled is correctly set in Model");
					assert.equal(oShowMessageToastStub.callCount, 1, "and a message is shown");
				}.bind(this));
		});

		QUnit.test("when the draft activation fails", function(assert) {
			var done = assert.async();
			var oEvent = {
				versionTitle: "VersionTitle"
			};
			sandbox.stub(VersionsAPI, "activate").rejects("myFancyError");
			sandbox.stub(Utils, "showMessageBox").callsFake(function(sIconType, sMessage, mPropertyBag) {
				assert.equal(sIconType, "error", "the error message box is used");
				assert.equal(mPropertyBag.error, "myFancyError", "and a message box shows the error to the user");
				assert.equal(sMessage, "MSG_DRAFT_ACTIVATION_FAILED", "the message is MSG_DRAFT_ACTIVATION_FAILED");
				done();
			});

			this.oRta.start().then(function() {
				this.oRta.getToolbar().fireEvent("activate", oEvent);
			}.bind(this));
		});

		QUnit.test("when _onDiscardDraft is called", function(assert) {
			var oDiscardDraftStub = sandbox.stub(VersionsAPI, "discardDraft").resolves();
			var oHandleDiscardDraftStub = sandbox.spy(this.oRta, "_handleDiscard");
			var oRemoveVersionParameterStub = sandbox.spy(this.oRta, "_removeVersionParameterForFLP");
			var oRemoveAllCommandsStub = sandbox.stub(this.oRta.getCommandStack(), "removeAllCommands");
			var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves("MessageBox.Action.CANCEL");
			var oStopStub = sandbox.stub(this.oRta, "stop");
			var oCrossAppNavigationStub = sandbox.stub(this.oRta, "_triggerCrossAppNavigation").resolves();
			var mParsedHash = {
				params: {
					"sap-ui-fl-version": [Version.Number.Draft]
				}
			};
			sandbox.stub(this.oRta, "_isDraftAvailable").returns(true);
			sandbox.stub(FlexUtils, "getParsedURLHash").returns(mParsedHash);
			return this.oRta.start()
				.then(this.oRta._onDiscardDraft.bind(this.oRta, false))
				.then(function() {
					assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown");
					assert.equal(oHandleDiscardDraftStub.callCount, 0, "then _handleDiscard was not called");
					assert.equal(oDiscardDraftStub.callCount, 0, "then VersionsAPI was not called");
					assert.equal(oRemoveVersionParameterStub.callCount, 0, "then _removeVersionParameterForFLP was not called");

					oShowMessageBoxStub.reset();
					oShowMessageBoxStub.resolves(MessageBox.Action.OK);
					return this.oRta._onDiscardDraft(false);
				}.bind(this))
				.then(function() {
					assert.equal(oShowMessageBoxStub.callCount, 1, "then the message box was shown");
					assert.equal(oShowMessageBoxStub.lastCall.args[1], "MSG_DRAFT_DISCARD_DIALOG", "then the message is correct");
					assert.equal(oDiscardDraftStub.callCount, 1, "then the discardDraft() method is called once");
					assert.equal(oHandleDiscardDraftStub.callCount, 1, "then _handleDiscard was called");
					assert.equal(oRemoveAllCommandsStub.callCount, 1, "and all commands were removed");
					assert.equal(oRemoveVersionParameterStub.callCount, 1, "then _removeVersionParameterForFLP was called");
					assert.equal(oRemoveVersionParameterStub.getCall(0).args[1], mParsedHash, "then _removeVersionParameterForFLP was called with the correct parameters");
					var oDiscardCallPropertyBag = oDiscardDraftStub.getCall(0).args[0];
					assert.equal(oDiscardCallPropertyBag.control, this.oRta.getRootControlInstance(), "with the correct control");
					assert.equal(oDiscardCallPropertyBag.layer, this.oRta.getLayer(), "and layer");
					assert.equal(oStopStub.callCount, 1, "then stop was called");
					assert.equal(oCrossAppNavigationStub.callCount, 1, "a restart was triggered");
				}.bind(this));
		});

		QUnit.test("when save is called and layer is not customer", function(assert) {
			var oSaveStub = sandbox.stub().resolves();
			this.oRta._oSerializer = {
				saveCommands: oSaveStub
			};
			this.oRta.setFlexSettings({layer: "OTHER_LAYER"});
			this.oRta._oToolbarControlsModel = new JSONModel({
				translationEnabled: false
			});
			this.oRta._oVersionsModel = new JSONModel({
				versioningEnabled: true
			});

			return this.oRta._serializeAndSave().then(function() {
				assert.strictEqual(oSaveStub.callCount, 1, "save was triggered");
				assert.strictEqual(oSaveStub.lastCall.args[0], false, "the draft flag is set to false");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring gets a switch version event from the toolbar in standalone", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: false
			});
			this.oEnableRestartStub = sandbox.stub(RuntimeAuthoring, "enableRestart");
			this.oSwitchVersionStub = sandbox.stub(this.oRta, "_switchVersion");
			return this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no version is in the url and the app", function(assert) {
			var fnDone = assert.async();
			var oEvent = new Event("someEventId", undefined, {
				version: "1"
			});

			var oSetUriParameterStub = sandbox.stub(this.oRta, "_setUriParameter").resolves();
			var oHandleUrlParametersSpy = sandbox.spy(FlexUtils, "handleUrlParameters");
			var oTriggerHardReloadSpy = sandbox.spy(this.oRta, "_triggerHardReload");

			this.oSwitchVersionStub.callsFake(function() {
				this.oRta._switchVersion.wrappedMethod.apply(this.oRta, arguments);
				assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is enabled");
				assert.equal(oTriggerHardReloadSpy.callCount, 1, "_triggerHardReload was called");
				assert.equal(oHandleUrlParametersSpy.callCount, 1, "handleUrlParameters was called");
				assert.equal(oSetUriParameterStub.callCount, 1, "the uri was changed and will lead to a reload");
				fnDone();
			}.bind(this));

			this.oRta._onSwitchVersion(oEvent);
		});

		QUnit.test("when version parameter is in the url no hard reload is triggered", function(assert) {
			var fnDone = assert.async();
			var oEvent = new Event("someEventId", undefined, {
				version: "1"
			});

			sandbox.stub(ReloadInfoAPI, "hasVersionParameterWithValue").returns(true);
			var oTriggerHardReloadSpy = sandbox.spy(this.oRta, "_triggerHardReload");
			var oReloadPageSpy = sandbox.stub(this.oRta, "_reloadPage").resolves();

			this.oSwitchVersionStub.callsFake(function() {
				this.oRta._switchVersion.wrappedMethod.apply(this.oRta, arguments);
				assert.equal(this.oEnableRestartStub.callCount, 1, "then a restart is enabled");
				assert.equal(oReloadPageSpy.callCount, 1, "_reloadPage was called");
				assert.equal(oTriggerHardReloadSpy.callCount, 0, "and _triggerHardReload was not called");
				fnDone();
			}.bind(this));

			this.oRta._onSwitchVersion(oEvent);
		});
	});

	QUnit.module("Given _onStackModified", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: true
			});
			return this.oRta.start();
		},
		afterEach: function() {
			if (this.oRta._oDraftDiscardWarningPromise) {
				this.oRta._oDraftDiscardWarningPromise = undefined;
				this.oRta._oDraftDiscardWarningDialog.destroy();
			}
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		[{
			testName: "when the stack was modified and a new draft is created, an old draft exists and the user has not yet confirmed the discarding of the old draft",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: true,
				canUndo: true,
				userConfirmedDiscard: false
			},
			expectation: {
				dialogCreated: true
			}
		}, {
			testName: "when the stack was modified and a new draft is created, an old draft exists and the user has already confirmed the discarding of the old draft",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: true,
				canUndo: true,
				userConfirmedDiscard: true
			},
			expectation: {
				dialogCreated: false
			}
		}, {
			testName: "when the stack was modified in the current draft",
			input: {
				versionDisplayed: Version.Number.Draft,
				backendDraft: true,
				canUndo: true,
				userConfirmedDiscard: false
			},
			expectation: {
				dialogCreated: false
			}
		}, {
			testName: "when the stack was modified but nothing can be undone",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: true,
				canUndo: false,
				userConfirmedDiscard: false
			},
			expectation: {
				dialogCreated: false
			}
		}, {
			testName: "when the stack was modified and a new draft is created, an old draft does not exist",
			input: {
				versionDisplayed: Version.Number.Original,
				backendDraft: false,
				canUndo: true,
				userConfirmedDiscard: false
			},
			expectation: {
				dialogCreated: false
			}
		}].forEach(function(mSetup) {
			QUnit.test(mSetup.testName, function(assert) {
				var oUserAction = mSetup.input.userConfirmedDiscard ? MessageBox.Action.OK : MessageBox.Action.CANCEL;
				var oShowMessageBoxStub = sandbox.stub(Utils, "showMessageBox").resolves(oUserAction);
				this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
				this.oRta._oVersionsModel.setProperty("/displayedVersion", mSetup.input.versionDisplayed);
				this.oRta._oVersionsModel.setProperty("/backendDraft", mSetup.input.backendDraft);
				this.oRta._bUserDiscardedDraft = mSetup.input.userConfirmedDiscard ? true : undefined;
				sandbox.stub(this.oRta.getCommandStack(), "canUndo").returns(mSetup.input.canUndo);

				return this.oRta._onStackModified()
				// eslint-disable-next-line max-nested-callbacks
				.then(function() {
					assert.equal(oShowMessageBoxStub.callCount, mSetup.expectation.dialogCreated ? 1 : 0, "the message box display was handled correct");
				});
			});
		});
	});

	QUnit.module("Given a draft discarding warning dialog is openend", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp,
				showToolbars: true
			});

			this.oUndoStub = sandbox.stub(this.oRta, "undo");

			return this.oRta.start()
				.then(function() {
					this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
					this.oRta._oVersionsModel.setProperty("/displayedVersion", Version.Number.Original);
					this.oRta._oVersionsModel.setProperty("/backendDraft", true);
					sandbox.stub(this.oRta.getCommandStack(), "canUndo").returns(true);
				}.bind(this));
		},
		afterEach: function() {
			delete this.oRta._bUserDiscardedDraft;
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when the user modifies the stack while the displayed version is the Original App", function(assert) {
			whenUserConfirmsMessage.call(this, "MSG_DRAFT_DISCARD_AND_CREATE_NEW_DIALOG", assert);
			return this.oRta._onStackModified();
		});

		QUnit.test("when the user confirms the discarding", function(assert) {
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.OK);
			var oModifyStackStub = sandbox.stub(this.oRta, "_modifyStack");
			return this.oRta._onStackModified()
			.then(function() {
				assert.equal(this.oRta._bUserDiscardedDraft, true, "the flag that the user confirmed the discarding is set");
				assert.equal(oModifyStackStub.callCount, 1, "the modify stack function was called");
				assert.equal(this.oUndoStub.callCount, 0, "the undo was NOT called");
			}.bind(this));
		});

		QUnit.test("when the user cancels the discarding", function(assert) {
			sandbox.stub(Utils, "showMessageBox").resolves(MessageBox.Action.CANCEL);
			var oModifyStackStub = sandbox.stub(this.oRta, "_modifyStack");
			return this.oRta._onStackModified()
			.then(function() {
				assert.equal(this.oRta._bUserDiscardedDraft, undefined, "the flag that the user confirmed the discarding is NOT set");
				assert.equal(oModifyStackStub.callCount, 0, "the modify stack function was NOT called");
				assert.equal(this.oUndoStub.callCount, 1, "the undo was called");
			}.bind(this));
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		jQuery("#qunit-fixture").hide();
	});
});
