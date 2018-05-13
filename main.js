const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const Sails = require('sails').constructor
const sailsApp = new Sails()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

//lift sails app
function initializeSails(mainWindow) {
  try {
    // Ensure that the server App is in the project directory, so relative paths work as expected
    // Electron start the App from root directory where is located executable file (.exe|.app)
    // `cwd` is set in server repository, asar compilation is currently not working
    // because `chdir` does not work into .asar files :(
    try {
        // set `chdir` to enable the use of the sails REST API into the Electron aplication
        process.chdir(__dirname);
    } catch (e) {
        process.env.LOADSERVER_ERROR = {
            error: e,
            dirname : __dirname,
            cwd: process.cwd()
        }
        console.error('The App is not available for asar compilation: ', process.env.LOADSERVER_ERROR)
        return;
    }

    sailsApp.lift({
      "appPath": __dirname,
      "log": {
        //"level": 'silent'
      }
    }, function (err) {
      if (err) {
        console.log('Error occurred loading Sails app:', err);
        mainWindow.loadURL('data:,' + err);
        return;
      }
      
      console.log('Sails app loaded successfully!');
      //after lifting load url
      mainWindow.loadURL('http://localhost:1337');
      mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.focus();
      })
    });
  } catch(err) {
    mainWindow.loadURL('data:,' + err);
  }
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });

  //mainWindow.loadURL('http://www.google.com');
  initializeSails(mainWindow);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
