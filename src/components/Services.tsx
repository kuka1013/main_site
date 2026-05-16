import { motion } from 'motion/react';
import { PenTool, Smartphone, Search, Rocket, MonitorPlay, Palette, RefreshCcw, HandHeart } from 'lucide-react';

export default function Services() {
  const scratchSteps = [
    { icon: <MonitorPlay size={20} />, title: "Анализ", desc: "Выявляем ключевые потребности вашего бизнеса." },
    { icon: <PenTool size={20} />, title: "Концепция", desc: "Уникальный макет и продуманная структура." },
    { icon: <Palette size={20} />, title: "Контент", desc: "Размещаем ваши тексты, изображения и логотипы." },
    { icon: <Smartphone size={20} />, title: "Верстка", desc: "Идеально на любых устройствах: ПК, планшеты, смартфоны." },
    { icon: <Search size={20} />, title: "Оптимизация", desc: "Базовое SEO и быстрая загрузка." },
    { icon: <Rocket size={20} />, title: "Запуск", desc: "Публикуем готовый сайт на вашем домене." },
  ];

  const redesignSteps = [
    { title: "Аудит", desc: "Действующего ресурса." },
    { title: "Предложения", desc: "Новый дизайн-концепт." },
    { title: "Модернизация", desc: "Обновляем внешний вид." },
    { title: "Структура", desc: "Улучшаем навигацию." },
    { title: "Перенос", desc: "Актуализация контента." },
    { title: "Тест и Запуск", desc: "Проверка всех элементов." },
  ];

  return (
    <section id="services" className="py-10 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-tight mb-6 text-[#0F172A]">Что мы <span className="text-[#2563EB]">предлагаем</span></h2>
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-4 tracking-widest uppercase">Доступно в МСК и МО</span>
          <p className="text-lg text-[#64748B] font-medium mt-2">
            Создаем имиджевые сайты-визитки предприятий — просто, красиво, без сложного функционала. Фокус на презентации.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* С нуля */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#E2E8F0] relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
                <Rocket size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#0F172A]">Сайт с нуля</h3>
            </div>
            
            <div className="space-y-6 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-[#E2E8F0]">
              {scratchSteps.map((step, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  key={i} 
                  className="relative pl-10"
                >
                  <div className="absolute left-[7px] top-[7px] w-2.5 h-2.5 rounded-full bg-[#2563EB] ring-4 ring-white z-10"></div>
                  <div>
                    <h4 className="text-lg font-bold tracking-tight mb-1 text-[#0F172A]">
                      {step.title}
                    </h4>
                    <p className="text-[#64748B] font-medium text-sm">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Редизайн */}
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#E2E8F0] relative flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <RefreshCcw size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#0F172A]">Редизайн</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              {redesignSteps.map((step, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  key={i}
                  className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]"
                >
                  <div className="text-indigo-600 text-sm font-bold mb-2">0{i + 1}</div>
                  <h4 className="text-base font-bold text-[#0F172A] mb-1">{step.title}</h4>
                  <p className="text-[#64748B] font-medium text-sm">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* Pricing Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-6 w-full bg-white border border-[#E2E8F0] shadow-sm rounded-[24px] p-6 lg:p-8 relative"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold uppercase tracking-widest mb-4">
                <HandHeart size={14} /> Особое предложение
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-6">Бесплатное превью сайта до заключения договора!</h3>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-[#CBD5E1]"></div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-[#94A3B8]"></div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-[#64748B]"></div>
                </div>
                <p className="text-[#64748B] font-medium text-sm">Показываем готовый макет сайта до оплаты.</p>
              </div>
            </div>
            
            <div className="flex-shrink-0 bg-[#F8FAFC] rounded-2xl p-6 border border-[#E2E8F0] w-full lg:w-auto">
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-1">Создание сайта</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-black text-[#0F172A]">от 11 990 ₽</span>
              </div>
              <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Хостинг</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748B] font-medium mr-4">При оплате за год</span>
                  <span className="text-[#0F172A] font-bold">799 ₽/мес</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748B] font-medium mr-4">За полгода</span>
                  <span className="text-[#0F172A] font-bold">999 ₽/мес</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#64748B] font-medium mr-4">За месяц</span>
                  <span className="text-[#0F172A] font-bold">1299 ₽/мес</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
