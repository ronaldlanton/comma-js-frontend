import { combineReducers } from "redux";
import userReducer from "./user";
import conversationReducer from "./conversation";

const rootReducer = combineReducers({
  userReducer: userReducer,
  conversationReducer: conversationReducer,
});

export default rootReducer;
