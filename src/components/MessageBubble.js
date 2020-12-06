import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import axios from "axios";
import SpotifyMiniPlayer from "./SpotifyMiniPlayer";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import ImageLightbox from "./ImageLightbox";

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
  imagePreview: {
    width: "100%",
    height: "auto",
    objectFit: "cover",
    borderRadius: "22px",
  },
  imageLoaderWrapper: {
    height: "72px",
    width: "72px",
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
  const [imageLoading, setImageLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
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

  const imageOnload = () => {
    let messagesContainer = document.getElementById("messagesContainer");

    let isAlreadyAtBottom =
      messagesContainer.scrollHeight -
        messagesContainer.offsetHeight -
        messagesContainer.scrollTop <=
      50;

    setTimeout(() => {
      if (isAlreadyAtBottom) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 1);

    setImageLoading(false);
  };

  const bubbleType =
    message.sender === user._id ? "send-bubble" : "receive-bubble";
  const dimmedClass = !message._id ? " bubble-dim" : "";
  const bubbleClassName = bubbleType + dimmedClass;

  const getTextBubble = () => {
    return (
      <div className="bubblewrap">
        <span className={bubbleClassName}>
          <Typography>{message.content}</Typography>
        </span>
      </div>
    );
  };

  const getImageBubble = () => {
    return (
      <div className="bubblewrap">
        <span className={bubbleClassName + " minimum-padding-bubble"}>
          <div
            className={classes.imageLoaderWrapper}
            style={{ display: imageLoading ? "block" : "none" }}
          >
            <CircularProgress
              className="progres-circle image-loader-small"
              style={{
                color: "var(--primary_color)",
              }}
            />
          </div>
          <img
            style={{
              display: imageLoading ? "none" : "block",
              cursor: "pointer",
              "-webkit-tap-highlight-color": "rgba(0, 0, 0, 0)",
            }}
            alt={"Image from " + senderProfile.name.givenName}
            src={imageFile}
            onLoad={imageOnload}
            className={classes.imagePreview}
            id={message.file_name}
            onClick={() => setLightboxOpen(true)}
          ></img>
        </span>
      </div>
    );
  };

  const hasSpotifyLink = spotifyMeta && spotifyMeta.preview_url;

  const getSpotifyPlayer = () => {
    return (
      <span className={bubbleClassName}>
        <SpotifyMiniPlayer trackInfo={spotifyMeta} content={message.content} />
      </span>
    );
  };

  const getSeenAvatar = () => {
    return (
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
    );
  };

  return (
    <>
      {message.type === "text" ? getTextBubble() : getImageBubble()}

      {hasSpotifyLink && getSpotifyPlayer()}

      {lastSeenMessage === message._id && getSeenAvatar()}

      {lightboxOpen && (
        <ImageLightbox
          image={imageFile}
          title={"Image From " + senderName}
          onClose={() => setLightboxOpen(false)}
        />
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
