    function resetPassword(e) {
      e.preventDefault();
      clearMessage();

      const email = document.getElementById('email').value.trim();
      const messageContainer = document.getElementById('messageContainer');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        showMessage("Geçerli bir e-posta adresi giriniz.", false);
        return;
      }

      db.ref('users').once('value', snapshot => {
        let exists = false;

        snapshot.forEach(child => {
          const user = child.val();
          if (user.email === email) exists = true;
        });

        if (!exists) {
          showMessage(
            "Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı. ",
            false,
            '<a href="register.html">Hesap oluşturun</a>'
          );
          return;
        }

        auth.sendPasswordResetEmail(email)
          .then(() => {
            showMessage("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.", true);
          })
          .catch(error => {
            if (error.code === 'auth/invalid-email') {
              showMessage("Geçersiz e-posta adresi girdiniz.", false);
            } else {
              showMessage("Bir hata oluştu. Lütfen tekrar deneyiniz.", false);
            }
          });
      });
    }

    function showMessage(message, success = false, extra = "") {
      const box = document.createElement('div');
      box.className = 'info-box ' + (success ? 'success-message' : 'error-message');
      box.innerHTML = message + (extra || "");
      document.getElementById('messageContainer').appendChild(box);
    }

    function clearMessage() {
      document.getElementById('messageContainer').innerHTML = '';
    }
  