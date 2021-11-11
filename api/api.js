console.log("Starting The Server");
console.time("ServerStart")
// Requirements
require('dotenv').config();
const Crypto = require('node:crypto');
const { spawn } = require('child_process');
const fastify = require('fastify')({ logger: true })
fastify.register(require('fastify-websocket'));
fastify.register(require('fastify-formbody'));
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const sqlite3 = require('sqlite3').verbose();


// Globals
const wsdb = {};
const SALT = process.env.secret;
const logOutput = (name) => (data) => console.log(`[${name}] ${data}`)

// MongoDB Setup
const mdburl = "mongodb://localhost:27017";
const db = new MongoClient(process.env.MDBURL);
// SQLite3 Setup
const sqldb = new sqlite3.Database(":memory:");
// Run Python Script
runScript('valmatch.py').then(e=>{
    console.log("Match Script Ran");
})
// Routes
fastify.get("/api", (req, res)=>{
    res.send({ msg: "API"})
})
fastify.get("/api/streamer/*", {websocket: true}, (connection /* SocketStream */ , req /* FastifyRequest */ ) => {
    // Get the attempted Channel
    console.log("Connection");
    let channel = (req.url).replace("/streamer/","");
    console.log(channel);
    //Create Channel if Doesn't exist
    if(!wsdb[channel]){
        wsdb[channel] = {};
        wsdb[channel].users = new Set();
        wsdb[channel].udb = {};
        wsdb[channel].msgs = [];
        console.log("Created Channel: " + channel)
    }
    // Set the connection IP to the requestor's IP
    connection.ip = req.ip;
    connection.socket.on('message', message => {
        message = message.toString();
        for(let client of wsdb[channel].users) {
            client.socket.send(message);
            console.log('sent to client');
        }
    })
    connection.socket.on('close', () => {
        wsdb[channel].users.delete(connection)
    }) 
})
fastify.get("/api/watch/*",(req, res) =>{

})
fastify.post("/api/user/login", (req, res) => {
    // Set all possible header vars that would be passed
    let ip = req.socket.remoteAddress;
    // Start with Token Login, since this is preferred
    if(req.body.token) {
        let token = req.body.token;
        Query = query("R","users", {"token": token, "ip": ip})
        Query.then(retdata => {
            if(retdata.length > 0)
            {
                //Login Successful
                retdata = retdata[0]
                res.send({
                    "success": "true",
                    "data": retdata
                })
            } else {
                res.send({
                    "error":"Token invalid"
                })
            }
        })
    } else if (req.body.email && req.body.password) {
        let params = {"email":req.body.email,"hash":GoodSalt(req.body.password)}
        Query = query("R","users", params)
        Query.then(retdata => {
            if(retdata.length > 0)
            {
                retdata = retdata[0]
                let token = jwt.sign(retdata['email'], SALT);
                res.send({
                    "success": "true",
                    "token": token,
                    "data": retdata
                });
                let q = query("U",'users', [
                    {"_id": retdata._id},
                    {"token": token, "ip": ip}
                ]);
                q.then(e => {
                    console.log(e);
                })
            } else {
                res.send({
                    "error": "No User Found",
                    "data": res.body
                })
            }
        })
    } else {
        //No attempt to login was valid
        res.send({"error":"Bad API Request", "data": req.body})
    }
})
fastify.post("/api/user/signup", (req, res) => {
    let Query, u;   
    if(req.body.username && req.body.email && req.body.password)
    {
        let u = {
            name:req.body.username,
            email:req.body.email,
            pass:req.body.password
        }
        let qry = query("R","users", {"email":u.email});
        qry.then(r => {
            if(!(r.length > 0))
            {
                u.hash = GoodSalt(u.pass);
                delete u.pass;
                if(u.hash) {
                    let token = jwt.sign(u.email, SALT);
                    u.token = token;
                    u.ip = req.socket.remoteAddress;
                    Query = query("C", "users", u);
                    Query.then(result => {
                        res.send({"success":"true","token":token})
                    })
                } else {
                    res.send({"error":"Password Hashing Failed"});
                }
            } else {
                res.send({"error":"Email already in use"})
            }
        })
    } else {
        res.send({"error":"Invalid User", "data": req.body})
    }
})
//Websocket Testpage
fastify.get("/webtest",(req,res)=>{
    let htmlBuffer = fs.readFileSync('client.html');
    res.type('text/html').send(htmlBuffer);
})
fastify.get("/streamtest",(req,res)=>{
    let htmlBuffer = fs.readFileSync('streamer.html');
    res.type('text/html').send(htmlBuffer);
})
// Creating Websocket Handler
fastify.get('/websocket/*', {websocket: true}, (connection /* SocketStream */ , req /* FastifyRequest */ ) => {
    // Get the attempted Channel
    let channel = (req.url).replace("/websocket/","");
    console.log(channel);
    //Create Channel if Doesn't exist
    if(!wsdb[channel]){
        wsdb[channel] = {};
        wsdb[channel].users = new Set();
        wsdb[channel].udb = {};
        wsdb[channel].msgs = [];
        console.log("Created Channel: " + channel)
    }
    // Set the connection IP to the requestor's IP
    connection.ip = req.ip;
    connection.socket.on('message', message => {
        message = message.toString();
        console.log(message);
        if(message.includes('[UNAME]'))
        {
            connection.uname = message.replace('[UNAME]','');
            wsdb[channel].udb[connection.id] = connection.uname;
        } else if (message.includes('[id]')) {
            console.log("New User attempting Auth");
            // Check DB for user that matches this ID from the correct IP
            let id = message.replace("[id]",'');
            query("R","users",{token:  id})
            .then(r=>{
                console.log(r);
                if(r.length > 0)
                {
                    //We can verify the user exists
                    wsdb[channel].udb[id] = r[0].username;
                    connection.id = id
                    //Add the user to the channel
                    wsdb[channel].users.add(connection);
                    // Send the whole message history
                    connection.socket.send("[h]" + JSON.stringify(wsdb[channel].msgs))
                    console.log("User Added!");
                }
            })
        } else {
            for(let client of wsdb[channel].users) {
                let msg = message;
                console.log(wsdb[channel].udb);
                wsdb[channel].msgs.push({u: connection.id, m: msg, time: Date.now()})
                msg = "[u]"+wsdb[channel].udb[connection.id]+"[m]"+msg;
                client.socket.send(msg);
            }
        }
    })
    connection.socket.on('close', () => {
        wsdb[channel].users.delete(connection)
    }) 
})

function GoodSalt(pwd) {
    let pass1 = Crypto.pbkdf2Sync(pwd, process.env.secret, 1000, 64, `sha512`).toString('hex');
    let pass2 = Crypto.pbkdf2Sync(pwd, process.env.secret, 1000, 64, `sha512`).toString('hex');
    return (pass1 === pass2 ? pass1 : false);
}
async function query(action, collection, params) {
    await db.connect();
    let ret;
    let DB = db.db("fantasyvlr");
    let COL = DB.collection(collection);
    switch (action) {
        case "C":
            ret = COL.insertOne(params)
            break;
        case "R":
            ret = COL.find(params).toArray();
            break;
        case "U":
            ret = COL.updateOne(params[0], {
                $set: params[1]
            });
            break;
        case "D":
            break;
    }
    return ret;
}
function runScript(script) {
    return new Promise((resolve, reject) => {
        const process = spawn('python3', ['./'+script]);

        const out = []
        process.stdout.on(
            'data',
            (data) => {
                out.push(data.toString());
                logOutput('stdout')(data);
            }
        );

        const err = []
        process.stderr.on(
            'data',
            (data) => {
                err.push(data.toString());
                logOutput('stderr')(data);
            }
        );

        process.on('exit', (code, signal) => {
            logOutput('exit')(`${code} (${signal})`)
            if (code === 0) {
                resolve(out);
            } else {
                reject(new Error(err.join('\n')))
            }
        });
    });
}
async function start() {
    try {
        await fastify.listen(process.env.APIPort)
        console.timeEnd("ServerStart");
    } catch (err) {
        fastify.log.error(err);
        console.timeEnd("ServerStart");
        process.exit(1);
    }
}

start();