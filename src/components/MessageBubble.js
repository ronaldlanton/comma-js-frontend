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
  isNextMessageSender,
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
  var bubbleClassName = bubbleType + dimmedClass;

  const getTextBubble = () => {
    const emojiRegex = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])+$/;

    const isOnlyEmojis =
      emojiRegex.test(message.content) && message.content.length <= 40;

    if (isOnlyEmojis) bubbleClassName += " emoji-bubble";

    const last = !isNextMessageSender && !isOnlyEmojis ? " last" : "";

    bubbleClassName += last;

    return (
      <div className="bubblewrap">
        <span
          className={bubbleClassName}
          style={{ marginBottom: isNextMessageSender ? "-3px" : "6px" }}
        >
          <Typography>{message.content}</Typography>
        </span>
      </div>
    );
  };

  const getImageBubble = () => {
    return (
      <div className="bubblewrap">
        <span
          className={bubbleClassName + " minimum-padding-bubble"}
          style={{ marginBottom: isNextMessageSender ? "-3px" : "6px" }}
        >
          <div
            className={classes.imageLoaderWrapper}
            style={{ display: imageLoading ? "block" : "none" }}
          >
            <CircularProgress
              className="progres-circle image-loader-small"
              style={{
                color: "var(--text_primary)",
              }}
            />
          </div>
          <img
            style={{
              display: imageLoading ? "none" : "block",
              cursor: "pointer",
              WebkitTapHighlightColor: "rgba(0, 0, 0, 0)",
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
          title={"Image from " + senderName}
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
