const LOCATION_PREFIX = '__LOCATION__:';

export type ChatLocationCoords = {
  latitude: number;
  longitude: number;
};

export const LOCATION_MESSAGE_PREVIEW = '📍 Локація';

function isValidCoord(latitude: number, longitude: number): boolean {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function encodeLocationMessage(coords: ChatLocationCoords): string {
  return `${LOCATION_PREFIX}${JSON.stringify(coords)}`;
}

export function parseLocationMessage(text: string): ChatLocationCoords | null {
  if (!text.startsWith(LOCATION_PREFIX)) return null;

  try {
    const parsed = JSON.parse(text.slice(LOCATION_PREFIX.length)) as {
      latitude?: unknown;
      longitude?: unknown;
    };
    const latitude = Number(parsed.latitude);
    const longitude = Number(parsed.longitude);
    if (!isValidCoord(latitude, longitude)) return null;
    return { latitude, longitude };
  } catch {
    return null;
  }
}

export function formatMessagePreviewText(text: string): string {
  return parseLocationMessage(text) ? LOCATION_MESSAGE_PREVIEW : text;
}
