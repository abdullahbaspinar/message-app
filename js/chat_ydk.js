    const sendButton = document.getElementById('sendButton');
    const messageInput = document.getElementById('messageInput');
    const messagesEl = document.getElementById('messages');
    const chatTitle = document.getElementById('chatTitle');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const overlay = document.getElementById('overlay');

    function toggleSidebar() {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    }

    menuToggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);

    function formatDateLabel(timestamp) {
      const today = new Date();
      const msgDate = new Date(timestamp);
      const diff = today.setHours(0, 0, 0, 0) - msgDate.setHours(0, 0, 0, 0);
      if (diff === 0) return 'Bugün';
      if (diff === 86400000) return 'Dün';
      return msgDate.toLocaleDateString('tr-TR');
    }

    auth.onAuthStateChanged(user => {
      if (!user) window.location.href = 'index.html';
      else {
        const userListContainer = document.getElementById('userListContainer');
        db.ref('users/' + user.uid).set({ email: user.email, uid: user.uid });

        db.ref('users').on('value', snapshot => {
          userListContainer.innerHTML = '';
          const users = snapshot.val();
          for (let uid in users) {
            const u = users[uid];
            if (uid !== user.uid && u.email && u.uid) {
              const div = document.createElement('div');
              div.className = 'user-item';
              div.textContent = u.email;
              div.onclick = () => {
                openChat(u.uid, user.uid, u.email);
                closeSidebar();
              };
              userListContainer.appendChild(div);
            }
          }
        });

        function openChat(otherUid, myUid, otherEmail) {
          messagesEl.innerHTML = '';
          chatTitle.textContent = otherEmail;
          messageInput.disabled = false;
          sendButton.disabled = false;
          const chatId = myUid < otherUid ? myUid + '_' + otherUid : otherUid + '_' + myUid;
          const chatRef = db.ref('chats/' + chatId);

          let lastDate = '';
          chatRef.off();
          chatRef.on('child_added', snapshot => {
            const msg = snapshot.val();
            const key = snapshot.key;
            const isSender = msg.sender === user.email;
            const timestamp = new Date(msg.timestamp || Date.now());
            const currentDate = timestamp.toDateString();

            if (lastDate !== currentDate) {
              const label = document.createElement('div');
              label.className = 'date-label';
              label.textContent = formatDateLabel(timestamp);
              messagesEl.appendChild(label);
              lastDate = currentDate;
            }

            const wrapper = document.createElement('div');
            wrapper.className = isSender ? 'msg-wrapper sent' : 'msg-wrapper received';

            const bubble = document.createElement('div');
            bubble.className = 'msg';
            bubble.textContent = msg.text;

            const time = document.createElement('div');
            time.className = 'msg-time';
            time.textContent = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            wrapper.appendChild(bubble);
            wrapper.appendChild(time);

            if (isSender) {
              const status = document.createElement('div');
              status.className = 'msg-status';
              status.textContent = msg.seen ? '✓✓ Okundu' : '✓ Gönderildi';
              wrapper.appendChild(status);
            } else {
              db.ref('chats/' + chatId + '/' + key).update({ seen: true });
            }

            messagesEl.appendChild(wrapper);
            messagesEl.scrollTop = messagesEl.scrollHeight;
          });

          sendButton.onclick = sendMessage;
          messageInput.onkeypress = e => {
            if (e.key === 'Enter') sendMessage();
          };

          function sendMessage() {
            const text = messageInput.value.trim();
            if (text !== '') {
              db.ref('chats/' + chatId).push({
                sender: user.email,
                text: text,
                timestamp: Date.now(),
                seen: false
              });
              messageInput.value = '';
            }
          }
        }
      }
    });

    function logout() {
      auth.signOut().then(() => window.location.href = 'index.html');
    }
