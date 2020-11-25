import React, { useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../actions";
import Cookies from "universal-cookie";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  loginButton: {
    borderRadius: "25px",
    backgroundColor: "var(--receive_bubble_color)",
    color: "var(--text_primary)",
    textTransform: "none",
    padding: "10px 20px",
    fontSize: "large",
    height: "48px",
    width: "max-content",
    marginTop: "32px",
    "&:hover": { backgroundColor: "#212121", boxShadow: "none" },
  },
}));

function Login() {
  //Hooks definitions
  const classes = useStyles();
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
      "https://comma-js.herokuapp.com/api/rest/v1/auth/google";
  };

  const redirectToConversations = () => {
    history.push("/conversations");
  };

  const loginSuccess = () => {
    console.log(userData, token);
    dispatch(setUser(userData));
    localStorage.setItem("userData", JSON.stringify(userData));
    setLoginTokenCookie(token, userData._id);
    axios.defaults.headers.common["Authorization"] =
      "Bearer " + cookies.get("SSID");
    axios.defaults.headers.common["x-cm-user-id"] = cookies.get("USR");
    return history.push("/conversations");
  };

  const setLoginTokenCookie = (token, userId) => {
    let now = new Date();
    let expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    cookies.set("SSID", token, { path: "/", expires: expiry });
    cookies.set("USR", userId, { path: "/", expires: expiry });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
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
    if (status === '"SUCCESS"') return loginSuccess();
    if (cookies.get("SSID") && cookies.get("SSID").length >= 30)
      //If token stored in cookie is 30 or more characters, take user directly to app.
      return redirectToConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* If the URL has a success status, it means user has already clicked the Sign In button and backend has
  returned the control to the same page.  */
  if (status === '"SUCCESS"') return <div></div>;
  //If there is no status
  else {
    if (cookies.get("SSID") && cookies.get("SSID").length >= 30)
      return <div className="page-container"></div>;
    //If there is no token present, it means user is logged out or never logged in.
    return (
      <div className="page-container">
        <div className="login-container">
          <img
            width="210px"
            height="auto"
            alt="Comma Messenger"
            src="/assets/login_bg.svg"
          />
          <span className="appname">Comma</span>
          <Button
            className={classes.loginButton}
            variant="contained"
            onClick={redirectToGoogle}
          >
            <img
              style={{ marginRight: "10px" }}
              width="24px"
              height="auto"
              alt="Sign in with Google"
              src="/assets/G_icon.svg"
            />
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }
}

export default Login;
