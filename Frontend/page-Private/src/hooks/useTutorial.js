// src/hooks/useTutorial.js
import { useEffect, useState } from 'react';
import TutorialService from '../services/TutorialService';
import DataDetectionService from '../services/DataDetectionService';
import { TUTORIALS } from '../config/tutorials';

export const useTutorial = (tutorialName) => {
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldAutoStart, setShouldAutoStart] = useState(false);

  useEffect(() => {
    checkAndStart();
  }, [tutorialName]);

  const checkAndStart = async () => {
    setIsLoading(true);
    
    const tutorialConfig = TUTORIALS[tutorialName];
    if (!tutorialConfig) {
      setIsLoading(false);
      return;
    }

    // Verificar si ya completó este tutorial
    const completed = TutorialService.hasCompletedTutorial(tutorialName);
    setHasCompleted(completed);

    // Si ya completó, no mostrar automáticamente
    if (completed) {
      setIsLoading(false);
      return;
    }

    // Verificar si hay datos en el módulo
    let hasData = true;
    if (tutorialConfig.checkDataEndpoint) {
      hasData = await DataDetectionService.hasData(
        tutorialName, 
        tutorialConfig.checkDataEndpoint
      );
    }

    // Mostrar tutorial solo si NO hay datos y NO lo ha completado
    const shouldShow = !hasData && !completed;
    setShouldAutoStart(shouldShow);

    if (shouldShow) {
      setTimeout(() => {
        startTutorial();
      }, 2000);
    }

    setIsLoading(false);
  };

  const startTutorial = () => {
    const tutorialConfig = TUTORIALS[tutorialName];
    if (tutorialConfig) {
      TutorialService.start(tutorialConfig.steps, tutorialName);
    }
  };

  const restartTutorial = () => {
    startTutorial();
  };

  const skipTutorial = () => {
    TutorialService.stop();
    TutorialService.markAsCompleted(tutorialName);
    setHasCompleted(true);
    setShouldAutoStart(false);
  };

  return {
    startTutorial,
    restartTutorial,
    skipTutorial,
    hasCompleted,
    isLoading,
    shouldAutoStart
  };
};