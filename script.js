// Firebase config (kendi projenle değiştir)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

// Ekranlar
const registerScreen = document.getElementById("register-screen");
const loginScreen = document.getElementById("login-screen");

// Ekran geçiş fonksiyonları
function showLogin() {
    registerScreen.style.display = "none";
    loginScreen.style.display = "block";
}
function showRegister() {
    loginScreen.style.display = "none";
    registerScreen.style.display = "block";
}

// Kayıt fonksiyonu
window.registerUser = async function() {
    const nickname = document.getElementById("nickname").value;
    const password = document.getElementById("password").value;

    if (!nickname || !password) {
        alert("Lütfen tüm alanları doldur!");
        return;
    }

    try {
        await addDoc(collection(db, "users"), {
            nickname: nickname,
            password: password
        });
        alert("Kayıt başarılı!");
        showLogin();
    } catch (e) {
        console.error("Hata: ", e);
    }
}

// Giriş fonksiyonu
window.loginUser = async function() {
    const nickname = document.getElementById("login-nickname").value;
    const password = document.getElementById("login-password").value;

    if (!nickname || !password) {
        alert("Lütfen tüm alanları doldur!");
        return;
    }

    const q = query(collection(db, "users"), where("nickname", "==", nickname), where("password", "==", password));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        alert("Giriş başarılı!");
    } else {
        alert("Hatalı nickname veya şifre!");
    }
}
