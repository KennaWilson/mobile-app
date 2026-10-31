import { useLocalSearchParams } from 'expo-router';
import FocusScreen from '../../screens/FocusScreen';

/** Focus IDs are created at runtime, so nothing is prerendered for GitHub Pages. */
export function generateStaticParams(): { id: string }[] {
  return [];
}

export default function FocusRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FocusScreen taskId={id} />;
}
