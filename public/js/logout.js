document.getElementById('logout-button').addEventListener('click', function() {
    firebase.auth().signOut().then(() => {
        // Logout reușit
        window.location.href = 'welcome.html'; // Redirecționează la pagina de login după logout
    }).catch((error) => {
        // A apărut o eroare la logout
        console.error('Logout failed', error);
    });
});