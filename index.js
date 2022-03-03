const io = require("socket.io")(8900, {
    cors: {
        origin: "http://localhost:4200",
    },
});
console.log("server start")
let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
};
io.on("connection", (socket) => {
    //when ceonnect
    console.log("a user connected.");
    
    //take userId and socketId from user
    socket.on("addUser", (userId) => {
        console.log("line 27 userId",userId)
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    //send and get message
    socket.on("sendMessage", ({ senderId, receiverId, text }) => {
        try{
            console.log("line 34 senderId,receiverId,text",senderId, receiverId, text)
            console.log("line 35 users",users)
            const user = getUser(receiverId);
            console.log("line 37 user", user)
            io.to(user.socketId).emit("getMessage", {
                senderId,
                text,
            });
        }
        catch(err){
            console.log("line 45", err)
        }

    });

    //when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        io.emit("getUsers", users);
    });
});