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
app.use('/',express.static(__dirname + '/dist'));

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
            blue: this.blue.map(i=>i.toJSON())
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
    // log.info("socket connected", socket.id); 
    const exist_cl = _.findWhere(socket_clients, { id : socket.id });

    if(!exist_cl) {
        const state_new = new ClientState(socket, gameState);

        socket.on('error', (error) => {
            log.error("Handle socket error", socket.id, errot)
        });

        socket.on('disconnect', ()=>{
            removeUser(state_new.id);
        
        //    io.emit('userDisconnected', state_new.id);
        });

        console.log(gameState.toJSON());

        socket.emit('serverState', gameState.toJSON());
        socket_clients.push(state_new);
    }
});


server.listen(port, ()=>{
    // Log that the game server has started.
    log.info(`Game server started at ${host} [${env}].`);
});


