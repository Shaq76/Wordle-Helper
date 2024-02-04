import React, { Component } from 'react'
import { TileState } from '../model/WordleTile'

class WordleTileCell extends Component {
    constructor(props) {
      super(props)
    
      this.state = {
         tile: props.tile,
         index: props.index,
         onChange : props.onChange
      }
    }

    onClick = ()=>{
      if(this.state.tile.letter===" "){
        return;
      }

      let newState = {...this.state};
      //console.log(`adding to state: ${this.state.tile.letter} ${this.state.tile.state} ${newState}`)
      //console.log(newState)
      newState.tile.state++;
      if(newState.tile.state===TileState.Correct+1){
        newState.tile.state = TileState.Wrong;
      }

      this.setState({newState})

      if(newState.onChange){
        newState.onChange();
      }
    }

  render() {
    let cls = "grid-cell"
    if(this.state.tile.letter===" "){
      cls = cls + " empty-tile"
    } else if(this.state.tile.state===TileState.Correct){
      cls = cls + " correct-tile"
    } else if(this.state.tile.state===TileState.WrongPlace){
      cls = cls + " wrong-place-tile"
    } else if(this.state.tile.state===TileState.Wrong){
      cls = cls + " wrong-tile"
    }

    if(this.state.index===0){
      cls = cls + " left";
    }

    return (
      <div onClick={this.onClick} className={cls}>{this.state.tile.letter}</div>
    )
  }
}

export default WordleTileCell;