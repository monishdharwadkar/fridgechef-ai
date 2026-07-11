/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, X, ListPlus, Sparkles, HelpCircle } from "lucide-react";
import { Ingredient } from "../../types";

interface IngredientTagsProps {
  ingredients: Ingredient[];
  onAddIngredient: (name: string, category?: string) => void;
  onRemoveIngredient: (index: number) => void;
  onClearAll: () => void;
  isGeneratingRecipe: boolean;
  onGenerateRecipe: () => void;
}

const CATEGORY_STYLES: Record<string, string> = {
  produce: "bg-emerald-50 text-emerald-800 border-emerald-200",
  dairy: "bg-cyan-50 text-cyan-800 border-cyan-200",
  meat: "bg-rose-50 text-rose-800 border-rose-200",
  condiment: "bg-orange-50 text-orange-800 border-orange-200",
  beverage: "bg-indigo-50 text-indigo-800 border-indigo-200",
  pantry: "bg-amber-50 text-amber-800 border-amber-200",
  other: "bg-neutral-50 text-neutral-800 border-neutral-200",
};

export function IngredientTags({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onClearAll,
  isGeneratingRecipe,
  onGenerateRecipe,
}: IngredientTagsProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Produce");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    onAddIngredient(trimmed, selectedCategory);
    setInputValue("");
  };

  const getStyleClass = (category: string) => {
    const cleanCat = category.toLowerCase().trim();
    return CATEGORY_STYLES[cleanCat] || CATEGORY_STYLES.other;
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-50">
        <div>
          <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-1.5">
            <ListPlus size={20} className="text-amber-500" />
            Your Ingredients
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
              {ingredients.length}
            </span>
          </h3>
          <p className="text-xs text-neutral-500">Confirm or modify ingredients detected on hand</p>
        </div>
        {ingredients.length > 0 && (
          <button
            id="clear-all-ingredients-btn"
            type="button"
            onClick={onClearAll}
            className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline transition-all duration-150"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Manual Add Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Add ingredient (e.g. Onion, Tomato, Milk)"
            className="flex-1 text-sm border border-neutral-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none rounded-xl px-3 py-2.5 bg-neutral-50/50 transition-all duration-150"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-neutral-200 rounded-xl px-2 py-2.5 bg-white outline-none focus:border-amber-400 font-medium text-neutral-700"
          >
            <option value="Produce">🥬 Produce</option>
            <option value="Dairy">🥛 Dairy</option>
            <option value="Meat">🥩 Meat/Protein</option>
            <option value="Condiment">🧂 Condiment</option>
            <option value="Beverage">🥤 Beverage</option>
            <option value="Pantry">🥫 Pantry</option>
            <option value="Other">🍽️ Other</option>
          </select>
        </div>
        <button
          id="add-ingredient-btn"
          type="submit"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all duration-150 transform active:scale-98"
        >
          <Plus size={16} />
          Add
        </button>
      </form>

      {/* Tags Container */}
      {ingredients.length === 0 ? (
        <div className="text-center py-8 bg-amber-50/20 border border-amber-50 border-dashed rounded-2xl">
          <HelpCircle size={32} className="text-amber-400/80 mx-auto mb-2" />
          <h4 className="font-semibold text-neutral-700 text-sm mb-0.5">No ingredients listed</h4>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto">
            Scan your fridge above or type ingredients manually to begin drafting.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-6 max-h-[220px] overflow-y-auto pr-1">
          {ingredients.map((ing, idx) => {
            const confidencePercent = Math.round(ing.confidence * 100);
            return (
              <div
                key={`${ing.name}-${idx}`}
                className={`inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full border text-xs font-medium transition-all duration-150 shadow-xs hover:shadow-sm ${getStyleClass(
                  ing.category
                )}`}
              >
                <span>{ing.name}</span>
                {ing.confidence < 1.0 && (
                  <span className="text-[10px] opacity-75 font-mono">
                    {confidencePercent}%
                  </span>
                )}
                <button
                  id={`remove-ing-${idx}`}
                  type="button"
                  onClick={() => onRemoveIngredient(idx)}
                  className="p-0.5 rounded-full hover:bg-black/10 text-neutral-500 hover:text-neutral-800 transition-colors duration-100"
                  title={`Remove ${ing.name}`}
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Button */}
      {ingredients.length > 0 && (
        <div className="pt-2">
          <button
            id="generate-recipe-btn"
            type="button"
            onClick={onGenerateRecipe}
            disabled={isGeneratingRecipe || ingredients.length === 0}
            className="w-full py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all duration-150 transform active:scale-[0.99] hover:shadow-lg"
          >
            <Sparkles size={18} />
            {isGeneratingRecipe ? "Generating Recipes..." : "Generate Creative Recipes"}
          </button>
        </div>
      )}
    </div>
  );
}
