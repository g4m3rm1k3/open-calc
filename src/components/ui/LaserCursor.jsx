import { useEffect, useRef } from 'react';
import { useGlobalTheme } from '../../context/ThemeContext.jsx';

export default function LaserCursor() {
  const { laserEnabled, laserColor } = useGlobalTheme();
  
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const points = useRef([]);
  const pathRef = useRef(null);
  const coreRef = useRef(null);
  const cursorRef = useRef(null);
  
  useEffect(() => {
    if (!laserEnabled) {
      points.current = [];
      if (pathRef.current) pathRef.current.setAttribute('d', '');
      if (coreRef.current) coreRef.current.setAttribute('d', '');
      return;
    }

    const handleMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    
    const MAX_POINTS = 16; 

    const animate = () => {
      const currentMouse = mouse.current;
      
      points.current.unshift({ x: currentMouse.x, y: currentMouse.y });
      
      if (points.current.length > MAX_POINTS) {
        points.current.pop();
      }
      
      if (cursorRef.current) {
        // Center the smaller orb on the mouse (w-3 h-3 is 12px, so offset is 6px)
        cursorRef.current.style.transform = `translate3d(${currentMouse.x - 6}px, ${currentMouse.y - 6}px, 0)`;
      }

      if (pathRef.current && coreRef.current && points.current.length > 1) {
        let d = `M ${points.current[0].x} ${points.current[0].y}`;
        
        for (let i = 1; i < points.current.length - 1; i++) {
          const xc = (points.current[i].x + points.current[i + 1].x) / 2;
          const yc = (points.current[i].y + points.current[i + 1].y) / 2;
          d += ` Q ${points.current[i].x} ${points.current[i].y}, ${xc} ${yc}`;
        }
        
        const last = points.current[points.current.length - 1];
        d += ` L ${last.x} ${last.y}`;

        pathRef.current.setAttribute('d', d);
        coreRef.current.setAttribute('d', d);
      } else if (pathRef.current && coreRef.current) {
        pathRef.current.setAttribute('d', '');
        coreRef.current.setAttribute('d', '');
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [laserEnabled]);

  if (!laserEnabled) return null;

  return (
    <>
      <svg 
        className="fixed inset-0 pointer-events-none z-[9998]"
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <filter id="laserGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur stdDeviation="8" result="blur2" />
            <feGaussianBlur stdDeviation="15" result="blur3" />
            <feMerge>
              <feMergeNode in="blur3" />
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <path
          ref={pathRef}
          fill="none"
          stroke={laserColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#laserGlow)"
          style={{ opacity: 0.9 }}
        />
        
        <path
          ref={coreRef}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.9 }}
        />
      </svg>

      {/* The glowing orb at the head of the laser */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 rounded-full pointer-events-none z-[9999]"
        style={{
          backgroundColor: '#ffffff',
          boxShadow: `0 0 6px 1px #fff, 0 0 12px 4px ${laserColor}, 0 0 24px 8px ${laserColor}`,
          willChange: 'transform'
        }}
      />
    </>
  );
}
