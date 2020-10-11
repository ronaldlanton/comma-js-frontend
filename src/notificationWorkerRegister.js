export default function NotificationServiceWorkerRegister() {
  const swPath = `${process.env.PUBLIC_URL}/notificationWorker.js`;
  if ("serviceWorker" in navigator && process.env.NODE_ENV !== "production") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register(swPath).then((registration) => {
        console.log("Service worker registered");
      });
    });
  }
}
