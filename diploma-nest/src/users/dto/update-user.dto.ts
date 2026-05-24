export class UpdateUserDto {
  name?: string;
  birthDate?: string;
  gender?: string;
  about?: string;
  bio?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: 'precise' | 'approximate';
  isRegistered?: boolean;
}
