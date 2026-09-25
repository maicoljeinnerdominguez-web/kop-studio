'use client';

import { useState, type FormEvent } from 'react';
import { motion, type Variants } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Truck,
  RotateCcw,
  FileText,
  Shield,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Instagram,
  Twitter,
  Package,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  ChevronRight,
  Phone,
} from 'lucide-react';

/* ─── animation helpers ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: 'easeOut' },
  }),
};

function RedDivider() {
  return (
    <div className="h-[1px] bg-gradient-to-r from-red-600/60 via-red-600/20 to-transparent" />
  );
}

function SectionHeader({
  icon: Icon,
  title,
  index,
}: {
  icon: React.ElementType;
  title: string;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="flex items-center gap-3 mt-10 mb-4 first:mt-6"
    >
      <Icon className="size-4 text-red-500 shrink-0" />
      <h3 className="text-white font-bold text-sm uppercase tracking-widest">
        {title}
      </h3>
    </motion.div>
  );
}

function SectionBody({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="text-neutral-400 text-sm leading-relaxed space-y-2"
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE CONTENTS
   ═══════════════════════════════════════════════ */

function EnviosContent() {
  const items = [
    {
      icon: MapPin,
      title: 'Zonas de cobertura',
      body: (
        <>
          <p>
            Realizamos envíos a toda Colombia. Las ciudades principales (Bogotá, Medellín, Cali,
            Barranquilla, Cartagena, Bucaramanga, Pereira, Manizales, etc.) tienen entregas
            estimadas de <span className="text-white font-medium">1 a 3 días hábiles</span>.
          </p>
          <p>
            Otras zonas del territorio nacional tienen un tiempo estimado de{' '}
            <span className="text-white font-medium">3 a 7 días hábiles</span>.
          </p>
        </>
      ),
    },
    {
      icon: CreditCard,
      title: 'Costos de envío',
      body: (
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-[#1a1a1a] border border-[#222] px-4 py-2.5">
            <span className="text-neutral-300">Bogotá, Medellín, Cali, Barranquilla</span>
            <span className="text-white font-semibold">$12.000 COP</span>
          </div>
          <div className="flex justify-between items-center bg-[#1a1a1a] border border-[#222] px-4 py-2.5">
            <span className="text-neutral-300">Otras ciudades principales</span>
            <span className="text-white font-semibold">$15.000 COP</span>
          </div>
          <div className="flex justify-between items-center bg-[#1a1a1a] border border-[#222] px-4 py-2.5">
            <span className="text-neutral-300">Zonas rurales</span>
            <span className="text-white font-semibold">$22.000 COP</span>
          </div>
          <div className="flex justify-between items-center bg-red-600/10 border border-red-600/30 px-4 py-2.5 mt-3">
            <span className="text-red-400 font-medium">
              <CheckCircle2 className="inline size-3.5 mr-1.5 -mt-0.5" />
              Envío gratis
            </span>
            <span className="text-white font-bold">En compras +$250.000 COP</span>
          </div>
        </div>
      ),
    },
    {
      icon: Clock,
      title: 'Tiempos de entrega',
      body: (
        <ul className="space-y-1.5 list-none">
          <li className="flex items-start gap-2">
            <ChevronRight className="size-3.5 text-red-500 mt-0.5 shrink-0" />
            <span>
              Ciudades principales: <span className="text-white">1-3 días hábiles</span>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="size-3.5 text-red-500 mt-0.5 shrink-0" />
            <span>
              Otras zonas: <span className="text-white">3-7 días hábiles</span>
            </span>
          </li>
        </ul>
      ),
    },
    {
      icon: Truck,
      title: 'Empresas de transporte',
      body: (
        <p>
          Trabajamos con las principales transportadoras del país para garantizar que tu pedido
          llegue seguro y a tiempo:{' '}
          <span className="text-white font-medium">Servientrega, Interrapidísimo</span> y{' '}
          <span className="text-white font-medium">Coordinadora</span>.
        </p>
      ),
    },
    {
      icon: Package,
      title: 'Seguimiento de tu pedido',
      body: (
        <p>
          Cada pedido incluye un <span className="text-white font-medium">número de guía</span>{' '}
          que podrás usar para rastrear tu paquete en tiempo real a través del sitio web de la
          transportadora. También puedes usar nuestra herramienta de{' '}
          <button
            onClick={() => useNavigationStore.getState().navigate('order-tracking')}
            className="text-red-400 hover:text-red-300 underline underline-offset-2"
          >
            rastrear pedido
          </button>{' '}
          desde la página principal.
        </p>
      ),
    },
    {
      icon: AlertTriangle,
      title: 'Importante',
      body: (
        <p>
          Los tiempos de entrega son <span className="text-white font-medium">estimados</span> y
          pueden variar según la ubicación exacta, condiciones climáticas y volumen de envíos de
          la transportadora. Los tiempos <span className="text-white">no incluyen domingos ni
          días festivos</span>.
        </p>
      ),
    },
  ];

  return (
    <>
      {items.map((item, i) => (
        <div key={item.title}>
          <SectionHeader icon={item.icon} title={item.title} index={i} />
          <SectionBody index={i + 0.5}>{item.body}</SectionBody>
          {i < items.length - 1 && <RedDivider />}
        </div>
      ))}
    </>
  );
}

function DevolucionesContent() {
  const items = [
    {
      icon: Clock,
      title: 'Política de cambio',
      body: (
        <p>
          Tienes un plazo de{' '}
          <span className="text-white font-bold">7 días calendario</span> contados desde la
          fecha de recepción de tu pedido para solicitar un cambio o devolución.
        </p>
      ),
    },
    {
      icon: CheckCircle2,
      title: 'Condiciones para cambios y devoluciones',
      body: (
        <ul className="space-y-2 list-none">
          <li className="flex items-start gap-2">
            <ChevronRight className="size-3.5 text-red-500 mt-0.5 shrink-0" />
            <span>La prenda debe estar <span className="text-white">sin uso</span>, sin lavar y sin alteraciones</span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="size-3.5 text-red-500 mt-0.5 shrink-0" />
            <span>Las <span className="text-white">etiquetas deben estar intactas</span></span>
          </li>
          <li className="flex items-start gap-2">
            <ChevronRight className="size-3.5 text-red-500 mt-0.5 shrink-0" />
            <span>El <span className="text-white">empaque original</span> debe estar en buen estado</span>
          </li>
        </ul>
      ),
    },
    {
      icon: AlertTriangle,
      title: 'Productos NO elegibles para devolución',
      body: (
        <ul className="space-y-2 list-none">
          <li className="flex items-start gap-2">
            <span className="text-red-400 font-bold shrink-0">✕</span>
            <span>Ropa interior y prendas de uso íntimo</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 font-bold shrink-0">✕</span>
            <span>Artículos en promoción o liquidación (salvo defecto de fábrica)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-400 font-bold shrink-0">✕</span>
            <span>Productos personalizados o con diseños a medida</span>
          </li>
        </ul>
      ),
    },
    {
      icon: RotateCcw,
      title: 'Proceso de devolución',
      body: (
        <ol className="space-y-2.5 list-none">
          {[
            'Contactar por WhatsApp con tu número de pedido',
            'Enviar fotos del producto y estado de la prenda',
            'Recibir aprobación en máximo 24 horas hábiles',
            'Coordinar la recolección de la prenda (Servientrega)',
            'Recibir reembolso o cambio en 3-5 días hábiles',
          ].map((step, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="w-6 h-6 bg-red-600/20 border border-red-600/40 text-red-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      ),
    },
    {
      icon: CreditCard,
      title: 'Reembolso',
      body: (
        <p>
          El reembolso se realiza por el <span className="text-white font-medium">mismo medio de pago</span> utilizado
          en la compra. El tiempo de acreditación es de{' '}
          <span className="text-white font-medium">5 a 10 días hábiles</span> dependiendo de tu banco o entidad
          financiera.
        </p>
      ),
    },
    {
      icon: Shield,
      title: 'Defectos de fábrica',
      body: (
        <p>
          Todos nuestros productos cuentan con una <span className="text-white font-bold">garantía de 30 días</span>{' '}
          por defectos de fábrica. En caso de presentar un defecto, realizaremos el cambio{' '}
          <span className="text-white font-medium">sin costo adicional</span> (KOP STUDIO asume el envío de ida y
          vuelta).
        </p>
      ),
    },
    {
      icon: Info,
      title: 'Costos de devolución',
      body: (
        <p>
          En cambios por preferencia personal, el <span className="text-white font-medium">cliente asume el costo
          del envío de devolución</span>. KOP STUDIO asume el costo del envío del reemplazo o nueva talla.
        </p>
      ),
    },
  ];

  return (
    <>
      {items.map((item, i) => (
        <div key={item.title}>
          <SectionHeader icon={item.icon} title={item.title} index={i} />
          <SectionBody index={i + 0.5}>{item.body}</SectionBody>
          {i < items.length - 1 && <RedDivider />}
        </div>
      ))}
    </>
  );
}

function TerminosContent() {
  const sections = [
    {
      title: '1. Aceptación de los términos',
      body: (
        <p>
          Al acceder, navegar y/o realizar compras en <span className="text-white font-medium">kopstudio.com</span>{' '}
          (en adelante, &ldquo;la Plataforma&rdquo;), usted acepta de manera integral los presentes Términos y
          Condiciones. Si no está de acuerdo con alguno de estos términos, le rogamos abstenerse de utilizar
          nuestros servicios. KOP STUDIO se reserva el derecho de modificar estos términos en cualquier momento
          sin previo aviso.
        </p>
      ),
    },
    {
      title: '2. Descripción del servicio',
      body: (
        <p>
          KOP STUDIO opera como tienda online de streetwear con sede en La Unión, Nariño, Colombia.
          Ofrecemos prendas de vestir, accesorios y productos de diseño propio con estética urbana y gótica.
          La Plataforma facilita la navegación, selección, compra y pago de productos a través de medios
          electrónicos.
        </p>
      ),
    },
    {
      title: '3. Registro y cuenta del usuario',
      body: (
        <>
          <p>
            Para realizar compras es necesario crear una cuenta proporcionando información veraz y completa:
            nombre, correo electrónico, número telefónico y dirección de envío.
          </p>
          <p>
            El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso. KOP STUDIO
            no se hace responsable por el uso no autorizado de la cuenta. Cualquier actividad realizada bajo
            tu cuenta es de tu entera responsabilidad.
          </p>
        </>
      ),
    },
    {
      title: '4. Precios y métodos de pago',
      body: (
        <>
          <p>
            Todos los precios están expresados en <span className="text-white font-medium">Pesos Colombianos (COP)</span> e
            incluyen IVA. Los precios pueden modificarse sin previo aviso, sin embargo, el precio vigente al
            momento de la compra será el aplicable.
          </p>
          <p>
            Aceptamos los siguientes medios de pago: <span className="text-white font-medium">Wompi, PSE, Nequi</span> y{' '}
            <span className="text-white font-medium">tarjetas de crédito y débito</span> (Visa, Mastercard). Todas las
            transacciones son procesadas de forma segura a través de pasarelas de pago certificadas.
          </p>
        </>
      ),
    },
    {
      title: '5. Proceso de compra y confirmación',
      body: (
        <p>
          Una vez completado el proceso de compra, recibirás un correo electrónico de confirmación con el
          resumen de tu pedido y el número de guía de envío cuando el pedido sea despachado. La confirmación
          del pedido no garantiza la disponibilidad del producto; en caso de agotamiento, nos comunicaremos
          contigo para ofrecer alternativas o reembolso.
        </p>
      ),
    },
    {
      title: '6. Propiedad intelectual',
      body: (
        <>
          <p>
            Todos los diseños, logotipos, gráficos, textos, fotografías, ilustraciones y cualquier otro
            contenido visual o textual de la Plataforma son propiedad de{' '}
            <span className="text-white font-medium">KOP STUDIO</span> y están protegidos por las leyes
            colombianas e internacionales de propiedad intelectual.
          </p>
          <p>
            Queda prohibida la reproducción, distribución, modificación o uso de cualquier contenido de esta
            plataforma sin autorización expresa y por escrito de KOP STUDIO.
          </p>
        </>
      ),
    },
    {
      title: '7. Limitación de responsabilidad',
      body: (
        <p>
          KOP STUDIO no será responsable por daños indirectos, incidentales, especiales o consecuentes
          derivados del uso de la Plataforma. Nuestra responsabilidad total en relación con cualquier
          producto adquirido no excederá el monto pagado por dicho producto. No garantizamos que la
          Plataforma esté disponible de forma ininterrumpida o libre de errores.
        </p>
      ),
    },
    {
      title: '8. Modificaciones a los términos',
      body: (
        <p>
          KOP STUDIO se reserva el derecho de actualizar, modificar o eliminar cualquier parte de estos
          términos en cualquier momento. Los cambios entrarán en vigencia a partir de su publicación en la
          Plataforma. El uso continuado de la Plataforma después de la publicación de cambios constituye
          la aceptación de dichos cambios.
        </p>
      ),
    },
    {
      title: '9. Ley aplicable',
      body: (
        <p>
          Los presentes Términos y Condiciones se rigen por la legislación colombiana, específicamente la{' '}
          <span className="text-white font-medium">Ley 1480 de 2011 (Estatuto del Consumidor)</span>, la Ley
          1564 de 2012 (Código General del Proceso) y demás normas concordantes. Cualquier controversia se
          someterá a los tribunales competentes en La Unión, Nariño, Colombia.
        </p>
      ),
    },
    {
      title: '10. Contacto',
      body: (
        <p>
          Para cualquier consulta relacionada con estos Términos y Condiciones, puedes contactarnos a
          través de: <span className="text-white font-medium">contacto@kopstudio.com</span>
        </p>
      ),
    },
  ];

  return (
    <>
      {sections.map((s, i) => (
        <div key={s.title}>
          <SectionHeader icon={FileText} title={s.title} index={i} />
          <SectionBody index={i + 0.5}>{s.body}</SectionBody>
          {i < sections.length - 1 && <RedDivider />}
        </div>
      ))}
    </>
  );
}

function PrivacidadContent() {
  const sections = [
    {
      title: '1. Datos recopilados',
      body: (
        <>
          <p>Recopilamos los siguientes datos personales para prestar nuestros servicios:</p>
          <ul className="list-none space-y-1.5 mt-2">
            {['Nombre completo', 'Correo electrónico', 'Dirección de envío', 'Número telefónico', 'Datos de pago (procesados por terceros certificados)'].map((d) => (
              <li key={d} className="flex items-start gap-2">
                <ChevronRight className="size-3.5 text-red-500 mt-0.5 shrink-0" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      title: '2. Finalidad del tratamiento',
      body: (
        <>
          <p>Tus datos son utilizados para:</p>
          <ul className="list-none space-y-1.5 mt-2">
            {['Procesar y gestionar tus pedidos', 'Realizar envíos y entregas', 'Enviar notificaciones sobre tu compra', 'Enviar comunicaciones de marketing (solo con tu consentimiento)', 'Mejorar nuestros productos y servicios', 'Cumplir con obligaciones legales'].map((d) => (
              <li key={d} className="flex items-start gap-2">
                <ChevronRight className="size-3.5 text-red-500 mt-0.5 shrink-0" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      title: '3. Base legal',
      body: (
        <p>
          El tratamiento de tus datos personales se realiza con base en la{' '}
          <span className="text-white font-bold">Ley 1581 de 2012 (Ley de Protección de Datos Personales de Colombia)</span>,
          el Decreto 1377 de 2013 y demás normas concordantes. KOP STUDIO actúa como responsable del
          tratamiento de datos.
        </p>
      ),
    },
    {
      title: '4. Derechos del titular (ARCO)',
      body: (
        <>
          <p>
            Como titular de tus datos personales, tienes derecho a:
          </p>
          <ul className="list-none space-y-1.5 mt-2">
            {[
              { label: 'Acceso', desc: 'Solicitar información sobre los datos que tenemos sobre ti' },
              { label: 'Rectificación', desc: 'Corregir datos inexactos o incompletos' },
              { label: 'Cancelación', desc: 'Solicitar la eliminación de tus datos personales' },
              { label: 'Oposición', desc: 'Oponerte al tratamiento de tus datos para fines específicos' },
            ].map((d) => (
              <li key={d.label} className="flex items-start gap-2">
                <span className="text-red-400 font-semibold text-xs w-28 shrink-0">{d.label}:</span>
                <span>{d.desc}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Para ejercer estos derechos, envía un correo a{' '}
            <span className="text-white font-medium">contacto@kopstudio.com</span>.
          </p>
        </>
      ),
    },
    {
      title: '5. Transferencia de datos',
      body: (
        <p>
          Tus datos personales <span className="text-white font-medium">no serán compartidos con terceros</span> excepto
          con empresas de transporte (Servientrega, Interrapidísimo, Coordinadora) y pasarelas de pago (Wompi)
          estrictamente necesarias para la prestación del servicio. Estas empresas están obligadas por contrato
          a mantener la confidencialidad de tus datos.
        </p>
      ),
    },
    {
      title: '6. Cookies',
      body: (
        <>
          <p>
            Nuestra plataforma utiliza cookies para mejorar tu experiencia:
          </p>
          <ul className="list-none space-y-1.5 mt-2">
            {[
              { type: 'Técnicas', desc: 'Necesarias para el funcionamiento básico de la plataforma' },
              { type: 'Analíticas', desc: 'Nos ayudan a entender cómo usas la plataforma' },
              { type: 'Marketing', desc: 'Para mostrar publicidad relevante (solo con tu consentimiento)' },
            ].map((c) => (
              <li key={c.type} className="flex items-start gap-2">
                <span className="text-red-400 font-semibold text-xs w-24 shrink-0">{c.type}:</span>
                <span>{c.desc}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2">
            Puedes configurar tu navegador para bloquear o eliminar cookies, aunque esto puede afectar la
            funcionalidad de la plataforma.
          </p>
        </>
      ),
    },
    {
      title: '7. Seguridad',
      body: (
        <p>
          Implementamos medidas de seguridad técnicas, administrativas y organizacionales para proteger tus
          datos personales, incluyendo{' '}
          <span className="text-white font-medium">encriptación SSL/TLS</span> en todas las transmisiones de
          datos. Sin embargo, ningún sistema de seguridad es infalible, por lo que no podemos garantizar una
          seguridad absoluta.
        </p>
      ),
    },
    {
      title: '8. Menores de edad',
      body: (
        <p>
          KOP STUDIO <span className="text-white font-bold">no recopila datos personales de menores de edad</span>.
          Si eres menor de 18 años, no debes usar esta plataforma sin la supervisión y autorización de tus
          padres o tutores legales. Si detectamos que se han recopilado datos de un menor, los eliminaremos
          de inmediato.
        </p>
      ),
    },
    {
      title: '9. Contacto del responsable',
      body: (
        <p>
          Para consultas, quejas, reclamos o ejercer tus derechos ARCO, contacta al responsable del
          tratamiento de datos: <span className="text-white font-medium">contacto@kopstudio.com</span>. Tu
          solicitud será atendida en un plazo máximo de 15 días hábiles.
        </p>
      ),
    },
  ];

  return (
    <>
      {sections.map((s, i) => (
        <div key={s.title}>
          <SectionHeader icon={Shield} title={s.title} index={i} />
          <SectionBody index={i + 0.5}>{s.body}</SectionBody>
          {i < sections.length - 1 && <RedDivider />}
        </div>
      ))}
    </>
  );
}

function ContactoContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject || !formData.message.trim()) {
      toast.error('Completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Ingresa un correo electrónico válido');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('¡Mensaje enviado! Te responderemos pronto.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error('Error al enviar el mensaje. Intenta de nuevo.');
      }
    } catch {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mb-8">
        {[
          { icon: MessageCircle, label: 'WhatsApp', value: '+57 XXX XXX XXXX', accent: true },
          { icon: Mail, label: 'Email', value: 'contacto@kopstudio.com', accent: false },
          { icon: Clock, label: 'Horario', value: 'Lun-Sáb 9:00 AM - 6:00 PM', accent: false },
          { icon: MapPin, label: 'Ubicación', value: 'La Unión, Nariño, Colombia', accent: false },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`flex items-start gap-3 p-4 border ${
              item.accent ? 'border-red-600/30 bg-red-600/5' : 'border-[#222] bg-[#111]'
            } rounded-sm`}
          >
            <item.icon className={`size-5 mt-0.5 shrink-0 ${item.accent ? 'text-red-500' : 'text-neutral-500'}`} />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                {item.label}
              </p>
              <p className={`text-sm mt-0.5 ${item.accent ? 'text-white font-medium' : 'text-neutral-300'}`}>
                {item.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Social Links */}
      <SectionHeader icon={Instagram} title="Redes Sociales" index={5} />
      <SectionBody index={5.5}>
        <div className="flex items-center gap-3">
          <a
            href="https://instagram.com/kopstudio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-[#222] bg-[#111] hover:border-white/30 text-neutral-400 hover:text-white text-sm transition-colors"
          >
            <Instagram className="size-4" />
            @kopstudio
          </a>
          <a
            href="https://twitter.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-[#222] bg-[#111] hover:border-white/30 text-neutral-400 hover:text-white text-sm transition-colors"
          >
            <Twitter className="size-4" />
            @kopstudio
          </a>
        </div>
      </SectionBody>

      <RedDivider />

      {/* FAQ Link */}
      <div className="mt-6">
        <button
          onClick={() => navigate('info-page', { slug: 'faq' })}
          className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm transition-colors group"
        >
          <FileText className="size-4" />
          <span>¿Tienes dudas? Revisa nuestras preguntas frecuentes</span>
          <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <RedDivider />

      {/* Contact Form */}
      <SectionHeader icon={Mail} title="Envíanos un mensaje" index={7} />
      <motion.div
        custom={7.5}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                Nombre
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Tu nombre"
                disabled={isSubmitting}
                className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-neutral-600 text-sm h-10 rounded-none focus-visible:border-red-600/50 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                placeholder="tu@email.com"
                disabled={isSubmitting}
                className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-neutral-600 text-sm h-10 rounded-none focus-visible:border-red-600/50 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
              Asunto
            </label>
            <Select
              value={formData.subject}
              onValueChange={(v) => setFormData((p) => ({ ...p, subject: v }))}
              disabled={isSubmitting}
            >
              <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white text-sm h-10 rounded-none focus:ring-red-600/30 focus:border-red-600/50">
                <SelectValue placeholder="Selecciona un asunto" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333]">
                <SelectItem value="consulta-general" className="text-neutral-300 focus:text-white focus:bg-[#222]">Consulta general</SelectItem>
                <SelectItem value="estado-pedido" className="text-neutral-300 focus:text-white focus:bg-[#222]">Estado de pedido</SelectItem>
                <SelectItem value="devolucion-cambio" className="text-neutral-300 focus:text-white focus:bg-[#222]">Devolución o cambio</SelectItem>
                <SelectItem value="tallas-medidas" className="text-neutral-300 focus:text-white focus:bg-[#222]">Tallas y medidas</SelectItem>
                <SelectItem value="mayorista" className="text-neutral-300 focus:text-white focus:bg-[#222]">Ventas mayoristas</SelectItem>
                <SelectItem value="queja-reclamo" className="text-neutral-300 focus:text-white focus:bg-[#222]">Queja o reclamo</SelectItem>
                <SelectItem value="otro" className="text-neutral-300 focus:text-white focus:bg-[#222]">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
              Mensaje
            </label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
              placeholder="Escribe tu mensaje aquí..."
              rows={5}
              disabled={isSubmitting}
              className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-neutral-600 text-sm rounded-none focus-visible:border-red-600/50 transition-colors resize-none"
            />
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-widest font-bold px-8 h-11 rounded-none hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Enviando...
              </span>
            ) : (
              'ENVIAR MENSAJE'
            )}
          </Button>
        </form>
      </motion.div>
    </>
  );
}

function FAQContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  const faqs = [
    { q: '¿Cuánto tarda mi envío?', a: 'Las ciudades principales (Bogotá, Medellín, Cali, Barranquilla) tienen entregas de 1-3 días hábiles. Otras zonas: 3-7 días hábiles.' },
    { q: '¿El envío es gratis?', a: 'Sí, en compras mayores a $250.000 COP. Para compras menores, el costo varía entre $12.000 y $22.000 COP según la zona.' },
    { q: '¿Puedo cambiar mi pedido?', a: 'Puedes solicitar cambios o devoluciones dentro de los 7 días calendario después de recibir tu pedido, siempre que la prenda esté sin uso y con etiquetas.' },
    { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjetas Visa/Mastercard, PSE, Nequi y otros medios a través de Wompi.' },
    { q: '¿Cómo rastreo mi pedido?', a: 'Recibirás un número de guía por email. También puedes usar nuestra herramienta de rastrear pedido desde el menú principal.' },
    { q: '¿Hacen envíos internacionales?', a: 'Actualmente solo realizamos envíos dentro de Colombia. Estamos trabajando para habilitar envíos internacionales pronto.' },
    { q: '¿Cómo sé mi talla?', a: 'Cada producto incluye una guía de tallas. Si tienes dudas, contáctanos por WhatsApp para asesoría personalizada.' },
    { q: '¿Las prendas son unisex?', a: 'La mayoría de nuestros diseños son unisex. Revisa la guía de tallas específica de cada producto para encontrar tu ajuste ideal.' },
  ];

  return (
    <div className="space-y-1 mt-8">
      {faqs.map((faq, i) => (
        <motion.div
          key={faq.q}
          custom={i}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="border-b border-[#1a1a1a] last:border-0"
        >
          <div className="py-4">
            <p className="text-white text-sm font-medium flex items-start gap-2">
              <span className="text-red-500 font-bold shrink-0">Q:</span>
              {faq.q}
            </p>
            <p className="text-neutral-400 text-sm mt-2 flex items-start gap-2 leading-relaxed">
              <span className="text-neutral-500 font-bold shrink-0">A:</span>
              {faq.a}
            </p>
          </div>
        </motion.div>
      ))}

      <div className="pt-8">
        <RedDivider />
        <p className="text-neutral-500 text-sm mt-6">
          ¿No encuentras tu respuesta?{' '}
          <button
            onClick={() => navigate('info-page', { slug: 'contacto' })}
            className="text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
          >
            Contáctanos
          </button>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */

const PAGE_CONFIG: Record<
  string,
  { title: string; description: string; icon: React.ElementType; content: React.ReactNode }
> = {
  envios: {
    title: 'ENVÍOS Y ENTREGAS',
    description: 'Todo lo que necesitas saber sobre nuestros envíos a toda Colombia.',
    icon: Truck,
    content: <EnviosContent />,
  },
  devoluciones: {
    title: 'DEVOLUCIONES Y CAMBIOS',
    description: 'Política clara y transparente para cambios y devoluciones.',
    icon: RotateCcw,
    content: <DevolucionesContent />,
  },
  terminos: {
    title: 'TÉRMINOS Y CONDICIONES',
    description: 'Condiciones de uso de la plataforma KOP STUDIO.',
    icon: FileText,
    content: <TerminosContent />,
  },
  privacidad: {
    title: 'POLÍTICA DE PRIVACIDAD Y TRATAMIENTO DE DATOS',
    description: 'Cómo protegemos y usamos tu información personal.',
    icon: Shield,
    content: <PrivacidadContent />,
  },
  contacto: {
    title: 'CONTACTO',
    description: 'Estamos aquí para ayudarte. Escríbenos cuando quieras.',
    icon: Mail,
    content: <ContactoContent />,
  },
  faq: {
    title: 'PREGUNTAS FRECUENTES',
    description: 'Respuestas rápidas a las dudas más comunes.',
    icon: Info,
    content: <FAQContent />,
  },
};

export default function InfoPageView() {
  const slug = useNavigationStore((s) => s.viewParams?.slug || 'envios');
  const currentNavigate = useNavigationStore((s) => s.navigate);

  const config = PAGE_CONFIG[slug];

  if (!config) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-neutral-500">Página no encontrada</p>
      </div>
    );
  }

  const PageIcon = config.icon;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => currentNavigate('home')}
          className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm transition-colors group mb-8"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al inicio</span>
        </motion.button>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <PageIcon className="size-5 text-red-500" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-bold">
              KOP STUDIO
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide leading-tight">
            {config.title}
          </h1>
          <p className="text-neutral-500 text-sm mt-2">{config.description}</p>
          <div className="h-[2px] bg-gradient-to-r from-red-600 via-red-600/40 to-transparent mt-6" />
        </motion.div>

        {/* Page Content */}
        {config.content}
      </div>
    </div>
  );
}