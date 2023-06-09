import { Server } from 'socket.io';
import { genRandomAlphanum } from './lib/utils.js'
import type { room, user, id, color, id_dict, roomsetting, Game, gameConstructor, chatmessage } from './lib/types.js'
import { userstate, games, colorlist, socketevent } from './lib/types.js'

import * as pairFlipper from './games/pairFlipper.js'
import * as tiktakto from './games/tiktakto.js'
import * as g2048 from './games/g2048.js'

const gameConstructors : Map<games, gameConstructor> = new Map<games, gameConstructor>([
    [games.pairFlipper, pairFlipper.PairFlipper],
    [games.tiktakto, tiktakto.Tiktakto],
    [games.g2048, g2048.G2048],
]);


export default function injectSocketIO(server : any) {
    const io = new Server(server);

    let roomlist : id_dict<room> = {};
    let userlist : id_dict<user> = {};
    let gamelist : id_dict<Game> = {};

    const def_roomsetting : roomsetting = {game : games.pairFlipper};
    
    function username_already_exists(username : string) : boolean {
        for (let uid in userlist)
            if (userlist[uid].name == username) return true;
        return false;
    }

    function room_newhost(roomid : id) : void {
        if (!(roomid in roomlist)) return;
        let roommembers = roomlist[roomid].members;
        let newhostid = Object.keys(roommembers)[0];
        roomlist[roomid].hostid = newhostid;
        io.to(roomid).emit(socketevent.ROOM_NEWHOST, newhostid);
        // io.to(roomid).emit(socketevent.ROOM_UPDATE, roomlist[roomid]);
    }

    function user_removeFromRooms(uid : id) : void {
        let roomid_todelete = [];
        for (let rid in roomlist){
            let members = roomlist[rid].members;
            if (!(uid in members)) continue;
            // user exists, delete
            delete members[uid];
            delete roomlist[rid].membercolors[uid];

            //check if room is empty
            if (Object.keys(members).length < 1) {
                roomid_todelete.push(rid);
                continue;
            }
            //check if roomhost doesn't exist : imply roomhost is leaving room
            if (!(roomlist[rid].hostid in members)){
                room_newhost(rid);
            }
        }
        for (let rid of roomid_todelete) delete roomlist[rid];

    }
    function user_remove(u : user) : void{
        if (u.id in userlist) delete userlist[u.id];

        // make sure the user is removed from all rooms
        user_removeFromRooms(u.id);
    }

    io.on('connection', (socket) => {
        let uid : id = "";
        do  uid = genRandomAlphanum(5); while (uid in userlist);

        let userdata : user = { id : uid, name : 'anon', roomid:'lobby', state : userstate.lobby };
        userlist[userdata.id] = userdata;
        socket.emit(socketevent.USER_UPDATE, userdata);

        socket.on('disconnect', () => {
            let lastroomid = userdata.roomid;
            user_remove(userdata);
            io.to(lastroomid).emit(socketevent.ROOM_UPDATE, roomlist[lastroomid]);
        });

        socket.on(socketevent.USER_LOGIN, (username : string) => {
            if (!username_already_exists(username)) {
                userdata.name = username;
                socket.emit(socketevent.USER_LOGIN_RESP, true);
                socket.emit(socketevent.USER_UPDATE, userdata);
                socket.emit(socketevent.ROOMLIST_UPDATE, roomlist);
                socket.join('lobby');
            } else {
                socket.emit(socketevent.USER_LOGIN_RESP, false);
            }
        });

        // Lobby ===========================================
        socket.on(socketevent.ROOM_NEW, (setting : roomsetting) => {
            let roomid : string = "";
            if (setting == undefined || setting == null) setting = def_roomsetting;
            do  roomid = genRandomAlphanum(5); while (roomid in roomlist);
            user_removeFromRooms(userdata.id);
            roomlist[roomid] = { id : roomid, hostid : uid , 
                members:{}, membercolors:{}, setting : setting, chat : []};
            roomlist[roomid].members[userdata.id] = userdata;
            roomlist[roomid].membercolors[userdata.id] = colorlist[0];
            userdata.roomid = roomid;
            userdata.state  = userstate.room_host;

            // socketio
            socket.join(roomid);
            io.to('lobby').emit(socketevent.ROOMLIST_UPDATE, roomlist);
            socket.emit(socketevent.USER_UPDATE, userdata);
            socket.emit(socketevent.ROOM_UPDATE, roomlist[roomid]);
        });
        socket.on(socketevent.ROOM_JOIN, (roomid : id) => {
            user_removeFromRooms(userdata.id);
            if (!(roomid in roomlist)){
                console.log('error : room does not exist');
                return;
            }
            roomlist[roomid].members[userdata.id] = userdata;
            userdata.roomid = roomid;
            userdata.state  = userstate.room_wait;

            //color
            let avail_colors = colorlist.filter((c) => !(Object.values(roomlist[roomid].membercolors).includes(c)));
            roomlist[roomid].membercolors[userdata.id] = avail_colors[0];

            // socketio
            socket.join(roomid);
            io.emit(socketevent.ROOMLIST_UPDATE, roomlist);
            socket.emit(socketevent.USER_UPDATE, userdata);
            io.to(roomid).emit(socketevent.ROOM_UPDATE, roomlist[roomid]);
        });
        socket.on(socketevent.ROOM_LEAVE, () => {
            let prevroomid = userdata.roomid;
            user_removeFromRooms(userdata.id);
            userdata.roomid = 'lobby';
            userdata.state  = userstate.lobby;
            // socketio
            socket.join('lobby');
            io.emit(socketevent.ROOMLIST_UPDATE, roomlist);
            socket.emit(socketevent.USER_UPDATE, userdata);
            io.to(prevroomid).emit(socketevent.ROOM_UPDATE, roomlist[prevroomid]);
        });

        // Room ===========================================
        socket.on(socketevent.GAME_TOGGLEREADY, () => {
            userdata.state = (userdata.state == userstate.room_wait) ? 
                userstate.room_ready : userstate.room_wait;
            socket.emit(socketevent.USER_UPDATE, userdata);
            io.to(userdata.roomid).emit(socketevent.ROOM_UPDATE, roomlist[userdata.roomid]);
        });
        socket.on(socketevent.USER_ASNEWHOST, () => {
            // new host assignment request
            //
            if (userdata.roomid == 'lobby') return;
            // check if requesting user is the same as the user assigned by the server
            if (userdata.id != roomlist[userdata.roomid].hostid) return;

            userdata.state = userstate.room_host;
            socket.emit(socketevent.USER_UPDATE, userdata);
            io.to(userdata.roomid).emit(socketevent.ROOM_UPDATE, roomlist[userdata.roomid]);
        });
        socket.on(socketevent.GAME_REQUESTSTART, () => {
            // create game
            let room : room = roomlist[userdata.roomid];
            if (userdata.id != room.hostid) return

            let game = room.setting.game;
            let gameConstructor : gameConstructor | undefined = gameConstructors.get(game);
            if (gameConstructors == undefined) return; 
            gameConstructor = gameConstructor as gameConstructor;
            gamelist[userdata.roomid] = new gameConstructor(room, room.setting);

            //emit
            io.to(userdata.roomid).emit(socketevent.GAME_START_SERVER);
        });
        socket.on(socketevent.GAME_START, () => {
            userdata.state = userstate.game;
            socket.emit(socketevent.USER_UPDATE, userdata);
            io.to(userdata.roomid).emit(socketevent.ROOM_UPDATE, roomlist[userdata.roomid]);
        });

        // Chat =======================================
        socket.on(socketevent.CHAT_MSG, (msg : string) => {
            let message : chatmessage = { id : userdata.id, message : msg };
            roomlist[userdata.roomid].chat.push(message);
            io.to(userdata.roomid).emit(socketevent.ROOM_UPDATE, roomlist[userdata.roomid]);
        });


        // Game ===========================================
        socket.on(socketevent.GAME_INPUT, (input : any) => {
            let game : Game = gamelist[userdata.roomid];
            let [valid, msg] = game.sendInput(input);

            // if input is not valid, send msg to user
            if (!valid){
                socket.emit(socketevent.GAME_INVALIDINPUT, msg);
                return;
            }

            // emit gamestate
            let gamestate : any = game.getState();
            io.to(userdata.roomid).emit(socketevent.GAME_UPDATESTATE, gamestate);
            if (game.isDone())
                io.to(userdata.roomid).emit(socketevent.GAME_FINISH);
        });
        // return to room
        socket.on(socketevent.GAME_TOROOM, () => {
            userdata.state = roomlist[userdata.roomid].hostid == userdata.id ? userstate.room_host : userstate.room_wait;
            socket.emit(socketevent.USER_UPDATE, userdata);
            io.to(userdata.roomid).emit(socketevent.ROOM_UPDATE, roomlist[userdata.roomid]);
        });


        // Debug ===========================================
        socket.on('debug', (_e) => {
            console.log("==========================")
            console.log("rooms:")
            let disp_room : {[key: id]: id[]} = {};
            for (let rid in roomlist) disp_room[rid] = Object.keys(roomlist[rid].members);
            console.log(roomlist);
            console.log("users:")
            let disp_user = Object.keys(userlist);
            console.log(disp_user);
        });
    });

    console.log('SocketIO injected');
}
