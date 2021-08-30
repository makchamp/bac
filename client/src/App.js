import './App.css';
import io from 'socket.io-client'
import React, { useEffect } from 'react';
import CreateRoom from './components/CreateRoom';

let socket;
const SERVER = process.env.REACT_APP_SERVER || 'http://localhost:4000';

function App() {
  useEffect(() => {
    socket = io(SERVER);
    socket.on();
  });

  return (
    <div className="App">
      <CreateRoom />
    </div>
  );
}

export default App;
