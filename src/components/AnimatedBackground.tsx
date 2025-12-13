// components/AnimatedBackground.tsx
'use client'; 

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim"; 
import { useTheme } from "next-themes"; // 1. Import useTheme

const AnimatedBackground = () => {
  const [init, setInit] = useState(false);
  const { resolvedTheme } = useTheme(); // 2. Get the current theme

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    // console.log(container);
  };

  // 3. Define dynamic colors based on the theme
  // If Light Mode: Dark Grey particles. 
  // If Dark Mode: Light Grey particles (your original colors).
  const isLight = resolvedTheme === 'light';
  
  const particleColor = isLight ? "#b9c1ccff" : "#8f939c"; // Tailwind Gray-600 vs Original Light Grey
  const linkColor = isLight ? "#9ca3af" : "#c7cad0";     // Tailwind Gray-400 vs Original Lighter Grey

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fullScreen: {
        enable: false,
      },
      fpsLimit: 60,
      
      interactivity: {
        events: {
          onClick: {
            enable: false,
          },
          onHover: {
            enable: false,
            mode: "grab", 
          },
        },
        modes: {
          grab: {
            distance: 140,
            links: {
              opacity: 1, 
            },
          },
        },
      },
      
      particles: {
        color: {
          // 4. Use the dynamic variable
          value: particleColor, 
        },
        links: {
          // 4. Use the dynamic variable
          color: linkColor, 
          distance: 100, 
          enable: true,
          opacity: 0.75,
          width: 0.75,
        },
        move: {
          direction: MoveDirection.none,
          enable: true,
          outModes: {
            default: OutMode.out,
          },
          random: true, 
          speed: 0.3, 
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 1000,
          },
          value: 250, 
        },
        opacity: {
          value: 1,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 }, 
        },
      },
      detectRetina: true,
    }),
    // 5. Add resolvedTheme dependencies so it updates on toggle
    [particleColor, linkColor] 
  );

  if (init) {
    return (
      <Particles
        id="tsparticles-web-background"
        particlesLoaded={particlesLoaded}
        options={options}
        className="fixed top-0 left-0 right-0 bottom-0 inset-0 z-0 w-full h-full brightness-100" 
      />
    );
  }

  return null;
};

export default AnimatedBackground;