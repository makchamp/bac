import './App.css';
import React from 'react';
import { socket, SocketContext } from './services/socket';
import ConnectRoom from './components/ConnectRoom';

function App() {
  return (
    <SocketContext.Provider value={socket}>
      <div className="App">
        <ConnectRoom />
      </div>
    </SocketContext.Provider>
  );
}

export default App;
