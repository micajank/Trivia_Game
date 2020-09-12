# Trivia_Game
An HQ Trivia style game to play with friends, family, and people all over the world

## Project Planning
### Stack
Node/Express app with a React front-end
Sockets.io

## Initial Steps
1. npx create-react-app 
2. Create landing page with game loading screen
3. Use react hooks to develope quiz components and winning/losing pages

4. node init
5. Create express app
6. Implement websockets so multiple clients can communicate with the server
7. Test socket connections

8. Deal with responsed from users and return solutions
9. Build stats that return to users after answer given

## Restart Initiated
After making it through steps 1-7 of initial setup, I discovered the conflicting processes of sockets and react. After trying everything I could think of, as well as reaching out to colleagues (without success as no one I know has tried to use React with sockets) I have decided to start again with a more common stack for sockets: Express/Node backend, with simple HTML, CSS, and JavaScript in the front end.

### Restart Steps
1. npm init to create node application
2. touch index.html and style.css, put together similar boilerplate and styling like the previously attempted trivia game
3. Convert/translate backend express app to single index.js, install node version of socket.io
4. Convert/translate frontend from react into vanilla Js, getting caught up to previous attempt's progress 
#### Note: Had an issue after pushing to repo and moving files, something I could not locate was corrupted in my code, giving me additional, unexpected output. Created new git repo, and new node project with the same file system and prepushed code, then pushed to new rep.
5. Now that many users can get the same question and send different answers successfuly, my next step is to return stats info from backend on which answers user chose.
6. Deal with correct vs incorrect answers
7. Change single round game into looping game that runs as long as there is more than 1 player (a connected client that has gotten all answers correct) and there are more that 0 trivia questions left. As well as create pause before game begins/not on reload of page/when enough people enter a room.

8. Add landing page/sign-in form to get user's names
9. Research sessions/tokens for allowing multiple games to run concurrently
10. Add additional categories for clients to choose from

11. Add restart/return to landing screen
