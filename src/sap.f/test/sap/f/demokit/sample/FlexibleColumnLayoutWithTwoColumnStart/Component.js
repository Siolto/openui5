sap.ui.define(['sap/ui/core/UIComponent'],
	function (UIComponent) {
		"use strict";

		var Component = UIComponent.extend("sap.f.sample.FlexibleColumnLayoutWithTwoColumnStart.Component", {

			metadata: {
				config: {
					sample: {
						iframe: "../FlexibleColumnLayoutWithTwoColumnStart/webapp/index.html?initial=2",
						stretch: true,
						files: [
							"webapp/view/Detail.view.xml",
							"webapp/view/DetailDetail.view.xml",
							"webapp/view/FlexibleColumnLayout.view.xml",
							"webapp/view/Master.view.xml",
							"webapp/view/AboutPage.view.xml",
							"webapp/controller/Detail.controller.js",
							"webapp/controller/DetailDetail.controller.js",
							"webapp/controller/FlexibleColumnLayout.controller.js",
							"webapp/controller/Master.controller.js",
							"webapp/controller/AboutPage.controller.js",
							"webapp/Component.js",
							"webapp/index.html",
							"webapp/manifest.json"
						]
					}
				}
			}

		});

		return Component;
	});
