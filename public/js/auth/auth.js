// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDMaBqtKCC9AzBjkizITrlE7ErnJW3dkDg",
    authDomain: "agritechecom.firebaseapp.com",
    projectId: "agritechecom",
    storageBucket: "agritechecom.firebasestorage.app",
    messagingSenderId: "454616246675",
    appId: "1:454616246675:web:948a6597e4a6b51cd06066",
    measurementId: "G-VS6K3KRBN2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        console.log('Logout button found');
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                console.log('Attempting to sign out...');
                await signOut(auth);
                console.log('User signed out successfully');
                window.location.href = "/account.html"; // Redirect to login page
                localStorage.clear();
            } catch (error) {
                console.error('Error signing out:', error.message);
                alert('Failed to log out. Please try again.');
            }
        });
    } else {
        console.error('Logout button not found in the DOM');
    }
});

//Function to check if the user is logged in
function checkUserAuth() {
    onAuthStateChanged(auth, (user) => {
        if (window.location.pathname === "/account.html") {
            if (user) {
                window.location.href = "/index.html";
            }
        }
        else if (!user) {
            window.location.href = "/account.html";
        }
    });
}

checkUserAuth();

document.addEventListener('DOMContentLoaded', () => {

    //Signup
    const signUpForm = document.getElementById('signup-form');
    signUpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        //Signup details
        const signUpName = document.getElementById('signup-name').value;
        const signUpEmail = document.getElementById('signup-email').value;
        const signUpPhone = document.getElementById('signup-phone').value;
        const userAddress = document.getElementById('signup-address').value;
        const signUpPassword = document.getElementById('signup-password').value;
        const userRole = document.getElementById('user-role').value;

        //Farmer details
        const farmName = document.getElementById('farm-name').value;
        const farmLocation = document.getElementById('farm-location').value;
        const farmSize = document.getElementById('farm-size').value;
        const certification = document.getElementById('farm-certifications').value;
        const farmProducts = document.getElementById('farm-products').value;

        //Bank details
        const bankName = document.getElementById('bank-name').value;
        const accountNumber = document.getElementById('account-number').value;
        const ifscCode = document.getElementById('ifsc-code').value;

        //Government id details
        const aadharNumber = document.getElementById('aadhar-number').value;
        const panNumber = document.getElementById('pan-number').value;

        //form data
        const formData = {
            name: signUpName,
            email: signUpEmail,
            phone: signUpPhone,
            role: userRole,
            farm_name: farmName,
            farm_location: farmLocation,
            farm_size: farmSize,
            certifications: certification,
            farm_products: farmProducts,
            bank_name: bankName,
            account_number: accountNumber,
            ifsc_code: ifscCode,
            aadhar_number: aadharNumber,
            pan_number: panNumber,
            address: userAddress
        };

        createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword)
            .then((userCredential) => {
                const user = userCredential.user;
                localStorage.setItem('userId', user.uid);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert("Error:" + errorMessage + "\n" + "Error code:" + errorCode);
            });
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                window.location.href = "/account.html";
            } else {
                alert("Error: " + result.message);
            }

        } catch (error) {
            alert("Error:" + error);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loginEmail = document.getElementById('login-email').value;
        const loginPassword = document.getElementById('login-password').value;
        signInWithEmailAndPassword(auth, loginEmail, loginPassword)
            .then((userCredential) => {
                const user = userCredential.user;
                localStorage.setItem('userId', user.uid);
                localStorage.setItem('userEmail', loginEmail);
            });
    });
});




