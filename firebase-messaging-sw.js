// Firebase Cloud Messaging service worker for M&M Goals.
// Lives at repo root so Vercel serves it from /firebase-messaging-sw.js,
// which is the path the FCM SDK expects by default.
//
// Service workers cannot use ES modules in older browsers, so we use the
// "compat" Firebase builds via importScripts().

/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAd2NcNqkltXHumBBXOGRXzSfF6cfKsUuM",
  authDomain: "goals-dashboard-ee34e.firebaseapp.com",
  projectId: "goals-dashboard-ee34e",
  storageBucket: "goals-dashboard-ee34e.firebasestorage.app",
  messagingSenderId: "538945369053",
  appId: "1:538945369053:web:70bdd45a9b3e34935e7c34"
});

const messaging = firebase.messaging();

// Background handler: fires when the app is NOT focused (tab in background,
// browser closed, phone locked, etc.). The OS shows the notification banner.
messaging.onBackgroundMessage(function (payload) {
  const notif = (payload && payload.notification) || {};
  const data  = (payload && payload.data) || {};
  const title = notif.title || data.title || "M&M";
  const options = {
    body:  notif.body  || data.body  || "",
    icon:  notif.icon  || data.icon  || "/apple-touch-icon.png",
    badge: "/apple-touch-icon.png",
    tag:   data.tag    || "mm-ping",
    data:  {
      click_action: notif.click_action || data.click_action || "/",
    }
  };
  return self.registration.showNotification(title, options);
});

// Tap-to-open: focus an existing tab if one is open, otherwise spawn a new one.
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.click_action) || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      for (const c of list) {
        if ("focus" in c) {
          try { c.navigate(target); } catch (_) { /* older browsers */ }
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
