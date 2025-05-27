function navigate(url) {
  window.location.href = url;
}

function handleAuthError(error) {
  alert(error.message);
}

function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => navigate('chat.html'))
    .catch(handleAuthError);
}

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => navigate('chat.html'))
    .catch(handleAuthError);
}

function resetPassword() {
  const email = document.getElementById('email').value;
  auth.sendPasswordResetEmail(email)
    .then(() => alert('Şifre sıfırlama maili gönderildi'))
    .catch(handleAuthError);
}
