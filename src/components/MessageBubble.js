import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";

function MessageBubble({ senderProfile, content }) {
  let displayPicture = senderProfile ? senderProfile.display_picture : null;
  let senderName = senderProfile
    ? senderProfile.name.givenName + " " + senderProfile.name.familyName
    : "";

  return (
    <Card style={{ marginTop: "24px" }}>
      <CardContent>
        <Avatar alt={senderName} src={displayPicture} />
        <Typography>{content}</Typography>
      </CardContent>
    </Card>
  );
}

export default MessageBubble;
