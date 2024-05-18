// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACOnUAzI_3whGLdgPicBZ4KTKnLCIJZ0s",
    authDomain: "tasteit-d72f7.firebaseapp.com",
    databaseURL: "https://tasteit-d72f7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tasteit-d72f7",
    storageBucket: "tasteit-d72f7.appspot.com",
    messagingSenderId: "516411013938",
    appId: "1:123456789:web:abcdef12345"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Add event listener to form submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
        // Login successful
        const user = userCredential.user;
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const userRole = userData.rol;

            if (userRole === 'u') {
                window.location.href = 'PagPrincipala.html';
            } else if (userRole === 'a') {
                window.location.href = 'homeAdmin.html';
            } else {
                alert('Rol necunoscut!');
            }
        } else {
            console.error('Documentul utilizatorului nu există!');
            alert('Datele utilizatorului nu au fost găsite.');
        }
    })
    .catch((error) => {
        console.error('Eroare de autentificare:', error);
        alert('Eroare la login: ' + error.message);
    });
});
