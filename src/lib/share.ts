import { UserProfile } from '@/types/questionnaire';

export function encodeProfileToQuery(profile: UserProfile): string {
  try {
    const json = JSON.stringify(profile);
    if (typeof window !== 'undefined') {
      return encodeURIComponent(window.btoa(encodeURIComponent(json)));
    }
    return encodeURIComponent(Buffer.from(json).toString('base64'));
  } catch (e) {
    return '';
  }
}

export function decodeProfileFromQuery(queryParam: string): UserProfile | null {
  try {
    const decodedUri = decodeURIComponent(queryParam);
    let json = '';
    if (typeof window !== 'undefined') {
      json = decodeURIComponent(window.atob(decodedUri));
    } else {
      json = Buffer.from(decodedUri, 'base64').toString('utf8');
    }
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}
