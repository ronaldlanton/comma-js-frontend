import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { useSelector } from "react-redux";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
      width: "25ch",
    },
  },
}));

export default function BasicTextFields() {
  const classes = useStyles();
  const history = useHistory();

  const [tabName, setTabName] = useState();
  const [isError, setIsError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [snackBarOpen, setSnackBarOpen] = React.useState(false);
  const [apiResult, setApiResult] = useState();

  const currentConversation = useSelector((state) => {
    return state.conversationReducer.conversation;
  });
  console.log(currentConversation);
  const updateStateTabName = (e) => {
    setTabName(e.target.value);
  };

  const handleClose = (event, reason) => {
    setSnackBarOpen(false);
    loadConversation();
  };

  const sendCreateRequest = () => {
    console.log("creating conversation...");
    axios
      .post("/rest/v1/tabs/newTab", {
        thread_id: currentConversation._id,
        tab_name: tabName,
        require_authentication: false,
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
        if (apiError.status === 400 && apiError.error === "DUPLICATE_ENTITY") {
          setIsError(true);
          setErrorText("You already have a coversation with this person.");
        }
      });
  };

  const loadConversation = () => {
    history.push("/splits");
  };

  return (
    <div>
      <center>
        <form className={classes.root} noValidate autoComplete="off">
          <Typography variant="h5" gutterBottom>
            Create Split
          </Typography>
          <TextField
            error={isError}
            id="filled-basic"
            label="Name Your Split"
            variant="filled"
            onChange={updateStateTabName}
            helperText={errorText}
          />
          <br></br>
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
            Split Created
          </Alert>
        </Snackbar>
      </center>
    </div>
  );
}
