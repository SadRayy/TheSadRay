import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* Firebase */
const firebaseConfig = {
  apiKey: "AIzaSyALAEYsysXJy0mnNmJvD5H0wOqXjp4Oohc",
  authDomain: "sadrayy-site.firebaseapp.com",
  projectId: "sadrayy-site",
  storageBucket: "sadrayy-site.appspot.com",
  messagingSenderId: "302147777701",
  appId: "1:302147777701:web:d701293a09ab61d85f894c",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* UI */
const registerCard = document.getElementById("registerCard");
const loginCard = document.getElementById("loginCard");
const authContainer = document.getElementById("authContainer");
const newsList = document.getElementById("newsList");
const welcome = document.getElementById("welcome");

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

const navItems = document.querySelectorAll(".navItem");
const sections = document.querySelectorAll(".section");

navItems.forEach(item => {
  item.addEventListener("click", () => {
    sections.forEach(s => s.classList.add("hidden"));
    const sec = document.getElementById(item.dataset.section);
    if(sec) sec.classList.remove("hidden");
  });
});

/* Yardımcı */
const clean = s => (s||"").trim();
const nicknameKey = "sr_nickname";

/* Form geçişleri */
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

/* Kayıt */
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
    localStorage.setItem(nicknameKey,nick);
    openHome(nick);
  }catch(e){ regMsg.textContent="Hata: "+(e?.message||e); regMsg.classList.add("error"); }
});

/* Giriş */
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

    localStorage.setItem(nicknameKey,nick);
    openHome(nick);
  }catch(e){ logMsg.textContent="Hata: "+(e?.message||e); logMsg.classList.add("error"); }
});

/* Ana pencere aç */
async function openHome(nick){
  authContainer.classList.add("hidden");
  sections.forEach(s => s.classList.add("hidden"));
  document.getElementById("home").classList.remove("hidden");
  welcome.textContent=nick;
  await loadNews();
}

/* Duyuruları çek */
async function loadNews(){
  newsList.innerHTML="";
  try{
    const q = await getDocs(collection(db,"news"));
    if(q.empty){ newsList.innerHTML=`<div class="news"><em>Henüz duyuru yok.</em></div>`; return; }
    q.forEach(d=>{
      const item = d.data();
      const el = document.createElement("div");
      el.className="news";
      el.innerHTML=`<h3>${escapeHTML(item.title||"Başlık")}</h3><p>${escapeHTML(item.content||"")}</p>`;
      newsList.appendChild(el);
    });
  }catch(e){ newsList.innerHTML=`<div class="news"><span class="msg error">Duyurular yüklenemedi: ${e?.message||e}</span></div>`;}
}

function escapeHTML(str){ return String(str||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
