import UrlencodedFormDataProcessor from './1-application-x-www-form-urlencoded'

export default class RawUrlencodedFormDataProcessor extends UrlencodedFormDataProcessor {
  getName() {
    return 'application/x-www-form-urlencoded (raw)'
  }

  getFormEnctype() {
    return 'text/plain'
  }

  parse(body: string) {
    const fields = [] as Array<PostField>

    const tempFields: Array<string> = []
    body.split('&').forEach(field => {
      tempFields.push(field.replace(/[\r\n]/g, ''))
    })

    const finalBody = tempFields.join('&')
    const delimiterIndex = finalBody.indexOf('=')
    const name = finalBody.substring(0, delimiterIndex)
    const value = finalBody.substring(delimiterIndex + 1)

    fields.push({
      type: 'input',
      name: name,
      value: value,
    })

    return fields
  }
}
