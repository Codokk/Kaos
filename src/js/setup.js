/* Set up all items that other JS files may need */
require('dotenv').config();
let api = process.env.api;
const $ = require('jquery');
const fs = require('fs');
const {ipcRenderer} = require('electron');
let Crypto = require('node:crypto');
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}