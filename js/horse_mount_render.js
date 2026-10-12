"use strict";
(function(){
  function install(){
    if(window.__horseMountRenderInstalled)return true;
    if(typeof window.drawDoll!=="function")return false;
    const original=window.drawDoll;
    window.drawDoll=function(c,x,y,act,dir,t,scale,alpha,spec){
      const s=typeof S!=="undefined"&&S;
      const h=s&&s.eq&&s.eq.horse;
      const riding=!!(s&&s.horseRiding&&h&&typeof reqOk==="function"&&reqOk(h));
      if(riding&&h&&h.ic){
        const im=new Image();
        im.src=h.ic;
        if(im.complete&&im.naturalWidth){
          const targetW=78*scale/.6;
          const k=targetW/im.naturalWidth;
          const w=im.naturalWidth*k,hgt=im.naturalHeight*k;
          c.save();
          c.globalAlpha=alpha==null?1:alpha;
          c.translate(x,y+8*scale);
          if(dir>3)c.scale(-1,1);
          c.drawImage(im,-w*.5,-hgt*.82,w,hgt);
          c.restore();
        }
      }
      return original.apply(this,arguments);
    };
    window.__horseMountRenderInstalled=true;
    return true;
  }
  document.addEventListener("DOMContentLoaded",function(){
    if(install())return;
    let n=0;
    const timer=setInterval(function(){if(install()||++n>30)clearInterval(timer)},100);
  },{once:true});
})();
