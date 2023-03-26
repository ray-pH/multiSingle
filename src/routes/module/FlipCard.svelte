<script lang="ts">
    export let value_front : string = 'a';
    export let value_back  : string = 'back';
    export let opened : boolean = false;

    let audio_card_flip : HTMLAudioElement = new Audio("/sound/240776__f4ngy__card-flip.wav.wav");
    function flip(_node : any, {
        delay = 0,
        duration = 150
    }) {
        if (audio_card_flip != undefined) audio_card_flip.play();
        return {
            delay,
            duration,
            css: (_t : number, u : number) => `
                    transform: rotateY(${1 - (u * 180)}deg);
                    opacity: ${1 - u};
                `
        };
    }
</script>


<style>
    
    .card-container {
        position: relative;
        width: 100%;
        height: 100%;
    }
    
    .card {
        width: 100%;
        height: 100%;
        position: absolute;
        perspective: 600;
    }
    
    .side {
        position: absolute;
        height: 100%;
        width: 100%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    
    .back {
        background-color: grey;
        color: white;
    }
    .front {
        background-color: white;
        color: black;
    }
</style>

<!-- <div class="card-container button-div" on:click={() => opened = !opened}> -->
<div class="card-container">
    <div class="card">
        {#if opened}
            <div class="side front" transition:flip>
                {value_front}
            </div>
        {:else}
            <div class="side back" transition:flip>
                {value_back}
            </div>
        {/if}
    </div>
</div>
