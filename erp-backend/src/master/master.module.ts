import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ActivityLogModule } from 'src/activity-log/activity-log.module';
import { GeneralUtilities } from 'src/package/utilities/general.utilities';
import { MasterController } from './master.controller';
import { MasterService } from './service/master.service';
import { MasterListService } from './service/master.list.service';
import { MasterConfigService } from './service/master-config.service';
import { MasterValidatorService } from './service/master-validator.service';

@Module({
  imports: [ActivityLogModule],
  controllers: [MasterController],
  providers: [
    MasterService,
    MasterListService,
    MasterConfigService,
    MasterValidatorService,
    GeneralUtilities,
  ],
  exports: [
    MasterService,
    MasterListService,
    MasterConfigService,
    MasterValidatorService,
  ],
})
export class MasterModule implements OnModuleInit {
  private readonly logger = new Logger(MasterModule.name);

  constructor(
    private readonly masterConfigService: MasterConfigService,
    private readonly entityManager: EntityManager,
  ) {}

  async onModuleInit() {
    this.logger.log('Validating Master Engine module configurations...');

    const modules = this.masterConfigService.getAllModules();
    for (const moduleSlug of modules) {
      const config = this.masterConfigService.getConfig(moduleSlug);

      try {
        // 1. Check if the physical MySQL table exists
        const tableCheck = await this.entityManager.query(
          `SHOW TABLES LIKE ?`,
          [config.tableName],
        );

        if (!tableCheck || tableCheck.length === 0) {
          this.logger.warn(
            `Table '${config.tableName}' for module '${moduleSlug}' does not exist in the database yet. Skipping column verification until migration is executed.`,
          );
          continue;
        }

        // 2. Fetch live columns from the database table
        const rawColumns: Array<{ Field: string }> = await this.entityManager.query(
          `SHOW COLUMNS FROM \`${config.tableName}\``,
        );
        const actualColumns = new Set(rawColumns.map((col) => col.Field));

        // 3. Verify all configured fields exist in the database table
        for (const fieldName of Object.keys(config.fields)) {
          if (!actualColumns.has(fieldName)) {
            throw new Error(
              `Configuration error in master module '${moduleSlug}': field '${fieldName}' does not exist in table '${config.tableName}'.`,
            );
          }
        }

        this.logger.log(
          `✓ Master module '${moduleSlug}' (${config.label}) validated successfully against table '${config.tableName}'.`,
        );
      } catch (error) {
        this.logger.error(
          `Validation failed for master module '${moduleSlug}': ${error.message}`,
        );
        throw error;
      }
    }
  }
}
