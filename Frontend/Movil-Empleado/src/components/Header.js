import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const Header = ({ title, showBack = false, onBack, rightComponent }) => {
  const topPad = Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { paddingTop: topPad }]}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right}>{rightComponent || null}</View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    minHeight: 56,
  },
  backButton: { marginRight: 15, padding: 6 },
  title: { fontSize: 18, fontWeight: "bold", color: "#000", flex: 1 },
  right: { minWidth: 24, alignItems: "flex-end" },
});

export default Header;
