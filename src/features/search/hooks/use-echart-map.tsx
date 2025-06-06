// src/hooks/useEchartsMap.ts (or .js)
import { useState, useEffect } from 'react';
import * as echarts from 'echarts/core';

// Define a type for the GeoJSON structure for better safety
interface GeoJson {
  type: string;
  features: Array<{
    type: string;
    properties: Record<string, any>;
    geometry: any;
  }>;
}

// Keep track of which maps are already registered globally to avoid re-fetching
const registeredMaps = new Set<string>();

/**
 * A hook to fetch and register a GeoJSON map for use with ECharts.
 * @param mapName The name to register the map under (e.g., 'countries').
 * @param geoJsonUrl The public URL to the GeoJSON file.
 * @returns An object with the loading state, error state, and the map data.
 */
export function useEchartsMap(mapName: string, geoJsonUrl: string) {
  const [geoJson, setGeoJson] = useState<GeoJson | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!registeredMaps.has(mapName));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If this map name is already registered, don't do anything.
    if (registeredMaps.has(mapName)) {
      // We still need the GeoJSON data for processing, so we fetch it
      // if it's not already loaded in a previous instance of the hook.
      // This is a simplified approach; a more robust one might use a global cache/context.
    }

    const loadMapData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(geoJsonUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch map data: ${response.statusText}`);
        }
        const data: GeoJson = await response.json();
        
        // Register the map with ECharts *only if* it hasn't been done before
        if (!registeredMaps.has(mapName)) {
          echarts.registerMap(mapName, data);
          registeredMaps.add(mapName);
        }
        
        setGeoJson(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        console.error(`Error loading GeoJSON for map '${mapName}':`, err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only run the fetch if we don't have the data yet.
    if (!geoJson) {
      loadMapData();
    }
  }, [mapName, geoJsonUrl, geoJson]);

  return { geoJson, isLoading, error };
}