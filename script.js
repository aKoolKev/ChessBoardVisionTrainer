
// dynamically create chess board
function loadChessBoard(){
    let isBeige = true; //top left is "white" playing as white

    const tableEl = document.getElementById("board-table");

    for(let row=8; row>=1; row--){ //"rank"
        let trEl = document.createElement("tr");
        for(let col=1; col<=8; col++){
            let tdEl = document.createElement("td");
            tdEl.id = files[col-1] + row;
            // tdEl.textContent = files[col-1] + row;
            tdEl.addEventListener('click', ()=>{
                //prevent spam clicking when temporary highlighting the correct tile
                if(board.style.pointerEvents === 'none') return;
                playMoveSound();
                board.style.pointerEvents = 'none'; //disable all clicks

                selectedSquare=tdEl.id;
                userClicked=true;
                //check answer and update score
                if(selectedSquare===notationField){
                    correct();
                    board.style.pointerEvents = 'auto'; // enable immediatley
                }
                else{
                    //grab and save correct tile bg color
                    const correctTile = document.getElementById(notationField);
                    const correctTileBg = correctTile.style.background;

                    //highlight the correct tile bg color
                    correctTile.style.background= 'yellow';

                    //update incorrect score
                    incorrect();

                    //after some time, revert the tile back to original color (creates the flashing color)
                    setTimeout(() => {
                        correctTile.style.background = correctTileBg;
                        board.style.pointerEvents = 'auto'; // re-enable clicks
                    }, 500);
                }
                endlessGameModeHelper(); //next round
            });
            tdEl.style.background = isBeige ? "#ebecd0" : "#739552";;
            isBeige=!isBeige; //toggle it
            trEl.appendChild(tdEl);
        }
        //create alternating pattern
        isBeige=!isBeige; //toggle it
        tableEl.appendChild(trEl);
    }
}

// Game modes functions

function timedGameMode(duration){
    timeMode=duration;
    hideGameModeMenu();
    //reset any previous score
    resetScore();

    document.getElementById('game-mode-name').textContent = "Timed Mode";
    document.getElementById('timed-mode-clock').classList.remove('hidden');

    startCountDown(duration);
    endlessGameModeHelper();
}

function startCountDown(seconds){
    let remaining = seconds;
    const clockTime = document.getElementById('clock-time');
    clockTime.textContent = remaining;

    const intervalId = setInterval(() => {
        remaining--;
        clockTime.textContent = remaining;

        if(remaining<=0){
            document.getElementById('try-again-btn').classList.remove('!hidden');
            clearInterval(intervalId);

            // Let DOM update first, then alert
            setTimeout(() => {
                alert("Time's up!");
            }, 100); // 100ms is enough to flush the DOM changes
        }

    }, 1000); //every sec
}

function endlessGameMode(){
    hideGameModeMenu();
    document.getElementById('game-mode-name').textContent = "Endless Mode";
    
    endlessGameModeHelper();
}

//helper function to endlessGameMode() to make it event driven rather than while(true) wait loop
function endlessGameModeHelper(){
    //clear previous selection
    userClicked=false;
    selectedSquare='';

    //display random notation
    notationField = getRandChessNotation();
    document.getElementById('notation-field').innerText = notationField;
}

function displayHP(){
    let hpBarEl = document.getElementById('hp-bar');
    hpBarEl.innerText = ""; //clear previous hearts

    //update current remaining hearts
    for(let i=0;i<currLives;i++)
        hpBarEl.innerText += '♥︎ ';
}

function survivalGameMode(){
    isSurvivalMode = true;

    //initialize hearts
    currLives = 3; //♥︎
    displayHP();


    //hide incorrect stats and show health bar
    document.getElementById('hp-field').classList.remove('hidden');
    document.getElementById('incorrect-field').classList.add('hidden');
    document.getElementById('numIncorrect').classList.add('hidden');

    //game mode title
    document.getElementById('game-mode-name').textContent = "Survival Mode";

    hideGameModeMenu();

    //game logic
    endlessGameModeHelper();

}


// hide all the game mode buttons and display the chess board
function hideGameModeMenu(){
    //hide game mode buttons
    document.getElementById('game-mode-menu').classList.add('hidden');

    //show chessboard
    document.getElementById('board').classList.remove('hidden');

    //show score
    document.getElementById('score').classList.remove('hidden');


    //show the quit button
    document.getElementById('quit-btn').classList.remove("!hidden");
}

//generates a random chess notation [file][rank] or [col][row]
function getRandChessNotation(){
    return (files[getRandomInt()-1] + getRandomInt());
}

//helper function that returns a random number [1,8]
function getRandomInt() {
    return Math.floor(Math.random() * (8 - 1 + 1)) + 1;
}

//clear score and display empty score
function resetScore(){
    //clear internal score as well
    numCorrect = 0;
    numIncorrect = 0;

    //clear display
    document.getElementById('numCorrect').innerText = numCorrect;
    document.getElementById('numIncorrect').innerText = numIncorrect;
}

//update and display current number of correct answers
function correct()
{
    numCorrect++;
    //display score
    document.getElementById('numCorrect').innerText = numCorrect;
}

//update and display current number of incorrect answers
function incorrect()
{
    //for survival mode
    if (isSurvivalMode){
        currLives--;
        displayHP();

        //No more hearts
        if(currLives <= 0){
            setTimeout(() => {
                alert("GAME OVER!");
            }, 10);
            //disable click
            board.classList.add('hidden');
            document.getElementById('notation-container').classList.add('hidden');
            document.getElementById('try-again-btn').classList.remove('!hidden');
        }
        return;
    }

    //for endless and timed game mode
    numIncorrect++;
    //display score
    document.getElementById('numIncorrect').innerText = numIncorrect;
}


//GLOBAL VARS

// contains the files letters
const files = ['a','b','c','d','e','f','g','h'];
let notationField;
let selectedSquare=''; //the square the user clicked
let userClicked = false;
let numCorrect = 0;
let numIncorrect = 0;
let timeMode; //save timed mode duration for play again button
const board = document.getElementById('board');

//survival game mode
let currLives;
let isSurvivalMode = false;



// using web audio api for lower latency 
const audioContext = new AudioContext();
let audioBuffer;

//selecting board tile noise
fetch('http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3')
    .then(response => response.arrayBuffer()) //fetch the audio data
    .then(buffer => audioContext.decodeAudioData(buffer)) // decode the audio data
    .then(decodedData => {
        audioBuffer = decodedData; //load into memory
    }
);

function playMoveSound() {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
}


//all button select noise
const audioContext2 = new AudioContext();
let audioBuffer2;
fetch('http://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3')
    .then(response => response.arrayBuffer()) //fetch the audio data
    .then(buffer => audioContext2.decodeAudioData(buffer)) // decode the audio data
    .then(decodedData => {
        audioBuffer2 = decodedData; //load into memory
    }
);

function playSelectSound(){
    const source = audioContext2.createBufferSource();
    source.buffer = audioBuffer2;
    source.connect(audioContext2.destination);
    source.start(0);
}


window.onload = () => {
    loadChessBoard(); //create chess board dynamically

    //add event listeners to game mode buttons

    //timed game mode buttons
    document.getElementById('timed30s-btn').addEventListener('click',()=>{
        playSelectSound();
        timedGameMode(30);
    });
    document.getElementById('timed1min-btn').addEventListener('click',()=>{
        playSelectSound();
        timedGameMode(60);
    });
    document.getElementById('timed3mins-btn').addEventListener('click',()=>{
        playSelectSound();
        timedGameMode(3*60);
    });
    document.getElementById('timed5mins-btn').addEventListener('click',()=>{
        playSelectSound();
        timedGameMode(5*60);
    });

    //endless mode button
    document.getElementById("endless-btn").addEventListener('click',()=>{
        playSelectSound();
        endlessGameMode()
    });

    //survival mode button
    document.getElementById('survival-btn').addEventListener('click', ()=>{
        playSelectSound();
        survivalGameMode()
    });

    //quit button
    document.getElementById('quit-btn').addEventListener('click',()=>{
        playSelectSound();
        window.location.reload();
    });

    //play again button
    document.getElementById('try-again-btn').addEventListener('click', ()=>{
        document.getElementById('try-again-btn').classList.add('!hidden');
        if(!isSurvivalMode)
            timedGameMode(timeMode);
        else { //was survival mode
            board.classList.remove('hidden');
            document.getElementById('notation-container').classList.remove('hidden');
            survivalGameMode();
        }
    })
}
