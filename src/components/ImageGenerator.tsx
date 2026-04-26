import { useState, useEffect } from 'react';
import { Image as ImageIcon, Loader2, Download, Sparkles, Maximize2, Lock } from 'lucide-react';
import { generateImage } from '../lib/gemini';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true); // Fallback if not in AI Studio environment
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true); // Proceed assuming success as per skill guidelines
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const result = await generateImage(prompt, size);
      if (result && result.data) {
        setImage(`data:image/png;base64,${result.data}`);
      }
    } catch (error: any) {
      console.error("Image generation error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        alert("Please select a valid paid API key to use this model.");
      } else {
        alert("Failed to generate image. Please ensure you have selected a paid API key with billing enabled.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `generated-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ImageIcon className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">AI Image Studio</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Visualize your project ideas or create professional assets for your portfolio using high-quality AI image generation.
        </p>
      </header>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm space-y-8">
        {!hasKey && hasKey !== null && (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-800 font-bold">
              <Lock className="w-5 h-5" />
              <span>Paid API Key Required</span>
            </div>
            <p className="text-sm text-amber-700">
              The high-quality image model requires a paid Gemini API key with billing enabled. 
              Please select your own API key to proceed.
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectKey}
                className="bg-amber-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md"
              >
                Select API Key
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-amber-600 underline font-medium"
              >
                Learn about billing
              </a>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Describe your image</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A professional workspace with a laptop, coffee, and a plant in a minimalist style, emerald green accents..."
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all min-h-[120px] text-lg"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full space-y-4">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Resolution</label>
            <div className="grid grid-cols-3 gap-4">
              {(["1K", "2K", "4K"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`py-3 rounded-xl font-bold transition-all border-2 ${
                    size === s 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                      : 'bg-white border-gray-100 text-gray-500 hover:border-emerald-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isLoading}
            className="w-full md:w-auto bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/30 active:scale-95 mt-auto"
          >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            {isLoading ? 'Generating...' : 'Create Image'}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="bg-white p-20 rounded-[2.5rem] border border-gray-200 shadow-sm flex flex-col items-center justify-center text-gray-500 space-y-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
            <ImageIcon className="w-10 h-10 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xl font-bold text-gray-900">Painting your vision...</p>
          <p className="text-gray-500">This might take a few seconds depending on the resolution.</p>
        </div>
      )}

      {image && !isLoading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative group rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl bg-white">
            <img src={image} alt="Generated" className="w-full h-auto" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button 
                onClick={downloadImage}
                className="bg-white text-gray-900 p-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-colors"
              >
                <Download className="w-6 h-6" />
                Download
              </button>
              <button 
                className="bg-white/20 backdrop-blur-md text-white p-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-white/30 transition-colors"
              >
                <Maximize2 className="w-6 h-6" />
                Full Size
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold">
              <Sparkles className="w-5 h-5" />
              <span>Generated in {size} Resolution</span>
            </div>
            <p className="text-gray-400 text-sm">AI Model: gemini-3-pro-image-preview</p>
          </div>
        </div>
      )}
    </div>
  );
}
