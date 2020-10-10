import React, { useEffect, useState } from "react";
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
import Fade from "@material-ui/core/Fade";
import Cookies from "universal-cookie";
import socket from "../WebSocket";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
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
  const [isLoading, setIsLoading] = useState(true);

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

  const loadMiniversations = (conversation) => {
    dispatch(setCurrentConversation(conversation));
    history.push("/miniversations");
  };

  const connectSocket = (token) => {
    return new Promise((resolve, reject) => {
      console.log("socket connection state:", socket.connected);
      if (socket.connected !== true) {
        console.log("connecting socket...");
        socket.emit("_connect", {
          token: "Bearer " + cookies.get("SSID"),
        });

        socket.on("_connect", () => {
          resolve(true);
        });
      }
    });
  };

  const markNewConversation = (message) => {
    console.log("marking new conv", conversationsList);
    let newConversationList = conversationsList.map((conversationElement) =>
      conversationElement.thread_id === message.thread_id
        ? {
            ...conversationElement,
            date_created: message.date_created,
            new_for: [...conversationElement.new_for, user.id],
          }
        : {
            ...conversationElement,
            new_for: [...conversationElement.new_for],
          }
    );
    console.log(newConversationList);
    let conversationListCopy = newConversationList.splice();
    conversationListCopy = newConversationList.sortBy(function (o) {
      return o.date_created;
    });
    console.log(conversationListCopy);
    setConversationsList(conversationListCopy);
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
      setIsLoading(false);
    });
    // returned function will be called on component unmount
    return () => {
      socket.off("_messageIn", markNewConversation);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading === true ? (
    <CircularProgress />
  ) : (
    //If loading is complete.
    <Fade in={true}>
      <div>
        <Typography
          variant="h5"
          gutterBottom
          style={{
            marginLeft: "16px",
            marginTop: "16px",
            marginBottom: "16px",
          }}
        >
          <b>Conversations</b>
        </Typography>
        <List className={classes.root}>
          {/*Render list of threads*/}
          {conversationsList.map((conversation) => {
            return (
              <div key={conversation._id}>
                <ListItem
                  button
                  onClick={() => loadMiniversations(conversation)}
                >
                  <ListItemAvatar>
                    <Avatar
                      alt={conversation.other_user.name.givenName}
                      src={conversation.other_user.display_picture}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      conversation.other_user.name.givenName +
                      conversation.other_user.name.familyName
                    }
                    secondary={
                      conversation.tabs.length > 0
                        ? conversation.tabs.length + " miniversation(s)."
                        : "No miniversations"
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
    </Fade>
  );
}

export default Conversations;
