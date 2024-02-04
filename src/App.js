import './css/App.css';
import WordleGameView from './components/WordleGameView.js';
import { WordleGame } from './model/WordleGame.js';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p />
        <img src="%PUBLIC_URL%/logo.png" className="App-logo" alt="logo" /><p>Matt's Wordle Helper</p>
      </header>
      
      <p />

      <WordleGameView wordleGame={new WordleGame()} />

    </div>
  );
}

export default App;
