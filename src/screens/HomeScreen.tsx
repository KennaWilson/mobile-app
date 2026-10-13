import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const colors = {
  background: '#F7F6F2',
  surface: '#FFFFFF',
  textPrimary: '#1F2128',
  textSecondary: '#5F626B',
  placeholder: '#7A7D85',
  handle: '#E2E2E4',
};

function formatToday() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.content, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.date}>{formatToday()}</Text>
        <Text style={styles.title}>A clean slate</Text>
        <Text style={styles.empty}>Nothing planned yet.</Text>
      </View>

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.handle} />
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Add a task or brain dump everything"
            placeholderTextColor={colors.placeholder}
            multiline
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voice input"
            hitSlop={12}
            style={({ pressed }) => [styles.micButton, pressed && styles.pressed]}
          >
            <Feather name="mic" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  empty: {
    marginTop: 28,
    fontSize: 16,
    color: colors.textSecondary,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.handle,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
    paddingVertical: 8,
    maxHeight: 120,
  },
  micButton: {
    padding: 4,
  },
  pressed: {
    opacity: 0.5,
  },
});
