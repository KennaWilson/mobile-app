import { useEffect, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const SITES: {
  id: string;
  title: string;
  detail: string;
  icon: keyof typeof Feather.glyphMap;
  tint: string;
}[] = [
  { id: 'site', title: 'Website', detail: 'Connect a site', icon: 'globe', tint: '#E4EEF8' },
  { id: 'calendar', title: 'Calendar', detail: 'Connect a calendar', icon: 'calendar', tint: '#E5F3EA' },
  { id: 'inbox', title: 'Inbox', detail: 'Connect an inbox', icon: 'mail', tint: '#F3E9F0' },
  { id: 'notes', title: 'Notes', detail: 'Connect your notes', icon: 'file-text', tint: '#F6EFE4' },
];

const GAP = 12;
const ROTATE_MS = 3200;

export default function ConnectCarousel() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 96, 260);
  const step = cardWidth + GAP;
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const scrollRef = useRef<ScrollView>(null);
  const paused = useRef(false);

  const showIndex = (next: number, animated: boolean) => {
    const clamped = ((next % SITES.length) + SITES.length) % SITES.length;
    indexRef.current = clamped;
    setIndex(clamped);
    scrollRef.current?.scrollTo({ x: clamped * step, animated });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (paused.current) return;
      showIndex(indexRef.current + 1, true);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, [step]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / step);
    const clamped = Math.max(0, Math.min(SITES.length - 1, next));
    if (clamped !== indexRef.current) {
      indexRef.current = clamped;
      setIndex(clamped);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Connect</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={step}
        snapToAlignment="start"
        disableIntervalMomentum
        onScroll={onScroll}
        onScrollBeginDrag={() => {
          paused.current = true;
        }}
        onScrollEndDrag={() => {
          paused.current = false;
        }}
        onMomentumScrollEnd={() => {
          paused.current = false;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={styles.track}
      >
        {SITES.map((site) => (
          <Pressable
            key={site.id}
            accessibilityRole="button"
            accessibilityLabel={`Connect ${site.title}`}
            style={({ pressed }) => [
              styles.card,
              { width: cardWidth, backgroundColor: site.tint },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.iconBubble}>
              <Feather name={site.icon} size={22} color={colors.accent} />
            </View>
            <Text style={styles.title}>{site.title}</Text>
            <Text style={styles.detail}>{site.detail}</Text>
            <View style={styles.connect}>
              <Text style={styles.connectLabel}>Connect</Text>
              <Feather name="arrow-right" size={14} color={colors.surface} />
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {SITES.map((site, dotIndex) => (
          <View key={site.id} style={[styles.dot, dotIndex === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 28,
  },
  heading: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: 14,
  },
  track: {
    gap: GAP,
    paddingRight: 8,
  },
  card: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 20,
    minHeight: 176,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  detail: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSecondary,
  },
  connect: {
    marginTop: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  connectLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.surface,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(90, 95, 160, 0.25)',
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.accent,
  },
  pressed: {
    opacity: 0.75,
  },
});
