// Main App
const G = {
    events: {},
    user: {}
}

//On Ready
document.addEventListener("DOMContentLoaded",(e) => {
    if(UpdateGlobal()) {
        console.log("Loaded, unhiding the app");
        PageSwap('Dashboard');
        $("#app").classList.remove("hidden");
    }
})

// Could Be Setup Functions... but nah
async function UpdateGlobal() {
    //JWT
    let token = ipcRenderer.sendSync("GetJWT");
    //User
    let a = await APIRequest("/user/getInfo","POST",{token: token})
        .then(r=>{
            if(r.success)
            {
                G.user = r.data; //Token is grabbed too
                return true
            } else {
                console.error("Couldn't Get User Information");
                console.error(r);
                return false;
            }
        })
    //Events
    let b = await APIRequest("/events/all","GET")
        .then(r=>{
            G.events = r.data;
            return true;
        })
    return (a && b)
}