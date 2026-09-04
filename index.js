'use strict';

// PROGRESS BAR
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  if (progressBar) progressBar.style.width = pct + '%';
});

// CURSOR
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
});
function animateRing() {
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
  if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
  requestAnimationFrame(animateRing);
}
animateRing();
document.querySelectorAll('a,button,.spotlight-card,.equip-card,.carousel-btn,.project-node-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (cursor) { cursor.style.width = '18px'; cursor.style.height = '18px'; }
    if (ring) { ring.style.width = '52px'; ring.style.height = '52px'; ring.style.borderColor = 'rgba(59,130,246,0.7)'; }
  });
  el.addEventListener('mouseleave', () => {
    if (cursor) { cursor.style.width = '10px'; cursor.style.height = '10px'; }
    if (ring) { ring.style.width = '32px'; ring.style.height = '32px'; ring.style.borderColor = 'rgba(59,130,246,0.5)'; }
  });
});

// NAV HIDE/SHOW ON SCROLL
const nav = document.querySelector('nav');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const cur = window.scrollY;
  if (nav) {
    nav.style.top = (cur > 80 && cur > lastScroll) ? '-80px' : '20px';
  }
  lastScroll = cur;
  document.querySelectorAll('section[id]').forEach(sec => {
    const top = sec.offsetTop - 120, bot = top + sec.offsetHeight;
    if (cur >= top && cur < bot) {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      const link = document.querySelector(`.nav-item[href="#${sec.id}"]`);
      if (link) link.classList.add('active');
    }
  });
});

// === THREE.JS HERO ===
(function initHero() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05080f, 0.016);
  const camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 1000);
  camera.position.set(0, 5, 20);
  camera.lookAt(0, 1, 0);

  // Lights
  scene.add(new THREE.AmbientLight(0x0a1628, 2));
  const sun = new THREE.DirectionalLight(0x93c5fd, 2.5);
  sun.position.set(8, 20, 10);
  sun.castShadow = true;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x1a56db, 1);
  fill.position.set(-10, 5, -5);
  scene.add(fill);
  const ground_light = new THREE.PointLight(0x3b82f6, 0.8, 30);
  ground_light.position.set(0, 0.5, 5);
  scene.add(ground_light);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x080d18, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2; ground.position.y = -1.5;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid
  const grid = new THREE.GridHelper(100, 50, 0x1a56db, 0x0d1525);
  grid.position.y = -1.49;
  grid.material.opacity = 0.2; grid.material.transparent = true;
  scene.add(grid);

  // Road
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 70),
    new THREE.MeshStandardMaterial({ color: 0x0a0f1c, roughness: 1 })
  );
  road.rotation.x = -Math.PI / 2; road.position.set(0, -1.48, 5);
  scene.add(road);
  for (let i = 0; i < 10; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 3), new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 1 }));
    m.rotation.x = -Math.PI / 2; m.position.set(0, -1.47, -25 + i * 7);
    scene.add(m);
  }

  // Building helper
  function makeBuilding(x, z, floors, color) {
    const g = new THREE.Group();
    const w = 3 + Math.random(), d = 3 + Math.random();
    for (let f = 0; f < floors; f++) {
      const h = 1.3;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.15 }));
      mesh.position.y = f * (h + 0.04);
      mesh.castShadow = true;
      g.add(mesh);
      // window lights
      if (f < floors - 1) {
        for (let ww = 0; ww < 4; ww++) {
          const win = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.05), new THREE.MeshStandardMaterial({ color: 0x93c5fd, emissive: 0x3b82f6, emissiveIntensity: 0.8 }));
          win.position.set(-0.6 + ww * 0.5, f * (h + 0.04) + 0.1, d / 2 + 0.01);
          g.add(win);
        }
      }
      // top rebar
      if (f === floors - 1) {
        for (let r = 0; r < 8; r++) {
          const rb = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8 + Math.random() * 1), new THREE.MeshStandardMaterial({ color: 0x5577aa, metalness: 0.8, roughness: 0.3 }));
          rb.position.set((Math.random() - 0.5) * (w - 0.6), f * (h + 0.04) + h / 2 + 0.5, (Math.random() - 0.5) * (d - 0.6));
          rb.rotation.x = (Math.random() - 0.5) * 0.25;
          g.add(rb);
        }
      }
    }
    g.position.set(x, -1.5, z);
    scene.add(g);
    return g;
  }

  makeBuilding(-10, -6, 5, 0x0d1a2e);
  makeBuilding(10, -9, 4, 0x0a1525);
  makeBuilding(-14, 0, 6, 0x0f1f30);
  makeBuilding(14, -3, 3, 0x0c1820);

  // JCB
  const jcbG = new THREE.Group();
  const jcbBody = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.8, 2.5), new THREE.MeshStandardMaterial({ color: 0xf0c000, roughness: 0.4, metalness: 0.3 }));
  jcbBody.position.y = 0.9; jcbG.add(jcbBody);
  const jcbCab = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.4, 1.8), new THREE.MeshStandardMaterial({ color: 0xd4a800 }));
  jcbCab.position.set(0.8, 2.6, 0); jcbG.add(jcbCab);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, 0.08), new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.5, metalness: 0.9 }));
  glass.position.set(0.8, 2.6, 0.94); jcbG.add(glass);
  [-1, 1].forEach(s => {
    const t = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.5, 0.6), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 }));
    t.position.set(0, 0.25, s * 1.2); jcbG.add(t);
  });
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.2, 0.22), new THREE.MeshStandardMaterial({ color: 0xf0c000, roughness: 0.4 }));
  boom.position.set(-1.2, 2.9, 0); boom.rotation.z = -0.4; jcbG.add(boom);
  const bkt = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.9), new THREE.MeshStandardMaterial({ color: 0x778899, metalness: 0.6 }));
  bkt.position.set(-2.3, 1.4, 0); jcbG.add(bkt);
  jcbG.position.set(-5, -1.5, 2); jcbG.rotation.y = 0.4;
  scene.add(jcbG);

  // Tower crane
  const craneG = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 18), new THREE.MeshStandardMaterial({ color: 0xcc2200, metalness: 0.4 }));
  mast.position.y = 9; craneG.add(mast);
  const jib = new THREE.Mesh(new THREE.BoxGeometry(16, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: 0xcc2200 }));
  jib.position.set(2, 18.2, 0); craneG.add(jib);
  const cjib = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 0.2), new THREE.MeshStandardMaterial({ color: 0xcc2200 }));
  cjib.position.set(-4, 18.2, 0); craneG.add(cjib);
  const cw = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 0.6), new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.5 }));
  cw.position.set(-6.5, 18, 0); craneG.add(cw);
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 7), new THREE.MeshStandardMaterial({ color: 0xaabbcc, metalness: 0.9 }));
  wire.position.set(7, 14.5, 0); craneG.add(wire);
  const hook = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x889aaa, metalness: 0.8 }));
  hook.position.set(7, 11, 0); craneG.add(hook);
  craneG.position.set(9, -1.5, -12);
  scene.add(craneG);

  // Lorry
  const lorryG = new THREE.Group();
  const lBody = new THREE.Mesh(new THREE.BoxGeometry(8, 2.5, 2.8), new THREE.MeshStandardMaterial({ color: 0xbb1100, roughness: 0.4, metalness: 0.2 }));
  lBody.position.set(0, 1.25, 0); lorryG.add(lBody);
  const lCab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.6), new THREE.MeshStandardMaterial({ color: 0x991100 }));
  lCab.position.set(3, 2.85, 0); lorryG.add(lCab);
  const ws = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 2.0), new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.5, metalness: 0.9 }));
  ws.position.set(4.1, 3.15, 0); lorryG.add(ws);
  [[-2.5, -1.3], [-0.5, -1.3], [2.5, -1.3], [4, -1.3]].forEach(([wx, wz]) => {
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.5), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1 }));
    wh.rotation.z = Math.PI / 2; wh.position.set(wx, 0.7, wz); lorryG.add(wh);
  });
  lorryG.position.set(4, -1.5, 5); lorryG.rotation.y = -Math.PI / 2;
  scene.add(lorryG);

  // Workers
  function worker(x, z) {
    const g = new THREE.Group();
    g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.9), new THREE.MeshStandardMaterial({ color: 0x1a3a6a })), { position: new THREE.Vector3(0, 0.45, 0) }));
    g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.21, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffcc99 })), { position: new THREE.Vector3(0, 1.07, 0) }));
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffcc00 }));
    helm.scale.y = 0.55; helm.position.set(0, 1.2, 0); g.add(helm);
    g.position.set(x, -1.5, z);
    scene.add(g);
    return g;
  }
  const workers = [worker(-3, 3), worker(0.5, 1.5), worker(6, 0.5)];

  // Material pile
  const pile = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.2, 12), new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 1 }));
  pile.position.set(-1.5, -0.9, 0); scene.add(pile);

  // Particles
  const N = 350;
  const ppos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    ppos[i*3] = (Math.random()-0.5)*70;
    ppos[i*3+1] = Math.random()*22;
    ppos[i*3+2] = (Math.random()-0.5)*50-5;
  }
  const pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
  scene.add(new THREE.Points(pgeo, new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.07, transparent: true, opacity: 0.3 })));

  // Animate
  let camTX = 0, camTY = 5;
  document.addEventListener('mousemove', e => {
    camTX = ((e.clientX / window.innerWidth) - 0.5) * 5;
    camTY = 5 + ((e.clientY / window.innerHeight) - 0.5) * -2.5;
  });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    camera.position.x += (camTX - camera.position.x) * 0.018;
    camera.position.y += (camTY - camera.position.y) * 0.018;
    camera.lookAt(0, 2, 0);
    craneG.rotation.y = t * 0.1;
    boom.rotation.z = -0.4 + Math.sin(t * 0.7) * 0.28;
    bkt.position.y = 1.4 + Math.sin(t * 0.7 + 0.5) * 0.7;
    jcbG.rotation.y = 0.4 + Math.sin(t * 0.25) * 0.2;
    workers.forEach((w, i) => { w.position.y = -1.5 + Math.sin(t * 1.1 + i * 2) * 0.04; });
    lorryG.position.z += 0.012;
    if (lorryG.position.z > 22) lorryG.position.z = -22;
    const pp = pgeo.attributes.position.array;
    for (let i = 0; i < N; i++) { pp[i*3+1] += 0.018; if (pp[i*3+1] > 22) pp[i*3+1] = 0; pp[i*3] += Math.sin(t*0.4+i)*0.003; }
    pgeo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  })();

  window.addEventListener('resize', () => {
    const W2 = canvas.clientWidth, H2 = canvas.clientHeight;
    camera.aspect = W2 / H2; camera.updateProjectionMatrix();
    renderer.setSize(W2, H2);
  });
})();

// COUNTER ANIMATION
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2200;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    const val = target * ease;
    el.textContent = prefix + (Number.isInteger(target) ? Math.floor(val) : val.toFixed(1)) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = prefix + target + suffix;
  }
  requestAnimationFrame(step);
}

// INTERSECTION OBSERVER
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    if (e.target.classList.contains('reveal')) e.target.classList.add('visible');
    if (e.target.classList.contains('stat-number')) { animateCounter(e.target); io.unobserve(e.target); }
    if (e.target.classList.contains('timeline-item')) e.target.classList.add('visible');
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal,.stat-number,.timeline-item').forEach(el => io.observe(el));

// SPOTLIGHT CARDS
document.querySelectorAll('.spotlight-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--mouse-y', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

// === CIRCULAR PROJECT ORBIT ===
(function initOrbit() {
  const nodes = document.querySelectorAll('.project-node');
  if (!nodes.length) return;
  const total = nodes.length;
  const radius = 220;
  let currentAngle = 0;
  let activeIdx = 0;

  const projects = [
    { type: 'Bridge · PMGSY', name: 'Periyar Valley Bridge, Idukki', location: 'Devikulam', year: '2023', value: '₹4.2 Cr' },
    { type: 'Road · PWD', name: 'Adimali–Munnar Bypass Road', location: 'Idukki', year: '2022', value: '₹7.8 Cr' },
    { type: 'Culvert · PMGSY', name: 'Box Culvert Package, Kuttampuzha', location: 'Ernakulam', year: '2021', value: '₹2.1 Cr' },
    { type: 'Earthwork · PWD', name: 'NH-183 Embankment Works', location: 'Thodupuzha', year: '2022', value: '₹5.5 Cr' },
    { type: 'Bridge · PMGSY', name: 'Kallar River RCC Bridge', location: 'Munnar', year: '2023', value: '₹6.3 Cr' },
    { type: 'Road · PMGSY', name: 'Valara Connectivity Road Package', location: 'Idukki', year: '2024', value: '₹9.2 Cr' },
    { type: 'Retaining Wall · PWD', name: 'High-Range Slope Protection', location: 'Devikulam', year: '2021', value: '₹3.1 Cr' },
    { type: 'Civil · Govt.', name: 'Panchayath Infrastructure Package', location: 'Mannamkandam', year: '2024', value: '₹4.8 Cr' },
  ];

  function layout() {
    nodes.forEach((node, i) => {
      const angle = (i / total) * Math.PI * 2 + currentAngle;
      const x = Math.sin(angle) * radius;
      const y = Math.cos(angle) * radius;
      node.style.transform = `translate(${x}px, ${y}px)`;
      const card = node.querySelector('.project-node-card');
      if (card) {
        const dist = Math.abs(angle % (Math.PI * 2));
        const isFront = dist < 0.5 || dist > Math.PI * 2 - 0.5;
        card.classList.toggle('active-node', isFront);
      }
    });
    // Update detail panel
    const panel = document.getElementById('project-detail');
    if (panel) {
      const p = projects[activeIdx];
      panel.querySelector('.pdp-type').textContent = p.type;
      panel.querySelector('.pdp-title').textContent = p.name;
      panel.querySelector('[data-loc]').textContent = 'Location: ' + p.location;
      panel.querySelector('[data-yr]').textContent = 'Completed: ' + p.year;
      panel.querySelector('[data-val]').textContent = 'Contract Value: ' + p.value;
    }
  }
  layout();

  // Scroll to rotate
  const wrap = document.querySelector('.projects-circular-wrap');
  if (wrap) {
    wrap.addEventListener('wheel', e => {
      e.preventDefault();
      currentAngle += e.deltaY * 0.003;
      // Find closest to top (angle ~= 0 or 2PI)
      let best = 0, bestDist = Infinity;
      nodes.forEach((_, i) => {
        const angle = (i / total) * Math.PI * 2 + currentAngle;
        const norm = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const dist = Math.min(norm, Math.PI * 2 - norm);
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      activeIdx = best;
      layout();
    }, { passive: false });
  }

  // Node click
  nodes.forEach((node, i) => {
    node.addEventListener('click', () => {
      const targetAngle = -(i / total) * Math.PI * 2;
      const diff = targetAngle - currentAngle;
      const steps = 30;
      let step = 0;
      function animTo() {
        if (step >= steps) return;
        currentAngle += diff / steps;
        activeIdx = i;
        layout();
        step++;
        requestAnimationFrame(animTo);
      }
      animTo();
    });
  });

  // Auto rotate
  setInterval(() => {
    currentAngle += (Math.PI * 2) / total / 120;
    layout();
  }, 100);
})();

// === EQUIPMENT DEPTH CAROUSEL (NO SKEW) ===
(function initEquip() {
  const cards = document.querySelectorAll('.equip-card');
  if (!cards.length) return;
  const total = cards.length;
  let current = 0;

  function layout() {
    cards.forEach((card, i) => {
      const offset = ((i - current + total) % total);
      const angle = (offset / total) * Math.PI * 2;
      const x = Math.sin(angle) * 320;
      const z = (Math.cos(angle) - 1) * 200;
      const scale = 0.45 + ((z + 200) / 400) * 0.55;
      const opacity = 0.3 + scale * 0.7;
      card.style.transform = `translate(calc(-50% + ${x}px), -50%) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = Math.round(scale * 10);
    });
  }
  layout();

  document.getElementById('carousel-prev')?.addEventListener('click', () => { current = (current - 1 + total) % total; layout(); });
  document.getElementById('carousel-next')?.addEventListener('click', () => { current = (current + 1) % total; layout(); });
  setInterval(() => { current = (current + 1) % total; layout(); }, 3500);
})();

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ABOUT 3D TILT
const aboutVis = document.querySelector('.about-visual');
if (aboutVis) {
  aboutVis.addEventListener('mousemove', e => {
    const r = aboutVis.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    aboutVis.style.transform = `perspective(900px) rotateY(${x*18}deg) rotateX(${-y*18}deg)`;
  });
  aboutVis.addEventListener('mouseleave', () => { aboutVis.style.transform = ''; });
}

// CONTACT FORM
document.querySelector('.contact-form form')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.innerHTML = '<span>Message Sent!</span>';
  btn.style.background = '#0f3d6e';
  setTimeout(() => { btn.innerHTML = '<span>Send Message</span>'; btn.style.background = ''; e.target.reset(); }, 3000);
});

// PAGE LOAD FADE
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.7s ease';
window.addEventListener('load', () => setTimeout(() => { document.body.style.opacity = '1'; }, 80));
