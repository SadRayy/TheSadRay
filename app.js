import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Firebase config
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

const agreeBox = document.getElementById("agreeBox");
const btnContinue = document.getElementById("btnContinue");
const welcomeText = document.getElementById("welcome");

const newsList = document.getElementById("newsList");

const nicknameKey = "sr_nickname";

// Form geçişleri
goLogin.addEventListener("click", () => { registerCard.classList.add("hidden"); loginCard.classList.remove("hidden"); });
goRegister.addEventListener("click", () => { loginCard.classList.add("hidden"); registerCard.classList.remove("hidden"); });

// Kayıt
btnRegister.addEventListener("click", async () => {
  const nick = (regNick.value || "").trim();
  const pass = (regPass.value || "").trim();
  if (!nick || !pass) return alert("Tüm alanları doldurun.");
  if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(nick)) return alert("Nickname 3-20 karakter olmalı.");
  const ref = doc(db, "users", nick);
  const snap = await getDoc(ref);
  if (snap.exists()) return alert("Bu kullanıcı zaten var!");
  await setDoc(ref, { password: pass, createdAt: Date.now() });
  localStorage.setItem(nicknameKey, nick);
  registerCard.classList.add("hidden");
  welcomeCard.classList.remove("hidden");
});

// Giriş
btnLogin.addEventListener("click", async () => {
  const nick = (logNick.value || "").trim();
  const pass = (logPass.value || "").trim();
  if (!nick || !pass) return alert("Tüm alanları doldurun.");
  const ref = doc(db, "users", nick);
  const snap = await getDoc(ref);
  if (!snap.exists()) return alert("Kullanıcı bulunamadı.");
  if (snap.data().password !== pass) return alert("Şifre yanlış.");
  localStorage.setItem(nicknameKey, nick);
  loginCard.classList.add("hidden");
  welcomeCard.classList.remove("hidden");
});

// Devam et butonu
btnContinue.addEventListener("click", () => {
  if (!agreeBox.checked) return alert("Kutucuğu işaretleyin!");
  welcomeCard.classList.add("hidden");
  newsCard.classList.remove("hidden");
  loadNews(localStorage.getItem(nicknameKey));
});

// Haberleri yükle
async function loadNews(nick){
  welcomeText.textContent = `Hoş geldin, ${nick}`;
  newsList.innerHTML = "";
  const query = await getDocs(collection(db, "news"));
  query.forEach(d => {
    const item = d.data();
    const el = document.createElement("div");
    el.className = "news";
    el.innerHTML = `<h3>${item.title}</h3><p>${item.content}</p>`;
    newsList.appendChild(el);
  });
}

// Sayfa açıldığında otomatik giriş (bilgilendirme kutusu göster)
const last = localStorage.getItem(nicknameKey);
if (last) {
  registerCard.classList.add("hidden");
  loginCard.classList.add("hidden");
  welcomeCard.classList.remove("hidden");
}
