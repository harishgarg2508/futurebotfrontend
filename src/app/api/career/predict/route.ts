import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import backendClient from '@/lib/backendClient';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { date, time, lat, lon, timezone, name, language } = body;
        
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            console.error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
            return NextResponse.json({ error: "Server configuration error: Missing API Key" }, { status: 500 });
        }

        if (!date || !time || !lat || !lon) {
            return NextResponse.json({ error: "Missing birth details" }, { status: 400 });
        }

        // 1. Call Python Backend
        const pythonResponse = await backendClient.post('/predict/career', {
            date,
            time,
            lat,
            lon,
            timezone: timezone || "Asia/Kolkata",
            name: name || "User"
        });

        const careerData = pythonResponse.data;

        // 2. Construct Prompt for Gemini
        const targetLang = (language || 'en').toLowerCase();
        const isHindi = targetLang.startsWith('hi');
        const langInstruction = isHindi ? "Output the final verdict in Hindi (Devanagari script)." : `Output the final verdict in ${targetLang}.`;

        const systemInstruction = `
You are "Astra," a Hyper-Intelligent Career Astrologer AI. 
You do not sound like a horoscope column. You sound like a Fortune 500 Career Strategist who has access to the user's cosmic source code.

**YOUR OBJECTIVE:**
Analyze the provided JSON scoring data for 10 career categories and generate a "Dopamine-Inducing" final verdict.

**OUTPUT GUIDELINES (The "Addictive" Formula):**

1.  **THE HOOK (First Sentence):** - Start with a definitive identity statement. 
    - Example: "Rahul, let's be clear: You are not built for a desk job. You are a 'War-General' disguised as a Manager."

2.  **THE "WHY" (The Bridge):**
    - Connect the dots between their Top 2 scores. 
    - Example: "Your chart shows a rare conflict: The logic of an Engineer (Mercury-Mars) but the ambition of a CEO (Sun in 10th). This means you shouldn't just code; you should *build companies*."

3.  **THE "PROOF" (Cite the Yogas):**
    - Mention the strongest specific Yoga found in the data to build trust.
    - Example: "That 'Rahu in the 10th House' is your superpower. It gives you the ability to spot trends before anyone else."

4.  **THE "WARNING" (Fear of Missing Out):**
    - Briefly mention what to avoid.
    - Example: "Do not waste this energy in 'General Administration' (Score: 20%). It will suffocate you."

5.  **THE TIMELINE (Call to Action):**
    - End with a high-energy directional command.
    - Example: "Your planets align for High-Tech Leadership. Stop playing small."

**TONE:** - Direct, Insightful, Empowering, Slightly Mysterious. 
- Use Markdown for bolding key phrases.
- Keep it under 150 words. Make every word punch.
- Do NOT output JSON. Output pure text/markdown.

**CRITICAL LANGUAGE INSTRUCTION:**
${langInstruction}
- **STRICT RULE:** The ENTIRE response must be in the target language. Do NOT mix English and the target language.
- If the target language is Hindi, use Devanagari script for the entire text. Do not use Romanized Hindi (Hinglish).
- Translate all career terms, yoga names, and planetary combinations into the target language contextually.
        `;

        const userMessage = `
**INPUT DATA:**
${JSON.stringify(careerData, null, 2)}
        `;

        // 3. Call Gemini (using @google/genai SDK)
        let oracleVerdict = "The Oracle is meditating on your chart...";
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash', // Using the thinking model as requested (implied by config)
                contents: [{ role: 'user', parts: [{ text: userMessage }] }],
                config: {
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    thinkingConfig: { 
                        includeThoughts: false // We only want the final response
                    },
                },
            });

            oracleVerdict = response.text || "The stars are silent.";
            
        } catch (llmError: any) {
            console.error("LLM Error:", llmError);
            // Fallback to standard model if thinking model fails or is not available
            try {
                console.log("Retrying with standard Flash model...");
                const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [{ role: 'user', parts: [{ text: systemInstruction + "\n" + userMessage }] }],
                });
                oracleVerdict = response.text || "The stars are silent.";
            } catch (retryError) {
                 console.error("Retry LLM Error:", retryError);
                 oracleVerdict = "The stars are silent right now. (AI Connection Error)";
            }
        }

        // 4. Merge and Return
        const finalResponse = {
            ...careerData,
            oracle_verdict: oracleVerdict
        };

        return NextResponse.json(finalResponse);

    } catch (error: any) {
        console.error("Career Prediction Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate career prediction" },
            { status: 500 }
        );
    }
}
