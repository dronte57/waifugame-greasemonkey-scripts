// ==UserScript==
// @name         WaifuGame: Swiper: blur the naughty
// @namespace    https://github.com/dronte57/waifugame-greasemonkey-scripts
// @version      0.2
// @description  Blur out cards with high lewdness.
// @author       dronte57
// @match        https://waifugame.com/swiper
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/dronte57/waifugame-greasemonkey-scripts/refs/heads/main/WaifuGameSwiperBlurTheNaughty.user.js
// @downloadURL  https://raw.githubusercontent.com/dronte57/waifugame-greasemonkey-scripts/refs/heads/main/WaifuGameSwiperBlurTheNaughty.user.js
// @grant        GM_addStyle
// ==/UserScript==

/* Changes
0.2: pre-load encounters
2024-08-16: initial version
*/

(function() {
    'use strict';

	GM_addStyle(`
		/* Rating 0: Anime/Ecchi; rating -1: SFW Anime */
		.tinder--cards .tinder--card .card-img-container img[data-rating]:not([data-rating="0"]):not([data-rating="-1"]) {
			filter:blur(16px);
		}
	);

    (function(open) {
		XMLHttpRequest.prototype.open = function(requestMethod, requestUrl /*, ...*/) {
			this.addEventListener("readystatechange", function() {
				if (this.MYGM_blurTheNaughty.requestUrl !== '/json/swiper_encounters')
					return;
				if (this.status !== 200)
					return;
				if (this.readyState !== 4)
					return;
				var payload = JSON.parse(this.responseText);
				for (var n = 0; n < payload.encounters.length; ++n) {
					var card = payload.encounters[n].card;
					var key = 'MYGM_blurTheNaughty_card_id_' + card.id + '_rating';
					var value = card.rating;
					window.sessionStorage.setItem(key, value);
				}
			});
			this.MYGM_blurTheNaughty = {requestMethod: requestMethod, requestUrl: requestUrl};
			open.apply(this, arguments);
		};
	})(XMLHttpRequest.prototype.open);

	/* the default script configuration "Run at: Default" doesn't allow us to intercept the inline-<script>'s XMLHttpRequest's
	and we do not want to rely on user setting "Run at:document-start"
	so instead we issue one synthetic request to /json/swiper_encounters to pre-fill data.
	subsequent encounters are read automaticlaly by the handler */
	$.getJSON('/json/swiper_encounters');
})();
