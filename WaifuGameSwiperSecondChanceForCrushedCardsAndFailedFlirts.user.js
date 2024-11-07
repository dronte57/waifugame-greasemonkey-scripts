// ==UserScript==
// @name         WaifuGame: Swiper: second chance for crushed cards & failed flirts
// @namespace    https://github.com/dronte57/waifugame-greasemonkey-scripts
// @version      0.7
// @description  Show list of crushed cards & failed flirts, just in case you change your mind and want to do *something* about them. Last 99 cards are kept.
// @author       dronte57
// @match        https://waifugame.com/swiper
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFL0lEQVRYw7WXWWxUZRTHf/fOnTtLZ7rQYhdrG4bGAIW2bBbZakTSF0BQC7wpRomYykMtkpL4RBCNAhWauARMmqgJFJeEB58qwRKIjUBbCNpWlqGlK51uM+20cxcfZmgZ73ScqfB/uvd837nn/53vfOf+P4EZ4C4qzwLKgA1AEZAJSMQGBegGmoB6oC63qaYr0kQhQuBUoALYA6TweDAIfAEczW2qGZiRgLuovAT4MLTqJ4F64GBuU80FA4FQ8MPA8zxZXAaqHpIQHkn76Se48kiZ2JHbVDMghgwVjz24JIBdQnCawS4F36exIRQTIVTtN2ZbcLYXCpi4dgtt2BcMIpsQzCJCihUxIxGsZvAH0HpG0Af96AENJlVQ9EFgsRQ6arMK7ihbx5wD2xn97jyDJ35GzEhAzEpCcFgR5ziQMtMQ7Fb0MT9K9wM0jxfd60frGkbr8aUwoZVJs0296LCRvHczAHJ+LmK2Eyn/aSRXJiZnAoLFjGi3giSBomBKS0KfCKCO+lBud6NI99G6vC9JoSYTNxK2rkJ02ACwFLmwlyyFNBtCWhLNd27R0PQHjTeu09bhxpWVzfKF+RQvLmDlswuRZRkEAcXcvVRwF5UH4uhwU5hbswfbmkVT79roOEONzRyv+5bjZ76f0W994TIOv7OXdF0i4O5VxdkEBxAs5vAtcdr4tfdu1OAAvzVfpfLEESaTErAsnmcSZ3vK/Jf/CnsPBAJ8+vmxMNvbL79K20+/cPqjI+Gd6OZ1Lt1swZTsJGYCgtlE8t4tWIpcAHjrGlA6+6fGPR4P7e3tYT6rlhRikWUWuOYbvvf7jRYQxdgJpHxQRuKujTi2r5va8/7Kk6iD3mBG/H6DjyzLAIx4Rw1j3f19wa2LJbicn4vjtTXBTIjTLkpXP57jdeiTCqqqGvxMshWAlrZWw1h2emawYcZCwBla9b+hqzqB3j5856/hKl2Jx+MJr4uOPkbvuDn54xmDb15OTuwZsKzIe6THm6afJ1W0+8OMX/0zop9pTiKXmq5y7e82w9jyhfmgabERMKUlTZPJz0GQQ4lTdLReHybNHNHPF5jg0KkvDfbS51aTOzcDdcgbGwF9IjBNJiOFtE92IeXMRUywYl9fSHL5loh+Z+vO0trhNtj3lO0E3xiT7R2x1UDgTg+Wgnlhf0DbCwVRfdxuN+/v32ewv7lpK4Xz8lA6+1Bu9yCGBGRUjNc3x9WkVFWlurra+Pe02tj9ynY03zhKZz9a55AihtRrVIzWNaD2DcVMoKGhgdraWoP94/cqSE9MQvOMoHZ70AfGusWQdI5eA+OTPKg8FVYLM2F4eJiqqiqDfdPqdZSuXIU6MEzgXi9azwioerMY0mf/iYnrd+nbfQK1fzjqvNqT39Daamw8+15/C0kHzRfsmGJ6IqYlGQ1xSzLBbsG5swR76TLkvCwQBdB01IERWi43suGNHQaf6or9bHtxI3pARRsbRx+fQBvz+xLWLt35UBUfAg7Er0pkzCueQV7mQktP4d3PDlF/pTFsyua1JRyrrMJsNoOug66jazpSanKDfVHeDw+P4VGgOF55Jog6mHSEBCvdQwOG4ADnLl7g3MULBvupr74Wti3KyxIBQtelg6FLQ5ziUEAQhEi3vKjQREEBpgVJ6KZSFWtRTn9JR9d1QJ+VsPl/l1O7hFSYgaV4AeacdARLUGwat0r0S6nJzXJO5hVRlsejEojrei4JiNlOzMUuLEvmY0p2QlAvaIIk+USr3GdKdNwzP5XaJtqs3khx/gFNW95DiPlJ1gAAAABJRU5ErkJggg==
// @updateURL    https://raw.githubusercontent.com/dronte57/waifugame-greasemonkey-scripts/refs/heads/main/WaifuGameSwiperSecondChanceForCrushedCardsAndFailedFlirts.user.js
// @downloadURL  https://raw.githubusercontent.com/dronte57/waifugame-greasemonkey-scripts/refs/heads/main/WaifuGameSwiperSecondChanceForCrushedCardsAndFailedFlirts.user.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/* Changelog
0.7: Improvements to scrolling and margins
*/

(function() {
    'use strict';

	function HTML(text) {
		var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return String(text).replace(/[&<>"']/g, function(m) { return map[m]; });
	}

	var Store = {
		_limit: 99,
		addEncounterCard: function(EncounterID, card) {
			var queue = GM_getValue('queue', []);
			queue.unshift({EncounterID:EncounterID, card:card});
			while (queue.length>this._limit)
				queue.pop();
			GM_setValue('queue', queue);
		},
		listRecentEncountersCards: function() {
			return GM_getValue('queue', []);
		}
	};

	function renderEncounterCard(card) {
		const cc = getContainer();
		cc.prepend(cardHTML(card));
		cc.children().first().css({opacity:0, 'max-height': 0});
		cc.children().first().animate({opacity:1, 'max-height': '240px'});
	}

	// example results:
	// {"result":" Waifu Card (\u2116 123456789) + 900 shared XP"}
	// {"result":"1050 Essence and 1800 shared XP"}
	function secondChanceAfterEncounter(EncounterID, action, result, card) {
		console.log(`Saving Card ${card.name} [${card.CardID}] after action ${action} with result ${result}`);
		Store.addEncounterCard(EncounterID, card);
		renderEncounterCard(card)
	}

	function encounterExtractRarityGlow(Card) {
		if ($(Card).hasClass('glow-0'))
			return 'glow-0';
		if ($(Card).hasClass('glow-1'))
			return 'glow-1';
		if ($(Card).hasClass('glow-2'))
			return 'glow-2';
		if ($(Card).hasClass('glow-3'))
			return 'glow-3';
		if ($(Card).hasClass('glow-4'))
			return 'glow-4';
		if ($(Card).hasClass('glow-5'))
			return 'glow-5';
	}

	function findCardForEncounter(EncounterID) {
		const container = $('.tinder--cards');
		const Card = container.find(`.tinder--card[data-encounterid=${Number(EncounterID)}]`).first();
		return {
			name: Card.find('h4').first().text(),
			CardID: Number(Card.find('.card-img-container img').data('cardid')),
			rarityglow: encounterExtractRarityGlow(Card),
			rating: Number(Card.find('.card-img-container img').data('rating')),
			image: Card.find('.card-img-container img').attr('src'),
		};
	};

	function xmlhttpcatcher(open) {
		return function(method, url, async, username, password) {
			const reEncounter = RegExp('^/swiper/([0-9]+)$');
			this._xmlhttpcatcher = this._xmlhttpcatcher || {};
			this._xmlhttpcatcher.method = method;
			this._xmlhttpcatcher.url = url;
			if (String(this._xmlhttpcatcher.url).match(reEncounter)) {
				this._xmlhttpcatcher.EncounterID = Number(String(this._xmlhttpcatcher.url).match(reEncounter)[1]);
				this._xmlhttpcatcher.card = findCardForEncounter(this._xmlhttpcatcher.EncounterID);
			}

			const savedSend = this.send;
			this.send = function(body) {
				this._xmlhttpcatcher.body = body;
				savedSend.call(this, body);
			};

			this.addEventListener('readystatechange', function() {
				if (this.readyState !== 4)
					return;
				if (this._xmlhttpcatcher.method !== 'POST')
					return;
				if (!String(this._xmlhttpcatcher.url).match(reEncounter))
					return;
				const body = this._xmlhttpcatcher.body;
				if (!body)
					return;
				const payload = JSON.parse(body);
				const EncounterID = Number(String(this._xmlhttpcatcher.url).match(reEncounter)[1]);
				const response = JSON.parse(this.response);
				switch (payload.action) {
					case '🗑️':
					case '😘':
						secondChanceAfterEncounter(EncounterID, payload.action, response.result, this._xmlhttpcatcher.card);
						break;
					default:
						throw new Error(`Unknown action when doing method: ${method} url: ${url} action: ${payload.action}`);
				}
			});
			open.call(this, method, url, async, username, password);
		};
	}

    function setup() {
		GM_addStyle(`
			#wgssc-container .wgssc-mini-card h3.onlyhover { display: none; }
			#wgssc-container .wgssc-mini-card:hover h3.onlyhover { display: block; }
		`);

		unsafeWindow.XMLHttpRequest.prototype.open = xmlhttpcatcher(unsafeWindow.XMLHttpRequest.prototype.open);

		const cc = getContainer();
		var list = Store.listRecentEncountersCards();
		while (list.length)
			cc.append(cardHTML(list.shift().card));
	}

	function getContainer() {
		if ($('#wgssc-container').length==0) {
			const c = $('.page-content');
			const c2 = c.parent().parent();
			GM_addStyle(`
				@media (min-width: 840px) {
					#wgssc-container-outer {
						margin-left: 280px;
						/*max-width: var(--maxwidth);*/
					}
				}
				#wgssc-container-outer {
					overflow-y: scroll;
					overflow-x: visible;
					z-index: 94; /* below .tinder--buttons */
					position: absolute;
					width: 200px;
					height: 100vh;
					top: 0px;
					left:0px;
					margin-top:63px;
					padding-top: 40px;
				}
				#wgssc-container-outer::-webkit-scrollbar {
					display: none;
				}
				#wgssc-container-outer {
					-ms-overflow-style: none;  /* IE and Edge */
					scrollbar-width: none;  /* Firefox */
				}
				#wgssc-container .wgssc-mini-card {
					display: block;
					margin: 0 10px 10px;
					padding: 0;
					position: relative;
				}
			`);
			c2.append('<div id="wgssc-container-outer"><div id="wgssc-container" ></div></div>');
		}
		return $('#wgssc-container');
	}

	function cardHTML(card) {
		const imgwidth = 200;
		const imgheight = 300;
		const imgsrc = String(card.image).replace(/@[0-9]X([.][^/]+)$/, '$1');
		return `
			<a onclick="showCardInfoMenuLookup($(this).data('cardid')); return false;" title="${HTML(card.name)}" href="#" class="actionShowCard wgssc-mini-card" data-cardid="${HTML(card.CardID)}">
				<img width="${HTML(imgwidth)}" height="${HTML(imgheight)}" class="rounded-s ${HTML(card.rarityglow)}" data-rating="${HTML(card.rating)}" src="${HTML(imgsrc)}" style="max-width: 80px; max-height: 120px; height: auto; display: block;">
				<h3 class="onlyhover" style="position: absolute; left: 4px; top: 40px; background: black; white-space: nowrap; text-align: right; padding: 2px 8px">${HTML(card.name)}</h3>
			</a>`;
	}

	setup();
})();
