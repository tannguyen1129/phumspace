import {
  PrismaClient,
  EntityType,
  AccessLevel,
  PublicationStatus,
  NameType,
  LanguageCode,
  SourceType,
  PlaceType,
  QuizStatus,
  QuizDifficulty,
  QuestionType,
  AchievementStatus,
  VerificationOutcome,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PhumData Core Sprint 7A Seed...');

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
    update: {
      latitude: 9.932467,
      longitude: 106.345759,
      administrativeArea: 'Thành phố Trà Vinh',
      placeType: PlaceType.TEMPLE,
      mapVisibility: true,
      coordinateAccuracy: 'VERIFIED_EXACT',
    },
    create: {
      slug: 'phuong-8-tp-tra-vinh',
      name: 'Phường 8, TP. Trà Vinh',
      address: 'Phường 8, Thành phố Trà Vinh, Tỉnh Trà Vinh',
      administrativeArea: 'Thành phố Trà Vinh',
      placeType: PlaceType.TEMPLE,
      latitude: 9.932467,
      longitude: 106.345759,
      mapVisibility: true,
      coordinateAccuracy: 'VERIFIED_EXACT',
      summary: 'Khu vực danh thắng Ao Bà Om và Chùa Âng cổ kính [DEMO DATA]',
    },
  });

  const placeCauKe = await prisma.place.upsert({
    where: { slug: 'huyen-cau-ke-tra-vinh' },
    update: {
      latitude: 9.8912,
      longitude: 106.1843,
      administrativeArea: 'Huyện Cầu Kè',
      placeType: PlaceType.CULTURAL_SITE,
      mapVisibility: true,
      coordinateAccuracy: 'VERIFIED_EXACT',
    },
    create: {
      slug: 'huyen-cau-ke-tra-vinh',
      name: 'Huyện Cầu Kè, Trà Vinh',
      address: 'Huyện Cầu Kè, Tỉnh Trà Vinh',
      administrativeArea: 'Huyện Cầu Kè',
      placeType: PlaceType.CULTURAL_SITE,
      latitude: 9.8912,
      longitude: 106.1843,
      mapVisibility: true,
      coordinateAccuracy: 'VERIFIED_EXACT',
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

  console.log('✅ Sources seeded');

  // 4. Seed Heritage Entities (Chùa Âng & Ok Om Bok)
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

    const v2 = await prisma.heritageEntityVersion.create({
      data: {
        entityId: entityAng.id,
        versionNo: 2,
        publicationStatus: PublicationStatus.PUBLISHED,
        summary: 'Chùa Âng (Wat Kompong Chray) là ngôi chùa Khmer cổ kính bậc nhất tại Trà Vinh.',
        historicalContent: 'Theo truyền thuyết dân gian, chùa được khởi dựng từ nhiều thế kỷ trước.',
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
          ],
        },
      },
    });

    await prisma.heritageEntity.update({
      where: { id: entityAng.id },
      data: { currentVersionId: v2.id },
    });
  }

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
          create: [{ categoryId: catLeHoi.id }],
        },
        places: {
          create: [{ placeId: placeWard8.id }, { placeId: placeCauKe.id }],
        },
      },
    });

    const vOkOmBok = await prisma.heritageEntityVersion.create({
      data: {
        entityId: entityOkOmBok.id,
        versionNo: 1,
        publicationStatus: PublicationStatus.PUBLISHED,
        summary: 'Lễ hội Ok Om Bok (Lễ Cúng Trăng) là Di sản văn hóa phi vật thể quốc gia.',
        names: {
          create: [
            {
              language: LanguageCode.vi,
              nameType: NameType.PREFERRED,
              originalValue: 'Lễ hội Ok Om Bok',
              normalizedValue: 'le hoi ok om bok',
              script: 'Latn',
            },
          ],
        },
      },
    });

    await prisma.heritageEntity.update({
      where: { id: entityOkOmBok.id },
      data: { currentVersionId: vOkOmBok.id },
    });
  }

  console.log('✅ Heritage Entities seeded');

  // 5. Seed Handbook Topics & Collections (Sprint 7A)
  const topicKienTruc = await prisma.handbookTopic.upsert({
    where: { slug: 'kien-truc-chua' },
    update: {},
    create: {
      slug: 'kien-truc-chua',
      titleVi: 'Kiến trúc & Phật giáo Khmer',
      titleKm: 'ស្ថាបត្យកម្មវត្តអារាម',
      description: 'Các từ vựng về không gian tâm linh, chùa chiền và biểu tượng Phật giáo Khmer Nam Bộ [DEMO VERIFIED].',
      status: PublicationStatus.PUBLISHED,
      order: 1,
    },
  });

  const topicLeHoi = await prisma.handbookTopic.upsert({
    where: { slug: 'le-hoi-am-thuc' },
    update: {},
    create: {
      slug: 'le-hoi-am-thuc',
      titleVi: 'Lễ hội & Văn hóa Dân gian',
      titleKm: 'ពិធីបុណ្យនិងវប្បធម៌',
      description: 'Từ vựng nghi lễ, nghi thức cúng bái và các hoạt động văn hóa truyền thống [DEMO VERIFIED].',
      status: PublicationStatus.PUBLISHED,
      order: 2,
    },
  });

  const topicDoiSong = await prisma.handbookTopic.upsert({
    where: { slug: 'doi-song-hang-ngay' },
    update: {},
    create: {
      slug: 'doi-song-hang-ngay',
      titleVi: 'Đời sống & Sinh hoạt Hàng ngày',
      titleKm: 'ជីវភាពប្រចាំថ្ងៃ',
      description: 'Các danh từ, trang phục và đồ dùng sinh hoạt dân gian [DEMO VERIFIED].',
      status: PublicationStatus.PUBLISHED,
      order: 3,
    },
  });

  const colNhapMon = await prisma.handbookCollection.upsert({
    where: { slug: 'tu-vung-nhap-mon' },
    update: {},
    create: {
      slug: 'tu-vung-nhap-mon',
      title: 'Từ vựng Nhập môn Văn hóa Khmer',
      description: 'Bộ sưu tập từ vựng cơ bản nhập môn dành cho người mới tìm hiểu văn hóa Khmer [DEMO VERIFIED].',
      status: PublicationStatus.PUBLISHED,
      difficulty: QuizDifficulty.EASY,
      order: 1,
    },
  });

  console.log('✅ Handbook Topics & Collections seeded');

  // 6. Seed 15 Published Khmer Terms
  const demoTermsData = [
    {
      slug: 'wat-chua',
      scriptText: 'វត្ត',
      normalizedScriptText: 'វត្ត',
      transliteration: 'wat',
      partOfSpeech: 'Danh từ',
      shortDefinitionVi: 'Chùa, tu viện Phật giáo Khmer Nam Bộ',
      shortDefinitionEn: 'Khmer Buddhist temple or monastery',
      culturalNote: 'Chùa Khmer không chỉ là nơi thờ phụng mà còn là trung tâm sinh hoạt văn hóa và giáo dục cộng đồng.',
      topicId: topicKienTruc.id,
      collectionId: colNhapMon.id,
      heritageEntityId: entityAng.id,
      placeId: placeWard8.id,
    },
    {
      slug: 'ok-om-bok',
      scriptText: 'អកអំបុក',
      normalizedScriptText: 'អកអំបុក',
      transliteration: 'ok om bok',
      partOfSpeech: 'Danh từ / Lễ hội',
      shortDefinitionVi: 'Lễ Cúng Trăng và tục đút cốm dẹp',
      shortDefinitionEn: 'Moon worship festival and flattened rice eating ritual',
      culturalNote: 'Nghi thức diễn ra vào đêm Rằm tháng 10 âm lịch Khmer để tạ ơn Thần Trăng.',
      topicId: topicLeHoi.id,
      collectionId: colNhapMon.id,
      heritageEntityId: entityOkOmBok.id,
    },
    {
      slug: 'chha-yam',
      scriptText: 'ឆាយ៉ាំ',
      normalizedScriptText: 'ឆាយ៉ាំ',
      transliteration: 'chha yam',
      partOfSpeech: 'Danh từ',
      shortDefinitionVi: 'Điệu múa Chhay-dăm truyền thống',
      shortDefinitionEn: 'Traditional Chhay-dam drum dance',
      topicId: topicLeHoi.id,
    },
    {
      slug: 'sampot',
      scriptText: 'សំពត់',
      normalizedScriptText: 'សំពត់',
      transliteration: 'sampot',
      partOfSpeech: 'Danh từ',
      shortDefinitionVi: 'Trang phục váy quấn truyền thống Khmer',
      shortDefinitionEn: 'Traditional Khmer sarong garment',
      topicId: topicDoiSong.id,
    },
    {
      slug: 'kathina',
      scriptText: 'កថិន',
      normalizedScriptText: 'កថិន',
      transliteration: 'kathina',
      partOfSpeech: 'Danh từ',
      shortDefinitionVi: 'Lễ dâng y Kathina Phật giáo',
      shortDefinitionEn: 'Kathina robe offering ceremony',
      topicId: topicKienTruc.id,
    },
    {
      slug: 'gong-chieng',
      scriptText: 'គង',
      normalizedScriptText: 'គង',
      transliteration: 'gong',
      partOfSpeech: 'Danh từ',
      shortDefinitionVi: 'Nhạc cụ Cồng / Chiêng Khmer',
      shortDefinitionEn: 'Gong musical instrument',
      topicId: topicLeHoi.id,
    },
    {
      slug: 'pinpeat',
      scriptText: 'ពិណពាទ្យ',
      normalizedScriptText: 'ពិណពាទ្យ',
      transliteration: 'pinpeat',
      partOfSpeech: 'Danh từ',
      shortDefinitionVi: 'Dàn nhạc ngũ âm Pinpeat truyền thống',
      shortDefinitionEn: 'Traditional Pinpeat orchestra',
      topicId: topicLeHoi.id,
    },
    {
      slug: 'bay-ben',
      scriptText: 'បាយបិណ្ឌ',
      normalizedScriptText: 'បាយបិណ្ឌ',
      transliteration: 'bay ben',
      partOfSpeech: 'Danh từ',
      shortDefinitionVi: 'Nắm cơm cúng Bay Ben trong lễ Pchum Ben',
      shortDefinitionEn: 'Ben rice ball offering in Pchum Ben festival',
      topicId: topicLeHoi.id,
    },
    {
      slug: 'pchum-ben',
      scriptText: 'ភ្ជុំបិណ្ឌ',
      normalizedScriptText: 'ភ្ជុំបិណ្ឌ',
      transliteration: 'pchum ben',
      partOfSpeech: 'Lễ hội',
      shortDefinitionVi: 'Lễ Pchum Ben / Đôn-ta báo hiếu tổ tiên',
      shortDefinitionEn: 'Ancestors commemoration festival',
      topicId: topicLeHoi.id,
    },
    {
      slug: 'rom-vong',
      scriptText: 'រ៉ូមវង់',
      normalizedScriptText: 'រ៉ូមវង់',
      transliteration: 'rom vong',
      partOfSpeech: 'Danh từ / Điệu múa',
      shortDefinitionVi: 'Điệu múa Lâm-thôn Rom-vong múa vòng tròn',
      shortDefinitionEn: 'Traditional Romvong circle dance',
      topicId: topicLeHoi.id,
    },
    {
      slug: 'don-ta',
      scriptText: 'ដូនតា',
      normalizedScriptText: 'ដូនតា',
      transliteration: 'don ta',
      partOfSpeech: 'Danh từ',
      shortDefinitionVi: 'Ông bà tổ tiên / Lễ Sen Dolta',
      shortDefinitionEn: 'Ancestors / Sen Dolta festival',
      topicId: topicLeHoi.id,
    },
    {
      slug: 'troyong',
      scriptText: 'ត្រយង',
      normalizedScriptText: 'ត្រយង',
      transliteration: 'troyong',
      partOfSpeech: 'Danh từ',
      shortDefinitionVi: 'Chim Trơ-yung trong ca dao dân ca Khmer',
      shortDefinitionEn: 'Troyong bird in folk literature',
      topicId: topicDoiSong.id,
    },
    {
      slug: 'char-la-buong',
      scriptText: 'ចារ',
      normalizedScriptText: 'ចារ',
      transliteration: 'char',
      partOfSpeech: 'Động từ / Kỹ thuật',
      shortDefinitionVi: 'Kỹ thuật khắc kinh trên lá buông (Tra)',
      shortDefinitionEn: 'Etching technique on palm leaf manuscripts',
      topicId: topicKienTruc.id,
    },
    {
      slug: 'chedei-thap',
      scriptText: 'ចេដីយ៍',
      normalizedScriptText: 'ចេដីយ៍',
      transliteration: 'chedei',
      partOfSpeech: 'Danh từ',
      shortDefinitionVi: 'Tháp lưu cốt Chedei trong khuôn viên chùa',
      shortDefinitionEn: 'Stupa or reliquary tower',
      topicId: topicKienTruc.id,
    },
    {
      slug: 'beng-ao',
      scriptText: 'បឹង',
      normalizedScriptText: 'បឹង',
      transliteration: 'beng',
      partOfSpeech: 'Danh từ',
      shortDefinitionVi: 'Ao, bãi nước tự nhiên (như Ao Bà Om)',
      shortDefinitionEn: 'Pond or natural lake',
      topicId: topicDoiSong.id,
      placeId: placeWard8.id,
    },
  ];

  for (const item of demoTermsData) {
    let term = await prisma.khmerTerm.findUnique({
      where: { slug: item.slug },
    });

    if (!term) {
      term = await prisma.khmerTerm.create({
        data: {
          slug: item.slug,
          status: PublicationStatus.PUBLISHED,
          heritageEntityId: item.heritageEntityId || undefined,
          placeId: item.placeId || undefined,
          topics: {
            create: [{ topicId: item.topicId }],
          },
          collections: item.collectionId
            ? { create: [{ collectionId: item.collectionId }] }
            : undefined,
        },
      });

      const version = await prisma.khmerTermVersion.create({
        data: {
          termId: term.id,
          versionNo: 1,
          publicationStatus: PublicationStatus.PUBLISHED,
          scriptText: item.scriptText,
          normalizedScriptText: item.normalizedScriptText,
          transliteration: item.transliteration,
          partOfSpeech: item.partOfSpeech,
          shortDefinitionVi: item.shortDefinitionVi,
          shortDefinitionEn: item.shortDefinitionEn,
          culturalNote: item.culturalNote || undefined,
          publishedAt: new Date(),
          meanings: {
            create: [
              {
                languageCode: LanguageCode.vi,
                meaningText: item.shortDefinitionVi,
                order: 1,
                sourceResourceId: sourceDiaChi.id,
              },
            ],
          },
          examples: {
            create: [
              {
                khmerText: `${item.scriptText} ជាផ្នែកមួយនៃវប្បធម៌។`,
                normalizedKhmerText: `${item.scriptText} ជាផ្នែកមួយនៃវប្បធម៌។`,
                translationVi: `${item.shortDefinitionVi} là một phần không thể thiếu trong văn hóa Khmer.`,
                order: 1,
              },
            ],
          },
          pronunciations: {
            create: [
              {
                speakerAttribution: 'Người bản địa Trà Vinh [DEMO VERIFIED]',
                speakerRegion: 'TP. Trà Vinh',
                pronunciationVariant: 'Giọng Khmer Trà Vinh',
                rightsStatus: 'PUBLIC_ALLOWED',
                verificationStatus: VerificationOutcome.SOURCE_VERIFIED,
              },
            ],
          },
        },
      });

      await prisma.khmerTerm.update({
        where: { id: term.id },
        data: { currentVersionId: version.id },
      });
    }
  }

  // Seed 1 DRAFT term for security filter testing
  const draftTerm = await prisma.khmerTerm.findUnique({
    where: { slug: 'draft-test-term' },
  });
  if (!draftTerm) {
    const dTerm = await prisma.khmerTerm.create({
      data: {
        slug: 'draft-test-term',
        status: PublicationStatus.DRAFT,
      },
    });

    await prisma.khmerTermVersion.create({
      data: {
        termId: dTerm.id,
        versionNo: 1,
        publicationStatus: PublicationStatus.DRAFT,
        scriptText: 'ភូមិ',
        normalizedScriptText: 'ភូមិ',
        shortDefinitionVi: 'Từ nháp chưa xuất bản công khai',
      },
    });
  }

  console.log('✅ 15 Published Khmer Terms & 1 Draft Term seeded');
  console.log('🎉 Seed Khmer Handbook Core Sprint 7A finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
