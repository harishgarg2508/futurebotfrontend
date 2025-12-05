const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        // There isn't a direct listModels method exposed easily in the high level SDK sometimes, 
        // but let's try to just use a known model to verify the key works, 
        // or use the fetch API to list models if the SDK doesn't support it directly in this version.

        // Actually, let's use the REST API to list models to be sure.
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                }
            });
        } else {
            console.log("Error listing models:", data);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
