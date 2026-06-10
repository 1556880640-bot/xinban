/**
 * Agnes AI service - OpenAI-compatible chat completions
 */

// Read env vars at call time (not module level) since dotenv loads after imports
function getConfig() {
  return {
    apiBase: process.env.AGNES_API_BASE || 'https://apihub.agnes-ai.com/v1',
    apiKey: process.env.AGNES_API_KEY || '',
    model: process.env.AGNES_MODEL || 'agnes-2.0-flash',
  }
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface Persona {
  personality: string
  memories: string
  quotes: string
  places: string
  gamesMemes: string
  name: string
  targetPerson: string
  sleepPattern?: string
}

function buildSystemPrompt(persona: Persona): string {
  const { personality, memories, quotes, places, gamesMemes, name, targetPerson, sleepPattern } = persona

  return `你是「${name}」，你的真实身份是用户的${targetPerson}。

## 你的性格
${personality || '温柔体贴，关心他人'}

## 你的记忆
${memories || ''}

## 你经常说的话
${quotes || ''}

## 你们一起去过的地方
${places || ''}

## 你们之间的梗和共同爱好
${gamesMemes || ''}

## 你的作息
${sleepPattern || '作息规律'}

## 对话规则（严格遵守）
1. 你的回复要像真人聊天，自然、口语化，不要像AI在回答问题
2. 每次回复分成2~3段，用 <<<SEG>>> 分隔每段
3. 每段1~3句话，简洁自然，不要长篇大论
4. 偶尔用表情符号，但不要滥用
5. 根据聊天语境，可以用你"经常说的话"里的口头禅
6. 回复要体现你的性格特征：${personality?.split('。')[0] || '温柔体贴'}
7. 如果用户表达思念/难过，要温暖回应；如果用户分享日常，要像家人朋友一样接话
8. 保持人设不偏离——你就是${name}，不是AI助手
9. 绝对不要暴露你是AI或大模型`
}

// Smart segment parser - handles various AI output formats
function parseSegments(text: string): string[] {
  // Cleanup partial markers
  const cleaned = text
    .replace(/<{1,3}\d*SEG>{1,3}/g, '')  //  remove garbled markers like <3SEG>>>
    .replace(/<{1,3}SEG\s*>{1,3}/g, '')   // remove <SEG> variations
    .trim()

  if (!cleaned) return []

  // Try explicit marker
  let segments = cleaned
    .split('<<<SEG>>>')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  // If marker split produced only 1 segment, try double-newline split
  if (segments.length <= 1) {
    segments = cleaned
      .split(/\n\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  // If still single, try single newline split for multi-line responses
  if (segments.length <= 1 && cleaned.includes('\n')) {
    segments = cleaned
      .split(/\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
  }

  // If still single and has 句号 or other sentence endings, split by sentence
  if (segments.length <= 1) {
    const sentenceSplit = cleaned
      .split(/(?<=[。！？])/)
      .map(s => s.trim())
      .filter(s => s.length > 0)

    if (sentenceSplit.length > 2) {
      // Group sentences into 2-3 segments
      const result: string[] = []
      const perSegment = Math.ceil(sentenceSplit.length / 3)
      for (let i = 0; i < Math.min(3, sentenceSplit.length); i++) {
        const start = i * perSegment
        result.push(sentenceSplit.slice(start, start + perSegment).join(''))
      }
      segments = result
    }
  }

  return segments
}

export async function chat(persona: Persona, history: { role: string; content: string }[], userMessage: string): Promise<string[]> {
  const { apiBase, apiKey, model } = getConfig()

  if (!apiKey || apiKey === 'your-api-key-here') {
    // Fallback to rule-based when no API key
    return fallbackResponse(userMessage, persona)
  }

  const systemPrompt = buildSystemPrompt(persona)

  // Build messages array - keep last 20 messages for context
  const recentHistory = history.slice(-20)
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: userMessage },
  ]

  try {
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.8,
        max_tokens: 500,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('AI API error:', err)
      throw new Error(`AI API error: ${response.status}`)
    }

    const data = await response.json()
    const fullResponse = data.choices?.[0]?.message?.content || ''

    // Smart segment parsing
    let segments = parseSegments(fullResponse)

    return segments.length > 0 ? segments.slice(0, 5) : ['嗯...']
  } catch (error) {
    console.error('AI chat error:', error)
    // Fallback on error
    return fallbackResponse(userMessage, persona)
  }
}

// Rule-based fallback when AI is unavailable
function fallbackResponse(userMessage: string, persona: Persona): string[] {
  const personality = persona.personality || ''
  const isGreeting = /^(嗨|哈喽|你好|hi|hello|早上好|晚上好|晚安|拜拜|再见)/i.test(userMessage.trim())
  const isMissing = /^(我想你|想你|好想你|想你了|你在哪)/i.test(userMessage.trim())
  const isCare = /^(吃了吗|吃饭|冷不冷|多穿|早点睡|注意|好好)/i.test(userMessage.trim())
  const isEmotion = /^(开心|难过|生气|烦躁|好累|压力|崩溃|哭了)/i.test(userMessage.trim())

  if (isGreeting) {
    return ['诶，你来啦～', '今天过得怎么样？']
  } else if (isMissing) {
    return ['我也一直都在呢。', '别想太多，照顾好自己最重要。']
  } else if (isCare) {
    return ['嗯，我挺好的。你呢？', '倒是你自己，要好好照顾自己呀。']
  } else if (isEmotion) {
    return ['怎么了？跟我说说。', '不管什么事，我都在。']
  } else {
    return ['嗯嗯，我明白。', personality.includes('细致') ? '你继续说，我听着呢。' : '好～']
  }
}
