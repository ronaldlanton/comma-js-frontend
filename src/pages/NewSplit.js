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
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import AddCommentIcon from '@material-ui/icons/AddComment';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    height: "100%",
    padding: "64px 0",
  },
  large: {
    width: theme.spacing(20),
    height: theme.spacing(20),
  },
  inputCustom: {
    borderRadius: "50px",
    color: "var(--text_primary)",
    width: "18rem",
  },
  marginSpacing: {
    margin: "10px",
  },
  button: {
    borderRadius: "25px",
    backgroundColor: "var(--receive_bubble_color)",
    color: "var(--text_primary)",
    textTransform: "none",
    padding: "0px 50px",
    fontSize: "large",
    height: "48px",
    width: "max-content",
    "&:hover": { backgroundColor: "#212121", boxShadow: "none" },
  },
  heading: {
    color: "var(--text_primary)",
  },
  buttonText: {
    margin: "0 12px",
    fontSize: "small",
  },
}));

//DARK THEME
const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

export default function BasicTextFields() {
  const classes = useStyles();
  const history = useHistory();

  const [tabName, setTabName] = useState();
  const [isError, setIsError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [snackBarOpen, setSnackBarOpen] = React.useState(false);

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
        }
      })
      .catch(function (error) {
        console.log(error.response);
        let apiError = error.response.data;
        if (
          apiError.status === 400 &&
          apiError.error === "MAXIMUM_TAB_LIMIT_REACHED"
        ) {
          setIsError(true);
          setErrorText(
            "You already have the maximum number of tabs created on this conversation."
          );
        }
      });
  };

  const loadConversation = () => {
    history.push("/splits");
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="page-container">
        <center>
          <form className={classes.root} noValidate autoComplete="off">
            <Typography variant="h5" gutterBottom className={classes.heading}>
              Create Split
            </Typography>
            <Grid>
              <FormControl variant="outlined" className={classes.marginSpacing}>
                <InputLabel>Split Name</InputLabel>
                <OutlinedInput
                  error={isError}
                  id="firstName"
                  type="text"
                  onChange={updateStateTabName}
                  className={classes.inputCustom}
                  helperText={errorText}
                  labelWidth={76}
                  autoComplete={false}
                />
              </FormControl>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={sendCreateRequest}
              className={classes.button}
            >
              <AddCommentIcon />
              <span className={classes.buttonText}>CREATE</span>
            </Button>
          </form>
          <Snackbar
            open={snackBarOpen}
            autoHideDuration={5000}
            onClose={handleClose}
          >
            <Alert onClose={handleClose} severity="success">
              <span className={classes.buttonText}>Split Created!</span>
            </Alert>
          </Snackbar>
        </center>
      </div>
    </ThemeProvider>
  );
}
