/* UI */

type Preferences = {
  darkThemeEnabled: boolean
}

/* Request */

type Header = {
  enabled: boolean
  name: string
  value: string
  _createdAt: number
}

type BrowseRequest = {
  url: string
  body: {
    enabled: boolean
    enctype: SupportedEnctype
    content: string
  }
  headers: Array<Header>
}

type PostFile = {
  name: string
  type: string
  data: Blob
}

type TextPostField = {
  type: 'input' | 'textarea'
  name: string
  value: string
}

type FilePostField = {
  type: 'file'
  name: string
  file: PostFile
}

type PostField = TextPostField | FilePostField

type TestRequest = {
  action: 'start' | 'toggle' | 'stop'
  script: string
  argument: any
}

type BackgroundFunctionType = 'load' | 'execute' | 'test'

interface BackgroundFunctionMessage {
  tabId: number
  type: BackgroundFunctionType
}

interface BackgroundLoadMessage extends BackgroundFunctionMessage {
  type: Extract<BackgroundFunctionType, 'load'>
  data: never
}

interface BackgroundExecuteMessage extends BackgroundFunctionMessage {
  type: Extract<BackgroundFunctionType, 'execute'>
  data: BrowseRequest
}

interface BackgroundTestMessage extends BackgroundFunctionMessage {
  type: Extract<BackgroundFunctionType, 'test'>
  data: TestRequest
}

/* Response */

type TestProgress = {
  status: string
  percentage: number
}

type TestResultData = Record<string, string>

type TestResult = {
  header: Array<{
    text: string
    value: string
  }>
  data: Array<TestResultData>
}

type DevtoolsFunctionType = 'load' | 'test' | 'command' | 'error'

interface DevtoolsFunctionMessage {
  type: DevtoolsFunctionType
}

interface DevtoolsLoadMessage extends DevtoolsFunctionMessage {
  type: Extract<DevtoolsFunctionType, 'load'>
  data: BrowseRequest | undefined
}

interface DevtoolsCommandMessage extends DevtoolsFunctionMessage {
  type: Extract<DevtoolsFunctionType, 'command'>
  data: 'load_url' | 'split_url' | 'execute_url'
}

interface DevtoolsErrorMessage extends DevtoolsFunctionMessage {
  type: Extract<DevtoolsFunctionType, 'error'>
  data: string
}

interface DevtoolsTestMessage extends DevtoolsFunctionMessage {
  type: Extract<DevtoolsFunctionType, 'test'>
  data:
    | {
        type: 'progress'
        data: TestProgress
      }
    | {
        type: 'finished'
        data: TestResult
      }
    | {
        type: 'error'
        data: string
      }
}
