const { validateSync } = require('class-validator');
const { plainToInstance } = require('class-transformer');

async function test() {
  const { CompanyUpdateDto } = await import('./erp-backend/dist/company/dto/company.dto.js');
  
  const obj = plainToInstance(CompanyUpdateDto, {
    id: 15,
    companyCode: "C001",
    companyName: "Test",
    status: "Active",
    email: "test@test.com"
  });
  
  const errors = validateSync(obj, { whitelist: true, forbidNonWhitelisted: false });
  console.log("ERRORS:", JSON.stringify(errors, null, 2));
}

test();
