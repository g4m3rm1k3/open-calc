import React, { useState, lazy, Suspense } from 'react';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { Search } from 'lucide-react';

// Use Vite's glob import to automatically pick up all viz components
const vizReactModules = import.meta.glob('../components/viz/react/**/*.jsx');
const vizD3Modules = import.meta.glob('../components/viz/d3/**/*.jsx');
const vizGitModules = import.meta.glob('../components/viz/git/**/*.jsx');
const vizCadModules = import.meta.glob('../labs/cad-pro/cad/**/*.jsx');

const allModules = {
  ...vizReactModules,
  ...vizD3Modules,
  ...vizGitModules,
  ...vizCadModules
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.componentPath !== this.props.componentPath) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 p-8 flex items-center justify-center bg-white dark:bg-slate-950">
          <div className="max-w-2xl w-full p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/50 shadow-xl">
            <h3 className="text-xl font-bold mb-2">Visualization Crashed</h3>
            <p className="mb-4 text-sm opacity-80">This component threw an error during rendering.</p>
            <pre className="p-4 bg-white dark:bg-black/50 rounded-lg overflow-auto text-xs font-mono border border-red-100 dark:border-red-900/50 max-h-96">
              {this.state.error?.toString() || 'Unknown Error'}
              {'\n'}
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function VizGalleryPage() {
  const [selectedPath, setSelectedPath] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const files = Object.keys(allModules).sort();
  const filteredFiles = files.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase()));

  const SelectedComponent = selectedPath ? lazy(allModules[selectedPath]) : null;

  return (
    <div className="flex w-full overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans" style={{ height: 'calc(100vh - 3.5rem)' }}>
      
      {/* Sidebar List */}
      <div className="w-80 shrink-0 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900 shadow-xl z-10 relative">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <h1 className="text-xl font-black mb-1">Viz Gallery</h1>
          <p className="text-xs font-medium text-slate-500 mb-4">{files.length} components found</p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search components..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {filteredFiles.map(path => {
            const fileName = path.split('/').pop();
            const folderName = path.split('/').slice(-2, -1)[0];
            const isSelected = selectedPath === path;
            
            return (
              <button
                key={path}
                onClick={() => setSelectedPath(path)}
                className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 flex flex-col transition-all ${
                  isSelected 
                    ? 'bg-brand-100 dark:bg-brand-600/20 border border-brand-300 dark:border-brand-500/30 text-brand-700 dark:text-brand-300' 
                    : 'text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title={path}
              >
                <span className="text-sm font-medium truncate">{fileName}</span>
                <span className={`text-[10px] uppercase tracking-widest font-bold mt-0.5 truncate ${isSelected ? 'text-brand-600/70 dark:text-brand-400/70' : 'text-slate-400 dark:text-slate-600'}`}>
                  {folderName}
                </span>
              </button>
            )
          })}
          {filteredFiles.length === 0 && (
            <div className="text-center p-8 text-sm text-slate-500 dark:text-slate-600">No components match your search.</div>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col overflow-y-auto relative bg-slate-100/50 dark:bg-[#0a0a0f] p-8">
        {selectedPath ? (
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            {/* Context/Path Header */}
            <div className="w-full mb-6 flex justify-between items-center text-xs font-mono text-slate-500 dark:text-slate-400 opacity-70">
              <span>{selectedPath}</span>
              <span className="uppercase tracking-wider font-sans font-bold">Standard Container (max-w-4xl)</span>
            </div>

            {/* Simulated Lesson Container */}
            <div className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/50 shadow-sm rounded-2xl overflow-hidden min-h-[400px] relative">
               <ErrorBoundary componentPath={selectedPath}>
                 <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
                   <SelectedComponent />
                 </Suspense>
               </ErrorBoundary>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm opacity-50">
              <div className="w-16 h-16 border-2 border-slate-300 dark:border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border-dashed">
                <Search className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Select a Component</h2>
              <p className="text-sm text-slate-500">
                Visualizations will render here inside a simulated lesson container, allowing you to accurately test their styles and toggle dark mode via the top nav.
              </p>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
