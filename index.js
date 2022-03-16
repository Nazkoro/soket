const io = require("socket.io")(8900, {
    cors: {
        origin: "http://localhost:4200",
    },
});
console.log("server start")
let users = [];
let usersInRoom = [];
let map = new Map();

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

// const addUserToRoom = (userId, socketId) => {
//     !usersInRoom.some((user) => user.userId === userId) &&
//     usersInRoom.push({ userId, socketId });
// };

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
    socket.on("sendMessage", ({ senderId, receiverId, text, coverPicture, username, roomId }) => {
        try{
            console.log("line 34 senderId,receiverId,text",senderId, receiverId, text, coverPicture, username)
            console.log("line 35 users",users)

            const user = getUser(receiverId);
            console.log("line 37 user", user)
            

            for (let key of map.keys()) {
                if(key === roomId._id){
                    let countmessage = map.get(roomId._id)
                    map.set(roomId._id, countmessage + 1)
                } 
              }
              if(map.get(roomId._id) == undefined){
                map.set(roomId._id, 1)
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

    //take userId and socketId from userRppm

    // socket.on("addUserToRoom", (userId) => {
    //     console.log("line 27 userId",userId)
    //     addUserToRoom(userId, socket.id);
    //     io.emit("getUsersInRoom", usersInRoom);
    // });

    //send and get message in room
    socket.on("sendMessageToRoom", ({ senderId, roomId, text, coverPicture, username }) => {
        try{
            socket.join(roomId);
            console.log("line 68",senderId, roomId, text, coverPicture, username)
        
            // const user = getUser(receiverId);
            // console.log("line 37 user", user)
            socket.to(roomId).emit("getMessage", {
                senderId,
                text,
                coverPicture,
                username
            });
        }
        catch(err){
            console.log("line 78", err)
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