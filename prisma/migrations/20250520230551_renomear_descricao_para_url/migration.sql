/*
  Warnings:

  - You are about to drop the column `descricao` on the `avaliacao` table. All the data in the column will be lost.
  - Added the required column `url` to the `avaliacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `avaliacao` DROP COLUMN `descricao`,
    ADD COLUMN `url` VARCHAR(255) NOT NULL;
