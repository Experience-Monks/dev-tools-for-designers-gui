'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({width: 800, height: 600});
	mainWindow.loadURL('file://' + __dirname + '/index.html');
		//for debugging
	//mainWindow.webContents.openDevTools();
	
		// Quit when all windows are closed.
	mainWindow.on('closed', function() {
		mainWindow = null;
	});
	
	
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if(process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if(mainWindow === null) {
		createWindow();
	}
});

