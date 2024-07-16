import { useState, useEffect, useCallback } from 'react'
import { ChevronRight, Star } from 'lucide-react'

function App() {
  const [isPressed, setIsPressed] = useState(false);
  const [points, setPoints] = useState(42858062);
  const [energy, setEnergy] = useState(2342);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number, emoji: string, x: number, y: number, size: number, speedX: number, speedY: number }[]>([]);
  const [lastTapTime, setLastTapTime] = useState(Date.now());
  const [tapCount, setTapCount] = useState(0);

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  const addFloatingEmojis = useCallback(() => {
    const emojis = ['🎉', '⭐', '💥', '🚀', '💎', '🔥'];
    const newEmojis = Array(5).fill(null).map(() => ({
      id: Date.now() + Math.random(),
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: Math.random() * 100,
      y: 100,
      size: Math.random() * 20 + 10,
      speedX: (Math.random() - 0.5) * 4,
      speedY: -(Math.random() * 2 + 1) * (1 + tapCount * 0.1)
    }));
    setFloatingEmojis(prev => [...prev, ...newEmojis]);
    setLastTapTime(Date.now());
    setTapCount(prev => prev + 1);
  }, [tapCount]);

  const handleCoinClick = () => {
    if (energy > 0) {
      setPoints(prev => prev + 1);
      setEnergy(prev => Math.max(0, prev - 1));
      addFloatingEmojis();
    }
  };

  useEffect(() => {
    const animationFrame = requestAnimationFrame(function animate() {
      const currentTime = Date.now();
      const timeSinceLastTap = currentTime - lastTapTime;
      const slowdownFactor = Math.max(0, 1 - timeSinceLastTap / 5000);

      setFloatingEmojis(prevEmojis =>
        prevEmojis.map(emoji => ({
          ...emoji,
          x: emoji.x + emoji.speedX * slowdownFactor,
          y: emoji.y + emoji.speedY * slowdownFactor,
          speedY: emoji.speedY + 0.05 * slowdownFactor
        })).filter(emoji => emoji.y > -10 && emoji.y < 110)
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
      setEnergy(prev => Math.min(prev + 1, 6500));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#2a1a0a] min-h-screen flex flex-col items-center text-white font-medium" style={{ userSelect: 'none' }}>
      <div className="w-full bg-[#2d2d2d] py-4 px-6 flex justify-between items-center mb-8">
        <div className="text-2xl font-bold flex items-center">
          🎊 VNVNC COIN MANIA <ChevronRight size={24} />
        </div>
        <div className="flex items-center">
          <Star className="text-yellow-400 mr-2" size={24} />
          <div className="w-2 h-2 bg-gray-400 rounded-full mx-2"></div>
          <div className="text-yellow-400">⚡</div>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="flex justify-center items-center">
          <img src="/images/coin.png" alt="Coin" className="w-12 h-12 mr-2" />
          <span className="text-6xl font-bold">{points.toLocaleString()}</span>
        </div>
        <div className="mt-2 flex justify-center items-center">
          <Star size={20} className="text-yellow-400 mr-1" />
          <span className="text-xl">Gold <ChevronRight size={20} /></span>
        </div>
      </div>

      <div className="relative" style={{ width: '256px', height: '256px' }}>
        <img
          src="/images/notcoin.png"
          alt="VNVNC"
          className="w-full h-full"
          style={{
            transform: isPressed ? 'scale(0.95)' : 'scale(1)',
            transition: 'transform 100ms ease',
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onClick={handleCoinClick}
        />
        {floatingEmojis.map(emoji => (
          <div
            key={emoji.id}
            className="absolute pointer-events-none"
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

      <div className="fixed bottom-0 left-0 w-full px-6 pb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <div className="text-yellow-400 text-3xl mr-2">⚡</div>
            <div>
              <div className="text-2xl font-bold">{energy}</div>
              <div className="text-sm opacity-75">/ 6500</div>
            </div>
          </div>
          <div className="bg-[#fad258] rounded-full py-2 px-6 flex justify-around items-center">
            <button className="flex flex-col items-center mx-4">
              <img src="/images/bear.png" alt="Frens" className="w-8 h-8 mb-1" />
              <span className="text-xs">Frens</span>
            </button>
            <div className="w-px h-8 bg-[#fddb6d]"></div>
            <button className="flex flex-col items-center mx-4">
              <img src="/images/coin.png" alt="Earn" className="w-8 h-8 mb-1" />
              <span className="text-xs">Earn</span>
            </button>
            <div className="w-px h-8 bg-[#fddb6d]"></div>
            <button className="flex flex-col items-center mx-4">
              <img src="/images/rocket.png" alt="Boosts" className="w-8 h-8 mb-1" />
              <span className="text-xs">Boosts</span>
            </button>
          </div>
        </div>
        <div className="w-full bg-[#f9c035] rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#f3c45a] to-[#fffad0]"
            style={{ width: `${(energy / 6500) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default App
