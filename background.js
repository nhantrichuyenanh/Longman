browser.contextMenus.create({
  title: "LDOCE: %s",
  contexts: ["selection"],
  onclick: (info, tab) => {
    if (info) {
      const selectedText = info.selectionText;
      lookupSelection(selectedText, tab);
    }
  }
});

async function getUserSettings() {
  try {
    const result = await browser.storage.sync.get({
      windowSize: 50,
      aspectRatioWidth: 4,
      aspectRatioHeight: 3,
      openMode: 'window',
      language: 'en',
      siteLocale: 'en'
    });
    return result;
  } catch (error) {
    return {
      windowSize: 35,
      aspectRatioWidth: 2,
      aspectRatioHeight: 3,
      openMode: 'window',
      language: 'en',
      siteLocale: 'en'
    };
  }
}

function generateLdoceUrl(text, dictLanguage, siteLocale) {
  // replace whitespace with hyphens for LDOCE URL format
  const formattedText = text.trim().replace(/\s+/g, '-');

  const pathMap = {
    'en': `/dictionary/${formattedText}`,
    'en-ja': `/dictionary/english-japanese/${formattedText}`,
    'en-ko': `/dictionary/english-korean/${formattedText}`,
    'en-es': `/dictionary/english-spanish/${formattedText}`,
    'ja-en': `/dictionary/japanese-english/${formattedText}`,
    'es-en': `/dictionary/spanish-english/${formattedText}`
  };

  const path = pathMap[dictLanguage] || pathMap['en'];

  const localePrefixMap = {
    'en': '',
    'jp': '/jp',
    'es-LA': '/es-LA',
    'ko': '/ko'
  };

  const prefix = localePrefixMap[siteLocale] !== undefined ? localePrefixMap[siteLocale] : '';

  return `https://www.ldoceonline.com${prefix}${path}`;
}

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
  }
}

// lookup the selected word based on user preferences
async function lookupSelection(text, currentTab) {
  if (text) {
    const settings = await getUserSettings();
    // pass both dictionary type and site locale
    const url = generateLdoceUrl(text, settings.language, settings.siteLocale);

    if (settings.openMode === 'tab') {
      // open in new tab
      browser.tabs.create({
        url: url,
        active: true
      }).catch(error => {
      });
    } else {
      // open in popup window (default behavior)
      browser.windows.create({
        url: url,
        type: "popup"
      }).then(onCreated).catch(error => {
      });
    }
  }
}