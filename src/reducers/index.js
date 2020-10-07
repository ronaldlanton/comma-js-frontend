import { combineReducers } from "redux";
import userReducer from "./user";
import conversationReducer from "./conversation";
import applicationDataReducer from "./applicationData";

const rootReducer = combineReducers({
  userReducer: userReducer,
  conversationReducer: conversationReducer,
  applicationDataReducer: applicationDataReducer
});

export default rootReducer;
