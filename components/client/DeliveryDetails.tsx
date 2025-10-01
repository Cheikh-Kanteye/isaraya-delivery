import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Theme } from '@/constants/theme';
import AddressAutocomplete, {
  AddressAutocompleteRef,
} from './AddressAutocomplete';
import { MyLocationButton } from './MyLocationButton';
import { Clock, MapPin } from 'lucide-react-native';

interface DeliveryDetailsProps {
  pickupAddress: string;
  setPickupAddress: (address: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (address: string) => void;
  description: string;
  setDescription: (description: string) => void;
  urgency: 'normal' | 'urgent';
  setUrgency: (urgency: 'normal' | 'urgent') => void;
  pickupAutocompleteRef: React.RefObject<AddressAutocompleteRef>;
  deliveryAutocompleteRef: React.RefObject<AddressAutocompleteRef>;
  onUseMyLocation: (type: 'pickup' | 'delivery') => void;
  addressType: 'pickup' | 'delivery' | null;
  pickupCoordinates?: { lat: number; lng: number };
  deliveryCoordinates?: { lat: number; lng: number };
}

export const DeliveryDetails: React.FC<DeliveryDetailsProps> = ({
  pickupAddress,
  setPickupAddress,
  deliveryAddress,
  setDeliveryAddress,
  description,
  setDescription,
  urgency,
  setUrgency,
  pickupAutocompleteRef,
  deliveryAutocompleteRef,
  onUseMyLocation,
  addressType,
  pickupCoordinates,
  deliveryCoordinates,
}) => {
  return (
    <View style={styles.content}>
      {/* Section Adresses */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MapPin size={20} color={Theme.colors.primary[500]} />
          <Text style={styles.cardTitle}>Adresses de livraison</Text>
        </View>

        {/* Adresse de départ */}
        <View style={styles.inputGroup}>
          <View style={styles.addressHeader}>
            <Text style={styles.inputLabel}>Point de départ</Text>
            <MyLocationButton
              type="pickup"
              active={addressType === 'pickup'}
              onPress={onUseMyLocation}
            />
          </View>
          <AddressAutocomplete
            ref={pickupAutocompleteRef}
            placeholder="Où récupérer le colis ?"
            value={pickupAddress}
            onAddressSelect={(address, coords) => {
              setPickupAddress(address);
              if (coords) {
                // coords contient lat et lng
              }
            }}
            iconColor={Theme.colors.primary[500]}
          />
          {pickupCoordinates && (
            <Text style={styles.coordinatesText}>
              Position: {pickupCoordinates.lat.toFixed(6)},{' '}
              {pickupCoordinates.lng.toFixed(6)}
            </Text>
          )}
        </View>

        {/* Adresse de livraison */}
        <View style={styles.inputGroup}>
          <View style={styles.addressHeader}>
            <Text style={styles.inputLabel}>Destination</Text>
            <MyLocationButton
              type="delivery"
              active={addressType === 'delivery'}
              onPress={onUseMyLocation}
            />
          </View>
          <AddressAutocomplete
            ref={deliveryAutocompleteRef}
            placeholder="Où livrer le colis ?"
            value={deliveryAddress}
            onAddressSelect={(address, coords) => {
              setDeliveryAddress(address);
              if (coords) {
                // coords contient lat et lng
              }
            }}
            iconColor={Theme.colors.secondary[500]}
          />
          {deliveryCoordinates && (
            <Text style={styles.coordinatesText}>
              Position: {deliveryCoordinates.lat.toFixed(6)},{' '}
              {deliveryCoordinates.lng.toFixed(6)}
            </Text>
          )}
        </View>

        {/* Description du colis */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Description du colis (optionnel)
          </Text>
          <View style={styles.textAreaWrapper}>
            <TextInput
              style={styles.textArea}
              placeholder="Décrivez le contenu du colis..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor={Theme.colors.neutral[400]}
            />
          </View>
          <Text style={styles.hintText}>
            Ex: &ldquo;Colis alimentaire fragile&ldquo;, &ldquo;Documents
            importants&ldquo;, etc.
          </Text>
        </View>
      </View>

      {/* Type de livraison */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Clock size={20} color={Theme.colors.accent[500]} />
          <Text style={styles.cardTitle}>Type de livraison</Text>
        </View>

        <View style={styles.urgencyOptions}>
          {/* Option Standard */}
          <TouchableOpacity
            style={[
              styles.urgencyOption,
              urgency === 'normal' && styles.urgencyOptionSelected,
            ]}
            onPress={() => setUrgency('normal')}
          >
            <View style={styles.urgencyIcon}>
              <Clock
                size={20}
                color={
                  urgency === 'normal'
                    ? Theme.colors.white
                    : Theme.colors.secondary[500]
                }
              />
            </View>
            <View style={styles.urgencyTextContainer}>
              <Text
                style={[
                  styles.urgencyTitle,
                  urgency === 'normal' && styles.urgencyTitleSelected,
                ]}
              >
                Livraison Standard
              </Text>
              <Text
                style={[
                  styles.urgencySubtext,
                  urgency === 'normal' && styles.urgencySubtextSelected,
                ]}
              >
                Livraison en 24-48h • Prix normal
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option Express */}
          <TouchableOpacity
            style={[
              styles.urgencyOption,
              urgency === 'urgent' && styles.urgencyOptionSelected,
            ]}
            onPress={() => setUrgency('urgent')}
          >
            <View style={styles.urgencyIcon}>
              <Clock
                size={20}
                color={
                  urgency === 'urgent'
                    ? Theme.colors.white
                    : Theme.colors.accent[500]
                }
              />
            </View>
            <View style={styles.urgencyTextContainer}>
              <Text
                style={[
                  styles.urgencyTitle,
                  urgency === 'urgent' && styles.urgencyTitleSelected,
                ]}
              >
                Livraison Express
              </Text>
              <Text
                style={[
                  styles.urgencySubtext,
                  urgency === 'urgent' && styles.urgencySubtextSelected,
                ]}
              >
                Livraison en 2-4h • Majoration de 50%
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 120, // More space to avoid footer overlap and keyboard
  },
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.neutral[800],
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.neutral[700],
    marginBottom: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coordinatesText: {
    fontSize: 12,
    color: Theme.colors.neutral[500],
    marginTop: 4,
    fontStyle: 'italic',
  },
  textAreaWrapper: {
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
    padding: 12,
  },
  textArea: {
    fontSize: 16,
    color: Theme.colors.neutral[800],
    textAlignVertical: 'top',
    minHeight: 100,
  },
  hintText: {
    fontSize: 12,
    color: Theme.colors.neutral[500],
    marginTop: 4,
  },
  urgencyOptions: {
    gap: 12,
  },
  urgencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[200],
    backgroundColor: Theme.colors.white,
  },
  urgencyOptionSelected: {
    borderColor: Theme.colors.primary[500],
    backgroundColor: Theme.colors.primary[500],
  },
  urgencyIcon: {
    marginRight: 12,
  },
  urgencyTextContainer: {
    flex: 1,
  },
  urgencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.neutral[800],
    marginBottom: 4,
  },
  urgencyTitleSelected: {
    color: Theme.colors.white,
  },
  urgencySubtext: {
    fontSize: 12,
    color: Theme.colors.neutral[500],
  },
  urgencySubtextSelected: {
    color: Theme.colors.white,
  },
});
