import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useHapticFeedback } from '@vkruglikov/react-telegram-web-app';

type EmojiType = {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
};

type ClickType = {
  id: number;
  x: number;
  y: number;
};

function App() {
  const [isPressed, setIsPressed] = useState(false);
  const [points, setPoints] = useState(42858169);
  const [energy, setEnergy] = useState(2341);
  const [headerEmojis, setHeaderEmojis] = useState<EmojiType[]>([]);
  const [coinEmojis, setCoinEmojis] = useState<EmojiType[]>([]);
  const [clicks, setClicks] = useState<ClickType[]>([]);
  const [lastTapTime, setLastTapTime] = useState(Date.now());
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const animationSpeedRef = useRef(1);
  const coinRef = useRef<HTMLDivElement>(null);

  const [impactOccurred] = useHapticFeedback();

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsPressed(true);
    handleTilt(e);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleTilt = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (coinRef.current) {
      const rect = coinRef.current.getBoundingClientRect();
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;
      const tiltX = (y / rect.height) * 30;
      const tiltY = -(x / rect.width) * 30;
      setTilt({ x: tiltX, y: tiltY });
    }
  };

  const openGithub = () => {
    window.open('https://t.me/vnvnc_spb');
  };

  const getRandomEmoji = () => {
    const emojis = ['🎉', '⭐', '💥', '🚀', '💎', '🔥'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const createInitialHeaderEmojis = useCallback((count: number) => {
    return Array(count).fill(null).map(() => ({
      id: Date.now() + Math.random(),
      emoji: getRandomEmoji(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 24 + 16,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5
    }));
  }, []);

  useEffect(() => {
    setHeaderEmojis(createInitialHeaderEmojis(7));
  }, [createInitialHeaderEmojis]);

  const addCoinEmojis = useCallback((x: number, y: number) => {
    const newEmojis = Array(15).fill(null).map(() => ({
      id: Date.now() + Math.random(),
      emoji: getRandomEmoji(),
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
      size: Math.random() * 20 + 10,
      speedX: (Math.random() - 0.5) * 1,
      speedY: -(Math.random() * 0.5 + 0.25)
    }));
    setCoinEmojis(prev => [...prev, ...newEmojis]);
    setLastTapTime(Date.now());
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.TouchEvent<HTMLDivElement>) => {
    if (energy > 0 && coinRef.current) {
      const rect = coinRef.current.getBoundingClientRect();
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      setPoints(prev => prev + 1);
      setEnergy(prev => Math.max(0, prev - 1));
      addCoinEmojis(x, y);
      setClicks(prev => [...prev, { id: Date.now(), x, y }]);
      
      // Haptic feedback
      impactOccurred('heavy');
    }
  };

  const handleAnimationEnd = (id: number) => {
    setClicks(prevClicks => prevClicks.filter(click => click.id !== id));
  };

  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      const currentTime = Date.now();
      const timeSinceLastTap = currentTime - lastTapTime;
      
      animationSpeedRef.current = timeSinceLastTap > 2000 ? 0.2 : 1;

      setHeaderEmojis(prevEmojis =>
        prevEmojis.map(emoji => ({
          ...emoji,
          x: (emoji.x + emoji.speedX * animationSpeedRef.current + 100) % 100,
          y: (emoji.y + emoji.speedY * animationSpeedRef.current + 100) % 100,
        }))
      );

      setCoinEmojis(prevEmojis =>
        prevEmojis.map(emoji => ({
          ...emoji,
          x: emoji.x + emoji.speedX * animationSpeedRef.current,
          y: emoji.y + emoji.speedY * animationSpeedRef.current,
          speedY: emoji.speedY + 0.02 * animationSpeedRef.current
        })).filter(emoji => {
          const age = currentTime - emoji.id;
          return age < 2000 && emoji.y < 300;
        })
      );

      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [lastTapTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy((prevEnergy) => Math.min(prevEnergy + 1, 6500));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Disable scrolling on phones
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  return (
    <div className="bg-gradient-main min-h-screen flex flex-col items-center text-white font-medium" style={{ userSelect: 'none' }}>
      <div className="absolute inset-0 h-1/2 bg-gradient-overlay z-0"></div>
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="radial-gradient-overlay"></div>
      </div>

      <div className="w-full z-10 min-h-screen flex flex-col items-center text-white">
        <div className="fixed top-0 left-0 w-full z-10">
          <div className="bg-[#1f1f1f] text-center py-4 relative overflow-hidden">
            <p className="text-2xl relative z-10">VNVNC COIN MANIA</p>
            {headerEmojis.map(emoji => (
              <div
                key={emoji.id}
                className="absolute text-2xl pointer-events-none"
                style={{
                  left: `${emoji.x}%`,
                  top: `${emoji.y}%`,
                  fontSize: `${emoji.size}px`,
                }}
              >
                {emoji.emoji}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 text-center">
          <div className="flex justify-center items-center">
            <img src='/images/coin.png' width={60} height={60} alt="Coin" className="mr-4" />
            <span className="text-6xl font-bold">{points.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex justify-center items-center">
            <img src='/images/trophy.png' width={24} height={24} alt="Trophy" className="mr-2" />
            <a href="https://t.me/vnvnc_spb" target="_blank" rel="noopener noreferrer" className="text-xl">
              Gold
            </a>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center select-none">
          <div 
            ref={coinRef}
            className="relative"
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp} 
            onTouchCancel={handleMouseUp}
          >
            <img 
              src='/images/notcoin.png' 
              width={256} 
              height={256} 
              alt="notcoin"
              draggable="false"
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
                transform: `perspective(1000px) ${isPressed ? 'translateY(4px)' : 'translateY(0px)'} rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.1s ease',
              }}
              className='select-none'
            />
            {coinEmojis.map(emoji => (
              <div
                key={emoji.id}
                className="absolute text-2xl pointer-events-none"
                style={{
                  left: `${emoji.x}px`,
                  top: `${emoji.y}px`,
                  fontSize: `${emoji.size}px`,
                }}
              >
                {emoji.emoji}
              </div>
            ))}
            {clicks.map((click) => (
              <div
                key={click.id}
                className="absolute text-5xl font-bold opacity-0"
                style={{
                  top: `${click.y - 42}px`,
                  left: `${click.x - 28}px`,
                  animation: `float 2s ease-out`,
                  pointerEvents: `none`
                }}
                onAnimationEnd={() => handleAnimationEnd(click.id)}
              >
                +1
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full px-6 pb-8 z-10">
          <div className="w-full flex justify-between gap-2 mb-4">
            <div className="w-1/3 flex items-center justify-start max-w-32">
              <div className="flex items-center justify-center">
                <img src='/images/high-voltage.png' width={44} height={44} alt="High Voltage" />
                <div className="ml-2 text-left">
                  <span className="text-white text-2xl font-bold block">{energy}</span>
                  <span className="text-white text-sm opacity-75">/ 6500</span>
                </div>
              </div>
            </div>
            <div className="flex-grow flex items-center max-w-60 text-sm">
              <div className="w-full bg-[#fad258] py-4 rounded-2xl flex justify-around">
                <button className="flex flex-col items-center gap-1" onClick={openGithub}>
                  <img src='/images/bear.png' width={24} height={24} alt="Frens"/>
                  <span>Frens</span>
                </button>
                <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
                <button className="flex flex-col items-center gap-1" onClick={openGithub}>
                  <img src='/images/coin.png' width={24} height={24} alt="Earn" />
                  <span>Earn</span>
                </button>
                <div className
