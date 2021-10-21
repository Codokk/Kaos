/* Set up all items that other JS files may need */
require('dotenv').config();
process.env.api = 'http://localhost:9090/api';
let api = process.env.api;
const $ = require('jquery');
const {ipcRenderer} = require('electron');
let Crypto = require('node:crypto');
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}