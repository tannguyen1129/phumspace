import { describe, expect, it, vi } from "vitest";
import { ScanJobProcessor } from "../queues/scan-job.processor";
import type { ScanPipelineService } from "../modules/scanner/application/scan-pipeline.service";

function buildProcessor() {
  const process = vi.fn().mockResolvedValue(undefined);
  const scanPipelineService = { process } as unknown as ScanPipelineService;
  return { processor: new ScanJobProcessor(scanPipelineService), process };
}

describe("ScanJobProcessor", () => {
  it("goi ScanPipelineService.process voi scanRequestId tu payload", async () => {
    const { processor, process } = buildProcessor();
    await processor.process("job-1", { scanRequestId: "scan-123" });
    expect(process).toHaveBeenCalledWith("scan-123");
  });

  it("bo qua job khi payload thieu scanRequestId, khong nem loi", async () => {
    const { processor, process } = buildProcessor();
    await expect(processor.process("job-1", { imageId: "abc" })).resolves.toBeUndefined();
    expect(process).not.toHaveBeenCalled();
  });
});
