/* Set up all items that other JS files may need */
require('dotenv').config();
let api = process.env.api;
const fs = require('fs');
const {ipcRenderer} = require('electron');
let Crypto = require('node:crypto');

//Little JQuery but not really
$=(a)=>{
    let b =document.querySelectorAll(a)
    return (b.length > 1 ? b : b[0]);
}
// General Use Functions
async function APIRequest(url, method, data = false) {
    let params = { method: method }
    if(data) params.body = JSON.stringify(data)
    let a = await fetch(api + url, params)
    a = await a.json().then(e=> {return e})
    console.log(a);
    return a;
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function titleFormatter(string) {
    string = string.split("-");
    let ret = "";
    for (i in string)
    {
        string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1);
        ret += string[i] + " ";
    }
    return ret;
}