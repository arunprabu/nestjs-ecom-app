import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let productsController: ProductsController;

  const mockProduct = { name: 'p', description: 'd', price: 9.99 } as any;

  beforeEach(async () => {
    const productsServiceMock = {
      findAll: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((dto) => Promise.resolve({ _id: '1', ...dto })),
      findOne: jest.fn().mockResolvedValue(mockProduct),
      update: jest.fn().mockImplementation((id, dto) => Promise.resolve({ _id: id, ...dto })),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: productsServiceMock },
      ],
    }).compile();

    productsController = app.get<ProductsController>(ProductsController);
  });

  describe('controller', () => {
    it('getAll should return an array', async () => {
      await expect(productsController.getAll()).resolves.toEqual([]);
    });

    it('create should return created product', async () => {
      const dto = { name: 'a', description: 'b', price: 1 };
      await expect(productsController.create(dto as any)).resolves.toMatchObject(dto);
    });

    it('getProductById should return a product', async () => {
      await expect(productsController.getProductById('1')).resolves.toEqual(mockProduct);
    });

    it('update should return updated product', async () => {
      const updates = { name: 'updated', price: 3.5 } as any;
      await expect(productsController.update('1', updates)).resolves.toMatchObject({ _id: '1', ...updates });
    });

    it('remove should return success object', async () => {
      await expect(productsController.remove('1')).resolves.toEqual({ success: true });
    });
  });
});
