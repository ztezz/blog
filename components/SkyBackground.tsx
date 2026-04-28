
import React from 'react';
import { Rocket, Cloud, Satellite } from 'lucide-react';

const SkyBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-sky-300 via-sky-100 to-white transition-opacity duration-1000">
      
      {/* Sun / Light Source Glow */}
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-yellow-200/40 rounded-full blur-[100px]"></div>

      {/* CLOUDS */}
      {/* Cloud 1 - Slow & Big */}
      <div className="absolute top-[10%] left-[-20%] animate-cloud-move opacity-60" style={{ animationDuration: '80s' }}>
         <Cloud size={200} className="text-white fill-white blur-sm" />
      </div>

      {/* Cloud 2 - Medium */}
      <div className="absolute top-[30%] left-[-10%] animate-cloud-move opacity-40" style={{ animationDuration: '60s', animationDelay: '10s' }}>
         <Cloud size={150} className="text-white fill-white" />
      </div>

      {/* Cloud 3 - Fast & Small */}
      <div className="absolute top-[60%] left-[-15%] animate-cloud-move opacity-30" style={{ animationDuration: '45s', animationDelay: '5s' }}>
         <Cloud size={100} className="text-sky-50 fill-sky-50" />
      </div>
      
       {/* Cloud 4 - Very High */}
      <div className="absolute top-[5%] left-[-20%] animate-cloud-move opacity-50" style={{ animationDuration: '95s', animationDelay: '30s' }}>
         <Cloud size={180} className="text-white fill-white blur-md" />
      </div>

      {/* MOVING OBJECTS */}
      
      {/* Rocket - Positioned in Header area, Flying Vertically */}
      <div className="absolute top-28 right-[15%] md:right-[10%] animate-float z-10 opacity-90">
        <div className="relative transform -rotate-45"> {/* Rotate -45deg to point straight UP */}
            <Rocket size={56} className="text-sky-600 fill-white" />
            {/* Rocket Trail - Vertical Down */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-16 bg-gradient-to-b from-orange-400 via-yellow-300 to-transparent blur-[2px] rounded-full"></div>
            {/* Engine Glow */}
            <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-6 h-6 bg-orange-500/50 blur-md rounded-full"></div>
        </div>
      </div>

      {/* Satellite (Floating) */}
      <div className="absolute top-1/4 left-1/3 animate-float opacity-60" style={{ animationDelay: '2s' }}>
        <Satellite size={40} className="text-sky-800" />
      </div>

    </div>
  );
};

export default SkyBackground;
