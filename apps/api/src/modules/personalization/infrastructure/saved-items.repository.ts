import { Inject, Injectable } from "@nestjs/common";
import type { Pool } from "pg";
import { PG_POOL } from "../../../common/database/database.module";
import type { SavedItem } from "../domain/saved-item";

interface SavedItemRow {
  id: string;
  user_id: string;
  entity_id: string | null;
  term_id: string | null;
  created_at: Date;
}

function mapRow(row: SavedItemRow): SavedItem {
  return {
    id: row.id,
    userId: row.user_id,
    entityId: row.entity_id,
    termId: row.term_id,
    createdAt: row.created_at,
  };
}

const UNIQUE_VIOLATION = "23505";

/**
 * SavedItemsRepository — experience.saved_items (FR-PER-001). save() la idempotent: goi lai
 * cho cung 1 muc khong tao ban ghi trung, du co race condition nho giua findExisting va insert
 * (unique index lam luoi an toan, bat loi 23505 roi doc lai thay vi throw).
 */
@Injectable()
export class SavedItemsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async save(input: { userId: string; entityId?: string; termId?: string }): Promise<SavedItem> {
    const existing = await this.findExisting(input.userId, input.entityId, input.termId);
    if (existing) return existing;

    try {
      const { rows } = await this.pool.query<SavedItemRow>(
        `INSERT INTO experience.saved_items (user_id, entity_id, term_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [input.userId, input.entityId ?? null, input.termId ?? null]
      );
      return mapRow(rows[0]);
    } catch (error) {
      if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
        const found = await this.findExisting(input.userId, input.entityId, input.termId);
        if (found) return found;
      }
      throw error;
    }
  }

  private async findExisting(
    userId: string,
    entityId?: string,
    termId?: string
  ): Promise<SavedItem | null> {
    const { rows } = await this.pool.query<SavedItemRow>(
      `SELECT * FROM experience.saved_items
       WHERE user_id = $1 AND entity_id IS NOT DISTINCT FROM $2 AND term_id IS NOT DISTINCT FROM $3`,
      [userId, entityId ?? null, termId ?? null]
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  async listForUser(userId: string): Promise<SavedItem[]> {
    const { rows } = await this.pool.query<SavedItemRow>(
      `SELECT * FROM experience.saved_items WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map(mapRow);
  }

  async deleteByEntity(userId: string, entityId: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM experience.saved_items WHERE user_id = $1 AND entity_id = $2`,
      [userId, entityId]
    );
  }

  async deleteByTerm(userId: string, termId: string): Promise<void> {
    await this.pool.query(`DELETE FROM experience.saved_items WHERE user_id = $1 AND term_id = $2`, [
      userId,
      termId,
    ]);
  }

  /** Dung khi an danh hoa/xoa tai khoan (FR-PER-007) — saved_items la du lieu rieng tu, khong ai khac tham chieu. */
  async deleteAllForUser(userId: string): Promise<void> {
    await this.pool.query(`DELETE FROM experience.saved_items WHERE user_id = $1`, [userId]);
  }
}
