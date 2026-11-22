import { CONFIG } from './config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
const db = getFirestore(initializeApp(CONFIG.firebase));
const $ = s => document.querySelector(s);
const safeUrl = u => /^https:\/\//.test(u || '') ? u : '';
const mk = (t, txt, cls) => { const e = document.createElement(t); if (txt) e.textContent = txt; if (cls) e.className = cls; return e; };
$('#y').textContent = new Date().getFullYear();
$('#mb').onclick = () => $('#nav').classList.toggle('open');
$('#nav').onclick = () => $('#nav').classList.remove('open');
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
if (CONFIG.whatsapp) { const w = $('#wa'); w.style.display = 'block'; w.href = `https://wa.me/${CONFIG.whatsapp}?text=` + encodeURIComponent('Hello Prabhawith Technology, I would like to enquire about your services.'); }

function note(f, text, err) { const m = f.querySelector('.msg'); m.textContent = text; m.className = 'msg on' + (err ? ' err' : ''); }
function guard(f) {
  if (new FormData(f).get('website')) return false; // honeypot
  const last = +localStorage.getItem('pt_last') || 0;
  if (Date.now() - last < 60000) { note(f, 'Please wait a minute before sending again.', 1); return false; }
  return true;
}
const clean = (d, keys) => Object.fromEntries(keys.map(k => [k, String(d.get(k) || '').trim()]));

$('#enq').addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target; if (!guard(f)) return;
  const rec = clean(new FormData(f), ['name','email','mobile','business','service','message','budget','date','extra']);
  try {
    await addDoc(collection(db, 'enquiries'), { ...rec, status: 'New', createdAt: serverTimestamp() });
    fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_key: CONFIG.web3formsKey, subject: 'New enquiry: ' + rec.service, from_name: 'Prabhawith Website', ...rec }) }).catch(() => {});
    localStorage.setItem('pt_last', Date.now()); f.reset();
    note(f, 'Thank you! Your enquiry has been received. We will contact you soon.');
  } catch (err) { note(f, 'Could not send. Please try again or email ' + CONFIG.email, 1); }
});

$('#fb').addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target; if (!guard(f)) return;
  const d = clean(new FormData(f), ['name','text']); d.rating = +new FormData(f).get('rating');
  try { await addDoc(collection(db, 'feedback'), { ...d, approved: false, createdAt: serverTimestamp() });
    localStorage.setItem('pt_last', Date.now()); f.reset(); note(f, 'Thank you! Your feedback will be shown after approval.');
  } catch (err) { note(f, 'Could not submit feedback. Please try again.', 1); }
});

(async () => {
  try {
    const s = await getDocs(query(collection(db, 'feedback'), where('approved', '==', true)));
    const box = $('#tests'); if (!s.empty) box.textContent = '';
    s.forEach(x => { const d = x.data(), c = mk('div', '', 'card');
      c.append(mk('div', '★'.repeat(d.rating || 0), 'st'), mk('p', d.text), mk('b', d.name)); box.append(c); });
  } catch (e) {}
  try {
    const s = await getDocs(collection(db, 'projects')); const list = s.docs.map(x => x.data());
    if (!list.length) return;
    const box = $('#projects'), chips = $('#chips'); const cats = ['All', ...new Set(list.map(p => p.category).filter(Boolean))];
    const draw = cat => { box.textContent = ''; list.filter(p => cat === 'All' || p.category === cat).forEach(p => {
      const c = mk('div', '', 'card'); const img = safeUrl(p.image);
      if (img) { const i = mk('img', '', 'pi'); i.src = img; i.alt = p.name || ''; i.loading = 'lazy'; c.append(i); }
      c.append(mk('h3', p.name), mk('p', p.category + (p.date ? ' · ' + p.date : '')), mk('p', p.description));
      if (p.tech) c.append(mk('p', 'Tech: ' + p.tech));
      const u = safeUrl(p.url); if (u) { const a = mk('a', 'View Live Website'); a.href = u; a.target = '_blank'; a.rel = 'noopener'; c.append(a); }
      box.append(c); }); };
    cats.forEach((cat, i) => { const b = mk('button', cat); if (!i) b.className = 'on';
      b.onclick = () => { chips.querySelectorAll('button').forEach(x => x.className = ''); b.className = 'on'; draw(cat); }; chips.append(b); });
    draw('All');
  } catch (e) {}
})();

// Service rows pre-select the enquiry form; hero parallax follows the pointer.
document.querySelectorAll('[data-s]').forEach(a => a.addEventListener('click', () => { const sel = document.querySelector('#enq [name=service]'); if (sel) sel.value = a.dataset.s; }));
const hero = document.querySelector('.hero');
if (hero && !matchMedia('(prefers-reduced-motion: reduce)').matches) hero.addEventListener('pointermove', e => {
  const r = hero.getBoundingClientRect(); hero.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(2)); hero.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(2)); });
