// var v1 = 'v1';
// // 10000- code
// v1 = 'sungkae';
// var v2 = 'v2';


// 객체명이 바뀌어도 안의 변수들은 제대로 동작하도록 this. 를 사용
var p = {
    v1: 'v1',
    v2: 'v2',
    f1: function() {
        console.log(this.v1);
    },
    f2: function() {
        console.log(this.v2);
    }
}

p.f1();
p.f2();
