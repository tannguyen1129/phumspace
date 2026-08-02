import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ScannerService } from './services/scanner.service';
import { ImageValidatorService } from './services/image-validator.service';
import { CandidateRetrievalService } from './services/candidate-retrieval.service';
import { DecisionEngineService } from './services/decision-engine.service';
import { MockAiProvider } from './providers/mock-ai.provider';
import { PrismaService } from '../../prisma/prisma.service';

describe('AI Cultural Scanner (Sprint 4A Tests)', () => {
  let scannerService: ScannerService;
  let imageValidator: ImageValidatorService;
  let candidateRetrieval: CandidateRetrievalService;
  let decisionEngine: DecisionEngineService;
  let mockAiProvider: MockAiProvider;

  const validJpegBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ]);

  const mockExpressFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'chua-ang.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: validJpegBuffer,
    size: validJpegBuffer.length,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };

  const mockCandidate = {
    entityId: '11111111-1111-1111-1111-111111111111',
    slug: 'chua-hang-tra-vinh',
    canonicalCode: 'chua-hang-tra-vinh',
    type: 'ARCHITECTURE',
    preferredViName: 'Chùa Âng',
    preferredKmName: 'វត្តកំពង់ជ្រៃ',
    summary: 'Chùa Âng là ngôi chùa cổ kính',
    culturalMeaning: 'Nơi diễn ra lễ hội',
    categories: ['Kiến trúc Tôn giáo'],
    places: ['Phường 8, TP. Trà Vinh'],
    sources: [
      { id: 'src-1', title: 'Địa chí Trà Vinh', creator: 'UBND tỉnh Trà Vinh' },
    ],
  };

  beforeEach(async () => {
    mockAiProvider = new MockAiProvider();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScannerService,
        ImageValidatorService,
        DecisionEngineService,
        {
          provide: CandidateRetrievalService,
          useValue: {
            findPublishedCandidates: jest.fn().mockResolvedValue([mockCandidate]),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            scanLog: {
              create: jest.fn().mockResolvedValue({ id: 'log-1' }),
            },
          },
        },
        {
          provide: 'AiProvider',
          useValue: mockAiProvider,
        },
      ],
    }).compile();

    scannerService = module.get<ScannerService>(ScannerService);
    imageValidator = module.get<ImageValidatorService>(ImageValidatorService);
    candidateRetrieval = module.get<CandidateRetrievalService>(CandidateRetrievalService);
    decisionEngine = module.get<DecisionEngineService>(DecisionEngineService);
  });

  it('1. ImageValidator should reject empty or undefined file', () => {
    expect(() => imageValidator.validateAndSanitize(undefined)).toThrow(BadRequestException);
    expect(() => imageValidator.validateAndSanitize({ buffer: Buffer.from([]) } as any)).toThrow(BadRequestException);
  });

  it('2. ImageValidator should reject oversized files (> 5MB)', () => {
    const hugeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    expect(() =>
      imageValidator.validateAndSanitize({
        buffer: hugeBuffer,
        mimetype: 'image/jpeg',
      } as any),
    ).toThrow(BadRequestException);
  });

  it('3. ImageValidator should reject invalid file signatures (.exe, .pdf)', () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 header');
    expect(() =>
      imageValidator.validateAndSanitize({
        buffer: pdfBuffer,
        mimetype: 'application/pdf',
      } as any),
    ).toThrow(BadRequestException);
  });

  it('4. Decision Engine should evaluate MATCH when candidates exist and evidence is strong', () => {
    const result = decisionEngine.evaluateDecision({
      observation: mockAiProvider.mockObservation,
      candidates: [mockCandidate],
      synthesis: {
        selectedCandidateId: mockCandidate.entityId,
        alternativeCandidateIds: [],
        explanationGrounded: 'Khớp với Chùa Âng',
        observedFeatureAgreement: ['khmer samneang roof', 'naga balustrade'],
        unsupportedClaimsAvoided: true,
      },
    });

    expect(result.decision).toBe('MATCH');
    expect(result.confidenceBand).toBe('HIGH');
    expect(result.matchedEntity?.entityId).toBe(mockCandidate.entityId);
  });

  it('5. Decision Engine should evaluate UNKNOWN when candidate list is empty', () => {
    const result = decisionEngine.evaluateDecision({
      observation: mockAiProvider.mockObservation,
      candidates: [],
      synthesis: {
        selectedCandidateId: null,
        alternativeCandidateIds: [],
        explanationGrounded: 'Không tìm thấy candidate',
        observedFeatureAgreement: [],
        unsupportedClaimsAvoided: true,
      },
    });

    expect(result.decision).toBe('UNKNOWN');
    expect(result.confidenceBand).toBe('NONE');
  });

  it('6. Decision Engine should evaluate HUMAN_REVIEW when ambiguity flags exist', () => {
    const ambiguousObservation = {
      ...mockAiProvider.mockObservation,
      ambiguityFlags: ['conflicting_sources'],
    };

    const result = decisionEngine.evaluateDecision({
      observation: ambiguousObservation,
      candidates: [mockCandidate],
      synthesis: {
        selectedCandidateId: mockCandidate.entityId,
        alternativeCandidateIds: [],
        explanationGrounded: 'Nội dung bất đồng',
        observedFeatureAgreement: ['roof'],
        unsupportedClaimsAvoided: true,
      },
    });

    expect(result.decision).toBe('HUMAN_REVIEW');
    expect(result.confidenceBand).toBe('LOW');
  });

  it('7. ScannerService processScan should complete pipeline without leaking API keys or raw images', async () => {
    const response = await scannerService.processScan(mockExpressFile);

    expect(response.status).toBe('SUCCESS');
    expect(response.scanId).toBeDefined();
    expect(response.observationSummary.objectTypes).toContain('temple');
    expect(response.sources).toHaveLength(1);
    expect(response.sources[0].title).toBe('Địa chí Trà Vinh');

    // Security assertions: ensure no sensitive keys exist in response
    const jsonString = JSON.stringify(response);
    expect(jsonString).not.toContain('GEMINI_API_KEY');
    expect(jsonString).not.toContain('base64');
    expect(jsonString).not.toContain('rawPrompt');
  });
});
