import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* Firebase Ayarları */
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

// UI Elemanları
const registerCard = document.getElementById("registerCard");
const loginCard = document.getElementById("loginCard");
const newsCard = document.getElementById("newsCard");

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

const navbarItems = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".section");

const forumList = document.getElementById("forumList");
const forumInput = document.getElementById("forumInput");
const forumSend = document.getElementById("forumSend");

const nicknameKey = "sr_nickname";

// Form geçişleri
goLogin.addEventListener("click", () => { registerCard.classList.add("hidden"); loginCard.classList.remove("hidden"); regMsg.textContent=""; });
goRegister.addEventListener("click", () => { loginCard.classList.add("hidden"); registerCard.classList.remove("hidden"); logMsg.textContent=""; });

// Kayıt
btnRegister.addEventListener("click", async () => {
  regMsg.className = "msg"; 
  const nick = (regNick.value||"").trim();
  const pass = (regPass.value||"").trim();
  if(!nick || !pass){ regMsg.textContent="Lütfen tüm alanları doldurun."; regMsg.classList.add("error"); return; }
  if(!/^[a-zA-Z0-9_.-]{3,20}$/.test(nick)){ regMsg.textContent="Nickname 3-20 karakter (harf/rakam/._-) olmalı."; regMsg.classList.add("error"); return; }

  const ref = doc(db, "users", nick);
  const snap = await getDoc(ref);
  if(snap.exists()){ regMsg.textContent="Bu nickname zaten kullanılıyor."; regMsg.classList.add("error"); return; }

  await setDoc(ref, { password: pass, createdAt: Date.now() });
  localStorage.setItem(nicknameKey, nick);

  regMsg.textContent="Kayıt başarılı! Giriş yapılıyor...";
  regMsg.classList.add("ok");

  openNews(nick);
});

// Giriş
btnLogin.addEventListener("click", async () => {
  logMsg.className = "msg";
  const nick = (logNick.value||"").trim();
  const pass = (logPass.value||"").trim();
  if(!nick || !pass){ logMsg.textContent="Lütfen tüm alanları doldurun."; logMsg.classList.add("error"); return; }

  const ref = doc(db, "users", nick);
  const snap = await getDoc(ref);
  if(!snap.exists()){ logMsg.textContent="Kullanıcı bulunamadı."; logMsg.classList.add("error"); return; }
  const data = snap.data();
  if(data.password !== pass){ logMsg.textContent="Şifre yanlış."; logMsg.classList.add("error"); return; }

  localStorage.setItem(nicknameKey, nick);
  openNews(nick);
});

// Haber ve Forum ekranını aç
async function openNews(nick){
  registerCard.classList.add("hidden");
  loginCard.classList.add("hidden");
  newsCard.classList.remove("hidden");
  welcome.textContent=`Hoş geldin, ${nick}`;

  loadNews();
  loadForumRealtime();
}

// Navbar tıklamaları
navbarItems.forEach(item => {
  item.addEventListener("click", ()=>{
    const sec = item.getAttribute("data-section");
    sections.forEach(s=>s.classList.remove("active"));
    document.getElementById(sec+"Section").classList.add("active");
  });
});

// Firestore -> Haberleri çek
async function loadNews(){
  newsList.innerHTML="";
  try{
    const q = await collection(db,"news");
    const snap = await getDocs(q);
    if(snap.empty){ newsList.innerHTML="<em>Henüz haber yok.</em>"; return; }
    snap.forEach(d=>{
      const item = d.data();
      const el = document.createElement("div");
      el.className="news";
      el.innerHTML=`<h3>${item.title||"Başlık"}</h3><p>${item.content||""}</p>`;
      newsList.appendChild(el);
    });
  }catch(e){ newsList.innerHTML=`<span class="msg error">Haberler yüklenemedi: ${e?.message||e}</span>`; }
}

// Forum mesajları - gerçek zamanlı
function loadForumRealtime(){
  const forumCol = collection(db,"forum");
  onSnapshot(forumCol, (snapshot)=>{
    forumList.innerHTML="";
    if(snapshot.empty){ forumList.innerHTML="<em>Henüz mesaj yok.</em>"; return; }
    snapshot.forEach(d=>{
      const item = d.data();
      const el = document.createElement("div");
      el.className="forum-item";
      el.textContent = `${item.author}: ${item.content}`;
      forumList.appendChild(el);
    });
  });
}

// Forum gönder
forumSend.addEventListener("click", async ()=>{
  const nick = localStorage.getItem(nicknameKey);
  const msg = (forumInput.value||"").trim();
  if(!msg) return;
  await addDoc(collection(db,"forum"), { author: nick, content: msg, createdAt: Date.now() });
  forumInput.value="";
});

// Sayfa yenilenirse otomatik giriş yapılmasın
localStorage.removeItem(nicknameKey);
