

    const logoutBtn = document.getElementById('logoutBtn');
    const userListContainer = document.getElementById('userListContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesEl = document.getElementById('messages');
    const chatTitle = document.getElementById('chatTitle');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    menuToggle.onclick = () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    };

    function closeSidebar() {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    }

    auth.onAuthStateChanged(user => {
      if (!user) return location.href = '../index.html';

      db.ref('users/' + user.uid).set({
        email: user.email,
        uid: user.uid
      });

      db.ref('users').on('value', snapshot => {
        userListContainer.innerHTML = '';
        const users = snapshot.val();
        for (let uid in users) {
          if (uid !== user.uid) {
            const div = document.createElement('div');
            div.className = 'user-item';
            div.textContent = users[uid].email;
            div.onclick = () => {
              openChat(uid, user.uid, users[uid].email);
              closeSidebar();
            };
            userListContainer.appendChild(div);
          }
        }
      });

      logoutBtn.onclick = () => {
        auth.signOut().then(() => location.href = '../index.html');
      };

      function openChat(otherUid, myUid, otherEmail) {
        messagesEl.innerHTML = '';
        chatTitle.textContent = otherEmail;
        messageInput.disabled = false;
        sendButton.disabled = false;

        const chatId = myUid < otherUid ? `${myUid}_${otherUid}` : `${otherUid}_${myUid}`;
        const chatRef = db.ref('chats/' + chatId);

        chatRef.off();
        chatRef.on('child_added', snap => {
          const msg = snap.val();
          const isSender = msg.sender === user.email;
          const wrapper = document.createElement('div');
          wrapper.className = 'msg-wrapper ' + (isSender ? 'sent' : 'received');
          const bubble = document.createElement('div');
          bubble.className = 'msg';
          bubble.textContent = msg.text;
          const time = document.createElement('div');
          time.className = 'msg-time';
          time.textContent = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          wrapper.appendChild(bubble);
          wrapper.appendChild(time);
          messagesEl.appendChild(wrapper);
          messagesEl.scrollTop = messagesEl.scrollHeight;

          if (!isSender) db.ref('chats/' + chatId + '/' + snap.key).update({ seen: true });
        });

        sendButton.onclick = sendMessage;
        messageInput.onkeypress = e => {
          if (e.key === 'Enter') sendMessage();
        };

        function sendMessage() {
          const text = messageInput.value.trim();
          if (!text) return;
          db.ref('chats/' + chatId).push({
            sender: user.email,
            text: text,
            timestamp: Date.now(),
            seen: false
          });
          messageInput.value = '';
        }
      }
    });
