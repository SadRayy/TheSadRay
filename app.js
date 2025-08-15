import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Firebase ayarları
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

// Elemanlar
const registerCard = document.getElementById("registerCard");
const loginCard    = document.getElementById("loginCard");
const welcomeCard  = document.getElementById("welcomeCard");
const mainUI       = document.getElementById("mainUI");

const regNick = document.getElementById("regNick");
const regPass = document.getElementById("regPass");
const btnRegister = document.getElementById("btnRegister");

const logNick = document.getElementById("logNick");
const logPass = document.getElementById("logPass");
const btnLogin = document.getElementById("btnLogin");

const goLogin = document.getElementById("goLogin");
const goRegister = document.getElementById("goRegister");

const btnContinue = document.getElementById("btnContinue");
const welcome = document.getElementById("welcome");
const newsList = document.getElementById("newsList");

const navItems = document.querySelectorAll("nav#navbar li");
const sections = document.querySelectorAll(".section");

// Form geçişleri
goLogin.addEventListener("click", () => {
  registerCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
});

goRegister.addEventListener("click", () => {
  loginCard.classList.add("hidden");
  registerCard.classList.remove("hidden");
});

// Kayıt
btnRegister.addEventListener("click", async () => {
  const nick = (regNick.value||"").trim();
  const pass = (regPass.value||"").trim();
  if(!nick || !pass){ alert("Tüm alanları doldurun."); return; }
  if(!/^[a-zA-Z0-9_.-]{3,20}$/.test(nick)){ alert("Nickname 3-20 karakter olmalı."); return; }

  const ref = doc(db,"users",nick);
  const snap = await getDoc(ref);
  if(snap.exists()){ alert("Bu nickname zaten kullanılıyor."); return; }

  await setDoc(ref, {password: pass, createdAt: Date.now()});
  registerCard.classList.add("hidden");
  welcomeCard.classList.remove("hidden");
});

// Devam Et butonu
btnContinue.addEventListener("click", async ()=>{
  const nick = (regNick.value||"").trim();
  welcomeCard.classList.add("hidden");
  mainUI.classList.remove("hidden");
  welcome.textContent = `Hoş geldin, ${nick}`;
  showSection("home");
  await loadNews();
});

// Giriş
btnLogin.addEventListener("click", async () => {
  const nick = (logNick.value||"").trim();
  const pass = (logPass.value||"").trim();
  if(!nick || !pass){ alert("Tüm alanları doldurun."); return; }

  const ref = doc(db,"users",nick);
  const snap = await getDoc(ref);
  if(!snap.exists()){ alert("Kullanıcı bulunamadı."); return; }
  if(snap.data().password!==pass){ alert("Şifre yanlış."); return; }

  loginCard.classList.add("hidden");
  mainUI.classList.remove("hidden");
  welcome.textContent = `Hoş geldin, ${nick}`;
  showSection("home");
  await loadNews();
});

// Haberleri yükle
async function loadNews(){
  newsList.innerHTML = "";
  const q = await getDocs(collection(db,"news"));
  if(q.empty){ newsList.innerHTML="<div class='news'><em>Henüz haber yok.</em></div>"; return; }
  q.forEach(d=>{
    const item = d.data();
    const el = document.createElement("div");
    el.className="news";
    el.innerHTML=`<h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.content)}</p>`;
    newsList.appendChild(el);
  });
}

// Bölge geçişi
navItems.forEach(item=>{
  item.addEventListener("click",()=>showSection(item.dataset.section));
});

function showSection(id){
  sections.forEach(s=>s.classList.remove("active"));
  const el = document.getElementById(id);
  if(el) el.classList.add("active");
}

function escapeHTML(str){ return String(str||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
