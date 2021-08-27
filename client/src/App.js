import logo from './logo.svg';
import './App.css';

import io from 'socket.io-client'

const socket = io(process.env.REACT_APP_SERVER || 'http://localhost:4000');

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
        </a>
      </header>
    </div>
  );
}

export default App;
