// Reimplementar Promise.all

function myPromiseAll(promises) {
    if (!promises.length) return Promise.resolve([])
    const result = []
    let completed = 0

    return new Promise ((resolve, reject) => {
        for( let i = 0; i < promises.length ; i++) {
            Promise.resolve((promises[i])).then((value)=>{
                result[i] = value
                completed++
                if(completed === promises.length)  resolve(result)
            }).catch((err)=>{
                 reject(err)
            })
        }
    })
}

const p1 = Promise.resolve(10);

const p2 = new Promise((resolve) => {
    setTimeout(() => resolve(20), 1000);
});

const p3 = Promise.resolve(10);;

myPromiseAll([p1, p2, p3])
    .then(console.log)
    .catch(console.error);



