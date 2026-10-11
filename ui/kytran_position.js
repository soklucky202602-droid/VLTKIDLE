"use strict";
(() => {
  function align() {
    const btn = document.querySelector("#kyTranBtn");
    const host = document.querySelector("#jxR");
    if (!btn || !host || btn.parentElement === host) return;
    host.insertBefore(btn, host.firstChild);
    btn.classList.add("rbtn", "kytran-rbtn");
  }

  const css = document.createElement("style");
  css.textContent = `
    #jxR .kytran-rbtn{
      position:relative!important;
      right:auto!important;
      top:auto!important;
      width:40px!important;
      height:40px!important;
      min-width:40px!important;
      margin:0!important;
      border-radius:50%!important;
      border:1px solid #d1aa4f!important;
      background:radial-gradient(circle at 35% 30%,#5b4b29 0,#211b11 72%)!important;
      box-shadow:0 0 0 1px #15150f,0 2px 6px #000b,inset 0 0 8px #f1ce6130!important;
      color:#f3dfa0!important;
      font-size:10px!important;
      line-height:12px!important;
      text-align:center!important;
      display:grid!important;
      place-items:center!important;
      z-index:4!important;
    }
    #jxR .kytran-rbtn::before{inset:3px!important;border-color:#c9a952!important}
    #jxR .kytran-rbtn:hover{filter:brightness(1.12)}
  `;
  document.head.appendChild(css);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", align, { once: true });
  } else {
    align();
  }
})();
