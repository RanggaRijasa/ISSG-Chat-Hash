const http = require("http");
const socketIo = require("socket.io");
const crypto = require("crypto");

const server = http.createServer();
const io = socketIo(server);

const users = new Map();

io.on("connection", (socket) => {
  console.log(`Client ${socket.id} connected`);

  socket.emit("init", Array.from(users.entries()));

  socket.on("registerPublicKey", (data) => {
    const { username, publicKey } = data;
    users.set(username, publicKey);
    console.log(`${username} registered with public key.`);

    io.emit("newUser", { username, publicKey });
  });

  socket.on("message", (data) => {
    const { username, message, signature } = data;
    const publicKey = users.get(username);

    if (publicKey) {
      // Verify the message signature
      const verify = crypto.createVerify("SHA256");
      verify.update(message);
      verify.end();
      const isValid = verify.verify(publicKey, signature, "hex");

      if (!isValid) {
        // Detected impersonation attempt
        console.log(`Impersonation attempt detected from ${username}`);
        io.emit("message", {
          username,
          message,
          warning: true,
        });
      } else {
        io.emit("message", {
          username,
          message,
          warning: false,
        });
      }
    } else {
      console.log(`Unknown user: ${username}`);
      io.emit("message", {
        username,
        message,
        warning: true,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected`);
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
