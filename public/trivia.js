// var socket = io.connect('http://localhost:4000');
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

// socket.on('getTriviaList', function(triviaList) {
//     triviaList = triviaList
//     console.log("List from backend", triviaList)
    
//     socket.emit('getTriviaList', {
//         triviaList: triviaList
//     });
//     console.log("PLEASE",triviaList)
//     // console.log(triviaList.shift())
// })

// General Knowledge 15 https://opentdb.com/api.php?amount=15&category=9&difficulty=easy&type=multiple
// Film 15 https://opentdb.com/api.php?amount=15&category=11&difficulty=easy&type=multiple
// History 15 https://opentdb.com/api.php?amount=15&category=23&difficulty=easy&type=multiple

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

// Emit events

// Which number of question to show
function preQuestion() {
    socket.emit('preQuestion', {
        questionNumber: (j)
    })
    // j++;
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
    
    if(roomName == "General Knowledge") {
        category = 9
    }
    else if (roomName == "Film") {
        category = 11
    }
    else if (roomName == "History") {
        category = 23
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

// socket.on('startGame', function(data) {
    startGame = true;
// })


//Game Loop

answer = ""
userChoice = ""
correctAnswer = ""
console.log("start game");

function callAPI () {


axios.get(`https://opentdb.com/api.php?amount=3&category=${category}&difficulty=easy&type=multiple`)
.then(function (response) {
    triviaList = response.data.results;
    console.log(triviaList)
    // selectQuestion = triviaList.shift()
    // console.log("Select Question", selectQuestion)
    // })

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
        // j++;

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
                messageBoard.innerHTML = '<h1> Time\'s Up!!' + data + '</h1>';
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

        socket.once('choice', function(data) {
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
                messageBoard.innerHTML = '<h1>oops</h1>'
                // currentUser.loser = true;
                console.log("currentUser",currentUser)
                socket.once('loser', function(data) {
                    usersArray = data.users
                    console.log("Updated users from backend line 218", usersArray)
                })
               
                // a.removeEventListener('click', clickA)
                // b.removeEventListener('click', clickB)
                // c.removeEventListener('click', clickC)
                // d.removeEventListener('click', clickD)
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
                    if (usersArray.length > 1) {
                        messageBoard.innerHTML += '<h1 The winners are...>'
                        for(let i = 0; i < usersArray.length; i++) {
                            messageBoard.innerHTML += '<br> ' + usersArray[i].username
                        }
                    }
                    else if (usersArray.length === 1) {
                        messageBoard.innerHTML = '<h1>'+ usersArray[0].username + ' is the WINNER!</h1>'
                    }
                    else if(usersArray.length === 0) {
                        console.log("List > 0 and users = 0")
                        messageBoard.innerHTML = '<h1> Oooo yikes...no one is a winner today!</h1>'
                    }
                }
                // else if (triviaList.length === 0 && usersArray.length == 1) {
                //     messageBoard.innerHTML = '<h1>'+ usersArray[0].username + ' is the WINNER!</h1>'
                // }
                // else if (triviaList.length === 0 && usersArray.length > 1) {
                //     for(let i = 0; i < usersArray.length; i++) {
                //         if(usersArray[i].loser === false) {
                //             console.log("winners",usersArray[i])
                //             messageBoard.innerHTML += '<h1>'+ usersArray[i].username + ' is a WINNER!</h1>'
                //         }
                //         else {
                //             messageBoard.innerHTML += '<h1> Oooo yikes...no one is a winner today!</h1>'
                //         }
                //     }
                // }
            }, 3000)
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

// Listen for events
// socket.on('startGame', function(data) {
//     startGame = true;
//     gameLoop();
// })
// socket.on('choice', function(data) {

//     a.innerHTML = '<p><strong>' + data.answerAStats + '%</strong><p>'
//     b.innerHTML = '<p><strong>' + data.answerBStats + '%</strong><p>'
//     c.innerHTML = '<p><strong>' + data.answerCStats + '%</strong><p>'
//     d.innerHTML = '<p><strong>' + data.answerDStats + '%</strong><p>'
//     console.log("UserChoice:", userChoice)
//     console.log("CorrectAnswer:", correctAnswer)
//     if(userChoice === correctAnswer) {
//         messageBoard.innerHTML = '<h1>CORRECT</h1>'
//     }
//     else {
//         messageBoard.innerHTML = '<h1>oops</h1>'
//         // a.removeEventListener('click', clickA)
//         // b.removeEventListener('click', clickB)
//         // c.removeEventListener('click', clickC)
//         // d.removeEventListener('click', clickD)
//     }
//     var setInPlay = setTimeout(function() {
//         if(triviaList.length > 0) {
//             gameLoop()
//         }
//     }, 3000)
// })
// socket.on('userChoice', function(data) {
//     userChoice = data.userChoice
//     console.log("userChoice", userChoice)
// })


// Save
// var socket = io.connect('http://localhost:4000');

// // Query DOM
// var messageBoard = document.getElementById('message-board');
// var questionBoard = document.getElementById('question-board');
// var question = document.getElementById('question');
// var a = document.getElementById('a');
// var b = document.getElementById('b');
// var c = document.getElementById('c');
// var d = document.getElementById('d');
// var answers = document.querySelectorAll('.answer');

// // Trivia Data handling
// let triviaTemp = {
//     "results": [
//     {
//         "category": "General Knowledge",
//         "type": "multiple",
//         "difficulty": "easy",
//         "question": "Which country, not including Japan, has the most people of japanese decent?",
//         "correct_answer": "Brazil",
//         "incorrect_answers": [
//         "China",
//         "South Korea",
//         "United States of America"
//       ]
//       },
//       {
//         "category": "General Knowledge",
//         "type": "multiple",
//         "difficulty": "easy",
//         "question": "Terry Gilliam was an animator that worked with which British comedy group?",
//         "correct_answer": "Monty Python",
//         "incorrect_answers": [
//         "The Goodies&lrm;",
//         "The League of Gentlemen&lrm;",
//         "The Penny Dreadfuls"
//       ]
//       },
//       {
//         "category": "General Knowledge",
//         "type": "multiple",
//         "difficulty": "easy",
//         "question": "When one is &quot;envious&quot;, they are said to be what color?",
//         "correct_answer": "Green",
//         "incorrect_answers": [
//         "Red",
//         "Blue",
//         "Yellow"
//         ]
//         }
//   ]}
//   let triviaList = triviaTemp.results;
  
//   let startGame = false;
//   let answer = ""
//   let userChoice = ""
//   let correctAnswer = ""

// function clickA()  {
//     answer = a.value
// }
// function clickB() {
//     answer = b.value
// }
// function clickC() {
//     answer = c.value
// }
// function clickD() {
//     answer = d.value
// }

//   // Emit events
// a.addEventListener('click', clickA)
// b.addEventListener('click', clickB)
// c.addEventListener('click', clickC)
// d.addEventListener('click', clickD)




// //Game Loop
// let i = 0
// let j = 0
// startGame = true;
//     if (startGame && i < triviaList.length) {
//         gameLoop()
//     }

// function gameLoop() {


//         answer = ""
//         console.log("Round answer value", answer)
//         userChoice = ""
//         correctAnswer = ""
//         console.log("start game");
//         let selectQuestion = triviaList.shift()
    
//         // Which # question to show
//         socket.emit('preQuestion', {
//             questionNumber: (j+1)
//         })
//         j++;
    
//         socket.on('preQuestion', function(message) {
//             messageBoard.innerHTML = '<h1>' + message + '</h1>'
//             questionBoard.style.display = 'none';
//         })
        
//         // Countdown during question
//         socket.on('counter', data => {
//             if(data > 0) {
//                 messageBoard.innerHTML = '<h1> Time Left: ' + data + '</h1>';
//             }
//             else if(data === 0) {
//                 messageBoard.innerHTML = '<h1> Time\'s Up!!' + data + '</h1>';
//                 userChoice = answer;
//                 console.log("answer", answer)
//                 socket.emit('choice', {
//                     answer: answer
//                 }); 
//             }
//             questionBoard.style.display = 'block';
            
//         })
//         socket.emit('question', {
//             selectQuestion: selectQuestion
//         })
//         socket.on('choice', function(data) {
//             answer = data.answer
//             a.innerHTML = '<p><strong>' + data.answerAStats + '%</strong><p>'
//             b.innerHTML = '<p><strong>' + data.answerBStats + '%</strong><p>'
//             c.innerHTML = '<p><strong>' + data.answerCStats + '%</strong><p>'
//             d.innerHTML = '<p><strong>' + data.answerDStats + '%</strong><p>'
//             console.log("UserChoice:", userChoice)
//             console.log("CorrectAnswer:", correctAnswer)
//             if(userChoice === correctAnswer) {
//                 messageBoard.innerHTML = '<h1>CORRECT</h1>'
//             }
//             else {
//                 messageBoard.innerHTML = '<h1>oops</h1>'
//                 // a.removeEventListener('click', clickA)
//                 // b.removeEventListener('click', clickB)
//                 // c.removeEventListener('click', clickC)
//                 // d.removeEventListener('click', clickD)
//             }
//             var setInPlay = setTimeout(function() {
//                 if(triviaList.length > 0) {
                    
//                     gameLoop()
//                 }
//             }, 3000)
//         })
//         socket.on('question', data=> {
//            question.innerHTML = '<h1> Time Left: ' + data.question + '</h1>'
//             a.innerHTML = '<h1> A: ' + data.a + '</h1>'
//             b.innerHTML = '<h1> B: ' + data.b + '</h1>'
//             c.innerHTML = '<h1> C: ' + data.c + '</h1>'
//             d.innerHTML = '<h1> D: ' + data.d + '</h1>'
//             correctAnswer = data.correctAnswer
//         })
// }