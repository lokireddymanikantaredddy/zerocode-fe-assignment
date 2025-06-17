import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const location = useLocation();
  const [bounce, setBounce] = useState(false);
  const [emoji, setEmoji] = useState("🤔");
  const emojis = ["🤔", "😅", "🔍", "🌟", "🚀", "🎮", "🎯", "🎪"];

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
     
    const emojiInterval = setInterval(() => {
      setEmoji((prev) => {
        const currentIndex = emojis.indexOf(prev);
        return emojis[(currentIndex + 1) % emojis.length];
      });
    }, 1500);

    return () => clearInterval(emojiInterval);
  }, [location.pathname]);

  const handleEmojiClick = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center px-6 py-8 rounded-2xl backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 shadow-xl">
        <h1 className="text-8xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse">
          4{emoji}4
        </h1>

        <div 
          className={`text-6xl mb-8 cursor-pointer transition-transform hover:scale-110 ${
            bounce ? "animate-bounce" : ""
          }`}
          onClick={handleEmojiClick}
        >
          {emoji}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Sorry, we couldn't find that page
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              The page at <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{location.pathname}</span>
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              might have been moved, deleted, or never existed 🕵️‍♂️
            </p>
          </div>

          <div className="space-y-4">
            <Link 
              to="/"
              className="block px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              🏠 Return to Home
            </Link>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
              Need help? Feel free to contact our support team 💫
            </p>
          </div>
        </div>
         
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-10 text-3xl animate-float-slow">🌍</div>
          <div className="absolute top-20 right-20 text-3xl animate-float-slower">⭐</div>
          <div className="absolute bottom-10 left-20 text-3xl animate-float">🚀</div>
          <div className="absolute bottom-20 right-10 text-3xl animate-float-slow">🌟</div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
