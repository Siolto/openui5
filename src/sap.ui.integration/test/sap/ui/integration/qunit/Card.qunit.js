/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/integration/Host",
	"sap/ui/integration/cards/BaseContent",
	"sap/ui/integration/cards/Header",
	"sap/ui/integration/cards/filters/SelectFilter",
	"sap/ui/integration/util/DataProvider",
	"sap/ui/integration/util/Utils",
	"sap/ui/core/Core",
	"sap/ui/core/library",
	"sap/ui/core/Manifest",
	"sap/base/Log",
	"sap/ui/core/ComponentContainer",
	"sap/ui/base/Event",
	"sap/ui/core/UIComponent",
	"sap/m/BadgeCustomData",
	"sap/m/MessageStrip",
	"sap/ui/integration/util/DataProviderFactory",
	"sap/m/library",
	"sap/base/util/deepExtend",
	"sap/base/util/LoaderExtensions",
	"sap/m/HBox",
	"sap/ui/model/json/JSONModel",
	"sap/m/IllustratedMessageType",
	"sap/m/IllustratedMessageSize"
],
	function (
		Card,
		Host,
		BaseContent,
		Header,
		Filter,
		DataProvider,
		Utils,
		Core,
		coreLibrary,
		CoreManifest,
		Log,
		ComponentContainer,
		Event,
		UIComponent,
		BadgeCustomData,
		MessageStrip,
		DataProviderFactory,
		mLibrary,
		deepExtend,
		LoaderExtensions,
		HBox,
		JSONModel,
		IllustratedMessageType,
		IllustratedMessageSize
	) {
		"use strict";

		var DOM_RENDER_LOCATION = "qunit-fixture";

		var AvatarColor = mLibrary.AvatarColor;
		var MessageType = coreLibrary.MessageType;

		var oManifest_Header = {
			"sap.app": {
				"id": "test.card.card1"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "L3 Request list content Card",
					"subTitle": "Card subtitle",
					"icon": {
						"src": "sap-icon://accept"
					},
					"status": {
						"text": "100 of 200"
					},
					"dataTimestamp": "2021-03-18T12:00:00Z"
				}
			}
		};

		var oManifest_ListCard = {
			"sap.app": {
				"id": "my.card.qunit.test.ListCard"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"title": "L3 Request list content Card",
					"subTitle": "Card subtitle",
					"icon": {
						"src": "sap-icon://accept"
					},
					"status": {
						"text": "100 of 200"
					}
				},
				"content": {
					"data": {
						"json": [
							{
								"Name": "Notebook Basic 15",
								"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1000",
								"SubCategoryId": "Notebooks",
								"state": "Information",
								"info": "27.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Basic 17",
								"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1001",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "27.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Basic 18",
								"Description": "Notebook Basic 18 with 2,80 GHz quad core, 18\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1002",
								"SubCategoryId": "Notebooks",
								"state": "Warning",
								"info": "9.45 EUR",
								"infoState": "Error"
							},
							{
								"Name": "Notebook Basic 19",
								"Description": "Notebook Basic 19 with 2,80 GHz quad core, 19\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1003",
								"SubCategoryId": "Notebooks",
								"state": "Error",
								"info": "9.45 EUR",
								"infoState": "Error"
							},
							{
								"Name": "ITelO Vault",
								"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
								"Id": "HT-1007",
								"SubCategoryId": "PDAs & Organizers",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 15",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1010",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 26",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1022",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 27",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1024",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							}
						]
					},
					"item": {
						"title": {
							"label": "Title",
							"value": "{Name}"
						},
						"description": {
							"label": "Description",
							"value": "{Description}"
						},
						"highlight": "{state}",
						"info": {
							"value": "{info}",
							"state": "{infoState}"
						}
					}
				}
			}
		};

		var oManifest_ListCard_NoHeader = {
			"sap.app": {
				"id": "my.card.qunit.test.ListCard"
			},
			"sap.card": {
				"type": "List",
				"content": {
					"data": {
						"json": [
							{
								"Name": "Notebook Basic 15",
								"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1000",
								"SubCategoryId": "Notebooks",
								"state": "Information",
								"info": "27.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Basic 17",
								"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1001",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "27.45 EUR",
								"infoState": "Success"

							},
							{
								"Name": "Notebook Basic 18",
								"Description": "Notebook Basic 18 with 2,80 GHz quad core, 18\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1002",
								"SubCategoryId": "Notebooks",
								"state": "Warning",
								"info": "9.45 EUR",
								"infoState": "Error"
							},
							{
								"Name": "Notebook Basic 19",
								"Description": "Notebook Basic 19 with 2,80 GHz quad core, 19\" LCD, 8 GB DDR3 RAM, 1000 GB Hard Disc, Windows 8 Pro",
								"Id": "HT-1003",
								"SubCategoryId": "Notebooks",
								"state": "Error",
								"info": "9.45 EUR",
								"infoState": "Error"
							},
							{
								"Name": "ITelO Vault",
								"Description": "Digital Organizer with State-of-the-Art Storage Encryption",
								"Id": "HT-1007",
								"SubCategoryId": "PDAs & Organizers",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 15",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1010",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 26",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1022",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							},
							{
								"Name": "Notebook Professional 27",
								"Description": "Notebook Professional 15 with 2,80 GHz quad core, 15\" Multitouch LCD, 8 GB DDR3 RAM, 500 GB SSD - DVD-Writer (DVD-R/+R/-RW/-RAM),Windows 8 Pro",
								"Id": "HT-1024",
								"SubCategoryId": "Notebooks",
								"state": "Success",
								"info": "29.45 EUR",
								"infoState": "Success"
							}
						]
					},
					"item": {
						"title": {
							"label": "Title",
							"value": "{Name}"
						},
						"description": {
							"label": "Description",
							"value": "{Description}"
						},
						"highlight": "{state}",
						"info": {
							"value": "{info}",
							"state": "{infoState}"
						}
					}
				}
			}
		};

		var oManifest_TableCard = {
			"sap.app": {
				"id": "my.card.qunit.test.TableCard"
			},
			"sap.card": {
				"type": "Table",
				"header": {
					"title": "Sales Orders for Key Accounts"
				},
				"content": {
					"data": {
						"json": [
							{
								"salesOrder": "5000010050",
								"customer": "Robert Brown Entertainment",
								"status": "Delivered",
								"statusState": "Success",
								"orderUrl": "http://www.sap.com",
								"percent": 30,
								"percentValue": "30%",
								"progressState": "Error",
								"iconSrc": "sap-icon://help"
							},
							{
								"salesOrder": "5000010051",
								"customer": "Entertainment Argentinia",
								"status": "Canceled",
								"statusState": "Error",
								"orderUrl": "http://www.sap.com",
								"percent": 70,
								"percentValue": "70 of 100",
								"progressState": "Success",
								"iconSrc": "sap-icon://help"
							},
							{
								"salesOrder": "5000010052",
								"customer": "Brazil Technologies",
								"status": "In Progress",
								"statusState": "Warning",
								"orderUrl": "http://www.sap.com",
								"percent": 55,
								"percentValue": "55GB of 100",
								"progressState": "Warning",
								"iconSrc": "sap-icon://help"
							},
							{
								"salesOrder": "5000010053",
								"customer": "Quimica Madrilenos",
								"status": "Delivered",
								"statusState": "Success",
								"orderUrl": "http://www.sap.com",
								"percent": 10,
								"percentValue": "10GB",
								"progressState": "Error",
								"iconSrc": "sap-icon://help"
							},
							{
								"salesOrder": "5000010054",
								"customer": "Development Para O Governo",
								"status": "Delivered",
								"statusState": "Success",
								"orderUrl": "http://www.sap.com",
								"percent": 100,
								"percentValue": "100%",
								"progressState": "Success",
								"iconSrc": "sap-icon://help"
							}
						]
					},
					"row": {
						"columns": [
							{
								"title": "Sales Order",
								"value": "{salesOrder}",
								"identifier": true
							},
							{
								"title": "Customer",
								"value": "{customer}"
							},
							{
								"title": "Status",
								"value": "{status}",
								"state": "{statusState}",
								"hAlign": "End"
							},
							{
								"title": "Order ID",
								"value": "{orderUrl}",
								"url": "{orderUrl}"
							},
							{
								"title": "Progress",
								"progressIndicator": {
									"percent": "{percent}",
									"text": "{percentValue}",
									"state": "{progressState}"
								}
							},
							{
								"title": "Avatar",
								"icon": {
									"src": "{iconSrc}"
								}
							},
							{
								"title": "Sales Order",
								"value": "{salesOrder}",
								"identifier": {
									"url": "{orderUrl}"
								}
							}
						]
					}
				}
			}
		};

		var oManifest_AvatarHeader = {
			"sap.app": {
				"id": "test.card.card8"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"actions": [
						{
							"type": "Navigation",
							"url": "https://www.sap.com"
						}
					],
					"title": "L3 Request list content Card",
					"subTitle": "Card subtitle",
					"icon": {
						"initials": "AJ",
						"shape": "Circle",
						"alt": "Some alternative text", // Will be ignored as its not present in the Avatar control atm.
						"color": "#FF0000" // Will be ignored as its not present in the Avatar control atm.
					},
					"status": {
						"text": "100 of 200"
					}
				}
			}
		};

		var oManifest_NumericHeader = {
			"sap.app": {
				"id": "test.card.card9"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"data": {
						"json": {
							"n": "56",
							"u": "%",
							"trend": "Up",
							"valueColor": "Good"
						}
					},
					"title": "Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation ",
					"subTitle": "Forecasted goal achievement depending on business logic and other important information Forecasted goal achievement depending on business logic and other important information",
					"unitOfMeasurement": "EUR",
					"mainIndicator": {
						"number": "{n}",
						"unit": "{u}",
						"trend": "{trend}",
						"state": "{valueColor}"
					},
					"dataTimestamp": "2021-03-18T12:00:00Z",
					"details": "Details, additional information, will directly truncate after there is no more space.Details, additional information, will directly truncate after there is no more space.",
					"sideIndicators": [
						{
							"title": "Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target",
							"number": "3252.234",
							"unit": "K"
						},
						{
							"title": "Long Deviation Long Deviation",
							"number": "22.43",
							"unit": "%"
						}
					]
				}
			}
		};

		var oManifest_NumericHeader2 = {
			"sap.app": {
				"id": "test.card.card10"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"title": "Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation ",
					"subTitle": "Forecasted goal achievement depending on business logic and other important information Forecasted goal achievement depending on business logic and other important information",
					"unitOfMeasurement": "EUR",
					"mainIndicator": {
						"number": "56",
						"unit": "%",
						"trend": "Up",
						"state": "Good"
					},
					"details": "Details, additional information, will directly truncate after there is no more space.Details, additional information, will directly truncate after there is no more space.",
					"sideIndicators": [
						{
							"title": "Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target Long Target",
							"number": "3252.234",
							"unit": "K"
						},
						{
							"title": "Long Deviation Long Deviation",
							"number": "22.43",
							"unit": "%"
						}
					]
				}
			}
		};

		var oManifest_NumericHeader_OnlyTitleAndSubtitle = {
			"sap.app": {
				"id": "test.card.card11"
			},
			"sap.card": {
				"type": "List",
				"header": {
					"type": "Numeric",
					"title": "Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation Project Cloud Transformation ",
					"subTitle": "Forecasted goal achievement depending on business logic and other important information Forecasted goal achievement depending on business logic and other important information",
					"unitOfMeasurement": "EUR"
				}
			}
		};

		var oManifest_ComponentCardAllInOne = {
			"_version": "1.12.0",
			"sap.app": {
				"id": "sap.f.cardsdemo.cardcontent.componentContent.allInOne",
				"type": "card",
				"applicationVersion": {
					"version": "1.0.0"
				}
			},
			"sap.card": {
				"type": "Component"
			}
		};

		var oManifest_CustomModels = {
			"sap.app": {
				"id": "test.card.card15"
			},
			"sap.card": {
				"type": "List",
				"data": {
					"name": "cities"
				},
				"content": {
					"data": {
						"path": "cities>/items"
					},
					"item": {
						"title": "{cities>name}"
					}
				}
			}
		};

		var oManifest_DefaultHeader_NoContent = {
			"sap.app": {
				"id": "test.card.card16",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Header Title",
					"data": {
						"request": {
							"url": "fake-url"
						}
					}
				}
			}
		};

		var oManifest_No_Data_List = {
			"sap.app": {
				"id": "test.card.NoData"
			},
			"sap.card": {
				"type": "List",
				"header": {},
				"content": {
					"item": {
						"title": ""
					}
				},
				"data": {
					"json": []
				}
			}
		};
		var oManifest_No_Data_Object = {
			"sap.app": {
				"id": "test.card.NoData"
			},
			"sap.card": {
				"type": "Object",
				"data": {
					"json": {
						"firstName": "Donna",
						"lastName": "Moore",
						"position": "Sales Executive",
						"phone": "+1 202 555 5555",
						"email": "my@mymail.com",
						"photo": "./DonnaMoore.png",
						"agendaUrl": "/agenda",
						"manager": {
						},
						"company": {
							"name": "Robert Brown Entertainment",
							"address": "481 West Street, Anytown OH 45066, USA",
							"email": "mail@mycompany.com",
							"emailSubject": "Subject",
							"website": "www.company_a.example.com",
							"url": "https://www.company_a.example.com"
						}
					}
				},
				"header": {},
				"content": {
					"hasData": "{/manager}",
					"groups": [
						{
							"title": "Contact Details",
							"items": [
								{
									"label": "First Name",
									"value": "{firstName}"
								},
								{
									"label": "Last Name",
									"value": "{lastName}"
								},
								{
									"label": "Phone",
									"value": "{phone}",
									"actions": [
										{
											"type": "Navigation",
											"parameters": {
												"url": "tel:{phone}"
											}
										}
									]
								},
								{
									"label": "Email",
									"value": "{email}",
									"actions": [
										{
											"type": "Navigation",
											"parameters": {
												"url": "mailto:{email}"
											}
										}
									]
								},
								{
									"label": "Agenda",
									"value": "Book a meeting",
									"actions": [
										{
											"type": "Navigation",
											"enabled": "{= ${agendaUrl}}",
											"parameters": {
												"url": "{agendaUrl}"
											}
										}
									]
								}
							]
						},
						{
							"title": "Company Details",
							"items": [
								{
									"label": "Company Name",
									"value": "{company/name}"
								},
								{
									"label": "Address",
									"value": "{company/address}"
								},
								{
									"label": "Email",
									"value": "{company/email}",
									"actions": [
										{
											"type": "Navigation",
											"parameters": {
												"url": "mailto:{company/email}?subject={company/emailSubject}"
											}
										}
									]
								},
								{
									"label": "Website",
									"value": "{company/website}",
									"actions": [
										{
											"type": "Navigation",
											"parameters": {
												"url": "{company/url}"
											}
										}
									]
								}
							]
						},
						{
							"title": "Organizational Details",
							"items": [
								{
									"label": "Direct Manager",
									"value": "{manager/firstName} {manager/lastName}",
									"icon": {
										"src": "{manager/photo}"
									}
								}
							]
						}
					]
				}
			}
		};
		var oManifest_No_Data_Table = {
			"sap.app": {
				"id": "test.card.NoData"
			},
			"sap.card": {
				"type": "Table",
				"header": {},
				"content": {
					"row": {
						"columns": [{
							"title": "Sales Order",
							"value": "{salesOrder}",
							"identifier": true
						},
							{
								"title": "Customer",
								"value": "{customerName}"
							},
							{
								"title": "Net Amount",
								"value": "{netAmount}",
								"hAlign": "End"
							},
							{
								"title": "Status",
								"value": "{status}",
								"state": "{statusState}"
							},
							{
								"title": "Delivery Progress",
								"progressIndicator": {
									"percent": "{deliveryProgress}",
									"text": "{= format.percent(${deliveryProgress} / 100)}",
									"state": "{statusState}"
								}
							}
						]
					}
				},
				"data": {
					json: []
				}
			}
		};

		function testContentInitialization(oManifest, assert) {

			// Arrange
			var done = assert.async();

			var oCard = new Card("somecard", {
				manifest: oManifest,
				width: "400px",
				height: "600px"
			});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			// Assert
			assert.notOk(oCard.getAggregation("_header"), "Card header should be empty.");
			assert.notOk(oCard.getAggregation("_content"), "Card content should be empty.");
			assert.ok(oCard.getDomRef(), "Card should be rendered.");
			assert.equal(oCard.getDomRef().clientWidth, 398, "Card should have width set to 398px.");
			assert.equal(oCard.getDomRef().clientHeight, 598, "Card should have height set to 598px.");

			oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.ok(oCard.getAggregation("_header").getDomRef(), "Card header should be rendered.");
				assert.ok(oCard.getAggregation("_content").getDomRef(), "Card content should be rendered.");

				// Cleanup
				oCard.destroy();
				done();
			});
		}

		function testComponentContentCreation(oCardManifest, oExpectedComponentManifest, assert) {
			// Arrange
			var done = assert.async(),
				oStub = sinon.stub(ComponentContainer.prototype, "applySettings"),
				oCard = new Card(),
				oStubEvent = new Event("componentCreated", this, {
					component: new UIComponent()
				});

			assert.expect(1);
			oStub.callsFake(function (mSettings) {
				assert.deepEqual(
					mSettings.manifest,
					oExpectedComponentManifest,
					"A ComponentContainer is created with expected settings"
				);

				mSettings.componentCreated(oStubEvent);

				oStub.restore();
				oCard.destroy();
				done();
			});

			// Act
			oCard.setManifest(oCardManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		}

		QUnit.module("Init");

		QUnit.test("Initialization - ListContent", function (assert) {
			testContentInitialization(oManifest_ListCard, assert);
		});

		QUnit.test("Initialization - TableContent", function (assert) {
			testContentInitialization(oManifest_TableCard, assert);
		});

		QUnit.test("Empty header", function (assert) {
			var done = assert.async();

			var oCard = new Card("somecard", {
				manifest: oManifest_ListCard_NoHeader,
				width: "400px",
				height: "600px"
			});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				setTimeout(function () {
					assert.notOk(oCard.getAggregation("_header"), "Card header should not be created.");

					// Cleanup
					oCard.destroy();
					done();
				}, 300);
			});
		});

		QUnit.test("Rendered classes", function (assert) {
			// Arrange
			var oCard = new Card();

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			// Assert
			assert.ok(oCard.$().hasClass("sapUiIntCard"), "Class is added to the root div");

			// Clean up
			oCard.destroy();
		});

		QUnit.test("Register module path", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = new Card({
					manifest: oManifest_ListCard
				}),
				fnRegisterSpy = sinon.spy(LoaderExtensions, "registerResourcePath");

			oCard.attachEventOnce("_ready", function () {
				// Assert
				assert.ok(fnRegisterSpy.called, "LoaderExtensions.registerResourcePath is called.");
				assert.ok(fnRegisterSpy.calledWith("my/card/qunit/test/ListCard", "resources/my/card/qunit/test/ListCard/"), "LoaderExtensions.registerResourcePath is called with correct params.");

				// Clean up
				oCard.destroy();
				fnRegisterSpy.restore();
				done();
			});

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Default model is not propagated", function (assert) {
			// Arrange
			var oContainer = new HBox({
					items: [
						new Card({
							manifest: oManifest_ListCard
						})
					]
				}),
				oModel = new JSONModel({"test": "propagated value"}),
				oCard;

			oContainer.setModel(oModel);

			oCard = oContainer.getItems()[0];

			// Act
			oContainer.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			// Assert
			assert.strictEqual(oCard.getModel().getProperty("/test"), undefined, "Default model is not propagated to the card.");

			// Clean up
			oContainer.destroy();
			oModel.destroy();
		});

		QUnit.test("Severe errors are logged", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = new Card();

			oCard.attachEvent("_ready", function () {
				var aErrors = oCard.getSevereErrors();

				// Assert
				assert.ok(aErrors.length, "Error that the section 'sap.card' is missing is logged.");

				// Clean up
				oCard.destroy();

				done();
			});

			// Act
			oCard.setManifest({});
			oCard.startManifestProcessing();
		});

		QUnit.module("Clone");

		QUnit.test("Cloned card has its own models", function (assert) {
			var done = assert.async();

			var oCard = new Card("somecard", {
					manifest: oManifest_ListCard_NoHeader
				}),
				oClonedCard = oCard.clone();

			// Act
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oClonedCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			oClonedCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var aModels = ["parameters", "filters", "paginator", "form", "context"];

				assert.ok(oCard.getModel(), "Default model exists in original card.");
				assert.ok(oClonedCard.getModel(), "Default model exists in cloned card.");
				assert.notStrictEqual(oCard.getModel(), oClonedCard.getModel(), "Default model is unique per card.");

				aModels.forEach(function (sModelName) {
					assert.ok(oCard.getModel(sModelName), "Model '" + sModelName + "' exists in original card.");
					assert.ok(oClonedCard.getModel(sModelName), "Model '" + sModelName + "' exists in cloned card.");
					assert.notStrictEqual(oCard.getModel(sModelName), oClonedCard.getModel(sModelName), "Model '" + sModelName + "' is unique per card.");
				});

				oCard.destroy();
				oClonedCard.destroy();

				done();
			});
		});

		QUnit.module("Methods", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("setManifest - correct and incorrect", function (assert) {

			var done = assert.async(),
				oManifest_WrongType = deepExtend({}, oManifest_ListCard);

			oManifest_WrongType["sap.card"].type = "Wrong";

			// Arrange
			this.oCard.attachEventOnce("_ready", function () {

				// Arrange
				this.oCard.attachEventOnce("_ready", function () {

					// Arrange
					this.oCard.attachEventOnce("_ready", function () {

						// Assert
						assert.ok(true, "Exception is not thrown");

						done();
					});

					this.oCard.setManifest(oManifest_ListCard);

				}.bind(this));

				this.oCard.setManifest(oManifest_WrongType);

			}.bind(this));

			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("setManifest - to undefined and then set again", function (assert) {
			var done = assert.async(),
				oCard = this.oCard;

			oCard.attachEventOnce("_ready", function () {
				// Act - set manifest to undefined
				oCard.setManifest(undefined);
				Core.applyChanges();

				oCard.attachEventOnce("_ready", function () {
					assert.ok(true, "Manifest can be set correctly second time after it was set to undefined.");
					done();
				});

				// Act - set correct manifest
				oCard.setManifest(oManifest_ListCard);
				Core.applyChanges();
			});

			oCard.setManifest(oManifest_ListCard);
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("createManifest called twice", function (assert) {
			var done = assert.async(),
				oStub = sinon.stub(this.oCard, "_setCardContent").callsFake(function () {
					assert.ok("_setCardContent is called only once and error is not thrown.");

					oStub.restore();

					done();
				});

			this.oCard.createManifest(oManifest_ListCard);

			this.oCard._destroyManifest();
			this.oCard.createManifest(oManifest_ListCard);
		});

		QUnit.test("setManifest with and without translated texts", function (assert) {

			var done = assert.async(),
				oLoadI18nSpy = sinon.spy(CoreManifest.prototype, "_loadI18n");

			// Arrange
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				// Assert
				assert.ok(oLoadI18nSpy.notCalled, "translation file is not fetched");

				// Arrange
				this.oCard.attachEventOnce("_ready", function () {

					Core.applyChanges();

					// Assert
					assert.ok(oLoadI18nSpy.called, "translation file is fetched");

					// Clean up
					oLoadI18nSpy.restore();
					done();
				});

				this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslations/manifest.json");

			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Manifest works if it has very deep structure", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard,
				oManifest = {
					"sap.app": {
						"id": "test.card.deepStructure"
					},
					"sap.card": {
						"type": "List",
						"data": {

						}
					}
				},
				iDepth,
				oCurrentLevel = oManifest["sap.card"].data;

			for (iDepth = 0; iDepth < 200; iDepth++) {
				oCurrentLevel.depthTest = {
					level: iDepth
				};

				oCurrentLevel = oCurrentLevel.depthTest;
			}

			oCard.attachManifestReady(function () {
				// Assert
				assert.ok(true, "Manifest is set, there is no error.");
				done();
			});

			// Act
			oCard.setManifest(oManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("getManifestRawJson", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard,
				oManifest = oManifest_ListCard;

			oCard.attachManifestReady(function () {
				// Assert
				assert.deepEqual(oCard.getManifestRawJson(), oManifest, "Method getManifestRawJson returns the original raw json.");
				done();
			});

			// Act
			oCard.setManifest(oManifest);
			oCard.setManifestChanges([
				{ content: { header: { title: "Changed title" } } }
			]);
			oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("getDataProviderFactory", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard;

			oCard.attachManifestApplied(function () {
				var oDataProviderFactory = oCard.getDataProviderFactory();

				// Assert
				assert.ok(oDataProviderFactory, "Method getDataProviderFactory returns the factory.");
				assert.ok(oDataProviderFactory instanceof DataProviderFactory, "The result is of type sap.ui.integration.util.DataProviderFactory.");
				done();
			});

			// Act
			oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("getRuntimeUrl", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard,
				oManifest = {
					"sap.app": {
						"id": "sample.card"
					}
				},
				mSamples = new Map([
					["", "resources/sample/card/"],

					["//some.json", "//some.json"],

					["./", "resources/sample/card/./"],
					["./images/Avatar.png", "resources/sample/card/./images/Avatar.png"],

					["/", "resources/sample/card/"],
					["/some.json", "resources/sample/card/some.json"],

					["http://sap.com", "http://sap.com"],
					["https://sap.com", "https://sap.com"],

					["../some.json", "resources/sample/card/../some.json"],
					["some.json", "resources/sample/card/some.json"]
				]);

			oCard.attachManifestReady(function () {
				// Assert
				mSamples.forEach(function (sExpectedResult, sUrl) {
					var sResult = oCard.getRuntimeUrl(sUrl);

					assert.strictEqual(sResult, sExpectedResult, "Result is correct for '" + sUrl + "'.");
				});
				done();
			});

			// Act
			oCard.setManifest(oManifest);
			oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("showMessage", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("showMessage called on a card without manifest", function (assert) {
			// Arrange
			var oLogSpy = this.spy(Log, "error");

			// Act
			this.oCard.showMessage();

			// Assert
			assert.ok(oLogSpy.calledWith("'showMessage' cannot be used before the card instance is ready. Consider using the event 'manifestApplied' event."), "Error should be logged in the console");
		});

		QUnit.test("showMessage delegates the call to BaseContent once created", function (assert) {
			var done = assert.async();
			this.stub(BaseContent.prototype, "showMessage")
				.callsFake(function () {
					// Assert
					assert.ok(true, "showMessage of the content should be called");
					done();
				});

			this.oCard.attachManifestApplied(function () {
				// Act
				this.oCard.showMessage();
			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
		});

		QUnit.test("showMessage creates and adds the message to the DOM", function (assert) {
			var done = assert.async();
			var showMessageStub = this.stub(BaseContent.prototype, "showMessage");

			showMessageStub.callsFake(function () {
				Core.applyChanges();
				var oContent = this.oCard.getCardContent();
				showMessageStub.wrappedMethod.apply(oContent, arguments); // call the original method
				Core.applyChanges();

				var oMessageContainer = oContent.getAggregation("_messageContainer");
				// Assert
				assert.ok(oMessageContainer.isA("sap.m.VBox"), "Message container should be created and added aggregated");
				assert.ok(oMessageContainer.getItems()[0].isA("sap.m.MessageStrip"), "_messageContainer has 1 message");
				assert.ok(oMessageContainer.getDomRef(), "Message container is added to the DOM");

				done();
			}.bind(this));

			this.oCard.attachManifestApplied(function () {
				// Act
				this.oCard.showMessage();
			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
		});

		QUnit.test("Message container is destroyed when the message is closed", function (assert) {
			var done = assert.async();
			var showMessageStub = this.stub(BaseContent.prototype, "showMessage");

			showMessageStub.callsFake(function () {
				Core.applyChanges();
				var oContent = this.oCard.getCardContent();
				showMessageStub.wrappedMethod.apply(oContent, arguments); // call the original method
				var oMessageContainer = oContent.getAggregation("_messageContainer");
				var oMessageContainerDestroySpy = this.spy(oMessageContainer, "destroy");

				// Act
				oMessageContainer.getItems()[0].fireClose();

				// Assert
				assert.ok(oMessageContainerDestroySpy.called, "Message container should be destroyed");

				done();
			}.bind(this));

			this.oCard.attachManifestApplied(function () {
				// Act
				this.oCard.showMessage();
			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
		});

		QUnit.test("Multiple calls to showMessage - previous messages are destroyed", function (assert) {
			var done = assert.async();
			var showMessageStub = this.stub(BaseContent.prototype, "showMessage");
			var oMessageStripDestroySpy = this.spy(MessageStrip.prototype, "destroy");

			showMessageStub
				.callThrough() // call the original function on 1st and 2nd calls
				.onThirdCall().callsFake(function () {
					Core.applyChanges();
					var oContent = this.oCard.getCardContent();
					showMessageStub.wrappedMethod.apply(oContent, arguments); // call the original method
					var oMessageContainer = oContent.getAggregation("_messageContainer");
					var oMessage = oMessageContainer.getItems()[0];

					assert.strictEqual(oMessageStripDestroySpy.callCount, 2, "The previous messages should be destroyed");
					assert.strictEqual(oMessageContainer.getItems().length, 1, "There is only 1 message");
					assert.strictEqual(oMessage.getType(), "Success", "The last given message type is used");
					assert.strictEqual(oMessage.getText(), "Last message", "The last given message is used");
					done();
				}.bind(this));

			this.oCard.attachManifestApplied(function () {
				// Act
				this.oCard.showMessage();
				this.oCard.showMessage();
				this.oCard.showMessage("Last message", MessageType.Success);
			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
		});

		QUnit.test("showMessage text containing expression binding with card formatters", function (assert) {
			var done = assert.async();
			var showMessageStub = this.stub(BaseContent.prototype, "showMessage");

			showMessageStub.callsFake(function () {
				Core.applyChanges();
				var oContent = this.oCard.getCardContent();
				showMessageStub.wrappedMethod.apply(oContent, arguments); // call the original method
				var oMessageContainer = oContent.getAggregation("_messageContainer");
				var oMessage = oMessageContainer.getItems()[0];

				assert.strictEqual(oMessage.getText(), "My inserted text", "Card formatters should be available inside showMessage");
				done();
			}.bind(this));

			this.oCard.attachManifestApplied(function () {
				// Act
				this.oCard.showMessage("{= format.text('My {0} text', ['inserted'])}", MessageType.Error);
			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
		});

		QUnit.module("Default Header", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Default Header initialization", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				// Assert
				var oHeader = this.oCard.getAggregation("_header");
				assert.ok(oHeader, "Card should have header.");
				assert.ok(oHeader.getDomRef(), "Card header should be created and rendered.");
				assert.ok(oHeader.getAggregation("_title") && oHeader.getAggregation("_title").getDomRef(), "Card header title should be created and rendered.");
				assert.ok(oHeader.getAggregation("_subtitle") && oHeader.getAggregation("_subtitle").getDomRef(), "Card header subtitle should be created and rendered.");
				assert.ok(oHeader.getAggregation("_avatar") && oHeader.getAggregation("_avatar").getDomRef(), "Card header avatar should be created and rendered.");
				assert.ok(oHeader.getAggregation("_dataTimestamp") && oHeader.getAggregation("_dataTimestamp").getDomRef(), "Card header dataTimestamp should be created and rendered.");


				assert.equal(oHeader.getAggregation("_title").getText(), oManifest_Header["sap.card"].header.title, "Card header title should be correct.");
				assert.equal(oHeader.getAggregation("_subtitle").getText(), oManifest_Header["sap.card"].header.subTitle, "Card header subtitle should be correct.");
				assert.equal(oHeader.getAggregation("_avatar").getSrc(), oManifest_Header["sap.card"].header.icon.src, "Card header icon src should be correct.");
				assert.equal(oHeader.getStatusText(), oManifest_Header["sap.card"].header.status.text, "Card header status should be correct.");
				assert.equal(oHeader.getDataTimestamp(), oManifest_Header["sap.card"].header.dataTimestamp, "Card header dataTimestamp should be correct.");

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_Header);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			// Assert
			assert.notOk(this.oCard.getAggregation("_header"), "Card header should be empty.");
			assert.notOk(this.oCard.getAggregation("_content"), "Card content should be empty.");
		});

		QUnit.test("Default Header Avatar", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				// Assert
				var oHeader = this.oCard.getAggregation("_header");
				assert.notOk(oHeader.getAggregation("_avatar").getSrc(), "Card header icon src should be empty.");
				assert.equal(oHeader.getAggregation("_avatar").getDisplayShape(), "Circle", "Card header icon shape should be 'Circle'.");
				assert.equal(oHeader.getAggregation("_avatar").getInitials(), "AJ", "Card header initials should be 'AJ'.");

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_AvatarHeader);
		});

		QUnit.test("Default Header Avatar initials with deprecated 'text' property", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				var oHeader = this.oCard.getAggregation("_header");
				assert.equal(oHeader.getAggregation("_avatar").getInitials(), "AJ", "Card header initials should be correctly set with deprecated 'text' property.");

				done();
			}.bind(this));

			// Act
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.cardDeprecatedInitialsTextProperty"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"icon": {
							"text": "AJ"
						}
					}
				}
			});
		});

		QUnit.test("'backgroundColor' when there is icon src", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oAvatar = this.oCard.getAggregation("_header").getAggregation("_avatar");

				// Assert
				assert.strictEqual(oAvatar.getBackgroundColor(), AvatarColor.Transparent, "Background should be 'Transparent' when there is only icon.");

				done();
			}.bind(this));

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.backgroundColorWithIconSrc"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"icon": {
							"src": "sap-icon://accept"
						}
					}
				}
			});
		});

		QUnit.test("'backgroundColor' when there are initials", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oAvatar = this.oCard.getAggregation("_header").getAggregation("_avatar"),
					sExpected = oAvatar.getMetadata().getPropertyDefaults().backgroundColor;

				// Assert
				assert.strictEqual(oAvatar.getBackgroundColor(), sExpected, "Background should be default value when there are initials.");

				done();
			}.bind(this));

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.backgroundColorWithInitials"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"icon": {
							"initials": "SI"
						}
					}
				}
			});
		});

		QUnit.test("'statusText' set with binding", function (assert) {
			// Arrange
			var done = assert.async(),
				oManifest = {
					"sap.app": {
						"id": "my.card.test"
					},
					"sap.card": {
						"type": "List",
						"header": {
							"data": {
								"json": {
									"statusText": "2 of 10"
								}
							},
							"status": {
								"text": "{/statusText}"
							}
						}
					}
				};

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oHeader = this.oCard.getCardHeader();

				// Assert
				assert.strictEqual(oHeader.getStatusText(), oManifest["sap.card"].header.data.json.statusText, "Status text binding should be resolved.");

				done();
			}.bind(this));

			this.oCard.setManifest(oManifest);
		});

		QUnit.test("hidden header", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.notOk(this.oCard.getCardHeader().getVisible(), "Card Header is hidden.");

				done();
			}.bind(this));

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.hiddenHeader"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"visible": false,
						"title": "Card title"
					}
				}
			});
		});

		QUnit.test("hidden header with binding", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.notOk(this.oCard.getCardHeader().getVisible(), "Card Header is hidden.");

				done();
			}.bind(this));

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.hiddenHeader"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": {
							"headerVisible": false
						}
					},
					"header": {
						"visible": "{/headerVisible}",
						"title": "Card title"
					}
				}
			});
		});

		QUnit.test("header icon when visible property is set to false", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.notOk(this.oCard.getCardHeader().getIconVisible(), "Card Header icon is hidden.");

				done();
			}.bind(this));

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.hiddenHeader"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"data": {
							"json": {
								"iconVisible": false
							}
						},
						"title": "Card title",
						"icon": {
							"src": "",
							"visible": "{iconVisible}",
							"shape": "Circle"
						}
					}
				}
			});
		});


		QUnit.test("header icon when visible property is not set", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.ok(this.oCard.getCardHeader().getIconVisible(), "Card Header icon is not hidden.");

				done();
			}.bind(this));

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.hiddenHeader"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Card title",
						"icon": {
							"src": "",
							"shape": "Circle"
						}
					}
				}
			});
		});


		QUnit.test("hidden header icon if visible property is set to true", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.ok(this.oCard.getCardHeader().getIconVisible(), "Card Header icon is not hidden.");

				done();
			}.bind(this));

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.hiddenHeader"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"data": {
							"json": {
								"iconVisible": true
							}
						},
						"title": "Card title",
						"icon": {
							"src": "",
							"visible": "{iconVisible}",
							"shape": "Circle"
						}
					}
				}
			});
		});

		QUnit.module("Numeric Header", {
			beforeEach: function () {
				this.oCard = new Card("somecard", {
					width: "400px",
					height: "600px"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("'statusText' set with binding", function (assert) {
			// Arrange
			var done = assert.async(),
				oManifest = {
					"sap.app": {
						"id": "my.card.test"
					},
					"sap.card": {
						"type": "List",
						"header": {
							"type": "Numeric",
							"data": {
								"json": {
									"statusText": "2 of 10"
								}
							},
							"status": {
								"text": "{/statusText}"
							}
						}
					}
				};

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oHeader = this.oCard.getCardHeader();

				// Assert
				assert.strictEqual(oHeader.getStatusText(),  oManifest["sap.card"].header.data.json.statusText, "Status text binding should be resolved.");

				done();
			}.bind(this));

			this.oCard.setManifest(oManifest);
		});

		QUnit.test("Numeric Header generic", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				// Assert
				var oHeader = this.oCard.getAggregation("_header");
				assert.ok(oHeader.getDomRef(), "Card Numeric header should be rendered.");

				// Assert properties
				assert.equal(oHeader.getAggregation("_title").getText(), oManifest_NumericHeader["sap.card"].header.title, "Card header title should be correct.");
				assert.equal(oHeader.getAggregation("_subtitle").getText(), oManifest_NumericHeader["sap.card"].header.subTitle, "Card header subtitle should be correct.");
				assert.equal(oHeader.getAggregation("_unitOfMeasurement").getText(), oManifest_NumericHeader["sap.card"].header.unitOfMeasurement, "Card header unitOfMeasurement should be correct.");
				assert.equal(oHeader.getAggregation("_details").getText(), oManifest_NumericHeader["sap.card"].header.details, "Card header details should be correct.");
				assert.equal(oHeader.getDataTimestamp(), oManifest_NumericHeader["sap.card"].header.dataTimestamp, "Card header dataTimestamp should be correct.");

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_NumericHeader);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Numeric Header main indicator with json data", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oHeader = this.oCard.getAggregation("_header"),
					oMainIndicator = oHeader.getAggregation("_numericIndicators").getAggregation("_mainIndicator");

				// Assert aggregation mainIndicator
				assert.ok(oMainIndicator.getDomRef(), "Card header main indicator aggregation should be set and rendered");
				assert.equal(oMainIndicator.getValue(), oManifest_NumericHeader["sap.card"].header.data.json["n"], "Card header main indicator value should be correct.");
				assert.equal(oMainIndicator.getScale(), oManifest_NumericHeader["sap.card"].header.data.json["u"], "Card header main indicator scale should be correct.");
				assert.equal(oMainIndicator.getIndicator(), oManifest_NumericHeader["sap.card"].header.data.json["trend"], "Card header main indicator indicator should be correct.");
				assert.equal(oMainIndicator.getValueColor(), oManifest_NumericHeader["sap.card"].header.data.json["valueColor"], "Card header main indicator valueColor should be correct.");

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_NumericHeader);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Numeric Header main indicator without 'data'", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oHeader = this.oCard.getAggregation("_header"),
					oMainIndicator = oHeader.getAggregation("_numericIndicators").getAggregation("_mainIndicator");

				// Assert aggregation _mainIndicator
				assert.ok(oMainIndicator.getDomRef(), "Card header main indicator aggregation should be set and rendered");
				assert.equal(oMainIndicator.getValue(), oManifest_NumericHeader2["sap.card"].header.mainIndicator.number, "Card header main indicator value should be correct.");
				assert.equal(oMainIndicator.getScale(), oManifest_NumericHeader2["sap.card"].header.mainIndicator.unit, "Card header main indicator scale should be correct.");
				assert.equal(oMainIndicator.getIndicator(), oManifest_NumericHeader2["sap.card"].header.mainIndicator.trend, "Card header main indicator indicator should be correct.");
				assert.equal(oMainIndicator.getValueColor(), oManifest_NumericHeader2["sap.card"].header.mainIndicator.state, "Card header main indicator valueColor should be correct.");

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_NumericHeader2);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Numeric Header side indicators", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oHeader = this.oCard.getAggregation("_header");

				// Assert aggregation sideIndicators
				assert.ok(oHeader.getAggregation("sideIndicators"), "Card header side indicators should be set.");
				assert.equal(oHeader.getAggregation("sideIndicators").length, oManifest_NumericHeader["sap.card"].header.sideIndicators.length, "Card header should have two side indicators.");

				oHeader.getAggregation("sideIndicators").forEach(function (oIndicator, iIndex) {
					var oSideIndicator = oManifest_NumericHeader["sap.card"].header.sideIndicators[iIndex];
					assert.ok(oIndicator.getDomRef(), "Card header sideIndicators one should be rendered.");
					assert.equal(oIndicator.getTitle(), oSideIndicator.title, "Card header side indicator " + iIndex + " title should be correct.");
					assert.equal(oIndicator.getNumber(), oSideIndicator.number, "Card header side indicator " + iIndex + " number should be correct.");
					assert.equal(oIndicator.getUnit(), oSideIndicator.unit, "Card header side indicator " + iIndex + " unit should be correct.");
				});

				done();
			}.bind(this));
			this.oCard.setManifest(oManifest_NumericHeader);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Numeric Header with no Details and no Indicators (Main and Side)", function (assert) {

			// Arrange
			var done = assert.async();

			// Act
			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.equal(document.getElementsByClassName("sapFCardHeaderDetails").length, 0, "Card header Details are not rendered.");
				assert.equal(document.getElementsByClassName("sapFCardNumericIndicators").length, 0, "Card header Indicators are not rendered.");
				assert.equal(document.getElementsByClassName("sapFCardNumericIndicatorsMain").length, 0, "Card header Main Indicator is not rendered.");
				assert.equal(document.getElementsByClassName("sapFCardNumericIndicatorsSide").length, 0, "Card header Side Indicator is not rendered.");

				done();
			});
			this.oCard.setManifest(oManifest_NumericHeader_OnlyTitleAndSubtitle);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("hidden header", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.notOk(this.oCard.getCardHeader().getVisible(), "Card Header is hidden.");

				done();
			}.bind(this));

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.hiddenHeader"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"type": "Numeric",
						"visible": false,
						"title": "Card title"
					}
				}
			});
		});

		QUnit.test("hidden header with binding", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.notOk(this.oCard.getCardHeader().getVisible(), "Card Header is hidden.");

				done();
			}.bind(this));

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.hiddenHeader"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": {
							"headerVisible": false
						}
					},
					"header": {
						"type": "Numeric",
						"visible": "{/headerVisible}",
						"title": "Card title"
					}
				}
			});
		});

		QUnit.module("Footer", {
			beforeEach: function () {
				this.oCard = new Card("somecard", {
					width: "400px",
					height: "600px"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("hidden footer", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.notOk(this.oCard.getCardFooter().getVisible(), "Card Footer is hidden.");

				done();
			}.bind(this));

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.hiddenHeader"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Card title"
					},
					"footer": {
						"visible": false
					}
				}
			});
		});

		QUnit.test("hidden footer with binding", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.notOk(this.oCard.getCardFooter().getVisible(), "Card Footer is hidden.");

				done();
			}.bind(this));

			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.hiddenHeader"
				},
				"sap.card": {
					"type": "List",
					"data": {
						"json": {
							"footerVisible": false
						}
					},
					"header": {
						"title": "Card title"
					},
					"footer": {
						"visible": "{/footerVisible}"
					}
				}
			});
		});

		QUnit.module("Card Accessibility", {
			beforeEach: function () {
				this.oRb = Core.getLibraryResourceBundle("sap.f");
				this.oCard = new Card("somecard", {
					width: "400px",
					height: "600px"
				});
				this.oNumericHeaderCard = new Card("numericCard", {
					width: "400px",
					height: "600px"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				this.oNumericHeaderCard.placeAt(DOM_RENDER_LOCATION);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oNumericHeaderCard.destroy();
				this.oNumericHeaderCard = null;
				this.oRb = null;
				Core.applyChanges();
			}
		});

		QUnit.test("Generic", function (assert) {

			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				// Assert
				var oCardDomRef = this.oCard.getDomRef(),
					oHeader = this.oCard.getAggregation("_header"),
					oHeaderDomRef = oHeader.getDomRef(),
					oHeaderFocusDomRef = oHeader.getDomRef("focusable"),
					oHeaderTitleDomRef = oHeaderDomRef.querySelector(".sapFCardTitle"),
					oContentDomRef = document.getElementsByClassName("sapFCardContent")[0],
					sAriaLabelledByIds = this.oCard._ariaText.getId() + " " + oHeader._getTitle().getId() + " " + oHeader._getSubtitle().getId() + " " + oHeader.getId() + "-status" + " " + oHeader.getId() + "-ariaAvatarText";

				// Assert Card Container
				assert.strictEqual(oCardDomRef.getAttribute("role"), "region", "Card container should have a role - region");
				assert.strictEqual(oCardDomRef.getAttribute("aria-labelledby"), this.oCard._getAriaLabelledIds(), "Card container should have aria-lebelledby - pointing to the static text '[Type of Card] Card' id and title id");

				// Assert Card Header
				assert.strictEqual(oHeaderDomRef.getAttribute("role"), "group", "Card header should have a role - group");
				assert.strictEqual(oHeaderDomRef.getAttribute("aria-roledescription"), this.oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER"), "Card header should have aria-roledescription - Card Header");

				// Assert Card Header's focusable element
				assert.strictEqual(oHeaderFocusDomRef.getAttribute("aria-labelledby"), sAriaLabelledByIds, "Card header's focusable element should have aria-lebelledby - pointing to an element describing the card type, title, subtitle, status text and avatar ids if there is one");
				assert.strictEqual(oHeaderFocusDomRef.getAttribute("tabindex"), "0", "Card header's focusable element should have tabindex=0");

				// Assert Card Header Title
				assert.strictEqual(oHeaderTitleDomRef.getAttribute("role"), "heading", "Card header Title should have a role - heading");
				assert.strictEqual(oHeaderTitleDomRef.getAttribute("aria-level"), "3", "Card header Title should have a aria-level - 3");

				// Assert Card Content
				assert.strictEqual(oContentDomRef.getAttribute("role"), "group", "Card content should have a role - group");
				assert.strictEqual(oContentDomRef.getAttribute("aria-labelledby"), this.oCard.getId() + "-ariaContentText", "Card container should have aria-labelledby with the correct id");
				assert.strictEqual(this.oCard.getDomRef("ariaContentText").innerText, this.oRb.getText("ARIA_LABEL_CARD_CONTENT"), "ARIA content hidden text should have the correct value");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Generic Interactive", function (assert) {

			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {

				Core.applyChanges();

				// Assert
				var oHeader = this.oCard.getAggregation("_header"),
					oHeaderDomRef = oHeader.getDomRef(),
					oHeaderFocusDomRef = oHeader.getDomRef("focusable"),
					sAriaLabelledByIds = this.oCard._ariaText.getId() + " " + oHeader._getTitle().getId() + " " + oHeader._getSubtitle().getId() + " " + oHeader.getId() + "-status" + " " + oHeader.getId() + "-ariaAvatarText";

				// Assert Card Header
				assert.strictEqual(oHeaderDomRef.getAttribute("role"), "group", "Card header should have a role - group");
				assert.strictEqual(oHeaderDomRef.getAttribute("aria-roledescription"), this.oRb.getText("ARIA_ROLEDESCRIPTION_INTERACTIVE_CARD_HEADER"), "Card header should have aria-roledescription - Card Header");
				assert.strictEqual(oHeaderFocusDomRef.getAttribute("aria-labelledby"), sAriaLabelledByIds, "Card header's focusable element should have aria-lebelledby - pointing to an element describing the card type, title, subtitle, status text and avatar ids if there is one");
				assert.strictEqual(oHeaderFocusDomRef.getAttribute("tabindex"), "0", "Card header's focusable element should have tabindex=0");
				assert.strictEqual(oHeaderFocusDomRef.getAttribute("role"), "button", "Card header's focusable element should have role=button");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_AvatarHeader);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Numeric Header", function (assert) {

			// Arrange
			var done = assert.async();

			this.oNumericHeaderCard.attachEvent("_ready", function () {
				var oHeader = this.oNumericHeaderCard.getAggregation("_header");
				oHeader.setStatusText("3 of 5");

				Core.applyChanges();

				var oHeaderDomRef = oHeader.getDomRef(),
					oHeaderFocusDomRef = oHeader.getDomRef("focusable"),
					sAriaLabelledByIds = this.oNumericHeaderCard._ariaText.getId() + " " +
										oHeader._getTitle().getId() + " " +
										oHeader._getSubtitle().getId() + " " +
										oHeader.getId() + "-status" + " " +
										oHeader._getUnitOfMeasurement().getId() + " " +
										oHeader.getAggregation("_numericIndicators").getAggregation("_mainIndicator").getId() + " " +
										oHeader._getSideIndicatorIds() + " " +
										oHeader._getDetails().getId();

				assert.strictEqual(oHeaderDomRef.getAttribute("role"), "group", "Card header should have a role - group");
				assert.strictEqual(oHeaderDomRef.getAttribute("aria-roledescription"), this.oRb.getText("ARIA_ROLEDESCRIPTION_CARD_HEADER"), "Card header should have aria-roledescription - Card Header");

				assert.strictEqual(oHeaderFocusDomRef.getAttribute("aria-labelledby"), sAriaLabelledByIds, "Card header's focusable element should have aria-lebelledby - pointing to an element describing the card type, title, subtitle, status text and avatar ids if there is one");
				assert.strictEqual(oHeaderFocusDomRef.getAttribute("tabindex"), "0", "Card header should have tabindex=0");
				done();
			}.bind(this));

			// Act
			this.oNumericHeaderCard.setManifest(oManifest_NumericHeader);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Error handling", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oRb = Core.getLibraryResourceBundle("sap.ui.integration");
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oRb = null;
			}
		});

		QUnit.test("Handler call", function (assert) {
			// Arrange
			var oLogSpy = sinon.spy(Log, "error"),
				sLogMessage = "Log this error in the console.";

			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			// Act
			this.oCard._handleError(sLogMessage);

			// Assert
			assert.ok(oLogSpy.calledOnceWith(sLogMessage), "Provided message should be logged to the console.");

			// Clean up
			oLogSpy.restore();
		});

		QUnit.test("IllustratedMessage should be set by developer", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {
					Core.applyChanges();
					var oErrorConfiguration = {
						"noData": {
							"type": "NoEntries",
							"title": "No new products",
							"description": "Please review later",
							"size": "Auto"
						}
					};
					var oFlexBox = this.oCard._getIllustratedMessage(oErrorConfiguration, true),
						oIllustratedMessage = oFlexBox.getItems()[0];

					// Assert
					assert.strictEqual(oIllustratedMessage.getIllustrationType(), IllustratedMessageType.NoEntries, "The message type set by developer is correct");
					assert.strictEqual(oIllustratedMessage.getIllustrationSize(), IllustratedMessageSize.Auto, "The message size set by developer is correct");
					assert.strictEqual(oIllustratedMessage.getTitle(), "No new products", "The message title set by developer is correct");
					assert.strictEqual(oIllustratedMessage.getDescription(), "Please review later", "The message description set by developer is correct");

					// Clean up
					done();
			}.bind(this));
			// Act
			this.oCard.setManifest(oManifest_No_Data_List);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("IllustratedMessage should be used for no data case in List Card", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {
				Core.applyChanges();
				var oFlexBox = this.oCard._getIllustratedMessage(),
					oIllustratedMessage = oFlexBox.getItems()[0];
				// Assert
				assert.strictEqual(oIllustratedMessage.getIllustrationType(), IllustratedMessageType.UnableToLoad, "Default message type is used for list");

				// Clean up
				done();
			}.bind(this));
			// Act
			this.oCard.setManifest(oManifest_No_Data_List);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("IllustratedMessage should be used for error in no data scenario - List Card", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {
				Core.applyChanges();
				var oFlexBox = this.oCard._getIllustratedMessage(undefined, true),
					oIllustratedMessage = oFlexBox.getItems()[0];
				// Assert
				assert.strictEqual(oIllustratedMessage.getIllustrationType(), IllustratedMessageType.NoData, "Illustrated message type should be no data for List Card");
				assert.strictEqual(this.oCard.getCardContent().getItems()[0].getTitle(), this.oRb.getText("CARD_NO_ITEMS_ERROR_LISTS"), "Correct message is displayed");

				// Clean up
				done();
			}.bind(this));
			// Act
			this.oCard.setManifest(oManifest_No_Data_List);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("IllustratedMessage should be used for error in no data scenario - Table Card", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {
				Core.applyChanges();
				var oFlexBox = this.oCard._getIllustratedMessage(undefined, true),
					oIllustratedMessage = oFlexBox.getItems()[0];

				// Assert
				assert.strictEqual(oIllustratedMessage.getIllustrationType(), IllustratedMessageType.NoEntries, "Illustrated message type should be no data for Table Card");
				assert.strictEqual(this.oCard.getCardContent().getItems()[0].getTitle(), this.oRb.getText("CARD_NO_ITEMS_ERROR_LISTS"), "Correct message is displayed");

				// Clean up
				done();
			}.bind(this));
			// Act
			this.oCard.setManifest(oManifest_No_Data_Table);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("IllustratedMessage should be used for error in no data scenario - Object Card", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {
				Core.applyChanges();
				var oFlexBox = this.oCard._getIllustratedMessage(undefined, true),
					oIllustratedMessage = oFlexBox.getItems()[0];

				// Assert
				assert.strictEqual(oIllustratedMessage.getIllustrationType(), IllustratedMessageType.NoData, "Illustrated message type should be no data for Object Card");
				assert.strictEqual(this.oCard.getCardContent().getItems()[0].getTitle(), this.oRb.getText("CARD_NO_ITEMS_ERROR_CHART"), "Correct message is displayed");

				// Clean up
				done();
			}.bind(this));
			// Act
			this.oCard.setManifest(oManifest_No_Data_Object);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("In a card with no content, the error is rendered in the header", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				Core.applyChanges();
				var oHeaderDomRef = this.oCard.getCardHeader().getDomRef();

				// Assert
				assert.ok(oHeaderDomRef.querySelector(".sapFCardErrorContent"), "error element is rendered in the header");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_DefaultHeader_NoContent);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.test("Error is logged when binding syntax is not 'complex'", function (assert) {
			// Arrange
			var oLogSpy = this.spy(Log, "error");
			this.stub(Utils, "isBindingSyntaxComplex").returns(false);
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.bindingSyntax"
				},
				"sap.card": {
					"type": "List",
					"header": {},
					"content": {
						"item": { }
					}
				}
			});

			// Act
			this.oCard.startManifestProcessing(DOM_RENDER_LOCATION);

			// Assert
			assert.ok(
				oLogSpy.calledWith(sinon.match(/^Cannot parse manifest. Complex binding syntax is not enabled.*/)),
				"Error message should be logged"
			);
		});

		QUnit.module("Component Card");

		QUnit.test("Card and component manifests are in the same file", function (assert) {
			testComponentContentCreation(
				oManifest_ComponentCardAllInOne,
				oManifest_ComponentCardAllInOne,
				assert
			);
		});

		QUnit.test("Controller must have access to the card during onInit", function (assert) {

			// Arrange
			var done = assert.async(),
				oCard = new Card();

			oCard.attachEventOnce("_ready", function () {
				Core.applyChanges();

				var oContent = oCard.getCardContent();

				// Assert
				assert.strictEqual(oContent.$().find(".sapMText").text(), "Berlin", "Controller has access to card parameters during onInit.");

				// Clean up
				oCard.destroy();

				done();
			});

			oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/component/cardAccess/manifest.json");
			oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Refreshing", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oManifest = {
					"sap.app": {
						"id": "test.card.refreshing.card1"
					},
					"sap.card": {
						"type": "List",
						"content": {
							"data": {
								"json": [
									{ "Name": "Product 1" },
									{ "Name": "Product 2" },
									{ "Name": "Product 3" }
								]
							},
							"item": {
								"title": "{Name}"
							}
						}
					}
				};
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oManifest = null;
			}
		});

		QUnit.test("Refreshing card state", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				this.oCard.attachEventOnce("_ready", function () {

					// Assert
					assert.ok(true, "Should have fired _ready event after refresh.");

					// Cleanup
					done();
				});

				// Act
				this.oCard.refresh();
			}.bind(this));

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setManifest(this.oManifest);
		});

		QUnit.module("Refreshing data", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Inner level data", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {
				var oContentSpy = sinon.spy(BaseContent.prototype, "refreshData"),
					oHeaderSpy = sinon.spy(Header.prototype, "refreshData"),
					oFilterSpy = sinon.spy(Filter.prototype, "refreshData"),
					oDataProviderSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate");

				Core.applyChanges();
				this.oCard.refreshData();
				assert.ok(oContentSpy.called, "content refreshData method is called");
				assert.ok(oHeaderSpy.called, "header refreshData method is called");
				assert.strictEqual(oFilterSpy.callCount, 2, "filter refreshData method is called twice");
				assert.strictEqual(oDataProviderSpy.callCount, 4, "dataprovider triggerDataUpdate method is called 4 times");

				oContentSpy.restore();
				oHeaderSpy.restore();
				oFilterSpy.restore();
				oDataProviderSpy.restore();
				done();
			}.bind(this));

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.refreshing.card1"
				},
				"sap.card": {
					"configuration": {
						"filters": {
							"f1": {
								"data": {
									"json": [
										{ "Name": "Product 1" }
									]
								}
							},
							"f2": {
								"data": {
									"json": [
										{ "Name": "Product 1" }
									]
								}
							}
						}
					},
					"type": "List",
					"header": {
						"title": "L3 Request list content Card",
						"data": {
							"json": [
								{ "Name": "Product 1" }
							]
						}
					},
					"content": {
						"data": {
							"json": [
								{ "Name": "Product 1" },
								{ "Name": "Product 2" },
								{ "Name": "Product 3" }
							]
						},
						"item": {
							"title": "{Name}"
						}
					}
				}
			});
		});

		QUnit.test("Root(card) level data", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {
				var oContentSpy = sinon.spy(BaseContent.prototype, "refreshData"),
					oHeaderSpy = sinon.spy(Header.prototype, "refreshData"),
					oFilterSpy = sinon.spy(Filter.prototype, "refreshData"),
					oDataProviderSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate");

				Core.applyChanges();
				this.oCard.refreshData();
				assert.ok(oContentSpy.called, "content refreshData method is called");
				assert.ok(oHeaderSpy.called, "header refreshData method is called");
				assert.strictEqual(oFilterSpy.callCount, 2, "filter refreshData method is called twice");
				assert.strictEqual(oDataProviderSpy.callCount, 1, "dataprovider triggerDataUpdate method is called once");

				oContentSpy.restore();
				oHeaderSpy.restore();
				oFilterSpy.restore();
				oDataProviderSpy.restore();
				done();
			}.bind(this));

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.refreshing.card1"
				},
				"sap.card": {
					"data": {
						"json": [
							{ "Name": "Product 1" }
						]
					},
					"configuration": {
						"filters": {
							"f1": {

							},
							"f2": {

							}
						}
					},
					"type": "List",
					"header": {
						"title": "L3 Request list content Card"
					},
					"content": {
						"item": {
							"title": "{Name}"
						}
					}
				}
			});
		});

		QUnit.test("No data", function (assert) {
			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {
				var oContentSpy = sinon.spy(BaseContent.prototype, "refreshData"),
					oHeaderSpy = sinon.spy(Header.prototype, "refreshData"),
					oFilterSpy = sinon.spy(Filter.prototype, "refreshData"),
					oDataProviderSpy = sinon.spy(DataProvider.prototype, "triggerDataUpdate");

				Core.applyChanges();
				this.oCard.refreshData();
				assert.ok(oContentSpy.called, "content refreshData method is called");
				assert.ok(oHeaderSpy.called, "header refreshData method is called");
				assert.strictEqual(oFilterSpy.callCount, 2, "filter refreshData method is called twice");
				assert.ok(oDataProviderSpy.notCalled, "dataprovider triggerDataUpdate method is not called");

				oContentSpy.restore();
				oHeaderSpy.restore();
				oFilterSpy.restore();
				oDataProviderSpy.restore();
				done();
			}.bind(this));

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.refreshing.card1"
				},
				"sap.card": {
					"configuration": {
						"filters": {
							"f1": {

							},
							"f2": {

							}
						}
					},
					"type": "List",
					"header": {
						"title": "L3 Request list content Card"
					},
					"content": {
						"item": {
							"title": "{Name}"
						}
					}
				}
			});
		});

		QUnit.test("Not ready", function (assert) {
			var bTypeError = false;

			try {
				this.oCard.placeAt(DOM_RENDER_LOCATION);
				this.oCard.setManifest({
					"sap.app": {
						"id": "test.card.refreshing.card1"
					},
					"sap.card": {
						"configuration": {
							"filters": {
								"f1": {

								},
								"f2": {

								}
							}
						},
						"type": "List",
						"header": {
							"title": "L3 Request list content Card"
						},
						"content": {
							"item": {
								"title": "{Name}"
							}
						}
					}
				});
				this.oCard.refreshData();
			} catch (error) {
				bTypeError = true;
			}

			assert.ok(!bTypeError, "There is no error"); // BCP 2280081647
		});

		QUnit.module("Refreshing data - invalid response", {
			beforeEach: function () {
				this.oServer = sinon.fakeServer.create();
				this.oServer.autoRespond = true;
				this.oServer.xhr.useFilters = true;
				this.oServer.xhr.addFilter(function (method, url) {
					return !url.startsWith("/GetSales");
				});

				this.bError = true;

				// Endpoints
				this.oServer.respondWith("/GetSalesSuccess", function (xhr) {

					var iResult = 500;
					var mResponseJSON = "";

					if (!this.bError) {
						iResult = 200;
						mResponseJSON = {items: [{title: "Title 1"}]};
					}

					this.bError = !this.bError;

					xhr.respond(iResult, {"Content-Type": "application/json"}, JSON.stringify(mResponseJSON));
				}.bind(this));

				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;

				this.oServer.reset();
				this.oServer = null;
			}
		});

		QUnit.test("Initially invalid response, valid second response", function (assert) {
			// Arrange
			var done = assert.async(2);
			this.oCard.attachEventOnce("_ready", function () {
				Core.applyChanges();

				var oContent = this.oCard.getCardContent();
				assert.notOk(oContent.isA("sap.ui.integration.cards.BaseContent"), "Error is displayed.");

				this.oCard.refreshData();

				this.oCard.attachEventOnce("_contentReady", function () {
					Core.applyChanges();

					var oContent = this.oCard.getCardContent();
					assert.ok(oContent.isA("sap.ui.integration.cards.BaseContent"), "Content is displayed correctly.");

					done();
				}.bind(this));

				done();
			}.bind(this));

			this.oCard.placeAt(DOM_RENDER_LOCATION);
			this.oCard.setManifest({
				"sap.app": {
					"id": "test.card.refreshing.card1"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Sales Report"
					},
					"content": {
						"data": {
							"request": {
								"url": "/GetSalesSuccess"
							},
							"path": "/items"
						},
						"item": {
							"title": "{title}"
						},
						"maxItems": "5"
					}
				}
			});
		});

		QUnit.test("Event stateChanged is fired on refreshData", function (assert) {
			var done = assert.async(),
				oCard = this.oCard,
				oHost = new Host();

			assert.expect(4);

			oCard.setHost(oHost);

			oCard.attachEventOnce("stateChanged", function () {
				assert.ok(true, "stateChanged is called on card ready");

				oCard.attachEventOnce("stateChanged", function () {
					assert.ok(true, "stateChanged is called after data refresh");
				});
			});

			oHost.attachEventOnce("cardStateChanged", function () {
				assert.ok(true, "cardStateChanged for host is called on card ready");

				oHost.attachEventOnce("cardStateChanged", function () {
					assert.ok(true, "cardStateChanged for host is called after data refresh");

					// Clean up
					oHost.destroy();
					done();
				});

				// Act
				oCard.refreshData();
			});

			// Act
			oCard.setManifest({
				"sap.app": {
					"id": "test.card.stateChanged"
				},
				"sap.card": {
					"type": "List",
					"content": {
						"data": {
							"request": {
								"url": "items.json"
							}
						},
						"item": {
							"title": "{Name}"
						}
					}
				}
			});
			oCard.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		});

		QUnit.module("Data mode", {
			beforeEach: function () {
				this.oCard = new Card();
				this.oManifest = {
					"sap.app": {
						"id": "test.card.dataMode.card1"
					},
					"sap.card": {
						"type": "List",
						"content": {
							"data": {
								"json": [
									{ "Name": "Product 1" },
									{ "Name": "Product 2" },
									{ "Name": "Product 3" }
								]
							},
							"item": {
								"title": "{Name}"
							}
						}
					}
				};
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
				this.oManifest = null;
			}
		});

		QUnit.test("Set data mode", function (assert) {

			// Arrange
			var done = assert.async(),
				oApplyManifestSpy = sinon.spy(Card.prototype, "_applyManifestSettings"),
				oRefreshSpy = sinon.spy(Card.prototype, "refresh");

			this.oCard.attachEventOnce("_ready", function () {

				// Assert
				assert.ok(oApplyManifestSpy.calledOnce, "Card with default 'Active' state should try to apply the manifest settings.");

				// Act
				oApplyManifestSpy.reset();
				this.oCard.setDataMode("Inactive");

				// Assert
				assert.ok(oApplyManifestSpy.notCalled, "Card with 'Inactive' state should NOT try to apply the manifest settings.");

				// Act
				this.oCard.setDataMode("Active");

				// Assert
				assert.ok(oRefreshSpy.calledOnce, "Should call refresh when turning to 'Active' mode.");

				// Cleanup
				oApplyManifestSpy.restore();
				done();

			}.bind(this));

			this.oCard.setManifest(this.oManifest);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Card manifest - URL", {
			beforeEach: function () {
				this.oCardUrl = new Card({
					width: "400px",
					height: "600px"
				});
			},
			afterEach: function () {
				this.oCardUrl.destroy();
				this.oCardUrl = null;
			}
		});

		QUnit.test("Card manifest set trough url", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCardUrl.attachEventOnce("_ready", function () {

				Core.applyChanges();

				// Assert
				assert.ok(true, "Should have fired _ready event.");

				// Cleanup
				done();
			});

			this.oCardUrl.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCardUrl.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Header counter", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Formatting with self translation", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				var oHeader = this.oCard.getCardHeader();

				// Assert
				assert.equal(oHeader.getStatusText(), "2 of 115", "Should have correctly formatted and translated counter.");

				// Cleanup
				done();
			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslationsOwnCounter/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Formatting with custom translation", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				var oHeader = this.oCard.getCardHeader();

				// Assert
				assert.equal(oHeader.getStatusText(), "2 of custom 115", "Should have correctly formatted and translated counter.");

				// Cleanup
				done();
			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslationsCustomCounter/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Formatting with self translation and no custom translation", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				var oHeader = this.oCard.getCardHeader();

				// Assert
				assert.equal(oHeader.getStatusText(), "2 of 115", "Should have correctly formatted and translated counter.");

				// Cleanup
				done();
			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslationsOwnCounter/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Events", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("'manifestReady' event is fired.", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachManifestReady(function () {
				// Assert
				assert.ok(true, "Should have fired 'manifestReady' event.");
				done();
			});

			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("getManifestEntry after 'manifestReady' event is fired.", function (assert) {

			// Arrange
			var done = assert.async();
			this.oCard.attachManifestReady(function () {
				// Assert
				assert.deepEqual(this.oCard.getManifestEntry("/"), oManifest_ListCard, "getManifestEntry returns correct result for '/'");
				assert.deepEqual(this.oCard.getManifestEntry("/sap.card"), oManifest_ListCard["sap.card"], "getManifestEntry returns correct result for '/sap.card'");
				assert.strictEqual(this.oCard.getManifestEntry("/sap.card/header/title"), oManifest_ListCard["sap.card"]["header"]["title"], "getManifestEntry returns correct result for '/sap.card/header/title'");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest(oManifest_ListCard);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("'manifestApplied' event is fired.", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard;

				oCard.attachManifestApplied(function () {
				// Assert
				assert.ok(true, "Event 'manifestApplied' is fired.");
				done();
			});

			// Act
			oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Property 'manifestChanges'", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Change title with manifestChanges", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Assert
				assert.strictEqual(this.oCard.getAggregation("_header").getTitle(), "My new title 2", "The title is changed");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{ content: { header: { title: "My new title 1" } } },
				{ content: { header: { title: "My new title 2" } } }
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Change title with manifestChanges with path syntax", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Assert
				assert.strictEqual(this.oCard.getAggregation("_header").getTitle(), "My new title 2", "The title is changed");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{ "/sap.card/header/title": "My new title 1" },
				{ "/sap.card/header/title": "My new title 2" }

			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Change title with manifestChanges with mixed syntax, last path syntax", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Assert
				assert.strictEqual(this.oCard.getAggregation("_header").getTitle(), "My new title 4", "The title is changed");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{ "/sap.card/header/title": "My new title 1" },
				{ content: { header: { title: "My new title 2" } } },
				{ content: { header: { title: "My new title 3" } } },
				{ "/sap.card/header/title": "My new title 4" }
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Change title with manifestChanges with mixed syntax, last content syntax", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Assert
				assert.strictEqual(this.oCard.getAggregation("_header").getTitle(), "My new title 4", "The title is changed");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{ "/sap.card/header/title": "My new title 1" },
				{ content: { header: { title: "My new title 2" } } },
				{ "/sap.card/header/title": "My new title 3" },
				{ content: { header: { title: "My new title 4" } } }
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Check getManifestWithMergedChanges", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Assert
				var oMergedManifest = this.oCard.getManifestWithMergedChanges();
				assert.strictEqual(oMergedManifest["sap.card"]["header"]["title"], "Test title", "The manifest contains the given changes.");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{ content: { header: { title: "Test title" } } }
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Check getManifestWithMergedChanges with path syntax", function (assert) {
			// Arrange
			var done = assert.async();

			this.oCard.attachEvent("_ready", function () {
				// Assert
				var oMergedManifest = this.oCard.getManifestWithMergedChanges();
				assert.strictEqual(oMergedManifest["sap.card"]["header"]["title"], "Test title", "The manifest contains the given changes.");
				done();
			}.bind(this));

			// Act
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.setManifestChanges([
				{ "/sap.card/header/title": "Test title" }
			]);
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Style classes", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});

				this.oCard.placeAt(DOM_RENDER_LOCATION);
				Core.applyChanges();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("'sapUiIntCardAnalytical' is added only when the type is 'Analytical'", function (assert) {
			// Arrange
			var done = assert.async(),
				oAnalyticalManifest = {
					"sap.app": {
						"id": "someId"
					},
					"sap.card": {
						"type": "Analytical"
					}
				},
				oTableManifest = {
					"sap.app": {
						"id": "someId"
					},
					"sap.card": {
						"type": "Table"
					}
				};

			// Act
			this.oCard.attachEventOnce("_ready", function () {
				// Assert
				assert.ok(this.oCard.$().hasClass("sapUiIntCardAnalytical"), "'sapUiIntCardAnalytical' class should be set.");

				this.oCard.attachEventOnce("_ready", function () {
					// Assert
					assert.notOk(this.oCard.$().hasClass("sapUiIntCardAnalytical"), "'sapUiIntCardAnalytical' class should NOT be set.");
					done();
				}.bind(this));

				// Act
				this.oCard.setManifest(oTableManifest);

			}.bind(this));

			this.oCard.setManifest(oAnalyticalManifest);
		});


		QUnit.module("Badge", {
			beforeEach: function () {
				this.oCard = new Card({
					customData: [
						new BadgeCustomData({
							value: "New"
						})
					],
					width: "400px",
					height: "600px"
				});
			},
			afterEach: function () {
				// this.sinon.useFakeTimers = false;
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Rendering", function (assert) {
			var done = assert.async();

			// Arrange
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				var $badgeIndicator = this.oCard.$().find(".sapMBadgeIndicator");

				// Assert
				assert.strictEqual(this.oCard.$().find(".sapMBadgeIndicator").attr("data-badge"), "New", "Badge indicator is correctly rendered");
				assert.strictEqual($badgeIndicator.attr("aria-label"), "New", "Badge aria-label correctly rendered");
				assert.ok(this.oCard.getCardHeader().$("focusable").attr("aria-labelledby").indexOf($badgeIndicator.attr('id')) > -1, "aria-labelledby contains the badge indicator id");

				done();

			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});


		QUnit.test("Auto hide", function (assert) {
			var done = assert.async();

			// Arrange
			this.oCard.attachEventOnce("_ready", function () {

				Core.applyChanges();

				this.clock = sinon.useFakeTimers();

				var $badgeIndicator = this.oCard.$().find(".sapMBadgeIndicator");

				// Assert
				assert.ok(this.oCard.$().find(".sapMBadgeIndicator").attr("data-badge"), "Badge indicator is rendered");

				this.oCard.focus();

				this.clock.tick(4000);

				assert.equal(this.oCard._isBadgeAttached, false, "Badge indicator is not rendered");
				assert.notOk($badgeIndicator.attr("aria-label"), "Badge aria-label is removed");
				assert.ok(this.oCard.getCardHeader().$("focusable").attr("aria-labelledby").indexOf($badgeIndicator.attr('id')) === -1, "aria-labelledby does not contain the badge indicator id");

				this.oCard.addCustomData(new BadgeCustomData({value: "New"}));
				Core.applyChanges();

				$badgeIndicator = this.oCard.$().find(".sapMBadgeIndicator");

				// Assert
				assert.ok(this.oCard.$().find(".sapMBadgeIndicator").attr("data-badge"), "Badge indicator is rendered");

				this.oCard.onsapenter();
				assert.equal(this.oCard._isBadgeAttached, false, "Badge indicator is not rendered");

				this.clock.restore();
				done();

			}.bind(this));

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		});


		QUnit.module("Translations", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("I18n module is initialized with integration library resource bundle", function (assert) {
			var oCard = this.oCard,
				oModel;

			// Arrange
			oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			oCard.placeAt(DOM_RENDER_LOCATION);

			// Assert
			oModel = oCard.getModel("i18n");
			assert.strictEqual(oModel.getResourceBundle(), Core.getLibraryResourceBundle("sap.ui.integration"), "The i18n model of the card is correctly initialized.");
		});

		QUnit.test("Integration library resource bundle is not enhanced", function (assert) {

			var done = assert.async(),
				oCard = this.oCard;

			// Arrange
			oCard.attachEventOnce("_ready", function () {
				Core.applyChanges();

				// Assert
				var oResourceBundle = Core.getLibraryResourceBundle("sap.ui.integration");
				assert.ok(oResourceBundle.aCustomBundles.length === 0, "The resource bundle for integration library is not enhanced.");

				done();
			});

			oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslations/manifest.json");
			oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("I18n module is isolated", function (assert) {
			var oContainer = new HBox(),
				oCard = this.oCard,
				oModel;

			// Arrange
			oContainer.setModel(new JSONModel(), "i18n");
			oContainer.addItem(oCard);

			oCard.setManifest("test-resources/sap/ui/integration/qunit/manifests/manifest.json");
			oContainer.placeAt(DOM_RENDER_LOCATION);

			// Assert
			oModel = oCard.getModel("i18n");

			assert.ok(oModel.isA("sap.ui.model.resource.ResourceModel"), "The i18n model of the card is ResourceModel.");

			// Clean up
			oContainer.destroy();
		});

		QUnit.test("Card translations work", function (assert) {

			var done = assert.async(),
				oCard = this.oCard;

			// Arrange
			oCard.attachEventOnce("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.strictEqual(oCard.getCardHeader().getTitle(), "Card Translation Bundle", "The translation for title is correct.");

				done();
			});

			oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslations/manifest.json");
			oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Use getTranslatedText", function (assert) {

			var done = assert.async(),
				oCard = this.oCard;

			// Arrange
			oCard.attachEventOnce("_ready", function () {
				Core.applyChanges();

				// Assert
				assert.strictEqual(oCard.getTranslatedText("SUBTITLE"), "Some subtitle", "The translation for SUBTITLE is correct.");
				assert.strictEqual(oCard.getTranslatedText("COUNT_X_OF_Y", [3, 5]), "3 of custom 5", "The translation for COUNT_X_OF_Y is correct.");

				done();
			});

			oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslationsCustomCounter/manifest.json");
			oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.test("Refresh reloads translations correctly", function (assert) {
			var done = assert.async(),
				oCard = this.oCard;

			// Arrange
			oCard.attachEventOnce("_ready", function () {
				Core.applyChanges();

				oCard.refresh();

				oCard.attachEventOnce("_ready", function () {
					Core.applyChanges();

					// Assert
					assert.strictEqual(oCard.getTranslatedText("SUBTITLE"), "Some subtitle", "The translation for SUBTITLE is correct.");
					assert.strictEqual(oCard.getTranslatedText("CARD.COUNT_X_OF_Y", [3, 5]), "3 of 5", "The translation for COUNT_X_OF_Y is correct.");

					done();
				});
			});

			oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/cardWithTranslationsOwnCounter/manifest.json");
			oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Size", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Content height is not bigger than container height", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard;

			oCard.setWidth("400px");
			oCard.setHeight("200px");

			oCard.attachEvent("_ready", function () {
				Core.applyChanges();

				var oContent = oCard.getCardContent(),
					iHeight = oContent.getDomRef().getBoundingClientRect().height;

				// Assert
				assert.ok(iHeight < 200, "The height of the content is not larger than the height of the container.");

				done();
			});

			// Act
			oCard.setManifest(oManifest_ListCard);
			oCard.placeAt(DOM_RENDER_LOCATION);
		});

		QUnit.module("Card without rendering", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Full manifest processing is done by calling the method 'startManifestProcessing'", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard;

			oCard.attachEvent("_ready", function () {
				var aItems = this.oCard.getCardContent().getInnerList().getItems();

				// Assert
				assert.ok(true, "Card processing was done even without rendering.");
				assert.strictEqual(aItems.length, 8, "The content has 8 items in its aggregation.");
				done();
			}.bind(this));

			// Act
			oCard.setManifest(oManifest_ListCard);
			oCard.startManifestProcessing();
		});

		QUnit.module("Destroy", {
			beforeEach: function () {
				this.oCard = new Card({
					width: "400px",
					height: "600px"
				});
				this.oCard.placeAt(DOM_RENDER_LOCATION);
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Destroy card while manifest is loading", function (assert) {
			// Arrange
			var oSpy = sinon.spy(Card.prototype, "_registerManifestModulePath"),
				done = assert.async();

			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/listCard.manifest.json");
			Core.applyChanges();

			assert.ok(this.oCard._oCardManifest, "There is Manifest instance");

			// Act
			this.oCard.destroy();

			setTimeout(function () {
				// Assert
				assert.ok(oSpy.notCalled, "Method is not called if the card is destroyed");

				oSpy.restore();
				done();
			}, 500);
		});

		QUnit.module("Custom Models", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("List items can be set through custom model", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard;

			oCard.attachEvent("_ready", function () {
				var aItems;

				oCard.getModel("cities").setData({
					items: [
						{name: "City 1"},
						{name: "City 2"}
					]
				});

				Core.applyChanges();

				aItems = this.oCard.getCardContent().getInnerList().getItems();

				// Assert
				assert.strictEqual(aItems.length, 2, "There are two items rendered from the custom model.");
				done();
			}.bind(this));

			// Act
			oCard.setManifest(oManifest_CustomModels);
			oCard.startManifestProcessing();
		});

		QUnit.test("Registering custom models on multiple calls to setManifest", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard,
				fnErrorLogSpy = sinon.spy(Log, "error");

			oCard.attachEventOnce("_ready", function () {
				var fnModelDestroySpy = sinon.spy(oCard.getModel("cities"), "destroy");

				oCard.attachEventOnce("_ready", function () {
					// Assert - after second setManifest
					assert.ok(fnModelDestroySpy.calledOnce, "Destroy was called for the custom model on second setManifest.");
					assert.strictEqual(this._aCustomModels.length, 1, "Custom model is registered only once.");
					assert.notOk(fnErrorLogSpy.called, "There is no error logged for duplicate custom model names.");

					oCard.destroy();
					Core.applyChanges();

					assert.ok(true, "Card can be successfully destroyed after multiple calls to setManifest.");

					done();

					// Clean up
					fnModelDestroySpy.restore();
					fnErrorLogSpy.restore();
				});

				// Act
				oCard.setManifest(oManifest_CustomModels);
				oCard.startManifestProcessing();
				Core.applyChanges();

			});

			// Act
			oCard.setManifest(oManifest_CustomModels);
			oCard.startManifestProcessing();
		});

		QUnit.module("Grouping", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("List card items can be grouped", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard;

			oCard.attachEvent("_ready", function () {
				var aItems = this.oCard.getCardContent().getInnerList().getItems();
				// Assert
				assert.strictEqual(aItems.length, 4, "There are two list items and two group titles in the list.");
				assert.ok(aItems[0].isA("sap.m.GroupHeaderListItem"), "The first item of the list is the group title");
				assert.strictEqual(aItems[0].getTitle(), "Expensive", "The group title is correct");
				done();
			}.bind(this));

			// Act
			oCard.setManifest({
				"sap.app": {
					"id": "test.card.listGrouping.card"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "List Card"
					},
					"content": {
						"data": {
							"json": [{
									"Name": "Product 1",
									"Price": "100"
								},
								{
									"Name": "Product 2",
									"Price": "200"
								}
							]
						},
						"item": {
							"title": "{Name}",
							"description": "{Price}"
						},
						"group": {
							"title": "{= ${Price} > 150 ? 'Expensive' : 'Cheap'}",
							"order": {
								"path": "Price",
								"dir": "DESC"
							}
						}
					}
				}
			});
			oCard.startManifestProcessing();
		});

		QUnit.test("Table card items can be grouped", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard;

			oCard.attachEvent("_ready", function () {
				var aItems = this.oCard.getCardContent().getInnerList().getItems();
				// Assert
				assert.strictEqual(aItems.length, 4, "There are two list items and two group titles in the list.");
				assert.ok(aItems[0].isA("sap.m.GroupHeaderListItem"), "The first item of the list is the group title");
				assert.strictEqual(aItems[0].getTitle(), "Cheap", "The group title is correct");
				done();
			}.bind(this));

			// Act
			oCard.setManifest({
				"sap.app": {
					"id": "test.card.tableGrouping.card"
				},
				"sap.card": {
					"type": "Table",
					"data": {
						"json":[{
							"Name": "Product 1",
							"Price": "100"
						},
						{
							"Name": "Product 2",
							"Price": "200"
						}
					]
					},
					"header": {
						"title": "L3 Request list content Card"
					},
					"content": {
						"row": {
							"columns": [{
									"title": "Name",
									"value": "{Name}"
								},
								{
									"title": "Price",
									"value": "{Price}"
								}
							]
						},
						"group": {
							"title": "{= ${Price} > 150 ? 'Expensive' : 'Cheap'}",
							"order": {
								"path": "Price",
								"dir": "ASC"
							}
						}
					}
				}
			});
			oCard.startManifestProcessing();
		});

		QUnit.module("Creation of children cards", {
			beforeEach: function () {
				this.oCard = new Card();
			},
			afterEach: function () {
				this.oCard.destroy();
				this.oCard = null;
			}
		});

		QUnit.test("Property referenceId is forwarded to children cards", function (assert) {
			// Arrange
			var done = assert.async(),
				oCard = this.oCard,
				sReferenceId = "test-id",
				oChildCard;

			oCard.attachEvent("_ready", function () {
				oChildCard = oCard._createChildCard({
					manifest: {
						"sap.app": {
							"id": "test.card.childCard.card2"
						},
						"sap.card": {
							"type": "Object",
							"header": {
								"title": "Test Card 2"
							}
						}
					}
				});

				// Assert
				assert.strictEqual(oChildCard.getReferenceId(), sReferenceId, "The created child card has the same reference id as the parent card.");
				done();
			});

			// Act
			oCard.setReferenceId(sReferenceId);

			oCard.setManifest({
				"sap.app": {
					"id": "test.card.childCard.card1"
				},
				"sap.card": {
					"type": "Object",
					"header": {
						"title": "Test Card"
					}
				}
			});
			oCard.startManifestProcessing();
		});
	}
);
