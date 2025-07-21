

import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL ||"https://ceoserver.onrender.com";

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/heroslides`);
      setSlides(res.data);
    } catch (err) {
      console.error("Error fetching slides:", err);
    }
  };

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [slides]);

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        No slide available
      </div>
    );
  }

  const currentSlide = slides[currentIndex];
  const imageURL = currentSlide.image?.filename
    ? `${BASE_URL}/api/files/${currentSlide.image.filename}`
    : "/default-slide.jpg"; // fallback

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-b-3xl shadow-2xl">
      {/* Background Image */}
      <img
        src={imageURL}
        alt={currentSlide.title || "Hero Slide"}
        className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-[rgba(255,120,80,0.35)] md:bg-[rgba(255,90,90,0.4)] backdrop-brightness-75"></div>

      {/* Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <h2 className="text-3xl md:text-5xl font-bold drop-shadow-lg leading-tight">
          {currentSlide.title}
        </h2>
        <p className="text-md md:text-xl mt-4 max-w-2xl drop-shadow-md">
          {currentSlide.subtitle}
        </p>
      </div>
    </div>
  );
};

export default HeroSlider;
