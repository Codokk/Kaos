console.log("Starting The Server");
console.time("ServerStart")
// Requirements
require('dotenv').config();
const fastify = require('fastify')({
    logger: true
})
fastify.register(require('fastify-websocket'))
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Globals
const wsdb = {};

fastify.get("/",(req,res)=>{
    let htmlBuffer = fs.readFileSync('client.html');
    res.type('text/html').send(htmlBuffer);
})
fastify.get("/jwt",(req,res)=>{
    //Signing based on IP right now
    let token = jwt.sign(req.connection.remoteAddress, process.env.secret)
    return {jwt: token}
})
fastify.get('/websocket/*', {websocket: true}, (connection /* SocketStream */ , req /* FastifyRequest */ ) => {
    let channel = (req.url).replace("/websocket/","");
    if(!wsdb[channel]){
        wsdb[channel] = {};
        wsdb[channel].users = new Set();
        wsdb[channel].msgs = new Set();
        console.log("Created Channel: " + channel)
    }
    console.log("User Added ;)");
    connection.socket.on('message', message => {
        for(let client of wsdb[channel].users) {
            client.socket.send(message);
        }
    })
    connection.socket.on('close', () => {
        wsdb[channel].users.delete(connection)
    })
    wsdb[channel].users.add(connection);
})

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