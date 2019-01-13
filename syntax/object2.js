// array, object

function f() { 
    console.log(1+1);
    console.log(1+1);
}

var a = [f];
a[0]();

var o = {
    func: f
}
o.func();