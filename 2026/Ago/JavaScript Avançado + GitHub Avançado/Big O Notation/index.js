// Big O Notation

// O(1)
function lastArray () {
    return array[array.length - 1];


}


// o(log n)
function binarySearch (array, target) {
    let min = 0;
    let max = array.length - 1;
    while (min <= max) {
        let middle = Math.floor((min + max) / 2);
        let currentElement = array[middle];
        if (target === currentElement) {
            return middle;
        } else if (target < currentElement) {
            max = middle - 1;
        } else {
            min = middle + 1;
        }
    }
    return -1;
}

// O(n)
function sumArray (array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum;
}

// O(n^2)
function sumArray2 (array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length; j++) {
            sum += array[i] * array[j];
        }
    }
    return sum;
}


