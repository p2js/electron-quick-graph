const { app, BrowserWindow } = require('electron');
const contextMenu = require('electron-context-menu');
const path = require("path");

const createWindow = () => {
    const win = new BrowserWindow({
        width: 530,
        height: 500,
        fullscreenable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });
    //disable the top menu bar
    win.setMenu(null);
    //make window non-resizable
    win.setResizable(false);
    //load the html file
    win.loadFile(path.join("page", "index.html"));
};


contextMenu({
    showSaveImageAs: true,
    showCopyImageAddress: true,
    showSearchWithGoogle: false,
    showSelectAll: false,
    showInspectElement: false
});

app.whenReady().then(() => {
    //create a window
    createWindow();
    //if the app is activated and there are no windows (macOS moment) we probably wanna open one
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

//if all windows are closed (on non macOS operating systems) you probably wanna quit the app
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});