/**
 * Initialize Tabber
 *
 * @param {HTMLElement} tabber
 */
function initTabber( tabber ) {
	var tabPanels = tabber.querySelectorAll( ':scope > .tabber__section > .tabber__panel' );

	var container = document.createElement( 'header' ),
		tabList = document.createElement( 'nav' ),
		prevButton = document.createElement( 'div' ),
		nextButton = document.createElement( 'div' );

	var buildTabs = function() {
		var fragment = new DocumentFragment();

		tabPanels.forEach( function( tabPanel ) {
			var isMD5 = require( './config.json' ).wgTabberNeueEnableMD5Hash.value,
				tab = document.createElement( 'a' );

			// Prepend with tab so that it does not collide with article heading
			var hash = 'tab-' + mw.util.escapeIdForAttribute( tabPanel.title ).slice( 0, -1 );

			// If MD5 Hash is enabled
			if ( isMD5 ) {
				var key = tabber.getAttribute( 'id' ).substring( 7 );
				hash += '-' + key;
			}

			tabPanel.setAttribute( 'id', hash );
			tabPanel.setAttribute( 'role', 'tabpanel' );
			tabPanel.setAttribute( 'aria-labelledby', 'tab-' + hash );
			tabPanel.setAttribute( 'aria-hidden', true );

			tab.innerText = tabPanel.title;
			tab.classList.add( 'tabber__tab' );
			tab.setAttribute( 'title', tabPanel.title );
			tab.setAttribute( 'role', 'tab' );
			tab.setAttribute( 'href', '#' + hash );
			tab.setAttribute( 'id', 'tab-' + hash );
			tab.setAttribute( 'aria-select', false );
			tab.setAttribute( 'aria-controls', hash );

			fragment.append( tab );
		} );

		tabList.append( fragment );

		container.classList.add( 'tabber__header' );
		tabList.classList.add( 'tabber__tabs' );
		tabList.setAttribute( 'role', 'tablist' );
		prevButton.classList.add( 'tabber__header__prev' );
		nextButton.classList.add( 'tabber__header__next' );

		container.append( prevButton, tabList, nextButton );
	};

	buildTabs();
	tabber.prepend( container );

	// Initalize previous and next buttons
	var initButtons = function() {
		var PREVCLASS = 'tabber__header--prev-visible',
			NEXTCLASS = 'tabber__header--next-visible';

		/* eslint-disable mediawiki/class-doc */
		var scrollTabs = function( offset ) {
			var scrollLeft = tabList.scrollLeft + offset;

			// Scroll to the start
			if ( scrollLeft <= 0 ) {
				tabList.scrollLeft = 0;
				container.classList.remove( PREVCLASS );
				container.classList.add( NEXTCLASS );
			} else {
				tabList.scrollLeft = scrollLeft;
				// Scroll to the end
				if ( scrollLeft + tabList.offsetWidth >= tabList.scrollWidth ) {
					container.classList.remove( NEXTCLASS );
					container.classList.add( PREVCLASS );
				} else {
					container.classList.add( NEXTCLASS );
					container.classList.add( PREVCLASS );
				}
			}
		};

		var setupButtons = function() {
			var isScrollable = ( tabList.scrollWidth > container.offsetWidth );

			if ( isScrollable ) {
				var scrollOffset = container.offsetWidth / 2;

				// Just to add the right classes
				scrollTabs( 0 );
				prevButton.addEventListener( 'click', function() {
					scrollTabs( -scrollOffset );
				}, false );

				nextButton.addEventListener( 'click', function() {
					scrollTabs( scrollOffset );
				}, false );
			} else {
				container.classList.remove( NEXTCLASS );
				container.classList.remove( PREVCLASS );
			}
		};
		/* eslint-enable mediawiki/class-doc */

		setupButtons();

		// Listen for window resize
		window.addEventListener( 'resize', function() {
			mw.util.debounce( 250, setupButtons() );
		} );
	};

	var xhr = new XMLHttpRequest();
	var currentRequest = null, nextRequest = null;

	/**
	 * Loads page contents into tab
	 *
	 * @param {HTMLElement} tab panel
	 * @param {string} api URL
	 */
	function loadPage( targetPanel, url ) {
		var requestData = {
			url: url,
			targetPanel: targetPanel
		};
		if ( currentRequest ) {
			if ( currentRequest.url != requestData.url ) {
				nextRequest = requestData;
			}
			// busy
			return;
		}
		xhr.open( 'GET', url );
		currentRequest = requestData;
		xhr.send( null );
	}

	/**
	 * Show panel based on target hash
	 *
	 * @param {string} targetHash
	 */
	function showPanel( targetHash ) {
		var ACTIVETABCLASS = 'tabber__tab--active',
			ACTIVEPANELCLASS = 'tabber__panel--active',
			targetPanel = document.getElementById( targetHash ),
			targetTab = document.getElementById( 'tab-' + targetHash ),
			section = targetPanel.parentElement,
			activePanel = section.querySelector( ':scope > .' + ACTIVEPANELCLASS );

		var getHeight = function( el ) {
			if ( el.offsetHeight !== 0 ) {
				return el.offsetHeight;
			}

			// Sometimes the tab is hidden by one of its parent elements
			// and you can only get the actual height by cloning the element
			var clone = el.cloneNode( true );
			// Hide the cloned element
			clone.style.cssText = 'position:absolute;visibility:hidden;';
			// Add cloned element to body
			document.body.appendChild( clone );
			// Measure the height of the clone
			var height = clone.clientHeight;
			// Remove the cloned element
			clone.parentNode.removeChild( clone );
			return height;
		};

		if ( targetPanel.dataset.tabberPendingLoad && targetPanel.dataset.tabberLoadUrl ) {
			var loading = document.createElement( 'div' );
			loading.setAttribute( 'class', 'tabber__loading' );
			loading.appendChild( document.createTextNode( mw.message( 'tabberneue-loading' ).text() ) );
			targetPanel.textContent = '';
			targetPanel.appendChild( loading );
			loadPage( targetPanel, targetPanel.dataset.tabberLoadUrl );
		}

		/* eslint-disable mediawiki/class-doc */
		if ( activePanel ) {
			// Just to be safe since there can be multiple active classes
			// even if there shouldn't be
			var activeTabs = tabList.querySelectorAll( '.' + ACTIVETABCLASS );

			if ( activeTabs.length > 0 ) {
				activeTabs.forEach( function( activeTab ) {
					activeTab.classList.remove( ACTIVETABCLASS );
					activeTab.setAttribute( 'aria-selected', false );
				} );
			}

			activePanel.classList.remove( ACTIVEPANELCLASS );
			activePanel.setAttribute( 'aria-hidden', true );
			section.style.height = getHeight( activePanel ) + 'px';
			section.style.height = getHeight( targetPanel ) + 'px';
		} else {
			section.style.height = getHeight( targetPanel ) + 'px';
		}

		// Add active class to the tab
		targetTab.classList.add( ACTIVETABCLASS );
		targetTab.setAttribute( 'aria-selected', true );
		targetPanel.classList.add( ACTIVEPANELCLASS );
		targetPanel.setAttribute( 'aria-hidden', false );

		// Scroll to tab
		section.scrollLeft = targetPanel.offsetLeft;
		/* eslint-enable mediawiki/class-doc */
	}

	/**
	 * Event handler for XMLHttpRequest where ends loading
	 */
	function onLoadEndPage() {
		var targetPanel = currentRequest.targetPanel;
		if ( xhr.status != 200 ) {
			var err = document.createElement( 'div' );
			err.setAttribute( 'class', 'tabber__error' );
			err.appendChild( document.createTextNode( mw.message( 'tabberneue-error' ).text() ) );
			targetPanel.textContent = '';
			targetPanel.appendChild( err );
		} else {
			var result = JSON.parse( xhr.responseText );
			targetPanel.innerHTML = result.parse.text;
			// wikipage.content hook requires a jQuery object
			mw.hook( 'wikipage.content' ).fire( $( targetPanel ) );
			delete targetPanel.dataset.tabberPendingLoad;
			delete targetPanel.dataset.tabberLoadUrl;
		}

		var ACTIVEPANELCLASS = 'tabber__panel--active',
			targetHash = targetPanel.getAttribute( 'id' ),
			section = targetPanel.parentElement,
			activePanel = section.querySelector( ':scope > .' + ACTIVEPANELCLASS );

		if ( nextRequest ) {
			currentRequest = nextRequest;
			nextRequest = null;
			xhr.open( 'GET', currentRequest.url );
			xhr.send( null );
		} else {
			currentRequest = null;
		}
		if ( activePanel ) {
			// Refresh height
			showPanel( targetHash );
		}
	}

	xhr.timeout = 20000;
	xhr.addEventListener( 'loadend', onLoadEndPage );

	/**
	 * Retrieve target hash and trigger show panel
	 * If no targetHash is invalid, use the first panel
	 *
	 * @param {HTMLElement} tabber
	 */
	function switchTab() {
		var targetHash = new mw.Uri( location.href ).fragment;

		// Switch to the first tab if no targetHash or no tab is detected
		if ( !targetHash || !tabList.querySelector( '#tab-' + targetHash ) ) {
			targetHash = tabList.firstElementChild.getAttribute( 'id' ).substring( 4 );
		}

		showPanel( targetHash );
	}

	switchTab();

	// Only run if client is not a touch device
	if ( matchMedia( '(hover: hover)' ).matches ) {
		initButtons();
	}

	// window.addEventListener( 'hashchange', switchTab, false );

	// Respond to clicks on the nav tabs
	Array.prototype.forEach.call( tabList.children, function( tab ) {
		tab.addEventListener( 'click', function( event ) {
			var targetHash = tab.getAttribute( 'href' ).substring( 1 );
			event.preventDefault();
			// Add hash to the end of the URL
			history.pushState( null, null, '#' + targetHash );
			showPanel( targetHash );
		} );
	} );

	tabber.classList.add( 'tabber--live' );
}

function main() {
	var tabbers = document.querySelectorAll( '.tabber' );

	if ( tabbers ) {
		mw.loader.load( 'ext.tabberNeue.icons' );
		tabbers.forEach( function( tabber ) {
			initTabber( tabber );
		} );
	}
}

main();
