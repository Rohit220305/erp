import { Injectable, BadRequestException } from "@nestjs/common";
import path from "path";

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
      console.log(err);
      throw err;
    }
  }

  async makeFilterCondition(filter, columnMapOrAlias: Record<string, string> | string) {
    try {
      let symbol;
      let mappedField = '';

      if (typeof columnMapOrAlias === 'string') {
        mappedField = `${columnMapOrAlias}.${filter.key}`;
      } else {
        if (!columnMapOrAlias[filter.key]) {
          throw new BadRequestException('Invalid filter field');
        }
        mappedField = columnMapOrAlias[filter.key];
      }

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
      console.log(err);
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

    // console.log('Future encryption implementation : ', encryptedpass);

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
}