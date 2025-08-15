import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* Firebase Konfigürasyonu */
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

// UI elemanları
const registerCard = document.getElementById("registerCard");
const loginCard = document.getElementById("loginCard");
const welcomeCard = document.getElementById("welcomeCard");
const newsCard = document.getElementById("newsCard");

const regNick = document.getElementById("regNick");
const regPass = document.getElementById("regPass");
const btnRegister = document.getElementById("btnRegister");
const logNick = document.getElementById("logNick");
const logPass = document.getElementById("logPass");
const btnLogin = document.getElementById("btnLogin");

const goLogin = document.getElementById("goLogin");
const goRegister = document.getElementById("goRegister");

const newsList = document.getElementById("newsList");
const welcome = document.getElementById("welcome");

const acceptRules = document.getElementById("acceptRules");
const btnContinue = document.getElementById("btnContinue");

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
  const nick = (regNick.value || "").trim();
  const pass = (regPass.value || "").trim();

  if(!nick || !pass) return alert("Lütfen tüm alanları doldurun.");
  if(!/^[a-zA-Z0-9_.-]{3,20}$/.test(nick)) return alert("Nickname 3-20 karakter olmalı.");

  try {
    const ref = doc(db,"users",nick);
    const snap = await getDoc(ref);
    if(snap.exists()) return alert("Bu nickname zaten kullanılıyor.");

    await setDoc(ref, { password: pass, createdAt: Date.now() });
    registerCard.classList.add("hidden");
    welcomeCard.classList.remove("hidden");
  } catch(e){ alert("Hata: "+e.message); }
});

// Giriş
btnLogin.addEventListener("click", async () => {
  const nick = (logNick.value || "").trim();
  const pass = (logPass.value || "").trim();
  if(!nick || !pass) return alert("Lütfen tüm alanları doldurun.");

  try {
    const ref = doc(db,"users",nick);
    const snap = await getDoc(ref);
    if(!snap.exists()) return alert("Kullanıcı bulunamadı.");
    if(snap.data().password !== pass) return alert("Şifre yanlış.");

    loginCard.classList.add("hidden");
    welcomeCard.classList.remove("hidden");
  } catch(e){ alert("Hata: "+e.message); }
});

// Devam Et butonu
btnContinue.addEventListener("click", async () => {
  if(!acceptRules.checked) return alert("Kuralları kabul etmelisiniz.");
  welcomeCard.classList.add("hidden");
  newsCard.classList.remove("hidden");
  const nick = regNick.value.trim() || logNick.value.trim();
  welcome.textContent = `Hoş geldin, ${nick}`;
  await loadNews();
});

// Haberleri yükle
async function loadNews(){
  newsList.innerHTML = "";
  try{
    const q = await getDocs(collection(db,"news"));
    if(q.empty) newsList.innerHTML = `<div class="news"><em>Henüz haber yok.</em></div>`;
    else q.forEach(d=>{
      const item = d.data();
      const el = document.createElement("div");
      el.className="news";
      el.innerHTML=`<h3>${item.title||"Başlık"}</h3><p>${item.content||""}</p>`;
      newsList.appendChild(el);
    });
  }catch(e){ newsList.innerHTML = `<div class="news error">Haberler yüklenemedi: ${e.message}</div>`; }
}
