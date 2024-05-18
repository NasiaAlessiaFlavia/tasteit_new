
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, addDoc, collection } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js';


const firebaseConfig = {
    apiKey: "AIzaSyACOnUAzI_3whGLdgPicBZ4KTKnLCIJZ0s",
    authDomain: "tasteit-d72f7.firebaseapp.com",
    databaseURL: "https://tasteit-d72f7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tasteit-d72f7",
    storageBucket: "tasteit-d72f7.appspot.com",
    messagingSenderId: "516411013938",
    appId: "1:516411013938:web:64edefef8e802e1316b52b"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app)

// Funcția de încărcare a fișierelor adaptată pentru utilizare generică
// Funcția de încărcare a fișierelor adaptată pentru utilizare generică
async function uploadFile(file, path) {
    if (!file) return '';
    const storageRef = ref(storage, `${path}/${file.name}`);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        // Obține URL-ul de download direct de la Firebase Storage
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL; // Returnează URL-ul direct
    } catch (error) {
        console.error('Error uploading file:', error);
        return '';
    }
}

// Event listener pentru formularul de adăugare a restaurantului
document.getElementById('addRestaurantForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    await addRestaurant(); // Directly calling addRestaurant function
});

// Funcția de adăugare a restaurantului, inclusiv încărcarea bannerului și a logo-ului
async function addRestaurant() {
    const fileInput = document.getElementById('logoFile'); // Ajustează ID-ul conform codului HTML actualizat
    let logoUrl = '';

    // Verifică dacă un fișier a fost încărcat
    if (fileInput.files.length > 0) {
        // Încarcă fișierul în Firebase Storage și obține URL-ul
        logoUrl = await uploadFile(fileInput.files[0], 'logos');
    } else {
        alert('Vă rugăm să încărcați un logo.');
        return; // Oprire dacă niciun fișier nu este selectat
    }
    const restaurantData = {
        name: document.getElementById('restaurantName').value.trim(),
        description: document.getElementById('description').value.trim(),
        locuri: parseInt(document.getElementById('numSeats').value, 10),
        address: document.getElementById('address').value.trim(),
        googleMaps: document.getElementById('googleMaps').value.trim(),
        numSeats:parseInt(document.getElementById('numSeats').value, 10),
        logo: logoUrl, // Salvarea URL-ului logo-ului
      
        schedule: collectScheduleData()
    };

    
    if (!restaurantData.name || !restaurantData.address || isNaN(restaurantData.locuri)) {
        alert('Numele, adresa și numărul de locuri sunt obligatorii.');
        return;
    }

    try {
        const docRef = await addDoc(collection(db, "restaurants"), restaurantData);
        console.log("Restaurant adăugat cu ID: ", docRef.id);
        alert('Restaurant adăugat cu succes!');
        window.location.href = 'Business.html'; // Redirect după adăugare
    } catch (error) {
        console.error('Eroare la adăugarea restaurantului:', error);
        alert('Eroare la adăugarea restaurantului: ' + error.message);
    }
}

// Funcția de colectare a datelor pentru program
function collectScheduleData() {
    const daysOfWeek = ['luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata', 'duminica'];
    const schedule = {};
    daysOfWeek.forEach(day => {
        const start = document.getElementById(`${day}Start`).value;
        const end = document.getElementById(`${day}End`).value;
        schedule[day] = `${start} - ${end}`;
    });
    return schedule;
}
