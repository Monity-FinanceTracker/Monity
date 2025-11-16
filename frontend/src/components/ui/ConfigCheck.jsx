import React from 'react';

const ConfigCheck = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const apiUrl = import.meta.env.VITE_API_URL;

  const isConfigured = supabaseUrl && supabaseKey && apiUrl;

  if (isConfigured) {
    return null; // Don't show anything if properly configured
  }

  return (
    <div className="fixed inset-0 bg-[#262624] flex items-center justify-center p-4 z-50">
      <div className="max-w-2xl w-full bg-[#1a1a1a] rounded-lg p-6 text-white">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚙️</div>
          <h1 className="text-2xl font-bold mb-2">Configuration Required</h1>
          <p className="text-gray-400">
            Your Monity app needs to be configured with the proper environment variables.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${supabaseUrl ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={supabaseUrl ? 'text-green-400' : 'text-red-400'}>
              VITE_SUPABASE_URL {supabaseUrl ? '✓' : '✗'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${supabaseKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={supabaseKey ? 'text-green-400' : 'text-red-400'}>
              VITE_SUPABASE_ANON_KEY {supabaseKey ? '✓' : '✗'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${apiUrl ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={apiUrl ? 'text-green-400' : 'text-red-400'}>
              VITE_API_URL {apiUrl ? '✓' : '✗'}
            </span>
          </div>
        </div>

        <div className="bg-[#2a2a2a] rounded p-4 mb-6">
          <h3 className="font-semibold mb-2">Required Environment Variables:</h3>
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`# Create a .env file in the frontend directory with:

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:3001/api/v1

# For production deployment, set these in your hosting platform:
# - Vercel: Project Settings > Environment Variables
# - Netlify: Site Settings > Environment Variables
# - Other platforms: Check their documentation`}
          </pre>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-[#56a69f] text-[#1F1E1D] px-6 py-2 rounded font-medium hover:bg-[#4A8F88] transition-colors"
          >
            Refresh After Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigCheck;
