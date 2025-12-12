/**
 * bfcache-manager.js
 * 
 * This script ensures optimal Back/Forward Cache (bfcache) compatibility across the website.
 * It specifically handles WebSocket connections (or other persistent connections) to prevent
 * them from blocking the bfcache.
 * 
 * Key Features:
 * 1. Closes secure connections (WebSockets) on 'pagehide'.
 * 2. Re-establishes connections on 'pageshow' (including restoration from bfcache).
 * 3. Avoids using 'unload' or 'beforeunload' listeners which break bfcache.
 * 
 * Usage:
 * Include this script on every page where bfcache support is desired.
 * If you have a specific WebSocket instance, integrate it with the `socket` variable below.
 */

(function () {
    'use strict';

    // Global variable to hold the WebSocket connection (if applicable)
    // You can export this or attach it to window if you need to access it externally.
    let appSocket = null;

    /**
     * Initializes the WebSocket connection.
     * Replace the URL with your actual WebSocket endpoint.
     */
    function connectWebSocket() {
        // Example: Only connect if we have a defined endpoint
        const WS_URL = 'wss://your-websocket-endpoint.example.com';

        // Return if already connected
        if (appSocket && appSocket.readyState === WebSocket.OPEN) {
            console.log('[bfcache-manager] WebSocket already open.');
            return;
        }

        console.log('[bfcache-manager] Connecting WebSocket...');

        // Uncomment and configure when you have a real endpoint:
        // appSocket = new WebSocket(WS_URL);

        // appSocket.addEventListener('open', () => {
        //     console.log('[bfcache-manager] WebSocket connected.');
        // });

        // appSocket.addEventListener('close', () => {
        //     console.log('[bfcache-manager] WebSocket closed.');
        //     appSocket = null;
        // });

        // appSocket.addEventListener('error', (err) => {
        //     console.error('[bfcache-manager] WebSocket error:', err);
        // });
    }

    /**
     * Closes the WebSocket connection gracefully.
     * This is crucial for bfcache, as open connections can prevent catching.
     */
    function closeWebSocket() {
        if (appSocket) {
            console.log('[bfcache-manager] Closing WebSocket for page suspension...');
            appSocket.close();
            appSocket = null;
        }
    }

    /**
     * Handle the 'pageshow' event.
     * This fires when the page is loaded initially OR restored from bfcache.
     * 
     * @param {PageTransitionEvent} event 
     */
    function onPageShow(event) {
        // event.persisted is true if the page was restored from the bfcache
        if (event.persisted) {
            console.log('[bfcache-manager] Page restored from bfcache.');
        } else {
            console.log('[bfcache-manager] Page loaded normally.');
        }

        // Reconnect WebSocket or restart other sensitive tasks
        connectWebSocket();
    }

    /**
     * Handle the 'pagehide' event.
     * This fires when the user navigates away from the page.
     * 
     * @param {PageTransitionEvent} event 
     */
    function onPageHide(event) {
        console.log('[bfcache-manager] Page hiding. Persisted:', event.persisted);

        // Close WebSocket to ensure the page can be cached
        closeWebSocket();

        // Note: Do NOT use 'unload' or 'beforeunload' listeners elsewhere in your app
        // as they effectively disable bfcache in many browsers.
    }

    /**
     * Handle the 'freeze' event.
     * Part of the modern Page Lifecycle API.
     * Fires when the page is being frozen (e.g., CPU suspension) which allows it to stay in bfcache.
     */
    function onFreeze() {
        console.log('[bfcache-manager] Page freezing.');
        closeWebSocket();
    }

    /**
     * Handle the 'resume' event.
     * Part of the modern Page Lifecycle API.
     * Fires when the page resumes from a frozen state.
     */
    function onResume() {
        console.log('[bfcache-manager] Page resuming.');
        connectWebSocket();
    }

    // Attach Event Listeners
    // 'pageshow' and 'pagehide' are the primary events for bfcache
    window.addEventListener('pageshow', onPageShow);
    window.addEventListener('pagehide', onPageHide);

    // 'freeze' and 'resume' provide additional robustness for the Page Lifecycle API
    document.addEventListener('freeze', onFreeze);
    document.addEventListener('resume', onResume);

    console.log('[bfcache-manager] Initialized with Page Lifecycle API support.');

})();
