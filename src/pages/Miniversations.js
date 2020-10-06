import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Chip from "@material-ui/core/Chip";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import socket from "../WebSocket";
import Cookies from "universal-cookie";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import Avatar from "@material-ui/core/Avatar";
import CircularProgress from "@material-ui/core/CircularProgress";
import Fade from "@material-ui/core/Fade";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: 400,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

var currentTab = null;
var messageQueue = [];
var isScrollRequestActive = false;
var tabChanged = false;

function Miniversations() {
  const classes = useStyles();

  const cookies = new Cookies();
  const history = useHistory();

  const user = useSelector((state) => {
    return state.userReducer.user;
  });
  const currentConversation = useSelector((state) => {
    return state.conversationReducer.conversation;
  });
  const [tabList, setTabList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [composedMessage, setComposedMessage] = useState("");
  const [isTabListLoading, setIsTabListLoading] = useState(true);
  const [isMessageListLoading, setIsMessageListLoading] = useState(true);

  const getTabs = () => {
    return new Promise((resolve, reject) => {
      axios
        .get("/rest/v1/tabs/getTabs", {
          params: {
            thread_id: currentConversation._id,
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

  const getMessages = (tabId) => {
    return new Promise((resolve, reject) => {
      axios
        .get("/rest/v1/messages/getMessages", {
          params: {
            tab_id: tabId,
            limit: 8,
            offset: tabChanged === true ? 0 : messages.length,
          },
        })
        .then((result) => {
          if (result.data.status === 200) {
            let messages = result.data.result;
            resolve(messages);
          }
        });
    });
  };

  const addMessageToState = (message) => {
    console.log("adding message to state");
    console.log(message, currentTab);
    if (message.tab_id === currentTab._id) {
      let isAlreadyAdded = messages.find((msg) => {
        console.log(msg, message);
        return msg._id === message._id;
      });
      console.log("is already added?", isAlreadyAdded);
      if (!isAlreadyAdded) {
        setMessages((messages) => [...messages, message]);
        updateSeen(message._id);
      }
    }
  };

  const updateSeen = (messageId) => {
    console.log("inside update seen");
    let seenStatus = {
      token: "Bearer " + cookies.get("SSID"),
      tab_id: currentTab._id,
      thread_id: currentConversation._id,
      last_read_message_id: messageId,
    };
    socket.emit("_updateMessageSeen", seenStatus);
  };

  const changeRenderedTab = (tab) => {
    setIsMessageListLoading(true);
    currentTab = tab;
    tabChanged = true;
    getMessages(tab._id).then((msgs) => {
      tabChanged = false;
      msgs = msgs.messages.reverse();
      setIsMessageListLoading(false);
      setMessages(msgs);
      document.getElementById("messageEnd").scrollIntoView();
    });
  };

  const updateComposedMessage = (event) => {
    let composed = event.target.value;
    console.log(composed);
    setComposedMessage(composed);
  };

  const successHandler = (successMessage) => {
    console.log("success message", successMessage);
    switch (successMessage.event) {
      case "_messageOut":
        let stateMessage = {
          content: "",
          date_created: new Date(successMessage.message_id * 1000),
          sender: user._id,
          type: "text",
          _id: successMessage.inserted_id,
        };
        let sentMessage = messageQueue.find((queueItem) => {
          return queueItem.id === successMessage.message_id;
        });
        stateMessage.content = sentMessage.content;
        messageQueue = messageQueue.filter((queueItem) => {
          return queueItem.id !== successMessage.message_id;
        });
        setMessages((messages) => [...messages, stateMessage]);
        document.getElementById("messageEnd").scrollIntoView();
        break;

      default:
        break;
    }
  };

  const sendMessage = () => {
    let messageObject = {
      id: +new Date(),
      token: "Bearer " + cookies.get("SSID"),
      type: "text",
      tab_id: currentTab._id,
      content: composedMessage,
    };
    messageQueue.push(messageObject);
    socket.emit("_messageOut", messageObject);
    setComposedMessage("");
  };

  const handleScroll = (e) => {
    const top = e.target.scrollTop <= 50;

    //Because top scroll threshold is set to 50px, every scroll event fired after reaching gets counted.
    //So once the threshold is reached, we disable making requests for next 2 seconds.
    if (top && isScrollRequestActive === false) {
      console.log("reached top");
      let messagesContainer = document.getElementById("messagesContainer");
      //Store the original height of the div.
      let oldScrollHeight = messagesContainer.scrollHeight;
      //Set scroll request to active so that this does not get fired again.
      isScrollRequestActive = true;
      getMessages(currentTab._id).then((msgs) => {
        if (msgs.messages.length > 0) {
          msgs = msgs.messages.reverse();
          setMessages((messages) => [...msgs, ...messages]);
          //Restore the div to old scroll position.
          messagesContainer.scrollTop =
            messagesContainer.scrollHeight - oldScrollHeight;
        }
      });
      setTimeout(() => {
        isScrollRequestActive = false;
      }, 2000);
    }
  };

  useEffect(() => {
    if (user._id === null || currentConversation._id === null)
      history.push("/");
    socket.on("_messageIn", addMessageToState);
    socket.on("_success", successHandler);
    getTabs().then((tabs) => {
      setIsTabListLoading(false);
      if (tabs.length > 0) {
        setTabList(tabs);
        changeRenderedTab(tabs[0]);
      } else {
        console.log("no tabs.");
        setIsMessageListLoading(false);
      }
    });
    // returned function will be called on component unmount
    return () => {
      socket.off("_messageIn", addMessageToState);
      socket.off("_success", successHandler);
      currentTab = null;
      console.log("Cleaning up socket callback...");
    };
  }, []);

  return (
    <div>
      <Card>
        <CardContent>
          {isTabListLoading === true ? (
            <CircularProgress />
          ) : (
            tabList.map((tab) => {
              return (
                <Chip
                  label={tab.tab_name}
                  onClick={() => changeRenderedTab(tab)}
                />
              );
            })
          )}
          {isMessageListLoading === true ? (
            <CircularProgress />
          ) : (
            <Fade in={true}>
              <div
                style={{
                  height: "auto",
                  maxHeight: "550px",
                  overflowY: "scroll",
                }}
                onScroll={handleScroll}
                id="messagesContainer"
              >
                {" "}
                {messages.map((message) => {
                  let displayPicture = currentConversation.thread_participants.find(
                    (participant) => {
                      return participant._id === message.sender;
                    }
                  );
                  if (displayPicture)
                    displayPicture = displayPicture.display_picture;
                  return (
                    <Card style={{ marginTop: "24px" }}>
                      <CardContent>
                        <Avatar alt="Remy Sharp" src={displayPicture} />
                        <Typography>{message.content}</Typography>
                      </CardContent>
                    </Card>
                  );
                })}
                <div id="messageEnd"></div>
              </div>
            </Fade>
          )}
        </CardContent>
      </Card>
      <div className="compose-container">
        <Paper component="form" className={classes.root}>
          <InputBase
            className={classes.input}
            placeholder="Type a Message"
            value={composedMessage}
            onChange={(event) => updateComposedMessage(event)}
          />
          <Divider className={classes.divider} orientation="vertical" />
          <IconButton className={classes.iconButton} onClick={sendMessage}>
            <SendIcon />
          </IconButton>
        </Paper>
      </div>
    </div>
  );
}

export default Miniversations;
