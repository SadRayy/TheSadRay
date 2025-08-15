import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

const newsList = document.getElementById("newsList");
const welcome = document.getElementById("welcome");

const forumInput = document.getElementById("forumInput");
const sendMsg = document.getElementById("sendMsg");
const forumMessages = document.getElementById("forumMessages");

const nicknameKey = "sr_nickname";

// Form geçişleri
goLogin.addEventListener("click", () => {
  registerCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
  regMsg.textContent = "";
});

goRegister.addEventListener("click", () => {
  loginCard.classList.add("hidden");
  registerCard.classList.remove("hidden");
  logMsg.textContent = "";
});

// Yardımcı
const clean = s => (s||"").trim();

// Kayıt
btnRegister.addEventListener("click", async ()=>{
  const nick = clean(regNick.value);
  const pass = clean(regPass.value);
  regMsg.className="msg";
  if(!nick||!pass){ regMsg.textContent="Tüm alanları doldurun"; regMsg.classList.add("error"); return; }
  if(!/^[a-zA-Z0-9_.-]{3,20}$/.test(nick)){ regMsg.textContent="Nickname 3-20 karakter olmalı"; regMsg.classList.add("error"); return; }

  try{
    const ref = doc(db,"users",nick);
    if((await getDoc(ref)).exists()){ regMsg.textContent="Bu nickname kullanılıyor"; regMsg.classList.add("error"); return; }
    await setDoc(ref,{password:pass,createdAt:Date.now()});
    localStorage.setItem(nicknameKey,nick);
    openNews(nick);
  }catch(e){ regMsg.textContent="Hata: "+(e?.message||e); regMsg.classList.add("error"); }
});

// Giriş
btnLogin.addEventListener("click", async ()=>{
  const nick = clean(logNick.value);
  const pass = clean(logPass.value);
  logMsg.className="msg";
  if(!nick||!pass){ logMsg.textContent="Tüm alanları doldurun"; logMsg.classList.add("error"); return; }
  try{
    const ref = doc(db,"users",nick);
    const snap = await getDoc(ref);
    if(!snap.exists()){ logMsg.textContent="Kullanıcı bulunamadı"; logMsg.classList.add("error"); return; }
    if(snap.data().password!==pass){ logMsg.textContent="Şifre yanlış"; logMsg.classList.add("error"); return; }
    localStorage.setItem(nicknameKey,nick);
    openNews(nick);
  }catch(e){ logMsg.textContent="Hata: "+(e?.message||e); logMsg.classList.add("error"); }
});

// Haber ekranını aç
async function openNews(nick){
  registerCard.classList.add("hidden");
  loginCard.classList.add("hidden");
  newsCard.classList.remove("hidden");
  welcome.textContent=`Hoş geldin, ${nick}`;
  await loadNews();
  loadForum();
}

// Haberleri çek
async function loadNews(){
  newsList.innerHTML="";
  const q = collection(db,"news");
  (await getDocs(q)).forEach(d=>{
    const item = d.data();
    const el = document.createElement("div");
    el.className="news";
    el.innerHTML=`<h3>${item.title||"Başlık"}</h3><p>${item.content||""}</p>`;
    newsList.appendChild(el);
  });
}

// Forum
function loadForum(){
  const q = query(collection(db,"forum"),orderBy("createdAt","asc"));
  onSnapshot(q,snap=>{
    forumMessages.innerHTML="";
    snap.forEach(d=>{
      const data=d.data();
      const el = document.createElement("div");
      el.className="message";
      el.textContent=`${data.author}: ${data.text}`;
      forumMessages.appendChild(el);
    });
  });
}

// Forum mesaj gönder
sendMsg.addEventListener("click", async ()=>{
  const text = clean(forumInput.value);
  const author = localStorage.getItem(nicknameKey);
  if(!text||!author) return;
  await addDoc(collection(db,"forum"),{author,text,createdAt:Date.now()});
  forumInput.value="";
});
