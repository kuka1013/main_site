import { motion } from 'motion/react';

export default function Process() {
  const steps = [
    { num: "01", title: "Заявка/Звонок", desc: "Вы связываетесь с нами удобным способом." },
    { num: "02", title: "Анализ", desc: "Обсуждаем ваши цели и пожелания по проекту." },
    { num: "03", title: "Бесплатное превью", desc: "Создаем макет вашего будущего сайта." },
    { num: "04", title: "Договор", desc: "Если превью понравилось, подписываем договор." },
    { num: "05", title: "Запуск", desc: "Оплачиваете, и сайт запускается!" },
    { num: "06", title: "Поддержка", desc: "Регулярно поддерживаем и консультируем." },
  ];

  return (
    <section id="process" className="py-10 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-[#0F172A] rounded-[24px] p-6 lg:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="mb-10 relative z-10 text-center lg:text-left flex flex-col lg:flex-row justify-between lg:items-end gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Этапы работы</p>
              <h2 className="font-sans text-3xl md:text-4xl font-bold tracking-tight">Запуск за 6 шагов</h2>
            </div>
            <a href="#contacts" className="inline-block px-6 py-3 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg active:scale-95 text-sm uppercase tracking-wider text-center">
              Заказать сайт
            </a>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-6 relative z-10">
            {steps.map((step, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={i}
                className="relative"
              >
                <div className="pl-4 border-l-2 border-slate-700">
                  <div className="text-sm font-bold text-[#2563EB] mb-1">Шаг {step.num}</div>
                  <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
