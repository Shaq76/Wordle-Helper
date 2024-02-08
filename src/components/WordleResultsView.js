import React, { Component } from 'react'

class WordleResultsView extends Component {
    constructor(props) {
        super(props)

        this.state = {
            list: props.wordList, // Either a list of strings or a list of {word,tried,score}
            onClickedWord: props.onClickedWord
        }
    }

    getWord = (item)=>{
        if(typeof item === 'object'){
            return item.word
        }        

        return item
    }

    addScoreInfo = (item)=>{
        if(typeof item === 'object' && item.tried>0){
            return <div className="result-score">{Math.floor(10*item.score/item.tried)/10}</div>
        }
        return null
    }

    render() {
        return (
            <div className='d-flex align-content-start flex-wrap result-list'>
                {this.state.list.map((x, index) => <div className='result' key={index} onClick={()=>{this.state.onClickedWord(this.getWord(x))}}>{this.getWord(x)}{this.addScoreInfo(x)}</div>)}
            </div>
        )
    }
}

export default WordleResultsView