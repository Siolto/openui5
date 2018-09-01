sap.ui.define(["sap/base/Log", "fixture/async-sync-conflict/SomeControlRenderer"], function(Log, Renderer) {
	"use strict";
	Log.info("executing SomeControl");
	Renderer.someProperty = "some value";
	Log.info("property attached");
	return function SomeControl(){};
});
