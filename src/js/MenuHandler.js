$('#Fullscreen').click(function(){
    ipcRenderer.send("Fullscreen");
})
$('#Minimize').click(function(){
    ipcRenderer.send("Minimize");
})
$("#Close").click(function(){
    window.close();
})