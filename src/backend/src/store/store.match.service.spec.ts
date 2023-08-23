import { Test, TestingModule } from '@nestjs/testing';
import { GameMatchStoreService } from './store.match.service';

describe('GameMatchStoreService', () => {
  let service: GameMatchStoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameMatchStoreService],
    }).compile();

    service = module.get<GameMatchStoreService>(GameMatchStoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
