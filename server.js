const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer(); // Create http server
const io = socketIo(server);        // initialize socket.io

io.on("connection",(socket) =>{
    console.log(`Client ${socket.id} connected`); // Log client connection by ID

    socket.on("disconnect", () =>{
        console.log(`Client ${socket.id} disconnected`); // Log client disconnection by ID
    })
    //create channel/socket message
    socket.on("message", (data) =>{
        let {username, message} = data;
        console.log(`Receiving message from ${username}: ${message} `);

        // Broadcast message to all connected client
        // emit message data and hash to all client
        io.emit("message", data);
    })
});

// Specify server port and start listening
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});