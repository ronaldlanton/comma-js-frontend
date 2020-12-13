import React, { useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import CameraIcon from "@material-ui/icons/Camera";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import Dropzone from "react-dropzone";
import Button from "@material-ui/core/Button";
import axios from "axios";
import socket from "../WebSocket";
import Cookies from "universal-cookie";
import imageCompression from "browser-image-compression";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "calc(100%-24px)",
    margin: "4px 8px",
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
  sendMessage,
  sendImages,
  currentTab,
  isMessageListAfterTabChangeLoading,
}) {
  const classes = useStyles();
  const [isImageUploadDialogOpen, setIsImageUploadDialogOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const inputRef = useRef();
  const [typing, setTyping] = useState(false);
  const [composedMessage, setComposedMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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

  const onDrop = async (acceptedFiles) => {
    const fileList = await Promise.all(
      acceptedFiles.map(async (file) => {
        if (file.type === "image/png") return file;
        const imageFile = file;
        console.log("originalFile instanceof Blob", imageFile instanceof Blob); // true
        console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);

        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };
        try {
          const compressedFile = await imageCompression(imageFile, options);
          console.log(
            "compressedFile instanceof Blob",
            compressedFile instanceof Blob
          ); // true
          console.log(
            `compressedFile size ${compressedFile.size / 1024 / 1024} MB`
          ); // smaller than maxSizeMB

          return compressedFile;
        } catch (error) {
          console.log(error);
        }
      })
    );
    console.log(acceptedFiles);
    setFiles(fileList);
  };

  const uploadFiles = () => {
    setIsUploading(true);
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
          setIsUploading(false);
        })
      );
    }
  };
  const onImageDialogClose = () => {
    setIsImageUploadDialogOpen(false);
    setFiles([]);
  };

  const updateComposedMessage = (event) => {
    let composed = event.target.value;
    setComposedMessage(composed);
  };

  function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
  }

  const renderFormUploadDialog = () => {
    return (
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
          {files.length > 0 && (
            <div>
              {files.map((file) => {
                console.log(file);
                return (
                  <img
                    key={file.name}
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    height={64}
                    width={64}
                    style={{ objectFit: "cover" }}
                  ></img>
                );
              })}
            </div>
          )}
          <Dropzone
            onDrop={onDrop}
            accept="image/jpeg, image/png"
            maxFiles={10}
          >
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <center>
                    <CloudUploadIcon />
                    <p>Select files</p>
                  </center>
                </div>
              </section>
            )}
          </Dropzone>
        </MuiDialogContent>
        <MuiDialogActions>
          <Button
            onClick={uploadFiles}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </MuiDialogActions>
      </Dialog>
    );
  };

  return (
    <div className="compose-container">
      <Paper component="form" className={classes.root}>
        <IconButton
          className={classes.iconButton}
          onClick={() => setIsImageUploadDialogOpen(!isImageUploadDialogOpen)}
          disabled={isMessageListAfterTabChangeLoading}
        >
          <CameraIcon style={{ opacity: "0.5" }} />
        </IconButton>
        <InputBase
          autoComplete="off"
          className={classes.input}
          placeholder="Type a Message"
          value={composedMessage}
          id="chat-composer-input"
          onChange={updateComposedMessage}
          onKeyDown={onKeyDownNotEnter}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!isEmptyOrSpaces(inputRef.current.value)) {
                sendMessage(composedMessage, setComposedMessage);
                inputRef.current.focus();
              }
            }
          }}
          inputRef={inputRef}
          inputProps={{ "aria-label": "naked" }}
          multiline
        />

        <IconButton
          className={classes.iconButton}
          onClick={() => {
            if (!isEmptyOrSpaces(inputRef.current.value)) {
              sendMessage(composedMessage, setComposedMessage);
              inputRef.current.focus();
            }
          }}
          disabled={isMessageListAfterTabChangeLoading}
        >
          <span className="send-button">SEND</span>
        </IconButton>
      </Paper>
      {renderFormUploadDialog()}
    </div>
  );
}

export default ChatComposer;
