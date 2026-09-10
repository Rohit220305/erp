import { Injectable, BadRequestException, ForbiddenException } from "@nestjs/common";
import path from "path";
import { SelectQueryBuilder } from 'typeorm';
import { AppRequest } from '../types/app-request.type';

@Injectable()
export class GeneralUtilities {
  async makeFilterString(filters: any, columnMapOrAlias: Record<string, string> | string, logicalOperator = 'AND') {
    try {
      let filterString: any = '';
      const op = logicalOperator === 'OR' ? 'OR' : 'AND';

      if (filters && filters.length > 0) {
        filterString = await this.makeFilterCondition(filters[0], columnMapOrAlias);

        for (let i = 1; i < filters.length; i++) {
          const condition = await this.makeFilterCondition(filters[i], columnMapOrAlias);
          filterString = filterString + ` ${op} ` + condition;
        }
      } else {
        return true;
      }

      return filterString;  
    } catch (err) {
      throw err;
    }
  }

  async makeFilterCondition(filter, columnMapOrAlias: Record<string, string> | string) {
    try {
      let mappedField = '';

      if (typeof columnMapOrAlias === 'string') {
        mappedField = `${columnMapOrAlias}.${filter.key}`;
      } else {
        if (!columnMapOrAlias[filter.key]) {
          throw new BadRequestException('Invalid filter field');
        }
        mappedField = columnMapOrAlias[filter.key];
      }

      if (Array.isArray(filter.value)) {
        if (filter.value.length === 0) {
          return '1=1'; 
        }
        const inValues = filter.value.map(v => `"${v}"`).join(',');
        return `${mappedField} IN (${inValues})`;
      }

      let symbol;
      switch (filter.operator) {
        case 'equal':
          symbol = '=';
          break;
        case 'greater than':
          symbol = '>';
          break;
        case 'less than':
          symbol = '<';
          break;
        case 'less than equal':
          symbol = '<=';
          break;
        case 'greater than equal':
          symbol = '>=';
          break;
        case 'not equal':
          symbol = '!=';
          break;

        case 'like':
          return `${mappedField} LIKE "%${filter.value}%"`;
      }

      return `${mappedField} ${symbol} "${filter.value}"`;
    } catch (err) {
      throw err;
    }
  }

  async generateUrl(folder: string, subFolder: string, fileName: string) {
    const baseUrl = process.env.BASE_URL;

    return `${baseUrl}/uploads/${folder}/${subFolder}/${fileName}`;
  }

  async dateFormat(dateTime) {
    let date = new Date(dateTime);

    let day = String(date.getDate()).padStart(2, '0');

    let month = String(date.getMonth() + 1).padStart(2, '0');

    let year = date.getFullYear();

    let hours = date.getHours();

    let minutes = String(date.getMinutes()).padStart(2, '0');

    let ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;

    hours = hours ? hours : 12;

    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  }

  async encryptPassword(password) {
    const encryptedpass = password;
    return encryptedpass;
  }

  async mapFields(params: any, allowedFields: string[]) {
    const queryColumns: any = {};

    allowedFields.forEach((field) => {
      if (params[field] !== undefined && params[field] !== null) {
        queryColumns[field] = params[field];
      }
    });

    return queryColumns;
  }

  isSuperAdmin(req: AppRequest): boolean {
    return req.user?.isSuperAdmin === true || (req.user?.isSuperAdmin as any) === 1;
  }

  assertCompanyAccess(
    req: AppRequest,
    entityCompanyId: number,
    action: string,
    entityLabel: string,
  ): void {
    if (!this.isSuperAdmin(req) && entityCompanyId !== req.user?.companyId) {
      throw new ForbiddenException(
        `Cannot ${action} ${entityLabel} outside your company`,
      );
    }
  }

  async prepareInsertColumns(req: AppRequest, params: any, allowedFields: string[]) {
    const cols = await this.mapFields(params, allowedFields);
    cols.addedBy = req.user?.sub;
    cols.addedDate = () => 'NOW()';
    return cols;
  }

  async prepareUpdateColumns(req: AppRequest, params: any, allowedFields: string[]) {
    const cols = await this.mapFields(params, allowedFields);
    cols.updatedBy = req.user?.sub;
    cols.updatedDate = () => 'NOW()';
    return cols;
  }

  buildSoftDeletePayload(
    uniqueFields: Record<string, string | null>,
    req: AppRequest,
  ): Record<string, any> {
    // const timestamp = Date.now();
    const payload: any = { sysRecDeleted: true };
    // for (const [key, value] of Object.entries(uniqueFields)) {
    //   payload[key] = value ? `${value}_del_${timestamp}` : value;
    // }
    payload.updatedBy = req.user?.sub;
    payload.updatedDate = () => 'NOW()';
    return payload;
  }

  buildActivityLogPayload(
    req: AppRequest,
    code: string,
    entityType: string,
    entityId: number,
    entityName: string,
    companyId: number,
  ) {
    return {
      activityCode: code,
      companyId,
      actorUserId: req.user?.sub as number,
      impersonatorId: req.user?.impersonatorId as number | undefined,
      entityType,
      entityId,
      entityName,
      ipAddress: req.ip as string,
      userAgent: req.headers?.['user-agent'] as string | undefined,
    } as any;
  }

  parsePagination(params: any) {
    const page = params.page ? parseInt(params.page) : 1;
    const limit = params.limit ? parseInt(params.limit) : 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  buildPaginationResponse(total: number, page: number, limit: number, skip: number) {
    return {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      prevPage: page > 1,
      nextPage: total > skip + limit,
    };
  }

  buildColumnMapFromSelects(qb: SelectQueryBuilder<any>): Record<string, string> {
    const map: Record<string, string> = {};
    const selects: Array<{ selection: string; aliasName?: string }> =
      (qb as any).expressionMap.selects;

    for (const sel of selects) {
      if (sel.aliasName) {
        map[sel.aliasName] = sel.selection;
      } else {
        const match = sel.selection.match(/^(.+?)\s+AS\s+(\w+)$/i);
        if (match) {
          map[match[2].trim()] = match[1].trim();
        }
      }
    }

    if (map['addedDate']) {
      map['addedDateFormatted'] = map['addedDate'];
    }
    if (map['updatedDate']) {
      map['updatedDateFormatted'] = map['updatedDate'];
    }
    if (map['productionDate']) {
      map['productionDateFormatted'] = map['productionDate'];
    }
    if (map['productionQuantity']) {
      map['productionQuantityDisplay'] = map['productionQuantity'];
    }
    if (map['pendingQuantity']) {
      map['pendingQuantityDisplay'] = map['pendingQuantity'];
    }

    return map;
  }

  async applyListQuery(
    qb: SelectQueryBuilder<any>,
    params: any,
    defaultSort: string,
  ) {
    const columnMap = this.buildColumnMapFromSelects(qb);

    if (params?.search) {
      const searchColumns = Object.values(columnMap).filter(col => !col.toUpperCase().includes('SELECT '));
      const clauses = searchColumns.map(col => `${col} LIKE :search`).join(' OR ');
      if (clauses) {
        qb.andWhere(`(${clauses})`, { search: `%${params.search}%` });
      }
    }

    if (params?.filters && params.filters.length > 0) {
      const whereString = await this.makeFilterString(
        params.filters, columnMap, params.logicalOperator,
      );
      if (whereString) qb.andWhere(whereString);
    }

    if (params?.sortField && params?.sortOrder && columnMap[params.sortField]) {
      const order = params.sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      qb.orderBy(columnMap[params.sortField], order);
    } else {
      qb.orderBy(defaultSort, 'ASC');
    }
  }

  applyCompanyScope(qb: SelectQueryBuilder<any>, req: AppRequest, alias: string) {
    if (!this.isSuperAdmin(req)) {
      qb.andWhere(`${alias}.companyId = :scopedCompanyId`, {
        scopedCompanyId: req.user?.companyId,
      });
    }
  }

  async formatDate(entities: any[]) {
    for (const entity of entities) {
      entity.addedDateFormatted = await this.dateFormat(entity.addedDate);
      if (entity.updatedDate) {
        entity.updatedDateFormatted = await this.dateFormat(entity.updatedDate);
      }
    }
  }

  formatValueWithUnit(value: any, unit?: string | null): string | null {
    if (value !== null && value !== undefined && value !== '') {
      return unit ? `${value} ${unit}` : `${value}`;
    }
    return null;
  }

  getCompanyInitials(companyName: string): string {
    if (!companyName) return 'ERP';
    const words = companyName.replace(/[^a-zA-Z0-9\s]/g, '').trim().split(/\s+/);
    if (words.length >= 2) {
      return words.map(w => w[0].toUpperCase()).join('').substring(0, 4);
    }
    return companyName.substring(0, 3).toUpperCase();
  }

  getCodePrefix(companyName: string, modulePrefix: string): string {
    const initials = this.getCompanyInitials(companyName);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${initials}${modulePrefix}/${year}/${month}/`;
  }

  generateCode(
    companyName: string,
    modulePrefix: string,
    lastCode: string | null,
    digits: number = 5,
  ): string {
    const prefix = this.getCodePrefix(companyName, modulePrefix);
    let nextSeq = 1;
    if (lastCode) {
      const parts = lastCode.split('/');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        nextSeq = lastNum + 1;
      }
    }
    return `${prefix}${String(nextSeq).padStart(digits, '0')}`;
  }
}