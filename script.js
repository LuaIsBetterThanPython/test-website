// Check if its linear
function isLinearEquation(eq) {
  if (!eq) return false;
  eq = eq.replace(/\s+/g, '').toLowerCase();
  return !(/([xy]\^(\d+)|[xy]\*\*|\bxy\b)/.test(eq) && !/([xy]\^1)/.test(eq));
}

// Parse linear equations
function parseEquationGeneral(eq) {
  if (!eq) return null;
  eq = eq.replace(/\s+/g, '').toLowerCase();
  if (!eq.includes('=')) eq += '=0';
  const [left, right] = eq.split('=');
  const expr = `${left}-(${right})`;
  let a = 0, b = 0, c = 0;
  const terms = expr.match(/[+-]?\d*\.?\d*(x|y)?/g)?.filter(t => t && t !== '+' && t !== '-') || [];
  for (let term of terms) {
    const match = term.match(/^([+-]?\d*\.?\d*)(x|y)?$/);
    if (!match) continue;
    let [, coeffStr, variable] = match;
    if (coeffStr === '' || coeffStr === '+') coeffStr = '1';
    else if (coeffStr === '-') coeffStr = '-1';
    const coeff = parseFloat(coeffStr);
    if (isNaN(coeff)) continue;
    if (variable === 'x') a += coeff;
    else if (variable === 'y') b += coeff;
    else c += coeff;
  }
  return [a, b, -c];
}

// Parse function for nonlinear
function parseFunction(eq) {
  if (!eq) return null;
  eq = eq.replace(/\s+/g, '').toLowerCase().replace(/\^/g, '**');
  if (!eq.includes('=')) return null;
  const [lhs, rhs] = eq.split('=');
  if (lhs === 'y') return { func: x => { try { return eval(rhs.replace(/x/g, `(${x})`)); } catch { return NaN; } }, isYofX: true };
  if (lhs === 'x') return { func: y => { try { return eval(rhs.replace(/y/g, `(${y})`)); } catch { return NaN; } }, isYofX: false };
  return null;
}

// -------------------------------
// Form Submit
document.getElementById("solver-form").addEventListener("submit", e => {
  e.preventDefault();
  const eq1 = document.getElementById("eq1").value;
  const eq2 = document.getElementById("eq2").value;
  const lin1 = isLinearEquation(eq1), lin2 = isLinearEquation(eq2);

  const outputBox = document.querySelector(".output");
  const stepsBox = document.querySelector(".steps");
  const graph = document.getElementById("graph");

  outputBox.classList.remove("show");
  stepsBox.classList.remove("show");
  graph.classList.remove("show");

  setTimeout(() => {
    if (lin1 && lin2) {
      const eq1Parsed = parseEquationGeneral(eq1);
      const eq2Parsed = parseEquationGeneral(eq2);
      solveLinear(eq1Parsed, eq2Parsed);
    } else {
      const f1 = parseFunction(eq1), f2 = parseFunction(eq2);
      if (f1 && f2) solveNonlinear(f1.func, f2.func);
      else showError("❌ Unable to interpret one or both equations!");
    }
    outputBox.classList.add("show");
    stepsBox.classList.add("show");
    graph.classList.add("show");
  }, 150);
});

// -------------------------------
// Show / Error
function showError(msg) {
  document.getElementById("result-error").textContent = msg;
  document.getElementById("result-x").textContent = "x = ?";
  document.getElementById("result-y").textContent = "y = ?";
  document.getElementById("steps-output").innerHTML = "";
}

function showResult(x, y, html) {
  document.getElementById("result-error").textContent = "";
  document.getElementById("result-x").textContent = `x = ${x}`;
  document.getElementById("result-y").textContent = `y = ${y}`;
  document.getElementById("steps-output").innerHTML = html;
}

// -------------------------------
// Linear Solver
function solveLinear(eq1Parsed, eq2Parsed) {
  const [a1, b1, c1] = eq1Parsed;
  const [a2, b2, c2] = eq2Parsed;
  const D = a1*b2 - a2*b1;
  if(Math.abs(D)<1e-10){ showResult("—","—","<p>Lines are parallel or identical.</p>"); drawGraphLinear(a1,b1,c1,a2,b2,c2,NaN,NaN); return; }
  const x = (c1*b2 - b1*c2)/D;
  const y = (a1*c2 - a2*c1)/D;
  showResult(x.toFixed(3), y.toFixed(3), `<p>Cramer’s Rule:</p><p>Δ = ${D.toFixed(3)}</p><p>x = ${x.toFixed(3)}, y = ${y.toFixed(3)}</p>`);
  drawGraphLinear(a1,b1,c1,a2,b2,c2,x,y);
}

// -------------------------------
// Nonlinear Solver
function solveNonlinear(f1,f2){
  const pts=[];
  const step=0.001, range=20;
  let prevX=-range, prevDiff=f1(prevX)-f2(prevX);
  for(let x=-range+step;x<=range;x+=step){
    const diff=f1(x)-f2(x);
    if(!isFinite(diff)) continue;
    if(prevDiff*diff<0){
      let a=prevX,b=x;
      for(let i=0;i<30;i++){
        const m=(a+b)/2;
        (f1(a)-f2(a))*(f1(m)-f2(m) <= 0) ? b=m : a=m;
      }
      const root=(a+b)/2;
      pts.push({x:root,y:f1(root)});
    }
    prevDiff=diff; prevX=x;
  }
  if(!pts.length){ showResult("—","—","<p>No intersection found in range.</p>"); }
  else{
    const txt=pts.map((p,i)=>`P${i+1}: (${p.x.toFixed(3)}, ${p.y.toFixed(3)})`).join("<br>");
    showResult("Multiple","Multiple","<p>Intersections:</p>"+txt);
  }
  drawGraphCurves({func:f1,isYofX:true},{func:f2,isYofX:true},pts);
}

// -------------------------------
// Draw Graphs
function drawGraphLinear(a1,b1,c1,a2,b2,c2,xv,yv){
  const cvs=document.getElementById("graph"),ctx=cvs.getContext("2d");
  ctx.clearRect(0,0,cvs.width,cvs.height);
  const sc=40,ox=cvs.width/2,oy=cvs.height/2;
  ctx.strokeStyle="#555";
  ctx.beginPath();
  ctx.moveTo(0,oy); ctx.lineTo(cvs.width,oy);
  ctx.moveTo(ox,0); ctx.lineTo(ox,cvs.height);
  ctx.stroke();
  function line(a,b,c,col){
    ctx.strokeStyle=col; ctx.beginPath();
    const x1=-ox/sc,x2=ox/sc;
    if(Math.abs(b)<1e-9)return;
    const y1=(c-a*x1)/b,y2=(c-a*x2)/b;
    ctx.moveTo(ox+x1*sc,oy-y1*sc);
    ctx.lineTo(ox+x2*sc,oy-y2*sc); ctx.stroke();
  }
  line(a1,b1,c1,"#00ffcc"); line(a2,b2,c2,"#ff66cc");
  if(!isNaN(xv)&&!isNaN(yv)){
    ctx.fillStyle="#ffcc00"; ctx.beginPath();
    ctx.arc(ox+xv*sc,oy-yv*sc,6,0,2*Math.PI); ctx.fill();
  }
}

function drawGraphCurves(f1,f2,pts=[]){
  const cvs=document.getElementById("graph"),ctx=cvs.getContext("2d");
  ctx.clearRect(0,0,cvs.width,cvs.height);
  const sc=30,ox=cvs.width/2,oy=cvs.height/2;

  // axes
  ctx.strokeStyle="#555";
  ctx.beginPath();
  ctx.moveTo(0,oy); ctx.lineTo(cvs.width,oy);
  ctx.moveTo(ox,0); ctx.lineTo(ox,cvs.height);
  ctx.stroke();

  function curve(fobj,col){
    if(!fobj) return;
    const {func,isYofX}=fobj;
    ctx.strokeStyle=col;
    ctx.beginPath();
    let first=true;
    const step=0.02;
    const start=-ox/sc, end=ox/sc;
    for(let t=start;t<=end;t+=step){
      let x,y;
      if(isYofX){ x=t; y=func(x); }
      else { y=t; x=func(y); }
      if(!isFinite(x)||!isFinite(y)){ first=true; continue; }
      const px=ox+x*sc, py=oy-y*sc;
      if(first){ ctx.moveTo(px,py); first=false; } else ctx.lineTo(px,py);
    }
    ctx.stroke();
  }

  curve(f1,"#00ffcc"); curve(f2,"#ff66cc");

  // intersection points
  ctx.fillStyle="#ffcc00";
  pts.forEach(p=>{
    if(!isFinite(p.x)||!isFinite(p.y)) return;
    ctx.beginPath();
    ctx.arc(ox+p.x*sc,oy-p.y*sc,5,0,2*Math.PI);
    ctx.fill();
  });
}

// -------------------------------
// Theme toggle
document.getElementById("theme-toggle").onclick=()=>document.body.classList.toggle("light-mode");
document.getElementById("example-select").onchange=e=>{
  if(!e.target.value) return;
  const [a,b]=e.target.value.split(";");
  document.getElementById("eq1").value=a;
  document.getElementById("eq2").value=b;
};
