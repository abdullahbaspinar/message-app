// Firebase Ayarları
const firebaseConfig = {
  apiKey: "AIzaSyCfjN1tbMatLamGZNqRZZcdvoM8Vbx0RlM",
  authDomain: "message-app-e45fa.firebaseapp.com",
  databaseURL: "https://message-app-e45fa-default-rtdb.firebaseio.com",
  projectId: "message-app-e45fa",
  storageBucket: "message-app-e45fa.appspot.com",
  messagingSenderId: "1090017668550",
  appId: "1:1090017668550:web:e5f1a12735a3315648d6c7"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

function showLogin() {
  document.getElementById('app').innerHTML = `
    <h2>Giriş Yap</h2>
    <input type="email" id="loginEmail" placeholder="E-posta"><br>
    <input type="password" id="loginPassword" placeholder="Şifre"><br>
    <button onclick="login()">Giriş Yap</button><br>
    <a href="#" onclick="showRegister()">Hesabınız yok mu? Kayıt Ol</a><br>
    <a href="#" onclick="showReset()">Şifremi Unuttum</a>
  `;
}

function showRegister() {
  document.getElementById('app').innerHTML = `
    <h2>Kayıt Ol</h2>
    <input type="email" id="registerEmail" placeholder="E-posta"><br>
    <input type="password" id="registerPassword" placeholder="Şifre"><br>
    <button onclick="register()">Kayıt Ol</button><br>
    <a href="#" onclick="showLogin()">Zaten hesabınız var mı? Giriş Yap</a>
  `;
}

function showReset() {
  document.getElementById('app').innerHTML = `
    <h2>Şifre Sıfırlama</h2>
    <input type="email" id="resetEmail" placeholder="E-posta"><br>
    <button onclick="resetPassword()">Sıfırlama Maili Gönder</button><br>
    <a href="#" onclick="showLogin()">Girişe Dön</a>
  `;
}

function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      showChat(user);
    })
    .catch(error => alert(error.message));
}

function register() {
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      db.ref('users/' + user.uid).set({
        email: user.email,
        uid: user.uid
      });
      showChat(user);
    })
    .catch(error => alert(error.message));
}

function resetPassword() {
  const email = document.getElementById('resetEmail').value;
  auth.sendPasswordResetEmail(email)
    .then(() => alert('Şifre sıfırlama maili gönderildi.'))
    .catch(error => alert(error.message));
}

function showChat(user) {
  document.getElementById('app').innerHTML = `
    <h2>Hoşgeldiniz, ${user.email}</h2>
    <button onclick="auth.signOut().then(showLogin)">Çıkış Yap</button>
  `;
}

// Oturum Açık mı Kontrol Et
auth.onAuthStateChanged(user => {
  if (user) {
    showChat(user);
  } else {
    showLogin();
  }
});
