/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ingredient, Recipe, ScanFridgeResponse, GenerateRecipeResponse, RecipeFilters } from "../types";

// In-memory cache for the current session to conserve Gemini API quota
const scanCache = new Map<string, ScanFridgeResponse>();
const recipeCache = new Map<string, GenerateRecipeResponse>();

/**
 * Creates a stable cache key for a base64 image string.
 * Uses the length and the first 500 characters of the payload to keep it fast and unique.
 */
function getImageCacheKey(base64Image: string): string {
  const len = base64Image.length;
  const slice = base64Image.substring(0, 500);
  return `img_${len}_${slice}`;
}

/**
 * Creates a stable cache key for ingredients combined with recipe filters.
 */
function getRecipeCacheKey(ingredients: string[], filters: RecipeFilters): string {
  const sortedIngredients = [...ingredients].map(i => i.trim().toLowerCase()).sort();
  const filterPart = `${filters.cuisine}_${filters.dietaryRestriction}_${filters.maxCookTime}_${filters.servings}`;
  return `${sortedIngredients.join(",")}|${filterPart}`;
}

export class ApiClient {
  /**
   * Scans an image of a fridge to identify food ingredients.
   * Leverages caching if the same image is scanned again.
   */
  static async scanFridge(base64Image: string): Promise<ScanFridgeResponse> {
    const cacheKey = getImageCacheKey(base64Image);
    if (scanCache.has(cacheKey)) {
      console.log("Serving fridge scan from cache...");
      return scanCache.get(cacheKey)!;
    }

    try {
      const response = await fetch("/api/scan-fridge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 429 || errData.quotaLimit) {
          return {
            ingredients: [],
            noIngredientsDetected: false,
            quotaLimit: true,
            error: errData.error || "You've hit the Gemini quota limit — please wait a bit before trying again."
          };
        }
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      const data: ScanFridgeResponse = await response.json();
      
      // Only cache successful results
      if (!data.error && !data.quotaLimit) {
        scanCache.set(cacheKey, data);
      }
      return data;
    } catch (err: any) {
      console.error("ApiClient.scanFridge failed:", err);
      return {
        ingredients: [],
        noIngredientsDetected: false,
        error: err?.message || "An unexpected error occurred while scanning the fridge."
      };
    }
  }

  /**
   * Generates recipes based on list of ingredients on hand and optional filters.
   * Leverages caching if identical ingredients + filters are provided.
   */
  static async generateRecipe(
    ingredients: string[],
    filters: RecipeFilters
  ): Promise<GenerateRecipeResponse> {
    const cacheKey = getRecipeCacheKey(ingredients, filters);
    if (recipeCache.has(cacheKey)) {
      console.log("Serving recipes from cache...");
      return recipeCache.get(cacheKey)!;
    }

    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients,
          cuisine: filters.cuisine,
          dietaryRestriction: filters.dietaryRestriction,
          maxCookTime: filters.maxCookTime,
          servings: filters.servings
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 429 || errData.quotaLimit) {
          return {
            recipes: [],
            quotaLimit: true,
            error: errData.error || "You've hit the Gemini quota limit — please wait a bit before trying again."
          };
        }
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      const data: GenerateRecipeResponse = await response.json();
      
      if (!data.error && !data.quotaLimit) {
        recipeCache.set(cacheKey, data);
      }
      return data;
    } catch (err: any) {
      console.error("ApiClient.generateRecipe failed:", err);
      return {
        recipes: [],
        error: err?.message || "An unexpected error occurred while generating recipes."
      };
    }
  }
}
