/*
* Copyright (C) 2012 Doubango Telecom <http://www.doubango.org>^M
* License: GPLv3^M
* This file is part of Open Source sipML5 solution <http://www.sipml5.org>^M
*
* Modified by James Mortensen <james.mortensen@voicecurve.com> to help make the code
* compatible with Chrome Packaged Apps.
*/

    var cbVideoDisable;
    var cbAVPFDisable;
    var txtWebsocketServerUrl;
    var txtSIPOutboundProxyUrl;
    var txtInfo;

    window.onload = function() { 
        
        if(storageAPI.CHROME_EXTENSION == true) {
            // initialize chrome storage postMessage listeners
            storageAPI.delegator(); 
        } else {
            // just use window.localStorage and delegate to the onload handler
            storageAPI.sandbox.window.onload();
        }

    };

    storageAPI.sandbox.window.onload = function () {

        cbVideoDisable = document.getElementById("cbVideoDisable");
        cbAVPFDisable = document.getElementById("cbAVPFDisable");
        txtWebsocketServerUrl = document.getElementById("txtWebsocketServerUrl");
        txtSIPOutboundProxyUrl = document.getElementById("txtSIPOutboundProxyUrl");
        txtInfo = document.getElementById("txtInfo");

        txtWebsocketServerUrl.disabled = !window.WebSocket;

        document.getElementById("btnSave").disabled = !storageAPI;
        document.getElementById("btnRevert").disabled = !storageAPI;

//        settingsRevert(true);

        // since Chrome Packaged apps don't allow inline JavaScript, we bind click events dynamically
        document.getElementById("btnSave").onclick = function() { settingsSave(); }
        document.getElementById("btnRevert").onclick = function() { settingsRevert(); }

        // initialize storageAPI to use window.localStorage or chrome storage APIs
        storageAPI.initSandbox(function() { settingsRevert(true); });
    }

    function settingsSave() {
        storageAPI.setItem('org.doubango.expert.disable_video', cbVideoDisable.checked ? "true" : "false");
        storageAPI.setItem('org.doubango.expert.disable_avpf', cbAVPFDisable.checked ? "true" : "false");
        if (!txtWebsocketServerUrl.disabled) {
            storageAPI.setItem('org.doubango.expert.websocket_server_url', txtWebsocketServerUrl.value);
        }
        storageAPI.setItem('org.doubango.expert.sip_outboundproxy_url', txtSIPOutboundProxyUrl.value);

        txtInfo.innerHTML = '<i>Saved</i>';
    }

    function settingsRevert(bNotUserAction) {
        console.debug(storageAPI.getItem('org.doubango.expert.disable_avpf') == "true");
        cbVideoDisable.checked = (storageAPI.getItem('org.doubango.expert.disable_video') == "true");
        cbAVPFDisable.checked = (storageAPI.getItem('org.doubango.expert.disable_avpf') == "true");
        txtWebsocketServerUrl.value = (storageAPI.getItem('org.doubango.expert.websocket_server_url') || "");
        txtSIPOutboundProxyUrl.value = (storageAPI.getItem('org.doubango.expert.sip_outboundproxy_url') || "");

        if (!bNotUserAction) {
            txtInfo.innerHTML = '<i>Reverted</i>';
        }
    }

