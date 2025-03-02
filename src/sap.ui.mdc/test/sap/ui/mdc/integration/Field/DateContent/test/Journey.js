/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
    "sap/ui/mdc/integration/Field/DateContent/pages/App",
	"sap/ui/model/type/Date",
	"sap/ui/model/type/DateTime",
	"sap/ui/model/type/Time",
	"sap/ui/core/format/DateFormat"
], function(
	Opa5,
	opaTest,
	App,
	DateType,
	DateTimeType,
	TimeType,
	DateFormat
) {
	"use strict";

    Opa5.extendConfig({

		// TODO: increase the timeout timer from 15 (default) to 45 seconds
		// to see whether it influences the success rate of the first test on
		// the build infrastructure.
		// As currently, the underlying service takes some time for the
		// creation and initialization of tenants.
		// You might want to remove this timeout timer after the underlying
		// service has been optimized or if the timeout timer increase does
		// not have any effect on the success rate of the tests.
		timeout: 45,

		arrangements: {
			iStartMyUIComponentInViewMode: function() {

				// In some cases when a test fails in a success function,
				// the UI component is not properly teardown.
				// As a side effect, all the following tests in the stack
				// fails when the UI component is started, as only one UI
				// component can be started at a time.
				// Teardown the UI component to ensure it is not started
				// twice without a teardown, which results in less false
				// positives and more reliable reporting.
				if (this.hasUIComponentStarted()) {
					this.iTeardownMyUIComponent();
				}

				return this.iStartMyUIComponent({
					componentConfig: {
						name: "sap.ui.mdc.integration.Field.DateContent",
						async: true,
                        settings: {
                            id: "testingComponent"
                        }
					},
					hash: "",
					autowait: true
				});
			}
		}
	});

	var oDateType = new DateType();
	var oDateTimeType = new DateTimeType();
	var oTimeType = new TimeType();

	var oToday = new Date();
	var oTomorrow = new Date(new Date().setDate(oToday.getDate() + 1));
	var oYesterday = new Date(new Date().setDate(oToday.getDate() - 1));
	var oInFiveDays = new Date(new Date().setDate(oToday.getDate() + 5));

	var aDynamicDates = [
		{
			dynamicDate: "Today",
			expectedFilterFieldConditions: [{
				isEmpty: false,
				operator: "TODAY",
				validated: "NotValidated",
				values: []
			}],
			expectedDynamicDateRangeValue: {
				operator: "TODAY",
				values: []
			},
			expectedDynamicDateRangeInputValue: "Today (" + oDateType.formatValue(oToday, "string") + ")"
		},
		{
			dynamicDate: "Tomorrow",
			expectedFilterFieldConditions: [{
				isEmpty: false,
				operator: "TOMORROW",
				validated: "NotValidated",
				values: []
			}],
			expectedDynamicDateRangeValue: {
				operator: "TOMORROW",
				values: []
			},
			expectedDynamicDateRangeInputValue: "Tomorrow (" + oDateType.formatValue(oTomorrow, "string") + ")"
		},
		{
			dynamicDate: "Yesterday",
			expectedFilterFieldConditions: [{
				isEmpty: false,
				operator: "YESTERDAY",
				validated: "NotValidated",
				values: []
			}],
			expectedDynamicDateRangeValue: {
				operator: "YESTERDAY",
				values: []
			},
			expectedDynamicDateRangeInputValue: "Yesterday (" + oDateType.formatValue(oYesterday, "string") + ")"
		}
	];

	var fnGetId = function(sId) {
		return "testingComponent---app--" + sId;
	};

	var getDateWithoutTime = function(oDate) {
		return new Date(new Date(oDate).setHours(0, 0, 0));
	};

	var getDateAsYYYYMMDD = function(oDate) {
		var sYear = oDate.getFullYear().toString();
		var iMonth = oDate.getMonth() + 1;
		var sMonth = iMonth < 10 ? "0" + iMonth : iMonth;
		var sDay = oDate.getDate() < 10 ? "0" + oDate.getDate().toString() : oDate.getDate().toString();

		return sYear + "-" + sMonth + "-" + sDay;
	};

	var getDateAsYYYYMMDDWithTime = function(oDate) {
		return getDateAsYYYYMMDD(oDate) + "T" + oDate.toTimeString().split(" ")[0];
	};

	var getRangeForDates = function(oStartDate, oEndDate, sConnection) {
		return oDateType.formatValue(oStartDate, "string") + sConnection + oDateType.formatValue(oEndDate, "string");
	};

	var getRangeForDateTimes = function(oStartDate, oEndDate, sConnection) {
		return oDateTimeType.formatValue(oStartDate, "string") + sConnection + oDateTimeType.formatValue(oEndDate, "string");
	};

	var getDateTimeForTimePicker = function(oDateTime) {
		var oDate = new Date(0).setHours(oDateTime.getHours(), oDateTime.getMinutes(), oDateTime.getSeconds());
		return new Date(oDate);
	};

	var aFields = [
		{ id: "F-Date", innerControl: "sap.m.DatePicker", valueStateText: "Enter a date." },
		{ id: "F-DateTime", innerControl: "sap.m.DateTimePicker", valueStateText: "Enter a valid date and time." },
		{ id: "F-Time", innerControl: "sap.m.TimePicker", valueStateText: "Enter a date." }
	];

	var aFilterFields = [
		// FilterFields with maxConditions="1"
		{ id: "FF-Date", innerControl: "sap.m.DatePicker", valueStateText: "Enter a date." },
		{ id: "FF-DateTime", innerControl: "sap.m.DateTimePicker", valueStateText: "Enter a valid date and time." },
		{ id: "FF-Time", innerControl: "sap.m.TimePicker", valueStateText: "Enter a date." },
		{ id: "FF-DateRange", innerControl: "sap.m.DateRangeSelection", valueStateText: "Enter a date." },
		{ id: "FF-DateTimeRange", innerControl: "sap.m.DynamicDateRange", valueStateText: "Incorrect value" },
		{ id: "FF-DDR-Date", innerControl: "sap.m.DynamicDateRange", valueStateText: "Incorrect value" },
		{ id: "FF-DDR-DateTime", innerControl: "sap.m.DynamicDateRange", valueStateText: "Incorrect value" },
		// FilterFields with maxConditions="-1"
		{ id: "FF-Date-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: "Enter a date." },
		{ id: "FF-DateTime-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: "Enter a valid date and time." },
		{ id: "FF-Time-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: "Enter a valid time." },
		{ id: "FF-DateRange-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: "Enter a date." },
		{ id: "FF-DateTimeRange-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: "Enter a valid date and time." },
		{ id: "FF-DDR-Date-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: "Enter a date." },
		{ id: "FF-DDR-DateTime-2", innerControl: "sap.ui.mdc.field.FieldMultiInput", valueStateText: "Enter a valid date and time." }
	];

	QUnit.module("Sanity");

	opaTest("Start application and check if all controlls are displayed correctly", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		aFields.forEach(function(oField) {
			Then.onTheMDCField.iShouldSeeTheFieldWithValues(fnGetId(oField.id), oField.innerControl === "sap.m.DatePicker" ? getDateWithoutTime(oToday) : oToday);
			Then.onTheApp.iShouldSeeFieldWithInnerControl(fnGetId(oField.id), oField.innerControl);
		});

		aFilterFields.forEach(function(oFilterField) {
			Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues({ id: fnGetId(oFilterField.id) }, { conditions: [] });
			Then.onTheApp.iShouldSeeFilterFieldWithInnerControl({ id: fnGetId(oFilterField.id) }, oFilterField.innerControl);
		});
	});

	opaTest("Enter invalid value in each Field and check if handling is correct", function(Given, When, Then) {
		aFields.forEach(function(oField) {
			if (oField.innerControl !== "sap.m.TimePicker") {
				When.onTheMDCField.iEnterTextOnTheField(fnGetId(oField.id), "abc123");
				Then.onTheApp.iShouldSeeFieldWithValueState(fnGetId(oField.id), "Error", oField.valueStateText);
			}
		});
	});

	opaTest("Enter invalid value in each FilterField and check if handling is correct", function(Given, When, Then) {
		aFilterFields.forEach(function(oFilterField) {
			if (oFilterField.innerControl !== "sap.m.TimePicker") {
				When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId(oFilterField.id) }, "abc123");
				Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
				{
					id: fnGetId(oFilterField.id),
					valueState: "Error",
					valueStateText: oFilterField.valueStateText
				},
				{
					conditions: []
				});
			}
		});
	});

	QUnit.module("Field");

	opaTest("DatePicker - Enter Date: '" + oDateType.formatValue(oTomorrow, "string") + "'", function(Given, When, Then) {
		When.onTheMDCField.iEnterTextOnTheField(fnGetId("F-Date"), oDateType.formatValue(oTomorrow, "string"));
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(fnGetId("F-Date"), getDateWithoutTime(oTomorrow));
		Then.onTheApp.iShouldSeeFieldWithValueState(fnGetId("F-Date"), "None", "");
		Then.onTheApp.iShouldSeeFieldWithDatePickerProperties({ id: fnGetId("F-Date") }, {
			dateValue: getDateWithoutTime(oTomorrow),
			value: getDateAsYYYYMMDD(oTomorrow)
		});
	});

	opaTest("DateTimePicker - Enter DateTime: '" + oDateTimeType.formatValue(oTomorrow, "string") + "'", function(Given, When, Then) {
		When.onTheMDCField.iEnterTextOnTheField(fnGetId("F-DateTime"), oDateTimeType.formatValue(oTomorrow, "string"));
		Then.onTheMDCField.iShouldSeeTheFieldWithValues(fnGetId("F-DateTime"), getDateWithoutTime(oTomorrow));
		Then.onTheApp.iShouldSeeFieldWithValueState(fnGetId("F-DateTime"), "None", "");
		Then.onTheApp.iShouldSeeFieldWithDatePickerProperties({ id: fnGetId("F-DateTime") }, {
			dateValue: oTomorrow,
			value: getDateAsYYYYMMDDWithTime(oTomorrow)
		});
	});

	// No TimePicker Test implemented yet - see comment below (L283)

	QUnit.module("FilterField maxConditions='1'");

	opaTest("DatePicker - Enter Date: '" + oDateType.formatValue(oToday, "string") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-Date") }, oDateType.formatValue(oToday, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-Date"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [{
					isEmpty: null,
					operator: "EQ",
					validated: "NotValidated",
					values: [ getDateWithoutTime(oToday) ]
				}]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithDatePickerProperties({ id: fnGetId("FF-Date") }, {
			dateValue: getDateWithoutTime(oToday),
			value: getDateAsYYYYMMDD(oToday)
		});
	});

	opaTest("DateTimePicker - Enter DateTime: '" + oDateTimeType.formatValue(oToday, "string") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-DateTime") }, oDateTimeType.formatValue(oToday, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateTime"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [{
					isEmpty: null,
					operator: "EQ",
					validated: "NotValidated",
					values: [ oToday ]
				}]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithDateTimePickerProperties({ id: fnGetId("FF-DateTime") }, {
			dateValue: oToday,
			value: getDateAsYYYYMMDDWithTime(oToday)
		});
	});

	/*
	var getDateTimeForTimePicker = function(oDateTime) {
		var oDate = new Date(0).setHours(oDateTime.getHours(), oDateTime.getMinutes(), oDateTime.getSeconds());
		return new Date(oDate);
	};

	Not working as TimePicker will always set value to "--:--:-- --" when focusing, this causes issues with Opa -> BCP 2270119571
	opaTest("TimePicker - Enter Time: " + oTimeType.formatValue(oDate, "string"), function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-Time") }, oTimeType.formatValue(oDate, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues({ id: fnGetId("FF-Time") }, {
			conditions: [{
				isEmpty: null,
				operator: "EQ",
				validated: "NotValidated",
				values: [ getDateTimeForTimePicker(oDate) ]
			}]
		});
		Then.onTheApp.iShouldSeeFilterFieldWithTimePickerProperties({ id: fnGetId("FF-Time") }, {
			dateValue: getDateTimeForTimePicker(oDate),
			value: oDate.toTimeString().split(" ")[0]
		});
	});

	opaTest("TimePicker - Enter Time: " + oDateTime.toTimeString().split(" ")[0], function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-Time") }, oDateTime.toTimeString().split(" ")[0]);
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues({ id: fnGetId("FF-Time") }, {
			conditions: [{
				isEmpty: null,
				operator: "EQ",
				validated: "NotValidated",
				values: [ getDateTimeForTimePicker(oDateTime) ]
			}]
		});
		Then.onTheApp.iShouldSeeFilterFieldWithTimePickerProperties({ id: fnGetId("FF-Time") }, {
			dateValue: getDateTimeForTimePicker(oDateTime),
			value: oDateTime.toTimeString().split(" ")[0]
		});
	});
	*/

	opaTest("DateRangeSelection - Enter Dates: '" + getRangeForDates(oToday, oInFiveDays, " ... ") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-DateRange") }, getRangeForDates(oToday, oInFiveDays, " ... "));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateRange"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [{
					isEmpty: null,
					operator: "BT",
					validated: "NotValidated",
					values: [ getDateWithoutTime(oToday), getDateWithoutTime(oInFiveDays) ]
				}]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithDateRangeSelectionProperties({ id: fnGetId("FF-DateRange") }, {
			dateValue: getDateWithoutTime(oToday),
			secondDateValue: getDateWithoutTime(oInFiveDays),
			value: getDateAsYYYYMMDD(oToday) + "..." + getDateAsYYYYMMDD(oInFiveDays)
		});
	});

	opaTest("DateRangeSelection - Enter DateTimes: '" + getRangeForDateTimes(oToday, oInFiveDays, " - ") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-DateTimeRange") }, getRangeForDateTimes(oToday, oInFiveDays, " - "));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateTimeRange"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [{
					isEmpty: false,
					operator: "BT",
					validated: "NotValidated",
					values: [ oToday, oInFiveDays ]
				}]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithDynamicDateRangeProperties({ id: fnGetId("FF-DateTimeRange") }, {
			value: {
				operator: "DATETIMERANGE",
				values: [ oToday, oInFiveDays ]
			},
			innerControlValue: getRangeForDateTimes(oToday, oInFiveDays, " - ")
		});
	});

	aDynamicDates.forEach(function(oDynamicDate) {
		opaTest("DynamicDateRange - Enter DynamicDate: '" + oDynamicDate.dynamicDate + "'", function(Given, When, Then) {
			When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-DDR-Date") }, oDynamicDate.dynamicDate);
			Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
				{
					id: fnGetId("FF-DDR-Date"),
					valueState: "None",
					valueStateText: ""
				},
				{
					conditions: oDynamicDate.expectedFilterFieldConditions
				});
			Then.onTheApp.iShouldSeeFilterFieldWithDynamicDateRangeProperties({ id: fnGetId("FF-DDR-Date") }, {
				value: oDynamicDate.expectedDynamicDateRangeValue,
				innerControlValue: oDynamicDate.expectedDynamicDateRangeInputValue
			});
		});
	});

	opaTest("DynamicDateRange - Enter DateTimes: '" + getRangeForDateTimes(oToday, oInFiveDays, " - ") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-DDR-DateTime") }, getRangeForDateTimes(oToday, oInFiveDays, " - "));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DDR-DateTime"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [{
					isEmpty: false,
					operator: "BT",
					validated: "NotValidated",
					values: [ oToday, oInFiveDays ]
				}]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithDynamicDateRangeProperties({ id: fnGetId("FF-DDR-DateTime") }, {
			value: {
				operator: "DATETIMERANGE",
				values: [ oToday, oInFiveDays ]
			},
			innerControlValue: oDateTimeType.formatValue(oToday, "string") + " - " + oDateTimeType.formatValue(oInFiveDays, "string")
		});
	});

	QUnit.module("FilterField maxConditions='-1'");

	opaTest("DatePicker - Enter Dates: '" + oDateType.formatValue(oToday, "string") + "' and '" + oDateType.formatValue(oTomorrow, "string") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-Date-2") }, oDateType.formatValue(oToday, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-Date-2"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [{
					isEmpty: null,
					operator: "EQ",
					validated: "NotValidated",
					values: [ getDateWithoutTime(oToday) ]
				}]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithTokenizer({ id: fnGetId("FF-Date-2") }, [ oDateType.formatValue(oToday, "string") ]);

		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-Date-2") }, oDateType.formatValue(oTomorrow, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-Date-2"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [
					{
						isEmpty: null,
						operator: "EQ",
						validated: "NotValidated",
						values: [ getDateWithoutTime(oToday) ]
					},
					{
						isEmpty: null,
						operator: "EQ",
						validated: "NotValidated",
						values: [ getDateWithoutTime(oTomorrow) ]
					}
				]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithTokenizer({ id: fnGetId("FF-Date-2") }, [ oDateType.formatValue(oToday, "string"), oDateType.formatValue(oTomorrow, "string") ]);
	});

	opaTest("DateTimePicker - Enter DateTimes: " + oDateTimeType.formatValue(oToday, "string") + "' and '" + oDateTimeType.formatValue(oTomorrow, "string") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-DateTime-2") }, oDateTimeType.formatValue(oToday, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateTime-2"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [{
					isEmpty: null,
					operator: "EQ",
					validated: "NotValidated",
					values: [ oToday ]
				}]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithTokenizer({ id: fnGetId("FF-DateTime-2") }, [ oDateTimeType.formatValue(oToday, "string") ]);

		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-DateTime-2") }, oDateTimeType.formatValue(oTomorrow, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateTime-2"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [
					{
						isEmpty: null,
						operator: "EQ",
						validated: "NotValidated",
						values: [ oToday ]
					},
					{
						isEmpty: null,
						operator: "EQ",
						validated: "NotValidated",
						values: [ oTomorrow ]
					}
				]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithTokenizer({ id: fnGetId("FF-DateTime-2") }, [ oDateTimeType.formatValue(oToday, "string"), oDateTimeType.formatValue(oTomorrow, "string") ]);
	});

	opaTest("TimePicker - Enter Time: '" + oTimeType.formatValue(oToday, "string") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-Time-2") }, oTimeType.formatValue(oToday, "string"));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-Time-2"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [{
					isEmpty: null,
					operator: "EQ",
					validated: "NotValidated",
					values: [ getDateTimeForTimePicker(oToday) ]
				}]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithTokenizer({ id: fnGetId("FF-Time-2") }, [  oTimeType.formatValue(oToday, "string") ]);
	});

	opaTest("DateRangeSelection - Enter Dates: '" + getRangeForDates(oToday, oInFiveDays, "...") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-DateRange-2") }, getRangeForDates(oToday, oInFiveDays, "..."));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateRange-2"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [{
					isEmpty: null,
					operator: "BT",
					validated: "NotValidated",
					values: [ getDateWithoutTime(oToday), getDateWithoutTime(oInFiveDays) ]
				}]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithTokenizer({ id: fnGetId("FF-DateRange-2") }, [  getRangeForDates(oToday, oInFiveDays, "...") ]);
	});

	opaTest("DateRangeSelection - Enter DateTimes: '" + getRangeForDateTimes(oToday, oInFiveDays, "...") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-DateTimeRange-2") }, getRangeForDateTimes(oToday, oInFiveDays, "..."));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DateTimeRange-2"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [{
					isEmpty: false,
					operator: "BT",
					validated: "NotValidated",
					values: [ oToday, oInFiveDays ]
				}]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithTokenizer({ id: fnGetId("FF-DateTimeRange-2") }, [  getRangeForDateTimes(oToday, oInFiveDays, "...") ]);
	});

	opaTest("DynamicDateRange - Enter DynamicDates", function(Given, When, Then) {
		var aConditions = aDynamicDates.map(function(oDynamicDate) {
			return oDynamicDate.expectedFilterFieldConditions;
		});
		var aTokenTexts = aDynamicDates.map(function(oDynamicDate) {
			return oDynamicDate.dynamicDate;
		});

		aDynamicDates.forEach(function(oDynamicDate, iIndex) {
			When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-DDR-Date-2") }, oDynamicDate.dynamicDate);
			Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
				{
					id: fnGetId("FF-DDR-Date-2"),
					valueState: "None",
					valueStateText: ""
				},
				{
					conditions: aConditions.slice(0, iIndex)
				});
			Then.onTheApp.iShouldSeeFilterFieldWithTokenizer({ id: fnGetId("FF-DDR-Date-2") }, aTokenTexts.slice(0, iIndex));
		});
	});

	opaTest("DynamicDateRange - Enter DateTimes: '" + getRangeForDateTimes(oToday, oInFiveDays, "...") + "'", function(Given, When, Then) {
		When.onTheMDCFilterField.iEnterTextOnTheFilterField({ id: fnGetId("FF-DDR-DateTime-2") }, getRangeForDateTimes(oToday, oInFiveDays, "..."));
		Then.onTheMDCFilterField.iShouldSeeTheFilterFieldWithValues(
			{
				id: fnGetId("FF-DDR-DateTime-2"),
				valueState: "None",
				valueStateText: ""
			},
			{
				conditions: [{
					isEmpty: false,
					operator: "BT",
					validated: "NotValidated",
					values: [ oToday, oInFiveDays ]
				}]
			});
		Then.onTheApp.iShouldSeeFilterFieldWithTokenizer({ id: fnGetId("FF-DDR-DateTime-2") }, [ oDateTimeType.formatValue(oToday, "string") + "..." + oDateTimeType.formatValue(oInFiveDays, "string") ]);
		Then.iTeardownMyUIComponent();
	});

});