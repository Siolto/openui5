/* global QUnit */

sap.ui.define([
	"sap/m/Text",
	"sap/ui/integration/util/ContentFactory",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card"
], function (
	Text,
	ContentFactory,
	jQuery,
	Core,
	Card
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Compact min height", {
		before: function () {
			var oContentFactory = new ContentFactory();

			this.oCard = new Card();
			this.getMinHeight = function (sType, oConfiguration, oContent) {
				return oContentFactory.getClass(sType).getMetadata().getRenderer().getMinHeight(oConfiguration, oContent, this.oCard);
			}.bind(this);
		},
		beforeEach: function () {
			jQuery("html").addClass("sapUiSizeCompact");
			this.oFakeContent = new Text();
			this.oFakeContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oFakeContent.destroy();
			this.oFakeContent = null;
			jQuery("html").removeClass("sapUiSizeCompact");
		},
		after: function () {
			this.getMinHeight = null;
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("List card - min height in compact mode", function (assert) {
		//Arrange
		var sType = "List",
			oConfiguration = {
				maxItems: 7,
				item: {
					icon: {}
				}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "14rem", "Min height in compact must be 14rem");
	});

	QUnit.test("List card - min height in compact mode NO icon or description", function (assert) {
		//Arrange
		var sType = "List",
			oConfiguration = {
				maxItems: 7,
				item: {}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "14rem", "Min height in compact must be 14rem");
	});

	QUnit.test("List card - min height in compact mode with description", function (assert) {
		//Arrange
		var sType = "List",
			oConfiguration = {
				maxItems: 7,
				item: {
					description: {}
				}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "35rem", "Min height in compact must be 35rem");
	});

	QUnit.test("List card - min height in compact mode with chart", function (assert) {
		//Arrange
		var sType = "List",
			oConfiguration = {
				maxItems: 7,
				item: {
					chart: {}
				}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "21rem", "Min height in compact must be 21rem");
	});

	QUnit.test("List card - min height in compact mode with chart and description", function (assert) {
		//Arrange
		var sType = "List",
			oConfiguration = {
				maxItems: 7,
				item: {
					chart: {},
					description: "description"
				}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "42rem", "Min height in compact must be 42rem");
	});

	QUnit.test("List card - min height in compact mode with actionsStrip", function (assert) {
		//Arrange
		var sType = "List",
			oConfiguration = {
				maxItems: 2,
				item: {
					actionsStrip: [{
						buttonType: "Reject",
						text: "Delete"
					}]
				}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "10rem", "Min height in compact must be 10rem");
	});

	QUnit.test("Table card - min height in compact mode", function (assert) {
		//Arrange
		var sType = "Table",
			oConfiguration = {
				maxItems: 7,
				item: {}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "16rem", "Min height in compact must be 16rem");
	});

	QUnit.test("TimeLine card - min height in compact mode", function (assert) {
		//Arrange
		var sType = "Timeline",
			oConfiguration = {
				maxItems: 7,
				item: {}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "39.375rem", "Min height is correct");
	});

	QUnit.module("Cozy min height", {
		before: function () {
			var oContentFactory = new ContentFactory();

			this.oCard = new Card();
			this.getMinHeight = function (sType, oConfiguration, oContent) {
				return oContentFactory.getClass(sType).getMetadata().getRenderer().getMinHeight(oConfiguration, oContent, this.oCard);
			}.bind(this);
		},
		beforeEach: function () {
			this.oFakeContent = new Text();
		},
		afterEach: function () {
			this.oFakeContent.destroy();
			this.oFakeContent = null;
		},
		after: function () {
			this.getMinHeight = null;
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("List card - min height in cozy mode", function (assert) {
		//Arrange
		var sType = "List",
			oConfiguration = {
				maxItems: 7,
				item: {
					icon: {}
				}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "19.25rem", "Min height in cozy must be 19.25rem");
	});

	QUnit.test("List card  - min height in cozy mode no icon or description", function (assert) {
		//Arrange
		var sType = "List",
			oConfiguration = {
				maxItems: 7,
				item: {}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "19.25rem", "Min height in cozy must be 19.25rem");
	});

	QUnit.test("List card - min height in cozy mode with icon or description", function (assert) {
		//Arrange
		var sType = "List",
			oConfiguration = {
				maxItems: 7,
				item: {
					description: {}
				}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "35rem", "Min height in cozy must be 35rem");
	});

	QUnit.test("List card - min height in cozy with actionsStrip", function (assert) {
		//Arrange
		var sType = "List",
			oConfiguration = {
				maxItems: 2,
				item: {
					actionsStrip: [{
						buttonType: "Reject",
						text: "Delete"
					}]
				}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "11.75rem", "Min height in cozy must be 11.75rem");
	});

	QUnit.test("Table card  - min height in cozy mode", function (assert) {
		//Arrange
		var sType = "Table",
			oConfiguration = {
				maxItems: 7,
				item: {}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "22rem", "Min height in cozy must be 22rem");
	});

	QUnit.test("TimeLine card  - min height in cozy mode", function (assert) {
		//Arrange
		var sType = "Timeline",
			oConfiguration = {
				maxItems: 7,
				item: {}
			};

		//Assert
		assert.strictEqual(this.getMinHeight(sType, oConfiguration, this.oFakeContent), "39.375rem", "Min height is correct");
	});

	QUnit.test("Analytical card - configuring min height", function (assert) {
		var sType = "Analytical",
			sExpectedMinHeight = "20rem",
			oConfiguration = {
				minHeight: sExpectedMinHeight
			};

		assert.strictEqual(this.getMinHeight(sType, oConfiguration, undefined), sExpectedMinHeight, "Min height in cozy must be " + sExpectedMinHeight);
	});

	QUnit.test("Analytical card - default min height", function (assert) {
		var sType = "Analytical",
			sExpectedMinHeight = "14rem",
			oConfiguration = {};

		assert.strictEqual(this.getMinHeight(sType, oConfiguration, undefined), sExpectedMinHeight, "Min height in cozy must be " + sExpectedMinHeight);
	});

	QUnit.test("AnalyticsCloud card - default min height", function (assert) {
		var sType = "AnalyticsCloud",
			sExpectedMinHeight = "14rem",
			oConfiguration = {};

		assert.strictEqual(this.getMinHeight(sType, oConfiguration, undefined), sExpectedMinHeight, "Min height in cozy must be " + sExpectedMinHeight);
	});

	QUnit.test("AnalyticsCloud card - configuring min height", function (assert) {
		var sType = "AnalyticsCloud",
			sExpectedMinHeight = "20rem",
			oConfiguration = {
				minHeight: sExpectedMinHeight
			};

		assert.strictEqual(this.getMinHeight(sType, oConfiguration, undefined), sExpectedMinHeight, "Min height in cozy must be " + sExpectedMinHeight);
	});

	QUnit.test("Component card - default min height", function (assert) {
		var sType = "Component",
			sExpectedMinHeight = "5rem",
			oConfiguration = {};

		assert.strictEqual(this.getMinHeight(sType, oConfiguration, undefined), sExpectedMinHeight, "Min height in cozy must be " + sExpectedMinHeight);
	});

	QUnit.test("Component card - configuring min height", function (assert) {
		var sType = "Component",
			sExpectedMinHeight = "20rem",
			oConfiguration = {
				minHeight: sExpectedMinHeight
			};

		assert.strictEqual(this.getMinHeight(sType, oConfiguration, undefined), sExpectedMinHeight, "Min height in cozy must be " + sExpectedMinHeight);
	});

	QUnit.test("WebPage card - default min height", function (assert) {
		var sType = "WebPage",
			sExpectedMinHeight = "150px",
			oConfiguration = {};

		assert.strictEqual(this.getMinHeight(sType, oConfiguration, undefined), sExpectedMinHeight, "Min height in cozy must be " + sExpectedMinHeight);
	});

	QUnit.test("WebPage card - configuring min height", function (assert) {
		var sType = "WebPage",
			sExpectedMinHeight = "20rem",
			oConfiguration = {
				minHeight: sExpectedMinHeight
			};

		assert.strictEqual(this.getMinHeight(sType, oConfiguration, undefined), sExpectedMinHeight, "Min height in cozy must be " + sExpectedMinHeight);
	});
});
