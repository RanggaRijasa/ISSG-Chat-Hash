const io = require("socket.io-client");
const readline = require("readline");
const crypto = require("crypto"); // Import crypto for hashing

const socket = io("http://localhost:3000");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> "
});

let username = "";

// Function to generate a hash for the message
function generateHash(message) {
    return crypto.createHash("sha256").update(message).digest("hex");
}

socket.on("connect", () => {
    console.log("Connected to the server");

    rl.question("Enter your username: ", (input) => {
        username = input;
        console.log(`Welcome, ${username} to the chat`);
        rl.prompt();

        rl.on("line", (message) => {
            if (message.trim()) {
                const hash = generateHash(message); // Generate hash for the message
                // Send the message with hash to the server
                socket.emit("message", { username, message, hash });
            }
            rl.prompt();
        });
    });
});

socket.on("message", (data) => {
    const { username: senderUsername, message: senderMessage, hash: receivedHash } = data;

    // Verify hash to ensure message integrity
    if (receivedHash && generateHash(senderMessage) === receivedHash) {
        if (senderUsername != username) {
            console.log(`${senderUsername}: ${senderMessage}`);
            rl.prompt();
        }
    } else {
        console.log("Message tampering detected!");
    }
});

socket.on("disconnect", () => {
    console.log("Server disconnected, Exiting...");
    rl.close();
    process.exit(0);
});

rl.on("SIGINT", () => {
    console.log("\nExiting...");
    socket.disconnect();
    rl.close();
    process.exit(0);
});
