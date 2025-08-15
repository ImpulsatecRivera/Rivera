import React from 'react';

const OnboardingScreen = () => {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.pageIndicator}>3/3</span>
        <button style={styles.skipButton}>Saltar</button>
      </div>

      {/* Illustration Container */}
      <div style={styles.illustrationContainer}>
        {/* Money Bag Character */}
        <div style={styles.characterContainer}>
          {/* Arms */}
          <div style={styles.leftArm}>
            <div style={styles.leftHand} />
          </div>
          <div style={styles.rightArm}>
            <div style={styles.rightHand}>
              <div style={styles.moneyBill} />
            </div>
          </div>
          
          {/* Body (Money Bag) */}
          <div style={styles.moneyBag}>
            {/* Logo/Label */}
            <div style={styles.logoContainer}>
              <div style={styles.logo}>
                <span style={styles.logoText}>RIVERA</span>
                <div style={styles.logoUnderline} />
              </div>
            </div>
            
            {/* Bag tie/rope */}
            <div style={styles.bagTie} />
          </div>
          
          {/* Legs */}
          <div style={styles.legs}>
            <div style={styles.leftLeg}>
              <div style={styles.leftShoe} />
            </div>
            <div style={styles.rightLeg}>
              <div style={styles.rightShoe} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <h2 style={styles.title}>Realiza cotizaciones las veces que quieras</h2>
        <p style={styles.subtitle}>
          Puedes realizar las cotizaciones que desees;<br />
          estaremos listos para ayudarte.
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
            <div style={styles.dot} />
            <div style={{...styles.dot, ...styles.activeDot}} />
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
  characterContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  leftArm: {
    position: 'absolute',
    left: '-50px',
    top: '40px',
    width: '40px',
    height: '60px',
    backgroundColor: '#D4A574',
    borderRadius: '20px',
    transform: 'rotate(-30deg)',
    zIndex: 1,
  },
  leftHand: {
    position: 'absolute',
    bottom: '-15px',
    left: '5px',
    width: '25px',
    height: '25px',
    backgroundColor: '#D4A574',
    borderRadius: '50%',
  },
  rightArm: {
    position: 'absolute',
    right: '-50px',
    top: '40px',
    width: '40px',
    height: '60px',
    backgroundColor: '#D4A574',
    borderRadius: '20px',
    transform: 'rotate(30deg)',
    zIndex: 1,
  },
  rightHand: {
    position: 'absolute',
    bottom: '-15px',
    right: '5px',
    width: '25px',
    height: '25px',
    backgroundColor: '#D4A574',
    borderRadius: '50%',
  },
  moneyBill: {
    position: 'absolute',
    top: '-10px',
    right: '-20px',
    width: '30px',
    height: '20px',
    backgroundColor: '#4CAF50',
    borderRadius: '3px',
    transform: 'rotate(15deg)',
  },
  moneyBag: {
    width: '160px',
    height: '140px',
    backgroundColor: '#C8956D',
    borderRadius: '80px 80px 20px 20px',
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '25px',
    padding: '15px 20px',
    border: '2px solid #4CAF50',
  },
  logo: {
    textAlign: 'center',
  },
  logoText: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#4CAF50',
    display: 'block',
  },
  logoUnderline: {
    width: '100%',
    height: '2px',
    backgroundColor: '#4CAF50',
    marginTop: '2px',
  },
  bagTie: {
    position: 'absolute',
    top: '-15px',
    width: '60px',
    height: '30px',
    backgroundColor: '#B8804D',
    borderRadius: '30px',
  },
  legs: {
    display: 'flex',
    gap: '20px',
    marginTop: '-10px',
    zIndex: 1,
  },
  leftLeg: {
    width: '30px',
    height: '50px',
    backgroundColor: '#C8956D',
    borderRadius: '15px',
  },
  rightLeg: {
    width: '30px',
    height: '50px',
    backgroundColor: '#C8956D',
    borderRadius: '15px',
  },
  leftShoe: {
    position: 'absolute',
    bottom: '-15px',
    left: '-5px',
    width: '40px',
    height: '25px',
    backgroundColor: '#333333',
    borderRadius: '20px',
  },
  rightShoe: {
    position: 'absolute',
    bottom: '-15px',
    right: '-5px',
    width: '40px',
    height: '25px',
    backgroundColor: '#333333',
    borderRadius: '20px',
  },
  content: {
    padding: '0 40px',
    textAlign: 'center',
    marginBottom: '60px',
    marginTop: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '15px',
    margin: '0 0 15px 0',
    lineHeight: '28px',
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