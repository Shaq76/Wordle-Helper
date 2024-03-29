
import './css/App.css';
import icon from './Wordle.png';
import WordleGameView from './components/WordleGameView.js';
import { WordleGame } from './model/WordleGame.js';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p />
        {/*<WordleTileCell className="grid-cell" tile={new WordleTile('W', TileState.Correct)} />*/}
        {/*<img src="%PUBLIC_URL%/logo.png" className="App-logo" alt="logo" />*/}
        <img src={icon} className="App-logo" alt="logo" />
        <p>Matt's Wordle Helper</p>
      </header>
      
      <p />

      <WordleGameView wordleGame={new WordleGame()} />

    </div>
  );
}

export default App;
