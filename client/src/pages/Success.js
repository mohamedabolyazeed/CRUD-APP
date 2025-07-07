import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Confetti effect
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.animationDelay = Math.random() * 5 + "s";
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 50%, 50%)`;
      document.body.appendChild(confetti);
      setTimeout(() => {
        confetti.remove();
      }, 5000);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-10 w-full max-w-md animate-fade-in relative overflow-hidden text-center">
        <div className="mx-auto mb-6 flex items-center justify-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center relative">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 11 17 4 10" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-green-700 mb-4 animate-bounce-in">
          Success!
        </h1>
        <p className="text-gray-700 text-lg mb-8">
          Your data has been successfully sent to the database.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg"
        >
          Back to Home
        </button>
      </div>
      {/* Confetti styles */}
      <style>{`
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #4caf50;
          animation: confetti 5s ease-in-out infinite;
          z-index: 50;
        }
        @keyframes confetti {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-bounce-in {
          animation: bounceIn 1s ease;
        }
        @keyframes bounceIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          70% {
            transform: scale(0.9);
            opacity: 0.9;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Success;
