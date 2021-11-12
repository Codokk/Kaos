let PageDB = {
    Dashboard: {
        title: "Dashboard",
        submodules: [
            {
                title: "Home",
                module: "home"
            },
            {
                title: "Settings",
                module: "settings"
            }
        ]
    },
    Tournaments: {
        title: "Tournaments",
        submodules: [
            {
                title: "hide",
                module: "allTournaments",
                action: "getall('events')"
            }
        ]
    },
    News: {
        title: "Recent News",
        submodules: [
            {
                title: "Recent Articles",
                module: "recentArticles"
            },
            {
                title: "Search Articles",
                module: "searchArticles"
            }
        ]
    }
}
function PageSwap(Page) {
    // Get the page from the database
    Page = PageDB[Page]
    // Generate the headerhtml
    let headerhtml = "";
    for(i in Page.submodules)
    {
        let p = Page.submodules[i];
        headerhtml += `<a class="main-header-link ` + (i==0?`is-active`:"") + ` ` + (p.title == "hide" ? "hidden" : "") +`" onclick="SwapSubmodule('${p.module}')" href="#">${p.title}</a>`
    }
    // Set the title, load the module
    document.querySelector(".main-header").innerHTML = `
    <a class="menu-link-main" href="#">${Page.title}</a>
    <div class="header-menu">
        ${headerhtml}
    </div>`;
    // Open the default Module
    SwapSubmodule(Page.submodules[0].module);
    if(Page.submodules[0].action) runAction(Page.submodules[0].action)
}
function SwapSubmodule(submodule) {
    fs.readFile(`./src/html/submodules/${submodule}.html`, (err, html)=> {
        if(err) console.log(err);
        document.querySelector(".submodule-container").innerHTML = html;
        PersonalizePage();
    })
}

function runAction(fn) {
    let a = fn.split("(");
    a[1] = a[1].replace(")","")
    a[1] = a[1].replaceAll("'","");
    console.log(a);
    switch(a[0])
    {
        case 'getall':
            let ret = getall(a[1])
            ret.then(e => {
                console.log(e)
            })
            break;
        default:
            console.error("The Function [" + a[0] + "] is not defined in the runAction function in ModuleHandler.js")
            break;
    }
}

function PersonalizePage() {
    //Set the User Profile to their image
    $("#profile-img").attr("src", User.imagedata);
    let keys = Object.keys(User);
    for(let i = 0; i < keys.length; i++)
    {
        $(`.${keys[i]}-here`).html(User[keys[i]])
    }
}
function BuildFavorites() {
    for (i in User.favorites)
    {

    }
}