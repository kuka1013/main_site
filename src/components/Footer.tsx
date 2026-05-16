export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E2E8F0] py-6 mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2563EB] rounded flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <a href="#" className="font-bold text-lg tracking-tight text-[#0F172A]">
              Start in Web
            </a>
          </div>

          <div className="flex gap-6 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
            <a href="#services" className="hover:text-[#2563EB] transition-colors">Услуги</a>
            <a href="#portfolio" className="hover:text-[#2563EB] transition-colors">Портфолио</a>
            <a href="#contacts" className="hover:text-[#2563EB] transition-colors">Контакты</a>
          </div>

          <div className="text-[#94A3B8] text-xs font-medium">
            &copy; {new Date().getFullYear()} Start in Web. Вся Россия.
          </div>
          
        </div>
      </div>
    </footer>
  );
}
