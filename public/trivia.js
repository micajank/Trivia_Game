const socket = io();

// Get userName and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})
// Join game room
socket.emit('joinRoom', { username, room });

// Query DOM
var messageBoard = document.getElementById('message-board');
var questionBoard = document.getElementById('question-board');
var question = document.getElementById('question');
var a = document.getElementById('a');
var b = document.getElementById('b');
var c = document.getElementById('c');
var d = document.getElementById('d');

var statsA = document.getElementById('stats-a');
var statsB = document.getElementById('stats-b');
var statsC = document.getElementById('stats-c');
var statsD = document.getElementById('stats-d');

var btn = document.getElementById('btn-leave');
var leaveBtn = document.getElementById('btn-loser-leave');
var answers = document.querySelectorAll('.answer');

let startGame = false;
let answer = ""
let userChoice = ""
let correctAnswer = ""
var triviaList = []

// Create buttons with events
function clickA()  {
    answer = a.value
}
function clickB() {
    answer = b.value
}
function clickC() {
    answer = c.value
}
function clickD() {
    answer = d.value
}
a.addEventListener('click', clickA)
b.addEventListener('click', clickB)
c.addEventListener('click', clickC)
d.addEventListener('click', clickD)

// Initialize gameboard as waiting room
let waitingRoomMsg = "Waiting for more players..."
messageBoard.innerHTML = '<h1>' + waitingRoomMsg + '</h1>'
questionBoard.style.display = 'none';
leaveBtn.style.visibility = "hidden";

// Emit events

// Which number of question to show
function preQuestion() {
    socket.emit('preQuestion', {
        questionNumber: (j)
    })
}

// Which question to show
function sendQuestion(selectQuestion) {
    selectQuestion = triviaList.shift()
    console.log("Select Question", selectQuestion)
    socket.emit('question', {
        selectQuestion: selectQuestion
    })
}

// User loses due to incorrect answer
function userLeaves(id) {
    const index = usersArray.findIndex(currentUser => currentUser.id === id);

    if(index != -1) {
        return usersArray.splice(index, 1)[0];
    }
}

// Listen for message event
socket.on('message', data => {
    console.log(data)
})

var usersArray
var roomName
var currentUser
var category

// Listen for roomUsers
socket.on('roomUsers', function(data){
    usersArray = data.users
    roomName = data.room
    console.log("Users",usersArray)
    
    if(roomName == "Celebrities") {
        category = 26
    }
    else if (roomName == "Film") {
        category = 11
    }
    else if (roomName == "History") {
        category = 23
    }
    else if (roomName == "Mythology") {
        category = 20
    }
    else if (roomName == "Computers") {
        category = 18
    }
    callAPI()
})

socket.on('currentUser', function(data) {
    currentUser = data.user
})

var loser = false
var selectQuestion
let i = 0
let j = 0
startGame = true;
answer = ""
userChoice = ""
correctAnswer = ""
console.log("start game");

//Game Loop


function callAPI () {

    
    axios.get(`https://opentdb.com/api.php?amount=3&category=${category}&difficulty=easy&type=multiple`)
    .then(function (response) {
        triviaList = response.data.results;
        console.log(triviaList)

        
    if (startGame) {
        gameLoop()
    }
    
    function gameLoop() {

        if (j === 0) {
            selectQuestion = triviaList.shift()
            console.log("Select Question", selectQuestion)
            j++;
        }
        else{
            j++;
        }
        // Which # question to show
        preQuestion()

        socket.once('preQuestion', function(message) {
            messageBoard.innerHTML = '<h1>' + message + '</h1>'
            questionBoard.style.display = 'none';
            
        })
        
        // Countdown during question
        socket.on('counter', data => {
            if(data > 0) {
                messageBoard.innerHTML = '<h1> Time Left: <br>' + data + '</h1>';
            }
            else if(data === 0) {
                messageBoard.innerHTML = '<h1> Time\'s Up!! ' + data + '</h1>';
                userChoice = answer;
                console.log("answer", answer)
                socket.emit('choice', {
                    answer: answer
                }); 
            }
            questionBoard.style.display = 'block';
            statsA.style.display = 'none';
            statsB.style.display = 'none';
            statsC.style.display = 'none';
            statsD.style.display = 'none';
            
        })

        sendQuestion(selectQuestion)

        socket.on('choice', function(data) {
            answer = data.answer
            statsA.style.display = 'inline-block';
            statsB.style.display = 'inline-block';
            statsC.style.display = 'inline-block';
            statsD.style.display = 'inline-block';
            statsA.innerHTML = '<p>' + data.answerAStats + '%<p>'
            statsB.innerHTML = '<p>' + data.answerBStats + '%<p>'
            statsC.innerHTML = '<p>' + data.answerCStats + '%<p>'
            statsD.innerHTML = '<p>' + data.answerDStats + '%<p>'
            console.log("UserChoice:", userChoice)
            console.log("CorrectAnswer:", correctAnswer)
            if(userChoice === correctAnswer) {
                messageBoard.innerHTML = '<h1>CORRECT</h1>'

                console.log("currentUser",currentUser)
                socket.once('loser', function(data) {
                    usersArray = data.users
                    console.log("Updated users from backend line 218", usersArray)
                })
            }
            else {
                socket.emit('loser', {
                    currentUserId: currentUser.id
                })
                messageBoard.innerHTML = '<h1>OOPS</h1>'
                btn.style.visibility = "hidden";
                leaveBtn.style.visibility = "visible";

                currentUser.loser = true;
                console.log("currentUser",currentUser)
                socket.once('loser', function(data) {
                    usersArray = data.users
                    console.log("Updated users from backend line 218", usersArray)
                })
               
            }
            var setInPlay = setTimeout(function() {
                socket.once('loser', function(data) {
                    usersArray = data.users
                    console.log("Updated users from backend line 229", usersArray)
                })
                // win/lose functionality
                if(triviaList.length > 0) {
                    if(usersArray.length > 1) {
                        gameLoop()
                    }
                    else if (usersArray.length == 1) {
                        messageBoard.innerHTML = '<h1>'+ usersArray[0].username + ' is the WINNER!</h1>'
                    }
                    else if(usersArray.length === 0) {
                        console.log("List > 0 and users = 0")
                        messageBoard.innerHTML = '<h1> Oooo yikes...no one is a winner today!</h1>'
                    }
                }
                else if(triviaList.length === 0) {
                    var winningNames = ''
                    if (usersArray.length > 1) {
                        for(let i = 0; i < usersArray.length - 1; i++) {
                            winningNames += usersArray[i].username+ ", "
                        }
                        messageBoard.innerHTML = '<h1>The winners are...' + winningNames +" and " + usersArray[usersArray.length - 1].username + "!!!</h1>"
                    }
                    else if (usersArray.length === 1) {
                        if (usersArray[i].loser === false) {
                            messageBoard.innerHTML = '<h1>'+ usersArray[0].username + ' is the WINNER!</h1>'
                        }
                    }
                    else if(usersArray.length === 0) {
                        console.log("List > 0 and users = 0")
                        messageBoard.innerHTML = '<h1> Oooo yikes...no one is a winner today!</h1>'
                    }
                }
            }, 5000)
        })

        socket.once('question', data=> {
            question.innerHTML = '<h1> Time Left: ' + data.question + '</h1>'
                a.innerHTML = '<h1> A: ' + data.a + '</h1>'
                b.innerHTML = '<h1> B: ' + data.b + '</h1>'
                c.innerHTML = '<h1> C: ' + data.c + '</h1>'
                d.innerHTML = '<h1> D: ' + data.d + '</h1>'
                correctAnswer = data.correctAnswer
            })
        }
    })
    .catch(function (err) {
        console.log(`Error was made:\n ${err}`);
    })
}