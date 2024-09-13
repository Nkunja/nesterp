-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "subscriptionEnd" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
