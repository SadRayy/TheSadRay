import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* Firebase */
const firebaseConfig = {
    apiKey: "YENI_API_KEY",
    authDomain: "sadrayy-site.firebaseapp.com",
    projectId: "sadrayy-site",
    storageBucket: "sadrayy-site.appspot.com",
    messagingSenderId: "302147777701",
    appId: "1:302147777701:web:d701293a09ab61d85f894c"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* UI ELEMENTLERİ */
const authContainer = document.getElementById("authContainer");
const registerCard = document.getElementById("registerCard");
const loginCard = document.getElementById("loginCard");
const navbar = document.getElementById("navbar");

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

const newsList = document.getElementById("newsList");
const duyuruList = document.getElementById("duyuruList");

const forumMessages = document.getElementById("forumMessages");
const forumInput = document.getElementById("forumInput");
const sendForum = document.getElementById("sendForum");

const nicknameKey = "sr_nickname";

/* FORM GEÇİŞLERİ */
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

/* NAVBAR BUTONLARI */
navItems.forEach(item=>{
    item.addEventListener("click", ()=>{
        sections.forEach(s=>s.classList.add("hidden"));
        const sec = document.getElementById(item.dataset.section);
        if(sec) sec.classList.remove("hidden");
    });
});

/* KAYIT */
btnRegister.addEventListener("click", async ()=>{
    regMsg.className="msg";
    const nick = (regNick.value||"").trim();
    const pass = (regPass.value||"").trim();
    if(!nick || !pass){ regMsg.textContent="Lütfen tüm alanları doldurun"; return;}
    try{
        const ref = doc(db,"users",nick);
        const snap = await getDoc(ref);
        if(snap.exists()){ regMsg.textContent="Bu kullanıcı mevcut"; return;}
        await setDoc(ref,{password:pass, createdAt:Date.now()});
        localStorage.setItem(nicknameKey,nick);
        openSite();
    }catch(e){ regMsg.textContent=e.message; }
});

/* GİRİŞ */
btnLogin.addEventListener("click", async ()=>{
    logMsg.className="msg";
    const nick = (logNick.value||"").trim();
    const pass = (logPass.value||"").trim();
    if(!nick || !pass){ logMsg.textContent="Lütfen tüm alanları doldurun"; return;}
    try{
        const ref = doc(db,"users",nick);
        const snap = await getDoc(ref);
        if(!snap.exists()){ logMsg.textContent="Kullanıcı bulunamadı"; return;}
        if(snap.data().password!==pass){ logMsg.textContent="Şifre yanlış"; return;}
        localStorage.setItem(nicknameKey,nick);
        openSite();
    }catch(e){ logMsg.textContent=e.message; }
});

/* SITE AÇ */
async function openSite(){
    authContainer.classList.add("hidden");
    navbar.classList.remove("hidden");
    sections.forEach(s=>s.classList.add("hidden"));
    document.getElementById("home").classList.remove("hidden");
    await loadNews();
    await loadDuyurular();
    await loadForum();
}

/* NEWS */
async function loadNews(){
    newsList.innerHTML="";
    try{
        const q = await getDocs(collection(db,"news"));
        if(q.empty){ newsList.innerHTML="<em>Henüz haber yok.</em>"; return;}
        q.forEach(d=>{
            const data = d.data();
            const el = document.createElement("div");
            el.innerHTML=`<h3>${data.title||""}</h3><p>${data.content||""}</p>`;
            newsList.appendChild(el);
        });
    }catch(e){ newsList.innerHTML=e.message; }
}

/* DUYURULAR */
async function loadDuyurular(){
    duyuruList.innerHTML="";
    try{
        const q = await getDocs(collection(db,"duyurular"));
        if(q.empty){ duyuruList.innerHTML="<em>Henüz duyuru yok.</em>"; return;}
        q.forEach(d=>{
            const data = d.data();
            const el = document.createElement("div");
            el.innerHTML=`<p>${data.content||""}</p>`;
            duyuruList.appendChild(el);
        });
    }catch(e){ duyuruList.innerHTML=e.message; }
}

/* FORUM */
async function loadForum(){
    forumMessages.innerHTML="";
    try{
        const q = query(collection(db,"forum"), orderBy("createdAt"));
        const snap = await getDocs(q);
        if(snap.empty){ forumMessages.innerHTML="<em>Henüz mesaj yok.</em>"; return;}
        snap.forEach(d=>{
            const data = d.data();
            const el = document.createElement("div");
            el.innerHTML=`<b>${data.author}</b>: ${data.content}`;
            forumMessages.appendChild(el);
        });
    }catch(e){ forumMessages.innerHTML=e.message; }
}

sendForum.addEventListener("click", async ()=>{
    const msg = forumInput.value.trim();
    const author = localStorage.getItem(nicknameKey);
    if(!msg || !author) return;
    await addDoc(collection(db,"forum"),{author, content:msg, createdAt:Date.now()});
    forumInput.value="";
    await loadForum();
});
