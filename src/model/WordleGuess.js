import { TileState, WordleTile } from "./WordleTile"

export class WordleGuess {
    constructor(guess){
        //console.log("New guess");
        this.tiles = []
        for(var i=0;i<guess.length;i++){
            this.tiles.push(new WordleTile(""+guess.toUpperCase()[i], TileState.Wrong))
        }
    }

    getSummary = ()=>{
        let letters = ""
        let result = ""
        for(var i=0;i<this.tiles.length;i++){
            letters += this.tiles[i].letter
            result += this.tiles[i].state
        }

        return { letters: letters, result: result }
    }
}