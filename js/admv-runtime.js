"use strict";
(function(){
  const CFG=window.VLTK_AUTH_CONFIG||{};
  const DEFAULT={xp:1,gold:1,drop:1,hp:1,dmg:1,heroDmg:1,spawn:1,lucky:1,speed:1,god:false,infMana:false,maintenance:false};
  let client=null,loading=null,overlay=null,commandBusy=false;
  const NUM_KEYS=["xp","gold","drop","hp","dmg","heroDmg","spawn","lucky","speed"];
  function clamp(v,fallback=1){const n=Number(v);return Number.isFinite(n)?Math.max(0,n):fallback}
  async function ensureClient(){
    if(!CFG.url||!CFG.anonKey)return null;
    if(!window.supabase){
      if(!loading)loading=new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";s.onload=resolve;s.onerror=reject;document.head.appendChild(s)}).catch(()=>{});
      await loading;
    }
    if(!window.supabase)return null;
    try{const shared=window.VLTKAuth&&typeof window.VLTKAuth.client==="function"?window.VLTKAuth.client():null;if(shared)return shared}catch(e){}
    if(!client)client=window.supabase.createClient(CFG.url,CFG.anonKey,{auth:{persistSession:true,autoRefreshToken:true}});
    return client;
  }
  function apply(raw){
    const source=raw&&raw.admv&&Object.keys(raw.admv).length?Object.assign({},raw,raw.admv):raw||{};
    const s=Object.assign({},DEFAULT,source);
    if(typeof ADMV!=="undefined"){
      for(const k of NUM_KEYS)ADMV[k]=clamp(s[k],DEFAULT[k]);
      ADMV.god=s.god?1:0;ADMV.infMana=s.infMana?1:0;
    }
    window.VLTK_ADMV_SETTINGS={};for(const k of Object.keys(DEFAULT))window.VLTK_ADMV_SETTINGS[k]=s[k];window.VLTK_ADMV_SETTINGS.updatedAt=Date.now();
    const on=!!s.maintenance;
    if(on&&!overlay){
      overlay=document.createElement("div");overlay.id="vltkAdmvMaintenance";
      overlay.style.cssText="position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(5,7,6,.96);color:#eadfbf;font:700 20px system-ui;text-align:center;padding:24px";
      overlay.innerHTML="<div><div style='font-size:42px;margin-bottom:14px'>⚙</div><div>Máy chủ đang bảo trì</div><small style='display:block;margin-top:10px;color:#aaa;font-weight:400'>Vui lòng quay lại sau.</small></div>";
      document.body.appendChild(overlay);
    }
    if(!on&&overlay){overlay.remove();overlay=null}
  }
  async function runCommands(){
    if(commandBusy||typeof S==="undefined"||!S||!S.fac||typeof ADM_ACT==="undefined")return;
    const sb=await ensureClient();if(!sb)return;
    let session;try{session=(await sb.auth.getSession()).data.session}catch(e){return}if(!session)return;
    commandBusy=true;
    try{
      const {data:commands,error}=await sb.rpc("get_game_commands");if(error||!Array.isArray(commands))return;
      for(const cmd of commands){
        if(String(cmd.target_name||"").toLowerCase()!==String(S.name||"").toLowerCase())continue;
        const group=ADM_ACT[cmd.action],index=Number(cmd.payload&&cmd.payload.index),action=group&&group[index];
        if(!action||typeof action.fn!=="function"){await sb.rpc("ack_game_command",{p_id:cmd.id,p_result:"Lệnh không hợp lệ"});continue}
        try{
          const value=cmd.payload?cmd.payload.value:undefined;
          const result=action.fn(value);
          if(typeof recalc==="function")recalc();
          if(typeof R!=="undefined"&&R)R.dirty=true;
          if(typeof invDirty!=="undefined")invDirty=true;
          if(typeof save==="function")save();
          if(typeof renderAll==="function")renderAll();
          if(typeof toast==="function")toast("GM: "+action.n+" — "+(result||"đã áp dụng"));
          await sb.rpc("ack_game_command",{p_id:cmd.id,p_result:"Đã áp dụng: "+action.n+" — "+String(result||"xong")});
        }catch(e){await sb.rpc("ack_game_command",{p_id:cmd.id,p_result:"Lỗi: "+String(e&&e.message||e).slice(0,180)})}
      }
    }finally{commandBusy=false}
  }
  async function boot(){
    const sb=await ensureClient();if(!sb)return;
    try{const {data,error}=await sb.rpc("get_game_settings");if(!error&&data)apply(data)}catch(e){}
    await runCommands();
  }
  apply(DEFAULT);
  boot();
  setInterval(boot,5000);
  window.VLTKAdmv={refresh:boot,get:()=>window.VLTK_ADMV_SETTINGS||DEFAULT};
})();