'use client';

import { useState, type FormEvent } from 'react';
import { motion, type Variants } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigationStore } from '@/stores/useNavigationStore';
import { useSiteSettings, whatsappLink } from '@/lib/siteSettings';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/lib/pricing';

const formatCOP = (n: number) => `$${n.toLocaleString('es-CO')}`;
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
        // Same values the checkout charges (src/lib/pricing.ts)
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-[#1a1a1a] border border-[#222] px-4 py-2.5">
            <span className="text-neutral-300">Envío a todo Colombia</span>
            <span className="text-white font-semibold">{formatCOP(SHIPPING_COST)} COP</span>
          </div>
          <div className="flex justify-between items-center bg-red-600/10 border border-red-600/30 px-4 py-2.5 mt-3">
            <span className="text-red-400 font-medium">
              <CheckCircle2 className="inline size-3.5 mr-1.5 -mt-0.5" />
              Envío gratis
            </span>
            <span className="text-white font-bold">En compras desde {formatCOP(FREE_SHIPPING_THRESHOLD)} COP</span>
          </div>
          <p className="text-xs text-neutral-400 pt-1">
            El costo de envío se muestra siempre antes de pagar, en el resumen de tu pedido.
          </p>
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
          Cuando despachemos tu pedido te compartiremos el{' '}
          <span className="text-white font-medium">número de guía</span> para que lo rastrees en
          el sitio web de la transportadora. También puedes consultar el estado con nuestra herramienta de{' '}
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
          <span className="text-white font-bold">7 días calendario</span> (nunca menos de 5 días
          hábiles) contados desde la fecha de recepción de tu pedido para solicitar un cambio o
          devolución.
        </p>
      ),
    },
    {
      icon: Shield,
      title: 'Derecho de retracto (Ley 1480, art. 47)',
      body: (
        <p>
          Como tu compra fue en línea, puedes <span className="text-white font-medium">retractarte
          dentro de los 5 días hábiles</span> siguientes a la entrega, sin tener que explicar el
          motivo, <span className="text-white">incluso si el producto estaba en promoción</span>. El
          producto debe devolverse en las mismas condiciones en que lo recibiste y el costo del
          transporte de la devolución corre por tu cuenta. Te reembolsamos el valor pagado en un
          plazo máximo de <span className="text-white">30 días calendario</span>. No aplica para
          productos personalizados ni prendas de uso íntimo.
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
            <span>Cambios por talla o gusto en artículos en liquidación (sí aplican el derecho de retracto y la garantía)</span>
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
          Todos nuestros productos cuentan con una <span className="text-white font-medium">garantía legal de 30 días</span>{' '}
          por defectos de fabricación, conforme a la Ley 1480 de 2011. En caso de presentar un defecto, realizaremos el cambio{' '}
          <span className="text-white font-medium">sin costo adicional</span> (KOP STUDIO asume el envío de ida y
          vuelta).
        </p>
      ),
    },
    {
      icon: CreditCard,
      title: 'Reversión del pago (Ley 1480, art. 51)',
      body: (
        <p>
          Si pagaste con tarjeta, PSE u otro medio electrónico y fuiste víctima de fraude, la
          operación no fue solicitada, no recibiste el producto o este no corresponde a lo que
          compraste o es defectuoso, puedes solicitar la{' '}
          <span className="text-white font-medium">reversión del pago</span> dentro de los 5 días
          hábiles siguientes a la fecha en que conociste el hecho o recibiste el producto. Debes
          informarlo a KOP STUDIO y a la entidad emisora de tu medio de pago.
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
  const { business } = useSiteSettings();
  const seller = business.name || 'KOP STUDIO';
  const contactEmail = business.email || 'el correo publicado en la sección de Contacto';
  const sections = [
    {
      title: '1. Aceptación de los términos',
      body: (
        <p>
          Al acceder, navegar y/o realizar compras en esta tienda en línea (en adelante, &ldquo;la
          Plataforma&rdquo;), operada por <span className="text-white font-medium">{seller}</span>
          {business.nit && <> (NIT/CC {business.nit})</>}, usted acepta los presentes Términos y
          Condiciones. Si no está de acuerdo con alguno de ellos, le pedimos abstenerse de utilizar
          nuestros servicios.
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
            Puedes comprar como invitado o crear una cuenta. En ambos casos debes proporcionar información
            veraz y completa: nombre, correo electrónico, número telefónico y dirección de envío.
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
            Todos los precios están expresados en <span className="text-white font-medium">Pesos Colombianos (COP)</span> y
            son el valor total a pagar por el producto, incluidos los impuestos aplicables. El costo del
            envío se informa por separado antes de pagar. El precio que aplica es el vigente al momento de
            la compra.
          </p>
          <p>
            Los pagos en línea se procesan a través de <span className="text-white font-medium">Wompi</span>{' '}
            (tarjetas de crédito y débito, PSE, Nequi). No vemos ni almacenamos los datos de tu tarjeta.
            Cuando el pago en línea no está disponible, el pedido queda reservado y te contactamos para
            coordinar el pago.
          </p>
        </>
      ),
    },
    {
      title: '5. Proceso de compra y confirmación',
      body: (
        <p>
          Al completar la compra verás en pantalla tu número de orden, con el que puedes consultar su
          estado. Las unidades se reservan en el momento de crear el pedido, por lo que solo se venden
          productos con existencias. Cuando el pedido sea despachado te compartiremos el número de guía
          de la transportadora. Si el pago en línea es rechazado, el pedido se cancela automáticamente
          y no se realiza ningún cobro.
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
          Hacemos lo posible para que la Plataforma esté disponible y sin errores, pero no podemos
          garantizar que funcione de forma ininterrumpida. Nada de lo dispuesto en estos términos
          limita los derechos que te reconoce la Ley 1480 de 2011, incluidos la garantía legal, el
          derecho de retracto y la reversión del pago.
        </p>
      ),
    },
    {
      title: '8. Modificaciones a los términos',
      body: (
        <p>
          Podemos actualizar estos términos. Los cambios rigen desde su publicación en esta página y{' '}
          <span className="text-white">no afectan las compras ya realizadas</span>, que se rigen por los
          términos vigentes al momento de la compra.
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
      title: '10. Identificación del vendedor y PQR',
      body: (
        <p>
          Vendedor: <span className="text-white font-medium">{seller}</span>
          {business.nit && <>, NIT/CC {business.nit}</>}
          {business.address && <>, {business.address}</>}. Para peticiones, quejas o reclamos escríbenos a{' '}
          <span className="text-white font-medium">{contactEmail}</span>
          {business.phone && <> o llámanos al {business.phone}</>}. También puedes acudir a la{' '}
          <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="text-red-400 underline underline-offset-2">
            Superintendencia de Industria y Comercio
          </a>.
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

const PRIVACY_LAST_UPDATED = '25 de septiembre de 2026';

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-none space-y-1.5 mt-2">
      {items.map((d, i) => (
        <li key={i} className="flex items-start gap-2">
          <ChevronRight className="size-3.5 text-red-500 mt-0.5 shrink-0" />
          <span>{d}</span>
        </li>
      ))}
    </ul>
  );
}

// Política de Tratamiento de Datos Personales (Ley 1581 de 2012, Decreto 1377 de 2013).
// Must describe what the site actually does — update it if data flows change.
function PrivacidadContent() {
  const { business } = useSiteSettings();
  const controller = business.name || 'KOP STUDIO';
  const contactEmail = business.email || 'el correo publicado en la sección de Contacto';
  const sections = [
    {
      title: '1. Responsable del tratamiento',
      body: (
        <p>
          <span className="text-white font-medium">{controller}</span>
          {business.nit && <>, identificado con NIT/CC {business.nit}</>}
          {business.address && <>, con domicilio en {business.address}</>}. Correo:{' '}
          <span className="text-white font-medium">{contactEmail}</span>
          {business.phone && <>. Teléfono: {business.phone}</>}.
        </p>
      ),
    },
    {
      title: '2. Datos que recopilamos',
      body: (
        <BulletList
          items={[
            'Al comprar: nombre, correo, teléfono y dirección de envío.',
            'Si creas una cuenta: nombre, correo, teléfono (opcional) y tu contraseña cifrada.',
            'Si escribes una reseña: el nombre que elijas mostrar y tu comentario, que serán públicos.',
            'No recibimos ni guardamos los datos de tu tarjeta: el pago lo procesa Wompi directamente.',
          ]}
        />
      ),
    },
    {
      title: '3. Finalidades',
      body: (
        <BulletList
          items={[
            'Procesar, cobrar y entregar tus pedidos, y atender cambios, devoluciones y garantías.',
            'Comunicarnos contigo sobre tu pedido.',
            'Gestionar tu cuenta y el historial de pedidos.',
            'Mostrar de forma anónima la ciudad y el producto de compras recientes (nunca tu nombre).',
            'Cumplir obligaciones legales, contables y tributarias.',
          ]}
        />
      ),
    },
    {
      title: '4. Con quién compartimos tus datos',
      body: (
        <>
          <p>Solo con los encargados necesarios para prestar el servicio:</p>
          <BulletList
            items={[
              <><span className="text-white">Wompi (Bancolombia)</span>: procesamiento de pagos.</>,
              <><span className="text-white">Empresas de transporte</span>: nombre, teléfono y dirección para la entrega.</>,
              <><span className="text-white">Proveedor de hosting</span>: almacenamiento seguro de la tienda y su base de datos.</>,
            ]}
          />
          <p>No vendemos ni cedemos tus datos a terceros para publicidad.</p>
        </>
      ),
    },
    {
      title: '5. Cookies y almacenamiento local',
      body: (
        <>
          <p>
            Usamos únicamente elementos <span className="text-white">necesarios</span> para que la
            tienda funcione. No usamos cookies de analítica, publicidad ni rastreo de terceros.
          </p>
          <BulletList
            items={[
              <><span className="text-white">kop_session</span> (cookie): mantiene tu sesión iniciada. Dura 7 días o hasta que cierres sesión.</>,
              <><span className="text-white">Almacenamiento local del navegador</span>: guarda tu carrito, favoritos y productos vistos en tu propio dispositivo.</>,
            ]}
          />
          <p>Puedes borrarlos desde la configuración de tu navegador; el carrito y la sesión se perderán.</p>
        </>
      ),
    },
    {
      title: '6. Tus derechos',
      body: (
        <>
          <p>Como titular de los datos puedes, de forma gratuita:</p>
          <BulletList
            items={[
              'Conocer, actualizar y rectificar tus datos.',
              'Solicitar prueba de la autorización que nos diste.',
              'Ser informado sobre el uso que les damos.',
              'Revocar la autorización y/o pedir la supresión de tus datos, cuando no exista un deber legal de conservarlos.',
              'Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).',
            ]}
          />
        </>
      ),
    },
    {
      title: '7. Cómo ejercer tus derechos',
      body: (
        <p>
          Escribe a <span className="text-white font-medium">{contactEmail}</span> indicando tu nombre,
          correo usado en la tienda y tu solicitud. Respondemos las{' '}
          <span className="text-white">consultas en máximo 10 días hábiles</span> (prorrogables 5 más) y
          los <span className="text-white">reclamos en máximo 15 días hábiles</span> (prorrogables 8 más),
          conforme a los artículos 14 y 15 de la Ley 1581 de 2012.
        </p>
      ),
    },
    {
      title: '8. Seguridad y conservación',
      body: (
        <p>
          La tienda usa conexión cifrada (HTTPS), las contraseñas se guardan cifradas y el acceso al
          panel está restringido. Conservamos los datos de pedidos el tiempo exigido por las normas
          contables y tributarias; los demás, mientras mantengas tu cuenta o hasta que pidas su supresión.
        </p>
      ),
    },
    {
      title: '9. Menores de edad',
      body: (
        <p>
          La tienda está dirigida a mayores de edad. Si eres menor, realiza tus compras con la
          autorización y acompañamiento de tu representante legal.
        </p>
      ),
    },
    {
      title: '10. Vigencia',
      body: (
        <p>
          Esta política rige desde el {PRIVACY_LAST_UPDATED}. Si la cambiamos de forma sustancial, lo
          informaremos en esta página.
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

const CONTACT_SUBJECTS = [
  'Consulta general',
  'Estado de pedido',
  'Devolución o cambio',
  'Tallas y medidas',
  'Ventas mayoristas',
  'Queja o reclamo',
  'Otro',
];

const contactInputClass =
  'bg-[#1a1a1a] border-[#333] text-white placeholder:text-neutral-500 text-sm rounded-none focus-visible:border-red-600/50 transition-colors';

function ContactoContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { whatsappNumber, business } = useSiteSettings();
  const [formData, setFormData] = useState({ name: '', subject: '', message: '' });

  // Messages are sent through the customer's own WhatsApp or email app, so they
  // always reach the store (nothing is silently stored on the server).
  const canSend = !!whatsappNumber || !!business.email;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject || !formData.message.trim()) {
      toast.error('Completa todos los campos');
      return;
    }
    const text = `Hola KOP STUDIO, soy ${formData.name.trim()}.\nAsunto: ${formData.subject}\n\n${formData.message.trim()}`;
    const wa = whatsappLink(whatsappNumber, text);
    const url =
      wa ??
      `mailto:${business.email}?subject=${encodeURIComponent(`[${formData.subject}] ${formData.name.trim()}`)}&body=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const cards = [
    whatsappNumber && { icon: MessageCircle, label: 'WhatsApp', value: `+${whatsappNumber}`, href: whatsappLink(whatsappNumber) ?? undefined, accent: true },
    business.email && { icon: Mail, label: 'Email', value: business.email, href: `mailto:${business.email}`, accent: false },
    business.phone && { icon: MessageCircle, label: 'Teléfono', value: business.phone, href: `tel:${business.phone.replace(/[^\d+]/g, '')}`, accent: false },
    business.hours && { icon: Clock, label: 'Horario', value: business.hours, accent: false },
    { icon: MapPin, label: 'Ubicación', value: business.address || 'La Unión, Nariño, Colombia', accent: false },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string; href?: string; accent: boolean }[];

  const socials = [
    business.instagramUrl && { href: business.instagramUrl, label: 'Instagram', Icon: Instagram },
    business.twitterUrl && { href: business.twitterUrl, label: 'X / Twitter', Icon: Twitter },
  ].filter(Boolean) as { href: string; label: string; Icon: React.ElementType }[];

  return (
    <>
      {/* Contact Info Cards (only real, configured data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mb-8">
        {cards.map((item, i) => {
          const content = (
            <>
              <item.icon className={`size-5 mt-0.5 shrink-0 ${item.accent ? 'text-red-500' : 'text-neutral-400'}`} />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">{item.label}</p>
                <p className={`text-sm mt-0.5 break-all ${item.accent ? 'text-white font-medium' : 'text-neutral-300'}`}>
                  {item.value}
                </p>
              </div>
            </>
          );
          const className = `flex items-start gap-3 p-4 border ${
            item.accent ? 'border-red-600/30 bg-red-600/5' : 'border-[#222] bg-[#111]'
          } rounded-sm`;
          return (
            <motion.div key={item.label} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {item.href ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer" className={`${className} hover:border-red-600/50 transition-colors`}>
                  {content}
                </a>
              ) : (
                <div className={className}>{content}</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {socials.length > 0 && (
        <>
          <SectionHeader icon={Instagram} title="Redes Sociales" index={5} />
          <SectionBody index={5.5}>
            <div className="flex items-center gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-[#333] text-neutral-300 hover:text-white hover:border-white/50 text-sm transition-colors"
                >
                  <Icon className="size-4" />
                  {label}
                </a>
              ))}
            </div>
          </SectionBody>
        </>
      )}

      <div className="mt-8">
        <button
          onClick={() => navigate('info-page', { slug: 'faq' })}
          className="flex items-center gap-2 text-neutral-400 hover:text-white text-sm transition-colors group"
        >
          <FileText className="size-4" />
          <span>¿Tienes dudas? Revisa nuestras preguntas frecuentes</span>
          <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {canSend && (
        <>
          <RedDivider />
          <SectionHeader icon={Mail} title="Envíanos un mensaje" index={7} />
          <motion.div custom={7.5} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-neutral-400 text-xs mt-1">
              Al enviar se abrirá {whatsappNumber ? 'WhatsApp' : 'tu aplicación de correo'} con tu mensaje listo.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                    Nombre
                  </label>
                  <Input
                    id="contact-name"
                    autoComplete="name"
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Tu nombre"
                    className={`${contactInputClass} h-10`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-subject" className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                    Asunto
                  </label>
                  <Select value={formData.subject} onValueChange={(v) => setFormData((p) => ({ ...p, subject: v }))}>
                    <SelectTrigger id="contact-subject" className="bg-[#1a1a1a] border-[#333] text-white text-sm h-10 rounded-none focus:ring-red-600/30 focus:border-red-600/50">
                      <SelectValue placeholder="Selecciona un asunto" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[#333]">
                      {CONTACT_SUBJECTS.map((subject) => (
                        <SelectItem key={subject} value={subject} className="text-neutral-300 focus:text-white focus:bg-[#222]">
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                  Mensaje
                </label>
                <Textarea
                  id="contact-message"
                  maxLength={2000}
                  value={formData.message}
                  onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={5}
                  className={`${contactInputClass} resize-none`}
                />
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white uppercase text-xs tracking-widest font-bold px-8 h-11 rounded-none transition-all"
              >
                {whatsappNumber ? 'ENVIAR POR WHATSAPP' : 'ENVIAR POR CORREO'}
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </>
  );
}

function FAQContent() {
  const navigate = useNavigationStore((s) => s.navigate);
  const faqs = [
    { q: '¿Cuánto tarda mi envío?', a: 'Las ciudades principales (Bogotá, Medellín, Cali, Barranquilla) tienen entregas de 1-3 días hábiles. Otras zonas: 3-7 días hábiles.' },
    { q: '¿El envío es gratis?', a: `Sí, en compras desde ${formatCOP(FREE_SHIPPING_THRESHOLD)} COP. Para compras menores, el envío a cualquier parte de Colombia cuesta ${formatCOP(SHIPPING_COST)} COP y se muestra antes de pagar.` },
    { q: '¿Puedo cambiar mi pedido?', a: 'Puedes solicitar cambios o devoluciones dentro de los 7 días calendario después de recibir tu pedido, siempre que la prenda esté sin uso y con etiquetas. Además, tienes derecho de retracto durante 5 días hábiles (Ley 1480).' },
    { q: '¿Qué métodos de pago aceptan?', a: 'Pagas en línea de forma segura a través de Wompi (tarjetas, PSE, Nequi). Si el pago en línea no está disponible, tu pedido queda reservado y te contactamos para coordinar el pago.' },
    { q: '¿Cómo rastreo mi pedido?', a: 'Guarda el número de orden que ves al finalizar tu compra. Cuando despachemos tu pedido te compartiremos el número de guía, y puedes consultar el estado con la herramienta de rastrear pedido.' },
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