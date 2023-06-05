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

/** return a copy of reversed array */
export function reversed<T>(arr : Array<T>) : Array<T>{
    let rev = new Array<T>(arr.length);
    for (let i = 0; i < arr.length; i++) rev[i] = arr[arr.length-1-i];
    return rev;
}

export function arrayEq<T>(a : Array<T>, b : Array<T>){
    if (a.length != b.length) return false;
    for (let i = 0; i < a.length; i++) 
        if (a[i] != b[i]) return false;
    return true;
}

type equalityFunction<T> = (a : T, b : T) => boolean;
export function arrayEqCustom<T>(a : Array<T>, b : Array<T>, f_equal : equalityFunction<T>){
    if (a.length != b.length) return false;
    for (let i = 0; i < a.length; i++) 
        if (!f_equal(a[i], b[i])) return false;
    return true;
}
