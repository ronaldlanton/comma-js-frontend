import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Cookies from "universal-cookie";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch";
import Fade from "@material-ui/core/Fade";
import Button from "@material-ui/core/Button";
import subscribeUser from "../subscription";
import setTheme from "../helpers/themeSetter";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: "var(--background_color)",
    color: "var(--text_primary) !important",
  },
  pageTitle: {
    fontSize: "large",
    fontWeight: "700",
    color: "var(--primary_color)",
    margin: "22px 18px 0px",
  },
  listItem: {
    paddingTop: "16px",
    paddingBottom: "16px",
  },
  darkThemeSwitch: {
    color: "var(--primary_color)",
  },
  iconButton: {
    padding: 10,
    color: "var(--text_primary)",
  },
  large: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    marginRight: "24px",
  },
}));

//For sorting conversations array efficiently.
//Code copied from: https://stackoverflow.com/a/10124053/12466812
(function () {
  if (typeof Object.defineProperty === "function") {
    try {
      // eslint-disable-next-line no-extend-native
      Object.defineProperty(Array.prototype, "sortBy", { value: sb });
    } catch (e) {}
  }
  // eslint-disable-next-line no-extend-native
  if (!Array.prototype.sortBy) Array.prototype.sortBy = sb;

  function sb(f) {
    for (let i = this.length; i; ) {
      var o = this[--i];
      this[i] = [].concat(f.call(o, o, i), o);
    }
    this.sort(function (a, b) {
      for (var i = 0, len = a.length; i < len; ++i) {
        if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
      }
      return 0;
    });
    for (let i = this.length; i; ) {
      this[--i] = this[i][this[i].length - 1];
    }
    return this;
  }
})();

function Conversations() {
  const cookies = new Cookies();
  const history = useHistory();

  const classes = useStyles();

  const [darkThemeState, setDarkThemeState] = React.useState(true);

  useEffect(() => {
    var darkThemePreference =
      cookies.get("darkThemePreference") === "false" ? false : true;

    setDarkThemeState(darkThemePreference);
    setTheme(darkThemePreference ? "dark" : "light");
    // eslint-disable-next-line
  }, []);

  const handleChange = (event) => {
    setDarkThemeState(event.target.checked);
    const current = new Date();
    const nextYear = new Date();

    nextYear.setFullYear(current.getFullYear() + 1);

    cookies.set("darkThemePreference", event.target.checked, {
      path: "/",
      expires: nextYear,
    });

    if (event.target.checked === false) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const logout = () => {
    localStorage.clear();
    cookies.remove("SSID");
    cookies.remove("USR");
    history.push("/");
  };

  const toggleNotification = () => {
    if (!window.Notification) {
      alert("Notification not supported!");
    } else {
      Notification.requestPermission().then(function (permission) {
        console.log(permission);
        if (permission === "denied") {
          alert("Notification access denied");
        } else if (permission === "granted") {
          subscribeUser();
          alert("Notifications have been enabled");
        }
      });
    }
  };

  return (
    <div className="page-container">
      <Typography variant="h5" gutterBottom className={classes.pageTitle}>
        <b>Settings</b>{" "}
      </Typography>
      <Fade in={true}>
        <div className="settings-container">
          <div className="settings-title">Theme Options</div>
          <div className="settings-block">
            <div className="settings-sub-title vertical-align">
              Dark Theme:{" "}
            </div>
            <Switch
              checked={darkThemeState}
              onChange={handleChange}
              name="checkedA"
              className={classes.darkThemeSwitch}
              color="default"
              inputProps={{ "aria-label": "secondary checkbox" }}
            />
          </div>
          <div className="settings-block column-flex">
            <div className="settings-sub-title">Accent Color: </div>
            <div className="accent-colors-container">
              <div className="theme-accent-icon accent-default"></div>
            </div>
          </div>
          <div className="settings-block column-flex">
            <div className="settings-sub-title">Account Actions: </div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push("/edit-profile")}
            >
              Edit Profile
            </Button>
          </div>
          <div className="settings-block column-flex">
            <div className="settings-sub-title">Account Actions: </div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => toggleNotification()}
            >
              Turn on notifications
            </Button>
          </div>
          <div className="settings-block column-flex">
            <div className="settings-sub-title">Account Actions: </div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => logout()}
            >
              Logout
            </Button>
          </div>
        </div>
      </Fade>
    </div>
  );
}

export default Conversations;
