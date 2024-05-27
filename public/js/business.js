
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


async function uploadFile(file, path) {
    if (!file) return '';
    const storageRef = ref(storage, `${path}/${file.name}`);
    try {
        const snapshot = await uploadBytes(storageRef, file);
       
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL; 
    } catch (error) {
        console.error('Error uploading file:', error);
        return '';
    }
}


document.getElementById('addRestaurantForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    await addRestaurant(); 
});


async function addRestaurant() {
    const fileInput = document.getElementById('logoFile'); 
    let logoUrl = '';

    
    if (fileInput.files.length > 0) {
        
        logoUrl = await uploadFile(fileInput.files[0], 'logos');
    } else {
        alert('Vă rugăm să încărcați un logo.');
        return; 
    }
    const restaurantData = {
        name: document.getElementById('restaurantName').value.trim(),
        description: document.getElementById('description').value.trim(),
        locuri: parseInt(document.getElementById('numSeats').value, 10),
        address: document.getElementById('address').value.trim(),
        googleMaps: document.getElementById('googleMaps').value.trim(),
        numSeats:parseInt(document.getElementById('numSeats').value, 10),
        logo: logoUrl, 
      
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
        window.location.href = 'Business.html'; 
    } catch (error) {
        console.error('Eroare la adăugarea restaurantului:', error);
        alert('Eroare la adăugarea restaurantului: ' + error.message);
    }
}


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
