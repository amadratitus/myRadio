require('dotenv').config(); // Load environment variables from .env file
const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const checkInternetConnected = require('check-internet-connected');

// Configure auto-updater
autoUpdater.autoDownload = true; // Enable auto-download
autoUpdater.allowPrerelease = true; // Allow pre-release versions for development updates


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
    icon: path.join(__dirname, './res/images/', 'myRadioIcon.png')
  });
  splashWindow.loadFile('splash.html');
  splashWindow.setResizable(false);
  splashWindow.setMenu(null);

  // Check for internet connectivity periodically
  setInterval(async () => {
    try {
      await checkInternetConnected();
    } catch (error) {
      // Load the error page if there's no internet connection
      mainWindow.loadFile('error.html');
    }
  }, 1000); // Check every second

  // Create the main window initially hidden
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false, // Initially hide the window
    // Other window options...
    icon: path.join(__dirname, './res/images/', 'myRadioIcon.png')
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

  // Listen for update events
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
  });

  autoUpdater.on('update-not-available', () => {
    console.log('Update not available.');
  });

  autoUpdater.on('error', (error) => {
    console.error('Update error:', error.message);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log('Download progress:', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    autoUpdater.quitAndInstall();
  });

  // Trigger the update check
  autoUpdater.checkForUpdates();
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