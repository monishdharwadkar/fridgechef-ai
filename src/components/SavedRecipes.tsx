/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Bookmark, Trash2, ChevronDown, ChevronUp, Clock, Flame, Users, CheckCircle, PlusCircle } from "lucide-react";
import { Recipe } from "../types";

interface SavedRecipesProps {
  savedRecipes: Recipe[];
  onRemove: (title: string) => void;
}

export function SavedRecipes({ savedRecipes, onRemove }: SavedRecipesProps) {
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const toggleExpand = (title: string) => {
    setExpandedRecipe((prev) => (prev === title ? null : title));
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm transition-all duration-300">
      <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-1.5 mb-1 pb-3 border-b border-amber-50">
        <Bookmark size={20} className="text-amber-500 fill-amber-500" />
        Saved Cookbook
        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
          {savedRecipes.length}
        </span>
      </h3>

      {savedRecipes.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark size={36} className="text-neutral-300 mx-auto mb-3" />
          <h4 className="font-semibold text-neutral-600 text-sm mb-1">Your cookbook is empty</h4>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Generate and bookmark recipes to save them offline. They'll show up here for quick cooking lookups!
          </p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {savedRecipes.map((recipe) => {
            const isExpanded = expandedRecipe === recipe.title;
            const totalTime = recipe.prepTime + recipe.cookTime;
            return (
              <div key={recipe.title} className="py-4 first:pt-2 last:pb-2">
                <div
                  onClick={() => toggleExpand(recipe.title)}
                  className="flex items-start justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex-1">
                    <h4 className="font-extrabold text-neutral-800 group-hover:text-amber-600 transition-colors text-sm">
                      {recipe.title}
                    </h4>
                    <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                      {recipe.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-neutral-400 font-medium">
                      <span className="flex items-center gap-0.5">
                        <Clock size={10} />
                        {totalTime}m
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Users size={10} />
                        {recipe.servings}p
                      </span>
                      <span className="px-1.5 py-0.5 bg-neutral-100 rounded-md font-semibold text-neutral-600 uppercase text-[9px]">
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      id={`remove-saved-btn-${recipe.title.replace(/\s+/g, "-")}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(recipe.title);
                      }}
                      className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-150"
                      title="Remove from Cookbook"
                    >
                      <Trash2 size={14} />
                    </button>
                    <span className="text-neutral-400 group-hover:text-neutral-600">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-col gap-4 bg-neutral-50/50 p-4 rounded-2xl animate-fadeIn">
                    <div>
                      <h5 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">
                        Ingredients Used
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.ingredientsUsed.map((ing, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-md"
                          >
                            <CheckCircle size={10} className="text-emerald-600" />
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>

                    {recipe.ingredientsMissing.length > 0 && (
                      <div>
                        <h5 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">
                          Missing Ingredients
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {recipe.ingredientsMissing.map((ing, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-100 rounded-md"
                            >
                              <PlusCircle size={10} className="text-amber-600" />
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h5 className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">
                        Steps
                      </h5>
                      <ol className="space-y-2 list-decimal list-inside text-xs text-neutral-700 leading-relaxed pl-1">
                        {recipe.steps.map((step, idx) => (
                          <li key={idx} className="marker:font-bold marker:text-neutral-400">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
