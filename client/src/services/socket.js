import React from 'react';
import io from 'socket.io-client'

const SERVER = process.env.REACT_APP_SERVER || 'http://localhost:4000';

const socket = io(SERVER, {
  withCredentials: true,
});
const SocketContext = React.createContext();

export {
  socket,
  SocketContext,
};

