import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Math ─────────────────────────────────────────────────────────────────────

const mat4mul = (A, B) => {
  const R = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  for (let i=0;i<4;i++) for (let j=0;j<4;j++)
    for (let k=0;k<4;k++) R[i][j] += A[i][k]*B[k][j];
  return R;
};
const mat4vec = (M, v) => [
  M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2]+M[0][3]*v[3],
  M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2]+M[1][3]*v[3],
  M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2]+M[2][3]*v[3],
  M[3][0]*v[0]+M[3][1]*v[1]+M[3][2]*v[2]+M[3][3]*v[3],
];
const Rx = (a) => { const c=Math.cos(a),s=Math.sin(a); return [[1,0,0,0],[0,c,-s,0],[0,s,c,0],[0,0,0,1]]; };
const Rz = (a) => { const c=Math.cos(a),s=Math.sin(a); return [[c,-s,0,0],[s,c,0,0],[0,0,1,0],[0,0,0,1]]; };
const norm3 = (v) => { const l=Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]); return l<1e-12?[0,0,1]:[v[0]/l,v[1]/l,v[2]/l]; };
const cross3 = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot3   = (a,b) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];

/**
 * Table/Trunnion kinematic chain:  p_machine = Rx(A) · Rz(C) · p_part
 *
 *   C spins part around Z (applied first)
 *   A tilts whole assembly around machine X axis (applied second, machine-frame fixed)
 *   SPINDLE only translates in X/Y/Z — tool axis is always [0,0,−1]
 *
 * IK: C = atan2(nx, ny),  A = acos(nz) − lead
 */
const ikFromNormal = (nx, ny, nz, leadDeg=0) => ({
  A_deg: Math.acos(Math.max(-1,Math.min(1,nz)))*180/Math.PI - leadDeg,
  C_deg: Math.atan2(nx,ny)*180/Math.PI,
});

const Mtable = (a_deg,c_deg) => mat4mul(Rx(a_deg*Math.PI/180), Rz(c_deg*Math.PI/180));

// ─── Shapes ───────────────────────────────────────────────────────────────────

function mesh(Nu, Nv, posFn, normFn) {
  const pts=[],norms=[];
  for (let j=0;j<=Nv;j++) for (let i=0;i<=Nu;i++) {
    pts.push(posFn(i/Nu,j/Nv));
    norms.push(normFn(i/Nu,j/Nv));
  }
  const tris=[];
  for (let j=0;j<Nv;j++) for (let i=0;i<Nu;i++) {
    const a=j*(Nu+1)+i,b=a+1,c=a+(Nu+1),d=c+1;
    tris.push([a,b,d],[a,d,c]);
  }
  return {pts,norms,tris};
}

const generateEgg = () => mesh(56,36,
  (u,v)=>{ const U=u*2*Math.PI,V=v*Math.PI,sv=Math.sin(V),cv=Math.cos(V),rz=V<Math.PI/2?52:44;
            return [36*sv*Math.cos(U),36*sv*Math.sin(U),rz*cv]; },
  (u,v)=>{ const U=u*2*Math.PI,V=v*Math.PI,sv=Math.sin(V),cv=Math.cos(V),rz=V<Math.PI/2?52:44;
            return norm3([sv*Math.cos(U)/1296,sv*Math.sin(U)/1296,cv/(rz*rz)]); }
);

const generateCam = () => {
  const camR = u => 28+16*Math.pow(Math.max(0,Math.cos(u*2*Math.PI)),2.5);
  const camDR= u => -16*2.5*Math.pow(Math.max(0,Math.cos(u*2*Math.PI)),1.5)*Math.sin(u*2*Math.PI)*2*Math.PI;
  return mesh(72,22,
    (u,v)=>{ const U=u*2*Math.PI,r=camR(u); return [r*Math.cos(U),r*Math.sin(U),-25+v*50]; },
    (u,v)=>{ const U=u*2*Math.PI,r=camR(u),dr=camDR(u);
              const tu=[dr*Math.cos(U)-r*Math.sin(U),dr*Math.sin(U)+r*Math.cos(U),0];
              const n=norm3(cross3(tu,[0,0,1]));
              return dot3(n,[Math.cos(U),Math.sin(U),0])<0?[-n[0],-n[1],-n[2]]:n; }
  );
};

const generateBell = () => {
  const posAt = (u,v) => {
    const t=Math.max(1e-4,Math.min(1-1e-4,v)),a=t*Math.PI*0.82,sa=Math.sin(a),ca=Math.cos(a);
    const r=22*sa+18*Math.pow(t,2.5)*sa;
    return [r*Math.cos(u*2*Math.PI),r*Math.sin(u*2*Math.PI),56*ca-10*Math.pow(t,3)*sa];
  };
  return mesh(56,36, posAt, (u,v)=>{
    const eps=5e-4,pa=posAt(u,v),pb=posAt(u+eps,v),pc=posAt(u,v+eps);
    const tu=[(pb[0]-pa[0])/eps,(pb[1]-pa[1])/eps,(pb[2]-pa[2])/eps];
    const tv=[(pc[0]-pa[0])/eps,(pc[1]-pa[1])/eps,(pc[2]-pa[2])/eps];
    const n=norm3(cross3(tu,tv));
    const r2=Math.sqrt(pa[0]*pa[0]+pa[1]*pa[1])||1;
    return dot3(n,[pa[0]/r2,pa[1]/r2,0])<0?[-n[0],-n[1],-n[2]]:n;
  });
};

// ─── Toolpath ─────────────────────────────────────────────────────────────────

function makeToolpath(shape, leadDeg) {
  const path=[];
  const push=(px,py,pz,nx,ny,nz)=>{
    if (nz<0.04) return;
    const {A_deg,C_deg}=ikFromNormal(nx,ny,nz,leadDeg);
    const M=Mtable(A_deg,C_deg);
    const pm=mat4vec(M,[px,py,pz,1]);
    path.push({A_deg,C_deg,X:pm[0],Y:pm[1],Z:pm[2],pPart:[px,py,pz],nPart:[nx,ny,nz]});
  };

  if (shape==='egg') {
    const nRev=7,nPPR=80,total=nRev*nPPR;
    for (let i=0;i<=total;i++) {
      const t=i/total,u=t*nRev*2*Math.PI,V=(0.07+t*0.86)*Math.PI;
      const sv=Math.sin(V),cv=Math.cos(V),rz=V<Math.PI/2?52:44;
      const px=36*sv*Math.cos(u),py=36*sv*Math.sin(u),pz=rz*cv;
      const n=norm3([sv*Math.cos(u)/1296,sv*Math.sin(u)/1296,cv/(rz*rz)]);
      push(px,py,pz,n[0],n[1],n[2]);
    }
  } else if (shape==='cam') {
    const nPass=12,nPPP=80;
    for (let p=0;p<nPass;p++) {
      const z=-22+(p/(nPass-1))*44,dir=p%2===0?1:-1;
      for (let i=0;i<=nPPP;i++) {
        const u=(dir>0?i:nPPP-i)/nPPP,U=u*2*Math.PI;
        const r=28+16*Math.pow(Math.max(0,Math.cos(U)),2.5);
        const px=r*Math.cos(U),py=r*Math.sin(U);
        const dr=-16*2.5*Math.pow(Math.max(0,Math.cos(U)),1.5)*Math.sin(U)*2*Math.PI;
        const tu=[dr*Math.cos(U)-r*Math.sin(U),dr*Math.sin(U)+r*Math.cos(U),0];
        const nOut=norm3(cross3(tu,[0,0,1]));
        const nR=dot3(nOut,[Math.cos(U),Math.sin(U),0])<0?[-nOut[0],-nOut[1],-nOut[2]]:nOut;
        // Blend in a small upward component so IK doesn't hit 90° singularity
        push(px,py,z,nR[0]*0.87,nR[1]*0.87,0.49);
      }
    }
  } else {
    const posAt=(u,v)=>{
      const t=Math.max(1e-4,Math.min(1-1e-4,v)),a=t*Math.PI*0.82,sa=Math.sin(a),ca=Math.cos(a);
      const r=22*sa+18*Math.pow(t,2.5)*sa;
      return [r*Math.cos(u*2*Math.PI),r*Math.sin(u*2*Math.PI),56*ca-10*Math.pow(t,3)*sa];
    };
    const nRev=7,nPPR=80,total=nRev*nPPR;
    for (let i=0;i<=total;i++) {
      const t=i/total,tv=0.05+t*0.85,u=t*nRev*2*Math.PI;
      const [px,py,pz]=posAt(u,tv);
      const eps=5e-4,pb=posAt(u+eps,tv),pc=posAt(u,tv+eps);
      const tu=[(pb[0]-px)/eps,(pb[1]-py)/eps,(pb[2]-pz)/eps];
      const tv2=[(pc[0]-px)/eps,(pc[1]-py)/eps,(pc[2]-pz)/eps];
      const nOut=norm3(cross3(tu,tv2));
      const r2=Math.sqrt(px*px+py*py)||1;
      const n=dot3(nOut,[px/r2,py/r2,0])<0?[-nOut[0],-nOut[1],-nOut[2]]:nOut;
      push(px,py,pz,n[0],n[1],Math.max(0.04,n[2]));
    }
  }
  return path;
}

// ─── Projection ───────────────────────────────────────────────────────────────

function project(pt, rx, ry, scale, cx, cy) {
  const [x,y,z]=pt;
  const cY=Math.cos(ry),sY=Math.sin(ry);
  const x2=x*cY+z*sY,z2=-x*sY+z*cY;
  const cX=Math.cos(rx),sX=Math.sin(rx);
  return {sx:cx+x2*scale, sy:cy-(y*cX-z2*sX)*scale, depth:y*sX+z2*cX};
}

// ─── Canvas drawing helpers ───────────────────────────────────────────────────

// Draw a table disk that rotates with the part (visual anchor)
function drawTable(ctx, proj, M_table) {
  const R=96, ZT=-58, ZB=-66, N=48;
  const tPt=p=>{ const w=mat4vec(M_table,[p[0],p[1],p[2],1]); return proj([w[0],w[1],w[2]]); };

  // Compute top ring
  const top=[], bot=[];
  for (let i=0;i<=N;i++) {
    const u=(i/N)*2*Math.PI;
    top.push(tPt([R*Math.cos(u),R*Math.sin(u),ZT]));
    bot.push(tPt([R*Math.cos(u),R*Math.sin(u),ZB]));
  }

  // Side band (visible half only — back half has lower depth)
  ctx.save();
  for (let i=0;i<N;i++) {
    if (top[i].depth<0 && top[i+1].depth<0) continue; // skip back faces
    ctx.beginPath();
    ctx.moveTo(top[i].sx,top[i].sy); ctx.lineTo(top[i+1].sx,top[i+1].sy);
    ctx.lineTo(bot[i+1].sx,bot[i+1].sy); ctx.lineTo(bot[i].sx,bot[i].sy);
    ctx.closePath();
    ctx.fillStyle='#2a2d35'; ctx.fill();
    ctx.strokeStyle='#3a3d48'; ctx.lineWidth=0.4; ctx.stroke();
  }

  // Top face
  ctx.beginPath();
  top.forEach((p,i)=>i===0?ctx.moveTo(p.sx,p.sy):ctx.lineTo(p.sx,p.sy));
  ctx.closePath();
  ctx.fillStyle='#32353f'; ctx.fill();
  ctx.strokeStyle='#52556a'; ctx.lineWidth=1; ctx.stroke();

  // T-slot lines on top
  ctx.strokeStyle='rgba(0,0,0,0.5)'; ctx.lineWidth=1;
  [0,90,180,270].forEach(deg=>{
    const rad=deg*Math.PI/180;
    const a=tPt([8*Math.cos(rad),8*Math.sin(rad),ZT]);
    const b=tPt([(R-5)*Math.cos(rad),(R-5)*Math.sin(rad),ZT]);
    ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); ctx.stroke();
  });
  ctx.restore();
}

// Draw trunnion arms (machine frame — don't rotate)
function drawTrunnionArms(ctx, proj) {
  ctx.save();
  [100,-100].forEach(armY=>{
    const corners=[
      proj([-20,armY,-130]),proj([20,armY,-130]),
      proj([20,armY,-52]),proj([-20,armY,-52]),
    ];
    ctx.beginPath();
    corners.forEach((c,i)=>i===0?ctx.moveTo(c.sx,c.sy):ctx.lineTo(c.sx,c.sy));
    ctx.closePath();
    ctx.fillStyle='#1c1e24'; ctx.fill();
    ctx.strokeStyle='#2e3040'; ctx.lineWidth=0.5; ctx.stroke();

    // A-axis pivot hole
    const pivot=proj([0,armY,-52]);
    ctx.beginPath(); ctx.arc(pivot.sx,pivot.sy,5,0,Math.PI*2);
    ctx.fillStyle='#111'; ctx.fill();
    ctx.strokeStyle='#444'; ctx.lineWidth=1; ctx.stroke();
  });
  ctx.restore();
}

// Draw spindle + holder + bull endmill (all in machine frame, no table rotation)
function drawSpindle(ctx, proj, tip, leadDeg) {
  const [TX,TY,TZ]=tip;

  // Screen-space axis direction from machine Z
  const p0=proj([TX,TY,TZ]);
  const pZ=proj([TX,TY,TZ+10]);
  const pX=proj([TX+10,TY,TZ]);

  const axDx=(pZ.sx-p0.sx)/10, axDy=(pZ.sy-p0.sy)/10;
  const axL=Math.sqrt(axDx*axDx+axDy*axDy)||1;
  const ax=[axDx/axL,axDy/axL];
  const pr=[-ax[1],ax[0]]; // perp in screen space

  const SZ=axL;  // px per world unit along Z
  const wDx=(pX.sx-p0.sx)/10, wDy=(pX.sy-p0.sy)/10;
  const SW=Math.sqrt(wDx*wDx+wDy*wDy); // px per world unit across X

  // Screen position at world offset (zOff up from tip, xOff sideways)
  const P=(zOff,xOff=0)=>[
    p0.sx + ax[0]*zOff*SZ + pr[0]*xOff*SW,
    p0.sy + ax[1]*zOff*SZ + pr[1]*xOff*SW,
  ];

  const poly=(pts,fill,stroke='rgba(0,0,0,0.35)',lw=0.5)=>{
    ctx.beginPath(); ctx.moveTo(...pts[0]);
    pts.slice(1).forEach(p=>ctx.lineTo(...p));
    ctx.closePath();
    ctx.fillStyle=fill; ctx.fill();
    ctx.strokeStyle=stroke; ctx.lineWidth=lw; ctx.stroke();
  };

  ctx.save();

  // Spindle housing (big gray block)
  {
    const g=ctx.createLinearGradient(...P(70,-25),...P(70,25));
    g.addColorStop(0,'#222530'); g.addColorStop(0.25,'#454a58');
    g.addColorStop(0.75,'#454a58'); g.addColorStop(1,'#222530');
    poly([P(90,-23),P(90,23),P(50,23),P(50,-23)],g);
    // Bolt flange
    poly([P(52,-26),P(52,26),P(49,26),P(49,-26)],'#1a1c25','#30334a',0.5);
    // Spindle face ring
    poly([P(50,-20),P(50,20),P(48,20),P(48,-20)],'#2a2d38','#404558',0.5);
  }

  // Tool holder taper (HSK-style)
  {
    const g=ctx.createLinearGradient(...P(30,-19),...P(30,19));
    g.addColorStop(0,'#1a1c22'); g.addColorStop(0.35,'#343840');
    g.addColorStop(0.65,'#343840'); g.addColorStop(1,'#1a1c22');
    poly([P(8,-7),P(8,7),P(48,19),P(48,-19)],g);
    // Pull stud at top
    poly([P(48,-4),P(48,4),P(52,4),P(52,-4)],'#111318','#2a2d38',0.5);
  }

  // Collet nut
  poly([P(4,-8),P(4,8),P(9,8),P(9,-8)],'#1e2028','#33364a',0.5);

  // Bull endmill body
  {
    const g=ctx.createLinearGradient(...P(2,-6),...P(2,6));
    g.addColorStop(0,'#0e1015'); g.addColorStop(0.18,'#50545f');
    g.addColorStop(0.5,'#646870'); g.addColorStop(0.82,'#50545f');
    g.addColorStop(1,'#0e1015');
    poly([P(0,-6),P(0,6),P(4,6),P(4,-6)],g);
    // Flute helix lines
    ctx.strokeStyle='rgba(0,0,0,0.55)'; ctx.lineWidth=0.6;
    [-3.5,-1.5,1.5,3.5].forEach(x=>{
      ctx.beginPath(); ctx.moveTo(...P(0.2,x)); ctx.lineTo(...P(3.8,x)); ctx.stroke();
    });
  }

  // Bull nose (flat bottom + corner chamfers)
  {
    const TOOL_R=6, CORN=2;
    const btm=[P(0,-TOOL_R),P(CORN,-TOOL_R),P(0,-(TOOL_R-CORN)),P(0,TOOL_R-CORN),P(CORN,TOOL_R),P(0,TOOL_R)];
    poly([btm[0],btm[1],btm[2],btm[3],btm[4],btm[5]],'#5a5d68','#909090',1.0);
    // Flat face highlight
    const g=ctx.createLinearGradient(...P(0,-4),...P(0,4));
    g.addColorStop(0,'#888'); g.addColorStop(0.5,'#ccc'); g.addColorStop(1,'#888');
    poly([P(0,-(TOOL_R-CORN)),P(CORN,-TOOL_R),P(CORN,TOOL_R),P(0,TOOL_R-CORN)],g,'#aaa',0.5);
  }

  // Contact point (shows lead angle effect)
  {
    const TOOL_R=6;
    const lead=leadDeg*Math.PI/180;
    const cpZ=TOOL_R*(1-Math.cos(lead))*SZ;
    const cpX=TOOL_R*Math.sin(lead)*SW*(lead<0.01?0:1);
    ctx.beginPath();
    ctx.arc(p0.sx+ax[0]*cpZ+pr[0]*cpX, p0.sy+ax[1]*cpZ+pr[1]*cpX, Math.max(2,2.5*SW/8), 0, Math.PI*2);
    ctx.fillStyle='#ff2244'; ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=0.5; ctx.stroke();
  }

  ctx.restore();
}

// Screen-space axis compass (always visible bottom-left)
function drawCompass(ctx, proj, W, H) {
  const CX=60, CY=H-60, R=40;
  ctx.save();
  // Background disk
  ctx.beginPath(); ctx.arc(CX,CY,R+10,0,Math.PI*2);
  ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1; ctx.stroke();

  const p0=proj([0,0,0]);
  [['X',[1,0,0],'#ff4455'],['Y',[0,1,0],'#33dd66'],['Z',[0,0,1],'#3388ff']].forEach(([lbl,dir,c])=>{
    const p1=proj([dir[0]*200,dir[1]*200,dir[2]*200]);
    const dx=p1.sx-p0.sx, dy=p1.sy-p0.sy;
    const l=Math.sqrt(dx*dx+dy*dy)||1;
    const ex=CX+dx/l*R, ey=CY+dy/l*R;
    ctx.beginPath(); ctx.moveTo(CX,CY); ctx.lineTo(ex,ey);
    ctx.strokeStyle=c; ctx.lineWidth=2.5; ctx.stroke();
    // Arrowhead
    const ux=dx/l,uy=dy/l;
    ctx.beginPath(); ctx.moveTo(ex,ey);
    ctx.lineTo(ex-ux*8+uy*4,ey-uy*8-ux*4);
    ctx.lineTo(ex-ux*8-uy*4,ey-uy*8+ux*4);
    ctx.closePath(); ctx.fillStyle=c; ctx.fill();
    // Label
    ctx.fillStyle=c; ctx.font='bold 12px sans-serif';
    ctx.fillText(lbl, ex+4*ux+4, ey+4*uy+4);
  });
  ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='9px sans-serif';
  ctx.fillText('machine',CX-14,CY+R+16);
  ctx.restore();
}

// ─── Viewport ─────────────────────────────────────────────────────────────────

const SHAPE_COLORS = {
  egg:  [105, 175, 245],
  cam:  [245, 165, 70],
  bell: [90,  220, 155],
};

function Viewport3D({ geom, path, axes, shows, activeIdx, leadDeg, shape }) {
  const canvasRef=useRef(null);
  const [drag,setDrag]=useState(null);
  const [view,setView]=useState({rx:-0.62, ry:0.45});
  const [zoom,setZoom]=useState(1.0);
  const [size,setSize]=useState({w:600,h:520});

  // Crisp resize
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ro=new ResizeObserver(e=>{
      const r=e[0].contentRect;
      setSize({w:Math.round(r.width)||600, h:Math.round(r.height)||520});
    });
    ro.observe(canvas); return ()=>ro.disconnect();
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const dpr=window.devicePixelRatio||1;
    const {w:W,h:H}=size;
    canvas.width=W*dpr; canvas.height=H*dpr;
    const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save(); ctx.scale(dpr,dpr);
    paint(ctx,W,H);
    ctx.restore();
  },[size, geom, path, axes, shows, view, zoom, activeIdx, leadDeg, shape]);

  function paint(ctx, W, H) {
    const cx=W/2, cy=H*0.52;
    const sc=zoom*(W/500);
    const {rx,ry}=view;
    const proj=pt=>project(pt,rx,ry,sc,cx,cy);

    const A=axes.A*Math.PI/180, C=axes.C*Math.PI/180;
    const M_t=mat4mul(Rx(A),Rz(C));
    const tPt =p=>{ const w=mat4vec(M_t,[p[0],p[1],p[2],1]); return [w[0],w[1],w[2]]; };
    const tVec=v=>{ const w=mat4vec(M_t,[v[0],v[1],v[2],0]); return [w[0],w[1],w[2]]; };

    // ── Background fill ──
    ctx.fillStyle='#080810'; ctx.fillRect(0,0,W,H);

    // ── Floor grid (XY plane at Z=-135, below the trunnion base) ──
    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=0.7;
    for (let g=-130;g<=130;g+=25) {
      const ga=proj([g,-130,-135]),gb=proj([g,130,-135]);
      ctx.beginPath(); ctx.moveTo(ga.sx,ga.sy); ctx.lineTo(gb.sx,gb.sy); ctx.stroke();
      const gc=proj([-130,g,-135]),gd=proj([130,g,-135]);
      ctx.beginPath(); ctx.moveTo(gc.sx,gc.sy); ctx.lineTo(gd.sx,gd.sy); ctx.stroke();
    }
    ctx.restore();

    // ── Trunnion arms (machine frame) ──
    drawTrunnionArms(ctx, proj);

    // ── Table (rotates with part) ──
    drawTable(ctx, proj, M_t);

    // ── Part mesh ──
    const {pts,norms,tris}=geom;
    const tPts=pts.map(p=>tPt(p));
    const tNorms=norms.map(n=>tVec(n));

    const L1=norm3([0.25,0.72,0.55]);
    const L2=norm3([0.85,0.08,0.42]);
    const AMB=0.42;
    const col=SHAPE_COLORS[shape]||[120,170,220];

    // View direction (toward camera) — derived from projection math
    const vd=[-Math.sin(ry)*Math.cos(rx), Math.sin(rx), Math.cos(ry)*Math.cos(rx)];

    const faceList=tris.map(([ai,bi,ci])=>{
      const pa=tPts[ai],pb=tPts[bi],pc=tPts[ci];
      const depth=(proj(pa).depth+proj(pb).depth+proj(pc).depth)/3;
      const fn=norm3([tNorms[ai][0]+tNorms[bi][0]+tNorms[ci][0],
                      tNorms[ai][1]+tNorms[bi][1]+tNorms[ci][1],
                      tNorms[ai][2]+tNorms[bi][2]+tNorms[ci][2]]);
      return {ai,bi,ci,depth,fn};
    }).filter(f=>dot3(f.fn,vd)>-0.05); // back-face cull
    faceList.sort((a,b)=>b.depth-a.depth);

    for (const {ai,bi,ci,fn} of faceList) {
      const pa=proj(tPts[ai]),pb=proj(tPts[bi]),pc=proj(tPts[ci]);
      const lv=AMB + 0.50*Math.max(0,dot3(fn,L1)) + 0.22*Math.max(0,dot3(fn,L2));
      const sp=Math.pow(Math.max(0,dot3(fn,norm3([L1[0],L1[1]+0.3,L1[2]]))),18)*60;
      const r=Math.min(255,Math.round(col[0]*lv+sp));
      const g=Math.min(255,Math.round(col[1]*lv+sp));
      const b=Math.min(255,Math.round(col[2]*lv+sp));
      ctx.beginPath();
      ctx.moveTo(pa.sx,pa.sy); ctx.lineTo(pb.sx,pb.sy); ctx.lineTo(pc.sx,pc.sy);
      ctx.closePath(); ctx.fillStyle=`rgb(${r},${g},${b})`; ctx.fill();
    }

    // ── Surface normals sampled on mesh ──
    if (shows.normals) {
      const stride=Math.max(1,Math.floor(pts.length/70));
      ctx.save();
      for (let i=0;i<pts.length;i+=stride) {
        if (norms[i][2]<0.08) continue;
        const tp=tPt(pts[i]),tn=tVec(norms[i]);
        const bp=proj(tp),ep=proj([tp[0]+tn[0]*18,tp[1]+tn[1]*18,tp[2]+tn[2]*18]);
        ctx.beginPath(); ctx.moveTo(bp.sx,bp.sy); ctx.lineTo(ep.sx,ep.sy);
        ctx.strokeStyle='rgba(255,80,200,0.55)'; ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(ep.sx,ep.sy,2,0,Math.PI*2);
        ctx.fillStyle='#ff44cc'; ctx.fill();
      }
      ctx.restore();
    }

    // ── Toolpath (in machine frame) ──
    if (shows.toolpath && path.length>1) {
      ctx.save();
      // Draw as segments per pass for cam, continuous spiral for others
      ctx.strokeStyle='rgba(255,210,0,0.80)'; ctx.lineWidth=1.5;
      ctx.beginPath(); let first=true;
      path.forEach(s=>{
        const p=proj([s.X,s.Y,s.Z]);
        if(first){ctx.moveTo(p.sx,p.sy);first=false;} else ctx.lineTo(p.sx,p.sy);
      });
      ctx.stroke();
      ctx.restore();
    }

    // ── Vectors: part-frame axes (dashed, rotate with table) ──
    if (shows.vectors) {
      const origin=tPt([0,0,0]);
      const op=proj(origin);
      ctx.save(); ctx.setLineDash([4,4]);
      [[[1,0,0],'#ff4455'],[[0,1,0],'#33dd66'],[[0,0,1],'#3388ff']].forEach(([d,c])=>{
        const end=tPt([d[0]*38,d[1]*38,d[2]*38]);
        const ep=proj(end);
        ctx.beginPath(); ctx.moveTo(op.sx,op.sy); ctx.lineTo(ep.sx,ep.sy);
        ctx.strokeStyle=c; ctx.lineWidth=1.5; ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();

      // World-space machine axes (solid) drawn at the origin in machine frame
      ctx.save();
      const mO=proj([0,-82,0]);
      [[[40,0,0],'X','#ff4455'],[[0,0,40],'Z','#3388ff'],[[0,40,0],'Y','#33dd66']].forEach(([tip,lbl,c])=>{
        const ep=proj([tip[0],-82,tip[2]]);
        ctx.beginPath(); ctx.moveTo(mO.sx,mO.sy); ctx.lineTo(ep.sx,ep.sy);
        ctx.strokeStyle=c; ctx.lineWidth=2; ctx.stroke();
        const dx=ep.sx-mO.sx,dy=ep.sy-mO.sy,l=Math.sqrt(dx*dx+dy*dy)||1;
        const ux=dx/l,uy=dy/l;
        ctx.beginPath(); ctx.moveTo(ep.sx,ep.sy);
        ctx.lineTo(ep.sx-ux*8+uy*4,ep.sy-uy*8-ux*4);
        ctx.lineTo(ep.sx-ux*8-uy*4,ep.sy-uy*8+ux*4);
        ctx.closePath(); ctx.fillStyle=c; ctx.fill();
        ctx.fillStyle=c; ctx.font='bold 12px sans-serif'; ctx.fillText(lbl,ep.sx+5,ep.sy-3);
      });
      ctx.restore();
    }

    // ── Active tool position + surface normal vector ──
    if (path.length>0 && activeIdx>=0 && activeIdx<path.length) {
      const step=path[activeIdx];
      const tipMach=[step.X,step.Y,step.Z];

      // Surface normal at contact (in machine frame — should be [0,0,1] when IK is perfect)
      if (shows.normals && step.nPart) {
        const nM=tVec(step.nPart);
        const bp=proj(tipMach);
        const ep=proj([step.X+nM[0]*30,step.Y+nM[1]*30,step.Z+nM[2]*30]);
        ctx.save();
        ctx.beginPath(); ctx.moveTo(bp.sx,bp.sy); ctx.lineTo(ep.sx,ep.sy);
        ctx.strokeStyle='#ff22cc'; ctx.lineWidth=2.5; ctx.stroke();
        const dx=ep.sx-bp.sx,dy=ep.sy-bp.sy,l=Math.sqrt(dx*dx+dy*dy)||1;
        const ux=dx/l,uy=dy/l;
        ctx.beginPath(); ctx.moveTo(ep.sx,ep.sy);
        ctx.lineTo(ep.sx-ux*9+uy*4,ep.sy-uy*9-ux*4);
        ctx.lineTo(ep.sx-ux*9-uy*4,ep.sy-uy*9+ux*4);
        ctx.closePath(); ctx.fillStyle='#ff22cc'; ctx.fill();
        ctx.fillStyle='#ff44dd'; ctx.font='bold 10px sans-serif';
        ctx.fillText('n_surface',ep.sx+5,ep.sy-3);
        ctx.restore();
      }

      // Tool axis vector (always [0,0,-1] downward in machine frame)
      if (shows.vectors) {
        const tp=proj(tipMach);
        const ta=proj([step.X,step.Y,step.Z-36]);
        ctx.save();
        ctx.beginPath(); ctx.moveTo(tp.sx,tp.sy); ctx.lineTo(ta.sx,ta.sy);
        ctx.strokeStyle='#44bbff'; ctx.lineWidth=2; ctx.stroke();
        const dx=ta.sx-tp.sx,dy=ta.sy-tp.sy,l=Math.sqrt(dx*dx+dy*dy)||1;
        const ux=dx/l,uy=dy/l;
        ctx.beginPath(); ctx.moveTo(ta.sx,ta.sy);
        ctx.lineTo(ta.sx-ux*9+uy*4,ta.sy-uy*9-ux*4);
        ctx.lineTo(ta.sx-ux*9-uy*4,ta.sy-uy*9+ux*4);
        ctx.closePath(); ctx.fillStyle='#44bbff'; ctx.fill();
        ctx.fillStyle='#66ccff'; ctx.font='bold 10px sans-serif';
        ctx.fillText('[0,0,−1]',ta.sx+5,ta.sy+3);
        ctx.restore();
      }

      // Spindle assembly (drawn last, always in front)
      drawSpindle(ctx, proj, tipMach, leadDeg);
    }

    // ── Compass ──
    if (shows.vectors) drawCompass(ctx, proj, W, H);
  }

  const PRESETS=[
    {label:'Iso',  v:{rx:-0.62,ry:0.45}},
    {label:'Front',v:{rx:-Math.PI/2,ry:0}},
    {label:'Right',v:{rx:-Math.PI/2,ry:-Math.PI/2}},
    {label:'Left', v:{rx:-Math.PI/2,ry:Math.PI/2}},
    {label:'Top',  v:{rx:0,ry:0}},
  ];

  const onMouseDown=useCallback(e=>setDrag({x:e.clientX,y:e.clientY,r:{...view}}),[view]);
  const onMouseMove=useCallback(e=>{
    if(!drag) return;
    setView({rx:drag.r.rx+(e.clientY-drag.y)*0.006, ry:drag.r.ry+(e.clientX-drag.x)*0.006});
  },[drag]);
  const onMouseUp=useCallback(()=>setDrag(null),[]);
  const onWheel=useCallback(e=>{e.preventDefault();setZoom(z=>Math.max(0.3,Math.min(5,z*(e.deltaY<0?1.1:0.9))));},[]);

  return (
    <div style={{position:'relative',width:'100%',height:'100%'}}>
      <canvas ref={canvasRef}
        style={{width:'100%',height:'100%',display:'block',cursor:drag?'grabbing':'grab',touchAction:'none'}}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove}
        onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onWheel={onWheel}
      />
      <div style={{position:'absolute',top:8,right:8,display:'flex',flexDirection:'column',gap:3,pointerEvents:'auto'}}>
        {PRESETS.map(p=>(
          <button key={p.label} onClick={()=>{setView(p.v);setZoom(1.0);}}
            style={{padding:'3px 9px',borderRadius:4,border:'1px solid #2a2a3a',
                    background:'rgba(10,10,20,0.82)',color:'#888',fontSize:9.5,
                    fontWeight:600,cursor:'pointer',letterSpacing:0.3}}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Panels ───────────────────────────────────────────────────────────────────

function MatDisplay({M,label,color='#38bdf8'}) {
  return (
    <div className="mb-3">
      <div className="text-[10px] font-black tracking-wide uppercase mb-1" style={{color}}>{label}</div>
      <div className="font-mono text-[10px] text-slate-300 leading-relaxed bg-black/40 rounded-lg p-2 border shadow-inner" style={{borderColor: color+'44'}}>
        {M.map((row,i)=>(
          <div key={i}>{i===0?'⎡':i===M.length-1?'⎣':'⎢'}{' '}
            {row.map(v=>(v>=0?' ':'')+v.toFixed(3)).join('  ')}{' '}
            {i===0?'⎤':i===M.length-1?'⎦':'⎥'}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixPanel({axes}) {
  const M_C=Rz(axes.C*Math.PI/180);
  const M_A=Rx(axes.A*Math.PI/180);
  const M_table=mat4mul(M_A,M_C);
  return (
    <div className="p-4 overflow-y-auto h-full box-border">
      <div className="font-mono text-[9px] text-slate-400 leading-relaxed mb-4 bg-white/5 dark:bg-black/20 rounded-lg p-2.5 border border-slate-200/20 dark:border-white/10 shadow-sm">
        <span className="text-sky-400 font-bold">p_machine</span> = Rx(A) · Rz(C) · p_part<br/>
        Tool = [0,0,−1] always &nbsp;·&nbsp; TABLE rotates, not spindle<br/>
        IK: C = atan2(nx,ny) &nbsp;·&nbsp; A = acos(nz) − lead
      </div>
      <MatDisplay M={M_C} label={`Rz(C) — table spin  C=${axes.C.toFixed(1)}°`} color='#fbbf24'/>
      <div className="text-[9px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
        Rotates part around Z axis. The 2×2 block in rows 0–1 is [cosC, −sinC; sinC, cosC].
        Spinning C brings any profile direction under the vertical spindle.
      </div>
      <MatDisplay M={M_A} label={`Rx(A) — tilt  A=${axes.A.toFixed(1)}°`} color='#f43f5e'/>
      <div className="text-[9px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
        Tilts entire C+table assembly around machine X. The 2×2 in rows 1–2 is [cosA, −sinA; sinA, cosA].
        A=0 = flat. A=90° = table tipped 90° on its side.
      </div>
      <MatDisplay M={M_table} label='M = Rx(A)·Rz(C)  (part→machine)' color='#a855f7'/>
      <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed">
        Combined rotation. det=1, rows are orthonormal — it's a pure rotation, no scaling/shearing.
        The 3×3 upper-left block fully determines the orientation.
      </div>
    </div>
  );
}

const MATH={
  egg:{title:'Ball-end / Bull-nose Surface Contouring',items:[
    {h:'Ellipsoid parameterization',c:'#38bdf8',b:'p(u,v)=[36·sinv·cosu, 36·sinv·sinu, rz·cosv]. Two angular parameters u∈[0,2π], v∈[0,π] cover every point — like longitude/latitude. The spiral toolpath increments both u and v simultaneously.'},
    {h:'Surface normal from gradient',c:'#f43f5e',b:'For ellipsoid F=x²/rx²+y²/ry²+z²/rz²=1, outward normal n=∇F/|∇F|=[x/rx², y/ry², z/rz²] normalized. This is the exact analytic normal — no numerical differentiation needed.'},
    {h:'IK: C = atan2(nx, ny)',c:'#34d399',b:'C spins the part so the X component of n goes to zero, landing n in the YZ plane. After Rz(C), n becomes [0, √(nx²+ny²), nz]. Think of it as choosing your longitude.'},
    {h:'IK: A = acos(nz) − lead',c:'#fbbf24',b:'A tilts until the normal faces up. Since nz=cos(A) at perfect tracking, A=acos(nz) is the exact solution. Subtracting lead tilts the table slightly less → ball contacts the side of the tool rather than the very tip → better chip flow.'},
  ]},
  cam:{title:'Side-wall & Swarf Milling',items:[
    {h:'Cam profile  r(u) = 28 + 16·cos²·⁵(u)',c:'#fbbf24',b:'The lobe rises quickly (cosine power 2.5) then falls gradually. This asymmetry means the chip cross-section varies around the profile — a real CAM system would modulate feed rate to keep chip load constant.'},
    {h:'Near-vertical walls → A ≈ 85°',c:'#38bdf8',b:'Side wall normals are horizontal: n≈[nx,ny,0]. The IK gives A=acos(0)=90°. Adding a 5° upward blend to the normal gives A≈85°, staying away from the mechanical limit while giving a useful side-contact geometry.'},
    {h:'C tracks the profile direction',c:'#34d399',b:'C=atan2(nx,ny) continuously changes as the tool traverses the cam profile. C effectively aims the "tilt direction" at the current wall face. The boustrophedon (zigzag) pattern is the standard contour strategy for side walls.'},
    {h:'Lead on a side wall = swarf',c:'#f43f5e',b:'Adding lead on a near-vertical wall brings the tool flank into contact — that\'s swarf milling. The side of the flute removes material. Extremely fast but requires a ruled surface (straight generator line) or the tool gouges.'},
  ]},
  bell:{title:'Dome & Flare — A-axis sweep',items:[
    {h:'Compound profile',c:'#34d399',b:'r(t)=22·sinα+18·t^2.5·sinα, z=56·cosα−10·t³·sinα. The t^2.5 flare widens the skirt rapidly with a curvature that changes throughout — typical for bell-housing and turbine cover shapes.'},
    {h:'A sweeps 0→~72°',c:'#38bdf8',b:'At the top nz≈1 → A≈0°. At the flare nz≈0.3 → A≈72°. The trunnion swings 72° to follow the surface. Watch the A slider during playback — the most active axis on this part.'},
    {h:'Curvature → required stepover',c:'#fbbf24',b:'Tight curvature means toolpath rows diverge less per unit height — smaller stepover needed to hit the surface finish spec. CAM computes this from the part\'s principal curvature κ₁ and κ₂ at each point.'},
    {h:'Polar singularity',c:'#f43f5e',b:'At the dome top n=[0,0,1] → C is undefined (any C value works). Post-processors handle this with "polar interpolation" — clamping C motion or using a smooth C=const pass through the pole.'},
  ]},
};

function MathPanel({shape}) {
  const [open,setOpen]=useState(0);
  const c=MATH[shape]||MATH.egg;
  return (
    <div className="p-4 overflow-y-auto h-full box-border">
      <div className="font-bold text-slate-700 dark:text-slate-200 text-[12px] mb-3">{c.title}</div>
      <div className="flex flex-col gap-2">
        {c.items.map((item,i)=>(
          <div key={i} className={`rounded-lg overflow-hidden transition-all duration-300 border ${open===i?'shadow-sm':'border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'}`} style={open===i?{borderColor: item.c+'55', background: item.c+'0a'}:{}}>
            <button onClick={()=>setOpen(open===i?-1:i)}
              className="w-full px-3 py-2.5 border-none cursor-pointer text-left font-bold text-[10.5px] flex justify-between items-center bg-transparent transition-colors"
              style={{color:open===i?item.c:'currentColor'}}>
              <span className={open!==i?'text-slate-600 dark:text-slate-400':''}>{item.h}</span>
              <span className={`transition-transform duration-300 text-[9px] ${open===i?'rotate-180 opacity-80':'opacity-40 text-slate-500'}`}>▼</span>
            </button>
            <div className={`transition-all duration-300 ease-in-out origin-top ${open===i?'max-h-40 opacity-100':'max-h-0 opacity-0'}`}>
              <div className="px-3 pb-3 text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {item.b}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const SHAPES=[
  {id:'egg', label:'Egg',  desc:'Normal tracking',     color:'#0ea5e9'},
  {id:'cam', label:'Cam',  desc:'Side-wall · swarf',   color:'#f59e0b'},
  {id:'bell',label:'Bell', desc:'Dome + flare',        color:'#10b981'},
];

export default function FiveAxisKinematics({onBack}) {
  const [shape,setShape]=useState('egg');
  const [axes,setAxes]=useState({X:0,Y:0,Z:0,A:0,C:0});
  const [leadDeg,setLeadDeg]=useState(5);
  const [shows,setShows]=useState({toolpath:true,normals:false,vectors:true,matrices:true,math:false});
  const [activeIdx,setActiveIdx]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [rightTab,setRightTab]=useState('matrices');
  const playRef=useRef(null);

  const geom=useMemo(()=>shape==='egg'?generateEgg():shape==='cam'?generateCam():generateBell(),[shape]);
  const path=useMemo(()=>makeToolpath(shape,leadDeg),[shape,leadDeg]);

  useEffect(()=>{
    if(!playing) return;
    playRef.current=setInterval(()=>{
      setActiveIdx(i=>{
        const next=i+1>=path.length?0:i+1;
        if(next===0){setPlaying(false);}
        const s=path[next]||path[0];
        if(s) setAxes({A:s.A_deg,C:s.C_deg,X:s.X,Y:s.Y,Z:s.Z});
        return next;
      });
    },28);
    return ()=>clearInterval(playRef.current);
  },[playing,path]);

  const toggle=k=>setShows(s=>({...s,[k]:!s[k]}));

  const TOGG=[
    {k:'toolpath',label:'Toolpath',c:'#eab308'},
    {k:'normals', label:'Normals', c:'#f43f5e'},
    {k:'vectors', label:'Vectors', c:'#38bdf8'},
    {k:'matrices',label:'Matrices',c:'#a855f7'},
    {k:'math',    label:'Math',    c:'#34d399'},
  ];
  const step=path[activeIdx]||null;
  const curShapeObj = SHAPES.find(s=>s.id===shape) || SHAPES[0];

  return (
    <div className="w-full h-full bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl text-slate-800 dark:text-slate-200 font-sans flex flex-col overflow-hidden relative shadow-2xl rounded-2xl border border-slate-200/50 dark:border-white/5">

      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/5 px-6 py-3 flex items-center gap-4 shrink-0 shadow-sm z-10 backdrop-blur-md transition-colors duration-500 flex-wrap">
        {onBack&&(
          <button onClick={onBack} className="bg-transparent border-none text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer text-[11px] tracking-widest font-sans font-bold px-0 transition-colors uppercase">
            ← Labs
          </button>
        )}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 hidden md:block"/>
        
        <div className="flex flex-col">
          <div className="text-[16px] font-black tracking-wide text-slate-800 dark:text-slate-100 font-sans">5-Axis Kinematics</div>
          <div className="text-[9px] text-slate-500 dark:text-slate-400 tracking-[0.1em] uppercase font-bold mt-0.5">
            Table/Trunnion · Spindle vertical · A &amp; C on table
          </div>
        </div>

        <div className="flex-1 min-w-[20px]"/>

        <div className="flex gap-2 flex-wrap items-center bg-slate-100/50 dark:bg-black/20 p-1.5 rounded-xl border border-slate-200/50 dark:border-white/5 shadow-inner">
          {SHAPES.map(s=>(
            <button key={s.id} onClick={()=>{setShape(s.id);setActiveIdx(0);setPlaying(false);}}
              className={`px-3 py-1.5 rounded-lg cursor-pointer text-[10px] font-bold transition-all border flex items-center gap-2 ${shape===s.id ? 'shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
              style={shape===s.id ? { background: s.color, color: '#fff', borderColor: s.color } : { background: 'transparent', borderColor: 'transparent', color: 'currentColor' }}>
              <span>{s.label}</span>
              <span className={`text-[9px] ${shape===s.id ? 'opacity-90' : 'opacity-50'}`}>{s.desc}</span>
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 hidden lg:block"/>

        <div className="flex gap-1.5 flex-wrap items-center">
          {TOGG.map(({k,label,c})=>(
            <button key={k} onClick={()=>toggle(k)}
              className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all border shadow-sm`}
              style={shows[k] ? { background: c+'1e', borderColor: c, color: c } : { background: 'transparent', borderColor: 'rgba(100,116,139,0.3)', color: 'currentColor', opacity: 0.6 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-slate-100/30 dark:bg-transparent">

        {/* Left Control Panel */}
        <div className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800/60 flex flex-col overflow-hidden bg-white/60 dark:bg-slate-950/40 z-10 backdrop-blur-md">

          {/* Machine Axes */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400/50"></span> Machine Axes
            </div>
            <div className="flex flex-col gap-3">
              {[{k:'X',min:-100,max:100,c:'#ef4444',u:'mm'},{k:'Y',min:-100,max:100,c:'#22c55e',u:'mm'},
                {k:'Z',min:-80,max:80,c:'#3b82f6',u:'mm'},{k:'A',min:-110,max:110,c:'#f59e0b',u:'°'},
                {k:'C',min:-180,max:180,c:'#a855f7',u:'°'}
              ].map(({k,min,max,c,u})=>(
                <div key={k} className="flex items-center gap-2">
                  <span className="w-4 text-center font-bold text-[11px] font-mono" style={{color:c}}>{k}</span>
                  <input type='range' min={min} max={max} step={0.5} value={axes[k]}
                    onChange={e=>{setAxes(a=>({...a,[k]:parseFloat(e.target.value)}));setPlaying(false);}}
                    className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    style={{accentColor:c}}/>
                  <span className="w-12 text-right font-mono text-[9.5px] text-slate-500 font-medium bg-slate-100 dark:bg-slate-900 px-1.5 py-1 rounded shadow-inner">
                    {axes[k].toFixed(1)}{u}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Angle */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400/50"></span> Lead Angle
            </div>
            <div className="flex items-center gap-2 mb-3">
              <input type='range' min={0} max={15} step={0.5} value={leadDeg}
                onChange={e=>setLeadDeg(parseFloat(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" style={{accentColor:'#f43f5e'}}/>
              <span className="font-mono text-[10px] text-rose-500 font-bold w-12 text-right bg-rose-50 dark:bg-rose-500/10 px-1.5 py-1 rounded shadow-inner">
                {leadDeg.toFixed(1)}°
              </span>
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Offsets A past perfect IK. <span className="text-rose-500 font-bold">Red dot</span> = contact on bull nose.
            </div>
          </div>

          {/* Toolpath Controls */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800/60 shrink-0">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400/50"></span> Toolpath
            </div>
            <div className="flex gap-2 mb-4">
              <button onClick={()=>setPlaying(v=>!v)}
                className={`flex-1 py-1.5 rounded-lg cursor-pointer font-bold text-[10px] uppercase tracking-wider transition-all border shadow-sm flex justify-center items-center gap-1.5 ${
                  playing ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                }`}>
                {playing?'⏸ Pause':'▶ Play'}
              </button>
              <button onClick={()=>{setActiveIdx(0);setPlaying(false);setAxes({X:0,Y:0,Z:0,A:0,C:0});}}
                className="px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors" title="Reset">
                ↺
              </button>
            </div>
            <div className="relative pt-1">
              <input type='range' min={0} max={Math.max(0,path.length-1)} value={activeIdx}
                onChange={e=>{
                  const idx=parseInt(e.target.value); setActiveIdx(idx); setPlaying(false);
                  if(path[idx]){const s=path[idx];setAxes({A:s.A_deg,C:s.C_deg,X:s.X,Y:s.Y,Z:s.Z});}
                }}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" style={{accentColor:curShapeObj.color}}/>
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 text-center mt-3 font-mono font-medium tracking-wide">
              <span style={{color:curShapeObj.color}}>{activeIdx+1}</span> / {path.length} PTS
            </div>
          </div>

          {/* IK Solution Live Data */}
          <div className="p-5 flex-1 overflow-y-auto">
            <div className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400/50"></span> IK Solution
            </div>
            {step&&(
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[['A',step.A_deg,'°','#f59e0b'],['C',step.C_deg,'°','#a855f7'],
                  ['X',step.X,'mm','#ef4444'],['Y',step.Y,'mm','#22c55e'],['Z',step.Z,'mm','#3b82f6']
                ].map(([k,v,u,c])=>(
                  <div key={k} className="bg-slate-100/80 dark:bg-black/20 rounded-lg p-2 border border-slate-200/50 dark:border-white/5 shadow-inner">
                    <div className="text-[8px] text-slate-400 uppercase font-black">{k}</div>
                    <div className="font-mono text-[11px] font-bold" style={{color:c}}>{v.toFixed(1)}<span className="opacity-50 ml-0.5">{u}</span></div>
                  </div>
                ))}
              </div>
            )}
            {step?.nPart&&(
              <div className="text-[9.5px] text-slate-600 dark:text-slate-300 leading-relaxed font-mono bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg p-3 mb-4 shadow-inner">
                <span className="text-indigo-500 dark:text-indigo-400 font-bold block mb-1">n_part</span>
                [{step.nPart.map(v=>v>=0?' '+v.toFixed(3):v.toFixed(3)).join(', ')}]
              </div>
            )}
            <div className="text-[9.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Tool axis [0,0,−1] always.<br/>
              Table rotates — spindle translates only.
            </div>
          </div>
        </div>

        {/* Viewport 3D */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-[#03060a] min-w-0 relative shadow-inner">
          <div className="flex-1 overflow-hidden relative">
            <Viewport3D geom={geom} path={path} axes={axes} shows={shows}
              activeIdx={activeIdx} leadDeg={leadDeg} shape={shape}/>
          </div>
          <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800/60 text-[9px] text-slate-500 dark:text-slate-400 shrink-0 flex gap-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md uppercase tracking-wider font-bold shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <span className="flex items-center gap-1.5"><span className="text-[12px]">🖱️</span> Drag to rotate · Scroll to zoom</span>
            <span className="flex items-center gap-1.5 ml-auto"><span className="inline-block w-4 h-0 border-t border-dashed border-slate-400"></span> Part Frame</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-4 h-0 border-t border-solid border-slate-400"></span> Machine Frame</span>
          </div>
        </div>

        {/* Right Info Panel */}
        {(shows.matrices||shows.math)&&(
          <div className="w-80 shrink-0 border-l border-slate-200 dark:border-slate-800/60 flex flex-col overflow-hidden bg-white/60 dark:bg-slate-950/40 z-10 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] backdrop-blur-md">
            {shows.matrices&&shows.math&&(
              <div className="flex border-b border-slate-200 dark:border-slate-800/60 shrink-0 bg-slate-50 dark:bg-slate-900/50">
                {['matrices','math'].map(t=>(
                  <button key={t} onClick={()=>setRightTab(t)}
                    className={`flex-1 py-3 bg-transparent border-none cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all ${
                      rightTab===t 
                        ? 'text-slate-800 dark:text-white border-b-2 shadow-[inset_0_-2px_0_0_currentColor]' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-b-2 border-transparent'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
                {shows.matrices&&(!shows.math||rightTab==='matrices')&&<MatrixPanel axes={axes}/>}
                {shows.math&&(!shows.matrices||rightTab==='math')&&<MathPanel shape={shape}/>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
