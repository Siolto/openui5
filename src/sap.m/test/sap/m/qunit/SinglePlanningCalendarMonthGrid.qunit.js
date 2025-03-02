/*global QUnit*/
sap.ui.define([
	"sap/m/SinglePlanningCalendar",
	"sap/m/SinglePlanningCalendarMonthView",
	"sap/m/SinglePlanningCalendarMonthGrid",
	"sap/ui/unified/CalendarAppointment",
	'sap/ui/unified/DateTypeRange',
	'sap/ui/unified/library',
	"sap/ui/core/Core"
], function(
	SinglePlanningCalendar,
	SinglePlanningCalendarMonthView,
	SinglePlanningCalendarMonthGrid,
	CalendarAppointment,
	DateTypeRange,
	unifiedLibrary,
	oCore
) {
		"use strict";

		var CalendarDayType = unifiedLibrary.CalendarDayType;

		var o2Aug2018_00_00 = new Date(2018, 7, 2);
		var o2Aug2018_18_00 = new Date(2018, 7, 2, 18, 0, 0);
		var o3Aug2018_00_00 = new Date(2018, 7, 3);
		var i30Jul2018_00_00_UTC_Timestamp = 1532908800000;
		var i9Sep2018_00_00_UTC_Timestamp = 1536451200000;
		var i2Aug2018_00_00_UTC_Timestamp = 1533168000000;

		QUnit.module("More links", {
			beforeEach: function() {
				this.oSPC = new SinglePlanningCalendarMonthGrid({
					startDate: o2Aug2018_00_00,
					appointments: [
						new CalendarAppointment({
							startDate: o2Aug2018_00_00,
							endDate: o2Aug2018_18_00
						}),
						new CalendarAppointment({
							startDate: o2Aug2018_00_00,
							endDate: o2Aug2018_18_00
						}),
						new CalendarAppointment({
							startDate: o2Aug2018_00_00,
							endDate: o2Aug2018_18_00
						}),
						new CalendarAppointment({
							startDate: o2Aug2018_00_00,
							endDate: o2Aug2018_18_00
						}),
						new CalendarAppointment({
							startDate: o2Aug2018_00_00,
							endDate: o2Aug2018_18_00
						})
					]
				}).placeAt("qunit-fixture");

				oCore.applyChanges();
			},
			afterEach: function () {
				this.oSPC.destroy();
			}
		});

		QUnit.test("more link creation", function(assert) {
			var oLink = this.oSPC._aLinks[3];

			// assert
			assert.ok(oLink, "there is something");
			assert.ok(oLink.isA("sap.m.Link"), "it's a link");
			assert.equal(oLink.getText(), "3 More", "it's text is correct");
		});

		QUnit.test("more link custom data", function(assert) {
			var oLink = this.oSPC._aLinks[3];

			// assert
			assert.equal(oLink.getCustomData().length, 1, "it has some data attached");
			assert.equal(oLink.getCustomData()[0].getKey(), "date", "the data's key is correct");
			assert.equal(oLink.getCustomData()[0].getValue(), i2Aug2018_00_00_UTC_Timestamp, "the data's value is correct");
		});

		QUnit.test("moreLinkPress", function(assert) {
			var oMorePressSpy = this.spy(this.oSPC, "fireEvent"),
				oLink = this.oSPC._aLinks[3];

			// act
			oLink.firePress();

			// assert
			assert.ok(oMorePressSpy.calledOnce, "an event is fired");
			assert.ok(oMorePressSpy.calledWithMatch("moreLinkPress", { date: o2Aug2018_00_00 }), "its the right event + parameters");
		});

		QUnit.module("Grid days", {
			beforeEach: function() {
				this.oSPC = new SinglePlanningCalendarMonthGrid({
					startDate: o2Aug2018_00_00
				}).placeAt("qunit-fixture");

				oCore.applyChanges();
			},
			afterEach: function() {
				this.oSPC.destroy();
			}
		});

		QUnit.test("Days count", function(assert) {
			var aDays = this.oSPC._getVisibleDays(this.oSPC.getStartDate());

			// assert
			assert.equal(aDays.length, 42, "_getVisibleDays returns the correct number of days");
			assert.equal(this.oSPC.$().find(".sapMSPCMonthDay").length, 42, "the grid has the right amount of cells");
		});

		QUnit.test("Correct dates", function(assert) {
			var aDays = this.oSPC._getVisibleDays(this.oSPC.getStartDate());

			// assert
			assert.equal(aDays[0].valueOf(), i30Jul2018_00_00_UTC_Timestamp, "the first day is correct");
			assert.equal(aDays[41].valueOf(), i9Sep2018_00_00_UTC_Timestamp, "the last day is correct");
			assert.equal(this.oSPC.$().find(".sapMSPCMonthDay")[0].getAttribute("sap-ui-date"), i30Jul2018_00_00_UTC_Timestamp.toString(), "the first date is correct");
			assert.equal(this.oSPC.$().find(".sapMSPCMonthDay")[41].getAttribute("sap-ui-date"), i9Sep2018_00_00_UTC_Timestamp.toString(), "the last date is correct");
		});

		QUnit.test("Special dates indicator", function(assert) {
			// arrange, act
			this.oSPC.addSpecialDate(new DateTypeRange({
				type: CalendarDayType.Type05,
				startDate: new Date(2018, 6, 30)
			}));
			oCore.applyChanges();

			// assert
			assert.ok(this.oSPC.$().find(".sapMSPCMonthDay")[0]
				.classList.contains("sapUiCalendarSpecialDayType05"), "the cell is special");
		});

		QUnit.module("Appointments", {
			beforeEach: function() {
				this.oSPC = new SinglePlanningCalendarMonthGrid({
					startDate: o2Aug2018_00_00,
					appointments: [
						new CalendarAppointment({
							startDate: o2Aug2018_00_00,
							endDate: o2Aug2018_18_00
						}),
						new CalendarAppointment({
							startDate: new Date(i30Jul2018_00_00_UTC_Timestamp),
							endDate: o2Aug2018_00_00
						}),
						new CalendarAppointment({
							startDate: new Date(i9Sep2018_00_00_UTC_Timestamp),
							endDate: new Date(i9Sep2018_00_00_UTC_Timestamp + 1000)
						})
					]
				}).placeAt("qunit-fixture");

				oCore.applyChanges();
			},
			afterEach: function() {
				this.oSPC.destroy();
			}
		});

		QUnit.test("Appointment nodes properties", function(assert) {
			// arrange
			var aAppointmentNodes;
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: o2Aug2018_00_00,
				endDate: o2Aug2018_18_00
			}));

			// act
			aAppointmentNodes = this.oSPC._calculateAppointmentsNodes(this.oSPC.getStartDate());

			// assert
			assert.equal(aAppointmentNodes.length, 4, "appointments are the right number");
			assert.ok(aAppointmentNodes[0].start, "appointments have start");
			assert.ok(aAppointmentNodes[0].end, "appointments have end");
			assert.ok(aAppointmentNodes[0].data, "appointments have data");
			assert.ok(aAppointmentNodes[0].width, "appointments have width");
			assert.ok(!isNaN(aAppointmentNodes[0].len), "appointments have len");
			assert.ok(!isNaN(aAppointmentNodes[0].level), "appointments have level");
		});

		QUnit.test("Appointment sorting", function(assert) {
			// arrange
			var aAppointmentNodes;
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: new Date(i9Sep2018_00_00_UTC_Timestamp),
				endDate: new Date(i9Sep2018_00_00_UTC_Timestamp)
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: o2Aug2018_00_00,
				endDate: o2Aug2018_18_00
			}));

			// act
			aAppointmentNodes = this.oSPC._calculateAppointmentsNodes(this.oSPC.getStartDate());

			// assert
			assert.ok(aAppointmentNodes[0].start.valueOf() <= aAppointmentNodes[1].start.valueOf(), "appointments are sorted");
			assert.ok(aAppointmentNodes[1].start.valueOf() <= aAppointmentNodes[2].start.valueOf(), "appointments are sorted");
			assert.ok(aAppointmentNodes[2].start.valueOf() <= aAppointmentNodes[3].start.valueOf(), "appointments are sorted");
		});

		QUnit.test("Appointment levels", function(assert) {
			// arrange
			var aAppointmentNodes;
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: new Date(i9Sep2018_00_00_UTC_Timestamp),
				endDate: new Date(i9Sep2018_00_00_UTC_Timestamp)
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: o2Aug2018_00_00,
				endDate: o2Aug2018_18_00
			}));

			// act
			aAppointmentNodes = this.oSPC._calculateAppointmentsNodes(this.oSPC.getStartDate());

			// assert
			assert.ok(aAppointmentNodes[1].level, 0, "same-day appointments have correct levels");
			assert.ok(aAppointmentNodes[2].level, 1, "same-day appointments have correct levels");
		});

		QUnit.test("Invalid appointments", function(assert) {
			// arrange
			var aAppointmentNodes;
			this.oSPC.destroyAppointments();
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: new Date(2018, 8, 10),
				endDate: new Date(2018, 8, 11)
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: new Date(2018, 6, 28),
				endDate: new Date(2018, 6, 29)
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: o2Aug2018_00_00
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				endDate: o2Aug2018_00_00
			}));

			// act
			aAppointmentNodes = this.oSPC._calculateAppointmentsNodes(this.oSPC.getStartDate());

			// assert
			assert.equal(aAppointmentNodes.length, 0, "invalid appointments do not play");
		});

		QUnit.test("Appointments exceeding view port", function(assert) {
			// arrange
			var aAppointmentNodes;
			this.oSPC.destroyAppointments();
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: new Date(2018, 2, 10),
				endDate: new Date(2018, 7, 11)
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: new Date(2018, 7, 10),
				endDate: new Date(2018, 10, 11)
			}));
			this.oSPC.addAppointment(new CalendarAppointment({
				startDate: new Date(2018, 2, 10),
				endDate: new Date(2018, 10, 11)
			}));

			// act
			aAppointmentNodes = this.oSPC._calculateAppointmentsNodes(this.oSPC.getStartDate());

			// assert
			assert.equal(aAppointmentNodes.length, 3, "exceeding view port appointments are rendered");
		});

		QUnit.test("Large appointment representation in DOM with unique ID", function(assert) {
			// arrange
			this.oSPC.destroyAppointments();
			var oAppointment = new CalendarAppointment("appointment_from_01_to_22",{
				startDate: new Date(2018, 2, 1),
				endDate: new Date(2018, 7, 22)
				});

			// act
			this.oSPC.addAppointment(oAppointment);
			oCore.applyChanges();

			var oFakeEvent = {
				target: {
					parentElement: document.getElementById("appointment_from_01_to_22-0_0"),
					classList: {
						contains: function() {
							return false;
						}
					}
				}
			};
			this.oSPC._fireSelectionEvent(oFakeEvent);

			// assert
			assert.ok(oAppointment.getDomRef(), "appointment shuld have DOM representation");
			assert.equal(oAppointment, this.oSPC._findSrcControl(oFakeEvent), "the srcControl found must be the same as oAppointment");
			assert.ok(oAppointment._sAppointmentPartSuffix, "after calling the _findSrcControl method, the appointment must have a suffix");
		});

		QUnit.module("Other", {
			beforeEach: function() {
				this.oSPCMG = new SinglePlanningCalendarMonthGrid({
					startDate: o2Aug2018_00_00
				}).placeAt("qunit-fixture");

				oCore.applyChanges();
			},
			afterEach: function() {
				this.oSPCMG.destroy();
			}
		});

		QUnit.test("Vertical labels", function(assert) {
			// act
			var sLabels = this.oSPCMG._getVerticalLabels();

			// assert
			assert.equal(sLabels.length, 6, "there are 6 labels");
			assert.equal(sLabels[0], "31", "first label is ok");
			assert.equal(sLabels[5], "36", "last label is ok");
		});

		QUnit.test("cellPress", function(assert) {
			// arrange
			var oCellPressSpy = this.spy(this.oSPCMG, "fireEvent");

			// act
			this.oSPCMG._fireSelectionEvent({ target: this.oSPCMG.$().find('.sapMSPCMonthDay')[3], srcControl: this.oSPCMG});

			// assert
			assert.ok(oCellPressSpy.callCount, 2, "two events are fired");
			assert.ok(oCellPressSpy.calledWithMatch("appointmentSelect", { appointment: undefined, appointments: [] }), "appointmentSelect is fired + parameters");
			assert.ok(oCellPressSpy.calledWithMatch("cellPress", { startDate: o2Aug2018_00_00, endDate: o3Aug2018_00_00 }), "cellPress is fired + parameters");
		});

		QUnit.test("appointmentSelect: select a single appointment", function (assert) {
			var oAppointment = new CalendarAppointment(),
				oGrid = new SinglePlanningCalendarMonthGrid({
					appointments: [
						oAppointment
					]
				}),
				oFakeEvent = {
					target: {
						classList: {
							contains: function() {
								return false;
							}
						}
					},
					srcControl: oAppointment
				},
				fnFireAppointmentSelectSpy = this.spy(oGrid, "fireAppointmentSelect");

			//act
			oGrid._fireSelectionEvent(oFakeEvent);

			//assert
			assert.ok(fnFireAppointmentSelectSpy.calledOnce, "Event was fired");
			assert.ok(fnFireAppointmentSelectSpy.calledWithExactly({
				appointment: oAppointment,
				appointments: [oAppointment],
				id: oGrid.getId()
			}), "Event was fired with the correct parameters");

			//clean up
			oGrid.destroy();
		});

		QUnit.test("appointmentSelect: deselect all appointments", function (assert) {
			var oGrid = new SinglePlanningCalendarMonthGrid({
					appointments: [
						new CalendarAppointment({
							startDate: new Date(2018, 6, 8, 5),
							endDate: new Date(2018, 6, 8, 6),
							selected: true
						}),
						new CalendarAppointment({
							startDate: new Date(2018, 6, 9, 4),
							endDate: new Date(2018, 6, 10, 4),
							selected: true
						})
					]
				}),
				oFakeEvent = {
					target: document.createElement("div"),
					srcControl: oGrid
				},
				fnFireAppointmentSelectSpy = this.spy(oGrid, "fireAppointmentSelect");

			oFakeEvent.target.className = "sapMSPCMonthDay";

			//act
			oGrid._fireSelectionEvent(oFakeEvent);

			//assert
			assert.ok(fnFireAppointmentSelectSpy.calledOnce, "Event was fired");
			assert.ok(fnFireAppointmentSelectSpy.calledWith({
				appointment: undefined,
				appointments: oGrid.getAggregation("appointments"),
				id: oGrid.getId()
			}), "Event was fired with the correct parameters");

			//clean up
			oGrid.destroy();
		});

		QUnit.test("_findSrcControl", function(assert) {
			// Prepare
			var oAppointment = new CalendarAppointment({
					startDate: new Date(2022,0,20),
					endDate: new Date(2022,11,31)
				}),
				oGrid = new SinglePlanningCalendarMonthGrid({
					startDate: new Date(2022,0,25),
					appointments: [oAppointment]
				}),
				oFireAppointmentSelectSpy = this.spy(oGrid, "fireAppointmentSelect");

			oGrid.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			// Act
			oGrid.onkeydown({
				target: oAppointment.getDomRef(),
				which: 13,
				preventDefault: function() {}
			});

			// Assert
			assert.ok(oFireAppointmentSelectSpy.calledOnce, "AppointmentSelect event is fired");

			// Destroy
			oGrid.destroy();
		});

		QUnit.module("DOM attributes", {
			beforeEach: function() {
				this.oSPC = new SinglePlanningCalendar({
					startDate: new Date(2020,11,1),
					enableAppointmentsDragAndDrop: false,
					views: new SinglePlanningCalendarMonthView({
						key: "Month",
						title: "Month"
					}),
					appointments:[
						new CalendarAppointment({
							title: "appointment for 2 rows",
							startDate: new Date(2020,11,10),
							endDate: new Date(2020,11,14)
						})
					]
				}).placeAt("qunit-fixture");

				oCore.applyChanges();
			},
			afterEach: function() {
				this.oSPC.destroy();
			}
		});

		QUnit.test("Appointment on two rows", function (assert){
			// arrange
			var oAppointmentHTMElement = this.oSPC.getAggregation("_mvgrid").$().find(".sapMSinglePCBlockers")[1].children[0];
			var oAppointment = this.oSPC.getAppointments()[0];
			//assert
			assert.strictEqual(oAppointmentHTMElement.getAttribute("data-sap-ui-related"), oAppointment.getId(), "Appoinment have same data-sap-ui-related as the Control Id");
			assert.notEqual(oAppointmentHTMElement.getAttribute("id"), oAppointment.getId(), "DOM representation of the appointment should have a different id from the object Appointment");
			assert.strictEqual(oAppointmentHTMElement.getAttribute("draggable"), this.oSPC.getEnableAppointmentsDragAndDrop().toString(), "Тhe appointment must receive the correct 'draggable' attribute from the SPC settings");

			//act
			this.oSPC.setEnableAppointmentsDragAndDrop(true);
			oCore.applyChanges();

			//asert
			assert.strictEqual(oAppointmentHTMElement.getAttribute("draggable"), this.oSPC.getEnableAppointmentsDragAndDrop().toString(), "Тhe appointment must receive the correct 'draggable' attribute from the SPC settings");
		});
	});
