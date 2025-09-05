import { NextRequest, NextResponse } from 'next/server'

// Fallback function for when AI is not available
function enhanceStoryFallback(originalStory: string, petInfo: any): string {
  const name = petInfo.name
  const type = petInfo.type
  const breed = petInfo.breed
  
  // Simple enhancement patterns
  const enhancedStory = originalStory
    .replace(/\b(he|she|it)\b/gi, name)
    .replace(/\bthe (dog|cat|pet)\b/gi, `${name}, a wonderful ${breed}`)
    
  const prefix = `Meet ${name}, a ${petInfo.age} ${petInfo.gender} ${breed} who is looking for a forever home! `
  const suffix = ` ${name} would make a perfect addition to any loving family and is ready to bring joy and companionship to their new home. Could ${name} be the perfect match for you?`
  
  return prefix + enhancedStory + suffix
}

export async function POST(request: NextRequest) {
  try {
    const { petData, originalStory } = await request.json()

    if (!originalStory || originalStory.trim().length === 0) {
      return NextResponse.json(
        { error: 'Original story is required' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback: Simple text enhancement without AI
      const enhancedStory = enhanceStoryFallback(originalStory, petInfo)
      return NextResponse.json({
        enhancedStory,
        originalStory
      })
    }

    const petInfo = {
      name: petData.name || 'this pet',
      type: petData.type || 'animal',
      breed: petData.breed || 'mixed breed',
      age: petData.age || 'unknown age',
      gender: petData.gender || 'unknown gender',
      size: petData.size || 'medium size',
      description: petData.description || ''
    }

    const prompt = `You are a professional pet adoption copywriter. Your goal is to make pet adoption stories more engaging and heartwarming while staying truthful to the original story.

Pet Information:
- Name: ${petInfo.name}
- Type: ${petInfo.type}
- Breed: ${petInfo.breed}
- Age: ${petInfo.age}
- Gender: ${petInfo.gender}
- Size: ${petInfo.size}
- Description: ${petInfo.description}

Original Story from Shelter:
"${originalStory}"

Please enhance this story to be more engaging and heartwarming for potential adopters. Make it:
1. More descriptive and emotional
2. Focus on the pet's personality and unique qualities
3. Include a hopeful message about finding a loving home
4. Keep it authentic and truthful to the original story
5. Limit to 2-3 paragraphs
6. Use warm, friendly tone that appeals to families

Enhanced Story:`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional pet adoption copywriter who writes engaging, heartwarming stories that help pets find loving homes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', error)
      return NextResponse.json(
        { error: 'Failed to enhance story. Please try again.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const enhancedStory = data.choices[0]?.message?.content?.trim()

    if (!enhancedStory) {
      return NextResponse.json(
        { error: 'Failed to generate enhanced story' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      enhancedStory,
      originalStory
    })

  } catch (error) {
    console.error('Error enhancing story:', error)
    return NextResponse.json(
      { error: 'Failed to enhance story' },
      { status: 500 }
    )
  }
}