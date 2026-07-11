/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Clock, Users, Flame, Star, Save, CheckCircle, PlusCircle, Bookmark, BookmarkCheck } from "lucide-react";
import { Recipe } from "../../types";

interface RecipeCardProps {
  recipe: Recipe;
  isSaved: boolean;
  onSaveToggle: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSaved, onSaveToggle }) => {
  // Local state to keep track of checked cooking steps for interactive checklist
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="bg-white rounded-3xl border border-amber-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-5">
      {/* Recipe Header */}
      <div className="flex items-start justify-between gap-4 pb-2 border-b border-amber-50">
        <div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border mb-2 ${getDifficultyColor(
              recipe.difficulty
            )}`}
          >
            {recipe.difficulty}
          </span>
          <h3 className="text-xl font-extrabold text-neutral-800 leading-tight">
            {recipe.title}
          </h3>
          <p className="text-sm text-neutral-500 mt-1.5 leading-relaxed">
            {recipe.description}
          </p>
        </div>
        <button
          id={`save-recipe-btn-${recipe.title.replace(/\s+/g, "-")}`}
          type="button"
          onClick={onSaveToggle}
          className={`p-2.5 rounded-full border transition-all duration-200 flex-shrink-0 ${
            isSaved
              ? "bg-amber-500 border-amber-500 text-neutral-950 shadow-sm"
              : "border-neutral-200 hover:border-amber-300 text-neutral-500 hover:text-amber-700"
          }`}
          title={isSaved ? "Saved to Recipes" : "Save Recipe"}
        >
          {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-3 bg-neutral-50/50 rounded-2xl p-3 border border-neutral-100">
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1 mb-1">
            <Clock size={11} />
            Prep / Cook
          </span>
          <span className="text-sm font-bold text-neutral-700 font-mono">
            {recipe.prepTime}m / {recipe.cookTime}m
          </span>
        </div>
        <div className="flex flex-col items-center text-center border-x border-neutral-100">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1 mb-1">
            <Flame size={11} />
            Total Time
          </span>
          <span className="text-sm font-bold text-amber-600 font-mono">
            {totalTime} mins
          </span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-1 mb-1">
            <Users size={11} />
            Servings
          </span>
          <span className="text-sm font-bold text-neutral-700 font-mono">
            {recipe.servings} portions
          </span>
        </div>
      </div>

      {/* Ingredients Used / Missing */}
      <div className="space-y-4">
        <div>
          <h4 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider mb-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Using Ingredients On-Hand
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {recipe.ingredientsUsed.map((ing, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg font-medium"
              >
                <CheckCircle size={12} className="text-emerald-600" />
                {ing}
              </span>
            ))}
          </div>
        </div>

        {recipe.ingredientsMissing.length > 0 && (
          <div>
            <h4 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider mb-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Pantry Staples or Missing Additions
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {recipe.ingredientsMissing.map((ing, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded-lg font-medium"
                >
                  <PlusCircle size={12} className="text-amber-600" />
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cooking Instructions (Cooking checklist style) */}
      <div className="pt-3 border-t border-amber-50">
        <h4 className="text-sm font-bold text-neutral-800 mb-3 flex items-center gap-1.5">
          <Star size={16} className="text-amber-500 fill-amber-500" />
          Step-by-Step Cooking Guide
        </h4>
        <div className="space-y-3">
          {recipe.steps.map((step, idx) => {
            const isChecked = !!completedSteps[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`flex gap-3 p-3 rounded-2xl border transition-all duration-150 cursor-pointer select-none ${
                  isChecked
                    ? "bg-neutral-50/50 border-neutral-150 opacity-60"
                    : "bg-white border-neutral-100 hover:border-amber-150"
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Handle inside parent click
                    className="h-4.5 w-4.5 accent-green-600 rounded-md cursor-pointer"
                  />
                </div>
                <div className="flex-1 text-sm text-neutral-700 leading-relaxed">
                  <span className="font-bold text-neutral-400 mr-1.5 font-mono">
                    {idx + 1}.
                  </span>
                  <span className={isChecked ? "line-through text-neutral-400" : ""}>
                    {step}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
