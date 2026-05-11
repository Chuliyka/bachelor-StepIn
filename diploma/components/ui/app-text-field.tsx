import { Platform, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { AppColors } from '@/constants/app-colors';

type AppTextFieldProps = TextInputProps & {
  label: string;
  containerStyle?: ViewStyle;
};

export function AppTextField({ label, containerStyle, style, multiline, ...inputProps }: AppTextFieldProps) {
  return (
    <View style={[styles.field, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline, style]}
        placeholderTextColor={AppColors.placeholder}
        multiline={multiline}
        {...(Platform.OS === 'android' && multiline ? { textAlignVertical: 'top' as const } : {})}
        {...inputProps}
      />
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
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Inter',
    fontSize: 15,
    color: AppColors.navy,
    backgroundColor: AppColors.inputBg,
  },
  inputMultiline: {
    minHeight: 86,
  },
});
