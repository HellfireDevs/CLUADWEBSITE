import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import HALO from 'vanta/dist/vanta.halo.min';

const Background = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const myRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      try {
        window.THREE = THREE; // Asli Jadoo Yahan Hai!
        setVantaEffect(HALO({
          el: myRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          backgroundColor: 0x131a43,
          baseColor: 0x1a59,
          size: 1.2,
          amplitudeFactor: 1.5
        }));
      } catch (error) {
        console.error("Vanta load hone mein dikkat:", error);
      }
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    }
  }, [vantaEffect]);

  return <div ref={myRef} className="fixed top-0 left-0 w-full h-full -z-10 bg-gray-900"></div>;
};

export default Background;
