let user = {};
$(document).ready(function() {
    //First thing first check if token exists
    let JWT = ipcRenderer.sendSync("GetJWT");
    if(JWT)
    {
        $.ajax({
            method: "POST",
            url: api + "/user/login",
            data: {
                token: JWT
            }
        }).done((res)=>{
            console.log(res);
            if(res.error) Err(res.error);
            else if (res.success) ipcRenderer.send("JWT",JWT);
        })
    }
    

    $("#loginbutton").click(function (e) {
        e.preventDefault();
        user.name = user.email = $("#username").val()
        user.pass = $("#password").val()
        $.ajax({
            method: "POST",
            url: api + "/user/login",
            data: {
                email: $("#username").val(),
                password: $("#password").val()
            }
        }).done((res)=>{
            console.log(res);
            if(res.error){
                Err(res.error);
            } else if (res.success) {
                ipcRenderer.send("JWT",res.token);
            }
        })
    })
    $("#signupbutton").click(function (e) {
        e.preventDefault();
        user.name = $("#signup-username").val()
        user.email = $("#signup-email").val()
        user.pass = $("#signup-password").val()
        $.ajax({
            method: "POST",
            url: api + "/user/signup",
            data: {
                username: user.name,
                email: user.email,
                password: user.pass
            }
        }).done((res)=>{
            if(res.error) Err(res.error);
            console.log(res);
        })
    })
})

function Err(error) {
    $("#errorBar").text(error).addClass("active");
    setTimeout(()=>{
        $("#errorBar").removeClass("active");
    }, 5000)
}

function swapForm(form) {
    console.log('swapping');
    $("form").addClass("hidden");
    $("#"+form+"-form").removeClass("hidden");
}