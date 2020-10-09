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

const cookies = new Cookies();

//Set defaults for all APIs to send Auth token and content-type.
axios.defaults.baseURL = "https://comma-js.herokuapp.com/api/";
axios.defaults.headers.common["Authorization"] =
  "Bearer " + cookies.get("SSID");
axios.defaults.headers.post["Content-Type"] = "application/json";

//At any point of the app, if there is an UNAUTHORIZED error, redirect to login page.
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 403) {
      const history = useHistory();
      history.push("/");
    }
    return error;
  }
);

socket.on("reconnect", function () {
  socket.emit("_connect", {
    token: "Bearer " + cookies.get("SSID"),
  });

  socket.on("_connect", () => {
    console.log("you have been reconnected");
  });
});

const store = createStore(rootReducer);

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
