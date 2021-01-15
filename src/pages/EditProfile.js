import React, { useEffect ,useState} from "react";
import axios from "axios";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from '@material-ui/core/Grid';
import { Avatar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import ImageLightbox from "../components/ImageLightbox";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';

//INLINE STYLE 
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    height  :'100%',
  },
  large: {
    width: theme.spacing(20),
    height: theme.spacing(20),
  },
  inputCustom :{
    borderRadius: '50px',
  },
  loginButton: {
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
  marginSpacing:{
    margin: '10px'
  }
  }));

//DARK THEME
const theme = createMuiTheme({
  palette: {
    type: "dark"
  }
});
var masterState = {};

function EditProfile() {
  //STATE DECLARTION
    const [userProfile, setUserProfile] = useState({display_picture:'',email:'',name:{givenName:"",familyName:""}});
    const [lightboxOpen, setLightboxOpen] = useState(false);
    // const [masterState , setMasterState ] = useState({})
    
    useEffect(()=>{
        axios
        .get("/rest/v1/profile/getProfileInfo", {
        })
        .then((result) => {
          console.log(result) 
            setUserProfile(result.data.result);
            masterState = result.data.result;
        });
    },[])

    const onsubmit = () => {
      console.log(userProfile,masterState)
    }
    const classes = useStyles();

    return <ThemeProvider theme={theme}>
    <div className="page-container">
    <CssBaseline />
    <Grid container
     direction="column"
     justify="space-evenly"
     alignItems="center"
     className={classes.root}
    >
    
    <Grid
    container
    direction="column"
    justify="space-evenly"
    alignItems="center"
    >
      <Grid>
      <Avatar alt="img" src={userProfile.display_picture} className={classes.large} 
      onClick={() => setLightboxOpen(true)}
      />
      </Grid>
      <Grid className={classes.marginSpacing}><Typography>{userProfile.email}</Typography></Grid>
      
    </Grid>
  
  <div>
   <Grid>
   <FormControl variant="outlined" className={classes.marginSpacing} >
   <InputLabel>First Name</InputLabel>
   <OutlinedInput
     id="firstName"
     type= 'text' 
     value = {userProfile.name.givenName}
     onChange={e => { 
     let userProfileCopy = {...userProfile};
      userProfileCopy.name.givenName = e.target.value
      setUserProfile(userProfileCopy)}}
     className ={classes.inputCustom}
     endAdornment={
       <InputAdornment position="end">
         <IconButton edge="end">
          <EditIcon/>
         </IconButton>
       </InputAdornment>
     }
     labelWidth={70}
   />
  </FormControl>
  </Grid>
 
  <Grid >
  <FormControl variant="outlined" className={classes.marginSpacing}>
  <InputLabel>Last Name</InputLabel>
   <OutlinedInput
     id="lastName"
     type= 'text' 
     value = {userProfile.name.familyName}
     onChange={e => {
      let userProfileCopy = {...userProfile};
      userProfileCopy.name.familyName = e.target.value
      setUserProfile(userProfileCopy)}}
     className ={classes.inputCustom}
     endAdornment={
       <InputAdornment position="end">
         <IconButton
           edge="end"
         >
          <EditIcon/>
         </IconButton>
       </InputAdornment>
     }
     labelWidth={70}
   />
 </FormControl>
  </Grid>
  </div>

  <div>
  <Button className={classes.loginButton} variant="contained"
  onClick={()=> onsubmit()
  }>
            Next
            
          </Button>
  </div>
  </Grid>

  {lightboxOpen && (
        <ImageLightbox
          image={userProfile.display_picture}
          title={"Image of " + userProfile.name.givenName}
          onClose={() => setLightboxOpen(false)}
        />
      )}

  </div>
    </ThemeProvider>;
}

export default EditProfile;