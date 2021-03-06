import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import socket from "../WebSocket";
import Cookies from "universal-cookie";
import CircularProgress from "@material-ui/core/CircularProgress";
import ChatHeader from "../components/ChatHeader";
import ChatComposer from "../components/ChatComposer";
import MessageBubble from "../components/MessageBubble";
import Fade from "@material-ui/core/Fade";

var currentTab = null;
var messageQueue = [];
var stateMessageQueue = [];
var isScrollRequestActive = false;
var tabChanged = false;
var currentTabIds = [];

function Splits() {
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
  const tabListRef = useRef(tabList);
  useEffect(() => {
    tabListRef.current = tabList;
  }, [tabList]);
  const [messages, setMessages] = useState([]);
  const [historyTopReached, setHistoryTopReached] = useState(false);
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [lastSeenMessage, setLastSeenMessage] = useState();
  const [isTabListLoading, setIsTabListLoading] = useState(true);
  const [isMessageListLoading, setIsMessageListLoading] = useState(true);
  const IsMessageListLoadingRef = useRef(isMessageListLoading);
  useEffect(() => {
    IsMessageListLoadingRef.current = isMessageListLoading;
  }, [isMessageListLoading]);
  const [
    isMessageListAfterTabChangeLoading,
    setisMessageListAfterTabChangeLoading,
  ] = useState(true);

  const [newContentTabs, setNewContentTabs] = useState([]);
  const newContentTabsRef = useRef(newContentTabs);
  useEffect(() => {
    newContentTabsRef.current = newContentTabs;
  }, [newContentTabs]);
  const [isTyping, setIsTyping] = useState(false);

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
    setIsMessageListLoading(true);
    return new Promise((resolve, reject) => {
      axios
        .get("/rest/v1/messages/getMessages", {
          params: {
            tab_id: tabId,
            limit: 25,
            offset: tabChanged === true ? 0 : messages.length,
          },
        })
        .then((result) => {
          if (result.data.status === 200) {
            let messages = result.data.result;
            if (messages.length < 25) setHistoryTopReached(true);
            return resolve(messages);
          }
        })
        .catch((e) => {
          console.error("Error loading messages:", e);
        })
        .finally(() => {
          isScrollRequestActive = false;
          setIsMessageListLoading(false);
        });
    });
  };

  const addMessageToState = (message) => {
    console.log("isMessageListLoading", IsMessageListLoadingRef);
    if (IsMessageListLoadingRef.current === true) {
      stateMessageQueue.push(message);
      console.log(
        "add to state deferred for " + message._id + " due to message load."
      );
      return;
    }

    if (message.tab_id === currentTab._id) {
      let isAlreadyAdded = messages.find((msg) => {
        return msg._id === message._id;
      });

      if (!isAlreadyAdded) {
        setMessages((messages) => [...messages, message]);
        updateSeen(message._id);

        if (message.sender !== user._id) setLastSeenMessage(message._id);

        let messagesContainer = document.getElementById("messagesContainer");
        window.navigator.vibrate(50); // vibrate for 50ms

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

  const processStateMessageQueue = () => {
    console.log(
      "processing message queue...",
      "message loading has been set to",
      isMessageListLoading
    );
    stateMessageQueue.forEach((queueItem, index) => {
      stateMessageQueue.splice(index, 1);
      addMessageToState(queueItem);
    });
  };

  const updateSeen = (messageId) => {
    //If user is in some other tab or is not currently focussed on the messenger.
    if (document.visibilityState === "hidden") return;

    if (!messageId && messagesRef.current.length === 0) return;

    if (!messageId || typeof messageId === "object")
      messageId = messagesRef.current[messagesRef.current.length - 1]._id;

    console.log("inside update seen");
    let seenStatus = {
      headers: {
        user_id: cookies.get("USR"),
        token: "Bearer " + cookies.get("SSID"),
      },
      payload: {
        tab_id: currentTab._id,
        thread_id: currentConversation._id,
        last_read_message_id: messageId,
      },
    };
    socket.emit("_updateMessageSeen", seenStatus);
  };

  const changeRenderedTab = (tab) => {
    if (isMessageListLoading === false) setIsMessageListLoading(true);
    setHistoryTopReached(false);
    setisMessageListAfterTabChangeLoading(true);
    setIsTyping(false);
    currentTab = tab;
    tabChanged = true;

    console.log(
      "getting last seen message",
      getLastSeenMessageFromTabObject(tab),
      tab
    );
    setLastSeenMessage(getLastSeenMessageFromTabObject(tab));

    getMessages(tab._id).then((msgs) => {
      tabChanged = false;
      msgs = msgs.reverse();
      setMessages(msgs);
      setIsMessageListLoading(false);
      let changedNewContentTabs = newContentTabsRef.current
        .slice()
        .filter((tabId) => {
          return tabId !== tab._id;
        });
      setNewContentTabs(changedNewContentTabs);
      setisMessageListAfterTabChangeLoading(false);
      let bottomElement = document.getElementById("messageEnd");
      if (bottomElement) document.getElementById("messageEnd").scrollIntoView();
    });
  };

  const getLastSeenMessageFromTabObject = (tabObject) => {
    let seenStatusArray = tabObject.seen_status;

    let seenStatus = seenStatusArray.find((status) => {
      return status.user_id !== user._id;
    });

    return seenStatus.last_read_message_id;
  };

  const setOtherUserMessageSeen = (payload) => {
    if (payload.tab_id === currentTab._id)
      setLastSeenMessage(payload.last_read_message_id);

    let tabListCopy = [...tabListRef.current];
    let indexToUpdate = tabListCopy.findIndex(
      (tab) => tab._id === payload.tab_id
    );

    tabListCopy[indexToUpdate].seen_status.forEach((seenObject, index) => {
      if (seenObject.user_id !== user._id) {
        tabListCopy[indexToUpdate].seen_status[index].last_read_message_id =
          payload.last_read_message_id;
      }
    });
    setTabList(tabListCopy);
  };

  const setTypingStatus = (payload) => {
    if (payload.tab_id === currentTab._id) setIsTyping(payload.status);
  };

  const processMessageOutSuccess = (successMessage) => {
    let stateMessage, sentMessage;
    let refArray = messagesRef.current;

    switch (successMessage.type) {
      case "text":
        let messagesCopy = [...refArray];

        for (let index = 0; index < messagesCopy.length; index++) {
          const currentMessage = messagesCopy[index];
          if (currentMessage.id === successMessage.message_id) {
            currentMessage._id = successMessage.inserted_id;
            break;
          }
        }
        setMessages(messagesCopy);
        updateSeen(successMessage.inserted_id);
        break;

      case "image":
        stateMessage = {
          date_created: new Date(successMessage.message_id * 1000),
          sender: user._id,
          type: "image",
          file_name: "",
          _id: successMessage.inserted_id,
        };
        sentMessage = messageQueue.find((queueItem) => {
          console.log(queueItem);
          return queueItem.payload.id === successMessage.message_id;
        });
        console.log(sentMessage);
        stateMessage.file_name = sentMessage.payload.file_name;

        setMessages((messages) => [...messages, stateMessage]);
        updateSeen(stateMessage._id);
        break;

      default:
        break;
    }
    document.getElementById("messageEnd").scrollIntoView();

    messageQueue = messageQueue.filter((queueItem) => {
      return queueItem.id !== successMessage.message_id;
    });
  };

  const successHandler = (successMessage) => {
    console.log("success message", successMessage);
    switch (successMessage.event) {
      case "_messageOut":
        processMessageOutSuccess(successMessage);
        break;

      default:
        break;
    }
  };

  const sendMessage = (composedMessage, setComposedMessage) => {
    let messageObject = {
      headers: {
        user_id: cookies.get("USR"),
        token: "Bearer " + cookies.get("SSID"),
      },
      payload: {
        id: +new Date(),
        type: "text",
        date_created: new Date(),
        tab_id: currentTab._id,
        content: composedMessage,
      },
    };
    messageQueue.push(messageObject);
    socket.emit("_messageOut", messageObject);
    messageObject.payload.sender = user._id;
    setMessages((messages) => [...messages, messageObject.payload]);
    setComposedMessage("");
    setTimeout(() => {
      document.getElementById("messageEnd").scrollIntoView();
    }, 1);
  };

  const sendImages = (fileNames) => {
    fileNames.forEach((fileName) => {
      let messageObject = {
        headers: {
          user_id: cookies.get("USR"),
          token: "Bearer " + cookies.get("SSID"),
        },
        payload: {
          id: +new Date(),
          type: "image",
          tab_id: currentTab._id,
          file_name: fileName,
        },
      };
      messageQueue.push(messageObject);
      socket.emit("_messageOut", messageObject);
    });
    /* return console.log("adding files to chat..."); */
  };

  const handleScroll = (e) => {
    const top = e.target.scrollTop <= 50;
    const messagesContainer = document.getElementById("messagesContainer");
    const messagesContainerShadow = document.getElementById(
      "message-container-shadow"
    );

    //Because top scroll threshold is set to 50px, every scroll event fired after reaching gets counted.
    //So once the threshold is reached, we disable making requests for next 1 seconds.
    if (top && isScrollRequestActive === false) {
      console.log("reached top");
      //Store the original height of the div.
      let oldScrollHeight = messagesContainer.scrollHeight;
      //Set scroll request to active so that this does not get fired again.
      isScrollRequestActive = true;
      getMessages(currentTab._id).then((msgs) => {
        if (msgs.length > 0) {
          msgs = msgs.reverse();
          setMessages((messages) => [...msgs, ...messages]);
          //Restore the div to old scroll position.
          messagesContainer.scrollTop =
            messagesContainer.scrollHeight - oldScrollHeight;
        }
      });
    }

    if (
      !(
        messagesContainer.scrollHeight -
          messagesContainer.offsetHeight -
          messagesContainer.scrollTop <=
        5
      )
    ) {
      if (messagesContainerShadow)
        messagesContainerShadow.classList.add("scrolled");
    } else {
      if (messagesContainerShadow)
        messagesContainerShadow.classList.remove("scrolled");
    }
  };

  const checkForNewMessages = () => {
    if (document.visibilityState === "hidden") return;

    console.log("checking for new messages...");
    axios
      .get("/rest/v1/messages/getMessages", {
        params: {
          tab_id: currentTab._id,
          limit: 10,
          offset: 0,
        },
      })
      .then((result) => {
        if (result.data.status === 200) {
          let messages = result.data.result;
          messages = messages.reverse();
          setMessages((msgs) => {
            var ids = new Set(msgs.map((d) => d._id));
            let merged = [...msgs, ...messages.filter((d) => !ids.has(d._id))];
            return merged;
          });
        }
      })
      .catch((e) => {
        console.error("Error loading messages:", e);
      });
  };

  useEffect(() => {
    //If user types the url directly, we would not have any conversation to display tabs and messages for, so redirect them to home.
    if (user._id === null || currentConversation._id === null)
      return history.push("/");

    //Socket callbacks
    socket.on("_messageIn", addMessageToState);
    socket.on("_messageSeen", setOtherUserMessageSeen);
    socket.on("_typingStatus", setTypingStatus);
    socket.on("_success", successHandler);
    socket.on("_connect", checkForNewMessages);
    document.addEventListener("visibilitychange", updateSeen);
    document.addEventListener("visibilitychange", checkForNewMessages);

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
      console.log("cleaning up socket callbacks...");
      socket.off("_messageIn", addMessageToState);
      socket.off("_messageSeen", setOtherUserMessageSeen);
      socket.off("_typingStatus", setTypingStatus);
      socket.off("_success", successHandler);
      socket.off("_connect", checkForNewMessages);
      document.removeEventListener("visibilitychange", updateSeen);
      document.removeEventListener("visibilitychange", checkForNewMessages);
      currentTab = null;
      currentTabIds = [];
      messageQueue = [];
      stateMessageQueue = [];
      isScrollRequestActive = false;
      tabChanged = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isMessageListLoading === false) processStateMessageQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMessageListLoading]);

  //Render.
  return (
    <div className="page-container">
      <div className="chat-screen-container">
        <ChatHeader
          isTabListLoading={isTabListLoading}
          isMessageListAfterTabChangeLoading={
            isMessageListAfterTabChangeLoading
          }
          tabList={tabList}
          newContentTabs={newContentTabs}
          changeRenderedTab={changeRenderedTab}
          isMessageLoading={isMessageListLoading}
        />

        {isMessageListAfterTabChangeLoading === true ? (
          <CircularProgress
            className="progres-circle fixed"
            style={{ color: "var(--loader_color)" }}
          />
        ) : (
          <Fade in={true}>
            <div
              className="messages-container"
              onScroll={handleScroll}
              id="messagesContainer"
            >
              {historyTopReached && (
                <div class="bubblewrap first-message"></div>
              )}
              <div className="bubblewrap messages-info-top">
                Upto 30 days of message history is stored
              </div>
              {messages.map((message, index) => {
                let senderProfile = currentConversation.thread_participants.find(
                  (participant) => {
                    return participant._id === message.sender;
                  }
                );
                let isNextMessageSender =
                  messages[index + 1] &&
                  messages[index + 1].sender === message.sender;
                return (
                  <MessageBubble
                    key={message._id}
                    senderProfile={senderProfile}
                    displayPicture={senderProfile}
                    message={message}
                    currentTab={currentTab}
                    lastSeenMessage={lastSeenMessage}
                    currentConversation={currentConversation}
                    isTyping={isTyping}
                    isNextMessageSender={isNextMessageSender}
                  />
                );
              })}
              <div id="messageEnd" className="bubblewrap"></div>
            </div>
          </Fade>
        )}

        {!isMessageListAfterTabChangeLoading && (
          <ChatComposer
            sendMessage={sendMessage}
            sendImages={sendImages}
            isMessageListAfterTabChangeLoading={
              isMessageListAfterTabChangeLoading
            }
            currentTab={currentTab}
          />
        )}
      </div>
    </div>
  );
}

export default Splits;
