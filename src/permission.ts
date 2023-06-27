import browser from 'webextension-polyfill'

const buttonElement = window.document.querySelector('button')!

buttonElement.addEventListener('click', async () => {
  const ok = await browser.permissions.request({ origins: ['*://*/*'] })
  if (ok) {
    window.close()
  }
})
