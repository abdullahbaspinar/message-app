// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCfjN1tbMatLamGZNqRZZcdvoM8Vbx0RlM",
  authDomain: "message-app-e45fa.firebaseapp.com",
  databaseURL: "https://message-app-e45fa-default-rtdb.firebaseio.com",
  projectId: "message-app-e45fa",
  storageBucket: "message-app-e45fa.appspot.com",
  messagingSenderId: "1090017668550",
  appId: "1:1090017668550:web:e5f1a12735a3315648d6c7"
};

// Firebase Başlat
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// Giriş Ekranı
function renderLoginScreen() {
  document.body.innerHTML = `
    <div id="app">
      <div class="login-container">
        <h1>Mesajlaşma Uygulaması</h1>
        <button id="loginBtn">Google ile Giriş Yap</button>
      </div>
    </div>
  `;

  document.getElementById('loginBtn').onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    console.log("Giriş işlemi başlatıldı");
    auth.signInWithRedirect(provider);
  };
}

// Sohbet Ekranı
function setupChatUI(user) {
  console.log("setupChatUI çalıştı:", user);

  const wrapper = document.createElement('div');
  wrapper.id = 'app';
  document.body.innerHTML = '';
  document.body.appendChild(wrapper);

  document.getElementById('app').innerHTML = `
    <div class="sidebar" id="userList"></div>
    <div class="chat-area">
      <div class="messages" id="messages"></div>
      <input type="text" id="messageInput" placeholder="Mesaj yazın..." />
    </div>
  `;

  const userList = document.getElementById('userList');
  const messagesEl = document.getElementById('messages');
  const messageInput = document.getElementById('messageInput');

  // Kullanıcıyı Listeye Kaydet
  db.ref('users/' + user.uid).set({
    displayName: user.displayName,
    uid: user.uid
  });

  // Kullanıcı Listesini Getir
  db.ref('users').on('value', snapshot => {
    userList.innerHTML = '';
    snapshot.forEach(child => {
      const u = child.val();
      if (u.uid !== user.uid) {
        const div = document.createElement('div');
        div.className = 'user';
        div.textContent = u.displayName;
        div.onclick = () => openChat(u.uid, user.uid, u.displayName);
        userList.appendChild(div);
      }
    });
  });

  // Sohbet Aç
  function openChat(otherUid, myUid, otherName) {
    console.log("Sohbet açıldı:", otherName);
    messagesEl.innerHTML = '';
    const chatId = myUid < otherUid ? myUid + '_' + otherUid : otherUid + '_' + myUid;
    const chatRef = db.ref('chats/' + chatId);

    chatRef.on('child_added', snapshot => {
      const msg = snapshot.val();
      const p = document.createElement('p');
      p.textContent = msg.sender + ': ' + msg.text;
      messagesEl.appendChild(p);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });

    messageInput.onkeypress = e => {
      if (e.key === 'Enter' && messageInput.value.trim() !== '') {
        chatRef.push({
          sender: user.displayName,
          text: messageInput.value.trim()
        });
        messageInput.value = '';
      }
    };
  }
}

// Başlangıçta Giriş Ekranını Göster
renderLoginScreen();

// Redirect Sonuçlarını Dinle
auth.getRedirectResult().then(result => {
  console.log("Redirect sonucu:", result);
  if (result.user) {
    console.log("Redirect başarılı, kullanıcı bulundu:", result.user.displayName);
    setupChatUI(result.user);
  }
}).catch(error => {
  console.error("Redirect hatası:", error);
});

// Oturum Açık mı Kontrol Et
auth.onAuthStateChanged(user => {
  console.log("onAuthStateChanged tetiklendi:", user);
  if (user) {
    console.log("Oturum açık, kullanıcı bulundu:", user.displayName);
    setupChatUI(user);
  } else {
    console.log("Kullanıcı oturumu bulunamadı, giriş ekranı gösteriliyor.");
    renderLoginScreen();
  }
});
