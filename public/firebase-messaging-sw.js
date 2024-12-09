importScripts("https://www.gstatic.com/firebasejs/7.16.1/firebase-app.js");
importScripts(
    "https://www.gstatic.com/firebasejs/7.16.1/firebase-messaging.js",
);
importScripts(
    "https://www.gstatic.com/firebasejs/7.16.1/firebase-analytics.js",
);

firebase.initializeApp({
    apiKey: "AIzaSyC_4Bx0RchfzAdkpVYwv0pZFIIrswy82vs",
    authDomain: "caryyou-b45f5.firebaseapp.com",
    projectId: "caryyou-b45f5",
    storageBucket: "caryyou-b45f5.firebasestorage.app",
    messagingSenderId: "683558202016",
    appId: "1:683558202016:web:8e30f1c19fcfd49846f7c5",
    measurementId: "G-8XGFLN1313",
});
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
    console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload,
    );
    // Customize notification here
    var logoIcon = "{{asset('public/assets/images/ch2.png')}}";
	console.log("logoIcon",logoIcon)
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.message,
        icon: logoIcon,
        data:payload.data
    };

    return self.registration.showNotification(
        notificationTitle,
        notificationOptions,
    );
});

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Forces the waiting service worker to become active
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim()); // Claims control of all clients
});








