const { GoogleGenerativeAI } = require("@google/generative-ai");

// Bypass SSL issues for testing on this machine
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function run() {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("ERROR: VITE_GEMINI_API_KEY environment variable not set.");
        process.exit(1);
    }

    console.log("Testing Gemini API (gemini-2.0-flash) with Key:", apiKey.substring(0, 5) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);
    // Usamos gemini-2.0-flash que está confirmado en el listado de este proyecto
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: "v1beta" });

    try {
        const result = await model.generateContent("Respond with 'OK' if you can read this.");
        const response = await result.response;
        const text = response.text();
        console.log("Connection Success! Response:", text);
    } catch (error) {
        console.error("Connection Failed!");
        console.error("Name:", error.name);
        console.error("Message:", error.message);
        if (error.status) console.error("Status:", error.status);
    }
}

run();
