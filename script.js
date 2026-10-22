/* ---------- Data ---------- */
const DESC = 'Bring the past into the future with a bold look inspired by the DNA of an iconic street silhouette. Brand-new cushioning underfoot adds unparalleled comfort.';

const products = [
  { 
    id: 1, 
    name: 'Summer Cloths',  
    price: 130, 
    rating: 3.5, 
    description: DESC, 
    sizes: ['S', 'M', 'L', 'XL', '2XL'], 
    colors: ['#c0262d', '#ffffff', '#2f8f9d'], 
    imageUrl: 'https://i.postimg.cc/g2qtNGc2/0bcbd1d1-bf15-40e9-92db-efed065d0190.jpg' 
  },
  { 
    id: 2, 
    name: 'Winter Cloths',  
    price: 220, 
    rating: 4.5, 
    description: DESC, 
    sizes: ['S', 'M', 'L', 'XL', '2XL'], 
    colors: ['#1c1c1c', '#e7e2d6', '#a8431f'], 
    imageUrl: 'https://i.postimg.cc/QtPWDrtr/bf1fc865-aa3b-4f11-9b0d-d18c0a93bd7b.jpg' 
  },
  { 
    id: 3, 
    name: 'Modern Shorts',  
    price: 170, 
    rating: 4.5, 
    description: DESC, 
    sizes: ['S', 'M', 'L', 'XL'],        
    colors: ['#2457c5', '#f2c9a0', '#1c1c1c'], 
    imageUrl: 'https://i.postimg.cc/Gm1G9rjH/c598c088-ad91-4c60-a390-3d3f72348343.jpg' 
  },
  { 
    id: 4, 
    name: 'Woolan Fashion', 
    price: 178, 
    rating: 4.5, 
    description: DESC, 
    sizes: ['S', 'M', 'L', 'XL', '2XL'], 
    colors: ['#c0262d', '#ffffff', '#2f8f9d'], 
    imageUrl: 'https://i.postimg.cc/yNjFw5cJ/04942586-2be4-400e-8e60-fa7f77a95230.jpg' 
  },
  { 
    id: 5, 
    name: 'Jogger Outfit',  
    price: 248, 
    rating: 4.5, 
    description: DESC, 
    sizes: ['M', 'L', 'XL', '2XL'],      
    colors: ['#8d97a3', '#1c1c1c', '#2e8b6f'], 
    imageUrl: 'https://i.postimg.cc/ncX0qH7k/49ada76b-dd15-4299-b736-264ed2707b12.jpg' 
  },
  { 
    id: 6, 
    name: 'Street Style',   
    price: 195, 
    rating: 4.8, 
    description: DESC, 
    sizes: ['S', 'M', 'L', 'XL'],        
    colors: ['#1c1c1c', '#333333', '#8d97a3'], 
    imageUrl: 'https://i.postimg.cc/QNQXh3Vz/28fad911-46db-4e7d-b958-617aee0becd1.jpg' 
  },
];

/* ---------- State ---------- */
const $ = (s, r = document) => r.querySelector(s);
const wrap = $('#app-wrapper');
const deck = $('#deck');
let view = 'hero';
let prevView = 'hero';
let current = null;
let selection = { size: null, color: null };
let cart = [];
let uid = 0;
let section = 'home';
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
  updateActive();
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

/* ---------- Cart drawer ---------- */
const drawer = $('#cart-drawer');
const overlay = $('#cart-overlay');
const cartBtn = $('#cart-btn');
const cartList = $('#cart-items');
const cartEmpty = $('#cart-empty');
const cartTotal = $('#cart-total');
const checkoutBtn = $('#cart-checkout');
const badge = $('#cart-count');

function openCart() {
  drawer.classList.add('active');
  overlay.classList.add('active');
  drawer.setAttribute('aria-hidden', 'false');
  cartBtn.setAttribute('aria-expanded', 'true');
  document.body.classList.add('cart-open');
  $('#cart-close').focus({ preventScroll: true });
}

function closeCart() {
  drawer.classList.remove('active');
  overlay.classList.remove('active');
  drawer.setAttribute('aria-hidden', 'true');
  cartBtn.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('cart-open');
  cartBtn.focus({ preventScroll: true });
}

function updateCart() {
  badge.textContent = cart.length;
  badge.classList.toggle('empty', cart.length === 0);
  cartEmpty.hidden = cart.length > 0;
  checkoutBtn.disabled = cart.length === 0;
  cartTotal.textContent = `$${cart.reduce((sum, i) => sum + i.price, 0).toFixed(2)}`;
}

function addToCart(p, sel) {
  const item = { uid: ++uid, name: p.name, price: p.price, image: p.imageUrl, size: sel.size, color: sel.color };
  cart.push(item);

  const row = document.createElement('li');
  row.className = 'cart-item';
  row.dataset.uid = item.uid;
  row.innerHTML = `
    <img src="${item.image}" alt="" onerror="this.style.visibility='hidden'">
    <div>
      <p class="ci-name">${item.name}</p>
      <p class="ci-meta">Size ${item.size} <span class="ci-dot" style="--c:${item.color}"></span></p>
      <p class="ci-price">$${item.price.toFixed(2)}</p>
    </div>
    <button class="ci-remove" aria-label="Remove ${item.name}">&times;</button>`;
  cartList.appendChild(row);

  updateCart();
  badge.classList.remove('bump');
  void badge.offsetWidth;
  badge.classList.add('bump');
  toast(`Added ${item.name} (${item.size}) to cart`);
}

cartBtn.addEventListener('click', openCart);
$('#cart-close').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);

cartList.addEventListener('click', (e) => {
  const btn = e.target.closest('.ci-remove');
  if (!btn) return;
  const row = btn.closest('.cart-item');
  cart = cart.filter((i) => i.uid !== +row.dataset.uid);
  row.classList.add('leaving');
  setTimeout(() => row.remove(), 300);
  updateCart();
});

checkoutBtn.addEventListener('click', () => {
  const n = cart.length;
  toast(`Order placed: ${n} item${n > 1 ? 's' : ''}, ${cartTotal.textContent}`);
  cart = [];
  cartList.innerHTML = '';
  updateCart();
  closeCart();
});

$('#btn-cart').addEventListener('click', () => {
  if (current) addToCart(current, selection);
});
updateCart();

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
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (drawer.classList.contains('active')) closeCart();
  else if (view === 'detail') setView(prevView);
});

/* ---------- Navbar & page sections ---------- */
document.querySelectorAll('[data-nav]').forEach((a) =>
  a.addEventListener('click', () => {
    if (a.dataset.nav === 'home') setView('hero');
    if (a.dataset.nav === 'product') setView('grid');
  }));

function updateActive() {
  const key = section === 'home' ? (view === 'grid' ? 'product' : 'home') : section;
  document.querySelectorAll('.links a').forEach((a) => a.classList.toggle('active', a.dataset.nav === key));
}

const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { section = en.target.id; updateActive(); }
  });
}, { rootMargin: '-45% 0px -45% 0px' });
document.querySelectorAll('#home, #about, #contact').forEach((s) => io.observe(s));

const nav = $('#nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

window.addEventListener('wheel', (e) => {
  if (view === 'detail' || window.scrollY > 8 || drawer.classList.contains('active')) return;
  if (locked) { e.preventDefault(); return; }
  if (Math.abs(e.deltaY) < 20) return;
  if (view === 'hero' && e.deltaY > 0) { e.preventDefault(); go('grid'); }
  else if (view === 'grid' && e.deltaY < 0) { e.preventDefault(); go('hero'); }
}, { passive: false });

/* ---------- Contact form ---------- */
$('#contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  e.target.reset();
  toast('Message sent. We reply within two working days.');
});
