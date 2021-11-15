// Main App
const App = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        user: {},
        events: {}
    }
});
// Global Token because lazy
let token = ipcRenderer.sendSync("GetJWT");
//On Ready
document.addEventListener("DOMContentLoaded", (e) => {
    // Assign Data, Display Page
    if(UpdateGlobal())
    {
        CreateSidemenu();
        PageSwap('Dashboard');
        $("#app").classList.remove("hidden");
    }
})

async function UpdateGlobal() {
    //JWT
    
    //User
    let a = await APIRequest("/user/getInfo", "POST", {
            token: token
        })
        .then(r => {
            if (r.success) {
                let keys = Object.keys(r.data);
                for (i in keys)
                {
                    App.$set(App.user, keys[i], r.data[keys[i]]);
                }
                 //Token is grabbed too
                return true
            } else {
                console.error("Couldn't Get User Information");
                console.error(r);
                return false;
            }
        })
    //Events
    let b = await APIRequest("/events/all", "GET")
        .then(r => {
            App.$set(App.events, r.data);
            return true;
        })
    return (a && b)
}