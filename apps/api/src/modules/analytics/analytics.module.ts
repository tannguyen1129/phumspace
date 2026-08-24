import { Module } from "@nestjs/common";
import { AnalyticsController } from "./interface/analytics.controller";
import { AnalyticsService } from "./application/analytics.service";
@Module({controllers:[AnalyticsController],providers:[AnalyticsService],exports:[AnalyticsService]}) export class AnalyticsModule{}
