import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import axios from "axios";
import SpotifyMiniPlayer from "./SpotifyMiniPlayer";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    animation: "grow 0.2s ease-in-out;",
  },
}));

function MessageBubble({
  senderProfile,
  message,
  currentTab,
  lastSeenMessage,
  currentConversation,
  isTyping,
}) {
  const classes = useStyles();
  let senderName = senderProfile
    ? senderProfile.name.givenName + " " + senderProfile.name.familyName
    : "";

  const user = useSelector((state) => {
    return state.userReducer.user;
  });

  let seenIconProfile = currentConversation.thread_participants.find(
    (participant) => {
      return participant._id !== user._id;
    }
  );

  let seenIcon = seenIconProfile.display_picture;

  const [imageFile, setImageFile] = useState("");
  const [spotifyMeta, setSpotifyMeta] = useState();

  useEffect(() => {
    if (message.type === "image" && imageFile === "") {
      axios
        .get("/rest/v1/files/download", {
          params: {
            tab_id: currentTab._id,
            file_name: message.file_name,
          },
        })
        .then((result) => {
          if (result.data.status === 200) {
            console.log(result.data.data[0].presigned_url);
            setImageFile(result.data.data[0].presigned_url);
          }
        });
    }
    if (
      message.content &&
      message.content.includes("https://open.spotify.com/track/")
    ) {
      var spotifyUrl = getUrlFromText(message.content);
      if (Array.isArray(spotifyUrl)) spotifyUrl = spotifyUrl[0]; //Incase there are multiple urls in the message, take the 1st one.

      const urlSegments = new URL(spotifyUrl).pathname.split("/");
      const trackId = urlSegments.pop() || urlSegments.pop(); // Handle potential trailing slash
      console.log(trackId);

      axios
        .get("/rest/v1/spotify/getTrackInfo", {
          params: {
            track_id: trackId,
          },
        })
        .then((result) => {
          if (result.data.status === 200) {
            setSpotifyMeta(result.data.result);
            console.log(result.data.result.preview_url);
          }
        });
    }
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <div className="bubblewrap">
        {/* <Avatar alt={senderName} src={displayPicture} /> */}
        <span
          className={
            (message.sender === user._id ? "send-bubble" : "receive-bubble") +
            (!message._id ? " bubble-dim" : "")
          }
        >
          {message.type === "text" ? (
            <Typography>{message.content}</Typography>
          ) : (
            <img
              alt={message.file_name}
              src={imageFile}
              style={{ width: "100%", height: "auto", borderRadius: "25px" }}
            ></img>
          )}
        </span>
      </div>
      {message.content &&
        message.content.includes("https://open.spotify.com/track/") &&
        spotifyMeta &&
        spotifyMeta.preview_url && (
          <span
            className={
              (message.sender === user._id ? "send-bubble" : "receive-bubble") +
              (!message._id ? " bubble-dim" : "")
            }
          >
            <SpotifyMiniPlayer
              trackInfo={spotifyMeta}
              content={message.content}
            />
          </span>
        )}

      {lastSeenMessage === message._id && (
        <div className="bubblewrap">
          <Avatar
            alt={senderName}
            src={seenIcon}
            style={{ display: "inline-block", marginLeft: "12px" }}
            className={classes.small}
          />
          {isTyping && (
            <div className="typing-container">
              <div class="tiblock">
                <div class="tidot"></div>
                <div class="tidot"></div>
                <div class="tidot"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function getUrlFromText(text) {
  // eslint-disable-next-line
  var url = text.match(/(https?\:\/\/)?([^\.\s]+)?[^\.\s]+\.[^\s]+/gi);
  return url;
}

export default MessageBubble;
