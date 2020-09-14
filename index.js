var express = require('express');
var socket = require('socket.io');

// APP Setup
var app = express();
var server = app.listen(4000, function(){
    console.log("Listening to requests on PORT 4000");
})

// Stic Files
app.use(express.static('public'));

// Socket Setup
var io = socket(server);
var socketConnections = 0;
var answerAStats = 0;
var answerBStats = 0;
var answerCStats = 0;
var answerDStats = 0;
var noAnswerStats = 0;
var QDetails = {};
var userChoice = '';
var totalAnswers = 0;

io.on('connection', function(socket){
    console.log("Made socket connection", socket.id);
    socketConnections++;
    console.log(socketConnections);
    // if(socketConnections > 1) {
        // io.sockets.emit('startGame', {
        //     stuff: 1
        // })
    
        socket.on('preQuestion', function(data) {
    
            // Question displayer
            let message = "Get ready for Question #" + data.questionNumber + "!";
            socket.once('question', function(questionData) {
                let answerArray = []
                let correctAnswer = ""
                let correctAnswerLocation = Math.floor(Math.random() * 4);
                for(let j = 0; j < 4; j++) {
                    if(correctAnswerLocation === j) {
                        answerArray.push(questionData.selectQuestion.correct_answer);
                        console.log(questionData.selectQuestion.correct_answer)
                        if (j === 0){
                            correctAnswer = 'a';
                        }
                        else if (j === 1) {
                            correctAnswer='b'
                        }
                        else if (j === 2) {
                            correctAnswer='c'
                        }
                        else if (j === 3) {
                            correctAnswer='d'
                        }
                    }
                    else {
                        let incorrectAnswer = questionData.selectQuestion.incorrect_answers.pop()
                        answerArray.push(incorrectAnswer)
                    } 
                }
    
                QDetails = {
                    question: questionData.selectQuestion.question,
                    a: answerArray[0],
                    b: answerArray[1],
                    c: answerArray[2],
                    d: answerArray[3],
                    correctAnswer: correctAnswer
                }
            })
    
            // Break between questions
            var preQuestion = setTimeout(function() {
                io.sockets.emit('question', QDetails)
                
                // Countdown
                var counter = 10;
                var questionCountdown = setInterval(function(){
                    io.sockets.emit('counter', counter);
                    counter--;
    
                    if (counter === 0) {
                        io.sockets.emit('counter', 0);
                        console.log("Time's up!!!")
                        // clearInterval(questionCountdown);
                    }
                    if(counter == -1) {
                        clearInterval(questionCountdown);
                        totalAnswers = parseFloat(answerAStats + answerBStats + answerCStats + answerDStats);//+noAnswerStats
                        answerAStats = Math.floor((answerAStats / totalAnswers) * 100);
                        answerBStats = Math.floor((answerBStats / totalAnswers) * 100);
                        answerCStats = Math.floor((answerCStats / totalAnswers) * 100);
                        answerDStats = Math.floor((answerDStats / totalAnswers) * 100);
                        console.log(answerAStats)
                        console.log(answerBStats)
                        console.log(answerCStats)
                        console.log(answerDStats)
                        // noAnswerStats = Math.floor((noAnswerStats / totalAnswers) * 100);
                        io.sockets.emit('counter', -1);
                        io.sockets.emit('choice', {
                            answerAStats,
                            answerBStats,
                            answerCStats,
                            answerDStats
                        })
                        socketConnections = 0;
                        answerAStats = 0;
                        answerBStats = 0;
                        answerCStats = 0;
                        answerDStats = 0;
                        noAnswerStats = 0;
                        QDetails = {};
                        userChoice = '';
                        totalAnswers = 0;
                        // socket.emit('userChoice', {
                        //     userChoice
                        // })
                    }
                }, 1000);
            }, 5000);
            io.sockets.emit('preQuestion', message);
        });
        
    
        socket.on('choice', function(data) {
            console.log("data", data)
            userChoice = data.answer;
            if(data.answer === 'a') {
                answerAStats++;
                console.log("a",answerAStats)
            }
            if(data.answer === 'b') {
                answerBStats++;
                console.log("b",answerBStats)
            }
            if(data.answer === 'c') {
                answerCStats++;
                console.log("c",answerCStats)
            }
            if(data.answer === 'd') {
                answerDStats++;
                console.log("d",answerDStats)
            }
            // if(data.answer === '') {
            //     noAnswerStats++;
            // }
        })
       
        socket.on('disconnect', () => {
            console.log("Client disconnected");
            // clearInterval(questionCountdown);
        });
    // }
});





// const http = require('http');
// const socketIo = require('socket.io');

// const port = process.env.PORT || 4001;
// const app = require('./routes/app');

// const index = express();
// index.use(app);

// const server = http.createServer(index);

// const io = socketIo(server);

// let interval;
// let clientCount = 0;
// let startGame = false;

// io.on('connection', (socket) => {
//     if(clientCount < 2) {
//         console.log("New client connected", clientCount);
//         clientCount++;
//     }
//     else if(clientCount === 2) {
//         startGame = true;
//         if (interval) {
//             clearInterval(interval);
//         }
//         if(startGame) {
//             // while there are still questions and clients left, do this:
//             io.sockets.emit('preQuestion', "Get ready for the next question.");
//             console.log("prequestion")
//             var preQuestion = setTimeout(function() {
//                 var counter = 10;
//                 var questionCountdown = setInterval(function(){
//                     console.log(counter) 
//                     io.sockets.emit('counter', counter);
//                     counter--;
                    
//                     if (counter === 0) {
//                         io.sockets.emit('counter', 0);
//                         console.log("Time's up!!!")
//                         clearInterval(questionCountdown);
//                     }
//                 }, 1000);
                
                
//                 // var postQuestionStats = setTimeout(function() {
//                     // }, 15000);
//                 }, 5000);
//                 socket.on("postQuestionStats", function(data) {
//                         console.log("Stats page")
//                         console.log("ReceivedData:", data)
//                         io.sockets.emit('postQuestionStats', data)
//                     })
//                 socket.on('disconnect', () => {
//                 console.log("Client disconnected");
//                 clearInterval(interval);
//             });
//         }
//     }
// });


// server.listen(port, () => console.log(`Listening on port ${port}`));
 // socket.on('choiceB', function(data) {
    //     if(data.answer === 'b') {
    //         answerBStats++;
    //     }
    //     console.log("AnswerB", answerBStats)
    // })
    // socket.on('choiceC', function(data) {
    //     if(data.answer === 'c') {
    //         answerCStats++;
    //     }
    //     console.log("AnswerCStats", answerCStats)
    // })
    // socket.on('choiceD', function(data) {
    //     if(data.answer === 'd') {
    //         answerDStats++;
    //     }
    //     console.log("AnswerD", answerDStats)
    // })