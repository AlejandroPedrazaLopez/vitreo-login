import { create } from 'zustand';

export const useLanguageStore = create((set: any) => ({
    language: 'en',
    setLanguage: (lang: string) => set({ language: lang }),
  }));
  