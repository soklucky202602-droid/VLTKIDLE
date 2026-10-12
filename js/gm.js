"use strict";
(function(){
  const KEY="jxidle_gm_admv";
  const FIELDS=[
    ["xp","EXP",0.1,100],
    ["gold","Gold",0.1,100],
    ["drop","Drop",0.1,100],
    ["hp","HP quái",0.1,100],
    ["dmg","Damage quái",0,100],
    ["heroDmg","Damage nhân vật",0.1,1000000],
    ["spawn","Spawn",0.1,100],
    ["lucky","May mắn",0,1000],
    ["speed","Game Speed",0.1,100]
  ];
  const FLAGS=[["god","Bất tử"],["infMana","Nội lực vô hạn"],["sandbox","Sandbox"]];
  const DEF={xp:1,gold:1,drop:1,hp:1,dmg:1,heroDmg:1,spawn:1,lucky:0,speed:1,god:0,infMana:0,sandbox:0};
  let panel=null;
  const esc=s=>String(s).replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
  function toast(m){
    try{if(typeof admSay==="function"){admSay(m);return}}catch(e){}
    const t=document.getElementById("toast");if(t){t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1600)}
  }
  function load(){
    try{const o=JSON.parse(localStorage.getItem(KEY)||"null");if(o&&typeof o==="object")Object.keys(DEF).forEach(k=>{if(typeof o[k]==="number"&&Number.isFinite(o[k]))ADMV[k]=o[k]})}catch(e){}
  }
  function save(){
    try{localStorage.setItem(KEY,JSON.stringify(ADMV))}catch(e){}
  }
  function apply(){
    if(!panel)return;
    FIELDS.forEach(([k])=>{const el=panel.querySelector('[data-gm="'+k+'"]');if(el){let v=Number(el.value);if(!Number.isFinite(v))v=DEF[k];ADMV[k]=Math.max(0,v)}});
    FLAGS.forEach(([k])=>{const el=panel.querySelector('[data-gm="'+k+'"]');if(el)ADMV[k]=el.checked?1:0});
    save();
    refresh();
    toast("GM: đã áp dụng ADMV");
  }
  function reset(){Object.keys(DEF).forEach(k=>ADMV[k]=DEF[k]);save();refresh();toast("GM: đã đặt lại mặc định");}
  function refresh(){
    if(!panel)return;
    FIELDS.forEach(([k])=>{const el=panel.querySelector('[data-gm="'+k+'"]');const out=panel.querySelector('[data-gmv="'+k+'"]');if(el)el.value=ADMV[k];if(out)out.textContent=ADMV[k]});
    FLAGS.forEach(([k])=>{const el=panel.querySelector('[data-gm="'+k+'"]');if(el)el.checked=!!ADMV[k]});
    const st=panel.querySelector("[data-gm-status]");if(st)st.textContent="EXP ×"+ADMV.xp+" · Gold ×"+ADMV.gold+" · Drop ×"+ADMV.drop+" · Speed ×"+ADMV.speed;
  }
  function css(){
    if(document.getElementById("gm-style"))return;
    const s=document.createElement("style");s.id="gm-style";s.textContent=`
      #gmBtn{position:fixed;left:10px;top:110px;z-index:99998;border:1px solid #d8b46a;background:linear-gradient(#3b2d18,#17120b);color:#ffe9a6;border-radius:7px;padding:7px 12px;font:700 13px Arial;box-shadow:0 2px 10px #0008;cursor:pointer}
      #gmPanel{position:fixed;left:10px;top:150px;width:300px;max-height:calc(100vh - 170px);overflow:auto;z-index:99999;background:linear-gradient(#17130f,#0c0a08);border:1px solid #8f6d38;border-radius:10px;box-shadow:0 12px 35px #000c;color:#eee;padding:12px;font:13px Arial;display:none}
      #gmPanel.on{display:block}
      #gmPanel h3{margin:0 0 4px;color:#ffd77a;font-size:16px}.gmSub{color:#aaa;font-size:11px;margin-bottom:10px}.gmRow{display:grid;grid-template-columns:105px 1fr 48px;gap:7px;align-items:center;margin:7px 0}.gmRow label{color:#ddd}.gmRow input[type=number]{width:100%;box-sizing:border-box;background:#090807;color:#fff;border:1px solid #5f4b2c;border-radius:5px;padding:5px}.gmVal{color:#ffd77a;text-align:right;font-weight:700}.gmFlag{display:flex;align-items:center;gap:8px;margin:8px 0;color:#ddd}.gmBtns{display:flex;gap:7px;margin-top:11px}.gmBtns button{flex:1;border:1px solid #8f6d38;border-radius:6px;padding:7px;background:#2a2115;color:#ffe9a6;font-weight:700;cursor:pointer}.gmBtns .ok{background:#513b18}.gmStatus{margin-top:9px;padding:7px;border-radius:6px;background:#090807;color:#9fe3a6;font-size:11px;line-height:1.4}
    `;document.head.appendChild(s);
  }
  function build(){
    css();
    const b=document.createElement("button");b.id="gmBtn";b.textContent="GM";b.title="Bảng điều khiển GM";document.body.appendChild(b);
    panel=document.createElement("div");panel.id="gmPanel";
    panel.innerHTML='<h3>GM • ADMV</h3><div class="gmSub">Chỉnh hệ số trực tiếp, không cần sửa code.</div>'+
      FIELDS.map(([k,n,min,max])=>`<div class="gmRow"><label>${esc(n)}</label><input type="number" step="0.1" min="${min}" max="${max}" data-gm="${k}"><span class="gmVal" data-gmv="${k}">1</span></div>`).join("")+\
      FLAGS.map(([k,n])=>`<label class="gmFlag"><input type="checkbox" data-gm="${k}"> ${esc(n)}</label>`).join("")+\
      '<div class="gmBtns"><button class="ok" data-gm-apply>Áp dụng</button><button data-gm-reset>Reset</button></div><div class="gmStatus" data-gm-status></div>';
    document.body.appendChild(panel);
    b.onclick=()=>panel.classList.toggle("on");
    panel.querySelector("[data-gm-apply]").onclick=apply;
    panel.querySelector("[data-gm-reset]").onclick=reset;
    panel.addEventListener("keydown",e=>{if(e.key==="Enter")apply()});
    refresh();
  }
  function init(){
    if(typeof ADMV!=="object")return;
    load();
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",build,{once:true});else build();
    window.addEventListener("keydown",e=>{if(e.key==="F9"){e.preventDefault();if(panel)panel.classList.toggle("on")}});
    window.GM_ADMV={apply,reset,refresh,open:()=>panel&&panel.classList.add("on")};
  }
  init();
})();
