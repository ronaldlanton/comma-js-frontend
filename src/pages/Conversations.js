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

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper,
  },
}));

function Conversations() {
  const classes = useStyles();
  const user = useSelector((state) => {
    console.log(state.userReducer.user);
    return state.userReducer.user;
  });
  const [conversationsList, setConversationsList] = useState([]);

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

  useEffect(() => {
    getThreads().then((threads) => {
      threads.forEach((thread) => {
        let allParticipants = thread.thread_participants;
        thread.thread_participants = allParticipants.filter((participant) => {
          return participant._id != user._id;
        });
      });
      setConversationsList(threads);
    });
  }, []);

  return (
    <div>
      hi, {user.name.givenName}. Here are your conversations.
      <List className={classes.root}>
        {conversationsList.map((conversation) => {
          return (
            <div>
              <ListItem>
                <ListItemAvatar>
                  <Avatar
                    alt={conversation.thread_participants[0].name.givenName}
                    src={conversation.thread_participants[0].display_picture}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    conversation.thread_participants[0].name.givenName +
                    conversation.thread_participants[0].name.familyName
                  }
                  secondary={
                    conversation.tabs.length > 0
                      ? conversation.tabs.length + " miniversation(s)."
                      : "No miniversations"
                  }
                />
                <Badge
                  color="secondary"
                  variant="dot"
                  invisible={false}
                ></Badge>
              </ListItem>
              <Divider variant="inset" component="li" />
            </div>
          );
        })}
      </List>
    </div>
  );
}

export default Conversations;
