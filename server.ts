/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with comfortable limits for compressed base64 images
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Lazy initialize the GoogleGenAI SDK to avoid app startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in AI Studio Secrets.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// 1. Scan Fridge Endpoint
app.post("/api/scan-fridge", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
       res.status(400).json({ error: "Missing image in request body." });
       return;
    }

    // Parse data URL if exists
    let mimeType = "image/jpeg";
    let base64Data = image;
    if (image.startsWith("data:")) {
      const parts = image.split(",");
      const match = image.match(/data:([^;]+);/);
      if (match) {
        mimeType = match[1];
      }
      base64Data = parts[1];
    }

    const ai = getAiClient();

    // Strict response schema for ingredient extraction
    const ingredientExtractionSchema = {
      type: "OBJECT",
      properties: {
        ingredients: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              confidence: { type: "NUMBER" },
              category: { type: "STRING" }
            },
            required: ["name", "confidence", "category"]
          }
        },
        noIngredientsDetected: { type: "BOOLEAN" },
        errorReason: { type: "STRING" }
      },
      required: ["ingredients", "noIngredientsDetected"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        "Analyze this fridge, pantry, or food basket image. Identify all visible food items and ingredients. Provide an array of identified ingredients with an estimated confidence level between 0.0 and 1.0 (where 1.0 is extremely certain) and group them into logical categories like Produce, Dairy, Meat, Condiment, Beverage, Pantry, or Other. If you see no recognizable food items, or the image is too blurry, set noIngredientsDetected to true and write a brief description in errorReason.",
        {
          inlineData: {
            mimeType,
            data: base64Data
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: ingredientExtractionSchema,
        temperature: 0.2, // lower temperature for deterministic results
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text returned from Gemini API.");
    }

    const result = JSON.parse(responseText);
     res.json(result);
     return;

  } catch (error: any) {
    console.error("Scan Fridge Error:", error);
    const msg = error?.message || String(error);
    const is429 = msg.includes("429") || msg.includes("quota") || msg.includes("limit") || error?.status === 429;
    
    if (is429) {
       res.status(429).json({
        error: "You've hit the Gemini quota limit — please wait a bit before trying again.",
        quotaLimit: true
      });
       return;
    }

     res.status(500).json({ error: `Scanning failed: ${msg}` });
     return;
  }
});

// 2. Generate Recipe Endpoint
app.post("/api/generate-recipe", async (req, res) => {
  try {
    const { ingredients, cuisine, dietaryRestriction, maxCookTime, servings } = req.body;
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
       res.status(400).json({ error: "Missing or invalid ingredients list." });
       return;
    }

    const ai = getAiClient();

    // Strict JSON schema for generating beautiful, complete recipes
    const recipeGenerationSchema = {
      type: "OBJECT",
      properties: {
        recipes: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              description: { type: "STRING" },
              ingredientsUsed: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              ingredientsMissing: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              steps: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              prepTime: { type: "INTEGER" },
              cookTime: { type: "INTEGER" },
              servings: { type: "INTEGER" },
              difficulty: { type: "STRING" }
            },
            required: [
              "title",
              "description",
              "ingredientsUsed",
              "ingredientsMissing",
              "steps",
              "prepTime",
              "cookTime",
              "servings",
              "difficulty"
            ]
          }
        }
      },
      required: ["recipes"]
    };

    const filterContext = [];
    if (cuisine && cuisine !== "Any") filterContext.push(`Cuisine type: ${cuisine}`);
    if (dietaryRestriction && dietaryRestriction !== "None") filterContext.push(`Dietary restrictions: ${dietaryRestriction}`);
    if (maxCookTime && maxCookTime > 0) filterContext.push(`Maximum cooking/prep total time: ${maxCookTime} minutes`);
    if (servings && servings > 0) filterContext.push(`Target servings: ${servings}`);

    const systemPrompt = `You are a creative, professional master chef who specializes in reducing food waste. 
    Your task is to generate delicious, kitchen-tested recipes using these ingredients on hand: ${ingredients.join(", ")}.
    ${filterContext.length > 0 ? `Apply these strict filters: ${filterContext.join(", ")}` : ""}
    
    Guidelines:
    1. Focus on using as many of the provided ingredients as possible.
    2. You may assume very basic pantry stables are already on hand (e.g., salt, pepper, tap water, small amounts of cooking oil or butter).
    3. Any other substantial ingredient that is required but not in the user's list should be returned inside ingredientsMissing. Keep ingredientsMissing as short as possible to encourage cooking with on-hand items!
    4. Provide clear, elegant, step-by-step instructions. Break down steps into granular, checklist-friendly steps.
    5. Give each recipe a fun, appetizing title.
    6. Estimate preparation and cooking times realistically.
    7. Generate up to 3 recipes (or fewer if there is too little variety or ingredients limit options). Ensure they represent different styles or options (e.g., a quick snack, a main dish, a creative combination).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeGenerationSchema,
        temperature: 0.7,
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text returned from Gemini API.");
    }

    const result = JSON.parse(responseText);
     res.json(result);
     return;

  } catch (error: any) {
    console.error("Recipe Generation Error:", error);
    const msg = error?.message || String(error);
    const is429 = msg.includes("429") || msg.includes("quota") || msg.includes("limit") || error?.status === 429;
    
    if (is429) {
       res.status(429).json({
        error: "You've hit the Gemini quota limit — please wait a bit before trying again.",
        quotaLimit: true
      });
       return;
    }

     res.status(500).json({ error: `Recipe generation failed: ${msg}` });
     return;
  }
});

// Setup Vite Dev server for local dev, static serving in production
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

bootstrap();
