import { useState, useEffect, useCallback } from 'react'
import Arrow from './assets/Arrow'

function App() {
  const [isPressed, setIsPressed] = useState(false);
  const [points, setPoints] = useState(42858161);
  const [energy, setEnergy] = useState(2338);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number, emoji: string, x: number, y: number, size: number, speedX: number, speedY: number }[]>([]);
  const [lastTapTime, setLastTapTime] = useState(Date.now());
  const [tapCount, setTapCount] = useState(0);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  const openGithub = () => {
    window.open('https://t.me/vnvnc_spb');
  };

  const addFloatingEmojis = useCallback(() => {
    const emojis = ['🎉', '⭐', '💥', '🚀', '💎', '🔥'];
    const newEmojis = Array(10).fill(null).map(() => ({
      id: Date.now() + Math.random(),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 200 - 50, // Spread emojis around the coin
      y: Math.random() * 200 - 50,
      size: Math.random() * 20 + 10,
      speedX: (Math.random() - 0.5) * 2,
      speedY: -(Math.random() * 1 + 0.5) * (1 + tapCount * 0.05)
    }));
    setFloatingEmojis(prev => [...prev, ...newEmojis]);
    setLastTapTime(Date.now());
    setTapCount(prev => prev + 1);
  }, [tapCount]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (energy > 0) {
      setPoints(points + 1);
      setEnergy(Math.max(0, energy - 1));
      addFloatingEmojis();
    }
  };

  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      const currentTime = Date.now();
      const timeSinceLastTap = currentTime - lastTapTime;
      const slowdownFactor = Math.max(0, 1 - timeSinceLastTap / 10000); // Slower decay

      setFloatingEmojis(prevEmojis =>
        prevEmojis.map(emoji => ({
          ...emoji,
          x: emoji.x + emoji.speedX * slowdownFactor * 0.5,
          y: emoji.y + emoji.speedY * slowdownFactor * 0.5,
          speedY: emoji.speedY + 0.02 * slowdownFactor
        })).filter(emoji => {
          const age = currentTime - emoji.id;
          return age < 5000; // Emojis last for 5 seconds
        })
      );

      if (timeSinceLastTap > 5000) {
        setTapCount(0);
      }

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
        <div className="fixed top-0 left-0 w-full px-6 pt-8 z-10 flex flex-col items-center text-white">
          <div className="w-full cursor-pointer">
            <div className="bg-[#1f1f1f] text-center py-2 rounded-xl backdrop-blur-md">
              <a href="https://t.me/vnvnc_spb">
                <p className="text-lg">VNVNC COIN MANIA <Arrow size={18} className="ml-0 mb-1 inline-block" /></p>
              </a>
            </div>
          </div>
          <div className="mt-12 text-5xl font-bold flex items-center">
            <img src='/images/coin.png' width={44} height={44} alt="Coin" />
            <span className="ml-2">{points.toLocaleString()}</span>
          </div>
          <div className="text-base mt-2 flex items-center">
            <img src='/images/trophy.png' width={24} height={24} alt="Trophy" />
            <a href="https://t.me/vnvnc_spb" target="_blank" rel="noopener noreferrer">
              <span className="ml-1">Gold <Arrow size={18} className="ml-0 mb-1 inline-block" /></span>
            </a>
          </div>
        </div>

        <div className="flex-grow flex items-center justify-center select-none">
          <div className="relative mt-4"
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
            {floatingEmojis.map(emoji => (
              <div
                key={emoji.id}
                className="absolute text-2xl pointer-events-none"
                style={{
                  left: `${emoji.x}px`,
                  top: `${emoji.y}px`,
                  fontSize: `${emoji.size}px`,
                  transition: 'all 0.1s linear'
                }}
              >
                {emoji.emoji}
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 w-full px-6 pb-8 z-10">
          <div className="w-full flex justify-between gap-2">
            <div className="w-1/3 flex items-center justify-start max-w-32">
              <div className="flex items-center justify-center">
                <img src='/images/high-voltage.png' width={44} height={44} alt="High Voltage" />
                <div className="ml-2 text-left">
                  <span className="text-white text-2xl font-bold block">{energy}</span>
                  <span className="text-white text-large opacity-75">/ 6500</span>
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
          <div className="w-full bg-[#f9c035] rounded-full mt-4">
            <div className="bg-gradient-to-r from-[#f3c45a] to-[#fffad0] h-4 rounded-full" style={{ width: `${(energy / 6500) * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
