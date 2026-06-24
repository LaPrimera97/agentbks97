/* ═══════════════════════════════════════════════════
   AGENT BKS97 — particles.js
   Canvas animations: background particles and grid
═══════════════════════════════════════════════════ */

/* ── BACKGROUND PARTICLES ───────────────────────── */
const Particles = {
  canvas: null,
  ctx: null,
  pts: [],

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.generate();
    window.addEventListener('resize', () => {
      this.resize();
      this.generate();
    });
    this.draw();
  },

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  generate() {
    this.pts = [];
    const count = Math.floor(
      (this.canvas.width * this.canvas.height) / 18000
    );
    for (let i = 0; i < count; i++) {
      this.pts.push({
        x:   Math.random() * this.canvas.width,
        y:   Math.random() * this.canvas.height,
        r:   Math.random() * 1.3 + 0.2,
        dx:  (Math.random() - 0.5) * 0.18,
        dy:  (Math.random() - 0.5) * 0.18,
        op:  Math.random() * 0.38 + 0.06,
        ph:  Math.random() * Math.PI * 2,
        gold: Math.random() > 0.45,
      });
    }
  },

  draw() {
    const { canvas, ctx, pts } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.ph += 0.007;
      p.x  += p.dx;
      p.y  += p.dy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      const a = p.op * (0.6 + 0.4 * Math.sin(p.ph));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.gold
        ? `rgba(201,168,76,${a})`
        : `rgba(232,146,26,${a * 0.5})`;
      ctx.fill();
    });
    requestAnimationFrame(() => this.draw());
  },
};

/* ── GRID CANVAS (standby screen) ───────────────── */
const GridCanvas = {
  canvas: null,
  ctx: null,
  pts: [],
  _animating: false,

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas || this._animating) return;
    this._animating = true;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.generate();
    window.addEventListener('resize', () => {
      this.resize();
      this.generate();
    });
    this.draw();
  },

  resize() {
    this.canvas.width  = this.canvas.offsetWidth  || 800;
    this.canvas.height = this.canvas.offsetHeight || 600;
  },

  generate() {
    this.pts = [];
    const { width: W, height: H } = this.canvas;
    for (let x = 0; x <= W + 40; x += 40) {
      for (let y = 0; y <= H + 40; y += 40) {
        if (Math.random() < 0.3) {
          this.pts.push({
            x, y,
            r:   Math.random() * 0.9 + 0.2,
            op:  Math.random() * 0.38 + 0.05,
            ph:  Math.random() * Math.PI * 2,
          });
        }
      }
    }
  },

  draw() {
    const { canvas, ctx, pts } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(201,168,76,0.04)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Dots at intersections
    pts.forEach(p => {
      p.ph += 0.011;
      const a = p.op * (0.5 + 0.5 * Math.sin(p.ph));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${a})`;
      ctx.fill();
    });

    requestAnimationFrame(() => this.draw());
  },
};

/* ── LOADING CANVAS (amber drift) ───────────────── */
const LoadCanvas = {
  canvas: null,
  ctx: null,
  pts: [],
  _animating: false,

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas || this._animating) return;
    this._animating = true;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    for (let i = 0; i < 55; i++) {
      this.pts.push({
        x:   Math.random() * 1600,
        y:   Math.random() * 1000,
        r:   Math.random() * 1.6 + 0.3,
        dx:  (Math.random() - 0.5) * 0.4,
        dy:  (Math.random() - 0.5) * 0.4,
        op:  Math.random() * 0.45 + 0.08,
        ph:  Math.random() * Math.PI * 2,
      });
    }
    this.draw();
  },

  resize() {
    this.canvas.width  = this.canvas.offsetWidth  || 800;
    this.canvas.height = this.canvas.offsetHeight || 600;
  },

  draw() {
    const { canvas, ctx, pts } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.ph += 0.01;
      p.x  += p.dx;
      p.y  += p.dy;
      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      const a = p.op * (0.6 + 0.4 * Math.sin(p.ph));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,146,26,${a})`;
      ctx.fill();
    });
    requestAnimationFrame(() => this.draw());
  },
};
