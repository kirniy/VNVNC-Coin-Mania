import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronRight } from 'lucide-react'

type EmojiType = {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
};

function App() {
  const [isPressed, setIsPressed] = useState(false);
  const [points, setPoints] = useState(42858169);
  const [energy, setEnergy] = useState(2341);
  const [headerEmojis, setHeaderEmojis] = useState<EmojiType[]>([]);
  const [coinEmojis, setCoinEmojis] = useState<EmojiType[]>([]);
  const [lastTapTime, setLastTapTime] = useState(Date.now());
  const headerSpeedRef = useRef(1);
  const coinSpeedRef = useRef(1);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

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
      size: Math.random() * 20 + 10,
      speedX: (Math.random() - 0.5) * 2,
      speedY: (Math.random() - 0.5) * 2
    }));
  }, []);

  useEffect(() => {
    setHeaderEmojis(createInitialHeaderEmojis(10));
  }, [createInitialHeaderEmojis]);

  const addCoinEmojis = useCallback(() => {
    const newEmojis = Array(5).fill(null).map(() => ({
      id: Date.now() + Math.random(),
      emoji: getRandomEmoji(),
      x: Math.random() * 200 - 50,
      y: Math.random() * 200 - 50,
      size: Math.random() * 20 + 10,
      speedX: (Math.random() - 0.5) * 1,
      speedY: -(Math.random() * 0.5 + 0.25)
    }));
    setCoinEmojis(prev => [...prev, ...newEmojis]);
    coinSpeedRef.current = Math.min(coinSpeedRef.current + 0.1, 1.5);
    headerSpeedRef.current = Math.min(headerSpeedRef.current + 0.2, 2);
  }, []);

  const handleClick = () => {
    if (energy > 0) {
      setPoints(prev => prev + 1);
      setEnergy(prev => Math.max(0, prev - 1));
      addCoinEmojis();
      setLastTapTime(Date.now());
    }
  };

  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      const currentTime = Date.now();
      const timeSinceLastTap = currentTime - lastTapTime;
      
      if (timeSinceLastTap > 5000) {
        headerSpeedRef.current = Math.max(headerSpeedRef.current - 0.01, 1);
        coinSpeedRef.current = Math.max(coinSpeedRef.current - 0.01, 1);
      }

      setHeaderEmojis(prevEmojis =>
        prevEmojis.map(emoji => ({
          ...emoji,
          x: (emoji.x + emoji.speedX * headerSpeedRef.current + 100) % 100,
          y: (emoji.y + emoji.speedY * headerSpeedRef.current + 100) % 100,
        }))
      );

      setCoinEmojis(prevEmojis =>
        prevEmojis.map(emoji => ({
          ...emoji,
          x: emoji.x + emoji.speedX * coinSpeedRef.current,
          y: emoji.y + emoji.speedY * coinSpeedRef.current,
          speedY: emoji.speedY + 0.01 * coinSpeedRef.current
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

  return (
    <div className="bg-gradient-main min-h-screen px-4 flex flex-col items-center text-white font-medium" style={{ userSelect: `none` }}>
      <div className="absolute inset-0 h-1/2 bg-gradient-overlay z-0"></div>
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="radial-gradient-overlay"></div>
      </div>

      <div className="w-full z-10 min-h-screen flex flex-col items-center text-white">
        <div className="fixed top-0 left-0 w-full z-10">
          <div className="w-full bg-[#1f1f1f] py-4 px-6 relative overflow-hidden">
            <div className="text-2xl font-bold text-center relative z-10">
              🎊 VNVNC COIN MANIA <ChevronRight size={24} className="inline-block" />
            </div>
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
              Gold <ChevronRight size={20} className="inline-block" />
            </a>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center select-none mt-8">
          <div className="relative"
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchEnd={handleMouseUp} 
            onTouchCancel={handleMouseUp}>
            <img src='/images/notcoin.png' width={256} height={256} alt="notcoin"
              draggable="false"
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
                transform: isPressed ? 'translateY(4px)' : 'translateY(0px)',
                transition: 'transform 200ms ease',
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
                <div className="h-[48px] w-[2px] bg-[#fddb6d]"></div>
                <button className="flex flex-col items-center gap-1" onClick={openGithub}>
                  <img src='/images/rocket.png' width={24} height={24} alt="Boosts" />
                  <span>Boosts</span>
                </button>
              </div>
            </div>
          </div>
          <div className="w-full bg-[#f9c035] rounded-full">
            <div className="bg-gradient-to-r from-[#f3c45a] to-[#fffad0] h-4 rounded-full" style={{ width: `${(energy / 6500) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
