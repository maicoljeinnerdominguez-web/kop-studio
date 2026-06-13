'use client';

import { useNavigationStore } from '@/stores/useNavigationStore';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useState } from 'react';
import { MessageCircle, ArrowUp } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import PromoBanner from '@/components/promo/PromoBanner';
import Header from '@/components/layout/Header';
import CartDrawer from '@/components/layout/CartDrawer';
import Footer from '@/components/layout/Footer';
import SearchCommandPalette from '@/components/search/SearchCommandPalette';
import SocialProofNotification from '@/components/social/SocialProofNotification';
import CompareFloatingBar from '@/components/product/CompareFloatingBar';

const HomeView = lazy(() => import('@/components/home/HomeView'));
const CollectionView = lazy(() => import('@/components/product/CollectionView'));
const ProductDetailView = lazy(() => import('@/components/product/ProductDetailView'));
const CheckoutView = lazy(() => import('@/components/checkout/CheckoutView'));
const OrderConfirmation = lazy(() => import('@/components/checkout/OrderConfirmation'));
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('@/components/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('@/components/admin/AdminProductForm'));
const OrderTrackingView = lazy(() => import('@/components/order/OrderTrackingView'));
const OrderHistoryView = lazy(() => import('@/components/order/OrderHistoryView'));
const WishlistView = lazy(() => import('@/components/wishlist/WishlistView'));
const ProductComparisonView = lazy(() => import('@/components/product/ProductComparisonView'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-neutral-500 tracking-widest">CARGANDO...</p>
      </div>
    </div>
  );
}

function ViewRouter() {
  const { currentView, viewParams } = useNavigationStore();

  const views: Record<string, React.ReactNode> = {
    home: <HomeView />,
    collection: <CollectionView />,
    product: <ProductDetailView />,
    checkout: <CheckoutView />,
    'order-confirmation': <OrderConfirmation />,
    'admin-dashboard': <AdminDashboard />,
    'admin-products': <AdminProducts />,
    'admin-products-new': <AdminProductForm />,
    'admin-products-edit': <AdminProductForm />,
    wishlist: <WishlistView />,
    'order-tracking': <OrderTrackingView />,
    'order-history': <OrderHistoryView />,
    'product-comparison': <ProductComparisonView />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView + JSON.stringify(viewParams)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {views[currentView] || <HomeView />}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Page() {
  const { currentView } = useNavigationStore();
  const isAdmin = currentView.startsWith('admin');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && (
        <>
          <AnnouncementBar />
          <PromoBanner />
          <Header />
        </>
      )}
      <main className="flex-1">
        <ViewRouter />
      </main>
      {!isAdmin && <Footer />}
      <CartDrawer />
      <SearchCommandPalette />

      {/* Social Proof Notification */}
      {!isAdmin && <SocialProofNotification />}

      {/* Compare Floating Bar */}
      {!isAdmin && <CompareFloatingBar />}

      {/* Floating WhatsApp - only on non-admin views */}
      {!isAdmin && (
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 transition-all hover:scale-110"
        >
          <MessageCircle className="size-6 text-white" fill="white" />
        </a>
      )}

      {/* Back to Top - only on non-admin views */}
      {!isAdmin && (
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Volver arriba"
              className="fixed bottom-6 left-6 z-50 w-11 h-11 bg-[#1a1a1a] border border-[#333] hover:bg-white hover:text-black text-white rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <ArrowUp className="size-4" />
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}