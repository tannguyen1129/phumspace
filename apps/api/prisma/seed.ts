import { PrismaClient, EntityType, AccessLevel, PublicationStatus, NameType, LanguageCode, SourceType, SupportType, VerificationOutcome, PublicationEventType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PhumData Core Sprint 1 Seed...');

  // 1. Seed Categories
  const catKienTruc = await prisma.heritageCategory.upsert({
    where: { slug: 'kien-truc-ton-giao' },
    update: {},
    create: {
      slug: 'kien-truc-ton-giao',
      name: 'Kiến trúc Tôn giáo',
      description: 'Các công trình kiến trúc chùa chiền, tháp và đền đài Khmer [DEMO DATA]',
    },
  });

  const catLeHoi = await prisma.heritageCategory.upsert({
    where: { slug: 'le-hoi-truyen-thong' },
    update: {},
    create: {
      slug: 'le-hoi-truyen-thong',
      name: 'Lễ hội Truyền thống',
      description: 'Các lễ hội văn hóa dân gian Khmer Nam Bộ [DEMO DATA]',
    },
  });

  console.log('✅ Categories seeded');

  // 2. Seed Places
  const placeWard8 = await prisma.place.upsert({
    where: { slug: 'phuong-8-tp-tra-vinh' },
    update: {},
    create: {
      slug: 'phuong-8-tp-tra-vinh',
      name: 'Phường 8, TP. Trà Vinh',
      address: 'Phường 8, Thành phố Trà Vinh, Tỉnh Trà Vinh',
      latitude: 9.9325,
      longitude: 106.3458,
      summary: 'Khu vực tập trung nhiều di tích chùa cổ kính [DEMO DATA]',
    },
  });

  const placeCauKe = await prisma.place.upsert({
    where: { slug: 'huyen-cau-ke-tra-vinh' },
    update: {},
    create: {
      slug: 'huyen-cau-ke-tra-vinh',
      name: 'Huyện Cầu Kè, Trà Vinh',
      address: 'Huyện Cầu Kè, Tỉnh Trà Vinh',
      latitude: 9.8912,
      longitude: 106.1843,
      summary: 'Địa bàn có truyền thống văn hóa dân gian phong phú [DEMO DATA]',
    },
  });

  console.log('✅ Places seeded');

  // 3. Seed SourceResources
  const sourceDiaChi = await prisma.sourceResource.upsert({
    where: { id: '11111111-1111-1111-1111-111111111111' },
    update: {},
    create: {
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Địa chí Trà Vinh — Phần Văn hóa Dân gian',
      creator: 'Ủy ban Nhân dân tỉnh Trà Vinh',
      sourceType: SourceType.BOOK,
      locator: 'NXB Chính trị Quốc gia, 2008, tr. 145-180',
      rights: 'PUBLIC_REFERENCE',
    },
  });

  const sourceHoSoDiSan = await prisma.sourceResource.upsert({
    where: { id: '22222222-2222-2222-2222-222222222222' },
    update: {},
    create: {
      id: '22222222-2222-2222-2222-222222222222',
      title: 'Hồ sơ di sản văn hóa phi vật thể Quốc gia Ok Om Bok',
      creator: 'Bộ Văn hóa, Thể thao và Du lịch',
      sourceType: SourceType.ARCHIVE,
      locator: 'Quyết định số 2684/QĐ-BVHTTDL',
      rights: 'PUBLIC_ARCHIVE',
    },
  });

  const sourceGhiChepDienDa = await prisma.sourceResource.upsert({
    where: { id: '33333333-3333-3333-3333-333333333333' },
    update: {},
    create: {
      id: '33333333-3333-3333-3333-333333333333',
      title: 'Ghi chép điền dã quy trình làm bánh tét Trà Cuôn',
      creator: 'Nhóm nghiên cứu văn hóa PhumSpace Demo',
      sourceType: SourceType.FIELD_NOTE,
      locator: 'Tư liệu điền dã tháng 05/2026',
      rights: 'DEMO_RESEARCH_ONLY',
    },
  });

  console.log('✅ Sources seeded');

  // 4. Seed Entity 1: Chùa Âng (chua-hang-tra-vinh)
  // Has 2 PUBLISHED versions: v1 (SUPERSEDED) and v2 (PUBLISHED & CURRENT)
  let entityAng = await prisma.heritageEntity.findUnique({
    where: { canonicalCode: 'chua-hang-tra-vinh' },
  });

  if (!entityAng) {
    entityAng = await prisma.heritageEntity.create({
      data: {
        canonicalCode: 'chua-hang-tra-vinh',
        type: EntityType.ARCHITECTURE,
        accessLevel: AccessLevel.PUBLIC,
        categories: {
          create: [{ categoryId: catKienTruc.id }],
        },
        places: {
          create: [{ placeId: placeWard8.id }],
        },
      },
    });

    // Create Version 1 (SUPERSEDED)
    const v1 = await prisma.heritageEntityVersion.create({
      data: {
        entityId: entityAng.id,
        versionNo: 1,
        publicationStatus: PublicationStatus.SUPERSEDED,
        summary: 'Chùa Âng (Wat Kompong Chray) - Phiên bản thử nghiệm 1 [DEMO DATA]',
        historicalContent: 'Ngôi chùa có lịch sử hình thành lâu đời tại Trà Vinh.',
        culturalMeaning: 'Trung tâm sinh hoạt văn hóa tín ngưỡng Khmer.',
        names: {
          create: [
            {
              language: LanguageCode.vi,
              nameType: NameType.PREFERRED,
              originalValue: 'Chùa Âng',
              normalizedValue: 'chua ang',
              script: 'Latn',
            },
          ],
        },
      },
    });

    // Create Version 2 (PUBLISHED)
    const v2 = await prisma.heritageEntityVersion.create({
      data: {
        entityId: entityAng.id,
        versionNo: 2,
        publicationStatus: PublicationStatus.PUBLISHED,
        summary: 'Chùa Âng (Wat Kompong Chray) là ngôi chùa Khmer cổ kính bậc nhất tại Trà Vinh, tọa lạc trong khuôn viên danh thắng Ao Bà Om [DEMO SPRINT 1 DATA].',
        historicalContent: 'Theo truyền thuyết dân gian, chùa được khởi dựng từ nhiều thế kỷ trước và qua nhiều lần trùng tu bảo tồn.',
        culturalMeaning: 'Nơi diễn ra các nghi lễ văn hóa truyền thống như Chol Chnam Thmay, Sen Dolta và Ok Om Bok.',
        names: {
          create: [
            {
              language: LanguageCode.vi,
              nameType: NameType.PREFERRED,
              originalValue: 'Chùa Âng',
              normalizedValue: 'chua ang',
              script: 'Latn',
            },
            {
              language: LanguageCode.km,
              nameType: NameType.PREFERRED,
              originalValue: 'វត្តកំពង់ជ្រៃ',
              normalizedValue: 'wat kompong chray',
              script: 'Khmr',
            },
            {
              language: LanguageCode.en,
              nameType: NameType.TRANSLITERATION,
              originalValue: 'Wat Kompong Chray',
              normalizedValue: 'wat kompong chray',
              script: 'Latn',
            },
          ],
        },
        evidenceAssertions: {
          create: [
            {
              sourceId: sourceDiaChi.id,
              claimText: 'Chùa Âng tọa lạc tại Phường 8, TP. Trà Vinh kề bên danh thắng Ao Bà Om.',
              fieldPath: 'summary',
              supportType: SupportType.SUPPORTS,
            },
          ],
        },
        verificationRecords: {
          create: [
            {
              reviewerName: 'Chuyên gia văn hóa Khmer (Kiểm thử)',
              scope: 'Kiến trúc & Tên gọi',
              method: 'Đối chiếu Địa chí Trà Vinh 2008',
              outcome: VerificationOutcome.SOURCE_VERIFIED,
            },
          ],
        },
      },
    });

    // Set current version & log publication event
    await prisma.heritageEntity.update({
      where: { id: entityAng.id },
      data: { currentVersionId: v2.id },
    });

    await prisma.publicationEvent.create({
      data: {
        entityId: entityAng.id,
        versionId: v2.id,
        publisherName: 'System Admin (Sprint 1 Seed)',
        eventType: PublicationEventType.PUBLISH,
      },
    });
  }

  // 5. Seed Entity 2: Lễ hội Ok Om Bok (le-hoi-ok-om-bok)
  // Has 1 PUBLISHED version, linked to multiple places (Phường 8 & Cầu Kè) and multiple categories (Lễ hội & Kiến trúc/Văn hóa)
  let entityOkOmBok = await prisma.heritageEntity.findUnique({
    where: { canonicalCode: 'le-hoi-ok-om-bok' },
  });

  if (!entityOkOmBok) {
    entityOkOmBok = await prisma.heritageEntity.create({
      data: {
        canonicalCode: 'le-hoi-ok-om-bok',
        type: EntityType.FESTIVAL,
        accessLevel: AccessLevel.PUBLIC,
        categories: {
          create: [
            { categoryId: catLeHoi.id },
            { categoryId: catKienTruc.id },
          ],
        },
        places: {
          create: [
            { placeId: placeWard8.id },
            { placeId: placeCauKe.id },
          ],
        },
      },
    });

    const vOkOmBok = await prisma.heritageEntityVersion.create({
      data: {
        entityId: entityOkOmBok.id,
        versionNo: 1,
        publicationStatus: PublicationStatus.PUBLISHED,
        summary: 'Lễ hội Ok Om Bok (Lễ Cúng Trăng) là Di sản văn hóa phi vật thể quốc gia của đồng bào Khmer Nam Bộ [DEMO SPRINT 1 DATA].',
        historicalContent: 'Được tổ chức vào rằm tháng 10 âm lịch hàng năm để tạ ơn thần Mặt Trăng.',
        culturalMeaning: 'Thể hiện lòng biết ơn với thiên nhiên, sông nước và nguyện cầu mùa màng bội thu.',
        names: {
          create: [
            {
              language: LanguageCode.vi,
              nameType: NameType.PREFERRED,
              originalValue: 'Lễ hội Ok Om Bok',
              normalizedValue: 'le hoi ok om bok',
              script: 'Latn',
            },
            {
              language: LanguageCode.km,
              nameType: NameType.PREFERRED,
              originalValue: 'ពិធីបុណ្យអកអំបុក',
              normalizedValue: 'pithibun ok om bok',
              script: 'Khmr',
            },
            {
              language: LanguageCode.vi,
              nameType: NameType.ALTERNATE,
              originalValue: 'Lễ Cúng Trăng',
              normalizedValue: 'le cung trang',
              script: 'Latn',
            },
          ],
        },
        evidenceAssertions: {
          create: [
            {
              sourceId: sourceHoSoDiSan.id,
              claimText: 'Lễ hội Ok Om Bok được công nhận là Di sản văn hóa phi vật thể quốc gia.',
              fieldPath: 'summary',
              supportType: SupportType.SUPPORTS,
            },
          ],
        },
        verificationRecords: {
          create: [
            {
              reviewerName: 'Hội đồng Kiểm duyệt Di sản PhumSpace Demo',
              scope: 'Nghi lễ & Hồ sơ văn hóa',
              method: 'Đối chiếu Quyết định BVHTTDL',
              outcome: VerificationOutcome.EXPERT_REVIEWED,
            },
          ],
        },
      },
    });

    await prisma.heritageEntity.update({
      where: { id: entityOkOmBok.id },
      data: { currentVersionId: vOkOmBok.id },
    });

    await prisma.publicationEvent.create({
      data: {
        entityId: entityOkOmBok.id,
        versionId: vOkOmBok.id,
        publisherName: 'System Admin (Sprint 1 Seed)',
        eventType: PublicationEventType.PUBLISH,
      },
    });
  }

  // 6. Seed Entity 3: Bánh tét Trà Cuôn (banh-tet-tra-cuon)
  // Has ONLY 1 DRAFT version (no currentVersionId, publicationStatus = DRAFT)
  let entityBanhTet = await prisma.heritageEntity.findUnique({
    where: { canonicalCode: 'banh-tet-tra-cuon' },
  });

  if (!entityBanhTet) {
    entityBanhTet = await prisma.heritageEntity.create({
      data: {
        canonicalCode: 'banh-tet-tra-cuon',
        type: EntityType.CRAFT,
        accessLevel: AccessLevel.PUBLIC,
        places: {
          create: [{ placeId: placeCauKe.id }],
        },
      },
    });

    await prisma.heritageEntityVersion.create({
      data: {
        entityId: entityBanhTet.id,
        versionNo: 1,
        publicationStatus: PublicationStatus.DRAFT,
        summary: 'Bánh tét Trà Cuôn — Bản thảo nội dung đang biên tập và chưa kiểm duyệt [DEMO DRAFT DATA].',
        historicalContent: 'Đang sưu tầm tài liệu nguồn...',
        culturalMeaning: 'Đang tổng hợp ý kiến nghệ nhân...',
        names: {
          create: [
            {
              language: LanguageCode.vi,
              nameType: NameType.PREFERRED,
              originalValue: 'Bánh tét Trà Cuôn',
              normalizedValue: 'banh tet tra cuon',
              script: 'Latn',
            },
          ],
        },
        evidenceAssertions: {
          create: [
            {
              sourceId: sourceGhiChepDienDa.id,
              claimText: 'Tư liệu điền dã sơ bộ quy trình gói bánh tét Trà Cuôn.',
              fieldPath: 'summary',
              supportType: SupportType.CONTEXTUALIZES,
            },
          ],
        },
      },
    });
  }

  console.log('✅ 3 Entities seeded (2 PUBLISHED, 1 DRAFT)');
  console.log('🎉 Seed PhumData Core Sprint 1 finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
