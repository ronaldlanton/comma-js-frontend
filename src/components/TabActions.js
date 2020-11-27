import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme) => ({
  dialog: {
    backgroundColor: "var(--background_color)",
    color: "var(--text_primary)",
    border: "none",
  },
  textField: {
    marginLeft: theme.spacing(1),
    flex: 1,
    color: "var(--text_primary)",
    fontSize: "var(--conversation_font_size)",
  },
  disabled: { color: "var(--text_primary)" },
}));

export default function TabActions({
  showTabActions,
  setShowTabActions,
  currentTab,
}) {
  const classes = useStyles();

  const handleClose = () => {
    setShowTabActions(false);
    setAction("list");
  };

  const [action, setAction] = useState("list");
  const [deleteDisabled, setDeleteDisabled] = useState(true);

  useEffect(() => {
    return () => {
      setAction("list");
    };
  }, []);

  const getDialogContent = () => {
    switch (action) {
      case "list":
        return (
          <>
            <DialogTitle id="alert-dialog-title" className={classes.dialog}>
              {"Select an action"}
            </DialogTitle>
            <List
              component="nav"
              className={classes.dialog}
              aria-label="contacts"
            >
              <ListItem button onClick={() => setAction("rename")}>
                <ListItemText primary="Rename" />
              </ListItem>
              <ListItem button onClick={() => setAction("delete")}>
                <ListItemText primary="Delete" />
              </ListItem>
            </List>
          </>
        );
      case "delete":
        return (
          <>
            <DialogTitle id="alert-dialog-title" className={classes.dialog}>
              {"Confirm delete"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                id="alert-dialog-description"
                className={classes.dialog}
              >
                Type {currentTab.tab_name} to delete
              </DialogContentText>
              <TextField
                id="delete-split-input"
                label="Standard"
                className={classes.textField}
                onChange={(e) => {
                  if (e.target.value !== currentTab.tab_name)
                    setDeleteDisabled(true);
                  else setDeleteDisabled(false);
                }}
              />
            </DialogContent>
            <DialogActions className={classes.dialog}>
              <Button
                onClick={handleClose}
                autoFocus
                disabled={deleteDisabled}
                classes={{
                  root: classes.dialog,
                  disabled: classes.disabled,
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        );
      case "rename":
        return (
          <>
            <DialogTitle id="alert-dialog-title" className={classes.dialog}>
              {"Rename Split"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText
                id="alert-dialog-description"
                className={classes.dialog}
              >
                Enter new name:
              </DialogContentText>
              <TextField
                id="delete-split-input"
                label="Standard"
                className={classes.textField}
                onChange={(e) => {
                  if (e.target.value !== currentTab.tab_name)
                    setDeleteDisabled(true);
                  else setDeleteDisabled(false);
                }}
              />
            </DialogContent>
            <DialogActions className={classes.dialog}>
              <Button
                onClick={handleClose}
                autoFocus
                disabled={deleteDisabled}
                classes={{
                  root: classes.dialog,
                  disabled: classes.disabled,
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        );
      default:
      // code block
    }
  };

  return (
    <div>
      <Dialog
        open={showTabActions}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ className: classes.dialog }}
      >
        {getDialogContent()}
      </Dialog>
    </div>
  );
}
