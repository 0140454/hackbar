import { Directive, DirectiveBinding, Plugin } from 'vue'

function handler(e: Event) {
  e.preventDefault = () => {
    // eslint-disable-next-line no-console
    console.warn('preventDefault call ignored, since it is unexpected')
  }
}

function process(
  el: HTMLElement,
  modifiers: DirectiveBinding['modifiers'],
  action: 'addEventListener' | 'removeEventListener',
) {
  const eventNames = Object.keys(modifiers).filter(name => !!name)
  if (!eventNames.length) {
    throw new TypeError('at least one modifier required')
  }

  eventNames.forEach(name => {
    el[action](name, handler)
  })
}

const directive: Directive<HTMLElement> = {
  mounted: (el, { modifiers }) => {
    process(el, modifiers, 'addEventListener')
  },
  beforeUnmount: (el, { modifiers }) => {
    process(el, modifiers, 'removeEventListener')
  },
}

const plugin: Plugin = {
  install: app => {
    app.directive('disable-prevent-default', directive)
  },
}

export default plugin
