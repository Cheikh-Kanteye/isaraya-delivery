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
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Theme } from '@/constants/theme';

// Types pour les résultats Nominatim
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

// Define prop types
interface AddressAutocompleteProps {
  placeholder: string;
  value?: string;
  onAddressSelect: (
    address: string,
    coordinates: { lat: number; lng: number }
  ) => void;
  iconColor?: string;
  style?: any;
}

// Define ref interface
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
    },
    ref
  ) => {
    const textInputRef = useRef<TextInput>(null);
    const [searchText, setSearchText] = useState(value || '');
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeoutRef = useRef<number | null>(null);

    // Fonction pour rechercher des adresses via Nominatim
    const searchAddresses = useCallback(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);

      try {
        // Configuration de la recherche pour le Sénégal
        const params = new URLSearchParams({
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '5',
          countrycodes: 'sn', // Limiter au Sénégal
          'accept-language': 'fr',
          bounded: '1',
          viewbox: '-17.7,14.0,-16.9,14.9', // Bbox approximatif pour Dakar
        });

        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
          {
            headers: {
              'User-Agent': 'YourAppName/1.0', // Remplacez par le nom de votre app
            },
          }
        );

        if (response.ok) {
          const results: NominatimResult[] = await response.json();
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } else {
          console.error('Nominatim API error:', response.status);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, []);

    // Debounced search
    const handleTextChange = useCallback(
      (text: string) => {
        setSearchText(text);

        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
          searchAddresses(text);
        }, 500);
      },
      [searchAddresses]
    );

    // Gestion de la sélection d'une suggestion
    const handleSuggestionSelect = useCallback(
      (item: NominatimResult) => {
        const coordinates = {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        };

        setSearchText(item.display_name);
        setShowSuggestions(false);
        setSuggestions([]);
        onAddressSelect(item.display_name, coordinates);
      },
      [onAddressSelect]
    );

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      setAddressText: (text: string) => {
        setSearchText(text);
      },
      getAddressText: () => {
        return searchText;
      },
      focus: () => {
        textInputRef.current?.focus();
      },
      blur: () => {
        textInputRef.current?.blur();
        setShowSuggestions(false);
      },
      clear: () => {
        setSearchText('');
        setSuggestions([]);
        setShowSuggestions(false);
      },
    }));

    // Rendu d'une suggestion
    const renderSuggestion = ({ item }: { item: NominatimResult }) => (
      <TouchableOpacity
        style={styles.row}
        onPress={() => handleSuggestionSelect(item)}
      >
        <Icon
          name="map-pin"
          size={14}
          color={Theme.colors.neutral[400]}
          style={styles.suggestionIcon}
        />
        <Text style={styles.description} numberOfLines={2}>
          {item.display_name}
        </Text>
      </TouchableOpacity>
    );

    return (
      <View style={[styles.container, style]}>
        <View style={styles.textInputContainer}>
          <View style={styles.inputIcon}>
            <Icon name="map-pin" size={16} color={iconColor} />
          </View>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            placeholder={placeholder}
            placeholderTextColor={Theme.colors.neutral[400]}
            value={searchText}
            onChangeText={handleTextChange}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Délai pour permettre la sélection
              setTimeout(() => setShowSuggestions(false), 150);
            }}
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

        {showSuggestions && suggestions.length > 0 && (
          <View style={styles.listView}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.place_id.toString()}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.neutral[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
    paddingHorizontal: 12,
    height: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.neutral[800],
    backgroundColor: 'transparent',
    paddingLeft: 8,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
  },
  inputIcon: {
    marginRight: 4,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  listView: {
    backgroundColor: Theme.colors.white,
    borderRadius: 12,
    marginTop: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
  },
  row: {
    backgroundColor: Theme.colors.white,
    padding: 16,
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.neutral[100],
    marginLeft: 48, // Align with text after icon
    marginRight: 16,
  },
  description: {
    fontSize: 14,
    color: Theme.colors.neutral[800],
    flex: 1,
  },
});

AddressAutocomplete.displayName = 'AddressAutocomplete';

export default AddressAutocomplete;
