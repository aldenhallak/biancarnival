(function(){
  'use strict';

  // CURSOR
  const cur=document.getElementById('cursor');
  let mx=0,my=0;
  const isFine=matchMedia('(pointer:fine)').matches;
  if(isFine){
    document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;gsap.set(cur,{x:mx,y:my})});
  }

  // ENTRANCE — staggered
  const tl=gsap.timeline({defaults:{ease:'power3.out'}});
  // Title chars
  gsap.set('.ch',{opacity:0,y:20});
  tl.to('.ch',{opacity:1,y:0,stagger:.03,duration:.5,delay:.2});
  tl.to('.subtitle',{opacity:.5,duration:.5},'-=.2');
  // Big faces drop in
  const bigFaces=gsap.utils.toArray('.big-face');
  bigFaces.forEach((f,i)=>{
    gsap.set(f,{opacity:0,y:-60,scale:.6});
    tl.to(f,{opacity:1,y:0,scale:1,duration:.5,ease:'back.out(1.6)'},0.15+i*.08);
  });
  // Boxes pop in from random directions
  const boxes=gsap.utils.toArray('.box');
  boxes.forEach((b,i)=>{
    const angle=Math.random()*Math.PI*2;
    const dist=80+Math.random()*60;
    gsap.set(b,{opacity:0,x:Math.cos(angle)*dist,y:Math.sin(angle)*dist,scale:.7});
    tl.to(b,{opacity:1,x:0,y:0,scale:1,duration:.6,ease:'back.out(1.4)'},0.4+i*.06);
  });
  // Decos fade in
  gsap.set('.deco',{opacity:0});
  tl.to('.deco',{opacity:el=>parseFloat(getComputedStyle(el).opacity)||.3,stagger:.05,duration:.4},'-=.3');
  // Faces pop in
  gsap.set('.face',{opacity:0,scale:0});
  tl.to('.face',{opacity:1,scale:1,stagger:.06,duration:.4,ease:'back.out(2)'},'-=.2');
  // Event date
  gsap.set('.event-date',{opacity:0,y:10});
  tl.to('.event-date',{opacity:.6,y:0,duration:.4,ease:'power2.out'},'-=.15');
  // Buy button
  gsap.set('.buy-btn',{opacity:0,y:20});
  tl.to('.buy-btn',{opacity:1,y:0,duration:.5,ease:'power2.out'},'-=.1');
  // Calendar button
  gsap.set('.cal-btn',{opacity:0,y:10});
  tl.to('.cal-btn',{opacity:1,y:0,duration:.4,ease:'power2.out'},'-=.2');

  // CHAR HOVER
  document.querySelectorAll('.ch').forEach(c=>{
    c.addEventListener('mouseenter',()=>gsap.to(c,{scale:1.25,y:-12,duration:.2,ease:'power2.out'}));
    c.addEventListener('mouseleave',()=>gsap.to(c,{scale:1,y:0,duration:.4,ease:'elastic.out(1,.4)'}));
  });

  // FACE CLICK SPIN
  document.querySelectorAll('.face,.big-face').forEach(f=>{
    f.addEventListener('click',e=>{
      e.stopPropagation();
      gsap.to(f,{rotation:'+=360',scale:1.2,duration:.6,ease:'power2.inOut',
        onComplete:()=>gsap.to(f,{scale:1,duration:.3,ease:'elastic.out(1,.5)'})});
    });
  });

  // MOUSE PARALLAX — all elements with data-depth
  if(isFine){
    const els=document.querySelectorAll('[data-depth]');
    document.addEventListener('mousemove',e=>{
      const cx=(e.clientX/window.innerWidth-.5)*2;
      const cy=(e.clientY/window.innerHeight-.5)*2;
      els.forEach(el=>{
        const d=parseFloat(el.dataset.depth)||0;
        gsap.to(el,{x:cx*d*120,y:cy*d*120,duration:.8,ease:'power2.out',overwrite:'auto'});
      });
    });
  }

  // BOX 3D TILT on hover
  if(isFine){
    boxes.forEach(box=>{
      box.addEventListener('mousemove',e=>{
        const r=box.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5;
        const y=(e.clientY-r.top)/r.height-.5;
        gsap.to(box,{
          rotateX:-y*18,rotateY:x*18,scale:1.08,
          boxShadow:`${-x*12}px ${-y*12}px 0 rgba(0,0,0,.35)`,
          duration:.25,ease:'power2.out',overwrite:'auto'
        });
      });
      box.addEventListener('mouseleave',()=>{
        gsap.to(box,{rotateX:0,rotateY:0,scale:1,
          boxShadow:'5px 5px 0 rgba(0,0,0,.2)',
          duration:.5,ease:'elastic.out(1,.5)',overwrite:'auto'});
      });
    });
  }

  // OVERLAY
  const ov=document.getElementById('ov');
  const ovCard=document.getElementById('ov-card');
  const ovX=document.getElementById('ov-x');

  boxes.forEach(box=>{
    box.addEventListener('click',()=>{
      const data=box.querySelector('.b-data');
      if(!data)return;
      ovCard.innerHTML=data.innerHTML;
      ov.classList.add('active');
    });
  });

  function closeOv(){ov.classList.remove('active')}
  ovX.addEventListener('click',closeOv);
  ov.addEventListener('click',e=>{if(e.target===ov||e.target===ov.querySelector('::before'))closeOv()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeOv()});

  // Cursor hover states
  if(isFine){
    document.querySelectorAll('.box,.ov-x').forEach(el=>{
      el.addEventListener('mouseenter',()=>cur.querySelector('.cursor-dot').style.transform='translate(-50%,-50%) scale(2.5)');
      el.addEventListener('mouseleave',()=>cur.querySelector('.cursor-dot').style.transform='translate(-50%,-50%) scale(1)');
    });
  }

})();
