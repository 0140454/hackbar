/* UI */

type Preferences = {
  darkThemeEnabled: boolean
}

/* Request */

type Header = {
  enabled: boolean
  name: string
  value: string
  removeIfEmptyValue: boolean
  _createdAt: number
}

type BrowseRequest = {
  method: string
  url: string
  body: {
    enctype: string
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

type PostInfo = {
  contentTypeArguments: Record<string, string>
  fields: Array<PostField>
}

type TestRequest = {
  action: 'start' | 'toggle' | 'stop'
  script?: string
  argument: any
}

type BackgroundFunctionType = 'init' | 'load' | 'execute' | 'test'

interface BackgroundFunctionMessage {
  tabId: number
  type: BackgroundFunctionType
}

interface BackgroundInitMessage extends BackgroundFunctionMessage {
  type: Extract<BackgroundFunctionType, 'init'>
}

interface BackgroundLoadMessage extends BackgroundFunctionMessage {
  type: Extract<BackgroundFunctionType, 'load'>
}

interface BackgroundExecuteMessage extends BackgroundFunctionMessage {
  type: Extract<BackgroundFunctionType, 'execute'>
  data: {
    rawMode: boolean
    request: BrowseRequest
  }
}

interface BackgroundTestMessage extends BackgroundFunctionMessage {
  type: Extract<BackgroundFunctionType, 'test'>
  data: TestRequest
}

/* Response */

type BrowseResponse = {
  statusCode: number
  statusMessage: string
  headers: Array<{ name: string; value: string }>
  body: string
}

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

type DevtoolsFunctionType = 'load' | 'execute' | 'test' | 'command' | 'error'

interface DevtoolsFunctionMessage {
  type: DevtoolsFunctionType
}

interface DevtoolsLoadMessage extends DevtoolsFunctionMessage {
  type: Extract<DevtoolsFunctionType, 'load'>
  data: BrowseRequest | undefined
}

interface DevtoolsExecuteMessage extends DevtoolsFunctionMessage {
  type: Extract<DevtoolsFunctionType, 'execute'>
  data: BrowseResponse
}

interface DevtoolsCommandMessage extends DevtoolsFunctionMessage {
  type: Extract<DevtoolsFunctionType, 'command'>
  data: string
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
