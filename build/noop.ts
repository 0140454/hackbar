export default new Proxy(
  {},
  {
    get(target, property, receiver) {
      const fn = () => receiver
      Object.setPrototypeOf(fn, receiver)
      return fn
    },
  },
)
