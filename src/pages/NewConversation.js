import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import Snackbar from "@material-ui/core/Snackbar";
import { useDispatch } from "react-redux";
import { setCurrentConversation } from "../actions";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";

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
        backgroundColor: "white",
      },
    },
  },
}));

export default function NewConversation() {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();

  const [emailId, setEmailId] = useState();
  const [isError, setIsError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [snackBarOpen, setSnackBarOpen] = React.useState(false);
  const [apiResult, setApiResult] = useState();

  const updateStateEmail = (e) => {
    setEmailId(e.target.value);
  };

  const handleClose = (event, reason) => {
    setSnackBarOpen(false);
    loadSplits(apiResult);
  };

  const sendCreateRequest = () => {
    console.log("creating conversation...");
    axios
      .get("/rest/v1/threads/newThread", {
        params: { email: emailId },
      })
      .then(function (result) {
        console.log(result);
        if (result.data.status === 200) {
          setSnackBarOpen(true);
          setApiResult(result.data.result);
        }
      })
      .catch(function (error) {
        console.log(error.response);
        let apiError = error.response.data;
        if (apiError.status === 400) {
          console.log("400", apiError.error);
          switch (apiError.error) {
            case "DUPLICATE_ENTITY":
              setIsError(true);
              setErrorText("You already have a coversation with this person.");
              break;
            case "SELF_ADD":
              setIsError(true);
              setErrorText(
                "There are better apps to take notes. :) Get Google Keep."
              );
              break;
            default:
            // code block
          }
        } else if (apiError.status === 404) {
          setIsError(true);
          setErrorText(
            "We couldn't find the person you tried to add. Can you double check the email address?"
          );
        }
      });
  };

  const loadSplits = (conversation) => {
    dispatch(setCurrentConversation(conversation));
    history.push("/splits");
  };

  return (
    <div>
      <center>
        <form className={classes.root} noValidate autoComplete="off">
          <Typography variant="h5" gutterBottom>
            Add Friend
          </Typography>
          <TextField
            error={isError}
            id="filled-basic"
            label="Enter Google ID"
            variant="filled"
            onChange={updateStateEmail}
            helperText={errorText}
            InputProps={{ classes: { input: classes.input } }}
          />
          <FormHelperText id="my-helper-text">
            This is typically their gmail address.
          </FormHelperText>
          <Button
            variant="contained"
            color="primary"
            onClick={sendCreateRequest}
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
