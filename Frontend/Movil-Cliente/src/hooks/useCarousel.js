import { useState, useRef } from 'react';

export const useCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const carouselData = [
    {
      id: 1,
      title: 'Somos',
      subtitle: 'Brinda distribuciones y promociones',
      image: '👥',
      gradientColors: ['#667eea', '#764ba2'],
    },
    {
      id: 2,
      title: 'Visitas',
      subtitle: 'Supervisión web y visitas',
      image: '👤',
      gradientColors: ['#f093fb', '#f5576c'],
    },
    {
      id: 3,
      title: '30% OFF',
      subtitle: 'En tu primera contratación de más',
      image: '💰',
      gradientColors: ['#4facfe', '#00f2fe'],
    },
  ];

  const onScroll = (event) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setCurrentIndex(index);
  };

  const goToSlide = (index) => {
    if (scrollViewRef.current) {
      const slideWidth = scrollViewRef.current._metrics?.visibleLength || 0;
      scrollViewRef.current.scrollTo({
        x: index * slideWidth,
        animated: true,
      });
    }
    setCurrentIndex(index);
  };

  return {
    currentIndex,
    carouselData,
    scrollViewRef,
    onScroll,
    goToSlide,
    setCurrentIndex,
  };
};