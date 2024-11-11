import Phaser from "phaser";
import { gameConfig, CalculateScaleFactor } from "./appconfig";
import { Globals } from "./Globals";
import { SocketManager } from "../socket";
import { SceneHandler } from "./SceneHandler";
// import "../../public/style.css"

window.parent.postMessage( "authToken","*");

if(!IS_DEV){
  window.addEventListener("message", function(event: MessageEvent) {
    // Check the message type and handle accordingly
    if (event.data.type === "authToken") {
      // console.log("event check", event.data);
      const data = { 
        socketUrl : event.data.socketURL,
        authToken :  event.data.cookie
      }
      // Call the provided callback function
      Globals.Socket = new SocketManager();
      Globals.Socket.onToken(data);
      window.parent.postMessage("OnEnter", "*")
    }
  });
}
else{
  const data  = {
    socketUrl : "https://game-crm-rtp-backend.onrender.com/",
    authToken : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZDg1MjhmYTI3YmY5MDI0NDNlYmExZiIsInVzZXJuYW1lIjoiYXJwaXQiLCJyb2xlIjoicGxheWVyIiwiaWF0IjoxNzMxMTI3NTcyLCJleHAiOjE3MzE3MzIzNzJ9.uvNASDzoQ_oQqXlbNtVRDFFYK6ouFMIwu_F1xDcQf9M",
  }
  Globals.Socket = new SocketManager();
  Globals.Socket.onToken(data);
}

function loadGame() {
  const game = new Phaser.Game(gameConfig);
  const sceneHandler = new SceneHandler(game);
  Globals.SceneHandler = sceneHandler;  
  // console.log(Globals.SceneHandler, "Globals.SceneHandler in index file");
}

if (typeof console !== 'undefined') {
  console.warn = () => {};
  console.info = () => {};
  // console.debug = () => {};
}


loadGame();