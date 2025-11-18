// ==UserScript==
// @name         WaifuGame: Data Science for Wish List
// @namespace    https://github.com/dronte57/waifugame-greasemonkey-scripts
// @version      0.5
// @description  Import and export Wish List
// @author       dronte57
// @updateURL    https://github.com/dronte57/waifugame-greasemonkey-scripts/raw/refs/heads/main/WaifuGame-DataScienceForWishList.user.js
// @downloadURL  https://github.com/dronte57/waifugame-greasemonkey-scripts/raw/refs/heads/main/WaifuGame-DataScienceForWishList.user.js
// @match        https://waifugame.com/profile/wishlist
// @icon         https://www.google.com/s2/favicons?sz=64&domain=waifugame.com
// @grant        GM_download
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

/* Changelog
0.5: Show wishlisted card count
0.4: Toast cleanup
0.3: Interface refresh
0.2: CSV file import
0.1: CSV file export
*/

(function() {
    'use strict';

	class WgusToast {
		static get VERSION() { return 0.1; };

		#id;
		#idSuffix;
		element;
		textElement;
		#autohide_delay_milliseconds;
		#autohideTimer;

		#forID(text) {
			return text.replace(/[^a-zA-Z]+/g, '_');
		}
		#autostem() {
			const text = String(GM_info.script.name);
			if (text.length < 1)
				throw new Error('script name');
			return this.#forID(text);
		}
		constructor(idSuffix, autohide_delay_milliseconds) {
			this.#idSuffix = idSuffix;
			this.#autohide_delay_milliseconds = autohide_delay_milliseconds;

			const id = 'wgus-' + this.#autostem() + '-toast-' + idSuffix;
			/*	<div id="${idHTML}" class="toast toast-tiny toast-top bg-green-dark" data-autohide="${autohideHTML}" data-delay="${Number(delay_milliseconds)}">
					<i class="fa fa-smile-beam mr-3"></i><span class="toast-text">(placeholder)</span>
				</div>*/
			this.element = document.createElement('div');
			this.element.id = id;
			this.element.className = 'toast toast-tiny toast-top bg-green-dark';
			this.element.addEventListener('hidden.bs.toast', (event)=>event.currentTarget.remove());
			this.element.dataset.autohide = 'false';
			const icon = document.createElement('i');
			icon.className = 'fa fa-smile-beam mr-3';
			this.element.append(icon);
			this.textElement = document.createElement('span');
			this.textElement.className = 'toast-text';
			this.textElement.textContent = '(placeholder)';
			this.element.append(this.textElement);
			if (document.querySelector('.toast-container'))
				document.querySelector('.toast-container').append(this.element);
			else
				document.addEventListener('DOMContentLoaded', ()=>document.querySelector('.toast-container').append(this.element));
		}
		#handleAutohideTimer() {
			if (this.#autohide_delay_milliseconds === undefined) {
				if (this.#autohideTimer)
					this.#autohideTimer = window.clearTimeout(this.#autohideTimer);
			}
			else if (this.#autohide_delay_milliseconds > 0) {
				if (this.#autohideTimer)
						window.clearTimeout(this.#autohideTimer);
				this.#autohideTimer = window.setTimeout(()=>this.toastHide(), this.#autohide_delay_milliseconds);
			}
			else
				throw new Error('autohide delay');
		}
		toastShow(text) {
			this.textElement.textContent = text;
			$(this.element).toast('show');
			this.#handleAutohideTimer();
		}
		toastUpdateText(text) {
			this.textElement.textContent = text;
			this.#handleAutohideTimer();
		}
		toastHide() {
			$(this.element).toast('hide');
		}
	}

	class WgusMarkers {
		static get VERSION() { return 0.1; }
		static usStaticInit() {
			this.usAddStyle();
		}
		static usAutosetup(element) {
			if (element === undefined)
				element = document;
			element.querySelectorAll('.autosetup-wgus-content.wgus-content-inline').forEach((element)=>WgusMarkers.usMarkerMakeInlineMarked(element));
			element.querySelectorAll('.autosetup-wgus-content.wgus-content-block').forEach((element)=>WgusMarkers.usMarkerMakeBlockMarked(element));
		}
		static usAddStyle() {
			GM_addStyle(`
				.wgus-content-marker-inline {
					font-size: 75%;
					vertical-align: super;
				}
				.wgus-content-marker-after-block {
					position: relative;
				}
				.wgus-content-marker-after-block::after {
					content: "${this.usMarkerText()}";
					display: block;
					height: 10px;
					width: 0px;
					position: absolute;
					top: 0px;
					right: 7px;
				}
			`);
		}
		static usMarkerText() { return ' 🭣'; }
		static usMarkerSpan() {
			const span = document.createElement('span');
			span.className = 'wgus-content-marker-inline'
			span.textContent = this.usMarkerText();
			span.title = `UserScript feature: [${GM_info.script.name} by ${GM_info.script.author}]; please report problems and ask questions on the game's community Discord server`;
			return span;
		}
		static usMarkerSpanWithoutTitle() {
			const span = document.createElement('span');
			span.className = 'wgus-content-marker-inline'
			span.textContent = this.usMarkerText();
			return span;
		}
		static usInlineAddClass(element) {
			element.classList.add('wgus-content', 'wgus-content-inline');
		}
		static usMarkerMakeInlineMarked(element) {
			this.usInlineAddClass(element);
			element.classList.remove('autosetup-wgus-content');
			if (String(element.title) === '') {
				element.title = `UserScript feature: [${GM_info.script.name} by ${GM_info.script.author}]; please report problems and ask questions on the game's community Discord server`;
				element.append(this.usMarkerSpanWithoutTitle());
			}
			else
				element.append(this.usMarkerSpan());
		}
		static usBlockAddClass(element) {
			element.classList.add('wgus-content', 'wgus-content-block');
		}
		static usMarkerMakeBlockMarked(element) {
			this.usBlockAddClass(element);
			element.classList.remove('autosetup-wgus-content');
			element.title = `UserScript feature: [${GM_info.script.name} by ${GM_info.script.author}]; please report problems and ask questions on the game's community Discord server`;
			element.append(this.usMarkerSpanWithoutTitle());
		}
		static usMarkerAfterBlockElement(element) {
			const div = document.createElement('div');
			div.title = `UserScript feature: [${GM_info.script.name} by ${GM_info.script.author}]; please report problems and ask questions on the game's community Discord server`;
			div.classList.add('wgus-content-marker-after-block');
			element.before(div);
			div.appendChild(element);
		}
	}
	WgusMarkers.usStaticInit();

	// Parse CSV files into array of arrays. Optional helpers to transform into records with named fields.
	// Requires roughly twice the memory of input string's size.
	// Provides O(n*n) performance.
	// Performance could be improved to O(n) by using Array.prototype.pop() rather than Array.prototype.shift() in #parseCsvStringInner().
	class CsvParser
	{
		#separator;
		#enclosure;
		#quoteliteral;
		#recordend;
		#Holder;

		constructor(separator, enclosure)
		{
			class Holder
			{
				#name;
				#value;

				constructor(name, value)
				{
					this.#name = name;
					this.#value = value;
				}

				toString() { return this.#value; }
				toName() { return this.#name; }
				toPrettyPrint() { return '{'+this.#value+'}'; }
			}
			this.#Holder = Holder;

			if (separator === undefined)
				separator = ',';
			if (enclosure === undefined)
				enclosure = '"';
			if (String(separator).length !== 1)
				throw new Error('separator must be single character');
			this.#separator = new Holder('separator', separator);
			if (String(enclosure).length !== 1)
				throw new Error('enclosure must be single character');
			this.#enclosure = new Holder('enclosure', enclosure);
			this.#quoteliteral = new Holder('quote literal', enclosure);
			this.#recordend = new Holder('record end', '\n');
		}

		/*handles separators, enclosures, newlines*/
		parseCsvString(csvString_arg)
		{
			if (csvString_arg === undefined)
				return undefined;

			let csvString = String(csvString_arg);
			return this.#parseCsvStringInner(csvString);
		}

		nameCsvColumnsUseHolders(recordset)
		{
			if (recordset === undefined)
				return undefined;

			const a = [];
			let heading = recordset.shift();
			for (let nrecord = 0; nrecord < recordset.length; ++nrecord) {
				let record = recordset[nrecord];
				if (record.length === 0)
					continue;
				let namedrecord = [];
				if (record.length > heading.length)
					throw new Erorr(`inconsistent CSV: spurious columns in record nr ${nrecord}`);
				for (let ncol = 0; ncol < heading.length; ++ncol) {
					let colname = heading[ncol];
					if (record[ncol] === undefined)
						throw new Error(`inconsistent CSV: missing column nr ${ncol} to be named "${colname}" in record nr ${nrecord}`);
					namedrecord.push(new this.#Holder(colname, record[ncol]));
				}
				a.push(namedrecord);
			}
			return a;
		}

		nameCsvColumnsUsePairs(recordset)
		{
			if (recordset === undefined)
				return undefined;

			const a = [];
			let heading = recordset.shift();
			for (let nrecord = 0; nrecord < recordset.length; ++nrecord) {
				let record = recordset[nrecord];
				if (record.length === 0)
					continue;
				let namedrecord = [];
				if (record.length > heading.length)
					throw new Erorr(`inconsistent CSV: spurious columns in record nr ${nrecord}`);
				for (let ncol = 0; ncol < heading.length; ++ncol) {
					let colname = heading[ncol];
					if (record[ncol] === undefined)
						throw new Error(`inconsistent CSV: missing column nr ${ncol} to be named "${colname}" in record nr ${nrecord}`);
					namedrecord.push([colname, record[ncol]]);
				}
				a.push(namedrecord);
			}
			return a;
		}

		nameCsvColumnsUseObjects(recordset)
		{
			if (recordset === undefined)
				return undefined;

			const a = [];
			let heading = recordset.shift();
			for (let nrecord = 0; nrecord < recordset.length; ++nrecord) {
				let record = recordset[nrecord];
				if (record.length === 0)
					continue;
				let namedrecord = {};
				if (record.length > heading.length)
					throw new Erorr(`inconsistent CSV: spurious columns in record nr ${nrecord}`);
				for (let ncol = 0; ncol < heading.length; ++ncol) {
					let colname = heading[ncol];
					if (record[ncol] === undefined)
						throw new Error(`inconsistent CSV: missing column nr ${ncol} to be named "${colname}" in record nr ${nrecord}`);
					namedrecord[colname] = record[ncol];
				}
				a.push(namedrecord);
			}
			return a;
		}

		/*handles separators, enclosures, newlines*/
		#parseCsvStringInner(csvString)
		{
			let recordset = []
			let record = [];
			var field = '';

			const re = RegExp(
				'('
				+RegExp.escape(this.#enclosure.toString())
				+'|'
				+RegExp.escape(this.#separator.toString())
				+'|'
				+RegExp.escape(this.#recordend.toString())
				+')'
			);

			let isInsideEnclosure = false;
			let aa = csvString.split(re);
			/*empty ones are unwanted artifacts of the .split()*/
			aa = aa.filter((v)=>v!=='');
			while (aa.length) {
				let v = aa.shift();
				if (isInsideEnclosure) {
					if (v === this.#enclosure.toString()) {
						if (aa[0] === this.#enclosure.toString())
							field += aa.shift();
						else
							isInsideEnclosure = false;
					}
					else if (v === this.#separator.toString())
						field += this.#separator;
					else if (v === this.#recordend.toString())
						field += this.#recordend;
					else if(typeof v === 'string')
						field += v;
					else
						throw new Error('unexpected type');
				}
				else {
					if (v === this.#enclosure.toString())
						isInsideEnclosure = true;
					else if (v === this.#separator.toString()) {
						record.push(field);
						field = '';
					}
					else if (v === this.#recordend.toString()) {
						record.push(field);
						field = '';
						recordset.push(record);
						record = [];
					}
					else if (typeof v === 'string')
						field += v;
					else
						throw new Error('unexpected type');
				}
			}
			record.push(field);
			if ((record.length !== 1) || (record[0] !== ''))
				recordset.push(record);

			return recordset;
		}
	}

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

	const poi = {};

	function showDataScience() {

		const dialog = document.createElement('dialog');
		dialog.id='wgus-datascience-wishlist';
		dialog.className = 'menu';
		dialog.style = 'z-index: 334; margin-right: 0; position: fixed; top: .5em';
		dialog.innerHTML = '<div class="menu-title"><h2>Data Science</h2></div><div class="card card-style"></div><div class="content">'
			+`<p>Found wishlisted cards: ${Number(document.querySelectorAll('#wishedCards div[data-cardid]').length)}</p>`
			+`<div><button style="width:100%" type="button" onclick="document.dispatchEvent(new Event('wgusDataScience.doDownloadWishlistCsv'))">Download Wishlist backup (CSV file)</button></div>`
			+`<div><button style="width:100%" type="button" onclick="document.dispatchEvent(new Event('wgusDataScience.doAddWishlistCsv'))">Add to Wishlist from backup (CSV file)</button></div>`
			+'<hr>'
			+`<div><button style="width:100%" type="button" onclick="document.dispatchEvent(new Event('wgusDataScience.doConfirmPruneWishlist'))">Delete all wishlisted cards...</button></div>`
			+'</div>';
		document.body.append(dialog);
		dialog.show();
	}

	function csvHelperIntIf(input) {
		if (String(input).match(/^[0-9]+$/))
			return Number(input);
		else
			return input;
	}

	function csvHelperQuoteValueIf(input) {
		if (String(input).match(/^[0-9]+$/))
			return Number(input);
		else if (String(input).match(/^[a-zA-Z0-9_-]+$/))
			return String(input);
		else
			return '"' + String(input).replace(/"/, '""') + '"';
	}

	function glowToRarity(glow) {
		switch (glow) {
			case 'glow-0':
				return 'Common';
			case 'glow-1':
				return 'Uncommon';
			case 'glow-2':
				return 'Rare';
			case 'glow-3':
				return 'Epic';
			case 'glow-4':
				return 'Legendary';
			case 'glow-5':
				return 'Mythic';
			default:
				return '(unsupported)';
		}
	}

	function wishlistRarityHelper(div) {
		return Array.from(div.classList).reduce(function(acc, name) {
			if (String(name).match(/^glow-[0-9]$/))
				return glowToRarity(name);
			else
				return acc;
		}, 'NULL');
	}

	function wishlistCardLinkHelper(id) {
		return 'https://waifugame.com/c/' + Number(id);
	}

	function wishlistAsRecords() {
		const records = [];
		records.push(['CardID', 'Card_Name', 'Rarity', 'Image_Small', 'Card_URL']);
		const cards = document.querySelectorAll('#wishedCards div.card[data-cardid]');
		for (var n = 0; n < cards.length; ++n) {
			let card = cards[n];
			let nameEl = card.querySelector('.content');
			let imgEl = card.querySelector('img[data-src]');
			records.push([
				csvHelperIntIf(card.dataset.cardid),
				nameEl.textContent,
				wishlistRarityHelper(card),
				imgEl.dataset.src,
				wishlistCardLinkHelper(card.dataset.cardid)
			]);
		}
		return records;
	}
	const WISHLIST_DELETIONMARKER = '[DELETED]';

	/* Sort: "Sakura" < "Sakura12" < "Sakura123" < "Sakura1234" < "SakuraMei" */
	function compareStringExtraNumber(a, b) {
		let aa = String(a);
		let bb = String(b);

		let a3 = aa.split(/([0-9]+)/);
		let b3 = bb.split(/([0-9]+)/);
		for (var n = 0; a3[n]||b3[n]; ++n) {
			if (!a3[n])
				return -1;
			if (!b3[n])
				return 1;
			if (a3[n] === b3[n])
				continue;
			if (a3[n].match(/^[0-9]+$/)) {
				if (b3[n].match(/^[0-9]+$/))
					return Number(a3[n]) - Number(b3[n]);
				else
					return 1;
			}
			if (b3[n].match(/^[0-9]+$/)) {
				if (a3[n].match(/^[0-9]+$/))
					return Number(a3[n]) - Number(b3[n]);
				else
					return -1;
			}
			if (a3[n] > b3[n])
				return 1;
			else
				return -1;
		}
		return 0;
	}

	function recordsTransformOrderByCol(records, colindex, skipnrows) {
		const comparefn = function(a,b) {
			if (a[colindex] === WISHLIST_DELETIONMARKER)
				return -1;
			else if (b[colindex] === WISHLIST_DELETIONMARKER)
				return 1;
			else return compareStringExtraNumber(a[colindex], b[colindex]);
		};
		const skipped = records.slice(0, skipnrows);
		const sorted = records.slice(skipnrows).sort(comparefn);
		return Array.prototype.concat(skipped, sorted);
	}

	function recordsTransformCustomOrdering(records) {
		return recordsTransformOrderByCol(records, 1, 1);
	}

	function recordsAsTabularData(records) {
		return records.map(function(record) {
			const a = record.map((value)=>csvHelperQuoteValueIf(value));
			a.push('\n');
			return a.join(',');
		});
	}

	function getPlayername() {
		let name = 'unknownplayer';
		let a = document.querySelectorAll('#menu-main .card-bottom a[href]');
		a.forEach((el)=>{if(String(el.getAttribute('href')).match('^/profile/'))name=el.textContent});
		return name;
	}

	function doDownloadWishlistCsv() {
		const date = new Date();
		const filename = `wishlist-${getPlayername()}-${date.getFullYear()}-${String(date.getMonth()).replace(/^[0-9]$/, '0$&')}-${String(date.getDate()).replace(/^[0-9]$/, '0$&')}.csv`;
		GM_download(new File(recordsAsTabularData(recordsTransformCustomOrdering(wishlistAsRecords())), filename), filename);
	}

	function httpRequestRemoveOneCardFromWishlist(cardid, onload) {
		//url https://waifugame.com/profile/wishlist
		//remove from wishlist: {_token: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", action: "remove", tag: "id:NNNNNNNNN"}
		//add to wishlist: {_token: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", action: "add", tag: "id:NNNNNNNNN"}
		//response: {"status":"ok"}
		const data = {action: 'remove', tag: 'id:'+Number(cardid), _token: document.querySelector('input[name="_token"]').value, };
		const request = new XMLHttpRequest();
		request.open('POST', '/profile/wishlist', true);
		request.onload = ()=>onload(request.responseText, cardid);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify(data));
	}

	function onWishlistCardRemove(responseText, cardid) {
		let response = JSON.parse(responseText);
		if (response.status === 'ok')
			/*console.log('success')*/;
		else {
			console.log(`ERROR deleting from wishlist card ${Number(cardid)}: "${response.status}" (${responseText})`);
			alert(`ERROR deleting from wishlist card ${Number(cardid)}: "${response.status}" (${responseText})`);
		}
		let el = document.querySelector(`#wishedCards div[data-cardid="${Number(cardid)}"]`);
		if (el) {
			let scx = el.parentNode;
			el.remove();
			scx.scrollIntoView();
		}
		else {
			document.querySelector('#wishedCards').scrollIntoView();
			document.body.parentNode.scrollBy(0, -60); /*necessitated by the black bar up top*/
		}
		window.setTimeout(doPruneWishlist, 330);
	}

	function doPruneWishlist() {
		let a = document.querySelectorAll('#wishedCards div[data-cardid]');
		if (a.length)
			httpRequestRemoveOneCardFromWishlist(a[0].dataset.cardid, onWishlistCardRemove);
		else {
			document.querySelector('#wishedCards').scrollIntoView();
			document.body.parentNode.scrollBy(0, -60); /*necessitated by the black bar up top*/
			showSuccessToast('Deleted card from wishlist')
		}
	}

	function httpRequestAddOneCardToWishlist(onload, cardid, recordset, originalrecordset) {
		//url https://waifugame.com/profile/wishlist
		//remove from wishlist: {_token: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", action: "remove", tag: "id:NNNNNNNNN"}
		//add to wishlist: {_token: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", action: "add", tag: "id:NNNNNNNNN"}
		//response: {"status":"ok"}
		const data = {action: 'add', tag: 'id:'+Number(cardid), _token: document.querySelector('input[name="_token"]').value, };
		const request = new XMLHttpRequest();
		request.open('POST', '/profile/wishlist', true);
		request.onload = ()=>onload(request.responseText, cardid, recordset, originalrecordset);
		request.setRequestHeader('Content-Type', 'application/json');
		request.send(JSON.stringify(data));
	}

	function onWishlistCardAdd(responseText, cardid, recordset, originalrecordset) {
		let response = JSON.parse(responseText);
		if (response.status === 'ok')
			poi.progressToast.toastShow(`Card Wishlisted (remaining: ${recordset.length} / ${originalrecordset.length})`);
		else {
			console.log(`ERROR wishlisting card ${Number(cardid)}: "${response.status}" (${responseText})`);
			alert(`ERROR wishlisting card ${Number(cardid)}: "${response.status}" (${responseText})`);
		}


		if (recordset.length) {
			let record = recordset.shift();
			let rest = recordset;
			window.setTimeout(()=>addWishCardByRecord(record, rest, originalrecordset), 330);
		}
		else {
			alert('Import completed; RELOAD PAGE TO SHOW RESULTS');
			window.location.href = String(window.location.href).split('#')[0];
		}
	}

	function addWishCardByRecord(record, rest, originalrecordset) {
/*FIXME skip already wishlisted cards - BUT CAREFUL if the in-browser data is stale*/
		if (record.CardID)
			httpRequestAddOneCardToWishlist(onWishlistCardAdd, record.CardID, rest, originalrecordset)
		else {
			console.log('CardID "CardID" column not found', record);
			alert('CardID "ID" column not found');
			throw new Error('CardID "ID" column not found');
		}
	}

	function _doProcessProvidedFileWishlsitCsv(csv) {
		const parser = new CsvParser();
		const rowset = parser.parseCsvString(csv);
		const records = parser.nameCsvColumnsUseObjects(rowset);
		let originalrecordset = [...records];
		let record = records.shift();
		let rest = records;
		addWishCardByRecord(record, rest, originalrecordset);
	}

	function doProcessProvidedFileWishlsitCsv(event) {
		let input = event.currentTarget;
		if (input.files[0]) {
			const reader = new FileReader();
			reader.addEventListener('load', ()=>_doProcessProvidedFileWishlsitCsv(reader.result));
			const csv = reader.readAsText(input.files[0]);
		}
		else
			alert('No file provided');
	}

	function doAddWishlistCsv() {
		if (!poi.csvfileinput) {
			poi.csvfileinput = document.createElement('input');
			poi.csvfileinput.type = 'file';
			poi.csvfileinput.name = 'csvfileinput';
			poi.csvfileinput.accept = '.csv';
			poi.csvfileinput.style = 'display: none';
			poi.csvfileinput.addEventListener('change', (event)=>event.currentTarget.dispatchEvent(new Event('wgusDataScience.csvFileInputProvided')));
			poi.csvfileinput.addEventListener('wgusDataScience.csvFileInputProvided',doProcessProvidedFileWishlsitCsv);
			poi.interfaceCard.appendChild(poi.csvfileinput);
		}
		poi.csvfileinput.click();
	}

	function sampleCsvFile() {
		return String(`
			CardID
			1731542
			1725114
			1699299
			1687075`).replace(/^\s*/gm, '');	}

	function _setupInterface() {
		poi.progressToast = new WgusToast('progress', 3000);
		let point = document.querySelector('#page .page-content .page-title-clear + .card.card-style + .card.card-style');
		let card = document.createElement('div');
		card.id = 'wgus-wlds-card';
		card.className = 'card card-style';
		WgusMarkers.usBlockAddClass(card);
		card.innerHTML = `<div class="content">
				<h1>Wish List Data Science</h1>
				<h2><b>Big Fat Warning</b></h2>
				<p>
					<b>This is beta quality userscript</b>.
					The userscript developers and the game developers will *not* be able to help you in case of data loss,
					or data corruption, or any other damage.
				</p>

				<p>Backup or import the Wishlist as CSV files.
					You can use multiple files to manage separate Wishlists.<br><br>
					Importing adds to your Wishlist without removing other cards. You can import multiple files in succession.
					Importing takes about 2 minutes for each 300 cards.<br>
					The "Reset Wishlist" button above clears out your Wishlist.
					<b>Before clearing out your Wishlist double-check</b> that the number of records in CSV file
					you have downloaded and backed up matches the number of cards on your wishlist.
					<a href="#wgus-wlds-technical-documentation">Technical documentation</a> is available.
				</p>

				<p class="autosetup-wgus-content wgus-content-block">Found wishlisted cards: <span class="wgus-wlds-found-wishlisted-cards-count">?</span></p>

				<div id="wgus-wlds-technical-documentation" style="padding-top: 50px; /*rip black bar up top*/">
					<h2>Wish List Data Science technical documentation</h2>
					<p>This userscript uses <a href="https://www.rfc-editor.org/rfc/rfc4180">RFC 4180</a> style CSV files, with coma (<code>,</code>) separator and double-quote (<code>"</code>) enclosures.
						A custom CSV generator and custom CSV parser are used with hopes of resilience against malformed or malicious data, but no guarantees are given. Current policy is to abort early on unrecognized data.<br>
						CSV file is exported with multiple data columns, in hopes of providing a degree of resilience against data loss, data corruption, card deletion, and future format changes. The <code>CardID</code> column is the canonical card identifier.<br>
						Exported records are sorted by column <code>Card_Name</code> with natural & numeric sort (<code>Abc</code> before <code>Xyz</code>, and <code>Abc12Abc</code> before <code>Abc1234Abc</code>); incidentally this puts records marked <code>[DELETED]</code> near top.<br>
						CSV file is imported taking only the <code>CardID</code> column into account; other columns are ignored.
						Columns prefixes <code>wgus</code> and <code>wlds</code> are reserved for future use.
						Whole file is read and processed at once, with O(n*n) performance. Reduction to O(n) should be feasible if there's sufficient demand.<br>
						Order of records is not significant.<br>
						You can generate or edit the CSV files by hand or with a tool. A minimum viable file for has one header line reading verbatim <code>CardID</code>, followed by one or more lines containing bare numeric card ids, each number on a separate line:</p>
						<pre title="sample.csv" style="background: white; padding: 10px 20px">${escapeHtml(sampleCsvFile())}</pre>
					<a href="#wgus-wlds-card" style="padding: 10px 20px; display: block;">Close the technical documentation</a>
				</div>
				<div class="row mb-1">
					<div class="col-md-6">
						<button type="button" onclick="document.dispatchEvent(new Event('wgusDataScience.doDownloadWishlistCsv'))" class="wgus-wlds-downloadcsv-wl btn btn-block btn-outline-secondary">Download Wishlist backup (CSV file)</button>
					</div>
					<div class="col-md-6">
						<button type="button" onclick="document.dispatchEvent(new Event('wgusDataScience.doAddWishlistCsv'))" class="wgus-wlds-addcsv-wl btn btn-block btn-outline-secondary">Add to Wishlist from backup (CSV file)</button>
					</div>
				</div>
			</div>`;
		point.after(card);
		poi.interfaceCard = card;
		WgusMarkers.usMarkerMakeInlineMarked(poi.interfaceCard.querySelector('.wgus-wlds-downloadcsv-wl'));
		WgusMarkers.usMarkerMakeInlineMarked(poi.interfaceCard.querySelector('.wgus-wlds-addcsv-wl'));
		WgusMarkers.usMarkerMakeBlockMarked(card.querySelector('h1'));
		WgusMarkers.usMarkerMakeBlockMarked(card.querySelector('#wgus-wlds-technical-documentation h2'));

		WgusMarkers.usAutosetup(poi.interfaceCard);
		setupUpdateWishlistedCardCount();
	}

	function updateWishlistedCardCount() {
		document.querySelector('.wgus-wlds-found-wishlisted-cards-count').textContent = Number(document.querySelectorAll('#wishedCards div[data-cardid]').length);
	}

	function setupUpdateWishlistedCardCount() {
		const observer = new MutationObserver(updateWishlistedCardCount);
		observer.observe(document.querySelector('#wishedCards'), {childList: true,subtree: true});
		updateWishlistedCardCount(); /* yeah pre-run once */
	}

	function setupInterface() {
		const observer = new MutationObserver(function() {
			if(document.querySelector('#page .page-content .page-title-clear + .card.card-style + .card.card-style')) {
				observer.disconnect();
				return _setupInterface();
			}
    	});
		observer.observe(document.body, {childList: true,subtree: true});
	}

	function setupStyles() {
		GM_addStyle(`
			#wgus-wlds-technical-documentation {
				display: none;
			}
			#wgus-wlds-technical-documentation:target {
				display: block;
			}
		`);
	}

	function _setupONCONTENTLOADED() {
	}

	function setupONCONTENTLOADED() {
		document.addEventListener('DOMContentLoaded', _setupONCONTENTLOADED);
	}

	function setup() {
		setupStyles();
		setupInterface();
		document.addEventListener('wgusDataScienceShow', function() {showDataScience();});
		document.addEventListener('wgusDataScience.doDownloadWishlistCsv', function() {doDownloadWishlistCsv();});
		document.addEventListener('wgusDataScience.doAddWishlistCsv', function() {doAddWishlistCsv();});
		document.addEventListener('wgusDataScience.doConfirmPruneWishlist', ()=>confirm('Delete all wishlisted cards? Be sure to download Wishlist Backup first!') && document.dispatchEvent(new Event('wgusDataScience.doStartPruneWishlist')));
		document.addEventListener('wgusDataScience.doStartPruneWishlist', doPruneWishlist);
		setupONCONTENTLOADED();
	}

	setup();
})();
