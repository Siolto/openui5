/* global QUnit */

sap.ui.define([
	"sap/ui/fl/initial/_internal/StorageUtils",
	"sap/ui/fl/initial/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/LrepConnector",
	"sap/ui/fl/initial/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/ui/fl/apply/_internal/flexObjects/FlVariant",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/write/_internal/connectors/JsObjectConnector",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/write/_internal/connectors/LrepConnector",
	"sap/ui/fl/write/_internal/connectors/PersonalizationConnector",
	"sap/ui/fl/write/_internal/Storage",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/Change",
	"sap/ui/fl/Layer",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/sinon-4"
], function(
	StorageUtils,
	InitialKeyUserConnector,
	InitialLrepConnector,
	InitialPersonalizationConnector,
	InitialUtils,
	FlVariant,
	WriteUtils,
	JsObjectConnector,
	WriteKeyUserConnector,
	WriteLrepConnector,
	WritePersonalizationConnector,
	Storage,
	FeaturesAPI,
	Change,
	Layer,
	oCore,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("ApplyStorage.getWriteConnectors", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("getWriteConnectors", function (assert) {
			var oStubGetConnectors = sandbox.stub(StorageUtils, "getConnectors").resolves([]);
			return Storage.loadFeatures().then(function () {
				assert.ok(oStubGetConnectors.calledWith("sap/ui/fl/write/_internal/connectors/", false), "StorageUtils getConnectors is called with correct params");
			});
		});
	});

	QUnit.module("Given Storage when write is called", {
		beforeEach: function () {
			InitialLrepConnector.xsrfToken = "123";
			InitialKeyUserConnector.xsrfToken = "123";
			InitialPersonalizationConnector.xsrfToken = "123";
		},
		afterEach: function() {
			InitialLrepConnector.xsrfToken = undefined;
			InitialKeyUserConnector.xsrfToken = undefined;
			InitialPersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no is layer provided", function (assert) {
			var mPropertyBag = {
				reference: "reference"
			};

			return Storage.write(mPropertyBag).catch(function (sErrorMessage) {
				assert.strictEqual(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("then it fails in case no connector is available for the layer", function(assert) {
			var oFlexObjects = [{}];

			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: oFlexObjects
			};
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: [Layer.USER]}
			]);

			return Storage.write(mPropertyBag)
				.catch(function (oError) {
					assert.strictEqual(oError.message, "No Connector configuration could be found to write into layer: CUSTOMER");
				});
		});

		QUnit.test("then it fails in case multiple connectors are available for the layer", function(assert) {
			var oFlexObjects = {};

			var mPropertyBag = {
				layer: Layer.VENDOR,
				flexObjects: oFlexObjects
			};
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector"},
				{connector: "JsObjectConnector"}
			]);

			return Storage.write(mPropertyBag)
				.catch(function (oError) {
					assert.strictEqual(oError.message, "sap.ui.core.Configuration 'flexibilityServices' has a misconfiguration: " +
						"Multiple Connector configurations were found to write into layer: VENDOR");
				});
		});

		QUnit.test("then it calls write of the connector", function(assert) {
			var oFlexObjects = {};

			var mPropertyBag = {
				layer: Layer.VENDOR,
				flexObjects: oFlexObjects
			};
			var sUrl = "/some/url";
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl}
			]);

			var oWriteStub = sandbox.stub(WriteLrepConnector, "write").resolves({});

			return Storage.write(mPropertyBag).then(function () {
				assert.strictEqual(oWriteStub.callCount, 1, "the write was triggered once");
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.strictEqual(oWriteCallArgs.url, sUrl, "the url was added to the property bag");
				assert.strictEqual(oWriteCallArgs.flexObjects, oFlexObjects, "the flexObjects were passed in the property bag");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector aiming for USER layer when writing", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				flexObjects: [{}]
			};
			var sUrl = "/PersonalizationConnector/url";

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", url: sUrl}
			]);

			var sExpectedUrl = sUrl + "/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedUrl);
			//sandbox.stub(WriteUtils, "getRequestOptions").returns({});

			return Storage.write(mPropertyBag).then(function() {
				var oGetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.strictEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetUrlCallArgs[1].url, sUrl, "the correct url was added");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.strictEqual(oSendRequestCallArgs[0], sExpectedUrl, "with correct url");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.strictEqual(oSendRequestCallArgs[2].payload, "[{}]", "with correct payload");
				assert.strictEqual(oSendRequestCallArgs[2].contentType, "application/json; charset=utf-8", "with correct contentType");
				assert.strictEqual(oSendRequestCallArgs[2].dataType, "json", "with correct dataType");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: KeyUserConnector aiming for CUSTOMER layer when writing", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}]
			};
			var sUrl = "/KeyUserConnector/url";

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl}
			]);

			var sExpectedWriteUrl = sUrl + "/v2/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedWriteUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetWriteUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetWriteUrlCallArgs[0], "/flex/keyuser/v2/changes/", "with correct route path");
				assert.strictEqual(oGetWriteUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetWriteUrlCallArgs[1].url, sUrl, "the correct url was added");
				assert.strictEqual(oGetTokenUrlCallArgs[0], "/flex/keyuser/v2/settings", "with correct route path");
				assert.strictEqual(oGetTokenUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.strictEqual(oSendRequestCallArgs[0], sExpectedWriteUrl, "with correct url");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: KeyUserConnector aiming for PUBLIC layer when writing", function (assert) {
			var mPropertyBag = {
				layer: Layer.PUBLIC,
				flexObjects: [{}]
			};
			var sUrl = "/KeyUserConnector/url";

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl}
			]);

			var sExpectedWriteUrl = sUrl + "/v2/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedWriteUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetWriteUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.equal(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.equal(oGetWriteUrlCallArgs[0], "/flex/keyuser/v2/changes/", "with correct route path");
				assert.equal(oGetWriteUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.equal(oGetWriteUrlCallArgs[1].url, sUrl, "the correct url was added");
				assert.equal(oGetTokenUrlCallArgs[0], "/flex/keyuser/v2/settings", "with correct route path");
				assert.equal(oGetTokenUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
				assert.equal(oSendRequestCallArgs[0], sExpectedWriteUrl, "with correct url");
				assert.equal(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});


		QUnit.test("with valid mPropertyBag and Connector: KeyUserConnector aiming for CUSTOMER layer when writing draft changes", function (assert) {
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}],
				draft: true
			};
			var oWriteStub = sandbox.stub(WriteKeyUserConnector, "write").resolves();

			return Storage.write(mPropertyBag).then(function() {
				assert.strictEqual(oWriteStub.getCall(0).args[0].draft, true, "then the draft flag is passed");
			});
		});

		QUnit.test("when creating changes without a draft flag", function (assert) {
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);
			var oIsDraftEnabledStub = sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(true);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}]
			};
			sandbox.stub(WriteKeyUserConnector, "write").resolves();

			return Storage.write(mPropertyBag)
				.then(function () {
					assert.strictEqual(oIsDraftEnabledStub.callCount, 0, "then draftEnabled is not checked");
				});
		});

		QUnit.test("when creating changes for a draft but the layer does not support a draft", function (assert) {
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector"}
			]);
			sandbox.stub(FeaturesAPI, "isVersioningEnabled").resolves(false);
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}],
				draft: true
			};

			return Storage.write(mPropertyBag)
				.catch(function (sRejectionMessage) {
					assert.strictEqual(sRejectionMessage, "Draft is not supported for the given layer: CUSTOMER",
						"then request is rejected with an error message");
				});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for USER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				flexObjects: [{}]
			};
			var sUrl1 = "/KeyUserConnector/url";
			var sUrl2 = "/PersonalizationConnector/url";

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl1},
				{connector: "PersonalizationConnector", url: sUrl2}
			]);

			var sExpectedUrl = sUrl1 + "/v2/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.strictEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetUrlCallArgs[1].url, sUrl2, "the correct url was added");
				assert.strictEqual(oStubSendRequest.callCount, 1, "sendRequest is called once");
				assert.strictEqual(oSendRequestCallArgs[0], sExpectedUrl, "with correct url");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for CUSTOMER layer ", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				flexObjects: [{}]
			};
			var sUrl1 = "/KeyUserConnector/url";
			var sUrl2 = "/PersonalizationConnector/url";

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl1},
				{connector: "PersonalizationConnector", url: sUrl2}
			]);

			var sExpectedUrl = sUrl1 + "/flex/keyuser/v2/changes/";
			var sExpectedMethod = "POST";

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({});
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedUrl);

			return Storage.write(mPropertyBag).then(function() {
				var oGetWriteUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetWriteUrlCallArgs[0], "/flex/keyuser/v2/changes/", "with correct route path");
				assert.strictEqual(oGetWriteUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetWriteUrlCallArgs[1].url, sUrl1, "the correct url was added");
				assert.strictEqual(oGetTokenUrlCallArgs[0], "/flex/keyuser/v2/settings", "with correct route path");
				assert.strictEqual(oGetTokenUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oStubSendRequest.callCount, 1, "sendRequest is called once");
				assert.strictEqual(oSendRequestCallArgs[0], sExpectedUrl, "with correct url");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
			});
		});
	});

	function createChangesAndSetState(aStates, aDependentSelectors) {
		var aChanges = [];
		aStates.forEach(function(sState, i) {
			aChanges[i] = new Change({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: i.toString(),
				namespace: "a.name.space",
				changeType: "labelChange",
				reference: "",
				selector: {},
				dependentSelector: aDependentSelectors && aDependentSelectors[i] || {},
				content: {
					prop: "some Content " + i
				}
			});
			if (sState === "update") {
				// Changes can't be directly set to "dirty" from "new"
				aChanges[i].setState(Change.states.PERSISTED);
				aChanges[i].setState(Change.states.DIRTY);
			}
			aChanges[i].condenserState = sState;
		});
		return aChanges;
	}

	QUnit.module("Given Storage when condense is called", {
		beforeEach: function () {
			this.sLayer = Layer.CUSTOMER;
		},
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no layer is provided", function (assert) {
			var aAllChanges = createChangesAndSetState(["delete", "delete", "select"]);
			var mPropertyBag = {
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2]],
				reference: "reference"
			};

			return Storage.condense(mPropertyBag).catch(function (sErrorMessage) {
				assert.strictEqual(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("and no array with changes is provided", function (assert) {
			var mPropertyBag = {
				layer: this.sLayer,
				reference: "reference"
			};

			return Storage.condense(mPropertyBag).catch(function (sErrorMessage) {
				assert.strictEqual(sErrorMessage, "No changes were provided", "then an Error is thrown");
			});
		});

		QUnit.test("then it calls condense of the connector (persisted and dirty changes)", function(assert) {
			var aAllChanges = createChangesAndSetState(["delete", "delete", "select"]);
			aAllChanges[0].setState(Change.states.PERSISTED);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				"delete": {
					change: ["0"]
				},
				create: {
					change: [{2: {
						fileType: "change",
						layer: this.sLayer,
						fileName: "2",
						namespace: "a.name.space",
						changeType: "labelChange",
						reference: "",
						selector: {},
						dependentSelector: {},
						content: {
							prop: "some Content 2"
						}
					}}]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2]]
			};
			var sUrl = "/some/url";
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl}
			]);
			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				assert.strictEqual(oWriteStub.callCount, 1, "the write was triggered once");
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.strictEqual(oWriteCallArgs.url, sUrl, "the url was added to the property bag");
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "the flexObject was passed in the property bag");
			});
		});

		QUnit.test("then it calls condense of the connector (persisted change that is not updated + create)", function(assert) {
			var aAllChanges = createChangesAndSetState(["select", "select"]);
			aAllChanges[0].setState(Change.states.PERSISTED);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				create: {
					change: [{1: {
						fileType: "change",
						layer: this.sLayer,
						fileName: "1",
						namespace: "a.name.space",
						changeType: "labelChange",
						reference: "",
						selector: {},
						dependentSelector: {},
						content: {
							prop: "some Content 1"
						}
					}}]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: aAllChanges
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "only the create is passed to the connector");
			});
		});

		QUnit.test("and two changes are created by condenser in a certain order", function (assert) {
			var aAllChanges = createChangesAndSetState(["delete", "select", "select"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				create: {
					change: [
						{2: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "2",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 2"
							}}
						},
						{1: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "1",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 1"
							}}
						}
					]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2], aAllChanges[1]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(
					oWriteCallArgs.flexObjects,
					mCondenseExpected,
					"then the 'create' changes on FlexObject are on the same order (without unnecessary 'reorder')"
				);
			});
		});

		QUnit.test("and create and update changes are created by condenser in a certain order", function (assert) {
			var aAllChanges = createChangesAndSetState(["delete", "select", "update", "update", "select"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				create: {
					change: [
						{4: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "4",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 4"
							}}
						},
						{1: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "1",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 1"
							}}
						}
					]
				},
				update: {
					change: [
						{2: {
							content: {
								prop: "some Content 2"
							}}
						},
						{3: {
							content: {
								prop: "some Content 3"
							}}
						}
					]
				},
				reorder: {
					change: ["3", "2", "1"]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[4], aAllChanges[3], aAllChanges[2], aAllChanges[1]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(
					oWriteCallArgs.flexObjects,
					mCondenseExpected,
					"then the necessary changes get reordered (the first create is already at the right position)"
				);
			});
		});

		QUnit.test("and a new change is before an already persisted change in condensedChanges array", function (assert) {
			var aAllChanges = createChangesAndSetState(["select", "select", "select"]);
			aAllChanges[0].setState(Change.states.PERSISTED);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				create: {
					change: [
						{2: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "2",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 2"
							}}
						},
						{1: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "1",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 1"
							}}
						}
					]
				},
				reorder: {
					change: ["2", "1", "0"]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2], aAllChanges[1], aAllChanges[0]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(
					oWriteCallArgs.flexObjects,
					mCondenseExpected,
					"then the changes get reordered (because they come before the persisted change)"
				);
			});
		});

		QUnit.test("and the changes are updated and reordered by condenser", function (assert) {
			var aAllChanges = createChangesAndSetState(["delete", "update", "update"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				update: {
					change: [
						{1: {
							content: {
								prop: "some Content 1"
							}}
						},
						{2: {
							content: {
								prop: "some Content 2"
							}}
						}
					]
				},
				reorder: {
					change: ["2", "1"]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[2], aAllChanges[1]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});

		QUnit.test("and no condensed changes are returned by condenser", function (assert) {
			var aAllChanges = createChangesAndSetState(["delete", "delete", "delete"]);
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense");

			return Storage.condense(mPropertyBag).then(function () {
				assert.ok(oWriteStub.notCalled, "then the write method is not called on the connector");
			});
		});

		QUnit.test("and the changes are updated by condenser", function (assert) {
			var aAllChanges = createChangesAndSetState(["update", "update", "select"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				update: {
					change: [
						{0: {
							content: {
								prop: "some Content 0"
							}
						}},
						{1: {
							content: {
								prop: "some Content 1"
							}
						}}
					]
				},
				create: {
					change: [
						{2: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "2",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 2"
							}}
						}
					]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[0], aAllChanges[1], aAllChanges[2]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});

		QUnit.test("and select and delete get condensed", function (assert) {
			var aAllChanges = createChangesAndSetState(["select", "delete"]);
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				create: {
					change: [
						{0: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "0",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 0"
							}}
						}
					]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: [aAllChanges[0]],
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});

		QUnit.test("and changes belonging to a variant are provided", function (assert) {
			var oChange0 = new Change({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "0",
				namespace: "a.name.space",
				changeType: "labelChange",
				reference: "",
				variantReference: "variant_0",
				selector: {},
				dependentSelector: {},
				content: {
					prop: "some Content 0"
				}
			});
			var oChange1 = new Change({
				fileType: "ctrl_variant_change",
				layer: Layer.CUSTOMER,
				fileName: "1",
				namespace: "a.name.space",
				changeType: "setTitle",
				reference: "",
				variantReference: "variant_0",
				selector: {},
				dependentSelector: {},
				content: {
					prop: "some Content 1"
				}
			});
			var oChange2 = new Change({
				fileType: "ctrl_variant_management_change",
				layer: Layer.CUSTOMER,
				fileName: "2",
				namespace: "a.name.space",
				changeType: "setDefault",
				reference: "",
				variantReference: "variant_0",
				variantManagementReference: "variantManagementId",
				selector: {},
				dependentSelector: {},
				content: {
					prop: "some Content 2"
				}
			});
			var oChange3 = new Change({
				fileType: "change",
				layer: Layer.CUSTOMER,
				fileName: "3",
				namespace: "a.name.space",
				changeType: "labelChange",
				reference: "",
				variantReference: "variant_0",
				selector: {},
				dependentSelector: {},
				content: {
					prop: "some Content 3"
				}
			});
			oChange3.setState(Change.states.PERSISTED);
			var oVariant = new FlVariant({
				layer: Layer.CUSTOMER,
				id: "newVariant",
				variantReference: "variant_0",
				flexObjectMetadata: {
					namespace: "a.name.space",
					reference: "myReference"
				},
				content: {
					title: "foo"
				}
			});

			var aAllChanges = [oVariant, oChange0, oChange1, oChange2, oChange3];
			aAllChanges = aAllChanges.map(function(oChange) {
				oChange.condenserState = "select";
				return oChange;
			});
			var mCondenseExpected = {
				namespace: "a.name.space",
				layer: this.sLayer,
				create: {
					change: [
						{0: {
							fileType: "change",
							layer: this.sLayer,
							fileName: "0",
							namespace: "a.name.space",
							changeType: "labelChange",
							reference: "",
							variantReference: "variant_0",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 0"
							}}
						}
					],
					ctrl_variant_change: [
						{1: {
							fileType: "ctrl_variant_change",
							layer: this.sLayer,
							fileName: "1",
							namespace: "a.name.space",
							changeType: "setTitle",
							reference: "",
							variantReference: "variant_0",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 1"
							}}
						}
					],
					ctrl_variant_management_change: [
						{2: {
							fileType: "ctrl_variant_management_change",
							layer: this.sLayer,
							fileName: "2",
							namespace: "a.name.space",
							changeType: "setDefault",
							reference: "",
							variantManagementReference: "variantManagementId",
							variantReference: "variant_0",
							selector: {},
							dependentSelector: {},
							content: {
								prop: "some Content 2"
							}}
						}
					]
				}
			};
			var mPropertyBag = {
				layer: this.sLayer,
				allChanges: aAllChanges,
				condensedChanges: aAllChanges,
				reference: "reference"
			};

			var oWriteStub = sandbox.stub(WriteLrepConnector, "condense").resolves({});

			return Storage.condense(mPropertyBag).then(function () {
				var oWriteCallArgs = oWriteStub.getCall(0).args[0];
				assert.propEqual(oWriteCallArgs.flexObjects, mCondenseExpected, "then flexObject is filled correctly");
			});
		});
	});

	QUnit.module("Given Storage when loadFeatures is called", {
		beforeEach: function() {
			this.url = "/some/url";
			InitialLrepConnector.xsrfToken = "123";
			InitialPersonalizationConnector.xsrfToken = "123";
		},
		afterEach: function() {
			InitialLrepConnector.xsrfToken = undefined;
			InitialPersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("with a failing connector", function (assert) {
			var oLrepConnectorLoadFeaturesStub = sandbox.stub(WriteLrepConnector, "loadFeatures").resolves({isKeyUser: true});
			var oPersonalizationConnectorLoadFeaturesStub = sandbox.stub(WritePersonalizationConnector, "loadFeatures").resolves({isVariantSharingEnabled: false});
			var oJsObjectConnectorLoadFeaturesStub = sandbox.stub(JsObjectConnector, "loadFeatures").rejects({});

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{
					connector: "LrepConnector",
					url: this.url,
					layers: []
				}, {
					connector: "JsObjectConnector",
					layers: [Layer.CUSTOMER]
				}, {
					connector: "PersonalizationConnector",
					url: this.url,
					layers: [Layer.USER]
				}
			]);

			var oExpectedResponse = {
				isKeyUser: true,
				isKeyUserTranslationEnabled: false,
				isVariantSharingEnabled: false,
				isContextSharingEnabled: true,
				isContextSharingEnabledForComp: true,
				isPublicFlVariantEnabled: false,
				isVariantPersonalizationEnabled: true,
				isAtoAvailable: false,
				isAtoEnabled: false,
				versioning: {
					CUSTOMER: false,
					USER: false
				},
				isProductiveSystem: true,
				isPublicLayerAvailable: false,
				isZeroDowntimeUpgradeRunning: false,
				system: "",
				client: ""
			};
			var oLogResolveSpy = sandbox.spy(StorageUtils, "logAndResolveDefault");

			return Storage.loadFeatures().then(function (oResponse) {
				assert.strictEqual(oLrepConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				assert.strictEqual(oJsObjectConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				assert.strictEqual(oPersonalizationConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				assert.strictEqual(oLogResolveSpy.callCount, 1, "the logAndResolveDefault called once");
				assert.deepEqual(oResponse, oExpectedResponse, "response was merged even with one connector failing");
			});
		});

		QUnit.test("then it calls loadFeatures of the configured connectors", function(assert) {
			var oLrepConnectorLoadFeaturesStub = sandbox.stub(WriteLrepConnector, "loadFeatures").resolves({});
			var oJsObjectConnectorLoadFeaturesStub = sandbox.stub(JsObjectConnector, "loadFeatures").resolves({});
			var sUrl = "/some/url";

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl},
				{connector: "JsObjectConnector"}
			]);

			return Storage.loadFeatures().then(function () {
				assert.strictEqual(oLrepConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				var oLrepConnectorCallArgs = oLrepConnectorLoadFeaturesStub.getCall(0).args[0];
				assert.deepEqual(oLrepConnectorCallArgs, {url: sUrl}, "the url was passed");
				assert.strictEqual(oJsObjectConnectorLoadFeaturesStub.callCount, 1, "the loadFeatures was triggered once");
				var oJsObjectConnectorCallArgs = oJsObjectConnectorLoadFeaturesStub.getCall(0).args[0];
				assert.deepEqual(oJsObjectConnectorCallArgs, {url: undefined}, "no url was passed");
			});
		});

		QUnit.test("then merges the response of the connectors", function(assert) {
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: this.url},
				{connector: "JsObjectConnector"}
			]);

			sandbox.stub(WriteLrepConnector, "loadFeatures").resolves({
				isKeyUser: true
			});
			sandbox.stub(JsObjectConnector, "loadFeatures").resolves({
				system: "foo"
			});

			return Storage.loadFeatures().then(function (mFeatures) {
				assert.strictEqual(mFeatures.isKeyUser, true, "the property of the LrepConnector was added");
				assert.strictEqual(mFeatures.system, "foo", "the property of the JsObjectConnector was added");
			});
		});

		QUnit.test("then higher layer overrule the lower layer", function(assert) {
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: this.url},
				{connector: "JsObjectConnector"}
			]);

			sandbox.stub(WriteLrepConnector, "loadFeatures").resolves({
				isProductiveSystem: false
			});
			sandbox.stub(JsObjectConnector, "loadFeatures").resolves({
				isProductiveSystem: true
			});

			var DEFAULT_FEATURES = {
				isKeyUser: false,
				isKeyUserTranslationEnabled: false,
				isVariantSharingEnabled: false,
				isContextSharingEnabled: false,
				isContextSharingEnabledForComp: false,
				isPublicFlVariantEnabled: false,
				isVariantPersonalizationEnabled: true,
				isAtoAvailable: false,
				isAtoEnabled: false,
				draft: {},
				isProductiveSystem: true,
				isPublicLayerAvailable: false,
				isZeroDowntimeUpgradeRunning: false,
				system: "",
				client: ""
			};

			return Storage.loadFeatures().then(function (mFeatures) {
				assert.strictEqual(Object.keys(mFeatures).length, Object.keys(DEFAULT_FEATURES).length, "only 12 feature was provided");
				assert.strictEqual(mFeatures.isProductiveSystem, true, "the property was overruled by the second connector");
			});
		});
	});

	QUnit.module("Given Storage when versions.load is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a list of versions is returned", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var aReturnedVersions = [];
			sandbox.stub(InitialUtils, "sendRequest").resolves({response: {versions: aReturnedVersions}});

			return Storage.versions.load(mPropertyBag).then(function (aVersions) {
				assert.deepEqual(aVersions, aReturnedVersions);
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector"}
			]);

			return Storage.versions.load(mPropertyBag).catch(function (sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "versions.load is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when versions.activate is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a list of versions is returned", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var oActivatedVersion = {versionNumber: 1};
			sandbox.stub(WriteUtils, "sendRequest").resolves({response: oActivatedVersion});

			return Storage.versions.activate(mPropertyBag).then(function (oReturnedActivatedVersion) {
				assert.deepEqual(oReturnedActivatedVersion, oActivatedVersion);
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector"}
			]);

			return Storage.versions.activate(mPropertyBag).catch(function (sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "versions.activate is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when versions.discardDraft is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and discarding takes place", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var oDiscardStub = sandbox.stub(WriteKeyUserConnector.versions, "discardDraft").resolves();

			return Storage.versions.discardDraft(mPropertyBag).then(function () {
				assert.strictEqual(oDiscardStub.callCount, 1, "the discarding of the connector was called");
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector"}
			]);

			return Storage.versions.discardDraft(mPropertyBag).catch(function (sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "versions.discardDraft is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when versions.publish is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and publish takes place", function (assert) {
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", layers: ['ALL'], url: "/sap/bc/lrep"}
			]);

			var oPublishStub = sandbox.stub(WriteLrepConnector.versions, "publish").resolves();

			return Storage.versions.publish(mPropertyBag).then(function () {
				assert.strictEqual(oPublishStub.callCount, 1, "the publish of the connector was called");
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				reference: "reference",
				layer: Layer.CUSTOMER
			};

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "JsObjectConnector"}
			]);

			return Storage.versions.publish(mPropertyBag).catch(function (sRejectionMessage) {
				assert.ok(sRejectionMessage, "then rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when reset is called", {
		beforeEach: function () {
			InitialLrepConnector.xsrfToken = "123";
			InitialKeyUserConnector.xsrfToken = "123";
			InitialPersonalizationConnector.xsrfToken = "123";
		},
		afterEach: function() {
			InitialLrepConnector.xsrfToken = undefined;
			InitialKeyUserConnector.xsrfToken = undefined;
			InitialPersonalizationConnector.xsrfToken = undefined;
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and no layer is provided", function (assert) {
			var mPropertyBag = {
				reference: "reference"
			};

			return Storage.reset(mPropertyBag).catch(function (sErrorMessage) {
				assert.strictEqual(sErrorMessage, "No layer was provided", "then an Error is thrown");
			});
		});

		QUnit.test("then it fails in case no connector is available for the layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "reference"
			};
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", layers: [Layer.USER]}
			]);

			return Storage.reset(mPropertyBag)
				.catch(function (oError) {
					assert.strictEqual(oError.message, "No Connector configuration could be found to write into layer: CUSTOMER");
				});
		});

		QUnit.test("then it fails in case no connector is available for the layer by default layer settings of the connector", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "reference"
			};
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector"}
			]);

			return Storage.reset(mPropertyBag)
				.catch(function (oError) {
					assert.strictEqual(oError.message, "No Connector configuration could be found to write into layer: CUSTOMER");
				});
		});

		QUnit.test("then it fails in case multiple connectors are available for the layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.VENDOR,
				reference: "reference"
			};

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector"},
				{connector: "JsObjectConnector"}
			]);

			return Storage.reset(mPropertyBag)
				.catch(function (oError) {
					assert.strictEqual(oError.message, "sap.ui.core.Configuration 'flexibilityServices' has a misconfiguration: " +
					"Multiple Connector configurations were found to write into layer: VENDOR");
				});
		});

		QUnit.test("with valid mPropertyBag and Connector: LrepConnector aiming for USER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				reference: "reference",
				changeTypes: "Rename",
				generator: "test",
				selectorIds: "id1"
			};

			var mParameter = {
				layer: Layer.USER,
				reference: "reference",
				changeType: "Rename",
				generator: "test",
				selector: "id1"
			};

			var sUrl = "/LrepConnector/url";

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "LrepConnector", url: sUrl}
			]);

			var sExpectedUrl = sUrl + "/changes/";
			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			var oStubGetUrl = sandbox.stub(InitialUtils, "getUrl").returns(sExpectedUrl);

			return Storage.reset(mPropertyBag).then(function () {
				var oGetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetUrlCallArgs[0], "/changes/", "with correct route path");
				assert.deepEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetUrlCallArgs[1].url, sUrl, "the url was added");
				assert.deepEqual(oGetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector aiming for USER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				reference: "reference"
			};

			var mParameter = {
				reference: "reference"
			};

			var sUrl = "/LrepConnector/url";

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", url: sUrl}
			]);

			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			var oSpyGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.reset(mPropertyBag).then(function () {
				var oGetUrlCallArgs = oSpyGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oSpyGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.deepEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetUrlCallArgs[1].url, sUrl, "the url was added");
				assert.deepEqual(oGetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for USER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.USER,
				reference: "reference"
			};

			var mParameter = {
				reference: "reference"
			};

			var sUrl = "/LrepConnector/url";
			var sUrl2 = "/KeyUserConnector/url";

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "PersonalizationConnector", url: sUrl},
				{connector: "KeyUserConnector", url: sUrl2}
			]);

			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			var oSpyGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.reset(mPropertyBag).then(function () {
				var oGetUrlCallArgs = oSpyGetUrl.getCall(0).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oSpyGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetUrlCallArgs[0], "/flex/personalization/v1/changes/", "with correct route path");
				assert.deepEqual(oGetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetUrlCallArgs[1].url, sUrl, "the url was added");
				assert.deepEqual(oGetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.ok(oStubSendRequest.calledOnce, "sendRequest is called once");
			});
		});

		QUnit.test("with valid mPropertyBag and Connector: PersonalizationConnector, KeyUserConnector aiming for CUSTOMER layer", function (assert) {
			var mPropertyBag = {
				layer: Layer.CUSTOMER,
				reference: "reference"
			};

			var mParameter = {
				reference: "reference"
			};

			var sUrl1 = "/KeyUserConnector/url";
			var sUrl2 = "/PersonalizationConnector/url";

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", url: sUrl1},
				{connector: "PersonalizationConnector", url: sUrl2}
			]);

			var sExpectedMethod = "DELETE";

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves([]);
			var oStubGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.reset(mPropertyBag).then(function () {
				var oGetResetUrlCallArgs = oStubGetUrl.getCall(0).args;
				var oGetTokenUrlCallArgs = oStubGetUrl.getCall(1).args;
				var oSendRequestCallArgs = oStubSendRequest.getCall(0).args;

				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl is called twice");
				assert.strictEqual(oGetResetUrlCallArgs[0], "/flex/keyuser/v2/changes/", "with correct route path");
				assert.strictEqual(oGetResetUrlCallArgs[1], mPropertyBag, "with correct property bag");
				assert.strictEqual(oGetResetUrlCallArgs[1].url, sUrl1, "the correct url was added");
				assert.strictEqual(oGetTokenUrlCallArgs[0], "/flex/keyuser/v2/settings", "with correct route path");
				assert.deepEqual(oGetResetUrlCallArgs[1].reference, undefined, "reference was deleted from mPropertyBag");
				assert.deepEqual(oGetResetUrlCallArgs[2], mParameter, "with correct parameters input");
				assert.strictEqual(oSendRequestCallArgs[1], sExpectedMethod, "with correct method");
				assert.strictEqual(oStubSendRequest.callCount, 1, "sendRequest is called once");
			});
		});
	});


	QUnit.module("Given Storage when variant management context sharing is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a response is returned for getContexts", function (assert) {
			var mPropertyBag = {
				type: "role",
				layer: Layer.CUSTOMER
			};

			var oStubSendRequest = sandbox.stub(InitialUtils, "sendRequest").resolves({response: {lastHitReached: true}});
			var oStubGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.getContexts(mPropertyBag).then(function (oResponse) {
				assert.strictEqual(oStubSendRequest.callCount, 1, "send request was called once");
				assert.strictEqual(oStubGetUrl.returnValues[0], "/sap/bc/lrep/flex/contexts/?type=role", "url is correct");
				assert.strictEqual(oResponse.lastHitReached, true, "response is as expected");
			});
		});

		QUnit.test("and a response is returned for loadContextDescriptions", function (assert) {
			var mPropertyBag = {
				flexObjects: {role: ["/IWBEP/RT_MGW_DSP"]},
				layer: Layer.CUSTOMER
			};

			var oStubSendRequest = sandbox.stub(WriteUtils, "sendRequest").resolves({response: {lastHitReached: true}});
			var oStubGetUrl = sandbox.spy(InitialUtils, "getUrl");

			return Storage.loadContextDescriptions(mPropertyBag).then(function (oResponse) {
				assert.strictEqual(oStubSendRequest.callCount, 1, "send request was called once");
				assert.strictEqual(oStubGetUrl.callCount, 2, "getUrl was called twice");
				assert.strictEqual(oStubGetUrl.returnValues[1], "/sap/bc/lrep/actions/getcsrftoken/", "token url is correct");
				assert.strictEqual(oStubGetUrl.returnValues[0], "/sap/bc/lrep/flex/contexts/?sap-language=EN", "post url is correct");
				assert.ok(oResponse.lastHitReached, "response is as expected");
			});
		});

		QUnit.test("and a response is rejected for loadContextDescriptions when using not LrepConnector", function (assert) {
			var mPropertyBag = {
				flexObjects: {role: ["/IWBEP/RT_MGW_DSP"]},
				layer: Layer.CUSTOMER
			};

			var oSpySendRequest = sandbox.spy(WriteUtils, "sendRequest");
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([{connector: "KeyUserConnector"}, {connector: "NeoLrepConnector"}]);

			return Storage.loadContextDescriptions(mPropertyBag).catch(function () {
				assert.strictEqual(oSpySendRequest.callCount, 0, "no request was send");
			});
		});

		QUnit.test("and a response is rejected for getContexts when using not LrepConnector", function (assert) {
			var mPropertyBag = {
				flexObjects: {role: ["/IWBEP/RT_MGW_DSP"]},
				layer: Layer.CUSTOMER
			};

			var oSpySendRequest = sandbox.spy(WriteUtils, "sendRequest");
			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([{connector: "KeyUserConnector"}, {connector: "NeoLrepConnector"}]);

			return Storage.getContexts(mPropertyBag).catch(function () {
				assert.strictEqual(oSpySendRequest.callCount, 0, "no request was send");
			});
		});
	});

	QUnit.module("Given Storage when translation.getSourceLanguage is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a list of languages is returned", function (assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				appComponent: {},
				layer: Layer.CUSTOMER
			};

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			var aReturnedLanguages = [
				"en-US",
				"de-DE"
			];
			sandbox.stub(WriteKeyUserConnector.translation, "getSourceLanguages").resolves(aReturnedLanguages);

			return Storage.translation.getSourceLanguages(mPropertyBag).then(function (aLanguages) {
				assert.strictEqual(aLanguages, aReturnedLanguages);
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				url: "/flexKeyuser",
				appComponent: {},
				layer: Layer.CUSTOMER
			};

			return Storage.translation.getSourceLanguages(mPropertyBag).catch(function (sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "translation.getSourceLanguages is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when translation.getTranslationTexts is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a download file is returned", function (assert) {
			var mPropertyBag = {
				sourceLanguage: "en-US",
				targetLanguage: "de-DE",
				url: "/flexKeyuser",
				appComponent: {},
				layer: Layer.CUSTOMER
			};

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			sandbox.stub(WriteKeyUserConnector.translation, "getTexts").resolves({test: "test"});

			return Storage.translation.getTexts(mPropertyBag).then(function (oDownloadFile) {
				assert.deepEqual(oDownloadFile, {test: "test"});
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				url: "/flexKeyuser",
				appComponent: {},
				layer: Layer.CUSTOMER
			};

			return Storage.translation.getTexts(mPropertyBag).catch(function (sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "translation.getTexts is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.module("Given Storage when translation.postTranslationTexts is called", {
		afterEach: function() {
			sandbox.restore();
		}
	}, function() {
		QUnit.test("and a token is returned", function (assert) {
			var mPropertyBag = {
				url: "/flexKeyuser",
				layer: Layer.CUSTOMER,
				payload: {}
			};

			sandbox.stub(oCore.getConfiguration(), "getFlexibilityServices").returns([
				{connector: "KeyUserConnector", layers: [Layer.CUSTOMER], url: "/flexKeyUser"}
			]);

			sandbox.stub(WriteKeyUserConnector.translation, "postTranslationTexts").resolves({payload: {}});

			return Storage.translation.postTranslationTexts(mPropertyBag).then(function (oDownloadFile) {
				assert.deepEqual(oDownloadFile, {payload: {}});
			});
		});

		QUnit.test("and the method is not implemented in the connector", function (assert) {
			assert.expect(1);
			var mPropertyBag = {
				url: "/flexKeyuser",
				layer: Layer.CUSTOMER,
				payload: {}
			};

			return Storage.translation.postTranslationTexts(mPropertyBag).catch(function (sRejectionMessage) {
				assert.strictEqual(sRejectionMessage, "translation.postTranslationTexts is not implemented", "then the rejection message is passed");
			});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});