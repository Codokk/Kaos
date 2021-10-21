let user = {};
$(document).ready(function() {
    //First thing first check if token exists
    let JWT = ipcRenderer.sendSync("GetJWT");
    $.ajax({
        method: "POST",
        url: api + "/user/login",
        data: {
            token: JWT
        }
    }).done((res)=>{
        console.log(res);
        if(res.error) Err(res.error);
        else ipcRenderer.send("JWT",res.token);
    })

    $("#loginbutton").click(function (e) {
        e.preventDefault();
        user.name = user.email = $("#username").val()
        user.pass = $("#password").val()
        $.ajax({
            method: "POST",
            url: api + "/user/login",
            data: {
                user: user
            }
        }).done((res)=>{
            console.log(res);
            if(res.error) Err(res.error);
            else ipcRenderer.send("JWT",res.token);
        })
    })
    $("#forgotpassword").click(function (e) {
        e.preventDefault();
        user.name = user.email = $("#username").val()
        user.pass = $("#password").val()
        $.ajax({
            method: "POST",
            url: api + "/user/signup",
            data: {
                user: user
            }
        }).done((res)=>{
            if(res.error) Err(res.error);
        })
    })
})

function Err(error) {
    $("#errorBar").text(error).addClass("active");
    setTimeout(()=>{
        $("#errorBar").removeClass("active");
    }, 5000)
}