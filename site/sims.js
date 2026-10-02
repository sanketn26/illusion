// Mountable simulations. Any <div data-sim="name"> becomes an interactive figure
// (canvas + controls). Chapters can embed the same simulation several times; each
// instance keeps its own state and pauses when scrolled out of view.
//
// A simulation definition:
//   controls  [{key,label,min,max,value,step?,format?}]  (or the single-control shorthand
//             label/min/max/value on the definition itself, read with get())
//   buttons   [{id,label}]; sim.act(id) may return a new label for the button
//   animated  true if sim.step() should run every frame
//   resetOnInput  re-run reset() when a slider moves (for parameters that change the setup)
//   make(ctx, get) -> {reset, step?, draw, act?, pointer?, sync?}   (sync returns {key: value} to move sliders)
(function () {
  const W = 900, H = 500;
  const COLOR = { bg: '#101a2a', grid: '#213148', teal: '#67d4d0', amber: '#f5b85d', red: '#f18a76', text: '#e8edf5', dim: '#aabbd0', faint: '#3a4b65' };

  function background(ctx, grid = true) {
    ctx.fillStyle = COLOR.bg;
    ctx.fillRect(0, 0, W, H);
    if (!grid) return;
    ctx.strokeStyle = COLOR.grid; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }
  function line(ctx, points, color, width = 2) {
    if (points.length < 2) return;
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.stroke();
  }
  function dot(ctx, x, y, color, r = 6) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function text(ctx, str, x, y, color = COLOR.text, size = 17, align = 'left') {
    ctx.font = size + 'px system-ui'; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(str, x, y); ctx.textAlign = 'left';
  }
  function arrow(ctx, x1, y1, x2, y2, color, label, width = 4, head = 13) {
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(a - .5), y2 - head * Math.sin(a - .5));
    ctx.lineTo(x2 - head * Math.cos(a + .5), y2 - head * Math.sin(a + .5));
    ctx.closePath(); ctx.fill();
    if (label) { ctx.font = '19px system-ui'; ctx.fillText(label, x2 + 8, y2 + 6); }
  }
  function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  const SIMS = {
    // ---------------------------------------------------------------- THM01
    walk: {
      label: 'Step size', min: 1, max: 10, value: 5, animated: true,
      make(ctx, get) {
        let frame, s;
        const walker = () => ({ x: W / 2, y: H / 2, trail: [] });
        return {
          reset() { frame = 0; s = { random: walker(), directed: walker() }; },
          step() {
            if (++frame % 2) return;
            const step = get() * .95;
            let angle = Math.random() * Math.PI * 2;
            s.random.x += Math.cos(angle) * step; s.random.y += Math.sin(angle) * step;
            angle = (Math.random() - .5) * 1.8;
            s.directed.x += Math.cos(angle) * step; s.directed.y += Math.sin(angle) * step;
            for (const p of [s.random, s.directed]) {
              p.x = Math.max(8, Math.min(W - 8, p.x)); p.y = Math.max(8, Math.min(H - 8, p.y));
              p.trail.push([p.x, p.y]);
              if (p.trail.length > 350) p.trail.shift();
            }
          },
          draw() {
            background(ctx);
            line(ctx, s.random.trail, COLOR.teal); line(ctx, s.directed.trail, COLOR.amber);
            dot(ctx, s.random.x, s.random.y, COLOR.teal); dot(ctx, s.directed.x, s.directed.y, COLOR.amber);
            text(ctx, 'Random steps', 22, 32, COLOR.teal); text(ctx, 'Rightward bias', 22, 57, COLOR.amber);
          }
        };
      }
    },

    // ---------------------------------------------------------------- THM02
    brownian: {
      label: 'Invisible particles', min: 20, max: 400, value: 200, animated: true, resetOnInput: true,
      buttons: [{ id: 'hide', label: 'Hide the particles' }, { id: 'clear', label: 'Clear trail' }],
      make(ctx, get) {
        const GR = 26, PR = 3, GM = 40, SPEED = 2.6;
        let s, hidden;
        return {
          reset() {
            hidden = false;
            s = { grain: { x: W / 2, y: H / 2, vx: 0, vy: 0, trail: [], x0: W / 2, y0: H / 2 }, ps: [], frame: 0 };
            for (let i = 0; i < get(); i++) {
              let x, y;
              do { x = 10 + Math.random() * (W - 20); y = 10 + Math.random() * (H - 20); } while (Math.hypot(x - W / 2, y - H / 2) < GR + 12);
              s.ps.push({ x, y, vx: gauss() * SPEED * .7, vy: gauss() * SPEED * .7 });
            }
          },
          step() {
            const g = s.grain; s.frame++;
            for (const p of s.ps) {
              p.x += p.vx; p.y += p.vy;
              if (p.x < PR) { p.x = PR; p.vx = Math.abs(p.vx); } else if (p.x > W - PR) { p.x = W - PR; p.vx = -Math.abs(p.vx); }
              if (p.y < PR) { p.y = PR; p.vy = Math.abs(p.vy); } else if (p.y > H - PR) { p.y = H - PR; p.vy = -Math.abs(p.vy); }
              const dx = p.x - g.x, dy = p.y - g.y, d = Math.hypot(dx, dy), min = GR + PR;
              if (d < min) {
                const nx = dx / d, ny = dy / d, rel = (p.vx - g.vx) * nx + (p.vy - g.vy) * ny;
                if (rel < 0) {
                  const j = -2 * rel / (1 + 1 / GM);
                  p.vx += j * nx; p.vy += j * ny; g.vx -= j * nx / GM; g.vy -= j * ny / GM;
                }
                p.x = g.x + nx * min; p.y = g.y + ny * min;
              }
            }
            g.x += g.vx; g.y += g.vy;
            if (g.x < GR) { g.x = GR; g.vx = Math.abs(g.vx); } else if (g.x > W - GR) { g.x = W - GR; g.vx = -Math.abs(g.vx); }
            if (g.y < GR) { g.y = GR; g.vy = Math.abs(g.vy); } else if (g.y > H - GR) { g.y = H - GR; g.vy = -Math.abs(g.vy); }
            if (s.frame % 2 === 0) { g.trail.push([g.x, g.y]); if (g.trail.length > 1200) g.trail.shift(); }
          },
          draw() {
            background(ctx, false);
            if (!hidden) { ctx.fillStyle = 'rgba(103,212,208,.75)'; for (const p of s.ps) { ctx.beginPath(); ctx.arc(p.x, p.y, PR, 0, 6.2832); ctx.fill(); } }
            line(ctx, s.grain.trail, 'rgba(245,184,93,.55)', 1.5);
            const g = s.grain;
            ctx.fillStyle = COLOR.amber; ctx.beginPath(); ctx.arc(g.x, g.y, GR, 0, 6.2832); ctx.fill();
            ctx.strokeStyle = '#fff3d6'; ctx.lineWidth = 2; ctx.stroke();
            text(ctx, hidden ? 'What a microscope sees: only the grain' : 'The grain is shoved by invisible particles', 22, 32, COLOR.text);
            text(ctx, 'Wandered ' + Math.round(Math.hypot(g.x - g.x0, g.y - g.y0)) + ' px from its start', 22, 57, COLOR.dim, 15);
          },
          act(id) {
            if (id === 'hide') { hidden = !hidden; return hidden ? 'Show the particles' : 'Hide the particles'; }
            if (id === 'clear') { s.grain.trail = []; s.grain.x0 = s.grain.x; s.grain.y0 = s.grain.y; }
          }
        };
      }
    },

    // ---------------------------------------------------------------- THM13
    entropy: {
      label: 'Particles', min: 2, max: 300, value: 100, animated: true, resetOnInput: true,
      buttons: [{ id: 'divider', label: 'Remove divider' }],
      make(ctx, get) {
        const BX = 20, BY = 20, BW = 560, BH = 460, SP = 2.2;
        let s;
        function bigNumber(n) {
          if (n <= 20) return '1 in ' + Math.pow(2, n).toLocaleString('en');
          return '1 in 10^' + Math.round(n * Math.log10(2));
        }
        return {
          reset() {
            s = { ps: [], divider: true, hist: [], frame: 0 };
            for (let i = 0; i < get(); i++) s.ps.push({ x: 8 + Math.random() * (BW / 2 - 16), y: 8 + Math.random() * (BH - 16), vx: gauss() * SP * .7, vy: gauss() * SP * .7 });
          },
          step() {
            s.frame++;
            let left = 0;
            for (const p of s.ps) {
              p.x += p.vx; p.y += p.vy;
              if (p.x < 4) { p.x = 4; p.vx = Math.abs(p.vx); } else if (p.x > BW - 4) { p.x = BW - 4; p.vx = -Math.abs(p.vx); }
              if (p.y < 4) { p.y = 4; p.vy = Math.abs(p.vy); } else if (p.y > BH - 4) { p.y = BH - 4; p.vy = -Math.abs(p.vy); }
              if (s.divider) { const m = BW / 2; if (p.x > m - 3) { p.x = m - 3; p.vx = -Math.abs(p.vx); } }
              if (p.x < BW / 2) left++;
            }
            if (s.frame % 3 === 0) { s.hist.push(left / s.ps.length); if (s.hist.length > 240) s.hist.shift(); }
          },
          draw() {
            background(ctx, false);
            ctx.fillStyle = '#142034'; ctx.fillRect(BX, BY, BW, BH);
            ctx.strokeStyle = '#536178'; ctx.lineWidth = 2; ctx.strokeRect(BX, BY, BW, BH);
            ctx.fillStyle = COLOR.teal;
            let left = 0;
            const r = s.ps.length > 150 ? 2.5 : 4;
            for (const p of s.ps) { ctx.beginPath(); ctx.arc(BX + p.x, BY + p.y, r, 0, 6.2832); ctx.fill(); if (p.x < BW / 2) left++; }
            if (s.divider) { ctx.strokeStyle = COLOR.amber; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(BX + BW / 2, BY); ctx.lineTo(BX + BW / 2, BY + BH); ctx.stroke(); }
            const n = s.ps.length;
            text(ctx, 'Left ' + left + '   Right ' + (n - left), BX + 12, BY + 28, '#fff', 17);
            // history chart
            const cx = 620, cy = 70, cw = 260, ch = 200;
            text(ctx, 'Share of particles on the left', cx, cy - 24, COLOR.text, 15);
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(cx, cy, cw, ch);
            ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cx, cy + ch / 2); ctx.lineTo(cx + cw, cy + ch / 2); ctx.stroke(); ctx.setLineDash([]);
            text(ctx, '100%', cx - 6, cy + 5, COLOR.dim, 12, 'right'); text(ctx, '50%', cx - 6, cy + ch / 2 + 4, COLOR.dim, 12, 'right'); text(ctx, '0%', cx - 6, cy + ch + 4, COLOR.dim, 12, 'right');
            line(ctx, s.hist.map((v, i) => [cx + i / 239 * cw, cy + (1 - v) * ch]), COLOR.amber, 2);
            text(ctx, 'time →', cx + cw, cy + ch + 20, COLOR.dim, 12, 'right');
            text(ctx, 'Chance that all ' + n + ' sit on one', cx, 340, COLOR.dim, 14);
            text(ctx, 'chosen side by luck:', cx, 358, COLOR.dim, 14);
            text(ctx, bigNumber(n - 1), cx, 386, COLOR.amber, 20);
            text(ctx, s.divider ? 'Divider is in. Remove it!' : 'Divider removed.', cx, 430, s.divider ? COLOR.amber : COLOR.teal, 15);
          },
          act(id) { if (id === 'divider') { s.divider = !s.divider; return s.divider ? 'Remove divider' : 'Put divider back'; } }
        };
      }
    },

    // ---------------------------------------------------------------- THM14
    arrow: {
      controls: [{ key: 'err', label: 'Error in reversal', min: 0, max: 7, value: 0, format: v => v === 0 ? 'none' : (v >= 7 ? '0.1' : '1e-' + (8 - v)) + ' px' }],
      animated: true,
      buttons: [{ id: 'reverse', label: 'Reverse time' }, { id: 'restart', label: 'Restart' }],
      make(ctx, get) {
        const BX = 150, BY = 70, BW = 600, BH = 360, R = 9, K = 0.3, KW = 0.3, SUB = 4, DT = 1 / SUB;
        let s;
        function forces() {
          const n = s.ps.length;
          for (const p of s.ps) { p.ax = 0; p.ay = 0; }
          for (let i = 0; i < n; i++) {
            const p = s.ps[i];
            if (p.x < R) p.ax += KW * (R - p.x); else if (p.x > BW - R) p.ax -= KW * (p.x - (BW - R));
            if (p.y < R) p.ay += KW * (R - p.y); else if (p.y > BH - R) p.ay -= KW * (p.y - (BH - R));
            for (let j = i + 1; j < n; j++) {
              const q = s.ps[j], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
              if (d2 < 4 * R * R && d2 > 0) {
                const d = Math.sqrt(d2), f = K * (2 * R - d) / d;
                p.ax += f * dx; p.ay += f * dy; q.ax -= f * dx; q.ay -= f * dy;
              }
            }
          }
        }
        return {
          reset() {
            s = { ps: [], t: 0, dir: 1, tr: 0, nudged: -1, err: 0 };
            let k = 0;
            for (let c = 0; c < 5; c++) for (let r = 0; r < 14; r++) {
              const a = Math.random() * 6.2832, sp = 2.2 * (.6 + .8 * Math.random());
              s.ps.push({ x: 40 + c * 34, y: 20 + r * 24.5, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, ax: 0, ay: 0 }); k++;
            }
            forces();
          },
          step() {
            for (let k = 0; k < SUB; k++) {
              for (const p of s.ps) { p.vx += p.ax * DT / 2; p.vy += p.ay * DT / 2; p.x += p.vx * DT; p.y += p.vy * DT; }
              forces();
              for (const p of s.ps) { p.vx += p.ax * DT / 2; p.vy += p.ay * DT / 2; }
            }
            s.t += s.dir; if (s.dir === -1 || s.reversed) s.tr++;
          },
          draw() {
            background(ctx, false);
            ctx.fillStyle = '#142034'; ctx.fillRect(BX, BY, BW, BH);
            ctx.strokeStyle = '#536178'; ctx.lineWidth = 2; ctx.strokeRect(BX, BY, BW, BH);
            let inLeft = 0;
            s.ps.forEach((p, i) => {
              if (p.x < BW / 3) inLeft++;
              dot(ctx, BX + p.x, BY + p.y, s.nudged >= 0 ? COLOR.amber : COLOR.teal, R - 1);
            });
            text(ctx, s.reversed ? 'Time reversed: ' + s.tr + ' steps since the flip' : 'Time running forward: ' + s.t + ' steps', BX, BY - 38, s.reversed ? COLOR.amber : COLOR.text, 18);
            text(ctx, 'Share of gas in the left third: ' + Math.round(inLeft / s.ps.length * 100) + '%', BX, BY - 14, COLOR.dim, 15);
            ctx.strokeStyle = COLOR.amber; ctx.setLineDash([6, 6]); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(BX + BW / 3, BY); ctx.lineTo(BX + BW / 3, BY + BH); ctx.stroke(); ctx.setLineDash([]);
            if (s.nudged >= 0) text(ctx, 'Every particle was nudged by about ' + s.errLabel + ' as time was reversed', BX, BY + BH + 28, COLOR.amber, 15);
            else if (!s.reversed) text(ctx, 'Let the gas spread out, then press Reverse time.', BX, BY + BH + 28, COLOR.dim, 15);
            else text(ctx, 'An exact reversal: every velocity flipped, nothing else changed.', BX, BY + BH + 28, COLOR.teal, 15);
          },
          act(id) {
            if (id === 'restart') { this.reset(); return; }
            if (id === 'reverse') {
              for (const p of s.ps) { p.vx = -p.vx; p.vy = -p.vy; }
              const e = get('err');
              if (e > 0) { const eps = Math.pow(10, e - 8); s.nudged = 1; s.errLabel = (e >= 7 ? '0.1' : '1e-' + (8 - e)) + ' px'; for (const p of s.ps) { const a = Math.random() * 6.2832; p.x += eps * Math.cos(a); p.y += eps * Math.sin(a); } }
              s.reversed = true; s.tr = 0; forces();
            }
          }
        };
      }
    },

    // ---------------------------------------------------------------- THM09
    heat: {
      label: 'Diffusion rate', min: 1, max: 9, value: 5, animated: true, stepsPerFrame: 2,
      make(ctx, get) {
        const cols = 90, rows = 50;
        let s;
        return {
          reset() {
            s = { cells: new Float32Array(cols * rows), next: new Float32Array(cols * rows) };
            for (let y = 18; y < 32; y++) for (let x = 8; x < 23; x++) s.cells[y * cols + x] = 1;
          },
          step() {
            const { cells, next } = s, rate = get() / 10;
            for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
              const i = y * cols + x, v = cells[i];
              const l = cells[y * cols + Math.max(0, x - 1)], r = cells[y * cols + Math.min(cols - 1, x + 1)];
              const u = cells[Math.max(0, y - 1) * cols + x], d = cells[Math.min(rows - 1, y + 1) * cols + x];
              next[i] = v + rate * .22 * (l + r + u + d - 4 * v);
            }
            s.cells = next; s.next = cells;
          },
          draw() {
            const cw = W / cols, ch = H / rows;
            for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
              const t = Math.max(0, Math.min(1, s.cells[y * cols + x]));
              ctx.fillStyle = `rgb(${Math.round(20 + 235 * t)},${Math.round(43 + 115 * t)},${Math.round(73 - 18 * t)})`;
              ctx.fillRect(x * cw, y * ch, cw + 1, ch + 1);
            }
            text(ctx, 'Click or drag to add heat', 22, 32, '#fff');
          },
          pointer(kind, fx, fy, pressed) {
            if (!pressed) return false;
            const x = Math.floor(fx * cols), y = Math.floor(fy * rows);
            for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
              const xx = x + dx, yy = y + dy;
              if (xx >= 0 && xx < cols && yy >= 0 && yy < rows) s.cells[yy * cols + xx] = 1;
            }
            return true;
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC07
    sine: {
      controls: [
        { key: 'wl', label: 'Wavelength', min: 60, max: 300, value: 180, step: 10, format: v => v + ' px' },
        { key: 'f', label: 'Frequency', min: 1, max: 10, value: 4, format: v => (v * .2).toFixed(1) + ' Hz' }
      ],
      animated: true,
      make(ctx, get) {
        const A = 90, Y0 = 270, SPACING = 15, TRACK = 8; // tracked dot index
        let t;
        return {
          reset() { t = 0; },
          step() { t += 1 / 60; },
          draw() {
            background(ctx);
            const wl = get('wl'), f = get('f') * .2, k = 2 * Math.PI / wl, w = 2 * Math.PI * f;
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.setLineDash([5, 6]);
            ctx.beginPath(); ctx.moveTo(0, Y0); ctx.lineTo(W, Y0); ctx.stroke(); ctx.setLineDash([]);
            const xt = 60 + TRACK * 4 * SPACING;
            ctx.strokeStyle = 'rgba(245,184,93,.35)'; ctx.beginPath(); ctx.moveTo(xt, 110); ctx.lineTo(xt, 430); ctx.stroke();
            const pts = [];
            for (let x = 0; x <= W; x += 4) pts.push([x, Y0 - A * Math.sin(k * x - w * t)]);
            line(ctx, pts, 'rgba(103,212,208,.35)', 2);
            for (let x = 30; x < W; x += SPACING) {
              const y = Y0 - A * Math.sin(k * x - w * t), tracked = Math.abs(x - xt) < SPACING / 2;
              dot(ctx, x, y, tracked ? COLOR.amber : COLOR.teal, tracked ? 8 : 4.5);
            }
            // follow one crest
            const phase = (w * t) % (2 * Math.PI);
            let cx = (Math.PI / 2 + w * t) / k; cx = ((cx % wl) + wl) % wl; while (cx < 520) cx += wl;
            if (cx < W - 20) {
              ctx.strokeStyle = COLOR.red; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
              ctx.beginPath(); ctx.moveTo(cx, Y0 - A - 20); ctx.lineTo(cx, Y0 + A + 20); ctx.stroke(); ctx.setLineDash([]);
              arrow(ctx, cx, Y0 - A - 34, cx + 46, Y0 - A - 34, COLOR.red, '', 3, 9);
              text(ctx, 'crest', cx - 40, Y0 - A - 28, COLOR.red, 14);
            }
            text(ctx, 'Amber dot: moves up and down only', 22, 34, COLOR.amber, 17);
            text(ctx, 'Red crest: the pattern, moving right', 22, 58, COLOR.red, 17);
            text(ctx, 'wave speed = wavelength × frequency = ' + Math.round(wl * f) + ' px/s', 22, H - 22, COLOR.dim, 16);
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC10
    waves: {
      label: 'Source spacing', min: 1, max: 10, value: 5, animated: true,
      make(ctx, get) {
        let frame;
        return {
          reset() { frame = 0; },
          step() { frame++; },
          draw() {
            const spacing = get() * 20 + 35, t = frame * .11;
            const x1 = W / 2 - spacing / 2, x2 = W / 2 + spacing / 2, y0 = H / 2;
            const image = ctx.createImageData(W, H), data = image.data;
            for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
              const r1 = Math.hypot(x - x1, y - y0), r2 = Math.hypot(x - x2, y - y0);
              const v = Math.round(((Math.sin(r1 * .075 - t) + Math.sin(r2 * .075 - t)) / 2 + 1) * .5 * 255);
              for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
                const i = ((y + dy) * W + x + dx) * 4;
                data[i] = 20 + Math.round(v * .65); data[i + 1] = 43 + Math.round(v * .47); data[i + 2] = 73 + Math.round(v * .5); data[i + 3] = 255;
              }
            }
            ctx.putImageData(image, 0, 0);
            dot(ctx, x1, y0, '#fff'); dot(ctx, x2, y0, '#fff');
            text(ctx, 'Two synchronized sources', 22, 32, '#fff');
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC11
    standing: {
      label: 'Harmonic (n)', min: 1, max: 8, value: 3, animated: true,
      buttons: [{ id: 'parts', label: 'Show the two travelling waves' }],
      make(ctx, get) {
        const X0 = 60, L = 780, Y0 = 250, A = 105;
        let t, parts;
        return {
          reset() { t = 0; parts = false; },
          step() { t += 1 / 60; },
          draw() {
            background(ctx);
            const n = get(), k = n * Math.PI / L, w = 2 * Math.PI * .5 * n * .5; // slower for higher n so it stays readable
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.setLineDash([5, 6]);
            ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X0 + L, Y0); ctx.stroke(); ctx.setLineDash([]);
            if (parts) {
              const r = [], l = [];
              for (let x = 0; x <= L; x += 4) { r.push([X0 + x, Y0 - A / 2 * Math.sin(k * x - w * t)]); l.push([X0 + x, Y0 - A / 2 * Math.sin(k * x + w * t)]); }
              line(ctx, r, 'rgba(245,184,93,.8)', 2); line(ctx, l, 'rgba(241,138,118,.8)', 2);
              text(ctx, 'moving right', X0, 58, COLOR.amber, 15); text(ctx, 'moving left', X0 + 110, 58, COLOR.red, 15);
            }
            const s = [];
            for (let x = 0; x <= L; x += 3) s.push([X0 + x, Y0 - A * Math.sin(k * x) * Math.cos(w * t)]);
            line(ctx, s, COLOR.teal, 5);
            for (let i = 0; i <= n; i++) dot(ctx, X0 + i * L / n, Y0, COLOR.red, 7);
            for (const x of [X0, X0 + L]) { ctx.fillStyle = '#8ea2ba'; ctx.fillRect(x - 5, Y0 - 40, 10, 80); }
            text(ctx, 'Harmonic n = ' + n + ':  ' + n + ' half-wave' + (n > 1 ? 's' : '') + ' fit, frequency = ' + n + ' × the lowest note, ' + (n + 1) + ' still points (nodes)', 22, 32, COLOR.text, 16);
            text(ctx, parts ? 'Teal = amber + coral. Where they always cancel is a node.' : 'Red dots: nodes, where the string never moves', 22, H - 22, COLOR.dim, 15);
          },
          act(id) { if (id === 'parts') { parts = !parts; return parts ? 'Hide the two travelling waves' : 'Show the two travelling waves'; } }
        };
      }
    },

    // ---------------------------------------------------------------- OSC10 / EMG02
    efield: {
      label: 'Lines per charge', min: 4, max: 24, value: 12, animated: false,
      buttons: [{ id: 'sign', label: 'Next click adds: +' }, { id: 'clear', label: 'Clear charges' }],
      make(ctx, get) {
        let charges, sign, probe;
        const defaults = () => [{ x: 320, y: 250, q: 1 }, { x: 580, y: 250, q: -1 }];
        function field(x, y) {
          let ex = 0, ey = 0;
          for (const c of charges) {
            const dx = x - c.x, dy = y - c.y, d2 = dx * dx + dy * dy + 25, d3 = d2 * Math.sqrt(d2);
            ex += c.q * dx / d3 * 1e4; ey += c.q * dy / d3 * 1e4;
          }
          return [ex, ey];
        }
        function trace(sx, sy, dir, out) {
          let x = sx, y = sy;
          const pts = [[x, y]], arrows = [];
          let travelled = 0;
          for (let i = 0; i < 900; i++) {
            const [ex, ey] = field(x, y), m = Math.hypot(ex, ey);
            if (m < 1e-9) break;
            x += dir * ex / m * 3; y += dir * ey / m * 3; travelled += 3; pts.push([x, y]);
            if (travelled % 90 === 0) arrows.push([x, y, Math.atan2(ey, ex)]);
            if (x < -30 || x > W + 30 || y < -30 || y > H + 30) break;
            if (charges.some(c => c.q * dir < 0 && Math.hypot(x - c.x, y - c.y) < 10)) break;
          }
          out.push({ pts, arrows });
        }
        return {
          reset() { charges = defaults(); sign = 1; probe = null; },
          draw() {
            background(ctx);
            const lines = [], n = get();
            const hasPos = charges.some(c => c.q > 0), source = charges.filter(c => c.q === (hasPos ? 1 : -1)), dir = hasPos ? 1 : -1;
            for (const c of source) for (let i = 0; i < n; i++) {
              const a = (i + .5) / n * 2 * Math.PI;
              trace(c.x + 11 * Math.cos(a), c.y + 11 * Math.sin(a), dir, lines);
            }
            ctx.lineJoin = 'round';
            for (const l of lines) {
              line(ctx, l.pts, 'rgba(160,215,240,.75)', 1.6);
              ctx.fillStyle = 'rgba(160,215,240,.95)';
              for (const [x, y, a] of l.arrows) {
                ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(-5, 4); ctx.lineTo(-5, -4); ctx.closePath(); ctx.fill(); ctx.restore();
              }
            }
            for (const c of charges) {
              dot(ctx, c.x, c.y, c.q > 0 ? COLOR.amber : COLOR.teal, 12);
              text(ctx, c.q > 0 ? '+' : '−', c.x, c.y + 6, '#10192a', 20, 'center');
            }
            if (probe) {
              const [ex, ey] = field(probe.x, probe.y), m = Math.hypot(ex, ey), len = Math.min(70, 14 + 22 * Math.log10(1 + m * 8));
              dot(ctx, probe.x, probe.y, '#fff', 3);
              if (m > 1e-6) arrow(ctx, probe.x, probe.y, probe.x + ex / m * len, probe.y + ey / m * len, '#fff', '', 3, 9);
              text(ctx, 'Field strength here: ' + m.toFixed(2) + ' (relative)', 22, H - 22, '#fff', 15);
            } else text(ctx, 'Move over the picture to probe the field. Click to add a charge; click a charge to remove it.', 22, H - 22, COLOR.dim, 15);
            text(ctx, 'Arrows show the push on a small + test charge', 22, 32, COLOR.text, 16);
          },
          pointer(kind, fx, fy) {
            const x = fx * W, y = fy * H;
            if (kind === 'leave') { probe = null; return true; }
            probe = { x, y };
            if (kind === 'down') {
              const hit = charges.findIndex(c => Math.hypot(c.x - x, c.y - y) < 16);
              if (hit >= 0) charges.splice(hit, 1); else if (charges.length < 10) charges.push({ x, y, q: sign });
            }
            return true;
          },
          act(id) {
            if (id === 'sign') { sign = -sign; return 'Next click adds: ' + (sign > 0 ? '+' : '−'); }
            if (id === 'clear') { charges = []; }
          }
        };
      }
    },

    // ---------------------------------------------------------------- GRV01
    gravity: {
      controls: [{ key: 'v', label: 'Launch speed', min: 3, max: 12, value: 6, step: 0.1, format: v => Number(v).toFixed(1) + ' km/s' }],
      animated: true, resetOnInput: false,
      buttons: [{ id: 'fire', label: 'Fire again' }, { id: 'clear', label: 'Clear old paths' }],
      make(ctx, get) {
        const CX = 450, CY = 310, R = 120, VC = 7.9, VESC = VC * Math.SQRT2, SCALE = 0.33, GMU = (VC * SCALE) ** 2 * R;
        let shot, old;
        const regime = v => v < VC - .15 ? ['Too slow: it curves, but the ground gets in the way', COLOR.red]
          : v < VC + .15 ? ['Just right: it keeps falling and keeps missing the ground', COLOR.teal]
            : v < VESC ? ['Faster: a stretched orbit. It still falls back eventually', COLOR.teal]
              : ['Escape: gravity weakens faster than it can pull this back', COLOR.amber];
        function fire() {
          if (shot && shot.pts.length > 1) { old.push(shot); if (old.length > 5) old.shift(); }
          const v = get('v');
          shot = { v, x: CX, y: CY - R - 1.5, vx: v * SCALE, vy: 0, pts: [[CX, CY - R - 1.5]], done: false, hit: false, color: regime(v)[1] };
        }
        return {
          reset() { old = []; fire(); },
          step() {
            if (shot.done) return;
            for (let i = 0; i < 2; i++) {
              const dt = .5;
              let dx = shot.x - CX, dy = shot.y - CY, r = Math.hypot(dx, dy), a = -GMU / (r * r * r);
              shot.vx += a * dx * dt / 2; shot.vy += a * dy * dt / 2;
              shot.x += shot.vx * dt; shot.y += shot.vy * dt;
              dx = shot.x - CX; dy = shot.y - CY; r = Math.hypot(dx, dy); a = -GMU / (r * r * r);
              shot.vx += a * dx * dt / 2; shot.vy += a * dy * dt / 2;
              if (r < R) { shot.done = true; shot.hit = true; break; }
              if (r > 1500) { shot.done = true; break; }
            }
            if (shot.pts.length < 5000) shot.pts.push([shot.x, shot.y]);
          },
          draw() {
            background(ctx, false);
            // field arrows
            ctx.fillStyle = 'rgba(160,215,240,.35)'; ctx.strokeStyle = 'rgba(160,215,240,.35)'; ctx.lineWidth = 1.5;
            for (const [rr, n] of [[200, 14], [270, 18], [350, 24]]) for (let i = 0; i < n; i++) {
              const a = i / n * 6.2832, x = CX + rr * Math.cos(a), y = CY + rr * Math.sin(a);
              if (x < 8 || x > W - 8 || y < 8 || y > H - 8) continue;
              const len = 40 * (R / rr) ** 2 * 1.8;
              arrow(ctx, x, y, x - Math.cos(a) * len, y - Math.sin(a) * len, 'rgba(160,215,240,.4)', '', 1.5, 6);
            }
            // planet
            const g = ctx.createRadialGradient(CX - 30, CY - 30, 10, CX, CY, R);
            g.addColorStop(0, '#4f8fb8'); g.addColorStop(1, '#1d4467');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, R, 0, 6.2832); ctx.fill();
            ctx.fillStyle = '#8ea2ba'; ctx.fillRect(CX - 4, CY - R - 12, 8, 12); // tower
            for (const o of old) line(ctx, o.pts, 'rgba(170,187,208,.28)', 1.5);
            line(ctx, shot.pts, shot.color, 2.5);
            if (shot.hit) { ctx.strokeStyle = COLOR.red; ctx.lineWidth = 3; const [x, y] = shot.pts[shot.pts.length - 1]; ctx.beginPath(); ctx.moveTo(x - 8, y - 8); ctx.lineTo(x + 8, y + 8); ctx.moveTo(x + 8, y - 8); ctx.lineTo(x - 8, y + 8); ctx.stroke(); }
            else dot(ctx, shot.x, shot.y, '#fff', 5);
            const [msg, col] = regime(shot.v);
            text(ctx, msg, 22, 32, col, 17);
            text(ctx, 'Circular-orbit speed ≈ 7.9 km/s · escape speed ≈ 11.2 km/s', 22, H - 22, COLOR.dim, 15);
          },
          act(id) { if (id === 'fire') fire(); else if (id === 'clear') { old = []; } },
          onInput() { old = []; shot = null; fire(); }
        };
      }
    },

    // ---------------------------------------------------------------- FLU06
    flight: {
      label: 'Wing angle', min: 0, max: 20, value: 6, animated: false,
      make(ctx, get) {
        return {
          reset() {},
          draw() {
            background(ctx);
            const angle = get(), stalled = angle >= 15, cx = 440, cy = 260;
            ctx.save(); ctx.translate(cx, cy); ctx.rotate(-angle * Math.PI / 180);
            ctx.fillStyle = '#5a7a96'; ctx.strokeStyle = '#9ee1dc'; ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(-150, 8); ctx.quadraticCurveTo(-30, -32, 145, -2); ctx.quadraticCurveTo(20, 26, -150, 8);
            ctx.fill(); ctx.stroke(); ctx.restore();
            for (let j = -2; j <= 2; j++) {
              const y = cy + j * 36;
              ctx.strokeStyle = '#61c9c4'; ctx.lineWidth = 2; ctx.beginPath();
              ctx.moveTo(50, y); ctx.bezierCurveTo(250, y - 7, 470, y + 25, 780, y + 55); ctx.stroke();
            }
            const lift = stalled ? 60 : 45 + angle * 8;
            arrow(ctx, 440, 205, 440, 205 - lift, stalled ? COLOR.red : '#f8ba58', 'Lift');
            arrow(ctx, 440, 315, 440, 405, COLOR.red, 'Weight');
            arrow(ctx, 590, 260, 690, 260, '#f8ba58', 'Thrust');
            arrow(ctx, 290, 260, 200, 260, COLOR.red, 'Drag');
            text(ctx, 'Wing angle: ' + angle + '°', 25, 40, COLOR.text, 21);
            text(ctx, stalled ? 'High angle: stall region (illustrative)' : 'Airflow is turned downward', 25, 75, stalled ? COLOR.red : '#a9d7d4', 21);
          }
        };
      }
    },

    // ---------------------------------------------------------------- FND07
    vectors: {
      controls: [
        { key: 'ang', label: 'Angle between ropes', min: 0, max: 180, value: 60, step: 5, format: v => v + '°' },
        { key: 'b', label: 'Person B pulls', min: 20, max: 100, value: 100, step: 10, format: v => v + ' N' }
      ],
      animated: true,
      make(ctx, get) {
        const SX = 330, SY = 250, K = 1.25, A_FORCE = 100;
        let off;
        const sum = () => {
          const h = get('ang') / 2 * Math.PI / 180, b = get('b');
          const ax = A_FORCE * Math.cos(h), ay = -A_FORCE * Math.sin(h), bx = b * Math.cos(h), by = b * Math.sin(h);
          return { ax, ay, bx, by, rx: ax + bx, ry: ay + by };
        };
        return {
          reset() { off = 0; },
          step() { const s = sum(); off += Math.hypot(s.rx, s.ry) * 0.03; },
          draw() {
            const s = sum(), R = Math.hypot(s.rx, s.ry), a = Math.atan2(s.ry, s.rx);
            ctx.fillStyle = COLOR.bg; ctx.fillRect(0, 0, W, H);
            // floor grid scrolls backwards as the sled moves along the pull
            ctx.strokeStyle = COLOR.grid; ctx.lineWidth = 1;
            const g = 50, ox = (-off * Math.cos(a)) % g, oy = (-off * Math.sin(a)) % g;
            for (let x = ox - g; x < W + g; x += g) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
            for (let y = oy - g; y < H + g; y += g) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
            // people, ropes, force arrows
            const pa = [SX + s.ax * 2.6, SY + s.ay * 2.6], pb = [SX + s.bx * 2.6, SY + s.by * 2.6];
            ctx.strokeStyle = '#8b7f69'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(SX, SY); ctx.lineTo(pa[0], pa[1]); ctx.moveTo(SX, SY); ctx.lineTo(pb[0], pb[1]); ctx.stroke();
            dot(ctx, pa[0], pa[1], COLOR.amber, 12); dot(ctx, pb[0], pb[1], COLOR.teal, 12);
            text(ctx, 'A', pa[0], pa[1] + 5, '#10192a', 14, 'center'); text(ctx, 'B', pb[0], pb[1] + 5, '#10192a', 14, 'center');
            // parallelogram
            ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(SX + s.ax * K, SY + s.ay * K); ctx.lineTo(SX + s.rx * K, SY + s.ry * K); ctx.lineTo(SX + s.bx * K, SY + s.by * K); ctx.stroke(); ctx.setLineDash([]);
            arrow(ctx, SX, SY, SX + s.ax * K, SY + s.ay * K, COLOR.amber, '', 4);
            arrow(ctx, SX, SY, SX + s.bx * K, SY + s.by * K, COLOR.teal, '', 4);
            if (R > 3) arrow(ctx, SX, SY, SX + s.rx * K, SY + s.ry * K, '#ffffff', '', 6, 16);
            // sled
            ctx.save(); ctx.translate(SX, SY); ctx.rotate(R > 3 ? a : 0);
            ctx.fillStyle = '#6e5a3c'; ctx.strokeStyle = '#cdb88a'; ctx.lineWidth = 2; ctx.fillRect(-22, -14, 44, 28); ctx.strokeRect(-22, -14, 44, 28); ctx.restore();
            text(ctx, 'Pulls added as numbers:  ' + (A_FORCE + get('b')) + ' N', 22, 34, COLOR.dim, 16);
            text(ctx, 'Net pull on the sled (arrows added):  ' + Math.round(R) + ' N', 22, 62, '#ffffff', 18);
            text(ctx, R > 3 ? 'Pointing ' + Math.abs(Math.round(a * 180 / Math.PI)) + '° ' + (a < -0.01 ? 'towards A' : a > 0.01 ? 'towards B' : 'straight ahead') : 'The pulls cancel: the sled goes nowhere', 22, 88, COLOR.dim, 15);
            text(ctx, 'Amber: A (always 100 N)   Teal: B   White: the sum', 22, H - 22, COLOR.dim, 15);
          }
        };
      }
    },

    // ---------------------------------------------------------------- FND10
    vfield: {
      label: 'Flow speed', min: 1, max: 10, value: 5, animated: true,
      buttons: [{ id: 'next', label: 'Next field: Source' }, { id: 'clear', label: 'Clear leaves' }],
      make(ctx, get) {
        const NAMES = ['Whirlpool', 'Source', 'Sink', 'Saddle', 'Weather map'];
        const CX = 450, CY = 250;
        let kind, leaves, frame;
        function f(x, y) {
          const dx = x - CX, dy = y - CY, r = Math.hypot(dx, dy) + 1e-6;
          switch (kind) {
            case 0: return [-dy / (60 + r) * 1.3, dx / (60 + r) * 1.3];
            case 1: return [dx / (60 + r) * 1.3, dy / (60 + r) * 1.3];
            case 2: return [-dx / (60 + r) * 1.3, -dy / (60 + r) * 1.3];
            case 3: return [dx / 230, -dy / 230];
            default: {
              const vort = (cx, cy, k) => { const ax = x - cx, ay = y - cy, rr = Math.hypot(ax, ay) + 1e-6; return [-ay / (70 + rr) * k, ax / (70 + rr) * k]; };
              const a = vort(300, 190, -1.5), b = vort(650, 330, 1.0);
              return [0.35 + a[0] + b[0], a[1] + b[1]];
            }
          }
        }
        function spawn(x, y) { if (leaves.length < 60) leaves.push({ x, y, trail: [[x, y]], age: 0 }); }
        return {
          reset() { kind = 0; leaves = []; frame = 0; },
          step() {
            frame++;
            if (frame % 25 === 0) spawn(40 + Math.random() * (W - 80), 40 + Math.random() * (H - 80));
            const sp = get() * 1.1;
            for (const l of leaves) {
              const [u, v] = f(l.x, l.y); l.x += u * sp; l.y += v * sp; l.age++;
              if (l.age % 2 === 0) { l.trail.push([l.x, l.y]); if (l.trail.length > 70) l.trail.shift(); }
            }
            leaves = leaves.filter(l => l.x > -10 && l.x < W + 10 && l.y > -10 && l.y < H + 10 && l.age < 1500 && !((kind === 2) && Math.hypot(l.x - CX, l.y - CY) < 7));
          },
          draw() {
            background(ctx, false);
            for (let y = 30; y < H; y += 46) for (let x = 30; x < W; x += 46) {
              const [u, v] = f(x, y), m = Math.hypot(u, v), len = Math.min(34, m * 30), s = m > 1e-6 ? 1 / m : 0;
              const t = Math.min(1, m / 1.2), col = `rgb(${Math.round(80 + 165 * t)},${Math.round(150 + 34 * t)},${Math.round(190 - 97 * t)})`;
              arrow(ctx, x - u * s * len / 2, y - v * s * len / 2, x + u * s * len / 2, y + v * s * len / 2, col, '', 2, 6);
            }
            for (const l of leaves) { line(ctx, l.trail, 'rgba(255,255,255,.45)', 1.5); dot(ctx, l.x, l.y, '#ffffff', 4); }
            ctx.fillStyle = 'rgba(16,26,42,.88)'; ctx.fillRect(0, 0, W, 44); ctx.fillRect(0, H - 36, W, 36);
            text(ctx, NAMES[kind] + ' field: an arrow at every point', 22, 30, COLOR.text, 17);
            text(ctx, 'Click to drop a leaf and watch it follow the arrows. Longer, redder arrows = faster flow.', 22, H - 18, COLOR.dim, 14);
          },
          pointer(kind2, fx, fy, pressed) { if (kind2 === 'down') { spawn(fx * W, fy * H); return true; } return false; },
          act(id) {
            if (id === 'next') { kind = (kind + 1) % NAMES.length; leaves = []; return 'Next field: ' + NAMES[(kind + 1) % NAMES.length]; }
            if (id === 'clear') leaves = [];
          }
        };
      }
    },

    // ---------------------------------------------------------------- MEC01
    kine: {
      label: 'Car B accelerates at', min: 2, max: 6, value: 3, step: 1, format: v => v + ' m/s²', animated: true,
      make(ctx, get) {
        const VA = 15, PX = 2.5, X0 = 40, FINISH = 300, TMAX = 20, SPEEDUP = 2;
        let t, hold, passed;
        const posB = a => 0.5 * a * t * t;
        return {
          reset() { t = 0; hold = 0; passed = null; },
          step() {
            const a = get();
            if (t >= TMAX) { if (++hold > 80) { t = 0; hold = 0; passed = null; } return; }
            t += SPEEDUP / 60;
            if (passed === null && posB(a) >= VA * t) passed = t;
          },
          draw() {
            const a = get(); background(ctx, false);
            // road
            ctx.fillStyle = '#18253a'; ctx.fillRect(0, 60, W, 100);
            ctx.strokeStyle = '#51627a'; ctx.setLineDash([14, 12]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 110); ctx.lineTo(W, 110); ctx.stroke(); ctx.setLineDash([]);
            for (let m = 0; m <= 300; m += 50) { const x = X0 + m * PX; ctx.strokeStyle = '#3a4b65'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, 160); ctx.lineTo(x, 168); ctx.stroke(); text(ctx, m + ' m', x, 183, COLOR.dim, 12, 'center'); }
            const xa = X0 + VA * t * PX, xb = X0 + posB(a) * PX;
            for (const [x, y, c, n] of [[xa, 85, COLOR.teal, 'A'], [xb, 135, COLOR.amber, 'B']]) {
              ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 26, y - 11, 34, 22, 6) : ctx.rect(x - 26, y - 11, 34, 22); ctx.fill();
              text(ctx, n, x - 9, y + 5, '#10192a', 14, 'center');
            }
            text(ctx, 'A: steady 15 m/s. Speed never changes.', 22, 30, COLOR.teal, 16);
            text(ctx, 'B: starts at rest, speed grows by ' + a + ' m/s every second.', 22, 50, COLOR.amber, 16);
            text(ctx, 't = ' + t.toFixed(1) + ' s', W - 22, 30, COLOR.text, 18, 'right');
            // graphs
            const vmax = Math.max(20, Math.ceil(a * TMAX / 10) * 10);
            const graph = (gx, gy, gw, gh, title, ymax, fa, fb, unit) => {
              ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh);
              text(ctx, title, gx, gy - 12, COLOR.text, 14); text(ctx, String(ymax), gx - 6, gy + 6, COLOR.dim, 11, 'right'); text(ctx, '0', gx - 6, gy + gh, COLOR.dim, 11, 'right'); text(ctx, TMAX + ' s', gx + gw, gy + gh + 16, COLOR.dim, 11, 'right');
              const pa = [], pb = [];
              for (let s = 0; s <= t + 1e-9; s += 0.25) { pa.push([gx + s / TMAX * gw, gy + gh - Math.min(1, fa(s) / ymax) * gh]); pb.push([gx + s / TMAX * gw, gy + gh - Math.min(1, fb(s) / ymax) * gh]); }
              line(ctx, pa, COLOR.teal, 2.5); line(ctx, pb, COLOR.amber, 2.5);
              if (passed !== null && gx > 400) { const x = gx + passed / TMAX * gw; ctx.strokeStyle = '#fff'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy + gh); ctx.stroke(); ctx.setLineDash([]); text(ctx, 'B overtakes A', x + 6, gy + 16, '#fff', 12); }
            };
            graph(70, 250, 340, 190, 'Speed (m/s) against time', vmax, () => VA, s => a * s, '');
            graph(520, 250, 340, 190, 'Distance (m) against time', 400, s => VA * s, s => 0.5 * a * s * s, '');
          }
        };
      }
    },

    // ---------------------------------------------------------------- MEC02
    fall: {
      label: 'Air', min: 0, max: 100, value: 100, step: 5, format: v => v === 0 ? 'none (vacuum)' : v + '% of normal',
      animated: true, resetOnInput: true,
      buttons: [{ id: 'drop', label: 'Drop again' }],
      make(ctx, get) {
        const G = 9.81, TOP = 50, GROUND = 440, PXM = 22, SLOW = 0.5, DT = SLOW / 60;
        const OBJ = [{ name: 'Hammer', x: 300, kd: 0.002, col: COLOR.amber, r: 17 }, { name: 'Feather', x: 600, kd: 0.2, col: COLOR.teal, r: 17 }];
        let s;
        return {
          reset() { s = { t: 0, marks: [[], []], nm: [.25, .25], done: [null, null], o: OBJ.map(() => ({ y: 0, v: 0 })) }; },
          step() {
            const rho = get() / 100;
            s.t += DT;
            OBJ.forEach((ob, i) => {
              if (s.done[i] !== null) return;
              const o = s.o[i];
              o.v += (G - ob.kd * rho * o.v * Math.abs(o.v)) * DT; o.y += o.v * DT;
              if (s.t >= s.nm[i]) { s.marks[i].push([o.y]); s.nm[i] += .25; }
              if (TOP + o.y * PXM + ob.r >= GROUND) { o.y = (GROUND - ob.r - TOP) / PXM; s.done[i] = s.t; }
            });
          },
          draw() {
            background(ctx, false);
            ctx.fillStyle = '#243247'; ctx.fillRect(0, GROUND, W, H - GROUND);
            ctx.strokeStyle = '#51627a'; ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
            OBJ.forEach((ob, i) => {
              const o = s.o[i];
              for (const [my] of s.marks[i]) { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(ob.x - 34, TOP + my * PXM + ob.r); ctx.lineTo(ob.x + 34, TOP + my * PXM + ob.r); ctx.stroke(); }
              const y = TOP + o.y * PXM;
              if (i === 0) { ctx.fillStyle = ob.col; ctx.fillRect(ob.x - 12, y - 6, 24, 30 - 6); ctx.fillStyle = '#8ea2ba'; ctx.fillRect(ob.x - 3, y + 14, 6, 16); }
              else { ctx.fillStyle = ob.col; ctx.beginPath(); ctx.ellipse(ob.x, y + ob.r, 6, ob.r, 0.25, 0, 6.2832); ctx.fill(); ctx.strokeStyle = '#d9fffd'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ob.x - 3, y + 2 * ob.r - 2); ctx.lineTo(ob.x + 3, y); ctx.stroke(); }
              text(ctx, ob.name, ob.x, GROUND + 28, ob.col, 16, 'center');
              text(ctx, s.done[i] !== null ? 'landed at ' + s.done[i].toFixed(2) + ' s' : 'speed ' + o.v.toFixed(1) + ' m/s', ob.x, GROUND + 50, '#fff', 14, 'center');
            });
            text(ctx, 'Drop height about 17 m, shown at half speed. White ticks mark every quarter second.', 22, 28, COLOR.dim, 15);
            text(ctx, s.done[0] !== null && s.done[1] !== null ? (Math.abs(s.done[0] - s.done[1]) < 0.03 ? 'Together. Gravity gave both the same acceleration.' : 'The feather lost the race by ' + (s.done[1] - s.done[0]).toFixed(1) + ' s: air was pushing back.') : 'Dropped together…', 450, 78, '#fff', 17, 'center');
          },
          act(id) { if (id === 'drop') this.reset(); }
        };
      }
    },

    // ---------------------------------------------------------------- MEC03
    proj: {
      label: 'Launch speed', min: 5, max: 30, value: 18, step: 1, format: v => v + ' m/s',
      animated: true, resetOnInput: true,
      buttons: [{ id: 'fire', label: 'Fire again' }],
      make(ctx, get) {
        const G = 9.81, X0 = 70, H0 = 30, PXM = 8, GROUND = 450, TOP = GROUND - H0 * PXM, SLOW = .6;
        let s;
        return {
          reset() { s = { t: 0, trailA: [], trailB: [], ticks: [], done: false, tl: Math.sqrt(2 * H0 / G) }; },
          step() {
            if (s.done) return;
            const prev = s.t; s.t = Math.min(s.t + SLOW / 60, s.tl);
            const v = get(), ya = .5 * G * s.t * s.t, xb = v * s.t;
            s.trailA.push([X0, TOP + ya * PXM]); s.trailB.push([X0 + xb * PXM, TOP + ya * PXM]);
            if (Math.floor(s.t / .25) > Math.floor(prev / .25)) s.ticks.push([X0, X0 + xb * PXM, TOP + ya * PXM]);
            if (s.t >= s.tl) s.done = true;
          },
          draw() {
            background(ctx, false);
            ctx.fillStyle = '#243247'; ctx.fillRect(0, GROUND, W, H - GROUND);
            ctx.fillStyle = '#51627a'; ctx.fillRect(X0 - 40, TOP + 8, 40, GROUND - TOP - 8);
            ctx.strokeStyle = '#51627a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
            for (const [xa, xb, y] of s.ticks) { ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke(); }
            line(ctx, s.trailA, 'rgba(103,212,208,.6)', 2); line(ctx, s.trailB, 'rgba(245,184,93,.7)', 2);
            const a = s.trailA[s.trailA.length - 1] || [X0, TOP], b = s.trailB[s.trailB.length - 1] || [X0, TOP];
            dot(ctx, a[0], a[1], COLOR.teal, 9); dot(ctx, b[0], b[1], COLOR.amber, 9);
            text(ctx, 'Teal: dropped.  Amber: fired sideways at ' + get() + ' m/s.', 22, 30, COLOR.text, 16);
            text(ctx, 'White lines join the two balls every quarter second: they are always level.', 22, 54, COLOR.dim, 14);
            text(ctx, s.done ? 'Both landed at t = ' + s.tl.toFixed(2) + ' s. Amber travelled ' + Math.round(get() * s.tl) + ' m sideways.' : 't = ' + s.t.toFixed(2) + ' s', 450, 100, '#fff', 17, 'center');
          },
          act(id) { if (id === 'fire') this.reset(); }
        };
      }
    },

    // ---------------------------------------------------------------- MEC04
    puck: {
      controls: [
        { key: 'mu', label: 'Friction', min: 0, max: 80, value: 0, step: 5, format: v => v === 0 ? 'none (air-hockey)' : 'μ = ' + (v / 100).toFixed(2) },
        { key: 'm', label: 'Mass', min: 1, max: 10, value: 2, step: 1, format: v => v + ' kg' }
      ],
      animated: true,
      buttons: [{ id: 'push', label: 'Push!' }],
      make(ctx, get) {
        const G = 9.81, F = 20, PUSHFRAMES = 18, PXM = 40, DT = 1 / 60;
        let s;
        return {
          reset() { s = { x: 0, v: 0, t: 0, push: 0, hist: [] }; },
          step() {
            const mu = get('mu') / 100, m = get('m');
            const pushing = s.push > 0; if (pushing) s.push -= 1;
            const drive = pushing ? F / m : 0;
            const a = s.v > 0 ? drive - mu * G : Math.max(0, drive - mu * G);
            s.v = Math.max(0, s.v + a * DT);
            s.x += s.v * DT; s.t += DT;
            if (Math.round(s.t / DT) % 3 === 0) { s.hist.push(s.v); if (s.hist.length > 240) s.hist.shift(); }
          },
          draw() {
            const mu = get('mu') / 100, m = get('m');
            background(ctx, false);
            // ice with scrolling marks
            ctx.fillStyle = '#16314a'; ctx.fillRect(0, 150, W, 90);
            ctx.strokeStyle = '#2e5a7d'; ctx.lineWidth = 2;
            for (let k = -12; k < 14; k++) { const x = 450 + (k - s.x % 1) * PXM; ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x, 240); ctx.stroke(); }
            const r = 14 + m * 1.6;
            ctx.fillStyle = '#e8edf5'; ctx.beginPath(); ctx.ellipse(450, 195, r, r * .6, 0, 0, 6.2832); ctx.fill();
            ctx.fillStyle = '#10192a'; text(ctx, m + ' kg', 450, 199, '#10192a', 12, 'center');
            if (s.push > 0) { arrow(ctx, 450 - r - 90, 195, 450 - r - 6, 195, COLOR.amber, '', 5); text(ctx, 'push', 450 - r - 48, 180, COLOR.amber, 15, 'center'); }
            if (mu > 0 && s.v > 0) { arrow(ctx, 450 + r + 90, 195, 450 + r + 6, 195, COLOR.red, '', 4); text(ctx, 'friction', 450 + r + 48, 180, COLOR.red, 15, 'center'); }
            text(ctx, 'speed ' + s.v.toFixed(2) + ' m/s', 22, 30, '#fff', 18); text(ctx, 'distance ' + s.x.toFixed(1) + ' m', 22, 56, COLOR.dim, 16);
            const net = (s.push > 0 ? F : 0) - (mu > 0 && s.v > 0 ? mu * m * G : 0);
            text(ctx, 'net force ' + (s.v > 0 || s.push > 0 ? net.toFixed(1) : '0.0') + ' N', 22, 82, net === 0 ? COLOR.teal : COLOR.amber, 16);
            // speed graph
            const gx = 70, gy = 285, gw = 780, gh = 160;
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh);
            text(ctx, 'Speed against time (last 12 s)', gx, gy - 10, COLOR.text, 14); text(ctx, '8 m/s', gx - 6, gy + 6, COLOR.dim, 11, 'right'); text(ctx, '0', gx - 6, gy + gh, COLOR.dim, 11, 'right');
            line(ctx, s.hist.map((v, i) => [gx + i / 239 * gw, gy + gh - Math.min(1, v / 8) * gh]), COLOR.amber, 2.5);
            text(ctx, 'Press Push! then watch the speed. What changes it, and what doesn’t?', 450, H - 14, COLOR.dim, 14, 'center');
          },
          act(id) { if (id === 'push') s.push = PUSHFRAMES; }
        };
      }
    },

    // ---------------------------------------------------------------- MEC05
    brake: {
      controls: [
        { key: 'v', label: 'Speed', min: 20, max: 130, value: 50, step: 5, format: v => v + ' km/h' },
        { key: 'mu', label: 'Road grip', min: 10, max: 90, value: 70, step: 5, format: v => 'μ = ' + (v / 100).toFixed(2) + (v <= 15 ? ' (ice)' : v <= 45 ? ' (wet)' : v >= 70 ? ' (dry)' : '') }
      ],
      animated: true, resetOnInput: true,
      buttons: [{ id: 'go', label: 'Go again' }],
      make(ctx, get) {
        const G = 9.81, TR = 1.0, D = 70, X0 = 40, PXM = 5.6, DT = 1 / 60;
        let s;
        const calc = () => {
          const v = get('v') / 3.6, mu = get('mu') / 100, react = v * TR, brake = v * v / (2 * mu * G);
          const hit = react + brake > D, vi = hit ? Math.sqrt(Math.max(0, v * v - 2 * mu * G * Math.max(0, D - react))) : 0;
          return { v, mu, react, brake, hit, vi };
        };
        return {
          reset() { s = { t: 0, x: 0, v: get('v') / 3.6, flash: 0, over: false }; },
          step() {
            if (s.over) return;
            const c = calc();
            if (s.t >= TR) s.v = Math.max(0, s.v - c.mu * G * DT);
            s.x += s.v * DT; s.t += DT;
            if (s.x >= D) { s.over = true; s.hitV = s.v; s.x = D; } else if (s.v <= 0 && s.t > TR) s.over = true;
          },
          draw() {
            const c = calc(); background(ctx, false);
            ctx.fillStyle = '#18253a'; ctx.fillRect(0, 70, W, 70);
            ctx.strokeStyle = '#51627a'; ctx.setLineDash([16, 14]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 105); ctx.lineTo(W, 105); ctx.stroke(); ctx.setLineDash([]);
            for (let m = 0; m <= 150; m += 25) { const x = X0 + m * PXM; if (x > W) break; ctx.strokeStyle = '#3a4b65'; ctx.beginPath(); ctx.moveTo(x, 140); ctx.lineTo(x, 148); ctx.stroke(); text(ctx, m + ' m', x, 163, COLOR.dim, 12, 'center'); }
            // hazard
            const hx = X0 + D * PXM; ctx.fillStyle = COLOR.red; ctx.beginPath(); ctx.moveTo(hx, 82); ctx.lineTo(hx + 18, 128); ctx.lineTo(hx - 18, 128); ctx.closePath(); ctx.fill(); text(ctx, '!', hx, 120, '#10192a', 24, 'center'); text(ctx, 'hazard 70 m ahead', hx, 62, COLOR.red, 14, 'center');
            // car
            const cx = X0 + s.x * PXM; ctx.fillStyle = s.t < TR ? COLOR.teal : COLOR.amber; ctx.fillRect(cx - 34, 94, 34, 22);
            text(ctx, s.t < TR ? 'driver reacting…' : s.over ? '' : 'braking', Math.max(8, cx - 34), 86, '#fff', 12, 'left');
            // distance bars
            const bx = X0, by = 215, bh = 34;
            const rw = Math.min(c.react * PXM, W - 60 - bx), bw = Math.min(c.brake * PXM, W - 40 - bx - rw);
            ctx.fillStyle = COLOR.amber; ctx.fillRect(bx, by, rw, bh); ctx.fillStyle = COLOR.red; ctx.fillRect(bx + rw, by, Math.max(0, bw), bh);
            if (c.react + c.brake > (W - 40 - bx) / PXM) text(ctx, '→ off the scale', W - 30, by + bh + 20, COLOR.dim, 12, 'right');
            text(ctx, 'Where you stop', X0, by - 12, COLOR.text, 14);
            text(ctx, 'Reaction ' + c.react.toFixed(0) + ' m', bx + 4, by + 22, '#10192a', 14);
            text(ctx, 'Braking ' + c.brake.toFixed(0) + ' m', bx + rw + 6, by + bh + 20, COLOR.red, 14);
            text(ctx, 'Total stopping distance: ' + (c.react + c.brake).toFixed(0) + ' m', X0, 295, '#fff', 20);
            text(ctx, c.hit ? 'Too far: it hits the hazard at ' + Math.round(c.vi * 3.6) + ' km/h.' : 'Stops ' + (D - c.react - c.brake).toFixed(0) + ' m short of the hazard.', X0, 325, c.hit ? COLOR.red : COLOR.teal, 18);
            text(ctx, 'Reaction distance grows with speed. Braking distance grows with speed squared.', X0, 365, COLOR.dim, 15);
            text(ctx, 'Driver reaction time fixed at 1 s.', X0, 388, COLOR.dim, 14);
            if (s.over && c.hit) { ctx.fillStyle = 'rgba(241,138,118,.8)'; ctx.beginPath(); ctx.arc(hx, 105, 26, 0, 6.2832); ctx.fill(); }
          },
          act(id) { if (id === 'go') this.reset(); }
        };
      }
    },

    // ---------------------------------------------------------------- MEC07
    skate: {
      label: 'Skater B mass', min: 20, max: 120, value: 60, step: 10, format: v => v + ' kg',
      animated: true, resetOnInput: true,
      buttons: [{ id: 'push', label: 'Push apart' }],
      make(ctx, get) {
        const MA = 60, J = 240, PXM = 30, SLOW = .6, CX = 450;
        let s;
        return {
          reset() { s = { xa: CX - 24, xb: CX + 24, va: 0, vb: 0, pushed: false }; },
          step() {
            if (!s.pushed) return;
            s.xa = Math.max(34, s.xa + s.va * PXM * SLOW / 60); s.xb = Math.min(W - 34, s.xb + s.vb * PXM * SLOW / 60);
          },
          draw() {
            const mb = get(); background(ctx, false);
            ctx.fillStyle = '#16314a'; ctx.fillRect(0, 140, W, 130);
            const ra = Math.sqrt(MA) * 3.2, rb = Math.sqrt(mb) * 3.2;
            for (const [x, col, r, name, m] of [[s.xa, COLOR.teal, ra, 'A', MA], [s.xb, COLOR.amber, rb, 'B', mb]]) {
              ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, 205, r, 0, 6.2832); ctx.fill();
              text(ctx, name, x, 211, '#10192a', 18, 'center'); text(ctx, m + ' kg', x, 205 - r - 10, col, 14, 'center');
            }
            if (s.pushed) {
              if (Math.abs(s.va) > 0) arrow(ctx, s.xa, 205 + ra + 20, s.xa + s.va * 22, 205 + ra + 20, COLOR.teal, '', 4);
              arrow(ctx, s.xb, 205 + rb + 20, s.xb + s.vb * 22, 205 + rb + 20, COLOR.amber, '', 4);
              text(ctx, 'A moves at ' + Math.abs(s.va).toFixed(1) + ' m/s', 22, 30, COLOR.teal, 16); text(ctx, 'B moves at ' + Math.abs(s.vb).toFixed(1) + ' m/s', 22, 54, COLOR.amber, 16);
            } else text(ctx, 'Both at rest. Press Push apart.', 22, 30, COLOR.dim, 16);
            // momentum bars
            const pa = s.pushed ? -J : 0, pb = s.pushed ? J : 0, by = 340, K = .8;
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(CX, by - 14); ctx.lineTo(CX, by + 90); ctx.stroke();
            text(ctx, 'Momentum (mass × velocity)', CX, by - 24, COLOR.text, 14, 'center');
            ctx.fillStyle = COLOR.teal; ctx.fillRect(CX + Math.min(0, pa * K), by, Math.abs(pa * K), 24); ctx.fillStyle = COLOR.amber; ctx.fillRect(CX, by + 34, Math.abs(pb * K), 24);
            text(ctx, 'A: ' + pa + ' N·s', CX - 8 + Math.min(0, pa * K) - 6, by + 18, COLOR.teal, 14, 'right'); text(ctx, 'B: ' + (pb > 0 ? '+' : '') + pb + ' N·s', CX + pb * K + 8, by + 52, COLOR.amber, 14);
            text(ctx, 'Total: ' + (pa + pb) + ' N·s. It was zero before and it is zero after.', CX, by + 98, '#fff', 17, 'center');
            const com = (MA * s.xa + mb * s.xb) / (MA + mb); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(com, 290); ctx.lineTo(com + 7, 298); ctx.lineTo(com, 306); ctx.lineTo(com - 7, 298); ctx.fill();
            text(ctx, 'centre of mass', com, 286, '#fff', 12, 'center');
          },
          act(id) { if (id === 'push' && !s.pushed) { s.pushed = true; s.va = -J / MA; s.vb = J / get(); } }
        };
      }
    },

    // ---------------------------------------------------------------- MEC08
    collide: {
      controls: [
        { key: 'e', label: 'Bounciness', min: 0, max: 100, value: 100, step: 10, format: v => v === 100 ? 'perfectly bouncy' : v === 0 ? 'sticks together' : v + '%' },
        { key: 'mb', label: 'Cart B mass', min: 1, max: 4, value: 1, step: 1, format: v => v + ' × A' }
      ],
      animated: true, resetOnInput: true,
      buttons: [{ id: 'again', label: 'Collide again' }],
      make(ctx, get) {
        const PX = 50, VA = 4, Y = 130;
        let s;
        const wid = m => 40 + 22 * Math.sqrt(m);
        const after = () => { const e = get('e') / 100, mb = get('mb'); return { va: (1 - e * mb) * VA / (1 + mb), vb: (1 + e) * VA / (1 + mb) }; };
        return {
          reset() { s = { xa: 120, xb: 520, va: VA, vb: 0, hit: false, t: 0 }; },
          step() {
            const mb = get('mb'), wa = wid(1), wb = wid(mb);
            s.xa += s.va * PX / 60; s.xb += s.vb * PX / 60;
            if (!s.hit && s.xa + wa / 2 >= s.xb - wb / 2) { const r = after(); s.va = r.va; s.vb = r.vb; s.hit = true; if (get('e') === 0) s.vb = s.va; }
            s.xa = Math.max(wa / 2, Math.min(W - wa / 2, s.xa)); s.xb = Math.max(wb / 2, Math.min(W - wb / 2, s.xb));
          },
          draw() {
            const mb = get('mb'), e = get('e') / 100; background(ctx, false);
            ctx.fillStyle = '#16314a'; ctx.fillRect(0, Y + 36, W, 18);
            for (const [x, col, m, n] of [[s.xa, COLOR.teal, 1, 'A'], [s.xb, COLOR.amber, mb, 'B']]) {
              const w = wid(m); ctx.fillStyle = col; ctx.fillRect(x - w / 2, Y - 20, w, 56);
              text(ctx, n + ' · ' + m + ' unit' + (m > 1 ? 's' : ''), x, Y + 14, '#10192a', 14, 'center');
            }
            if (s.va !== 0) arrow(ctx, s.xa, Y - 36, s.xa + s.va * 22, Y - 36, COLOR.teal, '', 3, 9);
            if (s.vb !== 0) arrow(ctx, s.xb, Y - 36, s.xb + s.vb * 22, Y - 36, COLOR.amber, '', 3, 9);
            // bars
            const ke = (va, vb) => .5 * va * va + .5 * mb * vb * vb, pm = (va, vb) => va + mb * vb;
            const r = after(), vaa = e === 0 ? r.va : r.va, vbb = e === 0 ? r.va : r.vb;
            const bx = 70, K = 40;
            text(ctx, 'Momentum (mass × velocity)', bx, 238, COLOR.text, 15);
            text(ctx, 'Movement energy', 480, 238, COLOR.text, 15);
            const bars = [[bx, 262, 'before', pm(VA, 0), 'rgba(170,187,208,.7)', 'kg·units'], [bx, 300, 'after', pm(vaa, vbb), COLOR.teal, '']];
            const kb = [[480, 262, 'before', ke(VA, 0), 'rgba(170,187,208,.7)'], [480, 300, 'after', ke(vaa, vbb), COLOR.amber]];
            for (const [x, y, lab, v, col] of bars) { ctx.fillStyle = col; ctx.fillRect(x + 56, y, Math.max(1, v * K), 24); text(ctx, lab, x + 50, y + 17, COLOR.dim, 13, 'right'); text(ctx, (s.hit || lab === 'before' ? v.toFixed(1) : '—'), x + 62 + v * K, y + 17, '#fff', 13); }
            for (const [x, y, lab, v, col] of kb) { const w = s.hit || lab === 'before' ? Math.max(1, v * 25) : 0; ctx.fillStyle = col; ctx.fillRect(x + 56, y, w, 24); text(ctx, lab, x + 50, y + 17, COLOR.dim, 13, 'right'); text(ctx, (s.hit || lab === 'before' ? v.toFixed(1) + ' J' : '—'), x + 62 + w, y + 17, '#fff', 13); }
            const lost = ke(VA, 0) - ke(vaa, vbb);
            text(ctx, s.hit ? (lost > 0.05 ? 'Energy lost to heat and denting: ' + lost.toFixed(1) + ' J (' + Math.round(lost / ke(VA, 0) * 100) + '%)' : 'No energy lost: a perfectly elastic collision.') : 'A (1 unit) moves at 4 m/s towards B at rest.', 70, 372, s.hit && lost > .05 ? COLOR.red : COLOR.teal, 17);
            text(ctx, s.hit ? 'Momentum before and after: the same, whatever the bounciness.' : 'Watch the bars: one of these will change, one will not.', 70, 400, COLOR.dim, 15);
          },
          act(id) { if (id === 'again') this.reset(); }
        };
      }
    },

    // ---------------------------------------------------------------- MEC09
    impact: {
      controls: [
        { key: 'v', label: 'Speed', min: 30, max: 100, value: 50, step: 10, format: v => v + ' km/h' },
        { key: 'd', label: 'Stopping distance', min: 5, max: 100, value: 50, step: 5, format: v => (v / 100).toFixed(2) + ' m' }
      ],
      animated: true, resetOnInput: true,
      buttons: [{ id: 'crash', label: 'Crash again' }],
      make(ctx, get) {
        const M = 70, G = 9.81, PXM = 300, SLOW = .05, APPR = 420 / PXM;
        let s;
        const calc = () => { const v = get('v') / 3.6, d = get('d') / 100, a = v * v / (2 * d), T = 2 * d / v; return { v, d, a, T, F: M * a }; };
        return {
          reset() { s = { tReal: 0 }; },
          step() { s.tReal += SLOW / 60; },
          draw() {
            const c = calc(); background(ctx, false);
            const wallX = 100, cushionW = Math.max(6, c.d * PXM), gy = 120;
            ctx.fillStyle = '#51627a'; ctx.fillRect(wallX - 40, gy - 30, 40, 100);
            ctx.fillStyle = 'rgba(245,184,93,.45)'; ctx.fillRect(wallX, gy - 24, cushionW, 88);
            ctx.strokeStyle = COLOR.amber; ctx.lineWidth = 2; ctx.strokeRect(wallX, gy - 24, cushionW, 88);
            text(ctx, 'cushion ' + c.d.toFixed(2) + ' m', wallX + cushionW / 2, gy - 32, COLOR.amber, 13, 'center');
            // free approach, then constant deceleration across the cushion
            const T = s.tReal - APPR / c.v;
            let pos;                                    // metres from the cushion face (positive = away from the wall)
            if (T < 0) pos = APPR - c.v * s.tReal; else if (T < c.T) pos = -(c.v * T - .5 * c.a * T * T); else pos = -c.d;
            const px = wallX + cushionW + pos * PXM;
            ctx.fillStyle = COLOR.teal; ctx.beginPath(); ctx.arc(px + 20, gy + 20, 24, 0, 6.2832); ctx.fill();
            text(ctx, '70 kg', px + 20, gy + 26, '#10192a', 14, 'center');
            const vNow = T < 0 ? c.v : T < c.T ? Math.max(0, c.v - c.a * T) : 0;
            text(ctx, 'speed ' + (vNow * 3.6).toFixed(0) + ' km/h', 22, 34, '#fff', 17);
            text(ctx, 'Shown at 1/20 of real speed', 22, 58, COLOR.dim, 14);
            // deceleration-time graph
            const gx = 70, gy2 = 240, gw = 560, gh = 190, tmax = 0.3, amax = 200;
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(gx, gy2, gw, gh);
            text(ctx, 'Deceleration (in g) during the stop', gx, gy2 - 12, COLOR.text, 14);
            text(ctx, '200 g', gx - 6, gy2 + 6, COLOR.dim, 11, 'right'); text(ctx, '0', gx - 6, gy2 + gh, COLOR.dim, 11, 'right'); text(ctx, '0.3 s', gx + gw, gy2 + gh + 16, COLOR.dim, 11, 'right');
            const w = c.T / tmax * gw, h = Math.min(1, c.a / G / amax) * gh;
            ctx.fillStyle = 'rgba(103,212,208,.35)'; ctx.fillRect(gx, gy2 + gh - h, Math.max(2, w), h); ctx.strokeStyle = COLOR.teal; ctx.lineWidth = 2.5; ctx.strokeRect(gx, gy2 + gh - h, Math.max(2, w), h);
            text(ctx, 'The shaded area (change in speed) is the same every time.', gx + 150, gy2 + 22, COLOR.dim, 13);
            const rx = 660;
            text(ctx, 'Stop takes', rx, 262, COLOR.dim, 14); text(ctx, (c.T * 1000).toFixed(0) + ' ms', rx, 288, '#fff', 22);
            text(ctx, 'Deceleration', rx, 326, COLOR.dim, 14); text(ctx, (c.a / G).toFixed(0) + ' g', rx, 352, '#fff', 22);
            text(ctx, 'Average force', rx, 390, COLOR.dim, 14); text(ctx, (c.F / 1000).toFixed(1) + ' kN', rx, 416, c.a / G > 40 ? COLOR.red : c.a / G > 20 ? COLOR.amber : COLOR.teal, 22);
            text(ctx, '(' + Math.round(c.F / (M * G)) + ' × body weight)', rx, 440, COLOR.dim, 13);
          },
          act(id) { if (id === 'crash') this.reset(); }
        };
      }
    },

    // ---------------------------------------------------------------- MEC10
    com: {
      label: 'Shape', min: 1, max: 3, value: 1, step: 1, format: v => ['L-shape', 'Arrow', 'Boot'][v - 1],
      animated: true, resetOnInput: true,
      buttons: [{ id: 'clear', label: 'Clear lines' }, { id: 'reveal', label: 'Show centre of mass' }],
      make(ctx, get) {
        const SHAPES = [
          [[-110, -80], [110, -80], [110, -30], [-40, -30], [-40, 90], [-110, 90]],
          [[-130, 0], [-30, -70], [-30, -30], [130, -30], [130, 30], [-30, 30], [-30, 70]],
          [[-100, -90], [20, -90], [60, -30], [120, 40], [70, 100], [-100, 100], [-60, 10]]
        ];
        const P0 = [450, 100], K2 = 3600, GR = 900, DAMP = 2.4;
        let poly, c, p, th, om, lines, t, recorded, reveal;
        const centroid = pts => {
          let a = 0, cx = 0, cy = 0;
          for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length], cr = x0 * y1 - x1 * y0; a += cr; cx += (x0 + x1) * cr; cy += (y0 + y1) * cr; }
          a /= 2; return [cx / (6 * a), cy / (6 * a)];
        };
        const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
        const inside = (pt, pts) => { let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) ins = !ins; } return ins; };
        const toWorld = q => { const r = rot([q[0] - p[0], q[1] - p[1]], th); return [P0[0] + r[0], P0[1] + r[1]]; };
        const intersect = (l1, l2) => {
          const [p1, d1] = l1, [p2, d2] = l2, den = d1[0] * d2[1] - d1[1] * d2[0];
          if (Math.abs(den) < 1e-3) return null;
          const tt = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / den; return [p1[0] + d1[0] * tt, p1[1] + d1[1] * tt];
        };
        return {
          debug() { return { th, p, c, lines, poly }; },
          reset() { poly = SHAPES[get() - 1]; c = centroid(poly); p = poly[0].slice(); th = 0.9; om = 0; lines = []; t = 0; recorded = false; reveal = false; },
          step() {
            const r = [c[0] - p[0], c[1] - p[1]], rw = rot(r, th), I = K2 + r[0] * r[0] + r[1] * r[1], dt = 1 / 60;
            for (let i = 0; i < 4; i++) { const rw2 = rot(r, th), al = GR * rw2[0] / I; om += (al - DAMP * om) * dt / 4; th += om * dt / 4; }
            t += dt;
            if (!recorded && t > 0.8 && Math.abs(om) < 0.01 && Math.abs(rw[0]) < 0.4 && Math.hypot(r[0], r[1]) > 3) { recorded = true; lines.push([p.slice(), rot([0, 1], -th)]); }
          },
          draw() {
            background(ctx, false);
            ctx.strokeStyle = '#3a4b65'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(P0[0] - 60, P0[1] - 14); ctx.lineTo(P0[0] + 60, P0[1] - 14); ctx.stroke();
            ctx.save(); ctx.translate(P0[0], P0[1]); ctx.rotate(th); ctx.translate(-p[0], -p[1]);
            ctx.beginPath(); ctx.moveTo(poly[0][0], poly[0][1]); for (const q of poly.slice(1)) ctx.lineTo(q[0], q[1]); ctx.closePath();
            ctx.fillStyle = '#6e5a3c'; ctx.fill(); ctx.strokeStyle = '#cdb88a'; ctx.lineWidth = 3; ctx.stroke();
            ctx.setLineDash([8, 6]); ctx.lineWidth = 1.8; ctx.strokeStyle = COLOR.amber;
            for (const [lp, d] of lines) { ctx.beginPath(); ctx.moveTo(lp[0] - d[0] * 160, lp[1] - d[1] * 160); ctx.lineTo(lp[0] + d[0] * 260, lp[1] + d[1] * 260); ctx.stroke(); }
            ctx.setLineDash([]);
            let est = null; if (lines.length >= 2) est = intersect(lines[lines.length - 2], lines[lines.length - 1]);
            if (est) { dot(ctx, est[0], est[1], '#ffffff', 7); ctx.strokeStyle = '#10192a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(est[0], est[1], 7, 0, 6.2832); ctx.stroke(); }
            if (reveal) { ctx.strokeStyle = COLOR.teal; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(c[0], c[1], 13, 0, 6.2832); ctx.stroke(); }
            ctx.restore();
            dot(ctx, P0[0], P0[1], '#ffffff', 5); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(P0[0], P0[1]); ctx.lineTo(P0[0], H - 20); ctx.stroke(); ctx.setLineDash([]);
            text(ctx, 'Click a point on the shape to hang it from there.', 22, 34, COLOR.text, 16);
            const n = lines.length;
            text(ctx, n === 0 ? 'Wait for it to settle: a line is drawn straight down from the hanging point.' : n === 1 ? 'One line. The centre of mass is somewhere on it. Hang the shape from a different point.' : lines.length >= 2 ? 'Two lines cross at the centre of mass (white dot). Now hang it from that dot!' : '', 22, H - 18, COLOR.dim, 14);
          },
          pointer(kind, fx, fy) {
            if (kind !== 'down') return false;
            const wp = [fx * W, fy * H], q0 = rot([wp[0] - P0[0], wp[1] - P0[1]], -th), q = [q0[0] + p[0], q0[1] + p[1]];
            if (!inside(q, poly)) return false;
            // re-hang: choose a new pivot at the clicked point; keep the shape's pose so only the pivot changes
            p = q; om = 0; t = 0; recorded = false; return true;
          },
          act(id) { if (id === 'clear') { lines = []; recorded = false; t = 0; } else if (id === 'reveal') reveal = !reveal; }
        };
      }
    },

    // ---------------------------------------------------------------- MEC11
    coaster: {
      controls: [
        { key: 'H', label: 'Release height', min: 10, max: 28, value: 28, step: 1, format: v => v + ' m' },
        { key: 'f', label: 'Friction', min: 0, max: 10, value: 0, step: 1, format: v => v === 0 ? 'none' : String(v) }
      ],
      animated: true, resetOnInput: true,
      buttons: [{ id: 'again', label: 'Release again' }],
      make(ctx, get) {
        const G = 9.81, M = 500, PX = 10, GY = 470;
        const h = x => { if (x < 0) return h(0) + 8 * x * x; if (x > 90) return h(90) + 8 * (x - 90) * (x - 90); return 16 + 10 * Math.cos(2 * Math.PI * x / 50) + 4 * Math.cos(2 * Math.PI * x / 18.5 + 0.8); };
        const dh = x => (h(x + .01) - h(x - .01)) / .02;
        let s;
        return {
          debug() { return { s, h, M, G }; },
          reset() {
            const H0 = get('H'); let x0 = 0; for (let x = 0; x < 30; x += .02) { if (h(x) <= H0) { x0 = x; break; } }
            s = { x: x0, u: 0, heat: 0, E0: M * G * h(x0), maxh: h(x0) };
          },
          step() {
            const mu = get('f') * .005;
            for (let k = 0; k < 12; k++) {
              const dt = 1 / 720, sl = dh(s.x), n = Math.sqrt(1 + sl * sl), ag = -G * sl / n, df = mu * G / n * dt;
              let un = s.u + ag * dt;
              if (Math.abs(un) > df) un -= Math.sign(un) * df; else un = 0;
              if (mu > 0 && un !== 0) s.heat += M * mu * G / n * Math.abs(.5 * (s.u + un)) * dt;
              s.u = un; s.x += s.u * dt / n;
            }
          },
          draw() {
            background(ctx, false);
            const pts = []; for (let x = -3; x <= 93; x += .5) pts.push([450 + (x - 45) * PX * .97, GY - h(x) * PX]);
            ctx.fillStyle = '#17263a'; ctx.beginPath(); ctx.moveTo(pts[0][0], GY + 20); for (const q of pts) ctx.lineTo(q[0], q[1]); ctx.lineTo(pts[pts.length - 1][0], GY + 20); ctx.closePath(); ctx.fill();
            line(ctx, pts, '#9fb3cc', 3);
            const X = x => 450 + (x - 45) * PX * .97, cy = GY - h(s.x) * PX;
            ctx.strokeStyle = 'rgba(245,184,93,.6)'; ctx.setLineDash([8, 6]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, GY - s.maxh * PX); ctx.lineTo(W, GY - s.maxh * PX); ctx.stroke(); ctx.setLineDash([]);
            text(ctx, 'release height: the car can never get higher than this', W - 14, GY - s.maxh * PX - 8, COLOR.amber, 13, 'right');
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(X(s.x), cy - 8, 9, 0, 6.2832); ctx.fill(); ctx.strokeStyle = COLOR.teal; ctx.lineWidth = 3; ctx.stroke();
            // energy bar
            const pe = M * G * h(s.x), ke = .5 * M * s.u * s.u, E0 = s.E0, bx = 60, bw = 780, by = 40;
            const seg = [[pe, COLOR.amber, 'height energy'], [ke, COLOR.teal, 'movement energy'], [s.heat, COLOR.red, 'heat']];
            let x = bx; const tot = pe + ke + s.heat;
            for (const [v, col, lab] of seg) { const w = Math.max(0, v / E0 * bw); ctx.fillStyle = col; ctx.fillRect(x, by, w, 26); if (w > 80) text(ctx, lab, x + 8, by + 18, '#10192a', 13); x += w; }
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, 26);
            text(ctx, 'Where the energy is (the bar is always full)', bx, by - 10, COLOR.text, 14);
            text(ctx, 'speed ' + Math.abs(s.u).toFixed(1) + ' m/s   total ' + (tot / 1000).toFixed(0) + ' kJ' + (get('f') ? '   heat ' + (s.heat / 1000).toFixed(1) + ' kJ' : ''), bx, by + 52, COLOR.dim, 14);
          },
          act(id) { if (id === 'again') this.reset(); }
        };
      }
    },

    // ---------------------------------------------------------------- MEC12
    landscape: {
      label: 'Friction', min: 0, max: 10, value: 3, step: 1, format: v => v === 0 ? 'none' : String(v),
      animated: true,
      buttons: [{ id: 'next', label: 'Next landscape: Double well' }, { id: 'kick', label: 'Kick the ball' }],
      make(ctx, get) {
        const NAMES = ['Bowl', 'Double well', 'Hills and valleys'], G = 1500, BASE = 430;
        const U = [x => 12 + 175 * Math.pow((x - 450) / 450, 2), x => { const u = (x - 450) / 300; return 14 + 120 * Math.pow(u * u - 1, 2); }, x => 105 + 55 * Math.cos(2 * Math.PI * x / 300 + 0.9) + 25 * Math.cos(2 * Math.PI * x / 130)];
        let kind, b;
        const dU = x => (U[kind](x + .5) - U[kind](x - .5));
        return {
          debug() { return { b, U: U[kind], G, kind }; },
          reset() { kind = 0; b = { x: 760, v: 0 }; },
          step() {
            const gam = get() * .25;
            for (let i = 0; i < 6; i++) { const dt = 1 / 360; b.v += (-dU(b.x) * G / 1 * 1 - gam * b.v) * dt * 1; b.x += b.v * dt; if (b.x < 12) { b.x = 12; b.v = Math.abs(b.v) * .5; } if (b.x > W - 12) { b.x = W - 12; b.v = -Math.abs(b.v) * .5; } }
          },
          draw() {
            background(ctx, false);
            const f = U[kind], pts = []; for (let x = 0; x <= W; x += 6) pts.push([x, BASE - f(x)]);
            const Eh = f(b.x) + b.v * b.v / (2 * G);
            // allowed region (below the energy line)
            ctx.fillStyle = 'rgba(103,212,208,.16)'; for (let x = 0; x < W; x += 4) { const fx = f(x); if (fx < Eh) ctx.fillRect(x, BASE - Eh, 4, Eh - fx); }
            ctx.fillStyle = '#1a2b42'; ctx.beginPath(); ctx.moveTo(0, BASE + 40); for (const q of pts) ctx.lineTo(q[0], q[1]); ctx.lineTo(W, BASE + 40); ctx.closePath(); ctx.fill();
            line(ctx, pts, '#9fb3cc', 3);
            ctx.strokeStyle = COLOR.amber; ctx.setLineDash([8, 6]); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(0, BASE - Eh); ctx.lineTo(W, BASE - Eh); ctx.stroke(); ctx.setLineDash([]);
            text(ctx, 'total energy', W - 12, BASE - Eh - 8, COLOR.amber, 13, 'right');
            const by = BASE - f(b.x); dot(ctx, b.x, by - 11, '#ffffff', 11);
            const sl = -dU(b.x) / 1, mag = Math.min(70, Math.abs(sl) * 38);
            if (mag > 3) arrow(ctx, b.x, by - 30, b.x + Math.sign(sl) * mag, by - 30, COLOR.red, '', 3.5, 11);
            text(ctx, NAMES[kind] + '. The red arrow is the push: always downhill.', 22, 32, COLOR.text, 16);
            text(ctx, 'Click anywhere to place the ball there. The shaded region is everywhere the ball could possibly go.', 22, H - 14, COLOR.dim, 14);
          },
          pointer(k, fx) { if (k === 'down') { b.x = Math.max(12, Math.min(W - 12, fx * W)); b.v = 0; return true; } return false; },
          act(id) {
            if (id === 'next') { kind = (kind + 1) % 3; b = { x: 760, v: 0 }; return 'Next landscape: ' + NAMES[(kind + 1) % 3]; }
            if (id === 'kick') b.v += (Math.random() < .5 ? -1 : 1) * (350 + Math.random() * 250);
          }
        };
      }
    },

    // ---------------------------------------------------------------- MEC13
    lever: {
      controls: [
        { key: 'mR', label: 'Right weight', min: 10, max: 80, value: 20, step: 5, format: v => v + ' kg' },
        { key: 'dR', label: 'Distance from pivot', min: 5, max: 30, value: 30, step: 1, format: v => (v / 10).toFixed(1) + ' m' }
      ],
      animated: true,
      make(ctx, get) {
        const G = 9.81, ML = 40, DL = 2.0, PX = 80, CX = 450, CY = 300, LIM = .24;
        let th, om;
        return {
          debug() { return { th, om }; },
          reset() { th = 0; om = 0; },
          step() {
            const mR = get('mR'), dR = get('dR') / 10, tau = G * (ML * DL - mR * dR), I = 300 + ML * DL * DL + mR * dR * dR;
            om += (tau / I - 2.2 * om) / 60; th += om / 60;
            if (th > LIM) { th = LIM; om = 0; } else if (th < -LIM) { th = -LIM; om = 0; }
          },
          draw() {
            const mR = get('mR'), dR = get('dR') / 10, tl = G * ML * DL, tr = G * mR * dR; background(ctx, false);
            ctx.fillStyle = '#16314a'; ctx.fillRect(0, CY + 90, W, 110);
            ctx.fillStyle = '#51627a'; ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(CX - 30, CY + 90); ctx.lineTo(CX + 30, CY + 90); ctx.closePath(); ctx.fill();
            ctx.save(); ctx.translate(CX, CY); ctx.rotate(-th);
            ctx.fillStyle = '#8b6b3c'; ctx.fillRect(-4 * PX, -8, 8 * PX, 16);
            const wb = (d, m, col, name) => {
              const side = d < 0 ? -1 : 1, x = d * PX, r = 12 + 5 * Math.sqrt(m);
              ctx.fillStyle = col; ctx.fillRect(x - r, -8 - 2 * r, 2 * r, 2 * r); text(ctx, m + ' kg', x, -8 - r + 5, '#10192a', 14, 'center');
              ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x, 40); ctx.stroke(); ctx.setLineDash([]);
              text(ctx, Math.abs(d).toFixed(1) + ' m', x, 62, COLOR.dim, 13, 'center');
            };
            wb(-DL, ML, COLOR.teal, 'L'); wb(dR, mR, COLOR.amber, 'R');
            ctx.restore();
            dot(ctx, CX, CY, '#ffffff', 5);
            const balanced = Math.abs(tl - tr) < 8;
            text(ctx, 'Left twist: ' + ML + ' kg × 9.81 × ' + DL.toFixed(1) + ' m = ' + Math.round(tl) + ' N·m', 22, 34, COLOR.teal, 16);
            text(ctx, 'Right twist: ' + mR + ' kg × 9.81 × ' + dR.toFixed(1) + ' m = ' + Math.round(tr) + ' N·m', 22, 60, COLOR.amber, 16);
            text(ctx, balanced ? 'Balanced: the twists are equal.' : (tl > tr ? 'Left twist is bigger: left side goes down.' : 'Right twist is bigger: right side goes down.'), 22, 90, balanced ? '#fff' : COLOR.red, 17);
            text(ctx, 'Weights sit on the plank. Slide the right weight in or out, or change its mass.', 22, H - 16, COLOR.dim, 14);
          }
        };
      }
    },

    // ---------------------------------------------------------------- MEC14
    skater: {
      label: 'Arms', min: 0, max: 100, value: 100, step: 5, format: v => v <= 10 ? 'tucked in' : v >= 90 ? 'stretched out' : v + '%',
      animated: true,
      make(ctx, get) {
        const IB = 1.5, MA = 4, L = 59.7, SLOW = .25;
        let th, r;
        const rOf = v => 0.25 + 0.75 * v / 100;
        const I = rr => IB + 2 * MA * rr * rr;
        return {
          reset() { th = 0; r = rOf(get()); },
          step() { const tr = rOf(get()); r += Math.sign(tr - r) * Math.min(Math.abs(tr - r), .015); th += L / I(r) * SLOW / 60; },
          draw() {
            background(ctx, false); const cx = 300, cy = 250, PX = 150;
            ctx.strokeStyle = '#2a3a52'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 1.0 * PX, 0, 6.2832); ctx.stroke();
            ctx.fillStyle = '#16314a'; ctx.beginPath(); ctx.arc(cx, cy, 1.15 * PX, 0, 6.2832); ctx.fill();
            const ax = Math.cos(th), ay = Math.sin(th);
            ctx.strokeStyle = COLOR.amber; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - ax * r * PX, cy - ay * r * PX); ctx.lineTo(cx + ax * r * PX, cy + ay * r * PX); ctx.stroke(); ctx.lineCap = 'butt';
            dot(ctx, cx - ax * r * PX, cy - ay * r * PX, COLOR.teal, 11); dot(ctx, cx + ax * r * PX, cy + ay * r * PX, COLOR.teal, 11);
            dot(ctx, cx, cy, '#e8edf5', 24); text(ctx, 'body', cx, cy + 5, '#10192a', 12, 'center');
            const Ii = I(r), w = L / Ii, rev = w / (2 * Math.PI), ke = L * L / (2 * Ii);
            const rx = 540;
            text(ctx, 'Seen from above, shown at quarter speed', 22, 30, COLOR.dim, 14);
            text(ctx, 'Hands at ' + r.toFixed(2) + ' m from the axis', rx, 80, COLOR.text, 16);
            const bar = (y, lab, val, max, col, unit) => { text(ctx, lab + ':', rx, y, COLOR.dim, 14); text(ctx, unit, rx + 8 + ctx.measureText(lab + ':').width, y, '#fff', 14); ctx.fillStyle = col; ctx.fillRect(rx, y + 8, Math.max(2, val / max * 320), 18); };
            bar(130, 'Spread of mass (moment of inertia)', Ii, 9.5, COLOR.amber, Ii.toFixed(1) + ' kg·m²');
            bar(190, 'Spin rate', rev, 5, COLOR.teal, rev.toFixed(1) + ' turns/s');
            bar(250, 'Angular momentum (the product)', L, 60, '#ffffff', L.toFixed(0) + ' (never changes)');
            bar(310, 'Movement energy', ke, 900, COLOR.red, ke.toFixed(0) + ' J');
            text(ctx, 'Pulling in costs the skater work, so the energy rises too.', rx, 370, COLOR.dim, 13);
          }
        };
      }
    },

    // ---------------------------------------------------------------- MEC06
    circle: {
      controls: [
        { key: 'v', label: 'Speed', min: 1, max: 10, value: 5, step: .5, format: v => Number(v).toFixed(1) + ' m/s' },
        { key: 'r', label: 'String length', min: 5, max: 20, value: 10, step: 1, format: v => (v / 10).toFixed(1) + ' m' }
      ],
      animated: true, resetOnInput: true,
      buttons: [{ id: 'cut', label: 'Cut the string' }, { id: 'again', label: 'Restore string' }],
      make(ctx, get) {
        const M = .5, CX = 450, CY = 250, PXM = 110, SLOW = .6;
        let s;
        return {
          reset() { s = { th: 0, cut: false, x: 0, y: 0, vx: 0, vy: 0, trail: [] }; },
          step() {
            const v = get('v'), r = get('r') / 10;
            if (!s.cut) s.th += v / r * SLOW / 60;
            else { s.x += s.vx * SLOW / 60 * PXM; s.y += s.vy * SLOW / 60 * PXM; if (s.trail.length < 600) s.trail.push([s.x, s.y]); }
          },
          draw() {
            const v = get('v'), r = get('r') / 10, F = M * v * v / r; background(ctx, false);
            ctx.strokeStyle = '#2a3a52'; ctx.setLineDash([5, 6]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(CX, CY, r * PXM, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
            dot(ctx, CX, CY, '#e8edf5', 9);
            let bx, by;
            if (!s.cut) { bx = CX + r * PXM * Math.cos(s.th); by = CY + r * PXM * Math.sin(s.th); ctx.strokeStyle = '#cdb88a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(bx, by); ctx.stroke(); }
            else { bx = s.x; by = s.y; line(ctx, s.trail, 'rgba(103,212,208,.55)', 2); }
            dot(ctx, bx, by, COLOR.amber, 14);
            if (!s.cut) {
              const tx = -Math.sin(s.th), ty = Math.cos(s.th), ix = -Math.cos(s.th), iy = -Math.sin(s.th);
              arrow(ctx, bx, by, bx + tx * v * 16, by + ty * v * 16, COLOR.teal, '', 4, 11);
              arrow(ctx, bx, by, bx + ix * Math.min(110, F * 4), by + iy * Math.min(110, F * 4), COLOR.red, '', 4, 11);
              text(ctx, 'velocity: along the circle', 22, 34, COLOR.teal, 16); text(ctx, 'string pull: towards the centre, ' + F.toFixed(1) + ' N', 22, 60, COLOR.red, 16);
              text(ctx, 'F = m v² / r = 0.5 kg × ' + (v * v).toFixed(1) + ' ÷ ' + r.toFixed(1) + ' m', 22, 86, COLOR.dim, 15);
            } else text(ctx, 'Cut! It goes straight on, along the tangent. Not outward.', 22, 34, '#fff', 17);
            text(ctx, 'Shown at 60% of real speed.', 22, H - 14, COLOR.dim, 13);
          },
          act(id) {
            if (id === 'cut' && !s.cut) { const v = get('v'); s.cut = true; s.x = CX + get('r') / 10 * PXM * Math.cos(s.th); s.y = CY + get('r') / 10 * PXM * Math.sin(s.th); s.vx = -Math.sin(s.th) * v; s.vy = Math.cos(s.th) * v; s.trail = [[s.x, s.y]]; }
            else if (id === 'again') this.reset();
          }
        };
      }
    },

    // ---------------------------------------------------------------- GRV02
    invsq: {
      label: 'Distance from the lamp', min: 1, max: 5, value: 2, step: .5, format: v => v + ' units', animated: true, resetOnInput: true,
      make(ctx, get) {
        const U = 64, SRC = [70, 250], SX = 520, SY = 90;
        let s;
        return {
          reset() { s = { n: 0, ref: 0, dots: [] }; },
          step() {
            const d = get();
            for (let i = 0; i < 6 && s.n < 5000; i++) {
              const x = Math.random() * d, y = Math.random() * d, inRef = x < 1 && y < 1;
              s.n++; if (inRef) s.ref++; if (s.dots.length < 1500) s.dots.push([x, y, inRef]);
            }
          },
          draw() {
            const d = get(); background(ctx, false);
            // side view: lamp, cone, screen
            const sx = SRC[0] + d * 70, h = d * U;
            ctx.fillStyle = 'rgba(245,184,93,.10)'; ctx.beginPath(); ctx.moveTo(SRC[0], SRC[1]); ctx.lineTo(sx, SRC[1] - h / 2); ctx.lineTo(sx, SRC[1] + h / 2); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = 'rgba(245,184,93,.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(SRC[0], SRC[1]); ctx.lineTo(sx, SRC[1] - h / 2); ctx.moveTo(SRC[0], SRC[1]); ctx.lineTo(sx, SRC[1] + h / 2); ctx.stroke();
            ctx.strokeStyle = '#9fb3cc'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx, SRC[1] - h / 2); ctx.lineTo(sx, SRC[1] + h / 2); ctx.stroke();
            ctx.strokeStyle = COLOR.amber; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(sx, SRC[1] - h / 2); ctx.lineTo(sx, SRC[1] - h / 2 + U); ctx.stroke();
            dot(ctx, SRC[0], SRC[1], '#fff3d6', 9); text(ctx, 'lamp', SRC[0], SRC[1] + 28, COLOR.dim, 13, 'center');
            text(ctx, 'screen at distance ' + d, sx, SRC[1] + h / 2 + 22, COLOR.dim, 13, 'center');
            // front view of the screen
            ctx.fillStyle = '#16314a'; ctx.fillRect(SX, SY, d * U, d * U);
            ctx.strokeStyle = '#2e4766'; ctx.lineWidth = 1;
            for (let i = 0; i <= d; i++) { ctx.beginPath(); ctx.moveTo(SX + i * U, SY); ctx.lineTo(SX + i * U, SY + d * U); ctx.moveTo(SX, SY + i * U); ctx.lineTo(SX + d * U, SY + i * U); ctx.stroke(); }
            ctx.fillStyle = 'rgba(245,184,93,.18)'; ctx.fillRect(SX, SY, U, U);
            for (const [x, y, inRef] of s.dots) { ctx.fillStyle = inRef ? COLOR.amber : 'rgba(255,243,214,.7)'; ctx.fillRect(SX + x * U - 1, SY + y * U - 1, 2.4, 2.4); }
            ctx.strokeStyle = COLOR.amber; ctx.lineWidth = 3; ctx.strokeRect(SX, SY, U, U);
            text(ctx, 'The same light now covers ' + (d * d) + ' unit squares', SX, SY - 14, COLOR.text, 15);
            const exp = 100 / (d * d), meas = s.n ? s.ref / s.n * 100 : 0;
            text(ctx, 'Light in the amber square: ' + meas.toFixed(1) + '% (expected ' + exp.toFixed(1) + '%)', 40, 70, COLOR.amber, 16);
            text(ctx, 'Brightness compared with distance 1:  1 / ' + (d * d) + '  =  ' + (1 / (d * d)).toFixed(2), 40, 96, COLOR.text, 16);
            text(ctx, 'Each dot is one flash of light landing on the screen.', 40, H - 18, COLOR.dim, 14);
          }
        };
      }
    },

    // ---------------------------------------------------------------- GRV03
    orbit: {
      label: 'Speed change at the start', min: -20, max: 15, value: 10, step: 5, format: v => (v > 0 ? '+' : '') + v + '%', animated: true, resetOnInput: true,
      buttons: [{ id: 'again', label: 'Run again' }],
      make(ctx, get) {
        const CX = 450, CY = 262, RP = 58, R0 = 165, V0 = 135, GM = V0 * V0 * R0, DT = 1 / 240;
        let tgt, chs;
        const mk = v => ({ x: R0, y: 0, vx: 0, vy: -v, ph: 0, last: 0, trail: [] });
        const acc = b => { const r2 = b.x * b.x + b.y * b.y, a = -GM / (r2 * Math.sqrt(r2)); return [a * b.x, a * b.y]; };
        function adv(b) {
          let [ax, ay] = acc(b); b.vx += ax * DT / 2; b.vy += ay * DT / 2; b.x += b.vx * DT; b.y += b.vy * DT;
          [ax, ay] = acc(b); b.vx += ax * DT / 2; b.vy += ay * DT / 2;
          const a = Math.atan2(b.y, b.x); let da = a - b.last; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; b.ph -= da; b.last = a;
        }
        return {
          debug() { return { tgt, chs, V0, R0, GM }; },
          reset() { tgt = mk(V0); chs = mk(V0 * (1 + get() / 100)); tgt.t = chs.t = 0; },
          step() {
            for (let i = 0; i < 4; i++) { adv(tgt); adv(chs); }
            if (!(tgt.t++ % 2)) { tgt.trail.push([tgt.x, tgt.y]); chs.trail.push([chs.x, chs.y]); if (tgt.trail.length > 420) { tgt.trail.shift(); chs.trail.shift(); } }
          },
          draw() {
            background(ctx, false);
            const g = ctx.createRadialGradient(CX - 15, CY - 15, 6, CX, CY, RP); g.addColorStop(0, '#4f8fb8'); g.addColorStop(1, '#1d4467');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(CX, CY, RP, 0, 6.2832); ctx.fill();
            ctx.strokeStyle = '#2a3a52'; ctx.setLineDash([5, 6]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(CX, CY, R0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
            line(ctx, tgt.trail.map(p => [CX + p[0], CY + p[1]]), 'rgba(103,212,208,.5)', 2); line(ctx, chs.trail.map(p => [CX + p[0], CY + p[1]]), 'rgba(245,184,93,.65)', 2);
            dot(ctx, CX + tgt.x, CY + tgt.y, COLOR.teal, 8); dot(ctx, CX + chs.x, CY + chs.y, COLOR.amber, 8);
            const v1 = V0 * (1 + get() / 100), a = 1 / (2 / R0 - v1 * v1 / GM), T0 = 2 * Math.PI * R0 / V0, T = 2 * Math.PI * Math.sqrt(a * a * a / GM);
            const hi = Math.max(R0, 2 * a - R0) / RP, lo = Math.min(R0, 2 * a - R0) / RP;
            let gap = (tgt.ph - chs.ph) * 180 / Math.PI; gap = ((gap % 360) + 540) % 360 - 180;
            text(ctx, 'Teal: target on a circular orbit, one lap every ' + T0.toFixed(1) + ' s', 22, 30, COLOR.teal, 15);
            text(ctx, 'Amber: chaser after a ' + (get() > 0 ? '+' : '') + get() + '% speed change. One lap every ' + T.toFixed(1) + ' s', 22, 54, COLOR.amber, 15);
            text(ctx, 'Chaser: lowest ' + lo.toFixed(1) + ', highest ' + hi.toFixed(1) + ' planet-radii', 22, 78, COLOR.dim, 14);
            text(ctx, get() === 0 ? 'No burn: they stay together.' : Math.abs(gap) < 2 ? 'Side by side right now.' : 'Chaser is ' + Math.abs(gap).toFixed(0) + '° ' + (gap > 0 ? 'behind' : 'ahead of') + ' the target', 22, H - 20, '#fff', 17);
          },
          act(id) { if (id === 'again') this.reset(); }
        };
      }
    },

    // ---------------------------------------------------------------- GRV04
    weightless: {
      label: 'Lift falling at', min: 0, max: 100, value: 0, step: 10, format: v => v === 0 ? '0% (at rest)' : v === 100 ? '100% (free fall)' : v + '% of g', animated: true,
      buttons: [{ id: 'ball', label: 'Release the ball' }],
      make(ctx, get) {
        const G = 9.81, PXM = 130, FLOOR = 440, SLOW = .5;
        let s;
        return {
          reset() { s = { released: false, h: 1.2, v: 0, scroll: 0, vc: 0, tl: 0 }; },
          step() {
            const a = get() / 100, dt = SLOW / 60;
            s.vc = Math.min(40, s.vc + (a > 0 ? a * G * dt : -s.vc * .1)); s.scroll = (s.scroll + Math.min(500, s.vc * 25) / 60) % 80;
            if (s.released && s.h > 0) { s.v += (1 - a) * G * dt; s.h -= s.v * dt; s.tl += dt; if (s.h <= 0) { s.h = 0; s.v = 0; } }
          },
          draw() {
            const a = get() / 100, geff = (1 - a) * G; background(ctx, false);
            ctx.strokeStyle = 'rgba(160,215,240,.18)'; ctx.lineWidth = 2;
            for (let y = -80; y < H + 80; y += 80) { const yy = y + s.scroll; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(240, yy); ctx.moveTo(660, yy); ctx.lineTo(900, yy); ctx.stroke(); }
            ctx.fillStyle = '#16253a'; ctx.fillRect(280, 100, 340, 340); ctx.strokeStyle = '#9fb3cc'; ctx.lineWidth = 4; ctx.strokeRect(280, 100, 340, 340);
            ctx.fillStyle = '#51627a'; ctx.fillRect(330, FLOOR - 10, 120, 10);
            const lift = a >= .99 ? 14 : 0;
            ctx.strokeStyle = '#e8edf5'; ctx.lineWidth = 6; ctx.lineCap = 'round';
            const px = 390, fy = FLOOR - 10 - lift; ctx.beginPath(); ctx.moveTo(px, fy - 95); ctx.lineTo(px, fy - 175); ctx.moveTo(px, fy - 95); ctx.lineTo(px - 15, fy); ctx.moveTo(px, fy - 95); ctx.lineTo(px + 15, fy); ctx.moveTo(px, fy - 160); ctx.lineTo(px + 44, fy - 146); ctx.stroke(); ctx.lineCap = 'butt';
            dot(ctx, px, fy - 196, '#e8edf5', 17);
            // ball: hand height 1.2 m above the cab floor
            const bx = px + 44, by = FLOOR - s.h * PXM; dot(ctx, bx, by, COLOR.amber, 10);
            // scale
            const kg = 70 * (1 - a);
            ctx.fillStyle = '#0f1a2b'; ctx.fillRect(468, FLOOR - 70, 130, 56); ctx.strokeStyle = '#3a4b65'; ctx.lineWidth = 2; ctx.strokeRect(468, FLOOR - 70, 130, 56);
            text(ctx, 'scale', 533, FLOOR - 52, COLOR.dim, 12, 'center'); text(ctx, kg.toFixed(0) + ' kg', 533, FLOOR - 24, kg < 1 ? COLOR.teal : '#fff', 24, 'center');
            ctx.fillStyle = COLOR.bg; ctx.fillRect(0, 0, W, 94);
            text(ctx, 'Gravity in the lift is the same everywhere, but the lift falls at ' + Math.round(a * 100) + '% of g.', 22, 30, COLOR.text, 15);
            text(ctx, 'What the person feels: ' + geff.toFixed(1) + ' m/s²', 22, 54, a >= .99 ? COLOR.teal : COLOR.amber, 16);
            text(ctx, s.released ? (a >= .99 ? 'The ball stays exactly where you let go.' : s.h > 0 ? 'The ball is falling…' : 'The ball landed after ' + s.tl.toFixed(2) + ' s') : 'Press Release the ball.', 22, 80, COLOR.dim, 15);
            if (s.released && a >= .99) text(ctx, 'It hovers: the ball, the person and the lift all fall together.', 22, H - 20, COLOR.teal, 16);
          },
          act(id) { if (id === 'ball') { s.released = true; s.h = 1.2; s.v = 0; s.tl = 0; } }
        };
      }
    },

    // ---------------------------------------------------------------- GRV05
    kepler: {
      controls: [
        { key: 'e', label: 'Orbit stretch', min: 0, max: 90, value: 50, step: 5, format: v => 'e = ' + (v / 100).toFixed(2) },
        { key: 'p', label: 'Planet', min: 1, max: 6, value: 3, step: 1, format: v => ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn'][v - 1] }
      ],
      animated: true,
      make(ctx, get) {
        const PL = [['Mercury', .3871, .2408], ['Venus', .7233, .6152], ['Earth', 1, 1], ['Mars', 1.5237, 1.8808], ['Jupiter', 5.2026, 11.862], ['Saturn', 9.5549, 29.457]];
        const A = 230, CX0 = 400, CY = 250, VE = 29.78;
        let M;
        const solve = (m, e) => { let E = m; for (let i = 0; i < 12; i++) E -= (E - e * Math.sin(E) - m) / (1 - e * Math.cos(E)); return E; };
        return {
          debug() { return { solve, A, CX0, CY }; },
          reset() { M = 0; },
          step() { M += 2 * Math.PI / (12 * 60); },
          draw() {
            const e = get('e') / 100, pl = PL[get('p') - 1], b = A * Math.sqrt(1 - e * e), c = e * A, SXp = CX0 + c;
            background(ctx, false);
            const pos = E => [SXp + A * (Math.cos(E) - e), CY - b * Math.sin(E)];
            ctx.strokeStyle = '#3a4b65'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(CX0, CY, A, b, 0, 0, 6.2832); ctx.stroke();
            for (let k = 0; k < 12; k++) {
              ctx.beginPath(); ctx.moveTo(SXp, CY);
              for (let j = 0; j <= 10; j++) { const m = 2 * Math.PI * (k + j / 10) / 12, p = pos(solve(m, e)); ctx.lineTo(p[0], p[1]); }
              ctx.closePath(); ctx.fillStyle = k % 2 ? 'rgba(103,212,208,.22)' : 'rgba(245,184,93,.24)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; ctx.stroke();
            }
            dot(ctx, SXp, CY, '#ffd27a', 14);
            const E = solve(M % (2 * Math.PI), e), p = pos(E);
            dot(ctx, p[0], p[1], '#ffffff', 8);
            const rA = pl[1] * (1 - e * Math.cos(E)), v = VE * Math.sqrt(Math.max(0, 2 / rA - 1 / pl[1])), vp = VE * Math.sqrt((1 + e) / ((1 - e) * pl[1])), va = VE * Math.sqrt((1 - e) / ((1 + e) * pl[1]));
            text(ctx, pl[0] + ' on an orbit of stretch ' + e.toFixed(2) + ' (the Sun is at one focus)', 22, 30, COLOR.text, 16);
            text(ctx, 'Speed now: ' + v.toFixed(1) + ' km/s     nearest: ' + vp.toFixed(1) + '     farthest: ' + va.toFixed(1), 22, 56, '#fff', 15);
            text(ctx, 'Each coloured wedge is the same slice of the year, and has the same area.', 22, H - 18, COLOR.dim, 14);
            // table
            const tx = 650; text(ctx, 'planet', tx, 40, COLOR.dim, 12); text(ctx, 'a (AU)', tx + 100, 40, COLOR.dim, 12, 'right'); text(ctx, 'year (y)', tx + 160, 40, COLOR.dim, 12, 'right'); text(ctx, 'year² ÷ a³', tx + 215, 40, COLOR.dim, 12, 'right');
            PL.forEach((q, i) => { const y = 66 + i * 26, sel = q === pl; if (sel) { ctx.fillStyle = 'rgba(245,184,93,.2)'; ctx.fillRect(tx - 6, y - 17, 230, 24); }
              text(ctx, q[0], tx, y, sel ? COLOR.amber : COLOR.text, 14); text(ctx, q[1].toFixed(2), tx + 100, y, COLOR.text, 14, 'right'); text(ctx, q[2].toFixed(2), tx + 160, y, COLOR.text, 14, 'right'); text(ctx, (q[2] * q[2] / Math.pow(q[1], 3)).toFixed(2), tx + 215, y, COLOR.teal, 14, 'right'); });
            text(ctx, 'The last column is the same for every planet.', tx - 6, 66 + 6 * 26 + 8, COLOR.dim, 12);
          }
        };
      }
    },

    // ---------------------------------------------------------------- GRV06
    escape: {
      label: 'Launch speed straight up', min: 4, max: 13, value: 8, step: .5, format: v => Number(v).toFixed(1) + ' km/s', animated: true, resetOnInput: true,
      buttons: [{ id: 'again', label: 'Launch again' }],
      make(ctx, get) {
        const GM = 3.986e14, R = 6.371e6, U0 = GM / R;
        let s;
        const xr = r => 70 + (Math.min(r / R, 14) - 1) / 13 * 760, yU = u => 90 + (-u / U0) * 240;
        return {
          debug() { return { s, R, GM }; },
          reset() { s = { r: R, v: get() * 1000, t: 0, done: false, esc: false, max: R }; },
          step() {
            if (s.done) return;
            for (let i = 0; i < 10; i++) {
              const dt = 6, a = -GM / (s.r * s.r); s.v += a * dt / 2; s.r += s.v * dt; const a2 = -GM / (s.r * s.r); s.v += a2 * dt / 2; s.t += dt;
              if (s.r > s.max) s.max = s.r;
              if (s.r <= R) { s.r = R; s.done = true; break; }
              if (s.r > 14 * R) { s.done = true; s.esc = .5 * s.v * s.v - GM / s.r >= 0; break; }
            }
          },
          draw() {
            background(ctx, false);
            const v0 = get() * 1000, E = .5 * v0 * v0 - U0, pts = [];
            for (let r = R; r <= 14 * R; r += R / 12) pts.push([xr(r), yU(-GM / r)]);
            ctx.fillStyle = '#16314a'; ctx.beginPath(); ctx.moveTo(70, 340); for (const q of pts) ctx.lineTo(q[0], q[1]); ctx.lineTo(830, 340); ctx.closePath(); ctx.fill();
            // allowed region
            ctx.fillStyle = 'rgba(103,212,208,.16)'; for (let r = R; r < 14 * R; r += R / 40) { const u = -GM / r; if (u < E) ctx.fillRect(xr(r), yU(E), 760 / 13 / 40 * 1.05, yU(u) - yU(E)); }
            line(ctx, pts, '#9fb3cc', 3);
            ctx.strokeStyle = '#51627a'; ctx.setLineDash([4, 5]); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(60, 90); ctx.lineTo(840, 90); ctx.stroke(); ctx.setLineDash([]);
            text(ctx, 'zero: completely free of the Earth', 836, 80, COLOR.dim, 12, 'right');
            ctx.strokeStyle = COLOR.amber; ctx.setLineDash([8, 6]); ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(60, Math.max(70, yU(E))); ctx.lineTo(840, Math.max(70, yU(E))); ctx.stroke(); ctx.setLineDash([]);
            text(ctx, 'your total energy', 836, Math.max(70, yU(E)) + (E >= 0 ? 20 : -8), COLOR.amber, 13, 'right');
            const by = yU(-GM / s.r); dot(ctx, xr(s.r), by - 9, '#ffffff', 9);
            text(ctx, 'Distance from the centre of the Earth (Earth radii)', 450, 366, COLOR.dim, 13, 'center');
            for (const k of [1, 2, 4, 6, 8, 10, 12, 14]) { text(ctx, String(k), xr(k * R), 352, COLOR.dim, 12, 'center'); }
            text(ctx, 'deeper = harder to climb out of', 78, 324, COLOR.dim, 12);
            const alt = (s.r - R) / 1000, rmax = E < 0 ? 1 / (1 / R - v0 * v0 / (2 * GM)) : Infinity;
            text(ctx, 'Launch speed ' + (v0 / 1000).toFixed(1) + ' km/s.   Escape speed from the ground: 11.2 km/s.', 22, 30, COLOR.text, 16);
            text(ctx, s.esc ? 'It escapes: it never comes back.' : E >= 0 ? 'Past the edge of the well: it escapes.' : 'It climbs to ' + ((rmax - R) / 1000).toFixed(0) + ' km above the ground, then falls back.', 22, 56, E >= 0 ? COLOR.amber : COLOR.teal, 17);
            text(ctx, 'Elapsed: ' + (s.t / 3600).toFixed(1) + ' hours   Height: ' + Math.round(alt).toLocaleString('en') + ' km   Speed: ' + (s.v / 1000).toFixed(1) + ' km/s   (time runs 3600× faster)', 22, 410, '#fff', 15);
            text(ctx, 'No air, no rocket thrust: just a single launch.', 22, 436, COLOR.dim, 14);
          },
          act(id) { if (id === 'again') this.reset(); }
        };
      }
    },

    // ---------------------------------------------------------------- GRV09
    tides: {
      label: 'Time speed', min: 1, max: 5, value: 3, step: 1, format: v => v + '×', animated: true,
      buttons: [{ id: 'sun', label: 'Add the Sun' }],
      make(ctx, get) {
        const EX = 250, EY = 250, ER = 72, AM = 1, AS = .46, SYNODIC = 29.53;
        let day, hist, sun;
        const heights = d => { const loc = 2 * Math.PI * d, tm = Math.PI + 2 * Math.PI * d / SYNODIC; return AM * Math.cos(2 * (loc - tm)) + (sun ? AS * Math.cos(2 * (loc - Math.PI)) : 0); };
        return {
          debug() { return { heights, get day() { return day; }, setSun(v) { sun = v; } }; },
          reset() { day = 0; hist = []; sun = false; },
          step() { day += get() * 0.2 / 60; hist.push([day, heights(day)]); while (hist.length && day - hist[0][0] > 15) hist.shift(); },
          draw() {
            background(ctx, false);
            const tm = Math.PI + 2 * Math.PI * day / SYNODIC, loc = 2 * Math.PI * day;
            // ocean shell
            ctx.beginPath();
            for (let i = 0; i <= 120; i++) { const th = i / 120 * 2 * Math.PI, r = ER + 14 + 11 * (AM * Math.cos(2 * (th - tm)) + (sun ? AS * Math.cos(2 * (th - Math.PI)) : 0)); const x = EX + r * Math.cos(th), y = EY + r * Math.sin(th); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
            ctx.closePath(); ctx.fillStyle = '#1f6fa0'; ctx.fill();
            ctx.fillStyle = '#7a8a5a'; ctx.beginPath(); ctx.arc(EX, EY, ER, 0, 6.2832); ctx.fill();
            // tidal arrows (Moon): 3(r·m)m − r
            const mx = Math.cos(tm), my = Math.sin(tm);
            for (let i = 0; i < 12; i++) { const th = i / 12 * 2 * Math.PI, rx = Math.cos(th), ry = Math.sin(th), d = rx * mx + ry * my, ax = 3 * d * mx - rx, ay = 3 * d * my - ry;
              arrow(ctx, EX + (ER + 40) * rx - ax * 12, EY + (ER + 40) * ry - ay * 12, EX + (ER + 40) * rx + ax * 12, EY + (ER + 40) * ry + ay * 12, 'rgba(241,138,118,.85)', '', 2, 7); }
            // moon and sun
            dot(ctx, EX + 205 * mx, EY + 205 * my, '#cfd9e6', 13); text(ctx, 'Moon', EX + 205 * mx, EY + 205 * my + 30, COLOR.dim, 12, 'center');
            if (sun) { dot(ctx, 40, EY, '#ffd27a', 18); text(ctx, 'Sun (far away)', 40, EY + 34, COLOR.amber, 12, 'center'); }
            // you
            const ux = EX + ER * Math.cos(loc), uy = EY + ER * Math.sin(loc); dot(ctx, ux, uy, '#ffffff', 7); ctx.strokeStyle = '#10192a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ux, uy, 7, 0, 6.2832); ctx.stroke();
            text(ctx, 'you', ux + 12, uy - 8, '#fff', 13);
            // graph
            const gx = 560, gy = 90, gw = 320, gh = 220, hmax = sun ? 1.6 : 1.15;
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh); ctx.beginPath(); ctx.moveTo(gx, gy + gh / 2); ctx.lineTo(gx + gw, gy + gh / 2); ctx.stroke();
            text(ctx, 'Sea level where you stand (last 15 days)', gx, gy - 12, COLOR.text, 14);
            line(ctx, hist.map(([d, h]) => [gx + (d - (day - 15)) / 15 * gw, gy + gh / 2 - h / hmax * gh / 2]), COLOR.teal, 2.5);
            text(ctx, 'high', gx - 6, gy + 12, COLOR.dim, 12, 'right'); text(ctx, 'low', gx - 6, gy + gh, COLOR.dim, 12, 'right');
            text(ctx, 'Day ' + day.toFixed(1) + '. Moon phase: ' + (((day % SYNODIC) / SYNODIC) < .06 || ((day % SYNODIC) / SYNODIC) > .94 ? 'new' : Math.abs(((day % SYNODIC) / SYNODIC) - .5) < .06 ? 'full' : 'in between'), 22, 30, COLOR.text, 15);
            text(ctx, 'Two high tides a day: the water is stretched on both sides of the Earth.', 22, H - 40, COLOR.dim, 14);
            text(ctx, sun ? 'With the Sun added, high tides swell at new and full Moon (spring tides).' : 'Red arrows: the stretching pull of the Moon. Press Add the Sun.', 22, H - 18, sun ? COLOR.amber : COLOR.dim, 14);
          },
          act(id) { if (id === 'sun') { sun = !sun; return sun ? 'Remove the Sun' : 'Add the Sun'; } }
        };
      }
    },

    // ---------------------------------------------------------------- GRV10
    seasons: {
      controls: [
        { key: 'tilt', label: 'Axial tilt', min: 0, max: 45, value: 23, step: 1, format: v => v + '°' },
        { key: 'lat', label: 'Your latitude (north)', min: 0, max: 80, value: 45, step: 5, format: v => v + '°' }
      ],
      animated: true,
      make(ctx, get) {
        const CX = 240, CY = 262, ROR = 150, FL = .46;
        let day;
        const dec = (d, tilt) => tilt * Math.sin(2 * Math.PI * (d - 80) / 365);
        const noon = (d, tilt, lat) => 90 - Math.abs(lat - dec(d, tilt));
        const dayLen = (d, tilt, lat) => { const x = -Math.tan(lat * Math.PI / 180) * Math.tan(dec(d, tilt) * Math.PI / 180); if (x >= 1) return 0; if (x <= -1) return 24; return 2 * Math.acos(x) * 180 / Math.PI / 15; };
        const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ML = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const dateOf = d => { let m = 0, r = Math.floor(d); while (m < 11 && r >= ML[m]) { r -= ML[m]; m++; } return MON[m] + ' ' + (r + 1); };
        return {
          debug() { return { dec, noon, dayLen, dateOf }; },
          reset() { day = 172; },
          step() { day = (day + 365 / 14 / 60) % 365; },
          draw() {
            const tilt = get('tilt'), lat = get('lat'); background(ctx, false);
            ctx.strokeStyle = '#3a4b65'; ctx.setLineDash([5, 6]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(CX, CY, ROR, ROR * FL, 0, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
            dot(ctx, CX, CY, '#ffd27a', 17); text(ctx, 'Sun', CX, CY + 34, COLOR.amber, 12, 'center');
            const psi = Math.PI + 2 * Math.PI * (day - 172) / 365, ex = CX + ROR * Math.cos(psi), ey = CY + ROR * FL * Math.sin(psi);
            const draw = (back) => { const sunAng = Math.atan2(CY - ey, CX - ex);
              ctx.fillStyle = '#16314a'; ctx.beginPath(); ctx.arc(ex, ey, 22, 0, 6.2832); ctx.fill();
              ctx.fillStyle = '#3f86b8'; ctx.beginPath(); ctx.arc(ex, ey, 22, sunAng - Math.PI / 2, sunAng + Math.PI / 2); ctx.closePath(); ctx.fill();
              const t = tilt * Math.PI / 180, nx = ex + 38 * Math.sin(t), ny = ey - 38 * Math.cos(t), sx = ex - 38 * Math.sin(t), sy = ey + 38 * Math.cos(t);
              ctx.strokeStyle = '#e8edf5'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(nx, ny); ctx.stroke(); text(ctx, 'N', nx + 6, ny - 4, '#fff', 13); };
            draw();
            text(ctx, 'Northern summer', 30, CY + 6, COLOR.amber, 12); text(ctx, 'Northern winter', CX + ROR + 8, CY + 6, COLOR.teal, 12, 'left');
            const d2 = dec(day, tilt), r = 149.6 * (1 - 0.0167 * Math.cos(2 * Math.PI * (day - 3) / 365));
            text(ctx, dateOf(day), 22, 34, '#fff', 20);
            text(ctx, 'Distance from the Sun: ' + r.toFixed(1) + ' million km', 22, 58, COLOR.dim, 14);
            text(ctx, 'Noon sun height at ' + lat + '°N: ' + noon(day, tilt, lat).toFixed(0) + '°', 22, 82, COLOR.amber, 15);
            text(ctx, 'Length of day: ' + dayLen(day, tilt, lat).toFixed(1) + ' hours', 22, 104, COLOR.teal, 15);
            // graphs
            const gx = 540, gw = 340, mk = (gy, gh, title, ymax, fn, col, ref) => {
              ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh); text(ctx, title, gx, gy - 10, COLOR.text, 14);
              if (ref !== undefined) { ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(gx, gy + gh - ref / ymax * gh); ctx.lineTo(gx + gw, gy + gh - ref / ymax * gh); ctx.stroke(); ctx.setLineDash([]); }
              const pts = []; for (let d = 0; d <= 365; d += 5) pts.push([gx + d / 365 * gw, gy + gh - Math.max(0, Math.min(1, fn(d) / ymax)) * gh]); line(ctx, pts, col, 2.5);
              const cx2 = gx + day / 365 * gw; ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(cx2, gy); ctx.lineTo(cx2, gy + gh); ctx.stroke(); ctx.setLineDash([]);
              dot(ctx, cx2, gy + gh - Math.max(0, Math.min(1, fn(day) / ymax)) * gh, '#fff', 5);
              text(ctx, 'Jan', gx, gy + gh + 15, COLOR.dim, 11); text(ctx, 'Jul', gx + gw / 2, gy + gh + 15, COLOR.dim, 11, 'center'); text(ctx, 'Dec', gx + gw, gy + gh + 15, COLOR.dim, 11, 'right'); };
            mk(150, 130, 'Height of the noon sun (degrees)', 90, d => noon(d, tilt, lat), COLOR.amber);
            mk(330, 120, 'Length of day (hours)', 24, d => dayLen(d, tilt, lat), COLOR.teal, 12);
            if (tilt === 0) text(ctx, 'No tilt: the lines are flat. No seasons.', 22, H - 18, '#fff', 15);
            else text(ctx, 'Earth is nearest the Sun in early January: distance is not the cause.', 22, H - 18, COLOR.dim, 14);
          }
        };
      }
    },

    // ---------------------------------------------------------------- FND03
    orders: {
      label: 'Width of the view', min: -16, max: 27, value: 0, step: .25, animated: true,
      format: v => { const m = Math.pow(10, v), UN = [[1e-15, 'fm'], [1e-12, 'pm'], [1e-9, 'nm'], [1e-6, 'µm'], [1e-3, 'mm'], [1, 'm'], [1e3, 'km'], [9.4607e15, 'light-years']]; let u = UN[0]; for (const x of UN) if (m >= x[0] * .999) u = x; const n = m / u[0];
        const w = n >= 1e9 ? (n / 1e9).toPrecision(2).replace(/\.0+$/, '') + ' billion' : n >= 1e6 ? (n / 1e6).toPrecision(2).replace(/\.0+$/, '') + ' million' : n >= 100 ? Math.round(n).toLocaleString('en') : n >= 10 ? n.toPrecision(2) : n.toPrecision(2).replace(/\.0$/, ''); return w + ' ' + u[1]; },
      buttons: [{ id: 'auto', label: 'Zoom out automatically' }],
      make(ctx, get) {
        const OBJ = [['a proton', 1.7e-15, '1.7 fm'], ['a hydrogen atom', 1.1e-10, '0.1 nm'], ['DNA double helix (width)', 2e-9, '2 nm'], ['a virus', 1e-7, '100 nm'], ['a red blood cell', 7e-6, '7 µm'], ['a human hair (width)', 7e-5, '70 µm'], ['an ant', 3e-3, '3 mm'], ['you', 1.7, '1.7 m'], ['a blue whale', 25, '25 m'], ['Mount Everest (height)', 8.8e3, '8.8 km'], ['the Earth', 1.27e7, '12,700 km'], ['the Sun', 1.39e9, '1.4 million km'], ['Earth to Sun', 1.5e11, '150 million km'], ['the Solar System', 9e12, '9 billion km'], ['one light-year', 9.46e15, '9.5 trillion km'], ['the Milky Way', 9.5e20, '100,000 light-years'], ['the observable universe', 8.8e26, '93 billion light-years']];
        let st;
        return {
          reset() { st = { exp: get(), auto: false, dir: 1 }; },
          step() { if (st.auto) { st.exp += st.dir * .04; if (st.exp >= 27) st.dir = -1; if (st.exp <= -16) st.dir = 1; } },
          sync() { return st.auto ? { main: st.exp } : {}; },
          onInput() { st.auto = false; st.exp = get(); },
          draw() {
            const e = st.auto ? st.exp : get(), view = Math.pow(10, e); background(ctx, false);
            const x0 = 330, maxW = 540; let n10 = 0;
            text(ctx, 'The bars show each thing as a fraction of the width of the view.', 22, 30, COLOR.text, 15);
            text(ctx, 'Width of the view: 10^' + (Math.round(e * 100) / 100) + ' m', 22, 54, COLOR.amber, 16);
            ctx.fillStyle = '#16253a'; ctx.fillRect(x0, 62, maxW, 17 * 24 + 6);
            OBJ.forEach(([name, size, lab], i) => {
              const y = 72 + i * 24, f = size / view, w = f * maxW;
              let col = COLOR.teal, note = '';
              if (f > 1) { col = COLOR.amber; note = '▶ bigger than the view'; } else if (w < 2) { col = '#51627a'; note = 'too small to see'; }
              ctx.fillStyle = col; ctx.fillRect(x0, y - 8, f > 1 ? maxW : Math.max(2, w), 14);
              text(ctx, name, x0 - 10, y + 4, f > 1 || w < 2 ? COLOR.dim : '#fff', 13, 'right');
              const inside = f > 1 || w > 300; text(ctx, lab + (note ? '   ' + note : ''), inside ? x0 + 8 : x0 + Math.max(2, w) + 8, y + 4, inside ? '#10192a' : COLOR.dim, 12);
            });
            text(ctx, 'Slide the width up or down a power of ten at a time, or press Zoom out automatically.', 22, H - 14, COLOR.dim, 13);
          },
          act(id) { if (id === 'auto') { st.auto = !st.auto; st.exp = get(); return st.auto ? 'Stop zooming' : 'Zoom out automatically'; } }
        };
      }
    },

    // ---------------------------------------------------------------- OSC01
    spring: {
      controls: [
        { key: 'm', label: 'Hanging mass', min: .5, max: 4, value: 2, step: .5, format: v => Number(v).toFixed(1) + ' kg' },
        { key: 'k', label: 'Spring stiffness', min: 30, max: 100, value: 50, step: 10, format: v => v + ' N/m' }
      ],
      animated: true,
      buttons: [{ id: 'pull', label: 'Pull down and let go' }],
      make(ctx, get) {
        const G = 9.81, ZETA = .06, TOP = 40, L0 = 120, PXM = 170, CX = 230;
        let y, v;
        const mass = () => get('m'), stiff = () => get('k');
        return {
          debug() { return { get y() { return y; }, get v() { return v; } }; },
          reset() { y = mass() * G / stiff(); v = 0; },
          step() {
            const m = mass(), k = stiff(), c = 2 * ZETA * Math.sqrt(k * m), dt = 1 / 240;
            for (let i = 0; i < 4; i++) {
              let a = G - k / m * y - c / m * v; v += a * dt / 2; y += v * dt; a = G - k / m * y - c / m * v; v += a * dt / 2;
            }
          },
          draw() {
            const m = mass(), k = stiff(); background(ctx, false);
            const ym = TOP + L0 + y * PXM, side = 26 + 10 * Math.sqrt(m), eq = m * G / k;
            ctx.fillStyle = '#51627a'; ctx.fillRect(CX - 60, TOP - 12, 120, 12);
            // coil
            const coils = 14; ctx.strokeStyle = '#cdb88a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(CX, TOP);
            for (let i = 1; i <= coils; i++) { const yy = TOP + (ym - TOP) * i / (coils + 1); ctx.lineTo(CX + (i % 2 ? 16 : -16), yy); }
            ctx.lineTo(CX, ym); ctx.stroke();
            ctx.fillStyle = COLOR.amber; ctx.fillRect(CX - side / 2, ym, side, side); text(ctx, m.toFixed(1) + ' kg', CX, ym + side / 2 + 5, '#10192a', 14, 'center');
            // ruler
            const rx = CX + 120; ctx.strokeStyle = '#8ea2ba'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(rx, TOP + L0); ctx.lineTo(rx, TOP + L0 + 1.4 * PXM); ctx.stroke();
            for (let s = 0; s <= 1.25; s += .25) { const yy = TOP + L0 + s * PXM; ctx.beginPath(); ctx.moveTo(rx - 7, yy); ctx.lineTo(rx + 7, yy); ctx.stroke(); text(ctx, s.toFixed(2) + ' m', rx + 12, yy + 4, COLOR.dim, 12); }
            ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(CX - 90, TOP + L0 + eq * PXM); ctx.lineTo(rx, TOP + L0 + eq * PXM); ctx.stroke(); ctx.setLineDash([]);
            text(ctx, 'rest position', CX - 96, TOP + L0 + eq * PXM - 6, COLOR.dim, 12, 'right');
            // force-stretch graph
            const gx = 560, gy = 110, gw = 310, gh = 250, xmax = 1.4, fmax = 45;
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh); text(ctx, 'Pull of the spring against its stretch', gx, gy - 12, COLOR.text, 14);
            text(ctx, 'force (N)', gx - 6, gy + 8, COLOR.dim, 11, 'right'); text(ctx, 'stretch (m) →', gx + gw, gy + gh + 16, COLOR.dim, 11, 'right');
            const xe = Math.min(xmax, fmax / k); line(ctx, [[gx, gy + gh], [gx + xe / xmax * gw, gy + gh - k * xe / fmax * gh]], COLOR.teal, 3);
            dot(ctx, gx + eq / xmax * gw, gy + gh - m * G / fmax * gh, COLOR.amber, 7);
            const xs = Math.max(0, Math.min(xmax, y)); dot(ctx, gx + xs / xmax * gw, gy + gh - Math.min(1, k * xs / fmax) * gh, '#fff', 5);
            text(ctx, 'A straight line: twice the stretch,', gx + 10, gy + 24, COLOR.dim, 12); text(ctx, 'twice the pull.', gx + 10, gy + 40, COLOR.dim, 12);
            text(ctx, 'Weight  m g = ' + (m * G).toFixed(1) + ' N      Stretch at rest  = ' + eq.toFixed(2) + ' m', 22, H - 56, '#fff', 15);
            text(ctx, 'Bounce time  T = 2π √(m / k) = ' + (2 * Math.PI * Math.sqrt(m / k)).toFixed(2) + ' s', 22, H - 30, COLOR.amber, 16);
          },
          act(id) { if (id === 'pull') { y += 0.25; v = 0; } }
        };
      }
    },

    // ---------------------------------------------------------------- OSC02
    pendulum: {
      controls: [
        { key: 'ang', label: 'Big swing size', min: 5, max: 80, value: 40, step: 5, format: v => v + '°' },
        { key: 'len', label: 'String length', min: .25, max: 2, value: 1, step: .05, format: v => Number(v).toFixed(2) + ' m' }
      ],
      animated: true, resetOnInput: true,
      make(ctx, get) {
        const G = 9.81, SMALL = 5 * Math.PI / 180, PXM = 190, PY = 70;
        let p;
        const mkP = a => ({ th: a, w: 0, lastCross: null, T: null, prevSign: 1 });
        return {
          debug() { return { p, get G() { return G; } }; },
          reset() { p = { big: mkP(get('ang') * Math.PI / 180), small: mkP(SMALL), t: 0 }; },
          step() {
            const L = get('len'), dt = 1 / 480;
            for (let i = 0; i < 8; i++) {
              p.t += dt;
              for (const b of [p.big, p.small]) {
                const prev = b.th;
                let a = -G / L * Math.sin(b.th); b.w += a * dt / 2; b.th += b.w * dt; a = -G / L * Math.sin(b.th); b.w += a * dt / 2;
                if (prev < 0 && b.th >= 0 && b.w > 0) { const tc = p.t - dt * b.th / (b.th - prev); if (b.lastCross !== null) b.T = tc - b.lastCross; b.lastCross = tc; }
              }
            }
          },
          draw() {
            const L = get('len'), A = get('ang'); background(ctx, false);
            const T0 = 2 * Math.PI * Math.sqrt(L / G);
            [[p.small, 560, COLOR.teal, 'Small swing (5°)'], [p.big, 250, COLOR.amber, 'Big swing (' + A + '°)']].forEach(([b, px, col, nm]) => {
              const x = px + L * PXM * Math.sin(b.th), y = PY + L * PXM * Math.cos(b.th);
              ctx.strokeStyle = '#51627a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(px - 40, PY - 4); ctx.lineTo(px + 40, PY - 4); ctx.stroke();
              ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(px, PY); ctx.lineTo(px, PY + L * PXM + 30); ctx.stroke(); ctx.setLineDash([]);
              ctx.strokeStyle = '#cfd9e6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, PY); ctx.lineTo(x, y); ctx.stroke(); dot(ctx, x, y, col, 17);
              text(ctx, nm, px, H - 70, col, 15, 'center');
              text(ctx, b.T ? 'swing time ' + b.T.toFixed(3) + ' s' : 'measuring…', px, H - 46, '#fff', 15, 'center');
            });
            text(ctx, 'Formula for small swings:  T = 2π √(L / g) = ' + T0.toFixed(3) + ' s', 22, 28, COLOR.dim, 15);
            if (p.big.T && p.small.T) text(ctx, 'The big swing takes ' + ((p.big.T / p.small.T - 1) * 100).toFixed(1) + '% longer than the small one.', 22, 52, '#fff', 16);
            text(ctx, 'The weight of the bob is not an input.', 22, H - 14, COLOR.dim, 13);
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC03
    damping: {
      label: 'Shock absorber strength', min: 5, max: 200, value: 30, step: 5, format: v => v + '% of critical', animated: true,
      buttons: [{ id: 'bump', label: 'Hit a bump' }, { id: 'wash', label: 'Washboard road' }],
      make(ctx, get) {
        const M = 300, K = 20000, W0 = Math.sqrt(K / M), CCRIT = 2 * Math.sqrt(K * M), BH = .08, TB = .25, V = 800, SC = 600, WF = 1.3;
        let x, v, tb, wash, t, hist, maxA, aNow;
        const road = tt => { let r = 0, rd = 0; if (tb >= 0 && tb <= TB) { const u = Math.PI * tb / TB; r += BH * Math.sin(u) ** 2; rd += BH * Math.sin(2 * u) * Math.PI / TB; } if (wash) { r += .02 * Math.sin(2 * Math.PI * WF * tt); rd += .02 * 2 * Math.PI * WF * Math.cos(2 * Math.PI * WF * tt); } return [r, rd]; };
        return {
          debug() { return { hist, get maxA() { return maxA; }, W0 }; },
          reset() { x = 0; v = 0; tb = -1; wash = false; t = 0; hist = []; maxA = 0; aNow = 0; },
          step() {
            const zeta = get() / 100, c = zeta * CCRIT, dt = 1 / 240;
            for (let i = 0; i < 4; i++) {
              if (tb >= 0) { tb += dt; if (tb > TB + 0.02) tb = -1; }
              t += dt; const [r, rd] = road(t);
              const a = (-K * (x - r) - c * (v - rd)) / M; aNow = a; if (tb >= 0 || (wash && 0)) maxA = Math.max(maxA, Math.abs(a));
              v += a * dt; x += v * dt;
            }
            hist.push([t, x]); if (hist.length > 240) hist.shift();
          },
          draw() {
            const zeta = get() / 100; background(ctx, false);
            const [r] = road(t), roadY = 250, wx = 300;
            // road with a moving bump
            ctx.fillStyle = '#18253a'; ctx.beginPath(); ctx.moveTo(0, 340);
            const bc = tb >= 0 ? wx + (TB / 2 - tb) * V : -1000;
            for (let px = 0; px <= W; px += 4) { let h = 0; const u = (px - (bc - TB / 2 * V)) / (TB * V); if (u > 0 && u < 1) h = BH * Math.sin(Math.PI * u) ** 2; ctx.lineTo(px, roadY + 22 - h * SC); }
            ctx.lineTo(W, 340); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#51627a'; ctx.lineWidth = 2; ctx.beginPath(); for (let px = 0; px <= W; px += 4) { let h = 0; const u = (px - (bc - TB / 2 * V)) / (TB * V); if (u > 0 && u < 1) h = BH * Math.sin(Math.PI * u) ** 2; px ? ctx.lineTo(px, roadY + 22 - h * SC) : ctx.moveTo(px, roadY + 22 - h * SC); } ctx.stroke();
            const wy = roadY - r * SC, by = 130 - x * SC;
            ctx.fillStyle = '#10192a'; ctx.strokeStyle = '#cfd9e6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(wx, wy, 22, 0, 6.2832); ctx.fill(); ctx.stroke();
            // spring and damper
            ctx.strokeStyle = '#cdb88a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx - 14, wy - 22); for (let i = 1; i <= 8; i++) ctx.lineTo(wx - 14 + (i % 2 ? 10 : -10), wy - 22 + (by + 40 - (wy - 22)) * i / 9); ctx.lineTo(wx - 14, by + 40); ctx.stroke();
            ctx.strokeStyle = COLOR.teal; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(wx + 16, wy - 22); ctx.lineTo(wx + 16, (wy - 22 + by + 40) / 2); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx + 16, (wy - 22 + by + 40) / 2); ctx.lineTo(wx + 16, by + 40); ctx.stroke();
            ctx.fillStyle = COLOR.amber; ctx.fillRect(wx - 90, by, 180, 40); ctx.fillStyle = '#10192a'; text(ctx, 'car body', wx, by + 26, '#10192a', 14, 'center');
            // graph
            const gx = 60, gy = 372, gw = 780, gh = 100;
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh); ctx.beginPath(); ctx.moveTo(gx, gy + gh / 2); ctx.lineTo(gx + gw, gy + gh / 2); ctx.stroke();
            text(ctx, 'How the car body moves (last 4 seconds)', gx, gy - 8, COLOR.text, 13);
            line(ctx, hist.map(([tt, xx], i) => [gx + i / 239 * gw, gy + gh / 2 - Math.max(-1, Math.min(1, xx / .1)) * gh / 2]), COLOR.amber, 2.5);
            const regime = zeta < .7 ? 'Under-damped: it keeps bouncing' : zeta <= 1.3 ? 'About critical: settles fastest, no bounce' : 'Over-damped: slow to recover, harsh';
            text(ctx, regime, 22, 30, zeta < .7 ? COLOR.red : zeta <= 1.3 ? COLOR.teal : COLOR.amber, 18);
            const ts = zeta < 1 ? 4 / (zeta * W0) : 4 / (W0 * (zeta - Math.sqrt(Math.max(0, zeta * zeta - 1))));
            text(ctx, 'Damping ratio ' + zeta.toFixed(2) + '.   Settles to within 2% in about ' + ts.toFixed(1) + ' s.', 22, 54, COLOR.dim, 14);
            text(ctx, maxA > 0 ? 'Biggest jolt felt in the last bump: ' + maxA.toFixed(1) + ' m/s²' : 'Press Hit a bump.', 22, 78, '#fff', 14);
          },
          act(id) { if (id === 'bump') { tb = 0; maxA = 0; } else if (id === 'wash') { wash = !wash; return wash ? 'Smooth road' : 'Washboard road'; } }
        };
      }
    },

    // ---------------------------------------------------------------- OSC04
    resonance: {
      controls: [
        { key: 'f', label: 'Pushing frequency', min: .3, max: 2, value: .6, step: .05, format: v => Number(v).toFixed(2) + ' Hz' },
        { key: 'z', label: 'Friction', min: 1, max: 10, value: 3, step: 1, format: v => v + ' / 10' }
      ],
      animated: true, stepsPerFrame: 2,
      buttons: [],
      make(ctx, get) {
        const F0 = 1, W0 = 2 * Math.PI * F0, STATIC = .1, DT = 1 / 240;
        let x, v, t, hist, ring;
        const zeta = () => get('z') * .02;
        const amp = (f, z) => { const r = f / F0; return STATIC / Math.sqrt((1 - r * r) ** 2 + (2 * z * r) ** 2); };
        return {
          debug() { return { amp, get ring() { return ring; }, W0 }; },
          reset() { x = 0; v = 0; t = 0; hist = []; ring = []; },
          step() {
            const f = get('f'), z = zeta(), w = 2 * Math.PI * f;
            for (let i = 0; i < 4; i++) {
              const acc = (xx, vv, tt) => -W0 * W0 * xx - 2 * z * W0 * vv + STATIC * W0 * W0 * Math.cos(w * tt);
              let a = acc(x, v, t); v += a * DT / 2; x += v * DT; t += DT; a = acc(x, v, t); v += a * DT / 2;
            }
            hist.push([t, x, STATIC * Math.cos(w * t)]); if (hist.length > 480) hist.shift();
            ring.push(x); if (ring.length > 600) ring.shift();
          },
          draw() {
            const f = get('f'), z = zeta(); background(ctx, false);
            const cx = 330, cy = 120, PX = 80, mx = cx + x * PX;
            ctx.fillStyle = '#51627a'; ctx.fillRect(30, cy - 40, 12, 80);
            ctx.strokeStyle = '#cdb88a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(42, cy); for (let i = 1; i <= 12; i++) ctx.lineTo(42 + (mx - 22 - 42) * i / 13, cy + (i % 2 ? 14 : -14)); ctx.lineTo(mx - 22, cy); ctx.stroke();
            ctx.fillStyle = COLOR.amber; ctx.fillRect(mx - 22, cy - 22, 44, 44);
            const push = STATIC * Math.cos(2 * Math.PI * f * t); arrow(ctx, mx + 32, cy, mx + 32 + push * 360, cy, COLOR.teal, '', 5, 11);
            text(ctx, 'push', mx + 32, cy - 22, COLOR.teal, 13, 'left');
            text(ctx, 'Natural frequency of the mass and spring: 1.00 Hz', 22, 28, COLOR.dim, 15);
            text(ctx, 'You are pushing at ' + f.toFixed(2) + ' Hz', 22, 54, '#fff', 17);
            const meas = ring.length > 60 ? (Math.max(...ring) - Math.min(...ring)) / 2 : 0;
            // trace
            const gx = 60, gy = 218, gw = 400, gh = 220, ymax = 3;
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh); ctx.beginPath(); ctx.moveTo(gx, gy + gh / 2); ctx.lineTo(gx + gw, gy + gh / 2); ctx.stroke();
            text(ctx, 'Position of the mass (last 8 s)', gx, gy - 10, COLOR.text, 13);
            line(ctx, hist.map(([tt, xx], i) => [gx + i / 479 * gw, gy + gh / 2 - Math.max(-1, Math.min(1, xx / ymax)) * gh / 2]), COLOR.amber, 2.5);
            // resonance curve
            const cx0 = 540, cw = 330, ch = 220, cmax = Math.max(.35, Math.min(2.8, STATIC / (2 * z) * 1.15));
            ctx.strokeStyle = COLOR.faint; ctx.strokeRect(cx0, gy, cw, ch); text(ctx, 'How big a swing each pushing rate gives', cx0, gy - 10, COLOR.text, 13);
            const pts = []; for (let ff = .2; ff <= 2.0001; ff += .02) pts.push([cx0 + (ff - .2) / 1.8 * cw, gy + ch - Math.min(1, amp(ff, z) / cmax) * ch]);
            line(ctx, pts, COLOR.teal, 3);
            const ax = cx0 + (f - .2) / 1.8 * cw; ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(ax, gy); ctx.lineTo(ax, gy + ch); ctx.stroke(); ctx.setLineDash([]);
            dot(ctx, ax, gy + ch - Math.min(1, meas / cmax) * ch, '#fff', 6);
            text(ctx, '0.2 Hz', cx0, gy + ch + 16, COLOR.dim, 11); text(ctx, '1 Hz', cx0 + (.8 / 1.8) * cw, gy + ch + 16, COLOR.dim, 11, 'center'); text(ctx, '2 Hz', cx0 + cw, gy + ch + 16, COLOR.dim, 11, 'right');
            text(ctx, 'Swing now: ' + (meas / STATIC).toFixed(1) + '× a steady push', 540, 118, COLOR.amber, 15);
            text(ctx, 'Most it could reach: ' + (amp(1, z) / STATIC).toFixed(1) + '×', 540, 140, COLOR.dim, 14);
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC05
    coupled: {
      label: 'Coupling', min: 1, max: 10, value: 4, step: 1, format: v => v + ' / 10', animated: true, resetOnInput: true, stepsPerFrame: 2,
      buttons: [{ id: 'again', label: 'Swing the left one' }, { id: 'both', label: 'Swing both together' }, { id: 'opp', label: 'Swing them opposite' }],
      make(ctx, get) {
        const W0 = 2 * Math.PI * .8, L = 190;
        let a1, w1, a2, w2, t, hist;
        const kap = () => get() * 1.5;
        return {
          debug() { return { get e() { return [hist]; }, W0, kap }; },
          reset() { a1 = .3; w1 = 0; a2 = 0; w2 = 0; t = 0; hist = []; },
          step() {
            const k = kap(), dt = 1 / 240;
            for (let i = 0; i < 4; i++) {
              let A1 = -W0 * W0 * a1 - k * (a1 - a2), A2 = -W0 * W0 * a2 - k * (a2 - a1);
              w1 += A1 * dt / 2; w2 += A2 * dt / 2; a1 += w1 * dt; a2 += w2 * dt; t += dt;
              A1 = -W0 * W0 * a1 - k * (a1 - a2); A2 = -W0 * W0 * a2 - k * (a2 - a1); w1 += A1 * dt / 2; w2 += A2 * dt / 2;
            }
            const e1 = .5 * w1 * w1 + .5 * W0 * W0 * a1 * a1, e2 = .5 * w2 * w2 + .5 * W0 * W0 * a2 * a2;
            hist.push([t, e1 / (e1 + e2 + 1e-12), e2 / (e1 + e2 + 1e-12)]); if (hist.length > 720) hist.shift();
          },
          draw() {
            background(ctx, false);
            const k = kap(), P = [[330, 100], [570, 100]], th = [a1, a2], cols = [COLOR.teal, COLOR.amber]; const bobs = [];
            ctx.strokeStyle = '#51627a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(280, 96); ctx.lineTo(620, 96); ctx.stroke();
            P.forEach(([px, py], i) => { const bx = px + L * Math.sin(th[i]), by = py + L * Math.cos(th[i]); bobs.push([bx, by]); ctx.strokeStyle = '#cfd9e6'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke(); dot(ctx, bx, by, cols[i], 16); });
            const f = .62, s1 = [P[0][0] + f * L * Math.sin(a1), P[0][1] + f * L * Math.cos(a1)], s2 = [P[1][0] + f * L * Math.sin(a2), P[1][1] + f * L * Math.cos(a2)];
            ctx.strokeStyle = '#e0c26a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(s1[0], s1[1]); const n = 14; for (let i = 1; i < n; i++) { const u = i / n; ctx.lineTo(s1[0] + (s2[0] - s1[0]) * u, s1[1] + (s2[1] - s1[1]) * u + (i % 2 ? 9 : -9)); } ctx.lineTo(s2[0], s2[1]); ctx.stroke();
            const gx = 60, gy = 350, gw = 780, gh = 120;
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh); text(ctx, 'Share of the swinging energy in each pendulum (last 12 s)', gx, gy - 8, COLOR.text, 13);
            line(ctx, hist.map(([tt, e1], i) => [gx + i / 719 * gw, gy + gh - e1 * gh]), COLOR.teal, 2.5); line(ctx, hist.map(([tt, e1, e2], i) => [gx + i / 719 * gw, gy + gh - e2 * gh]), COLOR.amber, 2.5);
            const dw = Math.sqrt(W0 * W0 + 2 * k) - W0;
            text(ctx, 'Energy moves from one pendulum to the other every ' + (Math.PI / dw).toFixed(1) + ' s.', 22, 28, '#fff', 16);
            text(ctx, 'Two ways to swing together: in step at ' + (W0 / 2 / Math.PI).toFixed(2) + ' Hz, or opposite at ' + (Math.sqrt(W0 * W0 + 2 * k) / 2 / Math.PI).toFixed(2) + ' Hz.', 22, 50, COLOR.dim, 14);
            text(ctx, 'Shown at double speed.', 22, H - 8, COLOR.dim, 12);
          },
          act(id) { this.reset(); if (id === 'both') a2 = .3; else if (id === 'opp') a2 = -.3; }
        };
      }
    },

    // ---------------------------------------------------------------- OSC08
    wavespeed: {
      controls: [
        { key: 'T', label: 'Rope tension', min: 10, max: 100, value: 40, step: 10, format: v => v + ' N' },
        { key: 'mu', label: 'Rope heaviness', min: .1, max: .4, value: .2, step: .05, format: v => Number(v).toFixed(2) + ' kg/m' }
      ],
      animated: true,
      buttons: [{ id: 'gentle', label: 'Flick gently' }, { id: 'hard', label: 'Flick hard' }],
      make(ctx, get) {
        const N = 181, LEN = 6, DX = LEN / (N - 1), SLOW = .15, X0 = 30, PXM = 140, YS = 400;
        let y, yp, simT, meas;
        const speed = () => Math.sqrt(get('T') / get('mu'));
        const pulse = A => { const c = speed(), dt = .4 * DX / c; for (let i = 0; i < N; i++) { const x = i * DX; y[i] = A * Math.exp(-(((x - 1.2) / .25) ** 2)); yp[i] = A * Math.exp(-(((x - 1.2 + c * dt) / .25) ** 2)); } y[0] = y[N - 1] = yp[0] = yp[N - 1] = 0; meas = { t1: null, t2: null, v: null }; simT = 0; };
        return {
          debug() { return { get meas() { return meas; }, speed }; },
          reset() { y = new Float64Array(N); yp = new Float64Array(N); simT = 0; meas = { t1: null, t2: null, v: null }; pulse(.1); },
          step() {
            const c = speed(), dt = .4 * DX / c, total = SLOW / 60; let done = 0; const r2 = (c * dt / DX) ** 2;
            while (done < total) {
              const yn = new Float64Array(N);
              for (let i = 1; i < N - 1; i++) yn[i] = 2 * y[i] - yp[i] + r2 * (y[i + 1] - 2 * y[i] + y[i - 1]);
              yp = y; y = yn; done += dt; simT += dt;
              if (meas.v === null) { let mi = 1, mv = 0; for (let i = 1; i < N - 1; i++) if (y[i] > mv) { mv = y[i]; mi = i; } const px = mi * DX; if (meas.t1 === null && px >= 2.0 && simT > .02) meas.t1 = simT; if (meas.t1 !== null && meas.t2 === null && px >= 5.0) { meas.t2 = simT; meas.v = 3 / (meas.t2 - meas.t1); } }
            }
          },
          draw() {
            background(ctx, false); const c = speed();
            ctx.strokeStyle = 'rgba(160,215,240,.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, 250); ctx.lineTo(X0 + LEN * PXM, 250); ctx.stroke();
            ctx.fillStyle = '#51627a'; ctx.fillRect(X0 + LEN * PXM, 190, 14, 120); ctx.fillRect(X0 - 14, 190, 14, 120);
            const pts = []; for (let i = 0; i < N; i++) pts.push([X0 + i * DX * PXM, 250 - y[i] * YS]); line(ctx, pts, COLOR.teal, 4);
            text(ctx, 'v = √(T / μ) = √(' + get('T') + ' ÷ ' + get('mu').toFixed(2) + ') = ' + c.toFixed(1) + ' m/s', 22, 34, '#fff', 18);
            text(ctx, meas.v ? 'Measured by timing the pulse between 2 m and 5 m: ' + meas.v.toFixed(1) + ' m/s' : 'Flick the rope and time the pulse…', 22, 60, COLOR.amber, 15);
            text(ctx, 'Gentle or hard, the pulse travels at the same speed. Shown at 15% of real speed.', 22, H - 18, COLOR.dim, 14);
            text(ctx, 'More tension: faster.  Heavier rope: slower.', 22, H - 44, COLOR.dim, 14);
          },
          act(id) { if (id === 'gentle') pulse(.08); else if (id === 'hard') pulse(.24); }
        };
      }
    },

    // ---------------------------------------------------------------- OSC09
    superpose: {
      label: 'Second pulse', min: -100, max: 100, value: 100, step: 25, format: v => (v > 0 ? '+' : '') + v + '%' + (v === 100 ? ' (same)' : v === -100 ? ' (upside down)' : v === 0 ? ' (none)' : ''), animated: true,
      make(ctx, get) {
        const SP = 1.5, X0 = 30, PXM = 140, LEN = 6, YS = 80, CYCLE = 4.4;
        let t;
        const f = s => Math.exp(-((s / .3) ** 2));
        return {
          debug() { return { f, SP }; },
          reset() { t = 0; },
          step() { t += 1 / 60; if (t > CYCLE) t = 0; },
          draw() {
            const B = get() / 100; background(ctx, false);
            const c1 = .4 + SP * t, c2 = LEN - .4 - SP * t, y1 = x => f(x - c1), y2 = x => B * f(x - c2);
            const base1 = 175, base2 = 365;
            ctx.strokeStyle = 'rgba(160,215,240,.2)'; ctx.lineWidth = 1; for (const b of [base1, base2]) { ctx.beginPath(); ctx.moveTo(X0, b); ctx.lineTo(X0 + LEN * PXM, b); ctx.stroke(); }
            const p1 = [], p2 = [], ps = []; for (let px = 0; px <= LEN * PXM; px += 3) { const x = px / PXM; p1.push([X0 + px, base1 - y1(x) * YS]); p2.push([X0 + px, base1 - y2(x) * YS]); ps.push([X0 + px, base2 - (y1(x) + y2(x)) * YS * 1.0]); }
            line(ctx, p1, COLOR.teal, 3); line(ctx, p2, COLOR.amber, 3); line(ctx, ps, '#ffffff', 4);
            const bx = 3, hb = y1(bx) + y2(bx); dot(ctx, X0 + bx * PXM, base2 - hb * YS, COLOR.red, 8); text(ctx, 'bead', X0 + bx * PXM + 12, base2 + 22, COLOR.red, 13);
            text(ctx, 'The two pulses on their own', X0, base1 - 98, COLOR.dim, 14); text(ctx, 'What the string actually does: the sum', X0, base2 - 98, '#fff', 15);
            text(ctx, 'Height of the bead in the middle: ' + (Math.abs(hb) < .005 ? 0 : hb).toFixed(2) + (B < 0 && Math.abs(hb) < .02 ? '  (they cancel)' : ''), 22, H - 14, COLOR.red, 15);
            text(ctx, 'Where they overlap the heights add. After they pass, each continues unchanged.', 22, 30, COLOR.text, 15);
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC14
    beats: {
      label: 'Second tone higher by', min: 0, max: 3, value: 1, step: .25, format: v => '+' + Number(v).toFixed(2) + ' Hz', animated: true,
      buttons: [{ id: 'sound', label: 'Play the real sound' }],
      make(ctx, get) {
        const F1 = 8;
        let t, audio = null;
        const stopAudio = () => { if (audio) { try { audio.o1.stop(); audio.o2.stop(); audio.ctx.close(); } catch (e) { } audio = null; } };
        return {
          debug() { return { F1 }; },
          reset() { t = 0; stopAudio(); },
          step() { t += 1 / 60; if (audio) { try { audio.o2.frequency.value = 440 + get(); } catch (e) { } } },
          draw() {
            const d = get(), F2 = F1 + d; background(ctx, false);
            const gx = 40, gw = 820, win = 2; const row = (gy, gh, fn, col, lab, lw) => { ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh); const pts = []; for (let px = 0; px <= gw; px += 2) { const tt = t - win + px / gw * win; pts.push([gx + px, gy + gh / 2 - fn(tt) * gh / 2.2]); } line(ctx, pts, col, lw); text(ctx, lab, gx + 8, gy + 18, col, 13); };
            row(48, 80, tt => Math.sin(2 * Math.PI * F1 * tt) / 2, COLOR.teal, 'Tone 1: ' + F1.toFixed(2) + ' per second', 2);
            row(140, 80, tt => Math.sin(2 * Math.PI * F2 * tt) / 2, COLOR.amber, 'Tone 2: ' + F2.toFixed(2) + ' per second', 2);
            row(250, 190, tt => (Math.sin(2 * Math.PI * F1 * tt) + Math.sin(2 * Math.PI * F2 * tt)) / 2, '#ffffff', '', 2.5); text(ctx, 'The sum: what you actually hear', gx + 8, 250 + 190 - 8, '#fff', 13);
            if (d > 0) { const env = []; for (let px = 0; px <= gw; px += 2) { const tt = t - win + px / gw * win; env.push([gx + px, 250 + 95 - Math.abs(Math.cos(Math.PI * d * tt)) * 190 / 2.2]); } line(ctx, env, 'rgba(241,138,118,.7)', 2); const env2 = []; for (let px = 0; px <= gw; px += 2) { const tt = t - win + px / gw * win; env2.push([gx + px, 250 + 95 + Math.abs(Math.cos(Math.PI * d * tt)) * 190 / 2.2]); } line(ctx, env2, 'rgba(241,138,118,.7)', 2); }
            text(ctx, d > 0 ? 'Loud-soft-loud, ' + d.toFixed(2) + ' times a second: the difference between the two tones.' : 'Same pitch: no beats.', 22, 28, '#fff', 16);
            text(ctx, 'The picture uses slow tones so you can see them. The sound button plays 440 Hz and 440 Hz + the difference.', 22, H - 14, COLOR.dim, 12);
          },
          act(id) {
            if (id !== 'sound') return;
            if (audio) { stopAudio(); return 'Play the real sound'; }
            const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
            if (!AC) return 'Sound not available';
            const c = new AC(), o1 = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain(); g.gain.value = .06;
            o1.frequency.value = 440; o2.frequency.value = 440 + get(); o1.connect(g); o2.connect(g); g.connect(c.destination); o1.start(); o2.start(); audio = { ctx: c, o1, o2 };
            return 'Stop the sound';
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC12
    timbre: {
      label: 'Brightness', min: 0, max: 100, value: 60, step: 10, format: v => v + '%', animated: true,
      buttons: [{ id: 'odd', label: 'Odd harmonics only' }, { id: 'sound', label: 'Play the real sound' }],
      make(ctx, get) {
        const NH = 16, F0 = 220, GX = 60, GW = 800, BASE = 222, BH = 150;
        let amps, odd, ver, phase, audio = null;
        const recipe = () => { const p = 3 - 2.6 * get() / 100; amps = []; for (let n = 1; n <= NH; n++) amps.push(odd && n % 2 === 0 ? 0 : 1 / Math.pow(n, p)); ver++; };
        const wave = th => { let s = 0; for (let n = 1; n <= NH; n++) s += amps[n - 1] * Math.sin(n * th); return s; };
        const peak = () => { let m = 1e-9; for (let i = 0; i < 240; i++) m = Math.max(m, Math.abs(wave(i / 240 * 2 * Math.PI))); return m; };
        const stopAudio = () => { if (audio) { try { audio.o.stop(); audio.ctx.close(); } catch (e) { } audio = null; } };
        const setWave = () => { if (!audio) return; try { const im = new Float32Array(NH + 1), re = new Float32Array(NH + 1); for (let n = 1; n <= NH; n++) im[n] = amps[n - 1]; audio.o.setPeriodicWave(audio.ctx.createPeriodicWave(re, im)); audio.ver = ver; } catch (e) { } };
        return {
          debug() { return { amps: () => amps.slice(), wave, NH, F0 }; },
          reset() { odd = false; ver = 0; phase = 0; stopAudio(); recipe(); },
          onInput() { recipe(); },
          step() { phase += .035; if (audio && audio.ver !== ver) setWave(); },
          pointer(kind, fx, fy, down) {
            if (kind !== 'down' && !(kind === 'move' && down)) return false;
            const x = fx * W, y = fy * H;
            if (x < GX || x > GX + GW || y < BASE - BH - 12 || y > BASE + 20) return false;
            const n = Math.min(NH, Math.floor((x - GX) / (GW / NH)) + 1);
            amps[n - 1] = Math.max(0, Math.min(1, (BASE - y) / BH)); ver++; return true;
          },
          draw() {
            background(ctx, false);
            text(ctx, 'The recipe: how much of each pure tone is in the note', GX, 28, '#fff', 17);
            text(ctx, 'Bar n is a pure tone at n × ' + F0 + ' Hz. Drag across the bars to draw your own recipe.', GX, 50, COLOR.dim, 13);
            const bw = GW / NH;
            for (let n = 1; n <= NH; n++) {
              const a = amps[n - 1], h = a * BH, x = GX + (n - 1) * bw;
              ctx.fillStyle = n === 1 ? COLOR.amber : COLOR.teal; ctx.fillRect(x + 6, BASE - h, bw - 12, h);
              text(ctx, String(n), x + bw / 2, BASE + 16, COLOR.dim, 12, 'center');
            }
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(GX, BASE); ctx.lineTo(GX + GW, BASE); ctx.stroke();
            text(ctx, 'harmonic number', GX + GW, BASE + 32, COLOR.dim, 12, 'right');
            const gy = 345, gh = 150, pk = peak();
            text(ctx, 'What reaches your ear: the sum of all of them (3 repeats, scaled to fit)', GX, 282, '#fff', 15);
            ctx.strokeStyle = COLOR.faint; ctx.strokeRect(GX, gy - gh / 2 + 22, GW, gh);
            const mid = gy + 22, pts = [], gh1 = [];
            for (let px = 0; px <= GW; px += 2) { const th = px / GW * 3 * 2 * Math.PI - phase; pts.push([GX + px, mid - wave(th) / pk * gh / 2.3]); gh1.push([GX + px, mid - amps[0] * Math.sin(th) / pk * gh / 2.3]); }
            line(ctx, gh1, 'rgba(245,184,93,.45)', 1.5); line(ctx, pts, '#ffffff', 3);
            ctx.setLineDash([5, 6]); ctx.strokeStyle = 'rgba(241,138,118,.7)'; ctx.lineWidth = 1.5;
            for (let k = 0; k <= 3; k++) { const x = GX + k * GW / 3 + 0; ctx.beginPath(); ctx.moveTo(x, mid - gh / 2); ctx.lineTo(x, mid + gh / 2); ctx.stroke(); }
            ctx.setLineDash([]);
            text(ctx, 'Dashed lines: one repeat each = 1/220 s = 4.5 ms, whatever the recipe. Amber: the lowest tone alone.', GX, H - 12, COLOR.dim, 12);
          },
          act(id) {
            if (id === 'odd') { odd = !odd; recipe(); return odd ? 'All harmonics' : 'Odd harmonics only'; }
            if (id !== 'sound') return;
            if (audio) { stopAudio(); return 'Play the real sound'; }
            const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
            if (!AC) return 'Sound not available';
            const c = new AC(), o = c.createOscillator(), g = c.createGain(); g.gain.value = .12; o.frequency.value = F0; o.connect(g); g.connect(c.destination); audio = { ctx: c, o, ver: -1 }; setWave(); o.start();
            return 'Stop the sound';
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC13
    fourier: {
      label: 'Waves added', min: 1, max: 25, value: 3, step: 1, animated: true,
      buttons: [{ id: 'shape', label: 'Shape: square' }],
      make(ctx, get) {
        const NAMES = ['square', 'sawtooth', 'triangle'], CX = 205, CY = 262, S = 95, WX0 = 430, WX1 = 880;
        let shape, th;
        const term = (s, k) => s === 0 ? { n: 2 * k - 1, a: 4 / (Math.PI * (2 * k - 1)) }
          : s === 1 ? { n: k, a: 2 / Math.PI * (k % 2 ? 1 : -1) / k }
          : { n: 2 * k - 1, a: 8 / (Math.PI * Math.PI) * (k % 2 ? 1 : -1) / ((2 * k - 1) ** 2) };
        const target = (s, x) => { x = ((x + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return s === 0 ? (x > 0 ? 1 : -1) : s === 1 ? x / Math.PI : 2 / Math.PI * Math.asin(Math.sin(x)); };
        const partial = (s, N, x) => { let v = 0; for (let k = 1; k <= N; k++) { const q = term(s, k); v += q.a * Math.sin(q.n * x); } return v; };
        const stats = (s, N) => { let over = 0, sq = 0, cnt = 0; for (let i = 0; i < 720; i++) { const x = (i + .5) / 720 * 2 * Math.PI - Math.PI, p = partial(s, N, x), tg = target(s, x); over = Math.max(over, p - 1); const nearJump = s === 0 ? Math.min(Math.abs(x), Math.PI - Math.abs(x)) < .2 : s === 1 ? Math.PI - Math.abs(x) < .2 : false; if (!nearJump) { sq += (p - tg) ** 2; cnt++; } } return { over, rms: Math.sqrt(sq / cnt) }; };
        return {
          debug() { return { term, target, partial, stats }; },
          reset() { shape = 0; th = 0.3; },
          step() { th += .03; },
          draw() {
            background(ctx, false); const N = get();
            text(ctx, 'Adding ' + N + (N === 1 ? ' wave' : ' waves') + ' to build a ' + NAMES[shape] + ' wave', 22, 30, '#fff', 18);
            text(ctx, 'Each wheel is one pure wave: its height is the wave’s value. Left: the wheels stacked tip to tail.', 22, 54, COLOR.dim, 13);
            let x = CX, y = CY;
            for (let k = 1; k <= N; k++) {
              const q = term(shape, k), r = Math.abs(q.a) * S, ang = q.n * th, nx = x + q.a * S * Math.cos(ang), ny = y - q.a * S * Math.sin(ang);
              ctx.strokeStyle = k === 1 ? 'rgba(245,184,93,.65)' : 'rgba(103,212,208,.35)'; ctx.lineWidth = 1.2; if (r > 1.2) { ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.stroke(); }
              ctx.strokeStyle = k === 1 ? COLOR.amber : COLOR.teal; ctx.lineWidth = k <= 3 ? 2.5 : 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny); ctx.stroke();
              x = nx; y = ny;
            }
            dot(ctx, x, y, '#fff', 5);
            ctx.setLineDash([4, 5]); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(WX0, y); ctx.stroke(); ctx.setLineDash([]);
            ctx.strokeStyle = COLOR.faint; ctx.beginPath(); ctx.moveTo(WX0, CY); ctx.lineTo(WX1, CY); ctx.stroke();
            const tg = [], sm = [];
            for (let px = WX0; px <= WX1; px++) { const ph = th - (px - WX0) * .02; tg.push([px, CY - target(shape, ph) * S]); sm.push([px, CY - partial(shape, N, ph) * S]); }
            if (shape === 1) { const seg = []; let last = null; for (const p of tg) { if (last && Math.abs(p[1] - last[1]) > S) { line(ctx, seg, 'rgba(245,184,93,.55)', 2); seg.length = 0; } seg.push(p); last = p; } line(ctx, seg, 'rgba(245,184,93,.55)', 2); } else line(ctx, tg, 'rgba(245,184,93,.55)', 2);
            line(ctx, sm, '#ffffff', 3);
            text(ctx, 'amber: the shape we want', WX0 + 6, CY - S - 28, COLOR.amber, 13); text(ctx, 'white: the sum of the wheels', WX0 + 6, CY + S + 36, '#fff', 13);
            const st = stats(shape, N);
            text(ctx, 'Typical error: ' + (st.rms * 100).toFixed(0) + '% of the height' + (shape === 0 ? '.   Overshoot past the top: ' + (st.over / 2 * 100).toFixed(0) + '% of the jump' : ''), 22, H - 90, COLOR.red, 14);
            const base = H - 12, bwid = 16.4;
            for (let k = 1; k <= N; k++) { const q = term(shape, k); const h = Math.abs(q.a) * 38; ctx.fillStyle = q.a >= 0 ? COLOR.teal : COLOR.red; ctx.fillRect(40 + (q.n - 1) * bwid, base - h, bwid - 4, h); }
            text(ctx, 'the recipe: height of each wave added (harmonic 1, 2, 3 …)', 22, H - 66, COLOR.dim, 12);
          },
          act(id) { if (id !== 'shape') return; shape = (shape + 1) % 3; return 'Shape: ' + NAMES[shape]; }
        };
      }
    },

    // ---------------------------------------------------------------- OSC15
    doppler: {
      label: 'Siren speed', min: 0, max: 1.6, value: .4, step: .05, format: v => Number(v).toFixed(2) + ' × the speed of sound', animated: true,
      buttons: [{ id: 'sound', label: 'Play the siren' }],
      make(ctx, get) {
        const C = 220, T0 = .5, F0 = 700, RY = 150, OX = 450, OY = 262, CH = { x: 60, w: 800, y: 330, h: 150, win: 14, fmax: 2500 };
        let t, xs, nextEmit, fronts, events, nid, lastRatio, wrapped, audio = null;
        const stopAudio = () => { if (audio) { try { audio.o.stop(); audio.ctx.close(); } catch (e) { } audio = null; } };
        return {
          debug() { return { events: () => events.slice(), C, T0, F0, OX, OY, RY, state: () => ({ t, xs }) }; },
          reset() { t = 0; xs = 100; nextEmit = 0; fronts = []; events = []; nid = 0; lastRatio = 1; wrapped = false; stopAudio(); },
          step() {
            const dt = 1 / 60, v = get() * C;
            t += dt; xs += v * dt; if (xs > W + 70) { xs = -70; wrapped = true; }
            while (nextEmit <= t) { const xe = xs - v * (t - nextEmit); fronts.push({ id: nid++, x0: xe, te: nextEmit, arrived: false, fresh: wrapped }); wrapped = false; nextEmit += T0; }
            for (const f of fronts) {
              if (f.arrived) continue;
              const ta = f.te + Math.hypot(f.x0 - OX, RY - OY) / C;
              f.ta = ta;
              if (t >= ta) {
                f.arrived = true;
                const prev = fronts.find(g => g.id === f.id - 1);
                if (prev && prev.ta !== undefined && !f.fresh && get() < 1) { lastRatio = T0 / (ta - prev.ta); events.push({ ta, ratio: lastRatio, x0: f.x0 }); }
              }
            }
            fronts = fronts.filter(f => C * (t - f.te) < 1200 || !f.arrived);
            events = events.filter(e => e.ta > t - CH.win - 2);
            if (audio) { try { audio.o.frequency.setTargetAtTime(Math.min(4000, F0 * (get() < 1 ? lastRatio : 1)), audio.ctx.currentTime, .06); } catch (e) { } }
          },
          draw() {
            background(ctx, false); const M = get();
            ctx.save(); ctx.beginPath(); ctx.rect(0, 88, W, 230); ctx.clip();
            ctx.strokeStyle = '#51627a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, RY + 22); ctx.lineTo(W, RY + 22); ctx.stroke();
            for (const f of fronts) { const r = C * (t - f.te); if (r < 2) continue; ctx.strokeStyle = 'rgba(103,212,208,' + Math.max(.08, .75 - r / 900).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f.x0, RY, r, 0, 2 * Math.PI); ctx.stroke(); }
            if (M > 1) { const mu = Math.asin(1 / M); ctx.strokeStyle = COLOR.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xs, RY); ctx.lineTo(xs - 700 * Math.cos(mu), RY - 700 * Math.sin(mu)); ctx.moveTo(xs, RY); ctx.lineTo(xs - 700 * Math.cos(mu), RY + 700 * Math.sin(mu)); ctx.stroke(); }
            ctx.restore();
            ctx.fillStyle = COLOR.amber; ctx.fillRect(xs - 24, RY - 11, 48, 22); ctx.fillStyle = COLOR.red; ctx.fillRect(xs - 6, RY - 16, 12, 6);
            dot(ctx, OX, OY, '#fff', 8); text(ctx, 'you', OX + 14, OY + 5, '#fff', 15);
            text(ctx, 'The siren always sounds at ' + F0 + ' Hz', 22, 28, COLOR.teal, 17);
            if (M >= 1) text(ctx, M === 1 ? 'At exactly the speed of sound the waves pile up in front.' : 'Faster than sound: the waves form a cone (red). Its passage is heard as a boom.', 22, 54, COLOR.red, 15);
            else text(ctx, 'You hear: ' + Math.round(F0 * lastRatio) + ' Hz' + (lastRatio > 1.02 ? '   (higher: waves arrive bunched up)' : lastRatio < .98 ? '   (lower: waves arrive stretched out)' : ''), 22, 54, COLOR.amber, 17);
            text(ctx, 'Circles: wave crests, one every ' + T0 + ' s, each centred where the siren was when it was sent.', 22, 78, COLOR.dim, 12);
            ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(CH.x, CH.y, CH.w, CH.h);
            const yf = f => CH.y + CH.h - Math.min(CH.fmax, f) / CH.fmax * CH.h, xt = tt => CH.x + (tt - (t - CH.win)) / CH.win * CH.w;
            ctx.setLineDash([6, 6]); ctx.strokeStyle = COLOR.teal; ctx.beginPath(); ctx.moveTo(CH.x, yf(F0)); ctx.lineTo(CH.x + CH.w, yf(F0)); ctx.stroke(); ctx.setLineDash([]);
            text(ctx, 'what the siren sends: 700 Hz', CH.x + 8, yf(F0) - 6, COLOR.teal, 12);
            const pts = events.filter(e => e.ta >= t - CH.win).map(e => [xt(e.ta), yf(F0 * e.ratio)]); line(ctx, pts, COLOR.amber, 3); for (const p of pts) dot(ctx, p[0], p[1], COLOR.amber, 3.5);
            text(ctx, 'what you hear, over the last ' + CH.win + ' seconds (Hz)', CH.x, CH.y - 8, COLOR.dim, 13);
            text(ctx, '0', CH.x - 8, CH.y + CH.h, COLOR.dim, 11, 'right'); text(ctx, '2500', CH.x - 8, CH.y + 8, COLOR.dim, 11, 'right');
            text(ctx, 'Sped up so you can see it: a real ambulance is only about 0.07 × the speed of sound.', 22, H - 10, COLOR.dim, 12);
          },
          act(id) {
            if (id !== 'sound') return;
            if (audio) { stopAudio(); return 'Play the siren'; }
            const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
            if (!AC) return 'Sound not available';
            const c = new AC(), o = c.createOscillator(), g = c.createGain(); g.gain.value = .05; o.type = 'triangle'; o.frequency.value = F0; o.connect(g); g.connect(c.destination); o.start(); audio = { ctx: c, o };
            return 'Stop the sound';
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC16
    packet: {
      controls: [
        { key: 'sk', label: 'Mix of wavelengths', min: 1, max: 6, value: 3, step: 1, format: v => '±' + Math.round(v / 30 * 100) + '%' },
        { key: 'd', label: 'Medium', min: 0, max: 100, value: 0, step: 25, format: v => v === 0 ? 'no dispersion' : v === 100 ? 'water-like' : v + '% water-like' }
      ],
      animated: true,
      make(ctx, get) {
        const K0 = .3, VP = 140, X0 = 130, CYC = 5, YB = 150, YS = 78, NJ = 121;
        let t, track;
        const omega = (k, d) => VP * K0 * ((1 - d) * k / K0 + d * Math.sqrt(k / K0));
        const comps = () => { const s = get('sk') * .01, d = get('d') / 100, out = []; let tot = 0; for (let j = 0; j < NJ; j++) { const k = K0 + (j / (NJ - 1) * 9 - 4.5) * s, a = Math.exp(-((k - K0) ** 2) / (4 * s * s)); out.push({ k, a, w: omega(k, d) }); tot += a; } return { out, tot, s, d }; };
        const field = (x, tt, c) => { let re = 0, im = 0; for (const q of c.out) { const ang = q.k * (x - X0) - q.w * tt; re += q.a * Math.cos(ang); im += q.a * Math.sin(ang); } return { psi: re / c.tot, env: Math.hypot(re, im) / c.tot }; };
        const peakX = (tt, c) => { let best = -1, bx = X0; for (let x = 0; x <= W; x += 2) { const e = field(x, tt, c).env; if (e > best) { best = e; bx = x; } } return bx; };
        return {
          debug() { return { field, comps, peakX, K0, VP, X0, omega }; },
          reset() { t = 0; track = []; },
          step() { t += 1 / 60; if (t > CYC) { t = 0; track = []; } },
          draw() {
            background(ctx, false); const c = comps(), d = c.d;
            ctx.strokeStyle = 'rgba(160,215,240,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, YB); ctx.lineTo(W, YB); ctx.stroke();
            const pts = [], up = [], dn = []; let best = -1, bx = X0;
            for (let x = 0; x <= W; x += 2) { const f = field(x, t, c); pts.push([x, YB - f.psi * YS]); up.push([x, YB - f.env * YS]); dn.push([x, YB + f.env * YS]); if (f.env > best) { best = f.env; bx = x; } }
            ctx.setLineDash([6, 5]); line(ctx, up, 'rgba(245,184,93,.8)', 1.8); line(ctx, dn, 'rgba(245,184,93,.8)', 1.8); ctx.setLineDash([]);
            line(ctx, pts, COLOR.teal, 2.5);
            const xc = X0 + VP * t; if (xc < W) { const f = field(xc, t, c); dot(ctx, xc, YB - f.psi * YS, COLOR.red, 7); }
            ctx.fillStyle = COLOR.amber; ctx.beginPath(); ctx.moveTo(bx, YB + YS + 24); ctx.lineTo(bx - 8, YB + YS + 40); ctx.lineTo(bx + 8, YB + YS + 40); ctx.closePath(); ctx.fill();
            text(ctx, 'packet', bx, YB + YS + 56, COLOR.amber, 13, 'center');
            if (t > .4) track.push([t, bx]); const vm = track.length > 20 ? (track[track.length - 1][1] - track[0][1]) / (track[track.length - 1][0] - track[0][0]) : null;
            text(ctx, 'Red dot rides one crest: speed ' + VP + ' px/s.  The packet (amber) moves at ' + (vm === null ? '…' : vm.toFixed(0)) + ' px/s.', 22, 28, '#fff', 15);
            text(ctx, d === 0 ? 'No dispersion: every wavelength travels at the same speed, so the packet keeps its shape.' : 'Water-like: long waves outrun short ones, so crests slip forward through the packet and it slowly spreads.', 22, 52, COLOR.dim, 13);
            const bx0 = 60, bw = 800, by = H - 24, bh = 100;
            text(ctx, 'The ingredients: pure waves, one bar per wavelength mixed in', bx0, by - bh - 14, COLOR.dim, 13);
            for (const q of c.out) { const x = bx0 + (q.k / .62) * bw, h = q.a * bh; ctx.fillStyle = COLOR.teal; ctx.fillRect(x - 6, by - h, 12, h); }
            ctx.strokeStyle = COLOR.faint; ctx.beginPath(); ctx.moveTo(bx0, by); ctx.lineTo(bx0 + bw, by); ctx.stroke();
            text(ctx, '← longer waves', bx0, by - 6, COLOR.dim, 12); text(ctx, 'shorter waves →', bx0 + bw, by - 6, COLOR.dim, 12, 'right');
            const lo = 2 * Math.PI / (K0 + c.s), hi = 2 * Math.PI / (K0 - c.s);
            text(ctx, 'Wavelengths about ' + lo.toFixed(0) + ' to ' + hi.toFixed(0) + ' px. A short packet needs a wide mix; a long one, a narrow mix.', bx0, H - 6, COLOR.dim, 12);
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC17
    dispersion: {
      label: 'Water depth', min: 0, max: 5, value: 5, step: 1, format: v => ['1 m (shallow)', '3 m', '10 m', '30 m', '100 m', '1 km (deep)'][v], animated: true,
      buttons: [{ id: 'splash', label: 'Make a new splash' }],
      make(ctx, get) {
        const G = 9.8, SIG = 3, DEPTH = [1, 3, 10, 30, 100, 1000], NK = 200, DK = .0066, XR = 300, PX = 1.5, CYC = 64, SPD = 4;
        let t, xp, gain;
        const omega = (k, h) => Math.sqrt(G * k * Math.tanh(k * h));
        const vgroup = (k, h) => (omega(k * 1.001, h) - omega(k * .999, h)) / (k * .002);
        const kAt = (v, h) => { let lo = .004, hi = 1.5; if (v > vgroup(lo, h) || v < vgroup(hi, h)) return null; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (vgroup(m, h) > v) lo = m; else hi = m; } return (lo + hi) / 2; };
        const coef = k => SIG / Math.sqrt(2 * Math.PI) * Math.exp(-SIG * SIG * k * k / 2) * DK;
        const eta = (x, tt, h) => { let s = 0; for (let j = 0; j < NK; j++) { const k = (j + .5) * DK; s += coef(k) * (Math.cos(k * x - omega(k, h) * tt) + Math.cos(k * x + omega(k, h) * tt)); } return s; };
        return {
          debug() { return { eta, omega, vgroup, kAt, DEPTH, G, state: () => ({ t, xp }) }; },
          reset() { t = 0; xp = 150; gain = 1; },
          step() { t += SPD / 60; if (t > CYC) t = 0; },
          pointer(kind, fx, fy, down) { if (kind === 'down' || (kind === 'move' && down)) { xp = Math.max(-XR, Math.min(XR, (fx * W - W / 2) / PX)); return true; } return false; },
          act(id) { if (id === 'splash') t = 0; },
          draw() {
            background(ctx, false); const h = DEPTH[get()], YB = 285;
            const vals = []; let mx = 1e-6;
            for (let px = 0; px <= W; px += 2) { const x = (px - W / 2) / PX, e = eta(x, t, h); vals.push(e); mx = Math.max(mx, Math.abs(e)); }
            if (t < .2) gain = 1; gain += (Math.max(mx, .005) - gain) * .15;
            const sc = 85 / gain; ctx.strokeStyle = 'rgba(160,215,240,.18)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, YB); ctx.lineTo(W, YB); ctx.stroke();
            const pts = []; vals.forEach((e, i) => pts.push([i * 2, YB - Math.max(-125, Math.min(125, e * sc))])); line(ctx, pts, COLOR.teal, 2.2);
            const px = W / 2 + xp * PX; ctx.setLineDash([4, 5]); ctx.strokeStyle = COLOR.red; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(px, YB - 130); ctx.lineTo(px, YB + 130); ctx.stroke(); ctx.setLineDash([]);
            dot(ctx, W / 2, YB + 8, COLOR.amber, 4);
            text(ctx, 'Time since the splash: ' + t.toFixed(0) + ' s.  Depth ' + (h >= 1000 ? '1 km (deep)' : h + ' m') + '.  Heights rescaled to fit: ×' + (1 / gain).toFixed(1) + '.', 22, 28, '#fff', 16);
            const k = t > 1 ? kAt(Math.abs(xp) / t, h) : null;
            text(ctx, k ? 'At the red line, the waves arriving now are ' + (2 * Math.PI / k).toFixed(0) + ' m long (a crest every ' + (2 * Math.PI / omega(k, h)).toFixed(1) + ' s).' : t > 1 ? 'Nothing is arriving at the red line right now.' : 'Click or drag on the picture to put the red line anywhere and read the waves there.', 22, 52, COLOR.red, 14);
            const ix = 640, iy = 74, iw = 230, ih = 96; ctx.strokeStyle = COLOR.faint; ctx.strokeRect(ix, iy, iw, ih);
            const lx = lam => ix + (Math.log(lam) - Math.log(3)) / (Math.log(400) - Math.log(3)) * iw, ly = v => iy + ih - Math.min(1, v / 12) * ih; const cp = [];
            for (let i = 0; i <= 60; i++) { const lam = Math.exp(Math.log(3) + i / 60 * (Math.log(400) - Math.log(3))), kk = 2 * Math.PI / lam; cp.push([lx(lam), ly(vgroup(kk, h))]); }
            line(ctx, cp, COLOR.amber, 2.5); if (k) dot(ctx, lx(2 * Math.PI / k), ly(vgroup(k, h)), COLOR.red, 5);
            text(ctx, 'speed of each wavelength', ix, iy - 6, COLOR.dim, 12); text(ctx, 'short', ix + 2, iy + ih + 14, COLOR.dim, 11); text(ctx, 'long', ix + iw, iy + ih + 14, COLOR.dim, 11, 'right');
            text(ctx, h >= 100 ? 'Deep water: the longest waves run ahead. The splash sorts itself by wavelength.' : h <= 3 ? 'Shallow water: nearly every wavelength moves at the same speed, so the splash keeps its shape.' : 'In between: only the longest waves are still sorted by length.', 22, H - 22, COLOR.dim, 13);
            text(ctx, 'Shown at ' + SPD + '× speed. The splash is a 3 m-wide bump released at the centre.', 22, H - 6, COLOR.dim, 12);
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC18
    reflect: {
      label: 'Far rope', min: 0, max: 8, value: 6, step: 1,
      format: v => ['free end', '8× lighter', '4× lighter', '2× lighter', 'identical', '2× heavier', '4× heavier', '8× heavier', 'fixed wall'][v], animated: true,
      buttons: [{ id: 'send', label: 'Send another pulse' }],
      make(ctx, get) {
        const N = 321, DX = .025, IB = 160, T = 40, MU1 = .2, SLOW = .15, X0 = 30, PXM = 105, YS = 700, YC = 250, A0 = .1;
        let y, yp, simT, meas;
        const RHO = [0, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8, Infinity];
        const rho = () => RHO[get()];
        const zr = () => { const r = rho(); return r === 0 ? 0 : r === Infinity ? Infinity : Math.sqrt(r); };
        const theory = () => { const z = zr(); if (z === Infinity) return { r: -1, t: 0 }; if (z === 0) return { r: 1, t: 2 }; return { r: (1 - z) / (1 + z), t: 2 / (1 + z) }; };
        const mu = i => i <= IB ? MU1 : MU1 * (rho() === 0 || rho() === Infinity ? 1 : rho());
        const cAt = i => Math.sqrt(T / mu(i));
        const cmax = () => { let m = cAt(0); for (let i = 0; i < N; i++) m = Math.max(m, cAt(i)); return m; };
        const iEnd = () => rho() === 0 || rho() === Infinity ? IB : N - 1;
        const start = () => { y = new Float64Array(N); yp = new Float64Array(N); const c = cAt(0), dt = .4 * DX / cmax(); for (let i = 0; i < N; i++) { const x = i * DX; y[i] = A0 * Math.exp(-(((x - 1.4) / .25) ** 2)); yp[i] = A0 * Math.exp(-(((x - 1.4 + c * dt) / .25) ** 2)); } simT = 0; meas = { refl: 0, trans: 0, gate: false, rmax: 0, tmax: 0 }; };
        return {
          debug() { return { get meas() { return meas; }, theory, rho, state: () => ({ y, simT }) }; },
          reset() { start(); },
          onInput() { start(); },
          act(id) { if (id === 'send') start(); },
          step() {
            const cm = cmax(), dt = .4 * DX / cm, total = SLOW / 60, E = iEnd(), r = rho(); let done = 0;
            const tc = (IB * DX - 1.4) / cAt(0), gateT = tc + .75 / cAt(0);
            while (done < total) {
              const yn = new Float64Array(N);
              for (let i = 1; i < E; i++) { const r2 = (cAt(i) * dt / DX) ** 2; yn[i] = 2 * y[i] - yp[i] + r2 * (y[i + 1] - 2 * y[i] + y[i - 1]); }
              { const cc = cAt(0) * dt / DX; yn[0] = y[0] - cc * (y[0] - y[1]); }
              if (r === 0) { const r2 = (cAt(E) * dt / DX) ** 2; yn[E] = 2 * y[E] - yp[E] + r2 * 2 * (y[E - 1] - y[E]); }
              else if (r === Infinity) yn[E] = 0;
              else { const cc = cAt(N - 1) * dt / DX; yn[E] = y[E] - cc * (y[E] - y[E - 1]); }
              yp = y; y = yn; done += dt; simT += dt;
              if (simT > gateT) { for (let i = 2; i < IB - 8; i++) if (Math.abs(y[i]) > Math.abs(meas.refl)) meas.refl = y[i]; }
              if (r !== 0 && r !== Infinity) for (let i = IB + 12; i < N - 4; i++) if (Math.abs(y[i]) > Math.abs(meas.trans)) meas.trans = y[i];
            }
          },
          draw() {
            background(ctx, false); const r = rho(), E = iEnd(), th = theory();
            const z = zr(), thick = r === 0 || r === Infinity ? 3.5 : 2.2 + 1.5 * Math.min(2.2, z);
            const xs = i => X0 + i * DX * PXM;
            ctx.strokeStyle = 'rgba(160,215,240,.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X0, YC); ctx.lineTo(xs(E), YC); ctx.stroke();
            const left = [], right = []; for (let i = 0; i <= E; i++) { const p = [xs(i), YC - y[i] * YS]; if (i <= IB) left.push(p); if (i >= IB) right.push(p); }
            line(ctx, left, COLOR.teal, 2.5); if (E > IB) line(ctx, right, COLOR.amber, thick);
            ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xs(IB), 120); ctx.lineTo(xs(IB), 380); ctx.stroke(); ctx.setLineDash([]);
            if (r === Infinity) { ctx.fillStyle = '#51627a'; ctx.fillRect(xs(IB), 190, 14, 120); }
            if (r === 0) { dot(ctx, xs(IB), YC, COLOR.amber, 7); text(ctx, 'free end (a ring sliding on a pole)', xs(IB) - 10, 160, COLOR.dim, 13, 'right'); }
            text(ctx, 'light rope', 40, 118, COLOR.teal, 14); if (E > IB) text(ctx, r === 1 ? 'the same rope' : r > 1 ? 'heavier rope' : 'lighter rope', xs(IB) + 14, 118, COLOR.amber, 14);
            text(ctx, 'A pulse meets a change in the rope', 22, 30, '#fff', 17);
            const done = simT > (IB * DX - 1.4) / cAt(0) + 1.4 / Math.min(cAt(0), cAt(N - 1)), fmt = v => (v >= 0 ? '+' : '') + (Math.abs(v) < .03 ? 0 : v).toFixed(2);
            text(ctx, 'Reflected: ' + (done ? fmt(meas.refl / A0) : '…') + ' of the original pulse.   Theory: ' + fmt(th.r), 22, 58, COLOR.teal, 15);
            if (r !== 0 && r !== Infinity) text(ctx, 'Transmitted: ' + (done ? fmt(meas.trans / A0) : '…') + ' of the original.   Theory: ' + fmt(th.t), 22, 82, COLOR.amber, 15);
            else text(ctx, r === 0 ? 'The free end throws it back the same way up.' : 'The wall throws it back upside down. Nothing gets through.', 22, 82, COLOR.amber, 15);
            if (r !== 0 && r !== Infinity) text(ctx, 'Energy sent back: ' + Math.round(th.r * th.r * 100) + '%   passed on: ' + Math.round(100 - th.r * th.r * 100) + '%', 22, H - 44, COLOR.dim, 14);
            text(ctx, 'Reflection = (Z₁ − Z₂) ÷ (Z₁ + Z₂), where Z = √(tension × weight per metre). Matching Z gives no echo.', 22, H - 20, COLOR.dim, 12);
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC19
    diffract: {
      controls: [
        { key: 'wl', label: 'Wavelength', min: 12, max: 80, value: 40, step: 4, format: v => v + ' px' },
        { key: 'w', label: 'Opening width', min: 20, max: 220, value: 120, step: 10, format: v => v + ' px' }
      ],
      animated: true,
      buttons: [{ id: 'voice', label: 'Voice at a doorway' }, { id: 'light', label: 'Light at a doorway' }],
      make(ctx, get) {
        const WX = 280, B = 4, COLS = Math.ceil((W - WX) / B), ROWS = Math.ceil(H / B);
        let re, im, phase, ov = {}, cache = null;
        const P = k => (k in ov ? ov[k] : get(k));
        const field = (x, y, wl, w) => {
          const k = 2 * Math.PI / wl, ns = Math.max(3, Math.ceil(w / (wl / 3))), ds = w / ns; let sr = 0, si = 0;
          for (let s = 0; s < ns; s++) { const ys = H / 2 - w / 2 + (s + .5) * ds, dx = x - WX, dy = y - ys, r = Math.max(Math.hypot(dx, dy), wl / 6), amp = ds * (1 + dx / r) / 2 / Math.sqrt(wl * r), a = k * (WX + r) - Math.PI / 4; sr += amp * Math.cos(a); si += amp * Math.sin(a); }
          return [sr, si];
        };
        const calc = () => { const wl = P('wl'), w = P('w'); re = new Float32Array(COLS * ROWS); im = new Float32Array(COLS * ROWS); for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) { const f = field(WX + (i + .5) * B, (j + .5) * B, wl, w); re[j * COLS + i] = f[0]; im[j * COLS + i] = f[1]; } cache = { wl, w }; };
        return {
          debug() { return { field, WX }; },
          reset() { phase = 0; ov = {}; calc(); },
          onInput() { calc(); },
          step() { phase += .1; },
          sync() { const o = ov; if (Object.keys(o).length) { ov = {}; return o; } return {}; },
          act(id) { if (id === 'voice') ov = { wl: 60, w: 90 }; else if (id === 'light') ov = { wl: 12, w: 220 }; else return; calc(); },
          draw() {
            const wl = P('wl'), w = P('w'); if (!cache || cache.wl !== wl || cache.w !== w) calc();
            const k = 2 * Math.PI / wl, image = ctx.createImageData(W, H), data = image.data, c = Math.cos(phase), s = Math.sin(phase), y0 = H / 2 - w / 2, y1 = H / 2 + w / 2;
            for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
              const i = (y * W + x) * 4; let v;
              if (x >= WX - 7 && x < WX + 7) { if (y >= y0 && y <= y1) v = 0; else { data[i] = 90; data[i + 1] = 104; data[i + 2] = 124; data[i + 3] = 255; continue; } }
              else if (x < WX) v = Math.cos(k * x - phase);
              else { const idx = Math.floor(y / B) * COLS + Math.floor((x - WX) / B); v = re[idx] * c + im[idx] * s; }
              const q = Math.max(0, Math.min(1, (v / 1.5 + 1) / 2));
              data[i] = 16 + Math.round(q * 87); data[i + 1] = 26 + Math.round(q * 186); data[i + 2] = 42 + Math.round(q * 166); data[i + 3] = 255;
            }
            ctx.putImageData(image, 0, 0);
            const ratio = w / wl; text(ctx, 'Opening ≈ ' + ratio.toFixed(1) + ' wavelengths wide', 22, 28, '#fff', 17);
            if (ratio > 1) { const th = Math.asin(1 / ratio), L = W - WX; ctx.setLineDash([7, 6]); ctx.strokeStyle = COLOR.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(WX, H / 2); ctx.lineTo(WX + L, H / 2 - L * Math.tan(th)); ctx.moveTo(WX, H / 2); ctx.lineTo(WX + L, H / 2 + L * Math.tan(th)); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = 'rgba(16,26,42,.8)'; ctx.fillRect(W - 250, 236, 240, 28); text(ctx, 'first dark direction: ±' + (th * 180 / Math.PI).toFixed(0) + '°', W - 20, 256, COLOR.red, 14, 'right'); }
            else { ctx.fillStyle = 'rgba(16,26,42,.8)'; ctx.fillRect(W - 470, 236, 460, 28); text(ctx, 'Opening smaller than the wavelength: waves spread out in every direction', W - 20, 256, COLOR.red, 14, 'right'); }
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(24, H - 40); ctx.lineTo(24 + wl, H - 40); ctx.stroke(); text(ctx, 'one wavelength', 24 + wl + 10, H - 35, '#fff', 13);
            text(ctx, 'Left of the wall: a plain wave. Right: each point of the opening acts as a new source (Huygens).', 22, H - 12, COLOR.dim, 12);
          }
        };
      }
    },

    // ---------------------------------------------------------------- OSC21
    alias: {
      controls: [
        { key: 'f', label: 'Wheel speed', min: 0, max: 8, value: 2.9, step: .025, format: v => Number(v).toFixed(2) + ' turns/s' },
        { key: 'fs', label: 'Camera', min: 12, max: 60, value: 24, step: 1, format: v => v + ' frames/s' }
      ],
      animated: true,
      buttons: [{ id: 'freeze', label: 'Find the frozen speed' }],
      make(ctx, get) {
        const NS = 8, R = 84, C1 = [150, 165], C2 = [470, 165];
        let t, ov = {};
        const P = k => (k in ov ? ov[k] : get(k));
        const alias = (f, fs) => { const fp = NS * f; return fp - Math.round(fp / fs) * fs; };
        const wrap = (a, m) => ((a + m / 2) % m + m) % m - m / 2;
        const wheel = (cx, cy, th, col, mark, wd) => { ctx.strokeStyle = 'rgba(160,215,240,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke(); for (let i = 0; i < NS; i++) { const a = th + i * 2 * Math.PI / NS; ctx.strokeStyle = mark && i === 0 ? COLOR.red : col; ctx.lineWidth = wd; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R * Math.cos(a), cy - R * Math.sin(a)); ctx.stroke(); } dot(ctx, cx, cy, '#fff', 5); };
        return {
          debug() { return { alias, wrap, NS }; },
          reset() { t = 0; ov = {}; },
          step() { t += 1 / 60; },
          sync() { const o = ov; if (Object.keys(o).length) { ov = {}; return o; } return {}; },
          act(id) { if (id === 'freeze') ov = { f: Math.round(P('fs') / NS * 40) / 40 }; },
          draw() {
            background(ctx, false); const f = P('f'), fs = P('fs'), fp = NS * f, fa = alias(f, fs), tt = t;
            text(ctx, 'The real wheel (shown 20× slower)', C1[0] - 130, 36, COLOR.dim, 14); wheel(C1[0], C1[1], 2 * Math.PI * f * tt / 20, COLOR.teal, true, 3);
            text(ctx, 'What the camera shows', C2[0] - 100, 36, '#fff', 14);
            const k = Math.floor(tt * fs), thC = 2 * Math.PI * f * k / fs, thP = 2 * Math.PI * f * (k - 1) / fs;
            wheel(C2[0], C2[1], thP, 'rgba(245,184,93,.35)', false, 2); wheel(C2[0], C2[1], thC, COLOR.teal, false, 3.5);
            const jump = wrap(thC - thP, 2 * Math.PI / NS), trueJump = ((thC - thP) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
            const arc = (from, d, col, rr, dash) => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.arc(C2[0], C2[1], rr, -from, -(from + d), d > 0); ctx.stroke(); ctx.setLineDash([]); };
            if (f > 0) { arc(thP, trueJump, COLOR.red, R + 12, [6, 5]); arc(thP, jump, COLOR.amber, R + 22); }
            text(ctx, 'amber: the short hop the eye assumes', 640, 80, COLOR.amber, 13); text(ctx, 'red dashes: the real, longer turn', 640, 100, COLOR.red, 13);
            const appar = fa / NS, ok = Math.abs(fp) < fs / 2;
            text(ctx, 'Real: ' + f.toFixed(2) + ' turns/s', 640, 140, COLOR.teal, 16); text(ctx, 'Film: ' + appar.toFixed(2) + ' turns/s', 640, 164, '#fff', 16);
            text(ctx, f === 0 ? 'standing still' : Math.abs(appar) < .005 ? 'looks frozen!' : appar < 0 ? 'looks BACKWARD' : ok ? 'forward (truthful)' : 'forward (wrongly slow)', 640, 188, ok ? COLOR.teal : COLOR.red, 16);
            const gx = 60, gw = 800, gy = 365, gh = 52, win = .5; ctx.strokeStyle = COLOR.faint; ctx.lineWidth = 1; ctx.strokeRect(gx, gy - gh - 6, gw, 2 * gh + 12);
            const pa = [], pb = []; for (let px = 0; px <= gw; px += 1) { const tau = px / gw * win; pa.push([gx + px, gy - Math.sin(2 * Math.PI * fp * tau) * gh]); pb.push([gx + px, gy - Math.sin(2 * Math.PI * fa * tau) * gh]); }
            line(ctx, pa, 'rgba(103,212,208,.8)', 1.5); line(ctx, pb, COLOR.red, 3);
            for (let n = 0; n / fs <= win; n++) { const x = gx + n / fs / win * gw; dot(ctx, x, gy - Math.sin(2 * Math.PI * fp * n / fs) * gh, COLOR.amber, 6); }
            text(ctx, 'Spokes passing the top of the wheel: ' + fp.toFixed(1) + ' per second (teal).  Camera snapshots: ' + fs + ' per second (amber dots).', gx, gy - gh - 16, COLOR.dim, 13);
            text(ctx, 'Join the dots and you get the red wave: ' + fa.toFixed(1) + ' per second. It fits every snapshot, so the film cannot tell the two apart.', gx, gy + gh + 28, COLOR.red, 13);
            text(ctx, ok ? 'Fewer than ' + (fs / 2) + ' spokes per second: the camera is fast enough, no illusion.' : 'Spokes faster than half the frame rate (' + (fs / 2) + ' per second): the film invents a slower wave.', gx, H - 8, COLOR.dim, 12);
          }
        };
      }
    },

    // ---------------------------------------------------------------- CAS01
    defense: {
      label: 'Stage', min: 1, max: 4, value: 1, animated: false,
      make(ctx, get) {
        return {
          reset() {},
          draw() {
            background(ctx);
            const stage = get();
            const steps = ['1  Detect an echo', '2  Build a track', '3  Predict a path', '4  Symbolic interception'];
            text(ctx, steps[stage - 1], 25, 46, COLOR.text, 24);
            ctx.strokeStyle = '#60738d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 425); ctx.lineTo(W, 425); ctx.stroke();
            ctx.fillStyle = '#8ea2ba'; ctx.fillRect(85, 390, 28, 35); text(ctx, 'sensor', 65, 452, '#8ea2ba', 16);
            dot(ctx, 560, 155, COLOR.amber, 9);
            if (stage >= 1) {
              ctx.strokeStyle = '#62d3d0'; ctx.lineWidth = 2;
              for (let r = 55; r <= 230; r += 60) { ctx.beginPath(); ctx.arc(99, 405, r, -1.3, -.2); ctx.stroke(); }
              text(ctx, 'reflected signal', 305, 355, '#a9d7d4', 16);
            }
            if (stage >= 2) {
              for (const [x, y] of [[395, 238], [470, 200], [560, 155]]) dot(ctx, x, y, COLOR.amber);
              text(ctx, 'successive observations', 390, 260, '#fff', 16);
            }
            if (stage >= 3) {
              ctx.strokeStyle = COLOR.amber; ctx.setLineDash([10, 8]); ctx.lineWidth = 3;
              ctx.beginPath(); ctx.moveTo(560, 155); ctx.quadraticCurveTo(690, 180, 775, 425); ctx.stroke(); ctx.setLineDash([]);
              text(ctx, 'illustrative predicted path', 570, 255, '#fff', 16);
            }
            if (stage >= 4) {
              ctx.strokeStyle = '#ef8f80'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(710, 420); ctx.lineTo(637, 266); ctx.stroke();
              ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.moveTo(625, 250); ctx.lineTo(649, 274); ctx.moveTo(649, 250); ctx.lineTo(625, 274); ctx.stroke();
              text(ctx, 'symbolic interception', 643, 297, '#fff', 16);
            }
            text(ctx, 'Conceptual sequence • no scale or timing', 25, H - 20, COLOR.dim, 16);
          }
        };
      }
    }
  };

  function el(tag, attrs, html) {
    const n = document.createElement(tag);
    for (const k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (html) n.innerHTML = html;
    return n;
  }

  function mount(host) {
    const def = SIMS[host.dataset.sim];
    if (!def) return;
    const controls = def.controls || [{ key: 'main', label: def.label, min: def.min, max: def.max, value: def.value }];
    host.classList.add('sim-figure');
    host.textContent = '';
    const canvas = el('canvas', { width: W, height: H, role: 'img', 'aria-label': host.dataset.alt || 'Interactive simulation' });
    const bar = el('div', { class: 'controls' });
    const state = {}, sliders = {};
    const uid = 's' + Math.random().toString(36).slice(2, 7);
    controls.forEach(c => {
      const id = uid + c.key, fmt = c.format || (v => v);
      const label = el('label', { for: id }); label.textContent = c.label;
      const input = el('input', { id, type: 'range', min: c.min, max: c.max, value: c.value, step: c.step || 1 });
      const out = el('output', { for: id }); out.value = fmt(Number(c.value));
      sliders[c.key] = { input, out, fmt, c };
      state[c.key] = Number(c.value);
      bar.append(label, input, out);
    });
    const get = (key = controls[0].key) => Number(sliders[key].input.value);
    const buttons = {};
    let toggle = null;
    if (def.animated) { toggle = el('button', { type: 'button' }); toggle.textContent = 'Pause'; bar.append(toggle); }
    (def.buttons || []).forEach(b => { const btn = el('button', { type: 'button', 'data-act': b.id }); btn.textContent = b.label; buttons[b.id] = btn; bar.append(btn); });
    const resetBtn = el('button', { type: 'button' }); resetBtn.textContent = 'Reset'; bar.append(resetBtn);
    host.append(canvas, bar);
    if (host.dataset.caption) { const p = el('p', { class: 'sim-caption' }); p.textContent = host.dataset.caption; host.append(p); }

    const ctx = canvas.getContext('2d');
    const sim = def.make(ctx, get);
    let running = true, visible = true;
    const applySync = () => { if (!sim.sync) return; const v = sim.sync() || {}; for (const k in v) { const sl = sliders[k]; if (sl) { sl.input.value = v[k]; sl.out.value = sl.fmt(Number(sl.input.value)); } } };
    sim.reset(); sim.draw();

    Object.values(sliders).forEach(({ input, out, fmt }) => input.addEventListener('input', () => {
      out.value = fmt(Number(input.value));
      if (sim.onInput) sim.onInput(); else if (def.resetOnInput) sim.reset();
      if (!def.animated || !running) sim.draw();
    }));
    resetBtn.addEventListener('click', () => { sim.reset(); Object.values(buttons).forEach((b, i) => { b.textContent = def.buttons[i].label; }); sim.draw(); });
    if (toggle) toggle.addEventListener('click', () => { running = !running; toggle.textContent = running ? 'Pause' : 'Play'; });
    (def.buttons || []).forEach(b => buttons[b.id].addEventListener('click', () => {
      const label = sim.act && sim.act(b.id);
      if (typeof label === 'string') buttons[b.id].textContent = label;
      applySync();
      if (!def.animated || !running) sim.draw();
    }));

    if (sim.pointer) {
      const send = (kind, e) => {
        const b = canvas.getBoundingClientRect();
        const redraw = sim.pointer(kind, (e.clientX - b.left) / b.width, (e.clientY - b.top) / b.height, e.buttons > 0);
        if (redraw && (!def.animated || !running)) sim.draw();
      };
      canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); send('down', e); });
      canvas.addEventListener('pointermove', e => send('move', e));
      canvas.addEventListener('pointerleave', e => send('leave', e));
      canvas.style.touchAction = 'none';
    }

    if ('IntersectionObserver' in window) { visible = false; new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(host); }
    if (def.animated) {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { running = false; toggle.textContent = 'Play'; }
      const loop = () => {
        if (running && visible) {
          for (let i = 0; i < (def.stepsPerFrame || 1); i++) sim.step(); sim.draw();
          applySync();
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  window.IllusionSims = SIMS; // exposed so simulations can be tested headlessly
  if (typeof document !== 'undefined') document.querySelectorAll('div[data-sim]').forEach(mount);
})();
