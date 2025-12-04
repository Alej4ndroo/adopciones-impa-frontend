export const sanitizeBase64Image = (rawValue) => {
    if (!rawValue || typeof rawValue !== 'string') return null;
    let trimmed = rawValue.trim();
    let prefix = 'data:image/jpeg;base64';
    let payload = trimmed;

    if (trimmed.startsWith('data:')) {
        const [meta, dataPart] = trimmed.split(',', 2);
        if (!dataPart) return null;
        prefix = meta;
        payload = dataPart;
    }

    payload = (payload || '').replace(/[\s\r\n]+/g, '');
    while (payload.toLowerCase().startsWith('data:')) {
        const commaIndex = payload.indexOf(',');
        if (commaIndex === -1) return null;
        payload = payload.slice(commaIndex + 1).replace(/[\s\r\n]+/g, '');
    }

    if (!payload || payload.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(payload)) {
        return null;
    }

    return `${prefix},${payload}`;
};

export const asDataUrlImage = (value) => sanitizeBase64Image(value);
