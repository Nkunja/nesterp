-- AlterTable
ALTER TABLE "Department" ALTER COLUMN "companyId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "companyId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "companyId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Task" ALTER COLUMN "companyId" DROP DEFAULT;
