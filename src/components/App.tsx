'use client';

import { useNavigationStore } from '@/stores/useNavigationStore';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useState } from 'react';
import { MessageCircle, ArrowUp } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import PromoBanner from '@/components/promo/PromoBanner';
import Header from '@/components/layout/Header';
import CartDrawer from '@/components/layout/CartDrawer';
import Footer from '@/components/layout/Footer';
import NewsletterSuccess from '@/components/layout/NewsletterSuccess';
import SearchCommandPalette from '@/components/search/SearchCommandPalette';
import SocialProofNotification from '@/components/social/SocialProofNotification';
import CompareFloatingBar from '@/components/product/CompareFloatingBar';
import AbandonedCartNotification from '@/components/cart/AbandonedCartNotification';
import UserAuthDialog from '@/components/layout/UserAuthDialog';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSiteSettings, whatsappLink } from '@/lib/siteSettings';

const HomeView = lazy(() => import('@/components/home/HomeView'));
const CollectionView = lazy(() => import('@/components/product/CollectionView'));
const ProductDetailView = lazy(() => import('@/components/product/ProductDetailView'));
const CheckoutView = lazy(() => import('@/components/checkout/CheckoutView'));
const OrderConfirmation = lazy(() => import('@/components/checkout/OrderConfirmation'));
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('@/components/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('@/components/admin/AdminProductForm'));
const AdminPromos = lazy(() => import('@/components/admin/AdminPromos'));
const AdminOrders = lazy(() => import('@/components/admin/AdminOrders'));
const AdminCategories = lazy(() => import('@/components/admin/AdminCategories'));
const AdminSettings = lazy(() => import('@/components/admin/AdminSettings'));
const OrderTrackingView = lazy(() => import('@/components/order/OrderTrackingView'));
const OrderHistoryView = lazy(() => import('@/components/order/OrderHistoryView'));
const WishlistView = lazy(() => import('@/components/wishlist/WishlistView'));
const ProductComparisonView = lazy(() => import('@/components/product/ProductComparisonView'));
const InfoPageView = lazy(() => import('@/components/info/InfoPageView'));

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
  const isAdminUser = useAuthStore((s) => s.isAdmin);

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
    'admin-promos': <AdminPromos />,
    'admin-orders': <AdminOrders />,
    'admin-categories': <AdminCategories />,
    'admin-settings': <AdminSettings />,
    wishlist: <WishlistView />,
    'order-tracking': <OrderTrackingView />,
    'order-history': <OrderHistoryView />,
    'product-comparison': <ProductComparisonView />,
    'info-page': <InfoPageView />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView + JSON.stringify(viewParams)}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Admin sub-pages opened by URL without a session fall back to the
              dashboard, which shows the login dialog (APIs enforce auth anyway). */}
          {currentView.startsWith('admin') && !isAdminUser
            ? <AdminDashboard />
            : views[currentView] || <HomeView />}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const { currentView, initFromUrl } = useNavigationStore();
  const isAdmin = currentView.startsWith('admin');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { whatsappNumber } = useSiteSettings();
  const whatsappHref = whatsappLink(whatsappNumber, 'Hola KOP STUDIO, tengo una pregunta');

  // Restore the view from the URL and follow browser back/forward
  useEffect(() => initFromUrl(), [initFromUrl]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // reducedMotion="user": honor the OS "reduce motion" setting for all framer-motion animations
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col">
        {!isAdmin && (
          <>
            <AnnouncementBar />
            <PromoBanner />
            <Header />
          </>
        )}
        <main id="main-content" className="flex-1">
          <ViewRouter />
        </main>
        {!isAdmin && <Footer />}
        {!isAdmin && <NewsletterSuccess />}
        <CartDrawer />
        <SearchCommandPalette />
        <UserAuthDialog />

        {/* Social Proof Notification */}
        {!isAdmin && <SocialProofNotification />}

        {/* Compare Floating Bar */}
        {!isAdmin && <CompareFloatingBar />}

        {/* Abandoned Cart Notification */}
        {!isAdmin && <AbandonedCartNotification />}

        {/* Floating WhatsApp - only on non-admin views */}
        {!isAdmin && whatsappHref && (
          <a
            href={whatsappHref}
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
    </MotionConfig>
  );
}