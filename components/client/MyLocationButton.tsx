import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/theme';
import { LocateIcon } from 'lucide-react-native';

interface MyLocationButtonProps {
  type: 'pickup' | 'delivery';
  active?: boolean;
  onPress: (type: 'pickup' | 'delivery') => void;
}

export const MyLocationButton: React.FC<MyLocationButtonProps> = ({
  type,
  active = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        active && styles.activeButton,
        type === 'pickup' && styles.pickupButton,
        type === 'delivery' && styles.deliveryButton,
      ]}
      onPress={() => onPress(type)}
    >
      <View style={styles.iconContainer}>
        <LocateIcon
          size={16}
          color={
            active
              ? Theme.colors.white
              : type === 'pickup'
              ? Theme.colors.primary[500]
              : Theme.colors.secondary[500]
          }
        />
      </View>
      <Text
        style={[
          styles.text,
          active && styles.activeText,
          type === 'pickup' && styles.pickupText,
          type === 'delivery' && styles.deliveryText,
        ]}
      >
        Ma position
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: Theme.colors.white,
  },
  activeButton: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  pickupButton: {
    borderColor: Theme.colors.primary[300],
  },
  deliveryButton: {
    borderColor: Theme.colors.secondary[300],
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeText: {
    color: Theme.colors.white,
  },
  pickupText: {
    color: Theme.colors.primary[500],
  },
  deliveryText: {
    color: Theme.colors.secondary[500],
  },
});
