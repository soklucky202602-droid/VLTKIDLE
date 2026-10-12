"use strict";
(function(){
  const MAX_LEVEL=20, STABLE_MAX=40;
  const needExp=level=>40+Math.max(0,level|0)*35;
  const isHorse=it=>!!it&&Number(it.d)===10;
  const state=()=>typeof S!=="undefined"&&S&&S.fac?S:null;
  const horse=()=>{const s=state();return s&&s.eq&&isHorse(s.eq.horse)?s.eq.horse:null};
  const riding=()=>{const s=state(),h=horse();return !!(s&&s.horseRiding&&h&&typeof reqOk==="function"&&reqOk(h))};
  const speedMultiplier=it=>!riding()||it!==horse()?1:1.10+Math.min(MAX_LEVEL,Math.max(0,it.hlv|0))*.01;
  function init(){
    const s=state();if(!s)return;
    if(!Array.isArray(s.horseStable))s.horseStable=[];
    s.horseStable=s.horseStable.filter(isHorse).slice(0,STABLE_MAX);
    if(!s.eq||typeof s.eq!=="object")s.eq={};
    if(!Array.isArray(s.inv))s.inv=[];
    if(!Number.isFinite(+s.gold))s.gold=0;
    const h=horse();
    if(!h||typeof reqOk!=="function"||!reqOk(h))s.horseRiding=false;
    if(h){h.hlv=Math.max(0,Math.min(MAX_LEVEL,h.hlv|0));h.hxp=Math.max(0,h.hxp|0)}
  }
  function toggleRide(){
    const s=state(),h=horse();if(!s)return;
    if(!h){toast("Hãy trang bị ngựa ở ô Ngựa trước.");return}
    if(!reqOk(h)){toast("Chưa đủ điều kiện cưỡi ngựa này.");return}
    s.horseRiding=!s.horseRiding;
    if(typeof recalc==="function")recalc();
    if(typeof save==="function")save();
    if(typeof toast==="function")toast(s.horseRiding?"Đã lên ngựa":"Đã xuống ngựa");
    refreshHorseUI();if(typeof updateTop==="function")updateTop();
  }
  function gainExp(e){
    const h=horse(),s=state();if(!s||!h||!riding())return;
    const add=e&&(e.goldBoss||e.cls==="boss")?10:e&&e.cls==="elite"?3:1;
    h.hlv=Math.max(0,h.hlv|0);h.hxp=Math.max(0,h.hxp|0)+add;
    let levels=0;
    while(h.hlv<MAX_LEVEL&&h.hxp>=needExp(h.hlv)){h.hxp-=needExp(h.hlv);h.hlv++;levels++}
    if(h.hlv>=MAX_LEVEL)h.hxp=0;
    if(levels){
      if(typeof toast==="function")toast("Ngựa lên "+(h.hlv+1)+" cấp! Chỉ số ngựa tăng.");
      if(typeof log==="function")log('<span class="up">Ngựa '+esc(h.n)+' tăng lên cấp '+(h.hlv+1)+'!</span>');
      if(typeof recalc==="function")recalc();
      if(typeof save==="function")save();
    }
  }
  function feed(){
    const s=state(),h=horse();if(!s||!h)return;
    if(!riding()){if(typeof toast==="function")toast("Hãy lên ngựa trước khi cho ăn.");return}
    if((h.hlv|0)>=MAX_LEVEL){toast("Ngựa đã đạt cấp tối đa.");return}
    const cost=2000+Math.max(0,h.hlv|0)*1000;
    if((s.gold|0)<cost){toast("Không đủ ngân lượng để cho ngựa ăn.");return}
    s.gold-=cost;h.hxp=(h.hxp|0)+25;
    let levels=0;
    while(h.hlv<MAX_LEVEL&&h.hxp>=needExp(h.hlv)){h.hxp-=needExp(h.hlv);h.hlv++;levels++}
    if(h.hlv>=MAX_LEVEL)h.hxp=0;
    if(levels&&typeof recalc==="function")recalc();
    save();toast(levels?"Ngựa lên "+(h.hlv+1)+" cấp!":"Đã cho ngựa ăn: +25 kinh nghiệm.");
    refreshHorseUI();if(typeof updateTop==="function")updateTop();
  }
  function store(uid){
    const s=state();if(!s)return;
    if(!Array.isArray(s.horseStable))s.horseStable=[];
    if(s.horseStable.length>=STABLE_MAX){toast("Mã Trường đã đầy.");return}
    const it=(s.inv||[]).find(x=>x&&String(x.uid)===String(uid));
    if(!isHorse(it)){toast("Không tìm thấy ngựa trong hành trang.");return}
    if(it.locked||it.lock){toast("Ngựa đang khóa, hãy mở khóa trước.");return}
    s.inv.splice(s.inv.indexOf(it),1);s.horseStable.push(it);
    if(typeof invDirty!=="undefined")invDirty=true;
    save();refreshHorseUI();toast("Đã cất "+it.n+" vào Mã Trường.");
  }
  function retrieve(uid){
    const s=state();if(!s)return;
    if(!Array.isArray(s.inv))s.inv=[];
    if(s.inv.length>=INV_MAX){toast("Hành trang đầy.");return}
    if(!Array.isArray(s.horseStable))s.horseStable=[];
    const i=s.horseStable.findIndex(x=>x&&String(x.uid)===String(uid));
    if(i<0){toast("Không tìm thấy ngựa trong Mã Trường.");return}
    const it=s.horseStable.splice(i,1)[0];s.inv.unshift(it);
    if(typeof invDirty!=="undefined")invDirty=true;
    save();refreshHorseUI();toast("Đã đưa "+it.n+" về hành trang.");
  }
  function horseHTML(){
    const s=state();if(!s)return '<p class="dim">Chưa có nhân vật.</p>';
    init();
    const h=horse(),inv=(s.inv||[]).filter(isHorse),stable=s.horseStable||[];
    let hHtml='<p class="dim small">Chưa có ngựa đang trang bị.</p>';
    if(h){
      const lvl=Math.min(MAX_LEVEL,h.hlv|0),xp=Math.max(0,h.hxp|0),need=needExp(lvl);
      hHtml='<div class="horse-detail"><b>'+esc(h.n)+'</b><div class="dim small">Cấp ngựa '+(lvl+1)+' / '+(MAX_LEVEL+1)+' · yêu cầu nhân vật cấp '+(h.lvl||1)+'</div><div class="horse-xp"><i style="width:'+Math.min(100,xp/need*100)+'%"></i></div><small class="dim">'+xp+' / '+need+' EXP · +4% chỉ số mỗi cấp</small></div>';
    }
    const invHtml=inv.length?inv.map(it=>'<div class="horse-row"><span><b>'+esc(it.n)+'</b><small class="dim">Cấp yêu cầu '+(it.lvl||1)+'</small></span><button class="btn sm" data-hstable="'+esc(it.uid)+'">Cất</button></div>').join(""):'<small class="dim">Không có ngựa trong hành trang.</small>';
    const stableHtml=stable.length?stable.map(it=>'<div class="horse-row"><span><b>'+esc(it.n)+'</b><small class="dim">Cấp yêu cầu '+(it.lvl||1)+' · cấp ngựa '+((it.hlv|0)+1)+'</small></span><button class="btn sm" data-hretrieve="'+esc(it.uid)+'">Lấy ra</button></div>').join(""):'<small class="dim">Mã Trường đang trống.</small>';
    return '<section class="card horse-system" id="horseSystemCard"><h3>🐎 Hệ thống ngựa <small>'+stable.length+'/'+STABLE_MAX+' ô Mã Trường</small></h3>'+hHtml+'<div class="btnrow"><button class="btn" id="horseRideToggle" '+(!h||!reqOk(h)?'disabled':'')+'>'+(riding()?'Xuống ngựa':'Lên ngựa')+'</button><button class="btn" id="horseFeed" '+(!riding()||((h&&h.hlv|0)>=MAX_LEVEL)?'disabled':'')+'>Cho ăn (+25 EXP)</button></div><p class="dim small">Khi cưỡi: tăng tốc độ di chuyển. Ngựa nhận EXP khi hạ quái (thường +1, tinh anh +3, trùm +10).</p><h4>Ngựa trong hành trang</h4>'+invHtml+'<h4>Mã Trường</h4>'+stableHtml+'</section>';
  }
  function bindHorse(root){
    if(!root)return;
    const ride=root.querySelector("#horseRideToggle"),feedBtn=root.querySelector("#horseFeed");
    if(ride)ride.onclick=toggleRide;if(feedBtn)feedBtn.onclick=feed;
    root.querySelectorAll("[data-hstable]").forEach(b=>b.onclick=()=>store(b.dataset.hstable));
    root.querySelectorAll("[data-hretrieve]").forEach(b=>b.onclick=()=>retrieve(b.dataset.hretrieve));
  }
  function renderCard(){
    const root=document.querySelector("#t-char");if(!root)return;
    const old=root.querySelector("#horseSystemCard");if(old)old.remove();
    root.insertAdjacentHTML("beforeend",horseHTML());bindHorse(root);
  }
  function renderGift(){
    const root=document.querySelector("#mBody");if(!root)return;
    root.innerHTML='<h3>Phần thưởng <small>🐎 Ngựa</small></h3><div class="horse-gift-head"><button class="btn sm" id="horseGiftBack">← Quay lại Quà</button></div>'+horseHTML();
    bindHorse(root);
    const back=root.querySelector("#horseGiftBack");
    if(back)back.onclick=()=>{if(typeof window.giftModal==="function")window.giftModal()};
  }
  function refreshHorseUI(){
    const modalBody=document.querySelector("#mBody");
    if(modalBody&&modalBody.querySelector("#horseSystemCard")){renderGift();return}
  }
  function patchGift(){
    if(typeof window.giftModal!=="function"||window.__horseGiftPatched)return;
    const original=window.giftModal;
    window.giftModal=function(){
      original.apply(this,arguments);
      const tabs=document.querySelector("#giftTabs");
      if(!tabs||tabs.querySelector('[data-g="horse"]'))return;
      const b=document.createElement("button");b.type="button";b.dataset.g="horse";b.textContent="Ngựa";
      tabs.appendChild(b);
      b.onclick=()=>{tabs.querySelectorAll("button").forEach(x=>x.classList.remove("on"));b.classList.add("on");renderGift()};
    };
    window.__horseGiftPatched=true;
  }
  window.HorseSystem={isHorse,horse,isRiding:riding,speedMultiplier,onKill:gainExp,toggle:toggleRide,render:renderCard,renderGift,init};
  document.addEventListener("DOMContentLoaded",()=>{
    init();
    patchGift();
    if(typeof window.giftModal==="function")setTimeout(patchGift,0);
  },{once:true});
})();