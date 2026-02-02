import { GoogleGenerativeAI } from "@google/generative-ai";
import { CategoryService } from "./CategoryService";
import { SubcategoryService } from "./SubcategoryService";

// API Key from .env file (VITE_GEMINI_API_KEY)
const GENAI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GENAI_API_KEY);

export interface AIAnalysisResult {
    name: string;
    description: string;
    categoryId: string;
    subcategoryId: string;
    suggestedPrice?: number;
    attributes: Record<string, any>;
}

export const AIService = {
    analyzeImage: async (base64Image: string): Promise<AIAnalysisResult> => {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const categories = await CategoryService.getAll();
        const subcategories = await SubcategoryService.getAll();

        const categoriesContext = categories.map(c => `- ${c.name} (ID: ${c.id})`).join('\n');
        const subcategoriesContext = subcategories.map(s => `- ${s.name} (ID: ${s.id}, CategoriaID: ${s.categoryId})`).join('\n');

        const prompt = `
            Analiza esta imagen de una joya o reloj y devuelve un objeto JSON con la siguiente estructura:
            {
                "name": "Nombre corto y comercial",
                "description": "Descripción técnica detallada",
                "categoryId": "ID de la categoría que mejor encaje",
                "subcategoryId": "ID de la subcategoría que mejor encaje",
                "attributes": {
                    "attr_id": "valor detectado"
                }
            }

            CATEGORÍAS DISPONIBLES:
            ${categoriesContext}

            SUBCATEGORÍAS DISPONIBLES:
            ${subcategoriesContext}

            Responde ÚNICAMENTE con el objeto JSON, sin bloques de código ni texto adicional.
            Si no estás seguro de la subcategoría, deja el campo vacío.
            En los atributos, intenta identificar el material (oro, plata, etc) y colores.
        `;

        try {
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image.split(',')[1] || base64Image,
                        mimeType: "image/jpeg"
                    }
                }
            ]);

            const responseText = result.response.text();
            // Limpiar posible markdown si Gemini lo incluye
            const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr) as AIAnalysisResult;
        } catch (error) {
            console.error("Error en análisis de Gemini:", error);
            throw new Error("No se pudo completar el análisis de la imagen.");
        }
    }
};
