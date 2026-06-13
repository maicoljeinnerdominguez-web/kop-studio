'use client';

import { useNavigationStore } from '@/stores/useNavigationStore';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense } from 'react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import CartDrawer from '@/components/layout/CartDrawer';
import Footer from '@/components/layout/Footer';

const HomeView = lazy(() => import('@/components/home/HomeView'));
const CollectionView = lazy(() => import('@/components/product/CollectionView'));
const ProductDetailView = lazy(() => import('@/components/product/ProductDetailView'));
const CheckoutView = lazy(() => import('@/components/checkout/CheckoutView'));
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
    </div>
  );
}