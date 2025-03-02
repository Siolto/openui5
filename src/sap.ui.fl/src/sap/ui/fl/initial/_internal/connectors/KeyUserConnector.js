/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/initial/_internal/connectors/BackendConnector"
], function(
	merge,
	BackendConnector
) {
	"use strict";

	var PREFIX = "/flex/keyuser";
	var API_VERSION = "/v2";

	/**
	 * Connector for requesting data from SAPUI5 Flexibility KeyUser service.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.KeyUserConnector
	 * @since 1.70
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.Storage, sap.ui.fl.write._internal.Storage
	 */
	var KeyUserConnector = merge({}, BackendConnector, { /** @lends sap.ui.fl.initial._internal.connectors.KeyUserConnector */
		API_VERSION: API_VERSION,
		ROUTES: {
			DATA: PREFIX + API_VERSION + "/data/"
		},
		isLanguageInfoRequired: true,
		loadFlexData: function(mPropertyBag) {
			return BackendConnector.sendRequest.call(KeyUserConnector, mPropertyBag).then(function (oResult) {
				oResult.contents.map(function(oContent, iIndex, oResult) {
					oResult[iIndex].changes = (oContent.changes || []).concat(oContent.compVariants);
				});
				oResult.contents.cacheKey = oResult.cacheKey;
				return oResult.contents;
			});
		}
	});

	return KeyUserConnector;
});