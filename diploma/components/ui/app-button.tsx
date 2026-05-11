import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import { AppColors } from '@/constants/app-colors';

export type AppButtonVariant = 'primary' | 'outline';

type AppButtonProps = Omit<TouchableOpacityProps, 'style'> & {
  title: string;
  variant?: AppButtonVariant;
  loading?: boolean;
  shape?: 'default' | 'pill';
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  variant = 'primary',
  loading = false,
  shape = 'default',
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  const isPrimary = variant === 'primary';
  const dim = shape === 'pill' ? styles.dimPill : styles.dimDefault;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        dim,
        isPrimary ? styles.primary : styles.outline,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      activeOpacity={0.8}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? AppColors.white : AppColors.primary} />
      ) : (
        <Text style={isPrimary ? styles.textPrimary : styles.textOutline}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimDefault: {
    height: 42,
    borderRadius: 10,
  },
  dimPill: {
    height: 40,
    borderRadius: 35,
  },
  primary: {
    backgroundColor: AppColors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  disabled: {
    opacity: 0.55,
  },
  textPrimary: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.white,
  },
  textOutline: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
});
