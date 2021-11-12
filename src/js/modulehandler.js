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
        headerhtml += `<a class="main-header-link ` + (i==0?`is-active`:"") + `" onclick="SwapSubmodule('${p.module}')" href="#">${p.title}</a>`
    }
    // Set the title, load the module
    document.querySelector(".main-header").innerHTML = `
    <a class="menu-link-main" href="#">${Page.title}</a>
    <div class="header-menu">
        ${headerhtml}
    </div>`;
    // Open the default Module
    SwapSubmodule(Page.submodules[0].module);
}
function SwapSubmodule(submodule) {
    fs.readFile(`./src/html/submodules/${submodule}.html`, (err, html)=> {
        if(err) console.log(err);
        document.querySelector(".submodule-container").innerHTML = html;
        PersonalizePage();
    })
    switch(submodule)
    {
        case "recentArticles":
            LetsGetIntoTheNews();
            break;
        default:
            console.log("No Script Required");
            break;
    }
}

function LetsGetIntoTheNews() {
    // Get news articles from API, create the app-card
    fetch(api + "/news").then(e => {
        console.log(e);
    })
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