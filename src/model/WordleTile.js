
export const TileState = { Wrong: 0, WrongPlace: 1, Correct: 2 };

export class WordleTile {

    constructor(letter, state){
        this.letter = letter;
        this.state = state;
    }

}

