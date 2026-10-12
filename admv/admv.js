"use strict";
const cfg=window.VLTK_AUTH_CONFIG||{};
const sb=supabase.createClient(cfg.url,cfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,storageKey:"admv_auth"}});
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>\"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function msg(id,text,bad=false){const el=$(id);if(!el)return;el.textContent=text||"";el.classList.toggle("danger",!!bad)}
const DEFAULT_SETTINGS={xp:1,gold:1,drop:1,hp:1,dmg:1,heroDmg:1,spawn:1,lucky:0,speed:0,god:false,infMana:false,maintenance:false};
const SETTING_ROWS=[
 ["xp","EXP nhận được",[.5,1,2,3,5,10,25,100]],
 ["gold","Vàng rơi",[.5,1,2,5,10,50]],
 ["drop","Tỉ lệ rơi đồ",[.5,1,2,3,5,10]],
 ["hp","Máu quái",[.1,.25,.5,1,2,5,10]],
 ["dmg","Sát thương quái",[0,.25,.5,1,2,5]],
 ["heroDmg","Sát thương của bạn",[.5,1,2,5,10,100,1000000]],
 ["spawn","Số quái mỗi đợt",[.5,1,2,3,5]],
 ["lucky","May mắn cộng thêm",[0,10,25,50,100,200]],
 ["speed","Tốc độ game",[0,.5,1,1.5,2.5,5,10]]
];
const PRESETS=[
 ["Cày nhanh",{xp:10,speed:5,spawn:2}],
 ["Săn đồ",{drop:5,lucky:50,gold:3,spawn:2}],
 ["Đánh trùm",{hp:.5,heroDmg:5,spawn:1}],
 ["Thử tải",{spawn:5,speed:10}],
 ["Đặt lại hệ số",DEFAULT_SETTINGS]
];
const REMOTE_ACTIONS={
 hero:[
  {n:"Đặt cấp",opts:[10,30,50,80,100,120,150,"MAX_LEVEL"]},
  {n:"Cộng điểm tiềm năng",opts:[10,50,200]},
  {n:"Cộng điểm võ công",opts:[5,20,100]},
  {n:"Ngân lượng",opts:[1000000,10000000,100000000,1000000000]},
  {n:"Hồi đầy máu và nội lực"}
 ],
 world:[
  {n:"Nhảy tới ải",opts:[1,10,20,40,60,80,100,"STAGES"]},
  {n:"Tới đợt trùm của ải"},
  {n:"Gọi trùm vùng"},
  {n:"Gọi Trùm Hoàng Kim"},
  {n:"Gọi tinh anh",opts:[5,10,20]},
  {n:"Xoá hết quái trên sân"},
  {n:"Mở toàn bộ vùng"}
 ],
 item:[
  {n:"Phát 10 món đồ ngẫu nhiên (số dòng)",opts:[3,4,5,6]},
  {n:"Một bộ Hoàng Kim đủ ô"},
  {n:"Cường hoá +10 đồ đang mặc"},
  {n:"Nguyên liệu đầy đủ"}
 ],
 act:[
  {n:"Đặt lại lượt công thành, Tống Kim, tháp"},
  {n:"Đặt kỷ lục tháp",opts:[0,10,25,49,50,100]},
  {n:"Lệnh công thành",opts:[100,500,2000]},
  {n:"Tống Kim Lệnh",opts:[100,500,2000]},
  {n:"Phúc Duyên",opts:[50,200,1000]},
  {n:"Buff EXP +25% (phút)",opts:[30,60,180]},
  {n:"Làm xong nhiệm vụ ngày"},
  {n:"Mở lại điểm danh"},
  {n:"Mở khoá tính năng"}
 ]
};
let selectedPlayer=null,playerRows=[],settingsState={...DEFAULT_SETTINGS},bootBusy=false;
function fmt(v){return Number(v||0).toLocaleString("vi-VN")}
function optLabel(k,v){
 if(v==="MAX_LEVEL")return "Cấp tối đa";
 if(v==="STAGES")return "Ải cuối";
 if(k==="heroDmg"&&Number(v)===1000000)return "Một đòn";
 if(k==="speed"&&Number(v)===0)return "Theo chế độ";
 if(k==="lucky")return "+"+v;
 return Number(v)===0?"0":"×"+v;
}
function tab(name){
 document.querySelectorAll(".tabpane").forEach(x=>x.classList.add("hidden"));
 const pane=$("tab-"+name);if(pane)pane.classList.remove("hidden");
 document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));
 if(name==="overview")loadOverview();
 if(name==="players"&&playerRows.length===0)loadPlayers();
 if(name==="multipliers")loadAdmvSettings();
 if(name==="server")loadServerStatus();
 if(name==="codes")loadCodes();
 if(name==="audit")loadAudit();
}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>tab(b.dataset.tab));
document.querySelectorAll("[data-tabgo]").forEach(b=>b.onclick=()=>tab(b.dataset.tabgo));
async function gm(fn,args={}){const {data,error}=await sb.rpc(fn,args);if(error)throw error;return data}
function showLogin(){$("loginView").classList.remove("hidden");$("appView").classList.add("hidden");$("logout").classList.add("hidden")}
async function boot(){
 if(bootBusy)return;bootBusy=true;
 try{
  const {data:{session}}=await sb.auth.getSession();
  if(!session){showLogin();return}
  try{await gm("gm_dashboard")}catch(e){showLogin();msg("loginMsg","Tài khoản chưa được cấp quyền GM.",true);await sb.auth.signOut();return}
  $("loginView").classList.add("hidden");$("appView").classList.remove("hidden");$("logout").classList.remove("hidden");$("gmEmail").textContent=session.user.email||"GM";
  await loadOverview();await loadAdmvSettings();renderRemoteActions();loadPlayers().catch(()=>{});
 }catch(e){showLogin();msg("loginMsg",e.message||"Không thể kết nối Supabase.",true)}
 finally{bootBusy=false}
}
$("loginBtn").onclick=async()=>{msg("loginMsg","");const {error}=await sb.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error){msg("loginMsg",error.message,true);return}await boot()};
$("logout").onclick=async()=>{await sb.auth.signOut();showLogin()};
sb.auth.onAuthStateChange((event,session)=>{if(event==="SIGNED_OUT")showLogin();if(event==="SIGNED_IN"&&session)boot()});
async function loadOverview(){try{const x=await gm("gm_dashboard");$("sOnline").textContent=x.online??0;$("sChars").textContent=x.chars??0;$("sCodes").textContent=x.codes??0;$("sMarket").textContent=x.market??0}catch(e){}}
function selectPlayer(row){
 selectedPlayer=row;
 const label=row?(row.name+" · "+(row.fac||"Chưa rõ phái")+" · Lv "+row.lvl+" · owner "+row.owner):"Chưa chọn người chơi.";
 ["heroTarget","worldTarget","itemTarget","actTarget"].forEach(id=>{if($(id))$(id).textContent=label});
}
async function loadPlayers(){
 const q=$("playerQ").value.trim();
 try{
  const rows=await gm("gm_find_players",{p_q:q});playerRows=rows||[];
  $("playersResult").innerHTML='<table><thead><tr><th>Nhân vật</th><th>Phái</th><th>Lv</th><th>Reborn</th><th>Lực chiến</th><th></th></tr></thead><tbody>'+
   playerRows.map((r,i)=>'<tr><td><b>'+esc(r.name)+'</b></td><td>'+esc(r.fac)+'</td><td>'+r.lvl+'</td><td>'+r.reborn+'</td><td>'+fmt(r.power)+'</td><td><button class="primary selectPlayer" data-player="'+i+'">Chọn</button></td></tr>').join("")+
   '</tbody></table>';
  document.querySelectorAll(".selectPlayer").forEach(b=>b.onclick=()=>{selectPlayer(playerRows[+b.dataset.player]);msg("playersMsg","Đã chọn nhân vật "+selectedPlayer.name)});
  if(!playerRows.length)$("playersResult").textContent="Không tìm thấy nhân vật.";
 }catch(e){$("playersResult").textContent=e.message}
}
$("searchBtn").onclick=loadPlayers;
function actionOptionLabel(group,index,name,v){
 if(group==="hero"&&index===0)return v==="MAX_LEVEL"?"Cấp tối đa":"Cấp "+v;
 if(group==="hero"&&index===1)return "+"+v+" điểm";
 if(group==="hero"&&index===2)return "+"+v+" điểm võ công";
 if(group==="hero"&&index===3)return fmt(v)+" lượng";
 if(group==="world"&&index===0)return v==="STAGES"?"Ải cuối":"Ải "+v;
 if(group==="world"&&index===4)return v+" tinh anh";
 if(group==="item"&&index===0)return v+" dòng";
 if(group==="act"&&index===1)return v+" tầng";
 if(group==="act"&&index===2)return fmt(v)+" lệnh";
 if(group==="act"&&index===3)return fmt(v)+" lệnh";
 if(group==="act"&&index===4)return fmt(v)+" điểm";
 if(group==="act"&&index===5)return v+" phút";
 return String(v);
}
function renderRemoteActions(){
 for(const group of Object.keys(REMOTE_ACTIONS)){
  const actions=REMOTE_ACTIONS[group],dest=$(group+"Actions");if(!dest)continue;
  dest.innerHTML=actions.map((a,i)=>{
   let options="";
   if(a.opts)options='<select class="action-value" data-value-for="'+group+"-"+i+'">'+a.opts.map(v=>{
    const label=actionOptionLabel(group,i,a.n,v);
    return '<option value="'+String(v)+'">'+esc(label)+'</option>';
   }).join("")+'</select>';
   else options='<span class="action-no-value">Không cần giá trị</span>';
   return '<div class="action-row"><div class="action-name">'+esc(a.n)+'</div>'+options+'<button class="primary" data-run-group="'+group+'" data-run-index="'+i+'">Gửi lệnh</button></div>';
  }).join("");
 }
 document.querySelectorAll("[data-run-group]").forEach(b=>b.onclick=()=>sendRemoteAction(b.dataset.runGroup,+b.dataset.runIndex,b));
 selectPlayer(selectedPlayer);
}
async function sendRemoteAction(group,index,button){
 if(!selectedPlayer){msg(group+"Msg","Hãy vào tab Người chơi và bấm Chọn trước.",true);return}
 const action=REMOTE_ACTIONS[group][index];let value;
 const select=document.querySelector('[data-value-for="'+group+"-"+index+'"]');
 if(select)value=select.value;
 const payload={index};if(value!==undefined)payload.value=(value==="MAX_LEVEL"||value==="STAGES")?value:Number(value);
 button.disabled=true;
 try{
  await gm("gm_queue_action",{p_owner:selectedPlayer.owner,p_target_name:selectedPlayer.name,p_action:group,p_payload:payload});
  msg(group+"Msg",'Đã xếp lệnh "'+action.n+'" cho '+selectedPlayer.name+'. Game của nhân vật sẽ tự thực hiện khi đang mở đúng nhân vật.');
 }catch(e){msg(group+"Msg",e.message,true)}
 finally{button.disabled=false}
}
function settingsMarkup(){
 const rows=SETTING_ROWS.map(([key,label,opts])=>{
  const options=opts.map(v=>'<option value="'+v+'" '+(Number(settingsState[key])===v?"selected":"")+'>'+optLabel(key,v)+'</option>').join("");
  return '<label class="setting-row"><span>'+label+'</span><select data-setting="'+key+'">'+options+'</select></label>';
 }).join("");
 return '<div class="setting-grid">'+rows+'</div><div class="flags"><label><input type="checkbox" data-flag="god" '+(settingsState.god?"checked":"")+'> Bất tử (không mất máu)</label><label><input type="checkbox" data-flag="infMana" '+(settingsState.infMana?"checked":"")+'> Nội lực vô hạn</label><label><input type="checkbox" data-flag="maintenance" '+(settingsState.maintenance?"checked":"")+'> Bật bảo trì</label></div><div class="preset-row">'+PRESETS.map((p,i)=>'<button class="ghost" data-preset="'+i+'">'+p[0]+'</button>').join("")+'</div>';
}
async function loadAdmvSettings(){
 try{settingsState={...DEFAULT_SETTINGS,...(await gm("gm_get_admv_settings")||{})};$("admvSettingsForm").innerHTML=settingsMarkup();bindSettingControls();msg("admvSettingsMsg","")}
 catch(e){msg("admvSettingsMsg",e.message,true)}
}
function bindSettingControls(){
 document.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>{
  const currentMaintenance=!!document.querySelector('[data-flag="maintenance"]')?.checked;
  const p=PRESETS[+b.dataset.preset][1];
  settingsState={...DEFAULT_SETTINGS,...p,maintenance:currentMaintenance};
  $("admvSettingsForm").innerHTML=settingsMarkup();bindSettingControls();
  msg("admvSettingsMsg","Đã chọn bộ: "+PRESETS[+b.dataset.preset][0]+" — bấm Lưu hệ số để áp dụng.");
 });
 $("saveAdmvSettings").onclick=saveAdmvSettings;
 $("resetAdmvSettings").onclick=()=>{const maintenance=!!document.querySelector('[data-flag="maintenance"]')?.checked;settingsState={...DEFAULT_SETTINGS,maintenance};$("admvSettingsForm").innerHTML=settingsMarkup();bindSettingControls();msg("admvSettingsMsg","Đã đặt hệ số mặc định. Bấm Lưu hệ số để áp dụng.")};
}
async function saveAdmvSettings(){
 const out={};
 document.querySelectorAll("[data-setting]").forEach(el=>out[el.dataset.setting]=Number(el.value));
 document.querySelectorAll("[data-flag]").forEach(el=>out[el.dataset.flag]=el.checked);
 const b=$("saveAdmvSettings");b.disabled=true;
 try{settingsState={...DEFAULT_SETTINGS,...(await gm("gm_set_admv_settings",{p_settings:out})||out)};msg("admvSettingsMsg","Đã lưu. Hệ số sẽ áp dụng trong game trong tối đa 5 giây.");$("admvSettingsForm").innerHTML=settingsMarkup();bindSettingControls();await loadServerStatus()}
 catch(e){msg("admvSettingsMsg",e.message,true)}
 finally{b.disabled=false}
}
async function loadServerStatus(){
 try{
  const s=await gm("gm_get_admv_settings");
  const rows=[["EXP nhận được","×"+s.xp],["Vàng rơi","×"+s.gold],["Tỉ lệ rơi đồ","×"+s.drop],["Máu quái","×"+s.hp],["Sát thương quái","×"+s.dmg],["Sát thương của bạn",s.heroDmg>=1000000?"Một đòn":"×"+s.heroDmg],["Số quái mỗi đợt","×"+s.spawn],["May mắn cộng thêm","+"+s.lucky],["Tốc độ game",s.speed===0?"Theo chế độ":"×"+s.speed],["Bất tử",s.god?"BẬT":"TẮT"],["Nội lực vô hạn",s.infMana?"BẬT":"TẮT"],["Bảo trì",s.maintenance?"ĐANG BẬT":"Tắt"]];
  $("serverStatus").innerHTML="<table><tbody>"+rows.map(r=>"<tr><th>"+esc(r[0])+"</th><td>"+esc(r[1])+"</td></tr>").join("")+"</tbody></table>";
 }catch(e){$("serverStatus").textContent=e.message}
}
$("sendReward").onclick=async()=>{try{let item=null;const raw=$("rewardItem").value.trim();if(raw)item=JSON.parse(raw);await gm("gm_send_mail",{p_to_name:$("rewardTo").value.trim(),p_gold:+$("rewardGold").value||0,p_knb:+$("rewardKnb").value||0,p_item:item,p_note:$("rewardNote").value.trim()||"Quà GM"});msg("rewardMsg","Đã gửi thư.")}catch(e){msg("rewardMsg",e.message,true)}};
$("announceBtn").onclick=async()=>{try{await gm("gm_broadcast",{p_message:$("announceText").value.trim()});$("announceText").value="";msg("announceMsg","Đã phát thông báo.")}catch(e){msg("announceMsg",e.message,true)}};
$("createCode").onclick=async()=>{try{let p=JSON.parse($("codePayload").value||"{}");const iso=$("expires").value?new Date($("expires").value).toISOString():null;await gm("gm_create_code",{p_code:$("code").value.trim().toUpperCase(),p_payload:p,p_max_uses:+$("maxUses").value||1,p_expires_at:iso});msg("codeMsg","Đã tạo gift code.");loadCodes()}catch(e){msg("codeMsg",e.message,true)}};
async function loadCodes(){try{const rows=await gm("gm_list_codes");$("codesResult").innerHTML='<table><thead><tr><th>Code</th><th>Uses</th><th>Max</th><th>Enabled</th><th>Hết hạn</th></tr></thead><tbody>'+rows.map(r=>'<tr><td><b>'+esc(r.code)+'</b></td><td>'+r.uses+'</td><td>'+r.max_uses+'</td><td>'+(r.enabled?"ON":"OFF")+'</td><td>'+(r.expires_at?new Date(r.expires_at).toLocaleString():"—")+'</td></tr>').join("")+'</tbody></table>'}catch(e){$("codesResult").textContent=e.message}}
async function loadAudit(){try{const rows=await gm("gm_audit");$("auditResult").innerHTML='<table><thead><tr><th>Thời gian</th><th>GM</th><th>Action</th><th>Chi tiết</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+new Date(r.created_at).toLocaleString()+'</td><td>'+esc(r.gm_email)+'</td><td>'+esc(r.action)+'</td><td><code>'+esc(JSON.stringify(r.details))+'</code></td></tr>').join("")+'</tbody></table>'}catch(e){$("auditResult").textContent=e.message}}
boot();
