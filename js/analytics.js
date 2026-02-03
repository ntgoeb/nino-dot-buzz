// Firebase Analytics for nino.buzz
// Logs anonymized visitor info to Firebase Realtime Database
// Note: No IP addresses or personally identifiable information collected

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAfCXBDLYYZdfLSB9FjVuMHGrAmis2CfKw",
    authDomain: "nino-buzz.firebaseapp.com",
    projectId: "nino-buzz",
    storageBucket: "nino-buzz.firebasestorage.app",
    messagingSenderId: "1005714997679",
    appId: "1:1005714997679:web:94c1301de6620a0f53af5a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Log page visit (anonymized - no IP tracking)
async function logVisit() {
    const visitData = {
        timestamp: new Date().toISOString(),
        page: window.location.pathname || '/',
        referrer: document.referrer || 'direct',
        language: navigator.language,
        screenWidth: screen.width,
        screenHeight: screen.height
    };

    try {
        const visitsRef = ref(database, 'visits');
        await push(visitsRef, visitData);
    } catch (error) {
        console.error('Analytics error:', error);
    }
}

// Log visit when page loads
logVisit();
