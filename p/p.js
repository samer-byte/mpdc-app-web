/* app.morepartiesdc.com/p/?c=<code>: the short pay link the table line texts (backend/77_text_pay_link.sql).
   Looks the code up and forwards to the Stripe pay page. Built from backend/pay.src.js by backend/build_pay_js.js
   (fills in the public Supabase URL and publishable key). */
(function () {
  "use strict";
  var URL = "https://coekikwjxjkgkxecnokg.supabase.co", KEY = "sb_publishable_n5nz47HOxrRhFOZhvuzX8A_hm5fvL0W";
  function $(id) { return document.getElementById(id); }
  function stop(title, text) {
    $("wait").hidden = true; $("stop").hidden = false;
    if (title) $("stop-title").textContent = title;
    $("stop-text").textContent = text;
  }
  var m = /[?&]c=([0-9a-f]{16})(?:&|$)/.exec(location.search);
  if (!m) { stop(null, "The link is missing its code. Open it again from our text, or text us and we will send a new one."); return; }
  var headers = { "Content-Type": "application/json", "apikey": KEY };
  if (KEY.indexOf("eyJ") === 0) headers["Authorization"] = "Bearer " + KEY;
  fetch(URL + "/rest/v1/rpc/pay_link_open", { method: "POST", headers: headers, body: JSON.stringify({ p_code: m[1] }) })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      // Only ever forward to Stripe's own checkout host, whatever the lookup returned.
      if (j && j.ok === true && typeof j.url === "string" && j.url.indexOf("https://checkout.stripe.com/") === 0) {
        var go = $("go"); go.href = j.url; go.hidden = false;
        location.replace(j.url);
      } else if (j && j.paid) {
        stop("This table is already paid.", "You are all set. It is on our chart.");
      } else {
        stop(null, (j && j.error) || "We could not open this link. Please try again in a minute.");
      }
    })
    .catch(function () { stop(null, "We could not reach the payment page. Check your connection and tap the link again."); });
})();
