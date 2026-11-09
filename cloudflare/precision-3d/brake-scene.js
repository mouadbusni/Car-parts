import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Original, procedural Three.js brake assembly: real 3D meshes, drilled rotor
// geometry, caliper casting, PBR materials, lighting and pointer interaction.
// No raster image, SVG pretending to be 3D, or external 3D model dependency.
const TAU = Math.PI * 2;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const current = { instance: null };
const material = (color, metalness = .76, roughness = .29, more = {}) =>
  new THREE.MeshPhysicalMaterial({ color, metalness, roughness, clearcoat: .35,
    clearcoatRoughness: .22, ...more });

function roundedBox(width, height, depth, radius, mat) {
  const shape = new THREE.Shape();
  const x = -width/2, y = -height/2;
  shape.moveTo(x+radius,y);
  shape.lineTo(x+width-radius,y);
  shape.quadraticCurveTo(x+width,y,x+width,y+radius);
  shape.lineTo(x+width,y+height-radius);
  shape.quadraticCurveTo(x+width,y+height,x+width-radius,y+height);
  shape.lineTo(x+radius,y+height);
  shape.quadraticCurveTo(x,y+height,x,y+height-radius);
  shape.lineTo(x,y+radius);
  shape.quadraticCurveTo(x,y,x+radius,y);
  const g = new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,
    bevelThickness:.025,bevelSize:.025,curveSegments:6,steps:1});
  const mesh = new THREE.Mesh(g,mat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}
function cylinder(radiusTop, radiusBottom, height, mat, sides=32) {
  const m=new THREE.Mesh(new THREE.CylinderGeometry(radiusTop,radiusBottom,height,sides),mat);
  m.rotation.x = Math.PI/2;
  m.castShadow=true; m.receiveShadow=true;
  return m;
}
function torus(radius,tube,mat,radial=8,tubular=96) {
  const m=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,radial,tubular),mat);
  m.castShadow=true; return m;
}
function perforatedDisc(radius, inner, layerDepth) {
  const shape = new THREE.Shape();
  shape.absarc(0,0,radius,0,TAU,false);
  const center=new THREE.Path();
  center.absarc(0,0,inner,0,TAU,true);
  shape.holes.push(center);
  // Actual perforations in the extruded metal, not dots printed on its face.
  for (const [r,n,phase] of [[1.17,25,.05],[1.48,31,.16],[1.84,39,.02]]) {
    for(let i=0;i<n;i++) {
      const angle=TAU*(i/n)+phase;
      const hole=new THREE.Path();
      hole.absarc(r*Math.cos(angle),r*Math.sin(angle),.039,0,TAU,true);
      shape.holes.push(hole);
    }
  }
  const geometry=new THREE.ExtrudeGeometry(shape,{depth:layerDepth,
    steps:1,bevelEnabled:true,bevelSegments:1,bevelThickness:.008,
    bevelSize:.006,curveSegments:7});
  geometry.computeVertexNormals();
  return geometry;
}
function makeCaliper() {
  const root=new THREE.Group();
  root.name='Six-piston caliper';
  const blue=material(0x2359ac,.66,.18,{clearcoat:1,clearcoatRoughness:.1});
  const darker=material(0x0e2759,.85,.32);
  const chrome=material(0x9daec9,.93,.2);
  const gasket=material(0x111723,.38,.67);
  const bolt=material(0xbacbdb,.95,.17);
  const shape=new THREE.Shape();
  shape.moveTo(-.53,-.79);
  shape.bezierCurveTo(-.87,-.73,-.87,-.42,-.79,-.17);
  shape.bezierCurveTo(-.70,.07,-.70,.39,-.5,.75);
  shape.bezierCurveTo(-.38,.9,.28,.89,.55,.71);
  shape.bezierCurveTo(.71,.58,.8,.33,.74,.12);
  shape.bezierCurveTo(.67,-.17,.69,-.38,.62,-.62);
  shape.bezierCurveTo(.51,-.86,-.15,-.88,-.53,-.79);
  // Mechanical inspection windows are geometry cutouts.
  for(const y of [-.40,.37]) {
    const hole=new THREE.Path();
    hole.absellipse(-.15,y,.22,.13,0,TAU,true);
    shape.holes.push(hole);
  }
  const body=new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape,{depth:.46,steps:1,bevelEnabled:true,
      bevelSegments:3,bevelThickness:.045,bevelSize:.045,curveSegments:10}),blue);
  body.position.z=-.21;body.castShadow=true;body.receiveShadow=true;
  root.add(body);
  for(const y of [-.55,.05,.62]) {
    const bar=roundedBox(1.34,.14,.21,.065,blue);
    bar.position.set(.05,y,.35);
    root.add(bar);
  }
  for(const y of [-.62,.62]) {
    for(const x of [-.52,.53]) {
      const pad=cylinder(.14,.14,.09,darker,18);
      pad.position.set(x,y,.36);root.add(pad);
      const screw=cylinder(.062,.062,.036,bolt,6);
      screw.position.set(x,y,.432);root.add(screw);
      const bore=cylinder(.025,.025,.04,gasket,24);
      bore.position.set(x,y,.46);root.add(bore);
    }
  }
  for(const y of [-.34,.31]){
    const piston=cylinder(.17,.17,.065,chrome,32);
    piston.position.set(-.07,y,.31);
    root.add(piston);
    const pistonFace=cylinder(.095,.095,.02,darker,32);
    pistonFace.position.set(-.07,y,.36);root.add(pistonFace);
  }
  // Add a small original AutoPro brandmark to the physical caliper casting.
  const canvas=document.createElement('canvas');
  canvas.width=512;canvas.height=148;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,512,148);
  ctx.font='900 78px Arial, sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle='#e8f3ff';ctx.fillText('AUTOPRO',256,80);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  const mark=new THREE.Mesh(new THREE.PlaneGeometry(.94,.27),
    new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  mark.position.set(.09,.03,.493);
  root.add(mark);
  // Brake line connector, physically mounted to top of caliper.
  const nozzle=cylinder(.105,.09,.26,chrome,24);
  nozzle.rotation.set(0,0,Math.PI/2);
  nozzle.position.set(.28,.87,.13);
  root.add(nozzle);
  const nipple=cylinder(.065,.06,.08,bolt,6);
  nipple.rotation.set(0,0,Math.PI/2);
  nipple.position.set(.3,.99,.13);root.add(nipple);
  root.position.set(1.57,.12,.28);
  root.rotation.z=-.13;
  root.userData.materials=[blue,darker,chrome,gasket,bolt];
  return root;
}
function createBrake() {
  const root=new THREE.Group();
  root.name='Autopro original 3D brake assembly';
  const rotor=new THREE.Group();
  const ceramic=material(0x707e91,.8,.27,{clearcoat:.45,clearcoatRoughness:.27});
  const edge=material(0x2d3a4c,.83,.38);
  const brushed=material(0x8999ac,.91,.18);
  const inset=material(0x152132,.72,.39);
  const bolt=material(0xd4dce5,.96,.17);
  const hole=material(0x0c1421,.25,.8);
  for(const z of [-.145,.11]){
    const disc=new THREE.Mesh(perforatedDisc(2.08,.69,.065),ceramic);
    disc.position.z=z;
    disc.castShadow=true;disc.receiveShadow=true;
    rotor.add(disc);
  }
  for(let i=0;i<46;i++){
    const angle=TAU*i/46;
    const fin=new THREE.Mesh(new THREE.BoxGeometry(.13,.32,.2),edge);
    fin.position.set(1.8*Math.cos(angle),1.8*Math.sin(angle),.012);
    fin.rotation.z=angle;
    fin.castShadow=true;
    rotor.add(fin);
  }
  for(const rad of [2.055,2.035,.72]){
    const ring=torus(rad,rad===.72?.044:.028,brushed,8,118);
    ring.position.z=.196;rotor.add(ring);
  }
  for(const rad of [1.04,1.15,1.66,1.97]){
    const line=torus(rad,.0075,edge,5,110);
    line.position.z=.193;rotor.add(line);
  }
  const hub=cylinder(.76,.75,.33,inset,64);
  hub.position.z=.26;rotor.add(hub);
  const hubBevel=cylinder(.59,.59,.09,brushed,64);
  hubBevel.position.z=.45;rotor.add(hubBevel);
  const center=cylinder(.37,.37,.05,inset,48);
  center.position.z=.505;rotor.add(center);
  const cap=cylinder(.165,.165,.07,brushed,32);
  cap.position.z=.55;rotor.add(cap);
  const core=cylinder(.09,.09,.085,hole,32);
  core.position.z=.60;rotor.add(core);
  for(let i=0;i<5;i++){
    const a=TAU*i/5-Math.PI/2;
    const x=Math.cos(a)*.50,y=Math.sin(a)*.50;
    const washer=cylinder(.109,.109,.042,brushed,32);
    washer.position.set(x,y,.525);rotor.add(washer);
    const hex=cylinder(.068,.068,.062,edge,6);
    hex.rotation.z=a;hex.position.set(x,y,.564);rotor.add(hex);
    const socket=cylinder(.027,.027,.063,hole,6);
    socket.position.set(x,y,.613);rotor.add(socket);
  }
  rotor.position.set(-.26,0,0);
  root.add(rotor);
  const caliper=makeCaliper();
  root.add(caliper);
  root.userData={rotor,caliper,materials:[ceramic,edge,brushed,inset,bolt,hole]};
  return root;
}
class BrakeScene {
  constructor(canvas) {
    this.canvas=canvas;
    this.visible=true;
    this.running=true;
    this.exploded=false;
    this.angleX=-.12;
    this.angleY=-.24;
    this.targetX=this.angleX;
    this.targetY=this.angleY;
    this.dragging=false;
    this.frame=0;
    this.last=0;
    this.reduced=prefersReduced;
    const viewport=canvas.parentElement;
    this.viewport=viewport;
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.6;
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.shadowMap.enabled=false;
    this.renderer=renderer;
    this.scene=new THREE.Scene();
    this.scene.background=null;
    const pmrem=new THREE.PMREMGenerator(renderer);
    const room=new RoomEnvironment();
    this.environment=pmrem.fromScene(room,0.04);
    this.scene.environment=this.environment.texture;
    this.scene.environmentIntensity=.9;
    room.dispose();pmrem.dispose();
    this.scene.add(new THREE.AmbientLight(0xabc8f5,1.6));
    const key=new THREE.DirectionalLight(0xe6f3ff,5.0);
    key.position.set(-3.5,5,7);
    this.scene.add(key);
    const rim=new THREE.DirectionalLight(0x577ffe,7);
    rim.position.set(5,2,-2.5);
    this.scene.add(rim);
    const fill=new THREE.PointLight(0x769ff8,52,13,2);
    fill.position.set(-4,-1,5);this.scene.add(fill);
    const cool=new THREE.PointLight(0xf8faff,28,12,2);
    cool.position.set(3,4,4);this.scene.add(cool);
    this.camera=new THREE.PerspectiveCamera(34,1,.1,100);
    this.camera.position.set(0,.15,9.4);
    this.camera.lookAt(.18,0,0);
    this.brake=createBrake();
    this.scene.add(this.brake);
    this.onMove=e=>{
      if(!this.dragging)return;
      const dx=e.clientX-this.startX,dy=e.clientY-this.startY;
      this.targetY=Math.max(-.85,Math.min(.85,this.downY+dx*.006));
      this.targetX=Math.max(-.44,Math.min(.44,this.downX+dy*.004));
    };
    this.onDown=e=>{
      if(e.pointerType==='touch'&&e.isPrimary===false)return;
      this.dragging=true;this.startX=e.clientX;this.startY=e.clientY;
      this.downX=this.targetX;this.downY=this.targetY;
      if(e.pointerType==='mouse')canvas.setPointerCapture(e.pointerId);
    };
    this.onUp=()=>{this.dragging=false};
    this.onKey=e=>{
      if(document.activeElement!==canvas)return;
      if(e.key==='ArrowLeft')this.targetY=Math.max(-.85,this.targetY-.10);
      else if(e.key==='ArrowRight')this.targetY=Math.min(.85,this.targetY+.10);
      else if(e.key==='ArrowUp')this.targetX=Math.max(-.44,this.targetX-.10);
      else if(e.key==='ArrowDown')this.targetX=Math.min(.44,this.targetX+.10);
      else return;
      e.preventDefault();
    };
    canvas.addEventListener('pointerdown',this.onDown);
    canvas.addEventListener('pointermove',this.onMove);
    canvas.addEventListener('pointerup',this.onUp);
    canvas.addEventListener('pointercancel',this.onUp);
    canvas.addEventListener('keydown',this.onKey);
    canvas.style.touchAction='pan-y';
    this.onResize=()=>this.resize();
    this.resizeObserver=new ResizeObserver(this.onResize);
    this.resizeObserver.observe(viewport);
    this.visibilityObserver=new IntersectionObserver(entries=>{this.visible=entries[0]?.isIntersecting!==false},
      {threshold:.01});
    this.visibilityObserver.observe(canvas);
    this.visibility=()=>{this.visible=!document.hidden};
    document.addEventListener('visibilitychange',this.visibility);
    this.resize();
    canvas.dataset.webgl='ready';
    this.animate=timestamp=>{
      if(!this.running)return;
      this.frame=requestAnimationFrame(this.animate);
      if(!this.visible)return;
      if(timestamp-this.last< (this.reduced?45:30))return;
      this.last=timestamp;
      this.angleY+=(this.targetY-this.angleY)*.065;
      this.angleX+=(this.targetX-this.angleX)*.065;
      this.brake.rotation.y=this.angleY;
      this.brake.rotation.x=this.angleX;
      this.brake.rotation.z=-.065;
      const target=this.exploded?1:0;
      this.explodeAmount+=(target-this.explodeAmount)*.075;
      this.brake.userData.rotor.position.z=-this.explodeAmount*.42;
      this.brake.userData.caliper.position.x=1.57+this.explodeAmount*.78;
      this.brake.userData.caliper.position.z=.28+this.explodeAmount*.42;
      if(!this.reduced&&!this.dragging){
        this.brake.position.y=Math.sin(timestamp*.0005)*.027;
      }
      renderer.render(this.scene,this.camera);
    };
    this.explodeAmount=0;
    this.frame=requestAnimationFrame(this.animate);
    renderer.render(this.scene,this.camera);
  }
  resize(){
    const w=Math.max(200,Math.floor(this.viewport.clientWidth));
    const h=Math.max(220,Math.floor(this.viewport.clientHeight));
    this.renderer.setSize(w,h,false);
    this.camera.aspect=w/h;
    this.camera.position.z=w<500?10.7:w<690?10:9.4;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene,this.camera);
  }
  toggleExploded(){
    this.exploded=!this.exploded;
    return this.exploded;
  }
  dispose(){
    this.running=false;
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();this.visibilityObserver.disconnect();
    document.removeEventListener('visibilitychange',this.visibility);
    this.canvas.removeEventListener('pointerdown',this.onDown);
    this.canvas.removeEventListener('pointermove',this.onMove);
    this.canvas.removeEventListener('pointerup',this.onUp);
    this.canvas.removeEventListener('pointercancel',this.onUp);
    this.canvas.removeEventListener('keydown',this.onKey);
    this.scene.traverse(node=>{
      if(node.geometry)node.geometry.dispose();
      if(node.material){
        const items=Array.isArray(node.material)?node.material:[node.material];
        for(const item of items){if(item.map)item.map.dispose();item.dispose()}
      }
    });
    this.environment.dispose();
    this.renderer.dispose();
  }
}
window.AutoPro3D={
  mount(canvas){
    if(current.instance){current.instance.dispose();current.instance=null}
    if(!canvas)return;
    try{
      current.instance=new BrakeScene(canvas);
      const badge=document.querySelector('#webgl-state');
      if(badge)badge.textContent='LIVE WEBGL 3D / INTERACTIVE';
      const fallback=document.querySelector('#model-fallback');
      if(fallback)fallback.hidden=true;
    }catch(error){
      canvas.dataset.webgl='unavailable';
      const fallback=document.querySelector('#model-fallback');
      if(fallback)fallback.hidden=false;
      const badge=document.querySelector('#webgl-state');
      if(badge)badge.textContent='3D PREVIEW UNAVAILABLE ON THIS DEVICE';
      // Avoid a blank hero on devices with no WebGL.
    }
  },
  unmount(){
    if(current.instance){current.instance.dispose();current.instance=null}
  },
  toggleExploded(){return current.instance?.toggleExploded()??false},
  get status(){return current.instance?'ready':'unavailable'}
};
