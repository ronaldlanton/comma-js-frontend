import React, { useEffect, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  details: {
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: "1 0 auto",
  },
  cover: {
    width: 151,
  },
  controls: {
    display: "flex",
    alignItems: "center",
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
  const [audioElem, setAudioElem] = useState(
    new Audio(trackInfo.trackInfo.preview_url)
  );
  useEffect(() => {
    return () => {
      audioElem.pause();
      audioElem.onended = setIsPlaying(false);
    };
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
    <Card className={classes.root}>
      <div className={classes.details}>
        <CardContent className={classes.content}>
          <Typography component="h5" variant="h5">
            {trackInfo.trackInfo.name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {trackInfo.trackInfo.artists[0].name}
          </Typography>
        </CardContent>
        <div className={classes.controls}>
          <IconButton aria-label="play/pause" onClick={playPauseAudio}>
            {isPlaying === true ? (
              <PauseIcon className={classes.pauseIcon} />
            ) : (
              <PlayArrowIcon className={classes.playIcon} />
            )}
          </IconButton>
        </div>
      </div>
      <CardMedia
        className={classes.cover}
        image={trackInfo.trackInfo.album.images[1].url}
      />
    </Card>
  );
}
