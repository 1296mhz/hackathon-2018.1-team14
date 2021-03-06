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
        this.socket.on("updateDriverFromServer", (data)=>{
            if(data.cmd === this.getMyCommand()) {
                if(this.getMyRole() !== "driver") {
                    this.emit('update_player_driver', data);
                }
            } else {
                this.emit('update_op_driver', data);
            }
        });
        this.socket.on("updateGunnerFromServer", (data)=>{
            if(data.cmd === this.getMyCommand()) {
                if(this.getMyRole() !== "gunner") {
                    this.emit('update_player_gunner', data);
                }
            } else {
                this.emit('update_op_gunner', data);
            }
        });   
        this.socket.on("fireFromServer", (data)=>{
            if(data.cmd === this.getMyCommand()) {
                this.emit('player_fire', data);
            } else {
                this.emit('op_fire', data);
            }
        });
        this.socket.on("damageFromServer", (data)=>{
            // update health
            this.state.win = data.state.win;
            this.state.red_data = data.state.red_data;
            this.state.blue_data = data.state.blue_data;
            this.emit('damageFromServer', this.state);
        });

        this.socket.on("gameEnd", (data)=>{
            this.state.win = data.state.win;
            this.emit('gameEnd', this.state);
        });

        this.socket.on("spawnCrystalFromServer", (data)=>{
            this.emit('spawnCrystalFromServer', data);
        });

        this.socket.on("damageCrystalFromServer", (data)=>{
            this.state.red_data = data.state.red_data;
            this.state.blue_data = data.state.blue_data;
            this.emit('damageCrystalFromServer', data);
        });

        this.socket.on("takeCrysalisFromServer", (data)=>{
            this.state.red_data = data.state.red_data;
            this.state.blue_data = data.state.blue_data;
            this.emit('takeCrysalisFromServer', data);
        });

        this.socket.on("spawnMobFromServer", (data)=>{
            this.emit('spawnMobFromServer', data);
        });

        this.socket.on("updateHeath", (data)=>{
            this.state.red_data = data.state.red_data;
            this.state.blue_data = data.state.blue_data;
            this.emit('updateHeath', data);
        });
        
    }

    onConnected() {
    }

    isMasterClient() {
        return this.state.clientOwner && this.state.clientOwner.id === this.socket.id;
    }

    onServerState(data) {
        this.state = data;
        this.emit('onServerState', data);
    }

    isCommandFull(cmd) {
        if(cmd ==="red") {
            return this.state.red.length >= 2;
        } else {
            return this.state.blue.length >= 2;
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

    getMyRole() {
        const inRed = _.findWhere(this.state.red, { id : this.socket.id });
        if(inRed) {
            return inRed.role;
        }
        const inBlue = _.findWhere(this.state.blue, { id : this.socket.id });
        if(inBlue) {
            return inBlue.role;
        }
    }

    isGameReady() {
        return this.state.red.length >= 2 && this.state.blue.length >= 2;
    }

    getClientID() {
        return this.socket.id;
    }

    createGame() {
        this.socket.emit("create_game", {});
    }

    join(cmd, role) {
        this.socket.emit("join", {
            cmd: cmd,
            role: role
        });
    }

    updateDriver(x, y, angle, velocity) {
        this.socket.emit("updateDriver", {
            id : this.socket.id,
            x,
            y,
            angle,
            velocity, 
            role : this.getMyRole(),
            cmd : this.getMyCommand()
        });
    }

    updateGunner(angle) {
        this.socket.emit("updateGunner", {
            id : this.socket.id,
            angle,
            role : this.getMyRole(),
            cmd : this.getMyCommand()
        });
    }

    fire(target) {
        this.socket.emit("fire", {
            id : this.socket.id,
            target: target,
            role : this.getMyRole(),
            cmd : this.getMyCommand()
        }); 
    }

    damage(cmd) {
        this.socket.emit("damage", {
            id : this.socket.id,
            cmd : cmd
        }); 
    }

    spawnCrystal(x, y) {
        this.socket.emit("spawnCrystal", {
            id : this.socket.id,
            x : x, y : y
        }); 
    }

    damageCrystal(cmd, pos) {
        this.socket.emit("damageCrystal", {
            id : this.socket.id,
            pos: pos
        }); 
    }

    takeCrysalis(cmd, pos) {
        this.socket.emit("takeCrysalis", {
            id : this.socket.id,
            cmd : cmd,
            pos: pos
        }); 
    }

    spawnMob(x, y) {
        this.socket.emit("spawnMob", {
            id : this.socket.id,
            x : x, y : y
        }); 
    }

    sendOnBase(cmd) {
        this.socket.emit("sendOnBase", {
            id : this.socket.id,
            cmd : cmd
        }); 
    }
};

