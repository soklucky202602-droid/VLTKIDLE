"use strict";
(() => {
  const $ = s => document.querySelector(s);
  let installed = false;
  let sortMode = "new";
  let filterOpen = false;

  const escI = v => String(v ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  function sortItems(items) {
    const a = items.slice();
    if (sortMode === "level") return a.sort((x,y)=>(y.lvl||0)-(x.lvl||0));
    if (sortMode === "rarity") return a.sort((x,y)=>(y.r||0)-(x.r||0));
    if (sortMode === "name") return a.sort((x,y)=>String(x.n).localeCompare(String(y.n),"vi"));
    return a;
  }

  function closeInventory() {
    const o = $("#invjxOverlay");
    if (o) o.remove();
    if (typeof jxClosePanel === "function") jxClosePanel();
  }

  function updateFilter(f, rerender) {
    try { save(); } catch(e) {}
    if (rerender) renderInventory();
  }

  function renderFilter(f) {
    const rar = typeof RAR_VI !== "undefined" ? RAR_VI : ["Thường","Ma pháp","Tím","Hoàng kim"];
    const groups = typeof LOOT_ATTR_GROUPS !== "undefined" ? LOOT_ATTR_GROUPS : [];
    const series = typeof SERIES !== "undefined" ? SERIES : [];
    return `<div class="invjx-filter ${filterOpen ? "on" : ""}">
      <div class="invjx-filter-head"><b>Bộ lọc nhặt</b><span>Áp dụng cho tự nhặt, đồ rơi và bán đồ</span></div>
      <div class="invjx-filter-row"><input id="invjxKw" maxlength="20" placeholder="Lọc theo tên (không cần dấu)…" value="${escI(f.kw||"")}"><select id="invjxRar">${rar.map((n,i)=>`<option value="${i}" ${f.minRar===i?"selected":""}>Từ ${escI(n)}</option>`).join("")}</select><select id="invjxLvl">${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${f.minLvl===i+1?"selected":""}>Cấp ${i+1}+</option>`).join("")}</select></div>
      <label class="invjx-auto"><input id="invjxAuto" type="checkbox" ${f.auto?"checked":""}> Tự nhặt theo bộ lọc khi hết quái</label>
      ${groups.length?`<div class="invjx-label">Nhóm thuộc tính</div><div class="invjx-chips">${groups.map(([n],i)=>`<label><input type="checkbox" data-if-g="${i}" ${f.groups&&f.groups.includes(i)?"checked":""}>${escI(n)}</label>`).join("")}</div>`:""}
      ${series.length?`<div class="invjx-label">Hệ</div><div class="invjx-chips">${series.map((n,i)=>`<label><input type="checkbox" data-if-s="${i}" ${f.series&&f.series.includes(i)?"checked":""}>${escI(n)}</label>`).join("")}</div>`:""}
    </div>`;
  }

  function renderInventory() {
    if (typeof S === "undefined" || !S || !S.fac || !Array.isArray(S.inv)) return;
    const app = $("#app");
    if (!app) return;
    let f;
    try { f = lootFilter(); } catch(e) { f = {kw:"",minRar:0,minLvl:1,groups:[],series:[],auto:false}; }
    f.groups = Array.isArray(f.groups) ? f.groups : [];
    f.series = Array.isArray(f.series) ? f.series : [];

    const old = $("#invjxOverlay");
    if (old) old.remove();

    const overlay = document.createElement("div");
    overlay.id = "invjxOverlay";
    overlay.innerHTML = `<section class="invjx-window" role="dialog" aria-label="Vật phẩm">
      <header class="invjx-title"><span>Vật phẩm</span><button id="invjxClose" aria-label="Đóng">×</button></header>
      <div class="invjx-top"><b>${S.inv.length}/${typeof INV_MAX!=="undefined"?INV_MAX:70}</b><button id="invjxExpand" class="invjx-gold">Mở rộng</button><select id="invjxSort"><option value="new">Mới nhất</option><option value="level">Cấp cao</option><option value="rarity">Phẩm chất</option><option value="name">Tên A-Z</option></select></div>
      <div class="invjx-grid-wrap"><div class="invjx-grid" id="invjxGrid"></div></div>
      <div class="invjx-money"><div><span>Ng. lượng</span><b>${typeof fmt==="function"?fmt(S.gold||0):Math.round(S.gold||0)}</b></div><div><span>Phúc Duyên</span><b>${fmt(S.phucDuyen||S.phuc||0)}</b></div></div>
      <div class="invjx-actions">
        <button data-act="best">Mặc đồ tốt</button><button data-act="tidy">Dọn kho</button>
        <button data-act="stash">Kho chung</button><button data-act="forge">Kho Rèn (${typeof S.inv!=="undefined"?Math.max(0,120-S.inv.length):120})</button>
        <button data-act="sell" class="danger">Bán đồ (${S.inv.filter(i=>typeof lootMatch==="function"?!lootMatch(i):false).length})</button><button id="invjxFilterBtn" data-act="filter">Bộ lọc nhặt</button>
        <button data-act="code">Mã trường (${Math.max(0,10)})</button><button data-act="kytran">Kỳ Trân Các</button>
        <button data-act="priority" class="wide">Ưu tiên mặc đồ: ⚖ &nbsp;Cân bằng</button>
      </div>
      ${renderFilter(f)}
      <div class="invjx-hint">Chạm vào vật phẩm để xem thông tin, trang bị, bán, gửi kho hoặc khóa.</div>
    </section>`;
    app.appendChild(overlay);

    const grid = $("#invjxGrid");
    const items = sortItems(S.inv);
    grid.innerHTML = items.map(it => typeof itemCell === "function" ? itemCell(it) : `<button class="it r${it.r||0}" data-uid="${it.uid}"><img src="${escI(it.ic||"")}"><i>${it.lvl||1}</i></button>`).join("");

    $("#invjxClose").onclick = closeInventory;
    $("#invjxSort").value = sortMode;
    $("#invjxSort").onchange = e => { sortMode=e.target.value; renderInventory(); };
    $("#invjxExpand").onclick = () => { filterOpen=!filterOpen; renderInventory(); };

    overlay.querySelectorAll(".it[data-uid]").forEach(b => b.onclick = () => {
      const it = typeof findItem === "function" ? findItem(b.dataset.uid) : null;
      if (it && typeof itemModal === "function") itemModal(it);
    });

    overlay.querySelectorAll("[data-act]").forEach(b => b.onclick = () => {
      const a=b.dataset.act;
      if(a==="best"){
        const n=typeof autoEquipAll==="function"?autoEquipAll(true):0;
        if(typeof recalc==="function")recalc();
        toast(n?`Đã thay ${n} món tốt hơn`:"Đồ đang mặc đã là tốt nhất trong hành trang");
        save(); renderInventory();
      } else if(a==="tidy"){
        const n=typeof sweepJunk==="function"?sweepJunk():0;
        toast(n?`Đã dọn ${n} món rác`:"Không có đồ rác cần dọn");
        save(); renderInventory();
      } else if(a==="stash" || a==="forge"){
        if(typeof stashModal==="function") stashModal(); else toast("Kho chưa sẵn sàng");
      } else if(a==="sell"){
        const r=typeof sellUnmatched==="function"?sellUnmatched():{n:0};
        toast(`Đã bán ${r.n||0} món không khớp bộ lọc`); save(); renderInventory();
      } else if(a==="filter"){
        filterOpen=true; renderInventory();
      } else if(a==="code"){
        toast("Mã trường: dữ liệu mã vật phẩm hiện có trong hệ thống");
      } else if(a==="kytran"){
        closeInventory(); if(typeof kyTranModal==="function")kyTranModal();
      } else if(a==="priority"){
        const n=typeof autoEquipAll==="function"?autoEquipAll(true):0;
        toast(n?`Ưu tiên cân bằng: thay ${n} món`:"Trang bị hiện tại đã cân bằng"); save(); renderInventory();
      }
    });

    $("#invjxKw").oninput = e => { f.kw=e.target.value; updateFilter(f,false); };
    $("#invjxRar").onchange = e => { f.minRar=+e.target.value; updateFilter(f,true); };
    $("#invjxLvl").onchange = e => { f.minLvl=+e.target.value; updateFilter(f,true); };
    $("#invjxAuto").onchange = e => { f.auto=e.target.checked; updateFilter(f,true); };
    overlay.querySelectorAll("[data-if-g]").forEach(x=>x.onchange=()=>{const n=+x.dataset.ifG;f.groups=x.checked?[...new Set(f.groups.concat(n))]:f.groups.filter(v=>v!==n);updateFilter(f,true)});
    overlay.querySelectorAll("[data-if-s]").forEach(x=>x.onchange=()=>{const n=+x.dataset.ifS;f.series=x.checked?[...new Set(f.series.concat(n))]:f.series.filter(v=>v!==n);updateFilter(f,true)});
  }

  function install() {
    if (installed || typeof window.renderInv !== "function") return;
    installed = true;
    const original = window.renderInv;
    const wrapped = function(){
      const r = original.apply(this, arguments);
      try { renderInventory(); } catch(e) { console.error("inventory_jx", e); }
      return r;
    };
    wrapped.__inventoryJx = true;
    window.renderInv = wrapped;
  }

  function wait(){
    if (typeof window.renderInv === "function") install();
    else setTimeout(wait, 80);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wait, {once:true}); else wait();
})();
