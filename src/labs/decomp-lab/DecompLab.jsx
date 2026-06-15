import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN
// ─────────────────────────────────────────────────────────────────────────────
const D = {
  bg:       "#09090e",
  surface:  "#0f0f17",
  raised:   "#16161f",
  card:     "#1c1c28",
  border:   "rgba(255,255,255,0.07)",
  border2:  "rgba(255,255,255,0.12)",
  text:     "#f2f0ff",
  muted:    "#8884a8",
  faint:    "#3d3b52",
  violet:   "#8b5cf6",
  violetLt: "#a78bfa",
  cyan:     "#22d3ee",
  cyanDim:  "rgba(34,211,238,0.1)",
  green:    "#34d399",
  greenDim: "rgba(52,211,153,0.1)",
  amber:    "#fbbf24",
  amberDim: "rgba(251,191,36,0.1)",
  red:      "#f87171",
  redDim:   "rgba(248,113,113,0.1)",
  blue:     "#60a5fa",
  blueDim:  "rgba(96,165,250,0.1)",
  pink:     "#f472b6",
};

// ─────────────────────────────────────────────────────────────────────────────
// MATH — pure JS, no dependencies
// ─────────────────────────────────────────────────────────────────────────────

const zeros  = (r,c)  => Array.from({length:r},()=>Array(c).fill(0));
const eye    = n      => Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));
const matMul = (A,B)  => A.map(row=>B[0].map((_,j)=>row.reduce((s,v,k)=>s+v*B[k][j],0)));
const transpose=(A)   => A[0].map((_,j)=>A.map(r=>r[j]));
const vecDot =(a,b)   => a.reduce((s,v,i)=>s+v*b[i],0);
const vecNorm=(v)     => Math.sqrt(vecDot(v,v));
const vecScale=(v,s)  => v.map(x=>x*s);
const vecSub =(a,b)   => a.map((x,i)=>x-b[i]);
const vecAdd =(a,b)   => a.map((x,i)=>x+b[i]);
const fmt    =(n,d=3) => { const v=Math.abs(n)<5e-5?0:n; return (v>=0?" ":"")+v.toFixed(d); };
const fmtS   =(n,d=4) => (Math.abs(n)<5e-5?0:n).toFixed(d);

// ── Jacobi SVD for small matrices ────────────────────────────────────────────
function svd(A) {
  const m = A.length, n = A[0].length;
  const At  = transpose(A);
  const AtA = matMul(At, A);
  let V = eye(n);
  let M = AtA.map(r=>[...r]);
  for (let sweep=0; sweep<50; sweep++) {
    let off=0;
    for (let p=0;p<n;p++) for (let q=p+1;q<n;q++) off+=M[p][q]*M[p][q];
    if (off<1e-18) break;
    for (let p=0;p<n;p++) {
      for (let q=p+1;q<n;q++) {
        if (Math.abs(M[p][q])<1e-12) continue;
        const tau=(M[q][q]-M[p][p])/(2*M[p][q]);
        const t=Math.sign(tau)/(Math.abs(tau)+Math.sqrt(1+tau*tau));
        const c=1/Math.sqrt(1+t*t), s=t*c;
        const Mpp=M[p][p],Mqq=M[q][q],Mpq=M[p][q];
        M[p][p]=c*c*Mpp-2*s*c*Mpq+s*s*Mqq;
        M[q][q]=s*s*Mpp+2*s*c*Mpq+c*c*Mqq;
        M[p][q]=0; M[q][p]=0;
        for (let r=0;r<n;r++) {
          if(r===p||r===q) continue;
          const Mrp=M[r][p],Mrq=M[r][q];
          M[r][p]=c*Mrp-s*Mrq; M[p][r]=M[r][p];
          M[r][q]=s*Mrp+c*Mrq; M[q][r]=M[r][q];
        }
        for (let r=0;r<n;r++) {
          const Vrp=V[r][p],Vrq=V[r][q];
          V[r][p]=c*Vrp-s*Vrq;
          V[r][q]=s*Vrp+c*Vrq;
        }
      }
    }
  }
  const sigmas = M.map((r,i)=>Math.sqrt(Math.max(0,r[i])));
  const order = sigmas.map((_,i)=>i).sort((a,b)=>sigmas[b]-sigmas[a]);
  const S  = order.map(i=>sigmas[i]);
  const Vs = order.map(i=>V.map(r=>r[i]));
  const Vt = transpose(Vs);
  const U = zeros(m,n);
  for (let k=0;k<n;k++) {
    if (S[k]<1e-10) continue;
    const vk = V.map(r=>r[order[k]]);
    const Avk= A.map(row=>vecDot(row,vk));
    for (let i=0;i<m;i++) U[i][k]=Avk[i]/S[k];
  }
  return { U, S, Vt };
}

function svdReconstruct(U, S, Vt, k) {
  const m=U.length, n=Vt[0].length;
  const R=zeros(m,n);
  for (let i=0;i<k;i++) {
    if(S[i]<1e-10) break;
    const ui=U.map(r=>r[i]);
    const vi=Vt[i];
    for (let r=0;r<m;r++) for (let c=0;c<n;c++) R[r][c]+=S[i]*ui[r]*vi[c];
  }
  return R;
}

// ── Least squares via normal equations ───────────────────────────────────────
function vandermonde(xs, degree) {
  return xs.map(x=>Array.from({length:degree+1},(_,j)=>Math.pow(x,j)));
}
function solveNormal(A, b) {
  const At  = transpose(A);
  const AtA = matMul(At,A);
  const Atb = At.map(row=>vecDot(row,b));
  const n   = AtA.length;
  const M   = AtA.map((r,i)=>[...r,Atb[i]]);
  for (let col=0;col<n;col++) {
    let best=col;
    for (let r=col+1;r<n;r++) if(Math.abs(M[r][col])>Math.abs(M[best][col])) best=r;
    [M[col],M[best]]=[M[best],M[col]];
    if(Math.abs(M[col][col])<1e-12) continue;
    for (let r=col+1;r<n;r++) {
      const f=M[r][col]/M[col][col];
      for (let c=col;c<=n;c++) M[r][c]-=f*M[col][c];
    }
  }
  const x=Array(n).fill(0);
  for (let i=n-1;i>=0;i--) {
    x[i]=M[i][n];
    for (let j=i+1;j<n;j++) x[i]-=M[i][j]*x[j];
    x[i]/=M[i][i]||1;
  }
  return x;
}

// ── Generate default synthetic test image ─────────────────────────────────────
function makeTestImage(m, n) {
  const A = zeros(m, n);
  for (let r=0;r<m;r++) {
    for (let c=0;c<n;c++) {
      const x=c/n, y=r/m;
      const grad  = 120*x + 80*y;
      const circ1 = Math.exp(-((x-0.3)**2+(y-0.35)**2)/0.03)*180;
      const circ2 = Math.exp(-((x-0.7)**2+(y-0.65)**2)/0.025)*150;
      const stripe= 40*Math.sin(8*Math.PI*x)*Math.cos(4*Math.PI*y);
      const diag  = 60*Math.max(0,1-Math.abs(x+y-1)*3);
      A[r][c]=Math.min(255,Math.max(0,grad+circ1+circ2+stripe+diag));
    }
  }
  return A;
}

// ─────────────────────────────────────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────────────────────────────────────
function Tag({children,color=D.violet}){
  return <span style={{display:"inline-block",padding:"1px 8px",background:color+"22",
    border:`1px solid ${color}44`,borderRadius:3,fontSize:9,letterSpacing:2,
    color,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{children}</span>;
}
function Def({term,color=D.violet,children}){
  return <div style={{padding:"10px 14px",background:D.raised,border:`1px solid ${color}33`,
    borderRadius:8,marginBottom:10}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
      <Tag color={color}>DEF</Tag>
      <span style={{fontSize:12,fontWeight:700,color,fontFamily:"'DM Mono',monospace"}}>{term}</span>
    </div>
    <div style={{fontSize:11,color:D.muted,lineHeight:1.85}}>{children}</div>
  </div>;
}
function Insight({label,color=D.green,children}){
  return <div style={{padding:"10px 14px",background:color+"0c",
    border:`1px solid ${color}33`,borderRadius:8,marginBottom:10}}>
    <div style={{fontSize:9,color,letterSpacing:2,fontWeight:700,marginBottom:4,
      fontFamily:"'DM Mono',monospace"}}>↳ {label}</div>
    <div style={{fontSize:11,color:D.text,lineHeight:1.85}}>{children}</div>
  </div>;
}
function Eq({children,color=D.violetLt}){
  return <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,
    background:D.raised,border:`1px solid ${D.border2}`,
    borderRadius:6,padding:"8px 14px",lineHeight:2.1,
    color,overflowX:"auto",marginBottom:10,whiteSpace:"pre"}}>{children}</div>;
}

function SmallMatrix({data,color=D.muted,hlDiag=false,label,maxCols=6}){
  const rows = data.length>4 ? [data[0],data[1],["…"],data[data.length-1]] : data;
  const cols = data[0]?.length>maxCols;
  return <div style={{display:"inline-flex",flexDirection:"column",gap:0}}>
    {label&&<div style={{fontSize:8,color:D.faint,letterSpacing:2,marginBottom:3,fontFamily:"'DM Mono',monospace"}}>{label}</div>}
    <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,lineHeight:2.0}}>
      {rows.map((row,ri)=>{
        if(row[0]==="…") return <div key={ri} style={{color:D.faint,paddingLeft:12}}>  ⋮</div>;
        const dispRow=cols?[...row.slice(0,3),"…"]:row;
        return <div key={ri} style={{display:"flex",alignItems:"center"}}>
          <span style={{color:D.faint,fontSize:13,marginRight:2}}>{ri===0?"⎡":ri===rows.length-1?"⎣":"⎢"}</span>
          {dispRow.map((v,ci)=><span key={ci} style={{
            minWidth:46,textAlign:"right",paddingRight:4,
            color:hlDiag&&ri===ci?D.amber:color,
            fontWeight:hlDiag&&ri===ci?"700":"400",
          }}>{typeof v==="number"?fmt(v,2):v}</span>)}
          <span style={{color:D.faint,fontSize:13,marginLeft:2}}>{ri===0?"⎤":ri===rows.length-1?"⎦":"⎥"}</span>
        </div>;
      })}
    </div>
  </div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE CANVAS — renders pixel matrix as grayscale
// ─────────────────────────────────────────────────────────────────────────────
function ImageCanvas({matrix,width=260,height=260,label,badge}){
  const canvasRef=useRef(null);
  useEffect(()=>{
    if(!matrix||!matrix.length) return;
    const canvas=canvasRef.current;
    if(!canvas) return;
    const m=matrix.length,n=matrix[0].length;
    canvas.width=n; canvas.height=m;
    const ctx=canvas.getContext("2d");
    const id=ctx.createImageData(n,m);
    for(let r=0;r<m;r++) for(let c=0;c<n;c++){
      const v=Math.min(255,Math.max(0,Math.round(matrix[r][c])));
      const idx=4*(r*n+c);
      id.data[idx]=v; id.data[idx+1]=v; id.data[idx+2]=v; id.data[idx+3]=255;
    }
    ctx.putImageData(id,0,0);
  },[matrix]);
  return <div style={{position:"relative",display:"inline-block"}}>
    {label&&<div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:4,
      fontFamily:"'DM Mono',monospace"}}>{label}</div>}
    <canvas ref={canvasRef} style={{width,height,imageRendering:"pixelated",
      borderRadius:6,border:`1px solid ${D.border2}`,display:"block"}}/>
    {badge&&<div style={{position:"absolute",bottom:8,left:8,padding:"2px 8px",
      background:"rgba(9,9,14,0.88)",border:`1px solid ${D.border2}`,borderRadius:4,
      fontSize:9,color:D.text,fontFamily:"'DM Mono',monospace"}}>{badge}</div>}
  </div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — SVD IMAGE COMPRESSION
// ─────────────────────────────────────────────────────────────────────────────

const SVD_TOPICS = [
  {id:"what",   label:"What is SVD?",     color:D.violet},
  {id:"usigmav",label:"U · Σ · Vᵀ",      color:D.cyan},
  {id:"rank",   label:"Rank & Energy",    color:D.amber},
  {id:"project",label:"Projection",       color:D.green},
  {id:"ortho",  label:"Gram-Schmidt",     color:D.pink},
];

const DEFAULT_M = 36, DEFAULT_N = 48;

function SVDTab(){
  const defaultImg = useMemo(()=>makeTestImage(DEFAULT_M, DEFAULT_N),[]);
  const [original, setOriginal] = useState(defaultImg);
  const [isCustom, setIsCustom] = useState(false);
  const [k, setK]  = useState(4);
  const [topic, setTopic] = useState("what");
  const fileRef = useRef(null);

  const m = original.length;
  const n = original[0]?.length ?? DEFAULT_N;

  const {U,S,Vt} = useMemo(()=>svd(original),[original]);
  const maxK = S.filter(s=>s>0.1).length;

  // Clamp k when image changes
  useEffect(()=>{ setK(prev=>Math.min(prev,Math.max(1,maxK))); },[maxK]);

  const reconstructed = useMemo(()=>svdReconstruct(U,S,Vt,k),[U,S,Vt,k]);
  const totalEnergy   = useMemo(()=>S.reduce((s,v)=>s+v*v,0),[S]);
  const capturedPct   = useMemo(()=>S.slice(0,k).reduce((s,v)=>s+v*v,0)/totalEnergy*100,[S,k,totalEnergy]);
  const compressionRatio = useMemo(()=>{
    const orig=m*n;
    const compressed=k*(m+n+1);
    return (orig/compressed).toFixed(2);
  },[k,m,n]);

  const residual = useMemo(()=>original.map((row,r)=>row.map((v,c)=>Math.abs(v-reconstructed[r][c]))),[original,reconstructed]);

  const topicColor = SVD_TOPICS.find(t=>t.id===topic)?.color||D.violet;

  const handleUpload = useCallback(e=>{
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev=>{
      const img = new Image();
      img.onload = ()=>{
        // Scale down to fit within 80px on the longer side
        const MAX = 80;
        let w = img.width, h = img.height;
        const scale = Math.min(MAX/w, MAX/h, 1);
        w = Math.max(4, Math.round(w*scale));
        h = Math.max(4, Math.round(h*scale));
        const cnv = document.createElement("canvas");
        cnv.width = w; cnv.height = h;
        const ctx = cnv.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        const matrix = Array.from({length:h}, (_,r)=>
          Array.from({length:w}, (_,c)=>{
            const i = 4*(r*w+c);
            // Luminosity grayscale conversion
            return 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2];
          })
        );
        setOriginal(matrix);
        setIsCustom(true);
        setK(4);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  },[]);

  const handleReset = useCallback(()=>{
    setOriginal(defaultImg);
    setIsCustom(false);
    setK(4);
  },[defaultImg]);

  return <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
    {/* Left: images + controls */}
    <div style={{width:340,flexShrink:0,borderRight:`1px solid ${D.border}`,
      display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* Images */}
      <div style={{padding:"14px 16px",display:"flex",gap:12,flexWrap:"wrap",
        borderBottom:`1px solid ${D.border}`,background:D.surface}}>
        <ImageCanvas matrix={original}      width={120} height={90} label="ORIGINAL"          badge={`${m}×${n}`}/>
        <ImageCanvas matrix={reconstructed} width={120} height={90} label="RECONSTRUCTED"     badge={`k=${k}`}/>
        <ImageCanvas matrix={residual}      width={120} height={90} label="RESIDUAL (ERROR)"  badge="lost info"/>
        {/* Upload controls */}
        <div style={{display:"flex",gap:6,alignItems:"center",width:"100%",marginTop:2}}>
          <button onClick={()=>fileRef.current?.click()}
            style={{padding:"4px 12px",background:"transparent",
              border:`1px solid ${D.violet}55`,color:D.violet,fontSize:9,
              borderRadius:4,cursor:"pointer",fontFamily:"'DM Mono',monospace",letterSpacing:2}}>
            ↑ UPLOAD IMAGE
          </button>
          {isCustom && (
            <button onClick={handleReset}
              style={{padding:"4px 10px",background:"transparent",
                border:`1px solid ${D.border2}`,color:D.faint,fontSize:9,
                borderRadius:4,cursor:"pointer",fontFamily:"'DM Mono',monospace",letterSpacing:2}}>
              RESET DEFAULT
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*"
            onChange={handleUpload} style={{display:"none"}}/>
        </div>
        {isCustom && (
          <div style={{fontSize:9,color:D.faint,fontFamily:"'DM Mono',monospace",
            padding:"3px 8px",background:D.raised,borderRadius:4,
            border:`1px solid ${D.border}`}}>
            Custom image — {m}×{n} px (scaled to fit SVD)
          </div>
        )}
      </div>

      {/* k slider */}
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${D.border}`,background:D.surface}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:10,color:D.muted,fontFamily:"'DM Mono',monospace",letterSpacing:1}}>
            Singular values kept: <span style={{color:D.violet,fontWeight:700}}>k = {k}</span>
            <span style={{color:D.faint}}> / {maxK}</span>
          </span>
          <span style={{fontSize:10,color:D.amber,fontFamily:"'DM Mono',monospace"}}>
            {capturedPct.toFixed(1)}% energy
          </span>
        </div>
        <input type="range" min={1} max={maxK} step={1} value={k}
          onChange={e=>setK(parseInt(e.target.value))}
          style={{width:"100%",accentColor:D.violet,cursor:"pointer"}}/>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:D.faint,marginTop:2,fontFamily:"'DM Mono',monospace"}}>
          <span>k=1 (blurry)</span><span>k={maxK} (lossless)</span>
        </div>
      </div>

      {/* Compression stats */}
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${D.border}`,
        display:"flex",gap:12,background:D.raised}}>
        {[
          {label:"COMPRESSION",   val:`${compressionRatio}×`, color:D.green},
          {label:"ENERGY KEPT",   val:`${capturedPct.toFixed(1)}%`, color:D.amber},
          {label:"RANK USED",     val:`${k}`,                  color:D.violet},
          {label:"VALUES STORED", val:`${k*(m+n+1)}`,          color:D.cyan},
        ].map(({label,val,color})=>(
          <div key={label} style={{flex:1,padding:"8px 8px",background:D.card,borderRadius:6,
            border:`1px solid ${color}22`,textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:700,color,fontFamily:"'DM Mono',monospace"}}>{val}</div>
            <div style={{fontSize:8,color:D.faint,letterSpacing:1,marginTop:2}}>{label}</div>
          </div>
        ))}
      </div>

      {/* Singular values bar chart */}
      <div style={{padding:"12px 16px",flex:1,overflowY:"auto",background:D.bg}}>
        <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:8,fontFamily:"'DM Mono',monospace"}}>
          SINGULAR VALUES σᵢ — each bar = one "layer" of the image
        </div>
        <div style={{display:"flex",gap:2,alignItems:"flex-end",height:80,overflow:"hidden"}}>
          {S.slice(0,maxK).map((sv,i)=>{
            const h=Math.max(2,(sv/S[0])*76);
            const kept=i<k;
            return <div key={i} title={`σ${i}=${sv.toFixed(1)}`}
              style={{flex:1,minWidth:4,height:h,borderRadius:"2px 2px 0 0",
                background:kept?D.violet:D.faint,
                transition:"background .2s",cursor:"pointer"}}
              onClick={()=>setK(i+1)}/>;
          })}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:D.faint,marginTop:2,fontFamily:"'DM Mono',monospace"}}>
          <span>σ₀={S[0].toFixed(0)} (largest)</span>
          <span>σ{maxK-1}={S[maxK-1].toFixed(1)} (smallest)</span>
        </div>
        <div style={{fontSize:9,color:D.faint,marginTop:6}}>Click a bar to set k. Violet = kept, gray = discarded.</div>
      </div>
    </div>

    {/* Right: concepts */}
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{display:"flex",borderBottom:`1px solid ${D.border}`,
        background:D.surface,flexShrink:0,overflowX:"auto"}}>
        {SVD_TOPICS.map(t=>(
          <button key={t.id} onClick={()=>setTopic(t.id)}
            style={{padding:"9px 14px",fontSize:9,letterSpacing:2,cursor:"pointer",
              fontFamily:"'DM Mono',monospace",border:"none",flexShrink:0,
              borderBottom:`2px solid ${t.id===topic?t.color:"transparent"}`,
              background:t.id===topic?t.color+"0d":"transparent",
              color:t.id===topic?t.color:D.faint,fontWeight:t.id===topic?"700":"400"}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <Tag color={topicColor}>{SVD_TOPICS.find(t=>t.id===topic)?.label}</Tag>
        </div>

        {topic==="what" && <>
          <Def term="Singular Value Decomposition" color={D.violet}>
            Every matrix A (m×n) can be written as:<br/>
            <span style={{fontFamily:"'DM Mono',monospace",color:D.violetLt}}>A = U · Σ · Vᵀ</span><br/>
            U is m×m orthogonal, Σ is m×n diagonal (singular values on diagonal),
            Vᵀ is n×n orthogonal. The singular values σᵢ in Σ are always ≥ 0 and sorted
            largest to smallest.
          </Def>
          <Insight label="THE IMAGE IS THE MATRIX" color={D.violet}>
            This {m}×{n} image <em>is</em> a matrix of numbers — pixel brightness
            0–255. SVD decomposes it into <strong>{maxK} rank-1 "layers"</strong>, each one
            a single outer product σᵢ·uᵢ·vᵢᵀ. The first layer (largest σ) captures the
            most information. You're throwing away layers with small σ — that's compression.
          </Insight>
          <Eq>{`A = σ₁·u₁v₁ᵀ  +  σ₂·u₂v₂ᵀ  +  …  +  σᵣ·uᵣvᵣᵀ

  k=${k}: keeping first ${k} term${k>1?"s":""}
  Energy captured: ${capturedPct.toFixed(1)}%`}</Eq>
          <Def term="Rank-1 Outer Product" color={D.violet}>
            uᵢ·vᵢᵀ is an m×n matrix formed from one column of U and one row of Vᵀ.
            It's the simplest possible matrix — rank 1 — one "pattern" scaled by σᵢ.
            SVD says any matrix is a sum of these patterns, ordered by importance.
          </Def>
        </>}

        {topic==="usigmav" && <>
          <Def term="U matrix (left singular vectors)" color={D.cyan}>
            U is m×m and <strong>orthogonal</strong> — its columns are orthonormal vectors
            that form a basis for the row space of A. Each column uᵢ is a "pattern" in
            pixel-row space.
          </Def>
          <Def term="Σ (Sigma) — the diagonal" color={D.amber}>
            Σ has singular values σ₁ ≥ σ₂ ≥ … ≥ σᵣ ≥ 0 on the diagonal.
            σᵢ² = eigenvalue of AᵀA. Large σᵢ = important pattern.
            σᵢ = 0 means that direction carries no information.
          </Def>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>
              TOP 6 SINGULAR VALUES (current image)
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {S.slice(0,6).map((sv,i)=>(
                <div key={i} style={{padding:"6px 10px",background:D.card,borderRadius:5,
                  border:`1px solid ${i<k?D.amber+"44":D.faint+"44"}`,
                  fontFamily:"'DM Mono',monospace",fontSize:11}}>
                  <div style={{color:i<k?D.amber:D.faint,fontWeight:"700"}}>
                    σ{i} = {sv.toFixed(1)}
                  </div>
                  <div style={{fontSize:9,color:D.faint,marginTop:2}}>
                    {(S[i]*S[i]/totalEnergy*100).toFixed(1)}% energy
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Def term="Vᵀ (right singular vectors)" color={D.green}>
            Vᵀ is n×n orthogonal. Its rows (= V's columns) are orthonormal vectors
            that form a basis for the column space of A. Each row vᵢᵀ is a "pattern"
            in pixel-column space.
          </Def>
          <Insight label="WHY Uᵀ U = I AND VᵀV = I" color={D.cyan}>
            U and V are orthogonal matrices — their columns are mutually perpendicular
            unit vectors (orthonormal basis). This means Uᵀ=U⁻¹. In the image:
            the U patterns are uncorrelated row-patterns, V patterns are uncorrelated column-patterns.
            Orthogonality is what lets you discard layers independently without cross-contamination.
          </Insight>
        </>}

        {topic==="rank" && <>
          <Def term="Rank" color={D.amber}>
            The rank of a matrix = number of non-zero singular values = number of linearly
            independent rows (= linearly independent columns). This image has rank {maxK} —
            it takes {maxK} layers to represent it exactly. Using k&lt;{maxK} gives an
            approximation (rank-k approximation).
          </Def>
          <Insight label="ENERGY = σᵢ² / Σσⱼ²" color={D.amber}>
            The "energy" (Frobenius norm squared) of each layer is σᵢ².
            Keeping k layers captures {capturedPct.toFixed(1)}% of total energy.
            This is the mathematical reason JPEG-like compression works —
            human eyes don't notice the missing low-energy layers.
          </Insight>
          <div style={{padding:"12px 14px",background:D.raised,borderRadius:8,
            border:`1px solid ${D.amber}33`,marginBottom:10}}>
            <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:8,fontFamily:"'DM Mono',monospace"}}>
              CUMULATIVE ENERGY vs K
            </div>
            {[1,2,3,5,8,12,20,maxK].map(ki=>{
              if(ki>maxK) return null;
              const pct=S.slice(0,ki).reduce((s,v)=>s+v*v,0)/totalEnergy*100;
              return <div key={ki} style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:ki<=k?D.amber:D.faint,minWidth:40}}>k={ki}</span>
                <div style={{flex:1,height:6,background:D.faint+"44",borderRadius:3,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:"100%",background:ki<=k?D.amber:D.faint+"88",borderRadius:3}}/>
                </div>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:ki<=k?D.amber:D.faint,minWidth:48,textAlign:"right"}}>
                  {pct.toFixed(1)}%
                </span>
              </div>;
            })}
          </div>
          <Def term="Eckart–Young–Mirsky Theorem" color={D.amber}>
            The rank-k SVD truncation is the <strong>best possible rank-k approximation</strong>
            of A in both Frobenius and spectral norms. No other rank-k matrix is closer to A.
            This is why SVD is used for compression, not just any factorization.
          </Def>
        </>}

        {topic==="project" && <>
          <Def term="Orthogonal Projection" color={D.green}>
            The projection of vector b onto the column space of A is:<br/>
            <span style={{fontFamily:"'DM Mono',monospace",color:D.green}}>
              p = A(AᵀA)⁻¹Aᵀ b
            </span><br/>
            The matrix P = A(AᵀA)⁻¹Aᵀ is called the <strong>projection matrix</strong>.
            It "drops a perpendicular" from b down to the closest point in Col(A).
          </Def>
          <Insight label="SVD MAKES PROJECTION TRIVIAL" color={D.green}>
            With A = UΣVᵀ, the projection matrix becomes P = UUᵀ.
            Projecting onto the first k columns: P_k = U_k U_kᵀ.
            That's all SVD compression is — projecting the image onto the k-dimensional
            subspace spanned by the first k left singular vectors.
          </Insight>
          <Eq>{`Projection onto rank-${k} subspace:
P_${k} = U_${k} U_${k}ᵀ

For any image vector x:
  p = P_${k} x  ← best approximation in k dimensions
  r = x - p    ← residual, ⊥ to Col(U_${k})`}</Eq>
          <Def term="Orthogonal Complement" color={D.green}>
            The residual r = b − p is orthogonal to every vector in Col(A).
            So ℝⁿ = Col(A) ⊕ Null(Aᵀ) — every vector splits into a projection
            (in the column space) plus a residual (in the left null space).
            This decomposition is fundamental to least squares.
          </Def>
        </>}

        {topic==="ortho" && <>
          <Def term="Gram-Schmidt Process" color={D.pink}>
            Given linearly independent vectors v₁,v₂,…,vₙ, Gram-Schmidt produces an
            orthonormal basis q₁,q₂,…,qₙ for the same space:
          </Def>
          <Eq color={D.pink}>{`u₁ = v₁
q₁ = u₁ / ‖u₁‖

u₂ = v₂ − (v₂·q₁)q₁        ← remove component along q₁
q₂ = u₂ / ‖u₂‖

u₃ = v₃ − (v₃·q₁)q₁ − (v₃·q₂)q₂
q₃ = u₃ / ‖u₃‖`}</Eq>
          <Insight label="GRAM-SCHMIDT BUILDS THE U AND V MATRICES" color={D.pink}>
            The columns of U in SVD are orthonormal — they were built by running
            Gram-Schmidt on the eigenvectors of AAᵀ. The QR decomposition
            (A = QR) is essentially Gram-Schmidt stored as a matrix factorization.
            Every time you use SVD, Gram-Schmidt is hiding inside.
          </Insight>
          <Def term="QR Decomposition" color={D.pink}>
            QR factors A into an orthogonal matrix Q (Gram-Schmidt output) and
            an upper-triangular matrix R. Numerically, QR decomposition is HOW
            computers compute SVD — it's more stable than working with AᵀA directly.
          </Def>
          <Insight label="WHY ORTHOGONALITY IS THE WHOLE GAME" color={D.pink}>
            Orthogonal bases let you handle each component independently.
            When Q is orthogonal, Qᵀ = Q⁻¹ (free inversion!), projections are just
            dot products, and you can add/remove components without affecting others.
            Gram-Schmidt is how you manufacture this beautiful structure from any basis.
          </Insight>
        </>}
      </div>
    </div>
  </div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — LEAST SQUARES CURVE FITTING
// ─────────────────────────────────────────────────────────────────────────────
const LS_TOPICS = [
  {id:"over",    label:"Overdetermined",  color:D.cyan},
  {id:"normal",  label:"Normal Equation", color:D.amber},
  {id:"colspace",label:"Column Space",    color:D.green},
  {id:"svdls",   label:"SVD & LS",        color:D.violet},
];

const PRESET_DATASETS = [
  {
    label:"Custom (click plot)",
    points: null,
  },
  {
    label:"Projectile height",
    points: [
      {x:0,y:0},{x:0.5,y:2.2},{x:1,y:3.9},{x:1.5,y:5.0},
      {x:2,y:5.6},{x:2.5,y:5.7},{x:3,y:5.3},{x:3.5,y:4.4},
      {x:4,y:3.0},{x:4.5,y:1.1},{x:5,y:0.1},
    ],
  },
  {
    label:"Population growth",
    points: [
      {x:0,y:1.0},{x:1,y:1.3},{x:2,y:1.7},{x:3,y:2.1},{x:4,y:2.8},
      {x:5,y:3.7},{x:6,y:4.8},{x:7,y:6.1},{x:8,y:7.9},{x:9,y:9.5},
    ],
  },
  {
    label:"Noisy linear signal",
    points: [
      {x:0.3,y:0.8},{x:1.1,y:1.9},{x:2.0,y:2.5},{x:2.9,y:3.8},
      {x:3.8,y:4.2},{x:4.5,y:5.4},{x:5.3,y:5.9},{x:6.1,y:7.1},
      {x:7.0,y:7.6},{x:7.8,y:8.8},{x:8.6,y:9.1},{x:9.4,y:9.7},
    ],
  },
];

const DEFAULT_POINTS = [
  {x:0.5,y:1.2},{x:1.2,y:2.8},{x:2.1,y:3.4},{x:2.8,y:4.1},
  {x:3.5,y:3.7},{x:4.2,y:4.9},{x:5.0,y:5.8},{x:5.8,y:6.2},
  {x:6.5,y:5.5},{x:7.2,y:6.8},{x:8.0,y:7.4},{x:8.8,y:7.0},
];

const CW=440, CH=340;
const PAD=36;
function scaleX(x,xMin,xMax){return PAD+(x-xMin)/(xMax-xMin)*(CW-2*PAD);}
function scaleY(y,yMin,yMax){return CH-PAD-(y-yMin)/(yMax-yMin)*(CH-2*PAD);}

function LeastSquaresTab(){
  const canvasRef=useRef(null);
  const [points,setPoints]=useState(DEFAULT_POINTS);
  const [degree,setDegree]=useState(1);
  const [topic,setTopic]=useState("over");
  const [preset,setPreset]=useState(0);

  const xMin=0,xMax=10,yMin=0,yMax=10;
  const xs=points.map(p=>p.x), ys=points.map(p=>p.y);

  const A  = useMemo(()=>vandermonde(xs,degree),[xs,degree]);
  const At = useMemo(()=>transpose(A),[A]);
  const AtA= useMemo(()=>matMul(At,A),[At,A]);
  const Atb= useMemo(()=>At.map(row=>vecDot(row,ys)),[At,ys]);
  const coeffs=useMemo(()=>{ try{return solveNormal(A,ys);}catch{return Array(degree+1).fill(0);} },[A,ys,degree]);

  const polyAt=useCallback((x)=>coeffs.reduce((s,c,i)=>s+c*Math.pow(x,i),0),[coeffs]);
  const curveXs=useMemo(()=>Array.from({length:100},(_,i)=>xMin+(xMax-xMin)*i/99),[]);
  const curveYs=useMemo(()=>curveXs.map(polyAt),[curveXs,polyAt]);

  const predicted=useMemo(()=>xs.map(polyAt),[xs,polyAt]);
  const residuals=useMemo(()=>ys.map((y,i)=>y-predicted[i]),[ys,predicted]);
  const rss=useMemo(()=>residuals.reduce((s,r)=>s+r*r,0),[residuals]);

  const onCanvasClick=useCallback(e=>{
    if(preset!==0) return; // only allow clicks in custom mode
    const rect=canvasRef.current.getBoundingClientRect();
    const cx2=(e.clientX-rect.left)/rect.width*CW;
    const cy2=(e.clientY-rect.top)/rect.height*CH;
    const mx=xMin+(cx2-PAD)/(CW-2*PAD)*(xMax-xMin);
    const my=yMin+(CH-PAD-cy2)/(CH-2*PAD)*(yMax-yMin);
    if(mx<xMin||mx>xMax||my<yMin||my>yMax) return;
    setPoints(pts=>[...pts,{x:mx,y:my}]);
  },[preset]);

  const handlePreset = useCallback(idx=>{
    setPreset(idx);
    if(PRESET_DATASETS[idx].points) setPoints(PRESET_DATASETS[idx].points);
    else setPoints(DEFAULT_POINTS);
  },[]);

  useEffect(()=>{
    const canvas=canvasRef.current;
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,CW,CH);
    ctx.fillStyle=D.bg; ctx.fillRect(0,0,CW,CH);
    ctx.strokeStyle=D.border; ctx.lineWidth=0.5;
    for(let i=0;i<=10;i++){
      const gx=scaleX(i,xMin,xMax), gy=scaleY(i,yMin,yMax);
      ctx.beginPath(); ctx.moveTo(gx,PAD); ctx.lineTo(gx,CH-PAD); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD,gy); ctx.lineTo(CW-PAD,gy); ctx.stroke();
    }
    ctx.strokeStyle=D.faint; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(PAD,CH-PAD); ctx.lineTo(CW-PAD,CH-PAD); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD,PAD);    ctx.lineTo(PAD,CH-PAD);    ctx.stroke();
    ctx.fillStyle=D.faint; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="center";
    for(let i=0;i<=10;i+=2){
      ctx.fillText(i,scaleX(i,xMin,xMax),CH-PAD+12);
      ctx.textAlign="right";
      ctx.fillText(i,PAD-6,scaleY(i,yMin,yMax)+3);
      ctx.textAlign="center";
    }
    ctx.beginPath(); ctx.strokeStyle=D.violet; ctx.lineWidth=2.5; ctx.setLineDash([]);
    curveXs.forEach((x,i)=>{
      const px2=scaleX(x,xMin,xMax), py2=scaleY(curveYs[i],yMin,yMax);
      if(py2<PAD-10||py2>CH-PAD+10) return;
      i===0?ctx.moveTo(px2,py2):ctx.lineTo(px2,py2);
    });
    ctx.stroke();
    ctx.strokeStyle=D.red+"88"; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
    points.forEach((pt,i)=>{
      const px2=scaleX(pt.x,xMin,xMax), py2=scaleY(pt.y,yMin,yMax);
      const ppy=scaleY(predicted[i],yMin,yMax);
      ctx.beginPath(); ctx.moveTo(px2,py2); ctx.lineTo(px2,ppy); ctx.stroke();
    });
    ctx.setLineDash([]);
    points.forEach((pt)=>{
      const px2=scaleX(pt.x,xMin,xMax), py2=scaleY(pt.y,yMin,yMax);
      ctx.fillStyle=D.cyan; ctx.shadowColor=D.cyan; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.arc(px2,py2,4.5,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
    });
  },[points,curveXs,curveYs,predicted]);

  const topicColor=LS_TOPICS.find(t=>t.id===topic)?.color||D.cyan;

  return <div style={{display:"flex",flex:1,overflow:"hidden",minHeight:0}}>
    <div style={{width:360,flexShrink:0,borderRight:`1px solid ${D.border}`,
      display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* Preset selector */}
      <div style={{padding:"10px 16px",borderBottom:`1px solid ${D.border}`,
        background:D.surface,display:"flex",gap:4,flexWrap:"wrap"}}>
        {PRESET_DATASETS.map((ds,i)=>(
          <button key={i} onClick={()=>handlePreset(i)}
            style={{padding:"4px 10px",fontSize:9,letterSpacing:1,cursor:"pointer",
              fontFamily:"'DM Mono',monospace",border:`1px solid ${i===preset?D.cyan:D.border}`,
              borderRadius:4,background:i===preset?D.cyan+"22":"transparent",
              color:i===preset?D.cyan:D.faint}}>
            {ds.label}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${D.border}`,background:D.surface}}>
        <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>
          {preset===0?"CLICK TO ADD DATA POINTS":"PRESET DATASET"} — {points.length} points, degree {degree} fit
        </div>
        <canvas ref={canvasRef} width={CW} height={CH} onClick={onCanvasClick}
          style={{width:"100%",cursor:preset===0?"crosshair":"default",borderRadius:6,
            border:`1px solid ${D.border2}`,display:"block"}}/>
      </div>

      {/* Controls */}
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${D.border}`,background:D.surface}}>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>
            POLYNOMIAL DEGREE
          </div>
          <div style={{display:"flex",gap:6}}>
            {[1,2,3,4].map(d=>(
              <button key={d} onClick={()=>setDegree(d)}
                style={{flex:1,padding:"6px 0",borderRadius:4,fontSize:10,cursor:"pointer",
                  fontFamily:"'DM Mono',monospace",border:`1px solid ${d===degree?D.violet:D.border}`,
                  background:d===degree?D.violet+"22":"transparent",
                  color:d===degree?D.violet:D.faint}}>
                {["","Linear\n(deg 1)","Quad\n(deg 2)","Cubic\n(deg 3)","Deg 4"][d]}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1,padding:"8px 10px",background:D.card,borderRadius:6,border:`1px solid ${D.red}22`}}>
            <div style={{fontSize:16,fontWeight:700,color:D.red,fontFamily:"'DM Mono',monospace"}}>
              {rss.toFixed(3)}
            </div>
            <div style={{fontSize:8,color:D.faint,letterSpacing:1}}>RSS ‖r‖²</div>
          </div>
          <div style={{flex:1,padding:"8px 10px",background:D.card,borderRadius:6,border:`1px solid ${D.amber}22`}}>
            <div style={{fontSize:16,fontWeight:700,color:D.amber,fontFamily:"'DM Mono',monospace"}}>
              {points.length}×{degree+1}
            </div>
            <div style={{fontSize:8,color:D.faint,letterSpacing:1}}>MATRIX SIZE</div>
          </div>
          <div style={{flex:1,padding:"8px 10px",background:D.card,borderRadius:6,border:`1px solid ${D.green}22`}}>
            <div style={{fontSize:16,fontWeight:700,color:D.green,fontFamily:"'DM Mono',monospace"}}>
              {coeffs.length>3?`${coeffs.length} coeffs`:coeffs.map(c=>c.toFixed(2)).join(", ")}
            </div>
            <div style={{fontSize:8,color:D.faint,letterSpacing:1}}>COEFFICIENTS</div>
          </div>
        </div>
        {preset===0&&(
          <button onClick={()=>setPoints([])} style={{marginTop:8,width:"100%",padding:"5px",
            background:"transparent",border:`1px solid ${D.border2}`,color:D.faint,fontSize:9,
            borderRadius:4,cursor:"pointer",fontFamily:"'DM Mono',monospace",letterSpacing:2}}>
            CLEAR POINTS
          </button>
        )}
      </div>

      {/* Matrix A live */}
      <div style={{padding:"12px 16px",flex:1,overflowY:"auto",background:D.bg}}>
        <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:6,fontFamily:"'DM Mono',monospace"}}>
          VANDERMONDE MATRIX A (first 4 rows)
        </div>
        <SmallMatrix data={A.slice(0,4)} color={D.cyan} label="A — each row is [1, xᵢ, xᵢ², …]"/>
      </div>
    </div>

    {/* Right: concepts */}
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{display:"flex",borderBottom:`1px solid ${D.border}`,
        background:D.surface,flexShrink:0,overflowX:"auto"}}>
        {LS_TOPICS.map(t=>(
          <button key={t.id} onClick={()=>setTopic(t.id)}
            style={{padding:"9px 14px",fontSize:9,letterSpacing:2,cursor:"pointer",
              fontFamily:"'DM Mono',monospace",border:"none",flexShrink:0,
              borderBottom:`2px solid ${t.id===topic?t.color:"transparent"}`,
              background:t.id===topic?t.color+"0d":"transparent",
              color:t.id===topic?t.color:D.faint,fontWeight:t.id===topic?"700":"400"}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <Tag color={topicColor}>{LS_TOPICS.find(t=>t.id===topic)?.label}</Tag>
        </div>

        {topic==="over" && <>
          <Def term="Overdetermined System" color={D.cyan}>
            You have {points.length} data points but only {degree+1} unknowns (polynomial coefficients).
            That's {points.length} equations, {degree+1} unknowns — an <strong>overdetermined system</strong>
            Ax = b where A is {points.length}×{degree+1}.
            In general, no exact solution exists. We find the <em>closest</em> one instead.
          </Def>
          <Insight label="WHY NO EXACT SOLUTION EXISTS" color={D.cyan}>
            Your {points.length} noisy data points don't all lie on any single degree-{degree} polynomial.
            b (your y-values) is NOT in the column space of A.
            We need to find x̂ that makes Ax̂ as close to b as possible — minimizing ‖b − Ax‖².
            The red dashed lines on the plot are the residuals r = b − Ax̂.
          </Insight>
          <Eq>{`System: Ax = b    (${points.length} equations, ${degree+1} unknowns)

A = Vandermonde matrix (each row: [1, xᵢ, xᵢ², …])
x = [c₀, c₁, …, c_d]ᵀ  (coefficients to find)
b = [y₁, y₂, …, y_n]ᵀ  (observed values)

Current: A is ${points.length}×${degree+1},  rank(A) = ${Math.min(points.length,degree+1)}`}</Eq>
          <Def term="Residual Vector" color={D.cyan}>
            r = b − Ax̂ is the <strong>residual</strong> — the error.
            RSS = ‖r‖² = {rss.toFixed(3)} = sum of squared vertical distances on the plot.
            Least squares finds x̂ that minimizes this.
          </Def>
        </>}

        {topic==="normal" && <>
          <Def term="Normal Equation" color={D.amber}>
            Minimizing ‖b − Ax‖² leads to the <strong>normal equation</strong>:<br/>
            <span style={{fontFamily:"'DM Mono',monospace",color:D.amber}}>AᵀAx = Aᵀb</span><br/>
            This is a square ({degree+1}×{degree+1}) system that always has a unique solution
            when A has full column rank (columns linearly independent).
          </Def>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:8,fontFamily:"'DM Mono',monospace"}}>
              AᵀA (LIVE — {degree+1}×{degree+1})
            </div>
            <SmallMatrix data={AtA} color={D.amber} hlDiag/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:9,color:D.faint,letterSpacing:2,marginBottom:8,fontFamily:"'DM Mono',monospace"}}>
              SOLUTION x̂ = (AᵀA)⁻¹Aᵀb
            </div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,lineHeight:2,
              padding:"8px 12px",background:D.card,borderRadius:6,border:`1px solid ${D.amber}33`}}>
              {coeffs.map((c,i)=>(
                <div key={i}><span style={{color:D.faint}}>c{i} = </span>
                  <span style={{color:D.amber,fontWeight:700}}>{c.toFixed(4)}</span>
                  <span style={{color:D.faint,fontSize:9,marginLeft:8}}>
                    (coefficient of x^{i})
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Insight label="WHY AᵀA IS ALWAYS SQUARE AND SYMMETRIC" color={D.amber}>
            A is {points.length}×{degree+1}. Aᵀ is {degree+1}×{points.length}.
            So AᵀA is {degree+1}×{degree+1} — always square regardless of how many data points.
            It's also symmetric (AᵀA = (AᵀA)ᵀ) and positive semi-definite.
            This is why the normal equation is solvable even when A isn't square.
          </Insight>
        </>}

        {topic==="colspace" && <>
          <Def term="Projection onto Column Space" color={D.green}>
            The least-squares solution Ax̂ = p is the <strong>orthogonal projection</strong>
            of b onto Col(A). The projection matrix is:<br/>
            <span style={{fontFamily:"'DM Mono',monospace",color:D.green}}>P = A(AᵀA)⁻¹Aᵀ</span>
          </Def>
          <Insight label="THE FUNDAMENTAL THEOREM OF LINEAR ALGEBRA" color={D.green}>
            ℝⁿ splits into two orthogonal subspaces:<br/>
            Col(A) ⊕ Null(Aᵀ) = ℝⁿ<br/><br/>
            Your b (observed data) lives in ℝⁿ. It splits into:<br/>
            <strong>p = Ax̂</strong> (projection INTO Col(A) — the fit)<br/>
            <strong>r = b − p</strong> (residual — perpendicular to Col(A))<br/><br/>
            The red dashed lines on the canvas ARE this orthogonal decomposition.
            Least squares finds p because p is the closest point in Col(A) to b.
          </Insight>
          <Eq color={D.green}>{`b     = p       +  r
      ↓              ↓
b = Ax̂  +  (b − Ax̂)
        ↓              ↓
   in Col(A)    ⊥ to Col(A)

‖b‖² = ‖p‖² + ‖r‖²  (Pythagoras!)`}</Eq>
          <Def term="Why Aᵀr = 0 (Optimality Condition)" color={D.green}>
            At the optimal x̂, the residual r is perpendicular to every column of A.
            This means Aᵀr = 0 — and substituting r = b−Ax̂ gives Aᵀ(b−Ax̂) = 0,
            which rearranges to the normal equation AᵀAx̂ = Aᵀb. The two derivations
            are the same thing: geometry = algebra.
          </Def>
        </>}

        {topic==="svdls" && <>
          <Def term="Least Squares via SVD" color={D.violet}>
            Using A = UΣVᵀ, the least-squares solution becomes:<br/>
            <span style={{fontFamily:"'DM Mono',monospace",color:D.violet}}>
              x̂ = V Σ⁺ Uᵀ b
            </span><br/>
            where Σ⁺ is the <strong>pseudoinverse</strong> of Σ — replace each σᵢ with 1/σᵢ
            (and 0 where σᵢ=0). This works even when AᵀA is singular.
          </Def>
          <Insight label="WHY SVD IS BETTER THAN NORMAL EQUATIONS" color={D.violet}>
            The normal equation AᵀAx = Aᵀb involves AᵀA, whose condition number is
            σ_max²/σ_min². This squares the condition number of A — numerically terrible
            when A is nearly rank-deficient. SVD works directly with A's singular values
            and is the most numerically stable method. MATLAB's backslash operator uses SVD.
          </Insight>
          <Def term="Moore-Penrose Pseudoinverse" color={D.violet}>
            A⁺ = V Σ⁺ Uᵀ is the pseudoinverse of A. It generalizes the inverse to
            non-square and singular matrices. Properties:<br/>
            • AA⁺A = A<br/>
            • A⁺AA⁺ = A⁺<br/>
            • (AA⁺)ᵀ = AA⁺  (symmetric projection)<br/>
            The least-squares solution is x̂ = A⁺b, the minimum-norm solution.
          </Def>
          <Insight label="THE UNIFIED PICTURE" color={D.violet}>
            SVD + least squares appear together everywhere: linear regression (data science),
            GPS positioning (overdetermined trilateration), image reconstruction (MRI),
            principal component analysis, control systems, signal denoising, Google's PageRank.
            The math you're learning in class IS the engine of modern computing.
          </Insight>
        </>}
      </div>
    </div>
  </div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function DecompLab({ onBack }) {
  const [mainTab, setMainTab] = useState("svd");
  const MAIN_TABS = [
    { id:"svd", label:"IMAGE COMPRESSION", sub:"Singular Value Decomposition", color:D.violet },
    { id:"ls",  label:"CURVE FITTING",     sub:"Least Squares & Projection",   color:D.cyan   },
  ];
  const activeTab = MAIN_TABS.find(t=>t.id===mainTab);

  return (
    <div style={{ background:D.bg, minHeight:"100vh", display:"flex",
      flexDirection:"column", fontFamily:"'DM Mono','Courier New',monospace",
      color:D.text, fontSize:13 }}>

      {/* ── NAV ── */}
      <div style={{ height:48, display:"flex", alignItems:"center", padding:"0 20px",
        borderBottom:`1px solid ${D.border2}`, background:D.surface,
        flexShrink:0, gap:16 }}>
        {onBack && (
          <button onClick={onBack}
            style={{ padding:"4px 10px", background:"transparent",
              border:`1px solid ${D.border2}`, color:D.muted, fontSize:9,
              borderRadius:4, cursor:"pointer",
              fontFamily:"'Space Mono',monospace", letterSpacing:2 }}>
            ← LABS
          </button>
        )}
        <span style={{ fontSize:13, fontWeight:700, letterSpacing:4, color:D.violet }}>
          DECOMP LAB
        </span>
        <span style={{ fontSize:8, color:D.faint, letterSpacing:3 }}>
          LINEAR ALGEBRA · REAL-WORLD APPLICATIONS
        </span>
        <div style={{flex:1}}/>
        <div style={{ display:"flex", background:D.raised, borderRadius:6,
          border:`1px solid ${D.border2}`, padding:3, gap:2 }}>
          {MAIN_TABS.map(t=>(
            <button key={t.id} onClick={()=>setMainTab(t.id)}
              style={{ padding:"5px 16px", borderRadius:4, fontSize:9, letterSpacing:2,
                fontFamily:"'DM Mono',monospace", cursor:"pointer", border:"none",
                background:t.id===mainTab?t.color+"22":"transparent",
                color:t.id===mainTab?t.color:D.faint,
                fontWeight:t.id===mainTab?"700":"400", transition:"all .15s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SUBHEADER ── */}
      <div style={{ padding:"10px 20px", borderBottom:`1px solid ${D.border}`,
        background:D.surface, flexShrink:0,
        display:"flex", alignItems:"center", gap:12 }}>
        <Tag color={activeTab.color}>{activeTab.sub}</Tag>
        <span style={{ fontSize:10, color:D.faint }}>
          {mainTab==="svd"
            ? "A grayscale image is a matrix. SVD decomposes it into ranked layers — fewer layers = more compression. Upload your own image to see it decomposed."
            : "Select a preset dataset or click the plot to add points. Least squares finds the polynomial that best fits noisy data."}
        </span>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ display:"flex", flex:1, overflow:"hidden", minHeight:0 }}>
        {mainTab==="svd" ? <SVDTab/> : <LeastSquaresTab/>}
      </div>
    </div>
  );
}
