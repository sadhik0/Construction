/* ============================================
   HIGHRANGE INFRASTRUCTURE — main.js
   All animations, 3D, interactions
   ============================================ */

'use strict';

// ===================== PROGRESS BAR =====================
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  if (progressBar) progressBar.style.width = pct + '%';
});

// ===================== CUSTOM CURSOR =====================
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
});

function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
  requestAnimationFrame(animateRing);
}
animateRing();

document.querySelectorAll('a, button, .spotlight-card, .project-card, .carousel-btn').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (cursor) { cursor.style.width = '20px'; cursor.style.height = '20px'; cursor.style.background = 'var(--amber)'; }
    if (ring) { ring.style.width = '56px'; ring.style.height = '56px'; ring.style.borderColor = 'rgba(232,160,32,0.6)'; }
  });
  el.addEventListener('mouseleave', () => {
    if (cursor) { cursor.style.width = '12px'; cursor.style.height = '12px'; }
    if (ring) { ring.style.width = '36px'; ring.style.height = '36px'; ring.style.borderColor = 'rgba(232,160,32,0.5)'; }
  });
});

// ===================== NAV DOCK SCROLL =====================
const nav = document.querySelector('nav');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const cur = window.scrollY;
  if (cur > 80) {
    nav.style.top = cur < lastScroll ? '20px' : '-80px';
  }
  lastScroll = cur;

  // Active nav items
  document.querySelectorAll('section[id]').forEach(sec => {
    const top = sec.offsetTop - 120;
    const bot = top + sec.offsetHeight;
    if (cur >= top && cur < bot) {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      const link = document.querySelector(`.nav-item[href="#${sec.id}"]`);
      if (link) link.classList.add('active');
    }
  });
});

// ===================== HERO THREE.JS =====================
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = canvas.clientWidth, H = canvas.clientHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
  camera.position.set(0, 4, 18);
  camera.lookAt(0, 0, 0);

  // Fog
  scene.fog = new THREE.FogExp2(0x0a0a10, 0.018);

  // Ambient + directional light
  scene.add(new THREE.AmbientLight(0x111122, 1.5));
  const sun = new THREE.DirectionalLight(0xe8a020, 2.5);
  sun.position.set(10, 20, 10);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x4488cc, 0.8);
  fill.position.set(-10, 5, -5);
  scene.add(fill);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80, 40, 40),
    new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.9, metalness: 0.1, wireframe: false })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.5;
  scene.add(ground);

  // Ground grid
  const gridHelper = new THREE.GridHelper(80, 40, 0xe8a020, 0x222230);
  gridHelper.position.y = -1.49;
  gridHelper.material.opacity = 0.15;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // ---- ROAD ----
  const roadGeo = new THREE.PlaneGeometry(8, 60);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x2a2a35, roughness: 1 });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, -1.48, 5);
  scene.add(road);

  // Road markings
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 3),
      new THREE.MeshStandardMaterial({ color: 0xe8a020, roughness: 1 })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(0, -1.47, -20 + i * 7);
    scene.add(m);
  }

  // ---- BUILDING (under construction) ----
  function buildBuilding(x, z, floors, color) {
    const group = new THREE.Group();
    const w = 3 + Math.random(), d = 3 + Math.random();
    for (let f = 0; f < floors; f++) {
      const h = 1.2 + Math.random() * 0.3;
      const geo = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.2 });
      const m = new THREE.Mesh(geo, mat);
      m.position.y = f * (h + 0.05);
      group.add(m);

      // Rebar sticking out of top floor
      if (f === floors - 1) {
        for (let r = 0; r < 6; r++) {
          const rb = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 1.2 + Math.random() * 0.8),
            new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.4, metalness: 0.8 })
          );
          rb.position.set(
            (Math.random() - 0.5) * (w - 0.5),
            m.position.y + h / 2 + 0.6,
            (Math.random() - 0.5) * (d - 0.5)
          );
          rb.rotation.x = (Math.random() - 0.5) * 0.3;
          group.add(rb);
        }
      }
    }
    group.position.set(x, -1.5, z);
    scene.add(group);
    return group;
  }

  buildBuilding(-10, -5, 4, 0x2d3240);
  buildBuilding(10, -8, 3, 0x252835);
  buildBuilding(-14, 0, 5, 0x303545);
  buildBuilding(14, -2, 2, 0x282c3a);

  // ---- JCB / EXCAVATOR (simplified) ----
  const jcbGroup = new THREE.Group();
  // body
  const jcbBody = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 1.8, 2.5),
    new THREE.MeshStandardMaterial({ color: 0xf0c000, roughness: 0.4, metalness: 0.3 })
  );
  jcbBody.position.y = 0.9;
  jcbGroup.add(jcbBody);
  // cab
  const jcbCab = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.4, 1.8),
    new THREE.MeshStandardMaterial({ color: 0xe8a020, roughness: 0.5 })
  );
  jcbCab.position.set(0.8, 2.6, 0);
  jcbGroup.add(jcbCab);
  // cab glass
  const cabGlass = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.0, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6, metalness: 0.9 })
  );
  cabGlass.position.set(0.8, 2.6, 0.9);
  jcbGroup.add(cabGlass);
  // tracks
  [-1, 1].forEach(side => {
    const track = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.5, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 1 })
    );
    track.position.set(0, 0.25, side * 1.2);
    jcbGroup.add(track);
  });
  // arm (boom)
  const boom = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 3, 0.25),
    new THREE.MeshStandardMaterial({ color: 0xf0c000, roughness: 0.4 })
  );
  boom.position.set(-1.2, 2.8, 0);
  boom.rotation.z = -0.4;
  jcbGroup.add(boom);
  // bucket
  const bucket = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.5, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5, metalness: 0.6 })
  );
  bucket.position.set(-2.2, 1.4, 0);
  jcbGroup.add(bucket);

  jcbGroup.position.set(-5, -1.5, 2);
  jcbGroup.rotation.y = Math.PI / 6;
  scene.add(jcbGroup);

  // ---- HITACHI CRANE / TOWER CRANE ----
  const craneGroup = new THREE.Group();
  const craneMast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 16),
    new THREE.MeshStandardMaterial({ color: 0xff4400, roughness: 0.5, metalness: 0.4 })
  );
  craneMast.position.y = 8;
  craneGroup.add(craneMast);
  const craneJib = new THREE.Mesh(
    new THREE.BoxGeometry(14, 0.2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xff4400, roughness: 0.5 })
  );
  craneJib.position.set(2, 16.2, 0);
  craneGroup.add(craneJib);
  const counterJib = new THREE.Mesh(
    new THREE.BoxGeometry(5, 0.2, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xff4400, roughness: 0.5 })
  );
  counterJib.position.set(-4, 16.2, 0);
  craneGroup.add(counterJib);
  const counterWeight = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.6, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.5, metalness: 0.5 })
  );
  counterWeight.position.set(-6, 16, 0);
  craneGroup.add(counterWeight);
  // Hook wire
  const wireGeo = new THREE.CylinderGeometry(0.03, 0.03, 6);
  const wireMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  wire.position.set(6, 13, 0);
  craneGroup.add(wire);
  const hookBlock = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.4, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.8 })
  );
  hookBlock.position.set(6, 10, 0);
  craneGroup.add(hookBlock);

  craneGroup.position.set(8, -1.5, -10);
  scene.add(craneGroup);

  // ---- LORRY (Bharatbenz-ish) ----
  const lorryGroup = new THREE.Group();
  const lorryBody = new THREE.Mesh(
    new THREE.BoxGeometry(7, 2.5, 2.8),
    new THREE.MeshStandardMaterial({ color: 0xcc2200, roughness: 0.4, metalness: 0.2 })
  );
  lorryBody.position.set(0, 1.25, 0);
  lorryGroup.add(lorryBody);
  const lorryCabin = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.2, 2.6),
    new THREE.MeshStandardMaterial({ color: 0xaa1900, roughness: 0.4 })
  );
  lorryCabin.position.set(2.6, 2.85, 0);
  lorryGroup.add(lorryCabin);
  const windscreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 1.5, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5, metalness: 0.9 })
  );
  windscreen.position.set(3.7, 3.2, 0);
  lorryGroup.add(windscreen);
  [[-2, -1.4], [0, -1.4], [2.5, -1.4], [3.8, -1.4]].forEach(([wx, wy]) => {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 })
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, 0.7, wy);
    lorryGroup.add(wheel);
  });
  lorryGroup.position.set(3, -1.5, 5);
  lorryGroup.rotation.y = -Math.PI / 2;
  scene.add(lorryGroup);

  // ---- WORKERS ----
  function addWorker(x, z, color = 0xffcc88) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.9), new THREE.MeshStandardMaterial({ color: 0xffa500 }));
    body.position.y = 0.45;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshStandardMaterial({ color }));
    head.position.y = 1.05;
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffdd00 }));
    helmet.position.set(0, 1.18, 0);
    helmet.scale.y = 0.6;
    g.add(body, head, helmet);
    g.position.set(x, -1.5, z);
    scene.add(g);
    return g;
  }

  const workers = [
    addWorker(-3, 3),
    addWorker(0, 2),
    addWorker(5, 0)
  ];

  // ---- MATERIAL PILE ----
  const pileGeo = new THREE.CylinderGeometry(0, 1.5, 1.2, 12);
  const pileMat = new THREE.MeshStandardMaterial({ color: 0x887766, roughness: 1 });
  const pile = new THREE.Mesh(pileGeo, pileMat);
  pile.position.set(-2, -0.9, 0);
  scene.add(pile);

  // ---- PARTICLES (dust/debris) ----
  const particleCount = 300;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 60;
    positions[i * 3 + 1] = Math.random() * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
  }
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const partMat = new THREE.PointsMaterial({ color: 0xe8a020, size: 0.08, transparent: true, opacity: 0.4 });
  scene.add(new THREE.Points(partGeo, partMat));

  // ---- ANIMATE ----
  let t = 0;
  const clock = new THREE.Clock();

  // Mouse parallax
  let camTargetX = 0, camTargetY = 4;
  document.addEventListener('mousemove', e => {
    camTargetX = ((e.clientX / window.innerWidth) - 0.5) * 4;
    camTargetY = 4 + ((e.clientY / window.innerHeight) - 0.5) * -2;
  });

  function animate() {
    requestAnimationFrame(animate);
    t = clock.getElapsedTime();

    // Camera parallax
    camera.position.x += (camTargetX - camera.position.x) * 0.02;
    camera.position.y += (camTargetY - camera.position.y) * 0.02;
    camera.lookAt(0, 2, 0);

    // Crane rotation
    craneGroup.rotation.y = t * 0.12;

    // JCB arm bobbing
    boom.rotation.z = -0.4 + Math.sin(t * 0.8) * 0.25;
    bucket.position.y = 1.4 + Math.sin(t * 0.8 + 0.5) * 0.6;
    jcbGroup.rotation.y = Math.PI / 6 + Math.sin(t * 0.3) * 0.2;

    // Worker bobs
    workers.forEach((w, i) => {
      w.position.y = -1.5 + Math.sin(t * 1.2 + i * 2) * 0.05;
    });

    // Particle drift
    const pos = partGeo.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += 0.02;
      if (pos[i * 3 + 1] > 20) pos[i * 3 + 1] = 0;
      pos[i * 3] += Math.sin(t * 0.5 + i) * 0.003;
    }
    partGeo.attributes.position.needsUpdate = true;

    // Lorry slow movement
    lorryGroup.position.z += 0.01;
    if (lorryGroup.position.z > 20) lorryGroup.position.z = -20;

    renderer.render(scene, camera);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    const W2 = canvas.clientWidth, H2 = canvas.clientHeight;
    camera.aspect = W2 / H2;
    camera.updateProjectionMatrix();
    renderer.setSize(W2, H2);
  });
})();

// ===================== COUNTER ANIMATION =====================
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 4);
    const val = target * ease;
    el.textContent = prefix + (Number.isInteger(target) ? Math.floor(val) : val.toFixed(1)) + suffix;
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = prefix + target + suffix;
  }
  requestAnimationFrame(step);
}

// ===================== INTERSECTION OBSERVER =====================
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    // Reveal elements
    if (e.target.classList.contains('reveal')) {
      e.target.classList.add('visible');
    }
    // Counters
    if (e.target.classList.contains('stat-number')) {
      animateCounter(e.target);
      io.unobserve(e.target);
    }
    // Timeline
    if (e.target.classList.contains('timeline-item')) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .stat-number, .timeline-item').forEach(el => io.observe(el));

// ===================== SPOTLIGHT CARDS MOUSE =====================
document.querySelectorAll('.spotlight-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

// ===================== PROJECTS HORIZONTAL DRAG =====================
const track = document.querySelector('.projects-track');
if (track) {
  let isDown = false, startX = 0, scrollLeft = 0;
  track.addEventListener('mousedown', e => {
    isDown = true;
    track.classList.add('active');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener('mouseleave', () => { isDown = false; });
  track.addEventListener('mouseup', () => { isDown = false; });
  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });

  // Touch support
  let touchStart = 0;
  track.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; scrollLeft = track.scrollLeft; });
  track.addEventListener('touchmove', e => {
    const diff = touchStart - e.touches[0].clientX;
    track.scrollLeft = scrollLeft + diff;
  });
}

// ===================== DEPTH 3D CAROUSEL =====================
(function initCarousel() {
  const cards = document.querySelectorAll('.equip-card');
  if (!cards.length) return;
  const total = cards.length;
  let current = 0;

  function layout() {
    cards.forEach((card, i) => {
      const offset = ((i - current + total) % total);
      const angle = (offset / total) * Math.PI * 2;
      const radius = 340;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const scale = (z + radius) / (radius * 2) * 0.6 + 0.4;
      const opacity = scale;
      const zIndex = Math.round(scale * 10);
      card.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
    });
  }
  layout();

  document.getElementById('carousel-prev')?.addEventListener('click', () => {
    current = (current - 1 + total) % total;
    layout();
  });
  document.getElementById('carousel-next')?.addEventListener('click', () => {
    current = (current + 1) % total;
    layout();
  });

  // Auto-rotate
  setInterval(() => {
    current = (current + 1) % total;
    layout();
  }, 3000);
})();

// ===================== VELOCITY SCROLL EFFECT =====================
let lastScrollY = 0, velocity = 0, ticking = false;

function updateVelocity() {
  velocity = window.scrollY - lastScrollY;
  lastScrollY = window.scrollY;

  const sections = document.querySelectorAll('.velocity-section');
  sections.forEach(sec => {
    const skew = Math.max(-6, Math.min(6, velocity * 0.15));
    sec.style.transform = `skewY(${skew}deg)`;
  });

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateVelocity);
    ticking = true;
  }
});

// ===================== NAV SMOOTH SCROLL =====================
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ===================== ABOUT 3D TILT =====================
const aboutCard = document.querySelector('.about-3d-card');
if (aboutCard) {
  const parent = aboutCard.closest('.about-visual');
  parent?.addEventListener('mousemove', e => {
    const rect = parent.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    aboutCard.style.transform = `perspective(800px) rotateY(${x * 20}deg) rotateX(${-y * 20}deg)`;
  });
  parent?.addEventListener('mouseleave', () => {
    aboutCard.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
  });
}

// ===================== CONTACT FORM =====================
const form = document.querySelector('.contact-form form');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '✓ Message Sent!';
    btn.style.background = '#2d6a4f';
    setTimeout(() => {
      btn.textContent = 'Send Message';
      btn.style.background = '';
      form.reset();
    }, 3000);
  });
}

// ===================== SPECULAR BUTTON MOUSE =====================
document.querySelectorAll('.btn-specular').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    btn.style.setProperty('--sx', x + 'px');
    btn.style.setProperty('--sy', y + 'px');
  });
});

// ===================== PAGE LOAD ANIMATION =====================
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  setTimeout(() => { document.body.style.opacity = '1'; }, 100);
});

console.log('%c HIGHRANGE INFRASTRUCTURE ', 'background:#e8a020;color:#0d0d10;font-size:14px;font-weight:800;padding:4px 12px;border-radius:4px;');
console.log('%c Building Kerala\'s tomorrow. ', 'color:#e8a020;font-size:12px;');
