import React, { useState, useEffect } from 'react';
import img1 from './images/img1.jpg';
import img2 from './images/img2.jpg';

const Banner: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const images = [img1, img2];

  const texts = [
    {
      title: "Learning that gets you",
      description: "Skills for your present (and your future). Get started with us."
    },
    {
      title: "Skills that drive you forward",
      description: "Technology and the world of work change fast — with us, you’re faster. Get the skills to achieve goals and stay competitive."
    }
  ];

  // Ensure slideIndex is always within bounds of the images and texts arrays
  const showSlide = (index: number) => {
    if (index >= images.length) setSlideIndex(0);
    else if (index < 0) setSlideIndex(images.length - 1);
    else setSlideIndex(index);
  };

  const moveSlide = (step: number) => {
    setSlideIndex((prevIndex) => {
      const newIndex = prevIndex + step;
      showSlide(newIndex); // Ensure the index is valid before updating
      return newIndex;
    });
  };

  // Automate the slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      moveSlide(1);
    }, 5000); // Change slide every 3 seconds
    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  return (
    <div className="relative w-full h-[500px] overflow-hidden mb-5">
      <div className="absolute inset-0 flex transition-all duration-1000 ease-in-out">
        {images.map((src, index) => (
          <div
            key={index}
            className={`w-full h-full absolute transition-opacity duration-1000 ease-in-out ${
              index === slideIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={src} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Overlay with dynamic text */}
      <div className="absolute inset-0 flex justify-center items-center text-center text-white p-6 md:p-8 bg-black bg-opacity-50">
        <div>
          <h2 className="text-3xl font-bold">{texts[slideIndex]?.title}</h2>
          <p className="mt-4 text-lg">{texts[slideIndex]?.description}</p>
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        onClick={() => moveSlide(-1)}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 md:p-4"
      >
        &#10094;
      </button>
      <button
        onClick={() => moveSlide(1)}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 md:p-4"
      >
        &#10095;
      </button>
    </div>
  );
};

export default Banner;
