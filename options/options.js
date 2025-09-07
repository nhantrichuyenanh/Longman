// el
const windowSizeSlider = document.getElementById('windowSize');
const sizeDisplay = document.getElementById('sizeDisplay');
const aspectWidthInput = document.getElementById('aspectWidth');
const aspectHeightInput = document.getElementById('aspectHeight');
const modeWindowRadio = document.getElementById('modeWindow');
const modeTabRadio = document.getElementById('modeTab');
const windowSettings = document.getElementById('windowSettings');
const languageRadios = document.querySelectorAll('input[name="language"]');
const languageOptions = document.querySelectorAll('.language-option');
const siteLocaleRadios = document.querySelectorAll('input[name="siteLocale"]');

document.addEventListener('DOMContentLoaded', loadSettings);
windowSizeSlider.addEventListener('input', handleSizeChange);
aspectWidthInput.addEventListener('input', handleRatioChange);
aspectHeightInput.addEventListener('input', handleRatioChange);
modeWindowRadio.addEventListener('change', handleModeChange);
modeTabRadio.addEventListener('change', handleModeChange);
languageRadios.forEach(radio => {radio.addEventListener('change', handleLanguageChange);});
siteLocaleRadios.forEach(r => r.addEventListener('change', handleSiteLocaleChange));

async function loadSettings() {
    try {
        const settings = await browser.storage.sync.get({
            windowSize: 35,
            aspectRatioWidth: 2,
            aspectRatioHeight: 3,
            openMode: 'window',
            language: 'en',
            siteLocale: 'en'
        });

        windowSizeSlider.value = settings.windowSize;
        sizeDisplay.textContent = settings.windowSize + '%';
        aspectWidthInput.value = settings.aspectRatioWidth;
        aspectHeightInput.value = settings.aspectRatioHeight;

        if (settings.openMode === 'tab') {
            modeTabRadio.checked = true;
            modeWindowRadio.checked = false;
        } else {
            modeWindowRadio.checked = true;
            modeTabRadio.checked = false;
        }

        const selectedLanguageRadio = document.querySelector(`input[name="language"][value="${settings.language}"]`);
        if (selectedLanguageRadio) {
            selectedLanguageRadio.checked = true;
            updateLanguageSelection(settings.language);
        }

        const selectedSiteRadio = document.querySelector(`input[name="siteLocale"][value="${settings.siteLocale}"]`);
        if (selectedSiteRadio) {
            selectedSiteRadio.checked = true;
        }

        updateWindowSettingsVisibility(settings.openMode);
    } catch (error) {
    }
}

function handleLanguageChange() {
    const selectedLanguage = document.querySelector('input[name="language"]:checked').value;
    updateLanguageSelection(selectedLanguage);
    saveSettings();
}

function handleSiteLocaleChange() {
    saveSettings();
}

function updateLanguageSelection(selectedLanguage) {
    languageOptions.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        if (radio.value === selectedLanguage) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function handleModeChange() {
    const selectedMode = modeWindowRadio.checked ? 'window' : 'tab';
    updateWindowSettingsVisibility(selectedMode);
    saveSettings();
}

function updateWindowSettingsVisibility(mode) {
    if (mode === 'window') {
        windowSettings.classList.remove('hidden');
    } else {
        windowSettings.classList.add('hidden');
    }
}

function handleSizeChange() {
    const size = windowSizeSlider.value;
    sizeDisplay.textContent = size + '%';
    saveSettings();
}

function handleRatioChange() {
    const width = Math.max(0.1, parseFloat(aspectWidthInput.value) || 1);
    const height = Math.max(0.1, parseFloat(aspectHeightInput.value) || 1);

    aspectWidthInput.value = width;
    aspectHeightInput.value = height;

    saveSettings();
}

async function saveSettings() {
    try {
        const selectedMode = modeWindowRadio.checked ? 'window' : 'tab';
        const selectedLanguage = document.querySelector('input[name="language"]:checked').value;
        const selectedSiteLocale = document.querySelector('input[name="siteLocale"]:checked').value;

        const settings = {
            windowSize: parseInt(windowSizeSlider.value),
            aspectRatioWidth: parseFloat(aspectWidthInput.value),
            aspectRatioHeight: parseFloat(aspectHeightInput.value),
            openMode: selectedMode,
            language: selectedLanguage,
            siteLocale: selectedSiteLocale
        };

        await browser.storage.sync.set(settings);
    } catch (error) {
    }
}