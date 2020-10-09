import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
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

function Conversations() {
  const dispatch = useDispatch();
  const history = useHistory();
  const cookies = new Cookies();

  const classes = useStyles();
  const user = useSelector((state) => {
    console.log(state.userReducer.user);
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
      console.log(socket.connected);
      if (socket.connected != true) {
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

  const markNewConversation = () => {};

  useEffect(() => {
    if (user._id === null) history.push("/");
    connectSocket();
    socket.on("_messageIn", markNewConversation);
    getThreads().then((threads) => {
      threads.forEach((thread, index) => {
        let allParticipants = thread.thread_participants;
        threads[index].other_user = allParticipants.find((participant) => {
          return participant._id != user._id;
        });
      });
      setConversationsList(threads);
      setIsLoading(false);
    });
    // returned function will be called on component unmount
    return () => {
      socket.off("_messageIn", markNewConversation);
    };
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
              <div>
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
