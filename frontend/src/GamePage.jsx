import { useEffect, useState, useMemo } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import "./gamePage.css";
import { useLocation } from "react-router-dom";

const GamePage = () => {

    const socket = useMemo(() => io("http://localhost:8000"), []);
    const loc = useLocation();
    const roomId = loc.state.roomData.roomId;
    const playerName = loc.state.playerName;
    const isRoomMaster = loc.state.isRoomMaster;
    const playerTurn = loc.state.playerTurn;

    const [canStart, setCanStart] = useState(false);
    const [roomData, setRoomData] = useState(loc.state.roomData);
    const [isReady, setIsReady] = useState(false);
    const [clickedNumber, setClickedNumber] = useState();
    const [bingoNumbers, setBingoNumbers] = useState([]);
    const [winnerName, setWinnerName] = useState("");
    const [currentPlayerTurn, setCurrentPlayerTurn] = useState(1);

    let num = 1;

    const handleNotification = (msg) => {
        let notification_div = document.querySelector(".bingo-gamepage-wrapper .right .notification");
        notification_div.innerText = msg;
        notification_div.classList.add("show-notification");
        setTimeout(() => {
            notification_div.classList.remove("show-notification");
        }, 2000);
    }

    const currentNumberNotification = (curr_num) => {
        let notification_div = document.querySelector(".bingo-gamepage-wrapper .right .notification");
        notification_div.innerText = `Current call is ${curr_num}`;
        notification_div.classList.add("show-notification");
        setTimeout(() => {
            notification_div.classList.remove("show-notification");
        }, 2000);
    }

    useEffect(() => {
        socket.emit("join-room", { roomId, playerName })
        socket.on("new-player-joined", (playerName) => {
            handleNotification(`${playerName} has joined!!!`);
        })
        socket.on("updated-room-details", roomData => {
            setRoomData(roomData);
        })
        socket.on("winner-name", (winnerName) => {
            setWinnerName(winnerName);
        })

        socket.on("play-again-status", (roomData) => {
            setWinnerName("")
            setRoomData(roomData);
            setIsReady(false);
            setCurrentPlayerTurn(1);
            num = 1;
        })
    }, [])

    useEffect(() => {
        socket.on("incoming-bingo-number", bingo_num => {
            currentNumberNotification(bingo_num);
            if (bingoNumbers.length > 0) {
                document.querySelectorAll('.bingo-gamepage-wrapper .right .bingo-container .bingo-select-field-div div').forEach(ele => ele.innerText == bingo_num ? ele.classList.add("active-div") : "")
                currentPlayerTurn < roomData.totalPlayer ? setCurrentPlayerTurn(currentPlayerTurn + 1) : setCurrentPlayerTurn(1);
            }
        })
    })

    useEffect(() => {
        if (currentPlayerTurn == playerTurn && roomData.gameStarted) {
            socket.emit("show-current-playerName", ({ playerName, roomId }));
        };
        socket.on("current-playerTurn-name", currentplayerName => {
            let notification_div = document.querySelector(".bingo-gamepage-wrapper .right .currentTurn-notification");
            notification_div.innerText = `${currentplayerName}'s turn!!!`;
            notification_div.classList.add("show-notification");
            setTimeout(() => {
                notification_div.classList.remove("show-notification");
            }, 5000);

        })
    }, [currentPlayerTurn])



    const changeColor = () => {
        let bingoInput = document.querySelectorAll(".bingo-gamepage-wrapper .right .bingo-container .bingo-input-div select");
        bingoInput.forEach(ele => {
            ele.style.color = "white";
        })
    }

    const updatePlayerStatus = () => {
        socket.emit("update-player-status", { roomId, playerName, isRoomMaster })
    }

    const ready = () => {
        let bingoInput = document.querySelectorAll(".bingo-gamepage-wrapper .right .bingo-container .bingo-input-div select");
        let tempArray = [];

        bingoInput.forEach(ele => tempArray.push(ele.value))

        for (let i = 0; i < 25; i++) {
            if (tempArray.lastIndexOf(tempArray[i]) - tempArray.indexOf(tempArray[i]) > 0) {
                bingoInput.forEach(ele => {
                    if (ele.value == tempArray[i]) ele.style.color = "red";
                })
                return;
            }
        }

        setBingoNumbers([...tempArray])
        setIsReady(true);

        // Trigger the ready socket listener to update the status to ready
        updatePlayerStatus()
    }

    const call = () => {
        document.querySelectorAll('.bingo-gamepage-wrapper .right .bingo-container .bingo-select-field-div div').forEach(ele => ele.classList.remove("clickedDiv"));
        socket.emit("current-number-called", { clickedNumber, roomId })
    }

    const callBingo = () => {
        let bingoFields = document.querySelectorAll(".bingo-gamepage-wrapper .right .bingo-container .bingo-select-field-div div");
        let count = 0;

        if (bingoFields[0].classList.contains("active-div") && bingoFields[1].classList.contains("active-div") && bingoFields[2].classList.contains("active-div") && bingoFields[3].classList.contains("active-div") && bingoFields[4].classList.contains("active-div")) count++;
        if (bingoFields[5].classList.contains("active-div") && bingoFields[6].classList.contains("active-div") && bingoFields[7].classList.contains("active-div") && bingoFields[8].classList.contains("active-div") && bingoFields[9].classList.contains("active-div")) count++;
        if (bingoFields[10].classList.contains("active-div") && bingoFields[11].classList.contains("active-div") && bingoFields[12].classList.contains("active-div") && bingoFields[13].classList.contains("active-div") && bingoFields[14].classList.contains("active-div")) count++;
        if (bingoFields[15].classList.contains("active-div") && bingoFields[16].classList.contains("active-div") && bingoFields[17].classList.contains("active-div") && bingoFields[18].classList.contains("active-div") && bingoFields[19].classList.contains("active-div")) count++;
        if (bingoFields[20].classList.contains("active-div") && bingoFields[21].classList.contains("active-div") && bingoFields[22].classList.contains("active-div") && bingoFields[23].classList.contains("active-div") && bingoFields[24].classList.contains("active-div")) count++;
        if (bingoFields[0].classList.contains("active-div") && bingoFields[5].classList.contains("active-div") && bingoFields[10].classList.contains("active-div") && bingoFields[15].classList.contains("active-div") && bingoFields[20].classList.contains("active-div")) count++;
        if (bingoFields[1].classList.contains("active-div") && bingoFields[6].classList.contains("active-div") && bingoFields[11].classList.contains("active-div") && bingoFields[16].classList.contains("active-div") && bingoFields[21].classList.contains("active-div")) count++;
        if (bingoFields[2].classList.contains("active-div") && bingoFields[7].classList.contains("active-div") && bingoFields[12].classList.contains("active-div") && bingoFields[17].classList.contains("active-div") && bingoFields[22].classList.contains("active-div")) count++;
        if (bingoFields[3].classList.contains("active-div") && bingoFields[8].classList.contains("active-div") && bingoFields[13].classList.contains("active-div") && bingoFields[18].classList.contains("active-div") && bingoFields[23].classList.contains("active-div")) count++;
        if (bingoFields[4].classList.contains("active-div") && bingoFields[9].classList.contains("active-div") && bingoFields[14].classList.contains("active-div") && bingoFields[19].classList.contains("active-div") && bingoFields[24].classList.contains("active-div")) count++;
        if (bingoFields[0].classList.contains("active-div") && bingoFields[6].classList.contains("active-div") && bingoFields[12].classList.contains("active-div") && bingoFields[18].classList.contains("active-div") && bingoFields[24].classList.contains("active-div")) count++;
        if (bingoFields[4].classList.contains("active-div") && bingoFields[8].classList.contains("active-div") && bingoFields[12].classList.contains("active-div") && bingoFields[16].classList.contains("active-div") && bingoFields[20].classList.contains("active-div")) count++;

        if (count >= 5) socket.emit("winner-declared", { roomId, playerName })
        else console.log("NOT YET")
    }

    const playAgain = () => {
        let roomMaster = roomData.roomMaster;
        socket.emit("play-again", { roomId, roomMaster })
    }

    const handleDivClick = (div, value) => {
        setClickedNumber(value)
        document.querySelectorAll('.bingo-gamepage-wrapper .right .bingo-container .bingo-select-field-div div').forEach(ele => ele.classList.remove("clickedDiv"));
        div.classList.add("clickedDiv");
    }

    const handleMenu = () => {
        document.querySelector(".bingo-gamepage-wrapper .left").classList.toggle("active-menu");
    }

    if (roomData !== undefined) {
        return (
            <>
                <section className="bingo-gamepage-wrapper">
                    <div className="hamburger" onClick={() => handleMenu()}>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                    <div className="left">
                        <div className="player-data">
                            <p>{roomData.roomMaster}</p>
                            <div style={{ backgroundColor: "green" }}></div>
                        </div>
                        {
                            roomData.players.slice(1).map(player => (
                                <div className="player-data" key={player._id}>
                                    <p>{player.playerName}</p>
                                    {player.playerStatus ? <div style={{ backgroundColor: "green" }}></div> : <div style={{ backgroundColor: "red" }}></div>}
                                </div>
                            ))
                        }
                    </div>
                    <div className="right">
                        <div className="notification-container">
                            <div className="notification"></div>
                            <div className="currentTurn-notification"></div>
                        </div>
                        {
                            winnerName === ""
                                ? !isReady
                                    ? <div className="bingo-container">
                                        {
                                            Array(5).fill(0).map((i, index) => (
                                                <div className="bingo-input-div" key={`${i}${index}`} style={{ display: "flex" }}>
                                                    {
                                                        Array(5).fill(1).map((i, index) => (
                                                            <select key={`${i}${index}`} onClick={() => changeColor()} defaultValue={num++} style={{ backgroundColor: "transparent", color: "white" }}>
                                                                {
                                                                    Array(25).fill(5).map((i, index) => (
                                                                        <option key={`${i}${index}`} value={++index} style={{ color: "black" }}>{index}</option>
                                                                    ))
                                                                }
                                                            </select>
                                                        ))
                                                    }
                                                </div>
                                            ))
                                        }
                                        <div className="btn-container" style={{ display: "flex", justifyContent: "center" }}>
                                            {
                                                isRoomMaster
                                                    ? roomData.totalPlayer > 1 && roomData.totalPlayerReady === roomData.totalPlayer
                                                        ? <button onClick={() => ready()}>START</button>
                                                        : <button className="inactive-start-btn" style={{ backgroundColor: "grey", color: "black", cursor: "default" }} onClick={() => handleNotification("Players are not ready!!!")}>START</button>
                                                    : <button onClick={() => ready()}>READY</button>
                                            }
                                        </div>
                                    </div>
                                    : <div className="bingo-container">
                                        {
                                            Array(5).fill(2).map((i, index) => (
                                                <div className="bingo-select-field-div" key={`${i}${index}`} style={{ display: "flex" }}>
                                                    {
                                                        bingoNumbers.slice(index * 5, index * 5 + 5).map((divNum, index) => (
                                                            <div key={`${divNum}${index}`} onClick={(e) => handleDivClick(e.target, divNum)}>{divNum}</div>
                                                        ))
                                                    }
                                                </div>
                                            ))
                                        }
                                        <div className="btn-container" style={{ display: "flex", justifyContent: "center" }}>
                                            {playerTurn === currentPlayerTurn ? <button onClick={() => call()} style={{ backgroundColor: "green" }}>CALL</button> : <button style={{ backgroundColor: "red", cursor: "default" }}>CALL</button>}
                                            <button onClick={() => callBingo()}>BINGO</button>
                                        </div>
                                    </div>
                                : isRoomMaster
                                    ? <div className="winner-declare">
                                        <p>{winnerName} won</p>
                                        <button onClick={() => playAgain()}>Play Again</button>
                                    </div>
                                    : <div className="winner-declare">
                                        <p>{winnerName} won</p>
                                    </div>
                        }
                    </div>
                </section>
            </>
        )
    } else {
        return (
            <div>Network connection error</div>
        )
    }
}

export default GamePage;