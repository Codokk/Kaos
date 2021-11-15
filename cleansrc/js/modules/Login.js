let user = {};
// On Page Ready
document.addEventListener("DOMContentLoaded", (event) => {
    let JWT = ipcRenderer.sendSync("GetJWT");
    user = ReadJSON('User');
    console.log("YES");
    //Attempt a token login
    if (JWT) {
        APIRequest("/user/login", "POST", {
                token: JWT
            })
            .then(response => {
                if (response.error) Err(response.error);
                else if (response.success) ipcRenderer.send("JWT", JWT)
            })
    }
    //Add Event Listeners
    document.querySelector("#loginbutton").addEventListener("click", (e) => {
        e.preventDefault();
        Login();
    });
    $("#signupbutton").addEventListener("click", (e) => {
        e.preventDefault();
        SignUp();
    })
});

function Login() {
    APIRequest("/user/login", "POST", {
            email: $("#username").value,
            password: $("#password").value
        })
        .then(e => {
            console.log(e);
            if (e.error) Err(e.error);
            else if (e.success) ipcRenderer.send("JWT", e.token);
        })
}
function SignUp() {
    user.username = $("#signup-username").value;
    user.email = $("#signup-email").value;
    user.password = $("#signup-password").value;
    APIRequest("/user/signup", "POST", user)
        .then(e => {
            console.log(e);
            if (e.error) Err(e.error);
            else if (e.success) ipcRenderer.send("JWT", e.token);
        })
}

function Err(error) {
    $("#errorBar").innerHTML = error;
    $("#errorBar").classList.add("active");
    setTimeout(() => {
        $("#errorBar").classList.remove("active");
    }, 5000)
}

function swapForm(form) {
    console.log('swapping');
    $("form").forEach((el)=>{
        el.classList.add("hidden");
    })
    $("#" + form + "-form").classList.remove("hidden");
}