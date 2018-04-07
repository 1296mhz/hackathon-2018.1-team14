import throttle from 'lodash.throttle';

const MENU_PADDING = 128;

const STATE_SELECT_STATE = 0;
const STATE_SELECT_COMMAND = 1;
const STATE_SELECT_ROLE = 2;

export default class Menu extends Phaser.State {

    create() {
        this.game.stage.backgroundColor = '#182d3b';

        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;

        this.bg = game.add.tileSprite(0, 0, width, height, 'light_sand');

        this.buttons = [];
        this.texts = [];
      
        this.initState(STATE_SELECT_STATE);

        const server = this.game.server;

        server.on('onServerState', ()=>{
            console.log("onServerState");
            this.initState(this.state);
        })

        console.log("ClientId", server.getClientID());

        // Setup listener for window resize.
        window.addEventListener('resize', throttle(this.resize.bind(this), 50), false);
    }

    resize() {
        const width = window.innerWidth * window.devicePixelRatio;
        const height = window.innerHeight * window.devicePixelRatio;

        this.scale.setGameSize(width, height);
    }

    update() {

    }

    initState(state) {
        const server = this.game.server;

        this.state = state;
        this.clearButtons();
        switch(state) {
            case STATE_SELECT_STATE: {
                // console.log(server.state)
                if(!server.state.gameCreated) {
                    this.addButton("Create game", "create_game");
                } else {
                    this.addButton("Join game", "join_game");
                }
                break;
            }
            case STATE_SELECT_COMMAND: {
                if(!server.isCommandFull("red")) {
                    this.addButton("Command red",  "select_red_command");
                }
                if(!server.isCommandFull("blue")) {
                    this.addButton("Command blue", "select_blue_command");
                }
                break;
            }
            case STATE_SELECT_ROLE: {
                const myCmd = server.getMyCommand();

                if(server.isVacant(myCmd, "driver")) {
                    this.addButton("Driver",  "select_role_driver");
                }
                
                if(server.isVacant(myCmd, "gunner")) {
                    this.addButton("Gunner", "select_role_gunner");
                }

                if(server.isVacant(myCmd, "сommander")) {
                    this.addButton("Сommander", "select_role_сommander");
                }
                
                break;
            }
        }
    }

    clearButtons() {
        this.buttons.forEach(i=>i.kill());
        this.texts.forEach(i=>i.kill());
        this.buttons = [];
        this.texts = [];
    }

    addButton(text, action) {
        const PADDING = 12;

        const button = this.game.add.button(
            this.game.world.centerX - 64, 
            MENU_PADDING + (this.buttons.length * (32 + PADDING)) , 
            'button_default', ()=>{
                this.onButtonAction(action);
            }, this, 2, 1, 0);

        const textEl = this.game.add.text(button.x, button.y, text, {
            font: "bold 16px Arial", 
            fill: "#222", 
            boundsAlignH: "center", 
            boundsAlignV: "middle"
        });

        textEl.setTextBounds(0, 0, 128, 32);

        this.buttons.push(button);
        this.texts.push(textEl);
    }

    onButtonAction(action) {
        const server = this.game.server;

        let select_cmd = null;
        let select_role = null;

        switch(action) {
            case "create_game": {
                server.createGame();
                this.initState(STATE_SELECT_COMMAND);
                break; 
            }
            case "join_game": { 
                this.initState(STATE_SELECT_COMMAND);
                break; 
            }
            case "select_red_command": { 
                select_cmd = "red";
                this.initState(STATE_SELECT_ROLE); 
                break; 
            }
            case "select_blue_command": { 
                select_cmd = "blue";
                this.initState(STATE_SELECT_ROLE);
                break; 
            }
            case "select_role_driver": { 
                select_role = "driver";
                this.clearButtons(); 
                server.join(select_cmd, select_role);
                break; 
            }
            case "select_role_gunner": { 
                select_role = "gunner";
                this.clearButtons(); 
                server.join(select_cmd, select_role);
                break; 
            }
            case "select_role_сommander": { 
                select_role = "сommander";
                this.clearButtons(); 
                server.join(select_cmd, select_role);
                break; 
            }
        }
    }
}