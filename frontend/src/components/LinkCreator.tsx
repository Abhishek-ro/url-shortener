
import React, { useState } from 'react';
import { Link as LinkIcon, Calendar, Lock, Shield, Settings2, Globe2, ChevronDown, Download, Rocket, FileText, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { createShortLink } from '../services/link.service';

const LinkCreator: React.FC = () => {
  const [isExpiring, setIsExpiring] = useState(true);
  const [isProtected, setIsProtected] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(true);
  const [alias, setAlias] = useState('sdk-v2-stable');
  const [destination, setDestination] = useState('https://github.com/boltlink/advanced-sdk/releases/v2.4.0');
  const [isGenerating, setIsGenerating] = useState(false);

  const [isCreating, setIsCreating] = useState(false);


  const suggestAlias = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Suggest 3 catchy, professional, and short URL aliases (max 12 characters, kebab-case) for this destination: ${destination}. Output ONLY a JSON array of strings.`,
        config: { responseMimeType: 'application/json' }
      });
      const suggestions = JSON.parse(response.text);
      if (suggestions && suggestions.length > 0) {
        setAlias(suggestions[0]);
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };


  const handleCreate = async () => {
    if (!destination.trim()) {
      alert('Destination URL is empty.');
      return;
    }

    setIsCreating(true);
    try {
      const newLink = await createShortLink(destination);

      console.log('Created link:', newLink);

      // Optional: Redirect to dashboard after success
      // navigate("/dashboard");
    } catch (error: any) {
      alert(error.message || 'Failed to create link.');
    } finally {
      setIsCreating(false);
    }
  };


  return (
    <div className='max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500'>
      <div className='flex justify-between items-end mb-8'>
        <div>
          <h1 className='text-4xl font-extrabold text-white mb-3'>
            Advanced Link Creator
          </h1>
          <p className='text-slate-400 text-lg'>
            Configure high-performance redirects with custom enterprise rules.
          </p>
        </div>
        <button className='bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border border-slate-700'>
          <FileText className='w-5 h-5' />
          View Documentation
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
        {/* Form Area */}
        <div className='lg:col-span-8 space-y-8'>
          <div className='bg-[#0f141b] border border-slate-800 p-8 rounded-3xl shadow-xl space-y-6'>
            <div className='flex items-center gap-3 text-blue-400 mb-2'>
              <LinkIcon className='w-5 h-5' />
              <h3 className='font-bold text-lg tracking-tight'>
                Destination & Alias
              </h3>
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-bold text-slate-500 uppercase tracking-widest ml-1'>
                Destination URL
              </label>
              <input
                type='text'
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className='w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-lg'
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-2'>
                <label className='text-xs font-bold text-slate-500 uppercase tracking-widest ml-1'>
                  Domain
                </label>
                <div className='relative group'>
                  <select className='w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-all cursor-pointer font-bold'>
                    <option>bolt.link</option>
                    <option>blnk.io</option>
                    <option>goto.sh</option>
                  </select>
                  <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-hover:text-white transition-colors pointer-events-none' />
                </div>
              </div>
              <div className='space-y-2 relative'>
                <label className='text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex justify-between'>
                  Custom Alias
                  <button
                    onClick={suggestAlias}
                    disabled={isGenerating}
                    className='flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50'
                  >
                    {isGenerating ? (
                      <Loader2 className='w-3 h-3 animate-spin' />
                    ) : (
                      <Sparkles className='w-3 h-3' />
                    )}
                    Suggest with AI
                  </button>
                </label>
                <input
                  type='text'
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className='w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono'
                />
                {isGenerating && (
                  <div className='absolute inset-0 bg-indigo-500/10 animate-pulse rounded-xl pointer-events-none' />
                )}
              </div>
            </div>
          </div>

          <div className='bg-[#0f141b] border border-slate-800 p-8 rounded-3xl shadow-xl space-y-8'>
            <div className='flex items-center gap-3 text-blue-400'>
              <Settings2 className='w-6 h-6' />
              <h3 className='font-bold text-lg tracking-tight'>
                Advanced Configuration
              </h3>
            </div>

            <div
              className={`border rounded-2xl p-6 transition-all ${isExpiring ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-800 bg-slate-900/30 opacity-60'}`}
            >
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-4'>
                  <div
                    className={`p-3 rounded-xl ${isExpiring ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                  >
                    <Calendar className='w-5 h-5' />
                  </div>
                  <div>
                    <h4 className='font-bold text-white'>Link Expiration</h4>
                    <p className='text-xs text-slate-500'>
                      Automatically disable link at a specific time.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsExpiring(!isExpiring)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${isExpiring ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isExpiring ? 'left-7' : 'left-1'}`}
                  />
                </button>
              </div>
              {isExpiring && (
                <div className='grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300'>
                  <input
                    type='date'
                    defaultValue='2024-12-31'
                    className='bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:outline-none'
                  />
                  <input
                    type='time'
                    defaultValue='23:59'
                    className='bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:outline-none'
                  />
                </div>
              )}
            </div>

            <div
              className={`border rounded-2xl p-6 transition-all ${isProtected ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 bg-slate-900/30 opacity-60'}`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div
                    className={`p-3 rounded-xl ${isProtected ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                  >
                    <Lock className='w-5 h-5' />
                  </div>
                  <div>
                    <h4 className='font-bold text-white'>
                      Password Protection
                    </h4>
                    <p className='text-xs text-slate-500'>
                      Require a password to access the destination.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProtected(!isProtected)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${isProtected ? 'bg-amber-600' : 'bg-slate-700'}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isProtected ? 'left-7' : 'left-1'}`}
                  />
                </button>
              </div>
            </div>

            <div
              className={`border rounded-2xl p-6 transition-all ${isRateLimited ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/30 opacity-60'}`}
            >
              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-4'>
                  <div
                    className={`p-3 rounded-xl ${isRateLimited ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                  >
                    <Shield className='w-5 h-5' />
                  </div>
                  <div>
                    <h4 className='font-bold text-white'>Rate Limiting</h4>
                    <p className='text-xs text-slate-500'>
                      Limit maximum clicks per unique IP address.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRateLimited(!isRateLimited)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${isRateLimited ? 'bg-emerald-600' : 'bg-slate-700'}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isRateLimited ? 'left-7' : 'left-1'}`}
                  />
                </button>
              </div>
              {isRateLimited && (
                <div className='grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300'>
                  <div className='space-y-1'>
                    <label className='text-[10px] uppercase font-bold text-slate-500 ml-1'>
                      Limit
                    </label>
                    <input
                      type='number'
                      defaultValue='5'
                      className='w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:outline-none'
                    />
                  </div>
                  <div className='space-y-1'>
                    <label className='text-[10px] uppercase font-bold text-slate-500 ml-1'>
                      Window
                    </label>
                    <select className='w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-slate-200 focus:outline-none appearance-none'>
                      <option>Per Hour</option>
                      <option>Per Day</option>
                      <option>Per Week</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='lg:col-span-4 space-y-6'>
          <div className='bg-slate-900/50 border border-slate-800 rounded-3xl p-8 sticky top-24 shadow-2xl backdrop-blur-md'>
            <h4 className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 text-center'>
              Live QR Preview
            </h4>
            <div className='bg-white p-6 rounded-2xl mb-8 flex flex-col items-center'>
              <div className='w-48 h-48 bg-slate-950 flex flex-wrap gap-1 p-4 rounded-xl relative'>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-[23%] h-[23%] ${Math.random() > 0.5 ? 'bg-white' : 'bg-slate-900'} rounded-sm`}
                  />
                ))}
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center border-4 border-white'>
                    <Rocket className='w-6 h-6 text-white' />
                  </div>
                </div>
              </div>
              <p className='mt-6 text-slate-900 font-bold text-xl truncate w-full text-center'>
                bolt.link/{alias}
              </p>
              <p className='text-slate-400 text-xs truncate w-full text-center'>
                {destination}
              </p>
            </div>

            <div className='grid grid-cols-2 gap-3 mb-8'>
              <button className='bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-lg'>
                <Download className='w-4 h-4' /> PNG
              </button>
              <button className='bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-lg'>
                <Download className='w-4 h-4' /> SVG
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='sticky bottom-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl flex items-center justify-between shadow-2xl z-40'>
        <div className='flex items-center gap-2 text-slate-400 text-sm'>
          <Shield className='w-4 h-4 text-blue-500' />
          All links are encrypted by default
        </div>
        <div className='flex gap-4'>
          <button className='text-slate-400 hover:text-white px-6 font-bold transition-colors'>
            Cancel
          </button>
          <button className='bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-bold transition-all border border-slate-700'>
            Save as Draft
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className='bg-blue-600 hover:bg-blue-500 text-white px-10 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-900/40 group disabled:opacity-50'
          >
            {isCreating ? (
              <>
                <Loader2 className='w-5 h-5 animate-spin' />
                Creating...
              </>
            ) : (
              <>
                Create Advanced Link
                <Rocket className='w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform' />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkCreator;
