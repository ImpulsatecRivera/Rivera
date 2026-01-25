// src/hooks/useInteractiveTutorial.js
import { useEffect, useState, useCallback } from 'react';
import InteractiveTutorialService from '../services/InteractiveTutorialService';
import { TUTORIALS } from '../config/tutorials';

export const useInteractiveTutorial = (tutorialName) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const completed = InteractiveTutorialService.hasCompletedTutorial(tutorialName);
    setHasCompleted(completed);
  }, [tutorialName]);

  const startTutorial = useCallback(() => {
    const tutorialConfig = TUTORIALS[tutorialName];
    if (tutorialConfig) {
      InteractiveTutorialService.start(tutorialConfig.steps, tutorialName);
      setIsActive(true);
    }
  }, [tutorialName]);

  const notifyInteraction = useCallback(() => {
    InteractiveTutorialService.notifyInteraction(tutorialName);
  }, [tutorialName]);

  const stopTutorial = useCallback(() => {
    InteractiveTutorialService.stop();
    setIsActive(false);
  }, []);

  return {
    startTutorial,
    stopTutorial,
    notifyInteraction,
    isActive,
    hasCompleted,
    currentStep
  };
};