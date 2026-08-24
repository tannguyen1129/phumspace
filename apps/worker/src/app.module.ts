import { Module } from "@nestjs/common";
import { DatabaseModule } from "./common/database/database.module";
import { StorageModule } from "./common/storage/storage.module";
import { QueueModule } from "./queues/queue.module";

@Module({
  imports: [DatabaseModule, StorageModule, QueueModule],
})
export class AppModule {}
