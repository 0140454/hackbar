import { BodyProcessor } from './processor'

export default class JsonProcessor extends BodyProcessor {
  getName() {
    return 'application/json'
  }

  getFormEnctype() {
    return 'application/json'
  }

  getHttpContentType() {
    return 'application/json'
  }

  parse(body: string) {
    const fields = [] as Array<PostField>

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
      fields.push({
        type: 'input',
        name: name,
        value: value,
      })
    } else {
      const delimiterIndex = body.indexOf('=')
      const name = body.substring(0, delimiterIndex)
      const value = body.substring(delimiterIndex + 1)
      fields.push({
        type: 'input',
        name: name,
        value: value,
      })
    }

    return fields
  }

  format(body: string) {
    try {
      const parsed = JSON.parse(body)
      return JSON.stringify(parsed, undefined, 2)
    } catch (_) {
      return body
    }
  }
}
