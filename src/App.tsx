import React, { useState, useEffect, useCallback, useRef } from 'react'

type EmojiType = {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  createdAt: number;
};

type ClickType = {
  id: number;
  x: number;
  y: number;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        expand: () => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}

function App() {
  const [isPressed, setIsPressed] = useState(false);
  const [points, setPoints] = useState(42858169);
  const [energy, setEnergy] = useState(2341);
  const [headerEmojis, setHeaderEmojis] = useState<EmojiType[]>([]);
  const [coinEmojis, setCoinEmojis] = useState<EmojiType[]>([]);
  const [clicks, setClicks] = useState<ClickType[]>([]);
  const [lastTapTime, setLastTapTime] = useState(Date.now());
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const headerAnimationSpeedRef = useRef(0.4);
  const lastUpdateTimeRef = useRef(Date.now());
  const coinRef = useRef<HTMLDivElement>(null);
  const consecutiveTapsRef = useRef(0);

  useEffect(() => {
    window.Telegram?.WebApp?.expand();
  }, []);

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
      const tiltX = -(y / rect.height) * 40;
      const tiltY = (x / rect.width) * 40;
      setTilt({ x: tiltX, y: tiltY });
    }
  };

  const openGithub = () => {
    window.open('https://t.me/vnvnc_spb');
  };

  const getRandomEmoji = () => {
    const emojis = ['🎉', '⭐', '💥', '🚀', '🎤', '🔥'];
    return emojis[Math.floor(Math.random() * emojis.length)];
  };

  const createInitialHeaderEmojis = useCallback((count: number) => {
    return Array(count).fill(null).map(() => ({
      id: Date.now() + Math.random(),
      emoji: getRandomEmoji(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 24 + 16,
      speedX: (Math.random() - 0.5) * 0.1,
      speedY: (Math.random() - 0.5) * 0.1,
      createdAt: Date.now()
    }));
  }, []);

  useEffect(() => {
    setHeaderEmojis(createInitialHeaderEmojis(20));
  }, [createInitialHeaderEmojis]);

  const addCoinEmojis = useCallback((x: number, y: number) => {
    const currentTime = Date.now();
    if (currentTime - lastTapTime > 1000) {
      consecutiveTapsRef.current = 0;
    }
    consecutiveTapsRef.current++;

    if (consecutiveTapsRef.current >= 8 && consecutiveTapsRef.current % 8 === 0) {
      const newEmojis = Array(12).fill(null).map(() => ({
        id: Date.now() + Math.random(),
        emoji: getRandomEmoji(),
        x: x + (Math.random() - 0.5) * 60,
        y: y + (Math.random() - 0.5) * 60,
        size: Math.random() * 24 + 14,
        speedX: (Math.random() - 0.5) * 100,
        speedY: -(Math.random() * 200 + 100),
        createdAt: Date.now()
      }));
      setCoinEmojis(prev => [...prev, ...newEmojis]);
    }
    setLastTapTime(currentTime);
  }, [lastTapTime]);

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
      
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      }
    }
  };

  const handleAnimationEnd = (id: number) => {
    setClicks(prevClicks => prevClicks.filter(click => click.id !== id));
  };

  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastUpdateTimeRef.current) / 1000; // time in seconds
      lastUpdateTimeRef.current = currentTime;

      const timeSinceLastTap = currentTime - lastTapTime;
      headerAnimationSpeedRef.current = timeSinceLastTap > 2000 ? 0.2 : 1;

      setHeaderEmojis(prevEmojis =>
        prevEmojis.map(emoji => ({
          ...emoji,
          x: (emoji.x + emoji.speedX * headerAnimationSpeedRef.current + 100) % 100,
          y: (emoji.y + emoji.speedY * headerAnimationSpeedRef.current + 100) % 100,
        }))
      );

      setCoinEmojis(prevEmojis =>
        prevEmojis.map(emoji => ({
          ...emoji,
          x: emoji.x + emoji.speedX * deltaTime,
          y: emoji.y + emoji.speedY * deltaTime + (0.5 * 500 * deltaTime * deltaTime),
          speedY: emoji.speedY + 500 * deltaTime
        })).filter(emoji => {
          const age = (currentTime - emoji.createdAt) / 1000;
          return age < 2 && emoji.y < window.innerHeight && emoji.y > -50;
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
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-transparent z-0" style={{ height: '100vh' }}></div>
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="radial-gradient-overlay"></div>
      </div>

      {/* Emoji animation layer */}
      <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="relative w-full h-full">
          {headerEmojis.map(emoji => (
            <div
              key={emoji.id}
              className="absolute text-2xl"
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

      <div className="w-full z-30 min-h-screen flex flex-col items-center text-white">
        {/* Header */}
        <div className="fixed top-4 left-0 w-full z-30">
          <div className="text-center py-4 relative">
            <img 
              src='/images/coinmania.png'  
              alt="COINMANIA"
              className="mx-auto"
              style={{
                width: 'auto',
                height: '72px',
                maxWidth: '92%',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>

        {/* Score and associated components */}
        <div className="fixed top-32 left-0 w-full z-30 px-4">
          <div className="text-center">
            <div className="flex justify-center items-center">
              <img src='/images/coin.png' width={60} height={60} alt="Coin" className="mr-4" />
              <span className="text-4xl font-bold">{points.toLocaleString()}</span>
            </div>
            <div className="mt-2 flex justify-center items-center">
              <img src='/images/trophy.png' width={24} height={24} alt="Trophy" className="mr-2" />
              <a href="https://t.me/vnvnc_spb" target="_blank" rel="noopener noreferrer" className="text-xl">
                Gold
              </a>
            </div>
          </div>
        </div>

        {/* Main coin */}
        <div className="absolute inset-0 flex items-center justify-center select-none z-30">
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
              width={300} 
              height={300} 
              alt="notcoin"
              draggable="false"
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
                transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isPressed ? 'scale(0.95)' : 'scale(1)'}`,
                transition: 'transform 0.1s',
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
                className="absolute text-3xl font-bold opacity-0"
                style={{
                  top: `${click.y - 42}px`,
                  left: `${click.x - 28}px`,
                  animation: `float 2s ease-out`,
                  pointerEvents: `none`
                }}
                onAnimationEnd={() => handleAnimationEnd(click.id)}
              >
                +1⭐️
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="fixed bottom-0 left-0 w-full px-6 pb-8 z-40">
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
                <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
                <button className="flex flex-col items-center gap-1" onClick={openGithub}>
                  <img src='/images/rocket.png' width={24} height={24} alt="Boosts" />
                  <span>Boosts</span>
                </button>
              </div>
            </div>
          </div>
          <div className="w-full bg-[#f9c035] rounded-full">
            <div 
              className="bg-gradient-to-r from-[#f3c45a] to-[#fffad0] h-4 rounded-full" 
              style={{ width: `${(energy / 6500) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
