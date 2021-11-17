const {ipcMain} = require('electron');
const { exec } = require('child_process');
const electron = require('electron');
const app = electron.app;
const fs = require('fs');
const path = require('path');
const dataPath = app.getPath('userData');
const filePath = path.join(dataPath, 'config.json');
const BrowserWindow = electron.BrowserWindow;

const root = __dirname;

let AppWindow;
let Active_Peers = {};
let isFullscreen = false;
let JWT = readData("JWT");
// Window Functions
function createAppWindow() {
    AppWindow = new BrowserWindow({
        name: "AppWindow",
        width: 437,
        height: 600,
        icon: root + '/src/img/favicon.png',
        frame: false,
        transparent: true,
        webPreferences: {
            nativeWindowOpen: true,
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        webContents: true
    });

    AppWindow.loadFile(root + '/html/index.html');
    AppWindow.webContents.openDevTools();
    AppWindow.on('closed', function () {
        AppWindow = null
    })
}
// IPC Renderer Functions
ipcMain.on("Minimize", () => {
    BrowserWindow.getFocusedWindow().minimize();
});
ipcMain.on("Fullscreen", () => {
    let curwin = BrowserWindow.getFocusedWindow()
    //Check if is fullscreen
    curwin.maximize();
})
ipcMain.on("Logout", () => {
    writeData("JWT", "");
    JWT = "";
})
ipcMain.on("JWT", (e, token) => {
    JWT = token;
    writeData("JWT", token);
});
ipcMain.on("GetJWT", (e) => {
    e.returnValue = JWT;
})
ipcMain.on("GetValorantStats", (e, id) => {
    const python = exec('python3 ./src/py/val.py --tag=' + id, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return;
        }
        //Return is pre-formatted json
        e.returnValue = JSON.parse(stdout);
    });
})

// Start App
app.on('ready', () => {
    console.log("JWT: " + JWT);
    createAppWindow();
});
app.on('activate', function () {
    if (AppWindow === null) {
        createAppWindow()
    }
});
// Stop App
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

// LocalData Functions
function writeData(key, value) {
    let contents = parseData()
    contents[key] = value;
    fs.writeFileSync(filePath, JSON.stringify(contents));
}

function readData(key, value) {
    let contents = parseData()
    return contents[key]
}

function parseData() {
    const defaultData = {}
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        return defaultData;
    }
}