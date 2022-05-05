sap.ui.define(['sap/ui/webc/common/thirdparty/base/renderer/LitRenderer'], function (litRender) { 'use strict';

	const block0 = (context, tags, suffix) => suffix ? litRender.html`<div class="ui5-multi-combobox-root ui5-input-focusable-element"><span id="${litRender.ifDefined(context._id)}-hiddenText-nMore" class="ui5-hidden-text">${litRender.ifDefined(context._tokensCountText)}</span>${ context.hasValueState ? block1(context) : undefined }<${litRender.scopeTag("ui5-tokenizer", tags, suffix)} slot="_beginContent" show-more class="ui5-multi-combobox-tokenizer" ?disabled="${context.disabled}" @ui5-show-more-items-press="${litRender.ifDefined(context._showFilteredItems)}" @ui5-token-delete="${litRender.ifDefined(context._tokenDelete)}" @focusout="${context._tokenizerFocusOut}" @focusin="${context._tokenizerFocusIn}" @click=${context._click} @keydown="${context._onTokenizerKeydown}" ?expanded="${context._tokenizerExpanded}">${ litRender.repeat(context.items, (item, index) => item._id || index, (item, index) => block2(item, index, context, tags, suffix)) }</${litRender.scopeTag("ui5-tokenizer", tags, suffix)}><input id="ui5-multi-combobox-input" .value="${litRender.ifDefined(context.value)}" inner-input placeholder=${litRender.ifDefined(context._getPlaceholder)} ?disabled=${context.disabled} ?readonly=${context.readonly} value-state="${litRender.ifDefined(context.valueState)}" @input="${context._inputLiveChange}" @change=${context._inputChange} @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @click=${context._click} @focusin=${context.inputFocusIn} @focusout=${context.inputFocusOut} role="combobox" aria-haspopup="listbox" aria-expanded="${litRender.ifDefined(context.open)}" aria-autocomplete="both" aria-describedby="${litRender.ifDefined(context.ariaDescribedByText)}" aria-required="${litRender.ifDefined(context.required)}" />${ context.icon ? block4() : undefined }${ !context.readonly ? block5(context, tags, suffix) : undefined }</div>` : litRender.html`<div class="ui5-multi-combobox-root ui5-input-focusable-element"><span id="${litRender.ifDefined(context._id)}-hiddenText-nMore" class="ui5-hidden-text">${litRender.ifDefined(context._tokensCountText)}</span>${ context.hasValueState ? block1(context) : undefined }<ui5-tokenizer slot="_beginContent" show-more class="ui5-multi-combobox-tokenizer" ?disabled="${context.disabled}" @ui5-show-more-items-press="${litRender.ifDefined(context._showFilteredItems)}" @ui5-token-delete="${litRender.ifDefined(context._tokenDelete)}" @focusout="${context._tokenizerFocusOut}" @focusin="${context._tokenizerFocusIn}" @click=${context._click} @keydown="${context._onTokenizerKeydown}" ?expanded="${context._tokenizerExpanded}">${ litRender.repeat(context.items, (item, index) => item._id || index, (item, index) => block2(item, index, context, tags, suffix)) }</ui5-tokenizer><input id="ui5-multi-combobox-input" .value="${litRender.ifDefined(context.value)}" inner-input placeholder=${litRender.ifDefined(context._getPlaceholder)} ?disabled=${context.disabled} ?readonly=${context.readonly} value-state="${litRender.ifDefined(context.valueState)}" @input="${context._inputLiveChange}" @change=${context._inputChange} @keydown="${context._onkeydown}" @keyup="${context._onkeyup}" @click=${context._click} @focusin=${context.inputFocusIn} @focusout=${context.inputFocusOut} role="combobox" aria-haspopup="listbox" aria-expanded="${litRender.ifDefined(context.open)}" aria-autocomplete="both" aria-describedby="${litRender.ifDefined(context.ariaDescribedByText)}" aria-required="${litRender.ifDefined(context.required)}" />${ context.icon ? block4() : undefined }${ !context.readonly ? block5(context, tags, suffix) : undefined }</div>`;
	const block1 = (context, tags, suffix) => litRender.html`<span id="${litRender.ifDefined(context._id)}-valueStateDesc" class="ui5-hidden-text">${litRender.ifDefined(context.valueStateText)}</span>`;
	const block2 = (item, index, context, tags, suffix) => litRender.html`${ item.selected ? block3(item, index, context, tags, suffix) : undefined }`;
	const block3 = (item, index, context, tags, suffix) => suffix ? litRender.html`<${litRender.scopeTag("ui5-token", tags, suffix)} ?readonly="${context.readonly}" class="ui5-multi-combobox-token" data-ui5-id="${litRender.ifDefined(item._id)}" part="token-${index}" text="${litRender.ifDefined(item.text)}"></${litRender.scopeTag("ui5-token", tags, suffix)}>` : litRender.html`<ui5-token ?readonly="${context.readonly}" class="ui5-multi-combobox-token" data-ui5-id="${litRender.ifDefined(item._id)}" part="token-${index}" text="${litRender.ifDefined(item.text)}"></ui5-token>`;
	const block4 = (context, tags, suffix) => litRender.html`<slot name="icon"></slot>`;
	const block5 = (context, tags, suffix) => suffix ? litRender.html`<${litRender.scopeTag("ui5-icon", tags, suffix)} name="slim-arrow-down" input-icon slot="icon" tabindex="-1" @click="${context.togglePopoverByDropdownIcon}" @mousedown="${context._onIconMousedown}" @focusin="${context._forwardFocusToInner}" ?pressed="${context.open}" dir="${litRender.ifDefined(context.effectiveDir)}" accessible-name="${litRender.ifDefined(context._iconAccessibleNameText)}"></${litRender.scopeTag("ui5-icon", tags, suffix)}>` : litRender.html`<ui5-icon name="slim-arrow-down" input-icon slot="icon" tabindex="-1" @click="${context.togglePopoverByDropdownIcon}" @mousedown="${context._onIconMousedown}" @focusin="${context._forwardFocusToInner}" ?pressed="${context.open}" dir="${litRender.ifDefined(context.effectiveDir)}" accessible-name="${litRender.ifDefined(context._iconAccessibleNameText)}"></ui5-icon>`;

	return block0;

});
