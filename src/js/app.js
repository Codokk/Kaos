// Create Globals
let Webcam;
let Video;
let JWT;
let User;
let canvas;
let ctx;
const GLOBAL = {
    events: {}
};
// Compat
navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia);

$(document).ready(function () {
    JWT = ipcRenderer.sendSync("GetJWT", true);
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
        if(res.error) console.log(res.error);
        User = res.data;
        PageSwap('Dashboard');
        $("#app").removeClass("hidden");
    })
    // Event Captures
    // $("#profile-img").dblclick(()=> {
    //     ipcRenderer.send("Logout");
    // })
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
async function getall(a) {
    let ret;
    switch(a)
    {
        case "events":
            await $.ajax({
                method: "get",
                url: api + "/events/all",
                data: {
                    token: JWT,
                }
            }).done((res)=>{
                if(res.error) console.error(res.error);
                ret = res;
                // Add events to page & global
                let html = ""
                res.forEach((i)=>{
                        GLOBAL.events[i.EventID] = i;
                        html += `
                        <li class="adobe-product">
                            <div class="products">
                                <svg viewBox="0 0 52 52" style="border:1px solid #3291b8">
                                    <g xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M40.824 52H11.176C5.003 52 0 46.997 0 40.824V11.176C0 5.003 5.003 0 11.176 0h29.649C46.997 0 52 5.003 52 11.176v29.649C52 46.997 46.997 52 40.824 52z"
                                            fill="#061e26" data-original="#393687" />
                                        <path
                                            d="M12.16 39H9.28V11h9.64c2.613 0 4.553.813 5.82 2.44 1.266 1.626 1.9 3.76 1.9 6.399 0 .934-.027 1.74-.08 2.42-.054.681-.22 1.534-.5 2.561-.28 1.026-.66 1.866-1.14 2.52-.48.654-1.213 1.227-2.2 1.72-.987.494-2.16.74-3.52.74h-7.04V39zm0-12h6.68c.96 0 1.773-.187 2.44-.56.666-.374 1.153-.773 1.46-1.2.306-.427.546-1.04.72-1.84.173-.801.267-1.4.28-1.801.013-.399.02-.973.02-1.72 0-4.053-1.694-6.08-5.08-6.08h-6.52V27zM29.48 33.92l2.8-.12c.106.987.6 1.754 1.48 2.3.88.547 1.893.82 3.04.82s2.14-.26 2.98-.78c.84-.52 1.26-1.266 1.26-2.239s-.36-1.747-1.08-2.32c-.72-.573-1.6-1.026-2.64-1.36-1.04-.333-2.086-.686-3.14-1.06a7.36 7.36 0 01-2.78-1.76c-.987-.934-1.48-2.073-1.48-3.42s.54-2.601 1.62-3.761 2.833-1.739 5.26-1.739c.854 0 1.653.1 2.4.3.746.2 1.28.394 1.6.58l.48.279-.92 2.521c-.854-.666-1.974-1-3.36-1-1.387 0-2.42.26-3.1.78-.68.52-1.02 1.18-1.02 1.979 0 .88.426 1.574 1.28 2.08.853.507 1.813.934 2.88 1.28 1.066.347 2.126.733 3.18 1.16 1.053.427 1.946 1.094 2.68 2s1.1 2.106 1.1 3.6c0 1.494-.6 2.794-1.8 3.9-1.2 1.106-2.954 1.66-5.26 1.66-2.307 0-4.114-.547-5.42-1.64-1.307-1.093-1.987-2.44-2.04-4.04z"
                                            fill="#c1dbe6" data-original="#89d3ff" />
                                    </g>
                                </svg>
                                ${titlefix(i.Name)}
                            </div>
                            <span class="status">
                                <span class="status-circle green"></span>
                                ${i.Status}
                            </span>
                            <div class="button-wrapper">
                                <button class="content-button status-button open" onClick="openEvent(${i.EventID})">Open</button>
                            </div>
                        </li>`;
                })
                $(".events-go-here").each((i, el)=>{
                    el.innerHTML = html;
                })
            })
            break;
        default:
            console.error(a);
            break;
    }
    return ret;
}
function openEvent(eid) {
    SwapSubmodule("event");
    BuildEventPage(eid);
}
function titlefix(title) {
    if(title) return capitalize(title.replaceAll("-"," "));
}