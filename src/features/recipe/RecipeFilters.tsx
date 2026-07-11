/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { SlidersHorizontal, Clock, Users, Utensils, Heart } from "lucide-react";
import { RecipeFilters as FilterType } from "../../types";

interface RecipeFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
}

const CUISINES = ["Any", "Italian", "Mexican", "Asian", "Indian", "Mediterranean", "American", "French"];
const DIETARY = ["None", "Vegetarian", "Vegan", "Gluten-Free", "Keto", "Low-Carb"];

export function RecipeFilters({ filters, onChange }: RecipeFiltersProps) {
  const updateFilter = (key: keyof FilterType, value: any) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm transition-all duration-300">
      <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-1.5 mb-4 pb-2 border-b border-amber-50">
        <SlidersHorizontal size={16} className="text-amber-500" />
        Customize Recipe Output (Optional)
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cuisine Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
            <Utensils size={12} className="text-neutral-400" />
            Cuisine Type
          </label>
          <select
            value={filters.cuisine}
            onChange={(e) => updateFilter("cuisine", e.target.value)}
            className="text-xs border border-neutral-200 rounded-xl px-3 py-2.5 bg-neutral-50/50 hover:bg-neutral-50 font-medium text-neutral-700 outline-none focus:border-amber-400 transition-colors"
          >
            {CUISINES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Dietary Restriction Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-500 flex items-center gap-1">
            <Heart size={12} className="text-neutral-400" />
            Dietary Preference
          </label>
          <select
            value={filters.dietaryRestriction}
            onChange={(e) => updateFilter("dietaryRestriction", e.target.value)}
            className="text-xs border border-neutral-200 rounded-xl px-3 py-2.5 bg-neutral-50/50 hover:bg-neutral-50 font-medium text-neutral-700 outline-none focus:border-amber-400 transition-colors"
          >
            {DIETARY.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Cooking Time Slider */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-neutral-400" />
              Max Cooking Time
            </span>
            <span className="text-amber-600 font-bold font-mono">
              {filters.maxCookTime === 0 ? "Any time" : `${filters.maxCookTime}m`}
            </span>
          </label>
          <div className="flex items-center gap-2 h-10 px-1">
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={filters.maxCookTime}
              onChange={(e) => updateFilter("maxCookTime", parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 h-1.5 bg-neutral-100 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Servings */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Users size={12} className="text-neutral-400" />
              Target Servings
            </span>
            <span className="text-amber-600 font-bold font-mono">
              {filters.servings === 0 ? "Any size" : `${filters.servings} serving(s)`}
            </span>
          </label>
          <div className="flex items-center gap-2 h-10">
            {[1, 2, 4, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => updateFilter("servings", filters.servings === num ? 0 : num)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${
                  filters.servings === num
                    ? "bg-amber-500 border-amber-500 text-neutral-950 shadow-xs"
                    : "border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
