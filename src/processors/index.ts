import JsonProcessor from './application-json'
import UrlencodedFormDataProcessor from './application-x-www-form-urlencoded'
import RawUrlencodedFormDataProcessor from './application-x-www-form-urlencoded-raw'
import MultipartFormDataProcessor from './multipart-form-data'
import { BodyProcessor } from './processor'

class BodyProcessors {
  #registeredProcessors: Array<BodyProcessor> = []

  constructor() {
    this.#registeredProcessors.push(
      new UrlencodedFormDataProcessor(),
      new RawUrlencodedFormDataProcessor(),
      new JsonProcessor(),
      new MultipartFormDataProcessor(),
    )
  }

  find(name: string) {
    return this.#registeredProcessors.find(
      processor => processor.getName() === name,
    )
  }

  findByContentType(contentType: string) {
    return this.#registeredProcessors.find(
      processor => processor.getHttpContentType() === contentType,
    )
  }

  getProcessors() {
    return this.#registeredProcessors
  }

  getNames() {
    return this.#registeredProcessors.map(processor => processor.getName())
  }

  getDefaultProcessor() {
    return this.#registeredProcessors.at(0)!
  }

  getDefaultProcessorName() {
    return this.getDefaultProcessor().getName()
  }

  getDefaultProcessorFormEnctype() {
    return this.getDefaultProcessor().getFormEnctype()
  }

  getDefaultProcessorHttpContentType() {
    return this.getDefaultProcessor().getHttpContentType()
  }
}

const bodyProcessors = new BodyProcessors()

export default bodyProcessors
