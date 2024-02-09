const { app, BrowserWindow } = require('electron');
const path = require('path');
const checkInternetConnected = require('check-internet-connected');
const { updateElectronApp } = require('update-electron-app');
const logger = require('electron-log');

let mainWindow;
let isOnline = true; // Flag to track online/offline status

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
  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.setResizable(false);
  splashWindow.setMenu(null);

  // Bring the splash window to the front immediately
  splashWindow.focus();

  // Create the main window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false, // Initially hide the window
    icon: path.join(__dirname, './res/images/', 'myRadioIcon.png')
  });
  mainWindow.setMenu(null);
  mainWindow.setResizable(true); // Allow resizing initially
  mainWindow.setMinimumSize(800, 600); // Example minimum size

  // Load the URL
  mainWindow.loadURL('https://radio.garden/search');

  // Wait for the main window to be ready to show
  mainWindow.once('ready-to-show', () => {
    // Close the loading screen after 3 seconds
    setTimeout(() => {
      splashWindow.close();
      // Show the main window
      mainWindow.show();
    }, 3000);
  });

  // Load auto update
  updateElectronApp({
    updateInterval: '5 minutes',
    logger: logger
  });

  // Function to handle internet connection status change
  const handleConnectionChange = () => {
    if (!isOnline) {
      mainWindow.loadURL('https://radio.garden/search');
      isOnline = true;
    }
  };

  // Check for internet connectivity periodically
  const internetCheckInterval = setInterval(async () => {
    try {
      await checkInternetConnected();
      // Connection is online
      if (!isOnline) {
        handleConnectionChange();
      }
    } catch (error) {
      // Connection is offline
      if (isOnline) {
        mainWindow.loadFile(path.join(__dirname, 'error.html'));
        isOnline = false;
      }
    }
  }, 500);

  // Handle window closed event
  mainWindow.on('closed', () => {
    // Clear interval checks
    clearInterval(internetCheckInterval);
    // Dereference the window object
    mainWindow = null;
    // Quit the app when all windows are closed
    app.quit();
  });
});

// On macOS, recreate the main window when the dock icon is clicked and no other windows are open
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // Create a new main window if none exists
    createWindow();
  }
});