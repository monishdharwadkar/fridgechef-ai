/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ChefHat, Sparkles, RefreshCw, AlertTriangle, Info, BookOpen, UtensilsCrossed } from "lucide-react";
import { Ingredient, Recipe, RecipeFilters as FilterType } from "./types";
import { ApiClient } from "./utils/apiClient";
import { CameraScanner } from "./features/camera/CameraScanner";
import { IngredientTags } from "./features/ingredients/IngredientTags";
import { RecipeFilters } from "./features/recipe/RecipeFilters";
import { RecipeCard } from "./features/recipe/RecipeCard";
import { Loader } from "./components/Loader";
import { SavedRecipes } from "./components/SavedRecipes";

export default function App() {
  // --- STATE ---
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filters, setFilters] = useState<FilterType>({
    cuisine: "Any",
    dietaryRestriction: "None",
    maxCookTime: 0,
    servings: 0,
  });
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  // Loading States
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Errors / Quota States
  const [error, setError] = useState<string | null>(null);
  const [quotaLimit, setQuotaLimit] = useState(false);
  const [errorContext, setErrorContext] = useState<"scan" | "recipe" | null>(null);

  // Last image processed (for quick manual "Retry Scan" if desired)
  const [lastImage, setLastImage] = useState<string | null>(null);

  // --- PERSISTENCE (LocalStorage) ---
  useEffect(() => {
    try {
      const stored = localStorage.getItem("fridge_saved_recipes");
      if (stored) {
        setSavedRecipes(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load saved recipes from LocalStorage:", err);
    }
  }, []);

  const saveRecipesToStorage = (updatedList: Recipe[]) => {
    try {
      localStorage.setItem("fridge_saved_recipes", JSON.stringify(updatedList));
      setSavedRecipes(updatedList);
    } catch (err) {
      console.error("Failed to save recipes to LocalStorage:", err);
    }
  };

  // --- ACTIONS ---
  const handleImageSelected = async (base64Image: string) => {
    setIsScanning(true);
    setError(null);
    setQuotaLimit(false);
    setErrorContext("scan");
    setLastImage(base64Image);

    try {
      const response = await ApiClient.scanFridge(base64Image);
      if (response.quotaLimit) {
        setQuotaLimit(true);
        setError(response.error || "Quota limit reached");
      } else if (response.error) {
        setError(response.error);
      } else if (response.noIngredientsDetected) {
        setError("We couldn't recognize any clear food ingredients in this photo. Try snapping it under brighter light or adding them manually!");
      } else {
        // Merge or replace ingredients
        setIngredients(response.ingredients);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred during image scanning.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddIngredient = (name: string, category = "Produce") => {
    const exists = ingredients.some(
      (ing) => ing.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    if (exists) return;

    setIngredients((prev) => [
      ...prev,
      {
        name: name.trim(),
        confidence: 1.0, // manually added ingredients have absolute confidence
        category,
      },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleClearAll = () => {
    setIngredients([]);
    setRecipes([]);
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) return;

    setIsGenerating(true);
    setError(null);
    setQuotaLimit(false);
    setErrorContext("recipe");

    const ingredientNames = ingredients.map((ing) => ing.name);

    try {
      const response = await ApiClient.generateRecipe(ingredientNames, filters);
      if (response.quotaLimit) {
        setQuotaLimit(true);
        setError(response.error || "Quota limit reached");
      } else if (response.error) {
        setError(response.error);
      } else if (response.recipes.length === 0) {
        setError("Gemini generated an empty cookbook. Try adjusting your cuisine/diet filters for better results!");
      } else {
        setRecipes(response.recipes);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while generating recipes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToggle = (recipe: Recipe) => {
    const exists = savedRecipes.some((r) => r.title === recipe.title);
    let updated: Recipe[];

    if (exists) {
      updated = savedRecipes.filter((r) => r.title !== recipe.title);
    } else {
      updated = [...savedRecipes, recipe];
    }
    saveRecipesToStorage(updated);
  };

  const handleRetry = () => {
    if (errorContext === "scan" && lastImage) {
      handleImageSelected(lastImage);
    } else if (errorContext === "recipe") {
      handleGenerateRecipe();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 text-neutral-800 font-sans selection:bg-amber-100 antialiased">
      {/* Header Container */}
      <header className="bg-white border-b border-amber-50 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 rounded-2xl text-neutral-950 shadow-md">
              <ChefHat size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-1.5">
                Fridge to Recipe
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 tracking-wider uppercase">
                  Gemini Flash AI
                </span>
              </h1>
              <p className="text-xs text-neutral-500">Scan contents & cook waste-free meals</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-neutral-500">
            <Info size={14} className="text-neutral-400" />
            <span>Zero Waste Cookery Engine</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Intro Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-neutral-950 shadow-sm">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <UtensilsCrossed size={160} />
          </div>
          <div className="max-w-xl relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Turn your leftover ingredients into a culinary masterpiece!
            </h2>
            <p className="text-sm font-medium text-neutral-900/90 mb-4 leading-relaxed">
              Snapshot inside your fridge or enter whatever ingredients you have lying around. Our intelligent kitchen engine curates delicious step-by-step cooking recipes custom-made for your pantry.
            </p>
            <div className="inline-flex items-center gap-2 bg-neutral-950/10 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-neutral-950/5">
              <Sparkles size={14} />
              Reduces cooking waste instantly
            </div>
          </div>
        </div>

        {/* Dynamic Alerts (Quota, Rates, General Errors) */}
        {error && (
          <div
            id="error-alert"
            className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn ${
              quotaLimit
                ? "bg-amber-50/70 border-amber-200 text-amber-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <div className="flex gap-3">
              <div className={`p-2 rounded-2xl flex-shrink-0 ${quotaLimit ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  {quotaLimit ? "AI Service Limit Reached" : "Process Interrupted"}
                </h4>
                <p className="text-xs mt-1 leading-relaxed opacity-90 max-w-2xl">{error}</p>
              </div>
            </div>
            
            <button
              id="retry-process-btn"
              type="button"
              onClick={handleRetry}
              className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 border transition-all duration-150 transform hover:scale-102 active:scale-98 ${
                quotaLimit
                  ? "bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900"
                  : "bg-red-100 hover:bg-red-200 border-red-300 text-red-900"
              }`}
            >
              <RefreshCw size={12} className={isScanning || isGenerating ? "animate-spin" : ""} />
              Try Again
            </button>
          </div>
        )}

        {/* Page Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Input & Configuration */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Step 1: Scanner */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs">
                  1
                </span>
                <h3 className="font-extrabold text-neutral-900 text-base">
                  Snap Fridge or Upload Image
                </h3>
              </div>
              <CameraScanner
                onImageSelected={handleImageSelected}
                isProcessing={isScanning}
              />
            </section>

            {/* Loading Scanner */}
            {isScanning && (
              <div className="py-2">
                <Loader type="scan" />
              </div>
            )}

            {/* Step 2: Confirm Ingredients */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs">
                  2
                </span>
                <h3 className="font-extrabold text-neutral-900 text-base">
                  Verify Detected Ingredients
                </h3>
              </div>
              <IngredientTags
                ingredients={ingredients}
                onAddIngredient={handleAddIngredient}
                onRemoveIngredient={handleRemoveIngredient}
                onClearAll={handleClearAll}
                isGeneratingRecipe={isGenerating}
                onGenerateRecipe={handleGenerateRecipe}
              />
            </section>

            {/* Step 3: Customize Options */}
            {ingredients.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500 text-neutral-950 font-bold text-xs">
                    3
                  </span>
                  <h3 className="font-extrabold text-neutral-900 text-base">
                    Customize Output (Optional)
                  </h3>
                </div>
                <RecipeFilters filters={filters} onChange={setFilters} />
              </section>
            )}

          </div>

          {/* RIGHT COLUMN: Results & Cookbooks */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Generating Loader */}
            {isGenerating && (
              <div className="sticky top-24 z-10 py-4">
                <Loader type="recipe" />
              </div>
            )}

            {/* Recipe Outputs */}
            {recipes.length > 0 && !isGenerating && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-1">
                  <h3 className="font-extrabold text-neutral-900 text-lg flex items-center gap-2">
                    <BookOpen size={20} className="text-green-600" />
                    AI Cookbooks ({recipes.length})
                  </h3>
                  <button
                    id="regenerate-recipes-btn"
                    type="button"
                    onClick={handleGenerateRecipe}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1.5 transition-all duration-150"
                  >
                    <RefreshCw size={12} />
                    Regenerate
                  </button>
                </div>
                
                <div className="flex flex-col gap-6">
                  {recipes.map((rec) => (
                    <RecipeCard
                      key={rec.title}
                      recipe={rec}
                      isSaved={savedRecipes.some((sr) => sr.title === rec.title)}
                      onSaveToggle={() => handleSaveToggle(rec)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Cookbooks Bookmark Persistence */}
            <section className="space-y-3">
              <SavedRecipes
                savedRecipes={savedRecipes}
                onRemove={(title) => {
                  const filtered = savedRecipes.filter((r) => r.title !== title);
                  saveRecipesToStorage(filtered);
                }}
              />
            </section>

          </div>

        </div>
      </main>

      {/* Humble visual footer (No telemetry, no online indicators, pristine alignment) */}
      <footer className="border-t border-neutral-100 bg-white mt-16 py-8 text-center text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Fridge to Recipe App. Zero Waste Culinary AI.</p>
          <p>Powered by Google Gemini 2.5 Flash</p>
        </div>
      </footer>
    </div>
  );
}
