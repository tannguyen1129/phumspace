"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ShieldCheck } from "lucide-react";
import {
  getHeritageEntity,
  getHeritageSources,
  type HeritageEntityDetail,
  type HeritageSource,
} from "../../../lib/api-client";
import {
  Badge,
  Card,
  CardSkeleton,
  FeedbackState,
  PageHeader,
} from "../../../components/ui";
import { getVerificationLabel } from "../../../lib/place-labels";
export function CultureDetailView({ entityId }: { entityId: string }) {
  const [entity, setEntity] = useState<HeritageEntityDetail>();
  const [sources, setSources] = useState<HeritageSource[]>([]);
  const [error, setError] = useState<string>();
  useEffect(() => {
    getHeritageEntity(entityId)
      .then(async (value) => {
        setEntity(value);
        if (value.currentVersion)
          setSources(await getHeritageSources(value.currentVersion.id));
      })
      .catch(() =>
        setError("Nội dung không tồn tại hoặc chưa được phép công bố."),
      );
  }, [entityId]);
  if (error)
    return (
      <main>
        <FeedbackState title="Không mở được nội dung" description={error} />
      </main>
    );
  if (!entity?.currentVersion)
    return (
      <main className="place-detail-loading">
        <CardSkeleton lines={5} />
      </main>
    );
  const version = entity.currentVersion;
  return (
    <main className="app-page place-detail-page">
      <PageHeader
        backHref="/search"
        eyebrow="NỘI DUNG PHUMDATA"
        title={version.preferredLabel}
        subtitle="Nội dung có phiên bản, nguồn và mức xác minh rõ ràng."
      />
      <section className="place-detail-layout">
        <article className="place-detail-main">
          <div className="place-trust">
            <Badge variant="verified" icon={<ShieldCheck size={12} />}>
              {getVerificationLabel(version.verificationLevel)}
            </Badge>
          </div>
          <Card>
            <BookOpen />
            <h2>Giới thiệu</h2>
            <p>{version.description ?? "Chưa có mô tả công khai."}</p>
          </Card>
          <section className="place-content-section">
            <h2>Nguồn tham khảo</h2>
            {sources.length ? (
              <ul className="place-sources">
                {sources.map((source) => (
                  <li key={source.id}>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title}
                      </a>
                    ) : (
                      <strong>{source.title}</strong>
                    )}
                    <span>{source.author}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa có nguồn phù hợp để hiển thị.</p>
            )}
          </section>
        </article>
        <aside className="place-detail-aside">
          <Link
            href={`/contribute?entityId=${entityId}`}
            className="ps-btn ps-btn--secondary"
          >
            Báo lỗi hoặc bổ sung thông tin
          </Link>
        </aside>
      </section>
    </main>
  );
}
