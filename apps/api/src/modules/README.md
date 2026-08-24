# Quy uoc module (DDD)

Moi module domain (`identity`, `phumdata`, `scanner`, `discovery`, `handbook`, `olympiad`,
`personalization`, `contribution`, `moderation`, `admin`) theo cung 1 cau truc 4 layer, mo
phong theo `docs/PhumSpace_System_Design_Document`:

```
<module>/
  <module>.module.ts   Khai bao NestJS module, wire cac layer voi nhau
  interface/            Controller, DTO input/output, mapping HTTP <-> use case
  application/           Use case / service dieu phoi nghiep vu (khong chua business rule thuan)
  domain/                 Entity, value object, business rule thuan tuy — khong phu thuoc NestJS/DB
  infrastructure/          Repository, adapter goi Postgres/Redis/Queue/API ngoai (Gemini, Maps, TTS...)
```

**Quy tac bat buoc:** module A chi duoc goi module B qua `application` facade (service public)
hoac qua event (outbox/BullMQ) — khong duoc import truc tiep `domain`/`infrastructure` cua module
khac. Dieu nay giu ranh gioi ro de co the tach thanh service rieng o GD2-GD3 neu can, dung tinh
than ADR-001 "modular monolith" trong System Design Document.

O Milestone M0, moi module moi co `interface/` voi 1 endpoint `GET /v1/<module>/health` de xac
nhan wiring; `application/`, `domain/`, `infrastructure/` con la thu muc rong (`.gitkeep`), se duoc
lap day dan theo milestone tuong ung trong ke hoach trien khai (xem `plan.md` muc 2.4).
