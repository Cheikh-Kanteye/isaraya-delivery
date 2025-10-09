import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Modal,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Theme } from '@/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}

interface AddressAutocompleteProps {
  placeholder: string;
  value?: string;
  onAddressSelect: (
    address: string,
    coordinates: { lat: number; lng: number }
  ) => void;
  iconColor?: string;
  style?: any;
  label?: string;
}

export interface AddressAutocompleteRef {
  setAddressText: (text: string) => void;
  getAddressText: () => string;
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

const AddressAutocomplete = forwardRef<
  AddressAutocompleteRef,
  AddressAutocompleteProps
>(
  (
    {
      placeholder,
      value,
      onAddressSelect,
      iconColor = Theme.colors.primary[500],
      style,
      label,
    },
    ref
  ) => {
    const textInputRef = useRef<TextInput>(null);
    const [searchText, setSearchText] = useState(value || '');
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const searchTimeoutRef = useRef<number | null>(null);
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    const searchAddresses = useCallback(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);

      try {
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '8',
          countrycodes: 'sn',
          'accept-language': 'fr',
          bounded: '1',
          viewbox: '-17.7,14.0,-16.9,14.9',
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            headers: {
              'User-Agent': 'YourAppName/1.0',
            },
          }
        );

        if (response.ok) {
          const results: NominatimResult[] = await response.json();
          setSuggestions(results);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, []);

    const handleTextChange = useCallback(
      (text: string) => {
        setSearchText(text);

        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        if (text.length >= 3) {
          searchTimeoutRef.current = setTimeout(() => {
            searchAddresses(text);
          }, 500);
        } else {
          setSuggestions([]);
        }
      },
      [searchAddresses]
    );

    const openModal = () => {
      setModalVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    };

    const closeModal = useCallback(() => {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
        setSuggestions([]);
      });
    }, []);

    const handleSuggestionSelect = useCallback(
      (item: NominatimResult) => {
        const coordinates = {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };

        setSearchText(item.display_name);
        onAddressSelect(item.display_name, coordinates);
        closeModal();
      },
      [onAddressSelect, closeModal]
    );

    useImperativeHandle(ref, () => ({
      setAddressText: (text: string) => {
        setSearchText(text);
      },
      getAddressText: () => {
        return searchText;
      },
      focus: () => {
        openModal();
      },
      blur: () => {
        closeModal();
      },
      clear: () => {
        setSearchText('');
        setSuggestions([]);
      },
    }));

    const renderSuggestion = ({ item }: { item: NominatimResult }) => (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSuggestionSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.suggestionIconContainer}>
          <Icon name="map-pin" size={18} color={iconColor} />
        </View>
        <Text style={styles.suggestionText} numberOfLines={2}>
          {item.display_name}
        </Text>
        <Icon
          name="chevron-right"
          size={18}
          color={Theme.colors.neutral[400]}
        />
      </TouchableOpacity>
    );

    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={openModal}
          activeOpacity={0.8}
        >
          <View style={styles.inputIcon}>
            <Icon name="map-pin" size={18} color={iconColor} />
          </View>
          <Text
            style={[styles.inputText, !searchText && styles.placeholderText]}
            numberOfLines={1}
          >
            {searchText || placeholder}
          </Text>
          <Icon name="search" size={18} color={Theme.colors.neutral[400]} />
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          transparent
          animationType="none"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={closeModal}
            />
            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {label || 'Rechercher une adresse'}
                </Text>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.closeButton}
                >
                  <Icon name="x" size={24} color={Theme.colors.neutral[600]} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Icon
                    name="search"
                    size={18}
                    color={Theme.colors.neutral[400]}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    ref={textInputRef}
                    style={styles.searchInput}
                    placeholder="Tapez au moins 3 caractères..."
                    placeholderTextColor={Theme.colors.neutral[400]}
                    value={searchText}
                    onChangeText={handleTextChange}
                    autoFocus
                    {...(Platform.OS === 'android' && {
                      underlineColorAndroid: 'transparent',
                    })}
                  />
                  {loading && (
                    <ActivityIndicator
                      size="small"
                      color={iconColor}
                      style={styles.loadingIndicator}
                    />
                  )}
                </View>
              </View>

              {suggestions.length > 0 ? (
                <FlatList
                  data={suggestions}
                  renderItem={renderSuggestion}
                  keyExtractor={(item) => item.place_id.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.suggestionsList}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Icon
                    name="map-pin"
                    size={48}
                    color={Theme.colors.neutral[300]}
                  />
                  <Text style={styles.emptyStateText}>
                    {searchText.length < 3
                      ? 'Commencez à taper pour rechercher'
                      : loading
                      ? 'Recherche en cours...'
                      : 'Aucune adresse trouvée'}
                  </Text>
                </View>
              )}
            </Animated.View>
          </View>
        </Modal>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: Theme.colors.neutral[800],
  },
  placeholderText: {
    color: Theme.colors.neutral[400],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: Theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Theme.colors.neutral[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.neutral[900],
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Theme.colors.neutral[800],
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  suggestionsList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[100],
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.neutral[800],
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: Theme.colors.neutral[500],
    marginTop: 12,
    textAlign: 'center',
  },
});

AddressAutocomplete.displayName = 'AddressAutocomplete';

export default AddressAutocomplete;
