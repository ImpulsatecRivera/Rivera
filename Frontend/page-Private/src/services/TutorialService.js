// src/services/TutorialService.js
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

class TutorialService {
  constructor() {
    this.driverInstance = null;
    this.storageKey = 'rivera_tutorials_completed';
  }

  getBaseConfig() {
    return {
      showProgress: true,
      popoverClass: 'rivera-tutorial-popover',
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente →',
      prevBtnText: '← Anterior',
      doneBtnText: '¡Entendido! ✓',
      showButtons: ['next', 'previous', 'close'],
      
      onDestroyStarted: () => {
        if (this.driverInstance) {
          this.driverInstance.destroy();
          this.markAsCompleted(this.currentTutorial);
        }
      },
    };
  }

  // Guardar en localStorage que completó el tutorial
  markAsCompleted(tutorialName) {
    const completed = this.getCompletedTutorials();
    if (!completed.includes(tutorialName)) {
      completed.push(tutorialName);
      localStorage.setItem(this.storageKey, JSON.stringify({
        tutorials: completed,
        lastUpdate: new Date().toISOString()
      }));
      console.log(`✅ Tutorial "${tutorialName}" marcado como completado`);
    }
  }

  // Obtener tutoriales completados
  getCompletedTutorials() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return parsed.tutorials || [];
    } catch (error) {
      console.error('Error leyendo tutoriales completados:', error);
      return [];
    }
  }

  // Verificar si completó un tutorial específico
  hasCompletedTutorial(tutorialName) {
    const completed = this.getCompletedTutorials();
    return completed.includes(tutorialName);
  }

  // Resetear un tutorial específico
  resetTutorial(tutorialName) {
    const completed = this.getCompletedTutorials();
    const filtered = completed.filter(t => t !== tutorialName);
    localStorage.setItem(this.storageKey, JSON.stringify({
      tutorials: filtered,
      lastUpdate: new Date().toISOString()
    }));
    console.log(`🔄 Tutorial "${tutorialName}" reseteado`);
  }

  // Resetear todos los tutoriales
  resetAllTutorials() {
    localStorage.removeItem(this.storageKey);
    console.log('🔄 Todos los tutoriales reseteados');
  }

  // Iniciar tutorial
  start(steps, tutorialName = 'general') {
    const config = {
      ...this.getBaseConfig(),
      steps
    };

    this.driverInstance = driver(config);
    this.currentTutorial = tutorialName;
    this.driverInstance.drive();
  }

  stop() {
    if (this.driverInstance) {
      this.driverInstance.destroy();
      this.driverInstance = null;
    }
  }

  highlight(element, message) {
    const highlightDriver = driver({
      ...this.getBaseConfig(),
      steps: [{
        element,
        popover: {
          title: '💡 Consejo',
          description: message,
          side: 'bottom'
        }
      }]
    });
    highlightDriver.drive();
  }
}

export default new TutorialService();