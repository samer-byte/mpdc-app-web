/* app.morepartiesdc.com/texts.html: 21+ gate, then table-text sign-up (backend/72_sms_optin.sql).
   Built from backend/texts.src.js by backend/build_texts_js.js (fills in the public Supabase URL and publishable key). */
(function () {
  "use strict";
  var URL = "https://coekikwjxjkgkxecnokg.supabase.co", KEY = "sb_publishable_n5nz47HOxrRhFOZhvuzX8A_hm5fvL0W", VERSION = "web-2026-11-13";
  var GATE_KEY = "mpdc_texts_21", DAY = 864e5;
  var MON = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  function $(id) { return document.getElementById(id); }
  function opt(sel, v, t) { var o = document.createElement("option"); o.value = v; o.textContent = t; sel.appendChild(o); }
  function stored() { try { var t = +localStorage.getItem(GATE_KEY); return t && Date.now() - t < 30 * DAY; } catch (e) { return false; } }
  function remember() { try { localStorage.setItem(GATE_KEY, String(Date.now())); } catch (e) {} }
  var passed = false;
  function open() { passed = true; $("gate").hidden = true; $("content").hidden = false; }

  var m = $("m"), d = $("d"), y = $("y"), now = new Date();
  opt(m, "", "Month"); MON.forEach(function (n, i) { opt(m, i + 1, n); });
  opt(d, "", "Day"); for (var i = 1; i <= 31; i++) opt(d, i, i);
  opt(y, "", "Year"); for (var yr = now.getFullYear(); yr >= now.getFullYear() - 100; yr--) opt(y, yr, yr);

  if (stored()) open();
  $("gate-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var mm = +m.value, dd = +d.value, yy = +y.value, msg = $("gate-msg");
    if (!mm || !dd || !yy) { msg.textContent = "Pick your month, day and year of birth."; return; }
    var b = new Date(yy, mm - 1, dd);
    if (b.getMonth() !== mm - 1) { msg.textContent = "That date does not exist. Check the day."; return; }
    var t21 = new Date(yy + 21, mm - 1, dd);
    if (t21 > now) { msg.textContent = "Sorry, our events and table texts are for guests 21 and older."; return; }
    msg.textContent = ""; remember(); open();
  });

  $("optin").addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = $("msg"), go = $("go");
    msg.className = "msg err";
    if (!$("ok").checked) { msg.textContent = "Tick the box to agree to table texts."; return; }
    var digits = $("ph").value.replace(/\D/g, "");
    if (digits.length === 11 && digits[0] === "1") digits = digits.slice(1);
    if (digits.length !== 10) { msg.textContent = "Enter a 10-digit US mobile number."; return; }
    go.disabled = true; msg.className = "msg"; msg.textContent = "Signing you up...";
    var h = { "Content-Type": "application/json", "apikey": KEY };
    if (KEY.indexOf("eyJ") === 0) h.Authorization = "Bearer " + KEY;
    fetch(URL + "/rest/v1/rpc/sms_opt_in", { method: "POST", headers: h, body: JSON.stringify({
      p_phone: digits, p_consent: true, p_age_ok: passed || stored(), p_version: VERSION, p_first_name: $("fn").value || null }) })
      .then(function (r) { return r.json().catch(function () { return null; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j && res.j.ok) {
          msg.className = "msg ok";
          msg.textContent = "You're signed up for table texts from More Parties DC at (771) 213-6543. Reply STOP to any text to opt out.";
          $("optin").reset();
        } else {
          msg.className = "msg err";
          msg.textContent = (res.j && res.j.error) || "Something went wrong. Please try again, or text (771) 213-6543.";
        }
      })
      .catch(function () { msg.className = "msg err"; msg.textContent = "No connection. Please try again, or text (771) 213-6543."; })
      .then(function () { go.disabled = false; });
  });
})();
