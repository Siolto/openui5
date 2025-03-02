/*global QUnit, sinon, testlibs */
sap.ui.define([
	'sap/base/i18n/ResourceBundle',
	'sap/base/Log',
	'sap/base/util/LoaderExtensions',
	'sap/base/util/ObjectPath',
	'sap/ui/Device',
	'sap/ui/core/Core',
	'sap/ui/core/Element',
	'sap/ui/core/Configuration',
	'sap/ui/core/theming/ThemeManager',
	'sap/ui/qunit/utils/createAndAppendDiv'
], function(ResourceBundle, Log, LoaderExtensions, ObjectPath, Device, oCore, Element, Configuration, ThemeManager, createAndAppendDiv) {
	"use strict";

	function _providesPublicMethods(/**sap.ui.base.Object*/oObject, /** function */ fnClass, /**boolean*/ bFailEarly) {
		var aMethodNames = fnClass.getMetadata().getAllPublicMethods(),
			result = true,
			sMethod;

		for (var i in aMethodNames) {
			sMethod = aMethodNames[i];
			result = result && oObject[sMethod] != undefined;
			if (result){
				continue;
			}
			if (bFailEarly && !result){
				break;
			}
		}
		return result;
	}

	// lazy dependency
	var TestButton;

	// custom assertion
	QUnit.assert.equalControls = function(actual, expected, message) {
		this.ok(actual === expected, message);
	};

	QUnit.assert.isLibLoaded = function(libName) {
		this.ok(ObjectPath.get(libName), "namespace for " + libName + " should exist");
		this.ok(oCore.getLoadedLibraries()[libName], "Core should know and list " + libName + " as 'loaded'");
	};

	// used to get access to the non-public core parts
	var oRealCore;
	var TestCorePlugin = function() {};
	TestCorePlugin.prototype.startPlugin = function(oCore, bOnInit) {
		oRealCore = oCore;
	};
	oCore.registerPlugin(new TestCorePlugin());


	// ---------------------------------------------------------------------------
	// Basic functionality
	// ---------------------------------------------------------------------------

	QUnit.module("Basic");

	QUnit.test("facade", function(assert) {
		assert.notStrictEqual(sap.ui.getCore(), oRealCore, "Facade should be different from the implementation");
		assert.notOk(sap.ui.getCore() instanceof oRealCore.constructor, "Facade should not be an instance of sap.ui.core.Core");
		assert.strictEqual(sap.ui.getCore(), sap.ui.getCore(), "consecutive calls to sap.ui.getCore() should return the exact same facade");
	});

	QUnit.test("repeated instantiation", function(assert) {
		this.spy(Log, 'error');

		assert.strictEqual(new oRealCore.constructor(), sap.ui.getCore(), "consecutive calls to the constructor should return the facade");
		sinon.assert.calledWith(Log.error, sinon.match(/Only.*must create an instance of .*Core/).and(sinon.match(/use .*sap.ui.getCore\(\)/)));
	});

	QUnit.test("loadLibrary", function(assert) {
		assert.equal(typeof oCore.loadLibrary, "function", "Core has method loadLibrary");
		assert.ok(sap.ui.loader._.getModuleState("sap/ui/testlib/library.js") === 0, "testlib lib has not been loaded yet");
		assert.ok(!ObjectPath.get("sap.ui.testlib"), "testlib namespace doesn't exists");
		assert.strictEqual(document.querySelectorAll("head > link[id='sap-ui-theme-sap.ui.testlib']").length, 0, "style sheet doesn't exist");
		return oCore.loadLibrary("sap.ui.testlib", {
			url: "test-resources/sap/ui/core/qunit/testdata/uilib",
			async: true
		}).then(function() {
			assert.ok(sap.ui.loader._.getModuleState("sap/ui/testlib/library.js") !== 0, "testlib lib has been loaded");
			assert.ok(ObjectPath.get("sap.ui.testlib"), "testlib namespace exists");
			assert.strictEqual(document.querySelectorAll("head > link[id='sap-ui-theme-sap.ui.testlib']").length, 1, "style sheets have been added");

			return new Promise(function(resolve, reject) {
				// load TestButton class
				sap.ui.require(["sap/ui/testlib/TestButton"], function(_TestButton) {
					TestButton = _TestButton;
					resolve();
				}, reject);
			});
		});
	});

	/**
	 * Tests creation of an UIArea instance and afterwards checks whether it can be found via getUIArea method
	 * @deprecated As of version 1.1
	 */
	QUnit.test("testCreateUIArea", function(assert) {
		createAndAppendDiv("uiArea1");
		var oUIArea = oCore.createUIArea("uiArea1");
		assert.ok(!!oUIArea, "UIArea must be created and returned");
		assert.ok(_providesPublicMethods(oUIArea, sap.ui.core.UIArea), "Expected instance of sap.ui.core.UIArea");
		var oUIAreaCheck = oCore.getUIArea("uiArea1");
		assert.ok(!!oUIAreaCheck, "UIArea must be returned");
		assert.ok(_providesPublicMethods(oUIAreaCheck, sap.ui.core.UIArea), "Expected instance of sap.ui.core.UIArea");
		assert.equal(oUIAreaCheck, oUIArea, "Returned UIArea must be the same as the one created before");
	});

	/**
	 * @deprecated As of version 1.1
	 */
	QUnit.test("testSetRoot", function(assert) {
		var oButton = new TestButton("test2Button", {text:"Hallo JSUnit"});
		createAndAppendDiv("uiArea2");
		oCore.setRoot("uiArea2", oButton);
		var oUIAreaCheck = oCore.getUIArea("uiArea2");
		assert.ok(oUIAreaCheck, "UIArea must be returned");
		assert.ok(_providesPublicMethods(oUIAreaCheck, sap.ui.core.UIArea), "Expected instance of sap.ui.core.UIArea");
	});

	/**
	 * @deprecated As of version 1.1
	 */
	QUnit.test("testGetElementById", function(assert) {
		var oButton = new TestButton("test3Button", {text:"Hallo JSUnit"});
		createAndAppendDiv("uiArea3");
		oButton.placeAt("uiArea3");
		var oButtonCheck = oCore.getElementById("test3Button");
		assert.ok(oButtonCheck, "Button must be returned");
		assert.equalControls(oButtonCheck, oButton, "Returned Button must be the same as the one created before");
	});

	/**
	 * Tests that <code>sap.ui.getCore().notifyContentDensityChanged()</code> calls each control's #onThemeChanged method
	 */
	QUnit.test("test #notifyContentDensityChanged", function(assert) {
		var done = assert.async();
		assert.expect(4);

		var oBtn = new TestButton("testMyButton", {text:"Hallo JSUnit"});
		oBtn.onThemeChanged = function(oCtrlEvent) {
			assert.ok(oCtrlEvent, "TestButton#onThemeChanged is called");
			assert.equal(oCtrlEvent.theme, oCore.getConfiguration().getTheme(), "Default theme is passed along control event");
		};

		function handler(oEvent) {
			assert.ok(oEvent, "attachThemeChanged is called");
			assert.equal(oEvent.getParameter("theme"), oCore.getConfiguration().getTheme(), "Default theme is passed along Core event");

			// cleanup
			oCore.detachThemeChanged(handler);
			oBtn.destroy();

			done();
		}
		oCore.attachThemeChanged(handler);

		//call to #notifyContentDensityChanged
		oCore.notifyContentDensityChanged();
	});

	/**
	 * @deprecated As of version 1.1
	 */
	QUnit.test("testGetControl", function(assert) {
		var oButton = new TestButton("test4Button", {text:"Hallo JSUnit"});
		createAndAppendDiv("uiArea4");
		oButton.placeAt("uiArea4");
		var oButtonCheck = oCore.getControl("test4Button");
		assert.ok(oButtonCheck, "Button must be returned");
		assert.equalControls(oButtonCheck, oButton, "Returned Button must be the same as the one created before");
	});

	QUnit.test("testSetThemeRoot", function(assert) {
		oCore.setThemeRoot("my_theme", ["sap.ui.core"], "http://core.something.corp");
		oCore.setThemeRoot("my_theme", "http://custom.something.corp");
		oCore.setThemeRoot("my_theme", ["sap.m"], "http://mobile.something.corp");

		return Promise.resolve().then(function () {
			var corePath = ThemeManager._getThemePath("sap.ui.core", "my_theme");
			var mobilePath = ThemeManager._getThemePath("sap.m", "my_theme");
			var otherPath = ThemeManager._getThemePath("sap.ui.other", "my_theme");

			assert.equal(corePath, "http://core.something.corp/sap/ui/core/themes/my_theme/", "path should be as configured");
			assert.equal(mobilePath, "http://mobile.something.corp/sap/m/themes/my_theme/", "path should be as configured");
			assert.equal(otherPath, "http://custom.something.corp/sap/ui/other/themes/my_theme/", "path should be as configured");

			corePath = sap.ui.require.toUrl("sap/ui/core/themes/my_theme/");
			mobilePath = sap.ui.require.toUrl("sap/m/themes/my_theme/");
			otherPath = sap.ui.require.toUrl("sap/ui/other/themes/my_theme/");

			assert.equal(corePath, "http://core.something.corp/sap/ui/core/themes/my_theme/", "path should be as configured");
			assert.equal(mobilePath, "http://mobile.something.corp/sap/m/themes/my_theme/", "path should be as configured");
			assert.equal(otherPath, "http://custom.something.corp/sap/ui/other/themes/my_theme/", "path should be as configured");

			// Set theme root for all libs with forceUpdate
			oCore.setThemeRoot("test_theme", "/foo/", true);

			return Promise.resolve().then(function () {
				corePath = ThemeManager._getThemePath("sap.ui.core", "test_theme");
				var oCoreLink = document.getElementById("sap-ui-theme-sap.ui.core");

				assert.equal(corePath, "/foo/sap/ui/core/themes/test_theme/", "path should be as configured");
				assert.equal(oCoreLink.getAttribute("href"), "/foo/sap/ui/core/themes/test_theme/library.css", "Stylesheet should have been updated");

				// Set theme root for sap.ui.core lib with forceUpdate
				oCore.setThemeRoot("test_theme", ["sap.ui.core"], "/bar/", true);

				return Promise.resolve().then(function () {
					corePath = ThemeManager._getThemePath("sap.ui.core", "test_theme");
					oCoreLink = document.getElementById("sap-ui-theme-sap.ui.core");

					assert.equal(corePath, "/bar/sap/ui/core/themes/test_theme/", "path should be as configured");
					assert.equal(oCoreLink.getAttribute("href"), "/bar/sap/ui/core/themes/test_theme/library.css", "Stylesheet should have been updated");
				});
			});
		});

	});

	// now check the location of the preconfigured themes
	QUnit.test("themeRoot configuration", function(assert) {
		var corePath = ThemeManager._getThemePath("sap.ui.core", "my_preconfigured_theme");
		var mobilePath = ThemeManager._getThemePath("sap.m", "my_preconfigured_theme");
		var otherPath = ThemeManager._getThemePath("sap.ui.other", "my_preconfigured_theme");

		assert.equal(corePath, "http://preconfig.com/ui5-themes/sap/ui/core/themes/my_preconfigured_theme/", "path should be as configured");
		assert.equal(mobilePath, "http://preconfig.com/ui5-themes/sap/m/themes/my_preconfigured_theme/", "path should be as configured");
		assert.equal(otherPath, "http://preconfig.com/ui5-themes/sap/ui/other/themes/my_preconfigured_theme/", "path should be as configured");

		corePath = ThemeManager._getThemePath("sap.ui.core", "my_second_preconfigured_theme");
		mobilePath = ThemeManager._getThemePath("sap.m", "my_second_preconfigured_theme");
		otherPath = ThemeManager._getThemePath("sap.ui.other", "my_second_preconfigured_theme");

		assert.equal(corePath, "http://core.preconfig.com/ui5-themes/sap/ui/core/themes/my_second_preconfigured_theme/", "path should be as configured");
		assert.equal(mobilePath, "http://mobile.preconfig.com/ui5-themes/sap/m/themes/my_second_preconfigured_theme/", "path should be as configured");
		assert.equal(otherPath, "http://preconfig.com/ui5-themes/sap/ui/other/themes/my_second_preconfigured_theme/", "path should be as configured");

		// read from script tag
		corePath = ThemeManager._getThemePath("sap.ui.core", "my_third_preconfigured_theme");
		assert.equal(corePath, "http://third.preconfig.com/ui5-themes/sap/ui/core/themes/my_third_preconfigured_theme/", "path should be as configured");
	});

	QUnit.test("Browser Version Test", function(assert) {
		assert.expect(4);
		var browser = Device.browser;
		var value = document.documentElement.getAttribute("data-sap-ui-browser");
		assert.ok(typeof value === "string" && value, "Data attribute is set and is not empty");

		var version = browser.version;
		assert.ok(typeof version === "number", "Browser version is set");

		if (browser.firefox) {
			assert.ok(value.indexOf("ff") === 0, "Browser is Firefox and data attribute is set right");
		} else if (browser.webkit) {
			if (browser.chrome) {
				assert.ok(value.indexOf("cr") === 0, "Browser is Chrome and data attribute is set right");
			}
			// Those tests should not be called anymore
			if (browser.safari && browser.mobile) {
				assert.ok(value.indexOf("msf") === 0, "Browser is Mobile Safari and data attribute is set right");
			} else if (browser.safari) {
				assert.ok(value.indexOf("sf") === 0, "Browser is Safari and data attribute is set right");
			}
		}

		if (!browser.safari || (!browser.fullscreen && !browser.webview)) {
			assert.ok(value.indexOf(Math.floor(version)) != -1, "Version is set right in data attribute");
		} else {
			assert.ok(!/[0-9]+$/.test(value), "unknown browser versions shouldn't be added to the data attribute");
		}

	});

	// now check the locale configuration to be applied as lang attribute
	QUnit.test("Locale configuration", function(assert) {
		var oHtml = document.documentElement;
		var oConfig = oCore.getConfiguration();
		var oLocale = oConfig.getLocale();
		var sLocale = oLocale && oLocale.toString();

		assert.equal(oHtml.getAttribute("lang"), sLocale, "lang attribute matches locale");

		sLocale = "de";
		oConfig.setLanguage(sLocale);
		assert.equal(oHtml.getAttribute("lang"), sLocale, "lang attribute matches locale");
	});

	QUnit.test("prerendering tasks", function (assert) {
		var bCalled1 = false,
			bCalled2 = false;

		function task1 () {
			bCalled1 = true;
			assert.ok(!bCalled2, "not yet called");
		}

		function task2 () {
			bCalled2 = true;
		}

		oCore.addPrerenderingTask(task1);
		oCore.addPrerenderingTask(task2);

		assert.ok(!bCalled1, "not yet called");
		assert.ok(!bCalled2, "not yet called");

		oCore.applyChanges();

		assert.ok(bCalled1, "first task called");
		assert.ok(bCalled2, "second task called");
	});

	QUnit.test("prerendering tasks: reverse order", function (assert) {
		var bCalled1 = false,
			bCalled2 = false;

		function task1 () {
			bCalled1 = true;
			assert.ok(!bCalled2, "not yet called");
		}

		function task2 () {
			bCalled2 = true;
		}

		oCore.addPrerenderingTask(task2);
		oCore.addPrerenderingTask(task1, true);

		assert.ok(!bCalled1, "not yet called");
		assert.ok(!bCalled2, "not yet called");

		oCore.applyChanges();

		assert.ok(bCalled1, "first task called");
		assert.ok(bCalled2, "second task called");
	});


	QUnit.module('getLibraryResourceBundle');

	QUnit.test("async: testGetLibraryResourceBundle", function(assert) {
		var oSpy = this.spy(ResourceBundle, 'create'),
			pBundle = oCore.getLibraryResourceBundle("sap.ui.core", "en", true);

		assert.ok(pBundle instanceof Promise, "a promise should be returned");

		return pBundle.then(function(oBundle) {
			assert.equal(oSpy.callCount, 1, "ResourceBundle.create is called");
			assert.ok(oBundle, "bundle could be retrieved");
			assert.equal(oBundle.getText("SAPUI5_FRIDAY"), "Friday", "bundle can resolve texts");
			assert.equal(oBundle.getText("SAPUI5_GM_ZSTEP"), "Zoom step {0}", "bundle can resolve texts");
		});
	});

	QUnit.test("async: testGetLibraryResourceBundle with already loaded bundle", function(assert) {
		return oCore.getLibraryResourceBundle("sap.ui.core", "de", true).then(function() {
			var oSpy = this.spy(ResourceBundle, 'create'),
				pBundle = oCore.getLibraryResourceBundle("sap.ui.core", "de", true);

			assert.ok(pBundle instanceof Promise, "a promise should be returned");

			return pBundle.then(function(oBundle) {
				assert.ok(oSpy.notCalled, "ResourceBundle.create is not called");
				assert.ok(oBundle, "bundle could be retrieved");
				assert.equal(oBundle.getText("SAPUI5_FRIDAY"), "Friday", "bundle can resolve texts");
				assert.equal(oBundle.getText("SAPUI5_GM_ZSTEP"), "Zoom step {0}", "bundle can resolve texts");
			});
		}.bind(this));
	});

	QUnit.test("async: testGetLibraryResourceBundle with i18n set to false in manifest.json", function(assert) {
		this.stub(sap.ui.loader._, 'getModuleState').returns(true);

		this.stub(LoaderExtensions, 'loadResource').returns({
			"_version": "1.9.0",
			"name": "sap.test1",
			"sap.ui5": {
				"library": {
					"i18n": false
				}
			}
		});

		var pBundle = oCore.getLibraryResourceBundle("sap.test1", "de", true);

		assert.ok(pBundle instanceof Promise, "a promise should be returned");

		return pBundle.then(function(oBundle) {
			assert.notOk(oBundle, "no bundle is loaded");
		});
	});

	QUnit.test("async: testGetLibraryResourceBundle with i18n set to true in manifest.json", function(assert) {
		this.stub(sap.ui.loader._, 'getModuleState').returns(true);
		var fnOrigLoadResource = LoaderExtensions.loadResource;
		this.stub(LoaderExtensions, 'loadResource').callsFake(function(sURL) {
			if (typeof sURL === "string" && sURL.indexOf("manifest.json") !== -1) {
				return {
					"_version": "1.9.0",
					"name": "sap.test.i18ntrue",
					"sap.ui5": {
						"library": {
							"i18n": true
						}
					}
				};
			} else {
				fnOrigLoadResource.apply(this, arguments);
			}

		});

		var oSpySapUiRequireToUrl = this.spy(sap.ui.require, 'toUrl'),
			pBundle = oCore.getLibraryResourceBundle("sap.test.i18ntrue", "de", true),
			oSpyCall;

		assert.ok(pBundle instanceof Promise, "a promise should be returned");
		assert.equal(oSpySapUiRequireToUrl.callCount, 2, "sap.ui.require.toUrl is called twice");

		oSpyCall = oSpySapUiRequireToUrl.getCall(0);

		assert.equal(oSpyCall.args[0], 'sap/test/i18ntrue/messagebundle.properties',
			'sap.ui.require.toUrl is called with the given message bundle name');

		return pBundle.then(function(oBundle) {
			assert.ok(oBundle, "Bundle should be loaded");
		});
	});

	QUnit.test("async: testGetLibraryResourceBundle with i18n missing in manifest.json", function(assert) {
		this.stub(sap.ui.loader._, 'getModuleState').returns(true);
		// no i18n property in manifest
		this.stub(LoaderExtensions, 'loadResource').returns(undefined);

		var oSpySapUiRequireToUrl = this.spy(sap.ui.require, 'toUrl'),
			pBundle = oCore.getLibraryResourceBundle("sap.test.i18nmissing", "fr", true),
			oSpyCall;

		assert.ok(pBundle instanceof Promise, "a promise should be returned");
		assert.equal(oSpySapUiRequireToUrl.callCount, 2, "sap.ui.require.toUrl is called twice");

		oSpyCall = oSpySapUiRequireToUrl.getCall(0);

		assert.equal(oSpyCall.args[0], 'sap/test/i18nmissing/messagebundle.properties',
			'sap.ui.require.toUrl is called with default message bundle name');

		oSpySapUiRequireToUrl.restore();

		return pBundle;
	});

	QUnit.test("async: testGetLibraryResourceBundle with a given i18n string in manifest.json", function(assert) {
		this.stub(sap.ui.loader._, 'getModuleState').returns(true);

		var fnOrigLoadResource = LoaderExtensions.loadResource;

		 this.stub(LoaderExtensions, 'loadResource').callsFake(function(sURL) {
			if (typeof sURL === "string" && sURL.indexOf("manifest.json") !== -1) {
				return {
					"_version": "1.9.0",
					"name": "sap.test.i18nstring",
					"sap.ui5": {
						"library": {
							"i18n": "i18n.properties"
						}
					}
				};
			} else {
				fnOrigLoadResource.apply(this, arguments);
			}

		});

		var oSpySapUiRequireToUrl = this.spy(sap.ui.require, 'toUrl'),
			pBundle = oCore.getLibraryResourceBundle("sap.test.i18nstring", "en", true),
			oSpyCall;

		assert.ok(pBundle instanceof Promise, "a promise should be returned");
		assert.equal(oSpySapUiRequireToUrl.callCount, 2, "sap.ui.require.toUrl is called twice");

		oSpyCall = oSpySapUiRequireToUrl.getCall(0);

		assert.equal(oSpyCall.args[0], 'sap/test/i18nstring/i18n.properties',
			'sap.ui.require.toUrl is called with the given message bundle name');

		oSpySapUiRequireToUrl.restore();

		return pBundle;
	});

	QUnit.test("async: testGetLibraryResourceBundle with a given i18n object in manifest.json", function(assert) {
		var mLibraryManifest = {
			"_version": "1.9.0",
			"name": "sap.test.i18nobject",
			"sap.ui5": {
				"library": {
					"i18n": {
						"bundleUrl": "i18n.properties",
						"supportedLocales": [
							"en",
							"de"
						]
					}
				}
			}
		};
		var oResourceBundleCreateMock = this.mock(ResourceBundle).expects('create').once().withExactArgs({
			async: true,
			fallbackLocale: undefined,
			locale: "en",
			supportedLocales: ["en", "de"],
			bundleUrl: "resources/sap/test/i18nobject/i18n.properties",
			activeTerminologies: undefined
		}).callThrough();

		this.stub(sap.ui.loader._, 'getModuleState').returns(true);

		var fnOrigLoadResource = LoaderExtensions.loadResource;

		this.stub(LoaderExtensions, 'loadResource').callsFake(function(sURL) {
			if (typeof sURL === "string" && sURL.indexOf("manifest.json") !== -1) {
				return mLibraryManifest;
			} else {
				fnOrigLoadResource.apply(this, arguments);
			}

		});

		var oSpySapUiRequireToUrl = this.spy(sap.ui.require, 'toUrl'),
			pBundle = oCore.getLibraryResourceBundle("sap.test.i18nobject", "en", true),
			oSpyCall;

		assert.ok(pBundle instanceof Promise, "a promise should be returned");
		assert.equal(oSpySapUiRequireToUrl.callCount, 2, "sap.ui.require.toUrl is called twice");

		oSpyCall = oSpySapUiRequireToUrl.getCall(0);

		assert.equal(oSpyCall.args[0], 'sap/test/i18nobject/i18n.properties',
			'sap.ui.require.toUrl is called with the given message bundle name');

		oSpySapUiRequireToUrl.restore();

		oResourceBundleCreateMock.restore();
		return pBundle;
	});

	// ---------------------------------------------------------------------------
	// loadLibrary
	// ---------------------------------------------------------------------------

	QUnit.module("loadLibrary", {
		beforeEach: function(assert) {
			assert.notOk(Configuration.getDebug(), "debug mode must be deactivated to properly test library loading");
			this.oConfigurationGetPreloadStub = sinon.stub(Configuration, "getPreload").returns("sync");
		},
		afterEach: function(assert) {
			this.oConfigurationGetPreloadStub.restore();
			delete window.testlibs;
		}
	});

	/*
	 * Scenario9: (mocked)
	 *	lib1 -> no dependencies
	 */
	QUnit.test("async (config object)", function(assert) {

		this.stub(sap.ui.loader._, "loadJSResourceAsync").callsFake(function() {
			sap.ui.predefine("testlibs/scenario9/lib1/library", function() {
				oCore.initLibrary({
					name: 'testlibs.scenario9.lib1',
					noLibraryCSS: true
				});
				return testlibs.scenario9.lib1;
			});
			return Promise.resolve(true);
		});

		var loaded = oCore.loadLibrary("testlibs.scenario9.lib1", {
			async: true,
			url: "./some/fancy/path"
		});
		assert.ok(loaded instanceof Promise, "loadLibrary should return a promise when called with async:true");
		assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith(sinon.match(/testlibs\/scenario9\/lib1\/library/)), "should have called _loadJSResourceAsync for library.js");
		assert.equal(sap.ui.require.toUrl('testlibs/scenario9/lib1'), "./some/fancy/path", "path should have been registered");

		return loaded;
	});

	/*
	 * Scenario10: (mocked)
	 *	lib1 -> no dependencies
	 */
	QUnit.test("async (convenience shortcut)", function(assert) {

		this.stub(sap.ui.loader._, "loadJSResourceAsync").callsFake(function() {
			sap.ui.predefine("testlibs/scenario10/lib1/library", function() {
				oCore.initLibrary({
					name: 'testlibs.scenario10.lib1',
					noLibraryCSS: true
				});
				return testlibs.scenario10.lib1;
			});
			return Promise.resolve(true);
		});

		var loaded = oCore.loadLibrary("testlibs.scenario10.lib1", true);
		assert.ok(loaded instanceof Promise, "loadLibrary should return a promise when called with async:true");
		assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith(sinon.match(/testlibs\/scenario10\/lib1\/library/)), "should have called _loadJSResourceAsync for library.js");

		return loaded;
	});

	/*
	 * Scenario11:
	 *	lib1 -> preload does not exist
	 */
	QUnit.test("async (missing preload)", function(assert) {

		this.stub(sap.ui.loader._, "loadJSResourceAsync").callsFake(function() {
			return Promise.reject(new Error());
		});
		this.stub(sap.ui, "require").callsFake(function(name, callback) {
			oCore.initLibrary({
				name: 'testlibs.scenario11.lib1',
				noLibraryCSS: true
			});
			setTimeout(function() {
				callback({});
			}, 0);
		});

		var loaded = oCore.loadLibrary("testlibs.scenario11.lib1", true);
		assert.ok(loaded instanceof Promise, "loadLibrary should return a promise when called with async:true");
		assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith(sinon.match(/testlibs\/scenario11\/lib1\/library/)), "should have called _loadJSResourceAsync for library.js");

		return loaded.then(function() {
			assert.ok(sap.ui.require.calledWith(['testlibs/scenario11/lib1/library']), "should have called sap.ui.require for library.js");
			assert.ok(true, "promise for a library without preload should resolve");
		}, function() {
			assert.ok(false, "promise for a library without preload should not be rejected");
		});

	});

	/*
	 * Scenario12:
	 *	lib1 -> does not exist
	 */
	QUnit.test("async (missing library)", function(assert) {

		this.stub(sap.ui.loader._, "loadJSResourceAsync").callsFake(function() {
			return Promise.reject(new Error());
		});

		var loaded = oCore.loadLibrary("testlibs.scenario12.lib1", true);
		assert.ok(loaded instanceof Promise, "loadLibrary should return a promise when called with async:true");
		assert.ok(sap.ui.loader._.loadJSResourceAsync.calledWith(sinon.match(/testlibs\/scenario12\/lib1\/library/)), "should have called _loadJSResourceAsync for library.js");

		return loaded.then(function() {
			assert.ok(false, "promise for a missing library should not resolve");
		}, function() {
			assert.ok(true, "promise for a missing library should be rejected");
		});

	});

	/*
	 * Scenario14:
	 *
	 *   lib1 (js)
	 *     -> lib2 (js), lib5 (js)
	 *   lib2 (js)
	 *     -> lib3 (js), lib5 (js, lazy: true), lib6 (js)
	 */
	QUnit.test("multiple libs (async, preloads) with transitive dependency closure, one lib is not in the sap.ui.versioninfo", function(assert) {

		// make lib4 already loaded
		sap.ui.predefine('testlibs/scenario14/lib4/library', [], function() {
			oCore.initLibrary({
				name: 'testlibs.scenario14.lib4'
			});
			return testlibs.scenario14.lib4;
		});

		return LoaderExtensions.loadResource({
			dataType: "json",
			url: sap.ui.require.toUrl("testlibs/scenario14/sap-ui-version.json"),
			async: true
		}).then(function(versioninfo) {
			sap.ui.versioninfo = versioninfo;

			this.spy(sap.ui.loader._, 'loadJSResourceAsync');
			this.spy(sap.ui, 'require');
			this.spy(sap.ui, 'requireSync');

			var vResult = oCore.loadLibraries(['testlibs.scenario14.lib8']);
			// initial request for lib 8 preload
			sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib8\/library-preload\.js$/));

			// loading of other libs should not be triggered yet
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib1\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib2\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib3\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib4\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib5\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib6\/library-preload\.js$/));
			sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib7\/library-preload\.js$/));

			assert.ok(vResult instanceof Promise, "async call to loadLibraries should return a promise");

			return vResult.then(function(vResult) {
				assert.strictEqual(vResult, undefined, "Promise should have no fulfillment value");

				// 1-3
				assert.isLibLoaded('testlibs.scenario14.lib1');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib1\/library-preload\.js$/));
				assert.isLibLoaded('testlibs.scenario14.lib2');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib2\/library-preload\.js$/));
				assert.isLibLoaded('testlibs.scenario14.lib3');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib3\/library-preload\.js$/));

				// lib 4 is already loaded
				assert.isLibLoaded('testlibs.scenario14.lib4');
				sinon.assert.neverCalledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib4\/library-preload\.js$/));

				// 5-7
				assert.isLibLoaded('testlibs.scenario14.lib5');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib5\/library-preload\.js$/));
				assert.isLibLoaded('testlibs.scenario14.lib6');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib6\/library-preload\.js$/));
				assert.isLibLoaded('testlibs.scenario14.lib7');
				sinon.assert.calledWith(sap.ui.loader._.loadJSResourceAsync, sinon.match(/scenario14\/lib7\/library-preload\.js$/));
			});
		}.bind(this));
	});

	QUnit.test("Test piggyback access of private Core methods", function(assert) {

		var oCoreInternals;
		var oErrorLogSpy = this.spy(Log, "error");

		oCore.registerPlugin({
			startPlugin : function(oCore) {
				oCoreInternals = oCore;
			}
		});

		var oElementA = new Element("A");
		var oElementB = new Element("B");

		assert.ok(Object.keys(oCoreInternals.mElements).length, 2, "Return all registered Element instances");
		assert.equal(oErrorLogSpy.getCall(0).args[0], "oCore.mElements was a private member and has been removed. Use one of the methods in sap.ui.core.Element.registry instead", "Logs error on private methode access");

		oElementA.destroy();
		oElementB.destroy();
	});

});
