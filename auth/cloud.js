(function(){
  'use strict';
  const C=window.VLTK_AUTH_CONFIG||{};
  let sb=null, readyResolve;
  const ready=new Promise(r=>readyResolve=r);
  function client(){return sb}
  async function boot(){
    if(!C.url||!C.anonKey){readyResolve(null);return}
    if(!window.supabase){const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';await new Promise((r,j)=>{s.onload=r;s.onerror=j});document.head.appendChild(s)}
    sb=window.supabase.createClient(C.url,C.anonKey);
    const {data}=await sb.auth.getSession();
    readyResolve(data.session||null);
  }
  async function session(){return ready}
  async function slots(){
    const s=await ready;if(!s)return[];
    const {data,error}=await sb.from('characters').select('slot,name,save_data,updated_at').order('slot');
    if(error)throw error;return data||[];
  }
  async function put(slot,state){
    const s=await ready;if(!s||!state)return;
    const {error}=await sb.from('characters').upsert({user_id:s.user.id,slot,name:String(state.name||'Tân thủ').slice(0,16),save_data:state,updated_at:new Date().toISOString()},{onConflict:'user_id,slot'});
    if(error)throw error;
  }
  async function remove(slot){const s=await ready;if(!s)return;const {error}=await sb.from('characters').delete().eq('user_id',s.user.id).eq('slot',slot);if(error)throw error}
  function wrapSave(){
    if(typeof window.save!=='function')return;
    const original=window.save;
    window.save=function(){const r=original.apply(this,arguments);try{const slot=typeof SLOT==='number'?SLOT:0;const state=typeof S!=='undefined'&&S?JSON.parse(JSON.stringify(S)):null;if(state&&state.fac)put(slot,state).catch(()=>{});}catch(e){}return r};
  }
  window.VLTKCloud={ready,session,client,slots,put,remove,wrapSave};
  boot().then(()=>setTimeout(wrapSave,0)).catch(()=>readyResolve(null));
})();
