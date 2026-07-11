import { GoogleGenAI } from '@google/genai';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('GEMINI_API_KEY is missing or invalid in environment variables.');
  }
  return new GoogleGenAI({ apiKey });
};

const getModel = () => process.env.GEMINI_MODEL || 'gemini-flash-latest';

const SYSTEM_INSTRUCTION = `You are "Chatty AI", a helpful, friendly, and concise AI assistant built natively into the QuickChat application.
Your goal is to help users with their questions, summarize conversations, and provide smart replies.
Rules:
- Be concise and friendly.
- Do not impersonate real people.
- Do not make hallucinated factual claims without grounding.
- If asked about your identity, state clearly that you are Chatty AI, an AI assistant powered by Gemini.`;

export const generateReply = async (history, userMessage) => {
  try {
    const ai = getGeminiClient();
    
    // Map existing history to Gemini contents format
    // Gemini roles: 'user' or 'model'
    const contents = history.map(msg => ({
      role: msg.isAIGenerated ? 'model' : 'user',
      parts: [{ text: msg.text || '' }]
    }));

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: getModel(),
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text;
  } catch (error) {
    console.error('Gemini Service Error (generateReply):', error);
    throw new Error('AI is temporarily unavailable. Please try again later.');
  }
};

export const generateReplyStream = async function* (history, userMessage) {
  try {
    const ai = getGeminiClient();
    
    const contents = history.map(msg => ({
      role: msg.isAIGenerated ? 'model' : 'user',
      parts: [{ text: msg.text || '' }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const responseStream = await ai.models.generateContentStream({
      model: getModel(),
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Gemini Service Error (generateReplyStream):', error);
    throw new Error('AI is temporarily unavailable. Please try again later.');
  }
};

export const summarizeConversation = async (messages) => {
  try {
    const ai = getGeminiClient();
    
    const conversationText = messages.map(m => `${m.senderName || (m.isAIGenerated ? 'Chatty AI' : 'User')}: ${m.text}`).join('\\n');
    
    const prompt = `Please summarize the following conversation:\\n\\n${conversationText}`;
    
    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: {
        systemInstruction: 'You are an expert summarizer. Keep it brief and hit the main points.',
      }
    });

    return response.text;
  } catch (error) {
    console.error('Gemini Service Error (summarizeConversation):', error);
    throw new Error('Failed to summarize conversation.');
  }
};

export const generateSmartReplies = async (lastMessage) => {
  try {
    const ai = getGeminiClient();
    
    const prompt = `Based on this message: "${lastMessage}", suggest 3 short, contextual replies.`;
    
    const response = await ai.models.generateContent({
      model: getModel(),
      contents: prompt,
      config: {
        systemInstruction: 'You must output ONLY a valid JSON array of strings containing exactly 3 short reply suggestions. Do not include markdown formatting or backticks.',
        responseMimeType: 'application/json',
      }
    });

    let text = response.text.trim();
    if (text.startsWith('```json')) {
      text = text.substring(7, text.length - 3).trim();
    } else if (text.startsWith('```')) {
      text = text.substring(3, text.length - 3).trim();
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Service Error (generateSmartReplies):', error);
    return []; // Return empty array gracefully
  }
};

export const analyzeImage = async (imageBase64, question) => {
  try {
    const ai = getGeminiClient();
    
    const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid image base64 format");
    }
    
    const mimeType = match[1];
    const data = match[2];

    const response = await ai.models.generateContent({
      model: getModel(),
      contents: [
        {
          inlineData: {
            data,
            mimeType,
          }
        },
        question
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text;
  } catch (error) {
    console.error('Gemini Service Error (analyzeImage):', error);
    throw new Error('Failed to analyze image.');
  }
};
