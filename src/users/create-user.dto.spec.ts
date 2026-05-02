import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  let dto = new CreateUserDto();
  beforeEach(() => {
    dto = new CreateUserDto();
    dto.email = 'test@test.com';
    dto.name = 'test';
    dto.password = 'test1234A$';
  });
  it('should validate complete valid data', async () => {
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
  it('should fail on invalid email', async () => {
    dto.email = 'test';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });
  it('should fail on empty name', async () => {
    dto.name = '';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
  it('should fail on short password', async () => {
    dto.password = 'test';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });
  const testPassword = async (
    password: string,
    message: string,
  ): Promise<void> => {
    dto.password = password;
    const errors = await validate(dto);
    const passwordError = errors.find((error) => error.property === 'password');
    expect(passwordError).not.toBeUndefined();
    const messages = Object.values(passwordError?.constraints ?? {});
    expect(messages).toContain(message);
  };
  it('should fail without 1 uppercase letter in password', async () => {
    await testPassword(
      'test1234a$',
      'Password must contain at least 1 uppercase letter',
    );
  });
  it('should fail without at least 1 number in password', async () => {
    await testPassword('testA$', 'Password must contain at least 1 number');
  });
  it('should fail without at least 1 special character in password', async () => {
    await testPassword(
      'testA323',
      'Password must contain at least 1 special character',
    );
  });
});
