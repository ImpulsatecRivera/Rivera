import React from 'react';

const OnboardingScreen = () => {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.pageIndicator}>2/3</span>
        <button style={styles.skipButton}>Saltar</button>
      </div>

      {/* Illustration Container */}
      <div style={styles.illustrationContainer}>
        {/* Credit Card */}
        <div style={styles.cardContainer}>
          <div style={styles.creditCard}>
            {/* Card chip */}
            <div style={styles.chip} />
            
            {/* Card lines (representing card number and text) */}
            <div style={styles.cardLines}>
              <div style={styles.cardLine1} />
              <div style={styles.cardLine2} />
            </div>
            
            {/* Card stripe */}
            <div style={styles.cardStripe} />
          </div>
          
          {/* Green checkmark circle */}
          <div style={styles.checkmarkContainer}>
            <div style={styles.checkmarkCircle}>
              <div style={styles.checkmark}>✓</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h2 style={styles.title}>Elige tu forma de pago</h2>
        <p style={styles.subtitle}>
          Elige tu forma de pago deseado.
        </p>
      </div>

      {/* Bottom Navigation */}
      <div style={styles.bottomContainer}>
        <div style={styles.navigation}>
          <button style={styles.backButton}>
            <span style={styles.backButtonText}>Atrás</span>
          </button>
          
          <div style={styles.pagination}>
            <div style={styles.dot} />
            <div style={{...styles.dot, ...styles.activeDot}} />
            <div style={styles.dot} />
          </div>
          
          <button style={styles.nextButton}>
            <span style={styles.nextButtonText}>Siguiente</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '400px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    paddingTop: '50px',
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    marginBottom: '80px',
  },
  pageIndicator: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#000000',
  },
  skipButton: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#000000',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  illustrationContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 40px',
    position: 'relative',
    minHeight: '400px',
  },
  cardContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  creditCard: {
    width: '280px',
    height: '180px',
    backgroundColor: '#4A90E2',
    borderRadius: '15px',
    position: 'relative',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
  },
  chip: {
    width: '45px',
    height: '35px',
    backgroundColor: '#F0C851',
    borderRadius: '6px',
    position: 'absolute',
    top: '30px',
    left: '25px',
  },
  cardLines: {
    position: 'absolute',
    top: '30px',
    right: '25px',
  },
  cardLine1: {
    width: '120px',
    height: '8px',
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
    marginBottom: '8px',
  },
  cardLine2: {
    width: '80px',
    height: '8px',
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
  },
  cardStripe: {
    width: '100%',
    height: '50px',
    backgroundColor: '#2C3E50',
    position: 'absolute',
    bottom: '0',
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: '-25px',
    right: '-25px',
  },
  checkmarkCircle: {
    width: '80px',
    height: '80px',
    backgroundColor: '#4CAF50',
    borderRadius: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: '32px',
    fontWeight: 'bold',
    transform: 'rotate(-10deg)',
  },
  content: {
    padding: '0 40px',
    textAlign: 'center',
    marginBottom: '60px',
    marginTop: '40px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '15px',
    margin: '0 0 15px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#999999',
    lineHeight: '24px',
    margin: 0,
  },
  bottomContainer: {
    padding: '0 40px 40px',
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  backButtonText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#CCCCCC',
  },
  pagination: {
    display: 'flex',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '5px',
    backgroundColor: '#E0E0E0',
    margin: '0 5px',
  },
  activeDot: {
    backgroundColor: '#333333',
    width: '30px',
  },
  nextButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  nextButtonText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#7ED321',
  },
};

export default OnboardingScreen;