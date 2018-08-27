const unescapeHtml = function (html) {
  if (typeof html === 'undefined') {
    return ''
  }

  return html
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#10;/g, '\n')
    .replace(/&#13;/g, '\r')
}

const form = document.createElement('form')
form.action = decodeURIComponent(url)
form.method = 'POST'
form.style = 'display: none;'

unescapeHtml(body).split('&').forEach(function (escaped) {
  if (escaped.split('=').length !== 2) {
    return
  }

  const name = decodeURIComponent(escaped.split('=')[0].trim())
  const value = decodeURIComponent(escaped.split('=')[1].trim())

  const input = document.createElement('textarea')
  input.setAttribute('name', name)
  input.textContent = value

  form.appendChild(input)
})

document.body.appendChild(form)
form.submit()
