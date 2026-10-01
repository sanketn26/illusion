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
//   make(ctx, get) -> {reset, step?, draw, act?, pointer?}
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
        if (running && visible) { for (let i = 0; i < (def.stepsPerFrame || 1); i++) sim.step(); sim.draw(); }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }

  window.IllusionSims = SIMS; // exposed so simulations can be tested headlessly
  if (typeof document !== 'undefined') document.querySelectorAll('div[data-sim]').forEach(mount);
})();
