import React, { useState } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import axios from "axios";

function MessageBubble({ senderProfile, message, currentTab }) {
  let displayPicture = senderProfile ? senderProfile.display_picture : null;
  let senderName = senderProfile
    ? senderProfile.name.givenName + " " + senderProfile.name.familyName
    : "";

  const [imageFile, setImageFile] = useState("");

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
  return (
    <Card style={{ marginTop: "24px" }} variant="outlined">
      <CardContent>
        <Avatar alt={senderName} src={displayPicture} />
        {message.type === "text" ? (
          <Typography>{message.content}</Typography>
        ) : (
          <img alt={message.file_name} src={imageFile}></img>
        )}
      </CardContent>
    </Card>
  );
}

export default MessageBubble;
