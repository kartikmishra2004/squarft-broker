const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const requireApiKey = () => {
    if (!GOOGLE_MAPS_API_KEY) {
        throw new Error('Google Maps API key is not configured for this build');
    }
    return GOOGLE_MAPS_API_KEY;
};

const addressComponent = (result, type) =>
    result.address_components?.find((item) => item.types.includes(type))?.long_name || null;

const mapResult = (result) => ({
    id: result.place_id,
    address: result.formatted_address,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    area: addressComponent(result, 'sublocality_level_1') || addressComponent(result, 'neighborhood'),
    city: addressComponent(result, 'locality') || addressComponent(result, 'administrative_area_level_2'),
    state: addressComponent(result, 'administrative_area_level_1'),
    pincode: addressComponent(result, 'postal_code'),
    provider: 'google',
});

const geocodeRequest = async (params) => {
    const query = new URLSearchParams({ ...params, key: requireApiKey() });
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${query}`);
    const data = await response.json();

    if (!response.ok || !['OK', 'ZERO_RESULTS'].includes(data.status)) {
        throw new Error(data.error_message || 'Google location request failed');
    }
    return data.results || [];
};

export const geocodeGoogleAddress = async (address) => {
    const results = await geocodeRequest({ address: String(address).trim(), region: 'in' });
    if (!results[0]) throw new Error('Google could not find this address');
    return mapResult(results[0]);
};

export const reverseGeocodeGoogleLocation = async ({ latitude, longitude }) => {
    const results = await geocodeRequest({ latlng: `${latitude},${longitude}` });
    if (!results[0]) throw new Error('Google could not resolve this location');
    return { ...mapResult(results[0]), latitude, longitude };
};

export const searchGoogleLocations = async (query, limit = 6) => {
    const results = await geocodeRequest({ address: String(query).trim(), region: 'in' });
    return results.slice(0, limit).map(mapResult);
};
