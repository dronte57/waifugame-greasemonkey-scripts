// ==UserScript==
// @name         WaifuGame: Player Avatar Preview
// @namespace    https://github.com/dronte57/waifugame-greasemonkey-scripts
// @version      0.3
// @description  Display preview of Player Avatar, to check before setting a new one. To use open Card Details and use the new "Preview Player Avatar" button.
// @author       dronte57
// @match        https://waifugame.com/*
// @updateURL    https://github.com/dronte57/waifugame-greasemonkey-scripts/raw/refs/heads/main/WaifuGamePlayerAvatarPreview.user.js
// @downloadURL  https://github.com/dronte57/waifugame-greasemonkey-scripts/raw/refs/heads/main/WaifuGamePlayerAvatarPreview.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waifugame.com
// @grant        GM_addStyle
// ==/UserScript==

/* Changelog
0.3: Icon and cleanups
*/

(function() {
    'use strict';

	const poi = {
		imgOriginal: undefined,
		wishlistButtons: undefined,
		previewButton: undefined,
		setPlayerAvatarButton: undefined,
		playerAvatarPreviewer: undefined,
		playerAvatarPreviewerImg: undefined,
	};

	function setupPreviewButton() {
		poi.wishlistButtons = document.querySelector('#wishlistButtons');
		poi.setPlayerAvatarButton = document.querySelector('#setPlayerAvatar');
		/* this is empty at first */
		if (!poi.setPlayerAvatarButton)
			return;
		poi.previewButton = document.createElement('button');
		poi.previewButton.id = 'previewPlayerAvatar';
		poi.previewButton.className = 'btn btn-block btn-outline-secondary';
		poi.previewButton.innerHTML = `<i class="fas fa-image"></i> Preview Player Avatar`;
		poi.setPlayerAvatarButton.before(poi.previewButton);
		poi.previewButton.addEventListener('click', servicePreviewClick);
	}

	function serviceWishlistButtonMutation() {
		if (!poi.wishlistButtons.querySelector('#previewPlayerAvatar'))
			setupPreviewButton();
	}

	function servicePreviewClick() {
		poi.playerAvatarPreviewerImg.removeAttribute('src');
        poi.imgOriginal = document.querySelector('#cardInfoImg');
		const imgSmall = {
			url: String(poi.imgOriginal.src).replace(/[@][0-9]+X([.][^./]+)$/, '$1'),
			width: 200,
			height: 300,
		};
		poi.playerAvatarPreviewerImg.src = imgSmall.url;
		poi.playerAvatarPreviewer.showPopover();
	}

	function setupPreviewerPopover() {
        poi.playerAvatarPreviewer = document.createElement('div');
        poi.playerAvatarPreviewer.id = 'playerAvatarPreviewer';
		poi.playerAvatarPreviewer.popover = 'auto';
        poi.playerAvatarPreviewerImg = document.createElement('img');
        poi.playerAvatarPreviewer.append(poi.playerAvatarPreviewerImg);
        document.body.append(poi.playerAvatarPreviewer);

		GM_addStyle(`
			#playerAvatarPreviewer::backdrop { background: #123e; }
            #playerAvatarPreviewer {
				position: fixed;
				z-index: 1200;
				border-radius: 125px;
				padding: 0;
				width: 250px;
				height: 250px;
				overflow: hidden;
            }
            #playerAvatarPreviewer > img {
				position: relative;
				top: -63px;
				width: 250px;
				height: 375px;
            }
		`);
	}

	function setupFillInOnDialogChange() {
		var Observer = new MutationObserver(serviceWishlistButtonMutation);
		Observer.observe(poi.wishlistButtons, {childList:true});
	}

	function setup() {
		setupPreviewButton();
		setupPreviewerPopover();
		setupFillInOnDialogChange();
	};

    setup();
})();
