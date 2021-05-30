import io from "socket.io-client";

const socket = io(
  /* "https://comma-js.herokuapp.com/", */
  "http://localhost:26398/",
  {
    path: "/api/socket/communicate",
    transports: ["websocket"],
  }
);

export default socket;
