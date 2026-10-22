/* ---------- Data ---------- */
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;
const DESC = 'Bring the past into the future with a bold look inspired by the DNA of an iconic street silhouette. Brand-new cushioning underfoot adds unparalleled comfort.';

const products = [
  { id: 1, name: 'Summer Cloths',  price: 130, rating: 3.5, description: DESC, sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['#c0262d', '#ffffff', '#2f8f9d'], imageUrl: img('photo-1529139574466-a303027c1d8b') },
  { id: 2, name: 'Winter Cloths',  price: 220, rating: 4.5, description: DESC, sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['#1c1c1c', '#e7e2d6', '#a8431f'], imageUrl: img('photo-1515886657613-9f3515b0c78f') },
  { id: 3, name: 'Modern Shorts',  price: 170, rating: 4.5, description: DESC, sizes: ['S', 'M', 'L', 'XL'],        colors: ['#2457c5', '#f2c9a0', '#1c1c1c'], imageUrl: img('photo-1496747611176-843222e1e57c') },
  { id: 4, name: 'Woolan Fashion', price: 178, rating: 4.5, description: DESC, sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['#c0262d', '#ffffff', '#2f8f9d'], imageUrl: img('photo-1539109136881-3be0616acf4b') },
  { id: 5, name: 'Jogger Outfit',  price: 248, rating: 4.5, description: DESC, sizes: ['M', 'L', 'XL', '2XL'],      colors: ['#8d97a3', '#1c1c1c', '#2e8b6f'], imageUrl: img('photo-1509631179647-0177331693ae') },
];

/* ---------- State ---------- */
const $ = (s, r = document) => r.querySelector(s);
const wrap = $('#app-wrapper');
const deck = $('#deck');
let view = 'hero';
let prevView = 'hero';
let current = null;
let selection = { size: null, color: null };
let cart = 0;
let locked = false;

/* ---------- Render cards ---------- */
deck.innerHTML = products.map((p) => `
  <div class="card" tabindex="0" role="button" aria-label="${p.name}, $${p.price}" data-id="${p.id}">
    <div class="photo"><img src="${p.imageUrl}" alt="${p.name}" loading="lazy" draggable="false" onerror="this.style.display='none'"></div>
    <div class="meta">
      <div class="row"><span>${p.name}</span><b>$${p.price}</b></div>
      <div class="rate"><i>&#9733;</i> (${p.rating})</div>
    </div>
  </div>`).join('');

/* ---------- View switching ---------- */
function setView(next, product) {
  if (next === 'detail') {
    if (view !== 'detail') prevView = view;
    current = product;
    fillDetail(product);
  } else {
    current = null;
  }
  deck.querySelectorAll('.card').forEach((c) =>
    c.classList.toggle('is-selected', next === 'detail' && +c.dataset.id === product?.id));
  wrap.className = `view-${next}`;
  view = next;
  document.querySelectorAll('[data-nav]').forEach((a) =>
    a.classList.toggle('active', (a.dataset.nav === 'home' && next === 'hero') || (a.dataset.nav === 'product' && next === 'grid')));
}

function go(next) {
  if (locked || next === view) return;
  locked = true;
  setView(next);
  setTimeout(() => (locked = false), 700);
}

/* ---------- Detail panel ---------- */
function pop(el) {
  el.classList.remove('pop');
  void el.offsetWidth; // restart animation
  el.classList.add('pop');
}

function fillDetail(p) {
  $('#d-name').textContent = p.name;
  $('#d-price').textContent = `$${p.price.toFixed(2)}`;
  $('#d-desc').textContent = p.description;
  selection = { size: p.sizes[0], color: p.colors[1] ?? p.colors[0] };

  const sizes = $('#d-sizes');
  sizes.innerHTML = p.sizes.map((s) =>
    `<button class="size${s === selection.size ? ' active' : ''}" data-size="${s}" aria-pressed="${s === selection.size}">${s}</button>`).join('');
  const colors = $('#d-colors');
  colors.innerHTML = p.colors.map((c) =>
    `<button class="swatch${c === selection.color ? ' active' : ''}" style="--c:${c}" data-color="${c}" aria-label="Color ${c}" aria-pressed="${c === selection.color}"></button>`).join('');
}

$('#d-sizes').addEventListener('click', (e) => {
  const b = e.target.closest('.size');
  if (!b) return;
  selection.size = b.dataset.size;
  $('#d-sizes').querySelectorAll('.size').forEach((x) => {
    x.classList.toggle('active', x === b);
    x.setAttribute('aria-pressed', x === b);
  });
  pop(b);
});

$('#d-colors').addEventListener('click', (e) => {
  const b = e.target.closest('.swatch');
  if (!b) return;
  selection.color = b.dataset.color;
  $('#d-colors').querySelectorAll('.swatch').forEach((x) => {
    x.classList.toggle('active', x === b);
    x.setAttribute('aria-pressed', x === b);
  });
  pop(b);
});

/* ---------- Toast, cart, order ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

$('#btn-cart').addEventListener('click', () => {
  if (!current) return;
  cart += 1;
  const badge = $('#cart-count');
  badge.textContent = cart;
  badge.classList.remove('bump');
  void badge.offsetWidth;
  badge.classList.add('bump');
  toast(`Added ${current.name} (${selection.size}) to cart`);
});

$('#btn-order').addEventListener('click', () => {
  if (!current) return;
  toast(`Order placed: ${current.name}, size ${selection.size}`);
});

/* ---------- Events ---------- */
deck.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card || view === 'detail') return;
  setView('detail', products.find((p) => p.id === +card.dataset.id));
});
deck.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('card')) {
    e.preventDefault();
    e.target.click();
  }
});

$('#back').addEventListener('click', () => setView(prevView));
$('#see-all').addEventListener('click', () => go('grid'));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && view === 'detail') setView(prevView); });

document.querySelectorAll('[data-nav]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const n = a.dataset.nav;
    if (n === 'home') setView('hero');
    else if (n === 'product') setView('grid');
    else toast('This page is not part of the demo');
  }));

// Scroll: down in hero opens the grid, up in the grid returns to the hero
wrap.addEventListener('wheel', (e) => {
  if (locked || view === 'detail' || Math.abs(e.deltaY) < 20) return;
  if (view === 'hero' && e.deltaY > 0) go('grid');
  else if (view === 'grid' && e.deltaY < 0) go('hero');
}, { passive: true });

// Touch swipe equivalent
let touchY = null;
wrap.addEventListener('touchstart', (e) => (touchY = e.touches[0].clientY), { passive: true });
wrap.addEventListener('touchend', (e) => {
  if (touchY === null || view === 'detail') return;
  const dy = touchY - e.changedTouches[0].clientY;
  if (view === 'hero' && dy > 50) go('grid');
  else if (view === 'grid' && dy < -50) go('hero');
  touchY = null;
}, { passive: true });
