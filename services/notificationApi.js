const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.31.27:3001';

export const BROKER_APP_KEY = 'broker_app';

export const maskPushToken = (token = '') => {
    if (!token) return 'missing';
    if (token.length <= 18) return `${token.slice(0, 6)}...`;
    return `${token.slice(0, 14)}...${token.slice(-6)}`;
};

const parseResponseBody = async (response) => {
    const text = await response.text();
    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
};

export const registerPushToken = async ({
    authToken,
    expoPushToken,
    platform,
    deviceId,
}) => {
    console.log('[NotificationApi] Request started', {
        url: `${API_BASE_URL}/api/v1/push-tokens/register`,
        appKey: BROKER_APP_KEY,
        platform,
        deviceId: deviceId ? 'present' : 'missing',
        expoPushToken: maskPushToken(expoPushToken),
        hasAuthToken: Boolean(authToken),
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/push-tokens/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            appKey: BROKER_APP_KEY,
            expoPushToken,
            platform,
            deviceId,
        }),
    });

    const data = await parseResponseBody(response);

    console.log('[NotificationApi] Response received', {
        status: response.status,
        message: data?.message || response.statusText,
    });

    if (!response.ok) {
        throw new Error(data?.message || 'Push token registration failed');
    }

    return {
        status: response.status,
        message: data?.message,
        data,
    };
};
