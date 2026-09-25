import { create } from "zustand";
import type { AppView } from "@/types";

// The app renders every view from "/", so the current view and its params are
// mirrored into the query string (e.g. /?view=product&id=abc). This makes the
// browser back/forward buttons, reloads and shared links work.

const VIEWS: readonly AppView[] = [
  "home",
  "collection",
  "product",
  "checkout",
  "order-confirmation",
  "admin-dashboard",
  "admin-products",
  "admin-products-new",
  "admin-products-edit",
  "admin-promos",
  "admin-orders",
  "admin-categories",
  "admin-settings",
  "wishlist",
  "order-tracking",
  "order-history",
  "product-comparison",
  "info-page",
];

interface NavigationStore {
  currentView: AppView;
  viewParams: Record<string, string>;
  previousView: AppView | null;
  navigate: (view: AppView, params?: Record<string, string>) => void;
  goBack: () => void;
  /** Syncs state from the current URL; call once on mount. Returns a cleanup fn. */
  initFromUrl: () => () => void;
}

function buildUrl(view: AppView, params: Record<string, string>): string {
  if (view === "home") return "/";
  const search = new URLSearchParams({ view, ...params });
  return `/?${search.toString()}`;
}

function parseUrl(): { view: AppView; params: Record<string, string> } {
  const search = new URLSearchParams(window.location.search);
  const view = search.get("view") as AppView | null;
  if (!view || !VIEWS.includes(view)) return { view: "home", params: {} };
  search.delete("view");
  return { view, params: Object.fromEntries(search.entries()) };
}

export const useNavigationStore = create<NavigationStore>()((set, get) => ({
  currentView: "home",
  viewParams: {},
  previousView: null,

  navigate: (view, params = {}) => {
    const { currentView } = get();
    set({
      previousView: currentView,
      currentView: view,
      viewParams: params,
    });
    const url = buildUrl(view, params);
    if (url !== window.location.pathname + window.location.search) {
      window.history.pushState({ kop: true }, "", url);
    }
    // Instant jump: smooth-scrolling during the page transition feels janky
    window.scrollTo({ top: 0, behavior: "instant" });
  },

  goBack: () => {
    // Prefer real browser history so back/forward stay consistent
    if (window.history.state?.kop) {
      window.history.back();
      return;
    }
    get().navigate("home");
  },

  initFromUrl: () => {
    const apply = () => {
      const { view, params } = parseUrl();
      set((state) => ({
        previousView: state.currentView,
        currentView: view,
        viewParams: params,
      }));
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    const { view, params } = parseUrl();
    if (view !== "home") set({ currentView: view, viewParams: params });
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  },
}));
