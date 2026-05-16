import { motion } from 'motion/react';
import { ArrowRight, Globe, Zap, LayoutTemplate } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] pb-6 pt-24">
      <div className="max-w-7xl mx-auto w-full relative">
        <div className="bg-[#2563EB] rounded-[24px] p-8 lg:p-12 text-white shadow-2xl flex flex-col lg:flex-row justify-between items-center lg:items-end gap-10 relative overflow-hidden">
          
          {/* Background decorations */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl -z-0"></div>
          
          <div className="flex-1 space-y-6 relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight italic"
            >
              Ваша визитка<br className="hidden lg:block"/> в онлайне за 2 дня.
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-blue-100 max-w-2xl font-medium"
            >
              Создаем имиджевые сайты для малого и среднего бизнеса в Москве и МО.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-4"
            >
              <a 
                href="#portfolio" 
                className="w-full sm:w-auto px-6 py-4 bg-white text-[#0F172A] font-bold rounded-xl hover:bg-neutral-100 transition-colors shadow-lg flex justify-center items-center"
              >
                Посмотреть работы
              </a>
              <a 
                href="#contacts" 
                className="w-full sm:w-auto px-6 py-4 bg-[#0F172A] text-white font-bold rounded-xl hover:bg-[#1E293B] shadow-lg transition-all flex justify-center items-center"
              >
                Заказать превью
              </a>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-shrink-0 relative z-10 text-center lg:text-right"
          >
            <div className="text-xs uppercase tracking-widest text-blue-200 mb-1 font-bold">Цена от</div>
            <div className="text-5xl lg:text-6xl font-black">11 990 ₽</div>
            <div className="text-blue-200 text-sm mt-2 font-medium">75% от рыночной стоимости</div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
