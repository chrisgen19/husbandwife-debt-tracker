-- AlterTable
ALTER TABLE "DebtItem" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "installmentGroup" TEXT,
ADD COLUMN     "installmentMonth" INTEGER,
ADD COLUMN     "isInstallment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalInstallments" INTEGER;
