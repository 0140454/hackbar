(() => {
  /* Body parser */

  const jsonParser = function (body) {
    const result = []

    const trashName = Math.random().toString(36).slice(2)
    const json = JSON.parse(body)

    if (Array.isArray(json)) {
      json.push(JSON.parse(`{ "${trashName}": "=" }`))
    } else {
      json[trashName] = '='
    }

    const stringified = JSON.stringify(json)
    const delimiterIndex = stringified.indexOf(`"${trashName}":"="`)
    const name = stringified.substring(0, delimiterIndex + trashName.length + 4)
    const value = stringified.substring(delimiterIndex + trashName.length + 5)

    result.push({
      type: 'input',
      name: name,
      value: value
    })

    return result
  }

  const multipartParser = function (body) {
    const result = []

    const boundary = body.split('\n', 1)[0].trim()
    const parts = body.split(boundary)

    for (let idx = 1; idx < parts.length - 1; idx++) {
      const data = {}
      const crlf = parts[idx].indexOf('\r\n\r\n') !== -1
      const delimiterIndex = parts[idx].indexOf((crlf) ? '\r\n\r\n' : '\n\n')

      const header = parts[idx].substring(0, delimiterIndex)
      const content = parts[idx].substring(delimiterIndex + ((crlf) ? 4 : 2))

      let matched = null
      let regex = RegExp('(name|filename)=(?:"([^"]+)"|([^;]+))', 'gi')
      while ((matched = regex.exec(header)) !== null) {
        if (matched[1].toLowerCase() === 'name') {
          data.name = matched[2] || matched[3]
        } else {
          data.file = data.file || {}
          data.type = 'file'
          data.file.name = matched[2] || matched[3]
        }
      }

      data.type = data.type || 'input'
      if (data.type === 'input') {
        data.value = content.substring(0, content.length - 1 - crlf)
      } else {
        matched = header.match(/content-type:\s([^\r\n]+)/i)
        data.file.type = (matched !== null) ? matched[1] : ''
        data.file.data = new Blob(
          [content.substring(0, content.length - 1 - crlf)])
      }

      result.push(data)
    }

    return result
  }

  const urlencodedParser = function (body) {
    const result = []

    body.split('&').forEach(function (field) {
      field = field.replace(/[\r\n]/g, '')

      const delimiterIndex = field.indexOf('=')
      const name = field.substring(0, delimiterIndex).replace(/\+/g, ' ')
      const value = field.substring(delimiterIndex + 1).replace(/\+/g, ' ')

      result.push({
        type: 'input',
        name: decodeURIComponent(name),
        value: decodeURIComponent(value)
      })
    })

    return result
  }

  const parser = {
    'application/json': jsonParser,
    'multipart/form-data': multipartParser,
    'application/x-www-form-urlencoded': urlencodedParser
  }

  /* Form builder */

  const buildForm = (url, body, enctype) => {
    const form = document.createElement('form')

    form.action = url
    form.method = 'POST'
    form.style = 'display: none;'
    form.enctype = (enctype === 'application/json') ? 'text/plain' : enctype

    parser[enctype](body).forEach(function (field) {
      const input = document.createElement(
        (field.type === 'file') ? 'input' : 'textarea')

      input.setAttribute('name', field.name)
      if (field.type === 'file') {
        const dataTransfer = new DataTransfer()

        dataTransfer.items.add(new File([field.file.data], field.file.name, {
          type: field.file.type
        }))

        input.setAttribute('type', 'file')
        input.files = dataTransfer.files
      } else {
        input.textContent = field.value
      }

      form.appendChild(input)
    })

    return form
  }

  /* Message listener */

  const messageListener = function (message, sender, sendResponse) {
    let response = null

    chrome.runtime.onMessage.removeListener(messageListener)

    try {
      const form = buildForm(message.url, message.body.content, message.body.enctype)

      document.body.appendChild(form)
      form.submit()
    } catch (error) {
      response = error.message
    } finally {
      sendResponse(response)
    }
  }

  chrome.runtime.onMessage.addListener(messageListener)
})()
