//Initializes Clock Upon Loading
let time = moment().format('LT');
let date = moment().format('dddd MMMM Do');
let clock = time + ', ' + date
$("#currentTime")
    .text(clock)
    .addClass("current-time");

//Updates the Clock Everytime it Changes
setInterval(function () {
    time = moment().format('LT');
    date = moment().format('dddd MMMM Do');
    clock = time + ', ' + date
    $("#currentTime").text(clock).addClass("current-time");
}, 1000);