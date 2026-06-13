'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Instagram, Heart, MessageCircle } from 'lucide-react'

const SOCIAL_IMAGES = [
  { src: '/images/products/tshirt-gothic-1.png', likes: 342, comments: 28 },
  { src: '/images/products/hoodie-mandala-2.png', likes: 518, comments: 45 },
  { src: '/images/products/cargo-black-3.png', likes: 287, comments: 19 },
  { src: '/images/products/tshirt-pray-4.png', likes: 421, comments: 33 },
  { src: '/images/products/jogger-6.png', likes: 195, comments: 15 },
  { src: '/images/products/tshirt-angel-7.png', likes: 376, comments: 29 },
  { src: '/images/products/beanie-9.png', likes: 263, comments: 21 },
  { src: '/images/products/puffer-bag-5.png', likes: 449, comments: 38 },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export default function SocialFeed() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })

  return (
    <>
      {/* Dark divider line above */}
      <div className="border-t border-[#1a1a1a]" />

      <section ref={ref} className="py-16 px-4 bg-black">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Instagram className="size-5 text-white" />
              <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-widest text-white">
                @KOPSTUDIO
              </h2>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500">
              SÍGUENOS EN INSTAGRAM
            </p>
            <div className="mt-3 mx-auto h-0.5 w-16 bg-[#dc2626]" />
          </motion.div>

          {/* Image Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3"
          >
            {SOCIAL_IMAGES.map((item, i) => (
              <motion.a
                key={i}
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                variants={cardVariants}
                className="group relative aspect-square overflow-hidden bg-[#111] cursor-pointer"
              >
                {/* Image */}
                <img
                  src={item.src}
                  alt={`KOP STUDIO - Post ${i + 1}`}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  loading="lazy"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                  <div className="flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-1.5 text-white">
                      <Heart className="size-5" fill="white" />
                      <span className="text-sm font-bold">{item.likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white">
                      <MessageCircle className="size-5" fill="white" />
                      <span className="text-sm font-bold">{item.comments}</span>
                    </div>
                  </div>
                </div>

                {/* Instagram icon on hover - top right */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Instagram className="size-4 text-white" />
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* Follow CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
            className="text-center mt-8"
          >
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#333] hover:border-white text-neutral-300 hover:text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 transition-colors duration-300"
            >
              <Instagram className="size-4" />
              Seguir en Instagram
            </a>
          </motion.div>
        </div>
      </section>

      {/* Dark divider line below */}
      <div className="border-t border-[#1a1a1a]" />
    </>
  )
}