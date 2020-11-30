import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { useDispatch } from "react-redux";
import { setCurrentConversation } from "../actions";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "25ch",
      color: "var(--text_primary)",
    },
    input: {
      "&::placeholder": {
        color: "var(--text_primary)",
        backgroundColor: "white"
      },
    },
  },
}));

export default function CreateNew({entityName, createFunction, lastHistoryPage, placeHolderText}) {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const [input, setInput] = useState();
  const [isError, setIsError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [snackBarOpen, setSnackBarOpen] = React.useState(false);
  const [apiResult, setApiResult] = useState();

  const updateStateInput = (e) => {
    setInput(e.target.value);
  };

  const handleClose = (event, reason) => {
    setSnackBarOpen(false);
    loadEntity(apiResult);
  };

  const loadEntity = (conversation) => {
    dispatch(setCurrentConversation(conversation));
    history.push("/" + lastHistoryPage);
  };

  return (
    <div>
      <center>
        <form className={classes.root} noValidate autoComplete="off">
          <Typography variant="h5" gutterBottom>
            {"Create new " + entityName}
          </Typography>
          <TextField
            error={isError}
            id="filled-basic"
            label={placeHolderText}
            variant="filled"
            onChange={updateStateInput}
            helperText={errorText}
            InputProps={{ classes: { input: classes.input } }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={createFunction}
          >
            Add
          </Button>
        </form>
        <Snackbar
          open={snackBarOpen}
          autoHideDuration={5000}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity="success">
            Friend Added
          </Alert>
        </Snackbar>
      </center>
    </div>
  );
}
