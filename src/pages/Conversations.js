import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import { useDispatch } from "react-redux";
import { setCurrentConversation } from "../actions";
import { useHistory } from "react-router-dom";
import CircularProgress from "@material-ui/core/CircularProgress";
import Cookies from "universal-cookie";
import socket from "../WebSocket";
import Typography from "@material-ui/core/Typography";
import subscribeUser from "../subscription";
import AddIcon from "@material-ui/icons/Add";
import IconButton from "@material-ui/core/IconButton";
import Switch from "@material-ui/core/Switch";

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
    margin: "28px 18px 0px",
  },
  listItem: {
    marginTop: "12px",
  },
  darkThemeSwitch: {
    float: "right",
    color: "var(--primary_color)",
    marginTop: "4px",
  },
  iconButton: {
    padding: 10,
    color: "var(--text_primary)",
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
  const dispatch = useDispatch();
  const history = useHistory();
  const cookies = new Cookies();

  const classes = useStyles();
  const user = useSelector((state) => {
    return state.userReducer.user;
  });
  const [conversationsList, setConversationsList] = useState([]);
  const conversationsListRef = useRef(conversationsList);
  useEffect(() => {
    conversationsListRef.current = conversationsList;
  }, [conversationsList]);

  const [isLoading, setIsLoading] = useState(true);

  const [darkThemeState, setDarkThemeState] = React.useState(true);

  useEffect(() => {
    var darkThemePreference =
      cookies.get("darkThemePreference") === "true" ? true : false;

    setDarkThemeState(darkThemePreference);
    setTheme(darkThemePreference ? "dark" : "light");
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
          "--dark_element_background:rgb(255, 255, 255)",
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
          "--background_color:rgba(32,33,36,1)",
          "--dark_element_background:#212121",
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

  const getThreads = () => {
    return new Promise((resolve, reject) => {
      axios
        .get("/rest/v1/threads/getThreads", {
          params: {
            limit: 25,
            offset: 0,
          },
        })
        .then((result) => {
          if (result.data.status === 200) {
            let threads = result.data.result;
            resolve(threads);
          }
        });
    });
  };

  const loadSplits = (conversation) => {
    dispatch(setCurrentConversation(conversation));
    history.push("/splits");
  };

  const connectSocket = (token) => {
    return new Promise((resolve, reject) => {
      console.log("socket connection state:", socket.connected);
      if (socket.connected !== true) {
        console.log("connecting socket...");
        socket.emit("_connect", {
          headers: {
            user_id: cookies.get("USR"),
            token: "Bearer " + cookies.get("SSID"),
          },
        });

        socket.on("_connect", () => {
          resolve(true);
        });
      }
    });
  };

  const markNewConversation = (message) => {
    console.log(
      "incoming message... current state list:",
      conversationsListRef.current
    );
    let conversationListCopy = conversationsListRef.current
      .slice()
      .map((conversationElement, index) => {
        if (conversationElement._id === message.thread_id) {
          conversationElement.date_updated = message.date_created;
          conversationElement.new_for.push(user._id);
        }
        return conversationElement;
      });

    console.log(conversationListCopy);
    conversationListCopy = conversationListCopy.sortBy(function (o) {
      return o.date_updated;
    });
    conversationListCopy = conversationListCopy.reverse();
    console.log(conversationListCopy);
    setConversationsList(conversationListCopy);
    window.navigator.vibrate(50); // vibrate for 50ms
    let audio = new Audio("../media/pop.mp3");
    audio.play();
  };

  useEffect(() => {
    if (user._id === null) return history.push("/");
    connectSocket();
    socket.on("_messageIn", markNewConversation);
    getThreads().then((threads) => {
      threads.forEach((thread, index) => {
        let allParticipants = thread.thread_participants;
        threads[index].other_user = allParticipants.find((participant) => {
          return participant._id !== user._id;
        });
      });
      setConversationsList(threads);
      return setIsLoading(false);
    });
    subscribeUser();
    // returned function will be called on component unmount
    return () => {
      socket.off("_messageIn", markNewConversation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading === true ? (
    <div className="page-container">
      <CircularProgress
        className="progres-circle"
        style={{ color: "var(--loader_color)" }}
      />
    </div>
  ) : (
    //If loading is complete.
    <div className="page-container">
      <Typography variant="h5" gutterBottom className={classes.pageTitle}>
        <b>Conversations</b>{" "}
        <IconButton
          style={{ marginBottom: "4px" }}
          onClick={() => history.push("/new-conversation")}
        >
          <AddIcon fontSize="small" className={classes.iconButton}></AddIcon>
        </IconButton>
        <Switch
          checked={darkThemeState}
          onChange={handleChange}
          name="checkedA"
          className={classes.darkThemeSwitch}
          color="default"
          inputProps={{ "aria-label": "secondary checkbox" }}
        />
        <div className="theme-select-text">Dark Theme:</div>
        {/* <div className="theme-select-text">D</div> */}
      </Typography>
      <List className={classes.root}>
        {/*Render list of threads*/}
        {conversationsList.map((conversation) => {
          let splitsText;
          conversation.tabs.length > 1
            ? (splitsText = "splits")
            : (splitsText = "split");
          return (
            <div key={conversation._id}>
              <ListItem
                button
                onClick={() => loadSplits(conversation)}
                className={classes.listItem}
              >
                <ListItemAvatar>
                  <Avatar
                    alt={conversation.other_user.name.givenName}
                    src={conversation.other_user.display_picture}
                  />
                </ListItemAvatar>
                <ListItemText
                  style={{
                    color: "var(--text_primary)",
                  }}
                  primary={
                    conversation.other_user.name.givenName +
                    " " +
                    conversation.other_user.name.familyName
                  }
                  secondary={
                    /* (conversation.tabs.length > 0
                      ? conversation.tabs.length + " " + splitsText
                      : "No Splits") + */
                    conversation.new_for.includes(user._id)
                      ? "unread messages"
                      : ""
                  }
                />
                {conversation.new_for.includes(user._id) && (
                  <Badge
                    color="secondary"
                    variant="dot"
                    invisible={false}
                  ></Badge>
                )}
              </ListItem>
            </div>
          );
        })}
      </List>
    </div>
  );
}

export default Conversations;
