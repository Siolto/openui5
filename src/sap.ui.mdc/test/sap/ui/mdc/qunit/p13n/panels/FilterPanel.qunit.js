/* global QUnit */
sap.ui.define([
	"sap/ui/mdc/p13n/panels/FilterPanel",
	"sap/ui/core/Core",
    "sap/m/Input"
], function (FilterPanel, oCore, Input) {
	"use strict";

    var getTestData = function() {
        return [
            {
                active: false,
                name: "key1",
                label: "Field 1"
            },
            {
                active: false,
                name: "key2",
                label: "Field 2"
            },
            {
                active: false,
                name: "key1",
                label: "Field 3"
            }
        ];
    };

	QUnit.module("FilterPanel API tests", {
		beforeEach: function(){
            this.oFilterPanel = new FilterPanel({
                itemFactory: function(oP13nItem) {
                    return new Input(oP13nItem.name, {

                    });
                }
            });
            this.oFilterPanel.placeAt("qunit-fixture");
            oCore.applyChanges();
		},
		afterEach: function(){
            this.oFilterPanel.destroy();
            this.oFilterPanel = null;
		}
	});

    QUnit.test("instantiate FilterPanel with itemFactory", function(assert){
		assert.ok(this.oFilterPanel, "FilterPanel is instanciable");
	});

    QUnit.test("Check #setP13nData without active fields", function(assert){
        var aTestData = getTestData();
        this.oFilterPanel.setP13nData(aTestData);

        assert.equal(this.oFilterPanel.getP13nData(true).length, 0, "There are no active items present in the panel");
    });

    QUnit.test("Check #setP13nData without active fields", function(assert){
        var aTestData = getTestData();
        aTestData[1].active = true;//set key2 to active
        this.oFilterPanel.setP13nData(aTestData);

        assert.equal(this.oFilterPanel.getP13nData(true).length, 1, "There is one item present in the panel");

        var aRows = this.oFilterPanel._oListControl.getItems();
        var oInputKey2 = this.oFilterPanel._getFactoryControlForRow(aRows[0]);
        assert.equal(oInputKey2.getId(), "key2", "The factory control has been created");
        oInputKey2.destroy();
    });

    QUnit.test("Check #setP13nData to reset an active field", function(assert){
        var aTestData = getTestData();
        aTestData[1].active = true;//set key2 to active
        this.oFilterPanel.setP13nData(aTestData);
        var aRows = this.oFilterPanel._oListControl.getItems();
        var oInputKey2 = this.oFilterPanel._getFactoryControlForRow(aRows[0]);
        assert.equal(oInputKey2.getId(), "key2", "The factory control has been created");

        aTestData = getTestData(); //All fields inactive again
        this.oFilterPanel.setP13nData(aTestData);
        aRows = this.oFilterPanel._oListControl.getItems();
        assert.equal(aRows.length, 1, "The active row has been removed again");

        assert.notOk(oInputKey2.bIsDestroyed, "The control has not been destroyed by the panel as the lifecyle needs to be handled by the consumer");

        oInputKey2.destroy();
    });

    QUnit.test("Check that #_selectKey creates a new factory control", function(assert){
        var aTestData = getTestData();
        this.oFilterPanel.setP13nData(aTestData);
        var aRows = this.oFilterPanel._oListControl.getItems();

        var oComboBox = aRows[0].getContent()[0].getContent()[0];
        oComboBox.setSelectedKey("key2");
        oComboBox.fireSelectionChange({
            source: oComboBox
        });
        oComboBox.fireChange({
            source: oComboBox,
            newValue: "key2"
        });

        aRows = this.oFilterPanel._oListControl.getItems();
        assert.equal(aRows.length, 2, "The item has been added through the ComboBox event handling");
    });

    QUnit.test("Check value state handling by entering invalid values", function(assert){
        var aTestData = getTestData();
        this.oFilterPanel.setP13nData(aTestData);
        var aRows = this.oFilterPanel._oListControl.getItems();

        var oComboBox = aRows[0].getContent()[0].getContent()[0];

        //Enter some invalid value --> Error
        oComboBox.fireChange({
            source: oComboBox,
            newValue: "someInvalidValue"
        });
        aRows = this.oFilterPanel._oListControl.getItems();
        oComboBox = aRows[0].getContent()[0].getContent()[0];
        assert.equal(oComboBox.getValueState(), "Error", "The value state has been set as expected");

        //Clear the invalid value --> no Error value state
        oComboBox.fireChange({
            source: oComboBox,
            newValue: ""
        });
        assert.equal(oComboBox.getValueState(), "None", "The value state has been set as expected");
    });
});
