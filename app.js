import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyALAEYsysXJy0mnNmJvD5H0wOqXjp4Oohc",
  authDomain: "proje-adın.firebaseapp.com",
  projectId: "proje-adın",
  storageBucket: "proje-adın.appspot.com",
  messagingSenderId: "SENİN_MESSAGING_ID",
  appId: "SENİN_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// HTML elementleri
const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerBtn = document.getElementById("registerBtn");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");

const googleLoginBtn = document.getElementById("googleLoginBtn");
const googleLoginBtnLogin = document.getElementById("googleLoginBtnLogin");

const registerForm = document.querySelectorAll(".container")[0];
const loginForm = document.querySelectorAll(".container")[1];

document.getElementById("showLogin").addEventListener("click", () => {
  registerForm.style.display = "none";
  loginForm.style.display = "block";
});

document.getElementById("showRegister").addEventListener("click", () => {
  loginForm.style.display = "none";
  registerForm.style.display = "block";
});

// Kayıt ol
registerBtn.addEventListener("click", () => {
  createUserWithEmailAndPassword(auth, registerEmail.value, registerPassword.value)
    .then((userCredential) => {
      alert("Kayıt başarılı! Hoş geldiniz " + registerName.value);
      window.location.href = "anasayfa.html";
    })
    .catch((error) => {
      alert("Hata: " + error.message);
    });
});

// Giriş yap
loginBtn.addEventListener("click", () => {
  signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
    .then(() => {
      alert("Giriş başarılı!");
      window.location.href = "anasayfa.html";
    })
    .catch((error) => {
      alert("Hata: " + error.message);
    });
});

// Google ile giriş (Kayıt ol sayfası)
googleLoginBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      alert(`Hoş geldin ${result.user.displayName}!`);
      window.location.href = "anasayfa.html";
    })
    .catch((error) => {
      console.error(error);
    });
});

// Google ile giriş (Giriş yap sayfası)
googleLoginBtnLogin.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      alert(`Hoş geldin ${result.user.displayName}!`);
      window.location.href = "anasayfa.html";
    })
    .catch((error) => {
      console.error(error);
    });
});
