import React from 'react';
import io from 'socket.io-client'

const { REACT_APP_HOST_PROTOCOL, REACT_APP_HOST_DOMAIN, REACT_APP_HOST_PORT } = process.env;
const HOST = `${REACT_APP_HOST_PROTOCOL}://${REACT_APP_HOST_DOMAIN}:${REACT_APP_HOST_PORT}`;

const socket = io(HOST, {
  withCredentials: true,
});
const SocketContext = React.createContext();

export {
  socket,
  SocketContext,
};

