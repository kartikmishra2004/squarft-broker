import { Stack } from "expo-router";

export default function ScreensLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="property-type" />
      <Stack.Screen name="customer-requirement" />
      <Stack.Screen name="add-customer-requirement" />
      <Stack.Screen name="customer-details" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
