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
      switch (data.event) {
        case "message_in":
          let title = "New Message on " + data.payload.tab_name;
          let notificationObject = {
            body: data.payload.content,
            icon: data.payload.icon,
            tag: data.payload.sender,
            renotify: true
          };
          self.registration.showNotification(title, notificationObject);
          break;

        default:
          break;
      }
  });
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  self.clients.openWindow("https://comma-messenger.netlify.app/");
});
