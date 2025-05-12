// SDK bağlantıları zaten index.html'de <script src="...firebase-app-compat.js"> ile geldiği için
// burada yeniden import etmeye gerek yok. Aşağıdaki firebaseConfig ile devam edebiliriz:

const firebaseConfig = {
  apiKey: "AIzaSyCfjN1tbMatLamGZNqRZZcdvoM8Vbx0RlM",
  authDomain: "message-app-e45fa.firebaseapp.com",
  databaseURL: "https://message-app-e45fa-default-rtdb.firebaseio.com",
  projectId: "message-app-e45fa",
  storageBucket: "message-app-e45fa.appspot.com", // .app değil, .com olmalı
  messagingSenderId: "1090017668550",
  appId: "1:1090017668550:web:e5f1a12735a3315648d6c7"
};

// ✅ Firebase başlat
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// 🔐 Giriş Ekranı
document.getElementById('app').innerHTML = `
  <div class="login-container">
    <h1>Mesajlaşma Uygulaması</h1>
    <button id="loginBtn">Google ile Giriş Yap</button>
  </div>
`;

document.getElementById('loginBtn').onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithRedirect(provider);
};

// 🔁 Redirect sonucu kontrol
auth.getRedirectResult().then(result => {
  if (result.user) {
    setupChatUI(result.user);
  }
});

// 🟢 Sohbet arayüzü
function setupChatUI(user) {
  document.body.innerHTML = `<div id="app"></div>`;
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

  // 🔐 Kullanıcıyı veritabanına ekle
  db.ref('users/' + user.uid).set({
    displayName: user.displayName,
    uid: user.uid
  });

  // 👥 Kullanıcı listesini getir
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

  // 💬 Sohbeti başlat
  function openChat(otherUid, myUid, otherName) {
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
