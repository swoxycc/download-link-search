const { app, BrowserWindow, BrowserView } = require('electron');
const path = require('path');

let mainWindow;
let view;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,  // Genişlik: 1200
        height: 900,  // Yükseklik: 900
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });

    mainWindow.loadFile('index.html');
}

function performSearch(query) {
    // Arama sorgusunu "index of" ve kullanıcı sorgusuyla birlikte oluşturun
    const searchQuery = `intext:"index of" "${query}"`;

    // Yeni bir BrowserView oluştur
    if (view) {
        mainWindow.removeBrowserView(view);
        view.destroy();
    }
    view = new BrowserView();
    mainWindow.setBrowserView(view);
    view.setBounds({ x: 0, y: 150, width: 1200, height: 750 });  // BrowserView boyutlarını genişlettik

    // DuckDuckGo aramasını yaparken URL'yi doğru şekilde kodlayın
    const searchURL = `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`;
    view.webContents.loadURL(searchURL);
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Ana işlemden Renderer işlemine gelen sorguyu dinleyin
const { ipcMain } = require('electron');
ipcMain.on('search-query', (event, query) => {
    performSearch(query);
});
