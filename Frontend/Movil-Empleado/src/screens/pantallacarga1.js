import React from 'react';

const OnboardingScreen = () => {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.pageIndicator}>1/3</span>
        <button style={styles.skipButton}>Saltar</button>
      </div>

      {/* Illustration Container */}
      <div style={styles.illustrationContainer}>
        {/* Person illustration */}
        <div style={styles.personContainer}>
          {/* Head */}
          <div style={styles.head}>
            <div style={styles.hair} />
          </div>
          
          {/* Body */}
          <div style={styles.body} />
          
          {/* Laptop */}
          <div style={styles.laptop}>
            <div style={styles.laptopScreen}>
              <div style={styles.appleLogo} />
            </div>
          </div>
        </div>

        {/* Earth illustration */}
        <div style={styles.earthContainer}>
          <div style={styles.earth}>
            <div style={styles.continent1} />
            <div style={styles.continent2} />
            <div style={styles.continent3} />
          </div>
        </div>

        {/* Desk */}
        <div style={styles.desk}>
          <div style={styles.deskTop} />
          <div style={styles.deskLegs}>
            <div style={styles.leftLeg} />
            <div style={styles.rightLeg} />
          </div>
          <div style={styles.deskDrawer} />
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h2 style={styles.title}>Cotiza Viajes</h2>
        <p style={styles.subtitle}>
          Cotiza tus viajes para que podamos<br />
          encargarnos de tus pedidos deseados.
        </p>
      </div>

      {/* Bottom Navigation */}
      <div style={styles.bottomContainer}>
        <div style={styles.pagination}>
          <div style={{...styles.dot, ...styles.activeDot}} />
          <div style={styles.dot} />
          <div style={styles.dot} />
        </div>
        
        <button style={styles.nextButton}>
          <span style={styles.nextButtonText}>Siguiente</span>
        </button>
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
    marginBottom: '60px',
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
  personContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 2,
  },
  head: {
    width: '60px',
    height: '60px',
    backgroundColor: '#F5C6A0',
    borderRadius: '30px',
    marginBottom: '5px',
    position: 'relative',
  },
  hair: {
    width: '50px',
    height: '30px',
    backgroundColor: '#B8860B',
    borderRadius: '25px',
    position: 'absolute',
    top: '-5px',
    left: '5px',
  },
  body: {
    width: '80px',
    height: '60px',
    backgroundColor: '#FF8C42',
    borderRadius: '15px',
    marginBottom: '10px',
  },
  laptop: {
    backgroundColor: '#E0E0E0',
    borderRadius: '8px',
    padding: '8px',
    transform: 'perspective(1000px) rotateX(15deg)',
  },
  laptopScreen: {
    width: '100px',
    height: '70px',
    backgroundColor: '#333333',
    borderRadius: '4px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleLogo: {
    width: '8px',
    height: '8px',
    backgroundColor: '#FFFFFF',
    borderRadius: '4px',
  },
  earthContainer: {
    position: 'absolute',
    right: '40px',
    top: '50px',
  },
  earth: {
    width: '80px',
    height: '80px',
    backgroundColor: '#4A90E2',
    borderRadius: '40px',
    position: 'relative',
    overflow: 'hidden',
  },
  continent1: {
    width: '35px',
    height: '25px',
    backgroundColor: '#7ED321',
    borderRadius: '15px',
    position: 'absolute',
    top: '15px',
    left: '10px',
  },
  continent2: {
    width: '25px',
    height: '20px',
    backgroundColor: '#7ED321',
    borderRadius: '12px',
    position: 'absolute',
    bottom: '20px',
    right: '15px',
  },
  continent3: {
    width: '20px',
    height: '15px',
    backgroundColor: '#7ED321',
    borderRadius: '8px',
    position: 'absolute',
    top: '45px',
    left: '45px',
  },
  desk: {
    position: 'absolute',
    bottom: '-20px',
    width: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  deskTop: {
    width: '200px',
    height: '20px',
    backgroundColor: '#D2B48C',
    borderRadius: '10px',
  },
  deskLegs: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '180px',
    marginTop: '5px',
  },
  leftLeg: {
    width: '15px',
    height: '40px',
    backgroundColor: '#D2B48C',
  },
  rightLeg: {
    width: '15px',
    height: '40px',
    backgroundColor: '#D2B48C',
  },
  deskDrawer: {
    width: '100px',
    height: '15px',
    backgroundColor: '#F0E68C',
    position: 'absolute',
    bottom: '20px',
  },
  content: {
    padding: '0 40px',
    textAlign: 'center',
    marginBottom: '60px',
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
    color: '#666666',
    lineHeight: '24px',
    margin: 0,
  },
  bottomContainer: {
    padding: '0 40px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pagination: {
    display: 'flex',
    marginBottom: '30px',
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
    alignSelf: 'flex-end',
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