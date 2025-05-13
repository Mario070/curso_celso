const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


async function inserirPlanos() {
   const planos= await prisma.plano.createMany({
        data: [
            {
                nome: 'Plano Básico',
                descricao: 'O plano básico o aluno poderá cursar os módulos EAD contendo as apostilas, roteiros de práticas e avaliações de aprendizagens. Poderão participar de grupos de whatsapp fechados apenas para estes alunos do curso.',
                valor: 1500
            },
            {
                nome: 'Plano Empreendedor',
                descricao: 'O plano empreendedor o aluno poderá cursar os módulos EAD contendo as apostilas, roteiros de práticas e avaliações de aprendizagens, mentorias online com professores especialistas sobre os módulos dos cursos e terão acesso aos eventos promovidos pela plataforma e cursos de capacitação de forma gratuita.',
                valor: 2000
            },
            {
                nome: 'Plano Startup',
                descricao: 'O plano startup o aluno poderá cursar os módulos EAD contendo as apostilas, roteiros de práticas e avaliações de aprendizagens, mentorias online com professores especialistas sobre os módulos dos cursos e terão acesso aos eventos promovidos pela plataforma e cursos de capacitação de forma gratuita. Participarão de modelagem de negócios',
                valor: 3000
            },
        ],
    });

    console.log('Planos inseridos com sucesso!');
    console.log('Plano criado:', planos);
}

inserirPlanos()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })


async function inserirAdministrador(){
    try{
        const novoUsuario = await prisma.usuario.create({
            data:{
            nome: "Maria Clara Mota",
            email: "maria@sulcelso.com" ,
            senha: "brisa",
            cpf :null,
            planoId: null,
            tipo: 'admin'
            },
        });
        console.log("Usuário administrador criado:", novoUsuario );
    }catch (error){
        console.error ("Erro ao criar o administrador", error); 
    }finally{
        await prisma.$disconnect();
    }
}
inserirAdministrador();