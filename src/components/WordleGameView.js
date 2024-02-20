import React, { Component } from 'react'
import { WordleGuess } from '../model/WordleGuess'
import WordleGuessView from '../components/WordleGuessView'
import { WordList } from '../model/WordList'
import '../css/button.css'
import WordleResultsView from './WordleResultsView'
import workerScript from '../Worker'

class WordleGameView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            wordleGame: props.wordleGame,
            showInputError: false,
            results: this.findResults(),
            loops: null,
            working: false,
            showInfo: false
        }

        this.handleCalculate = this.handleCalculate.bind(this)
        this.handleCalculateCancel = this.handleCalculateCancel.bind(this);
    }

      handleCalculate() {
        if(this.worker){
            return
        }

        this.worker = new Worker(workerScript)
        this.worker.addEventListener('message', e => {
            //alert(e)
          const type = e.data.type;
          if (type === 'loading') {
            const { loops, scoredWords } = e.data;
            this.setState({
                loops: loops,
                results: scoredWords
            })
          }
          else {
            const { result } = e.data;
            this.setState({
              result
            })
          }
        })

        const words = this.findResults()
        this.worker.postMessage(words)

        this.setState({
            working: true,
        })
      }

      handleCalculateCancel(){
        if(this.worker){
            this.worker.terminate()
        }
        this.worker = null

        this.setState({working:false})
    }

    toggleInfo = ()=>{
        this.setState({ showInfo: !this.state.showInfo })
    }

    onGuessClicked = () => {
        let guess = document.getElementById("GuessEdit").value
        document.getElementById("GuessEdit").value = ""
        this.addGuess(guess)
    }

    onResetClicked = () => {
        this.handleCalculateCancel()
        this.state.wordleGame.guesses = []
        this.setState({
            results: this.findResults(),
            loops: null,
            scoredWords: [],
            showInputError: false
        })
    }

    addGuess(guess){
        if (this.state.wordleGame.guesses.length === 6) {
            return;
        }

        let newState = { ...this.state }
        if (guess.length !== 5 || !this.isAlpha(guess)) {
            newState.showInputError = true;
        }
        else {
            newState.showInputError = false;
            newState.wordleGame.guesses.push(new WordleGuess(guess))
            newState.results = this.findResults()
            newState.loops = 0
            newState.scoredWords = []

            this.handleCalculateCancel()
        }

        this.setState(newState);

        this.handleCalculateCancel()
    }

    onGetResultsClicked = () => {
        let newState = {...this.state}
        newState.results = this.findResults()
        this.setState(newState)

        this.forceUpdate()
    }

    isAlpha = str => /^[a-zA-Z]*$/.test(str);

    scoreWord = (vocab, guess) => {
        //         vocab,   guess,  expectedResult
        //match(ui,'abc',   'abc',  '222');
        //match(ui,'aabbc', 'axxaa','20010');

        let vocabPos = 0

        let remainingOccurances = [];
        for (vocabPos = 0; vocabPos < vocab.length; vocabPos++) {
            remainingOccurances[vocab[vocabPos]] = 0;
        }
        for (vocabPos = 0; vocabPos < vocab.length; vocabPos++) {
            remainingOccurances[vocab[vocabPos]]++;
        }

        let result = '';
        for (var guessPos = 0; guessPos < guess.length; guessPos++) {
            if (vocab[guessPos] === guess[guessPos]) {
                result += '2';
                remainingOccurances[guess[guessPos]]--;
            }
            else if (remainingOccurances[guess[guessPos]] > 0) {
                result += '1';
                remainingOccurances[guess[guessPos]]--;
            }
            else {
                result += '0';
            }
        }

        return result;
    }

    // TODO - wrong place for this code.
    findResults = () => {

        let vocab = new WordList().get()

        if (this.state && this.state.wordleGame) {

            for (var guess = 0; guess < this.state.wordleGame.guesses.length; guess++) {
                let { letters, result } = this.state.wordleGame.guesses[guess].getSummary()

                letters = letters.toLowerCase()

                // Simple: deal with correct/incorrect letters.
                for (let i = 0; i < result.length; i++) {
                // Not that simple for double letters.
                /*if(result[i]==='0'){
                    this.vocab = this.vocab.filter(x=>x.indexOf(guess[i])==-1);
                }
                else*/ if (result[i] === '2') {
                        vocab = vocab.filter(x => x[i] === letters[i])
                    }
                }

                // Now deal with incorrectly placed letters. Careful with double letters..
                vocab = vocab.filter(x => this.scoreWord(x, letters) === result);
            }
        }

        vocab.sort()

        return vocab
    }

    onGuessChange = () => {
        this.onGetResultsClicked();
    }

    onClickedWord = (word) => {
        this.addGuess(word)
    }

    createInfo = () => {
        if(!this.state.showInfo){
            return null
        }

        let s = "The list will gradually update to show the best word."
        if(this.state.loops>0){
            if(this.state.results.length>10000){
                s = s + ` (These results were calculated earlier)`            
            }
            else{
                s = s + ` (Loops: ${this.state.loops})`            
            }
        }

        return <div className="alert alert-info" role="alert">{s}</div>
    }

    render() {
        let emptyGuesses = []
        for (var i = 0; i < 6 - this.state.wordleGame.guesses.length; i++) {
            emptyGuesses.push(new WordleGuess("     "))
        }

        return (
            <div className="wordle-game container">
                <div className="row">
                    {/* LEFT HAND SIDE*/}
                    <div className="col-sm">
                        {this.state.wordleGame.guesses.map((x, index) => <WordleGuessView key={index} wordleGuess={x} onChange={this.onGuessChange} />)}
                        {emptyGuesses.map((x, index) => <WordleGuessView key={index} wordleGuess={x} />)}
                        <p></p>
                        {this.state.showInputError ? <div className="alert alert-danger" role="alert">Please enter a 5 letter word</div> : null}
                        <div className="d-flex flex-row bd-highlight mb-3">
                            <input className="form-control me-auto" id="GuessEdit" type="text" maxLength="5" />
                            <button className="btn green-button" onClick={this.onGuessClicked}>Add</button>
                            <button className="btn green-button" onClick={this.onResetClicked}>Reset</button>
                        </div>
                    </div>

                    {/* RIGHT HAND SIDE*/}
                    <div className="col-sm">
                        <div className="d-flex flex-row bd-highlight mb-3">
                            <h3>Results </h3><h6>({this.state.results.length})</h6>
                            {this.state.working ? null : <button className="green-button" onClick={this.handleCalculate}>Find Best Guess</button>}
                            {this.state.working ? <button className="green-button" onClick={this.handleCalculateCancel}>Stop</button> : null}
                            <div className="info" onClick={this.toggleInfo}>?</div>
                        </div>
                        {this.createInfo()}
                        <WordleResultsView key={this.state.loops + this.state.results.length} wordList={this.state.results} onClickedWord={this.onClickedWord} />
                    </div>
                </div>
            </div>
        )
    }
}

export default WordleGameView