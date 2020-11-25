import React, { useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import CameraIcon from "@material-ui/icons/Camera";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import Dropzone from "react-dropzone";
import Button from "@material-ui/core/Button";
import axios from "axios";
import socket from "../WebSocket";
import Cookies from "universal-cookie";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "calc(100%-24px)",
    margin: "8px",
    marginBottom: "5px",
    marginTop: "0",
    backgroundColor: "var(--receive_bubble_color)",
    borderRadius: "35px",
    boxShadow: "none",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    color: "var(--text_primary)",
    fontSize: "var(--conversation_font_size)",
  },
  iconButton: {
    padding: 10,
    color: "var(--text_primary)",
  },
  divider: {
    height: 28,
    margin: 4,
    color: "var(--text_primary)",
  },
}));

var timeout = undefined;

function ChatComposer({
  currentValue,
  updateComposedMessage,
  sendMessage,
  sendImages,
  currentTab,
  isMessageListAfterTabChangeLoading,
  setIsTyping,
}) {
  const classes = useStyles();
  const [isImageUploadDialogOpen, setIsImageUploadDialogOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const inputRef = useRef();
  const [typing, setTyping] = useState(false);
  const cookies = new Cookies();

  const emitTyping = (boolean) => {
    let typingObject = {
      headers: {
        user_id: cookies.get("USR"),
        token: "Bearer " + cookies.get("SSID"),
      },
      payload: {
        tab_id: currentTab._id,
        status: boolean,
      },
    };
    socket.emit("_updateTypingStatus", typingObject);
  };

  function timeoutFunction() {
    setTyping(false);
    emitTyping(false);
    console.log("stopped typing.");
  }

  function onKeyDownNotEnter() {
    if (typing === false) {
      setTyping(true);
      emitTyping(true);
      console.log("typing...");
      timeout = setTimeout(timeoutFunction, 2000);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(timeoutFunction, 2000);
    }
  }

  const uploadFiles = () => {
    console.log(files, "uploading to tab", currentTab);
    if (files.length > 0) {
      let promises = [];
      files.forEach((file) => {
        let formData = new FormData();
        formData.append("attachment", file);
        formData.append("tab_id", currentTab._id);
        promises.push(
          axios.post("rest/v1/files/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
        );
      });

      axios.all(promises).then(
        axios.spread((...results) => {
          console.log(results);
          let fileNames = [];
          results.forEach((result) => {
            if (result.status === 200) {
              let resultData = result.data.data[0];
              fileNames.push(resultData.file_name);
            }
          });
          console.log(fileNames);
          sendImages(fileNames);
          setFiles([]);
          setIsImageUploadDialogOpen(false);
        })
      );
    }
  };
  const onImageDialogClose = () => {
    setIsImageUploadDialogOpen(false);
  };
  return (
    <div className="compose-container">
      <div class="message-container" id="message-container"></div>
      <Paper component="form" className={classes.root}>
        <IconButton
          className={classes.iconButton}
          onClick={() => setIsImageUploadDialogOpen(!isImageUploadDialogOpen)}
          disabled={isMessageListAfterTabChangeLoading}
        >
          <CameraIcon style={{ opacity: "0.5" }} />
        </IconButton>
        <InputBase
          className={classes.input}
          placeholder="Type a Message"
          value={currentValue}
          id="chat-composer-input"
          onChange={updateComposedMessage}
          onKeyDown={onKeyDownNotEnter}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              console.log("Enter key pressed");
              e.preventDefault();
              sendMessage();
              inputRef.current.focus();
            }
          }}
          inputRef={inputRef}
        />

        <IconButton
          className={classes.iconButton}
          onClick={() => {
            sendMessage();
            inputRef.current.focus();
          }}
          disabled={isMessageListAfterTabChangeLoading}
        >
          <span className="send-button">SEND</span>
        </IconButton>
      </Paper>
      <Dialog
        onClose={onImageDialogClose}
        aria-labelledby="customized-dialog-title"
        open={isImageUploadDialogOpen}
      >
        <MuiDialogTitle
          id="customized-dialog-title"
          onClose={onImageDialogClose}
        >
          Upload an image
        </MuiDialogTitle>
        <MuiDialogContent dividers>
          <Dropzone
            onDrop={(acceptedFiles) => {
              console.log(acceptedFiles);
              setFiles(acceptedFiles);
            }}
          >
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
              </section>
            )}
          </Dropzone>
        </MuiDialogContent>
        <MuiDialogActions>
          <Button onClick={uploadFiles}>Upload</Button>
        </MuiDialogActions>
      </Dialog>
    </div>
  );
}

export default ChatComposer;
