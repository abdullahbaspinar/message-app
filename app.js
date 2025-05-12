const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // <--- This is unique to YOUR web app!
  authDomain: "message-app-e45fa.firebaseapp.com", // Derived from your Project ID
  databaseURL: "https://message-app-e45fa-default-rtdb.firebaseio.com", // From your Realtime Database info
  projectId: "message-app-e45fa", // Your Project ID!
  storageBucket: "message-app-e45fa.firebasestorage.app", // Standard format based on Project ID
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // <--- This is unique to YOUR web app!
  appId: "YOUR_APP_ID", // <--- This is unique to YOUR web app!
  // measurementId: "YOUR_MEASUREMENT_ID", // Optional: Only included if Google Analytics is enabled
};


firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

// 🔐 Redirect tabanlı giriş
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

// 🟢 Giriş sonrası sohbet arayüzü
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

  // 🧑 Kullanıcıyı Firebase'e ekle
  db.ref('users/' + user.uid).set({
    displayName: user.displayName,
    uid: user.uid
  });

  // 📜 Kullanıcı listesini yükle
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

  // 💬 Sohbet başlat
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
