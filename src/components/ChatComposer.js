import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: "100%",
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

function ChatComposer({ currentValue, updateComposedMessage, sendMessage }) {
  const classes = useStyles();
  return (
    <div className="compose-container">
      <Paper component="form" className={classes.root}>
        <InputBase
          className={classes.input}
          placeholder="Type a Message"
          value={currentValue}
          onChange={updateComposedMessage}
        />
        <Divider className={classes.divider} orientation="vertical" />
        <IconButton className={classes.iconButton} onClick={sendMessage}>
          <SendIcon />
        </IconButton>
      </Paper>
    </div>
  );
}

export default ChatComposer;
