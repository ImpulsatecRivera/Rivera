// src/components/TutorialSettings.jsx
import React from 'react';
import TutorialService from '../services/TutorialService';
import DataDetectionService from '../services/DataDetectionService';

const TutorialSettings = () => {
  const completedTutorials = TutorialService.getCompletedTutorials();

  const handleReset = (tutorialName) => {
    TutorialService.resetTutorial(tutorialName);
    DataDetectionService.clearModuleCache(tutorialName);
    window.location.reload();
  };

  const handleResetAll = () => {
    if (window.confirm('¿Resetear todos los tutoriales?')) {
      TutorialService.resetAllTutorials();
      DataDetectionService.clearCache();
      window.location.reload();
    }
  };

  return (
    <div className="tutorial-settings">
      <h3>⚙️ Configuración de Tutoriales</h3>
      
      <div className="tutorials-status">
        <h4>Tutoriales Completados:</h4>
        {completedTutorials.length === 0 ? (
          <p>Ninguno completado aún</p>
        ) : (
          <ul>
            {completedTutorials.map(tutorial => (
              <li key={tutorial}>
                {tutorial} 
                <button onClick={() => handleReset(tutorial)}>
                  🔄 Resetear
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={handleResetAll} className="reset-all-btn">
        🔄 Resetear Todos los Tutoriales
      </button>
    </div>
  );
};

export default TutorialSettings;