import axios from 'axios';

const API_URL = 'https://harishgarg2508-vedic-engine.hf.space/calculate/varshaphala';

const payload = {
    date: "1990-01-01", // Demo DOB
    time: "12:00",
    lat: 28.6139, // New Delhi
    lon: 77.2090,
    age: 24,
    timezone: "Asia/Kolkata"
};

async function testVarshphal() {
    console.log("Testing Varshphal Fetch...");
    console.log("URL:", API_URL);
    console.log("Payload:", JSON.stringify(payload, null, 2));

    try {
        const response = await axios.post(API_URL, payload);
        console.log("\nSuccess!");
        console.log("Response Status:", response.status);
        
        // Log key parts of the response to verify structure
        if (response.data) {
             console.log("Response Keys:", Object.keys(response.data));
             if (response.data.meta) {
                 console.log("Meta:", response.data.meta);
             }
             if (response.data.muntha) {
                 console.log("Muntha Data:", response.data.muntha);
             }
             if (response.data.planets) {
                 console.log("First Planet (Sun):", response.data.planets.Sun);
             }
        }
        
    } catch (error: any) {
        console.error("\nError Fetching Varshphal:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Message:", error.message);
        }
    }
}

testVarshphal();
