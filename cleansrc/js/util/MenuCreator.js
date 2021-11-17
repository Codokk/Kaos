let MenuObject = [
    {
        title: "Featured Tournaments",
        items: [
            {
                title: "Valorant Champions",
                fn: "ViewEvent",
                page: 449
            }
        ]
    },
    {
        title: "User Pages",
        items: [
            {
                title: "Dashboard",
                page: "Dashboard"
            },
            {
                title: "Tournaments",
                page: "Tournaments",
            },
            {
                title: "News",
                page: "News"
            }
        ]
    }
]

function CreateSidemenu(menu) {
    if(!menu) menu = MenuObject;
    let html = "";
    for(i in menu) {
        let m = menu[i];
        console.log(i);
        console.log(menu);
        //Always defualt to Pageswap if no function set
        if(!m.fn) m.fn = 'PageSwap';
        html += `
        <div class="side-wrapper">
            <div class="side-title">${m.title}</div>
            <div class="side-menu" id="Chatroom-Menu">`;
        for(j in menu[i].items)
        {
            let s = menu[i].items[j];
            html += `
            <a href="#" onClick="${m.fn}('${m.param}')">
                    <i class="fas fa-${s.icon}"></i>
                    ${s.title}
                </a>`;
        } 
        html +=`</div>
        </div>
        `;
    }
    $("#side-menu").innerHTML = html;
}