const path = require('path')
const http = require('http');
var express = require('express');
var socket = require('socket.io');

const { userJoin, getCurrentUser, userLeaves, getRoomUsers } = require('./utils/users')


// APP Setup
const app = express();
const server = http.createServer(app)
const io = socket(server);

// var app = express();
// var server = app.listen(4000, function(){
//     console.log("Listening to requests on PORT 4000");
// })

// Stic Files
app.use(express.static('public'));
// app.use(express.static(path.join(__dirname, 'public')));
// const PORT = 3000 || process.env.PORT;
// server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Socket Setup
var socketConnections = 0;
var answerAStats = 0;
var answerBStats = 0;
var answerCStats = 0;
var answerDStats = 0;
var answerA = 0;
var answerB = 0;
var answerC = 0;
var answerD = 0;
var noAnswer = 0;
var noAnswerStats = 0;
var QDetails = {};
var userChoice = '';
var totalAnswers = 0;
var numberOfResponses = 0
var acceptResponses = true

io.on('connection', function(socket){
    console.log("Made socket connection", socket.id);
    socketConnections++;
    console.log(socketConnections);
    // if(socketConnections > 1) {
        // io.sockets.emit('startGame', {
        //     stuff: 1
        // })
    socket.on('joinRoom', ({ username, room }) => {
        const aUser = userJoin(socket.id, username, room);
        const user = getCurrentUser(socket.id)
        socket.join(aUser.room);
        
        socket.broadcast.to(user.room).emit('message', `${user.username} has joined the game`);
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

        let users = getRoomUsers(user.room);
        if (users.length > 2) {
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
                    // const user = getCurrentUser(socket.id)
                    io.to(user.room).emit('question', QDetails)
                    answerAStats = 0;
                    answerBStats = 0;
                    answerCStats = 0;
                    answerDStats = 0;
                    noAnswerStats = 0;
                    // Countdown
                    var counter = 11;
                    var questionCountdown = setInterval(function(){
                        io.to(user.room).emit('counter', (counter - 1));
                        counter--;
        
                        if (counter === 0) {
                            io.to(user.room).emit('counter', 0);
                            console.log("Time's up!!!")
                            // clearInterval(questionCountdown);
                        }
                        if(counter == -2) {
                            clearInterval(questionCountdown);
                            answerAStats = 0;
                            answerBStats = 0;
                            answerCStats = 0;
                            answerDStats = 0;
                            totalAnswers = parseFloat(answerA + answerB + answerC + answerD + noAnswer);//+noAnswerStats
                            answerAStats = Math.floor((answerA / totalAnswers) * 100);
                            answerBStats = Math.floor((answerB / totalAnswers) * 100);
                            answerCStats = Math.floor((answerC / totalAnswers) * 100);
                            answerDStats = Math.floor((answerD / totalAnswers) * 100);
                            console.log("AnswerAStats", answerAStats)
                            console.log("AnswerBStats", answerBStats)
                            console.log("AnswerCStats", answerCStats)
                            console.log("AnswerDStats", answerDStats)
                            let answer = ""
                            // noAnswerStats = Math.floor((noAnswerStats / totalAnswers) * 100);
                            io.to(user.room).emit('counter', -1);
                            io.to(user.room).emit('choice', {
                                answerAStats,
                                answerBStats,
                                answerCStats,
                                answerDStats,
                                answer
                            })
                            answerA = 0;
                            answerB = 0;
                            answerC = 0;
                            answerD = 0;
                            noAnswer = 0;
                            noAnswerStats = 0;
                            QDetails = {};
                            userChoice = '';
                            totalAnswers = 0;
                            numberOfResponses = 0
                            
                        }
                    }, 1000);
                }, 5000);
                io.to(user.room).emit('preQuestion', message);
            });
            
        
            socket.on('choice', function(data) {
                if (numberOfResponses < socketConnections) {
                    userChoice = data.answer;
                    numberOfResponses++
                    if(data.answer === 'a') {
                        answerA++;
                        console.log("AnswerA",answerA)
                    } 
                    else if(data.answer === 'b') {
                        answerB++;
                        console.log("AnswerB",answerB)
                    }
                    else if(data.answer === 'c') {
                        answerC++;
                        console.log("AnswerC",answerC)
                    }
                    else if(data.answer === 'd') {
                        answerD++;
                        console.log("AnswerD",answerD)
                    }
                    else if(data.answer === '') {
                        noAnswer++;
                        console.log("No answer", noAnswer)
                    }
                } else {
                    acceptResponses = false
                    // console.log(acceptResponses)
                }
                
            })

        }
    }) // end join room function
    
    
    socket.on('disconnect', () => {
        console.log("Client disconnected");
        const user = userLeaves(socket.id)
        if (user) {
            io.to(user.room).emit('message', `${user.username} has left the game`);
        }
        // const user = getCurrentUser(socket.id)
        // io.emit('message', "A user has left the game");
        // clearInterval(questionCountdown);
    });
    // }
});
const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))





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