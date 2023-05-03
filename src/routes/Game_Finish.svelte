<script lang="ts">
    import { io } from '../lib/webSocketConnection.js';
    import FloatingWindow from './module/FloatingWindow.svelte'
    import Button from './module/Button.svelte';

    import type { id_dict, color, scoredata } from '../lib/types';
    import { userstate, games, socketevent } from '../lib/types'

    export let scoredata : scoredata[] = [];
    export let playercolors  : id_dict<color> = {};

    function game_toroom(){ io.emit(socketevent.GAME_TOROOM); }
</script>

<style>
    .scoretitle{
        text-align: center;
        margin-bottom: 10px;
        margin-top: 10px;
        font-weight: bold;
    }
    .playerinfo {
        padding: 5px 10px 5px;
        border-radius: 10px;
        margin-bottom: 5px;
        color: white;
    }
    .playerscore {
        float: right;
    }
</style>

<FloatingWindow in_delay={2000}>
    <div class="scoretitle">GAME FINISHED</div>
    <div class="finish-container">
        {#each scoredata as sd}
            <div class="playerinfo" style="background-color:{playercolors[sd.id]}">
                {sd.id}
                <span class="playerscore">{sd.score}</span>
            </div>
        {/each}
        <Button text='Done' 
            action={() => game_toroom()} 
            --margin='10px 10px 10px 0px' --textcolor='white' --width='100%'/>
    </div>
</FloatingWindow>
