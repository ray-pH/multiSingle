function randomAlphanum11() : string{
    let res : string = Math.random().toString(36).slice(2);
    if (res.length == 11) return res;
    return randomAlphanum11();
}

/** Random integer [0,1,2,...,max] */
export function randint(max : number) : number {
    return Math.floor(Math.random() * (max + 1));
}
export function genRandomAlphanum(len : number) : string{
    if (len <= 11) return randomAlphanum11().substring(0,len);
    return randomAlphanum11() + genRandomAlphanum(len-11);
}
export function shuffleArray(array : Array<any>) : void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randint(i);
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function arrayEq(a : ArrayLike<any>, b : ArrayLike<any>){
    if (a.length != b.length) return false;
    for (let i = 0; i < a.length; i++) 
        if (a[i] != b[i]) return false;
    return true;
}
