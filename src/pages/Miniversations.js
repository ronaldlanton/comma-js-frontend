import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import socket from "../WebSocket";
import Cookies from "universal-cookie";
import CircularProgress from "@material-ui/core/CircularProgress";
import Fade from "@material-ui/core/Fade";
import ChatHeader from "../components/ChatHeader";
import ChatComposer from "../components/ChatComposer";
import MessageBubble from "../components/MessageBubble";

var currentTab = null;
var messageQueue = [];
var isScrollRequestActive = false;
var tabChanged = false;
var currentTabIds = [];

function Miniversations() {
  const cookies = new Cookies();
  const history = useHistory();

  //Redux selections.
  const user = useSelector((state) => {
    return state.userReducer.user;
  });
  const currentConversation = useSelector((state) => {
    return state.conversationReducer.conversation;
  });

  //State variables.
  const [tabList, setTabList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [composedMessage, setComposedMessage] = useState("");
  const [isTabListLoading, setIsTabListLoading] = useState(true);
  const [isMessageListLoading, setIsMessageListLoading] = useState(true);
  const [newContentTabs, setNewContentTabs] = useState([]);

  //Functions.
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
            limit: 10,
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
    if (message.tab_id === currentTab._id) {
      let isAlreadyAdded = messages.find((msg) => {
        console.log(msg, message);
        return msg._id === message._id;
      });

      if (!isAlreadyAdded) {
        setMessages((messages) => [...messages, message]);
        updateSeen(message._id);
        let messagesContainer = document.getElementById("messagesContainer");
        //If the user is having the conversation scrolled to almost at the bottom, scroll the div to it's bottom to show the
        //new message.
        if (
          messagesContainer.scrollHeight -
            messagesContainer.scrollTop -
            messagesContainer.clientHeight <=
          500
        )
          document.getElementById("messageEnd").scrollIntoView();
      }
    } else {
      console.log(message.tab_id, tabList, messages);
      let tabToMarkNew = currentTabIds.find((id) => {
        console.log(id, message.tab_id);
        return id === message.tab_id;
      });
      console.log(tabToMarkNew);
      if (tabToMarkNew) {
        setNewContentTabs((newContentTabs) => [
          ...newContentTabs,
          tabToMarkNew,
        ]);
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
      let changedNewContentTabs = newContentTabs.filter((tabId) => {
        return tabId != tab._id;
      });
      setNewContentTabs(changedNewContentTabs);
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
    //If user types the url directly, we would not have any conversation to display tabs and messages for, so redirect them to home.
    if (user._id === null || currentConversation._id === null)
      history.push("/");

    //Socket callbacks
    socket.on("_messageIn", addMessageToState);
    socket.on("_success", successHandler);

    //When component loads, get all tabs and then render the messages for first tab in list.
    getTabs().then((tabs) => {
      setIsTabListLoading(false);
      tabs.forEach((tab) => {
        currentTabIds.push(tab._id);
        if (tab.new_for && tab.new_for.includes(user._id))
          setNewContentTabs((newContentTabs) => [...newContentTabs, tab._id]);
      });
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
      currentTabIds = [];
      messageQueue = [];
      isScrollRequestActive = false;
      tabChanged = false;
      console.log("Cleaning up socket callback...");
    };
  }, []);

  //Render.
  return (
    <div>
      <Card>
        <CardContent>
          <ChatHeader
            isTabListLoading={isTabListLoading}
            tabList={tabList}
            newContentTabs={newContentTabs}
            changeRenderedTab={changeRenderedTab}
          />
          {isMessageListLoading === true ? (
            <CircularProgress />
          ) : (
            <Fade in={true}>
              <div
                style={{
                  height: "auto",
                  maxHeight: "80vh",
                  overflowY: "scroll",
                }}
                onScroll={handleScroll}
                id="messagesContainer"
              >
                {" "}
                {messages.map((message) => {
                  let senderProfile = currentConversation.thread_participants.find(
                    (participant) => {
                      return participant._id === message.sender;
                    }
                  );
                  return (
                    <MessageBubble
                      senderProfile={senderProfile}
                      displayPicture={senderProfile}
                      content={message.content}
                    />
                  );
                })}
                <div id="messageEnd"></div>
              </div>
            </Fade>
          )}
        </CardContent>
      </Card>
      <ChatComposer
        currentValue={composedMessage}
        updateComposedMessage={updateComposedMessage}
        sendMessage={sendMessage}
      />
    </div>
  );
}

export default Miniversations;
