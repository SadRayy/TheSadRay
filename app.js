import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyALAEYsysXJy0mnNmJvD5H0wOqXjp4Oohc",
  authDomain: "sadrayy-site.firebaseapp.com",
  projectId: "sadrayy-site",
  storageBucket: "sadrayy-site.firebasestorage.app",
  messagingSenderId: "1:302147777701:web:d701293a09ab61d85f894c",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elemanları
const registerCard = document.getElementById("registerCard");
const loginCard = document.getElementById("loginCard");
const newsCard = document.getElementById("newsCard");
const btnRegister = document.getElementById("btnRegister");
const btnLogin = document.getElementById("btnLogin");
const goLogin = document.getElementById("goLogin");
const goRegister = document.getElementById("goRegister");
const welcome = document.getElementById("welcome");

// Form değişimleri
goLogin.addEventListener("click", ()=> { registerCard.classList.add("hidden"); loginCard.classList.remove("hidden"); });
goRegister.addEventListener("click", ()=> { loginCard.classList.add("hidden"); registerCard.classList.remove("hidden"); });

// Kayıt
btnRegister.addEventListener("click", async ()=>{
  const nick = document.getElementById("regNick").value;
  const pass = document.getElementById("regPass").value;
  if(!nick || !pass) return alert("Tüm alanları doldurun");
  try {
    await createUserWithEmailAndPassword(auth, nick+"@mail.com", pass);
    alert("Kayıt başarılı!");
    loginCard.classList.remove("hidden");
    registerCard.classList.add("hidden");
  } catch(e){ alert(e.message); }
});

// Giriş
btnLogin.addEventListener("click", async ()=>{
  const nick = document.getElementById("logNick").value;
  const pass = document.getElementById("logPass").value;
  if(!nick || !pass) return alert("Tüm alanları doldurun");
  try{
    await signInWithEmailAndPassword(auth, nick+"@mail.com", pass);
    registerCard.classList.add("hidden");
    loginCard.classList.add("hidden");
    newsCard.classList.remove("hidden");
    welcome.textContent = nick;
    loadForumMessages();
  }catch(e){ alert(e.message); }
});

// Navbar
document.querySelectorAll(".navItem").forEach(nav=>{
  nav.addEventListener("click", ()=>{
    document.querySelectorAll(".section").forEach(sec=>sec.classList.add("hidden"));
    const section = document.getElementById(nav.dataset.section);
    section.classList.remove("hidden");
  });
});

// Forum input
const forumDiv = document.getElementById("forumMessages");
const forumInput = document.createElement("input");
forumInput.id = "forumInput";
forumInput.placeholder = "Mesaj yaz...";
const forumBtn = document.createElement("button");
forumBtn.id = "forumSend";
forumBtn.textContent = "Gönder";
forumDiv.parentNode.appendChild(forumInput);
forumDiv.parentNode.appendChild(forumBtn);

forumBtn.addEventListener("click", async ()=>{
  const user = auth.currentUser;
  if(!user) return alert("Önce giriş yap");
  const content = forumInput.value;
  if(!content.trim()) return;
  await addDoc(collection(db,"forum"), {
    author: user.email.split("@")[0],
    content: content,
    createdAt: new Date()
  });
  forumInput.value = "";
});

// Mesajları çek
function loadForumMessages(){
  const q = query(collection(db,"forum"), orderBy("createdAt","asc"));
  onSnapshot(q, snapshot=>{
    forumDiv.innerHTML = "";
    snapshot.forEach(doc=>{
      const data = doc.data();
      const p = document.createElement("p");
      p.textContent = `${data.author}: ${data.content}`;
      forumDiv.appendChild(p);
    });
  });
}
