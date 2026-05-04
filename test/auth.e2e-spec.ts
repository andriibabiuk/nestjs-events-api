import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Server } from 'http';
import { PasswordService } from 'src/users/password/password.service';
import { Role } from 'src/users/role.enum';
import { User } from 'src/users/user.entity';
import request from 'supertest';
import { Repository } from 'typeorm';
import { AppModule } from './../src/app.module';
import { TestSetup } from './utils/test-setup';

describe('Authentication & Authorization (e2e)', () => {
  let testSetup: TestSetup;
  beforeEach(async () => {
    testSetup = await TestSetup.create(AppModule);
  });
  afterEach(async () => {
    await testSetup?.cleanup();
  });
  afterAll(async () => {
    await testSetup?.teardown();
  });
  const testUser = {
    email: 'test@example.com',
    name: 'test',
    password: 'test1234A$',
  };
  it('should require auth', () => {
    return request(testSetup.app.getHttpServer() as Server)
      .get('/tasks')
      .expect(401);
  });
  it('should allow public route access', async () => {
    await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/register')
      .send(testUser)
      .expect(201);
    await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201);
  });
  it('/auth/register (POST)', () => {
    return request(testSetup.app.getHttpServer() as Server)
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        const body = res.body as { email: string; name: string };
        expect(body.email).toBe(testUser.email);
        expect(body.name).toBe(testUser.name);
        expect(body).not.toHaveProperty('password');
      });
  });
  it('should include roles in JWT token', async () => {
    const userRepo = testSetup.app.get<Repository<User>>(
      getRepositoryToken(User),
    );
    await userRepo.save({
      ...testUser,
      roles: [Role.ADMIN],
      password: await testSetup.app
        .get(PasswordService)
        .hash(testUser.password),
    });
    const response = await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    const body = response.body as { accessToken: string };
    const decoded = testSetup.app.get(JwtService).verify<{
      roles: Role[];
    }>(body.accessToken);
    expect(decoded.roles).toBeDefined();
    expect(decoded.roles).toContain(Role.ADMIN);
  });
  it('/auth/register (POST) - duplicate email', async () => {
    await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/register')
      .send(testUser);
    return await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/register')
      .send(testUser)
      .expect(409);
  });
  it('/auth/login (POST)', async () => {
    await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/register')
      .send(testUser);
    const response = await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(response.status).toBe(201);
    const body = response.body as { accessToken: string };
    expect(body.accessToken).toBeDefined();
  });
  it('/auth/profile (POST)', async () => {
    await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/register')
      .send(testUser);
    const response = await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    const token = (response.body as { accessToken: string }).accessToken;
    return await request(testSetup.app.getHttpServer() as Server)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as { email: string; name: string };
        expect(body.email).toBe(testUser.email);
        expect(body.name).toBe(testUser.name);
        expect(body).not.toHaveProperty('password');
      });
  });
  it('/auth/profile (POST) - failed incorrect token', async () => {
    await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/register')
      .send(testUser);
    await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    return await request(testSetup.app.getHttpServer() as Server)
      .get('/auth/profile')
      .set('Authorization', `Bearer invalid_token`)
      .expect(401);
  });
  it('/auth/admin (GET) - admin access', async () => {
    const userRepo = testSetup.app.get<Repository<User>>(
      getRepositoryToken(User),
    );
    await userRepo.save({
      ...testUser,
      roles: [Role.ADMIN],
      password: await testSetup.app
        .get(PasswordService)
        .hash(testUser.password),
    });
    const response = await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    const token = (response.body as { accessToken: string }).accessToken;
    return request(testSetup.app.getHttpServer() as Server)
      .get('/auth/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as { message: string };
        expect(body.message).toBe('This is for admins only');
      });
  });
  it('/auth/admin (GET) - regular user denied', async () => {
    await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/register')
      .send(testUser);
    const response = await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    const token = (response.body as { accessToken: string }).accessToken;
    return request(testSetup.app.getHttpServer() as Server)
      .get('/auth/admin')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
  it('/auth/register (POST) - attempting to register as an admin', async () => {
    const userAdmin = {
      ...testUser,
      roles: [Role.ADMIN],
    };
    await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/register')
      .send(userAdmin)
      .expect(201)
      .expect((res) => {
        const body = res.body as { email: string; name: string; roles: Role[] };
        expect(body.roles).toEqual([Role.USER]);
      });
  });
});
