"use strict";
(function(){
  // Temporary mount visual: use the horse item artwork only as a small
  // underlay so it never covers the normal character sprite.
  function install(){
    if(window.__horseMountRenderInstalled)return true;
    if(typeof window.drawDoll!=="function")return false;
    const original=window.drawDoll;
    window.drawDoll=function(c,x,y,act,dir,t,scale,alpha,spec){
      const s=typeof S!=="undefined"&&S;
      const horse=s&&s.eq&&s.eq.horse;
      const riding=!!(s&&s.horseRiding&&horse&&typeof reqOk==="function"&&reqOk(horse));
      if(riding&&horse&&horse.ic){
        const im=new Image();
        im.src=horse.ic;
        if(im.complete&&im.naturalWidth&&im.naturalHeight){
          const targetW=46*scale/.6;
          const k=targetW/im.naturalWidth;
          const w=im.naturalWidth*k;
          const h=im.naturalHeight*k;
          // Horse artwork is cropped to its lower portion and kept behind
          // the normal doll sprite. This prevents the item icon from becoming
          // a giant duplicate character on the battlefield.
          const srcY=im.naturalHeight*0.48;
          const srcH=im.naturalHeight-srcY;
          const drawH=srcH*k;
          c.save();
          c.globalAlpha=alpha==null?1:alpha;
          c.translate(x,y+8*scale);
          if(dir>3)c.scale(-1,1);
          c.drawImage(im,0,srcY,im.naturalWidth,srcH,-w*.5,-drawH*.72,w,drawH);
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
