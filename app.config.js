const appJson = require('./app.json');

const nativeGoogleMapsKey = process.env.GOOGLE_MAPS_API_KEY;

if (!nativeGoogleMapsKey) {
    console.warn('GOOGLE_MAPS_API_KEY is missing; native Google Maps will not work in standalone builds.');
}

module.exports = {
    ...appJson.expo,
    ios: {
        ...appJson.expo.ios,
        config: {
            ...appJson.expo.ios?.config,
            googleMapsApiKey: nativeGoogleMapsKey,
        },
    },
    android: {
        ...appJson.expo.android,
        config: {
            ...appJson.expo.android?.config,
            googleMaps: { apiKey: nativeGoogleMapsKey },
        },
    },
};
