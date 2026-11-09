import { SearchResult } from '../types/map';

export async function reverseGeocode(lat: number, lon: number): Promise<{ address: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'WorldMapApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding response not ok');
    }

    const data = await response.json();
    if (data && data.display_name) {
      return { address: data.display_name };
    }
  } catch (error) {
    console.warn('Reverse geocoding error:', error);
  }

  return { address: `${lat.toFixed(5)}°, ${lon.toFixed(5)}°` };
}

export async function searchLocations(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    // Nominatim query supports home numbers, street addresses, provinces, cities, countries
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=8`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'WorldMapApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Search response not ok');
    }

    const data: SearchResult[] = await response.json();
    return data;
  } catch (error) {
    console.warn('Search geocoding error:', error);
    return [];
  }
}
