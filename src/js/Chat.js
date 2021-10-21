const socket = io('http://localhost:9090')
const videoGrid = document.getElementById('video-grid')
let myPeer = new Peer(undefined, {
    host: 'http://localhost',
    port: '9090'
})
let peers = {};

function JoinRoom(roomId) {
    socket.emit('join-room', roomId, JWT)
    const myVideo = document.createElement('video')
    myVideo.muted = true
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        addVideoStream(myVideo, stream)

        myPeer.on('call', call => {
            call.answer(stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        })

        socket.on('user-connected', userId => {
            connectToNewUser(userId, stream)
        })
    })
}

function JoinChat(roomId) {
    socket.emit('join-chat', roomId)
    PageSwitch("Room",roomId)
}
socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

socket.on("message-received", msg =>{
    $("#ChatBoard").append("<div class='received message'><span class='author'>"+msg.name+"</span>"+msg.message+"</div>")
})

function SendMessage(msg) {
    socket.emit("send-message", "general", User.name, msg)
}


function connectToNewUser(userId, stream) {
    console.log("Trying Connection");
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}