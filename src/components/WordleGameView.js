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
            scoredWords: []
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
                scoredWords: scoredWords
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
      }

      handleCalculateCancel(){
        if(this.worker){
            this.worker.terminate()
        }
        this.worker = null
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

    render() {
        let emptyGuesses = []
        for (var i = 0; i < 6 - this.state.wordleGame.guesses.length; i++) {
            emptyGuesses.push(new WordleGuess("     "))
        }

        let scoredWordsSummary = null
        if(this.state.loops>0){
            scoredWordsSummary = (
                <>
                    <h1>Current top {this.state.scoredWords.length} words to try: (iterations:{this.state.loops})</h1>
                    <div>
                        {/*this.state.scoredWords.map((w,i)=><div key={i}>{w.word}</div>)*/}
                        <WordleResultsView className="result-list-small" key={this.state.loops} wordList={this.state.scoredWords} getWord={x=>x.word} getStats={x=>Math.floor(10*x.score/x.tried)/10} onClickedWord={this.onClickedWord} />
                        {/*JSON.stringify(this.state.scoredWords)*/}
                    </div>
                </>
            )
        }

        return (
            <>
                {/*<div>Wordle Game)</div>*/}
                <div className="wordle-game container">

                    <div className="row">
                        <div className="col-sm">
                            {this.state.wordleGame.guesses.map((x, index) => <WordleGuessView key={index} wordleGuess={x} onChange={this.onGuessChange} />)}
                            {emptyGuesses.map((x, index) => <WordleGuessView key={index} wordleGuess={x} />)}

                            <p></p>
                            <div className='container'>
                                <div className="row">
                                    <div className="col-sm-6">
                                        {this.state.showInputError ? <div className="alert alert-danger" role="alert">Please enter a 5 letter word</div> : null}
                                    </div>
                                </div>
                                <div className="row">
                                        <input id="GuessEdit" type="text" maxLength="5" />
                                        <button className="green-button" onClick={this.onGuessClicked}>Add</button>
                                        <button className="green-button" onClick={this.onResetClicked}>Reset</button>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm">
                            <div className="row">
                                <div className="col-sm">
                                    <h2>Results ({this.state.results.length})</h2>
                                </div>
                            </div>
                            <WordleResultsView key={this.state.results} wordList={this.state.results} onClickedWord={this.onClickedWord} />
                        </div>
                    </div>
                </div>

                <div>
                    <button className="green-button" onClick={this.handleCalculate}>Calculate</button>
                    <button className="green-button" onClick={this.handleCalculateCancel}>Cancel</button>
                    {scoredWordsSummary}
                </div>
            </>
        )
    }
}

export default WordleGameView