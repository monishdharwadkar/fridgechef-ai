/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ingredient {
  name: string;
  confidence: number; // Decimal representing percentage confidence (e.g. 0.85 = 85%)
  category: string;   // e.g. "Produce", "Dairy", "Meat", "Condiment", "Beverage", "Pantry", "Other"
}

export interface Recipe {
  title: string;
  description: string;
  ingredientsUsed: string[];
  ingredientsMissing: string[];
  steps: string[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard" | string;
}

export interface ScanFridgeResponse {
  ingredients: Ingredient[];
  noIngredientsDetected: boolean;
  error?: string;
  quotaLimit?: boolean;
}

export interface GenerateRecipeResponse {
  recipes: Recipe[];
  error?: string;
  quotaLimit?: boolean;
}

export interface RecipeFilters {
  cuisine: string;
  dietaryRestriction: string;
  maxCookTime: number; // 0 means any
  servings: number;
}
