/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/Context",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterProcessor",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v2/ODataListBinding",
	"sap/ui/test/TestUtils"
], function (Log, ChangeReason, Context, Filter, FilterOperator, FilterProcessor, CountMode,
		ODataUtils, OperationMode, ODataListBinding, TestUtils) {
	/*global QUnit,sinon*/
	/*eslint max-nested-callbacks: 0*/
	"use strict";

	//*********************************************************************************************
	QUnit.module("sap.ui.model.odata.v2.ODataListBinding (ODataListBindingNoFakeService)", {
		beforeEach : function () {
			this.oLogMock = this.mock(Log);
			this.oLogMock.expects("error").never();
			this.oLogMock.expects("warning").never();
		},

		afterEach : function (assert) {
			return TestUtils.awaitRendering();
		}
	});

	//*********************************************************************************************
[
	{transitionMessagesOnly : true, headers : {"sap-messages" : "transientOnly"}},
	{transitionMessagesOnly : false, headers : undefined}
].forEach(function (oFixture, i) {
	QUnit.test("loadData calls read w/ parameters refresh, headers, " + i, function (assert) {
		var oBinding, oRemoveExpectation, oResetDataExpectation,
			oContext = {},
			oModel = {
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				read : function () {},
				resolveDeep : function () {}
			},
			bRefresh = "{boolean} bRefresh";

		this.mock(oModel).expects("createCustomParams").withExactArgs(undefined).returns("~custom");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("path", sinon.match.same(oContext))
			.returns("~deep");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList")
			.withExactArgs()
			.returns(false);

		oRemoveExpectation = this.mock(ODataListBinding.prototype)
			.expects("_removePersistedCreatedContexts")
			.withExactArgs();
		oResetDataExpectation = this.mock(ODataListBinding.prototype).expects("resetData")
			.withExactArgs();
		this.mock(ODataListBinding.prototype).expects("_reassignCreateActivate").withExactArgs();

		oBinding = new ODataListBinding(oModel, "path", oContext);

		assert.ok(oResetDataExpectation.calledImmediatelyAfter(oRemoveExpectation));

		this.mock(oBinding).expects("_addFilterQueryOption").withExactArgs([], true);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~path");
		oBinding.bSkipDataEvents = true;
		oBinding.bRefresh = bRefresh;
		oBinding.bTransitionMessagesOnly = oFixture.transitionMessagesOnly;

		this.mock(oModel).expects("read").withExactArgs("path", {
				headers : oFixture.headers,
				canonicalRequest : undefined,
				context : sinon.match.same(oContext),
				error : sinon.match.func,
				groupId : undefined,
				success : sinon.match.func,
				updateAggregatedMessages : bRefresh,
				urlParameters : ["~custom"]
			});

		// code under test
		oBinding.loadData();
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bUseClientMode) {
	var sTitle = "loadData: calls _addFilterQueryOption; client mode=" + bUseClientMode;

	QUnit.test(sTitle, function (assert) {
		var oModel = {read : function () {}},
			oBinding = {
				oModel : oModel,
				sPath : "/~Path",
				mRequestHandles : {},
				bSkipDataEvents : true,
				_addFilterQueryOption : function () {},
				isRelative : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(bUseClientMode);
		this.mock(oBinding).expects("_addFilterQueryOption")
			.withExactArgs([], !bUseClientMode)
			.callsFake(function (aParams) {
				aParams.push("~filter"); // simulate _addFilterQueryOption implementation
			});
		this.mock(oBinding).expects("isRelative").withExactArgs().returns(false);
		this.mock(oModel).expects("read").withExactArgs("/~Path", {
				canonicalRequest : undefined,
				context : undefined,
				error : sinon.match.func,
				groupId : undefined,
				headers : undefined,
				success : sinon.match.func,
				updateAggregatedMessages : undefined,
				urlParameters : ["~filter"]
			});

		// code under test
		ODataListBinding.prototype.loadData.call(oBinding);
	});
});

	//*********************************************************************************************
[
	{operationMode : OperationMode.Auto, useFilterParams : false},
	{operationMode : OperationMode.Client, useFilterParams : true},
	{operationMode : OperationMode.Default, useFilterParams : true},
	{operationMode : OperationMode.Server, useFilterParams : true}
].forEach(function (oFixture) {
	var sTitle = "_getLength: calls _addFilterQueryOption; operation mode="
			+ oFixture.operationMode;

	QUnit.test(sTitle, function (assert) {
		var oModel = {read : function () {}},
			oBinding = {
				sCountMode : CountMode.Request,
				oModel : oModel,
				sOperationMode : oFixture.operationMode,
				sPath : "/~Path",
				_addFilterQueryOption : function () {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("_addFilterQueryOption")
			.withExactArgs([], oFixture.useFilterParams)
			.callsFake(function (aParams) {
				aParams.push("~filter"); // simulate _addFilterQueryOption implementation
			});
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("/~Path");

		this.mock(oModel).expects("read").withExactArgs("/~Path/$count", {
				canonicalRequest : undefined,
				context : undefined,
				error : sinon.match.func,
				groupId : undefined,
				success : sinon.match.func,
				urlParameters : ["~filter"],
				withCredentials : undefined
			});

		// code under test
		ODataListBinding.prototype._getLength.call(oBinding);
	});
});

	//*********************************************************************************************
[
	{parameters : undefined, expected : false},
	{parameters : {}, expected : false},
	{parameters : {foo : "bar"}, expected : false},
	{parameters : {transitionMessagesOnly : false}, expected : false},
	{parameters : {transitionMessagesOnly : 0}, expected : false},
	{parameters : {transitionMessagesOnly : true}, expected : true},
	{parameters : {transitionMessagesOnly : {}}, expected : true}
].forEach(function (oFixture, i) {
	var sTitle = "constructor: createdEntitiesKey and parameter transitionMessagesOnly, " + i;

	QUnit.test(sTitle, function (assert) {
		var oBinding,
			oModel = {
				read : function () {},
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				resolve : function () {},
				resolveDeep : function () {}
			};

		this.mock(oModel).expects("createCustomParams")
			.withExactArgs(sinon.match.same(oFixture.parameters))
			.returns("~custom");
		this.mock(oModel).expects("resolveDeep").withExactArgs("path", "context").returns("~deep");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList").withExactArgs()
			.returns(true);
		this.mock(ODataListBinding.prototype).expects("_reassignCreateActivate").withExactArgs();

		// code under test
		oBinding = new ODataListBinding(oModel, "path", "context", undefined /*aSorters*/,
			undefined /*aFilters*/, oFixture.parameters);

		assert.strictEqual(oBinding.bTransitionMessagesOnly, oFixture.expected);
	});
});

	//*********************************************************************************************
	QUnit.test("constructor: remove persisted created contexts without expanded list",
			function (assert) {
		var oModel = {
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				resolveDeep : function () {}
			};

		this.mock(oModel).expects("createCustomParams").withExactArgs(undefined).returns("~custom");
		this.mock(oModel).expects("resolveDeep").withExactArgs("path", "context").returns("~deep");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList")
			.withExactArgs()
			.returns(false);
		this.mock(ODataListBinding.prototype).expects("_removePersistedCreatedContexts")
			.withExactArgs();
		this.mock(ODataListBinding.prototype).expects("resetData").withExactArgs();
		this.mock(ODataListBinding.prototype).expects("_reassignCreateActivate").withExactArgs();

		// code under test
		assert.ok(new ODataListBinding(oModel, "path", "context"));
	});

	//*********************************************************************************************
[
	{parameters : undefined, expected : ""},
	{parameters : {}, expected : ""},
	{parameters : {createdEntitiesKey : ""}, expected : ""},
	{parameters : {createdEntitiesKey : "bar"}, expected : "bar"}
].forEach(function (oFixture, i) {
	QUnit.test("constructor: createdEntitiesKey parameter, #" + i, function (assert) {
		var oBinding,
			oModel = {
				read : function () {},
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				resolve : function () {},
				resolveDeep : function () {}
			};

		this.mock(oModel).expects("createCustomParams")
			.withExactArgs(sinon.match.same(oFixture.parameters))
			.returns("~custom");
		this.mock(oModel).expects("resolveDeep").withExactArgs("path", "context").returns("~deep");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList").withExactArgs()
			.returns(true);
		this.mock(ODataListBinding.prototype).expects("_reassignCreateActivate").withExactArgs();

		// code under test
		oBinding = new ODataListBinding(oModel, "path", "context", undefined /*aSorters*/,
			undefined /*aFilters*/, oFixture.parameters);

		assert.strictEqual(oBinding.sCreatedEntitiesKey, oFixture.expected);
	});
});

	//*********************************************************************************************
	QUnit.test("constructor: defaulting w/o mParameters", function (assert) {
		var oBinding,
			oModel = {
				sDefaultCountMode : "~sDefaultCountMode",
				sDefaultOperationMode : "~sDefaultOperationMode",
				bPreliminaryContext : "~bPreliminaryContext",
				checkFilterOperation : function () {},
				createCustomParams : function () {},
				resolveDeep : function () {}
			};

		this.mock(oModel).expects("createCustomParams").withExactArgs(undefined).returns("~custom");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~sPath", "~oContext")
			.returns("~sDeepPath");
		this.mock(oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(ODataListBinding.prototype).expects("checkExpandedList")
			.withExactArgs()
			.returns(true);
		this.mock(ODataListBinding.prototype).expects("_reassignCreateActivate").withExactArgs();

		// code under test
		oBinding = new ODataListBinding(oModel, "~sPath", "~oContext");

		assert.strictEqual(oBinding.sFilterParams, null);
		assert.strictEqual(oBinding.sSortParams, null);
		assert.strictEqual(oBinding.sRangeParams, null);
		assert.strictEqual(oBinding.sCustomParams, "~custom");
		assert.strictEqual(oBinding.mCustomParams, undefined);
		assert.strictEqual(oBinding.iStartIndex, 0);
		assert.strictEqual(oBinding.iLength, 0);
		assert.strictEqual(oBinding.bPendingChange, false);
		assert.strictEqual(oBinding.aAllKeys, null);
		assert.deepEqual(oBinding.aKeys, []);
		assert.strictEqual(oBinding.sCountMode, "~sDefaultCountMode");
		assert.strictEqual(oBinding.sOperationMode, "~sDefaultOperationMode");
		assert.strictEqual(oBinding.bCreatePreliminaryContext, "~bPreliminaryContext");
		assert.strictEqual(oBinding.bUsePreliminaryContext, "~bPreliminaryContext");
		assert.strictEqual(oBinding.bRefresh, false);
		assert.strictEqual(oBinding.bNeedsUpdate, false);
		assert.strictEqual(oBinding.bDataAvailable, false);
		assert.strictEqual(oBinding.bIgnoreSuspend, false);
		assert.strictEqual(oBinding.bPendingRefresh, false);
		assert.strictEqual(oBinding.sGroupId, undefined);
		assert.strictEqual(oBinding.sRefreshGroupId, undefined);
		assert.strictEqual(oBinding.bLengthRequested, false);
		assert.strictEqual(oBinding.bUseExtendedChangeDetection, false);
		assert.strictEqual(oBinding.bFaultTolerant, undefined);
		assert.strictEqual(oBinding.bLengthFinal, false);
		assert.strictEqual(oBinding.iLastEndIndex, 0);
		assert.strictEqual(oBinding.aLastContexts, null);
		assert.strictEqual(oBinding.aLastContextData, null);
		assert.strictEqual(oBinding.bInitial, true);
		assert.deepEqual(oBinding.mRequestHandles, {});
		assert.strictEqual(oBinding.oCountHandle, null);
		assert.strictEqual(oBinding.bSkipDataEvents, false);
		assert.strictEqual(oBinding.bUseExpandedList, false);
		assert.strictEqual(oBinding.oCombinedFilter, null);
		assert.strictEqual(oBinding.sDeepPath, "~sDeepPath");
		assert.strictEqual(oBinding.bCanonicalRequest, undefined);
		assert.deepEqual(oBinding.mNormalizeCache, {});
		assert.strictEqual(oBinding.bTransitionMessagesOnly, false);
		assert.strictEqual(oBinding.sCreatedEntitiesKey, "");
		assert.deepEqual(oBinding.oCreatedPersistedToRemove, new Set());
		assert.strictEqual(oBinding.iThreshold, 0);
		assert.strictEqual(oBinding.bThresholdRejected, false);
	});

	//*********************************************************************************************
["resolvedPath", undefined, null].forEach(function (sResolvedPath) {
	QUnit.test("_checkDataStateMessages: with deepPath: " + sResolvedPath, function (assert) {
		var oModel = {
				getMessagesByPath : function () {}
			},
			oBinding = {
				sDeepPath : "deepPath",
				oModel : oModel
			},
			oDataState = {
				setModelMessages : function () {}
			},
			aMessagesByPath = "aMessages";

		this.mock(oModel).expects("getMessagesByPath").withExactArgs("deepPath", true)
			.exactly(sResolvedPath === "resolvedPath" ? 1 : 0)
			.returns(aMessagesByPath);
		this.mock(oDataState).expects("setModelMessages").withExactArgs(aMessagesByPath)
			.exactly(sResolvedPath === "resolvedPath" ? 1 : 0);

		// code under test
		ODataListBinding.prototype._checkDataStateMessages.call(oBinding, oDataState, sResolvedPath);
	});
});

	//*********************************************************************************************
	QUnit.test("_getFilterForPredicate: keys for predicate known", function (assert) {
		var oBinding = {},
			oDataUtilsMock = this.mock(ODataUtils),
			oExpectedFilter = new Filter({
				and : true,
				filters : [
					new Filter("SalesOrderID", FilterOperator.EQ, "~42~"),
					new Filter("ItemPosition", FilterOperator.EQ, "~10~")
				]
			}),
			sPredicate = "(SalesOrderID='42',ItemPosition='10')";

		oDataUtilsMock.expects("parseValue").withExactArgs("'10'").returns("~10~");
		oDataUtilsMock.expects("parseValue").withExactArgs("'42'").returns("~42~");

		// code under test
		assert.deepEqual(
			ODataListBinding.prototype._getFilterForPredicate.call(oBinding, sPredicate),
			oExpectedFilter);
	});

	//*********************************************************************************************
	QUnit.test("_getFilterForPredicate: key for predicate unknown", function (assert) {
		var oModel = {
				oMetadata : {
					getKeyPropertyNamesByPath : function () {}
				}
			},
			oBinding = {
				sDeepPath : "~deepPath~",
				oModel : oModel
			};

		this.mock(oModel.oMetadata).expects("getKeyPropertyNamesByPath")
			.withExactArgs("~deepPath~")
			.returns(["SalesOrderID"]);
		this.mock(ODataUtils).expects("parseValue").withExactArgs("'42'").returns("~42~");

		// code under test
		assert.deepEqual(ODataListBinding.prototype._getFilterForPredicate.call(oBinding, "('42')"),
			new Filter("SalesOrderID", FilterOperator.EQ, "~42~"));
	});

	//*********************************************************************************************
	QUnit.test("_getFilterForPredicate: encoded key predicates; integrative", function (assert) {
		var oExpectedFilter = new Filter({
				bAnd : true,
				aFilters : [
					new Filter("string", FilterOperator.EQ, "abc123' !\"§$%&/()=:;/?+"),
					new Filter("datetime", FilterOperator.EQ,
						new Date(Date.UTC(2021, 5, 18, 9, 50, 58))),
					new Filter("datetimems", FilterOperator.EQ,
						new Date(Date.UTC(2021, 5, 19, 9, 50, 58, 123))),
					new Filter("datetimeoffset", FilterOperator.EQ,
						new Date(Date.UTC(2021, 5, 20, 9, 50, 58))),
					new Filter("time", FilterOperator.EQ,
						{"__edmType" : "Edm.Time", "ms" : 34936000}),
					new Filter("guid", FilterOperator.EQ, "42010aef-0de5-1edb-aead-63ba217fb0e7"),
					new Filter("null", FilterOperator.EQ, null),
					new Filter("decimal", FilterOperator.EQ, "-1.23"),
					new Filter("double", FilterOperator.EQ, "-2.34"),
					new Filter("float", FilterOperator.EQ, "-3.45"),
					new Filter("int64", FilterOperator.EQ, "-123"),
					new Filter("sbyte", FilterOperator.EQ, -78),
					new Filter("byte", FilterOperator.EQ, 255),
					new Filter("true", FilterOperator.EQ, true),
					new Filter("false", FilterOperator.EQ, false),
					new Filter("binary", FilterOperator.EQ, "0123456789abcdef")
				]
			}),
			sPredicate = "("
				+ "string='abc123''%20%21%22%c2%a7%24%25%26%2f%28%29%3d%3a%3b%2f%3f%2b',"
				+ "datetime=datetime'2021-06-18T09%3a50%3a58',"
				+ "datetimems=datetime'2021-06-19T09%3a50%3a58.123',"
				+ "datetimeoffset=datetimeoffset'2021-06-20T09%3a50%3a58Z',"
				// for following data types encoded characters cannot be in the key predicate
				+ "time=time'PT09H42M16S',"
				+ "guid=guid'42010aef-0de5-1edb-aead-63ba217fb0e7'," // only [A-Fa-f0-9] allowed
				+ "null=null,"
				+ "decimal=-1.23m,"
				+ "double=-2.34d,"
				+ "float=-3.45f,"
				+ "int64=-123l,"
				+ "sbyte=-78,"
				+ "byte=255,"
				+ "true=true,"
				+ "false=false,"
				+ "binary=binary'0123456789abcdef'" // [A-Fa-f0-9][A-Fa-f0-9]*
				+ ")";

		// code under test
		assert.deepEqual(ODataListBinding.prototype._getFilterForPredicate.call({}, sPredicate),
			oExpectedFilter);
	});

	//*********************************************************************************************
	QUnit.test("requestFilterForMessages: unresolved", function (assert) {
		var oModel = {getMessagesByPath : function () {}},
			oBinding = {
				oModel : oModel,
				getResolvedPath : function () {}
			},
			oPromise;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);
		this.mock(oModel).expects("getMessagesByPath").never();

		// code under test
		oPromise = ODataListBinding.prototype.requestFilterForMessages.call(oBinding);

		assert.ok(oPromise instanceof Promise);

		return oPromise.then(function (oFilter) {
			assert.strictEqual(oFilter, null);
		});
	});

	//*********************************************************************************************
[true, false].forEach(function (bWithFilter) {
	[{
		aFilterForPredicate : [],
		aMessages : [] // contains sap.ui.core.message.Message objects
	}, {
		aFilterForPredicate : bWithFilter ? [] : ["(~keyPredicate~)"],
		aMessages : [{aFullTargets : ["~deepPath~(~keyPredicate~)"], message : "out"}]
	}, {
		aFilterForPredicate : ["(~keyPredicate~)"],
		aMessages : [{aFullTargets : ["~deepPath~(~keyPredicate~)"], message : "in"}]
	}, {
		aFilterForPredicate : bWithFilter
			? ["(~keyPredicate0~)", "(~keyPredicate2~)"]
			: ["(~keyPredicate0~)", "(~keyPredicate1~)", "(~keyPredicate2~)", "(~keyPredicate3~)"],
		aMessages : [
			{aFullTargets : ["~deepPath~"], message : "out"},
			{aFullTargets : ["~deepPath~(~keyPredicate0~)/foo"], message : "in"},
			{aFullTargets : ["~deepPath~(~keyPredicate1~)"], message : "out"},
			{aFullTargets : ["~deepPath~(~keyPredicate2~)"], message : "in"},
			{aFullTargets : ["~deepPath~(~keyPredicate3~)"], message : "out"}
		]
	}, {
		aFilterForPredicate : ["(~keyPredicate~)"],
		aMessages : [{
			aFullTargets : ["~deepPath~(~keyPredicate~)/A", "~deepPath~(~keyPredicate~)/B"],
			message : "in"
		}]
	}, {
		aFilterForPredicate : ["(~keyPredicate1~)", "(~keyPredicate2~)"],
		aMessages : [{
			aFullTargets : ["~deepPath~(~keyPredicate1~)/A", "~deepPath~(~keyPredicate2~)/B"],
			message : "in"
		}]
	}, {
		aFilterForPredicate : ["(~keyPredicate~)"],
		aMessages : [{
			aFullTargets : ["~parentEntity~", "~deepPath~(~keyPredicate~)/B"],
			message : "in"
		}]
	}].forEach(function (oFixture, i) {
	var sTitle = "requestFilterForMessages: with filter: " + bWithFilter + ", " + i;

	QUnit.test(sTitle, function (assert) {
		var oCallback = {
				fnFilter : function () {}
			},
			oCallbackMock = this.mock(oCallback),
			aFilterForPredicate = oFixture.aFilterForPredicate,
			aFilters = [],
			aMessages = oFixture.aMessages,
			oModel = {getMessagesByPath : function () {}},
			oBinding = {
				sDeepPath : "~deepPath~",
				oModel : oModel,
				_getFilterForPredicate : function () {},
				getResolvedPath : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oPromise;

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("resolvedPath");
		this.mock(oModel).expects("getMessagesByPath").withExactArgs("~deepPath~", true)
			.returns(aMessages);
		if (aMessages.length && bWithFilter) {
			aMessages.forEach(function (oMessage) {
				oCallbackMock.expects("fnFilter").withExactArgs(sinon.match.same(oMessage))
					.returns(oMessage.message === "in");
			});
		} else {
			oCallbackMock.expects("fnFilter").never();
		}
		if (aFilterForPredicate.length) {
			aFilterForPredicate.forEach(function (sPredicate) {
				var oFilter = new Filter("~property~", FilterOperator.EQ, "~value~");

				oBindingMock.expects("_getFilterForPredicate").withExactArgs(sPredicate)
					.returns(oFilter);
				aFilters.push(oFilter);
			});
		} else {
			oBindingMock.expects("_getFilterForPredicate").never();
		}

		// code under test
		oPromise = ODataListBinding.prototype.requestFilterForMessages
			.call(oBinding, bWithFilter ? oCallback.fnFilter : undefined);

		assert.ok(oPromise instanceof Promise);

		return oPromise.then(function (oFilter) {
			if (aFilters.length === 0) {
				assert.strictEqual(oFilter, null);
			} else if (aFilters.length === 1) {
				assert.deepEqual(oFilter, aFilters[0]);
			} else {
				assert.strictEqual(oFilter.bAnd, undefined);
				assert.deepEqual(oFilter.aFilters, aFilters);
			}
		});
	});
	});
});

	//*********************************************************************************************
[{
	bInitial : true,
	bTransient : false
}, {
	bInitial : true,
	bIsLoaded : false,
	bTransient : false
}, {
	bInitial : false,
	bIsLoaded : true,
	bTransient : false
}, {
	bInitial : true,
	bIsLoaded : true,
	bTransient : true
}].forEach(function (oFixture, i) {
	QUnit.test("initialize: not yet ready for initialization, #" + i, function (assert) {
		var oBinding = {
				bInitial : oFixture.bInitial,
				oModel : {},
				_hasTransientParentContext : function () {}
			},
			bCallsHasTransientParentContext = oFixture.bInitial && oFixture.bIsLoaded;

		if ("bIsLoaded" in oFixture) {
			oBinding.oModel.oMetadata = {isLoaded : function () {}};
			this.mock(oBinding.oModel.oMetadata).expects("isLoaded")
				.withExactArgs()
				.returns(oFixture.bIsLoaded);
		}
		this.mock(oBinding).expects("_hasTransientParentContext")
			.withExactArgs()
			.exactly(bCallsHasTransientParentContext ? 1 : 0)
			.returns(oFixture.bTransient);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.initialize.call(oBinding), oBinding);
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bBoundToList) {
	[true, false].forEach(function (bSuspended) {
		[true, false].forEach(function (bDataAvailable) {
	var sTitle = "initialize: initialize, bound to a list: " + bBoundToList
			+ ", suspended: " + bSuspended + ", data available: " + bDataAvailable;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				bDataAvailable : bDataAvailable,
				bInitial : true,
				oModel : {
					oMetadata : {
						isLoaded : function () {}
					}
				},
				bSuspended : bSuspended,
				_checkPathType : function () {},
				_fireChange : function () {},
				_fireRefresh : function () {},
				_hasTransientParentContext : function () {},
				_initSortersFilters : function () {},
				checkDataState : function () {},
				getResolvedPath : function () {},
				resetData : function () {}
			},
			sResolvedPath = "~resolvedPath";

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding.oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		this.mock(oBinding).expects("_checkPathType").withExactArgs().returns(bBoundToList);
		this.mock(oBinding).expects("getResolvedPath")
			.withExactArgs()
			.exactly(bBoundToList ? 0 : 1)
			.returns(sResolvedPath);
		this.oLogMock.expects("error")
			.withExactArgs("List Binding is not bound against a list for ~resolvedPath")
			.exactly(bBoundToList ? 0 : 1);
		this.mock(oBinding).expects("_initSortersFilters").withExactArgs();
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change})
			.exactly(!bSuspended && bDataAvailable ? 1 : 0);
		this.mock(oBinding).expects("resetData")
			.withExactArgs()
			.exactly(!bSuspended && !bDataAvailable ? 1 : 0);
		this.mock(oBinding).expects("_fireRefresh")
			.withExactArgs({reason : ChangeReason.Refresh})
			.exactly(!bSuspended && !bDataAvailable ? 1 : 0);
		this.mock(oBinding).expects("checkDataState").withExactArgs();

		// code under test
		assert.strictEqual(ODataListBinding.prototype.initialize.call(oBinding), oBinding);

		assert.strictEqual(oBinding.bInitial, false);
	});
		});
	});
});

	//*********************************************************************************************
	QUnit.test("setContext: calls checkDataState if context changes; no created contexts",
			function (assert) {
		var oRefreshExpectation, oRemoveExpectation,
			oModel = {resolveDeep : function () {}},
			oBinding = {
				oContext : "~oContext",
				bInitial : false,
				oModel : oModel,
				sPath : "~sPath",
				_checkPathType : function () {},
				_hasTransientParentContext : function () {},
				_initSortersFilters : function () {},
				_refresh : function () {},
				_removePersistedCreatedContexts : function () {},
				checkDataState : function () {},
				checkExpandedList : function () {},
				getResolvedPath : function () {},
				isRelative : function () {},
				isResolved : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oNewContext = {
				isPreliminary : function () {},
				isRefreshForced : function () {},
				isUpdated : function () {}
			};

		oBindingMock.expects("isRelative").withExactArgs().returns(true);
		this.mock(Context).expects("hasChanged")
			.withExactArgs("~oContext", sinon.match.same(oNewContext))
			.returns(true);
		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oBindingMock.expects("_hasTransientParentContext").withExactArgs().returns(false);
		oBindingMock.expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oNewContext))
			.returns("~resolvedDeepPath");
		oBindingMock.expects("_checkPathType").withExactArgs().returns(true);
		oBindingMock.expects("checkDataState").withExactArgs();
		oBindingMock.expects("_hasTransientParentContext").withExactArgs().returns(false);
		oBindingMock.expects("_initSortersFilters").withExactArgs();
		oBindingMock.expects("checkExpandedList").withExactArgs().returns(false);
		oRemoveExpectation = oBindingMock.expects("_removePersistedCreatedContexts")
			.withExactArgs();
		oRefreshExpectation = oBindingMock.expects("_refresh").withExactArgs();

		// code under test
		ODataListBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(oBinding.oContext, oNewContext);
		assert.ok(oRefreshExpectation.calledImmediatelyAfter(oRemoveExpectation));
	});

	//*********************************************************************************************
	QUnit.test("setContext: new context is transient", function (assert) {
		var oModel = {resolveDeep : function () {}},
			oBinding = {
				oContext : "~oContext",
				oModel : oModel,
				sPath : "~sPath",
				_checkPathType : function () {},
				_fireChange : function () {},
				_hasTransientParentContext : function () {},
				checkDataState : function () {},
				getResolvedPath : function () {},
				isRelative : function () {},
				isResolved : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oNewV2Context = {
				isPreliminary : function () {},
				isRefreshForced : function () {},
				isUpdated : function () {}
			};

		this.mock(oNewV2Context).expects("isRefreshForced").withExactArgs().returns(false);
		this.mock(oNewV2Context).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oNewV2Context).expects("isUpdated").withExactArgs().returns(false);
		oBindingMock.expects("isRelative").withExactArgs().returns(true);
		this.mock(Context).expects("hasChanged")
			.withExactArgs("~oContext", sinon.match.same(oNewV2Context))
			.returns(true);
		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oBindingMock.expects("_hasTransientParentContext").withExactArgs().returns(false);
		oBindingMock.expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oNewV2Context))
			.returns("~resolvedDeepPath");
		oBindingMock.expects("_checkPathType").withExactArgs().returns(true);
		oBindingMock.expects("checkDataState").withExactArgs();
		oBindingMock.expects("_hasTransientParentContext").withExactArgs().returns(true);
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Context});

		// code under test
		ODataListBinding.prototype.setContext.call(oBinding, oNewV2Context);

		assert.strictEqual(oBinding.aAllKeys, null);
		assert.deepEqual(oBinding.aKeys, []);
		assert.strictEqual(oBinding.iLength, 0);
		assert.strictEqual(oBinding.bLengthFinal, true);
	});

	//*********************************************************************************************
[undefined, null, {}].forEach(function (oOldContext, i) {
	[undefined, null, {}].forEach(function (oNewContext, j) {
	var sTitle = "setContext: no _fireChange for falsy and transient transitions #" + i + ", " + j;

	QUnit.test(sTitle, function (assert) {
		var oModel = {resolveDeep : function () {}},
			oBinding = {
				oContext : oOldContext,
				oModel : oModel,
				sPath : "~sPath",
				_checkPathType : function () {},
				_hasTransientParentContext : function () {},
				checkDataState : function () {},
				getResolvedPath : function () {},
				isRelative : function () {},
				isResolved : function () {}
			},
			oBindingMock = this.mock(oBinding);

		if (oNewContext) {
			oNewContext.isPreliminary = function () {};
			oNewContext.isRefreshForced = function () {};
			oNewContext.isUpdated = function () {};
			this.mock(oNewContext).expects("isRefreshForced").withExactArgs().returns(false);
			this.mock(oNewContext).expects("isPreliminary").withExactArgs().returns(false);
			this.mock(oNewContext).expects("isUpdated").withExactArgs().returns(false);
		}
		oBindingMock.expects("isRelative").withExactArgs().returns(true);
		this.mock(Context).expects("hasChanged")
			.withExactArgs(sinon.match.same(oOldContext), sinon.match.same(oNewContext))
			.returns(true);
		oBindingMock.expects("isResolved").withExactArgs().returns(!!oOldContext);
		oBindingMock.expects("_hasTransientParentContext")
			.withExactArgs()
			.exactly(oOldContext ? 1 : 0)
			.returns(true);
		oBindingMock.expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oNewContext))
			.returns("~resolvedDeepPath");
		oBindingMock.expects("_checkPathType").withExactArgs().returns(true);
		oBindingMock.expects("checkDataState").withExactArgs();
		oBindingMock.expects("_hasTransientParentContext").withExactArgs().returns(true);

		// code under test
		ODataListBinding.prototype.setContext.call(oBinding, oNewContext);

		assert.strictEqual(oBinding.aAllKeys, null);
		assert.deepEqual(oBinding.aKeys, []);
		assert.strictEqual(oBinding.iLength, 0);
		assert.strictEqual(oBinding.bLengthFinal, true);
	});
	});
});

	//*********************************************************************************************
	QUnit.test("setContext: set updated context while there are transient entities",
			function (assert) {
		var oRefreshExpectation, oRemoveExpectation,
			oContext = {
				isPreliminary : function () {},
				isRefreshForced : function () {},
				isUpdated : function () {}
			},
			oModel = {resolveDeep : function () {}},
			oBinding = {
				oContext : oContext,
				oModel : oModel,
				sPath : "~sPath",
				_checkPathType : function () {},
				_hasTransientParentContext : function () {},
				_initSortersFilters : function () {},
				_refresh : function () {},
				_removePersistedCreatedContexts : function () {},
				checkDataState : function () {},
				checkExpandedList : function () {},
				getResolvedPath : function () {},
				isRelative : function () {},
				isResolved : function () {}
			},
			oBindingMock = this.mock(oBinding);

		this.mock(oContext).expects("isRefreshForced").withExactArgs().returns(true);
		this.mock(oContext).expects("isPreliminary").withExactArgs().returns(false);
		this.mock(oContext).expects("isUpdated").withExactArgs().returns(false);
		oBindingMock.expects("isRelative").withExactArgs().returns(true);
		this.mock(Context).expects("hasChanged")
			.withExactArgs(sinon.match.same(oContext), sinon.match.same(oContext))
			.returns(true);
		oBindingMock.expects("isResolved").withExactArgs().returns(true);
		oBindingMock.expects("_hasTransientParentContext").withExactArgs().returns(false);
		oBindingMock.expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("resolveDeep")
			.withExactArgs("~sPath", sinon.match.same(oContext))
			.returns("~resolvedDeepPath");
		oBindingMock.expects("_checkPathType").withExactArgs().returns(true);
		oBindingMock.expects("checkDataState").withExactArgs();
		oBindingMock.expects("_hasTransientParentContext").withExactArgs().returns(false);
		oBindingMock.expects("_initSortersFilters").withExactArgs();
		oBindingMock.expects("checkExpandedList").withExactArgs().returns(false);
		oRemoveExpectation = oBindingMock.expects("_removePersistedCreatedContexts")
			.withExactArgs();
		oRefreshExpectation = oBindingMock.expects("_refresh").withExactArgs();

		// code under test
		ODataListBinding.prototype.setContext.call(oBinding, oContext);

		assert.ok(oRefreshExpectation.calledImmediatelyAfter(oRemoveExpectation));
	});

	//*********************************************************************************************
[true, false].forEach(function (bIsResolved) {
	QUnit.test("checkExpandedList: isResolved=" + bIsResolved, function (assert) {
		var oModel = {_getObject : function () {}},
			oBinding = {
				oContext : "~oContext",
				oModel : oModel,
				sPath : "~sPath",
				isResolved : function () {}
			},
			aList = bIsResolved ? undefined : [];

		this.mock(oModel).expects("_getObject").withExactArgs("~sPath", "~oContext").returns(aList);
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(bIsResolved);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.checkExpandedList.call(oBinding), false);
		assert.strictEqual(oBinding.bUseExpandedList, false);
		assert.strictEqual(oBinding.aExpandRefs, undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("checkExpandedList: expanded list is not usable", function (assert) {
		var oModel = {_getObject : function () {}},
			oBinding = {
				oContext : "~oContext",
				oModel : oModel,
				sPath : "~sPath",
				_isExpandedListUsable : function () {},
				isResolved : function () {}
			};

		this.mock(oModel).expects("_getObject")
			.withExactArgs("~sPath", "~oContext")
			.returns("~aList");
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("_isExpandedListUsable").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.checkExpandedList.call(oBinding), false);
		assert.strictEqual(oBinding.bUseExpandedList, false);
		assert.strictEqual(oBinding.aExpandRefs, undefined);
	});

	//*********************************************************************************************
[true, false].forEach(function (bUseExpandedList) {
	QUnit.test("checkExpandedList: expanded 'to N' navigation property; skip reload needed;"
			+ " not read via side effect; bUseExpandedList=" + bUseExpandedList, function (assert) {
		var oModel = {_getObject : function () {}},
			oBinding = {
				oContext : "~oContext",
				oModel : oModel,
				sPath : "~sPath",
				bUseExpandedList : bUseExpandedList,
				_initSortersFilters : function () {},
				_isExpandedListUsable : function () {},
				applyFilter : function () {},
				applySort : function () {},
				isResolved : function () {}
			},
			aList = ["path0"];

		this.mock(oModel).expects("_getObject").withExactArgs("~sPath", "~oContext").returns(aList);
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("_isExpandedListUsable").withExactArgs().returns(true);
		this.mock(oBinding).expects("_initSortersFilters").withExactArgs();
		this.mock(oBinding).expects("applyFilter").withExactArgs();
		this.mock(oBinding).expects("applySort").withExactArgs();

		// code under test
		assert.strictEqual(ODataListBinding.prototype.checkExpandedList.call(oBinding, true), true);

		assert.strictEqual(oBinding.bUseExpandedList, true);
		assert.strictEqual(oBinding.aExpandRefs, aList);
		assert.deepEqual(oBinding.aExpandRefs, ["path0"]);
		assert.strictEqual(oBinding.aAllKeys, aList);
		assert.strictEqual(oBinding.iLength, 1);
		assert.strictEqual(oBinding.bLengthFinal, true);
		assert.strictEqual(oBinding.bDataAvailable, true);
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bUseExpandedList) {
	QUnit.test("checkExpandedList: expanded 'to N' navigation property; skip reload needed;"
			+ " read via side effect; bUseExpandedList=" + bUseExpandedList, function (assert) {
		var oModel = {
				_getObject : function () {},
				getKey : function () {}
			},
			oBinding = {
				oContext : "~oContext",
				oModel : oModel,
				sPath : "~sPath",
				bUseExpandedList : bUseExpandedList,
				_getCreatedPersistedContexts : function () {},
				_initSortersFilters : function () {},
				_isExpandedListUsable : function () {},
				applyFilter : function () {},
				applySort : function () {},
				isResolved : function () {}
			},
			oModelMock = this.mock(oModel),
			aList = ["path0", "path1", "path2"];

		aList.sideEffects = true;

		this.mock(oModel).expects("_getObject").withExactArgs("~sPath", "~oContext").returns(aList);
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("_isExpandedListUsable").withExactArgs().returns(true);
		this.mock(oBinding).expects("_getCreatedPersistedContexts")
			.withExactArgs()
			.returns(["~Context0", "~Context1"]);
		oModelMock.expects("getKey").withExactArgs("~Context0").returns("path0");
		oModelMock.expects("getKey").withExactArgs("~Context1").returns("path1");
		this.mock(oBinding).expects("_initSortersFilters").withExactArgs();
		this.mock(oBinding).expects("applyFilter").withExactArgs();
		this.mock(oBinding).expects("applySort").withExactArgs();

		// code under test
		assert.strictEqual(ODataListBinding.prototype.checkExpandedList.call(oBinding, true),
			bUseExpandedList);

		assert.strictEqual(oBinding.bUseExpandedList, bUseExpandedList);
		assert.strictEqual(oBinding.aExpandRefs, bUseExpandedList ? aList : undefined);
		assert.deepEqual(oBinding.aAllKeys, ["path2"]);
		assert.deepEqual(aList, ["path0", "path1", "path2"]); // original value not modified
		assert.strictEqual(oBinding.iLength, 1);
		assert.strictEqual(oBinding.bLengthFinal, true);
		assert.strictEqual(oBinding.bDataAvailable, true);
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bUseExpandedList) {
	var sTitle = "checkExpandedList: expanded 'to N' navigation property; skip reload needed;"
			+ " read via side effect, no created persisted contexts;"
			+ " bUseExpandedList=" + bUseExpandedList;

	QUnit.test(sTitle, function (assert) {
		var oModel = {_getObject : function () {}},
			oBinding = {
				oContext : "~oContext",
				oModel : oModel,
				sPath : "~sPath",
				bUseExpandedList : bUseExpandedList,
				_getCreatedPersistedContexts : function () {},
				_initSortersFilters : function () {},
				_isExpandedListUsable : function () {},
				applyFilter : function () {},
				applySort : function () {},
				isResolved : function () {}
			},
			aList = ["path0", "path1", "path2"];

		aList.sideEffects = true;

		this.mock(oModel).expects("_getObject").withExactArgs("~sPath", "~oContext").returns(aList);
		this.mock(oBinding).expects("isResolved").withExactArgs().returns(true);
		this.mock(oBinding).expects("_isExpandedListUsable").withExactArgs().returns(true);
		this.mock(oBinding).expects("_getCreatedPersistedContexts").withExactArgs().returns([]);
		this.mock(oBinding).expects("_initSortersFilters").withExactArgs();
		this.mock(oBinding).expects("applyFilter").withExactArgs();
		this.mock(oBinding).expects("applySort").withExactArgs();

		// code under test
		assert.strictEqual(ODataListBinding.prototype.checkExpandedList.call(oBinding, true),
			bUseExpandedList);

		assert.strictEqual(oBinding.bUseExpandedList, bUseExpandedList);
		assert.strictEqual(oBinding.aExpandRefs, bUseExpandedList ? aList : undefined);
		assert.strictEqual(oBinding.aAllKeys, aList);
		assert.strictEqual(oBinding.iLength, 3);
		assert.strictEqual(oBinding.bLengthFinal, true);
		assert.strictEqual(oBinding.bDataAvailable, true);
	});
});

	//*********************************************************************************************
	QUnit.test("_refresh: getResolvedPath is called", function (assert) {
		var oBinding = {
				bPendingRefresh : "~bPendingRefresh",
				_hasTransientParentContext : function () {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext").returns(false);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype._refresh.call(oBinding, undefined, undefined, "~mEntityTypes");

		assert.strictEqual(oBinding.bPendingRefresh, "~bPendingRefresh", "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("_refresh: parent context is transient", function (assert) {
		var oBinding = {
				bPendingRefresh : "~bPendingRefresh",
				_hasTransientParentContext : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext").returns(true);

		// code under test
		ODataListBinding.prototype._refresh.call(oBinding);

		assert.strictEqual(oBinding.bPendingRefresh, "~bPendingRefresh", "unchanged");
	});

	//*********************************************************************************************
	QUnit.test("_refresh: suspended binding - change detected", function (assert) {
		var oBinding = {
				bIgnoreSuspend : false,
				bPendingRefresh : false,
				bSuspended : true,
				_hasTransientParentContext : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);

		// code under test
		ODataListBinding.prototype._refresh.call(oBinding);

		assert.strictEqual(oBinding.bPendingRefresh, true);
	});

	//*********************************************************************************************
	QUnit.test("_refresh: suspended binding and force update", function (assert) {
		var oBinding = {
				bIgnoreSuspend : false,
				bPendingRefresh : true,
				bSuspended : true,
				_fireRefresh : function () {},
				_hasTransientParentContext : function () {},
				abortPendingRequest : function () {},
				resetData : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("abortPendingRequest").withExactArgs(true);
		this.mock(oBinding).expects("resetData").withExactArgs();
		this.mock(oBinding).expects("_fireRefresh").withExactArgs({reason : ChangeReason.Refresh});

		// code under test
		ODataListBinding.prototype._refresh.call(oBinding, true);

		assert.strictEqual(oBinding.bPendingRefresh, false);
	});

	//*********************************************************************************************
	QUnit.test("_refresh: suspended binding ignore suspended", function (assert) {
		var oBinding = {
				bIgnoreSuspend : true,
				bPendingRefresh : true,
				bSuspended : true,
				_fireRefresh : function () {},
				_hasTransientParentContext : function () {},
				abortPendingRequest : function () {},
				resetData : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("abortPendingRequest").withExactArgs(true);
		this.mock(oBinding).expects("resetData").withExactArgs();
		this.mock(oBinding).expects("_fireRefresh").withExactArgs({reason : ChangeReason.Refresh});

		// code under test
		ODataListBinding.prototype._refresh.call(oBinding);

		assert.strictEqual(oBinding.bPendingRefresh, false);
	});

	//*********************************************************************************************
	QUnit.test("_fireRefresh: with resolved path", function (assert) {
		var oBinding = {
				fireEvent : function () {},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding).expects("fireEvent").withExactArgs("refresh", "~mParameters");

		// code under test
		ODataListBinding.prototype._fireRefresh.call(oBinding, "~mParameters");

		assert.strictEqual(oBinding.bRefresh, true);
	});

	//*********************************************************************************************
	QUnit.test("_fireRefresh: no resolved path", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype._fireRefresh.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_checkPathType: getResolvedPath is called", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(ODataListBinding.prototype._checkPathType.call(oBinding), true);
	});

	//*********************************************************************************************
	QUnit.test("getDownloadUrl: no resolved path", function (assert) {
		var oBinding = {
				aSorters : [],
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype.getDownloadUrl.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("getDownloadUrl: sorters are added in client mode", function (assert) {
		var oBinding = {
				oModel : {_createRequestUrl : function () {}},
				aSorters : [{/*any sorter*/}],
				getResolvedPath : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(true);
		this.mock(ODataUtils).expects("createSortParams")
			.withExactArgs(sinon.match.same(oBinding.aSorters))
			.returns("~$orderby");
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel).expects("_createRequestUrl")
			.withExactArgs("~resolvedPath", null, ["~$orderby"])
			.returns("~URL");

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getDownloadUrl.call(oBinding), "~URL");
	});

	//*********************************************************************************************
[{
	sSortParams : "~sortParams"
}, {
	aSorters : []
}, {
	aSorters : [{/*any sorter*/}],
	bUseClientMode : false
}].forEach(function (oFixture, i) {
	QUnit.test("getDownloadUrl: sorters are not added: #" + i, function (assert) {
		var oBinding = {
				oModel : {_createRequestUrl : function () {}},
				aSorters : oFixture.aSorters,
				sSortParams : oFixture.sSortParams,
				getResolvedPath : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("useClientMode")
			.withExactArgs()
			.exactly(oFixture.bUseClientMode === false ? 1 : 0)
			.returns(oFixture.bUseClientMode);
		this.mock(ODataUtils).expects("createSortParams").never();
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel).expects("_createRequestUrl")
			.withExactArgs("~resolvedPath", null, oFixture.sSortParams ? ["~sortParams"] : [])
			.returns("~URL");

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getDownloadUrl.call(oBinding), "~URL");
	});
});

	//*********************************************************************************************
	QUnit.test("getDownloadUrl: filters are added in client mode", function (assert) {
		var oBinding = {
				oCombinedFilter : "~CombinedFilter",
				oEntityType : "~EntityType",
				oModel : {
					oMetadata : "~Metadata",
					_createRequestUrl : function () {}
				},
				aSorters : [],
				getResolvedPath : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(true);
		this.mock(ODataUtils).expects("createFilterParams")
			.withExactArgs("~CombinedFilter", "~Metadata", "~EntityType")
			.returns("~$filter");
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel).expects("_createRequestUrl")
			.withExactArgs("~resolvedPath", null, ["~$filter"])
			.returns("~URL");

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getDownloadUrl.call(oBinding), "~URL");
	});

	//*********************************************************************************************
[{
	sFilterParams : "~filterParams"
}, {
	oCombinedFilter : undefined
}, {
	oCombinedFilter : {},
	bUseClientMode : false
}].forEach(function (oFixture, i) {
	QUnit.test("getDownloadUrl: filters are not added: #" + i, function (assert) {
		var oBinding = {
				oCombinedFilter : oFixture.oCombinedFilter,
				sFilterParams : oFixture.sFilterParams,
				oModel : {_createRequestUrl : function () {}},
				aSorters : [],
				getResolvedPath : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("useClientMode")
			.withExactArgs()
			.exactly(oFixture.bUseClientMode === false ? 1 : 0)
			.returns(oFixture.bUseClientMode);
		this.mock(ODataUtils).expects("createFilterParams").never();
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel).expects("_createRequestUrl")
			.withExactArgs("~resolvedPath", null, oFixture.sFilterParams ? ["~filterParams"] : [])
			.returns("~URL");

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getDownloadUrl.call(oBinding), "~URL");
	});
});

	//*********************************************************************************************
	QUnit.test("_initSortersFilters: getResolvedPath is called", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		ODataListBinding.prototype._initSortersFilters.call(oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_getEntityType: with resolved path", function (assert) {
		var oBinding = {
				oModel : {
					oMetadata : {_getEntityTypeByPath : function () {}}
				},
				getResolvedPath : function () {}
			};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oBinding.oModel.oMetadata).expects("_getEntityTypeByPath")
			.withExactArgs("~resolvedPath")
			.returns("~entityType");

		// code under test
		assert.strictEqual(ODataListBinding.prototype._getEntityType.call(oBinding), "~entityType");
	});

	//*********************************************************************************************
	QUnit.test("_getEntityType: no resolved path", function (assert) {
		var oBinding = {getResolvedPath : function () {}};

		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns(undefined);

		// code under test
		assert.strictEqual(ODataListBinding.prototype._getEntityType.call(oBinding), undefined);
	});

	//*********************************************************************************************
	QUnit.test("_getContexts: return V2 contexts, no created contexts", function (assert) {
		var oModel = {
				getContext : function () {},
				resolveDeep : function () {}
			},
			oBinding = {
				oContext : "~context",
				aKeys : ["~key(0)", "~key(1)"],
				oModel : oModel,
				sPath : "~path",
				_getCreatedContexts : function () {},
				getResolvedPath : function () {},
				isFirstCreateAtEnd : function () {}
			},
			oModelMock = this.mock(oModel);

		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getCreatedContexts").withExactArgs().returns([]);
		oModelMock.expects("resolveDeep").withExactArgs("~path", "~context").returns("/~sDeepPath");
		oModelMock.expects("getContext").withExactArgs("/~key(0)", "/~sDeepPath(0)")
			.returns("~V2Context0");
		oModelMock.expects("getContext").withExactArgs("/~key(1)", "/~sDeepPath(1)")
			.returns("~V2Context1");

		// code under test
		assert.deepEqual(ODataListBinding.prototype._getContexts.call(oBinding, 0, 2),
			["~V2Context0", "~V2Context1"]);
	});


	//*********************************************************************************************
[{
	bAtEnd : false,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated1", "~oCreated0"],
	iLength : 3,
	iStart : 0,
	aResult : ["~oCreated1", "~oCreated0", "~fromBackend0"]
}, {
	bAtEnd : false,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated1", "~oCreated0"],
	iLength : 3,
	iStart : 3,
	aResult : ["~fromBackend1"]
}, {
	bAtEnd : false,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated1", "~oCreated0"],
	iLength : 2,
	iStart : 1,
	aResult : ["~oCreated0", "~fromBackend0"]
}, {
	bAtEnd : false,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated3", "~oCreated2", "~oCreated1", "~oCreated0"],
	iLength : 2,
	iStart : 1,
	aResult : ["~oCreated2", "~oCreated1"]
}, { // default iLength to iMaximumLength
	bAtEnd : false,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated1", "~oCreated0"],
	iMaximumLength : 4,
	iStart : 0,
	aResult : ["~oCreated1", "~oCreated0", "~fromBackend0", "~fromBackend1"]
}, { // default iStartIndex to 0 and iLength to iMaximumLength
	bAtEnd : false,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated3", "~oCreated2", "~oCreated1", "~oCreated0"],
	iMaximumLength : 5,
	aResult : ["~oCreated3", "~oCreated2", "~oCreated1", "~oCreated0", "~fromBackend0"]
}, {
	bAtEnd : true,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated0", "~oCreated1"],
	iLength : 3,
	iStart : 0,
	aResult : ["~fromBackend0", "~fromBackend1", "~oCreated0"]
}, {
	bAtEnd : true,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated0"],
	iLength : 4,
	iStart : 0,
	aResult : ["~fromBackend0", "~fromBackend1", "~oCreated0"]
}, {
	bAtEnd : true,
	iBindingLength : 2,
	aCreatedContexts : ["~oCreated0", "~oCreated1"],
	iLength : 4,
	iStart : 2,
	aResult : ["~oCreated0", "~oCreated1"]
}, { // server entries which are not yet read => must not return created entries, avoid gap
	bAtEnd : true,
	iBindingLength : 3,
	aCreatedContexts : ["~oCreated0", "~oCreated1"],
	iLength : 4,
	iStart : 0,
	aResult : ["~fromBackend0", "~fromBackend1"]
}].forEach(function (oFixture, i) {
	QUnit.test("_getContexts: with createdContexts, #" + i, function (assert) {
		var oModel = {
				iSizeLimit : 5,
				getContext : function () {},
				resolveDeep : function () {}
			},
			oBinding = {
				oContext : "~context",
				aKeys : ["~key(0)", "~key(1)"],
				iLength : oFixture.iBindingLength,
				oModel : oModel,
				sPath : "~path",
				_getCreatedContexts : function () {},
				_getMaximumLength : function () {},
				getResolvedPath : function () {},
				isFirstCreateAtEnd : function () {}
			},
			oModelMock = this.mock(oModel);

		this.mock(oBinding).expects("isFirstCreateAtEnd")
			.withExactArgs()
			.returns(oFixture.bAtEnd);
		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(oFixture.aCreatedContexts);
		oModelMock.expects("resolveDeep").withExactArgs("~path", "~context").returns("/~sDeepPath");
		this.mock(oBinding).expects("_getMaximumLength")
			.withExactArgs()
			.exactly(oFixture.iMaximumLength ? 1 : 0)
			.returns(oFixture.iMaximumLength);
		oModelMock.expects("getContext").withExactArgs("/~key(0)", "/~sDeepPath(0)")
			.exactly(oFixture.aResult.includes("~fromBackend0") ? 1 : 0)
			.returns("~fromBackend0");
		oModelMock.expects("getContext").withExactArgs("/~key(1)", "/~sDeepPath(1)")
			.exactly(oFixture.aResult.includes("~fromBackend1") ? 1 : 0)
			.returns("~fromBackend1");

		// code under test
		assert.deepEqual(
			ODataListBinding.prototype._getContexts.call(oBinding, oFixture.iStart,
				oFixture.iLength),
			oFixture.aResult);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bInitial, i) {
	QUnit.test("getContexts: return empty array; #" + i, function (assert) {
		var oBinding = {
				bInitial : bInitial,
				_hasTransientParentContext : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext")
			.withExactArgs()
			.exactly(bInitial ? 0 : 1)
			.returns(true);

		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0, 2), []);
	});
});

	//*********************************************************************************************
[CountMode.Request, CountMode.Both].forEach(function (sCountMode, i) {
	QUnit.test("getContexts: return empty array; check OperationMode/CountMode; #" + i,
			function (assert) {
		var oBinding = {
				sCountMode : sCountMode,
				bLengthFinal : false,
				bLengthRequested : true,
				sOperationMode : OperationMode.Auto,
				_hasTransientParentContext : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);

		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0, 2), []);
	});
});

	//*********************************************************************************************
[true, false].forEach(function (bDataRequested) {
	var sTitle = "getContexts: return V2 contexts returned by _getContexts, fires change event: "
			+ !bDataRequested;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				aAllKeys : [],
				bLengthFinal : true,
				bRefresh : true,
				_fireChange : function () {},
				_getContexts : function () {},
				_hasTransientParentContext : function () {},
				_updateLastStartAndLength : function () {},
				isFirstCreateAtEnd : function () {},
				useClientMode : function () {}
			},
			aContexts = ["~V2Context0", "~V2Context1"],
			aResultContexts;

		if (bDataRequested) {
			aContexts.dataRequested = true;
		}
		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_updateLastStartAndLength")
			.withExactArgs(0, 2, undefined, undefined);
		this.mock(oBinding).expects("_getContexts").withExactArgs(0, 2).returns(aContexts);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(true);
		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(oBinding).expects("_fireChange")
			.withExactArgs({reason : ChangeReason.Change})
			.exactly(bDataRequested ? 0 : 1);

		// code under test
		aResultContexts = ODataListBinding.prototype.getContexts.call(oBinding, 0, 2);

		assert.strictEqual(aResultContexts, aContexts);
	});
});

	//*********************************************************************************************
	QUnit.test("getContexts: no contexts after refresh and no data requested", function (assert) {
		var oBinding = {
				aAllKeys : null,
				bLengthFinal : false,
				bPendingRequest : true,
				bRefresh : true,
				_fireChange : function () {},
				_getContexts : function () {},
				_hasTransientParentContext : function () {},
				_updateLastStartAndLength : function () {},
				isFirstCreateAtEnd : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_updateLastStartAndLength")
			.withExactArgs(0, 2, undefined, undefined);
		this.mock(oBinding).expects("_getContexts").withExactArgs(0, 2).returns([]);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(true);
		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		ODataListBinding.prototype.getContexts.call(oBinding, 0, 2);
	});

	//*********************************************************************************************
[true, false].forEach(function (bLengthFinal) {
	QUnit.test("getContexts: use ODataUtils, bLengthFinal = " + bLengthFinal, function (assert) {
		var oModel = {getServiceMetadata : function () {}},
			oBinding = {
				bLengthFinal : bLengthFinal,
				oModel : oModel,
				bPendingRequest : false,
				_getContexts : function () {},
				_getLength : function () {},
				_getSkipAndTop : function () {},
				_hasTransientParentContext : function () {},
				_updateLastStartAndLength : function () {},
				isFirstCreateAtEnd : function () {},
				loadData : function () {},
				useClientMode : function () {}
			},
			aContexts = [];

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getLength").withExactArgs().exactly(bLengthFinal ? 0 : 1);
		this.mock(oBinding).expects("_updateLastStartAndLength")
			.withExactArgs(0, 10, 100, undefined);
		this.mock(oBinding).expects("_getContexts")
			.withExactArgs(0, 10)
			.returns(aContexts);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getSkipAndTop")
			.withExactArgs(0, 10, 100)
			.returns({skip : "~skip", top : "~top"});
		this.mock(oModel).expects("getServiceMetadata").withExactArgs().returns(true);
		this.mock(oBinding).expects("loadData")
			.withExactArgs("~skip", "~top");
		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);

		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0, 10, 100),
			aContexts);
	});
});

	//*********************************************************************************************
	QUnit.test("getContexts: use _getMaximumLength", function (assert) {
		var oBinding = {
				sCreatedEntitiesKey : "~sCreatedEntitiesKey",
				bPendingRequest : true,
				bRefresh : true,
				_fireChange : function () {},
				_getContexts : function () {},
				_getMaximumLength : function () {},
				_hasTransientParentContext : function () {},
				_updateLastStartAndLength : function () {},
				isFirstCreateAtEnd : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_updateLastStartAndLength")
			.withExactArgs(0, undefined, 100, undefined);
		this.mock(oBinding).expects("_getMaximumLength").withExactArgs().returns("~iLength");
		this.mock(oBinding).expects("_getContexts")
			.withExactArgs(0, "~iLength")
			.returns("~aContexts");
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(true);
		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Change});

		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0,
			/*iLength*/undefined, 100), "~aContexts");
	});

	//*********************************************************************************************
[
	{pendingRequest : false, bSkipTop : true, expectLoad : true},
	{pendingRequest : true, bSkipTop : true, expectLoad : false},
	{pendingRequest : true, bSkipTop : false, expectLoad : false},
	{pendingRequest : false, bSkipTop : false, expectLoad : false}
].forEach(function (oFixture) {
	var sTitle = "getContexts: calls loadData with pendingRequest = " + oFixture.pendingRequest
			+ ", has skip/top = " + oFixture.bSkipTop;
	QUnit.test(sTitle, function (assert) {
		var oModel = {getServiceMetadata : function () {}},
			oBinding = {
				bLengthFinal : true,
				oModel : oModel,
				bPendingRequest : oFixture.pendingRequest,
				_getContexts : function () {},
				_getSkipAndTop : function () {},
				_hasTransientParentContext : function () {},
				_updateLastStartAndLength : function () {},
				isFirstCreateAtEnd : function () {},
				loadData : function () {},
				useClientMode : function () {}
			},
			aContexts = [];

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_updateLastStartAndLength")
			.withExactArgs(0, 10, 100, undefined);
		this.mock(oBinding).expects("_getContexts")
			.withExactArgs(0, 10)
			.returns(aContexts);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getSkipAndTop")
			.withExactArgs(0, 10, 100)
			.returns(oFixture.bSkipTop ? {skip : "~skip", top : "~top"} : undefined);
		this.mock(oModel).expects("getServiceMetadata").withExactArgs().returns(true);
		if (oFixture.bSkipTop) {
			this.mock(oBinding).expects("loadData")
				.withExactArgs( "~skip",  "~top")
				.exactly(oFixture.expectLoad ? 1 : 0);
		}
		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);

		// code under test
		assert.deepEqual(ODataListBinding.prototype.getContexts.call(oBinding, 0, 10, 100),
			aContexts);
	});
});

	//*********************************************************************************************
[{ // no created contexts
	isFirstCreateAtEnd : undefined, // return value of isFirstCreateAtEnd call
	bPendingRequest : true, // whether the call to getContexts causes a pending request
	sAvailableContexts : "backend", // kind of contexts already avail in requested ranged
	bExpectIsTransient : false, // whether a call to isTransient on the avail context is expected
	iExpectedLength : 1 // expected length of returned contexts array
},{ // created contexts at start
	isFirstCreateAtEnd : false,
	bPendingRequest : true,
	sAvailableContexts : "backend",
	bExpectIsTransient : false,
	iExpectedLength : 1
}, { // created contexts at end, no pending request
	isFirstCreateAtEnd : true,
	bPendingRequest : false,
	sAvailableContexts : "backend",
	bExpectIsTransient : false,
	iExpectedLength : 1
}, { // created contexts at end, pending request, no contexts to return
	isFirstCreateAtEnd : true,
	bPendingRequest : true,
	sAvailableContexts : "none",
	bExpectIsTransient : false,
	iExpectedLength : 0
}, { // created contexts at end, pending request, contexts to return are from backend
	isFirstCreateAtEnd : true,
	bPendingRequest : true,
	sAvailableContexts : "backend",
	bExpectIsTransient : true,
	iExpectedLength : 1
}, { // created contexts at end, pending request, contexts to return are created => empty array
	isFirstCreateAtEnd : true,
	bPendingRequest : true,
	sAvailableContexts : "created",
	bExpectIsTransient : true,
	iExpectedLength : 0
}].forEach(function (oFixture, i) {
	var sTitle = "getContexts: Return [] if created contexts are at end and pending request," + i;

	QUnit.test(sTitle, function (assert) {
		var aResult,
			oModel = {getServiceMetadata : function () {}},
			oBinding = {
				bLengthFinal : true,
				oModel : oModel,
				bPendingRequest : false, // no pending request initially; changed in #loadData
				_getContexts : function () {},
				_getSkipAndTop : function () {},
				_hasTransientParentContext : function () {},
				_updateLastStartAndLength : function () {},
				getContextData : function () {},
				isFirstCreateAtEnd : function () {},
				loadData : function () {},
				useClientMode : function () {}
			},
			oContext = {
				isTransient : function () {}
			},
			aContexts = oFixture.sAvailableContexts === "none" ? [] : [oContext];

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_updateLastStartAndLength")
			.withExactArgs(0, 10, 100, undefined)
			.callsFake(function () {
				// set last length and start to see that values are not changed anywhere else
				this.iLastLength = "~iLastLengthUpdated";
				this.iLastStartIndex = "~iLastStartIndexUpdated";
			});
		this.mock(oBinding).expects("_getContexts")
			.withExactArgs(0, 10)
			.returns(aContexts);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(false);
		this.mock(oBinding).expects("_getSkipAndTop")
			.withExactArgs(0, 10, 100)
			.returns({skip : "~skip", top : "~top"});
		this.mock(oModel).expects("getServiceMetadata").withExactArgs().returns(true);
		this.mock(oBinding).expects("loadData")
			.withExactArgs("~skip",  "~top")
			.callsFake(function () {
				oBinding.bPendingRequest = oFixture.bPendingRequest;
			});
		this.mock(oBinding).expects("isFirstCreateAtEnd")
			.withExactArgs()
			.returns(oFixture.isFirstCreateAtEnd);
		this.mock(oContext).expects("isTransient")
			.withExactArgs()
			.exactly(oFixture.bExpectIsTransient ? 1 : 0)
			.returns(oFixture.sAvailableContexts === "created" ? false : undefined);
		this.mock(oBinding).expects("getContextData")
			.withExactArgs(sinon.match.same(oContext))
			.exactly(oFixture.iExpectedLength)
			.returns("~data0");

		// code under test
		aResult = ODataListBinding.prototype.getContexts.call(oBinding, 0, 10, 100);

		assert.strictEqual(aResult, aContexts);
		assert.strictEqual(aResult.dataRequested, true);
		assert.strictEqual(aResult.length, oFixture.iExpectedLength);

		assert.deepEqual(oBinding.aLastContextData, oFixture.iExpectedLength ? ["~data0"] : []);
		assert.deepEqual(oBinding.aLastContexts, aContexts);
		assert.notStrictEqual(oBinding.aLastContexts, aContexts);
		assert.strictEqual(oBinding.iLastEndIndex, 10);
		assert.strictEqual(oBinding.iLastLength, "~iLastLengthUpdated");
		assert.strictEqual(oBinding.iLastStartIndex, "~iLastStartIndexUpdated");
	});
});

	//**********************************************************************************************
	QUnit.test("getContexts: throws error of _updateLastStartAndLength", function (assert) {
		var oBinding = {
				bLengthFinal : true,
				_hasTransientParentContext : function () {},
				_updateLastStartAndLength : function () {}
			},
			oError = new Error("foo");

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_updateLastStartAndLength")
			.withExactArgs("~iStartIndex", "~iLength", "~iMaximumPrefetchSize", "~bKeepCurrent")
			.throws(oError);

		assert.throws(function () {
			// code under test
			ODataListBinding.prototype.getContexts.call(oBinding, "~iStartIndex", "~iLength",
				"~iMaximumPrefetchSize", "~bKeepCurrent");
		}, oError);
	});

	//**********************************************************************************************
	QUnit.test("getContexts: bKeepCurrent=true, no extended change detection", function (assert) {
		var oBinding = {
				aAllKeys : [/* content nor relevant for this test */],
				aLastContextData : "~aLastContextData",
				aLastContexts : "~aLastContexts",
				iLastEndIndex : "~iLastEndIndex",
				iLastLength : "~iLastLength",
				iLastMaximumPrefetchSize : "~iLastMaximumPrefetchSize",
				iLastStartIndex : "~iLastStartIndex",
				bLengthFinal : true,
				_getContexts : function () {},
				_hasTransientParentContext : function () {},
				_updateLastStartAndLength : function () {},
				isFirstCreateAtEnd : function () {},
				useClientMode : function () {}
			},
			aContexts = ["~context0", "~context1"];

		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oBinding).expects("_updateLastStartAndLength")
			.withExactArgs(7, 2, undefined, true);
		this.mock(oBinding).expects("_getContexts").withExactArgs(7, 2).returns(aContexts);
		this.mock(oBinding).expects("useClientMode").withExactArgs().returns(true);
		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype.getContexts.call(oBinding, 7, 2, undefined, true),
			aContexts);

		assert.strictEqual(oBinding.aLastContextData, "~aLastContextData");
		assert.strictEqual(oBinding.aLastContexts, "~aLastContexts");
		assert.strictEqual(oBinding.iLastEndIndex, "~iLastEndIndex");
		assert.strictEqual(oBinding.iLastLength, "~iLastLength");
		assert.strictEqual(oBinding.iLastMaximumPrefetchSize, "~iLastMaximumPrefetchSize");
		assert.strictEqual(oBinding.iLastStartIndex, "~iLastStartIndex");
	});

	//*********************************************************************************************
	QUnit.test("_updateLastStartAndLength: bKeepCurrent = false", function (assert) {
		var oBinding = {
				iLastLength : "~iLastLength",
				iLastMaximumPrefetchSize : "~iLastMaximumPrefetchSize",
				iLastStartIndex : "~iLastStartIndex",
				bUseExtendedChangeDetection : true
			};

		// code under test
		ODataListBinding.prototype._updateLastStartAndLength.call(oBinding, "~start", "~length",
			"~maximumPrefetchSize", /*bKeepCurrent*/false);

		assert.strictEqual(oBinding.iLastLength, "~length");
		assert.strictEqual(oBinding.iLastMaximumPrefetchSize, "~maximumPrefetchSize");
		assert.strictEqual(oBinding.iLastStartIndex, "~start");
	});

	//*********************************************************************************************
	QUnit.test("_updateLastStartAndLength: keep last start and last length", function (assert) {
		var oBinding = {
				iLastLength : "~iLastLength",
				iLastMaximumPrefetchSize : "~iLastMaximumPrefetchSize",
				iLastStartIndex : "~iLastStartIndex",
				_checkKeepCurrentSupported : function () {}
			};

		this.mock(oBinding).expects("_checkKeepCurrentSupported")
			.withExactArgs("~iMaximumPrefetchSize");

		// code under test
		ODataListBinding.prototype._updateLastStartAndLength.call(oBinding, "~start", "~length",
			"~iMaximumPrefetchSize", /*bKeepCurrent*/true);

		assert.strictEqual(oBinding.iLastLength, "~iLastLength");
		assert.strictEqual(oBinding.iLastMaximumPrefetchSize, "~iLastMaximumPrefetchSize");
		assert.strictEqual(oBinding.iLastStartIndex, "~iLastStartIndex");
	});

	//*********************************************************************************************
	QUnit.test("_updateLastStartAndLength: throws error of _checkKeepCurrentSupported",
			function (assert) {
		var oBinding = {
				iLastLength : "~iLastLength",
				iLastMaximumPrefetchSize : "~iLastMaximumPrefetchSize",
				iLastStartIndex : "~iLastStartIndex",
				_checkKeepCurrentSupported : function () {}
			},
			oError = new Error("Foo");

		this.mock(oBinding).expects("_checkKeepCurrentSupported")
			.withExactArgs("~iMaximumPrefetchSize")
			.throws(oError);

		// code under test
		assert.throws(function () {
			ODataListBinding.prototype._updateLastStartAndLength.call(oBinding, "~start", "~length",
				"~iMaximumPrefetchSize", /*bKeepCurrent*/true);
		}, oError);

		assert.strictEqual(oBinding.iLastLength, "~iLastLength");
		assert.strictEqual(oBinding.iLastMaximumPrefetchSize, "~iLastMaximumPrefetchSize");
		assert.strictEqual(oBinding.iLastStartIndex, "~iLastStartIndex");
	});

	//*********************************************************************************************
[
	{aCreatedContexts : [], iLength : 0, iExpected : 0},
	{aCreatedContexts : [{}, {}, {}], iLength : 0, iExpected : 3},
	{aCreatedContexts : [], iLength : 42, iExpected : 52},
	{
		aCreatedContexts : [],
		iLastLength : 17,
		iLastMaximumPrefetchSize : 13,
		iLength : 42,
		iExpected : 55
	},
	{aCreatedContexts : [], iLastLength : 17, iLength : 42, iExpected : 59},
	{aCreatedContexts : [{}], iLength : 42, iExpected : 53},
	{aCreatedContexts : [{}], iLastMaximumPrefetchSize : 13, iLength : 42, iExpected : 56},
	{aCreatedContexts : [{}, {}], iLastLength : 17, iLength : 42, iExpected : 61}
].forEach(function (oFixture, i) {
	QUnit.test("getLength: bLengthFinal=false; #" + i, function (assert) {
		var oBinding = {
				iLastLength : oFixture.iLastLength,
				iLastMaximumPrefetchSize : oFixture.iLastMaximumPrefetchSize,
				iLength : oFixture.iLength,
				bLengthFinal : false,
				_getCreatedContexts : function () {}
			};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(oFixture.aCreatedContexts);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getLength.call(oBinding), oFixture.iExpected);
	});
});

	//*********************************************************************************************
[
	{aCreatedContexts : [], iExpectedValue : 5},
	{aCreatedContexts : [{}, {}], iExpectedValue : 7}
].forEach(function (oFixture, i) {
	QUnit.test("getLength: bLengthFinal=true; #" + i, function (assert) {
		var oBinding = {
				iLength : 5,
				bLengthFinal : true,
				_getCreatedContexts : function () {}
			};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(oFixture.aCreatedContexts);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getLength.call(oBinding),
			oFixture.iExpectedValue);
	});
});

	//*********************************************************************************************
[{
	bindingParameters : {expand : "~bindingExpand"},
	parameters : {
		changeSetId : "~changeSetId",
		error : "~error",
		expand : "~parametersExpand",
		groupId : "~groupId",
		inactive : "~inactive",
		success : "~success"
	},
	expectedExpand : "~parametersExpand"
}, {
	bindingParameters : {expand : "~bindingExpand"},
	parameters : {success : undefined},
	expectedExpand : "~bindingExpand"
}, {
	bindingParameters : undefined,
	parameters : undefined,
	expectedExpand : undefined
}].forEach(function (oFixture, i) {
	QUnit.test("create: calls ODataModel#createEntry with parameters, #" + i, function (assert) {
		var fnResolveActivatedPromise,
			oActivatedPromise = new Promise(function (resolve) {
				fnResolveActivatedPromise = resolve;
			}),
			bInactive = oFixture.parameters && oFixture.parameters.inactive,
			oModel = {
				oMetadata : {isLoaded : function () {}},
				_getCreatedContextsCache : function () {},
				createEntry : function () {}
			},
			oBinding = {
				oContext : "~oContext",
				sCreatedEntitiesKey : "~sCreatedEntitiesKey",
				bLengthFinal : true,
				oModel : oModel,
				mParameters : oFixture.bindingParameters,
				sPath : "~sPath",
				_fireChange : function () {},
				_hasTransientParentContext : function () {},
				fireEvent : function () {},
				getResolvedPath : function () {},
				isFirstCreateAtEnd : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oCreatedContext = {
				created : function () {},
				fetchActivated : function () {}
			},
			oCreatedContextsCache = {addContext : function () {}},
			mCreateParameters;

		oBindingMock.expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		oBindingMock.expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(true);
		oBindingMock.expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oModel).expects("_getCreatedContextsCache")
			.withExactArgs()
			.returns(oCreatedContextsCache);
		this.mock(Object).expects("assign")
			.withExactArgs(sinon.match(function (mParams0) {
				assert.deepEqual(mParams0, {
					context : "~oContext",
					properties : "~oInitialData",
					refreshAfterChange : false
				});
				mCreateParameters = mParams0;

				return true;
			}), sinon.match.same(oFixture.parameters))
			.callThrough();
		this.mock(oModel).expects("createEntry")
			.withExactArgs("~sPath", sinon.match(function (mParams) {
				assert.strictEqual(mParams.expand, oFixture.expectedExpand);

				return mParams === mCreateParameters;
			}))
			.returns(oCreatedContext);
		this.mock(oCreatedContextsCache).expects("addContext")
			.withExactArgs(sinon.match.same(oCreatedContext), "~resolvedPath",
				"~sCreatedEntitiesKey", true);
		this.mock(oCreatedContext).expects("fetchActivated")
			.withExactArgs()
			.exactly(bInactive ? 1 : 0)
			.returns(oActivatedPromise);
		oBindingMock.expects("fireEvent").withExactArgs("createActivate").never();
		oBindingMock.expects("_fireChange").withExactArgs({reason : ChangeReason.Add});

		// code under test
		assert.strictEqual(ODataListBinding.prototype.create.call(oBinding, "~oInitialData",
			"~bAtEnd", oFixture.parameters), oCreatedContext);

		oBindingMock.expects("fireEvent")
			.withExactArgs("createActivate")
			.exactly(bInactive ? 1 : 0);

		// code under test: async context activation
		fnResolveActivatedPromise();

		return oActivatedPromise;
	});
});

	//*********************************************************************************************
[
	{sParameter : "foo", sError : "Parameter 'foo' is not supported"},
	{sParameter : "batchGroupId", sError : "Parameter 'batchGroupId' is not supported"},
	{sParameter : "canonicalRequest", sError : "Parameter 'canonicalRequest' is not supported"},
	{sParameter : "context", sError : "Parameter 'context' is not supported"},
	{sParameter : "created", sError : "Parameter 'created' is not supported"},
	{sParameter : "eTag", sError : "Parameter 'eTag' is not supported"},
	{sParameter : "headers", sError : "Parameter 'headers' is not supported"},
	{sParameter : "properties", sError : "Parameter 'properties' is not supported"},
	{sParameter : "refreshAfterChange", sError : "Parameter 'refreshAfterChange' is not supported"},
	{sParameter : "urlParameters", sError : "Parameter 'urlParameters' is not supported"}
].forEach(function (oFixture) {
	QUnit.test("create: unsupported parameter: " + oFixture.sParameter, function (assert) {
		var oBinding = {isFirstCreateAtEnd : function () {}},
			mParameters = {};

		mParameters[oFixture.sParameter] = "~" + oFixture.sParameter;
		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);

		// code under test
		assert.throws(function () {
			ODataListBinding.prototype.create.call(oBinding, /*oInitialData*/undefined,
				/*bAtEnd*/undefined, mParameters);
		}, new Error(oFixture.sError));
	});
});

	//*********************************************************************************************
[{
	bAtEnd : true,
	bCreationAreaAtEnd : true
}, {
	bAtEnd : false,
	bCreationAreaAtEnd : true
}, {
	bAtEnd : true,
	bCreationAreaAtEnd : undefined
}].forEach(function (oFixture, i) {
	QUnit.test("create: bAtEnd with no final length, #" + i, function (assert) {
		var oListBinding = {
				bLengthFinal : false,
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oListBinding).expects("isFirstCreateAtEnd")
			.withExactArgs()
			.returns(oFixture.bCreationAreaAtEnd);

		// code under test
		assert.throws(function () {
			ODataListBinding.prototype.create.call(oListBinding, /*oInitialData*/undefined,
				oFixture.bAtEnd);
		}, new Error("Must know the final length to create at the end"));
	});
});

	//*********************************************************************************************
	QUnit.test("create: parent context isTransient error", function (assert) {
		var oBinding = {
				_hasTransientParentContext : function () {},
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(true);

		// code under test
		assert.throws(function () {
			ODataListBinding.prototype.create.call(oBinding);
		}, new Error("Parent context is transient"));
	});

	//*********************************************************************************************
	QUnit.test("create: metadata not loaded error", function (assert) {
		var oModel = {oMetadata : {isLoaded : function () {}}},
			oBinding = {
				oModel : oModel,
				_hasTransientParentContext : function () {},
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);
		this.mock(oModel.oMetadata).expects("isLoaded").withExactArgs().returns(false);

		// code under test
		assert.throws(function () {
			ODataListBinding.prototype.create.call(oBinding);
		}, new Error("Metadata is not loaded"));
	});

	//*********************************************************************************************
	QUnit.test("create: expanded list error", function (assert) {
		var oBinding = {
				bUseExpandedList : true,
				_hasTransientParentContext : function () {},
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(oBinding).expects("_hasTransientParentContext").withExactArgs().returns(false);

		// code under test
		assert.throws(function () {
			ODataListBinding.prototype.create.call(oBinding, "~Data");
		}, new Error("The collection has been read via $expand while reading the parent entity"));
	});

	//*********************************************************************************************
[{ // return model's iSizeLimit
	aCreatedContexts : Array(5), iLength : 23, bLengthFinal : false, iResult : 13
}, { // return model's iSizeLimit (smaller than iLength + iCreated)
	aCreatedContexts : Array(2), iLength : 23, bLengthFinal : true, iResult : 13
}, { // return iLength + iCreated (smaller than model's iSizeLimit)
	aCreatedContexts : Array(4), iLength : 8, bLengthFinal : true, iResult : 12
}, { // return iLength + iCreated (smaller than model's iSizeLimit)
	aCreatedContexts : Array(1), iLength : 10, bLengthFinal : true, iResult : 11
}].forEach(function (oFixture, i) {
	QUnit.test("_getMaximumLength #" + i, function (assert) {
		var oBinding = {
				iLength : oFixture.iLength,
				bLengthFinal : oFixture.bLengthFinal,
				oModel : {iSizeLimit : 13},
				_getCreatedContexts : function () {}
			};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.exactly(oFixture.bLengthFinal ? 1 : 0)
			.returns(oFixture.aCreatedContexts);

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._getMaximumLength.call(oBinding),
			oFixture.iResult);
	});
});

	//*********************************************************************************************
	QUnit.test("_getSkipAndTop, creation at start, no data in binding", function (assert) {
		var oBinding = {
				aKeys : [],
				bLengthFinal : true,
				iLength : "~length",
				_getCreatedContexts : function () {},
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oBinding).expects("_getCreatedContexts").withExactArgs(); // return value unused
		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(sinon.match.same(oBinding.aKeys), "~startIndex", "~length",
				"~maximumPrefetchSize", "~length")
			.returns("~aIntervals");
		this.mock(ODataUtils).expects("_mergeIntervals")
			.withExactArgs("~aIntervals")
			.returns({start : 222, end : 333});

		// code under test
		assert.deepEqual(
			ODataListBinding.prototype._getSkipAndTop.call(oBinding, "~startIndex", "~length",
				"~maximumPrefetchSize"),
			{skip : 222, top : 111});
	});

	//*********************************************************************************************
[
	{interval : {start : 222, end : 333}, result : {skip : 222 - 1, top : 111}},
	{interval : undefined, result : undefined}
].forEach(function (oFixture, i) {
	QUnit.test("_getSkipAndTop, creation at start, binding has data: #" + i, function (assert) {
		var oBinding = {
				aKeys : ["key0", "key1"],
				bLengthFinal : true,
				iLength : "~length",
				_getCreatedContexts : function () {},
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(["created0"]);
		this.mock(oBinding).expects("isFirstCreateAtEnd")
			.withExactArgs()
			.returns(false);
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(["created0", "key0", "key1"], "~startIndex", "~length",
				"~maximumPrefetchSize", "~length")
			.returns("~aIntervals");
		this.mock(ODataUtils).expects("_mergeIntervals")
			.withExactArgs("~aIntervals")
			.returns(oFixture.interval);

		// code under test
		assert.deepEqual(
			ODataListBinding.prototype._getSkipAndTop.call(oBinding, "~startIndex", "~length",
				"~maximumPrefetchSize"),
			oFixture.result);
	});
});

	//*********************************************************************************************
[
	{bLengthFinal : false, iLimit : undefined},
	{bLengthFinal : true, iLimit : "~length"}
].forEach(function (oFixture, i) {
	QUnit.test("_getSkipAndTop, length final and limit: #" + i, function (assert) {
		var oBinding = {
				aKeys : [],
				bLengthFinal : oFixture.bLengthFinal,
				iLength : "~length",
				_getCreatedContexts : function () {},
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oBinding).expects("_getCreatedContexts").withExactArgs().returns([]);
		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(undefined);
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(sinon.match.same(oBinding.aKeys) , 0, 10, "~maximumPrefetchSize",
				oFixture.iLimit)
			.returns("~aIntervals");
		this.mock(ODataUtils).expects("_mergeIntervals")
			.withExactArgs("~aIntervals")
			.returns({start : 222, end : 333});

		// code under test
		assert.deepEqual(
			ODataListBinding.prototype._getSkipAndTop.call(oBinding, 0, 10, "~maximumPrefetchSize"),
			{skip : 222, top : 111});
	});
});

	//*********************************************************************************************
	QUnit.test("_getSkipAndTop, no read interval", function (assert) {
		var oBinding = {
				aKeys : [],
				bLengthFinal : true,
				iLength : "~length",
				_getCreatedContexts : function () {},
				isFirstCreateAtEnd : function () {}
			};

		this.mock(oBinding).expects("_getCreatedContexts").withExactArgs().returns([]);
		this.mock(oBinding).expects("isFirstCreateAtEnd").withExactArgs().returns(false);
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs(sinon.match.same(oBinding.aKeys) , 0, 10, "~maximumPrefetchSize",
				"~length")
			.returns("~aIntervals");
		this.mock(ODataUtils).expects("_mergeIntervals")
			.withExactArgs("~aIntervals")
			.returns(undefined);

		// code under test
		assert.deepEqual(
			ODataListBinding.prototype._getSkipAndTop.call(oBinding, 0, 10, "~maximumPrefetchSize"),
			undefined);
	});

	//*********************************************************************************************
	QUnit.test("_getSkipAndTop: creation area at end", function (assert) {
		var oBinding = {
				aKeys : "~keys",
				_getCreatedContexts : function () {},
				isFirstCreateAtEnd : function () {},
				iLength : "~bindingLength",
				bLengthFinal : true
			};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns([0, 1, 2]);
		this.mock(oBinding).expects("isFirstCreateAtEnd")
			.withExactArgs()
			.returns(true);
		this.mock(ODataUtils).expects("_getReadIntervals")
			.withExactArgs("~keys" , "~startIndex", "~length", "~maximumPrefetchSize",
				"~bindingLength")
			.returns("~aIntervals");
		this.mock(ODataUtils).expects("_mergeIntervals")
			.withExactArgs("~aIntervals")
			.returns({start : 222, end : 333});

		// code under test
		assert.deepEqual(
			ODataListBinding.prototype._getSkipAndTop.call(oBinding, "~startIndex",
				"~length", "~maximumPrefetchSize"),
			{skip : 222, top : 111});
	});

	//*********************************************************************************************
	QUnit.test("_getCreatedContexts:", function (assert) {
		var oModel = {_getCreatedContextsCache : function () {}},
			oBinding = {
				sCreatedEntitiesKey : "~CreatedEntitiesKey",
				oModel : oModel,
				getResolvedPath : function () {}
			},
			oCache = {getContexts : function () {}};

		this.mock(oModel).expects("_getCreatedContextsCache").withExactArgs().returns(oCache);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~Path");
		this.mock(oCache).expects("getContexts")
			.withExactArgs("~Path", "~CreatedEntitiesKey")
			.returns("~aContexts");

		// code under test
		assert.strictEqual(ODataListBinding.prototype._getCreatedContexts.call(oBinding),
			"~aContexts");
	});

	//*********************************************************************************************
	QUnit.test("_getCreatedPersistedContexts", function (assert) {
		var aContexts,
			oBinding = {_getCreatedContexts : function () {}},
			oContext0 = {isTransient : function () {}},
			oContext1 = {isTransient : function () {}},
			oContext2 = {isTransient : function () {}};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns([oContext0, oContext1, oContext2]);
		this.mock(oContext0).expects("isTransient").withExactArgs().returns(false);
		this.mock(oContext1).expects("isTransient").withExactArgs().returns(true);
		this.mock(oContext2).expects("isTransient").withExactArgs().returns(false);

		// code under test
		aContexts = ODataListBinding.prototype._getCreatedPersistedContexts.call(oBinding);

		assert.deepEqual(aContexts, [oContext0, oContext2]);
		assert.strictEqual(aContexts[0], oContext0);
		assert.strictEqual(aContexts[1], oContext2);
	});

	//*********************************************************************************************
	QUnit.test("_getCreatedPersistedExcludeFilter: only transient contexts", function (assert) {
		var oBinding = {_getCreatedPersistedContexts : function () {}};

		this.mock(oBinding).expects("_getCreatedPersistedContexts").withExactArgs().returns([]);
		this.mock(ODataUtils).expects("_createFilterParams").never();

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._getCreatedPersistedExcludeFilter.call(oBinding), undefined);
	});

	//*********************************************************************************************
	QUnit.test("_getCreatedPersistedExcludeFilter: with persisted contexts", function (assert) {
		var oBinding = {
				oEntityType : "~EntityType",
				oModel : {
					oMetadata : {}
				},
				_getCreatedPersistedContexts : function () {},
				_getFilterForPredicate : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oContext0 = {getPath : function () {}},
			oContext1 = {getPath : function () {}},
			oFilter1 = new Filter("~Path", FilterOperator.EQ, "foo"),
			oFilter2 = new Filter("~Path", FilterOperator.EQ, "bar");

		oBindingMock.expects("_getCreatedPersistedContexts")
			.withExactArgs()
			.returns([oContext0, oContext1]);
		this.mock(oContext0).expects("getPath").withExactArgs().returns("~sPath('1')");
		this.mock(oContext1).expects("getPath").withExactArgs().returns("~sPath('2')");
		oBindingMock.expects("_getFilterForPredicate").withExactArgs("('1')").returns(oFilter1);
		oBindingMock.expects("_getFilterForPredicate").withExactArgs("('2')").returns(oFilter2);
		this.mock(ODataUtils).expects("_createFilterParams")
			.withExactArgs(sinon.match(function (oFilter) {
					assert.ok(oFilter instanceof Filter);
					assert.deepEqual(oFilter.aFilters, [oFilter1, oFilter2]);
					assert.strictEqual(oFilter.aFilters[0], oFilter1);
					assert.strictEqual(oFilter.aFilters[1], oFilter2);
					assert.strictEqual(oFilter.bAnd, undefined);

					return true;
				}),
				sinon.match.same(oBinding.oModel.oMetadata), "~EntityType")
			.returns("~sExcludeFilter");

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._getCreatedPersistedExcludeFilter.call(oBinding),
			"not(~sExcludeFilter)");
	});

	//*********************************************************************************************
	QUnit.test("_getCreatedPersistedExcludeFilter: only one persisted context", function (assert) {
		var oBinding = {
				oEntityType : "~EntityType",
				oModel : {
					oMetadata : {}
				},
				_getCreatedPersistedContexts : function () {},
				_getFilterForPredicate : function () {}
			},
			oBindingMock = this.mock(oBinding),
			oContext = {getPath : function () {}},
			oFilter = new Filter("~Path", FilterOperator.EQ, "foo");

		oBindingMock.expects("_getCreatedPersistedContexts").withExactArgs().returns([oContext]);
		this.mock(oContext).expects("getPath").withExactArgs().returns("~sPath('1')");
		oBindingMock.expects("_getFilterForPredicate").withExactArgs("('1')").returns(oFilter);
		this.mock(ODataUtils).expects("_createFilterParams")
			.withExactArgs(sinon.match.same(oFilter),
				sinon.match.same(oBinding.oModel.oMetadata), "~EntityType")
			.returns("~sExcludeFilter");

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._getCreatedPersistedExcludeFilter.call(oBinding),
			"not(~sExcludeFilter)");
	});

	//*********************************************************************************************
[
	{excludeFilter : "~sExcludeFilter", result : ["foo", "$filter=~sExcludeFilter"]},
	{result : ["foo"]},
	{filterParams : "$filter=~Filter", useFilterParams : true, result : ["foo", "$filter=~Filter"]},
	{filterParams : "$filter=~Filter", useFilterParams : false, result : ["foo"]},
	{
		excludeFilter : "~sExcludeFilter",
		filterParams : "$filter=~Filter",
		useFilterParams : false,
		result : ["foo", "$filter=~sExcludeFilter"]
	},
	{
		excludeFilter : "~sExcludeFilter",
		filterParams : "$filter=~Filter",
		useFilterParams : true,
		result : ["foo", "$filter=(~Filter)%20and%20~sExcludeFilter"]
	}
].forEach(function (oFixture) {
	var sTitle = "_addFilterQueryOption: exclude filter=" + oFixture.excludeFilter;

	QUnit.test(sTitle, function (assert) {
		var oBinding = {
				sFilterParams : oFixture.filterParams,
				_getCreatedPersistedExcludeFilter : function () {}
			},
			aURLParams = ["foo"];

		this.mock(oBinding).expects("_getCreatedPersistedExcludeFilter")
			.withExactArgs()
			.returns(oFixture.excludeFilter);

		// code under test
		ODataListBinding.prototype._addFilterQueryOption.call(oBinding, aURLParams,
			oFixture.useFilterParams);

		assert.deepEqual(aURLParams, oFixture.result);
	});
});

	//*********************************************************************************************
[{
	bForceUpdate : true,
	sGroupId : "~sGroupId",
	expectedForceUpdate : true,
	expectedRefreshGroupId : "~sGroupId"
}, {
	bForceUpdate : false,
	sGroupId : "~sGroupId",
	expectedForceUpdate : false,
	expectedRefreshGroupId : "~sGroupId"
}, {
	bForceUpdate : "~sGroupId",
	sGroupId : "~sGroupId2",
	expectedForceUpdate : false,
	expectedRefreshGroupId : "~sGroupId"
}, {
	bForceUpdate : "~sGroupId",
	expectedForceUpdate : false,
	expectedRefreshGroupId : "~sGroupId"
}, {
	expectedForceUpdate : undefined,
	expectedRefreshGroupId : undefined
}].forEach(function (oFixture, i) {
	QUnit.test("refresh: #" + i, function (assert) {
		var oRefreshExpectation, oRemoveExpectation,
			oBinding = {
				sRefreshGroupId : "~foo",
				_refresh : function () {},
				_removePersistedCreatedContexts : function () {}
			};

		oRemoveExpectation = this.mock(oBinding).expects("_removePersistedCreatedContexts")
			.withExactArgs();
		oRefreshExpectation = this.mock(oBinding).expects("_refresh")
			.withExactArgs(oFixture.expectedForceUpdate)
			.callsFake(function () {
				assert.strictEqual(oBinding.sRefreshGroupId, oFixture.expectedRefreshGroupId);
			});

		// code under test
		ODataListBinding.prototype.refresh.call(oBinding, oFixture.bForceUpdate, oFixture.sGroupId);

		assert.ok(oBinding.hasOwnProperty("sRefreshGroupId"));
		assert.strictEqual(oBinding.sRefreshGroupId, undefined);
		assert.ok(oRefreshExpectation.calledImmediatelyAfter(oRemoveExpectation));
	});
});

	//*********************************************************************************************
	QUnit.test("sort: removes persisted created entries", function (assert) {
		var oModel = {resolveDeep : function () {}},
			oBinding = {
				aKeys : "~aKeys",
				bInitial : false,
				iLength : 42,
				oModel : oModel,
				_fireRefresh : function () {},
				_fireSort : function () {},
				_removePersistedCreatedContexts : function () {},
				abortPendingRequest : function () {},
				addComparators : function () {},
				createSortParams : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("useClientMode").withExactArgs().twice().returns(false);
		this.mock(oBinding).expects("createSortParams").withExactArgs([]);
		this.mock(oBinding).expects("addComparators").withExactArgs([], true);
		this.mock(oBinding).expects("_removePersistedCreatedContexts")
			.withExactArgs()
			.callsFake(function () {
				assert.strictEqual(oBinding.aKeys, "~aKeys");
			})
			.returns(["~persistedContext"]);
		this.mock(oBinding).expects("abortPendingRequest").withExactArgs(false);
		this.mock(oBinding).expects("_fireRefresh").withExactArgs({reason : ChangeReason.Sort});
		this.mock(oBinding).expects("_fireSort").withExactArgs({sorter : []});


		// code under test
		assert.strictEqual(ODataListBinding.prototype.sort.call(oBinding), oBinding);
		assert.strictEqual(oBinding.iLength, 43);
	});

	//*********************************************************************************************
[
	{createdPersistedProcessed : false, sorters : ["~sorter"], filterCalls : 0},
	{createdPersistedProcessed : true, sorters : ["~sorter"], filterCalls : 1},
	{createdPersistedProcessed : false, sorters : [], filterCalls : 1}
].forEach(function (oFixture, i) {
	QUnit.test("sort: handle created persisted in Client mode #" + i, function (assert) {
		var oBinding = {
				aAllKeys : "~aAllKeys",
				bInitial : false,
				_moveCreatedPersistedToAllKeys : function () {},
				_fireChange : function () {},
				_fireSort : function () {},
				addComparators : function () {},
				applyFilter : function () {},
				applySort : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("useClientMode").withExactArgs().twice().returns(true);
		this.mock(oBinding).expects("addComparators")
			.withExactArgs(sinon.match.same(oFixture.sorters), true);
		this.mock(oBinding).expects("_moveCreatedPersistedToAllKeys")
			.withExactArgs()
			.returns(oFixture.createdPersistedProcessed);
		this.mock(oBinding).expects("applyFilter").withExactArgs().exactly(oFixture.filterCalls);
		this.mock(oBinding).expects("applySort").withExactArgs();
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : ChangeReason.Sort});
		this.mock(oBinding).expects("_fireSort")
			.withExactArgs({sorter : sinon.match.same(oFixture.sorters)});

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype.sort.call(oBinding, oFixture.sorters),
			oBinding);
	});
});

	//*********************************************************************************************
	QUnit.test("filter: removes persisted created entries", function (assert) {
		var oRemoveExpectation, oResetDataExpectation,
			aApplicationFilters = [],
			oBinding = {
				aApplicationFilters : aApplicationFilters,
				bInitial : false,
				oModel : {checkFilterOperation : function () {}},
				_fireFilter : function () {},
				_fireRefresh : function () {},
				_removePersistedCreatedContexts : function () {},
				addComparators : function () {},
				abortPendingRequest : function () {},
				convertFilters : function () {},
				createFilterParams : function () {},
				resetData : function () {},
				useClientMode : function () {}
			},
			oBindingMock = this.mock(oBinding),
			aFilters = [];

		this.mock(oBinding.oModel).expects("checkFilterOperation")
			.withExactArgs(sinon.match.same(aFilters));
		oBindingMock.expects("convertFilters").withExactArgs();
		this.mock(FilterProcessor).expects("combineFilters")
			.withExactArgs(sinon.match.same(aFilters), sinon.match.same(aApplicationFilters))
			.returns("~oCombinedFilter");
		oBindingMock.expects("useClientMode").withExactArgs().twice().returns(false);
		oBindingMock.expects("createFilterParams").withExactArgs("~oCombinedFilter");
		oBindingMock.expects("addComparators").withExactArgs(sinon.match.same(aFilters));
		oBindingMock.expects("addComparators").withExactArgs(sinon.match.same(aApplicationFilters));
		oRemoveExpectation = oBindingMock.expects("_removePersistedCreatedContexts")
			.withExactArgs();
		oResetDataExpectation = oBindingMock.expects("resetData").withExactArgs();
		oBindingMock.expects("abortPendingRequest").withExactArgs(true);
		oBindingMock.expects("_fireRefresh").withExactArgs({reason : ChangeReason.Filter});
		oBindingMock.expects("_fireFilter").withExactArgs({filters : sinon.match.same(aFilters)});

		// code under test
		assert.strictEqual(ODataListBinding.prototype.filter.call(oBinding, aFilters), oBinding);

		assert.strictEqual(oBinding.aFilters, aFilters);
		assert.strictEqual(oBinding.oCombinedFilter, "~oCombinedFilter");
		assert.ok(oResetDataExpectation.calledImmediatelyAfter(oRemoveExpectation));
	});

	//*********************************************************************************************
	QUnit.test("filter: handle created persisted in Client mode", function (assert) {
		var oBinding = {
				aAllKeys : [],
				bInitial : false,
				oModel : {checkFilterOperation : function () {}},
				_moveCreatedPersistedToAllKeys : function () {},
				_fireChange : function () {},
				_fireFilter : function () {},
				addComparators : function () {},
				applyFilter : function () {},
				applySort : function () {},
				convertFilters : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding.oModel).expects("checkFilterOperation").withExactArgs([]);
		this.mock(oBinding).expects("convertFilters").withExactArgs();
		this.mock(FilterProcessor).expects("combineFilters")
			.withExactArgs([], [])
			.returns("~oCombinedFilter");
		this.mock(oBinding).expects("useClientMode").withExactArgs().twice().returns(true);
		this.mock(oBinding).expects("addComparators").withExactArgs([]).twice();
		this.mock(oBinding).expects("_moveCreatedPersistedToAllKeys").withExactArgs().returns(true);
		this.mock(oBinding).expects("applyFilter").withExactArgs();
		this.mock(oBinding).expects("applySort").withExactArgs();
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason: ChangeReason.Filter});
		this.mock(oBinding).expects("_fireFilter").withExactArgs({filters : []});

		// code under test
		assert.strictEqual(ODataListBinding.prototype.filter.call(oBinding), oBinding);
	});

	//*********************************************************************************************
	QUnit.test("_removePersistedCreatedContexts", function (assert) {
		var oCreatedContextCache = {
				removePersistedContexts : function () {}
			},
			oModel = {
				_getCreatedContextsCache : function () {},
				_updateBindingsForChangedContexts : function () {}
			},
			oBinding = {
				sCreatedEntitiesKey : "~sCreatedEntitiesKey",
				oModel : oModel,
				getResolvedPath : function () {}
			};

		this.mock(oModel).expects("_getCreatedContextsCache")
			.withExactArgs()
			.returns(oCreatedContextCache);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oCreatedContextCache).expects("removePersistedContexts")
			.withExactArgs("~resolvedPath", "~sCreatedEntitiesKey")
			.returns("~aRemovedContexts");

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._removePersistedCreatedContexts.call(oBinding),
			"~aRemovedContexts");
	});

	//*********************************************************************************************
	QUnit.test("isFirstCreateAtEnd", function (assert) {
		var oCreatedContextCache = {
				isAtEnd : function () {}
			},
			oModel = {
				_getCreatedContextsCache : function () {}
			},
			oBinding = {
				sCreatedEntitiesKey : "~sCreatedEntitiesKey",
				oModel : oModel,
				getResolvedPath : function () {}
			};

		this.mock(oModel).expects("_getCreatedContextsCache")
			.withExactArgs()
			.returns(oCreatedContextCache);
		this.mock(oBinding).expects("getResolvedPath").withExactArgs().returns("~resolvedPath");
		this.mock(oCreatedContextCache).expects("isAtEnd")
			.withExactArgs("~resolvedPath", "~sCreatedEntitiesKey")
			.returns("~bAtEnd");

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype.isFirstCreateAtEnd.call(oBinding),
			"~bAtEnd");
	});

	//*********************************************************************************************
	QUnit.test("getAllCurrentContexts: Return correct contexts", function (assert) {
		var aAllCurrentContexts,
			oBinding = {
				_getCreatedContexts : function () {},
				oContext : "~oContext",
				// eslint-disable-next-line no-sparse-arrays
				aKeys : ["foo(bar)", /* empty */, "foo(baz)"],
				oModel : {
					getContext : function () {},
					resolveDeep : function () {}
				},
				sPath : "~sPath"
			},
			oModelMock = this.mock(oBinding.oModel);

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(["~createdContexts"]);
		oModelMock.expects("getContext").withExactArgs("/foo(bar)").returns("~context(bar)");
		oModelMock.expects("getContext").withExactArgs("/foo(baz)").returns("~context(baz)");

		//code under test
		aAllCurrentContexts = ODataListBinding.prototype.getAllCurrentContexts.call(oBinding);

		assert.strictEqual(aAllCurrentContexts.length, 3);
		assert.ok(aAllCurrentContexts.includes("~createdContexts"));
		assert.ok(aAllCurrentContexts.includes("~context(bar)"));
		assert.ok(aAllCurrentContexts.includes("~context(baz)"));
	});

	//*********************************************************************************************
	QUnit.test("attachCreateActivate", function (assert) {
		var oBinding = {attachEvent : function () {}};

		this.mock(oBinding).expects("attachEvent")
			.withExactArgs("createActivate", "~fnFunction", "~oListener");

		// code under test
		ODataListBinding.prototype.attachCreateActivate.call(oBinding, "~fnFunction", "~oListener");
	});

	//*********************************************************************************************
	QUnit.test("detachCreateActivate", function (assert) {
		var oBinding = {detachEvent : function () {}};

		this.mock(oBinding).expects("detachEvent")
			.withExactArgs("createActivate", "~fnFunction", "~oListener");

		// code under test
		ODataListBinding.prototype.detachCreateActivate.call(oBinding, "~fnFunction", "~oListener");
	});

	//*********************************************************************************************
	QUnit.test("getCount, length not final", function (assert) {
		var oBinding = {
				isLengthFinal : function () {}
			};

		this.mock(oBinding).expects("isLengthFinal").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getCount.call(oBinding), undefined);
	});

	//*********************************************************************************************
	QUnit.test("getCount, length final", function (assert) {
		var oBinding = {
				_getCreatedContexts : function () {},
				getLength : function () {},
				isLengthFinal : function () {}
			},
			oContext = {isInactive : function () {}},
			oContext2 = {isInactive : function () {}},
			aCreatedContexts = [oContext, oContext2];

		this.mock(oBinding).expects("isLengthFinal").withExactArgs().returns(true);
		this.mock(oBinding).expects("getLength").withExactArgs().returns(42);
		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns(aCreatedContexts);
		this.mock(oContext).expects("isInactive").withExactArgs().returns(true);
		this.mock(oContext2).expects("isInactive").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(ODataListBinding.prototype.getCount.call(oBinding), 41);
	});

	//*********************************************************************************************
	QUnit.test("_hasTransientParentContext, absolute binding", function (assert) {
		var oBinding = {isRelative : function () {}};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(false);

		// code under test
		assert.strictEqual(ODataListBinding.prototype._hasTransientParentContext.call(oBinding),
			false);
	});

	//*********************************************************************************************
[{ // no context
	oContext : undefined,
	bResult : false
}, { // non-V2 context
	oContext : {},
	bResult : false
}, { // non-transient context
	oContext : {isTransient : function () {}},
	bResult : false,
	bTransient : false
}, { // context with persited data
	oContext : {isTransient : function () {}},
	bResult : false,
	bTransient : undefined
}, { // transient context
	oContext : {isTransient : function () {}},
	bResult : true,
	bTransient : true
}].forEach(function (oFixture, i) {
	QUnit.test("_hasTransientParentContext, relative binding, " + i, function (assert) {
		var oBinding = {
				oContext : oFixture.oContext,
				isRelative : function () {}
			};

		this.mock(oBinding).expects("isRelative").withExactArgs().returns(true);
		if ("bTransient" in oFixture) {
			this.mock(oBinding.oContext).expects("isTransient")
				.withExactArgs()
				.returns(oFixture.bTransient);
		}

		// code under test
		assert.strictEqual(ODataListBinding.prototype._hasTransientParentContext.call(oBinding),
			oFixture.bResult);
	});
});

	//*********************************************************************************************
[{
	bResolved : undefined,
	bResult : true,
	bTransient : true
}, {
	bResolved : false,
	bResult : true,
	bTransient : false
}, {
	bResolved : true,
	bResult : false,
	bTransient : false
}].forEach(function (oFixture, i) {
	QUnit.test("resetData: set bLengthFinal #" + i, function (assert) {
		var oBinding = {
				_hasTransientParentContext : function () {},
				isResolved : function () {}
			};

		this.mock(oBinding).expects("_hasTransientParentContext")
			.withExactArgs()
			.returns(oFixture.bTransient);
		this.mock(oBinding).expects("isResolved")
			.withExactArgs()
			.exactly(oFixture.bResolved === undefined ? 0 : 1)
			.returns(oFixture.bResolved);

		// code under test
		ODataListBinding.prototype.resetData.call(oBinding);

		assert.strictEqual(oBinding.bLengthFinal, oFixture.bResult);
	});
});

	//*********************************************************************************************
[false, true].forEach(function (bExpandedList) {
	QUnit.test("checkUpdate: bExpandedList = " + bExpandedList, function (assert) {
		var oBinding = {
				sChangeReason : "~sChangeReason",
				aKeys : [],
				_cleanupCreatedPersisted : function () {},
				_fireChange : function () {},
				checkExpandedList : function () {},
				useClientMode : function () {}
			};

		this.mock(oBinding).expects("_cleanupCreatedPersisted").withExactArgs().returns(false);
		this.mock(oBinding).expects("checkExpandedList").withExactArgs(true).returns(bExpandedList);
		this.mock(oBinding).expects("useClientMode").withExactArgs().exactly(bExpandedList ? 0 : 1);
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : "~sChangeReason"});

		// code under test
		ODataListBinding.prototype.checkUpdate.call(oBinding);

		assert.strictEqual(oBinding.bNeedsUpdate, false);
		assert.strictEqual(oBinding.sChangeReason, undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("checkUpdate: #_cleanupCreatedPersisted=true fires change event", function (assert) {
		var oBinding = {
				sChangeReason : "~sChangeReason",
				aKeys : [],
				aLastContextData : [],
				aLastContexts : [],
				iLastLength : "~iLastLength",
				iLastStartIndex : "~iLastStartIndex",
				_cleanupCreatedPersisted : function () {},
				_fireChange : function () {},
				_getContexts : function () {},
				checkExpandedList : function () {}
			};

		this.mock(oBinding).expects("_cleanupCreatedPersisted").withExactArgs().returns(true);
		this.mock(oBinding).expects("checkExpandedList").withExactArgs(true).returns(true);
		this.mock(oBinding).expects("_getContexts")
			.withExactArgs("~iLastStartIndex", "~iLastLength")
			.returns([]);
		this.mock(oBinding).expects("_fireChange").withExactArgs({reason : "~sChangeReason"});

		// code under test
		ODataListBinding.prototype.checkUpdate.call(oBinding);

		assert.strictEqual(oBinding.bNeedsUpdate, false);
		assert.strictEqual(oBinding.sChangeReason, undefined);
	});

	//*********************************************************************************************
[
	{bSuspended : true},
	{bPendingRequest : true},
	{bInitial : true}
].forEach(function (oBindingProperties) {
	var sTitle = "checkUpdate: #_cleanupCreatedPersisted is called without change event: "
			+ JSON.stringify(oBindingProperties);

	QUnit.test(sTitle, function (assert) {
		var oBinding = Object.assign({
				bNeedsUpdate : true,
				_cleanupCreatedPersisted : function () {},
				_fireChange : function () {}
			}, oBindingProperties);

		this.mock(oBinding).expects("_cleanupCreatedPersisted")
			.withExactArgs()
			.returns(/*value not relevant*/ "~bCreatedPersistedRemoved");
		this.mock(oBinding).expects("_fireChange").never();

		// code under test
		ODataListBinding.prototype.checkUpdate.call(oBinding);
	});
});

	//*********************************************************************************************
[
	{mCustomParams : "foo", sOperationMode : "~notRelevant"},
	{aApplicationFilters : ["foo"]},
	{aFilters : ["foo"]},
	{aSorters : ["foo"]}
].forEach(function (oBindingEnhancement, i) {
	QUnit.test("_isExpandedListUsable: returns false #" + i, function (assert) {
		var oBinding = {
				aApplicationFilters : [],
				aFilters : [],
				sOperationMode : OperationMode.Server,
				aSorters : []
			};

		Object.assign(oBinding, oBindingEnhancement);

		// code under test
		assert.strictEqual(ODataListBinding.prototype._isExpandedListUsable.call(oBinding), false);
	});
});

	//*********************************************************************************************
[{
	// no custom params and no filters/sorters
}, {
	sOperationMode : OperationMode.Server
}, {
	sOperationMode : "~notServer",
	aApplicationFilters : ["foo"],
	aFilters : ["foo"],
	aSorters : ["foo"]
}].forEach(function (oBindingEnhancement, i) {
	QUnit.test("_isExpandedListUsable: returns true #" + i, function (assert) {
		var oBinding = {
				aApplicationFilters : [],
				aFilters : [],
				aSorters : []
			};

		Object.assign(oBinding, oBindingEnhancement);

		// code under test
		assert.strictEqual(ODataListBinding.prototype._isExpandedListUsable.call(oBinding), true);
	});
});

	//*********************************************************************************************
[
	{expandedListUsable : false, entityType : "~wrongType", refreshExpected : false},
	{expandedListUsable : true, entityType : "~entityType", refreshExpected : false},
	{expandedListUsable : false, entityType : "~entityType", refreshExpected : true}
].forEach(function (oFixture, i) {
	QUnit.test("_refreshForSideEffects: " + i, function (assert) {
		var oBinding = {
				oEntityType : oFixture.entityType,
				_isExpandedListUsable : function () {},
				_refresh : function () {}
			};

		this.mock(oBinding).expects("_isExpandedListUsable")
			.withExactArgs()
			.returns(oFixture.expandedListUsable);
		this.mock(oBinding).expects("_refresh")
			.withExactArgs()
			.callsFake(function () {
				assert.strictEqual(oBinding.sRefreshGroupId, "~sGroupId");
			})
			.exactly(oFixture.refreshExpected ? 1 : 0);

		// code under test
		ODataListBinding.prototype._refreshForSideEffects.call(oBinding,
			new Set(["~entityType"]), "~sGroupId");

		assert.strictEqual(oBinding.sRefreshGroupId, undefined);
	});
});

	//*********************************************************************************************
	QUnit.test("_cleanupCreatedPersisted: all keys in aList", function (assert) {
		var oBinding = {
				oContext : "~oContext",
				oCreatedPersistedToRemove : new Set(),
				oModel : {
					_getObject : function () {},
					getKey : function () {}
				},
				sPath : "~sPath",
				_getCreatedPersistedContexts : function () {}
			},
			aList = ["~sEntityKey"];

		aList.sideEffects = true;

		this.mock(oBinding.oModel).expects("_getObject")
			.withExactArgs("~sPath", "~oContext")
			.returns(aList);
		this.mock(oBinding).expects("_getCreatedPersistedContexts")
			.withExactArgs()
			.returns(["~oContext"]);
		this.mock(oBinding.oModel).expects("getKey")
			.withExactArgs("~oContext")
			.returns("~sEntityKey");

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._cleanupCreatedPersisted.call(oBinding),
			false);
	});

	//*********************************************************************************************
	QUnit.test("_cleanupCreatedPersisted: some keys not in aList", function (assert) {
		var oBinding = {
				oContext : "~oContext",
				oCreatedPersistedToRemove : new Set(),
				oModel : {
					_discardEntityChanges : function () {},
					_getObject : function () {},
					getKey : function () {}
				},
				sPath : "~sPath",
				_getCreatedPersistedContexts : function () {}
			},
			oModelMock = this.mock(oBinding.oModel),
			aList = ["~key0"];

		aList.sideEffects = true;

		this.mock(oBinding.oModel).expects("_getObject")
			.withExactArgs("~sPath", "~oContext")
			.returns(aList);
		this.mock(oBinding).expects("_getCreatedPersistedContexts")
			.withExactArgs()
			.returns(["~oContext0", "~oContext1"]);
		oModelMock.expects("getKey").withExactArgs("~oContext0").returns("~key0");
		oModelMock.expects("getKey").withExactArgs("~oContext1").returns("~key1");
		oModelMock.expects("_discardEntityChanges").withExactArgs("~key1", true);

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._cleanupCreatedPersisted.call(oBinding),
			true);
	});

	//*********************************************************************************************
[undefined, ["foo"]].forEach(function (aList, i) {
	QUnit.test("_cleanupCreatedPersisted: no side effects scenario #" + i, function (assert) {
		var oBinding = {
				oContext : "~oContext",
				oCreatedPersistedToRemove : new Set(),
				oModel : {_getObject : function () {}},
				sPath : "~sPath",
				_getCreatedPersistedContexts : function () {}
			};

		this.mock(oBinding.oModel).expects("_getObject")
			.withExactArgs("~sPath", "~oContext")
			.returns(aList);
		this.mock(oBinding).expects("_getCreatedPersistedContexts").never();

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._cleanupCreatedPersisted.call(oBinding),
			false);
	});
});

	//*********************************************************************************************
	QUnit.test("_cleanupCreatedPersisted: bSuspended=true", function (assert) {
		var oBinding = {
				oContext : "~oContext",
				oCreatedPersistedToRemove : new Set(),
				oModel : {
					_discardEntityChanges : function () {},
					_getObject : function () {},
					getKey : function () {}
				},
				sPath : "~sPath",
				bSuspended : true,
				_getCreatedPersistedContexts : function () {}
			},
			aList = ["~key0"],
			oModelMock = this.mock(oBinding.oModel);

		aList.sideEffects = true;

		oModelMock.expects("_getObject")
			.withExactArgs("~sPath", "~oContext")
			.returns(aList);
		this.mock(oBinding).expects("_getCreatedPersistedContexts")
			.withExactArgs()
			.returns(["~oContext0", "~oContext1"]);
		oModelMock.expects("getKey").withExactArgs("~oContext0").returns("~key0");
		oModelMock.expects("getKey").withExactArgs("~oContext1").returns("~key1");
		this.mock(oBinding.oCreatedPersistedToRemove).expects("add").withExactArgs("~key1");
		oModelMock.expects("_discardEntityChanges").never();

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._cleanupCreatedPersisted.call(oBinding),
			false);
	});

	//*********************************************************************************************
	QUnit.test("_cleanupCreatedPersisted: resume after suspended", function (assert) {
		var oBinding = {
				oContext : "~oContext",
				oCreatedPersistedToRemove : new Set(["~key0", "~key1"]),
				oModel : {
					_discardEntityChanges : function () {},
					_getObject : function () {}
				},
				sPath : "~sPath",
				bSuspended : false,
				_getCreatedPersistedContexts : function () {}
			},
			oModelMock = this.mock(oBinding.oModel);

		oModelMock.expects("_getObject").withExactArgs("~sPath", "~oContext").returns(undefined);
		oModelMock.expects("_discardEntityChanges").withExactArgs("~key0", true);
		oModelMock.expects("_discardEntityChanges").withExactArgs("~key1", true);
		this.mock(oBinding.oCreatedPersistedToRemove).expects("clear").withExactArgs();

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._cleanupCreatedPersisted.call(oBinding),
			true);
	});

	//*********************************************************************************************
[
	{oCreatedPersistedToRemove : new Set(), bSuspended : false},
	{oCreatedPersistedToRemove : new Set("~key"), bSuspended : true}
].forEach(function (oBindingProperties, i) {
	var sTitle = "_cleanupCreatedPersisted: no reset of oCreatedPersistedToRemove needed #" + i;

	QUnit.test(sTitle, function (assert) {
		var oBinding = Object.assign({
				oContext : "~oContext",
				oModel : {_getObject : function () {}},
				sPath : "~sPath"
			}, oBindingProperties);

		this.mock(oBinding.oModel).expects("_getObject")
			.withExactArgs("~sPath", "~oContext")
			.returns(undefined);
		this.mock(oBinding.oCreatedPersistedToRemove).expects("clear").never();

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._cleanupCreatedPersisted.call(oBinding),
			false);
	});
});

	//*********************************************************************************************
	QUnit.test("_moveCreatedPersistedToAllKeys: no created persisted items", function (assert) {
		var oBinding = {
				aAllKeys : ["~key0"],
				_getCreatedPersistedContexts : function () {},
				_removePersistedCreatedContexts : function () {}
			};

		this.mock(oBinding).expects("_getCreatedPersistedContexts").withExactArgs().returns([]);
		this.mock(oBinding).expects("_removePersistedCreatedContexts").never();

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._moveCreatedPersistedToAllKeys.call(oBinding),
			false);

		assert.deepEqual(oBinding.aAllKeys, ["~key0"]);
	});

	//*********************************************************************************************
	QUnit.test("_moveCreatedPersistedToAllKeys: has created persisted items", function (assert) {
		var oBinding = {
				aAllKeys : ["~key0"],
				oModel : {getKey : function () {}},
				_getCreatedPersistedContexts : function () {},
				_removePersistedCreatedContexts : function () {}
			},
			oModelMock = this.mock(oBinding.oModel);

		this.mock(oBinding).expects("_getCreatedPersistedContexts")
			.withExactArgs()
			.returns(["~context0", "~context1"]);
		oModelMock.expects("getKey").withExactArgs("~context0").returns("~key1");
		oModelMock.expects("getKey").withExactArgs("~context1").returns("~key2");
		this.mock(oBinding).expects("_removePersistedCreatedContexts").withExactArgs();

		// code under test
		assert.strictEqual(
			ODataListBinding.prototype._moveCreatedPersistedToAllKeys.call(oBinding),
			true);

		assert.deepEqual(oBinding.aAllKeys, ["~key0", "~key1", "~key2"]);
	});

	//*********************************************************************************************
	QUnit.test("_reassignCreateActivate", function (assert) {
		var fnResolveActivatedPromise,
			oActivatedPromise = new Promise(function (resolve) {
				fnResolveActivatedPromise = resolve;
			}),
			oBinding = {
				_getCreatedContexts : function () {},
				fireEvent : function () {}
			},
			oContext0 = {isInactive : function () {}},
			oContext1 = {
				fetchActivated : function () {},
				isInactive : function () {}
			};

		this.mock(oBinding).expects("_getCreatedContexts")
			.withExactArgs()
			.returns([oContext0, oContext1]);
		this.mock(oContext0).expects("isInactive").withExactArgs().returns(false);
		this.mock(oContext1).expects("isInactive").withExactArgs().returns(true);
		this.mock(oContext1).expects("fetchActivated").withExactArgs().returns(oActivatedPromise);

		// code under test
		ODataListBinding.prototype._reassignCreateActivate.call(oBinding);

		this.mock(oBinding).expects("fireEvent").withExactArgs("createActivate");

		// code under test: async context activation
		fnResolveActivatedPromise();

		return oActivatedPromise;
	});
});