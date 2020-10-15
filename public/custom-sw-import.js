const checkAppVisibility = () => {
  return new Promise((resolve, reject) => {
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (windowClients) {
        var clientIsVisible = false;

        for (var i = 0; i < windowClients.length; i++) {
          const windowClient = windowClients[i];

          if (windowClient.visibilityState === "visible") {
            clientIsVisible = true;

            break;
          }
        }

        return resolve(clientIsVisible);
      });
  });
};

self.addEventListener("push", (e) => {
  console.log("New Push Recieved...");
  console.log(e.data);
  const data = e.data.json();
  checkAppVisibility().then((isClientVisible) => {
    console.log("is client visible?", isClientVisible);
    if (isClientVisible === false)
      self.registration.showNotification(data.title, {
        body: data.description,
        icon: data.icon,
      });
  });
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  self.clients.openWindow("https://comma-messenger-dev.netlify.app/");
});
