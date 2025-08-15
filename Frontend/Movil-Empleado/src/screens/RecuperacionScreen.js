import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  StyleSheet 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';


const RecuperacionScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleNext = () => {
    if (email) {
      // Navegar a la siguiente pantalla de recuperación
      navigation.navigate('Recuperacion2');
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header con X para cerrar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Icon name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Ilustración */}
      <View style={styles.imageContainer}>
        <Image 
          source={require('../images/recuperarcontra.png')} // Ajusta la ruta según tu estructura
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Título */}
        <Text style={styles.title}>
          Olvidaste tu contraseña?
        </Text>

        {/* Subtítulo */}
        <Text style={styles.subtitle}>
          No te preocupes, puede pasar. Introduce el número de teléfono y te enviaremos la contraseña de un solo uso.
        </Text>

        {/* Campo de entrada */}
        <TextInput
          style={styles.input}
          placeholder="Escribe tu correo electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Indicadores de progreso */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, styles.progressActive]} />
        <View style={[styles.progressDot]} />
        <View style={[styles.progressDot]} />
      </View>

      {/* Botón Siguiente */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, !email && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!email}
        >
          <Text style={[styles.buttonText, !email && styles.buttonTextDisabled]}>
            Siguiente
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Rivera distribuidora y{'\n'}
          transporte || 2025
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  image: {
    width: 256,
    height: 192,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#374151',
    marginBottom: 32,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  progressBar: {
    width: 32,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    marginRight: 8,
  },
  progressActive: {
    backgroundColor: '#111827',
  },
  progressDot: {
    width: 8,
    height: 8,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 8,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: '#9ca3af',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default RecuperacionScreen;