/*
* Copyright (C) 2012 Doubango Telecom <http://www.doubango.org>^M
* License: GPLv3^M
* This file is part of Open Source sipML5 solution <http://www.sipml5.org>^M
*
* Modified by James Mortensen <james.mortensen@voicecurve.com> to help make the code
* compatible with Chrome Packaged Apps.
*/

    // to avoid caching

    //if (window.location.href.indexOf("svn=") == -1) {

    //    window.location.href += (window.location.href.indexOf("?") == -1 ? "?svn=10" : "&svn=10");

    //}



    var sTransferNumber;

    var oRingTone, oRingbackTone;

    var oSipStack, oSipSessionRegister, oSipSessionCall, oSipSessionTransferCall;

    var txtDisplayName, txtPrivateIdentity, txtPublicIdentity, txtPassword, txtRealm;

    var txtPhoneNumber;

    var btnCall, btnHangUp;

    var txtRegStatus, txtCallStatus;

    var btnRegister, btnUnRegister;

    var btnFullScreen, btnHoldResume, btnTransfer, btnKeyPad;

    var videoRemote, videoLocal;

    var divVideo, divCallOptions;

    var tdVideo;

    var bFullScreen = false;

    var oNotifICall;

    var oReadyStateTimer;

    var bDisableVideo = false;


    window.onload = function() { 
        if(storageAPI.CHROME_EXTENSION == true) {
            // initialize chrome storage postMessage listeners
            console.info("Registering sandbox delegator..."); 
            storageAPI.delegator();

            // turn off scrollbars only in the app
            document.body.style.overflow = "hidden";
 
        } else {
            // just use window.localStorage and delegate to the onload handler
            storageAPI.sandbox.window.onload();
        }
        
        console.info("location = " + window.location.protocol);
    }; 

    storageAPI.sandbox.window.onload = function () {
        console.info("Calling storageAPI sandbox onload...");

        txtDisplayName = document.getElementById("txtDisplayName");

        txtPrivateIdentity = document.getElementById("txtPrivateIdentity");

        txtPublicIdentity = document.getElementById("txtPublicIdentity");

        txtPassword = document.getElementById("txtPassword");

        txtRealm = document.getElementById("txtRealm");



        txtPhoneNumber = document.getElementById("txtPhoneNumber");



        btnCall = document.getElementById("btnCall");

        btnHangUp = document.getElementById("btnHangUp");



        txtRegStatus = document.getElementById("txtRegStatus");

        txtCallStatus = document.getElementById("txtCallStatus");



        btnRegister = document.getElementById("btnRegister");

        btnUnRegister = document.getElementById("btnUnRegister");



        btnFullScreen = document.getElementById("btnFullScreen");

        btnHoldResume = document.getElementById("btnHoldResume");

        btnTransfer = document.getElementById("btnTransfer");

        btnKeyPad = document.getElementById("btnKeyPad");



        videoLocal = document.getElementById("video_local");

        videoRemote = document.getElementById("video_remote");



        divVideo = document.getElementById("divVideo");

        divCallOptions = document.getElementById("divCallOptions");

        //divVideo.style.height = '0px';



        tdVideo = document.getElementById("tdVideo");



        document.onkeyup = onKeyUp;

        document.body.onkeyup = onKeyUp;

        document.getElementById("divCallCtrl").onmousemove = onDivCallCtrlMouseMove;
        console.info("calling initSandbox...");

        // initialize storageAPI to use window.localStorage or chrome storage APIs
        storageAPI.initSandbox(function() {
        
            loadCredentials();
  
            loadCallOptions();
 
            bindClickEvents();

        });



/*
        loadCredentials();

        loadCallOptions();

        bindClickEvents();
*/

        oReadyStateTimer = setInterval(function () {

            if (document.readyState === "complete") {

                postInit();

                clearInterval(oReadyStateTimer);

            }

        },

        500);

    };


    // since Chrome Packaged apps don't allow inline JavaScript, we bind click events here
    function bindClickEvents() {
        document.getElementById("btnRegister").onclick = function() { sipRegister(); };
        document.getElementById("btnUnRegister").onclick = function() { sipUnRegister(); };
        document.getElementById("btnCall").onclick = function() { sipCall(); };
        document.getElementById("btnHangUp").onclick = function() { sipHangUp(); };
        document.getElementById("btnFullScreen").onclick = function() { toggleFullScreen(); };
        document.getElementById("btnHoldResume").onclick = function() { sipToggleHoldResume(); };
        document.getElementById("btnTransfer").onclick = function() { sipTransfer(); };
        
    }


    function postInit() {

        // Init WebRtc engine

        tsk_utils_init_webrtc();



        // check webrtc4all version

        if (tsk_utils_have_webrtc4all()) {

            tsk_utils_log_info("WebRTC type = " + WebRtc4all_GetType() + " version = " + tsk_utils_webrtc4all_get_version());

            if (tsk_utils_webrtc4all_get_version() != "1.11.745") {

                if (confirm("Your WebRtc4all extension is outdated. A new version with critical bug fix is available. Do you want to install it?\nIMPORTANT: You must restart your browser after the installation.")) {

                    window.location = 'http://code.google.com/p/webrtc4all/downloads/list';

                    return;

                }

            }

        }



        // checks for WebRTC support

        if (!tsk_utils_have_webrtc()) {

            // is it chrome?

            if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1) {

                    if (confirm("You're using an old Chrome version or WebRTC is not enabled.\nDo you want to see how to enable WebRTC?")) {

                        window.location = 'http://www.webrtc.org/running-the-demos';

                    }

                    else {

                        window.location = "index.html";

                    }

                    return;

            }

                

            // for now the plugins (WebRTC4all only works on Windows)

            if (navigator.appVersion.indexOf("Win") != -1) {

                // Internet explorer

                if (navigator.appName == 'Microsoft Internet Explorer') {

                    // Check for IE version 

                    var rv = -1;

                    var ua = navigator.userAgent;

                    var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");

                    if (re.exec(ua) != null) {

                        rv = parseFloat(RegExp.$1);

                    }

                    if (rv < 9.0) {

                        if (confirm("You are using an old IE version. You need at least version 9. Would you like to update IE?")) {

                            window.location = 'http://windows.microsoft.com/en-us/internet-explorer/products/ie/home';

                        }

                        else {

                            window.location = "index.html";

                        }

                    }



                    // check for WebRTC4all extension

                    if (!tsk_utils_have_webrtc4all()) {

                        if (confirm("webrtc4all extension is not installed. Do you want to install it?\nIMPORTANT: You must restart your browser after the installation.")) {

                            window.location = 'http://code.google.com/p/webrtc4all/downloads/list';

                        }

                        else {

                            // Must do nothing: give the user the chance to accept the extension

                            // window.location = "index.html";

                        }

                    }

                    // break page loading ('window.location' won't stop JS execution)

                    if (!tsk_utils_have_webrtc4all()) {

                        return;

                    }

                }

                else if (navigator.userAgent) {

                    if (navigator.userAgent.toLowerCase().indexOf("safari") > -1 || navigator.userAgent.toLowerCase().indexOf("firefox") > -1 || navigator.userAgent.toLowerCase().indexOf("opera") > -1) {

                        if (confirm("Your browser don't support WebRTC.\nDo you want to install WebRTC4all extension to enjoy audio/video calls?\nIMPORTANT: You must restart your browser after the installation.")) {

                            window.location = 'http://code.google.com/p/webrtc4all/downloads/list';

                        }

                        else {

                            window.location = "index.html";

                        }

                        return;

                    }

                }

            }

            // OSX, Unix, Android, iOS...

            else {

                if (confirm('WebRTC not supported on your browser.\nDo you want to download a WebSocket-capable browser?')) {

                    window.location = 'https://www.google.com/intl/en/chrome/browser/';

                }

                else {

                    window.location = "index.html";

                }

                return;

            }

        }



        // checks for WebSocket support

        if (!tsk_utils_have_websocket() && !tsk_utils_have_webrtc4all()) {

            if (confirm('Your browser don\'t support WebSockets.\nDo you want to download a WebSocket-capable browser?')) {

                window.location = 'https://www.google.com/intl/en/chrome/browser/';

            }

            else {

                window.location = "index.html";

            }

            return;

        }



        // attachs video displays

        if (tsk_utils_have_webrtc4all()) {

            WebRtc4all_SetDisplays(document.getElementById("divVideoLocal"), document.getElementById("divVideoRemote"));

        }



        if (!tsk_utils_have_webrtc()) {

            if (confirm('Your browser don\'t support WebRTC.\naudio/video calls will be disabled.\nDo you want to download a WebRTC-capable browser?')) {

                window.location = 'https://www.google.com/intl/en/chrome/browser/';

            }

        }



        btnRegister.disabled = false;

        document.body.style.cursor = 'default';



        tsk_utils_log_info('User-Agent=' + (navigator.userAgent || "unknown"));

    }





    function loadCallOptions() {

        if (storageAPI) {

            var s_value;

            if ((s_value = storageAPI.getItem('org.doubango.call.phone_number'))) txtPhoneNumber.value = s_value;

            bDisableVideo = (storageAPI.getItem('org.doubango.expert.disable_video') == "true");



            txtCallStatus.innerHTML = '<i>Video ' + (bDisableVideo ? 'disabled' : 'enabled') + '</i>';

        }

    }



    function saveCallOptions() {

        if (storageAPI) {

            storageAPI.setItem('org.doubango.call.phone_number', txtPhoneNumber.value);

            storageAPI.setItem('org.doubango.expert.disable_video', bDisableVideo ? "true" : "false");

        }

    }



    function loadCredentials() {

        if (storageAPI) {

            // IE retuns 'null' if not defined

            var s_value;

            if ((s_value = storageAPI.getItem('org.doubango.identity.display_name'))) txtDisplayName.value = s_value;

            if ((s_value = storageAPI.getItem('org.doubango.identity.impi'))) txtPrivateIdentity.value = s_value;

            if ((s_value = storageAPI.getItem('org.doubango.identity.impu'))) txtPublicIdentity.value = s_value;

            if ((s_value = storageAPI.getItem('org.doubango.identity.password'))) txtPassword.value = s_value;

            if ((s_value = storageAPI.getItem('org.doubango.identity.realm'))) txtRealm.value = s_value;

        }

        else {

            //txtDisplayName.value = "1060";

            //txtPrivateIdentity.value = "1060";

            //txtPublicIdentity.value = "sip:1060@doubango.org";

            //txtPassword.value = "1060";

            //txtRealm.value = "doubango.org";

            //txtPhoneNumber.value = "1062";

        }

    };



    function saveCredentials() {

        if (storageAPI) {

            storageAPI.setItem('org.doubango.identity.display_name', txtDisplayName.value);

            storageAPI.setItem('org.doubango.identity.impi', txtPrivateIdentity.value);

            storageAPI.setItem('org.doubango.identity.impu', txtPublicIdentity.value);

            storageAPI.setItem('org.doubango.identity.password', txtPassword.value);

            storageAPI.setItem('org.doubango.identity.realm', txtRealm.value);

        }

    };



    // sends SIP REGISTER request to login

    function sipRegister() {

        // catch exception for IE (DOM not ready)

        try {

            btnRegister.disabled = true;

            if (!txtRealm.value || !txtPrivateIdentity.value || !txtPublicIdentity.value) {

                txtRegStatus.innerHTML = '<b>Please fill madatory fields (*)</b>';

                btnRegister.disabled = false;

                return;

            }

            var o_impu = tsip_uri.prototype.Parse(txtPublicIdentity.value);

            if (!o_impu || !o_impu.s_user_name || !o_impu.s_host) {

                txtRegStatus.innerHTML = "<b>[" + txtPublicIdentity.value + "] is not a valid Public identity</b>";

                btnRegister.disabled = false;

                return;

            }



            // enable notifications if not already done

            if (storageAPI.CHROME_EXTENSION == false && window.webkitNotifications && window.webkitNotifications.checkPermission() != 0) {

                window.webkitNotifications.requestPermission();

            }



            // save credentials

            saveCredentials();



            // create SIP stack

            var i_port;

            var s_proxy;

            // @NotUsed

            // var b_disable_avpf = (storageAPI.getItem('org.doubango.expert.disable_avpf') == "true");

            var s_websocket_server_url = storageAPI ? storageAPI.getItem('org.doubango.expert.websocket_server_url') : null;

            var s_sip_outboundproxy_url = storageAPI ? storageAPI.getItem('org.doubango.expert.sip_outboundproxy_url') : null;

            tsk_utils_log_info("s_websocket_server_url=" + (s_websocket_server_url || "(null)"));

            tsk_utils_log_info("s_sip_outboundproxy_url=" + (s_sip_outboundproxy_url || "(null)"));



            if (!tsk_utils_have_websocket()) {

                // port and host will be updated using the result from DNS SRV(NAPTR(realm))

                i_port = 5060;

                s_proxy = txtRealm.value;

            }

            else {

                // there are at least 5 servers running on the cloud on ports: 4062, 5062, 6062, 7062 and 8062

                // we will connect to one of them and let the balancer to choose the right one (less connected sockets)

                // each port can accept up to 65K connections which means that the cloud can manage 325K active connections

                // the number of port will be increased or decreased based on the current trafic

                i_port = 4062 + (((new Date().getTime()) % 5) * 1000);

                s_proxy = "sipml5.org";

            }

            

            // create a new SIP stack. Not mandatory as it's possible to reuse the same satck

            oSipStack = new tsip_stack(txtRealm.value, txtPrivateIdentity.value, txtPublicIdentity.value, s_proxy, i_port,

                                    tsip_stack.prototype.SetPassword(txtPassword.value),

                                    tsip_stack.prototype.SetDisplayName(txtDisplayName.value),

                                    tsip_stack.prototype.SetWebsocketServerUrl(s_websocket_server_url),

                                    tsip_stack.prototype.SetProxyOutBoundUrl(s_sip_outboundproxy_url),

                                    // not valid? "IM-client/OMA1.0 sipML5-v0.0.0000.0/mozilla/5.0 (windows nt 6.0) applewebkit/537.9 (khtml, like gecko) chrome/23.0.1261.1 safari/537.9"

                                    // tsip_stack.prototype.SetHeader('User-Agent', 'IM-client/OMA1.0 sipML5-v0.0.0000.0/' + (navigator.userAgent || "unknown").toLowerCase()),

                                    tsip_stack.prototype.SetHeader('User-Agent', 'IM-client/OMA1.0 sipML5-v1.0.89.0/'),

                                    tsip_stack.prototype.SetHeader('Organization', 'Doubango Telecom'));

            

            oSipStack.on_event_stack = onSipEventStack;

            oSipStack.on_event_dialog = onSipEventDialog;

            oSipStack.on_event_invite = onSipEventInvite;



            if (oSipStack.start() != 0) {

                txtRegStatus.innerHTML = '<b>Failed to start the SIP stack</b>';

            }

            else return;

        }

        catch (e) {

            txtRegStatus.innerHTML = "<b>2:" + e + "</b>";

        }

        btnRegister.disabled = false;

    }



    // sends SIP REGISTER (expires=0) to logout

    function sipUnRegister() {

        if (oSipStack) {

            oSipStack.stop(); // shutdown all sessions

        }

    }



    // makes a call (SIP INVITE)

    function sipCall() {

        if (oSipStack && !oSipSessionCall && !tsk_string_is_null_or_empty(txtPhoneNumber.value)) {

            btnCall.disabled = true;

            btnHangUp.disabled = false;

            oSipSessionCall = new tsip_session_invite(oSipStack,

                                tsip_session.prototype.SetToStr(txtPhoneNumber.value),

                                tsip_session.prototype.SetCaps("+sip.ice")

                            );

            bDisableVideo = (storageAPI && storageAPI.getItem('org.doubango.expert.disable_video') == "true");

            if (oSipSessionCall.call(bDisableVideo ? tmedia_type_e.AUDIO : tmedia_type_e.AUDIO_VIDEO) != 0) {

                oSipSessionCall = null;

                txtCallStatus.value = 'Failed to make call';

                btnCall.disabled = false;

                btnHangUp.disabled = true;

                return;

            }

            saveCallOptions();

        }

        else if (oSipSessionCall) {

            txtCallStatus.innerHTML = '<i>Connecting...</i>';

            oSipSessionCall.accept();

        }

    }



    // transfers the call

    function sipTransfer() {

        if (oSipSessionCall) {

            var s_destination = prompt('Enter destination number', '');

            if (!tsk_string_is_null_or_empty(s_destination)) {

                btnTransfer.disabled = true;

                if (oSipSessionCall.transfer(s_destination) != 0) {

                    txtCallStatus.innerHTML = '<i>Call transfer failed</i>';

                    btnTransfer.disabled = false;

                    return;

                }

                txtCallStatus.innerHTML = '<i>Transfering the call...</i>';

            }

        }

    }

    

    // holds or resumes the call

    function sipToggleHoldResume() {

        if (oSipSessionCall) {

            var i_ret;

            btnHoldResume.disabled = true;

            txtCallStatus.innerHTML = oSipSessionCall.bHeld ? '<i>Resuming the call...</i>' : '<i>Holding the call...</i>';

            i_ret = oSipSessionCall.bHeld ? oSipSessionCall.resume() : oSipSessionCall.hold();

            if (i_ret != 0) {

                txtCallStatus.innerHTML = '<i>Hold / Resume failed</i>';

                btnHoldResume.disabled = false;

                return;

            }

        }

    }



    // terminates the call (SIP BYE or CANCEL)

    function sipHangUp() {

        if (oSipSessionCall) {

            txtCallStatus.innerHTML = '<i>Terminating the call...</i>';

            oSipSessionCall.hangup();

        }

    }



    function startRingTone() {

        try { ringtone.play(); }

        catch (e) { }

    }



    function stopRingTone() {

        try { ringtone.pause(); }

        catch (e) { }

    }



    function startRingbackTone() {

        try { ringbacktone.play(); }

        catch (e) { }

    }



    function stopRingbackTone() {

        try { ringbacktone.pause(); }

        catch (e) { }

    }



    function toggleFullScreen() {

        if (videoRemote.webkitSupportsFullscreen) {

            fullScreen(!videoRemote.webkitDisplayingFullscreen);

        }

        else {

            fullScreen(!bFullScreen);

        }

    }



    function fullScreen(b_fs) {

        bFullScreen = b_fs;

        if (tsk_utils_have_webrtc4native() && bFullScreen && videoRemote.webkitSupportsFullscreen) {

            if (bFullScreen) {

                videoRemote.webkitEnterFullScreen();

            }

            else {

                videoRemote.webkitExitFullscreen();

            }

        }

        else {

            if (tsk_utils_have_webrtc4npapi()) {

                try { __o_display_remote.setFullScreen(b_fs); }

                catch (e) { divVideo.setAttribute("class", b_fs ? "full-screen" : "normal-screen"); }

            }

            else {

                divVideo.setAttribute("class", b_fs ? "full-screen" : "normal-screen");

            }

        }

    }



    function showNotifICall(s_number) {

        // permission already asked when we registered

        if (window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {

            if (oNotifICall) {

                oNotifICall.cancel();

            }

            oNotifICall = window.webkitNotifications.createNotification('images/sipml-34x39.png', 'Incaming call', 'Incoming call from ' + s_number);

            oNotifICall.onclose = function () { oNotifICall = null; };

            oNotifICall.show();

        }

    }



    function onKeyUp(evt) {

        evt = (evt || window.event);

        if (evt.keyCode == 27) {

            fullScreen(false);

        }

        else if (evt.ctrlKey && evt.shiftKey) { // CTRL + SHIFT

            if (evt.keyCode == 65 || evt.keyCode == 86) { // A (65) or V (86)

                bDisableVideo = (evt.keyCode == 65);

                txtCallStatus.innerHTML = '<i>Video ' + (bDisableVideo ? 'disabled' : 'enabled') + '</i>';

                storageAPI.setItem('org.doubango.expert.disable_video', bDisableVideo);

            }

        }

    }



    function onDivCallCtrlMouseMove(evt) {

        try { // IE: DOM not ready

            if (tsk_utils_have_stream()) {

                btnCall.disabled = (!tsk_utils_have_stream() || !oSipSessionRegister || !oSipSessionRegister.is_connected());

                document.getElementById("divCallCtrl").onmousemove = null; // unsubscribe

            }

        }

        catch (e) { }

    }



    function uiOnConnectionEvent(b_connected, b_connecting) { // should be enum: connecting, connected, terminating, terminated

        btnRegister.disabled = b_connected || b_connecting;

        btnUnRegister.disabled = !b_connected && !b_connecting;

        btnCall.disabled = !(b_connected && tsk_utils_have_webrtc() && tsk_utils_have_stream());

        btnHangUp.disabled = !oSipSessionCall;

    }



    function uiVideoDisplayEvent(b_local, b_added, o_src_video) {

        if (!bDisableVideo) {

            var o_elt_video = b_local ? videoLocal : videoRemote;



            if (b_added) {

                if (tsk_utils_have_webrtc4all()) {

                    if (b_local) __o_display_local.style.visibility = "visible";

                    else __o_display_remote.style.visibility = "visible";

                   

                }

                else {

                    o_elt_video.src = o_src_video;

                    o_elt_video.style.opacity = 1;

                }

                uiVideoDisplayShowHide(true);

            }

            else {

                if (tsk_utils_have_webrtc4all()) {

                    if (b_local) __o_display_local.style.visibility = "hidden";

                    else __o_display_remote.style.visibility = "hidden";

                }

                else {

                    o_elt_video.style.opacity = 0;

                    if (o_elt_video.src && b_local) videoLocal.src = undefined;  // already revoked: must be done for remote video

                }

                fullScreen(false);

            }

        }

    }



    function uiVideoDisplayShowHide(b_show) {

        if (b_show) {

            tdVideo.style.height = '340px';

            divVideo.style.height = navigator.appName == 'Microsoft Internet Explorer' ? '100%' : '340px';

        }

        else {

            tdVideo.style.height = '0px';

            divVideo.style.height = '0px';

        }

        btnFullScreen.disabled = !b_show;

    }



    // Callback function for SIP Stacks

    function onSipEventStack(evt) {

        // this is a special event shared by all sessions and there is no "e_stack_type"

        // check the 'sip/stack' code

        tsk_utils_log_info(evt.s_phrase);

        switch (evt.i_code) {

            case tsip_event_code_e.STACK_STARTED:

                {

                    // catch exception for IE (DOM not ready)

                    try {

                        // LogIn (REGISTER) as soon as the stack finish starting

                        oSipSessionRegister = new tsip_session_register(oSipStack,

                                                    tsip_session.prototype.SetExpires(200),

                                                    tsip_session.prototype.SetCaps("+g.oma.sip-im"),

                                                    tsip_session.prototype.SetCaps("+audio"),

                                                    tsip_session.prototype.SetCaps("language", "\"en,fr\""));

                        oSipSessionRegister.register();

                    }

                    catch (e) {

                        txtRegStatus.value = txtRegStatus.innerHTML = "<b>1:" + e + "</b>";

                        btnRegister.disabled = false;

                    }

                    break;

                }

            case tsip_event_code_e.STACK_STOPPING:

            case tsip_event_code_e.STACK_STOPPED:

            case tsip_event_code_e.STACK_FAILED_TO_START:

            case tsip_event_code_e.STACK_FAILED_TO_STOP:

                {

                    var b_failure = ((evt.i_code == tsip_event_code_e.STACK_FAILED_TO_START) || (evt.i_code == tsip_event_code_e.STACK_FAILED_TO_STOP));

                    oSipStack = null;

                    oSipSessionRegister = null;

                    oSipSessionCall = null;



                    uiOnConnectionEvent(false, false);



                    stopRingbackTone();

                    stopRingTone();



                    uiVideoDisplayShowHide(false);

                    divCallOptions.style.opacity = 0;



                    txtCallStatus.innerHTML = '';

                    txtRegStatus.innerHTML = b_failure ? "<i>Disconnected: <b>" + evt.s_phrase + "</b></i>" : "<i>Disconnected</i>";

                    break;

                }



            case tsip_event_code_e.STACK_STARTING:

            default:

                {

                    break;

                }

        }

    };



    // Callback function for all SIP dialogs (INVITE, REGISTER, INFO...)

    function onSipEventDialog(evt) {

        // this is special event shared by all sessions and there is no "e_dialog_type"

        // check the 'sip/dialog' code

        tsk_utils_log_info(evt.s_phrase);

        switch (evt.i_code) {

            case tsip_event_code_e.DIALOG_TRANSPORT_ERROR:

            case tsip_event_code_e.DIALOG_GLOBAL_ERROR:

            case tsip_event_code_e.DIALOG_MESSAGE_ERROR:

            case tsip_event_code_e.DIALOG_WEBRTC_ERROR:



            case tsip_event_code_e.DIALOG_REQUEST_INCOMING:

            case tsip_event_code_e.DIALOG_REQUEST_OUTGOING:

            case tsip_event_code_e.DIALOG_REQUEST_CANCELLED:

            case tsip_event_code_e.DIALOG_REQUEST_SENT:

            case tsip_event_code_e.DIALOG_MEDIA_ADDED:

            case tsip_event_code_e.DIALOG_MEDIA_REMOVED:



            default: break;





            case tsip_event_code_e.DIALOG_CONNECTING:

            case tsip_event_code_e.DIALOG_CONNECTED:

                {

                    var b_connected = (evt.i_code == tsip_event_code_e.DIALOG_CONNECTED);



                    if (oSipSessionRegister && evt.get_session().get_id() == oSipSessionRegister.get_id()) {

                        uiOnConnectionEvent(b_connected, !b_connected);

                        txtRegStatus.innerHTML = "<i>" + evt.s_phrase + "</i>";

                    }

                    else if (oSipSessionCall && evt.get_session().get_id() == oSipSessionCall.get_id()) {

                        btnHangUp.value = 'HangUp';

                        btnCall.disabled = true;

                        btnHangUp.disabled = false;

                        btnTransfer.disabled = false;



                        if (b_connected) {

                            stopRingbackTone();

                            stopRingTone();



                            if (oNotifICall) {

                                oNotifICall.cancel();

                                oNotifICall = null;

                            }

                        }



                        txtCallStatus.innerHTML = "<i>" + evt.s_phrase + "</i>";

                        divCallOptions.style.opacity = b_connected ? 1 : 0;



                        if (tsk_utils_have_webrtc4all()) { // IE don't provide stream callback

                            uiVideoDisplayEvent(true, true);

                            uiVideoDisplayEvent(false, true);

                        }

                    }

                    break;

                }

            case tsip_event_code_e.DIALOG_TERMINATING:

            case tsip_event_code_e.DIALOG_TERMINATED:

                {

                    if (oSipSessionRegister && evt.get_session().get_id() == oSipSessionRegister.get_id()) {

                        uiOnConnectionEvent(false, false);



                        oSipSessionCall = null;

                        oSipSessionRegister = null;



                        txtRegStatus.innerHTML = "<i>" + evt.s_phrase + "</i>";                        

                    }

                    else if (oSipSessionCall && evt.get_session().get_id() == oSipSessionCall.get_id()) {

                        btnCall.value = 'Call';

                        btnHangUp.value = 'HangUp';

                        btnHoldResume.value = 'hold';

                        btnCall.disabled = false;

                        btnHangUp.disabled = true;



                        oSipSessionCall = null;



                        stopRingbackTone();

                        stopRingTone();



                        txtCallStatus.innerHTML = "<i>" + evt.s_phrase + "</i>";

                        uiVideoDisplayShowHide(false);

                        divCallOptions.style.opacity = 0;



                        if (oNotifICall) {

                            oNotifICall.cancel();

                            oNotifICall = null;

                        }



                        if (tsk_utils_have_webrtc4all()) { // IE don't provide stream callback

                            uiVideoDisplayEvent(true, false);

                            uiVideoDisplayEvent(false, false);

                        }



                        setTimeout(function () { if (!oSipSessionCall) txtCallStatus.innerHTML = ''; }, 2500);

                    }

                    break;

                }

        }

    };



    // Call back function for SIP INVITE Dialog

    function onSipEventInvite(evt) {

        tsk_utils_log_info(evt.s_phrase);

        

        switch (evt.e_invite_type) {

            case tsip_event_invite_type_e.I_NEW_CALL:

                {

                    if (oSipSessionCall) {

                        // do not accept the incoming call if we're already 'in call'

                        evt.get_session().hangup(); // comment this line for multi-line support

                    }

                    else {

                        oSipSessionCall = evt.get_session();



                        btnCall.value = 'Answer';

                        btnHangUp.value = 'Reject';

                        btnCall.disabled = false;

                        btnHangUp.disabled = false;



                        startRingTone();



                        var s_number = (oSipSessionCall.o_uri_from.s_display_name ? oSipSessionCall.o_uri_from.s_display_name : oSipSessionCall.o_uri_from.s_user_name);

                        txtCallStatus.innerHTML = "<i>Incoming call from [<b>" + s_number + "</b>]</i>";

                        showNotifICall(s_number);

                    }

                    break;

                }



            case tsip_event_invite_type_e.I_ECT_NEW_CALL:

                {

                    oSipSessionTransferCall = evt.get_session();

                    break;

                }



            case tsip_event_invite_type_e.I_AO_REQUEST:

                {

                    if (evt.i_code == 180 || evt.i_code == 183 && evt.get_message().is_response_to_invite()) {

                        startRingbackTone();

                        txtCallStatus.innerHTML = '<i>Remote ringing...</i>';

                    }

                    break;

                }



            case tsip_event_invite_type_e.M_EARLY_MEDIA:

                {

                    stopRingbackTone();

                    stopRingTone();

                    txtCallStatus.innerHTML = '<i>Early media started</i>';

                    break;

                }



            case tsip_event_invite_type_e.M_STREAM_VIDEO_LOCAL_ADDED:

                {

                    uiVideoDisplayEvent(true, true, evt.get_session().get_url_video_local());

                    break;

                }

            case tsip_event_invite_type_e.M_STREAM_VIDEO_LOCAL_REMOVED:

                {

                    uiVideoDisplayEvent(true, false);

                    break;

                }

            case tsip_event_invite_type_e.M_STREAM_VIDEO_REMOTE_ADDED:

                {

                    uiVideoDisplayEvent(false, true, evt.get_session().get_url_video_remote());

                    break;

                }

            case tsip_event_invite_type_e.M_STREAM_VIDEO_REMOTE_REMOVED:

                {

                    uiVideoDisplayEvent(false, false);

                    break;

                }



            case tsip_event_invite_type_e.M_LOCAL_HOLD_OK:

                {

                    if (oSipSessionCall.bTransfering) {

                        oSipSessionCall.bTransfering = false;

                        // this.AVSession.TransferCall(this.transferUri);

                    }

                    btnHoldResume.value = 'Resume';

                    btnHoldResume.disabled = false;

                    txtCallStatus.innerHTML = '<i>Call placed on hold</i>';

                    oSipSessionCall.bHeld = true;

                    break;

                }

            case tsip_event_invite_type_e.M_LOCAL_HOLD_NOK:

                {

                    oSipSessionCall.bTransfering = false;

                    btnHoldResume.value = 'Hold';

                    btnHoldResume.disabled = false;

                    txtCallStatus.innerHTML = '<i>Failed to place remote party on hold</i>';

                    break;

                }

            case tsip_event_invite_type_e.M_LOCAL_RESUME_OK:

                {

                    oSipSessionCall.bTransfering = false;

                    btnHoldResume.value = 'Hold';

                    btnHoldResume.disabled = false;

                    txtCallStatus.innerHTML = '<i>Call taken off hold</i>';

                    oSipSessionCall.bHeld = false;



                    if (tsk_utils_have_webrtc4all()) { // IE don't provide stream callback yet

                        uiVideoDisplayEvent(true, true);

                        uiVideoDisplayEvent(false, true);

                    }

                    break;

                }

            case tsip_event_invite_type_e.M_LOCAL_RESUME_NOK:

                {

                    oSipSessionCall.bTransfering = false;

                    btnHoldResume.disabled = false;

                    txtCallStatus.innerHTML = '<i>Failed to unhold call</i>';

                    break;

                }

            case tsip_event_invite_type_e.M_REMOTE_HOLD:

                {

                    txtCallStatus.innerHTML = '<i>Placed on hold by remote party</i>';

                    break;

                }

            case tsip_event_invite_type_e.M_REMOTE_RESUME:

                {

                    txtCallStatus.innerHTML = '<i>Taken off hold by remote party</i>';

                    break;

                }





            case tsip_event_invite_type_e.O_ECT_TRYING:

                {

                    txtCallStatus.innerHTML = '<i>Call transfer in progress...</i>';

                    break;

                }

            case tsip_event_invite_type_e.O_ECT_ACCEPTED:

                {

                    txtCallStatus.innerHTML = '<i>Call transfer accepted</i>';

                    break;

                }

            case tsip_event_invite_type_e.O_ECT_COMPLETED:

            case tsip_event_invite_type_e.I_ECT_COMPLETED:

                {

                    txtCallStatus.innerHTML = '<i>Call transfer completed</i>';

                    btnTransfer.disabled = false;

                    if (oSipSessionTransferCall) {

                        oSipSessionCall = oSipSessionTransferCall;

                    }

                    oSipSessionTransferCall = null;

                    break;

                }

	        case tsip_event_invite_type_e.O_ECT_FAILED:

	        case tsip_event_invite_type_e.I_ECT_FAILED:

	            {

	                txtCallStatus.innerHTML = '<i>Call transfer failed</i>';

	                btnTransfer.disabled = false;

	                break;

	            }

	        case tsip_event_invite_type_e.O_ECT_NOTIFY:

	        case tsip_event_invite_type_e.I_ECT_NOTIFY:

	            {

	                txtCallStatus.innerHTML = "<i>Call Transfer: <b>" + evt.i_code + " " + evt.s_phrase + "</b></i>";

	                if (evt.i_code >= 300) {

	                    if (oSipSessionCall.bHeld) {

	                        oSipSessionCall.resume();

	                    }

	                    btnTransfer.disabled = false;

	                }

	                break;

	            }

	        case tsip_event_invite_type_e.I_ECT_REQUESTED:

	            {

	                var o_hdr_Refer_To = evt.get_message().get_header(tsip_header_type_e.Refer_To); // header exist: already checked

	                if (o_hdr_Refer_To.o_uri) {

                        var s_message = "Do you accept call transfer to ["+ (o_hdr_Refer_To.s_display_name ? o_hdr_Refer_To.s_display_name : o_hdr_Refer_To.o_uri.s_user_name) + "]?";

                        if (confirm(s_message)) {

                            txtCallStatus.innerHTML = "<i>Call transfer in progress...</i>";

                            oSipSessionCall.transfer_accept();

                            break;

                        }

	                }

	                oSipSessionCall.transfer_reject();

	                break;

	            }



            default: break;

        }

    }



