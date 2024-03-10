import browser from 'webextension-polyfill'
import bodyProcessors from '../../processors'

/* Form builder */

const buildForm = (url: string, body: string, selectedEnctype: string) => {
  const form = document.createElement('form')
  const processor = bodyProcessors.find(selectedEnctype)!
  const enctype = processor.getFormEnctype()
  const { fields } = processor.parse(body)

  form.setAttribute('action', url)
  form.setAttribute('method', 'POST')
  form.setAttribute('style', 'display: none;')
  form.setAttribute('enctype', enctype)
  form.setAttribute('autocomplete', 'off')

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

const messageListener = async (message: BrowseRequest) => {
  let response = null

  browser.runtime.onMessage.removeListener(messageListener)

  try {
    let resolver: ((value: void | PromiseLike<void>) => void) | null = null
    let rejecter: ((reason: any) => void) | null = null
    const waitPromise = new Promise<void>((resolve, reject) => {
      resolver = resolve
      rejecter = reject
    })

    const form = buildForm(
      message.url,
      message.body.content,
      message.body.enctype,
    )
    const formPrototype = Object.getPrototypeOf(form) as typeof form

    const cspViolationEventName = 'securitypolicyviolation'
    const windowUnloadEventName = 'unload'
    let violationListener:
      | ((event: WindowEventMap[typeof cspViolationEventName]) => void)
      | null = null
    let unloadListener:
      | ((event: WindowEventMap[typeof windowUnloadEventName]) => void)
      | null = null

    violationListener = event => {
      window.removeEventListener(cspViolationEventName, violationListener!)
      window.removeEventListener(windowUnloadEventName, unloadListener!)

      const violatedPolicy = event.originalPolicy
        .match(`${event.violatedDirective}[^;]+`)!
        .toString()
      const errorMessage =
        `Failed to send data to '${event.blockedURI}' because it violates the following ` +
        `Content Security Policy directive: "${violatedPolicy}". You can execute the request ` +
        `again after going to a page without directive "${violatedPolicy}". ` +
        `For example, https://www.google.com`

      rejecter!(new Error(errorMessage))
    }
    unloadListener = () => {
      window.removeEventListener(cspViolationEventName, violationListener!)
      window.removeEventListener(windowUnloadEventName, unloadListener!)

      resolver!()
    }

    window.addEventListener(cspViolationEventName, violationListener)
    window.addEventListener(windowUnloadEventName, unloadListener)

    document.body.appendChild(form)
    formPrototype.submit.call(form)
    document.body.removeChild(form)

    await waitPromise
  } catch (error) {
    response = (error as Error).message
  }

  return Promise.resolve(response)
}

browser.runtime.onMessage.addListener(messageListener)
