interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiRequest {
  contents: GeminiMessage[];
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
  };
  systemInstruction?: {
    parts: { text: string }[];
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

class GeminiService {
  private apiKey: string = '';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  private model = 'gemini-1.5-flash';

  setApiKey(key: string) {
    this.apiKey = key.trim();
  }

  getApiKey(): string {
    return this.apiKey;
  }

  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async generateContent(
    prompt: string,
    systemInstruction?: string,
    temperature: number = 0.7
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    const request: GeminiRequest = {
      contents: messages,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature,
      },
    };

    if (systemInstruction) {
      request.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message || `API error: ${response.status}`
        );
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      const text =
        data.candidates[0].content.parts[0]?.text ||
        'No content generated';

      return text;
    } catch (error) {
      throw error;
    }
  }

  async generateTweet(
    topic: string,
    personality: string,
    tone: string,
    language: string
  ): Promise<string> {
    const systemPrompt = `You are a social media expert that creates engaging tweets in the user's unique voice.
Personality: ${personality}
Always respond in ${language === 'ar' ? 'Arabic' : 'English'} only.
Keep tweets under 280 characters and make them authentic and engaging.`;

    const userPrompt = `Create a ${tone} tweet about: ${topic}`;

    return this.generateContent(userPrompt, systemPrompt, 0.8);
  }

  async generateReelsScript(
    topic: string,
    personality: string,
    tone: string,
    language: string
  ): Promise<string> {
    const systemPrompt = `You are a viral content creator specializing in short-form video scripts (30-60 seconds).
Personality: ${personality}
Always respond in ${language === 'ar' ? 'Arabic' : 'English'} only.
Format the script with clear sections: HOOK, MAIN CONTENT, CTA.`;

    const userPrompt = `Create a ${tone} reels script about: ${topic}`;

    return this.generateContent(userPrompt, systemPrompt, 0.8);
  }

  async generatePost(
    topic: string,
    personality: string,
    tone: string,
    language: string
  ): Promise<string> {
    const systemPrompt = `You are a professional content writer creating engaging social media posts.
Personality: ${personality}
Always respond in ${language === 'ar' ? 'Arabic' : 'English'} only.
Make posts authentic, engaging, and formatted nicely.`;

    const userPrompt = `Create a ${tone} social media post about: ${topic}`;

    return this.generateContent(userPrompt, systemPrompt, 0.7);
  }

  async generateChatReply(
    receivedMessage: string,
    personality: string,
    replyStyle: string,
    context: string,
    language: string
  ): Promise<string> {
    const styleDescriptions: Record<string, string> = {
      diplomatic: 'calm, balanced, and seeking common ground',
      assertive: 'direct, firm, and confident',
      humorous: 'light, witty, and entertaining',
      formal: 'professional, courteous, and businesslike',
    };

    const systemPrompt = `You are a communication coach helping craft smart replies to messages.
Personality: ${personality}
Reply style: ${styleDescriptions[replyStyle] || 'thoughtful'}
${context ? `Context: ${context}` : ''}
Always respond in ${language === 'ar' ? 'Arabic' : 'English'} only.
Keep replies concise and authentic to the user's voice.`;

    const userPrompt = `Suggest a reply to this message: "${receivedMessage}"`;

    return this.generateContent(userPrompt, systemPrompt, 0.7);
  }

  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'test' }] }],
          }),
        }
      );

      return response.ok;
    } catch {
      return false;
    }
  }
}

export const geminiService = new GeminiService();
