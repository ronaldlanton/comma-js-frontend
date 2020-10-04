import React from "react";
import { useSelector } from "react-redux";
function Conversations() {
  const user = useSelector((state) => {
    console.log(state.userReducer.user);
    return state.userReducer.user;
  });
  console.log(user);
  return <div>hi, {user.name.givenName}</div>;
}

export default Conversations;
