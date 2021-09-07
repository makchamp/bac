import './App.css';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { socket, SocketContext } from './services/socket';
import ConnectRoom from './components/ConnectRoom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <SocketContext.Provider value={socket}>
          <ConnectRoom />
        </SocketContext.Provider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
