import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Услуги', href: '#services' },
    { name: 'Портфолио', href: '#portfolio' },
    { name: 'О нас', href: '#about' },
    { name: 'Как мы работаем', href: '#process' },
    { name: 'Контакты', href: '#contacts' },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md border-b border-[#E2E8F0] py-3' : 'bg-[#F8FAFC]/90 backdrop-blur-sm py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <a href="#" className="font-bold text-xl tracking-tight text-[#0F172A]">
              Start in Web
            </a>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-sm font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors">
                {link.name}
              </a>
            ))}
            <a href="#contacts" className="px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-sm font-bold shadow-md hover:bg-[#1E293B] active:scale-95 transition-all">
              Заказать превью
            </a>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[#0F172A] hover:text-[#2563EB] transition-colors">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0] py-4 px-4 shadow-lg"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold text-[#0F172A] hover:text-[#2563EB] transition-colors border-b border-[#E2E8F0] pb-2"
                >
                  {link.name}
                </a>
              ))}
              <a 
                href="#contacts"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 text-center px-5 py-3 bg-[#0F172A] text-white font-bold rounded-xl active:scale-95 transition-all text-sm"
              >
                Заказать превью
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
