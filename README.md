# Fridge-to-Recipe Web Application

An AI-powered recipe generator that identifies ingredients from a photo of your fridge or pantry basket and creates custom, step-by-step cooking recipes tailored to your preferences.

Designed for minimum food waste, this full-stack application relies on Google Gemini 3.5 Flash to identify ingredients, lets users modify the list manually, and constructs structured checklists for easy cooking.

---

## 🛠️ Architecture Overview

The application utilizes a secure, full-stack architecture to ensure API safety and quota compliance:

1. **Client-Side Image Optimization**: Before uploading, photos are scaled and compressed client-side using HTML5 canvas, minimizing payloads, reducing latency, and lowering token usage.
2. **Server-Side API Proxy**:
   - The React client never handles or exposes the Gemini API key.
   - All interactions with the Gemini SDK (`@google/genai`) are proxied through an Express.js backend (`server.ts`).
   - The Gemini client is lazy-initialized at call time to prevent module load crashes when environment variables are being injected.
3. **Strict JSON Schema Restraints**: Both Vision extraction and Recipe curation enforce deterministic response schemas via Gemini's `responseSchema` options, bypassing fragile regular expressions.
4. **Quota & Rate-Limit Management**:
   - **Flash Tier Model**: Standardizes on the lightweight, fast, and highly capable `gemini-3.5-flash` model.
   - **Client-Side Caching**: Uses deterministic caches of image payloads and ingredient-filter strings to prevent redundant, wasteful back-and-forth requests.
   - **Double-Submit Prevention**: Disables trigger controls during active operations.
   - **Granular Error Triage**: Specifically traps HTTP 429 status codes and displays clear, helpful quota alerts with manual "Try again" buttons rather than entering infinite silent loops.
5. **Offline/Saved Cookbooks**: Saves bookmarked recipes locally in `LocalStorage` for safe, offline storage.

---

## 📂 Directory Structure

```text
├── server.ts                       # Express full-stack API server & Vite development middleware
├── package.json                    # Full-stack dependency & CJS-bundling esbuild scripts
├── metadata.json                   # Applet configuration with Camera frame permission requested
├── src/
│   ├── main.tsx                    # Main client entry
│   ├── App.tsx                     # Core application dashboard and orchestrating states
│   ├── index.css                   # Global Tailwind CSS imports and variable declarations
│   ├── types.ts                    # Strongly-typed shapes for Ingredients, Recipes, and Filters
│   ├── components/
│   │   ├── Loader.tsx              # Beautiful, chef-themed status visualizer
│   │   └── SavedRecipes.tsx        # Persistent LocalStorage cookbook expanded viewer
│   ├── features/
│   │   ├── camera/
│   │   │   ├── useCamera.ts        # Custom stream hook for MediaDevices camera access
│   │   │   └── CameraScanner.tsx   # Switchable live video frame capturer & drag-and-drop box
│   │   ├── ingredients/
│   │   │   └── IngredientTags.tsx  # Interactive, classified ingredient editor with custom color badges
│   │   └── recipe/
│   │       ├── RecipeFilters.tsx   # Cuisine, dietary restriction, time, and serving filter board
│   │       └── RecipeCard.tsx      # Checkbox-interactive recipe guide with missing/on-hand markers
│   └── utils/
│       ├── imageCompressor.ts      # HTML5 canvas image compressor helper
│       └── apiClient.ts            # Quota-safe, cached REST client for scan-fridge and generate-recipe
```

---

## 🚀 Setup & Local Development

### 1. Download the Project
You can download this codebase as a ZIP file directly from the AI Studio **Settings** menu (click "Export as ZIP" or export to GitHub directly if linked). Unzip the files into your local workspace directory.

### 2. Prerequisite Dependencies
Install the required packages locally:
```bash
npm install
```

### 3. Environment Variables
To use the Gemini AI features locally, you need a Gemini API key.
1. Get a free API key from the [Google AI Studio Console](https://aistudio.google.com/).
2. Create a `.env` file in the root of your project:
   ```env
   GEMINI_API_KEY="your-actual-api-key-here"
   ```

### 4. Start Development Server
Launches the full-stack server running Express + Vite concurrently on port `3000`:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

### 5. Build for Production
Compiles the React application assets into `/dist` and bundles the Express `server.ts` into a self-contained CommonJS (`dist/server.cjs`) using `esbuild`:
```bash
npm run build
```

### 6. Launch Production Server
Executes the bundled, optimized full-stack distribution:
```bash
npm run start
```

---

## 🐙 How to Push to GitHub

Follow these simple steps to host this project on your personal GitHub account.

### Step 1: Initialize Git Locally
If you haven't initialized git in your project directory yet, open your terminal/command prompt inside the project folder and run:
```bash
# Initialize a local git repository
git init

# (Optional) Verify your main branch is named 'main'
git branch -M main
```

### Step 2: Add Files and Commit
```bash
# Stage all files for the initial commit (your .gitignore is already configured to skip node_modules/ and dist/)
git add .

# Commit your changes
git commit -m "Initial commit: Fridge to Recipe application"
```

### Step 3: Create a Repository on GitHub
1. Go to your [GitHub account](https://github.com/) and log in.
2. Click the **"+"** sign in the top right corner and select **"New repository"**.
3. Name your repository (e.g., `fridge-to-recipe`).
4. Keep the repository **Public** or **Private** (according to your preference).
5. **CRITICAL**: Do **NOT** select "Add a README file", "Add .gitignore", or "Choose a license" because we are importing an existing local repository.
6. Click **"Create repository"**.

### Step 4: Link Local Repository to GitHub & Push
GitHub will display a list of setup commands. Copy the **"push an existing repository from the command line"** commands, or run these directly in your terminal:

```bash
# Link your local git to your remote GitHub repository (replace with your GitHub URL)
git remote add origin https://github.com/your-username/fridge-to-recipe.git

# Push your code to the 'main' branch
git push -u origin main
```

Now refresh your GitHub page, and your beautifully structured code with this documentation will be live on GitHub!

