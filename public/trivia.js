var socket = io.connect('http://localhost:4000');

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

var answers = document.querySelectorAll('.answer');

// Trivia Data handling
let triviaTemp = {
    "results": [
    {
        "category": "General Knowledge",
        "type": "multiple",
        "difficulty": "easy",
        "question": "Which country, not including Japan, has the most people of japanese decent?",
        "correct_answer": "Brazil",
        "incorrect_answers": [
        "China",
        "South Korea",
        "United States of America"
      ]
      },
      {
        "category": "General Knowledge",
        "type": "multiple",
        "difficulty": "easy",
        "question": "Terry Gilliam was an animator that worked with which British comedy group?",
        "correct_answer": "Monty Python",
        "incorrect_answers": [
        "The Goodies&lrm;",
        "The League of Gentlemen&lrm;",
        "The Penny Dreadfuls"
      ]
      },
      {
        "category": "General Knowledge",
        "type": "multiple",
        "difficulty": "easy",
        "question": "When one is &quot;envious&quot;, they are said to be what color?",
        "correct_answer": "Green",
        "incorrect_answers": [
        "Red",
        "Blue",
        "Yellow"
        ]
        }
]}
// initialize variables
let triviaList = triviaTemp.results;

let startGame = false;
let answer = ""
let userChoice = ""
let correctAnswer = ""

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

// Emit events

// Which number of question to show
function preQuestion() {
    socket.emit('preQuestion', {
        questionNumber: (j+1)
    })
    j++;
}

// Which question to show
function sendQuestion(selectQuestion) {
    socket.emit('question', {
        selectQuestion: selectQuestion
    })
}




let i = 0
let j = 0
startGame = true;
if (startGame && i < triviaList.length) {
    gameLoop()
}

//Game Loop
function gameLoop() {

    answer = ""

    userChoice = ""
    correctAnswer = ""
    console.log("start game");
    let selectQuestion = triviaList.shift()

    // Which # question to show
    preQuestion()

    socket.on('preQuestion', function(message) {
        messageBoard.innerHTML = '<h1>' + message + '</h1>'
        questionBoard.style.display = 'none';
    })
    
    // Countdown during question
    socket.on('counter', data => {
        if(data > 0) {
            messageBoard.innerHTML = '<h1> Time Left: ' + data + '</h1>';
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
        }
        else {
            messageBoard.innerHTML = '<h1>oops</h1>'
            a.removeEventListener('click', clickA)
            b.removeEventListener('click', clickB)
            c.removeEventListener('click', clickC)
            d.removeEventListener('click', clickD)
        }
        var setInPlay = setTimeout(function() {
            if(triviaList.length > 0) {
                
                gameLoop()
            }
        }, 3000)
    })

    socket.on('question', data=> {
        question.innerHTML = '<h1> Time Left: ' + data.question + '</h1>'
            a.innerHTML = '<h1> A: ' + data.a + '</h1>'
            b.innerHTML = '<h1> B: ' + data.b + '</h1>'
            c.innerHTML = '<h1> C: ' + data.c + '</h1>'
            d.innerHTML = '<h1> D: ' + data.d + '</h1>'
            correctAnswer = data.correctAnswer
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