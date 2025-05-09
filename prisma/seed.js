const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.plano.createMany({
    data: [
      {
        nome: 'Plano Básico',
        descricao: 'O plano básico o aluno poderá cursar os módulos EAD contendo as apostilas, roteiros de práticas e avaliações de aprendizagens.',
        valor: 1500,
      },
      {
        nome: 'Plano Empreendedor',
        descricao: 'O plano empreendedor inclui mentorias online e acesso a eventos promovidos pela plataforma.',
        valor: 2000,
      },
      {
        nome: 'Plano Startup',
        descricao: 'O plano startup inclui modelagem de negócios e acesso a cursos de capacitação gratuitos.',
        valor: 3000,
      },
    ],
  });

  console.log('Dados iniciais inseridos com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });