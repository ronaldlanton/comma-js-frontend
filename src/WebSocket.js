import io from "socket.io-client";

const socket = io("https://comma-js.herokuapp.com/", {
  path: "/api/socket/communicate",
  transports: ["websocket"],
});

export default socket