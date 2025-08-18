// Navbar başlangıçta gizli
document.getElementById('navbar').style.display = 'none';

// Giriş
function login() {
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;

    if (nickname && password) {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('navbar').style.display = 'flex';
        showSection('anasayfa');
    } else {
        alert("Lütfen tüm alanları doldurun!");
    }
}

// Kayıt
function register() {
    const nickname = document.getElementById('nickname').value;
    const password = document.getElementById('password').value;

    if (nickname && password) {
        alert("Kayıt başarılı! Giriş yapabilirsiniz.");
    } else {
        alert("Lütfen tüm alanları doldurun!");
    }
}

// Section geçişi
function showSection(id) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.style.display = 'none');
    document.getElementById(id).style.display = 'block';
}

// Çıkış
function logout() {
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('navbar').style.display = 'none';
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.style.display = 'none');
}

// Forum mesaj
function sendMessage() {
    const input = document.getElementById('forum-input');
    const container = document.getElementById('forum-messages');

    if(input.value.trim() !== ''){
        const msg = document.createElement('p');
        msg.textContent = input.value;
        container.appendChild(msg);
        input.value = '';
        container.scrollTop = container.scrollHeight;
    }
}
