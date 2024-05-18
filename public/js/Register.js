import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACOnUAzI_3whGLdgPicBZ4KTKnLCIJZ0s",
    authDomain: "tasteit-d72f7.firebaseapp.com",
    databaseURL: "https://tasteit-d72f7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tasteit-d72f7",
    storageBucket: "tasteit-d72f7.appspot.com",
    messagingSenderId: "516411013938",
    appId: "1:516411013938:web:64edefef8e802e1316b52b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function () {
  const registerForm = document.querySelector('form');
  registerForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;
    const fullname = document.getElementById('register-fullname').value;
    const phone = document.getElementById('register-phone').value;
    const dob = document.getElementById('register-dob').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          fullname: fullname,
          parola: password,
          phone: phone,
          rol:"u",
          dob: dob
        });
      })
      .then(() => {
        alert('User registered successfully!');
        window.location.href = 'PagPrincipala.html'; 
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
        alert('Failed to register: ' + error.message);
      });
  });
});