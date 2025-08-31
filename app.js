// Bu dosya compat SDK ile yazıldı (index.html'de compat include var).
// Firestore tabanlı; sadece kullanıcı adıyla kayıt/giriş yapar (şifre yok).

// ---------- FIREBASE CONFIG ----------
const firebaseConfig = {
  apiKey: "AIzaSyALAEYsysXJy0mnNmJvD5H0wOqXjp4Oohc",
  authDomain: "sadrayy-site.firebaseapp.com",
  projectId: "sadrayy-site",
  storageBucket: "sadrayy-site.appspot.com",
  messagingSenderId: "302147777701",
  appId: "1:302147777701:web:d701293a09ab61d85f894c",
  measurementId: "G-C9HVQ0XXBJ"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ---------- DOM REFERENCES ----------
const authRoot = document.getElementById('authRoot');
const registerView = document.getElementById('registerView');
const loginView = document.getElementById('loginView');

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const regMsg = document.getElementById('regMsg');
const logMsg = document.getElementById('logMsg');

const showLogin = document.getElementById('showLogin');
const showRegister = document.getElementById('showRegister');

const appHeader = document.getElementById('appHeader');
const appRoot = document.getElementById('appRoot');
const whoami = document.getElementById('whoami');
const btnLogout = document.getElementById('btnLogout');

const navItems = document.querySelectorAll('.nav-item');

const pageRules = document.getElementById('pageRules');
const pageForum = document.getElementById('pageForum');
const pageAbout = document.getElementById('pageAbout');
const pageReport = document.getElementById('pageReport');

const qTitle = document.getElementById('qTitle');
const qGrade = document.getElementById('qGrade');
const qSubject = document.getElementById('qSubject');
const qDesc = document.getElementById('qDesc');
const btnPostQuestion = document.getElementById('btnPostQuestion');
const questionsList = document.getElementById('questionsList');

const filterGrade = document.getElementById('filterGrade');
const filterSubject = document.getElementById('filterSubject');
const btnApplyFilter = document.getElementById('btnApplyFilter');

const rTitle = document.getElementById('rTitle');
const rDesc = document.getElementById('rDesc');
const btnSendReport = document.getElementById('btnSendReport');
const btnShowReports = document.getElementById('btnShowReports');
const reportsList = document.getElementById('reportsList');

// ---------- STATE ----------
let currentUser = null;
let forumUnsub = null;
let reportsUnsub = null;

// ---------- HELPERS ----------
const clean = s => (s||"").trim();
const toDocId = u => clean(u).toLowerCase().replace(/\s+/g,'_');

function showElement(el){ el.classList.remove('hidden'); }
function hideElement(el){ el.classList.add('hidden'); }
function setStatus(target, text, ok=true){
  target.textContent = text;
  target.style.color = ok ? '#b7f5c1' : '#ffb4b4';
  if(text) setTimeout(()=> target.textContent = '', 4000);
}

// ---------- AUTH UI SWITCH ----------
showLogin.addEventListener('click', (e)=>{ e.preventDefault(); hideElement(registerView); showElement(loginView); regMsg.textContent=''; });
showRegister.addEventListener('click', (e)=>{ e.preventDefault(); hideElement(loginView); showElement(registerView); logMsg.textContent=''; });

// ---------- REGISTER ----------
registerForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const username = clean(document.getElementById('regUsername').value);
  if(!username){ setStatus(regMsg, "Kullanıcı adı boş olamaz.", false); return; }

  const docId = toDocId(username);
  try{
    const userRef = db.collection('users').doc(docId);
    const snap = await userRef.get();
    if(snap.exists){
      setStatus(regMsg, "Bu kullanıcı adı zaten alınmış.", false);
      return;
    }
    await userRef.set({ username, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    // başarılı: giriş yap
    onLogin(username);
  }catch(err){
    console.error(err);
    setStatus(regMsg, "Kayıt sırasında hata oluştu.", false);
  }
});

// ---------- LOGIN ----------
loginForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const username = clean(document.getElementById('logUsername').value);
  if(!username){ setStatus(logMsg, "Kullanıcı adı boş olamaz.", false); return; }

  const docId = toDocId(username);
  try{
    const snap = await db.collection('users').doc(docId).get();
    if(!snap.exists){
      setStatus(logMsg, "Kullanıcı bulunamadı.", false);
      return;
    }
    onLogin(snap.data().username || username);
  }catch(err){
    console.error(err);
    setStatus(logMsg, "Giriş sırasında hata oluştu.", false);
  }
});

// ---------- ON LOGIN ----------
function onLogin(username){
  currentUser = username;
  // gizle auth, göster app
  hideElement(authRoot);
  showElement(appHeader);
  showElement(appRoot);
  whoami.textContent = '@' + username;
  // sayfa forumu göster
  navigateTo('pageForum');
  // başlat realtime dinleyiciler
  startForumListener();
  startReportsListener();
}

// ---------- LOGOUT ----------
btnLogout.addEventListener('click', ()=>{
  currentUser = null;
  // unsubscribe
  if(forumUnsub) forumUnsub(); forumUnsub = null;
  if(reportsUnsub) reportsUnsub(); reportsUnsub = null;
  // reset UI
  hideElement(appHeader); hideElement(appRoot);
  showElement(authRoot);
  showElement(registerView); hideElement(loginView);
  document.getElementById('regUsername').value=''; document.getElementById('logUsername').value='';
});

// ---------- NAVIGATION ----------
navItems.forEach(btn=>{
  btn.addEventListener('click', ()=> {
    const pageId = btn.dataset.page;
    navigateTo(pageId);
  });
});

function navigateTo(pageId){
  // tüm sayfaları gizle
  [pageRules,pageForum,pageAbout,pageReport].forEach(p=> hideElement(p));
  // göster
  const target = document.getElementById(pageId);
  if(target) showElement(target);
  // scroll top
  window.scrollTo({top:0,behavior:'smooth'});
}

// ---------- FORUM (post & listen & filter) ----------
function startForumListener(){
  if(forumUnsub) forumUnsub();
  const col = db.collection('forum').orderBy('createdAt','desc');
  forumUnsub = col.onSnapshot(snapshot=>{
    const items = [];
    snapshot.forEach(doc=> items.push({ id: doc.id, ...doc.data() }));
    renderForum(items);
  }, err => console.error('Forum listener error', err));
}

function renderForum(items){
  // filter values
  const fg = clean(filterGrade.value);
  const fs = clean(filterSubject.value);

  const filtered = items.filter(it=>{
    if(fg && it.grade !== fg) return false;
    if(fs && it.subject !== fs) return false;
    return true;
  });

  if(!filtered.length){
    questionsList.innerHTML = `<div class="item muted">Henüz soru yok.</div>`; return;
  }

  questionsList.innerHTML = '';
  filtered.forEach(it=>{
    const div = document.createElement('div');
    div.className = 'item';
    const created = it.createdAt && it.createdAt.toDate ? it.createdAt.toDate().toLocaleString() : '';
    div.innerHTML = `<h3>${escapeHtml(it.title)}</h3>
      <div class="meta">${escapeHtml(it.subject)} • ${escapeHtml(it.grade)}. sınıf • ${created}</div>
      <p>${escapeHtml(it.description)}</p>
      <div class="meta">Gönderen: <strong>@${escapeHtml(it.author)}</strong></div>`;
    questionsList.appendChild(div);
  });
}

btnPostQuestion.addEventListener('click', async (e)=>{
  e.preventDefault();
  if(!currentUser){ alert('Önce giriş yapmalısın'); return; }

  const title = clean(qTitle.value);
  const grade = clean(qGrade.value);
  const subject = clean(qSubject.value);
  const desc = clean(qDesc.value);

  if(!title || !grade || !subject || !desc){ alert('Lütfen tüm alanları doldurun'); return; }

  try{
    await db.collection('forum').add({
      title, grade, subject, description: desc, author: currentUser,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    qTitle.value=''; qDesc.value=''; qGrade.selectedIndex=0; qSubject.selectedIndex=0;
  }catch(err){
    console.error(err); alert('Soru gönderilemedi');
  }
});

btnApplyFilter.addEventListener('click', (e)=>{ e.preventDefault(); /* renderForum will apply filters automatically via snapshot*/ });

// ---------- REPORTS ----------
function startReportsListener(){
  if(reportsUnsub) reportsUnsub();
  const col = db.collection('reports').orderBy('createdAt','desc');
  reportsUnsub = col.onSnapshot(snapshot=>{
    const items = [];
    snapshot.forEach(doc=> items.push({ id: doc.id, ...doc.data() }));
    renderReports(items);
  }, err=> console.error('Reports listener', err));
}

function renderReports(items){
  reportsList.innerHTML = '';
  if(!items.length){ reportsList.innerHTML = `<div class="muted">Henüz rapor yok.</div>`; return; }
  items.forEach(it=>{
    const div = document.createElement('div');
    div.className = 'report-item';
    const created = it.createdAt && it.createdAt.toDate ? it.createdAt.toDate().toLocaleString() : '';
    div.innerHTML = `<strong>${escapeHtml(it.title)}</strong> <div class="meta">${created} • Gönderen: @${escapeHtml(it.reporter||it.author||'anon')}</div><p>${escapeHtml(it.message||it.desc)}</p>`;
    reportsList.appendChild(div);
  });
}

btnSendReport.addEventListener('click', async (e)=>{
  e.preventDefault();
  if(!currentUser){ alert('Önce giriş yapmalısın'); return; }
  const title = clean(rTitle.value); const msg = clean(rDesc.value);
  if(!title || !msg){ alert('Başlık ve detay gerekli'); return; }
  try{
    await db.collection('reports').add({ title, message: msg, reporter: currentUser, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    rTitle.value=''; rDesc.value='';
  }catch(err){ console.error(err); alert('Rapor gönderilemedi'); }
});

btnShowReports.addEventListener('click', (e)=>{ e.preventDefault(); navigateTo('pageReport'); });

// ---------- UTIL ----------
function escapeHtml(str){ return String(str||'').replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s])); }

// ---------- INIT ----------
(function init(){
  // Default visible view at start: auth screen (navbar hidden)
  hideElement(appHeader); hideElement(appRoot);
  showElement(registerView); hideElement(loginView);
  // Preload default page inside app (rules) so no unexpected redirect later
  navigateTo('pageRules');
})();
