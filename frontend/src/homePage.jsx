import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import axios from "axios";
import { io } from "socket.io-client";
import "./homePage.css";

const HomePage = () => {
    const socket = io("http://localhost:8000")
    const nav = useNavigate();
    const [canCreateServer, setCanCreateServer] = useState(false);
    const [canEnterAServer, setCanEnterAServer] = useState(false);
    const [roomId, setRoomId] = useState();
    const [roomMaster, setRoomMaster] = useState();
    const [playerName, setPlayerName] = useState();
    const [roomPassword, setRoomPassword] = useState();

    const createServer = () => {
        axios.post("/createRoom", { roomId, roomPassword, roomMaster })
            .then((res) => {
                if (res.data === "room exists") {
                    window.alert("This room id has already been taken");
                } else if (res.data === false) {
                    window.alert("Something went wrong")
                } else {
                    let roomData = res.data
                    window.alert("Room created")
                    let playerName = roomMaster;
                    nav("/gamePage", { state: { roomData, playerName, isRoomMaster: true, playerTurn: 1 } })
                }
            })
            .catch(err => {
                window.alert("Network connection error");
                console.error(`Error : Room creation failed -->${err}`)
            })
    }

    const enterAServer = () => {
        axios.post("/joinRoom", { roomId, roomPassword, playerName })
            .then((res) => {
                if (res.data === "couldn't added") {
                    window.alert("Something went wrong");
                } else if (res.data === "player exists") {
                    window.alert("This name has already been taken")
                } else if (res.data === "wrong-room-info") {
                    window.alert("Wrong Room Info")
                } else if (res.data === "game started") {
                    window.alert("Game has been started")
                }
                else {
                    let roomData = res.data;
                    nav("/gamePage", { state: { roomData, playerName, isRoomMaster: false, playerTurn: roomData.totalPlayer } })
                }
            })
            .catch(err => window.alert("Network connection error"))
    }

    useEffect(() => {
        const inputs = document.querySelectorAll(".homePage-wrapper .room-create-wrapper .input-container input");
        const events = ["mouseenter", "click"]

        inputs.forEach((input) => {

            const spansOfLabelArray = new Array(input.nextSibling.children);  //will target the children of the next recent sibling of the current input as an array

            //will traverse all the elements present in the spansoflabelarray 
            spansOfLabelArray.forEach(spansofLabel => {   //spanoflabel is the array of all the spans present in the spansoflabelarray

                let len = spansofLabel.length;

                for (let i = 0; i < len; i++) {
                    spansofLabel[i].style.left = `${i * 10}px`
                }
            })
            events.forEach(evt => {

                input.addEventListener(evt, () => {

                    spansOfLabelArray.forEach(spansofLabel => {
                        let i = 0, len = spansofLabel.length;
                        let time = setInterval(() => {
                            i < len ? spansofLabel[i++].classList.add("wavySpan") : clearInterval(time)
                        }, 100)
                    })
                })

            })
            input.addEventListener("mouseleave", () => {

                spansOfLabelArray.forEach(spansofLabel => {
                    let i = 0, len = spansofLabel.length;
                    let time = setInterval(() => {
                        i < len ? spansofLabel[i++].classList.remove("wavySpan") : clearInterval(time)
                    }, 100)
                })
            })
            // console.log(input.validity.valid); return true if the input is valid else returns false
        })
    })

    const showPassword = () => {
        let pass_field = document.querySelector(".room-create-wrapper #password");

        if (pass_field.type === "password") {
            pass_field.type = "text";
        } else {
            pass_field.type = "password"
        }
    }

    return (
        <>
            <section className="homePage-wrapper">
                {canCreateServer ?
                    <div className="room-create-wrapper">
                        <div className="input-container">
                            <input type="text" id="roomId" onChange={(e) => setRoomId(e.target.value)} required />
                            <label htmlFor="roomId">
                                <span>R</span>
                                <span>o</span>
                                <span>o</span>
                                <span>m</span>
                                <span> </span>
                                <span>I</span>
                                <span>d</span>
                            </label>

                            <input type="text" id="playerName" onChange={(e) => setRoomMaster(e.target.value)} maxLength="10" required />
                            <label htmlFor="playerName">
                                <span>M</span>
                                <span>a</span>
                                <span>s</span>
                                <span>t</span>
                                <span>e</span>
                                <span>r</span>
                                <span> </span>
                                <span>N</span>
                                <span>a</span>
                                <span>m</span>
                                <span>e</span>
                            </label>
                            <span id="show-pass" onClick={showPassword}></span>
                            <input type="password" id="password" onChange={(e) => setRoomPassword(e.target.value)} required />
                            <label htmlFor="password">
                                <span>P</span>
                                <span>a</span>
                                <span>s</span>
                                <span>s</span>
                                <span>w</span>
                                <span>o</span>
                                <span>r</span>
                                <span>d</span>
                            </label>

                            <button onClick={() => createServer()}>Create</button>
                        </div>
                    </div>
                    : canEnterAServer ?
                        <div className="room-create-wrapper">
                            <div className="input-container">
                                <input type="text" id="roomId" onChange={(e) => setRoomId(e.target.value)} required />
                                <label htmlFor="roomId">
                                    <span>R</span>
                                    <span>o</span>
                                    <span>o</span>
                                    <span>m</span>
                                    <span> </span>
                                    <span>I</span>
                                    <span>d</span>
                                </label>

                                <input type="text" id="playerName" onChange={(e) => setPlayerName(e.target.value)} maxLength="10" required />
                                <label htmlFor="playerName">
                                    <span>P</span>
                                    <span>l</span>
                                    <span>a</span>
                                    <span>y</span>
                                    <span>e</span>
                                    <span>r</span>
                                    <span> </span>
                                    <span>N</span>
                                    <span>a</span>
                                    <span>m</span>
                                    <span>e</span>
                                </label>
                                <span id="show-pass" onClick={showPassword}></span>
                                <input type="password" id="password" onChange={(e) => setRoomPassword(e.target.value)} required />
                                <label htmlFor="password">
                                    <span>P</span>
                                    <span>a</span>
                                    <span>s</span>
                                    <span>s</span>
                                    <span>w</span>
                                    <span>o</span>
                                    <span>r</span>
                                    <span>d</span>
                                </label>

                                <button onClick={() => enterAServer()}>Enter</button>
                            </div>
                        </div>
                        : <div id="btn-container">
                            <button onClick={() => setCanCreateServer(true)}>Create a Server</button>
                            <button onClick={() => setCanEnterAServer(true)}>Enter a Server</button>
                        </div>
                }
            </section >
        </>
    )
}

export default HomePage;