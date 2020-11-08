import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import ImageIcon from "@material-ui/icons/Image";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import Dropzone from "react-dropzone";
import Button from "@material-ui/core/Button";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "calc(100%-24px)",
    margin: "12px",
    marginBottom:"4px",
    marginTop: "0",
    backgroundColor: "#212121",
    borderRadius: "35px"
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    color: "var(--text_primary)",
    fontSize: "var(--conversation_font_size)"
  },
  iconButton: {
    padding: 10,
    color: "var(--text_primary)"
  },
  divider: {
    height: 28,
    margin: 4,
    color: "var(--text_primary)"
  },
}));

function ChatComposer({
  currentValue,
  updateComposedMessage,
  sendMessage,
  sendImages,
  inputRef,
  currentTab,
  isMessageListLoading,
}) {
  const classes = useStyles();
  const [isImageUploadDialogOpen, setIsImageUploadDialogOpen] = useState(false);
  const [files, setFiles] = useState([]);

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
      <Paper component="form" className={classes.root}>
        <InputBase
          className={classes.input}
          placeholder="Type a Message"
          value={currentValue}
          onChange={updateComposedMessage}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              console.log("Enter key pressed");
              e.preventDefault();
              sendMessage();
            }
          }}
          inputRef={inputRef}
        />
        <Divider className={classes.divider} orientation="vertical" />
        <IconButton
          className={classes.iconButton}
          onClick={() => setIsImageUploadDialogOpen(!isImageUploadDialogOpen)}
          disabled={isMessageListLoading}
        >
          <ImageIcon />
        </IconButton>
        <IconButton
          className={classes.iconButton}
          onClick={sendMessage}
          disabled={isMessageListLoading}
        >
          <SendIcon />
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
