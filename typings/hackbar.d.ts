type Header = {
  enabled: boolean
  name: string
  value: string
}

type BrowseRequest = {
  url: string
  body: {
    enabled: boolean
    enctype: string
    content: string
  }
  headers: Array<Header>
}

type TestRequest = {
  action: string
  script: string
  argument: any
}

type MessageType = 'load' | 'execute' | 'test'

interface Message {
  tabId: number
  type: MessageType
}

interface LoadMessage extends Message {
  data: never
}

interface ExecuteMessage extends Message {
  data: BrowseRequest
}

interface TestMessage extends Message {
  data: TestRequest
}
