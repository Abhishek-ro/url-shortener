import React from 'react';
import { useLinks } from "../hooks/useLinks";

const Links: React.FC = () => {
  const { links, loading, editLink, removeLink } = useLinks();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-500 font-bold animate-pulse">Loading links...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Link Management</h1>
      <div className="bg-white dark:bg-[#0f141b] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl dark:shadow-none overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold tracking-widest">
              <th className="pb-4 px-2">Short URL</th>
              <th className="pb-4 px-2">Original URL</th>
              <th className="pb-4 px-2">Clicks</th>
              <th className="pb-4 px-2">Created At</th>
              <th className="pb-4 px-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {links.map((link) => (
              <tr key={link.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-4 px-2 font-bold text-blue-600 dark:text-blue-400">
                  {link.shortUrl}
                </td>
                <td className="py-4 px-2 text-slate-600 dark:text-slate-400 truncate max-w-xs">
                  {link.originalUrl}
                </td>
                <td className="py-4 px-2 font-mono text-xs font-semibold">
                  {link.clicks.toLocaleString()}
                </td>
                <td className="py-4 px-2 text-slate-500 text-xs">
                  {new Date(link.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-2 space-x-4">
                  <button 
                    onClick={() => editLink(link.id, { originalUrl: prompt("New URL:", link.originalUrl) || link.originalUrl })}
                    className="text-blue-600 hover:text-blue-800 font-bold text-xs transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => removeLink(link.id)}
                    className="text-red-600 hover:text-red-800 font-bold text-xs transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400 font-medium italic">
                  No links generated yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Links;