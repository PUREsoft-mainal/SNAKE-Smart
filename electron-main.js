const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 480,
        height: 820,
        resizable: true,
        autoHideMenuBar: true,
        title: "SNAKE Smart",
        webPreferences: {
            contextIsolation: true
        }
    });

    win.loadFile(path.join(__dirname, 'www', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

