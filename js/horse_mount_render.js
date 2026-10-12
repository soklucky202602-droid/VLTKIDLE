"use strict";
(function(){
  const JX_BASE="https://cdn.jsdelivr.net/gh/soklucky202602-droid/VLTKIDLE2@main/";
  const JX_IMG=JX_BASE+"img/jx/";
  let m0=null,loading=false,installed=false;
  const cache=Object.create(null);
  const Ai={"头部":0,"发型":1,"肩膀":4,"躯体":5,"左手":6,"右手":7,"左手武器":8,"右手武器":9,"马前":12,"马中":13,"马后":14};
  const Vc={"头部":"helm","发型":"helm","肩膀":"armor","躯体":"armor","左手":"armor","右手":"armor","左手武器":"weapon","右手武器":"weapon","马前":"horse","马中":"horse","马后":"horse"};
  const Up=Object.fromEntries(Object.entries(Ai).map(([s,A])=>[A,s]));
  const Uc={"Bôn Tiêu":6,"Phiên Vũ":7,"Phi Vân":1,"Xích Long Câu":9,"Tuyệt Địa":0,"Du Huy":4,"Đằng Vụ":8,"Siêu Quang":10,"Kim Tinh Hổ Vương":10,"Hỏa Tinh Kim Hổ Vương":13,"Kim Tinh Bạch Hổ Vương":11,"Long Tinh Hắc Hổ Vương":3,"Hãn Huyết Long Câu":15,"Phong Vân Bạch Mã":11,"Phong Vân Chiến Mã":2,"Phong Vân Thần Mã":10,"Sư tử":10,"Lạc đà":9,"Dương Đà":0,"Hươu đốm":9,"Dương Sa":7,"Ngự Phong":8,"Truy điện":4,"Lưu Tinh":1};
  const Wp={"Ô Vân Đạp Tuyết":5,"Xích Thố":0,"Tuyệt Ảnh":9,"Tuyệt ảnh":9,"Đích Lô":2,"Chiếu Dạ Ngọc Sư Tử":1};
  const Zp={st:120,run:85};
  function loadJX(){if(m0||loading)return;if(window.JXLOOK){m0=window.JXLOOK;return}loading=true;const s=document.createElement("script");s.src=JX_BASE+"jxlook.js";s.onload=()=>{m0=window.JXLOOK||null;loading=false};s.onerror=()=>{loading=false};document.head.appendChild(s)}
  function image(src){if(!cache[src]){const im=new Image();im.src=src;cache[src]=im}return cache[src]}
  function sprite(sheetName){
    const base=JX_IMG+sheetName;
    const key=base;
    if(!cache[key]){
      const im=new Image();
      im._jxTried=0;
      im.onerror=function(){
        if(this._jxTried===0){this._jxTried=1;this.src=base+".png";}
        else if(this._jxTried===1){this._jxTried=2;this.src=base+".jpg";}
      };
      im.src=base+".webp";
      cache[key]=im;
    }
    return cache[key];
  }
  function D5(A){if(!A)return-1;if(Number.isInteger(A.p))return A.p;try{const list=typeof S!=="undefined"&&S.items&&S.items[A.d]&&S.items[A.d].list,n=list&&list.find(x=>x.k===A.k&&x.lvl===(A.lvl||1));return n&&Number.isInteger(n.p)?n.p:-1}catch{return-1}}
  function Ha(kind,A){if(!m0||!m0.res||!m0.res[kind])return-1;const e=A&&D5(A)>=0?D5(A)+2:1,a=m0.res[kind][e]??m0.res[kind][1];return a==null?-1:a-2}
  function horseIdx(A){if(!A)return-1;const exact=Ha("horse",A);if(exact>=0)return exact;const n=String(A.n||"").replace(/\s+\d+$/i,"");if(Uc[n]!=null)return Uc[n];if(Wp[n]!=null)return Wp[n];const r=m0&&m0.res&&m0.res.horse;if(r)for(const k in r)if(r[k]>=2)return r[k]-2;return 0}
  function Yc(sx,part,dir,frame){const a=m0&&m0.sort&&m0.sort[sx];if(!a)return[];const i=a[part]||{},r=a.DEFAULT||{};for(const d in i)if(d[0]==="L"&&i[d][0]===frame)return i[d].slice(1);return(i["Dir"+(dir+1)]||r["Dir"+(dir+1)]||r.Dir1||[]).slice(1)}
  function b5(sx,A){return A.startsWith("m:")?"m/"+A.slice(2):sx+"/"+A}
  function mountedLook(S2){if(!m0||!S2||!S2.eq)return null;const sx=S2.sex?"f":"m",q=S2.eq,weapon=q.weapon,rows={helm:Ha("helm",q.helm),armor:Ha("armor",q.armor),weapon:Ha(weapon&&weapon.d===1?"range":"melee",weapon),horse:horseIdx(q.horse)};rows.weapon=rows.weapon<0?0:rows.weapon;const wn=(m0.wnames&&m0.wnames[sx]||[])[rows.weapon]||"空手",assoc=m0.assoc&&m0.assoc[sx]&&m0.assoc[sx][wn];if(rows.horse<0||!assoc)return null;return{sx,rows,asc:assoc[1]||assoc[0]||{}}}
  function ct(ctx,S2,act,dir,t,x,y,scale,alpha){const look=mountedLook(S2);if(!look)return 0;const g=act==="at"&&look.asc.mg&&!!(S2.eq.weapon&&S2.eq.weapon.d!==1),f=look.asc[g?"mg":act]||look.asc.st;if(!f)return 0;const tabs=m0.tabs&&m0.tabs[look.sx];if(!tabs)return 0;
    const order=Yc(look.sx,f,dir%8*2,0);
    const have=new Set(order);
    for(const z of [12,13,14])if(!have.has(z))order.push(z);
    const parts=[];let pivot=null;
    for(const z0 of order){const part=Up[z0];if(!part)continue;const row=look.rows[Vc[part]];if(row<0)continue;const cell=((tabs[part]||{})[row]||{})[f];if(!cell)continue;const sheetName=b5(look.sx,cell),meta=m0.sheets&&m0.sheets[sheetName];if(!meta)continue;const im=sprite(sheetName);if(!im.complete||!im.naturalWidth)continue;parts.push([im,meta,part]);if(part==="躯体"||!pivot)pivot=meta}
    if(!pivot||!parts.length)return 0;
    const P=pivot[4]||1;let frame;if(act==="st"||act==="run")frame=Math.floor(t*1e3/(Zp[act]||110))%P;else{const dur=(act==="at"||act==="hurt"||act==="die")?.4:.2;frame=Math.min(P-1,Math.floor((t/Math.max(.1,dur))*P))}
    const foot=m0.foot||[0,0],ax=foot[0],ay=foot[1];let top=0;ctx.save();ctx.globalAlpha=alpha==null?1:alpha;for(const[im,z0]of parts){const[w,h,ax0,ay0,cols,rows]=z0,col=Math.min(cols-1,Math.floor(frame*cols/P)),row=rows>=8?dir%8:Math.floor(dir%8*rows/8);ctx.drawImage(im,col*w,row*h,w,h,x+(ax0-ax)*scale,y+(ay0-ay)*scale,w*scale,h*scale);top=Math.max(top,(ay-ay0)*scale)}ctx.restore();return top||1}
  function riding(S2){return!!(S2&&S2.horseRiding&&S2.eq&&S2.eq.horse&&typeof reqOk==="function"&&reqOk(S2.eq.horse))}
  function install(){if(installed)return true;if(typeof window.drawDoll!=="function")return false;const original=window.drawDoll;window.drawDoll=function(c,x,y,act,dir,t,scale,alpha,spec){const s=typeof S!=="undefined"?S:null;if(s&&riding(s)){loadJX();const h=ct(c,s,act,dir,t,x,y,scale,alpha);if(h)return h}return original.apply(this,arguments)};installed=true;return true}
  function boot(){loadJX();if(install())return;let n=0;const tm=setInterval(()=>{if(install()||++n>50)clearInterval(tm)},100)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();