function drdsgvo_getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ')
      c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0)
      return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function drdsgvo_createPopup() {
  var da = document.getElementById("drdsgvo_div");
  if (da && da != null) {
    drdsgvo_callback1();
    return true;
  }
  var div = $("<div></div>");
  div.attr("id", "drdsgvo_div");

  $("body").append(div);
  $("#drdsgvo_div").load("consent/drdsgvo_consent.def", drdsgvo_callback1);
  return true;
}

function drdsgvo_callback1() {
  $("#drdsgvo_popup").removeClass("drdsgvo-hide");
  $('body,html').find('#drdsgvo_popup').removeClass("drdsgvo-hide");
}

var drdsgvodone = 0;
var lastprop = "";
function drdsgvof(force) {
  if (drdsgvodone == 1 && force != 1) {
    return;
  }
  $("#imp_link").attr("href", drdsgvo_imp_link);
  $("#dse_link").attr("href", drdsgvo_dse_link);
  drdsgvodone = 1;
  var cc = drdsgvo_getCookie("drdsgvo_consent");
  if (force == 1 || (cc == undefined || cc == null || cc == 0)) {
    drdsgvo_createPopup();

  }
  else {
    if (cc == 1) {
      drdsgvo_unblock(0);
    }
  }
}

function drdsgvo_saveConsent(cc, cid,reload=false) {
  $.ajax({
    url: "consent/consent-backend.php",
    data: {"f": "sc", "cc": cc, "cid": cid},
    datatype: "script",
    type: "POST",
    success: function (data) {
      if(reload){
        window.location.reload();
      }
      console.log("OK");
    }
  });
}

function drdsgvo_createConsentID() {
  var res = $.ajax({
    url: "consent/consent-backend.php",
    data: {"f": "cc"},
    datatype: "script",
    async: false,
    type: "POST",
//    success: function (data) {
//      console.log(data);
//      return data;
//    }
  }).responseText;
  console.log(res);
  return res;
}

function drdsgvo_unblock(new_) {
  var cid = drdsgvo_getCookie("drdsgvo_consent_id");
  if (cid == undefined || cid == null || cid.length < 10) {
    cid = drdsgvo_createConsentID();
    drdsgvo_setCookie("drdsgvo_consent_id", cid, 365);
  }
  if (new_ == 1) {
    drdsgvo_saveConsent(1, cid);
  }
  drdsgvo_setCookie("drdsgvo_consent", 1, 365);
  var val = $("#drdsgvo_script").attr("data-src");
  $("#drdsgvo_script").attr("src", val);
}
function drdsgvo_block(new_) {
  var cc = drdsgvo_getCookie("drdsgvo_consent");
  if (cc > 0) {
    var cid = drdsgvo_getCookie("drdsgvo_consent_id");
    if (cid == undefined || cid == null || cid.length < 10) {
      cid = drdsgvo_createConsentID();
      drdsgvo_setCookie("drdsgvo_consent_id", cid, 365);
    }
    drdsgvo_saveConsent(-1, cid,true);
    
  }
  drdsgvo_setCookie("drdsgvo_consent", -1, 365);
}
function drdsgvo_setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  var s1 = name + "=" + (value || "") + expires + "; path=/;secure";
  document.cookie = s1;
}
function drdsgvo_getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ')
      c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0)
      return c.substring(nameEQ.length, c.length);
  }
  return null;
}
function drdsgvo_eraseCookie(name, imm, host) {
  if (1 === imm) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;max-age=-99999999;path=/';
  }
  else {
    var dom;
    if (host && host != null && host !== undefined) {
      dom = host;
    }
    else
    {
      dom = 'ihre-webseite.de';
    }
    setTimeout(function () {
      var sx = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;max-age=-99999999;path=/;domain=' + dom;
      document.cookie = sx;
      sx = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;max-age=-99999999;path=/;domain=.' + dom;
      document.cookie = sx;
      var gc = drdsgvo_getCookie(name);
      if (gc && gc !== undefined && gc != "" & gc.length > 0) {
        drdsgvo_setCookie(name, "");
      }
    }, 800);
  }
}

var closed1 = false;
function showDetdrdsgvo(m) {
  if (m == 1) {
    console.log($('body,html').find('#drdsgvo_show2'));
    $('body,html').find('#drdsgvo_show1').addClass("drdsgvo-hide");
    //$('body,html').find('#drdsgvo_show11').addClass("drdsgvo-hide").removeClass("drdsgvo-visible-lg");
    $('body,html').find('#drdsgvo_show2').removeClass("drdsgvo-hide");
    $("#drdsgvo_show1").addClass("drdsgvo-hide");
    $("#drdsgvo_show11").addClass("drdsgvo-hide").removeClass("drdsgvo-visible-lg");
    $("#drdsgvo_show2").removeClass("drdsgvo-hide");
  }
  else {
    $("#drdsgvo_show2").addClass("drdsgvo-hide");
    //$("#drdsgvo_show11").removeClass("drdsgvo-hide").addClass("drdsgvo-visible-lg");
    $("#drdsgvo_show1").removeClass("drdsgvo-hide");
    $('body,html').find('#drdsgvo_show2').addClass("drdsgvo-hide");
    $('body,html').find('#drdsgvo_show1').removeClass("drdsgvo-hide");
  }
}

function drdsgvo_close() {
  $("#showein").removeClass("drdsgvo-hide");
  closed1 = true;
  $("#drdsgvo_popup").addClass("drdsgvo-hide");
}
drdsgvof();