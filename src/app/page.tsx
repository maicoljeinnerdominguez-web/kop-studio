'use client';

import { useNavigationStore } from '@/stores/useNavigationStore';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { MessageCircle } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import CartDrawer from '@/components/layout/CartDrawer';
import Footer from '@/components/layout/Footer';

const HomeView = lazy(() => import('@/components/home/HomeView'));
const CollectionView = lazy(() => import('@/components/product/CollectionView'));
const ProductDetailView = lazy(() => import('@/components/product/ProductDetailView'));
const CheckoutView = lazy(() => import('@/components/checkout/CheckoutView'));
const OrderConfirmation = lazy(() => import('@/components/checkout/OrderConfirmation'));
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('@/components/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('@/components/admin/AdminProductForm'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 tracking-widest">CARGANDO...</p>
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

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdmin && (
        <>
          <AnnouncementBar />
          <Header />
        </>
      )}
      <main className="flex-1">
        <ViewRouter />
      </main>
      {!isAdmin && <Footer />}
      <CartDrawer />

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
    </div>
  );
}