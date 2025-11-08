// Global variables for zoom and pan
let zoomLevel = 1;
let panX = 0;
let panY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Tab Switching (Main Tabs)
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tool-card').forEach(c => c.classList.remove('active'));
  
  // Find the clicked button
  const clickedButton = event.target;
  clickedButton.classList.add('active');
  document.getElementById(tab).classList.add('active');
  
  // If switching to the new 'system' tab, redraw the graph (if inputs exist)
  if (tab === 'system') {
    updateSystemGraph();
  }
}

// Settings Functions
function toggleSettings() {
  const panel = document.getElementById('settings-panel');
  panel.classList.toggle('show');
}

function changeTheme() {
  const theme = document.getElementById('theme-select').value;
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('math-toolkit-theme', theme);
}

function changeBgColor() {
  const color1 = document.getElementById('bg-color').value;
  const color2 = document.getElementById('accent-color').value;
  const bgType = document.getElementById('bg-type-select').value;

  document.body.style.setProperty('--bg-color-1', color1);
  localStorage.setItem('math-toolkit-bg-color-1', color1);

  // Reapply gradient immediately if background type is gradient or color
  if (bgType === 'gradient' || bgType === 'color') {
    document.body.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  }
}

function changeAccentColor() {
  const color1 = document.getElementById('bg-color').value;
  const color2 = document.getElementById('accent-color').value;
  const bgType = document.getElementById('bg-type-select').value;

  document.body.style.setProperty('--bg-color-2', color2);
  localStorage.setItem('math-toolkit-bg-color-2', color2);

  if (bgType === 'gradient' || bgType === 'color') {
    document.body.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  }
}

function changeBgType() {
  const type = document.getElementById('bg-type-select').value;
  const gradientSettings = document.getElementById('gradient-settings');
  const imageSettings = document.getElementById('image-settings');
  
  if(type === 'image') {
    gradientSettings.style.display = 'none';
    imageSettings.style.display = 'block';
  } else {
    gradientSettings.style.display = 'block';
    imageSettings.style.display = 'none';
    // Restore gradient
    const color1 = localStorage.getItem('math-toolkit-bg-color-1') || '#667eea';
    const color2 = localStorage.getItem('math-toolkit-bg-color-2') || '#764ba2';
    document.body.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  }
  localStorage.setItem('math-toolkit-bg-type', type);
}

function uploadBgImage() {
  const file = document.getElementById('bg-image-upload').files[0];
  if(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageData = e.target.result;
      document.body.style.background = `url('${imageData}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      localStorage.setItem('math-toolkit-bg-image', imageData);
    };
    reader.readAsDataURL(file);
  }
}

function resetSettings() {
  if(confirm('Are you sure you want to reset all settings to default?')) {
    // Clear all saved settings
    localStorage.removeItem('math-toolkit-theme');
    localStorage.removeItem('math-toolkit-bg-color-1');
    localStorage.removeItem('math-toolkit-bg-color-2');
    localStorage.removeItem('math-toolkit-bg-type');
    localStorage.removeItem('math-toolkit-bg-image');
    
    // Reset to defaults
    document.body.setAttribute('data-theme', 'light');
    document.getElementById('theme-select').value = 'light';
    
    document.body.style.setProperty('--bg-color-1', '#667eea');
    document.body.style.setProperty('--bg-color-2', '#764ba2');
    document.getElementById('bg-color').value = '#667eea';
    document.getElementById('accent-color').value = '#764ba2';
    
    document.getElementById('bg-type-select').value = 'gradient';
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundAttachment = '';
    
    document.getElementById('gradient-settings').style.display = 'block';
    document.getElementById('image-settings').style.display = 'none';
    document.getElementById('bg-image-upload').value = '';
    
    alert('Settings reset to default!');
  }
}

// Load saved settings on page load
window.addEventListener('DOMContentLoaded', function() {
  // Load theme
  const savedTheme = localStorage.getItem('math-toolkit-theme');
  if(savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-select').value = savedTheme;
  }
  
  // Load background colors
  const savedColor1 = localStorage.getItem('math-toolkit-bg-color-1');
  const savedColor2 = localStorage.getItem('math-toolkit-bg-color-2');
  if(savedColor1) {
    document.body.style.setProperty('--bg-color-1', savedColor1);
    document.getElementById('bg-color').value = savedColor1;
  }
  if(savedColor2) {
    document.body.style.setProperty('--bg-color-2', savedColor2);
    document.getElementById('accent-color').value = savedColor2;
  }
  
  // Load background type and image
  const savedBgType = localStorage.getItem('math-toolkit-bg-type');
  if(savedBgType) {
    document.getElementById('bg-type-select').value = savedBgType;
    if(savedBgType === 'image') {
      document.getElementById('gradient-settings').style.display = 'none';
      document.getElementById('image-settings').style.display = 'block';
      
      const savedImage = localStorage.getItem('math-toolkit-bg-image');
      if(savedImage) {
        document.body.style.background = `url('${savedImage}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
      }
    }
  }
});

// Toggle Equation Type (Quadratic/Cubic)
function toggleEqType() {
  const type = document.getElementById('eq-type').value;
  document.getElementById('quadratic-inputs').style.display = type === 'quadratic' ? 'block' : 'none';
  document.getElementById('cubic-inputs').style.display = type === 'cubic' ? 'block' : 'none';
}

// Toggle Matrix Operation
function toggleMatrixOp() {
  const op = document.getElementById('matrix-op').value;
  document.getElementById('matrix-b-group').style.display = op === 'multiply' ? 'block' : 'none';
}

// ========== SYSTEM SOLVER (UNIFIED) FUNCTIONS ==========

// Helper function to convert a string to an executable function
function parseMathFunction(str) {
  str = str.toLowerCase()
    .replace(/\^/g, '**')
    .replace(/sqrt/g, 'Math.sqrt')
    .replace(/cbrt/g, 'Math.cbrt')
    .replace(/sin/g, 'Math.sin')
    .replace(/cos/g, 'Math.cos')
    .replace(/tan/g, 'Math.tan')
    .replace(/exp/g, 'Math.exp')
    .replace(/log/g, 'Math.log')
    .replace(/abs/g, 'Math.abs')
    .replace(/pow/g, 'Math.pow');
  
  return new Function('x', `return ${str};`);
}

// Helper function to find zeros (roots) of a function (used for intersections)
function findZeros(func, xMin, xMax) {
  const zeros = [];
  const step = (xMax - xMin) / 500;
  
  for(let x = xMin; x < xMax; x += step) {
    const y1 = func(x);
    const y2 = func(x + step);
    
    if(isFinite(y1) && isFinite(y2)) {
      if(Math.abs(y1) < 0.01) {
        if(!zeros.some(z => Math.abs(z - x) < 0.1)) {
          zeros.push(x);
        }
      } else if(y1 * y2 < 0) {
        let a = x, b = x + step;
        // Bisection method for refining the root
        for(let i = 0; i < 20; i++) {
          const mid = (a + b) / 2;
          const yMid = func(mid);
          if(Math.abs(yMid) < 0.001) break;
          if(func(a) * yMid < 0) b = mid;
          else a = mid;
        }
        const zero = (a + b) / 2;
        if(!zeros.some(z => Math.abs(z - zero) < 0.1)) {
          zeros.push(zero);
        }
      }
    }
  }
  
  return zeros.sort((a, b) => a - b);
}

// Function to handle function button inserts
function insertFunc(func) {
  const eq1Input = document.getElementById('system-eq1');
  const eq2Input = document.getElementById('system-eq2');
  
  // Insert into the currently focused input box, default to eq1Input
  let targetInput = document.activeElement;
  if (targetInput !== eq1Input && targetInput !== eq2Input) {
    targetInput = eq1Input;
  }
  
  targetInput.value += func;
  targetInput.focus();
}

function showRootInput() {
  const rootInput = document.getElementById('root-input');
  rootInput.style.display = rootInput.style.display === 'none' ? 'block' : 'none';
}

function insertCustomRoot() {
  const n = document.getElementById('custom-root').value;
  if(n && n >= 2) {
    insertFunc(`pow(x, 1/${n})`);
    document.getElementById('root-input').style.display = 'none';
    document.getElementById('custom-root').value = '';
  }
}

// Function called by drag/zoom to re-render the graph without changing the result box
function updateSystemGraph() {
    solveSystem(false);
}

function zoomGraph(direction) {
  if(direction === -1) zoomLevel *= 1.5;
  else zoomLevel /= 1.5;
  zoomLevel = Math.max(0.1, Math.min(zoomLevel, 20));
  document.getElementById('zoom-level').textContent = `Zoom: ${zoomLevel.toFixed(1)}x`;
  updateSystemGraph();
}

function resetZoom() {
  zoomLevel = 1;
  panX = 0;
  panY = 0;
  document.getElementById('zoom-level').textContent = 'Zoom: 1x';
  updateSystemGraph();
}

function setupCanvasDrag(canvas) {
  canvas.onmousedown = (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  };
  
  canvas.onmousemove = (e) => {
    if(isDragging) {
      panX += e.clientX - lastMouseX;
      panY += e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      updateSystemGraph();
    }
  };
  
  canvas.onmouseup = () => isDragging = false;
  canvas.onmouseleave = () => isDragging = false;
  
  // Touch support
  canvas.ontouchstart = (e) => {
    isDragging = true;
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
    e.preventDefault();
  };
  
  canvas.ontouchmove = (e) => {
    if(isDragging) {
      panX += e.touches[0].clientX - lastMouseX;
      panY += e.touches[0].clientY - lastMouseY;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
      updateSystemGraph();
      e.preventDefault();
    }
  };
  
  canvas.ontouchend = () => isDragging = false;
}

// New Core Function: System Solver
function solveSystem(showResult = true) {
  const funcStr1 = document.getElementById('system-eq1').value.trim();
  const funcStr2 = document.getElementById('system-eq2').value.trim();
  const resultBox = document.getElementById('system-result');
  const canvas = document.getElementById('system-graph');
  
  if(!funcStr1 || !funcStr2) {
    if (showResult) {
        resultBox.innerHTML = '<h3 class="error">Error</h3><p>Please enter both equations.</p>';
        resultBox.classList.add('show');
    }
    // Clear canvas
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  
  const ctx = canvas.getContext('2d');
  const w = canvas.width = 700;
  const h = canvas.height = 500;
  ctx.clearRect(0, 0, w, h);
  
  const scale = 40 * zoomLevel;
  const ox = w/2 + panX;
  const oy = h/2 + panY;
  
  // Grid
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--grid-color') || '#e0e0e0';
  ctx.lineWidth = 1;
  for(let i = -20; i <= 20; i++) {
    if(ox + i*scale >= 0 && ox + i*scale <= w) {
      ctx.beginPath();
      ctx.moveTo(ox + i*scale, 0);
      ctx.lineTo(ox + i*scale, h);
      ctx.stroke();
    }
    if(oy + i*scale >= 0 && oy + i*scale <= h) {
      ctx.beginPath();
      ctx.moveTo(0, oy + i*scale);
      ctx.lineTo(w, oy + i*scale);
      ctx.stroke();
    }
  }
  
  // Axes
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--axis-color') || '#666';
  ctx.lineWidth = 2;
  if(oy >= 0 && oy <= h) {
    ctx.beginPath();
    ctx.moveTo(0, oy);
    ctx.lineTo(w, oy);
    ctx.stroke();
  }
  if(ox >= 0 && ox <= w) {
    ctx.beginPath();
    ctx.moveTo(ox, 0);
    ctx.lineTo(ox, h);
    ctx.stroke();
  }
  
  // Parse and evaluate functions
  try {
    const func1 = parseMathFunction(funcStr1);
    const func2 = parseMathFunction(funcStr2);
    
    // Function to draw a single function
    function drawFunction(func, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      let started = false;
      for(let px = 0; px < w; px += 1) {
        const x = (px - ox) / scale;
        const y = func(x);
        
        if(!isNaN(y) && isFinite(y)) {
          const py = oy - y * scale;
          if(py >= -100 && py <= h + 100) {
            if(!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            started = false;
          }
        } else {
          started = false;
        }
      }
      ctx.stroke();
    }
    
    // Draw both functions
    drawFunction(func1, '#e74c3c'); // Red for Eq 1
    drawFunction(func2, '#667eea'); // Blue for Eq 2
    
    // Find intersection points (roots of f1(x) - f2(x))
    const diffFunc = (x) => func1(x) - func2(x);
    const xMin = (0 - ox) / scale;
    const xMax = (w - ox) / scale;
    const intersections = findZeros(diffFunc, xMin, xMax);
    
    if(intersections.length > 0) {
      // Draw intersection points
      ctx.fillStyle = '#27ae60'; // Green
      const solutions = [];
      intersections.forEach(x_sol => {
        const y_sol = func1(x_sol);
        solutions.push({x: x_sol, y: y_sol});
        
        const px = ox + x_sol * scale;
        const py = oy - y_sol * scale;
        if(px >= 0 && px <= w && py >= 0 && py <= h) {
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, 2*Math.PI);
          ctx.fill();
        }
      });
      
      if (showResult) {
          let solutionsHTML = solutions.map(sol => `<li>x = ${sol.x.toFixed(4)}, y = ${sol.y.toFixed(4)}</li>`).join('');
          resultBox.innerHTML = `<h3 class="success">System Solved & Graphed!</h3><p><strong>Intersection Points:</strong></p><ul class="solution-list">${solutionsHTML}</ul><p style="margin-top: 10px;">Drag to pan, use zoom controls to explore!</p>`;
      }
    } else {
      if (showResult) {
          resultBox.innerHTML = '<h3 class="success">System Solved & Graphed!</h3><p>No intersections found in visible range. Try zooming or panning!</p>';
      }
    }
    
    if (showResult) {
        resultBox.classList.add('show');
    }
    
    // Enable dragging
    setupCanvasDrag(canvas);
    
  } catch(e) {
    if (showResult) {
        resultBox.innerHTML = `<h3 class="error">Error</h3><p>Invalid function format. Use x as variable in both equations.</p><p>Examples: x^2, sqrt(x), sin(x), 1/x</p>`;
        resultBox.classList.add('show');
    }
  }
}


// ========== EQUATION SOLVER (UNCHANGED) ==========
function solveEquation() {
  const type = document.getElementById('eq-type').value;
  const resultBox = document.getElementById('equation-result');
  
  if(type === 'quadratic') {
    const a = parseFloat(document.getElementById('quad-a').value);
    const b = parseFloat(document.getElementById('quad-b').value);
    const c = parseFloat(document.getElementById('quad-c').value);
    
    if(a === 0) {
      resultBox.innerHTML = '<h3 class="error">Error</h3><p>Coefficient "a" cannot be zero for a quadratic equation.</p>';
      resultBox.classList.add('show');
      return;
    }
    
    const disc = b*b - 4*a*c;
    let html = `<h3>Quadratic Solution</h3><p><strong>Equation:</strong> ${a}x² + ${b}x + ${c} = 0</p><p><strong>Discriminant:</strong> ${disc.toFixed(4)}</p>`;
    
    if(disc > 0) {
      const x1 = (-b + Math.sqrt(disc)) / (2*a);
      const x2 = (-b - Math.sqrt(disc)) / (2*a);
      html += `<p class="success"><strong>Two real roots:</strong></p><p>x₁ = ${x1.toFixed(4)}</p><p>x₂ = ${x2.toFixed(4)}</p>`;
    } else if(disc === 0) {
      const x = -b / (2*a);
      html += `<p class="success"><strong>One real root (repeated):</strong></p><p>x = ${x.toFixed(4)}</p>`;
    } else {
      const real = -b / (2*a);
      const imag = Math.sqrt(-disc) / (2*a);
      html += `<p class="success"><strong>Two complex roots:</strong></p><p>x₁ = ${real.toFixed(4)} + ${imag.toFixed(4)}i</p><p>x₂ = ${real.toFixed(4)} - ${imag.toFixed(4)}i</p>`;
    }
    resultBox.innerHTML = html;
  } else {
    // Cubic - Using Newton-Raphson approximation for one real root
    const a = parseFloat(document.getElementById('cubic-a').value);
    const b = parseFloat(document.getElementById('cubic-b').value);
    const c = parseFloat(document.getElementById('cubic-c').value);
    const d = parseFloat(document.getElementById('cubic-d').value);
    
    let x = 1; // Initial guess
    for(let i = 0; i < 50; i++) { // 50 iterations for precision
      const fx = a*x*x*x + b*x*x + c*x + d;
      const fpx = 3*a*x*x + 2*b*x + c;
      if(Math.abs(fpx) < 1e-10) break;
      const x_new = x - fx/fpx;
      if (Math.abs(x_new - x) < 1e-6) { // Stop if convergence is reached
        x = x_new;
        break;
      }
      x = x_new;
    }
    
    resultBox.innerHTML = `<h3>Cubic Solution (Approx.)</h3><p><strong>Equation:</strong> ${a}x³ + ${b}x² + ${c}x + ${d} = 0</p><p class="success"><strong>One real root:</strong></p><p>x ≈ ${x.toFixed(4)}</p><p style="font-size:0.9rem;color:#666;">Note: This uses the Newton-Raphson method for one real root.</p>`;
  }
  resultBox.classList.add('show');
}

// ========== NUMBER CONVERTER (UNCHANGED) ==========
function convertNumber() {
  const inputType = parseInt(document.getElementById('conv-input-type').value);
  const input = document.getElementById('conv-input').value.trim();
  const resultBox = document.getElementById('converter-result');
  
  if(!input) {
    resultBox.innerHTML = '<h3 class="error">Error</h3><p>Please enter a number.</p>';
    resultBox.classList.add('show');
    return;
  }
  
  try {
    const decimal = parseInt(input, inputType);
    if(isNaN(decimal)) throw new Error();
    
    resultBox.innerHTML = `
      <h3>Conversion Results</h3>
      <p><strong>Decimal:</strong> ${decimal}</p>
      <p><strong>Binary:</strong> ${decimal.toString(2)}</p>
      <p><strong>Octal:</strong> ${decimal.toString(8)}</p>
      <p><strong>Hexadecimal:</strong> ${decimal.toString(16).toUpperCase()}</p>
    `;
    resultBox.classList.add('show');
  } catch(e) {
    resultBox.innerHTML = '<h3 class="error">Error</h3><p>Invalid input for selected base.</p>';
    resultBox.classList.add('show');
  }
}

// ========== MATRIX CALCULATOR (UNCHANGED) ==========
function calculateMatrix() {
  const op = document.getElementById('matrix-op').value;
  const size = parseInt(document.getElementById('matrix-size').value);
  const matrixA = parseMatrix(document.getElementById('matrix-a').value, size);
  const resultBox = document.getElementById('matrix-result');
  
  if(!matrixA) {
    resultBox.innerHTML = '<h3 class="error">Error</h3><p>Invalid matrix A format. Ensure all rows have the correct number of comma-separated values.</p>';
    resultBox.classList.add('show');
    return;
  }
  
  let html = '';
  try {
    if(op === 'determinant') {
      let det;
      if(size === 2) {
        det = matrixA[0][0]*matrixA[1][1] - matrixA[0][1]*matrixA[1][0];
      } else {
        det = matrixA[0][0]*(matrixA[1][1]*matrixA[2][2] - matrixA[1][2]*matrixA[2][1]) -
              matrixA[0][1]*(matrixA[1][0]*matrixA[2][2] - matrixA[1][2]*matrixA[2][0]) +
              matrixA[0][2]*(matrixA[1][0]*matrixA[2][1] - matrixA[1][1]*matrixA[2][0]);
      }
      html = `<h3>Determinant</h3><p><strong>det(A) = ${det.toFixed(4)}</strong></p>`;
    } else if(op === 'inverse') {
      if (size !== 2) {
        html = '<h3 class="error">Error</h3><p>Inverse operation is only supported for 2x2 matrices.</p>';
      } else {
        const det = matrixA[0][0]*matrixA[1][1] - matrixA[0][1]*matrixA[1][0];
        if(Math.abs(det) < 1e-10) {
          html = '<h3 class="error">Error</h3><p>Matrix is singular (non-invertible) since determinant is zero.</p>';
        } else {
          const inv = [
            [matrixA[1][1]/det, -matrixA[0][1]/det],
            [-matrixA[1][0]/det, matrixA[0][0]/det]
          ];
          html = `<h3>Inverse Matrix</h3><p><strong>A⁻¹ =</strong></p><p>[${inv[0][0].toFixed(4)}, ${inv[0][1].toFixed(4)}]</p><p>[${inv[1][0].toFixed(4)}, ${inv[1][1].toFixed(4)}]</p>`;
        }
      }
    } else {
      // Multiply
      const matrixB = parseMatrix(document.getElementById('matrix-b').value, size);
      if(!matrixB) {
        html = '<h3 class="error">Error</h3><p>Invalid matrix B format. Ensure all rows have the correct number of comma-separated values.</p>';
      } else {
        const result = [];
        for(let i = 0; i < size; i++) {
          result[i] = [];
          for(let j = 0; j < size; j++) {
            let sum = 0;
            for(let k = 0; k < size; k++) {
              sum += matrixA[i][k] * matrixB[k][j];
            }
            result[i][j] = sum;
          }
        }
        html = '<h3>Matrix Multiplication</h3><p><strong>A × B =</strong></p>';
        for(let i = 0; i < size; i++) {
          html += `<p>[${result[i].map(v => v.toFixed(4)).join(', ')}]</p>`;
        }
      }
    }
    resultBox.innerHTML = html;
    resultBox.classList.add('show');
  } catch(e) {
    resultBox.innerHTML = '<h3 class="error">Error</h3><p>Calculation failed due to an unexpected error.</p>';
    resultBox.classList.add('show');
  }
}

function parseMatrix(text, size) {
  try {
    const rows = text.trim().split('\n');
    if(rows.length !== size) return null;
    const matrix = [];
    for(let row of rows) {
      const vals = row.split(',').map(v => parseFloat(v.trim()));
      if(vals.length !== size || vals.some(isNaN)) return null;
      matrix.push(vals);
    }
    return matrix;
  } catch(e) {
    return null;
  }
}

// ========== STATISTICS CALCULATOR (UNCHANGED) ==========
function calculateStats() {
  const input = document.getElementById('stats-input').value.trim();
  const resultBox = document.getElementById('stats-result');
  
  if(!input) {
    resultBox.innerHTML = '<h3 class="error">Error</h3><p>Please enter numbers.</p>';
    resultBox.classList.add('show');
    return;
  }
  
  try {
    const numbers = input.split(',').map(n => parseFloat(n.trim())).filter(n => !isNaN(n));
    if(numbers.length === 0) throw new Error();
    
    numbers.sort((a, b) => a - b);
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;
    const median = numbers.length % 2 === 0 ? 
      (numbers[numbers.length/2 - 1] + numbers[numbers.length/2]) / 2 : 
      numbers[Math.floor(numbers.length/2)];
    
    const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numbers.length;
    const stdDev = Math.sqrt(variance);
    
    const freq = {};
    numbers.forEach(n => freq[n] = (freq[n] || 0) + 1);
    
    // Find mode(s)
    let maxFreq = 0;
    for(let n in freq) {
      if(freq[n] > maxFreq) maxFreq = freq[n];
    }
    const mode = Object.keys(freq).filter(k => freq[k] === maxFreq).map(parseFloat);
    if (mode.length === numbers.length) { // Check if all numbers appear once (no mode)
        mode.length = 0;
    }
    
    let modeString = mode.length > 0 ? mode.join(', ') : 'None (or all numbers are unique)';
    
    let html = `
      <h3>Statistics Results</h3>
      <p><strong>Count (n):</strong> ${numbers.length}</p>
      <p><strong>Mean (Average):</strong> ${mean.toFixed(4)}</p>
      <p><strong>Median (Middle Value):</strong> ${median.toFixed(4)}</p>
      <p><strong>Mode (Most Frequent):</strong> ${modeString}</p>
      <p><strong>Standard Deviation (σ):</strong> ${stdDev.toFixed(4)}</p>
      <p><strong>Variance (σ²):</strong> ${variance.toFixed(4)}</p>
      <p><strong>Min:</strong> ${numbers[0]}</p>
      <p><strong>Max:</strong> ${numbers[numbers.length - 1]}</p>
      <p><strong>Range:</strong> ${(numbers[numbers.length - 1] - numbers[0]).toFixed(4)}</p>
    `;
    
    resultBox.innerHTML = html;
    resultBox.classList.add('show');
  } catch(e) {
    resultBox.innerHTML = '<h3 class="error">Error</h3><p>Invalid number format. Ensure numbers are comma-separated.</p>';
    resultBox.classList.add('show');
  }
}
