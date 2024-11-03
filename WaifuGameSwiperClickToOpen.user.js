// ==UserScript==
// @name         WaifuGame: Swiper: click to open
// @namespace    https://github.com/dronte57/waifugame-greasemonkey-scripts
// @version      0.2
// @description  Click a card to open its details
// @author       dronte57
// @match        https://waifugame.com/swiper
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/dronte57/waifugame-greasemonkey-scripts/refs/heads/main/WaifuGameSwiperClickToOpen.user.js
// @downloadURL  https://raw.githubusercontent.com/dronte57/waifugame-greasemonkey-scripts/refs/heads/main/WaifuGameSwiperClickToOpen.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

	var Dialog = $('#cardInfo');
	var NopeButton = $('#nope');
	var LoveButton = $('#love');
	var TinderContainer = $('.page-content .tinder');
	var TinderCardsContainer = TinderContainer.find('.tinder--cards');
	var underMove = false;

	function serviceCardContainerClick(Event) {
		var Card = $(this);
		if (!underMove)
			showCardInfoMenuLookup(Card.find('img.actionShowCard').data('cardid'));
		return false;
	};

	function serviceContainerMutation() {
		if (TinderContainer.hasClass('tinder_nope') || TinderContainer.hasClass('tinder_love'))
			underMove = true;
		else
			window.setTimeout(function(){underMove = false;}, 1); /*event processing order*/
	};

	var Observer = new MutationObserver(serviceContainerMutation);
	Observer.observe(TinderContainer[0], {attributes:true});
	TinderCardsContainer.on('click', '.tinder--card', serviceCardContainerClick); /*cards are loaded with delay*/
	NopeButton.on('click', function(){Dialog.find('.close-menu').click();});
	LoveButton.on('click', function(){Dialog.find('.close-menu').click();});
})();
