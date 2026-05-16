/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import About from './components/About';
import Process from './components/Process';
import Contacts from './components/Contacts';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="font-sans antialiased text-[#0F172A] selection:bg-[#2563EB]/30 selection:text-[#0F172A]">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Portfolio />
        <About />
        <Process />
        <Contacts />
      </main>
      <Footer />
    </div>
  );
}
