import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Cookies from "universal-cookie";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch";
import Fade from "@material-ui/core/Fade";

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

  const classes = useStyles();
  const user = useSelector((state) => {
    return state.userReducer.user;
  });

  const [darkThemeState, setDarkThemeState] = React.useState(true);

  useEffect(() => {
    var darkThemePreference =
      cookies.get("darkThemePreference") === "false" ? false : true;

    setDarkThemeState(darkThemePreference);
    setTheme(darkThemePreference ? "dark" : "light");
    // eslint-disable-next-line
  }, []);

  const setThemeVariables = (variables) => {
    variables.forEach((variable) => {
      let varName = variable.split(":")[0];
      let varValue = variable.split(":")[1];
      document.documentElement.style.setProperty(varName, varValue);
    });
  };

  const setTheme = (themeName) => {
    switch (themeName) {
      case "light":
        //Light theme variables
        setThemeVariables([
          "--background_color:#ebedf0",
          "--foreground_element_color:rgb(110, 110, 110)",
          "--background_alpha:255, 255, 255",
          "--split_button_background_color:rgb(255, 255, 255)",
          "--text_primary:rgb(24, 24, 24)",
          "--receive_bubble_color:rgb(255, 255, 255)",
          "--receive_text_color:rgb(24, 24, 24)",
          "--sender_bubble_gradient:linear-gradient(to bottom,#00D0EA 15%,rgb(0, 140, 201) 90%)",
        ]);
        break;
      case "dark":
        setThemeVariables([
          "--background_color:#212121",
          "--foreground_element_color:rgb(60, 64, 67)",
          "--background_alpha:24, 24, 24",
          "--split_button_background_color:rgb(0, 140, 201)",
          "--text_primary:rgb(240, 240, 240)",
          "--receive_bubble_color:#404040",
          "--receive_text_color:rgb(240, 240, 240)",
          "--sender_bubble_gradient:linear-gradient(to bottom,rgb(0, 140, 201) 15%,rgb(0, 75, 107) 90%)",
        ]);
        break;
      default:
      // code block
    }
  };

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

  return (
    <div className="page-container">
      <Typography variant="h5" gutterBottom className={classes.pageTitle}>
        <b>Settings</b>{" "}
      </Typography>
      <Fade in={true}>
        <div className="settings-container">
          <div className="settings-title">Theme Options</div>
          <div className="settings-block">
            <div className="settings-sub-title vertical-align">Dark Theme: </div>
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
        </div>
      </Fade>
    </div>
  );
}

export default Conversations;
