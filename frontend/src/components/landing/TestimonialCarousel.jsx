import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

/**
 * TestimonialCarousel Component
 * Rotating carousel of user testimonials with measurable outcomes
 */
const TestimonialCarousel = ({ className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'João Silva',
      role: 'Designer',
      avatar: 'JS',
      quote: 'Economizei R$ 800 no primeiro mês identificando gastos desnecessários. A IA realmente funciona!',
      rating: 5,
      savings: 'R$ 800/mês'
    },
    {
      id: 2,
      name: 'Ana Costa',
      role: 'Estudante',
      avatar: 'AC',
      quote: 'A divisão de despesas com meus colegas de apartamento nunca foi tão fácil. Acabaram as confusões!',
      rating: 5,
      savings: 'Sem estresse'
    },
    {
      id: 3,
      name: 'Pedro Santos',
      role: 'Freelancer',
      avatar: 'PS',
      quote: 'A IA categorizou 95% das minhas transações corretamente. Economizo horas todo mês!',
      rating: 5,
      savings: '5h/mês economizadas'
    },
    {
      id: 4,
      name: 'Maria Oliveira',
      role: 'Empresária',
      avatar: 'MO',
      quote: 'Finalmente consigo visualizar para onde meu dinheiro está indo. Os relatórios são incríveis!',
      rating: 5,
      savings: 'Controle total'
    },
    {
      id: 5,
      name: 'Carlos Mendes',
      role: 'Desenvolvedor',
      avatar: 'CM',
      quote: 'Atingi minha meta de economia em 8 meses usando o Monity. Recomendo demais!',
      rating: 5,
      savings: 'Meta alcançada'
    }
  ];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [handleNext]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const current = testimonials[currentIndex];

  return (
    <div className={`relative ${className}`}>
      <div className="bg-[#1F1E1D] border border-[#3a3a3a] rounded-xl p-8 overflow-hidden">
        {/* Decorative Quote Icon */}
        <Quote className="absolute top-4 right-4 w-16 h-16 text-[#56a69f]/10" />

        {/* Testimonial Content */}
        <div className="relative min-h-[200px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="text-center"
            >
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#56a69f] to-[#4A8F88] flex items-center justify-center text-white font-bold text-xl border-4 border-[#262624]">
                  {current.avatar}
                </div>
              </div>

              {/* Quote */}
              <p className="text-lg text-white mb-4 max-w-2xl mx-auto leading-relaxed">
                "{current.quote}"
              </p>

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-3">
                {[...Array(current.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-500 text-xl">★</span>
                ))}
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-center gap-4">
                <div>
                  <p className="text-white font-semibold">{current.name}</p>
                  <p className="text-sm text-[#C2C0B6]">{current.role}</p>
                </div>
                <div className="h-8 w-px bg-[#3a3a3a]" />
                <div className="px-3 py-1 bg-[#56a69f]/20 rounded-full border border-[#56a69f]/30">
                  <p className="text-sm font-semibold text-[#56a69f]">{current.savings}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full bg-[#232323] hover:bg-[#2a2a2a] border border-[#3a3a3a] hover:border-[#56a69f] transition-all duration-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 text-[#C2C0B6]" />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-[#56a69f] w-8'
                    : 'bg-[#3a3a3a] hover:bg-[#4a4a4a]'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-[#232323] hover:bg-[#2a2a2a] border border-[#3a3a3a] hover:border-[#56a69f] transition-all duration-200"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 text-[#C2C0B6]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;
