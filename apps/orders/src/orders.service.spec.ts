import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { HttpService } from '@nestjs/axios';
import { getModelToken } from '@nestjs/mongoose';
import { of } from 'rxjs';
import { Order } from './schemas/order.schema';
import { OrdersRabbitService } from './rmq/rabbitmq.service';

describe('OrdersService (stock checks)', () => {
  let service: OrdersService;

  const mockModelCtor = jest.fn().mockImplementation((dto) => ({
    save: jest.fn().mockResolvedValue({ _id: 'MOCK_ID', ...dto }),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: mockModelCtor },
        { provide: HttpService, useValue: { get: jest.fn() } },
        { provide: OrdersRabbitService, useValue: { publish: jest.fn() } },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('accepts order when products have sufficient stock', async () => {
    const dto = { customerId: 'c1', items: [{ productId: 'p_good', quantity: 1, price: 10 }], totalPrice: 10 } as any;
    const http = service['httpService'] as any;
    http.get.mockReturnValue(of({ data: { _id: 'p_good', stock: 5 } }));
    http.put = jest.fn().mockReturnValue(of({ data: { _id: 'p_good', stock: 4 } }));

    const res = await service.create(dto);
    // should return saved order directly when accepted
    expect(res).toHaveProperty('_id', 'MOCK_ID');
    expect((res as any).status).toBe('ACCEPTED');
    // ensure we attempted to update product stock
    expect(http.put).toHaveBeenCalledWith(expect.stringContaining('/products/p_good'), { stock: 4 });
    // ensure we published an ORDER_CREATED event
    const rmq = service['rmqService'] as any;
    expect(rmq.publish).toHaveBeenCalledWith('ORDER_CREATED', expect.any(Object));
  });

  it('rejects order when any product stock insufficient', async () => {
    const dto = { customerId: 'c2', items: [{ productId: 'p_bad', quantity: 5, price: 2 }], totalPrice: 10 } as any;
    const http = service['httpService'] as any;
    // product has stock 2 which is less than requested 5
    http.get.mockReturnValue(of({ data: { _id: 'p_bad', stock: 2 } }));
    http.put = jest.fn();

    const res = await service.create(dto);
    expect(res).toHaveProperty('order');
    expect((res as any).order.status).toBe('REJECTED');
    expect((res as any).rejectedItems).toBeDefined();
    expect((res as any).rejectedItems[0].productId).toBe('p_bad');
    // ensure we did not call PUT when insufficient stock
    expect(http.put).not.toHaveBeenCalled();
    const rmq = service['rmqService'] as any;
    expect(rmq.publish).toHaveBeenCalledWith('ORDER_REJECTED', expect.any(Object));
  });

  it('handles partial failure when PUT fails after check', async () => {
    const dto = { customerId: 'c3', items: [{ productId: 'p_err', quantity: 1, price: 10 }], totalPrice: 10 } as any;
    const http = service['httpService'] as any;
    // GET shows enough stock
    http.get.mockReturnValue(of({ data: { _id: 'p_err', stock: 3 } }));
    // but PUT fails
    http.put = jest.fn().mockImplementation(() => { throw new Error('update failed'); });

    const res = await service.create(dto);
    expect(res).toHaveProperty('order');
    expect((res as any).order.status).toBe('REJECTED');
    expect((res as any).rejectedItems[0].productId).toBe('p_err');
    const rmq = service['rmqService'] as any;
    expect(rmq.publish).toHaveBeenCalledWith('ORDER_REJECTED', expect.any(Object));
  });
});
