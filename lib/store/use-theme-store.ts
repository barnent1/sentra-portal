import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeColor = 'violet' | 'slate' | 'blue' | 'green' | 'orange' | 'red' | 'rose' | 'zinc';

interface ThemeState {
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  applyTheme: (color: ThemeColor) => void;
}

const themeColors: Record<ThemeColor, { light: Record<string, string>; dark: Record<string, string> }> = {
  violet: {
    light: {
      primary: '262.1 83.3% 57.8%',
      'primary-foreground': '210 20% 98%',
    },
    dark: {
      primary: '263.4 70% 50.4%',
      'primary-foreground': '210 20% 98%',
    },
  },
  slate: {
    light: {
      primary: '222.2 47.4% 11.2%',
      'primary-foreground': '210 40% 98%',
    },
    dark: {
      primary: '210 40% 98%',
      'primary-foreground': '222.2 47.4% 11.2%',
    },
  },
  blue: {
    light: {
      primary: '221.2 83.2% 53.3%',
      'primary-foreground': '210 40% 98%',
    },
    dark: {
      primary: '217.2 91.2% 59.8%',
      'primary-foreground': '222.2 47.4% 11.2%',
    },
  },
  green: {
    light: {
      primary: '142.1 76.2% 36.3%',
      'primary-foreground': '355.7 100% 97.3%',
    },
    dark: {
      primary: '142.1 70.6% 45.3%',
      'primary-foreground': '144.9 80.4% 10%',
    },
  },
  orange: {
    light: {
      primary: '24.6 95% 53.1%',
      'primary-foreground': '60 9.1% 97.8%',
    },
    dark: {
      primary: '20.5 90.2% 48.2%',
      'primary-foreground': '60 9.1% 97.8%',
    },
  },
  red: {
    light: {
      primary: '346.8 77.2% 49.8%',
      'primary-foreground': '355.7 100% 97.3%',
    },
    dark: {
      primary: '346.8 77.2% 49.8%',
      'primary-foreground': '355.7 100% 97.3%',
    },
  },
  rose: {
    light: {
      primary: '346.8 77.2% 49.8%',
      'primary-foreground': '355.7 100% 97.3%',
    },
    dark: {
      primary: '346.8 77.2% 49.8%',
      'primary-foreground': '355.7 100% 97.3%',
    },
  },
  zinc: {
    light: {
      primary: '240 5.9% 10%',
      'primary-foreground': '0 0% 98%',
    },
    dark: {
      primary: '0 0% 98%',
      'primary-foreground': '240 10% 3.9%',
    },
  },
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeColor: 'violet',
      setThemeColor: (color) => {
        set({ themeColor: color });
        // Apply theme immediately when changed
        const root = document.documentElement;
        const isDark = root.classList.contains('dark');
        const colors = themeColors[color][isDark ? 'dark' : 'light'];
        
        Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value);
        });
      },
      applyTheme: (color) => {
        const root = document.documentElement;
        const isDark = root.classList.contains('dark');
        const colors = themeColors[color][isDark ? 'dark' : 'light'];
        
        Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value);
        });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);