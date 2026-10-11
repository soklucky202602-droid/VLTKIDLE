(function(){
  'use strict';
  const C=window.VLTK_AUTH_CONFIG||{}; const ready=!!(C.url&&C.anonKey); let sb=null;
  function mount(){
    if(document.getElementById('vltkAuth'))return;
    const el=document.createElement('div');el.id='vltkAuth';
    el.innerHTML=`
      <div class="vltk-auth-back"></div>
      <section class="vltk-auth-card">
        <div class="vltk-auth-logo" aria-hidden="true">⚔</div>
        <div class="vltk-auth-title">VÕ LÂM TRUYỀN KỲ</div>
        <div class="vltk-auth-sub">Kiếm Hiệp Tình Duyên · Phiên Bản Web</div>
        <div class="vltk-auth-tabs">
          <button data-mode="login" class="on"><span>⚿</span> ĐĂNG NHẬP</button>
          <button data-mode="register"><span>▤</span> ĐĂNG KÝ</button>
          <button data-mode="device"><span>📱</span> CHUYỂN THIẾT BỊ</button>
        </div>
        <div class="vltk-auth-note" id="vltkAuthNote">Nhập tên tài khoản và mật khẩu để tiếp tục hành tẩu giang hồ trên thiết bị này.</div>
        <form id="vltkAuthForm">
          <label>Tên tài khoản<input id="vltkEmail" type="email" autocomplete="username" placeholder="Nhập tên tài khoản..." required></label>
          <label>Mật khẩu<input id="vltkPass" type="password" autocomplete="current-password" placeholder="Nhập mật khẩu..." minlength="6" required></label>
          <label id="vltkConfirmWrap" class="hidden">Nhập lại mật khẩu<input id="vltkConfirm" type="password" autocomplete="new-password" placeholder="Nhập lại mật khẩu..." minlength="6"></label>
          <label class="vltk-check"><input id="vltkRemember" type="checkbox" checked> <span>Ghi nhớ đăng nhập trên máy này</span></label>
          <button class="vltk-auth-submit" type="submit"><span>⚿</span> ĐĂNG NHẬP VÀO GAME</button>
          <button class="vltk-guest" type="button" id="vltkGuest">🎭 &nbsp; Chơi Nhanh (Khách)</button>
          <div id="vltkAuthMsg"></div>
        </form>
        <div class="vltk-auth-links">Chưa có tài khoản? <button type="button" id="vltkRegLink">Đăng ký tài khoản mới</button><span> · </span><button type="button" id="vltkDeviceLink">Chuyển từ điện thoại/PC khác</button></div>
      </section>`;
    document.body.appendChild(el);
    let mode='login';
    const tabs=[...el.querySelectorAll('[data-mode]')],form=el.querySelector('#vltkAuthForm'),confirm=el.querySelector('#vltkConfirmWrap'),submit=el.querySelector('.vltk-auth-submit'),msg=el.querySelector('#vltkAuthMsg'),note=el.querySelector('#vltkAuthNote');
    function setMode(m){
      mode=m;tabs.forEach(x=>x.classList.toggle('on',x.dataset.mode===m));
      confirm.classList.toggle('hidden',m!=='register');
      form.classList.toggle('hidden',m==='device');
      submit.innerHTML=m==='register'?'<span>▤</span> TẠO TÀI KHOẢN':'<span>⚿</span> ĐĂNG NHẬP VÀO GAME';
      note.textContent=m==='register'?'Tạo tài khoản mới để lưu nhân vật và đồng bộ dữ liệu online.':m==='device'?'Nhập mã chuyển thiết bị để khôi phục tài khoản và nhân vật từ máy khác.':'Nhập tên tài khoản và mật khẩu để tiếp tục hành tẩu giang hồ trên thiết bị này.';
      msg.textContent='';
      if(m==='device'){
        note.insertAdjacentHTML('afterend','<div class="vltk-device-box"><b>Chuyển thiết bị</b><p>Tính năng khôi phục bằng mã sẽ dùng tài khoản online hiện tại. Hãy đăng nhập tài khoản trên thiết bị mới để đồng bộ nhân vật.</p><button type="button" id="vltkBackLogin">← Quay lại đăng nhập</button></div>');
        el.querySelector('#vltkBackLogin').onclick=()=>{const b=el.querySelector('.vltk-device-box');if(b)b.remove();setMode('login')};
      } else {const b=el.querySelector('.vltk-device-box');if(b)b.remove()}
    }
    tabs.forEach(x=>x.onclick=()=>setMode(x.dataset.mode));
    el.querySelector('#vltkRegLink').onclick=()=>setMode('register');
    el.querySelector('#vltkDeviceLink').onclick=()=>setMode('device');
    el.querySelector('#vltkGuest').onclick=()=>el.remove();
    if(!ready){msg.textContent='Chưa cấu hình máy chủ tài khoản.';submit.disabled=true;return}
    form.onsubmit=async e=>{e.preventDefault();if(mode==='device')return;msg.textContent='Đang xử lý...';submit.disabled=true;try{if(!sb)throw Error('Máy chủ chưa sẵn sàng');const email=el.querySelector('#vltkEmail').value.trim().toLowerCase(),password=el.querySelector('#vltkPass').value;if(mode==='register'){if(password!==el.querySelector('#vltkConfirm').value)throw Error('Mật khẩu nhập lại không khớp');const r=await sb.auth.signUp({email,password});if(r.error)throw r.error;msg.textContent=r.data.session?'Đăng ký thành công.':'Đăng ký thành công, hãy kiểm tra email để xác nhận.';if(r.data.session)location.reload()}else{const r=await sb.auth.signInWithPassword({email,password});if(r.error)throw r.error;location.reload()}}catch(err){msg.textContent=err.message||'Không thể đăng nhập.'}finally{submit.disabled=false}};
  }
  async function boot(){
    if(!ready){mount();return}
    try{
      if(!window.supabase){
        const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        await new Promise((r,j)=>{s.onload=r;s.onerror=j});document.head.appendChild(s)
      }
      sb=window.supabase.createClient(C.url,C.anonKey);
      const {data}=await sb.auth.getSession();
      window.VLTKAuth={mount,enabled:true,client:()=>sb,session:data.session||null};
      if(!data.session)mount();
      sb.auth.onAuthStateChange((_e,session)=>{window.VLTKAuth.session=session||null;if(session){const x=document.getElementById('vltkAuth');if(x)x.remove()}})
    }catch(e){mount()}
  }
  window.VLTKAuth={mount,enabled:ready,session:null};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
