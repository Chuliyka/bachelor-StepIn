import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../profile';

export default function ProfileTabRoute() {
  const scrollBottomInset = useBottomTabBarHeight();
  return <ProfileScreen scrollBottomInset={scrollBottomInset} />;
}
