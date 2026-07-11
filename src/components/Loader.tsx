/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ChefHat, Utensils, Flame, Sparkles } from "lucide-react";

interface LoaderProps {
  message?: string;
  type?: "scan" | "recipe";
}

const SCAN_MESSAGES = [
  "Analyzing photo with Gemini Flash...",
  "Identifying ingredients on hand...",
  "Categorizing produce and proteins...",
  "Double checking confidence scores...",
];

const RECIPE_MESSAGES = [
  "Simmering ingredients in the pot...",
  "Consulting the AI Chef Masterclass...",
  "Pairing flavors together...",
  "Structuring step-by-step cooking checklists...",
  "Formulating the perfect recipe...",
];

export function Loader({ message, type = "scan" }: LoaderProps) {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = type === "scan" ? SCAN_MESSAGES : RECIPE_MESSAGES;

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-amber-100 rounded-3xl shadow-sm max-w-md mx-auto">
      {/* Decorative Rotating/pulsing Outer circle */}
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-full border-4 border-amber-100 border-t-amber-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-amber-600">
          {type === "scan" ? (
            <ChefHat size={32} className="animate-bounce" />
          ) : (
            <Flame size={32} className="animate-pulse text-amber-500" />
          )}
        </div>
        <div className="absolute -top-1 -right-1 bg-green-100 p-1 rounded-full text-green-700 animate-pulse">
          <Sparkles size={12} />
        </div>
      </div>

      <h3 className="font-bold text-neutral-800 text-base mb-1.5 flex items-center gap-1.5 justify-center">
        {type === "scan" ? "Scanning Fridge Image" : "Curating Custom Recipes"}
      </h3>
      <p className="text-xs text-neutral-500 font-medium h-4 transition-all duration-300">
        {message || messages[msgIndex]}
      </p>

      {/* Mini Loading Bars */}
      <div className="flex gap-1.5 justify-center items-center mt-5 w-24">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce delay-100"></span>
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce delay-200"></span>
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-bounce delay-300"></span>
      </div>
    </div>
  );
}
