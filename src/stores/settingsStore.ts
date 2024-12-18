import { create } from 'zustand';


interface SettingsStore {
  isVoiceEnabled: boolean;
  toggleVoice: () => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  isVoiceEnabled: true,
  toggleVoice: () => set((state) => ({ isVoiceEnabled: !state.isVoiceEnabled })),
}));