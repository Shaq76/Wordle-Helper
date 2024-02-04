import React, { Component } from 'react'
import WordleTileCell from './WordleTileCell'

class WordleGuessView extends Component {
    constructor(props) {
        super(props)

        this.state = {
            guess: this.props.wordleGuess,
            onChange: this.props.onChange
        }
    }

    onTileChange = ()=>{
        if(this.state.onChange){
            this.state.onChange()
        }
    }

    render() {
        return (
            <div className='wordle-guess-view'>
                <>
                    {/*<div>WordleGuessView {this.state.guess.tiles.length}</div>*/}
                    {this.state.guess.tiles.map((tile, index) => <WordleTileCell key={index} tile={tile} index={index} onChange={this.onTileChange}/>)}
                </>
            </div>
        )
    }
}

export default WordleGuessView