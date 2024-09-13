/*
  Warnings:

  - Added the required column `address` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `owner` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
   ALTER TABLE "Company" ADD COLUMN "address" VARCHAR(255) NOT NULL DEFAULT '';
   ALTER TABLE "Company" ADD COLUMN "location" VARCHAR(255) NOT NULL DEFAULT '';
   ALTER TABLE "Company" ADD COLUMN "owner" VARCHAR(255) NOT NULL DEFAULT '';
   ALTER TABLE "Company" ADD COLUMN "phoneNumber" VARCHAR(255) NOT NULL DEFAULT '';
