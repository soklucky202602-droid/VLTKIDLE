"use strict";

// Kỳ Trân Các — cửa hàng đặc biệt kiểu JX.
// Dùng Phúc Duyên làm tiền tệ, dữ liệu mua hàng được lưu cùng nhân vật.
(() => {
  const $ = (s) => document.querySelector(s);

  const css = document.createElement("style");
  css.textContent = `
    #kyTranBtn{
      position:absolute;right:178px;top:2px;width:58px;height:58px;z-index:9;
      display:grid;place-items:center;padding:0;border:2px solid #9c7a32;border-radius:50%;
      background:radial-gradient(circle at 35% 30%,#6f633d 0,#342e1d 42%,#171812 78%);
      box-shadow:0 0 0 2px #15150f,0 0 8px rgba(0,0,0,.9),inset 0 0 8px rgba(255,214,92,.25);
      color:#f2e6bd;cursor:pointer;font:700 11px/14px var(--font,Tahoma,Arial,sans-serif);
      text-align:center;text-shadow:1px 1px 2px #000;box-sizing:border-box;
    }
    #kyTranBtn::before{content:"";position:absolute;inset:3px;border:1px solid #c7a64e;border-radius:50%;opacity:.7;pointer-events:none}
    #kyTranBtn:hover{filter:brightness(1.2);color:#fff1a5}
    #kyTranBtn:active{transform:scale(.96)}
    .kytran-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:0 0 8px;padding:7px 10px;border:1px solid #5e6e45;background:linear-gradient(90deg,rgba(41,58,35,.9),rgba(13,24,16,.9));color:#ffe9a0}
    .kytran-head b{color:#fff0a8;white-space:nowrap}
    .kytran-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
    .kytran-item{display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:7px;min-height:58px;padding:5px 8px;border:1px solid #34583d;background:linear-gradient(180deg,rgba(28,54,37,.92),rgba(10,22,15,.95));color:#fff;cursor:pointer;text-align:left}
    .kytran-item:hover{border-color:#c9a64d;background:linear-gradient(180deg,rgba(55,70,39,.96),rgba(19,30,18,.98))}
    .kytran-icon{width:30px;height:30px;display:grid;place-items:center;border:1px solid #9c7a32;border-radius:50%;color:#ffd95a;background:#201c12;font-size:17px}
    .kytran-info{min-width:0;display:grid;gap:2px}.kytran-info b{color:#ffeaa0;font-size:12px}.kytran-info small{color:#9fc0a8;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .kytran-item em{font-style:normal;color:#ffe38b;font-weight:700;font-size:11px;white-space:nowrap}
    @media(max-width:700px){#kyTranBtn{right:72px;top:2px;transform:scale(.9)}.kytran-grid{grid-template-columns:1fr}.kytran-item{grid-template-columns:32px 1fr auto}}
  `;
  document.head.appendChild(css);

  const KTT_ITEMS = [
    { id: "fd_gold", name: "Túi Ngân Lượng", desc: "+5.000 lượng", price: 20, buy: () => grant({ gold: 5000 }, "Kỳ Trân Các") },
    { id: "fd_xp", name: "Đan Kinh Nghiệm", desc: "EXP +25% trong 30 phút", price: 30, buy: () => grant({ xpb: 30 }, "Kỳ Trân Các") },
    { id: "fd_pot", name: "Kim Sáng Dược", desc: "20 bình hồi sinh lực", price: 25, buy: () => grant({ pot: { kind: "life", tier: Math.min(5, Math.max(1, Math.floor(S.lvl / 20) + 1)), n: 20 } }, "Kỳ Trân Các") },
    { id: "fd_pts", name: "Tiềm Năng Đơn", desc: "+5 điểm tiềm năng", price: 80, buy: () => grant({ pts: 5 }, "Kỳ Trân Các") },
    { id: "fd_shard", name: "Mảnh Trang Bị", desc: "+1 mảnh trang bị", price: 40, buy: () => grant({ shard: 1 }, "Kỳ Trân Các") },
  ];

  function buy(item) {
    const r = RW();
    if ((r.fd || 0) < item.price) {
      toast("Không đủ Phúc Duyên");
      return;
    }
    r.fd -= item.price;
    item.buy();
    save();
    kyTranModal();
  }

  window.kyTranModal = function () {
    if (!S || !S.fac) return;
    const r = RW();
    const body = `
      <div class="kytran-head">
        <span>Kỳ Trân Các</span>
        <b>💠 ${fmt(r.fd || 0)} Phúc Duyên</b>
      </div>
      <p class="desc">Cửa hàng đặc biệt — dùng Phúc Duyên để đổi vật phẩm hữu ích.</p>
      <div class="kytran-grid">
        ${KTT_ITEMS.map((it) => `
          <button class="kytran-item" data-ktt="${it.id}">
            <span class="kytran-icon">✦</span>
            <span class="kytran-info"><b>${esc(it.name)}</b><small>${esc(it.desc)}</small></span>
            <em>💠 ${fmt(it.price)}</em>
          </button>
        `).join("")}
      </div>`;

    modal(`<h3>Kỳ Trân Các <small>${fmt(r.fd || 0)} Phúc Duyên</small></h3>${body}`, () => {
      document.querySelectorAll("#mBody [data-ktt]").forEach((b) => {
        b.onclick = () => {
          const item = KTT_ITEMS.find((x) => x.id === b.dataset.ktt);
          if (item) buy(item);
        };
      });
    });
  };

  function mount() {
    const battle = $("#battle");
    if (!battle || $("#kyTranBtn")) return;
    const btn = document.createElement("button");
    btn.id = "kyTranBtn";
    btn.type = "button";
    btn.title = "Mở Kỳ Trân Các";
    btn.innerHTML = "<span>Kỳ Trân<br>Các</span>";
    btn.onclick = () => {
      if (!S || !S.fac) return;
      if (typeof uiSfx === "function") uiSfx("click");
      kyTranModal();
    };
    battle.appendChild(btn);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
