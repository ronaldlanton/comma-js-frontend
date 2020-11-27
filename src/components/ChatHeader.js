import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import IconButton from "@material-ui/core/IconButton";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import CircularProgress from "@material-ui/core/CircularProgress";
import Fade from "@material-ui/core/Fade";
import useLongPress from "../helpers/useLongPress";
import TabActions from "./TabActions";

const useStyles = makeStyles((theme) => ({
  avatarSmall: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    margin: "12px",
    marginRight: "20px",
  },
  iconButton: {
    color: "var(--text_primary)",
  },
}));

function ChatHeader({
  isTabListLoading,
  tabList,
  newContentTabs,
  changeRenderedTab,
  isMessageLoading,
  isMessageListAfterTabChangeLoading,
}) {
  const classes = useStyles();

  const history = useHistory();

  const backspaceLongPress = useLongPress(() => {
    console.log("long pressed");
    setShowTabActions(true);
  }, 500);

  const [currentTab, setCurrentTab] = React.useState(0);
  const [showTabActions, setShowTabActions] = React.useState(0);

  const user = useSelector((state) => {
    return state.userReducer.user;
  });
  const currentConversation = useSelector((state) => {
    return state.conversationReducer.conversation;
  });

  let receiverProfile = currentConversation.thread_participants.find(
    (participant) => {
      return participant._id !== user._id;
    }
  );
  return (
    <>
      <div className="header-backdrop" style={{ color: "white" }}>
        {isTabListLoading === true ? (
          <div></div>
        ) : (
          <>
            <Fade in={true}>
              <div className="receiver-details">
                <IconButton
                  className="back-button"
                  onClick={() => history.push("/conversations")}
                >
                  <ArrowBackIosIcon
                    style={{ fill: "var(--primary_color)" }}
                  ></ArrowBackIosIcon>
                </IconButton>
                <div className="receiver-name">
                  {receiverProfile.name.givenName}
                </div>

                <Avatar
                  className={classes.avatarSmall}
                  alt={receiverProfile.name.givenName}
                  src={receiverProfile.display_picture}
                />
              </div>
            </Fade>

            {/* <center>
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
                      style={{ color: "var(--text_primary)" }}
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

              <IconButton onClick={() => history.push("/new-split")}>
                <AddCircleOutlineIcon></AddCircleOutlineIcon>
              </IconButton>
            </center> */}
            <Fade in={true}>
              <div className="splits">
                {tabList.map((tab, index) => {
                  return (
                    <div
                      className={
                        currentTab === index ? "activeSplit" : "inactiveSplit"
                      }
                      key={"split_" + index}
                      onClick={() => {
                        changeRenderedTab(tab);
                        setCurrentTab(index);
                      }}
                      {...backspaceLongPress}
                    >
                      <span style={{ verticalAlign: "baseline" }}>
                        {tab.tab_name}
                      </span>
                      {newContentTabs.includes(tab._id) && (
                        <span className="ndot"></span>
                      )}
                    </div>
                  );
                })}

                <IconButton
                  size="small"
                  onClick={() => history.push("/new-split")}
                >
                  <AddIcon
                    fontSize="small"
                    className={classes.iconButton}
                  ></AddIcon>
                </IconButton>
                <TabActions
                  showTabActions={showTabActions}
                  setShowTabActions={setShowTabActions}
                  currentTab={tabList[currentTab]}
                ></TabActions>
              </div>
            </Fade>
          </>
        )}
      </div>
      {isMessageLoading === true &&
        isMessageListAfterTabChangeLoading === false && (
          <span className="more-messages-circle">
            <CircularProgress
              style={{
                color: "var(--loader_color)",
                width: "28px",
                height: "28px",
              }}
            />
          </span>
        )}
    </>
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
