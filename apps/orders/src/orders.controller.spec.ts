import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let ordersController: OrdersController;

  const sampleOrder = { customerId: 'c1', items: [{ productId: 'p1', quantity: 2, price: 5 }], totalPrice: 10 } as any;

  beforeEach(async () => {
    const ordersServiceMock = {
      create: jest.fn().mockImplementation((dto) => Promise.resolve({ _id: '1', ...dto })),
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(sampleOrder),
      update: jest.fn().mockImplementation((id, dto) => Promise.resolve({ _id: id, ...dto })),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: ordersServiceMock }],
    }).compile();

    ordersController = app.get<OrdersController>(OrdersController);
  });

  describe('controller', () => {
    it('create should return created order', async () => {
      const dto = { customerId: 'c1', items: [{ productId: 'p1', quantity: 2, price: 5 }], totalPrice: 10 } as any;
      await expect(ordersController.create(dto)).resolves.toMatchObject(dto);
    });

    it('findAll should return array', async () => {
      await expect(ordersController.findAll()).resolves.toEqual([]);
    });

    it('findOne should return an order', async () => {
      await expect(ordersController.findOne('1')).resolves.toEqual(sampleOrder);
    });

    it('update should return updated order', async () => {
      const updates = { status: 'confirmed' } as any;
      await expect(ordersController.update('1', updates)).resolves.toMatchObject({ _id: '1', ...updates });
    });

    it('remove should return success', async () => {
      await expect(ordersController.remove('1')).resolves.toEqual({ success: true });
    });
  });
});
