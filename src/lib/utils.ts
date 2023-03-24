function randomAlphanum11() : string{
    let res : string = Math.random().toString(36).slice(2);
    if (res.length == 11) return res;
    return randomAlphanum11();
}
function genRandomAlphanum(len : number) : string{
    if (len <= 11) return randomAlphanum11().substring(0,len);
    return randomAlphanum11() + genRandomAlphanum(len-11);
}
function shuffleArray(array : Array<any>) : void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export { genRandomAlphanum, shuffleArray };
