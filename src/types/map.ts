export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
  address?: string;
  city?: string;
  country?: string;
  timestamp: number;
}

export interface MapTileStyle {
  id: string;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
  previewColor: string;
}

export interface SearchResult {
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
  icon?: string;
}

export interface PinnedPoint {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
  label?: string;
}
