'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Ruler, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface SizeQuizDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSizeSelect?: (size: string) => void
}

const GENDER_OPTIONS = [
  { value: 'hombre', label: 'Hombre', emoji: '🏋️' },
  { value: 'mujer', label: 'Mujer', emoji: '🧘‍♀️' },
]

const HEIGHT_RANGES = [
  { value: '150-160', label: '1.50 - 1.60m', min: 150, max: 160 },
  { value: '160-165', label: '1.60 - 1.65m', min: 160, max: 165 },
  { value: '165-170', label: '1.65 - 1.70m', min: 165, max: 170 },
  { value: '170-175', label: '1.70 - 1.75m', min: 170, max: 175 },
  { value: '175-180', label: '1.75 - 1.80m', min: 175, max: 180 },
  { value: '180+', label: '1.80m+', min: 180, max: 210 },
]

const WEIGHT_RANGES = [
  { value: '45-55', label: '45 - 55 kg', min: 45, max: 55 },
  { value: '55-60', label: '55 - 60 kg', min: 55, max: 60 },
  { value: '60-65', label: '60 - 65 kg', min: 60, max: 65 },
  { value: '65-70', label: '65 - 70 kg', min: 65, max: 70 },
  { value: '70-80', label: '70 - 80 kg', min: 70, max: 80 },
  { value: '80+', label: '80+ kg', min: 80, max: 200 },
]

const FIT_OPTIONS = [
  { value: 'ajustado', label: 'Ajustado', desc: 'Cerca del cuerpo' },
  { value: 'regular', label: 'Regular', desc: 'Fit estándar' },
  { value: 'oversize', label: 'Oversize', desc: 'Amplio y cómodo' },
]

const TOTAL_STEPS = 4

const STEP_TITLES = ['Género', 'Estatura', 'Peso', 'Fit Preferido']

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors duration-300 ${
              i <= currentStep
                ? 'bg-red-600 text-white'
                : 'bg-[#1a1a1a] text-neutral-500'
            }`}
          >
            {i < currentStep ? (
              <Check className="size-3.5" />
            ) : (
              i + 1
            )}
          </div>
          {i < TOTAL_STEPS - 1 && (
            <div
              className={`w-8 h-px transition-colors duration-300 ${
                i < currentStep ? 'bg-red-600' : 'bg-[#333]'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function getRecommendedSize(
  gender: string,
  heightRange: string,
  weightRange: string,
  fit: string
): string {
  const height = HEIGHT_RANGES.find((h) => h.value === heightRange)
  const weight = WEIGHT_RANGES.find((w) => w.value === weightRange)

  if (!height || !weight) return 'M'

  // Calculate a base score from 0-4 (S=0, M=1, L=2, XL=3, OS=4)
  const heightMid = (height.min + height.max) / 2
  const weightMid = (weight.min + weight.max) / 2

  // Height-based base: <160→0, 160-170→1, 170-180→2, 180+→3
  let sizeScore = 0
  if (heightMid >= 180) sizeScore = 3
  else if (heightMid >= 175) sizeScore = 2.5
  else if (heightMid >= 170) sizeScore = 2
  else if (heightMid >= 165) sizeScore = 1.5
  else if (heightMid >= 160) sizeScore = 1
  else sizeScore = 0.5

  // Weight adjustment
  if (weightMid >= 80) sizeScore += 1
  else if (weightMid >= 70) sizeScore += 0.5
  else if (weightMid < 55) sizeScore -= 0.5

  // Fit adjustment
  if (fit === 'oversize') sizeScore += 1
  else if (fit === 'ajustado') sizeScore -= 0.5

  // Gender adjustment (women tend to need slightly smaller in unisex)
  if (gender === 'mujer') sizeScore -= 0.5

  // Clamp and map to size
  sizeScore = Math.max(0, Math.min(4, sizeScore))

  const SIZES = ['S', 'M', 'L', 'XL', 'OS']
  const index = Math.round(sizeScore)
  return SIZES[Math.min(index, SIZES.length - 1)]
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
  }),
}

export default function SizeQuizDialog({
  open,
  onOpenChange,
  onSizeSelect,
}: SizeQuizDialogProps) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [gender, setGender] = useState('')
  const [heightRange, setHeightRange] = useState('')
  const [weightRange, setWeightRange] = useState('')
  const [fit, setFit] = useState('')

  const recommendedSize = useMemo(() => {
    if (!gender || !heightRange || !weightRange || !fit) return null
    return getRecommendedSize(gender, heightRange, weightRange, fit)
  }, [gender, heightRange, weightRange, fit])

  const canProceed = useMemo(() => {
    switch (step) {
      case 0: return !!gender
      case 1: return !!heightRange
      case 2: return !!weightRange
      case 3: return !!fit
      default: return false
    }
  }, [step, gender, heightRange, weightRange, fit])

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }

  const goBack = () => {
    if (step > 0) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  const handleSelectSize = () => {
    if (recommendedSize && onSizeSelect) {
      onSizeSelect(recommendedSize)
    }
    onOpenChange(false)
    // Reset quiz state after closing
    setTimeout(() => {
      setStep(0)
      setGender('')
      setHeightRange('')
      setWeightRange('')
      setFit('')
    }, 300)
  }

  const handleClose = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      setTimeout(() => {
        setStep(0)
        setGender('')
        setHeightRange('')
        setWeightRange('')
        setFit('')
      }, 300)
    }
  }

  const isResultStep = step === TOTAL_STEPS

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] text-white sm:max-w-md rounded-none p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <Ruler className="size-4 text-red-600" />
            Encuentra tu Talla
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-xs">
            Responde 4 preguntas y te recomendamos la talla perfecta
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4">
          {!isResultStep && <StepIndicator currentStep={step} />}

          <div className="relative min-h-[220px] overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {/* Step 0: Gender */}
              {step === 0 && (
                <motion.div
                  key="step-gender"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <h3 className="text-center text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                    {STEP_TITLES[0]}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {GENDER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setGender(option.value)}
                        className={`p-4 border-2 text-center transition-all duration-200 ${
                          gender === option.value
                            ? 'border-red-600 bg-red-600/10'
                            : 'border-[#333] hover:border-white/50'
                        }`}
                      >
                        <span className="text-2xl block mb-2">{option.emoji}</span>
                        <span
                          className={`text-sm font-bold uppercase tracking-wider ${
                            gender === option.value ? 'text-white' : 'text-neutral-300'
                          }`}
                        >
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Height */}
              {step === 1 && (
                <motion.div
                  key="step-height"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <h3 className="text-center text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                    {STEP_TITLES[1]}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {HEIGHT_RANGES.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setHeightRange(option.value)}
                        className={`py-3 px-2 border-2 text-center transition-all duration-200 ${
                          heightRange === option.value
                            ? 'border-red-600 bg-red-600/10'
                            : 'border-[#333] hover:border-white/50'
                        }`}
                      >
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            heightRange === option.value ? 'text-white' : 'text-neutral-300'
                          }`}
                        >
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Weight */}
              {step === 2 && (
                <motion.div
                  key="step-weight"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <h3 className="text-center text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                    {STEP_TITLES[2]}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {WEIGHT_RANGES.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setWeightRange(option.value)}
                        className={`py-3 px-2 border-2 text-center transition-all duration-200 ${
                          weightRange === option.value
                            ? 'border-red-600 bg-red-600/10'
                            : 'border-[#333] hover:border-white/50'
                        }`}
                      >
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            weightRange === option.value ? 'text-white' : 'text-neutral-300'
                          }`}
                        >
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Fit */}
              {step === 3 && (
                <motion.div
                  key="step-fit"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <h3 className="text-center text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
                    {STEP_TITLES[3]}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {FIT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFit(option.value)}
                        className={`p-4 border-2 text-left transition-all duration-200 ${
                          fit === option.value
                            ? 'border-red-600 bg-red-600/10'
                            : 'border-[#333] hover:border-white/50'
                        }`}
                      >
                        <span
                          className={`text-sm font-bold uppercase tracking-wider block ${
                            fit === option.value ? 'text-white' : 'text-neutral-300'
                          }`}
                        >
                          {option.label}
                        </span>
                        <span className="text-[11px] text-neutral-500 mt-0.5 block">
                          {option.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Result Step */}
              {isResultStep && recommendedSize && (
                <motion.div
                  key="step-result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="text-center"
                >
                  <p className="text-xs text-neutral-500 uppercase tracking-widest mb-2">
                    Tu talla recomendada
                  </p>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-24 h-24 mx-auto border-2 border-red-600 flex items-center justify-center bg-red-600/10 mb-4"
                  >
                    <span className="text-4xl font-bold text-white">{recommendedSize}</span>
                  </motion.div>
                  <p className="text-sm text-neutral-300 mb-6">
                    Basado en tu perfil: {GENDER_OPTIONS.find((g) => g.value === gender)?.label},{' '}
                    {HEIGHT_RANGES.find((h) => h.value === heightRange)?.label},{' '}
                    {WEIGHT_RANGES.find((w) => w.value === weightRange)?.label}, fit{' '}
                    {FIT_OPTIONS.find((f) => f.value === fit)?.label}.
                  </p>
                  <Button
                    onClick={handleSelectSize}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest h-12 rounded-none"
                  >
                    COMPRAR ESTA TALLA
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          {!isResultStep && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={goBack}
                disabled={step === 0}
                className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors ${
                  step === 0
                    ? 'text-neutral-600 cursor-not-allowed'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <ChevronLeft className="size-4" />
                Atrás
              </button>

              {step < TOTAL_STEPS - 1 ? (
                <Button
                  onClick={goNext}
                  disabled={!canProceed}
                  className="bg-white text-black hover:bg-gray-200 text-xs font-bold uppercase tracking-wider h-10 px-6 rounded-none disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={() => setStep(TOTAL_STEPS)}
                  disabled={!canProceed}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider h-10 px-6 rounded-none disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Ver Resultado
                  <Ruler className="size-4 ml-1" />
                </Button>
              )}
            </div>
          )}

          {/* Restart button on result */}
          {isResultStep && (
            <button
              onClick={() => {
                setDirection(-1)
                setStep(0)
              }}
              className="w-full mt-4 text-xs text-neutral-500 hover:text-white uppercase tracking-wider transition-colors text-center"
            >
              Volver a empezar
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}