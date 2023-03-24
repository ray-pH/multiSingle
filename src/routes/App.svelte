<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import { onMount } from 'svelte';
    import type { room, user, id, id_dict, roomsetting } from '../lib/types'
    import { userstate, games } from '../lib/types'

    import Lobby from './Lobby.svelte'
    import Room from './Room.svelte'
    import Game from './Game.svelte'

    const def_roomsetting : roomsetting = {game : games.pairFlipper};

    let roomlist : id_dict<room> = {};
    let userdata : user = { id : null, name : null, roomid : null, state : userstate.loading };
    let roomdata : room = { id : null, hostid : null, members : {}, membercolors:{},setting : def_roomsetting};
    const userstate_room = [userstate.room_wait, userstate.room_ready, userstate.room_host];

    // debug
    let r1 : room = {id : 'a3d3s', hostid : 'o29e3', members:{}, membercolors:{}, setting:def_roomsetting};
    let r2 : room = {id : 's382j', hostid : '283jd', members:{}, membercolors:{}, setting:def_roomsetting};
    let r3 : room = {id : 'x221x', hostid : 'jd21s', members:{}, membercolors:{}, setting:def_roomsetting};
    let debugroomlist : id_dict<room> = {};
    debugroomlist[r1.id] = r1;
    debugroomlist[r2.id] = r2;
    debugroomlist[r3.id] = r3;
    // debug

    onMount(() => {
        io.on('updateroomlist', (data : any) => {
            roomlist = data;
        });
        io.on('updateuser', (data : user) => {
            userdata = data;
        });
        io.on('updateroom', (room : room) => {
            roomdata = room;
        });
        io.on('game_start', () => {
            io.emit('game_start');
        });
    });

</script>

<style>
</style>

{#if userdata.state == userstate.lobby}
    <Lobby userdata={userdata} roomlist={roomlist}/>
{:else if userstate_room.includes(userdata.state)}
    <Room userdata={userdata} roomdata={roomdata}/>
{:else if userdata.state == userstate.game}
    <Game userdata={userdata} roomdata={roomdata}/>
{/if}
