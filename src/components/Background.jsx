import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import HALO from 'vanta/dist/vanta.halo.min';

const Background = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const myRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      // Three.js ko window level pe set karna zaroori hai Vanta ke liye
      window.THREE = THREE; 
      
      setVantaEffect(HALO({
        el: myRef.current,
        THREE: THREE,
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
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    }
  }, [vantaEffect]);

  return <div ref={myRef} className="fixed top-0 left-0 w-full h-full -z-10"></div>;
};

export default Background;
