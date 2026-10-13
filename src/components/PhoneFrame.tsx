import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { ReactNode } from 'react';

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;
const DESKTOP_BREAKPOINT = 480;

type PhoneFrameProps = {
  children: ReactNode;
};

export default function PhoneFrame({ children }: PhoneFrameProps) {
  const { width, height } = useWindowDimensions();
  const useFrame = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;

  if (!useFrame) {
    return <View style={styles.fill}>{children}</View>;
  }

  const phoneHeight = Math.min(PHONE_HEIGHT, height * 0.92);

  return (
    <View style={styles.stage}>
      <View style={[styles.phone, { height: phoneHeight }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  stage: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE9E0',
  },
  phone: {
    width: PHONE_WIDTH,
    backgroundColor: '#F7F6F2',
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.14,
    shadowRadius: 48,
    elevation: 16,
  },
});
