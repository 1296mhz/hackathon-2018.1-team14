const os = require('os');
const log = require('winston'); // error, warn, info, verbose, debug, silly
const _ = require('underscore');
const express = require('express');
const app = express();
const server = require('http').Server(app);
// const io = require('socket.io').listen(server);

// Setup the environment.
const env = process.env.NODE_ENV;
const port = process.env.PORT;
const host =  `${os.hostname()}:${port}`;
log.remove(log.transports.Console);
log.add(log.transports.Console, {colorize: true, timestamp: true});

// server static
app.use('/dist',express.static(__dirname + '/dist'));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/dist/index.html');
});

const io = require('socket.io')(server,{});


const socket_clients = []


function broadcast(cmd, data) {
    socket_clients.forEach(i=>i.emit(cmd, data));
}

class GameState {
    constructor() {
        //this.clients = [];
        this.gameCreated = false;
        this.clientOwner = null;
        this.red = [];
        this.blue = [];

        this.red_data = {
            hp : 100,
            hp_max : 100,
            crystal : 0
        };

        this.blue_data = {
            hp : 100,
            hp_max : 100,
            crystal : 0
        };

        this.win = null;
    }

    setOwner(cl) {
        this.gameCreated = true;
        this.clientOwner = cl;
    }

    join(cmd, cl) {
        if(cmd === "red") {
            this.red.push(cl);
        } else {
            this.blue.push(cl);
        }        
    }

    toJSON() {
        return {
            gameCreated : this.gameCreated,
            clientOwner : this.clientOwner ? this.clientOwner.toJSON() : null,
            red : this.red.map(i=>i.toJSON()),
            blue: this.blue.map(i=>i.toJSON()),
            red_data : this.red_data,
            blue_data: this.blue_data,
            win : this.win
        }
    }
}

const CLIENT_STATE_CONNECTED = 0;
const CLIENT_STATE_JOINED = 1;
const CLIENT_STATE_IN_COMMAND = 2;
const CLIENT_STATE_IN_ROLE = 3;

class ClientState {
    constructor(socket, game_state) {
        log.info("Init ClientState", socket.id, socket_clients.length)
        this.game_state = game_state;
        this.socket = socket;
        this.id = socket.id;
        this.role = null;

        this.state = CLIENT_STATE_CONNECTED;
        
        this.socket.on('create_game', (msg)=>{
            if(game_state.clientOwner === null) {
                game_state.setOwner(this);
                broadcast('serverState', this.game_state.toJSON());
            }
        });

        this.socket.on('join', (msg)=>{
            game_state.join(msg.cmd, this);
            this.cmd = msg.cmd;
            this.role = msg.role;
            broadcast('serverState', this.game_state.toJSON());
        });

        this.socket.on('updateDriver', (msg)=>{
            broadcast('updateDriverFromServer', msg);
        });

        this.socket.on('updateGunner', (msg)=>{
            broadcast('updateGunnerFromServer', msg);
        });

        this.socket.on('fire', (msg)=>{
            broadcast('fireFromServer', msg);
        });

        this.socket.on('spawnCrystal', (msg)=>{
            broadcast('spawnCrystalFromServer', msg);
        });

        this.socket.on('damageCrystal', (msg)=>{
            broadcast('damageCrystalFromServer', {
                cmd: msg.cmd,
                pos: msg.pos,
                state: this.game_state.toJSON()
            });
        });

        this.socket.on('takeCrysalis', (msg)=>{
            console.log("takeCrysalis", msg)
            if(msg.cmd === "red") {
                this.game_state.red_data.crystal += 1;
            } else {
                this.game_state.blue_data.crystal += 1;
            }
            broadcast('takeCrysalisFromServer', {
                cmd: msg.cmd,
                pos: msg.pos,
                state: this.game_state.toJSON()
            });
        });
        
        this.socket.on('damage', (msg)=>{
            if(msg.cmd === "red") {
                this.game_state.red_data.hp -= 1;
            } else {
                this.game_state.blue_data.hp -= 1;
            }

            broadcast('damageFromServer', {
                cmd : msg.cmd,
                state : this.game_state
            });

            if(this.game_state.red_data.hp <= 0) {
                this.game_state.red_data.hp = 0;
                this.game_state.win = "blue";
                broadcast('gameEnd', {
                    win : "blue",
                    state : this.game_state
                });
            }
            if(this.game_state.blue_data.hp <= 0) {
                this.game_state.blue_data.hp = 0;
                this.game_state.win = "red";
                broadcast('gameEnd', {
                    win : "red",
                    state : this.game_state
                });
            }
        });

        this.socket.on('spawnMob', (msg)=>{
            broadcast('spawnMobFromServer', msg);
        });
        
    }

    
    emit(cmd, data) {
        this.socket.emit(cmd, data)
    }

    toJSON() {
        return {
            id : this.id,
            role: this.role
        }
    }
}

function removeUser(id) {
    const idx = _.findIndex(socket_clients, { id : id });
    if(idx !== -1) {
        socket_clients.splice(idx, 1);
    }
}

const gameState = new GameState();

// listen for a connection request from any client
io.sockets.on('connection', (socket)=>{
    const exist_cl = _.findWhere(socket_clients, { id : socket.id });
    if(!exist_cl) {
        const state_new = new ClientState(socket, gameState);
        socket.on('error', (error) => {
            log.error("Handle socket error", socket.id, errot)
        });
        socket.on('disconnect', ()=>{
            removeUser(state_new.id);
        });
        socket.emit('serverState', gameState.toJSON());
        socket_clients.push(state_new);
    }
});


server.listen(port, ()=>{
    // Log that the game server has started.
    log.info(`Game server started at ${host} [${env}].`);
});


