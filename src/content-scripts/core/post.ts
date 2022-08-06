import browser from 'webextension-polyfill'
import bodyProcessors from '../../processors'

/* Form builder */

const buildForm = (url: string, body: string, selectedEnctype: string) => {
  const form = document.createElement('form')
  const processor = bodyProcessors.find(selectedEnctype)!
  const enctype = processor.getFormEnctype()
  const fields = processor.parse(body)

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
  }

  return Promise.resolve(response)
}

browser.runtime.onMessage.addListener(messageListener)
