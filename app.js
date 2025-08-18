import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyALAEYsysXJy0mnNmJvD5H0wOqXjp4Oohc",
  authDomain: "sadrayy-site.firebaseapp.com",
  projectId: "sadrayy-site",
  storageBucket: "sadrayy-site.firebasestorage.app",
  messagingSenderId: "302147777701",
  appId: "1:302147777701:web:d701293a09ab61d85f894c",
  measurementId: "G-C9HVQ0XXBJ"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* UI Elements */
const registerCard = document.getElementById("registerCard");
const loginCard = document.getElementById("loginCard");
const newsCard = document.getElementById("newsCard");
const forumCard = document.getElementById("forumCard");

const regNick = document.getElementById("regNick");
const regPass = document.getElementById("regPass");
const btnRegister = document.getElementById("btnRegister");
const regMsg = document.getElementById("regMsg");

const logNick = document.getElementById("logNick");
const logPass = document.getElementById("logPass");
const btnLogin = document.getElementById("btnLogin");
const logMsg = document.getElementById("logMsg");

const goLogin = document.getElementById("goLogin");
const goRegister = document.getElementById("goRegister");
const welcome = document.getElementById("welcome");

const newsList = document.getElementById("newsList");
const forumList = document.getElementById("forumList");
const forumInput = document.getElementById("forumInput");
const btnForumSend = document.getElementById("btnForumSend");

/* Navbar */
const navItems = document.querySelectorAll(".navItem");
const sections = document.querySelectorAll(".section");
navItems.forEach(item=>{
  item.addEventListener("click",()=>{
    sections.forEach(s=>s.classList.add("hidden"));
    const sec = document.getElementById(item.dataset.section);
    if(sec) sec.classList.remove("hidden");
  });
});

/* Helper */
const clean=s=> (s||"").trim();

/* Form toggles */
goLogin.addEventListener("click", ()=>{
  registerCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
  regMsg.textContent="";
});
goRegister.addEventListener("click", ()=>{
  loginCard.classList.add("hidden");
  registerCard.classList.remove("hidden");
  logMsg.textContent="";
});

/* Register */
btnRegister.addEventListener("click", async ()=>{
  regMsg.className="msg";
  const nick = clean(regNick.value);
  const pass = clean(regPass.value);
  if(!nick||!pass){ regMsg.textContent="Tüm alanları doldurun"; return; }

  try{
    const ref = doc(db,"users",nick);
    const snap = await getDoc(ref);
    if(snap.exists()){ regMsg.textContent="Bu nickname kullanılıyor"; return; }
    await setDoc(ref,{password:pass, createdAt:Date.now()});
    openNews(nick);
  }catch(e){ regMsg.textContent="Hata: "+e?.message||e; }
});

/* Login */
btnLogin.addEventListener("click", async ()=>{
  logMsg.className="msg";
  const nick = clean(logNick.value);
  const pass = clean(logPass.value);
  if(!nick||!pass){ logMsg.textContent="Tüm alanları doldurun"; return; }

  try{
    const ref = doc(db,"users",nick);
    const snap = await getDoc(ref);
    if(!snap.exists()){ logMsg.textContent="Kullanıcı bulunamadı"; return; }
    if(snap.data().password!==pass){ logMsg.textContent="Şifre yanlış"; return; }
    openNews(nick);
  }catch(e){ logMsg.textContent="Hata: "+e?.message||e; }
});

/* Open main */
async function openNews(nick){
  registerCard.classList.add("hidden");
  loginCard.classList.add("hidden");
  newsCard.classList.remove("hidden");
  sections.forEach(s=>s.classList.add("hidden"));
  document.getElementById("home")?.classList.remove("hidden");
  welcome.textContent = nick;
  await loadNews();
  await loadForum();
}

/* Load News */
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
  }catch(e){ newsList.innerHTML="<span class='msg error'>Haberler yüklenemedi</span>"; }
}

/* Load Forum */
async function loadForum(){
  forumList.innerHTML="";
  try{
    const q = query(collection(db,"forum"), orderBy("createdAt","asc"));
    const snap = await getDocs(q);
    if(snap.empty){ forumList.innerHTML="<em>Henüz mesaj yok.</em>"; return; }
    snap.forEach(d=>{
      const item = d.data();
      const el = document.createElement("div");
      el.className="news";
      el.innerHTML=`<strong>${escapeHTML(item.author)}</strong>: ${escapeHTML(item.content)}`;
      forumList.appendChild(el);
    });
  }catch(e){ forumList.innerHTML="<span class='msg error'>Forum yüklenemedi</span>"; }
}

/* Send forum */
btnForumSend.addEventListener("click", async ()=>{
  const content = clean(forumInput.value);
  if(!content) return;
  const author = welcome.textContent || "Anonim";
  try{
    await addDoc(collection(db,"forum"),{author, content, createdAt:Date.now()});
    forumInput.value="";
    await loadForum();
  }catch(e){ alert("Mesaj gönderilemedi"); }
});

function escapeHTML(str){ return String(str||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
