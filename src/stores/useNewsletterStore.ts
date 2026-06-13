import { create } from 'zustand';

interface NewsletterStore {
  showSuccess: boolean;
  triggerSuccess: () => void;
  dismissSuccess: () => void;
}

export const useNewsletterStore = create<NewsletterStore>((set) => ({
  showSuccess: false,
  triggerSuccess: () => {
    // Only show once per session
    if (sessionStorage.getItem('kop-newsletter-shown')) return;
    set({ showSuccess: true });
    sessionStorage.setItem('kop-newsletter-shown', 'true');
  },
  dismissSuccess: () => set({ showSuccess: false }),
}));
