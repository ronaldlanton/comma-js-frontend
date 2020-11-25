import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
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
    width: 151,
    borderRadius: "15px",
  },
  controls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  playIcon: {
    height: 38,
    width: 38,
  },
  pauseIcon: {
    height: 38,
    width: 38,
  },
}));

export default function SpotifyMiniPlayer(trackInfo) {
  const classes = useStyles();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElem] = useState(new Audio(trackInfo.trackInfo.preview_url));
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
  return (
    <center>
      <div className="spotify-player">
        <CardContent className={classes.content}>
          <Typography component="h5" variant="h5">
            {trackInfo.trackInfo.name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {trackInfo.trackInfo.artists[0].name}
          </Typography>
          <div className={classes.controls}>
            <IconButton aria-label="play/pause" onClick={playPauseAudio}>
              {isPlaying === true ? (
                <PauseIcon className={classes.pauseIcon} />
              ) : (
                <PlayArrowIcon className={classes.playIcon} />
              )}
            </IconButton>
          </div>
        </CardContent>
        <img
          className={classes.cover}
          src={trackInfo.trackInfo.album.images[1].url}
          alt={trackInfo.trackInfo.name}
        />
      </div>
    </center>
  );
}
