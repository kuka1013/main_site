import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';

export default function Portfolio() {
  const projects = [
    {
      id: 1,
      name: "Haga Sushi",
      desc: "Сайт доставки суши с современным минималистичным дизайном.",
      image: "https://i.postimg.cc/ncVVStP6/Snimok-ekrana-2026-05-16-201745.png",
      link: "https://hagasushi-preview.vercel.app"
    },
    {
      id: 2,
      name: "Dzen Sushi",
      desc: "Элегантная визитка для ресторана японской кухни.",
      image: "https://i.postimg.cc/gkMzfT9P/Snimok-ekrana-2026-05-16-201756.png",
      link: "https://dzen-sushi.vercel.app/"
    }
  ];

  return (
    <section id="portfolio" className="py-10 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <h2 className="font-sans text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#0F172A]">Наши работы</h2>
            <p className="text-[#64748B] font-medium text-lg">
              Мы создаем сайты, которые выглядят дорого, работают быстро и решают задачу презентации вашего бизнеса в сети.
            </p>
          </div>
          <a href="#contacts" className="inline-flex items-center justify-center px-6 py-3 border border-[#E2E8F0] bg-white rounded-xl font-bold text-[#0F172A] shadow-sm hover:bg-[#F8FAFC] transition-colors whitespace-nowrap">
            Хочу так же
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <motion.a 
              href={project.link}
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group block relative overflow-hidden rounded-[24px] bg-white border border-[#E2E8F0] shadow-sm aspect-[16/10] flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex-1 relative overflow-hidden bg-[#F1F5F9] rounded-t-[24px]">
                <img 
                  src={project.image} 
                  alt={project.name} 
                  className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-all duration-500 ease-out"
                  loading="lazy"
                />
              </div>
              
              <div className="p-6 bg-white border-t border-[#E2E8F0] flex-shrink-0 z-10">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold text-[#0F172A]">{project.name}</h3>
                  <div className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-all duration-300">
                    <ExternalLink size={14} />
                  </div>
                </div>
                <p className="text-[#64748B] text-sm font-medium">{project.desc}</p>
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
