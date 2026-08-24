"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { ApiError, listSaved, saveEntity, saveTerm, unsaveEntity, unsaveTerm } from "../lib/api-client";

type Props = { entityId: string; termId?: never } | { termId: string; entityId?: never };

export function SaveButton(props: Props) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const targetId = (props.entityId ?? props.termId) as string;
  const targetType = props.entityId ? "entity" : "term";

  useEffect(() => {
    setLoading(true);
    setError(undefined);
    listSaved({ type: targetType })
      .then((items) => setSaved(targetType === "entity" ? items.some((item) => item.entityId === targetId) : items.some((item) => item.termId === targetId)))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không kiểm tra được trạng thái lưu."))
      .finally(() => setLoading(false));
  }, [targetId, targetType]);

  async function toggle() {
    setPending(true);
    setError(undefined);
    try {
      if (saved) {
        if (targetType === "entity") await unsaveEntity(targetId);
        else await unsaveTerm(targetId);
        setSaved(false);
      } else {
        if (targetType === "entity") await saveEntity(targetId);
        else await saveTerm(targetId);
        setSaved(true);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không cập nhật được nội dung đã lưu.");
    } finally {
      setPending(false);
    }
  }

  const Icon = pending || loading ? Loader2 : saved ? BookmarkCheck : Bookmark;
  return <span className="save-control"><button type="button" className={`ps-btn ${saved ? "ps-btn--secondary" : "ps-btn--ghost"}`} onClick={toggle} disabled={loading || pending} aria-pressed={saved} aria-describedby={error ? `save-error-${targetId}` : undefined}><Icon className={pending || loading ? "ps-spin" : undefined} size={16} />{saved ? "Đã lưu" : "Lưu nội dung"}</button>{error && <small id={`save-error-${targetId}`} role="alert">{error}</small>}</span>;
}
