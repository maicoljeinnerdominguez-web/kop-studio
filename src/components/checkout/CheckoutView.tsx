'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Smartphone,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lock,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useCartStore } from '@/stores/useCartStore';

const contactSchema = z.object({
  firstName: z.string().min(1, 'Nombre es requerido'),
  lastName: z.string().min(1, 'Apellido es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Teléfono es requerido'),
});

const addressSchema = z.object({
  address: z.string().min(1, 'Dirección es requerida'),
  city: z.string().min(1, 'Ciudad es requerida'),
  department: z.string().min(1, 'Departamento es requerido'),
  neighborhood: z.string().min(1, 'Barrio es requerido'),
  postalCode: z.string().min(1, 'Código postal es requerido'),
});

type ContactData = z.infer<typeof contactSchema>;
type AddressData = z.infer<typeof addressSchema>;

const DEPARTMENTS = [
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Otro',
];

const PSE_BANKS = [
  'Bancolombia',
  'Davivienda',
  'BBVA',
  'Banco de Bogotá',
  'Banco Popular',
  'Itaú',
  'Scotiabank Colpatria',
  'Occidente',
  'Banco Agrario',
  'Av Villas',
];

function formatPrice(amount: number) {
  return `$${Math.round(amount).toLocaleString('es-CO')}`;
}

/* ────────────────────────────────────────────
   Enhanced Step Indicator
   ──────────────────────────────────────────── */
function StepIndicator({
  currentStep,
}: {
  currentStep: number;
}) {
  const steps = [
    { num: 1, label: 'Contacto' },
    { num: 2, label: 'Dirección' },
    { num: 3, label: 'Pago' },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-10 w-full max-w-md mx-auto">
      {steps.map((s, index) => {
        const isActive = s.num === currentStep;
        const isCompleted = s.num < currentStep;

        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isActive
                    ? 'bg-red-600 text-white'
                    : 'bg-[#1a1a1a] text-neutral-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{s.num}</span>
                )}
              </div>
              <span
                className={`text-[10px] mt-2 uppercase tracking-wider font-medium ${
                  isCompleted
                    ? 'text-green-500'
                    : isActive
                    ? 'text-white'
                    : 'text-neutral-500'
                }`}
              >
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-[2px] mx-2 mt-[-18px] transition-colors duration-300 ${
                  s.num < currentStep ? 'bg-green-600' : 'bg-[#1a1a1a]'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────
   Order Summary Sidebar (Desktop sticky + Mobile collapsible)
   ──────────────────────────────────────────── */
function OrderSummarySidebar() {
  const { items, getSubtotal, getTotal, hasFreeShipping, getItemCount } = useCartStore();
  const subtotal = getSubtotal();
  const total = getTotal();
  const freeShipping = hasFreeShipping();
  const shipping = freeShipping ? 0 : 15000;

  const primaryImage = (product: { images: { url: string; isPrimary: boolean }[] }) =>
    product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || '';

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
      <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
        Resumen del Pedido
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto mb-4 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-track]:bg-transparent">
        {items.map((item) => {
          const img = primaryImage(item.product);
          return (
            <div key={item.variant.id} className="flex gap-3">
              <div className="w-14 h-14 flex-shrink-0 bg-[#1a1a1a] overflow-hidden">
                {img && (
                  <img
                    src={img}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {item.product.title}
                </p>
                <p className="text-neutral-500 text-[11px] mt-0.5">
                  {item.variant.size} / {item.variant.color} — Cantidad: {item.quantity}
                </p>
                <p className="text-white text-xs font-bold mt-0.5">
                  {formatPrice(item.product.price * item.quantity)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-[#1a1a1a] pt-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-neutral-400">Subtotal</span>
          <span className="text-white">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-xs items-center">
          <span className="text-neutral-400">Envío</span>
          <span className={freeShipping ? 'text-green-500' : 'text-white'}>
            {freeShipping ? 'GRATIS' : formatPrice(shipping)}
          </span>
        </div>
        {freeShipping && (
          <p className="text-green-500/70 text-[10px] uppercase tracking-wider">
            ✓ Envío gratis activado
          </p>
        )}
        <div className="flex justify-between text-sm font-bold border-t border-[#1a1a1a] pt-2 mt-2">
          <span className="text-white">Total</span>
          <span className="text-red-500">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}

function MobileOrderSummary() {
  const [expanded, setExpanded] = useState(false);
  const { items, getSubtotal, getTotal, hasFreeShipping } = useCartStore();
  const subtotal = getSubtotal();
  const total = getTotal();
  const freeShipping = hasFreeShipping();
  const shipping = freeShipping ? 0 : 15000;

  const primaryImage = (product: { images: { url: string; isPrimary: boolean }[] }) =>
    product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || '';

  return (
    <div className="mb-6 border border-[#1a1a1a] bg-[#0a0a0a]">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <span className="text-white text-xs font-bold uppercase tracking-wider">
            Resumen del Pedido
          </span>
          <span className="text-neutral-500 text-xs ml-2">
            ({items.length} {items.length === 1 ? 'producto' : 'productos'})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-red-500 text-sm font-bold">{formatPrice(total)}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-[#1a1a1a] pt-3">
              <div className="space-y-3 max-h-64 overflow-y-auto mb-3 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-track]:bg-transparent">
                {items.map((item) => {
                  const img = primaryImage(item.product);
                  return (
                    <div key={item.variant.id} className="flex gap-3">
                      <div className="w-14 h-14 flex-shrink-0 bg-[#1a1a1a] overflow-hidden">
                        {img && (
                          <img
                            src={img}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">
                          {item.product.title}
                        </p>
                        <p className="text-neutral-500 text-[11px] mt-0.5">
                          {item.variant.size} / {item.variant.color} — Cantidad: {item.quantity}
                        </p>
                        <p className="text-white text-xs font-bold mt-0.5">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-[#1a1a1a] pt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Envío</span>
                  <span className={freeShipping ? 'text-green-500' : 'text-white'}>
                    {freeShipping ? 'GRATIS' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-[#1a1a1a] pt-2 mt-2">
                  <span className="text-white">Total</span>
                  <span className="text-red-500">{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ────────────────────────────────────────────
   Step Heading with Red Accent Line
   ──────────────────────────────────────────── */
function StepHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-white text-sm font-bold uppercase tracking-wider">
        {children}
      </h2>
      <div className="h-0.5 w-8 bg-red-600 mt-2" />
    </div>
  );
}

/* ────────────────────────────────────────────
   Security Badges
   ──────────────────────────────────────────── */
function SecurityBadges() {
  return (
    <div className="mt-6 space-y-3 border-t border-[#1a1a1a] pt-5">
      <div className="flex items-center gap-2.5">
        <Lock className="w-4 h-4 text-green-500/50 flex-shrink-0" />
        <span className="text-neutral-500 text-xs">
          Tus datos están protegidos con encriptación SSL
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-green-500/50 flex-shrink-0" />
        <span className="text-neutral-500 text-xs">
          Garantía de devolución por 30 días
        </span>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Main Checkout View
   ──────────────────────────────────────────── */
export default function CheckoutView() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pse' | 'nequi'>('card');
  const [pseBank, setPseBank] = useState('');
  const [nequiPhone, setNequiPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const navigate = useNavigationStore();
  const cart = useCartStore();

  const contactForm = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  });

  const addressForm = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: '',
      city: '',
      department: '',
      neighborhood: '',
      postalCode: '',
    },
  });

  const cardForm = useForm({
    defaultValues: {
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCvc: '',
    },
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    return v.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  const handleContactNext = () => {
    const valid = contactForm.formState.isValid;
    contactForm.trigger();
    if (!contactForm.formState.isValid) return;
    setStep(2);
  };

  const handleAddressNext = () => {
    addressForm.trigger();
    if (!addressForm.formState.isValid) return;
    setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate('home');
  };

  const handleSubmitOrder = async () => {
    if (cart.items.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    setSubmitting(true);

    try {
      const contact = contactForm.getValues();
      const address = addressForm.getValues();
      const card = cardForm.getValues();

      const shippingAddress = `${address.address}, ${address.neighborhood}, ${address.city} - ${address.department}, CP: ${address.postalCode}`;

      const orderData = {
        userId: 'guest-checkout',
        totalAmount: cart.getTotal(),
        shippingAddress,
        notes: '',
        paymentMethod,
        contact,
        card: paymentMethod === 'card' ? card : null,
        pseBank: paymentMethod === 'pse' ? pseBank : null,
        nequiPhone: paymentMethod === 'nequi' ? nequiPhone : null,
        items: cart.items.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) {
        throw new Error('Error al procesar el pedido');
      }

      setOrderPlaced(true);
      toast.success('¡Pedido confirmado exitosamente!');

      setTimeout(() => {
        cart.clearCart();
        navigate('order-confirmation');
      }, 1500);
    } catch {
      toast.error('Hubo un error al procesar tu pedido. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <p className="text-neutral-500 text-sm uppercase tracking-wider mb-6">
          Tu carrito está vacío
        </p>
        <Button
          onClick={() => navigate('home')}
          className="bg-white text-black hover:bg-neutral-200 uppercase text-xs tracking-wider font-bold rounded-none px-6 h-10"
        >
          EXPLORAR TIENDA
        </Button>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-600/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-white text-2xl font-bold uppercase tracking-wider mb-2">
            ¡Pedido Confirmado!
          </h2>
          <p className="text-neutral-400 text-sm text-center max-w-sm">
            Gracias por tu compra. Recibirás un email de confirmación con los
            detalles de tu pedido.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6"
          >
            <p className="text-neutral-600 text-xs uppercase tracking-wider">
              Redirigiendo a la tienda...
            </p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const darkInput =
    'bg-[#1a1a1a] border-[#262626] text-white placeholder:text-neutral-600 text-sm rounded-none focus-visible:border-red-600 focus-visible:ring-red-600/20';
  const darkSelect =
    'bg-[#1a1a1a] border-[#262626] text-white rounded-none focus-visible:border-red-600 data-[placeholder]:text-neutral-600';

  return (
    <section className="min-h-screen bg-black px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>VOLVER</span>
          </button>
          <h1 className="text-white text-lg md:text-xl font-bold uppercase tracking-wider">
            Checkout
          </h1>
          <div className="w-20" />
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {/* Mobile Collapsible Order Summary (above steps) */}
        <div className="lg:hidden">
          <MobileOrderSummary />
        </div>

        {/* 2-Column Layout: Form (left) + Sidebar (right) */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Form Steps (2/3 width on desktop) */}
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait">
              {/* ── Step 1: Contacto ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#0a0a0a] border border-[#1a1a1a] p-6"
                >
                  <StepHeading>Información de Contacto</StepHeading>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                        Nombre *
                      </Label>
                      <Input
                        {...contactForm.register('firstName')}
                        className={darkInput}
                        placeholder="Juan"
                      />
                      {contactForm.formState.errors.firstName && (
                        <p className="text-red-500 text-xs">
                          {contactForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                        Apellido *
                      </Label>
                      <Input
                        {...contactForm.register('lastName')}
                        className={darkInput}
                        placeholder="Pérez"
                      />
                      {contactForm.formState.errors.lastName && (
                        <p className="text-red-500 text-xs">
                          {contactForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                        Email *
                      </Label>
                      <Input
                        {...contactForm.register('email')}
                        type="email"
                        className={darkInput}
                        placeholder="juan@email.com"
                      />
                      {contactForm.formState.errors.email && (
                        <p className="text-red-500 text-xs">
                          {contactForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                        Teléfono *
                      </Label>
                      <Input
                        {...contactForm.register('phone')}
                        className={darkInput}
                        placeholder="+57 300 123 4567"
                      />
                      {contactForm.formState.errors.phone && (
                        <p className="text-red-500 text-xs">
                          {contactForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleContactNext}
                    className="w-full mt-8 bg-white text-black hover:bg-neutral-200 uppercase text-xs tracking-widest font-bold rounded-none h-12"
                  >
                    CONTINUAR
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* ── Step 2: Dirección ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#0a0a0a] border border-[#1a1a1a] p-6"
                >
                  <StepHeading>Dirección de Envío</StepHeading>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                        Dirección *
                      </Label>
                      <Input
                        {...addressForm.register('address')}
                        className={darkInput}
                        placeholder="Calle 100 #15-20, Apto 302"
                      />
                      {addressForm.formState.errors.address && (
                        <p className="text-red-500 text-xs">
                          {addressForm.formState.errors.address.message}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                          Ciudad *
                        </Label>
                        <Input
                          {...addressForm.register('city')}
                          className={darkInput}
                          placeholder="Bogotá"
                        />
                        {addressForm.formState.errors.city && (
                          <p className="text-red-500 text-xs">
                            {addressForm.formState.errors.city.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                          Departamento *
                        </Label>
                        <Select
                          value={addressForm.watch('department')}
                          onValueChange={(val) =>
                            addressForm.setValue('department', val, {
                              shouldValidate: true,
                            })
                          }
                        >
                          <SelectTrigger className={darkSelect}>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1a1a] border-[#262626] text-white">
                            {DEPARTMENTS.map((dept) => (
                              <SelectItem key={dept} value={dept} className="text-white focus:bg-[#262626] focus:text-white">
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {addressForm.formState.errors.department && (
                          <p className="text-red-500 text-xs">
                            {addressForm.formState.errors.department.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                          Barrio *
                        </Label>
                        <Input
                          {...addressForm.register('neighborhood')}
                          className={darkInput}
                          placeholder="Chapinero"
                        />
                        {addressForm.formState.errors.neighborhood && (
                          <p className="text-red-500 text-xs">
                            {addressForm.formState.errors.neighborhood.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                          Código Postal *
                        </Label>
                        <Input
                          {...addressForm.register('postalCode')}
                          className={darkInput}
                          placeholder="110231"
                        />
                        {addressForm.formState.errors.postalCode && (
                          <p className="text-red-500 text-xs">
                            {addressForm.formState.errors.postalCode.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="sm:flex-1 w-full border-neutral-700 text-white hover:bg-neutral-800 uppercase text-xs tracking-widest font-bold rounded-none h-12"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      VOLVER
                    </Button>
                    <Button
                      onClick={handleAddressNext}
                      className="sm:flex-1 w-full bg-white text-black hover:bg-neutral-200 uppercase text-xs tracking-widest font-bold rounded-none h-12"
                    >
                      CONTINUAR
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Pago ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#0a0a0a] border border-[#1a1a1a] p-6"
                >
                  <StepHeading>Método de Pago</StepHeading>

                  {/* Payment Method Cards */}
                  <div className="space-y-3 mb-6">
                    {/* Card */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full flex items-center gap-4 p-4 border transition-all duration-200 ${
                        paymentMethod === 'card'
                          ? 'border-red-600 bg-red-600/10'
                          : 'border-[#262626] bg-[#111] hover:border-neutral-600'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          paymentMethod === 'card'
                            ? 'bg-red-600 text-white'
                            : 'bg-[#1a1a1a] text-neutral-500'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-white text-sm font-medium">
                          Tarjeta de crédito/débito
                        </p>
                        <p className="text-neutral-500 text-xs">Visa, Mastercard, American Express</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'card'
                            ? 'border-red-600'
                            : 'border-neutral-600'
                        }`}
                      >
                        {paymentMethod === 'card' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                        )}
                      </div>
                    </motion.button>

                    {/* PSE */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod('pse')}
                      className={`w-full flex items-center gap-4 p-4 border transition-all duration-200 ${
                        paymentMethod === 'pse'
                          ? 'border-red-600 bg-red-600/10'
                          : 'border-[#262626] bg-[#111] hover:border-neutral-600'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          paymentMethod === 'pse'
                            ? 'bg-red-600 text-white'
                            : 'bg-[#1a1a1a] text-neutral-500'
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-white text-sm font-medium">PSE</p>
                        <p className="text-neutral-500 text-xs">
                          Pago por banco en línea
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'pse'
                            ? 'border-red-600'
                            : 'border-neutral-600'
                        }`}
                      >
                        {paymentMethod === 'pse' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                        )}
                      </div>
                    </motion.button>

                    {/* Nequi */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPaymentMethod('nequi')}
                      className={`w-full flex items-center gap-4 p-4 border transition-all duration-200 ${
                        paymentMethod === 'nequi'
                          ? 'border-red-600 bg-red-600/10'
                          : 'border-[#262626] bg-[#111] hover:border-neutral-600'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          paymentMethod === 'nequi'
                            ? 'bg-red-600 text-white'
                            : 'bg-[#1a1a1a] text-neutral-500'
                        }`}
                      >
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-white text-sm font-medium">Nequi</p>
                        <p className="text-neutral-500 text-xs">
                          Paga con tu Nequi
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === 'nequi'
                            ? 'border-red-600'
                            : 'border-neutral-600'
                        }`}
                      >
                        {paymentMethod === 'nequi' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                        )}
                      </div>
                    </motion.button>
                  </div>

                  {/* Payment Details */}
                  <AnimatePresence mode="wait">
                    {paymentMethod === 'card' && (
                      <motion.div
                        key="card-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                              Número de tarjeta
                            </Label>
                            <Input
                              {...cardForm.register('cardNumber')}
                              className={darkInput}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                              onChange={(e) => {
                                e.target.value = formatCardNumber(e.target.value);
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                              Nombre en la tarjeta
                            </Label>
                            <Input
                              {...cardForm.register('cardName')}
                              className={darkInput}
                              placeholder="JUAN PÉREZ"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                                Vencimiento (MM/YY)
                              </Label>
                              <Input
                                {...cardForm.register('cardExpiry')}
                                className={darkInput}
                                placeholder="12/26"
                                maxLength={5}
                                onChange={(e) => {
                                  e.target.value = formatExpiry(e.target.value);
                                }}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                                CVC
                              </Label>
                              <Input
                                {...cardForm.register('cardCvc')}
                                className={darkInput}
                                placeholder="123"
                                maxLength={4}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'pse' && (
                      <motion.div
                        key="pse-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#111] border border-[#1a1a1a] p-4 mb-4">
                          <p className="text-neutral-400 text-xs leading-relaxed">
                            Serás redirigido a <span className="text-white font-medium">PSE</span> para
                            completar el pago de forma segura a través de tu banco.
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                            Banco
                          </Label>
                          <Select value={pseBank} onValueChange={setPseBank}>
                            <SelectTrigger className={darkSelect}>
                              <SelectValue placeholder="Selecciona tu banco" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-[#262626] text-white">
                              {PSE_BANKS.map((bank) => (
                                <SelectItem key={bank} value={bank} className="text-white focus:bg-[#262626] focus:text-white">
                                  {bank}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </motion.div>
                    )}

                    {paymentMethod === 'nequi' && (
                      <motion.div
                        key="nequi-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#111] border border-[#1a1a1a] p-4 mb-4">
                          <p className="text-neutral-400 text-xs leading-relaxed">
                            Paga con <span className="text-white font-medium">Nequi</span>. Recibirás
                            una notificación en tu app para confirmar el pago.
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-neutral-400 text-xs uppercase tracking-wider font-medium">
                            Número de celular Nequi
                          </Label>
                          <Input
                            value={nequiPhone}
                            onChange={(e) => setNequiPhone(e.target.value)}
                            className={darkInput}
                            placeholder="+57 300 123 4567"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Security Badges */}
                  <SecurityBadges />

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="sm:flex-1 w-full border-neutral-700 text-white hover:bg-neutral-800 uppercase text-xs tracking-widest font-bold rounded-none h-12"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      VOLVER
                    </Button>
                    <Button
                      onClick={handleSubmitOrder}
                      disabled={submitting}
                      className="sm:flex-[2] w-full bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-widest font-bold rounded-none h-12 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          PROCESANDO...
                        </>
                      ) : (
                        'CONFIRMAR PEDIDO'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Order Summary Sidebar (desktop only, sticky) */}
          <div className="hidden lg:block w-1/3 flex-shrink-0">
            <div className="sticky top-24">
              <OrderSummarySidebar />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}