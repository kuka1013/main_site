import { motion } from 'motion/react';
import { Target, Users, Clock, ShieldCheck } from 'lucide-react';

export default function About() {
  const stats = [
    { icon: <ShieldCheck size={24}/>, value: "11 900 ₽", label: "75% от рынка" },
    { icon: <Clock size={24}/>, value: "2 дня", label: "Срок создания" },
    { icon: <Target size={24}/>, value: "Онлайн", label: "Формат работы" },
    { icon: <Users size={24}/>, value: "МСБ", label: "Фокус на МСК и МО" },
  ];

  return (
    <section id="about" className="py-10 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm p-6 lg:p-10 grid lg:grid-cols-2 gap-10 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-4">О компании</p>
            <h2 className="font-sans text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#0F172A]">
              Помогаем МСБ заявить о себе
            </h2>
            <div className="space-y-6 text-base text-[#64748B] font-medium">
              <p>
                Наша миссия — помогать малому и среднему бизнесу быстро и доступно заявить о себе в интернете. 
              </p>
              <p>
                Мы понимаем, что не каждому бизнесу нужен сложный многостраничный портал. Часто достаточно красивой, адаптивной визитки, которая вызовет доверие и предоставит клиентам нужные контакты.
              </p>
            </div>
            
            <div className="mt-10">
              <a href="#contacts" className="group inline-flex items-center gap-2 text-[#0F172A] font-bold hover:text-[#2563EB] transition-colors">
                <span className="w-8 h-[2px] bg-[#0F172A] group-hover:bg-[#2563EB] group-hover:w-12 transition-all"></span>
                Узнать больше
              </a>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 flex flex-col items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div className="text-[#2563EB] bg-blue-100 p-3 rounded-xl">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0F172A] mb-1">{stat.value}</p>
                  <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
