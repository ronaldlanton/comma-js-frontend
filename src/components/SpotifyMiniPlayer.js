import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    maxWidth: "315px",
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto",
    justifyContent: "center",
  },
  cover: {
    width: 96,
    borderRadius: "15px",
    display: "block",
    filter: "brightness(50%)",
  },
  absolute: {
    position: "relative",
    left: "50%",
    top: "50%",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  playIcon: {
    color: "var(--text_primary)",
    height: 38,
    width: 38,
  },
  pauseIcon: {
    color: "var(--text_primary)",
    height: 38,
    width: 38,
  },
}));

export default function SpotifyMiniPlayer({ trackInfo, content }) {
  const classes = useStyles();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElem] = useState(new Audio(trackInfo.preview_url));
  useEffect(() => {
    audioElem.onended = setIsPlaying(false);

    return () => {
      audioElem.pause();
      audioElem.onended = null;
    };
    // eslint-disable-next-line
  }, []);
  const playPauseAudio = () => {
    console.log(isPlaying);
    if (isAudioPlaying(audioElem)) {
      audioElem.pause();
      setIsPlaying(false);
    } else {
      audioElem.play();
      setIsPlaying(true);
    }
  };
  const isAudioPlaying = (audelem) => {
    return !audelem.paused;
  };

  function getUrlFromText(text) {
    // eslint-disable-next-line
    var url = text.match(/(https?\:\/\/)?([^\.\s]+)?[^\.\s]+\.[^\s]+/gi);
    return url;
  }

  var spotifyUrl = getUrlFromText(content);
  if (Array.isArray(spotifyUrl)) spotifyUrl = spotifyUrl[0]; //Incase there are multiple urls in the message, take the 1st one.

  return (
    <center>
      <div className="spotify-player">
        <div className="spotify-album-art">
          <img
            className={classes.cover}
            src={trackInfo.album.images[1].url}
            alt={trackInfo.name}
          />
          <div
            aria-label="play/pause"
            onClick={playPauseAudio}
            className="spotify-play-button"
          >
            {isPlaying === true ? (
              <PauseIcon className={classes.pauseIcon} />
            ) : (
              <PlayArrowIcon className={classes.playIcon} />
            )}
          </div>
        </div>
        <div className="spotify-meta-container">
          <div className="spotify-song-title">{trackInfo.name}</div>
          <div className="spotify-artist-name">
            {trackInfo.artists[0].name}
          </div>
          <a
            className="spotify-call-to-action"
            href={spotifyUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            Play on Spotify
          </a>
        </div>
      </div>
    </center>
  );
}
