<script lang="ts">
    import { fade, fly, slide } from 'svelte/transition';
    export let in_delay : number = 0;
</script>

<style>
    :root{
        --cblack: #1E1B18;
        --cpink: #D8315B;
        --cwhite: #FFFAFF;
        --ccyan: #3E92CC;
        --cblue: #0A2463;
        --cyellow: #FFE54C;
    }
    .dim-bg{
        background-color:rgba(0,0,0,0.5);
        position: fixed;
        z-index: 2;
        left: 0; top: 0;
        width: 100%;
        height: 100%;
    }
    .floating-container{
        max-width: 340px;
        max-height: 80%;
        margin: auto;
        margin-top: 10%;
        background-color: var(--cwhite);
        border-radius: 10px;
        color: black;
        padding: 10px 20px 10px 20px;
        font-family:'Noto Sans';

        position: relative;
        z-index: 2;
    }
</style>

<div class="dim-bg" in:fade={{delay: in_delay}} out:fade>
    <div class="floating-container">
        <slot></slot>
    </div>
</div>
