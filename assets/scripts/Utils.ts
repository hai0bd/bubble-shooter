export function random(lower: number, upper:number): number {
    return Math.floor(Math.random() * (upper - lower+1)) + lower;
}

export function shuffle(arr: any[]){
    let length: number = arr.length,
        randomIndex: number,
        temp: any;
    while (length) {
        randomIndex = Math.floor(Math.random() * (length--));
        temp = arr[randomIndex];
        arr[randomIndex] = arr[length];
        arr[length] = temp
    }
    return arr
}

export function sort(arr: any[] | unknown, key: any, flag: boolean = true){
    if(arr instanceof Array){
        return arr.sort((a, b)=>{
            if(a[key] > b[key]){
                return flag ? 1 : -1
            }else if(a[key] < b[key]){
                return flag ? -1 : 1
            }else{
                return 0
            }
        })
    }
}