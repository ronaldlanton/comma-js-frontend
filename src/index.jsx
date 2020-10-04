// Application entrypoint.

// Load up the application styles
require("../styles/application.scss");

// Render the top-level React component
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import rootReducer from "./reducers";
import { createStore } from "redux";
import { Provider } from "react-redux";
import Cookies from "universal-cookie";
import { useHistory } from "react-router-dom";
import axios from "axios";

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

const store = createStore(rootReducer);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("react-root")
);
