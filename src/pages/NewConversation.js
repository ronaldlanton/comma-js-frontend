import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import Snackbar from "@material-ui/core/Snackbar";
import { useDispatch } from "react-redux";
import { setCurrentConversation } from "../actions";
import MuiAlert from "@material-ui/lab/Alert";
import { makeStyles } from "@material-ui/core/styles";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import PersonAddIcon from "@material-ui/icons/PersonAdd";

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
    color: "white",
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
    fontSize: "small"
  }
}));

//DARK THEME
const theme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

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
    <ThemeProvider theme={theme}>
      <div className="page-container">
        <center>
          <form className={classes.root} noValidate autoComplete="off">
            <Typography variant="h5" gutterBottom className={classes.heading}>
              Add Friend
            </Typography>
            <Grid>
              <FormControl variant="outlined" className={classes.marginSpacing}>
                <InputLabel>Google ID</InputLabel>
                <OutlinedInput
                  error={isError}
                  id="firstName"
                  type="text"
                  onChange={updateStateEmail}
                  className={classes.inputCustom}
                  helperText={errorText}
                  labelWidth={75}
                  autoComplete={false}
                />
                {isError && (
                  <FormHelperText id="my-helper-text">
                    {errorText}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={sendCreateRequest}
              className={classes.button}
            >
              <PersonAddIcon />
              <span className={classes.buttonText}>ADD</span>
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
    </ThemeProvider>
  );
}
