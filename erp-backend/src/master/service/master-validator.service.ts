import { Injectable, BadRequestException } from '@nestjs/common';
import { MasterModuleConfig } from '../interfaces/master-module.interface';

@Injectable()
export class MasterValidatorService {
  validateAndClean(body: any, config: MasterModuleConfig): Record<string, any> {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Invalid request payload.');
    }

    const cleanData: Record<string, any> = {};

    for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
      const rawValue = body[fieldName];

      const isEmpty =
        rawValue === undefined ||
        rawValue === null ||
        (typeof rawValue === 'string' && rawValue.trim() === '');

      if (fieldConfig.required && isEmpty) {
        throw new BadRequestException(`${fieldName} is required.`);
      }

      if (rawValue !== undefined && rawValue !== null && rawValue !== '') {
        if (fieldConfig.type === 'number') {
          const num = Number(rawValue);
          if (isNaN(num)) {
            throw new BadRequestException(`${fieldName} must be a valid number.`);
          }
          cleanData[fieldName] = num;
        } else if (fieldConfig.type === 'string') {
          const str = String(rawValue).trim();
          if (fieldConfig.maxLength && str.length > fieldConfig.maxLength) {
            throw new BadRequestException(
              `${fieldName} must not exceed ${fieldConfig.maxLength} characters.`,
            );
          }
          cleanData[fieldName] = str;
        } else if (fieldConfig.type === 'enum') {
          const str = String(rawValue).trim();
          if (fieldConfig.enumValues && !fieldConfig.enumValues.includes(str)) {
            throw new BadRequestException(
              `${fieldName} must be one of: ${fieldConfig.enumValues.join(', ')}.`,
            );
          }
          cleanData[fieldName] = str;
        } else {
          cleanData[fieldName] = rawValue;
        }
      } else if (rawValue === null) {
        cleanData[fieldName] = null;
      }
    }

    return cleanData;
  }
}
