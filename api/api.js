console.log("Starting The Server");
console.time("ServerStart")
// Requirements
require('dotenv').config();
const fastify = require('fastify')({ logger: true })
fastify.register(require('fastify-websocket'))
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const uuid = require('uuid');

// Globals
const wsdb = {};

//DB Setup
const mdburl = "mongodb://localhost:27017";
const db = new MongoClient(process.env.MDBURL);
fastify.get("/", (req, res)=>{
    res.send({ msg: "API"})
})
fastify.get("/webtest",(req,res)=>{
    let htmlBuffer = fs.readFileSync('client.html');
    res.type('text/html').send(htmlBuffer);
})
fastify.get("/jwt",(req,res)=>{
    //Signing based on IP right now
    let token = jwt.sign(req.connection.remoteAddress, process.env.secret)
    return {jwt: token}
})
fastify.get("/login", (req, res) => {
    let username = req.headers.username;
    let password = req.headers.password;
    let params = {username: username, password:password};
    query("R", "users",params)
    .then(r => {
        query("U", "users", [params,{ip:req.ip, token:req.headers.token}])
        .then(e => {
            console.log(e);
            res.send(r);
        })
    })

})
fastify.get('/websocket/*', {websocket: true}, (connection /* SocketStream */ , req /* FastifyRequest */ ) => {
    // Get the attempted Channel
    let channel = (req.url).replace("/websocket/","");
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
                console.log(wsdb[channel].udb);
                wsdb[channel].msgs.push({u: connection.id, m: message, time: Date.now()})
                message = "[u]"+wsdb[channel].udb[connection.id]+"[m]"+message;
                client.socket.send(message);
            }
        }
    })
    connection.socket.on('close', () => {
        wsdb[channel].users.delete(connection)
    })
    
})
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