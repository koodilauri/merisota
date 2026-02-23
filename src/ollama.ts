import { ChatMessage, ChatOptions} from './types'

export async function ollamaChat(messages: ChatMessage[], options: ChatOptions): Promise<string> {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: options.model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? 0
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.message.content
}

export async function getMove(systemPrompt: string, coordinates: [number, number][], previousShot: string) {
  const result = await ollamaChat(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: `State:\n${JSON.stringify(coordinates)}\nPrevous shot:\n${JSON.stringify(previousShot)}\nSelect next shot.` }
    ],
    { model: "llama3", temperature: 0 }
  );

  const parsed = JSON.parse(result);
  return parsed.shot;
}