const mongoose = require("mongoose");
require("dotenv").config();
let mongodbUrl = process.env.MONGODB;

mongoose.connect(mongodbUrl)
    .then(() => console.log(`Bingo database connected`))
    .catch(err => console.error(`Error : database connection =>>> ${error}`))

const serverSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
    },
    roomPassword: {
        type: String,
        required: true
    },
    roomMaster: {
        type: String,
        required: true,
    },
    gameStarted: { type: Boolean, default: false },
    players: [{
        playerName: { type: String },
        playerStatus: { type: Boolean }
    }],
    totalPlayer: { type: Number, default: 1 },
    totalPlayerReady: { type: Number, default: 1 }
})

const serverCol = mongoose.model("serverCollection", serverSchema);

module.exports = { serverCol }