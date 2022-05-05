/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/util/changeVisualization/ChangeIndicator",
	"sap/ui/rta/util/changeVisualization/categories/RenameVisualization",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/m/Button",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Core"
], function(
	sinon,
	QUnitUtils,
	ChangeIndicator,
	RenameVisualization,
	DesignTime,
	OverlayRegistry,
	Button,
	JSONModel,
	DateFormat,
	oCore
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	function createMockChange(sId, sAffectedElementId, sCommandName, sCommandCategory, mPayload) {
		var oCreationDate = new Date();
		return {
			id: sId,
			commandName: sCommandName,
			commandCategory: sCommandCategory,
			change: {
				getCreation: function() {
					return oCreationDate;
				}
			},
			payload: mPayload,
			affectedElementId: sAffectedElementId
		};
	}

	function waitForMethodCall(oObject, sMethodName) {
		return new Promise(function(resolve) {
			sandbox.stub(oObject, sMethodName)
				.onFirstCall().callsFake(function() {
					resolve(oObject[sMethodName].wrappedMethod.apply(this, arguments));
				})
				.callThrough();
		});
	}

	QUnit.module("Basic tests", {
		beforeEach: function(assert) {
			var fnDone = assert.async();
			this.oButton = new Button("TestButton");
			this.oButton.placeAt("qunit-fixture");
			oCore.applyChanges();

			this.oDesignTime = new DesignTime();

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oButtonOverlay.setSelectable(true);

				this.oChangeIndicator = new ChangeIndicator({
					changes: "{changes}",
					overlayId: this.oButtonOverlay.getId()
				});
				this.oChangeIndicator.setModel(new JSONModel({
					changes: []
				}));
				this.oChangeIndicator.bindElement("/");
				this.oChangeIndicator.placeAt("qunit-fixture");

				fnDone();
			}.bind(this));

			this.oDesignTime.addRootElement(this.oButton);
		},

		afterEach: function() {
			this.oButton.destroy();
			this.oChangeIndicator.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when a change indicator with a single change is created", function(assert) {
			var oRtaResourceBundle = oCore.getLibraryResourceBundle("sap.ui.rta");
			sandbox.stub(DateFormat, "getDateTimeInstance")
				.callThrough()
				.withArgs({ relative: "true" })
				.returns({
					format: function() { return "myTime"; }
				});
			var mPayload = {
				originalLabel: "BeforeValue",
				newLabel: "AfterValue"
			};

			this.oChangeIndicator.getModel().setData({
				changes: [createMockChange("someChangeId", this.oButton.getId(), "rename", "rename", mPayload)]
			});
			oCore.applyChanges();
			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorColorLight"),
				"then the correct indicator color is used"
			);
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorVerticallyCentered"),
				"then the indicator is vertically centered"
			);
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
				.then(function() {
					assert.ok(
						this.oChangeIndicator.getAggregation("_popover"),
						"then the popover is opened on click"
					);
					assert.ok(
						this.oChangeIndicator.getAggregation("_popover").getContent()[0].getVisible(),
						"then the changes table is visible"
					);
					assert.ok(
						this.oChangeIndicator.getAggregation("_popover").getContent()[0].getVisible(),
						"then the single change layout is visible"
					);
					var aItems = this.oChangeIndicator.getAggregation("_popover").getContent()[0].getItems();
					assert.strictEqual(
						aItems.length,
						1,
						"then the change is displayed"
					);
					assert.notOk(
						aItems[0].getCells()[1].getItems()[1].getVisible(),
						"then the show details button is not visible in the description column when no dependent selectors exist"
					);
					assert.strictEqual(
						aItems[0].getCells()[1].getItems()[0].getText(),
						oRtaResourceBundle.getText(
							"TXT_CHANGEVISUALIZATION_CHANGE_RENAME_FROM_TO",
							["AfterValue", "BeforeValue"]
						),
						"then a description for the change is displayed"
					);
					assert.notOk(
						aItems[0].getCells()[1].getItems()[0].getTooltip(),
						"then the description tooltip is not set because the description was not shorted"
					);
					var sDate = aItems[0].getCells()[2].getText();
					assert.strictEqual(sDate, "myTime", "then a relative date string is displayed correctly");
				}.bind(this));
		});

		QUnit.test("when a change indicator with a single change is created and the Text or ID of the element is too long", function(assert) {
			var oRtaResourceBundle = oCore.getLibraryResourceBundle("sap.ui.rta");
			sandbox.stub(DateFormat, "getDateTimeInstance")
				.callThrough()
				.withArgs({ relative: "true" })
				.returns({
					format: function() { return "myTime"; }
				});
			var mPayload = {
				originalLabel: "BeforeValueOfAFieldWithAnExtremelyLongButtonNameOrIDWhichThePopoverCouldNotCorrectlyDisplayWithoutAnyIssues",
				newLabel: "AfterValueOfAFieldWithAnExtremelyLongButtonNameOrIDWhichThePopoverCouldNotCorrectlyDisplayWithoutAnyIssues"
			};

			this.oChangeIndicator.getModel().setData({
				changes: [createMockChange("someChangeId", this.oButton.getId(), "rename", "rename", mPayload)]
			});
			oCore.applyChanges();
			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorColorLight"),
				"then the correct indicator color is used"
			);
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorVerticallyCentered"),
				"then the indicator is vertically centered"
			);
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
				.then(function() {
					assert.ok(
						this.oChangeIndicator.getAggregation("_popover"),
						"then the popover is opened on click"
					);
					assert.ok(
						this.oChangeIndicator.getAggregation("_popover").getContent()[0].getVisible(),
						"then the changes table is visible"
					);
					var aItems = this.oChangeIndicator.getAggregation("_popover").getContent()[0].getItems();
					assert.strictEqual(
						aItems.length,
						1,
						"then the change is displayed"
					);
					assert.notOk(
						aItems[0].getCells()[1].getItems()[1].getVisible(),
						"then the show details button is not visible in the description column when no dependent selectors exist"
					);
					assert.strictEqual(
						aItems[0].getCells()[1].getItems()[0].getText(),
						oRtaResourceBundle.getText(
							"TXT_CHANGEVISUALIZATION_CHANGE_RENAME_FROM_TO",
							[
								"AfterValueOfAFieldWithAnExt(...)ctlyDisplayWithoutAnyIssues",
								"BeforeValueOfAFieldWithAnEx(...)ctlyDisplayWithoutAnyIssues"
							]
						),
						"then a description for the change is displayed"
					);
					assert.strictEqual(
						aItems[0].getCells()[1].getItems()[0].getTooltip(),
						oRtaResourceBundle.getText(
							"TXT_CHANGEVISUALIZATION_CHANGE_RENAME_FROM_TO",
							[
								"AfterValueOfAFieldWithAnExtremelyLongButtonNameOrIDWhichThePopoverCouldNotCorrectlyDisplayWithoutAnyIssues",
								"BeforeValueOfAFieldWithAnExtremelyLongButtonNameOrIDWhichThePopoverCouldNotCorrectlyDisplayWithoutAnyIssues"
							]
						),
						"then the description tooltip shows the not shorted text"
					);
					var sDate = aItems[0].getCells()[2].getText();
					assert.strictEqual(sDate, "myTime", "then a relative date string is displayed correctly");
				}.bind(this));
		});

		QUnit.test("when a change was created within the session", function(assert) {
			var oRtaResourceBundle = oCore.getLibraryResourceBundle("sap.ui.rta");
			this.oChangeIndicator.getModel().setData({
				changes: [Object.assign(
					createMockChange("someChangeId", this.oButton.getId(), "remove"),
					{
						change: {
							getCreation: function() { }
						}
					}
				)]
			});
			oCore.applyChanges();
			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorColorLight"),
				"then the correct indicator color is used"
			);
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorVerticallyCentered"),
				"then the indicator is vertically centered"
			);
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
				.then(function() {
					assert.strictEqual(
						this.oChangeIndicator.getAggregation("_popover").getContent()[0].getItems()[0].getCells()[2].getText(),
						oRtaResourceBundle.getText("TXT_CHANGEVISUALIZATION_CREATED_IN_SESSION_DATE"),
						"then a fallback label for the date is displayed"
					);
				}.bind(this));
		});

		QUnit.test("when a move change indicator is created", function(assert) {
			var oPayloadInsideGroup = {
				sourceParentContainer: { id: "Group1" },
				targetParentContainer: { id: "Group1" }
			};
			var oPayloadOutsideGroup = {
				sourceParentContainer: { id: "Group1" },
				targetParentContainer: { id: "Group2" }
			};

			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "move", {}, oPayloadInsideGroup),
					createMockChange("someOtherChangeId", this.oButton.getId(), "move", {}, oPayloadOutsideGroup)
				]
			});
			oCore.applyChanges();

			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
				.then(function() {
					var aItems = this.oChangeIndicator.getAggregation("_popover").getContent()[0].getItems();
					assert.ok(
						aItems[0].getCells()[1].getItems()[1].getVisible(),
						"then the show details button is visible if the element was moved outside its group"
					);
					assert.notOk(
						aItems[1].getCells()[1].getItems()[1].getVisible(),
						"then the show details button is not visible if the element was moved in the same group"
					);
				}.bind(this));
		});

		QUnit.test("when a change indicator with two changes is created", function(assert) {
			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "move"),
					createMockChange("someOtherChangeId", this.oButton.getId(), "rename")
				]
			});
			oCore.applyChanges();

			var oOpenPopoverPromise = waitForMethodCall(this.oChangeIndicator, "setAggregation");
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorColorMedium"),
				"then the correct indicator color is used"
			);
			QUnitUtils.triggerEvent("click", this.oChangeIndicator.getDomRef());

			return oOpenPopoverPromise
				.then(function() {
					assert.ok(
						this.oChangeIndicator.getAggregation("_popover"),
						"then the popover is opened on click"
					);
					assert.ok(
						this.oChangeIndicator.getAggregation("_popover").getContent()[0].getVisible(),
						"then the changes table is visible"
					);
					var aItems = this.oChangeIndicator.getAggregation("_popover").getContent()[0].getItems();
					assert.strictEqual(
						aItems.length,
						2,
						"then both changes are displayed"
					);
					assert.notOk(
						aItems[0].getCells()[1].getItems()[1].getVisible(),
						"then the show details button is not visible when dependent selectors don't exist"
					);
				}.bind(this));
		});

		QUnit.test("when a change indicator with five changes is created", function(assert) {
			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "move"),
					createMockChange("someOtherChangeId", this.oButton.getId(), "rename"),
					createMockChange("someOtherChangeIdTwo", this.oButton.getId(), "rename"),
					createMockChange("someOtherChangeIdThree", this.oButton.getId(), "rename"),
					createMockChange("someOtherChangeIdFour", this.oButton.getId(), "rename")
				]
			});
			oCore.applyChanges();
			assert.ok(
				this.oChangeIndicator.getDomRef().classList.contains("sapUiRtaChangeIndicatorColorDark"),
				"then the correct indicator color is used"
			);
		});

		QUnit.test("when a change indicator is created and is hovered", function(assert) {
			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "move")
				]
			});
			var oOverlay = sap.ui.getCore().byId(this.oChangeIndicator.getOverlayId());
			this.oChangeIndicator._fnHoverTrue();
			oCore.applyChanges();
			assert.ok(
				oOverlay.getDomRef().classList.contains("sapUiRtaChangeIndicatorHovered"),
				"then the overlay has the correct style class"
			);
		});

		QUnit.test("when a change indicator is focused before it is rendered", function(assert) {
			sandbox.stub(this.oChangeIndicator, "_toggleHoverStyleClasses").returns(true);
			this.oChangeIndicator.focus();
			oCore.applyChanges();
			assert.strictEqual(
				document.activeElement,
				this.oChangeIndicator.getDomRef(),
				"then the indicator receives focus as soon as it is rendered"
			);
		});

		QUnit.test("when a change indicator is created with a change payload that has two simple strings", function(assert) {
			var mPayload = {
				originalLabel: "BeforeValue",
				newLabel: "Aftervalue"
			};

			sandbox.stub(RenameVisualization, "getDescription").callsFake(function(mPayloadParameter, sElementLabel) {
				assert.deepEqual(mPayload, mPayloadParameter, "getDescription is called with the right payload");
				assert.strictEqual(sElementLabel, "TestButton", "getDescription is called with the right element label");
				return { descriptionText: "Test Description" };
			});

			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "rename", "rename", mPayload)
				]
			});

			oCore.applyChanges();

			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.oData[0].description,
				"Test Description",
				"then the description returned from the Visualization Util is displayed"
			);
		});

		QUnit.test("when a change indicator is created with a change payload that has a binding and a string", function(assert) {
			var mPayload = {
				originalLabel: "{/bindingInfo}",
				newLabel: "AfterValue"
			};

			var oJSONModel = new JSONModel({
				bindingInfo: "BeforeValue"
			});

			this.oButton.setModel(oJSONModel);

			sandbox.stub(RenameVisualization, "getDescription").callsFake(function(mPayloadParameter, sElementLabel) {
				assert.strictEqual(mPayloadParameter.originalLabel, "BeforeValue", "getDescription is called with the right original label");
				assert.strictEqual(mPayloadParameter.newLabel, "AfterValue", "getDescription is called with the right new label");
				assert.strictEqual(sElementLabel, "TestButton", "getDescription is called with the right element label");
				return { descriptionText: "Test Description" };
			});

			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "rename", "rename", mPayload)
				]
			});

			oCore.applyChanges();

			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.oData[0].description,
				"Test Description",
				"then the description returned from the Visualization Util is displayed"
			);
		});

		QUnit.test("when a change indicator is created with a change payload that has two bindings", function(assert) {
			var mPayload = {
				originalLabel: "{/bindingInfo}",
				newLabel: "{/bindingInfo2}"
			};

			var oJSONModel = new JSONModel({
				bindingInfo: "BeforeValue",
				bindingInfo2: "AfterValue"
			});

			this.oButton.setModel(oJSONModel);

			sandbox.stub(RenameVisualization, "getDescription").callsFake(function(mPayloadParameter, sElementLabel) {
				assert.strictEqual(mPayloadParameter.originalLabel, "BeforeValue", "getDescription is called with the right original label");
				assert.strictEqual(mPayloadParameter.newLabel, "AfterValue", "getDescription is called with the right new label");
				assert.strictEqual(sElementLabel, "TestButton", "getDescription is called with the right element label");
				return { descriptionText: "Test Description" };
			});

			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "rename", "rename", mPayload)
				]
			});

			oCore.applyChanges();

			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.oData[0].description,
				"Test Description",
				"then the description returned from the Visualization Util is displayed"
			);
		});

		QUnit.test("when a change indicator is created with a change payload but there is no specific visualization for that change type yet", function(assert) {
			var mPayload = {
				originalLabel: "BeforeValue",
				newLabel: "Aftervalue"
			};

			var oRtaResourceBundle = oCore.getLibraryResourceBundle("sap.ui.rta");

			this.oChangeIndicator.getModel().setData({
				changes: [
					createMockChange("someChangeId", this.oButton.getId(), "remove", "remove", mPayload)
				]
			});

			oCore.applyChanges();

			assert.strictEqual(
				this.oChangeIndicator._oDetailModel.oData[0].description,
				oRtaResourceBundle.getText(
					"TXT_CHANGEVISUALIZATION_CHANGE_REMOVE",
					"'TestButton'"
				),
				"then the description is the previously used generic text"
			);
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});