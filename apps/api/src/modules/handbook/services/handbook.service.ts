import { Injectable, NotFoundException } from '@nestjs/common';
import { HandbookRepository } from '../repositories/handbook.repository';
import { HandbookSearchService } from './handbook-search.service';
import { PronunciationAccessPolicy } from './pronunciation-access.policy';
import { HandbookMapper } from '../mappers/handbook.mapper';
import {
  KhmerTermSummaryContract,
  KhmerTermDetailContract,
  HandbookTopicContract,
  HandbookCollectionSummaryContract,
  HandbookCollectionDetailContract,
} from '@phumspace/contracts';

@Injectable()
export class HandbookService {
  constructor(
    private readonly handbookRepo: HandbookRepository,
    private readonly searchService: HandbookSearchService,
    private readonly accessPolicy: PronunciationAccessPolicy,
  ) {}

  async getPublishedTerms(params: {
    q?: string;
    topicSlug?: string;
    collectionSlug?: string;
    partOfSpeech?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: KhmerTermSummaryContract[]; total: number }> {
    const normalizedQ = params.q ? this.searchService.normalizeText(params.q) : undefined;

    const { data, total } = await this.handbookRepo.findPublishedTerms({
      ...params,
      normalizedQ,
    });

    const dtos = data.map((item) => HandbookMapper.toTermSummaryDto(item));
    return { data: dtos, total };
  }

  async getPublishedTermBySlug(slug: string): Promise<KhmerTermDetailContract> {
    const term = await this.handbookRepo.findPublishedTermBySlug(slug);
    if (!term) {
      throw new NotFoundException({
        errorCode: 'HANDBOOK_TERM_NOT_FOUND',
        message: `Không tìm thấy từ vựng Sổ tay Khmer với mã slug "${slug}".`,
      });
    }

    return HandbookMapper.toTermDetailDto(term);
  }

  async getPublishedTopics(): Promise<HandbookTopicContract[]> {
    const topics = await this.handbookRepo.findPublishedTopics();
    return topics.map((t) => HandbookMapper.toTopicContract(t));
  }

  async getTermsByTopicSlug(slug: string): Promise<{ topic: HandbookTopicContract; terms: KhmerTermSummaryContract[] }> {
    const topic = await this.handbookRepo.findPublishedTopicBySlug(slug);
    if (!topic) {
      throw new NotFoundException({
        errorCode: 'HANDBOOK_TOPIC_NOT_FOUND',
        message: `Không tìm thấy chủ đề Sổ tay với mã slug "${slug}".`,
      });
    }

    const terms = (topic.terms || []).map((t: any) => HandbookMapper.toTermSummaryDto(t.term));
    return {
      topic: HandbookMapper.toTopicContract(topic),
      terms,
    };
  }

  async getPublishedCollections(): Promise<HandbookCollectionSummaryContract[]> {
    const collections = await this.handbookRepo.findPublishedCollections();
    return collections.map((c) => HandbookMapper.toCollectionSummaryContract(c));
  }

  async getCollectionDetailBySlug(slug: string): Promise<HandbookCollectionDetailContract> {
    const collection = await this.handbookRepo.findPublishedCollectionBySlug(slug);
    if (!collection) {
      throw new NotFoundException({
        errorCode: 'HANDBOOK_COLLECTION_NOT_FOUND',
        message: `Không tìm thấy bộ sưu tập Sổ tay với mã slug "${slug}".`,
      });
    }

    return HandbookMapper.toCollectionDetailContract(collection);
  }

  async getPronunciationForStream(pronunciationId: string): Promise<any> {
    const pronunciation = await this.handbookRepo.findPronunciationById(pronunciationId);
    this.accessPolicy.validatePublicStreamAccess(pronunciation);
    return pronunciation;
  }
}
