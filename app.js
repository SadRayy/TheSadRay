import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* Firebase */
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

/* UI */
const registerCard = document.getElementById("registerCard");
const loginCard = document.getElementById("loginCard");
const newsCard = document.getElementById("newsCard");
const forumSection = document.getElementById("forumSection");
const home = document.getElementById("home");

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
const btnForum = document.getElementById("btnForum");

/* Navbar */
const navItems = document.querySelectorAll(".navItem");
navItems.forEach(item => {
  item.addEventListener("click", () => {
    const sectionId = item.dataset.section;
    [home, newsCard, forumSection].forEach(s => s.classList.add("hidden"));
    if(sectionId==="home") home.classList.remove("hidden");
    if(sectionId==="newsSection") newsCard.classList.remove("hidden");
    if(sectionId==="forumSection") forumSection.classList.remove("hidden");
  });
});

/* Form geçişleri */
goLogin.addEventListener("click", ()=>{ registerCard.classList.add("hidden"); loginCard.classList.remove("hidden"); regMsg.textContent=""; });
goRegister.addEventListener("click", ()=>{ loginCard.classList.add("hidden"); registerCard.classList.remove("hidden"); logMsg.textContent=""; });

/* Kayıt */
btnRegister.addEventListener("click", async ()=>{
  const nick = regNick.value.trim();
  const pass = regPass.value.trim();
  if(!nick||!pass){ regMsg.textContent="Lütfen tüm alanları doldurun"; regMsg.classList.add("error"); return; }

  try{
    const ref = doc(db,"users",nick);
    const snap = await getDocs(collection(db,"users"));
    await setDoc(ref,{password:pass, createdAt:Date.now()});
    openNews(nick);
  }catch(e){ regMsg.textContent="Hata: "+e.message; regMsg.classList.add("error"); }
});

/* Giriş */
btnLogin.addEventListener("click", async ()=>{
  const nick = logNick.value.trim();
  const pass = logPass.value.trim();
  if(!nick||!pass){ logMsg.textContent="Lütfen tüm alanları doldurun"; logMsg.classList.add("error"); return; }
  try{
    const ref = doc(db,"users",nick);
    const snap = await getDocs(collection(db,"users"));
    openNews(nick);
  }catch(e){ logMsg.textContent="Hata: "+e.message; logMsg.classList.add("error"); }
});

/* Haber ekranını aç */
async function openNews(nick){
  registerCard.classList.add("hidden");
  loginCard.classList.add("hidden");
  newsCard.classList.remove("hidden");
  home.classList.remove("hidden");
  welcome.textContent = nick;
  await loadNews();
}

/* Haberleri çek */
async function loadNews(){
  newsList.innerHTML="";
  try{
    const q = await getDocs(collection(db,"news"));
    q.forEach(d=>{
      const item = d.data();
      const el = document.createElement("div");
      el.innerHTML=`<h3>${item.title||"Başlık"}</h3><p>${item.content||""}</p>`;
      newsList.appendChild(el);
    });
  }catch(e){ newsList.innerHTML="Haberler yüklenemedi: "+e.message; }
}

/* Forum */
btnForum.addEventListener("click", async ()=>{
  const msg = forumInput.value.trim();
  if(!msg) return;
  await addDoc(collection(db,"forum"), {author: welcome.textContent, content: msg, createdAt: Date.now()});
  forumInput.value="";
  loadForum();
});

async function loadForum(){
  forumList.innerHTML="";
  const q = await getDocs(collection(db,"forum"));
  q.forEach(d=>{
    const item = d.data();
    const el = document.createElement("div");
    el.innerHTML=`<b>${item.author}:</b> ${item.content}`;
    forumList.appendChild(el);
  });
}
