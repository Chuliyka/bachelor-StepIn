import { StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from 'react-native';
import { AppColors } from '@/constants/app-colors';

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  containerStyle?: ViewStyle;
};

export function SelectField({ label, value, placeholder, onPress, containerStyle }: SelectFieldProps) {
  const display = value || placeholder;
  const isPlaceholder = !value;

  return (
    <View style={[styles.field, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onPress}>
        <Text style={[styles.value, isPlaceholder && styles.placeholder]}>{display}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginTop: 8,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.navy,
    marginBottom: 6,
  },
  row: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: AppColors.inputBg,
  },
  value: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: AppColors.navy,
  },
  placeholder: {
    color: AppColors.placeholder,
  },
});
