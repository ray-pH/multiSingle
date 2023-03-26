type audiolib = {[key : string] : HTMLAudioElement};

export function audio_init() : audiolib {
    let audio : audiolib = {};
    audio.button_hover = new Audio("/sound/623990__eqylizer__button-hover-click.mp3");
    audio.button_click = new Audio("/sound/636029__earth_cord__button-click.wav");
    return audio;
}

// let audio object played multiple time at once
export let play_instance = (audio : HTMLAudioElement) => (audio.cloneNode(false) as HTMLAudioElement).play();

export function play_then_run(audio : HTMLAudioElement, f : Function){
    audio.play(); 
    f();
}
