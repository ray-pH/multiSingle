<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import { onMount } from 'svelte';
    import type { room, user, id, id_dict, roomsetting } from '../lib/types'
    import { userstate, games, socketevent } from '../lib/types'

    import Login from './Login.svelte'
    import Lobby from './Lobby.svelte'
    import Room from './Room.svelte'
    import Game from './Game.svelte'

    const def_roomsetting : roomsetting = {game : games.pairFlipper};

    let logged_in : boolean = false;

    let roomlist : id_dict<room> = {};
    let userdata : user = { id : 'null', name : 'null', roomid : 'null', state : userstate.loading };
    let roomdata : room = { id : 'null', hostid : 'null', members : {}, membercolors:{}, chat:[], setting : def_roomsetting};
    const userstate_room = [userstate.room_wait, userstate.room_ready, userstate.room_host];

    // debug
    let r1 : room = {id : 'a3d3s', hostid : 'o29e3', members:{}, membercolors:{}, chat:[], setting:def_roomsetting};
    let r2 : room = {id : 's382j', hostid : '283jd', members:{}, membercolors:{}, chat:[], setting:def_roomsetting};
    let r3 : room = {id : 'x221x', hostid : 'jd21s', members:{}, membercolors:{}, chat:[], setting:def_roomsetting};
    let debugroomlist : id_dict<room> = {};
    debugroomlist[r1.id] = r1;
    debugroomlist[r2.id] = r2;
    debugroomlist[r3.id] = r3;
    // debug

    onMount(() => {
        io.on(socketevent.ROOMLIST_UPDATE, (data : any) => {
            roomlist = data;
        });
        io.on(socketevent.USER_UPDATE, (data : user) => {
            userdata = data;
        });
        io.on(socketevent.ROOM_UPDATE, (room : room) => {
            roomdata = room;
        });
        io.on(socketevent.ROOM_NEWHOST, (id : id) => {
            // check if user is the new host
            // if yes, request status change to the server
            if (id == userdata.id) io.emit(socketevent.USER_ASNEWHOST);
        });
        io.on(socketevent.GAME_START_SERVER, () => {
            io.emit(socketevent.GAME_START);
        });
        io.on(socketevent.GAME_INVALIDINPUT, (msg : string) => {
            if (msg.length != 0) alert(msg);
        });
        io.on(socketevent.USER_LOGIN_RESP, (success : boolean) => {
            if (success) {
                logged_in = true;
            } else {
                alert('username already exist');
            }
        });
    });

</script>

<style>
</style>

{#if !logged_in}
    <Login userdata={userdata}/>
{:else if userdata.state == userstate.lobby}
    <Lobby userdata={userdata} roomlist={roomlist}/>
{:else if userstate_room.includes(userdata.state)}
    <Room userdata={userdata} roomdata={roomdata}/>
{:else if userdata.state == userstate.game}
    <Game userdata={userdata} roomdata={roomdata}/>
{/if}
