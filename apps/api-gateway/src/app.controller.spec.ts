import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const httpMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: HttpService, useValue: httpMock }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('proxy', () => {
    it('forwards GET /api/products to products service', async () => {
      const http = (appController as any).http as any;
      http.get.mockReturnValue(of({ data: [{ name: 'p1' }] }));

      await expect(appController.getProducts()).resolves.toEqual([{ name: 'p1' }]);
      expect(http.get).toHaveBeenCalledWith(expect.stringContaining('/products'));
    });

    it('forwards POST /api/products to products service', async () => {
      const http = (appController as any).http as any;
      const body = { name: 'new' };
      http.post.mockReturnValue(of({ data: { _id: '1', ...body } }));

      await expect(appController.createProduct(body)).resolves.toMatchObject(body);
      expect(http.post).toHaveBeenCalledWith(expect.stringContaining('/products'), body);
    });

    it('forwards POST /api/orders to orders service', async () => {
      const http = (appController as any).http as any;
      const body = { customerId: 'c1' };
      http.post.mockReturnValue(of({ data: { _id: 'o1', ...body } }));

      await expect(appController.createOrder(body)).resolves.toMatchObject(body);
      expect(http.post).toHaveBeenCalledWith(expect.stringContaining('/orders'), body);
    });
  });
});
