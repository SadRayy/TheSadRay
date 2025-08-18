// Kullanıcı Girişi ve Navbar Gösterme
function login() {
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;

    if(nickname && password){
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('navbar').style.display = 'flex';
        showSection('anasayfa');
    } else {
        alert("Lütfen tüm alanları doldurun!");
    }
}

function register() {
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;

    if(nickname && password){
        alert("Kayıt başarılı! Giriş yapabilirsiniz.");
    } else {
        alert("Lütfen tüm alanları doldurun!");
    }
}

// Navbar üzerinden Section geçişi
function showSection(id) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

// Logout
function logout(){
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('navbar').style.display = 'none';
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.style.display = 'none');
}

// Forum Mesaj Gönderme
function sendMessage() {
    const input = document.getElementById('forum-input');
    const msgContainer = document.getElementById('forum-messages');

    if(input.value.trim() !== ''){
        const msg = document.createElement('p');
        msg.textContent = input.value;
        msgContainer.appendChild(msg);
        input.value = '';
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }
}
