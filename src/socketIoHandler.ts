import { Server } from 'socket.io';
import { genRandomAlphanum } from './lib/utils.js'
import type { room, user, id, color, id_dict, roomsetting, Game, gameConstructor } from './lib/types.js'
import { userstate, games, colors, socketevent } from './lib/types.js'

import * as pairFlipper from './games/pairFlipper.js'

const gameConstructors : Map<games, gameConstructor> = new Map<games, gameConstructor>([
    [games.pairFlipper, pairFlipper.PairFlipper],
]);


export default function injectSocketIO(server : any) {
    const io = new Server(server);

    let roomlist : id_dict<room> = {};
    let userlist : id_dict<user> = {};
    let gamelist : id_dict<Game> = {};

    const def_roomsetting : roomsetting = {game : games.pairFlipper};
    
    function user_removeFromRooms(uid : id) : void {
        let roomid_todelete = [];
        for (let rid in roomlist){
            let members = roomlist[rid].members;
            if (!(uid in members)) continue;
            // user exists, delete
            delete members[uid];
            delete roomlist[rid].membercolors[uid];
            //check if room is empty
            if (Object.keys(members).length < 1) roomid_todelete.push(rid);
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
        socket.emit(socketevent.ROOMLIST_UPDATE, roomlist);
        socket.join('lobby');

        socket.on('disconnect', () => {
            let lastroomid = userdata.roomid;
            user_remove(userdata);
            io.to(lastroomid).emit(socketevent.ROOM_UPDATE, roomlist[lastroomid]);
        });

        // Lobby ===========================================
        socket.on(socketevent.ROOM_NEW, () => {
            let roomid : string = "";
            do  roomid = genRandomAlphanum(5); while (roomid in roomlist);
            user_removeFromRooms(userdata.id);
            roomlist[roomid] = { id : roomid, hostid : uid , 
                members:{}, membercolors:{}, setting : def_roomsetting};
            roomlist[roomid].members[userdata.id] = userdata;
            roomlist[roomid].membercolors[userdata.id] = colors[0];
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
            let avail_colors = colors.filter((c) => !(Object.values(roomlist[roomid].membercolors).includes(c)));
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
        socket.on(socketevent.GAME_REQUESTSTART, () => {
            io.to(userdata.roomid).emit(socketevent.GAME_START_SERVER);
        });
        socket.on(socketevent.GAME_START, () => {
            userdata.state = userstate.game;
            socket.emit(socketevent.USER_UPDATE, userdata);
            io.to(userdata.roomid).emit(socketevent.ROOM_UPDATE, roomlist[userdata.roomid]);

            // Game ===========================================
            // started by host and game not exist
            // TODO: alert if game already exist
            let room : room = roomlist[userdata.roomid];
            if (userdata.id == room.hostid && !(userdata.roomid in gamelist)){
                let game = room.setting.game;
                let gameConstructor : gameConstructor | undefined = gameConstructors.get(game);
                if (gameConstructors == undefined) return; gameConstructor = gameConstructor as gameConstructor;
                gamelist[userdata.roomid] = new gameConstructor(room);
            }
        });

        // Game ===========================================
        socket.on(socketevent.GAME_INPUT, (input : any) => {
            let game : Game = gamelist[userdata.roomid];
            game.sendInput(input);
            // emit gamestate
            let gamestate : any = game.getState();
            io.to(userdata.roomid).emit(socketevent.GAME_UPDATESTATE, gamestate);
            if (game.isDone())
                io.to(userdata.roomid).emit(socketevent.GAME_FINISH);
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
