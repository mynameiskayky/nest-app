import React, { useRef, useEffect } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const splashRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      delay: 0.1,
      onComplete: onLoadingComplete,
    });

    tl.to(circleRef.current, {
      scale: 100,
      duration: 0.6,
      ease: "expo.inOut",
    }).to(
      splashRef.current,
      {
        opacity: 0,
        duration: 0.2,
      },
      "-=0.2"
    );
  }, [onLoadingComplete]);

  return (
    <div
      ref={splashRef}
      className="fixed inset-0 bg-[#1C1C1E] grid place-items-center -space-x-6"
    >
      <div className="flex flex-col items-center justify-center relative">
        <div
          ref={circleRef}
          className="w-12 h-12 bg-[#00875F] rounded-full absolute -left-5"
        ></div>
        <p className="text-[#F5F5F7] text-3xl font-semibold z-10">nest cash</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
