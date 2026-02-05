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
    socialDescription?: string;
    detailedDescription?: {
        design?: string;
        details?: string;
        materials?: string;
        technicalSpecs?: string;
        symbolism?: string;
    };
    commercialLine?: string;
    symbology?: string[];
    occasion?: string[];
    customerProfile?: string[];
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
                "description": "Una descripción literaria, elegante y vendedora de la pieza (ej. 'Anillo de oro amarillo con corazón central y doble banda de brillantes'). No usar formateo técnico tipo lista.",
                "categoryId": "ID de la categoría detectada",
                "subcategoryId": "ID de la subcategoría detectada",
                "attributes": {
                    "ID_DEL_ATRIBUTO": "valor_detectado"
                },
                "socialDescription": "Un caption atractivo para Instagram/Facebook con hashtags",
                "detailedDescription": {
                    "design": "Descripción del diseño y estructura central",
                    "details": "Detalles minuciosos de la pieza",
                    "materials": "Información sobre materiales y acabados",
                    "technicalSpecs": "Especificaciones técnicas estimadas",
                    "symbolism": "Simbolismo o historia sugerida de la pieza"
                },
                "commercialLine": "Nupcial | Juvenil | Alta Joyería | Daily Wear",
                "symbology": ["Amor", "Protección", "Éxito", "etc"],
                "occasion": ["Compromiso", "Aniversario", "Graduación", "etc"],
                "customerProfile": ["Romántico", "Minimalista", "Clásico", "Trendsetter"]
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
            2. La "description" DEBE ser fluida y descriptiva, resaltando la estética de la pieza.
            3. Rellena el objeto "attributes" mapeando lo que veas a los IDs proporcionados.
            4. Si detectas un material o propiedad que tiene un valor en la lista de "VALORES DISPONIBLES", úsalo exactamente en el objeto "attributes".
            5. Genera contenidos de alta calidad para "socialDescription" y "detailedDescription".
            6. Sugiere la clasificación comercial (commercialLine, symbology, occasion, customerProfile) basada en la estética y uso probable de la pieza.
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
    },

    generateCopywriting: async (context: {
        name: string;
        category: string;
        subcategory: string;
        commercialLine: string;
        collection: string;
        symbology: string;
        occasion: string;
        customerProfile: string;
    }): Promise<Partial<AIAnalysisResult>> => {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
            Eres un experto en Copywriting para Joyería de Lujo. Tu tarea es generar descripciones atractivas y vendedoras para una pieza con los siguientes datos:
            
            DATOS DE LA PIEZA:
            - Nombre: ${context.name}
            - Clasificación: ${context.category} / ${context.subcategory}
            
            ESTRATEGIA COMERCIAL SELECCIONADA:
            - Línea: ${context.commercialLine}
            - Colección: ${context.collection}
            - Simbología: ${context.symbology}
            - Ocasión: ${context.occasion}
            - Perfil de Cliente: ${context.customerProfile}

            OBJETIVO:
            Genera un objeto JSON con dos campos:
            1. "socialDescription": Un caption para Instagram con emojis, hashtags y un tono que encaje con el Perfil de Cliente indicado.
            2. "detailedDescription": Un objeto con:
               - "design": Descripción evocadora del diseño.
               - "details": Puntos clave que lo hacen especial.
               - "materials": Cómo los materiales realzan la pieza.
               - "technicalSpecs": Resumen técnico (ej. 'Oro 18k, 0.5ct Diamantes').
               - "symbolism": El significado profundo basado en la simbología indicada.

            REGLAS:
            - Tono: Elegante, exclusivo y emocional.
            - Idioma: Español.
            - Responde SOLO con el JSON.
        `;

        try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (error: any) {
            console.error("Error en generación de copy IA:", error);
            throw new Error(`Error Copywriting Gemini: ${error.message}`);
        }
    }
};
