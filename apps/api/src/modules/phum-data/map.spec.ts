import { Test, TestingModule } from '@nestjs/testing';
import { PlaceType } from '@prisma/client';
import { MapService } from './services/map.service';
import { MapRepository } from './repositories/map.repository';

describe('Map API (Sprint 3 Tests)', () => {
  let service: MapService;
  let repository: MapRepository;

  const mockValidPlace = {
    id: 'place-1',
    slug: 'phuong-8-tp-tra-vinh',
    name: 'Phường 8, TP. Trà Vinh',
    address: 'Phường 8, TP. Trà Vinh',
    latitude: 9.932467,
    longitude: 106.345759,
    placeType: PlaceType.TEMPLE,
    summary: 'Mô tả địa điểm Chùa Âng',
    mapVisibility: true,
    entities: [{ id: 'link-1' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapService,
        {
          provide: MapRepository,
          useValue: {
            findMapPlaces: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MapService>(MapService);
    repository = module.get<MapRepository>(MapRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMapPlaces', () => {
    it('1. should return valid map markers with relatedHeritageCount', async () => {
      jest.spyOn(repository, 'findMapPlaces').mockResolvedValue([mockValidPlace as any]);

      const result = await service.getMapPlaces();

      expect(result.data).toHaveLength(1);
      const marker = result.data[0];
      expect(marker.id).toBe('place-1');
      expect(marker.slug).toBe('phuong-8-tp-tra-vinh');
      expect(marker.latitude).toBe(9.932467);
      expect(marker.longitude).toBe(106.345759);
      expect(marker.placeType).toBe('TEMPLE');
      expect(marker.relatedHeritageCount).toBe(1);
    });

    it('2. should pass valid placeType to repository when queried', async () => {
      jest.spyOn(repository, 'findMapPlaces').mockResolvedValue([mockValidPlace as any]);

      await service.getMapPlaces('TEMPLE');

      expect(repository.findMapPlaces).toHaveBeenCalledWith({ placeType: PlaceType.TEMPLE });
    });

    it('3. should handle invalid placeType query gracefully by passing undefined', async () => {
      jest.spyOn(repository, 'findMapPlaces').mockResolvedValue([]);

      await service.getMapPlaces('INVALID_TYPE');

      expect(repository.findMapPlaces).toHaveBeenCalledWith({ placeType: undefined });
    });
  });
});
