import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ value = '', placeholder = 'Search...', onSearch, debounceMs = 300 }) => {
  const [query, setQuery] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="input pl-10 pr-10"
      />
      {query && (
        <button
          onClick={() => { setQuery(''); onSearch(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
