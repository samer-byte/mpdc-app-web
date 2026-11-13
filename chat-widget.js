/* More Parties DC chat bubble for web pages (Juice 2026-11-12: "the text chat bubble on the website").
   One file, no dependencies, no keys. Add to any of our pages:
     <script src="https://app.morepartiesdc.com/chat-widget.js" defer></script>
   It first asks the "table-chat" server function whether chat is switched on (app_contact.chat_on_web,
   backend/67_app_chat.sql). If it is off, or the function cannot be reached, nothing is shown at all.
   Messages go to the same function, which talks to the booking assistant. Nothing is stored in the browser
   except the conversation id, for this tab only. */
(function () {
  'use strict';
  if (window.__mpdcChat) return;
  window.__mpdcChat = true;
  var FN = 'https://coekikwjxjkgkxecnokg.supabase.co/functions/v1/table-chat';
  var HELLO = 'Hi, this is the More Parties DC virtual booking assistant. Ask about a night, or tell me which night you want a table for.';
  var OFFLINE = 'That did not send. Try again, or call the table line at (771) 213-6543.';
  var KEY = 'mpdc_chat_id';

  function call(body) {
    return fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); });
  }
  function saved() { try { return window.sessionStorage.getItem(KEY); } catch (e) { return null; } }
  function save(id) { try { window.sessionStorage.setItem(KEY, id); } catch (e) { /* private mode: keep it in memory only */ } }

  function build() {
    var host = document.createElement('div');
    host.setAttribute('data-mpdc-chat', '');
    var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    var css = document.createElement('style');
    css.textContent = [
      ':host{all:initial}',
      '*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}',
      '.fab{position:fixed;right:16px;bottom:16px;z-index:2147483000;background:#E5243B;color:#F5F3F2;border:0;border-radius:999px;padding:13px 18px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.45)}',
      '.fab:focus-visible,.send:focus-visible,.x:focus-visible,textarea:focus-visible{outline:2px solid #F5F3F2;outline-offset:2px}',
      '.panel{position:fixed;right:16px;bottom:16px;z-index:2147483001;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100vh - 32px));height:min(560px,calc(100dvh - 32px));background:#0A0A0B;color:#F5F3F2;border:1px solid #2E2E33;border-radius:14px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.6)}',
      '.panel[hidden]{display:none}',
      '.head{display:flex;align-items:flex-start;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #2E2E33}',
      '.t{font-size:12px;letter-spacing:.08em;font-weight:700;color:#FF5A67}',
      '.s{font-size:11.5px;color:#9B9BA3;margin-top:3px;line-height:1.35}',
      '.x{background:none;border:0;color:#9B9BA3;font-size:20px;line-height:1;cursor:pointer;padding:2px 6px}',
      '.log{flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:8px}',
      '.m{max-width:84%;padding:9px 12px;border-radius:12px;font-size:15px;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere}',
      '.them{align-self:flex-start;background:#141416;border:1px solid #2E2E33}',
      '.me{align-self:flex-end;background:#E5243B}',
      '.note{align-self:center;color:#FF5A67;font-size:12px;text-align:center}',
      '.typing{color:#9B9BA3;font-size:12px}',
      '.m a{color:inherit}',
      '.bar{display:flex;gap:8px;align-items:flex-end;padding:10px;border-top:1px solid #2E2E33}',
      'textarea{flex:1;resize:none;max-height:110px;background:#141416;color:#F5F3F2;border:1px solid #2E2E33;border-radius:12px;padding:10px 12px;font-size:16px;line-height:1.3}',
      '.send{background:#E5243B;color:#F5F3F2;border:0;border-radius:12px;padding:11px 15px;font-size:15px;font-weight:700;cursor:pointer}',
      '.send[disabled]{background:#1C1C1F;cursor:default}',
      '@media (prefers-reduced-motion:no-preference){.panel{animation:up .18s ease-out}@keyframes up{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}}'
    ].join('');
    root.appendChild(css);

    function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    var fab = el('button', 'fab', 'Chat');
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Chat with the More Parties DC booking assistant');
    var panel = el('div', 'panel');
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with the More Parties DC booking assistant');
    var head = el('div', 'head');
    var titles = el('div');
    titles.appendChild(el('div', 't', 'MORE PARTIES DC · BOOKING ASSISTANT'));
    titles.appendChild(el('div', 's', 'Automated. It can check tables and book one. It never asks for a card number here.'));
    var x = el('button', 'x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close chat');
    head.appendChild(titles); head.appendChild(x);
    var log = el('div', 'log');
    log.setAttribute('aria-live', 'polite');
    var bar = el('div', 'bar');
    var box = el('textarea');
    box.rows = 1; box.maxLength = 600; box.placeholder = 'Type a message';
    box.setAttribute('aria-label', 'Message to the booking assistant');
    var send = el('button', 'send', 'Send');
    send.type = 'button';
    bar.appendChild(box); bar.appendChild(send);
    panel.appendChild(head); panel.appendChild(log); panel.appendChild(bar);
    root.appendChild(fab); root.appendChild(panel);
    document.body.appendChild(host);

    var chatId = saved(), busy = false, greeted = false;

    // Text only, never HTML: a reply is shown exactly as written, with web links made tappable.
    function say(kind, text) {
      var m = el('div', kind === 'note' ? 'note' : 'm ' + kind);
      String(text).split(/(https?:\/\/[^\s]+)/g).forEach(function (p) {
        if (!/^https?:\/\//.test(p)) { if (p) m.appendChild(document.createTextNode(p)); return; }
        var url = p.replace(/[.,;:!?)]+$/, '');
        var a = el('a', null, url);
        a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        m.appendChild(a);
        if (p.length > url.length) m.appendChild(document.createTextNode(p.slice(url.length)));
      });
      log.appendChild(m);
      log.scrollTop = log.scrollHeight;
      return m;
    }
    function open() {
      panel.hidden = false; fab.hidden = true;
      if (!greeted) { greeted = true; say('them', HELLO); }
      box.focus();
    }
    function close() { panel.hidden = true; fab.hidden = false; fab.focus(); }
    function submit() {
      var t = box.value.trim();
      if (!t || busy) return;
      box.value = ''; busy = true; send.disabled = true;
      say('me', t);
      var typing = el('div', 'typing', 'Typing…');
      log.appendChild(typing); log.scrollTop = log.scrollHeight;
      call({ text: t, chat_id: chatId }).then(function (d) {
        if (d && d.chat_id) { chatId = d.chat_id; save(chatId); }
        if (d && d.ok && d.replies && d.replies.length) d.replies.forEach(function (r) { say('them', r); });
        else say('note', (d && d.message) || OFFLINE);
      }).catch(function () { say('note', OFFLINE); }).then(function () {
        if (typing.parentNode) typing.parentNode.removeChild(typing);
        busy = false; send.disabled = false; box.focus();
      });
    }
    fab.addEventListener('click', open);
    x.addEventListener('click', close);
    send.addEventListener('click', submit);
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
      if (e.key === 'Escape') close();
    });
  }

  function start() {
    call({ probe: true }).then(function (d) { if (d && d.on === true) build(); }).catch(function () { /* off or unreachable: show nothing */ });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
