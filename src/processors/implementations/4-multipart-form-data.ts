import { BodyProcessor } from '../processor'

export default class MultipartFormDataProcessor extends BodyProcessor {
  getName() {
    return 'multipart/form-data'
  }

  getFormEnctype() {
    return 'multipart/form-data'
  }

  getHttpContentType() {
    return 'multipart/form-data'
  }

  parse(body: string) {
    const fields = [] as Array<PostField>

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
        fileField.file.type = matched?.[1] || 'application/octet-stream'
        fileField.file.data = new Blob([
          content.substring(0, content.length - 1 - Number(crlf)),
        ])
      }

      fields.push(field)
    }

    return {
      contentTypeArguments: {
        boundary,
      },
      fields,
    }
  }

  format(body: string) {
    return body
  }
}
