const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const checkInternetConnected = require('check-internet-connected');

// Initialize the app
app.on('ready', async () => {
  // Create the splash window
  const splashWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
    },
    icon: path.join(__dirname, '../res/images/', 'myRadioIcon.png')
  });
  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.setResizable(false);
  splashWindow.setMenu(null);


  // Bring the splash window to the front immediately
  splashWindow.focus();
  // Check for internet connectivity periodically
  setInterval(async () => {
    try {
      await checkInternetConnected();
    } catch (error) {
      // Load the error page if there's no internet connection
      mainWindow.loadFile(path.join(__dirname, 'error.html'));
    }
  }, 1000); // Check every second

  // Create the main window initially hidden
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false, // Initially hide the window
    // Other window options...
    icon: path.join(__dirname, '../res/images/', 'myRadioIcon.png')
  });
  mainWindow.setMenu(null);
  mainWindow.setResizable(true); // Allow resizing initially

  // Set a minimum size for the window
  mainWindow.setMinimumSize(800, 600); // Example minimum size

  // Load the URL
  mainWindow.loadURL('https://radio.garden/search');

  // Wait for the main window to be ready to show
  mainWindow.once('ready-to-show', () => {
    // Close the loading screen after 2 seconds
    setTimeout(() => {
      splashWindow.close();
      // Show the main window
      mainWindow.show();
    }, 2000); // 2000 milliseconds = 2 seconds
  });
});

// Close all windows on macOS when the app is closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, recreate the main window when the dock icon is clicked and no other windows are open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});