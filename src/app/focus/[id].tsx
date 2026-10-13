import { useLocalSearchParams } from 'expo-router';
import FocusScreen from '../../screens/FocusScreen';

export default function FocusRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FocusScreen taskId={id} />;
}
