import readline from 'readline'

export type ArrowKeys = (typeof ARROW_KEYS)[number]
const ARROW_KEYS = ['up', 'down', 'left', 'right'] as const

export class Reader {
  readonly buffer: string[] = []
  newLinePromise: ReturnType<typeof Promise.withResolvers<string>> | undefined = undefined
  nextArrowPromise: ReturnType<typeof Promise.withResolvers<ArrowKeys>> | undefined = undefined
  readUntilKey: string[] | undefined
  readNextPromise: ReturnType<typeof Promise.withResolvers<string>> | undefined = undefined

  constructor() {}

  readNextLine(): Promise<string> {
    this.newLinePromise = Promise.withResolvers()
    return this.newLinePromise.promise
  }

  readNextArrow(): Promise<ArrowKeys> {
    this.nextArrowPromise = Promise.withResolvers()
    return this.nextArrowPromise.promise
  }

  readNext(keys: string[]): Promise<string> {
    this.readUntilKey = keys
    this.readNextPromise = Promise.withResolvers()
    return this.readNextPromise.promise
  }

  start() {
    readline.emitKeypressEvents(process.stdin)

    process.stdin.setRawMode(true)

    process.stdin.on('keypress', (_str, key) => this.handleKeyPress(key))
  }

  handleKeyPress = (key: readline.Key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit()
    }
    if (this.readUntilKey && key.name && this.readUntilKey.includes(key.name)) {
      this.readNextPromise?.resolve(key.name)
      this.readNextPromise = undefined
    } else if (key.name === 'backspace') {
      this.buffer.pop()
    } else if (key.name === 'return') {
      if (this.newLinePromise) {
        this.newLinePromise?.resolve(this.buffer.join())
        this.buffer.length = 0
        this.newLinePromise = undefined
      }
    } else if (key.name && ARROW_KEYS.includes(key.name as ArrowKeys)) {
      if (this.nextArrowPromise) {
        this.nextArrowPromise.resolve(key.name as ArrowKeys)
        this.nextArrowPromise = undefined
      }
    } else if (key.sequence) {
      this.buffer.push(key.sequence)
    }
    console.log(key.name) // 'up', 'down', 'left', 'right'  }
  }
}
