// === Firebase Config ===
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

// === Elements ===
const authContainer = document.getElementById('auth-container');
const nicknameInput = document.getElementById('nickname');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const authMsg = document.getElementById('auth-msg');

const navbar = document.getElementById('navbar');
const navItems = document.querySelectorAll('.navItem');
const sections = document.querySelectorAll('.section');
const logoutBtn = document.getElementById('logout');

const forumMessages = document.getElementById('forum-messages');
const forumInput = document.getElementById('forum-input');
const forumSend = document.getElementById('forum-send');

let currentUser = null;

// === Register ===
registerBtn.addEventListener('click', () => {
  const nickname = nicknameInput.value.trim();
  const password = passwordInput.value.trim();
  if (!nickname || !password) {
    authMsg.style.color = "red";
    authMsg.textContent = "Nickname ve şifre giriniz";
    return;
  }

  db.collection('users').doc(nickname).get().then(doc => {
    if (doc.exists) {
      authMsg.style.color = "red";
      authMsg.textContent = "Bu nickname kullanılıyor";
    } else {
      db.collection('users').doc(nickname).set({ password: password }).then(() => {
        authMsg.style.color = "green";
        authMsg.textContent = "Kayıt başarılı!";
      });
    }
  });
});

// === Login ===
loginBtn.addEventListener('click', () => {
  const nickname = nicknameInput.value.trim();
  const password = passwordInput.value.trim();
  if (!nickname || !password) {
    authMsg.style.color = "red";
    authMsg.textContent = "Nickname ve şifre giriniz";
    return;
  }

  db.collection('users').doc(nickname).get().then(doc => {
    if (doc.exists && doc.data().password === password) {
      currentUser = nickname;
      authContainer.style.display = "none";
      navbar.style.display = "flex";
      showSection('anasayfa');
    } else {
      authMsg.style.color = "red";
      authMsg.textContent = "Nickname veya şifre hatalı";
    }
  });
});

// === Logout ===
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  authContainer.style.display = "block";
  navbar.style.display = "none";
  sections.forEach(s => s.style.display = "none");
});

// === Show Section ===
function showSection(id) {
  sections.forEach(s => {
    if (s.id === id) {
      s.style.display = "block";
      setTimeout(() => s.classList.add('show'), 10);
    } else {
      s.style.display = "none";
      s.classList.remove('show');
    }
  });

  // Navbar underline
  navItems.forEach(item => {
    if (item.dataset.section === id) {
      const underline = document.querySelector('.nav-underline');
      const rect = item.getBoundingClientRect();
      const parentRect = item.parentElement.getBoundingClientRect();
      underline.style.width = rect.width + 'px';
      underline.style.left = rect.left - parentRect.left + 'px';
    }
  });
}

// === Navbar click ===
navItems.forEach(item => {
  if (item.dataset.section) {
    item.addEventListener('click', () => showSection(item.dataset.section));
  }
});

// === Forum Send ===
forumSend.addEventListener('click', () => {
  const msg = forumInput.value.trim();
  if (!msg || !currentUser) return;

  db.collection('forum').add({
    author: currentUser,
    content: msg,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => forumInput.value = '');
});

// === Forum Enter Key Send ===
forumInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') forumSend.click();
});

// === Load Forum Messages ===
db.collection('forum').orderBy('createdAt', 'asc').onSnapshot(snapshot => {
  forumMessages.innerHTML = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.author && data.content) {
      const div = document.createElement('div');
      div.textContent = `${data.author}: ${data.content}`;
      div.style.opacity = '0';
      forumMessages.appendChild(div);
      setTimeout(() => { div.style.transition = '0.5s'; div.style.opacity = '1'; }, 10);
    }
  });
});
