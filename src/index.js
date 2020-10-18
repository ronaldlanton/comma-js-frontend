import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import rootReducer from "./reducers";
import { createStore } from "redux";
import { Provider } from "react-redux";
import Cookies from "universal-cookie";
import { useHistory } from "react-router-dom";
import axios from "axios";
import socket from "./WebSocket";
import db from "./database/database";

db.info().then(function (info) {
  console.log(info);
});
const cookies = new Cookies();

//Set defaults for all APIs to send Auth token and content-type.
axios.defaults.baseURL = "https://comma-js.herokuapp.com/api/";
axios.defaults.headers.common["Authorization"] =
  "Bearer " + cookies.get("SSID");
axios.defaults.headers.common["x-cm-user-id"] = cookies.get("USR");
axios.defaults.headers.post["Content-Type"] = "application/json";

//At any point of the app, if there is an UNAUTHORIZED error, redirect to login page.
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 403) {
      cookies.remove("SSID", { path: "/" });
      cookies.remove("USR", { path: "/" });
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

//On success of any API request, increase token validity by one day, because that's what the backend does too.
//This is done so that as long as the user is active, they are never logged out.
axios.interceptors.response.use(
  function (response) {
    if (response.status === 200) {
      let currentSSID = cookies.get("SSID");
      let currentUSR = cookies.get("USR");
      let now = new Date();
      let expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      cookies.set("SSID", currentSSID, { path: "/", expires: expiry });
      cookies.set("USR", currentUSR, { path: "/", expires: expiry });
      console.log("token validity extended.");
    }
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

socket.on("reconnect", function () {
  socket.emit("_connect", {
    user_id: cookies.get("USR"),
    token: "Bearer " + cookies.get("SSID"),
  });

  socket.on("_connect", () => {
    console.log("you have been reconnected");
  });
});

const store = createStore(rootReducer);

/* subscribeUser(); */

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
