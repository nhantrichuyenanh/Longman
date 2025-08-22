// context menu entry
browser.contextMenus.create({
  title: "LDOCE: %s",
  contexts: ["selection"],
  onclick: (info, tab) => {
    if (info) {
      const selectedText = info.selectionText;
      // replace whitespace with hyphens for LDOCE URL format
      const formattedText = selectedText.trim().replace(/\s+/g, '-');
      const ldoceURL = `https://ldoceonline.com/dictionary/${formattedText}`;
      lookupSelection(selectedText, ldoceURL, tab);
    }
  }
});

// get user preferences from storage with defaults
async function getUserSettings() {
  try {
    const result = await browser.storage.sync.get({
      windowSize: 50,
      aspectRatioWidth: 4,
      aspectRatioHeight: 3,
      openMode: 'window'
    });
    return result;
  } catch (error) {
    console.error('Error retrieving settings:', error);
    return {
      windowSize: 50,
      aspectRatioWidth: 4,
      aspectRatioHeight: 3,
      openMode: 'window'
    };
  }
}

// calculate window dimensions based on user settings
async function calculateWindowDimensions() {
  const settings = await getUserSettings();
  const sizeRatio = settings.windowSize / 100;

  // use available screen size for sizing
  const screenWidth = window.screen.availWidth;
  const screenHeight = window.screen.availHeight;

  let windowWidth = Math.round(screenWidth * sizeRatio);
  let windowHeight = Math.round(windowWidth * (settings.aspectRatioHeight / settings.aspectRatioWidth));

  windowWidth = Math.max(windowWidth, 320);
  windowHeight = Math.max(windowHeight, 240);

  if (windowWidth > screenWidth) {
    windowWidth = screenWidth;
    windowHeight = Math.round(windowWidth * (settings.aspectRatioHeight / settings.aspectRatioWidth));
  }
  if (windowHeight > screenHeight) {
    windowHeight = screenHeight;
    windowWidth = Math.round(windowHeight * (settings.aspectRatioWidth / settings.aspectRatioHeight));
  }

  return { width: windowWidth, height: windowHeight };
}

// resize window based on calculated dimensions
async function onCreated(windowInfo) {
  try {
    const dimensions = await calculateWindowDimensions();
    await browser.windows.update(windowInfo.id, {
      width: dimensions.width,
      height: dimensions.height
    });
  } catch (error) {
    console.error('Error updating window size:', error);
  }
}

// lookup the selected word based on user preferences
async function lookupSelection(text, url, currentTab) {
  if (text) {
    const settings = await getUserSettings();

    if (settings.openMode === 'tab') {
      // open in new tab
      browser.tabs.create({
        url: url,
        active: true
      }).catch(error => {
        console.error(`Error creating tab: ${error}`);
      });
    } else {
      // open in popup window (default behavior)
      browser.windows.create({
        url: url,
        type: "popup"
      }).then(onCreated).catch(error => {
        console.error(`Error creating window: ${error}`);
      });
    }
  }
}