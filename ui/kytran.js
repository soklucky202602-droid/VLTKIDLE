"use strict";

// Kỳ Trân Các — cửa hàng đặc biệt kiểu JX.
// Dùng Phúc Duyên làm tiền tệ, dữ liệu mua hàng được lưu cùng nhân vật.
(() => {
  const $ = (s) => document.querySelector(s);

  const KTT_ITEMS = [
    { id: "fd_gold", name: "Túi Ngân Lượng", desc: "+5.000 lượng", price: 20, buy: () => grant({ gold: 5000 }, "Kỳ Trân Các") },
    { id: "fd_xp", name: "Đan Kinh Nghiệm", desc: "EXP +25% trong 30 phút", price: 30, buy: () => grant({ xpb: 30 }, "Kỳ Trân Các") },
    { id: "fd_pot", name: "Kim Sáng Dược", desc: "20 bình hồi sinh lực", price: 25, buy: () => grant({ pot: { kind: "life", tier: Math.min(5, Math.max(1, Math.floor(S.lvl / 20) + 1)), n: 20 } }, "Kỳ Trân Các") },
    { id: "fd_pts", name: "Tiềm Năng Đơn", desc: "+5 điểm tiềm năng", price: 80, buy: () => grant({ pts: 5 }, "Kỳ Trân Các") },
    { id: "fd_shard", name: "Mảnh Trang Bị", desc: "+1 mảnh trang bị", price: 40, buy: () => grant({ shard: 1 }, "Kỳ Trân Các") },
    { id: "fd_chest", name: "Rương Phúc Duyên", desc: "Đổi 100 Phúc Duyên lấy phần thưởng", price: 100, buy: () => grant({ fd: 120 }, "Kỳ Trân Các") },
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
