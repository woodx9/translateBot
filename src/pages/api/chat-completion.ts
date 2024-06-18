import { Message } from '@/models'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'

export const config = {
  runtime: 'edge'
}

const handler = async (req: Request): Promise<Response> => {
  try {
    const { messages, language } = (await req.json()) as {
      messages: Message[]
      language: string
    }

    const charLimit = 12000
    let charCount = 0
    let messagesToSend = messages.slice(-1);

    const useAzureOpenAI =
      process.env.AZURE_OPENAI_API_BASE_URL && process.env.AZURE_OPENAI_API_BASE_URL.length > 0

    let apiUrl: string
    let apiKey: string
    let model: string
    if (useAzureOpenAI) {
      let apiBaseUrl = process.env.AZURE_OPENAI_API_BASE_URL
      const version = '2024-02-01'
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || ''
      if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
        apiBaseUrl = apiBaseUrl.slice(0, -1)
      }
      apiUrl = `${apiBaseUrl}/openai/deployments/${deployment}/chat/completions?api-version=${version}`
      apiKey = process.env.AZURE_OPENAI_API_KEY || ''
      model = '' // Azure Open AI always ignores the model and decides based on the deployment name passed through.
    } else {
      let apiBaseUrl = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com'
      if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
        apiBaseUrl = apiBaseUrl.slice(0, -1)
      }
      apiUrl = `${apiBaseUrl}/v1/chat/completions`
      apiKey = process.env.OPENAI_API_KEY || ''
      model = 'gpt-3.5-turbo' // todo: allow this to be passed through from client and support gpt-4
    }
    const stream = await OpenAIStream(apiUrl, apiKey, model, messagesToSend, language)

    return new Response(stream)
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

const OpenAIStream = async (apiUrl: string, apiKey: string, model: string, messages: Message[], language: string) => {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  console.log('targetLanguage: ' + language);
  const res = await fetch(apiUrl, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'api-key': `${apiKey}`
    },
    method: 'POST',
    
    body: JSON.stringify({
      model: model,
      frequency_penalty: 0,
      max_tokens: 4000,
      messages: [
        {
          role: 'system',
          content: `## 角色
          你是一名精通多种语言的翻译机器人，你的任务是把用户说的所有话翻译成用户指定的${language}语言。
          
          ## 技能
          你能够理解并准确翻译用户提供的语段。
          你的翻译应准确无误，符合用户指定的${language}语言的语法和语境规则。
          ## 约束
          在回答用户问题时，你只需要进行语言翻译，不进行任何其他类型的解答和反馈。
          你的翻译必须完全基于用户提供的原始表述，不能添加、省略或更改任何信息。
          如果用户输入的语言和目标语言相通，直接返回用户输入即可，不要输出其他信息
          `
        },
        ...messages
      ],
      presence_penalty: 0,
      stream: true,
      temperature: 0.7,
      top_p: 0.95
    })
  })

  if (res.status !== 200) {
    const statusText = res.statusText
    throw new Error(
      `The OpenAI API has encountered an error with a status code of ${res.status} and message ${statusText}`
    )
  }

  return new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data

          if (data === '[DONE]') {
            controller.close()
            return
          }

          try {
            const json = JSON.parse(data)
            const text = json.choices[0]?.delta.content
            const queue = encoder.encode(text)
            controller.enqueue(queue)
          } catch (e) {
            controller.error(e)
          }
        }
      }

      const parser = createParser(onParse)

      for await (const chunk of res.body as any) {
        const str = decoder.decode(chunk).replace('[DONE]\n', '[DONE]\n\n')
        parser.feed(str)
      }
    }
  })
}
export default handler
