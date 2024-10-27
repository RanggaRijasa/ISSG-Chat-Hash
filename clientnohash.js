const io = require("socket.io-client");
const readline = require("readline");

const socket = io("http://localhost:3000"); // Connect to the server

const rl = readline.createInterface({ // Set up readline interface for user input in the terminal
    input: process.stdin,
    output: process.stdout,
    prompt:"> "
});

let username = "";


socket.on("connect",() =>{
    console.log("Connected to the server"); // Event triggered when the client connects to the server

    rl.question("Enter your username: ", (input) => {     // Prompt the user to enter their username
        username = input;
        console.log(`Welcome, ${username} to the chat`);
        rl.prompt();

        rl.on("line", (message) =>{
           
            if(message.trim()){
                // Send message directly to the server without hashing
                socket.emit("message", {username, message});
            }
            rl.prompt();
        });
    });
});

socket.on("message", (data) => {
    const {username: senderUsername, message: senderMessage} = data;
    if(senderUsername != username){ // Display incoming messages from other users
        console.log(`${senderUsername}: ${senderMessage}`);
        rl.prompt();
    }
});

socket.on("disconnect",() =>{
    console.log("Server disconnected, Exiting...");
    rl.close();
    process.exit(0);
});

rl.on("SIGINT", () =>{ // Handle Ctrl+C in the terminal to exit gracefully
    console.log("\nExiting...");
    socket.disconnect();
    rl.close();
    process.exit(0);
});