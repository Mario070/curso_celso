-- CreateTable
CREATE TABLE `alunoturma` (
    `alunoId` INTEGER NOT NULL,
    `turmaId` INTEGER NOT NULL,

    INDEX `AlunoTurma_turmaId_fkey`(`turmaId`),
    PRIMARY KEY (`alunoId`, `turmaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `apostila` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moduloId` INTEGER NOT NULL,
    `titulo` VARCHAR(100) NOT NULL,
    `arquivoUrl` VARCHAR(255) NOT NULL,

    INDEX `Apostila_moduloId_fkey`(`moduloId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `avaliacao` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moduloId` INTEGER NOT NULL,
    `titulo` VARCHAR(100) NOT NULL,
    `descricao` VARCHAR(191) NULL,

    INDEX `Avaliacao_moduloId_fkey`(`moduloId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(100) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `categoria` VARCHAR(50) NOT NULL,
    `cargaHoraria` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `formapagamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('CartaoCredito', 'Boleto', 'Pix') NOT NULL,
    `titular` VARCHAR(100) NOT NULL,
    `numero` VARCHAR(50) NOT NULL,
    `validade` VARCHAR(10) NOT NULL,
    `cvv` VARCHAR(10) NULL,
    `usuarioId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `parcelas` INTEGER NOT NULL,

    INDEX `FormaPagamento_usuarioId_fkey`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modulo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cursoId` INTEGER NOT NULL,
    `titulo` VARCHAR(100) NOT NULL,
    `ordem` INTEGER NOT NULL,

    INDEX `Modulo_cursoId_fkey`(`cursoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parceria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alunoId` INTEGER NOT NULL,
    `descricaoProjeto` VARCHAR(191) NULL,
    `percentualPlataforma` DECIMAL(65, 30) NOT NULL,
    `dataAssinatura` DATETIME(3) NOT NULL,
    `contratoUrl` VARCHAR(255) NOT NULL,

    INDEX `Parceria_alunoId_fkey`(`alunoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plano` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `descricao` TEXT NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progressoapostila` (
    `alunoId` INTEGER NOT NULL,
    `apostilaId` INTEGER NOT NULL,
    `baixouApostila` BOOLEAN NOT NULL,
    `dataUltimaInteracao` DATETIME(3) NOT NULL,

    INDEX `ProgressoApostila_apostilaId_fkey`(`apostilaId`),
    PRIMARY KEY (`alunoId`, `apostilaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progressoavaliacao` (
    `alunoId` INTEGER NOT NULL,
    `avaliacaoId` INTEGER NOT NULL,
    `notaAvaliacao` DECIMAL(65, 30) NOT NULL,
    `dataUltimaInteracao` DATETIME(3) NOT NULL,

    INDEX `ProgressoAvaliacao_avaliacaoId_fkey`(`avaliacaoId`),
    PRIMARY KEY (`alunoId`, `avaliacaoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progressovideo` (
    `alunoId` INTEGER NOT NULL,
    `videoId` INTEGER NOT NULL,
    `progressoVideo` INTEGER NOT NULL,
    `dataUltimaInteracao` DATETIME(3) NOT NULL,

    INDEX `ProgressoVideo_videoId_fkey`(`videoId`),
    PRIMARY KEY (`alunoId`, `videoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `turma` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `cursoId` INTEGER NOT NULL,
    `professorId` INTEGER NOT NULL,
    `dataInicio` DATETIME(3) NOT NULL,
    `dataFim` DATETIME(3) NOT NULL,

    INDEX `Turma_cursoId_fkey`(`cursoId`),
    INDEX `Turma_professorId_fkey`(`professorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `senha` VARCHAR(255) NOT NULL,
    `tipo` ENUM('aluno', 'professor', 'admin') NOT NULL,
    `dataCadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `planoId` INTEGER NULL,
    `cpf` VARCHAR(11) NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    INDEX `Usuario_planoId_fkey`(`planoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `video` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moduloId` INTEGER NOT NULL,
    `titulo` VARCHAR(100) NOT NULL,
    `urlVideo` VARCHAR(255) NOT NULL,
    `duracao` INTEGER NOT NULL,

    INDEX `Video_moduloId_fkey`(`moduloId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `alunoturma` ADD CONSTRAINT `AlunoTurma_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `alunoturma` ADD CONSTRAINT `AlunoTurma_turmaId_fkey` FOREIGN KEY (`turmaId`) REFERENCES `turma`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `apostila` ADD CONSTRAINT `Apostila_moduloId_fkey` FOREIGN KEY (`moduloId`) REFERENCES `modulo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `avaliacao` ADD CONSTRAINT `Avaliacao_moduloId_fkey` FOREIGN KEY (`moduloId`) REFERENCES `modulo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `formapagamento` ADD CONSTRAINT `FormaPagamento_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modulo` ADD CONSTRAINT `Modulo_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parceria` ADD CONSTRAINT `Parceria_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progressoapostila` ADD CONSTRAINT `ProgressoApostila_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progressoapostila` ADD CONSTRAINT `ProgressoApostila_apostilaId_fkey` FOREIGN KEY (`apostilaId`) REFERENCES `apostila`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progressoavaliacao` ADD CONSTRAINT `ProgressoAvaliacao_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progressoavaliacao` ADD CONSTRAINT `ProgressoAvaliacao_avaliacaoId_fkey` FOREIGN KEY (`avaliacaoId`) REFERENCES `avaliacao`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progressovideo` ADD CONSTRAINT `ProgressoVideo_alunoId_fkey` FOREIGN KEY (`alunoId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progressovideo` ADD CONSTRAINT `ProgressoVideo_videoId_fkey` FOREIGN KEY (`videoId`) REFERENCES `video`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turma` ADD CONSTRAINT `Turma_cursoId_fkey` FOREIGN KEY (`cursoId`) REFERENCES `curso`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `turma` ADD CONSTRAINT `Turma_professorId_fkey` FOREIGN KEY (`professorId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario` ADD CONSTRAINT `Usuario_planoId_fkey` FOREIGN KEY (`planoId`) REFERENCES `plano`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `video` ADD CONSTRAINT `Video_moduloId_fkey` FOREIGN KEY (`moduloId`) REFERENCES `modulo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
