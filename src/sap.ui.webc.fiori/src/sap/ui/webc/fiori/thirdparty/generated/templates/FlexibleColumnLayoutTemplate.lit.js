sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => litRender.html`<div class="${litRender.classMap(context.classes.root)}"><div role="${litRender.ifDefined(context._accAttributes.columns.start.role)}" aria-hidden="${litRender.ifDefined(context._accAttributes.columns.start.ariaHidden)}" class="${litRender.classMap(context.classes.columns.start)}" aria-labelledby="${litRender.ifDefined(context._id)}-startColumnText"><span id="${litRender.ifDefined(context._id)}-startColumnText" class="ui5-hidden-text">${litRender.ifDefined(context.accStartColumnText)}</span><slot name="startColumn"></slot></div><div role="${litRender.ifDefined(context.accStartArrowContainerRole)}" aria-label=${litRender.ifDefined(context.accStartArrowContainerText)} class="ui5-fcl-arrow-container ui5-fcl-arrow-container-start" style="${litRender.styleMap(context.styles.arrowsContainer.start)}"><${litRender.scopeTag("ui5-button", tags, suffix)} class="ui5-fcl-arrow ui5-fcl-arrow--start" icon="slim-arrow-right" design="Transparent" @click="${context.startArrowClick}" style="${litRender.styleMap(context.styles.arrows.start)}" tooltip="${litRender.ifDefined(context.accStartArrowText)}"></${litRender.scopeTag("ui5-button", tags, suffix)}></div><div role="${litRender.ifDefined(context._accAttributes.columns.middle.role)}" aria-hidden="${litRender.ifDefined(context._accAttributes.columns.middle.ariaHidden)}" class="${litRender.classMap(context.classes.columns.middle)}" aria-labelledby="${litRender.ifDefined(context._id)}-midColumnText"><span id="${litRender.ifDefined(context._id)}-midColumnText" class="ui5-hidden-text">${litRender.ifDefined(context.accMiddleColumnText)}</span><slot name="midColumn"></slot></div><div role="${litRender.ifDefined(context.accEndArrowContainerRole)}" aria-label="${litRender.ifDefined(context.accEndArrowContainerText)}" class="ui5-fcl-arrow-container ui5-fcl-arrow-container-end" style="${litRender.styleMap(context.styles.arrowsContainer.end)}"><${litRender.scopeTag("ui5-button", tags, suffix)} class="ui5-fcl-arrow ui5-fcl-arrow--end" style="${litRender.styleMap(context.styles.arrows.end)}" icon="slim-arrow-left" design="Transparent" @click="${context.endArrowClick}" tooltip="${litRender.ifDefined(context.accEndArrowText)}"></${litRender.scopeTag("ui5-button", tags, suffix)}></div><div role="${litRender.ifDefined(context._accAttributes.columns.end.role)}" aria-hidden="${litRender.ifDefined(context._accAttributes.columns.end.ariaHidden)}" class="${litRender.classMap(context.classes.columns.end)}" aria-labelledby="${litRender.ifDefined(context._id)}-endColumnText"><span id="${litRender.ifDefined(context._id)}-endColumnText" class="ui5-hidden-text">${litRender.ifDefined(context.accEndColumnText)}</span><slot name="endColumn"></slot></div></div> `;

	return block0;

});
