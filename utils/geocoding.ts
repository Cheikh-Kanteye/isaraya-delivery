/**
 * Utilitaires de géocodage pour convertir des coordonnées en adresses
 */

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Convertit des coordonnées GPS en adresse lisible (géocodage inversé)
 * Utilise l'API Nominatim d'OpenStreetMap (gratuite, pas de clé API requise)
 */
export async function reverseGeocode(
  coordinates: Coordinates
): Promise<string> {
  try {
    const { lat, lng } = coordinates;
    
    // Utiliser Nominatim (OpenStreetMap) - gratuit et sans clé API
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'IsarayaDeliveryApp/1.0', // Nominatim requiert un User-Agent
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors du géocodage');
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Construire une adresse lisible
    const address = data.address;
    const parts: string[] = [];

    // Ajouter le numéro et la rue si disponibles
    if (address.house_number) {
      parts.push(address.house_number);
    }
    if (address.road) {
      parts.push(address.road);
    } else if (address.street) {
      parts.push(address.street);
    }

    // Ajouter le quartier ou la localité
    if (address.suburb) {
      parts.push(address.suburb);
    } else if (address.neighbourhood) {
      parts.push(address.neighbourhood);
    } else if (address.quarter) {
      parts.push(address.quarter);
    }

    // Ajouter la ville
    if (address.city) {
      parts.push(address.city);
    } else if (address.town) {
      parts.push(address.town);
    } else if (address.village) {
      parts.push(address.village);
    }

    // Si on n'a rien trouvé, utiliser l'adresse complète formatée
    if (parts.length === 0 && data.display_name) {
      return data.display_name.split(',').slice(0, 3).join(', ');
    }

    return parts.join(', ') || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Erreur de géocodage inversé:', error);
    // En cas d'erreur, retourner les coordonnées formatées
    return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
  }
}

/**
 * Alternative utilisant Google Places API (si vous avez une clé API)
 * Décommentez et configurez si nécessaire
 */
/*
export async function reverseGeocodeGoogle(
  coordinates: Coordinates,
  apiKey: string
): Promise<string> {
  try {
    const { lat, lng } = coordinates;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      throw new Error('Aucune adresse trouvée');
    }

    return data.results[0].formatted_address;
  } catch (error) {
    console.error('Erreur de géocodage Google:', error);
    return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
  }
}
*/

/**
 * Formatte une adresse courte pour l'affichage
 */
export function formatShortAddress(fullAddress: string): string {
  const parts = fullAddress.split(',');
  // Prendre les 2-3 premiers éléments de l'adresse
  return parts.slice(0, Math.min(3, parts.length)).join(',');
}
