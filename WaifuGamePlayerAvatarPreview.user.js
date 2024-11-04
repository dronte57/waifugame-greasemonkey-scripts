// ==UserScript==
// @name         WaifuGame: Player Avatar Preview
// @namespace    https://github.com/dronte57/waifugame-greasemonkey-scripts
// @version      0.2
// @description  Display preview of Player Avatar, to check before setting a new one. To use open Card Details and use the new "Preview Player Avatar" button.
// @author       dronte57
// @match        https://waifugame.com/*
// @updateURL    https://raw.githubusercontent.com/dronte57/waifugame-greasemonkey-scripts/refs/heads/main/WaifuGamePlayerAvatarPreview.user.js
// @downloadURL  https://raw.githubusercontent.com/dronte57/waifugame-greasemonkey-scripts/refs/heads/main/WaifuGamePlayerAvatarPreview.user.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

	var Where = {
		WishlistButtons: $('#wishlistButtons'),
		PlayerAvatarPreviewer: $('#playerAvatarPreviewer'),
	}

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

	function setupPreviewButton() {
		Where.WishlistButtons.find('#setPlayerAvatar').before(`<button id="previewPlayerAvatar" class="btn btn-block btn-outline-secondary"><i class="fas fa-image"></i> Preview Player Avatar</button>`)
	}

	function serviceWishlistButtonMutation() {
		if (Where.WishlistButtons.find('#previewPlayerAvatar').length==0)
			setupPreviewButton();
	}

	function servicePreviewClick() {
		const img_orig = {
			url: $('#cardInfoImg').attr('src'),
		};
		const img_small = {
			url: String(img_orig.url).replace(/[@][0-9]+X([.][^./]+)$/, '$1'),
			width: 200,
			height: 300,
		};
		Where.PlayerAvatarPreviewer.find('img').attr('src', img_small.url);
		Where.PlayerAvatarPreviewer[0].showPopover();
	}

	function setup() {
		const img_orig = {
			url: $('#cardInfoImg').attr('src'),
		};
		const img_small = {
			url: String(img_orig.url).replace(/[@][0-9]+X([.][^./]+)$/, '$1'),
			width: 200,
			height: 300,
		};
		$('body').append(`
			<div id="playerAvatarPreviewer"
				popover=auto
				style="
					position: fixed;
					z-index: 1200;
					border-radius: 125px;
					padding: 0;
					width: 250px; height: 250px; overflow: hidden">
				<img style="position: relative; top: -63px; width: 250px; height: 375px" width="${HTML(img_small.width)}" height="${HTML(img_small.height)}" src="${HTML(img_small.url)}"/>
			</div>`);
		Where.PlayerAvatarPreviewer = $('#playerAvatarPreviewer');

		GM_addStyle(`
			#playerAvatarPreviewer::backdrop { background: #123e; }
		`);
		if (false)
		GM_addStyle(`
			#cardInfo button#setPlayerAvatar,
			#cardInfo button#previewPlayerAvatar { max-width: 50%; }
		`);
		var Observer = new MutationObserver(serviceWishlistButtonMutation);
		Observer.observe(Where.WishlistButtons[0], {childList:true});
		Where.WishlistButtons.on('click', '#previewPlayerAvatar', servicePreviewClick);
	};

    setup();
})();
