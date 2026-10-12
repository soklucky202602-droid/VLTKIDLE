"use strict";
(function(){
  const CFG=window.VLTK_AUTH_CONFIG||{};
  const DEFAULT={xp:1,gold:1,drop:1,maintenance:false};
  let client=null,loading=null,overlay=null;
  function clamp(v){const n=Number(v);return Number.isFinite(n)?Math.max(0,n):1}
  function apply(x){
    const s=Object.assign({},DEFAULT,x||{});
    if(typeof ADMV!=='undefined'){
      ADMV.xp=clamp(s.xp);
      ADMV.gold=clamp(s.gold);
      ADMV.drop=clamp(s.drop);
    }
    window.VLTK_ADMV_SETTINGS={xp:clamp(s.xp),gold:clamp(s.gold),drop:clamp(s.drop),maintenance:!!s.maintenance,updatedAt:Date.now()};
    const on=!!s.maintenance;
    if(on&&!overlay){
      overlay=document.createElement('div');
      overlay.id='vltkAdmvMaintenance';
      overlay.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(5,7,6,.96);color:#eadfbf;font:700 20px system-ui;text-align:center;padding:24px';
      overlay.innerHTML='<div><div style="font-size:42px;margin-bottom:14px">⚙</div><div>Máy chủ đang bảo trì</div><small style="display:block;margin-top:10px;color:#aaa;font-weight:400">Vui lòng quay lại sau.</small></div>';
      document.body.appendChild(overlay);
    }
    if(!on&&overlay){overlay.remove();overlay=null}
  }
  async function boot(){
    if(!CFG.url||!CFG.anonKey)return;
    if(!window.supabase){
      if(loading)return loading;
      loading=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=resolve;s.onerror=reject;document.head.appendChild(s)}).catch(()=>{});
      await loading;
    }
    if(!window.supabase)return;
    if(!client)client=window.supabase.createClient(CFG.url,CFG.anonKey,{auth:{persistSession:false}});
    try{const {data,error}=await client.rpc('get_game_settings');if(!error&&data)apply(data)}catch(e){}
  }
  apply(DEFAULT);
  boot();
  setInterval(boot,30000);
  window.VLTKAdmv={refresh:boot,get:()=>window.VLTK_ADMV_SETTINGS||DEFAULT};
})();
