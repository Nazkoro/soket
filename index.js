const io = require("socket.io")(8900, {
    cors: {
        origin: "http://localhost:4200",
    },
});
console.log("server start")
let users = [];
let map = new Map();

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

map.set(1, 1)

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
    socket.on("sendMessage", ({ senderId, receiverId, text, coverPicture, username, roomId, clearCountMessage }) => {
        try{
            console.log("line 34 senderId,receiverId,text,...,roomId,clearCountMessage }}}}{{{",senderId, receiverId, text, coverPicture, username,roomId._id,clearCountMessage)
            console.log("line 35 users",users)

            const user = getUser(receiverId);

            for (let key of map.keys()) {
                if(key === roomId._id){
                    let countmessage = map.get(roomId._id)
                    map.set(roomId._id, countmessage + 1)
                } 
              }
              if(map.get(roomId._id) == undefined){
                map.set(roomId._id, 1)
              }

              if(clearCountMessage) {
                map.set(roomId._id, 0)
              }
             
              console.log("map.get(roomId._id)", map.get(roomId._id))
              
            io.to(user.socketId).emit("getMessage", {
                senderId,
                text,
                coverPicture,
                username,
                roomId,
                countMessage: map.get(roomId._id)
            });
        }
        catch(err){
            console.log("line 45", err)
        }

    });

    //send and get message in room
    socket.on("sendMessageToRoom", ({ senderId, roomId, text, coverPicture, username }) => {
        try{
            socket.join(roomId);
            console.log("line 68",senderId, roomId, text, coverPicture, username)
        
            socket.to(roomId).emit("getMessage", {
                senderId,
                text,
                coverPicture,
                username
            });
        }
        catch(err){
            console.log( err)
        }

    });

    //when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        removeUser(socket.id);
        // socket.leave(roomId);
        io.emit("getUsers", users);
    });
});