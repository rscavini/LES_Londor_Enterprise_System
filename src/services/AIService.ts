import { GoogleGenerativeAI } from "@google/generative-ai";
import { Attribute, ClassificationMapping, Category, Subcategory } from "../models/schema";
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
    analyzeImage: async (
        base64Image: string,
        mimeType: string = "image/jpeg",
        context: {
            attributes: Attribute[],
            mappings: ClassificationMapping[],
            domainValuesMap: Record<string, any[]>
        }
    ): Promise<AIAnalysisResult> => {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const categories = await CategoryService.getAll();
        const subcategories = await SubcategoryService.getAll();

        const categoriesContext = categories.map(c => `- ${c.name} (ID: ${c.id})`).join('\n');
        const subcategoriesContext = subcategories.map(s => `- ${s.name} (ID: ${s.id}, CategoriaID: ${s.categoryId})`).join('\n');

        const prompt = `
            Analiza esta imagen de una joya o reloj y devuelve un objeto JSON con la siguiente estructura:
            {
                "name": "Nombre corto y comercial",
                "description": "Formato: [Categoria] [Subcategoria] - [Atributo1: Valor] - [Atributo2: Valor]...",
                "categoryId": "ID de la categoría detectada",
                "subcategoryId": "ID de la subcategoría detectada",
                "attributes": {
                    "ID_DEL_ATRIBUTO": "valor_detectado"
                }
            }

            CONTEXTO DE CLASIFICACIÓN:
            Categorías:
            ${categoriesContext}

            Subcategorías:
            ${subcategoriesContext}

            ATRIBUTOS DISPONIBLES (Usa estos IDs en el objeto "attributes" y para construir la descripción):
            ${context.attributes.map(a => `- ${a.name} (ID: ${a.id}, Tipo: ${a.dataType})`).join('\n')}

            VALORES DISPONIBLES (Si el atributo es de tipo LIST, usa preferiblemente estos valores):
            ${Object.entries(context.domainValuesMap).map(([id, values]) => {
            const attr = context.attributes.find(a => a.id === id);
            return `- ${attr?.name || id}: [${values.map(v => v.value).join(', ')}]`;
        }).join('\n')}

            INSTRUCCIONES CRÍTICAS:
            1. Responde UNICAMENTE con el JSON.
            2. La "description" DEBE empezar por la Categoría y Subcategoría, seguida de los atributos clave detectados.
            3. Rellena el objeto "attributes" mapeando lo que veas a los IDs proporcionados.
            4. Si detectas un material o propiedad que tiene un valor en la lista de "VALORES DISPONIBLES", úsalo exactamente.
        `;

        try {
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Image.split(',')[1] || base64Image,
                        mimeType: mimeType
                    }
                }
            ]);

            const responseText = result.response.text();
            console.log("Gemini Response Raw:", responseText);

            const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr) as AIAnalysisResult;
        } catch (error: any) {
            console.error("Error detallado en análisis de Gemini:", error);
            throw new Error(`Error Gemini: ${error.message || "No se pudo completar el análisis"}`);
        }
    }
};
