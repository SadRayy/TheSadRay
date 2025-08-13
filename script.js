import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Firebase Konfigürasyonu
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

// Kayıt
window.registerUser = async function() {
  const nickname = document.getElementById("regNickname").value;
  const password = document.getElementById("regPassword").value;
  if(!nickname || !password){ alert("Tüm alanları doldurun!"); return; }

  await setDoc(doc(db, "users", nickname), { password });
  alert("Kayıt başarılı!");
  document.getElementById("registerDiv").style.display = "none";
  document.getElementById("loginDiv").style.display = "block";
}

// Giriş
window.loginUser = async function() {
  const nickname = document.getElementById("loginNickname").value;
  const password = document.getElementById("loginPassword").value;
  if(!nickname || !password){ alert("Tüm alanları doldurun!"); return; }

  const userDoc = await getDoc(doc(db, "users", nickname));
  if(!userDoc.exists()) { alert("Kullanıcı bulunamadı!"); return; }
  if(userDoc.data().password !== password){ alert("Şifre yanlış!"); return; }

  alert("Giriş başarılı!");
  document.getElementById("loginDiv").style.display = "none";
  document.getElementById("newsDiv").style.display = "block";
  loadNews();
}

// Haberleri yükle
async function loadNews() {
  const newsList = document.getElementById("newsList");
  newsList.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "news"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "newsItem";
    div.innerHTML = `
      <strong>${data.title}</strong>
      <p>${data.content}</p>
      <button class="likeBtn" onclick="likeNews('${docSnap.id}')">Beğen <span class="likeCount">${data.likes || 0}</span></button>
    `;
    newsList.appendChild(div);
  });
}

// Beğeni ekleme
window.likeNews = async function(newsId) {
  const newsRef = doc(db, "news", newsId);
  await updateDoc(newsRef, { likes: increment(1) });
  loadNews();
}

// Event listener
document.getElementById("registerBtn").addEventListener("click", registerUser);
document.getElementById("loginBtn").addEventListener("click", loginUser);
