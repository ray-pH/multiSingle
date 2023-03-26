// export let button_hover : HTMLAudioElement = new Audio("/sound/571581__el_boss__playing-card-slide-right.wav");
export let button_hover : HTMLAudioElement = new Audio("/sound/623990__eqylizer__button-hover-click.mp3");
export let button_click : HTMLAudioElement = new Audio("/sound/636029__earth_cord__button-click.wav");

export let play_hover = () => (button_hover.cloneNode(false) as HTMLAudioElement).play();
export function play_then_run(audio : HTMLAudioElement, f : Function){
    audio.play(); 
    f();
}
