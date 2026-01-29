// Firebase Analytics for nino.buzz
// Logs visitor info to Firebase Realtime Database

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

// Get visitor IP from external API
async function getVisitorIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'unknown';
    }
}

// Log page visit
async function logVisit() {
    const ip = await getVisitorIP();

    const visitData = {
        timestamp: new Date().toISOString(),
        page: window.location.pathname || '/',
        fullUrl: window.location.href,
        referrer: document.referrer || 'direct',
        userAgent: navigator.userAgent,
        language: navigator.language,
        screenWidth: screen.width,
        screenHeight: screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        ip: ip
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
