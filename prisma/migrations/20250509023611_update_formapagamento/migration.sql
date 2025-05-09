-- AlterTable
ALTER TABLE `formapagamento` MODIFY `titular` VARCHAR(100) NULL,
    MODIFY `numero` VARCHAR(50) NULL,
    MODIFY `validade` VARCHAR(10) NULL,
    MODIFY `parcelas` INTEGER NULL;
