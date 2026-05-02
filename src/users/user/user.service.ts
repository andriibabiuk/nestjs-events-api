import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../create-user.dto';
import { PasswordService } from '../password/password.service';
import { User } from '../user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly passwordService: PasswordService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  public async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }
  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await this.passwordService.hash(
      createUserDto.password,
    );
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.usersRepository.save(user);
  }
  public async findOne(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }
}
