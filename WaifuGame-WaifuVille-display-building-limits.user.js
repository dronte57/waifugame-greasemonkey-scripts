// ==UserScript==
// @name         WaifuGame: WaifuVille: display building limits
// @namespace    https://github.com/dronte57/waifugame-greasemonkey-scripts
// @version      0.2
// @description  Display limits of number of buildings in the construction dialog. Current up to date information fetched automatically.
// @author       dronte57
// @updateURL    https://github.com/dronte57/waifugame-greasemonkey-scripts/raw/refs/heads/main/WaifuGame-WaifuVille-display-building-limits.user.js
// @downloadURL  https://github.com/dronte57/waifugame-greasemonkey-scripts/raw/refs/heads/main/WaifuGame-WaifuVille-display-building-limits.user.js
// @match        https://waifugame.com/ville/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waifugame.com
// @grant        GM_addStyle
// ==/UserScript==

/* Changelog
0.2: Mark userscript content as such
0.1: Display raw limits
*/

(function() {
    'use strict';
	const poi = {};
	const backendData = {};

	function usMarkerText() {
		return ' 🭣';
	}

	function usMarkerSpan() {
		const span = document.createElement('span');
		span.className = 'userscript-content-marker-inline'
		span.textContent = usMarkerText();
		span.title = 'UserScript feature; responsible: [' + GM_info.script.name + ' @ ' + GM_info.script.author + ']; please report any problems on Discord';
		return span;
	}

	function usMarkerAfterBlockElement(element) {
		const div = document.createElement('div');
		div.title = 'UserScript feature; responsible: [' + GM_info.script.name + ' @ ' + GM_info.script.author + ']; please report any problems on Discord';
		div.classList.add('userscript-content-marker-after-block');
		element.before(div);
		div.appendChild(element);
	}

	function icon() {
		const icon = document.createElement('i');
		icon.className = 'fas fa-less-than-equal';
		return icon;
	}

	function fillMaxCounts() {
		for (const building of poi.buildingSelection.querySelectorAll('div.building-card')) {
			const type = building.dataset.key;
			const info = backendData.vbm.find((record)=>record.building_identifier===type);
			const p = building.querySelector('p');
			p.append(document.createElement('br'));
			const max = (info || {max_count:9999}).max_count;
			p.append(icon());
			if (max >= 9999)
				p.append(' ∞');
			else
				p.append(' ' + Number(max));
			p.append(usMarkerSpan());
		}
	}

	function setupFillMaxCountsOnChange() {
		(new MutationObserver(fillMaxCounts)).observe(poi.buildingSelection, {childList: true});
	}

	function setupStyles() {
		GM_addStyle(`
			.building-card {
				height: 250px !important;
			}
			@media (min-width: 576px) {
				.building-card {
					height: 270px !important;
				}
			}
		`);
	}

    function setup() {
		setupStyles();
		backendData.vbm = vbm;
		poi.buildingSelection = document.querySelector('#buildingSelection');
		setupFillMaxCountsOnChange();
	}

	setup();
})();
