import React, { useContext } from "react";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../actions";
import Cookies from "universal-cookie";

function Login() {
  const history = useHistory();
  const dispatch = useDispatch();
  const cookies = new Cookies();

  const windowUrl = window.location.search;
  const params = new URLSearchParams(windowUrl);
  //API reponse parameters
  const status = params.get("status");
  const userData = JSON.parse(params.get("user_data"));
  const token = params.get("token");

  const redirectToGoogle = () => {
    window.location.href =
      "http://comma-js.herokuapp.com/api/rest/v1/auth/google";
  };

  const loginSuccess = () => {
    console.log(userData, token);
    dispatch(setUser(userData));
    localStorage.setItem("userData", JSON.stringify(userData));
    setLoginTokenCookie(token);
    return history.push("/conversations");
  };

  const setLoginTokenCookie = (token) => {
    let now = new Date();
    let expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    cookies.set("SSID", token, { path: "/", expires: expiry });
  };

  //If user data is already available, load it up in memory.
  let storedUserDetails = localStorage.getItem("userData");
  if (storedUserDetails) {
    try {
      storedUserDetails = JSON.parse(storedUserDetails);
      dispatch(setUser(storedUserDetails));
    } catch (e) {
      localStorage.removeItem("userData");
      cookies.remove("SSID");
      history.push("/");
    }
  }

  /* If the URL has a success status, it means user has already clicked the Sign In button and backend has
  returned the control to the same page.  */
  if (status === '"SUCCESS"') return <div>{loginSuccess()}</div>;
  //If there is no status
  else {
    return cookies.get("SSID") && cookies.get("SSID").length >= 30 ? (
      //If token stored in cookie is 40 characters (standard length from server), take user directly to app.
      <div>{history.push("/conversations")}</div>
    ) : (
      //If there is no token present, it means user is logged out or never logged in.
      <div className="login-container">
        <Button variant="contained" onClick={redirectToGoogle}>
          Sign In
        </Button>
      </div>
    );
  }
}

export default Login;
