import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/domain/user.entity';
import { LoginDto, RegisterDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ id: string; email: string }> {
    const existingUser = await this.userRepository.findOne({ where: { email: registerDto.email } });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = this.userRepository.create(registerDto);
    await this.userRepository.save(user);

    return { id: user.id, email: user.email };
  }

  async login(loginDto: LoginDto): Promise<{ id: string; email: string }> {
    const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
    
    // Simple password check (In production, use bcrypt)
    if (!user || user.password !== loginDto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { id: user.id, email: user.email };
  }
}
