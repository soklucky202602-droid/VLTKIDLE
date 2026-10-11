"use strict";

// Kỳ Trân Các — giao diện/sản phẩm theo mẫu JX người dùng cung cấp.
(() => {
  const $ = (s) => document.querySelector(s);
  const esc0 = (v) => String(v ?? "").replace(/[&<>\"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));

  const css = document.createElement("style");
  css.textContent = `
    #kyTranBtn{position:absolute;right:178px;top:2px;width:58px;height:58px;z-index:9;display:grid;place-items:center;padding:0;border:2px solid #9c7a32;border-radius:50%;background:radial-gradient(circle at 35% 30%,#6f633d 0,#342e1d 42%,#171812 78%);box-shadow:0 0 0 2px #15150f,0 0 8px rgba(0,0,0,.9),inset 0 0 8px rgba(255,214,92,.25);color:#f2e6bd;cursor:pointer;font:700 11px/14px var(--font,Tahoma,Arial,sans-serif);text-align:center;text-shadow:1px 1px 2px #000;box-sizing:border-box}
    #kyTranBtn::before{content:"";position:absolute;inset:3px;border:1px solid #c7a64e;border-radius:50%;opacity:.7;pointer-events:none}.kytran-window{display:grid;grid-template-columns:150px 1fr;gap:10px;min-height:410px}.kytran-side{background:#080b09;border:1px solid #56604c;padding:8px}.kytran-side button{width:100%;border:0;background:transparent;color:#d7d1bd;padding:11px 8px;text-align:left;font:14px Tahoma;cursor:pointer}.kytran-side button.on{background:linear-gradient(90deg,#4b4938,#24261e);color:#ffe99a;box-shadow:inset 0 0 0 1px #665f45}.kytran-main{min-width:0}.kytran-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 7px;padding:7px 10px;border:1px solid #4f5e4c;background:linear-gradient(90deg,#29372f,#111a14);color:#eee1ba}.kytran-head b{color:#ffe27c;white-space:nowrap}.kytran-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;max-height:355px;overflow:auto;padding-right:2px}.kytran-item{min-width:0;min-height:118px;padding:7px;border:1px solid #4d604d;background:linear-gradient(180deg,#29342e,#101712);color:#eee;text-align:left;cursor:pointer}.kytran-item:hover{border-color:#c5a552;filter:brightness(1.08)}.kytran-title{display:flex;align-items:center;gap:7px;min-width:0}.kytran-icon{width:34px;height:34px;flex:0 0 34px;object-fit:contain;background:#151a15;border:1px solid #83733f}.kytran-title b{color:#eee4c7;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kytran-item .price{margin-top:5px;color:#ffe277;font-weight:700;font-size:12px}.kytran-item .desc{margin-top:3px;color:#aeb8ae;font-size:10px;line-height:14px;min-height:28px}.kytran-actions{display:flex;gap:4px;margin-top:6px}.kytran-actions button{flex:1;padding:5px 4px;border:1px solid #8b7a52;background:linear-gradient(#817554,#4a432f);color:#fff0c4;font-weight:700;cursor:pointer}.kytran-actions button.use{background:linear-gradient(#496d3d,#253b20);border-color:#45683a}.kytran-note{margin-top:7px;padding:6px 0;color:#9ca79e;font-size:10px;border-top:1px solid #394239}.kytran-exchange{margin-top:7px;padding:7px;border:1px solid #465446;background:#121a14;color:#bfc8bd;font-size:11px}.kytran-exchange b{color:#ffe27c}.kytran-empty{padding:35px;text-align:center;color:#9ca79e}
    @media(max-width:800px){.kytran-window{grid-template-columns:105px 1fr}.kytran-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.kytran-window{grid-template-columns:1fr}.kytran-side{display:flex;overflow:auto}.kytran-side button{min-width:100px;text-align:center}.kytran-grid{grid-template-columns:1fr}.kytran-head{flex-direction:column;align-items:flex-start}}
  `;
  document.head.appendChild(css);

  const CATS = [
    ["utility", "Tiện ích"],
    ["rare", "Quý hiếm"],
    ["special", "Đặc biệt"],
    ["mount", "Thú cưỡi"],
  ];
  let tab = "utility";

  // Sản phẩm theo đúng tên/giá/mô tả thể hiện trong 3 ảnh mẫu.
  const ITEMS = [
    {cat:"utility",id:"knb_gold",name:"Kim Nguyên Bảo",price:"10 vạn",pay:"gold",cost:100000,desc:"Không giới hạn · hôm nay đổi 0",icon:"ui/v2/money2.png",action:"Mua",buy(){S.gold=(S.gold||0)-this.cost;S.knb=(S.knb||0)+1;toast("Đã mua 1 Kim Nguyên Bảo")}},
    {cat:"utility",id:"tien_thao_lo",name:"Tiên Thảo Lộ",price:"20 KNB",pay:"knb",cost:20,desc:"+50% kinh nghiệm trong 60 phút (cộng dồn)",icon:"ui/v2/pot.png",action:"Mua",buy(){giveStock(this.id);}},
    {cat:"utility",id:"que_hoa_tuu",name:"Quế Hoa Tửu",price:"20 KNB",pay:"knb",cost:20,desc:"+20 may mắn trong 60 phút: độ rơi nhiều",icon:"ui/v2/pot.png",action:"Mua",buy(){giveStock(this.id);}},
    {cat:"utility",id:"lenh_bai_da_tau",name:"Lệnh Bài Dã Tẩu",price:"50 KNB",pay:"knb",cost:50,desc:"Hôm nay 5/5 · có 0",icon:"ui/v2/money2.png",action:"Mua",buy(){giveStock(this.id);}},
    {cat:"utility",id:"exchange",name:"Đổi KNB → Lượng",price:"1 KNB = 8 vạn 0 lượng",pay:"knb",cost:1,desc:"Mua 1 KNB = 8 vạn lượng · đổi lại được 80%",icon:"ui/v2/money2.png",action:"Đổi",buy(){S.gold=(S.gold||0)+80000;toast("Đổi 1 KNB nhận 8 vạn lượng")}},
    {cat:"rare",id:"ruong_huyen_tinh",name:"Rương Huyền Tinh",price:"3 vạn",pay:"gold",cost:30000,desc:"1-2 Đá Tinh Vân Khoáng Thạch, mỗi viên cá",icon:"ui/v2/money2.png",action:"Mua",buy(){giveStock(this.id);}},
    {cat:"rare",id:"ruong_da_thuoc_tinh",name:"Rương Đá Thuộc Tính",price:"5 vạn",pay:"gold",cost:50000,desc:"1-2 đá thuộc tính (hợp hệ / loại đồ đang",icon:"ui/v2/money2.png",action:"Mua",buy(){giveStock(this.id);}},
    {cat:"rare",id:"bi_kip_90",name:"Bí Kíp 90",price:"50 KNB",pay:"knb",cost:50,desc:"Đang có 8",icon:"ui/v2/money2.png",action:"Mua",use:true,buy(){giveStock(this.id);}},
    {cat:"rare",id:"dai_thanh_bi_kip",name:"Đại Thành Bí Kíp",price:"250 KNB",pay:"knb",cost:250,desc:"Đang có 0",icon:"ui/v2/money2.png",action:"Mua",use:true,buy(){giveStock(this.id);}},
    {cat:"rare",id:"vo_lam_mat_tich",name:"Võ Lâm Mật Tịch",price:"100 KNB",pay:"knb",cost:100,desc:"Đã dùng 0/25 · có 0",icon:"ui/v2/money2.png",action:"Mua",use:true,buy(){giveStock(this.id);}},
    {cat:"rare",id:"tay_tuy_kinh",name:"Tẩy Tủy Kinh",price:"100 KNB",pay:"knb",cost:100,desc:"Đã dùng 0/45 · có 0",icon:"ui/v2/money2.png",action:"Mua",use:true,buy(){giveStock(this.id);}},
    {cat:"special",id:"lenh_bai_doi_phai",name:"Lệnh Bài Đổi Phái",price:"200 KNB",pay:"knb",cost:200,desc:"Đang có 0",icon:"ui/v2/money2.png",action:"Mua",use:true,buy(){giveStock(this.id);}},
    {cat:"special",id:"the_doi_gioi_tinh",name:"Thẻ Đổi Giới Tính",price:"100 KNB",pay:"knb",cost:100,desc:"Đang có 0",icon:"ui/v2/money2.png",action:"Mua",use:true,buy(){giveStock(this.id);}},
  ];

  function ensure(){S.knb=Number(S.knb||0);S.kyTranStock=S.kyTranStock||{};}
  function giveStock(id){ensure();S.kyTranStock[id]=(S.kyTranStock[id]||0)+1;toast("Đã mua vật phẩm")}
  function pay(it){ensure();if(it.pay==="knb"){if(S.knb<it.cost){toast("Không đủ Kim Nguyên Bảo");return false}S.knb-=it.cost;return true}if((S.gold||0)<it.cost){toast("Không đủ ngân lượng");return false}S.gold-=it.cost;return true}
  function buy(it){ensure();if(!pay(it))return;it.buy();save();kyTranModal()}
  function use(it){ensure();const n=S.kyTranStock[it.id]||0;if(n<=0){toast("Không có vật phẩm");return}S.kyTranStock[it.id]=n-1;toast(`Đã dùng ${it.name}`);save();kyTranModal()}

  window.kyTranModal=function(){
    if(!S||!S.fac)return;ensure();
    const list=ITEMS.filter(x=>x.cat===tab);
    const body=`<div class="kytran-window"><aside class="kytran-side">${CATS.map(([id,n])=>`<button data-kt-tab="${id}" class="${tab===id?"on":""}">${n}</button>`).join("")}</aside><section class="kytran-main"><div class="kytran-head"><span>🪙 <b>Kim Nguyên Bảo:</b> ${fmt(S.knb)} &nbsp;·&nbsp; <b>Ngân lượng:</b> ${fmt(S.gold||0)}</span></div><div class="kytran-grid">${list.map(it=>`<article class="kytran-item"><div class="kytran-title"><img class="kytran-icon" src="${esc0(it.icon)}"><b>${esc0(it.name)}</b></div><div class="price">Giá: <strong>${esc0(it.price)}</strong></div><div class="desc">${esc0(it.desc)}</div><div class="kytran-actions"><button data-kt-buy="${it.id}">${it.action}</button>${it.use?`<button class="use" data-kt-use="${it.id}">Dùng</button>`:""}${it.id!=="exchange"&&it.id!=="knb_gold"?`<button data-kt-buy="${it.id}" data-multi="10">x10</button>`:""}</div></article>`).join("")||`<div class="kytran-empty">Chưa có sản phẩm.</div>`}</div>${tab==="utility"?`<div class="kytran-exchange">Đang có: 🌿 <b>Tiên Thảo Lộ +50%</b> &nbsp; · &nbsp; Các vật phẩm mua được sẽ lưu trong Kỳ Trân Các.</div>`:`<div class="kytran-note">Rê chuột lên vật phẩm để xem công dụng. Vật phẩm có thể dùng sẽ có nút <b>Dùng</b>.</div>`}</section></div>`;
    modal(`<h3>Kỳ Trân Các</h3>${body}`,()=>{
      document.querySelectorAll("#mBody [data-kt-tab]").forEach(b=>b.onclick=()=>{tab=b.dataset.ktTab;kyTranModal()});
      document.querySelectorAll("#mBody [data-kt-buy]").forEach(b=>b.onclick=()=>{const it=ITEMS.find(x=>x.id===b.dataset.ktBuy);if(!it)return;const times=b.dataset.multi?10:1;for(let i=0;i<times;i++){if(!pay(it))break;it.buy()}save();kyTranModal()});
      document.querySelectorAll("#mBody [data-kt-use]").forEach(b=>b.onclick=()=>{const it=ITEMS.find(x=>x.id===b.dataset.ktUse);if(it)use(it)});
    });
  };

  function mount(){const battle=$("#battle");if(!battle||$("#kyTranBtn"))return;const btn=document.createElement("button");btn.id="kyTranBtn";btn.type="button";btn.title="Mở Kỳ Trân Các";btn.innerHTML="<span>Kỳ Trân<br>Các</span>";btn.onclick=()=>{if(!S||!S.fac)return;if(typeof uiSfx==="function")uiSfx("click");kyTranModal()};battle.appendChild(btn)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
