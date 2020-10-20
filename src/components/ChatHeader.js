import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import Badge from "@material-ui/core/Badge";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import IconButton from "@material-ui/core/IconButton";

function ChatHeader({
  isTabListLoading,
  tabList,
  newContentTabs,
  changeRenderedTab,
}) {
  const history = useHistory();

  const [selectedTab, setSelectedTab] = React.useState();

  const user = useSelector((state) => {
    return state.userReducer.user;
  });
  const currentConversation = useSelector((state) => {
    return state.conversationReducer.conversation;
  });

  const handleTabSelect = (event, tabId) => {
    setSelectedTab(tabId);
  };
  let receiverProfile = currentConversation.thread_participants.find(
    (participant) => {
      return participant._id !== user._id;
    }
  );
  return (
    <div className="header-backdrop">
      {isTabListLoading === true ? (
        <div></div>
      ) : (
        <center>
          <div>
            <Typography>{receiverProfile.name.givenName}</Typography>

            <Avatar
              alt={receiverProfile.name.givenName}
              src={receiverProfile.display_picture}
            />
          </div>
          <ToggleButtonGroup
            value={selectedTab}
            exclusive
            aria-label="text alignment"
            onChange={handleTabSelect}
          >
            {tabList.map((tab) => {
              return (
                <ToggleButton
                  key={tab._id}
                  value={tab._id}
                  aria-label="left aligned"
                  onClick={() => changeRenderedTab(tab)}
                >
                  <Badge
                    color="secondary"
                    variant="dot"
                    invisible={!newContentTabs.includes(tab._id)}
                    style={{ marginRight: "8px" }}
                  ></Badge>
                  {tab.tab_name}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
          <IconButton
            onClick={() => history.push("/new-split")}
          >
            <AddCircleOutlineIcon></AddCircleOutlineIcon>
          </IconButton>
        </center>
      )}
    </div>
  );
}
/* <Chip
    label={tab.tab_name}
    onClick={() => changeRenderedTab(tab)}
    avatar={
      <Badge
        color="secondary"
        variant="dot"
        invisible={!newContentTabs.includes(tab._id)}
      ></Badge>
    }
  ></Chip> */

export default ChatHeader;
