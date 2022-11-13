declare class Highlight {
  constructor(..._: Array<Range>) {}
}

declare namespace CSS {
  export const highlights: Map<string, Highlight>
}
