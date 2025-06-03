// ==UserScript==
// @name         WaifuGame: Search: show Card Attributes
// @namespace    https://github.com/dronte57/waifugame-greasemonkey-scripts
// @version      0.2
// @description  Annotate cards with attributes for improved searchability. Limit server load by caching fetched values, limiting request rate.
// @author       dronte57
// @match        https://waifugame.com/search?*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://github.com/dronte57/waifugame-greasemonkey-scripts/raw/refs/heads/main/WaifuGameSearchShowAttributes.user.js
// @downloadURL  https://github.com/dronte57/waifugame-greasemonkey-scripts/raw/refs/heads/main/WaifuGameSearchShowAttributes.user.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_deleteValues
// @grant        GM_listValues
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

	function escapeHtml(text) {
		var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return text.replace(/[&<>"']/g, function(m) { return map[m]; });
	}

	var RequestRateLimiter = {
		_syntheticTimestamp: 0,
		_delayMS: 220,
		_delayOnErrorMS: 7*1000,
		_queue: [],
		_timer: undefined,
		_totalEnqueued: 0,
		scheduleWithRateLimit: function(callback) {
			this._queue.push(callback);
			this._totalEnqueued = this._totalEnqueued+1;
			this._setupTimer();
		},
		_setupTimer: function() {
			if (this._timer)
				return;

			var delay = 1;
			var current = Date.now();
			if (this._syntheticTimestamp) {
				var elapsed = current - this._syntheticTimestamp;
				delay = this._delayMS - elapsed; }
			this._syntheticTimestamp = Math.max(this._syntheticTimestamp+this._delayMS, current+this._delayMS);
			var callback = this.onTimeout.bind(this);
			this._timer = window.setTimeout(callback, delay);
		},
		onTimeout: function() {
			var callback = this._queue.shift();
			this._timer = undefined;
			if (this._queue.length)
				this._setupTimer();
			callback();
		},
		schedulingAdjustOnErorr: function() {
			var current = Date.now();
			this._syntheticTimestamp = Math.max(this._syntheticTimestamp+this._delayOnErrorMS, current+this._delayOnErrorMS);
		},
		progressReport: function() {
			return ''+this._queue.length+' / '+this._totalEnqueued;
		},
		progressIsDone: function() {
			return this._queue.length <= 0;
		},
	};

	var AttributeProgressDisplay = {
		_toastElement: undefined,
		_toastErrorElement: undefined,
		_toastId: 'toast-wg-search-show-card-attributes-progress',
		_toastErrorId: 'toast-wg-search-show-card-attributes-error',
		render: function(text) {
			if (!this._toastElement) {
				const toastHTML = `
					<div id="${this._toastId}" class="toast toast-tiny toast-top bg-green-dark">
						<i class="fa fa-clock mr-3"></i><span class="toast-text">(placeholder)</span>
					</div>
				`;

				$('.toast-container').append(toastHTML);
				this._toastElement = $(`#${this._toastId}`).toast({autohide:false});
			}
			$(this._toastElement).find('.toast-text').text('Loading: '+text);
			$(this._toastElement).toast('show')[0];
		},
		renderError: function(text) {
			if (this._toastElement) {
				$(this._toastElement).toast('hide');
				$(this._toastElement).remove();
			}
			if (!this._toastErrorElement) {
				const toastHTML = `
					<div id="${this._toastErrorId}" class="toast toast-tiny toast-top bg-red-dark">
						<i class="fa fa-clock mr-3"></i><span class="toast-text">(placeholder)</span>
					</div>
				`;

				$('.toast-container').append(toastHTML);
				this._toastErrorElement = $(`#${this._toastErrorId}`).toast({autohide:false}).toast('show')[0];
			}
			$(this._toastErrorElement).find('.toast-text').text('Loading ERROR: '+text);
		},
		setupHide: function() {
			window.setTimeout(()=>$(this._toastElement).toast('hide'), 600);
		},
	};

	var AttributeCache = {
		expiryTimeSeconds: 31*24*3600,
		// to avoid expiring all cached records at nearly the same time, to prevent swamping server with requests
		// spread expiration a little bit over time
		expiryTimeoutFudgeWindow: 4*24*3600,
		get: function(CardID) {
			var key = 'card-attributes-cache-'+CardID;
			var wrapped = GM_getValue(key);
			if (wrapped == undefined)
				return undefined;
			else if (wrapped.expiryBasis+this.expiryTimeSeconds<(Date.now()/1000)) {
				GM_deleteValue(key);
				return undefined;
			}
			else
				return wrapped.payload;
		},
		put: function(CardID, attributes) {
			var key = 'card-attributes-cache-'+CardID;
			var expiryFudge = this.expiryTimeoutFudgeWindow * Math.random();
			var wrapped = {
				payload: attributes,
				expiryBasis: Math.round((Date.now()/1000)+expiryFudge),
			};
			GM_setValue(key, wrapped);
		},
	};

	// keep only requisite attributes to conserve storage space
	function AttributeCleanup(attributes) {
		return {
			CardID: attributes.CardID,
			Element: attributes.Element,
			Nature: attributes.Nature,
			Trait: attributes.Trait,
		};
	}

	function annotateCardWithStats_updateHelper(attributes) {
		var CardObject = $('div[data-cardid="'+attributes.CardID+'"]');
		var AttributeDisplayObject = CardObject.find('.card-attributes-display');
		AttributeDisplayObject.find('.card-attribute-Element').text(attributes.Element);
		AttributeDisplayObject.find('.card-attribute-Nature').text(attributes.Nature);
		AttributeDisplayObject.find('.card-attribute-Trait').text(attributes.Trait);
	}

	function annotateCardWithStats_ScheduleFetch(CardID) {
		AttributeProgressDisplay.render(RequestRateLimiter.progressReport());
		if (RequestRateLimiter.progressIsDone())
			AttributeProgressDisplay.setupHide();
		$.ajax('https://waifugame.com/json/card/' + encodeURIComponent(CardID), {
			success: function(data, requestStatus, Request) {
				var attributes = AttributeCleanup(data);
				AttributeCache.put(attributes.CardID, attributes)
				annotateCardWithStats_updateHelper(attributes);
			},
			error: function(jqXHR, textStatus, errorThrown) {
				RequestRateLimiter.schedulingAdjustOnErorr();
				var text = 'unknown';
				if (jqXHR.status == 429)
					text = '429 Too Many Requests';
				else
					text = ''+jqXHR.status+' '+jqXHR.statusText;
				AttributeProgressDisplay.renderError(text);
			},});
	}

	function annotateCardWithStats_cachedOrFetch(CardID) {
		var attributes;
		if (attributes = AttributeCache.get(CardID))
			annotateCardWithStats_updateHelper(attributes);
		else
			RequestRateLimiter.scheduleWithRateLimit(function(){annotateCardWithStats_ScheduleFetch(CardID)});
	}

	var _inProgress = [];
	function annotateCardWithStats(Index, CardEl) {
		if (_inProgress.includes(CardEl))
			return;
		_inProgress.push(CardEl);
		var attributes = {
			CardID: CardEl.dataset.cardid,
			Element: '(fetching data...)',
			Nature: '(fetching data...)',
			Trait: '(fetching data...)',
		};
		var extra = ''
			//+' <span class="card-attribute-Element">'+escapeHtml(attributes.Element)+'</span> '
			+' <span class="card-attribute-Nature">'+escapeHtml(attributes.Nature)+'</span> '
			+' <span class="card-attribute-Trait">'+escapeHtml(attributes.Trait)+'</span> '
			//+' <h4 class="card-attribute-CardID">'+escapeHtml(attributes.CardID)+'</h4> '
		;
		// the <div> wrapper is to make F3 search of adjacent attirbutes ("lax charismatic") work properly
		// otherwise broken by display:flex on parent element
		if (!$(CardEl).find('.card-attributes-display.wg-userscript-extra').length)
			CardEl.insertAdjacentHTML('beforeend','<div class="card-attributes-display wg-userscript-extra">'+extra+'</div>');
		annotateCardWithStats_cachedOrFetch(attributes.CardID);
	}

	function MutationHandler_delayHelper() {
		$('#searchResults').find('div.card').each(annotateCardWithStats);
	}

	function MutationHandler(mutationList, Observer) {
		// WARNIG: this breaks badly without a delay - the query doesn't find new elements inserted, not sure why
		// FIXME: this delay is unreasonably long.
		window.setTimeout(MutationHandler_delayHelper, 1500);
	}

	function navCardsContainer() {
		return $('#searchResults');
	}
	function navCardsList() {
		return navCardsContainer().find('div.card');
	};

	function init() {
		GM_addStyle(`
			.card-attributes-display.wg-userscript-extra {
  				text-align: center;
			}
		`);
		var Observer = new MutationObserver(MutationHandler);
		Observer.observe(navCardsContainer()[0], {childList: true, subtree: true});
		navCardsList().each(annotateCardWithStats);
	}

	init();
})();
