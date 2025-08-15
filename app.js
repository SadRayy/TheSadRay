import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

const logNick = document.getElementById("logNick");
const logPass = document.getElementById("logPass");
const btnLogin = document.getElementById("btnLogin");

const goLogin = document.getElementById("goLogin");
const goRegister = document.getElementById("goRegister");

const welcome = document.getElementById("welcome");
const newsList = document.getElementById("newsList");

const forumList = document.getElementById("forumList");
const forumMsg = document.getElementById("forumMsg");
const btnForum = document.getElementById("btnForum");

const nicknameKey = "sr_nickname";

// Form geçişleri
goLogin.addEventListener("click", ()=>{ registerCard.classList.add("hidden"); loginCard.classList.remove("hidden"); });
goRegister.addEventListener("click", ()=>{ loginCard.classList.add("hidden"); registerCard.classList.remove("hidden"); });

// Kayıt
btnRegister.addEventListener("click", async ()=>{
    const nick = (regNick.value||"").trim();
    const pass = (regPass.value||"").trim();
    if(!nick||!pass){ alert("Lütfen tüm alanları doldurun"); return; }
    try{
        const ref = doc(db,"users",nick);
        const snap = await getDoc(ref);
        if(snap.exists()){ alert("Bu kullanıcı zaten var"); return; }
        await setDoc(ref,{password:pass, createdAt: Date.now()});
        localStorage.setItem(nicknameKey,nick);
        openNews(nick);
    }catch(e){ alert("Hata: "+e.message); }
});

// Giriş
btnLogin.addEventListener("click", async ()=>{
    const nick = (logNick.value||"").trim();
    const pass = (logPass.value||"").trim();
    if(!nick||!pass){ alert("Lütfen tüm alanları doldurun"); return; }
    try{
        const ref = doc(db,"users",nick);
        const snap = await getDoc(ref);
        if(!snap.exists()){ alert("Kullanıcı bulunamadı"); return; }
        if(snap.data().password!==pass){ alert("Şifre yanlış"); return; }
        localStorage.setItem(nicknameKey,nick);
        openNews(nick);
    }catch(e){ alert("Hata: "+e.message); }
});

// Haber & forum aç
async function openNews(nick){
    registerCard.classList.add("hidden");
    loginCard.classList.add("hidden");
    newsCard.classList.remove("hidden");
    welcome.textContent = `Hoş geldin, ${nick}`;
    await loadNews();
    await loadForum();
}

// Navbar tıklama
document.querySelectorAll(".nav-item").forEach(el=>{
    el.addEventListener("click",()=>{
        const target = el.dataset.target;
        document.querySelectorAll("section").forEach(s=>s.style.display="none");
        document.getElementById(target).style.display="block";
    });
});

// Haberleri çek
async function loadNews(){
    newsList.innerHTML="";
    const q = await getDocs(collection(db,"news"));
    if(q.empty){ newsList.innerHTML="<em>Henüz haber yok.</em>"; return; }
    q.forEach(d=>{
        const item = d.data();
        const el = document.createElement("div");
        el.className="news";
        el.innerHTML=`<h4>${item.title||"Başlık"}</h4><p>${item.content||""}</p>`;
        newsList.appendChild(el);
    });
}

// Forum yükle
async function loadForum(){
    forumList.innerHTML="";
    const q = await getDocs(collection(db,"forum"));
    if(q.empty){ forumList.innerHTML="<em>Henüz mesaj yok.</em>"; return; }
    q.forEach(d=>{
        const item = d.data();
        const el = document.createElement("div");
        el.className="forum-item";
        el.textContent=`${item.author}: ${item.content}`;
        forumList.appendChild(el);
    });
}

// Forum mesaj gönder
btnForum.addEventListener("click", async ()=>{
    const nick = localStorage.getItem(nicknameKey);
    const content = (forumMsg.value||"").trim();
    if(!content){ alert("Mesaj boş olamaz"); return; }
    await addDoc(collection(db,"forum"),{
        author: nick,
        content: content,
        createdAt: Date.now()
    });
    forumMsg.value="";
    await loadForum();
});

// Sayfa yenilenince otomatik giriş kapalı
