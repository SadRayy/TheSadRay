import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, addDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* === FIREBASE === */
const firebaseConfig = {
  apiKey: "AIzaSyALAEYsysXJy0mnNmJvD5H0wOqXjp4Oohc",
  authDomain: "sadrayy-site.firebaseapp.com",
  projectId: "sadrayy-site",
  storageBucket: "sadrayy-site.firebasestorage.app",
  messagingSenderId: "302147777701",
  appId: "1:302147777701:web:d701293a09ab61d85f894c",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* === UI ELEMENTS === */
const loginCard = document.getElementById("loginCard");
const registerCard = document.getElementById("registerCard");
const newsCard = document.getElementById("newsCard");
const forumCard = document.getElementById("forum");

const logNick = document.getElementById("logNick");
const logPass = document.getElementById("logPass");
const btnLogin = document.getElementById("btnLogin");
const logMsg = document.getElementById("logMsg");

const regNick = document.getElementById("regNick");
const regPass = document.getElementById("regPass");
const btnRegister = document.getElementById("btnRegister");
const regMsg = document.getElementById("regMsg");

const goLogin = document.getElementById("goLogin");
const goRegister = document.getElementById("goRegister");

const newsList = document.getElementById("newsList");

const forumList = document.getElementById("forumList");
const forumMsg = document.getElementById("forumMsg");
const sendForum = document.getElementById("sendForum");

/* === NAVBAR === */
const navItems = document.querySelectorAll(".navItem");
const sections = document.querySelectorAll(".window");

navItems.forEach(item => {
  item.addEventListener("click", () => {
    sections.forEach(s => s.classList.add("hidden"));
    const sec = document.getElementById(item.dataset.section);
    if (sec) sec.classList.remove("hidden");
  });
});

/* === HELPERS === */
const clean = s => (s||"").trim();
const nicknameKey = "sr_nickname";

/* === SWITCH LOGIN/REGISTER === */
goLogin.addEventListener("click", ()=>{ registerCard.classList.add("hidden"); loginCard.classList.remove("hidden"); regMsg.textContent=""; });
goRegister.addEventListener("click", ()=>{ loginCard.classList.add("hidden"); registerCard.classList.remove("hidden"); logMsg.textContent=""; });

/* === REGISTER === */
btnRegister.addEventListener("click", async ()=>{
  regMsg.className="msg";
  const nick = clean(regNick.value);
  const pass = clean(regPass.value);
  if(!nick||!pass){ regMsg.textContent="Lütfen tüm alanları doldurun"; regMsg.classList.add("error"); return; }
  if(!/^[a-zA-Z0-9_.-]{3,20}$/.test(nick)){ regMsg.textContent="Nickname 3-20 karakter olmalı"; regMsg.classList.add("error"); return; }

  try{
    const ref = doc(db,"users",nick);
    const snap = await getDoc(ref);
    if(snap.exists()){ regMsg.textContent="Bu nickname zaten kullanılıyor"; regMsg.classList.add("error"); return; }

    await setDoc(ref,{password:pass, createdAt:Date.now()});
    loginCard.classList.add("hidden");
    registerCard.classList.add("hidden");
    newsCard.classList.remove("hidden");
    loadNews();
  }catch(e){ regMsg.textContent="Hata: "+(e?.message||e); regMsg.classList.add("error"); }
});

/* === LOGIN === */
btnLogin.addEventListener("click", async ()=>{
  logMsg.className="msg";
  const nick = clean(logNick.value);
  const pass = clean(logPass.value);
  if(!nick||!pass){ logMsg.textContent="Lütfen tüm alanları doldurun"; logMsg.classList.add("error"); return; }

  try{
    const ref = doc(db,"users",nick);
    const snap = await getDoc(ref);
    if(!snap.exists()){ logMsg.textContent="Kullanıcı bulunamadı"; logMsg.classList.add("error"); return; }
    if(snap.data().password!==pass){ logMsg.textContent="Şifre yanlış"; logMsg.classList.add("error"); return; }

    loginCard.classList.add("hidden");
    registerCard.classList.add("hidden");
    newsCard.classList.remove("hidden");
    loadNews();
    loadForum();
  }catch(e){ logMsg.textContent="Hata: "+(e?.message||e); logMsg.classList.add("error"); }
});

/* === LOAD NEWS === */
async function loadNews(){
  newsList.innerHTML="";
  try{
    const q = await getDocs(collection(db,"news"));
    if(q.empty){ newsList.innerHTML="<em>Henüz haber yok.</em>"; return; }
    q.forEach(d=>{
      const item = d.data();
      const el = document.createElement("div");
      el.className="news";
      el.innerHTML=`<h3>${escapeHTML(item.title||"Başlık")}</h3><p>${escapeHTML(item.content||"")}</p>`;
      newsList.appendChild(el);
    });
  }catch(e){ newsList.innerHTML=`<span class="msg error">Haberler yüklenemedi</span>`; }
}

/* === LOAD FORUM === */
async function loadForum(){
  forumList.innerHTML="";
  try{
    const q = query(collection(db,"forum"), orderBy("createdAt","asc"));
    const docsSnap = await getDocs(q);
    docsSnap.forEach(d=>{
      const data = d.data();
      const el = document.createElement("div");
      el.className="forumMessage";
      el.innerHTML=`<span>${escapeHTML(data.author)}:</span> ${escapeHTML(data.content)}`;
      forumList.appendChild(el);
    });
  }catch(e){ forumList.innerHTML="<span class='msg error'>Forum yüklenemedi</span>"; }
}

/* === SEND FORUM MESSAGE === */
sendForum.addEventListener("click", async ()=>{
  const msg = clean(forumMsg.value);
  if(!msg) return;
  try{
    await addDoc(collection(db,"forum"),{author: clean(logNick.value), content: msg, createdAt: Date.now()});
    forumMsg.value="";
    loadForum();
  }catch(e){ alert("Mesaj gönderilemedi: "+e.message); }
});

/* === ESCAPE HTML === */
function escapeHTML(str){ return String(str||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
