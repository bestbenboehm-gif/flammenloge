// ===== PARTICLE SYSTEM =====
const canvas = document.getElementById('particle-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];

// Mobile detection for performance
const isMobile = window.innerWidth < 768;
const PARTICLE_COUNT = isMobile ? 30 : 80;

function resize() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Ember {
  constructor() { 
    this.reset(); 
    if (canvas) this.y = Math.random() * canvas.height; 
  }
  
  reset() {
    if (!canvas) return;
    this.x = Math.random() * canvas.width;
    this.y = -10;
    this.size = Math.random() * 3 + 1.5;
    this.speedY = Math.random() * 1.2 + 0.4;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.life = 1;
    this.decay = Math.random() * 0.006 + 0.003;
    this.hue = Math.random() > 0.4 
      ? Math.random() * 30 + 20
      : Math.random() * 15 + 355;
  }
  
  update() {
    this.y -= this.speedY;
    this.x += this.speedX * Math.sin(this.y * 0.01);
    this.life -= this.decay;
    if (this.life <= 0 || this.y < -20) this.reset();
  }
  
  draw() {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 100%, ${50 + 30 * this.life}%, ${this.life})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life * 3, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.life * 0.15})`;
    ctx.fill();
  }
}

function initParticles() {
  if (!canvas) return;
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = new Ember();
    p.y = Math.random() * canvas.height;
    particles.push(p);
  }
}

let lastTime = 0;
function animateParticles(timestamp) {
  if (!ctx || !canvas) return;
  
  // Throttle to ~60fps
  if (timestamp - lastTime < 16) {
    requestAnimationFrame(animateParticles);
    return;
  }
  lastTime = timestamp;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { 
    p.update(); 
    p.draw(); 
  });
  requestAnimationFrame(animateParticles);
}

// Initialize on load
if (canvas) {
  resize();
  window.addEventListener('resize', resize);
  initParticles();
  requestAnimationFrame(animateParticles);
}
