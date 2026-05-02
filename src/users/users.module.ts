import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthConfig } from 'src/config/auth.config';
import { TypedConfigService } from 'src/config/typed-config.service';
import { User } from './user.entity';
import { PasswordService } from './password/password.service';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: TypedConfigService) => ({
        secret: configService.get<AuthConfig>('auth')?.jwt.secret,
        signOptions: {
          expiresIn: configService.get<AuthConfig>('auth')?.jwt.expiresIn,
        },
      }),
    }),
  ],
  providers: [PasswordService, UserService, AuthService, AuthGuard],
  controllers: [AuthController],
})
export class UsersModule {}
