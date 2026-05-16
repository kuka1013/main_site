import { motion } from 'motion/react';
import { Mail, Phone, MessageCircle } from 'lucide-react';

export default function Contacts() {
  return (
    <section id="contacts" className="py-10 bg-[#F8FAFC] relative">
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[#2563EB]/5 blur-[150px] pointer-events-none rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10">
          
          <div className="max-w-xl">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-sans text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight text-[#0F172A]"
            >
              Начните свой <br/>
              <span className="text-[#2563EB]">онлайн-путь</span> сегодня!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-[#64748B] font-medium mb-6"
            >
              Свяжитесь с нами, чтобы обсудить проект и заказать бесплатное превью сайта вашей компании. Работаем полностью онлайн.
            </motion.p>
            
            <div className="space-y-4">
              <motion.a 
                href="tel:+79588022762"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4 group p-4 -ml-4 rounded-2xl hover:bg-white transition-colors border border-transparent hover:border-[#E2E8F0] hover:shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] group-hover:bg-[#2563EB] group-hover:text-white transition-colors group-hover:border-[#2563EB]">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[#0F172A] font-bold text-lg tracking-wide">8 958 802 27 62</p>
                  <p className="text-[#64748B] text-sm font-medium">Только звонки (10:00 - 24:00)</p>
                </div>
              </motion.a>

              <motion.a 
                href="mailto:startinweb24@gmail.com"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 group p-4 -ml-4 rounded-2xl hover:bg-white transition-colors border border-transparent hover:border-[#E2E8F0] hover:shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] group-hover:bg-[#2563EB] group-hover:text-white transition-colors group-hover:border-[#2563EB]">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[#0F172A] font-bold text-lg tracking-wide">startinweb24@gmail.com</p>
                  <p className="text-[#64748B] text-sm font-medium">Напишите нам на почту</p>
                </div>
              </motion.a>
              
              <motion.a 
                href="https://t.me/wtfisw"
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 group p-4 -ml-4 rounded-2xl hover:bg-white transition-colors border border-transparent hover:border-[#E2E8F0] hover:shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <p className="text-[#0F172A] font-bold text-lg tracking-wide">@wtfisw</p>
                  <p className="text-[#64748B] text-sm font-medium">Чат в Telegram</p>
                </div>
              </motion.a>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-white border border-[#E2E8F0] rounded-[24px] p-6 lg:p-8 shadow-sm flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#2563EB]/5 rounded-full blur-2xl"></div>
            
            <h3 className="text-2xl font-bold text-[#0F172A] mb-2 relative z-10">Готовы обсудить?</h3>
            <p className="text-[#64748B] font-medium mb-6 text-sm relative z-10">Оставьте заявку в Telegram или позвоните нам. Мы ответим на все вопросы.</p>
            
            <div className="flex flex-col gap-4 relative z-10">
              <a href="https://t.me/wtfisw" target="_blank" rel="noreferrer" className="w-full py-4 bg-[#2AABEE] text-white text-center font-bold rounded-xl hover:bg-[#229ED9] transition-colors flex justify-center items-center gap-2 shadow-sm">
                <MessageCircle size={20} />
                Написать в Telegram
              </a>
              <a href="tel:+79588022762" className="w-full py-4 bg-white border border-[#E2E8F0] text-[#0F172A] text-center font-bold rounded-xl hover:bg-[#F8FAFC] transition-colors flex justify-center items-center gap-2 shadow-sm">
                <Phone size={20} />
                Заказать звонок
              </a>
            </div>
            
            <p className="text-center text-[10px] text-[#94A3B8] font-bold mt-6 uppercase tracking-widest relative z-10">
              Сайт за 2 дня • 100% Онлайн
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
