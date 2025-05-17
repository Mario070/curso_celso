/*
  Warnings:

  - You are about to drop the `alunoturma` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `turma` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `alunoturma` DROP FOREIGN KEY `AlunoTurma_alunoId_fkey`;

-- DropForeignKey
ALTER TABLE `alunoturma` DROP FOREIGN KEY `AlunoTurma_turmaId_fkey`;

-- DropForeignKey
ALTER TABLE `turma` DROP FOREIGN KEY `Turma_cursoId_fkey`;

-- DropForeignKey
ALTER TABLE `turma` DROP FOREIGN KEY `Turma_professorId_fkey`;

-- DropTable
DROP TABLE `alunoturma`;

-- DropTable
DROP TABLE `turma`;

-- CreateTable
CREATE TABLE `_CursosMinistrados` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CursosMinistrados_AB_unique`(`A`, `B`),
    INDEX `_CursosMinistrados_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CursosMatriculados` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CursosMatriculados_AB_unique`(`A`, `B`),
    INDEX `_CursosMatriculados_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CursosMinistrados` ADD CONSTRAINT `_CursosMinistrados_A_fkey` FOREIGN KEY (`A`) REFERENCES `curso`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CursosMinistrados` ADD CONSTRAINT `_CursosMinistrados_B_fkey` FOREIGN KEY (`B`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CursosMatriculados` ADD CONSTRAINT `_CursosMatriculados_A_fkey` FOREIGN KEY (`A`) REFERENCES `curso`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CursosMatriculados` ADD CONSTRAINT `_CursosMatriculados_B_fkey` FOREIGN KEY (`B`) REFERENCES `usuario`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
