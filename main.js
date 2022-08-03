// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain, Tray, dialog} = require('electron')
const electronReload = require('electron-reload')
const url = require('url')
const path = require('path')
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Kettlebell1601!',
  database: 'copy_cat_app'
})



let tray = null;
function createWindow () {
  // Create the browser window.
   mainWindow = new BrowserWindow({
    width: 300,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
  Menu.setApplicationMenu(mainMenu)
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  const iconPath = path.join(__dirname, '3x/Asset 3@3x.png')
  console.log(iconPath);
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio', checked: true },
    { label: 'Item2', type: 'radio'},
    { label: 'Item3', type: 'radio'},
    { label: 'Item4', type: 'radio'},
  ])
  tray.setToolTip('This is my app');
  tray.setContextMenu(contextMenu);
}
// Load DB Items into favorites
function loadFavorites(){
  connection.connect(function(err){
    if(err) throw err;
    let sql = 'SELECT * FROM items_copied'
    connection.query(sql, function(err, result){
      if(err) throw err;
      console.log(result);
      mainWindow.webContents.send('loadFavorites', result);
    })
  })
}
//Catch item:add
ipcMain.on('item:add', function(e, item){
  console.log(item);
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
})
// Read Clipboard add
ipcMain.on('text:copied', function(e, text){
  // console.log(text);
  mainWindow.webContents.send('text:copied', text);
})
// Add Favorite Item to database
ipcMain.on('item:add-to-db', function(e, text){
  connection.connect(function(err){
    if (err) throw err;
    let sql = `INSERT INTO items_copied(item_copied) VALUES ('${text}')`;
    connection.query(sql, function(err, result){
      if(err) throw err;
      console.log('1 record inserted')
    })
    mainWindow.webContents.send('item:add-to-favorites', text)
  });
})
//Delete Item from DB
ipcMain.on('item:delete-from-db', function(e, text){
  let options = {
    buttons: ["Yes", "Nope", "Cancel"],
    message: "Are you sure you want to delete this item?"
  }

  const response = dialog.showMessageBoxSync(mainWindow,options);
  console.log(response);
  console.log(text);
  if (response == 0 ){
    mainWindow.webContents.send('item:deleted', text);
    connection.connect(function(err){
      let query = typeof text === 'string' ? text : text.item_copied;
      if (err) throw err;
      let sql = `DELETE FROM items_copied WHERE item_copied ='${query}'`;
      connection.query(sql, function(err, result){
        if(err) throw err;
        console.log(`1 record deleted ${query}`)
      })
    });
  }
})
//Declare addWindow and mainWindow
let addWindow;
let mainWindow;
// Handle create add windows
function createAddWinow(){
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    // contextIsolation: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'newWindow.html' ),
    protocol: 'file',
    slashes: true
  }))
  addWindow.on('close', function(){
    addWindow = null;
  })
}
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        accelerator: process.platform == 'darwin' ? 'Command+N' : 'ctrl+N',
        click(){
          createAddWinow();
        }
      },
      {
        label: 'Clear Items'
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'crtl+Q',
        click(){
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Copy',
      },
      {
        label: 'Pasta'
      }
    ]
  }
]
//if mac add empty object to Menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({
    label:"cool"
  })
}
//Add developer DevTools
if(process.env.NODE_ENV != 'production'){
  mainMenuTemplate.push({
    label: 'Dev Tools',
    submenu: [
      {
        label: 'Toggle Tools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'crtl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  createWindow()
  mainWindow.once('ready-to-show', () => {
    loadFavorites();
  })

  mainWindow.on('closed', function(){
    app.quit();
  })
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
