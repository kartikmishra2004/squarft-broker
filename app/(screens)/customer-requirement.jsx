import { StyleSheet, Text, View, Pressable } from 'react-native';
import { router, Stack } from 'expo-router';

export default function CustomerRequirement() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Customer Requirement', headerShown: true }} />
      <Text style={styles.text}>Customer Requirement Screen</Text>
      <Pressable onPress={() => router.back()} style={styles.button}>
        <Text style={styles.buttonText}>Go Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#4A43EC',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
  },
});
