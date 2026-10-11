(function(){
  'use strict';
  const C=window.VLTK_AUTH_CONFIG||{};let sb=null,readyResolve;const ready=new Promise(r=>readyResolve=r);
  async function boot(){if(!C.url||!C.anonKey){readyResolve(null);return}if(!window.supabase){const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';await new Promise((r,j)=>{s.onload=r;s.onerror=j});document.head.appendChild(s)}sb=window.supabase.createClient(C.url,C.anonKey);const {data}=await sb.auth.getSession();readyResolve(data.session||null)}
  async function session(){return ready}
  async function slots(){const s=await ready;if(!s)return[];const {data,error}=await sb.from('characters').select('slot,name,save_data,updated_at').order('slot');if(error)throw error;return data||[]}
  async function put(slot,state){const s=await ready;if(!s||!state)return;const {error}=await sb.from('characters').upsert({user_id:s.user.id,slot,name:String(state.name||'Tân thủ').slice(0,16),save_data:state,updated_at:new Date().toISOString()},{onConflict:'user_id,slot'});if(error)throw error}
  async function remove(slot){const s=await ready;if(!s)return;const {error}=await sb.from('characters').delete().eq('user_id',s.user.id).eq('slot',slot);if(error)throw error}
  function wrap(){
    if(typeof window.save==='function'&&!window.__vltkCloudSave){const original=window.save;window.save=function(){const r=original.apply(this,arguments);try{const slot=typeof SLOT==='number'?SLOT:0,state=typeof S!=='undefined'&&S?JSON.parse(JSON.stringify(S)):null;if(state&&state.fac)put(slot,state).catch(()=>{})}catch(e){}return r};window.__vltkCloudSave=true}
    if(typeof window.deleteSlot==='function'&&!window.__vltkCloudDelete){const original=window.deleteSlot;window.deleteSlot=function(i){remove(i).catch(()=>{});return original.apply(this,arguments)};window.__vltkCloudDelete=true}
  }
  window.VLTKCloud={ready,session,slots,put,remove};boot().then(()=>setTimeout(wrap,0)).catch(()=>readyResolve(null));
})();
