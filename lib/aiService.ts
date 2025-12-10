import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function generateImage(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY nie je nastavený v .env súbore')
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })

    const imageUrl = response.data[0]?.url
    if (!imageUrl) {
      throw new Error('Nepodarilo sa vygenerovať obrázok')
    }

    return imageUrl
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    throw new Error(`Chyba pri generovaní obrázka: ${error.message}`)
  }
}

export async function generateText(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY nie je nastavený v .env súbore')
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Si kreatívny asistent, ktorý pomáha vytvárať komiksy a príbehy. Odpovedaj v slovenčine.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    })

    return response.choices[0]?.message?.content || ''
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    throw new Error(`Chyba pri generovaní textu: ${error.message}`)
  }
}

