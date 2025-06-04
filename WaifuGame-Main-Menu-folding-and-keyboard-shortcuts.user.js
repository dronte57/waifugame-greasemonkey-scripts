// ==UserScript==
// @name         WaifuGame: Main Menu: folding and keyboard shortcuts
// @namespace    https://github.com/dronte57/waifugame-greasemonkey-scripts
// @version      0.8
// @description  Save screen space by folding the main menu into compact form. Highlight current item. Provide keyboard shortcut for quick switch to next/previous one: Ctrl+Alt+ArrowDown, Ctrl+Alt+ArrowUp (similar to Discord).
// @author       dronte57
// @match        https://waifugame.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waifugame.com
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

/* Changelog
0.8: adjust scrollbar color and size for Chrome
0.7: align icons layout for Firefox
0.6: Ctrl+Alt+ArrowUp, ArrowDown key combo to switch pages
0.5: new style for the current active icon
0.4: enlarged buttons and icons
0.3.1: correct handling of urls for create new card, donate for emeralds
0.3: early loading of styles to reduce visual shift
0.2: scroll the current menu item into view
0.1: fold menu into narrow form
*/

(function() {
    'use strict';

	const poi = {};

	function setupApplyStyle() {
		GM_addStyle(`
			/* Chrome version 29 and above */
			@media screen and (-webkit-min-device-pixel-ratio:0) and (min-resolution:.001dpcm) {
				#menu-main {
				scrollbar-width: thin;
				scrollbar-color: #aaaa #0000;
			}
		`);
		GM_addStyle(`
			#menu-main {
				width: var(--left-menu-width-userscript) !important;
				padding-top: 10px;
				padding-bottom: 10px;
			}
			/* various elements depending on width of the left menu */
				#page, #multiSelect {
					margin-left: var(--left-menu-width-userscript) !important;
				}
				#footer-bar, .header {
					margin-left: var(--left-menu-width-userscript) !important;
				}
				.tinder--buttons {
					margin-left: var(--left-menu-width-userscript) !important;
				}
				:root {
					--maxwidth: 1900px;
					--left-menu-width-userscript: 75px;
				}
			/* various elements depending on width of the left menu */

			#menu-main .card {
				display: none;
			}
			#menu-main .list-menu {
				margin: 0;
			}
			#menu-main .list-menu a[href] {
				text-align: center;
			}
			#menu-main .list-menu a[href] > i:first-child {
				margin: 5px 0 !important;
				float: none;
				display: inline-block;
				height: 45px !important;
				width: 45px !important;
				line-height: 45px !important;
				font-size: 28px;
			}
			#menu-main a[href].menu-current-item-userscript > i:first-child {
				width: 100% !important;
				margin-left: 0;
				margin-right: 0;
				border-radius: 0;
			}
			#menu-main .list-menu a[href] span {
				display: none;
			}
			#menu-main .list-menu a[href] .badge {
				display: revert;
				right: -7px;
			}
			#menu-main .list-menu a[href] i.fa.fa-angle-right {
				display: none;
			}
			#menu-main .list-menu {
				margin-top: -10px;
			}
			#menu-main .menu-divider {
				text-align: center;
				font-weight: initial;
				font-size: 9px;
				padding: 0 !important;
				margin: 0px 1px 10px !important;
			}
		`);
	}

	function setupAdjustTextContents() {
		for (const link of poi.menuMain.querySelectorAll('#menu-main .list-menu a[href]'))
			link.title = link.querySelector('span:not(.badge)').innerText;
		for (const badge of poi.menuMain.querySelectorAll('#menu-main .list-menu a[href] span.badge'))
			if (badge.innerText === 'Early Access')
				badge.innerText = '😃';
	}

	function setupMarkCurrentEntry() {
		const currentHref = window.location.href;
		const currentHrefOverrideCards = currentHref.replace(/^(https:[/][/][^/]+[/]cards)([/]create)([?].*)?/, '$1/new');
		const currentHrefOverrideEmeralds = currentHref.replace(/^(https:[/][/][^/]+)[/]donate[/](emeralds)/, '$1/emeralds');
		const currentHrefOverrideBase = currentHref.replace(/^(https:[/][/][^/]+[/][^/?#]+)([/?#].*)?$/, '$1');
		const links = poi.menuMain.querySelectorAll('#menu-main .list-menu a[href]');
		/* note: this is not the same as one loop with multiple conditions */
		for (const link of links)
			if (link.href === currentHref)
				return link.classList.add('menu-current-item-userscript');
		for (const link of links)
			if (link.href === currentHrefOverrideCards)
				return link.classList.add('menu-current-item-userscript');
		for (const link of links)
			if (link.href === currentHrefOverrideEmeralds)
				return link.classList.add('menu-current-item-userscript');
		for (const link of links)
			if (link.href === currentHrefOverrideBase)
				return link.classList.add('menu-current-item-userscript');
	}

	function setupScrollCurrentIntoView() {
		poi.menuMain.querySelector('#menu-main .list-menu a[href].menu-current-item-userscript')
			.scrollIntoView(true);
	}

	function setupHandleKeypressSwitchPage() {
		document.addEventListener('keydown', function(event) {
			if (event.altKey && event.ctrlKey)
				if (event.key === 'ArrowDown') {
					const links = poi.menuMain.querySelectorAll('#menu-main .list-menu a[href]');
					var current = -1;
					for (let n = 0; n < links.length; ++n)
						if (links[n].classList.contains('menu-current-item-userscript'))
							links[current = n].classList.remove('menu-current-item-userscript');
					const next = (current+1)%links.length;
					links[next].classList.add('menu-current-item-userscript');
					window.location.href = links[next].href;
					return;
				}
				else if (event.key === 'ArrowUp') {
					const links = poi.menuMain.querySelectorAll('#menu-main .list-menu a[href]');
					var current = -1;
					for (let n = 0; n < links.length; ++n)
						if (links[n].classList.contains('menu-current-item-userscript'))
							links[current = n].classList.remove('menu-current-item-userscript');
					const prev = (current-1+links.length)%links.length;
					links[prev].classList.add('menu-current-item-userscript');
					setupScrollCurrentIntoView();
					window.location.href = links[prev].href;
					return;
				}
		});
	}

	function setupRunAfterLoaded(event) {
		poi.menuMain = document.querySelector('#menu-main');
		setupAdjustTextContents();
		setupMarkCurrentEntry();
		setupScrollCurrentIntoView();
		setupHandleKeypressSwitchPage();
	}

    function setup() {
		setupApplyStyle();
		addEventListener('DOMContentLoaded', setupRunAfterLoaded);
	}

	setup();
})();
