// Firebase Auth ve Database objeleri
const auth = firebase.auth();
const db = firebase.database();

function checkEmailExists() {
  const email = document.getElementById('email').value.trim();
  clearErrors();

  if (email === '') return;

  auth.fetchSignInMethodsForEmail(email)
    .then(methods => {
      if (methods.length > 0) {
        showError("Bu e-posta zaten sistemde kayıtlı.");
      }
    })
    .catch(() => {
      showError("E-posta kontrolü yapılırken bir hata oluştu.");
    });
}

function register(e) {
  e.preventDefault();
  clearErrors();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return showError("Geçerli bir e-posta adresi girin.");
  }

  if (password !== confirmPassword) {
    return showError("Şifreler eşleşmiyor.");
  }

  const passwordValid = password.length >= 6 &&
                        /[A-Z]/.test(password) &&
                        /[0-9]/.test(password);

  if (!passwordValid) {
    return showError("Şifre en az 6 karakter olmalı, en az 1 büyük harf ve 1 sayı içermelidir.");
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      return db.ref('users/' + user.uid).set({
        uid: user.uid,
        email: user.email
      }).then(() => {
        showSuccess("Kayıt başarılı! Yönlendiriliyorsunuz...");
        setTimeout(() => {
          window.location.href = "/html/chat.html";
        }, 1500);
      });
    })
    .catch(error => {
      console.error("Kayıt Hatası:", error);
      const msg = firebaseErrorMessage(error.code);
      showError(msg);
    });
}

function showError(message) {
  const box = document.createElement('div');
  box.className = 'error-message';
  box.textContent = message;
  document.getElementById('errorContainer').appendChild(box);
}

function showSuccess(message) {
  const box = document.createElement('div');
  box.className = 'success-message';
  box.textContent = message;
  document.getElementById('errorContainer').appendChild(box);
}

function clearErrors() {
  document.getElementById('errorContainer').innerHTML = '';
}

function firebaseErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return "Bu e-posta adresi zaten kullanılmaktadır. Şifrenizi mi unuttunuz?";
    case 'auth/invalid-email':
      return "Geçerli bir e-posta adresi girin.";
    case 'auth/weak-password':
      return "Şifre çok zayıf.";
    default:
      return "Kayıt olurken bir hata oluştu.";
  }
}
