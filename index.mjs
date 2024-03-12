import express, { urlencoded } from "express";
import cors from "cors";
import { serverCol } from "./database.js";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const web = express();
const PORT = 8000 || process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

web.use(cors());
web.use(urlencoded({ extended: false }))
web.use(express.json())
const server = new createServer(web);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["POST", "GET", "PUT", "DELETE"],
        credentials: true
    }
})

//FETCHING ROOM DETAILS API
async function fetchRoomDetails(roomId) {
    try {
        const data = await serverCol.findOne({ roomId: roomId });
        return data !== null ? data : null;
    } catch (error) {
        console.error(`Server Error : fetching room details --> ${error}`)
    }
}
//END OF FETCHING ROOM DETAILS API

//UPDATING PLAYER STATUS

async function updatePlayerStatus(roomId, playerName, isRoomMaster) {
    try {
        isRoomMaster
            ? await serverCol.updateOne({ roomId: roomId }, { gameStarted: isRoomMaster })
            : await serverCol.updateOne({ roomId: roomId }, { $inc: { totalPlayerReady: 1 } })
        const response = await serverCol.updateOne({ roomId: roomId, "players.playerName": playerName }, { $set: { "players.$.playerStatus": true } })
        if (response.acknowledged) {
            const data = await serverCol.findOne({ roomId: roomId })
            return data !== null ? data : null;
        }
    } catch (error) {
        console.error(`Server Error : Updating Player Status --> ${error}`)
    }
}

//END OF UPDATING PLAYER STATUS

//PLAY AGAIN 

async function playAgain(roomId, roomMaster) {
    const response = await serverCol.updateOne(
        { roomId: roomId, players: { $elemMatch: { playerName: { $ne: roomMaster } } } },
        { $set: { "players.$[elem].playerStatus": false, totalPlayerReady: 1, gameStarted: false } },
        { arrayFilters: [{ "elem.playerName": { $ne: "a" } }], multi: true })

    if (response.acknowledged) {
        const data = await serverCol.findOne({ roomId: roomId })
        return data !== null ? data : null
    }
}

//END OF PLAY AGAIN

//WEB SOCKET CONNECTION ESTABLISHMENT

io.on("connection", (socket) => {

    socket.on("current-number-called", ({ clickedNumber, roomId }) => {     // TO display the current bingo number
        io.to(roomId).emit("incoming-bingo-number", clickedNumber)
    })

    socket.on("winner-declared", ({ roomId, playerName }) => {     // To display the winner name
        io.to(roomId).emit("winner-name", playerName)
    })

    socket.on("join-room", async ({ roomId, playerName }) => {     // To let the player join a room
        let response = await fetchRoomDetails(roomId);
        if (response !== null) {
            socket.join(roomId);
            socket.broadcast.to(roomId).emit("new-player-joined", playerName)
            io.to(roomId).emit("updated-room-details", response);
        }
    })

    socket.on("update-player-status", async ({ roomId, playerName, isRoomMaster }) => {
        let response = await updatePlayerStatus(roomId, playerName, isRoomMaster);
        if (response !== null) {
            io.to(roomId).emit("updated-room-details", response);
        }
    })

    socket.on("play-again", async ({ roomId }) => {
        let response = await playAgain(roomId);
        if (response !== null) {
            io.to(roomId).emit("play-again-status", response)
        }
    })

    socket.on("show-current-playerName", ({ playerName, roomId }) => {
        io.to(roomId).emit("current-playerTurn-name", playerName)
    })

    socket.on("disconnect", () => {
        // console.log("disconnected")
    })

})

//END OF WEB SOCKET CONNECTION ESTABLISHMENT

//CREATE A NEW ROOM
web.post("/createRoom", async (req, res) => {
    try {
        const { roomId, roomPassword, roomMaster } = req.body;
        const roomExists = await serverCol.findOne({ roomId: roomId })

        if (roomExists === null) {
            const data = new serverCol({
                roomId: roomId,
                roomPassword: roomPassword,
                roomMaster: roomMaster,
                players: [{
                    playerName: roomMaster,
                    playerStatus: true
                }],
            })

            const response = await data.save();
            response !== null ? res.status(200).send(data) : res.status(200).send(false)
        } else {
            res.status(200).send("room exists")
        }
    } catch (error) {
        console.error(`Error : new room creation --> ${error}`)
    }
})
//END OF ROOM CREATION API

//JOIN A ROOM API
web.post("/joinRoom", async (req, res) => {
    try {
        const { roomId, roomPassword, playerName } = req.body;
        const roomExist = await serverCol.findOne({ roomId: roomId, roomPassword: roomPassword });

        if (roomExist !== null) {
            if (roomExist.gameStarted) {
                res.status(200).send("game started")
            } else {
                const playerExists = await serverCol.findOne({ roomId: roomId, "players.playerName": playerName });

                if (playerExists === null) {
                    const response = await serverCol.updateOne({ roomId: roomId }, { $push: { players: { playerName: playerName, playerStatus: false } }, $inc: { totalPlayer: 1 } })
                    const data = await serverCol.findOne({ roomId: roomId });
                    response.modifiedCount > 0 && data !== null ? res.status(200).send(data) : res.status(200).send("couldn't added")
                } else {
                    res.status(200).send("player exists");
                }
            }
        } else {
            res.status(200).send("wrong-room-info")
        }
    } catch (error) {
        console.error(`Error : Join a room api --> ${error}`)
    }
})
//END OF JOIN A ROOM API

web.use(express.static(path.join(__dirname, "./frontend/dist")));
web.get("*", (req, res) => {
    try {
        res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
    } catch (error) {
        console.error(`Error : couldn't retrieve the clientside files =>> ${error}`)
    }
})

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));