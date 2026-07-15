import { Stack } from 'expo-router';

export default function ProfileTabLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="studio" />
    </Stack>
  );
}
