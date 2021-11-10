// Create Globals
let Webcam;
let Video;
let JWT;
let User;
let canvas;
let ctx;
// Compat
navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

$(document).ready(function () {
    JWT = ipcRenderer.sendSync("GetJWT");
    console.log(pyresults);
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext('2d');
    // Get User from API
    $.ajax({
        method: "POST",
        url: api + "/user/getInfo",
        data: {
            token: JWT
        }
    }).done((res)=>{
        if(res.error) window.close();
        User = res.user;
        PersonalizePage();
    })
    // Event Captures
    $("#profile-img").dblclick(()=> {
        $(".overlay-app").addClass("is-active");startWebcam();
    })
})

function takeUserPhoto() {
    snapshot();
}
function startWebcam() {
    if (navigator.getUserMedia) {
        navigator.getUserMedia({
            video: true,
            audio: false
        },
            // successCallback
            function (localMediaStream) {
                console.log(localMediaStream)
                video = document.querySelector('video');
                video.srcObject = localMediaStream;
                Webcam = localMediaStream;
            },
            // errorCallback
            function (err) {
                console.log("The following error occured: " + err);
            });
    } else {
        console.log("getUserMedia not supported");
    }
}
function snapshot() {
    // Draws current image from the video element into the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    $("#WebCam1").addClass("hidden");
    $("#myCanvas").removeClass("hidden");
    Webcam.getTracks().forEach(function (track) {
        track.stop();
    });
    data = document.getElementById("myCanvas")
    data = data.toDataURL("image/png");
    $("#profile-img").attr("src",data);
    $(".overlay-app").toggleClass("is-active");
    // Update in database
    $.ajax({
        method: "POST",
        url: api + "/user/update",
        data: {
            token: JWT,
            update: {
                "imagedata": data
            }
        }
    }).done((res)=>{
        if(res.error) console.error(res.error);
        console.log(res);
    })
}
function DarkModeToggle() {
    $("body").toggleClass("light-mode");
}
function PersonalizePage() {
    //Set the User Profile to their image
    $("#profile-img").attr("src", User.imagedata);
    $(".username-here").html(User.name);
}
function SwapSubmodule(sub) {
    //Switch the Submodule
    $(".submodule-link").removeClass("is-active");
    $("#switch-" + sub).addClass("is-active");
    $(".submodule").removeClass("is-active");
    $("#submodule-"+sub).addClass("is-active");
    switch(sub)
    {
        case "settings":
            //Update settings with current user information
            $("#settings-user-email > span:nth-child(1)").addClass("green");
            $("#settings-user-email > span:nth-child(2)").html(User.email)
            break;
    }
}
function PageSwitch(page, param = null) {
    // Load the page to switch to
    $(".main-container").removeClass("is-active");
    $("#"+page).addClass("is-active");
    if(param != null)
    {
        //We're loading a chat room
        $(".room-name").html(capitalize(param));
        getMessages(param);
    }
}
function UserUpdate(param) {
    switch(param)
    {
        case "name":
            console.log("here");
            $(".overlay-app").html($("#Form-Username-Update").html())
            $(".overlay-app").addClass('is-active');
            // 
            break;
        default:
            console.log(param);
            break;
    }
}
function ApiUpdate(param) {
    //Params is an object
    switch(param)
    {
        case "name":
            let name = $("input[name=new_username]").val();
            console.log(name);
            $.ajax({
                method: "POST",
                url: api + "/user/update",
                data: {
                    token: JWT,
                    update: {
                        name: name
                    }
                }
            }).done((res)=>{
                if(res.error) console.error(res.error);
                console.log("RES:" + res);
                User.name = name
                PersonalizePage();
                CloseOverlay();
            })
            break;
        default:
            console.log(param);
            break;
    }
}
function CloseOverlay() {
    $(".overlay-app").html('').removeClass("is-active");
}
function getMessages(room) {
    $.ajax({
        method: "POST",
        url: api + "/rooms/"+room,
        data: {
            token: JWT,
            id: User._id
        }
    }).done((res)=>{
        if(res.error) console.error(res.error);
        console.log(res);
        //Sort by timestamp
        res.data.sort((a, b)=>{
            return b.time - a.time;
        })
        res.data.forEach(msg=>{addMessage(msg)})
    })
}
function addMessage(msg) {
    if(msg.name) {
    $("#ChatBoard").append("<div class='message-container'><div class='message' data-time='"+msg.time+"'><span class='msg-author'>"+msg.name+"</span>"+msg.message+"</div></div>");
    }
}

function OpenOverlay(module) {
    //Does the same thing as UserUpdate, should probably merge the two at some point
    switch(module)
    {
        case "Link Account":
            console.log("here");
            $(".overlay-app").html($("#Form-Link-Account").html())
            $(".overlay-app").addClass('is-active');
            // 
            break;
        default:
            console.log(param);
            break;
    }
}
function GetValorantStats(id) {
    pyresults = ipcRenderer.sendSync("GetValorantStats", id);
    if(pyresults.length > 1)
    {
        //Account exists
    }
}