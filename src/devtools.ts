import browser from 'webextension-polyfill'

browser.devtools.panels.create('HackBar', 'icon.png', 'main.html')
