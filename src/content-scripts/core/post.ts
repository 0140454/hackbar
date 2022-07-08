import browser from 'webextension-polyfill'
import type { SupportedEnctype } from '../../utils/constants'

/* Body parser */

const jsonParser = (body: string) => {
  const result = {
    enctype: 'text/plain',
    fields: [] as Array<PostField>,
  }

  body = body.trim()
  // Test JSON syntax first
  JSON.parse(body)

  if (!body.includes('=')) {
    const trashName = Math.random().toString(36).slice(2)
    let trash
    if (body.at(-1) === '}') {
      trash = `,"${trashName}":"="}`
    } else if (body.at(-1) === ']') {
      trash = `,"${trashName}="]`
    } else {
      throw new Error('Body must be a JSON object or array')
    }

    const stringified = body.slice(0, -1) + trash
    const delimiterIndex = stringified.indexOf(trash) + trash.indexOf('=')
    const name = stringified.substring(0, delimiterIndex)
    const value = stringified.substring(delimiterIndex + 1)
    result.fields.push({
      type: 'input',
      name: name,
      value: value,
    })
  } else {
    const delimiterIndex = body.indexOf('=')
    const name = body.substring(0, delimiterIndex)
    const value = body.substring(delimiterIndex + 1)
    result.fields.push({
      type: 'input',
      name: name,
      value: value,
    })
  }

  return result
}

const multipartParser = (body: string) => {
  const result = {
    enctype: 'multipart/form-data',
    fields: [] as Array<PostField>,
  }

  const boundary = body.split('\n', 1)[0].trim()
  const parts = body.split(boundary)

  for (let idx = 1; idx < parts.length - 1; idx++) {
    const field = {} as PostField
    const crlf = parts[idx].indexOf('\r\n\r\n') !== -1
    const delimiterIndex = parts[idx].indexOf(crlf ? '\r\n\r\n' : '\n\n')

    const header = parts[idx].substring(0, delimiterIndex)
    const content = parts[idx].substring(delimiterIndex + (crlf ? 4 : 2))

    let matched = null
    const regex = RegExp('(name|filename)=(?:"([^"]+)"|([^;]+))', 'gi')
    while ((matched = regex.exec(header)) !== null) {
      if (matched[1].toLowerCase() === 'name') {
        field.name = matched[2] || matched[3]
      } else {
        const fileField = field as FilePostField

        fileField.type = 'file'
        fileField.file = fileField.file || {}
        fileField.file.name = matched[2] || matched[3]
      }
    }

    field.type = field.type || 'input'
    if (field.type === 'input') {
      field.value = content.substring(0, content.length - 1 - Number(crlf))
    } else {
      const fileField = field as FilePostField

      matched = header.match(/content-type:\s([^\r\n]+)/i)
      fileField.file.type = matched !== null ? matched[1] : ''
      fileField.file.data = new Blob([
        content.substring(0, content.length - 1 - Number(crlf)),
      ])
    }

    result.fields.push(field)
  }

  return result
}

const urlencodedParser = (body: string) => {
  const result = {
    enctype: 'application/x-www-form-urlencoded',
    fields: [] as Array<PostField>,
  }

  body.split('&').forEach(field => {
    field = field.replace(/[\r\n]/g, '')

    const delimiterIndex = field.indexOf('=')
    const name = field.substring(0, delimiterIndex).replace(/\+/g, ' ')
    const value = field.substring(delimiterIndex + 1).replace(/\+/g, ' ')

    result.fields.push({
      type: 'input',
      name: decodeURIComponent(name),
      value: decodeURIComponent(value),
    })
  })

  return result
}

const urlencodedRawParser = (body: string) => {
  const result = {
    enctype: 'text/plain',
    fields: [] as Array<PostField>,
  }

  const tempFields: Array<string> = []
  body.split('&').forEach(field => {
    tempFields.push(field.replace(/[\r\n]/g, ''))
  })

  const finalBody = tempFields.join('&')
  const delimiterIndex = finalBody.indexOf('=')
  const name = finalBody.substring(0, delimiterIndex)
  const value = finalBody.substring(delimiterIndex + 1)

  result.fields.push({
    type: 'input',
    name: name,
    value: value,
  })

  return result
}

const parser: Record<
  SupportedEnctype,
  (body: string) => {
    enctype: string
    fields: Array<PostField>
  }
> = {
  'application/json': jsonParser,
  'multipart/form-data': multipartParser,
  'application/x-www-form-urlencoded': urlencodedParser,
  'application/x-www-form-urlencoded (raw)': urlencodedRawParser,
}

/* Form builder */

const buildForm = (
  url: string,
  body: string,
  selectedEnctype: SupportedEnctype,
) => {
  const form = document.createElement('form')
  const { enctype, fields } = parser[selectedEnctype](body)

  form.setAttribute('action', url)
  form.setAttribute('method', 'POST')
  form.setAttribute('style', 'display: none;')
  form.setAttribute('enctype', enctype)

  fields.forEach(field => {
    const input = document.createElement(
      field.type === 'file' ? 'input' : 'textarea',
    )

    input.setAttribute('name', field.name)
    if (field.type === 'file') {
      const fileInput = input as HTMLInputElement
      const dataTransfer = new DataTransfer()

      dataTransfer.items.add(
        new File([field.file.data], field.file.name, {
          type: field.file.type,
        }),
      )

      fileInput.setAttribute('type', 'file')
      fileInput.files = dataTransfer.files
    } else {
      input.textContent = field.value
    }

    form.appendChild(input)
  })

  return form
}

/* Message listener */

const messageListener = (message: BrowseRequest) => {
  let response = null

  browser.runtime.onMessage.removeListener(messageListener)

  try {
    const form = buildForm(
      message.url,
      message.body.content,
      message.body.enctype,
    )

    document.body.appendChild(form)
    form.submit()
  } catch (error) {
    response = (error as Error).message
  } finally {
    // empty block
  }

  return Promise.resolve(response)
}

browser.runtime.onMessage.addListener(messageListener)
