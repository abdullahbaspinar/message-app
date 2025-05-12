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
const db = firebase.database();
const auth = firebase.auth();

// 🔒 Session Persistence
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .then(() => {
    console.log("Session persistence aktif.");

    // ✅ Oturum kontrolü
    auth.onAuthStateChanged(user => {
      console.log("onAuthStateChanged tetiklendi:", user);
      if (user) {
        console.log("Kullanıcı oturumda:", user.displayName);
        setupChatUI(user);
      } else {
        console.log("Oturum kapalı, giriş ekranı gösteriliyor.");
        renderLoginScreen();
      }
    });

    // ✅ Redirect sonrası oturum kontrolü
    auth.getRedirectResult().then(result => {
      if (result.user) {
        console.log("Redirect sonrası kullanıcı:", result.user.displayName);
        setupChatUI(result.user);
      } else {
        console.log("Redirect sonrası kullanıcı yok.");
      }
    }).catch(error => {
      console.error("Redirect hatası:", error);
    });
  })
  .catch(error => {
    console.error("Persistence ayarlanamadı:", error);
  });

function renderLoginScreen() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-container">
      <h1>Mesajlaşma Uygulaması</h1>
      <button id="loginBtn">Google ile Giriş Yap</button>
    </div>
  `;
  document.getElementById('loginBtn').onclick = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithRedirect(provider);
  };
}

function setupChatUI(user) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="sidebar" id="userList"></div>
    <div class="chat-area">
      <div id="chatHeader" class="chat-header">Sohbet seçilmedi</div>
      <div class="messages" id="messages"></div>
      <input type="text" id="messageInput" placeholder="Mesaj yazın..." />
    </div>
  `;

  const userList = document.getElementById('userList');
  const messagesEl = document.getElementById('messages');
  const messageInput = document.getElementById('messageInput');
  const chatHeader = document.getElementById('chatHeader');

  db.ref('users/' + user.uid).set({
    displayName: user.displayName,
    uid: user.uid,
    photoURL: user.photoURL || ""
  }).then(() => {
    db.ref('users').on('value', snapshot => {
      userList.innerHTML = '';
      snapshot.forEach(child => {
        const u = child.val();
        if (u.uid !== user.uid) {
          const div = document.createElement('div');
          div.className = 'user';
          div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${u.photoURL || 'https://via.placeholder.com/30'}" width="30" height="30" style="border-radius:50%;">
              <strong>${u.displayName}</strong>
            </div>
          `;
          div.onclick = () => openChat(u.uid, user.uid, u.displayName);
          userList.appendChild(div);
        }
      });
    });
  });

  function openChat(otherUid, myUid, otherName) {
    messagesEl.innerHTML = '';
    chatHeader.innerText = "Sohbet: " + otherName;
    const chatId = myUid < otherUid ? myUid + '_' + otherUid : otherUid + '_' + myUid;
    const chatRef = db.ref('chats/' + chatId);

    chatRef.off();

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
