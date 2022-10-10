import { BodyProcessor } from './processor'

const constructors = Object.entries(
  import.meta.glob<new () => BodyProcessor>('./implementations/*.ts', {
    eager: true,
    import: 'default',
  }),
)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(e => e[1])

class BodyProcessors {
  #registeredProcessors: Array<BodyProcessor> = []

  constructor() {
    this.#registeredProcessors.push(...constructors.map(c => new c()))
  }

  find(name: string) {
    return this.#registeredProcessors.find(
      processor => processor.getName() === name,
    )
  }

  findByContentType(contentType: string) {
    const pureContentType = contentType.split(';', 1)[0].trim()

    return this.#registeredProcessors.find(
      processor => processor.getHttpContentType() === pureContentType,
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
