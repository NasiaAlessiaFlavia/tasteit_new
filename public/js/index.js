// Importarea SDK-urilor Firebase necesare
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getFirestore, collection, getDocs, query, where, addDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';  // Import additional functions for auth
// Configurarea Firebase
const firebaseConfig = {
    apiKey: "AIzaSyACOnUAzI_3whGLdgPicBZ4KTKnLCIJZ0s",
    authDomain: "tasteit-d72f7.firebaseapp.com",
    databaseURL: "https://tasteit-d72f7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tasteit-d72f7",
    storageBucket: "tasteit-d72f7.appspot.com",
    messagingSenderId: "516411013938",
    appId: "1:516411013938:web:64edefef8e802e1316b52b"
};

// Inițializarea Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);  // Inițializează serviciul de autentificare
 

document.getElementById('logout-button').addEventListener('click', function() {
  getAuth().signOut().then(() => {
      // Logout successful
      alert('Deconectare reușită!');
      window.location.href = 'index.html'; // Redirecționează la pagina de bun venit după logout
  }).catch((error) => {
      // An error happened during logout
      console.error('Eroare la deconectare:', error);
      alert('Eroare la logout: ' + error.message);
  });
});

document.addEventListener('DOMContentLoaded', async function() {
    const container = document.getElementById('restaurant-list');
    const loadMoreBtn = document.getElementById('load-more');
    let itemsPerLoad = 4;
    let currentItem = 0;
    let allData = [];
    let isShowingMore = false;

    // Inițializarea datei cu ziua curentă și setarea limitei pentru selecția datelor anterioare
    const today = new Date();
    const todayStr = today.toISOString().substring(0, 10);
    const dateInput = document.getElementById('reservationDate');
    dateInput.value = todayStr;
    dateInput.setAttribute('min', todayStr);

    const dayMapping = {
        'Sunday': 'duminica',
        'Monday': 'luni',
        'Tuesday': 'marti',
        'Wednesday': 'miercuri',
        'Thursday': 'joi',
        'Friday': 'vineri',
        'Saturday': 'sambata'
    };

    dateInput.addEventListener('change', function() {
        const selectedDate = new Date(dateInput.value);
        setupTimeOptions(selectedDate);  // Actualizăm opțiunile de timp în funcție de data selectată
    });

    async function loadRestaurants() {
        const querySnapshot = await getDocs(collection(db, "restaurants"));
        allData = querySnapshot.docs.map(doc => doc.data());
        displayItems(); // Afișează primele 4 restaurante
    }

    function displayItems() {
        container.innerHTML = ''; // Curăță lista curentă
        let limit = isShowingMore ? 8 : 4;
        allData.slice(0, limit).forEach(data => {
          const safeId = data.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');
            const cardElement = document.createElement('div');
            cardElement.className = 'col-md-3 mb-4';
            cardElement.innerHTML = `
            <div class="card">
    <img src="${data.logo}" class="card-img-top" alt="${data.name}">
    <div class="card-body d-flex flex-column">
        <h5 class="card-title">${data.name}</h5>
        <p class="card-text">${data.description || "No description available"}</p>
        <div class="rating">
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
            <i class="fas fa-star"></i>
        </div>
        <!-- Container pentru butoane -->
        <div class="d-flex justify-content-around mt-2">
            <button class="card-button flex-grow-1 me-2">Details</button>
            <button id="favorite-${safeId}" class="btn btn-danger flex-grow-1">
                            <i class="fas fa-heart"></i>
                        </button>
        </div>
    </div>
</div>
        `; 
            container.appendChild(cardElement);
            cardElement.querySelector('.card-button').addEventListener('click', () => showDetails(data));
            // Adaugă event listener pentru butonul de favorite
            document.getElementById(`favorite-${safeId}`).addEventListener('click', () => addToFavorites(data));
            
        });
        loadMoreBtn.textContent = isShowingMore ? "Show Less" : "Show More";
    }
    

    loadMoreBtn.addEventListener('click', () => {
        isShowingMore = !isShowingMore;
        displayItems();
    });

   
    await loadRestaurants();

    function showDetails(data) {
        document.getElementById('restaurantImage').src = data.logo;
        document.getElementById('restaurantName').textContent = data.name;
        document.getElementById('restaurantDescription').textContent = data.description;
  
        // Handle the schedule and setup reservation time options
        const scheduleElement = document.getElementById('restaurantHours');
        let scheduleHtml = '';
        if (data.schedule && typeof data.schedule === 'object') {
            for (const day in data.schedule) {
                if (data.schedule.hasOwnProperty(day)) {
                    scheduleHtml += `<strong>${day.charAt(0).toUpperCase() + day.slice(1)}:</strong> ${data.schedule[day]}<br>`;
                }
            }
            scheduleElement.innerHTML = scheduleHtml;
            setupTimeOptions(today);  // Se asigură că timpurile sunt stabilite corect la deschiderea detaliilor
        } else {
            scheduleElement.textContent = "Schedule not available";
        }
  
        var myModal = new bootstrap.Modal(document.getElementById('restaurantModal'), {
            keyboard: false
        });
        myModal.show();
    }
   

  function addToFavorites(data) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    // Asigură-te că adaugi numai numele restaurantului ca un string
    const restaurantName = data.name.toString(); // Convertește orice tip de date în string

    if (!favorites.includes(restaurantName)) {
        favorites.push(restaurantName);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert(`${restaurantName} a fost adăugat la favorite!`);
    } else {
        alert(`${restaurantName} este deja în lista de favorite.`);
    }
}

    function setupTimeOptions(date) {
        const dayOfWeek = date.toLocaleString('en-us', { weekday: 'long' });
        const dayKey = dayMapping[dayOfWeek];
        const currentHour = date.getHours();
  
        console.log("Today's schedule key:", dayKey);
  
        const schedule = allData.find(data => data.name === document.getElementById('restaurantName').textContent)?.schedule;
        if (schedule && schedule[dayKey]) {
            const times = schedule[dayKey].split(' - ');
            const startTime = parseInt(times[0].split(':')[0], 10);
            const endTime = parseInt(times[1].split(':')[0], 10);
  
            console.log("Working hours: ", startTime, "to", endTime);
  
            const hourSelect = document.getElementById('reservationHour');
            const minuteSelect = document.getElementById('reservationMinute');
  
            hourSelect.innerHTML = '';
            minuteSelect.innerHTML = '';
  
            // Popularea selectoarelor pentru oră
            for (let hour = startTime; hour <= endTime; hour++) {
                if (date.toISOString().substring(0, 10) === todayStr && hour < currentHour) {
                    continue;  // Nu include orele care au trecut în ziua curentă
                }
                let option = document.createElement('option');
                option.value = hour;
                option.textContent = `${hour}:00`;
                hourSelect.appendChild(option);
            }
  
            // Setează ora implicită la prima disponibilă
            hourSelect.value = hourSelect.firstChild ? hourSelect.firstChild.value : startTime.toString();
  
            // Popularea selectoarelor pentru minut
            for (let minute = 0; minute < 60; minute += 30) {
                let option = document.createElement('option');
                option.value = minute;
                option.textContent = minute < 30 ? `0${minute}` : `${minute}`;
                minuteSelect.appendChild(option);
            }
  
            // Setează minutul implicit la "00"
            minuteSelect.value = "0";
  
            // Actualizare locuri disponibile
            const reservationDate = document.getElementById('reservationDate').value;
            const reservationTime = `${hourSelect.value}:${minuteSelect.value}`;
            const restaurantName = document.getElementById('restaurantName').textContent;
            updateAvailableSeats(restaurantName, reservationDate, reservationTime);
        } else {
            console.error("No schedule for today:", dayKey);
        }
    }
  
    await loadRestaurants();
  });
  
  
  async function fetchRestaurantByName(restaurantName) {
    try {
      // Colecția din care vrem să extragem date
      const restaurantCollection = collection(db, 'restaurants');
      // Creăm un query cu filtru
      const filteredQuery = query(restaurantCollection, where('name', '==', restaurantName.trim()));
      // Obținem toate documentele care respectă query-ul
      const querySnapshot = await getDocs(filteredQuery);
      
      if (querySnapshot.empty) {
        console.log('No matching documents for:', restaurantName);
        alert('Restaurant data not found.');
        return null;
      } else {
        // Assuming the first document found is the correct one
        return querySnapshot.docs[0];  // Returnăm datele primului document găsit
      }
    } catch (error) {
      console.error('Failed to fetch restaurant by name:', error);
      alert('Error fetching restaurant data.');
      return null;
    }
  }
  async function makeReservation() {
    const numSeatsElement = document.getElementById('numSeats');
    const customerPhoneElement = document.getElementById('customerPhone');
    const customerNameElement = document.getElementById('customerName');
    const reservationDateElement = document.getElementById('reservationDate');
    const hourElement = document.getElementById('reservationHour');
    const minuteElement = document.getElementById('reservationMinute');
    const restaurantNameElement = document.getElementById('restaurantName');
  
    if (!numSeatsElement || !customerPhoneElement || !customerNameElement || !reservationDateElement || !hourElement || !minuteElement || !restaurantNameElement) {
      alert('Some form elements are not loaded yet.');
      return;
    }
  
    const numSeats = parseInt(numSeatsElement.value, 10);
    const customerPhone = customerPhoneElement.value;
    const customerName = customerNameElement.value;
    const reservationDate = reservationDateElement.value;
    const reservationTime = `${hourElement.value}:${minuteElement.value}`;
    const restaurantName = restaurantNameElement.textContent;
  
    if (isNaN(numSeats) || numSeats <= 0 || !customerPhone || !customerName || !reservationDate || !reservationTime) {
      alert('Please fill in all fields correctly.');
      return;
    }
  
    // Fetch restaurant data
    const restaurantDoc = await fetchRestaurantByName(restaurantName);
    if (!restaurantDoc) {
      alert('Restaurant data not found.');
      return;
    }
  
    const currentSeats = restaurantDoc.data().numSeats;
    const reservationsRef = collection(db, 'reservations');
    const resQuery = query(reservationsRef, where('restaurantName', '==', restaurantName), where('reservationDate', '==', reservationDate), where('reservationTime', '==', reservationTime));
    const querySnapshot = await getDocs(resQuery);
  
    let totalReservedSeats = 0;
    querySnapshot.forEach(doc => {
      totalReservedSeats += doc.data().numSeats;
    });
  
    if (numSeats + totalReservedSeats > currentSeats) {
      alert(`Not enough seats available. Only ${currentSeats - totalReservedSeats} seats left.`);
      return;
    }
  
    // Add new reservation
    await addDoc(reservationsRef, {
      restaurantName: restaurantName,
      customerName: customerName,
      customerPhone: customerPhone,
      numSeats: numSeats,
      reservationDate: reservationDate,
      reservationTime: reservationTime,
      bookingTime: new Date()
    });
  
    alert('Reservation successful!');
    const myModal = bootstrap.Modal.getInstance(document.getElementById('restaurantModal'));
    myModal.hide();
  }
  
  async function updateAvailableSeats(restaurantName, reservationDate, reservationTime) {
    try {
        const q = query(collection(db, "reservations"), where("restaurantName", "==", restaurantName), where("reservationDate", "==", reservationDate), where("reservationTime", "==", reservationTime));
        const querySnapshot = await getDocs(q);
        let totalReservedSeats = 0;
        querySnapshot.forEach(doc => {
            totalReservedSeats += doc.data().numSeats;
        });
  
        const restaurantDoc = await fetchRestaurantByName(restaurantName);
        if (!restaurantDoc) {
            console.error('Restaurant data not found');
            return;
        }
  
        const currentSeats = restaurantDoc.data().numSeats;
        const availableSeats = currentSeats - totalReservedSeats;
        document.getElementById('availableSeats').textContent = `Locuri disponibile: ${availableSeats}`;
    } catch (error) {
        console.error("Error updating available seats:", error);
    }
  }
  
  document.getElementById('makeReservationButton').addEventListener('click', () => {
    makeReservation(); // Apelarea funcției de rezervare
  });
  
  document.getElementById('reservationDate').addEventListener('change', () => {
    const reservationDate = document.getElementById('reservationDate').value;
    const reservationTime = document.getElementById('reservationTime').value;
    const restaurantName = document.getElementById('restaurantName').textContent;
    updateAvailableSeats(restaurantName, reservationDate, reservationTime);
  });
  
  document.getElementById('reservationHour').addEventListener('change', () => {
    const reservationDate = document.getElementById('reservationDate').value;
    const reservationHour = document.getElementById('reservationHour').value;
    const reservationMinute = document.getElementById('reservationMinute').value;
    const reservationTime = `${reservationHour}:${reservationMinute}`;
    const restaurantName = document.getElementById('restaurantName').textContent;
    updateAvailableSeats(restaurantName, reservationDate, reservationTime);
  });
  
  document.getElementById('reservationMinute').addEventListener('change', () => {
    const reservationDate = document.getElementById('reservationDate').value;
    const reservationHour = document.getElementById('reservationHour').value;
    const reservationMinute = document.getElementById('reservationMinute').value;
    const reservationTime = `${reservationHour}:${reservationMinute}`;
    const restaurantName = document.getElementById('restaurantName').textContent;
    updateAvailableSeats(restaurantName, reservationDate, reservationTime);
  });
  
  console.log(document.getElementById('reservationDate'));
  console.log(document.getElementById('reservationTime'));
  console.log(document.getElementById('numSeats'));
  console.log(document.getElementById('customerPhone'));
  console.log(document.getElementById('customerName'));