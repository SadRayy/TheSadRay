import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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
const newsCard = document.getElementById("newsCard");
const infoCard = document.getElementById("infoCard");

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
const newsList = document.getElementById("newsList");
const welcome = document.getElementById("welcome");

const infoAcceptBtn = document.getElementById("infoAccept");
const infoCheck = document.getElementById("infoCheck");

const clean = (s)=> (s||"").trim();
const nicknameKey = "sr_nickname";

// Form geçişleri
goLogin.addEventListener("click", ()=>{
  registerCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
  regMsg.textContent = "";
});
goRegister.addEventListener("click", ()=>{
  loginCard.classList.add("hidden");
  registerCard.classList.remove("hidden");
  logMsg.textContent = "";
});

// KAYIT
btnRegister.addEventListener("click", async ()=>{
  regMsg.className = "msg";
  const nick = clean(regNick.value);
  const pass = clean(regPass.value);

  if(!nick||!pass){ regMsg.textContent="Lütfen tüm alanları doldurun."; regMsg.classList.add("error"); return; }
  if(!/^[a-zA-Z0-9_.-]{3,20}$/.test(nick)){ regMsg.textContent="Nickname 3-20 karakter olmalı."; regMsg.classList.add("error"); return; }

  try{
    const ref = doc(db,"users",nick);
    const snap = await getDoc(ref);
    if(snap.exists()){ regMsg.textContent="Bu nickname kullanılıyor."; regMsg.classList.add("error"); return; }
    await setDoc(ref,{password:pass,createdAt:Date.now()});
    localStorage.setItem(nicknameKey,nick);
    regMsg.textContent="Kayıt başarılı! Bilgilendirmeyi okuyup onaylayın."; regMsg.classList.add("ok");

    registerCard.classList.add("hidden");
    infoCard.classList.remove("hidden");

  }catch(e){ regMsg.textContent="Hata: "+(e?.message||e); regMsg.classList.add("error"); }
});

// Bilgilendirme onayı
infoAcceptBtn.addEventListener("click", ()=>{
  if(!infoCheck.checked){ alert("Onay kutusunu işaretleyin!"); return; }
  const nick = localStorage.getItem(nicknameKey);
  infoCard.classList.add("hidden");
  openNews(nick);
});

// GİRİŞ
btnLogin.addEventListener("click", async ()=>{
  logMsg.className="msg";
  const nick = clean(logNick.value);
  const pass = clean(logPass.value);

  if(!nick||!pass){ logMsg.textContent="Lütfen tüm alanları doldurun."; logMsg.classList.add("error"); return; }

  try{
    const ref = doc(db,"users",nick);
    const snap = await getDoc(ref);
    if(!snap.exists()){ logMsg.textContent="Kullanıcı bulunamadı."; logMsg.classList.add("error"); return; }
    const data = snap.data();
    if(data.password!==pass){ logMsg.textContent="Şifre yanlış."; logMsg.classList.add("error"); return; }
    localStorage.setItem(nicknameKey,nick);
    openNews(nick);
  }catch(e){ logMsg.textContent="Hata: "+(e?.message||e); logMsg.classList.add("error"); }
});

// Haber ekranını aç
async function openNews(nick){
  registerCard.classList.add("hidden");
  loginCard.classList.add("hidden");
  infoCard.classList.add("hidden");
  newsCard.classList.remove("hidden");
  welcome.textContent=`Hoş geldin, ${nick}`;
  await loadNews();
}

// Haberleri çek
async function loadNews(){
  newsList.innerHTML="";
  try{
    const q = await getDocs(collection(db,"news"));
    if(q.empty){ newsList.innerHTML="<div class='news'><em>Henüz haber yok.</em></div>"; return; }
    q.forEach(d=>{
      const item=d.data();
      const el=document.createElement("div");
      el.className="news";
      el.innerHTML=`<h3>${escapeHTML(item.title||"Başlık")}</h3><p>${escapeHTML(item.content||"")}</p>`;
      newsList.appendChild(el);
    });
  }catch(e){ newsList.innerHTML=`<div class='news'><span class='msg error'>Haberler yüklenemedi: ${e?.message||e}</span></div>`; }
}

function escapeHTML(str){ return String(str||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m])); }
