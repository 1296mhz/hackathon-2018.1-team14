import { EventEmitter } from 'events';

const socket_io = require('socket.io-client');
const _ = require("underscore");

export default class Client extends EventEmitter {
    constructor(url) {
        this.url = url;
    }

    connect() {
        this.socket = socket_io.connect(this.url);
        this.socket.on("connect", ()=>{
            this.onConnected();
        }); 
        this.socket.on("serverState", (data)=>{
            this.onServerState(data);
        });
    }

    onConnected() {
        console.log("Connected to server")
    }

    onServerState(data) {
        console.log("onServerState", data)
        this.state = data;
        this.emit('onServerState', data);
    }

    isCommandFull(cmd) {
        console.log(this.state)
        if(cmd ==="red") {
            return this.state.red.length >= 3;
        } else {
            return this.state.blue.length >= 3;
        }
    }

    isVacant(cmd, role) {
        if(cmd ==="red") {
            return _.findIndex(this.state.red, {role : role}) === -1;
        } else {
            return _.findIndex(this.state.blue, {role : role}) === -1;
        }
    }

    getMyCommand() {
        const inRed = _.findIndex(this.state.red, { id : this.socket.id }) !== -1;
        if(inRed) {
            return "red";
        }
        const inBlue = _.findIndex(this.state.blue, { id : this.socket.id }) !== -1;
        if(inBlue) {
            return "blue";
        }
    } 

    isGameReady() {
        return this.state.red.length >= 3 && this.state.blue.length >= 3;
    }


    getClientID() {
        return this.socket.id;
    }

    createGame() {
        this.socket.emit("create_game", {});
    }

    join(cmd, role) {
        console.log("Client:join", cmd,role)
        this.socket.emit("join", {
            cmd: cmd,
            role: role
        });
    }
};

