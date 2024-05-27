document.getElementById('logout-button').addEventListener('click', function() {
    firebase.auth().signOut().then(() => {
        
        window.location.href = 'welcome.html'; 
    }).catch((error) => {
        
        console.error('Logout failed', error);
    });
});