
const loopworker = () => {
    
    function scoreWord(vocab,guess){
        //         vocab,   guess,  expectedResult
        //match(ui,'abc',   'abc',  '222');
        //match(ui,'aabbc', 'axxaa','20010');
    
        let remainingOccurances = [];
        for(let vocabPos=0;vocabPos<vocab.length;vocabPos++){
            remainingOccurances[vocab[vocabPos]]=0;
        }
        for(let vocabPos=0;vocabPos<vocab.length;vocabPos++){
            remainingOccurances[vocab[vocabPos]]++;
        }
    
        let result = '';
        for(var guessPos=0;guessPos<guess.length;guessPos++){
            if(vocab[guessPos]===guess[guessPos]){
                result+='2';
                remainingOccurances[guess[guessPos]]--;
            }
            else if(remainingOccurances[guess[guessPos]]>0){
                result+='1';
                remainingOccurances[guess[guessPos]]--;
            }
            else{
                result+='0';
            }
        }
        
        return result;
    }
    
    class Wordle {
        constructor(vocab) {
            this.guesses = []; // {guess: string, result: string}  2=correct 1=wrong_place, 0=incorrect
            this.vocab = vocab;
        }
    
        addGuess(guess,result){
            this.guesses.push({'guess': guess, 'result': result});
    
            // Simple: deal with correct/incorrect letters.
            for(let i=0;i<result.length;i++){
                if(result[i]==='2'){
                    this.vocab = this.vocab.filter(x=>x[i]===guess[i])
                }
            }
    
            // Now deal with incorrectly placed letters. Careful with double letters..
            this.vocab = this.vocab.filter(x=>scoreWord(x,guess)===result);
        }
    }

    function doPost(scoredWords) {

        // Convert the dictionary in to an array
        let scoredWordsArray = Object.values(scoredWords)
        scoredWordsArray.forEach(x=>{ if(x.tried===0){x.score = 10000}})

        // Sort the best worst first
        scoredWordsArray = scoredWordsArray.sort((x,y)=>{return x.score/x.tried - y.score/y.tried});

        let loops = scoredWordsArray.length ? scoredWordsArray[0].tried : 0

        const data = { type: 'loading', loops, scoredWords: scoredWordsArray }
        postMessage(data)
    }

    onmessage = (e) => {
        const words = e.data;
    
        console.log(`WORKER START (${words.length} words)`)
        
        let scoredWords = [];
        words.forEach(x=>scoredWords[x] = {word:x, tried:0, score:0});

        // All the words.. I calculated these results offline in C++
        if(words.length>10000){

            let tried = 762
            let toParse = "rales 210983 lares 224356 nares 224797 soare 224911 tares 228832 arles 230204 rates 231082 aeros 234710 saner 239402 reais 240719 aloes 242446 tales 245050 lears 245540 seral 247153 serai 248301 lores 250624 lanes 251489 reals 252868 salet 255510 teras 257667 raise 257908 sorel 258552  tears 259468 earls 261592 laers 262227                              reans 262689   strae 262736  nates 262852  sared 262925  roles 263214  toeas 265111  tores 266424  dares 267886  aeons 269143  orles 269204  taser 270655  sayer 270950  saine 270999                              hares 271632   soler 272735  nears 272918  stoae 273113  snare 273534  rotes 274620  aesir 274650  races 275165  earns 275414  leans 275862 laser 276266 slate 277384 rails 279362 rapes 279892 mares 280001 laris 280356 taros 281524 dates 281525 cares 281551 aures 282596 teals 283742 cates 283928 arose 284529 toles 284557 noles 285031 gares 285428 rones 285562 liras 285709 setal 286308 riles 287023"

            let split = toParse.split(" ")
            split = split.filter(x=>x.length>0)

            for(let i=0;i<split.length;i+=2){
                scoredWords[split[i]].tried = tried
                scoredWords[split[i]].score = parseInt(split[i+1])
            }

            doPost(scoredWords)
            return;
        }

        let lastUpdate = new Date().getSeconds()

        const maxLoops = 1000
        let loops=0
        while(loops<maxLoops){
            loops++

            for(var i=0;i<words.length;i++){
                let thisWord = words[i];
                let answer = thisWord;
                while(answer===thisWord){
                    answer = words[Math.floor(Math.random()*words.length)];
                }
        
                let w = new Wordle(words);
                w.addGuess(thisWord, scoreWord(answer,thisWord));
                
                if(w.vocab.length===0){console.log("error zero words left");}
                scoredWords[thisWord].score += w.vocab.length;
                scoredWords[thisWord].tried++;
            }

            let newTime = new Date().getSeconds()
            if(lastUpdate===newTime && loops!=maxLoops){
                continue;
            }
            lastUpdate = newTime

            doPost(scoredWords)
         }
    }
}

let code = loopworker.toString()
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"))
const blob = new Blob([code], { type: 'application/javascriptssky' })
const workerScript = URL.createObjectURL(blob)
module.exports = workerScript;
