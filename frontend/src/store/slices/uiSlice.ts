import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

const getInitialTheme = (): 'light' | 'dark' => {
  const saved = localStorage.getItem('shipflow_theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialState: UiState = {
  theme: getInitialTheme(),
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('shipflow_theme', state.theme);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleTheme, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;
