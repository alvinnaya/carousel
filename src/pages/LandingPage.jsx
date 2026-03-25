import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col font-['DM_Sans']">
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center border-b border-[var(--border-light)] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[var(--accent)] border-2 border-[var(--border-dark)] rounded-xl flex items-center justify-center shadow-[var(--shadow-sm)]">
            <span className="font-bold text-xl">C</span>
          </div>
          <span className="font-black text-2xl tracking-tight">Carousel.</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="mus-button-ghost px-6 py-2 font-bold text-sm">Log In</Link>
          <Link to="/login" className="mus-button-amber px-6 py-2 font-bold text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tighter">
          CREATE STUNNING <span className="text-[var(--accent)]">CAROUSELS</span> IN MINUTES.
        </h1>
        <p className="text-xl text-[var(--text-muted)] mb-10 max-w-2xl font-medium">
          The ultimate design tool for creators. Build beautiful, engaging carousels for social media with our intuitive editor.
        </p>
        <div className="flex gap-6">
          <Link to="/dashboard" className="mus-button-amber px-10 py-4 text-lg font-bold shadow-[var(--shadow-md)]">
            Start Designing
          </Link>
          <button className="mus-button-ghost px-10 py-4 text-lg font-bold border-2 border-[var(--border-dark)] bg-white">
            Learn More
          </button>
        </div>

        {/* Mock Preview */}
        <div className="mt-20 w-full max-w-5xl mus-panel p-4 bg-white rotate-2 hover:rotate-0 transition-transform duration-500">
           <div className="aspect-video bg-[var(--bg-main)] rounded-lg flex items-center justify-center border-2 border-dashed border-[var(--border-light)]">
              <span className="text-[var(--text-muted)] font-bold italic">Visual Preview Area</span>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-10 border-t border-[var(--border-light)] text-center text-[var(--text-muted)] font-bold text-sm">
        &copy; 2024 Carousel App. Built with precision.
      </footer>
    </div>
  );
};

export default LandingPage;
