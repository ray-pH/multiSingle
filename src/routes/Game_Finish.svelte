<script lang="ts">
    import FloatingWindow from './module/FloatingWindow.svelte'

    import type { id_dict, color, scoredata } from '../lib/types';

    export let scoredata : scoredata[] = [];
    export let playercolors  : id_dict<color> = {};
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

<FloatingWindow>
    <div class="scoretitle">GAME FINISHED</div>
    <div class="finish-container">
        {#each scoredata as sd}
            <div class="playerinfo" style="background-color:{playercolors[sd.id]}">
                {sd.id}
                <span class="playerscore">{sd.score}</span>
            </div>
        {/each}
    </div>
</FloatingWindow>

