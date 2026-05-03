/**
 * curtain.js — Three.js cloth simulation for BianCarnival landing
 * Verlet integration, two curtain panels, realistic velvet material
 */
(function(){
  'use strict';

  const canvas=document.getElementById('curtain-canvas');
  if(!canvas)return;

  // === CONFIG ===
  const COLS=50;           // horizontal segments per panel
  const ROWS=30;           // vertical segments
  const SEG_W=0.045;       // segment width (world units)
  const SEG_H=0.06;        // segment height
  const GRAVITY=new THREE.Vector3(0,-0.0008,0);
  const DAMPING=0.97;
  const CONSTRAINT_ITERS=8;
  const GAP=0.005;         // gap between panels at center

  let opening=false;
  let opened=false;

  // === THREE.JS SETUP ===
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000,0);

  const scene=new THREE.Scene();
  // No background — transparent to show website behind

  const camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,100);
  camera.position.set(0,-(ROWS*SEG_H)/2,2.4);
  camera.lookAt(0,-(ROWS*SEG_H)/2,0);

  // === LIGHTING ===
  scene.add(new THREE.AmbientLight(0x331111,0.4));
  const spot1=new THREE.SpotLight(0xffddaa,1.2,10,Math.PI/4,0.5);
  spot1.position.set(-1,1,2);spot1.castShadow=true;scene.add(spot1);
  const spot2=new THREE.SpotLight(0xffddaa,1.2,10,Math.PI/4,0.5);
  spot2.position.set(1,1,2);spot2.castShadow=true;scene.add(spot2);
  const topLight=new THREE.PointLight(0xffcc88,0.6,8);
  topLight.position.set(0,0.5,1.5);scene.add(topLight);

  // === GOLD ROD ===
  const rodGeo=new THREE.CylinderGeometry(0.018,0.018,COLS*SEG_W*2+0.3,16);
  const rodMat=new THREE.MeshStandardMaterial({color:0xd4a832,metalness:0.8,roughness:0.3});
  const rod=new THREE.Mesh(rodGeo,rodMat);
  rod.rotation.z=Math.PI/2;
  rod.position.set(0,0.03,0);
  scene.add(rod);

  // Rod end caps
  const capGeo=new THREE.SphereGeometry(0.03,12,12);
  const capL=new THREE.Mesh(capGeo,rodMat);
  capL.position.set(-(COLS*SEG_W+0.15),0.03,0);scene.add(capL);
  const capR=new THREE.Mesh(capGeo,rodMat);
  capR.position.set(COLS*SEG_W+0.15,0.03,0);scene.add(capR);

  // === CLOTH PARTICLE ===
  class Particle{
    constructor(x,y,z,pinned){
      this.pos=new THREE.Vector3(x,y,z);
      this.prev=new THREE.Vector3(x,y,z);
      this.pinned=pinned;
      this.force=new THREE.Vector3();
    }
    update(){
      if(this.pinned)return;
      const vel=new THREE.Vector3().subVectors(this.pos,this.prev).multiplyScalar(DAMPING);
      vel.add(GRAVITY);
      vel.add(this.force);
      this.prev.copy(this.pos);
      this.pos.add(vel);
      this.force.set(0,0,0);
      // Floor
      if(this.pos.y<-ROWS*SEG_H-0.05){this.pos.y=-ROWS*SEG_H-0.05;}
    }
  }

  // === CONSTRAINT ===
  class Constraint{
    constructor(p1,p2,rest){
      this.p1=p1;this.p2=p2;
      this.rest=rest||p1.pos.distanceTo(p2.pos);
    }
    solve(){
      const diff=new THREE.Vector3().subVectors(this.p2.pos,this.p1.pos);
      const dist=diff.length();
      if(dist===0)return;
      const correction=diff.multiplyScalar((dist-this.rest)/dist*0.5);
      if(!this.p1.pinned)this.p1.pos.add(correction);
      if(!this.p2.pinned)this.p2.pos.sub(correction);
    }
  }

  // === BUILD CURTAIN PANEL ===
  function buildPanel(side){
    const particles=[];
    const constraints=[];
    const xSign=side==='left'?-1:1;
    const xStart=side==='left'?-(COLS*SEG_W+GAP):GAP;

    for(let r=0;r<=ROWS;r++){
      particles[r]=[];
      for(let c=0;c<=COLS;c++){
        const x=xStart+c*SEG_W*xSign*-1;
        const xPos=side==='left'? -(GAP+c*SEG_W) : (GAP+c*SEG_W);
        const y=-r*SEG_H;
        const z=Math.sin(c*0.5)*0.02; // slight initial fold depth
        const pinned=(r===0); // pin entire top row
        particles[r][c]=new Particle(xPos,y,z,pinned);
      }
    }

    // Structural constraints (horizontal + vertical)
    for(let r=0;r<=ROWS;r++){
      for(let c=0;c<=COLS;c++){
        if(c<COLS)constraints.push(new Constraint(particles[r][c],particles[r][c+1]));
        if(r<ROWS)constraints.push(new Constraint(particles[r][c],particles[r+1][c]));
        // Shear
        if(r<ROWS&&c<COLS){
          constraints.push(new Constraint(particles[r][c],particles[r+1][c+1]));
          constraints.push(new Constraint(particles[r][c+1],particles[r+1][c]));
        }
        // Bend (skip one)
        if(c<COLS-1)constraints.push(new Constraint(particles[r][c],particles[r][c+2]));
        if(r<ROWS-1)constraints.push(new Constraint(particles[r][c],particles[r+2][c]));
      }
    }

    // Geometry
    const geo=new THREE.BufferGeometry();
    const indices=[];
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const a=r*(COLS+1)+c;
        const b=a+1;
        const d=(r+1)*(COLS+1)+c;
        const e=d+1;
        indices.push(a,d,b);
        indices.push(b,d,e);
      }
    }
    geo.setIndex(indices);
    const verts=new Float32Array((ROWS+1)*(COLS+1)*3);
    geo.setAttribute('position',new THREE.BufferAttribute(verts,3));
    geo.computeVertexNormals();

    // Velvet material
    const mat=new THREE.MeshPhongMaterial({
      color:0x6b0f0f,
      specular:0x331111,
      shininess:8,
      side:THREE.DoubleSide,
      flatShading:false
    });

    const mesh=new THREE.Mesh(geo,mat);
    mesh.castShadow=true;
    mesh.receiveShadow=true;
    scene.add(mesh);

    return{particles,constraints,geo,mesh};
  }

  const leftPanel=buildPanel('left');
  const rightPanel=buildPanel('right');

  // === UPDATE GEOMETRY FROM PARTICLES ===
  function syncGeo(panel){
    const pos=panel.geo.attributes.position.array;
    let i=0;
    for(let r=0;r<=ROWS;r++){
      for(let c=0;c<=COLS;c++){
        const p=panel.particles[r][c];
        pos[i++]=p.pos.x;
        pos[i++]=p.pos.y;
        pos[i++]=p.pos.z;
      }
    }
    panel.geo.attributes.position.needsUpdate=true;
    panel.geo.computeVertexNormals();
  }

  // === WIND ===
  let windTime=0;
  function applyWind(panel){
    for(let r=0;r<=ROWS;r++){
      for(let c=0;c<=COLS;c++){
        const p=panel.particles[r][c];
        if(p.pinned)continue;
        const wind=Math.sin(windTime*2+r*0.3+c*0.5)*0.00008;
        p.force.z+=wind;
      }
    }
  }

  // === OPEN CURTAINS ===
  function openCurtains(){
    if(opening)return;
    opening=true;

    const isMobile = window.innerWidth <= 700;
    const speedFactor = isMobile ? 2 : 1;

    // Unpin inner columns (near center seam) first, then progressively outward
    const innerCols=Math.floor(COLS*0.4);
    [leftPanel,rightPanel].forEach((panel,pi)=>{
      const dir=pi===0?-1:1;
      for(let c=0;c<=COLS;c++){
        const delay=(c<innerCols?c*50:(innerCols*50+(c-innerCols)*25)) / speedFactor;
        setTimeout(()=>{
          // Unpin this column's top particle
          const p=panel.particles[0][c];
          p.pinned=false;
          // Apply outward + upward force
          p.force.x=dir*0.018;
          p.force.y=0.0036;
        },delay);
      }
    });

    // Apply continuous outward force during opening
    let frame=0;
    const pushInterval=setInterval(()=>{
      frame += speedFactor;
      [leftPanel,rightPanel].forEach((panel,pi)=>{
        const dir=pi===0?-1:1;
        for(let r=0;r<Math.min(5,ROWS);r++){
          for(let c=0;c<=COLS;c++){
            const p=panel.particles[r][c];
            if(!p.pinned){
              p.force.x+=dir*0.0006*(1-frame/100) * speedFactor;
            }
          }
        }
      });
      if(frame>100){
        clearInterval(pushInterval);
        // Signal completion after fabric settles
        setTimeout(()=>{
          opened=true;
          if(window._onCurtainOpen)window._onCurtainOpen();
        },600 / speedFactor);
      }
    },16);
  }

  // Expose for script.js
  window._openCurtains=openCurtains;

  // === ANIMATION LOOP ===
  function animate(){
    if(opened)return; // stop rendering after curtain removed
    requestAnimationFrame(animate);
    windTime+=0.016;

    // Physics step
    [leftPanel,rightPanel].forEach(panel=>{
      applyWind(panel);
      panel.particles.forEach(row=>row.forEach(p=>p.update()));
      for(let i=0;i<CONSTRAINT_ITERS;i++){
        panel.constraints.forEach(c=>c.solve());
      }
      syncGeo(panel);
    });

    renderer.render(scene,camera);
  }

  animate();

  // === RESIZE ===
  window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
  });

})();
