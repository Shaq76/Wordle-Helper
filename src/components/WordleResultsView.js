import React, { Component } from 'react'

class WordleResultsView extends Component {
    constructor(props) {
        super(props)

        this.state = {
            list: props.wordList,
            onClickedWord: props.onClickedWord
        }
    }

    render() {
        return (
            <div className='d-flex align-content-start flex-wrap result-list'>
                {this.state.list.map((x, index) => <div className='result' key={index} onClick={()=>{this.state.onClickedWord(x)}}>{x}</div>)}
            </div>
        )
    }
}

export default WordleResultsView