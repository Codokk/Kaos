const {
    ipcMain,
    session
} = require('electron');
const { exec } = require('child_process');
const electron = require('electron');
const Main = require('electron/main');
const fs = require('fs');
const path = require('path');
const dataPath = electron.app.getPath('userData');
const filePath = path.join(dataPath, 'config.json');
const url = require('url');
const app = electron.app
const BrowserWindow = electron.BrowserWindow;

const root = __dirname;

let MainWindow = true;
let LoginWindow;
let Active_Peers = {};
let isFullscreen = false;
let JWT = readData("JWT");

function createLoginWindow() {
    LoginWindow = new BrowserWindow({
        name: "Login",
        width: 437,
        height: 590,
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

    LoginWindow.loadFile(root + '/html/Login.html');

    LoginWindow.on('closed', function () {
        LoginWindow = null
    })
}

function createMainWindow() {
    MainWindow = new BrowserWindow({
        name: "App",
        width: 1080,
        height: 720,
        icon: root + '/img/favicon.png',
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

    MainWindow.loadFile(root + '/html/app.html');
    MainWindow.on('closed', function () {
        MainWindow = null
    })
}

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
    setTimeout(()=>{
        createLoginWindow();
        MainWindow.close();
    },1000)
})
ipcMain.on("JWT", (e, token) => {
    JWT = token;
    writeData("JWT", token);
    createMainWindow()
    LoginWindow.close();
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

async function CreatePeer(channel) {
    //Create the first Peer
    Active_Peers[channel] = new Peer({
        initiator: true
    })
    Active_Peers[channel].on('signal', data => {
        // On Signal send data
    })
    Active_Peers[channel].on('connect', () => {
        Active_Peers[channel].send("Hey, I see you :)");
    })
}


app.on('ready', () => {
    console.log("JWT: " + JWT);
    createLoginWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});

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