import { Controller, Post, Body } from '@nestjs/common';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.login(loginDto);
    return { token: 'mock_jwt_token', user };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return { token: 'mock_jwt_token', user };
  }
}
