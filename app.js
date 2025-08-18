// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyALAEYsysXJy0mnNmJvD5H0wOqXjp4Oohc",
    authDomain: "sadrayy-site.firebaseapp.com",
    projectId: "sadrayy-site",
    storageBucket: "sadrayy-site.firebasestorage.app",
    messagingSenderId: "302147777701",
    appId: "1:302147777701:web:d701293a09ab61d85f894c",
    measurementId: "G-C9HVQ0XXBJ"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Elementler
const authContainer = document.getElementById('auth-container');
const nicknameInput = document.getElementById('nickname');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const authMsg = document.getElementById('auth-msg');

const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('.section');
const navItems = document.querySelectorAll('.navItem');
const logoutBtn = document.getElementById('logout');

const forumMessages = document.getElementById('forum-messages');
const forumInput = document.getElementById('forum-input');
const forumSend = document.getElementById('forum-send');

let currentUser = null;

// Kayıt
registerBtn.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();
    const password = passwordInput.value.trim();
    if(!nickname || !password){ authMsg.textContent="Nickname ve şifre giriniz"; return; }

    db.collection('users').doc(nickname).get().then(doc=>{
        if(doc.exists){ authMsg.textContent="Bu nickname kullanılıyor"; }
        else{
            db.collection('users').doc(nickname).set({password: password}).then(()=>{
                authMsg.style.color="green";
                authMsg.textContent="Kayıt başarılı!";
            });
        }
    });
});

// Giriş
loginBtn.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();
    const password = passwordInput.value.trim();
    if(!nickname || !password){ authMsg.textContent="Nickname ve şifre giriniz"; return; }

    db.collection('users').doc(nickname).get().then(doc=>{
        if(doc.exists && doc.data().password === password){
            currentUser = nickname;
            authContainer.style.display="none";
            navbar.style.display="flex";
            showSection('anasayfa');
        } else {
            authMsg.textContent="Nickname veya şifre hatalı";
        }
    });
});

// Navbar tıklama
navItems.forEach(item=>{
    item.addEventListener('click',()=>{
        const section = item.getAttribute('data-section');
        if(section) showSection(section);
    });
});

// Çıkış
logoutBtn.addEventListener('click',()=>{
    currentUser=null;
    authContainer.style.display="block";
    navbar.style.display="none";
    sections.forEach(s=>s.style.display="none");
});

// Bölüm göster
function showSection(id){
    sections.forEach(s=>s.style.display="none");
    document.getElementById(id).style.display="block";
}

// Forum mesaj gönderme
forumSend.addEventListener('click',()=>{
    const msg = forumInput.value.trim();
    if(!msg || !currentUser) return;

    db.collection('forum').add({
        author: currentUser,
        content: msg,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(()=> forumInput.value='');
});

// Forum mesajları yükle
db.collection('forum').orderBy('createdAt','asc').onSnapshot(snapshot=>{
    forumMessages.innerHTML='';
    snapshot.forEach(doc=>{
        const data = doc.data();
        if(data.author && data.content){
            const div = document.createElement('div');
            div.textContent=`${data.author}: ${data.content}`;
            forumMessages.appendChild(div);
        }
    });
});
