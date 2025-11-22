const bgMusic = document.getElementById('bgMusic');
const hoverSound = document.getElementById('hoverSound');

bgMusic.volume = 0.3;
hoverSound.volume = 0.5;

let musicStarted = false;

document.body.addEventListener('click', () => {
  if (!musicStarted) {
    bgMusic.play().catch(e => console.log('Music play failed:', e));
    musicStarted = true;
  }
}, { once: true });

const elementBoxes = document.querySelectorAll('.element-box');
elementBoxes.forEach(box => {
  box.addEventListener('mouseenter', () => {
    hoverSound.currentTime = 0;
    hoverSound.play().catch(e => console.log('Hover sound failed:', e));
  });
});

const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

const config = {
  numStars: 250,            
  starMinSize: 0.5,         
  starMaxSize: 2.5,         
  starMinSpeed: 0.05,       
  starMaxSpeed: 0.3,
  starMinRotation: 0.005,   
  starMaxRotation: 0.02,
  starGlowMin: 0.5,         
  starGlowMax: 1,
  starGlowSpeed: 0.003,     
  mouseProximityMax: 150,   
  mouseProximityBoost: 0.7, 

  // mouse effects for uh the mouse or smth 
  sparklesEnabled: true,   // if you want it on then make it true, if not then false 
  sparklesPerMove: 1,       
  sparkleMinSize: 0.5,
  sparkleMaxSize: 2,
  sparkleFadeSpeed: 0.02,   
  sparkleMaxCount: 25
};

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

const stars = [];
const sparkles = [];

function lerp(a, b, t) { return a + (b - a) * t; }

for (let i = 0; i < config.numStars; i++) {
  stars.push({
    x: Math.random() * w,
    y: Math.random() * h,
    baseX: Math.random() * w,
    baseY: Math.random() * h,
    size: Math.random() * (config.starMaxSize - config.starMinSize) + config.starMinSize,
    speed: Math.random() * (config.starMaxSpeed - config.starMinSpeed) + config.starMinSpeed,
    angle: Math.random() * Math.PI * 2,
    rotationSpeed: Math.random() * (config.starMaxRotation - config.starMinRotation) + config.starMinRotation,
    glow: Math.random() * (config.starGlowMax - config.starGlowMin) + config.starGlowMin,
    glowDir: Math.random() > 0.5 ? 1 : -1
  });
}

let mouseX = w / 2;
let mouseY = h / 2;

window.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if(config.sparklesEnabled){
    for(let i=0; i<config.sparklesPerMove; i++){
      sparkles.push({
        x: e.clientX + (Math.random() - 0.5) * 10,
        y: e.clientY + (Math.random() - 0.5) * 10,
        size: Math.random() * (config.sparkleMaxSize - config.sparkleMinSize) + config.sparkleMinSize,
        alpha: 1
      });
    }
    if(sparkles.length > config.sparkleMaxCount){
      sparkles.splice(0, sparkles.length - config.sparkleMaxCount);
    }
  }
});

function draw() {
  ctx.clearRect(0, 0, w, h);

  for (let star of stars) {
    ctx.save();
    ctx.translate(star.x, star.y);
    ctx.rotate(star.angle);

    const dx = mouseX - star.x;
    const dy = mouseY - star.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const boost = Math.min(config.mouseProximityBoost, config.mouseProximityMax / dist);

    ctx.fillStyle = `rgba(255,255,255,${star.glow + boost})`;
    ctx.shadowColor = 'white';
    ctx.shadowBlur = (star.glow + boost) * 4;

    ctx.beginPath();
    ctx.arc(0, 0, star.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();

    s.alpha -= config.sparkleFadeSpeed;
    if (s.alpha <= 0) sparkles.splice(i, 1);
  }
}

function animate() {
  draw();

  for (let star of stars) {
    star.angle += star.rotationSpeed;

    star.baseX += (Math.random() - 0.5) * star.speed;
    star.baseY += (Math.random() - 0.5) * star.speed;

    const offsetX = (mouseX - w / 2) / (w / 2);
    const offsetY = (mouseY - h / 2) / (h / 2);
    const targetX = star.baseX + offsetX * 50 * star.speed;
    const targetY = star.baseY + offsetY * 50 * star.speed;

    star.x = lerp(star.x, targetX, 0.05);
    star.y = lerp(star.y, targetY, 0.05);

    if(star.x > w) star.baseX = star.x = 0;
    if(star.x < 0) star.baseX = star.x = w;
    if(star.y > h) star.baseY = star.y = 0;
    if(star.y < 0) star.baseY = star.y = h;

    star.glow += star.glowDir * config.starGlowSpeed;
    if(star.glow >= config.starGlowMax) star.glowDir = -1;
    if(star.glow <= config.starGlowMin) star.glowDir = 1;
  }

  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

const overlay = document.getElementById('introOverlay');

overlay.addEventListener('click', () => {
  overlay.classList.add('fade-out');
  if (!musicStarted) {
    bgMusic.play().catch(e => console.log('Music play failed:', e));
    musicStarted = true;
  }
});