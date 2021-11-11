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
                email: user.email,
                password: user.pass
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