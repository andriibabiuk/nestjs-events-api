import { Server } from 'http';
import { TaskStatus } from 'src/tasks/task.model';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestSetup } from './utils/test-setup';

describe('Tasks (e2e)', () => {
  let testSetup: TestSetup;
  let authToken: string;
  let taskId: string;
  const testUser = {
    email: 'test@example.com',
    name: 'test',
    password: 'test1234A$',
  };
  beforeEach(async () => {
    testSetup = await TestSetup.create(AppModule);
    await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/register')
      .send(testUser);
    const loginResponse = await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    authToken = (loginResponse.body as { accessToken: string }).accessToken;
    const response = await request(testSetup.app.getHttpServer() as Server)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.OPEN,
        labels: [{ name: 'test' }],
      });
    taskId = (response.body as { id: string }).id;
  });
  afterEach(async () => {
    await testSetup?.cleanup();
  });
  afterAll(async () => {
    await testSetup?.teardown();
  });
  it('should not allow access to other users tasks', async () => {
    const otherUser = {
      ...testUser,
      email: 'other@example.com',
    };
    await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/register')
      .send(otherUser);
    const loginResponse = await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: otherUser.email, password: otherUser.password });
    const otherToken = (loginResponse.body as { accessToken: string })
      .accessToken;
    await request(testSetup.app.getHttpServer() as Server)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403);
  });
  it('should list users tasks only', async () => {
    await request(testSetup.app.getHttpServer() as Server)
      .get(`/tasks`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as { meta: { total: number }; data: unknown[] };
        expect(body.meta.total).toBe(1);
      });
    const otherUser = {
      ...testUser,
      email: 'other@example.com',
    };
    await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/register')
      .send(otherUser);
    const loginResponse = await request(testSetup.app.getHttpServer() as Server)
      .post('/auth/login')
      .send({ email: otherUser.email, password: otherUser.password });
    const otherToken = (loginResponse.body as { accessToken: string })
      .accessToken;
    await request(testSetup.app.getHttpServer() as Server)
      .get(`/tasks`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as { meta: { total: number }; data: unknown[] };
        expect(body.meta.total).toBe(0);
      });
  });

  it('should allow filtering tasks by status', async () => {
    await request(testSetup.app.getHttpServer() as Server)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'In Progress Task',
        description: 'Test Description',
        status: TaskStatus.IN_PROGRESS,
      });

    await request(testSetup.app.getHttpServer() as Server)
      .get(`/tasks?status=${TaskStatus.IN_PROGRESS}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          meta: { total: number };
          data: { status: string }[];
        };
        expect(body.meta.total).toBe(1);
        expect(body.data[0].status).toBe(TaskStatus.IN_PROGRESS);
      });
  });

  it('should update a task', async () => {
    await request(testSetup.app.getHttpServer() as Server)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: TaskStatus.IN_PROGRESS,
      })
      .expect(200)
      .expect((res) => {
        const body = res.body as { status: string };
        expect(body.status).toBe(TaskStatus.IN_PROGRESS);
      });
  });

  it('should fail to update a task with invalid status transition', async () => {
    await request(testSetup.app.getHttpServer() as Server)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: TaskStatus.DONE,
      })
      .expect(200);

    await request(testSetup.app.getHttpServer() as Server)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: TaskStatus.OPEN,
      })
      .expect(400);
  });

  it('should add and remove labels', async () => {
    await request(testSetup.app.getHttpServer() as Server)
      .post(`/tasks/${taskId}/labels`)
      .set('Authorization', `Bearer ${authToken}`)
      .send([{ name: 'new-label' }])
      .expect(201)
      .expect((res) => {
        const body = res.body as { labels: { name: string }[] };
        expect(body.labels.map((l) => l.name)).toContain('new-label');
      });

    await request(testSetup.app.getHttpServer() as Server)
      .delete(`/tasks/${taskId}/labels`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(['new-label'])
      .expect(204);

    await request(testSetup.app.getHttpServer() as Server)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as { labels: { name: string }[] };
        expect(body.labels.map((l) => l.name)).not.toContain('new-label');
      });
  });

  it('should delete a task', async () => {
    await request(testSetup.app.getHttpServer() as Server)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    await request(testSetup.app.getHttpServer() as Server)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});
