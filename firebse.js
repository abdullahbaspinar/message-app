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
