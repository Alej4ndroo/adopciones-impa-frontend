const PROFILE_KEYWORDS = ['completa tu perfil', 'perfil', 'documento', 'documentacion', 'direccion'];

const normalizeText = (value = '') =>
    value
        ? value
              .toString()
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .trim()
        : '';

const getNotificationTimestamp = (notif = {}) => {
    if (!notif) return 0;
    const dateValue = notif.creada_at || notif.fecha;
    const date = dateValue ? new Date(dateValue).getTime() : Number.NaN;
    if (!Number.isNaN(date)) {
        return date;
    }
    return Number(notif.id_notificacion) || 0;
};

export const compareNotificationsByDateDesc = (a, b) =>
    getNotificationTimestamp(b) - getNotificationTimestamp(a);

export const isProfileCompletionReminder = (notif = {}) => {
    if (!notif) return false;
    const type = normalizeText(notif.tipo_notificacion);
    if (type && type !== 'seguimiento') {
        return false;
    }
    const searchable = normalizeText(`${notif.titulo || ''} ${notif.mensaje || ''}`);
    if (!searchable) return false;
    return PROFILE_KEYWORDS.some((keyword) => searchable.includes(keyword));
};

const buildProfileKey = (notif = {}) => {
    const normalizedTitle = normalizeText(notif.titulo);
    if (normalizedTitle) {
        return normalizedTitle;
    }
    const normalizedMessage = normalizeText(notif.mensaje);
    if (normalizedMessage) {
        return normalizedMessage;
    }
    return 'seguimiento-perfil';
};

/**
 * Merge notification lists removing duplicates from profile reminders
 * that AUTO-trigger when the user has pending verification.
 */
export const mergeNotificationsLists = (prevList = [], incomingList = []) => {
    const mapById = new Map();
    const fallback = [];

    const addItems = (items) => {
        (items || []).forEach((item, index) => {
            if (!item) return;
            if (item.id_notificacion) {
                mapById.set(item.id_notificacion, item);
            } else {
                fallback.push({ ...item, __fallbackKey: `${index}-${item.titulo || ''}` });
            }
        });
    };

    addItems(prevList);
    addItems(incomingList);

    const merged = [...mapById.values(), ...fallback];
    const profileLatest = new Map();
    const others = [];

    merged.forEach((notif) => {
        if (isProfileCompletionReminder(notif)) {
            const key = buildProfileKey(notif);
            const existing = profileLatest.get(key);
            if (!existing || getNotificationTimestamp(notif) > getNotificationTimestamp(existing)) {
                profileLatest.set(key, notif);
            }
            return;
        }
        others.push(notif);
    });

    profileLatest.forEach((notif) => others.push(notif));

    return others.sort(compareNotificationsByDateDesc);
};
