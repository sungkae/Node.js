// function a() {
//     console.log('A');
// }

var a = function() {
    console.log('익명함수');
}

function slowfunc(callback) {
    callback()
}

// console.log("자바는 함수가 값이다.");
// a();

slowfunc(a);