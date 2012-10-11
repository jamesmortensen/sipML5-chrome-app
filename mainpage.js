
document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('btnSoftphone').addEventListener('click', function(event) {
    /*    document.getElementById('softphoneFrame').display = "block"; 
    document.getElementById('expertFrame').display = "none";*/
    console.info("show softphone");    
    document.getElementById('softphoneFrame').setAttribute("class","sandbox active"); 
    document.getElementById('expertFrame').setAttribute("class","sandbox");
    storageAPI.updateSandboxStorage('softphoneFrame');
  });

  document.getElementById('btnExpertMode').addEventListener('click', function(event) {
    /*    document.getElementById('expertFrame').display = "block"; 
    document.getElementById('softphoneFrame').display = "none";*/
    console.info("show expert mode"); 
    document.getElementById('expertFrame').setAttribute("class","sandbox active"); 
    document.getElementById('softphoneFrame').setAttribute("class","sandbox");
    storageAPI.updateSandboxStorage('expertFrame');
  });


// ugly hack to prevent this onload firing before the sandbox delegator is listening...
window.setTimeout(function() {

    // get the saved data from chrome storage APIs and send to the sandbox
    storageAPI.initWrapper();
    document.querySelector('img.loading').style.display = "none";
},5000);

}); // end DOMContentLoaded

