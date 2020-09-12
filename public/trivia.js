var socket = io.connect('http://localhost:4000');

// Query DOM
var messageBoard = document.getElementById('message-board');
var questionBoard = document.getElementById('question-board');
var question = document.getElementById('question');
var a = document.getElementById('a');
var b = document.getElementById('b');
var c = document.getElementById('c');
var d = document.getElementById('d');
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
  let triviaList = triviaTemp.results;
  
  let startGame = true;
  let answer = ""
// Emit events

a.addEventListener('click', function(){
    answer = a.value;
    // socket.emit('choiceA', {
    //     answer: a.value
    // }); 
});
b.addEventListener('click', function(){
    answer = b.value;
    // socket.emit('choiceB', {
    //     answer: b.value
    // });
});
c.addEventListener('click', function(){
    answer = c.value;
    // socket.emit('choiceC', {
    //     answer: c.value
    // });
});
d.addEventListener('click', function(){
    answer = d.value;
    // socket.emit('choiceD', {
    //     answer: d.value
    // });
});


// Listen for events
// socket.on('choice', function(data) {
//     console.log("Data returned", data)

    // a.innerHTML += '<p><strong>' + data + '</strong><p>'
// })

//Game Loop
let i = 0
if (startGame && i < triviaList.length) {
    console.log("start game");
    socket.emit('preQuestion', {
        questionNumber: (i+1)
    })
    socket.on('preQuestion', function(message) {
        messageBoard.innerHTML = '<h1>' + message + '</h1>'
        questionBoard.style.display = 'none';
    })
    
    socket.on('counter', data => {
        messageBoard.innerHTML = '<h1> Time Left: ' + data + '</h1>'
        questionBoard.style.display = 'block';
        if(data === 0) {
            socket.emit('choice', {
                    answer: answer
                }); 
        }
    })
    console.log("TriviaList", triviaList[i].incorrect_answers[0])
    socket.emit('question', {
        question: triviaList[i].question,
        a: triviaList[i].correct_answer,
        b: triviaList[i].incorrect_answers[0],
        c: triviaList[i].incorrect_answers[1],
        d: triviaList[i].incorrect_answers[2],
    })
    socket.on('question', data=> {
       question.innerHTML = '<h1> Time Left: ' + data.question + '</h1>'
        a.innerHTML = '<h1> A: ' + data.a + '</h1>'
        b.innerHTML = '<h1> B: ' + data.b + '</h1>'
        c.innerHTML = '<h1> C: ' + data.c + '</h1>'
        d.innerHTML = '<h1> D: ' + data.d + '</h1>'
    })
}