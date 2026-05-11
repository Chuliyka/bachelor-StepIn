export class CreateUserDto {
  email?: string;
  phoneNumber?: string;
  googleId?: string;
  appleId?: string;
  name?: string;
  status?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
}
