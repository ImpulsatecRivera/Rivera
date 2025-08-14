import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const ProjectCard = ({ project, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Text style={styles.icon}>{project.icon}</Text>
        </View>
        <View style={styles.dollarIcon}>
          <Text style={styles.dollarText}>$</Text>
        </View>
      </View>
      
      <Text style={styles.projectName}>{project.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4A5568',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 110,
    width: '48%',
    marginBottom: 15,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FF9F43',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9F43',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  dollarIcon: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10AC84',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10AC84',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 2,
  },
  dollarText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  projectName: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default ProjectCard;