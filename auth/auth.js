(function(){
  'use strict';
  const C=window.VLTK_AUTH_CONFIG||{};
  const ready=!!(C.url&&C.anonKey);
  let sb=null;
  function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}
  function mount(){
    if(document.getElementById('vltkAuth')) return;
    const el=document.createElement('div');el.id='vltkAuth';
    el.innerHTML=`<div class="vltk-auth-back"></div><section class="vltk-auth-card"><div class="vltk-auth-title">VÕ LÂM IDLE</div><div class="vltk-auth-sub">Tài khoản Võ Lâm</div><div class="vltk-auth-tabs"><button data-mode="login" class="on">Đăng nhập</button><button data-mode="register">Đăng ký</button></div><form id="vltkAuthForm"><label>Tài khoản / Email<input id="vltkEmail" type="email" autocomplete="username" required></label><label>Mật khẩu<input id="vltkPass" type="password" autocomplete="current-password" minlength="6" required></label><label id="vltkConfirmWrap" class="hidden">Nhập lại mật khẩu<input id="vltkConfirm" type="password" autocomplete="new-password" minlength="6"></label><button class="vltk-auth-submit" type="submit">Đăng nhập</button><div id="vltkAuthMsg"></div></form></section>`;
    document.body.appendChild(el);
    let mode='login';
    const tabs=[...el.querySelectorAll('[data-mode]')], form=el.querySelector('#vltkAuthForm'), confirm=el.querySelector('#vltkConfirmWrap'), submit=el.querySelector('.vltk-auth-submit'), msg=el.querySelector('#vltkAuthMsg');
    const setMode=m=>{mode=m;tabs.forEach(x=>x.classList.toggle('on',x.dataset.mode===m));confirm.classList.toggle('hidden',m!=='register');submit.textContent=m==='register'?'Tạo tài khoản':'Đăng nhập';msg.textContent='';};
    tabs.forEach(x=>x.onclick=()=>setMode(x.dataset.mode));
    if(!ready){msg.textContent='Chưa cấu hình máy chủ tài khoản.';submit.disabled=true;return;}
    const load=()=>{if(window.supabase&&window.supabase.createClient)sb=window.supabase.createClient(C.url,C.anonKey);};
    if(window.supabase)load();else{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=load;document.head.appendChild(s);}
    form.onsubmit=async e=>{e.preventDefault();msg.textContent='Đang xử lý...';try{if(!sb)throw Error('Máy chủ chưa sẵn sàng');const email=el.querySelector('#vltkEmail').value.trim().toLowerCase(),password=el.querySelector('#vltkPass').value;if(mode==='register'){if(password!==el.querySelector('#vltkConfirm').value)throw Error('Mật khẩu nhập lại không khớp');const r=await sb.auth.signUp({email,password});if(r.error)throw r.error;msg.textContent=r.data.session?'Đăng ký thành công.':'Đăng ký thành công, hãy kiểm tra email để xác nhận.';}else{const r=await sb.auth.signInWithPassword({email,password});if(r.error)throw r.error;location.reload();}}catch(err){msg.textContent=err.message||'Không thể đăng nhập.';}};
  }
  window.VLTKAuth={mount,enabled:ready};
  document.addEventListener('DOMContentLoaded',()=>mount());
})();
