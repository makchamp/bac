import './App.css';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { socket, SocketContext } from './services/socket';
import ConnectRoom from './components/ConnectRoom';

function App() {
  return (
    <BrowserRouter>
      <SocketContext.Provider value={socket}>
        <div className="App">
          <ConnectRoom />
        </div>
      </SocketContext.Provider>
    </BrowserRouter>
  );
}

export default App;
