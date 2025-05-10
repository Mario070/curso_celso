const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
const cors = require('cors');

app.use(cors({ origin: '*' })); // Permite requisições de qualquer origem

app.use(express.json());
app.use(express.static('public')); 
app.use(express.static('public'));



/*async function inserirPlanos() {
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
*/

//Obter os planos disponibilizando os planos presente no banco de dados no cadastro
app.get('/api/plano', async (req, res) => {
    try {
        const planos = await prisma.plano.findMany(); // Busca os planos no banco de dados
        res.json(planos);
    } catch (error) {
        console.error('Erro ao buscar planos:', error);
        res.status(500).json({ error: 'Erro ao buscar planos' });
    }
});


app.get('/api/valor-plano/:planoId', async (req, res) => {
    const { planoId } = req.params;

    try {
        const plano = await prisma.plano.findUnique({
            where: { id: parseInt(planoId) },
        });

        if (!plano) {
            return res.status(404).json({ error: "Plano não encontrado." });
        }

        console.log("Plano encontrado:", plano); // Aqui o plano está definido
        res.status(200).json({ valor: plano.valor });
    } catch (error) {
        console.error("Erro ao buscar o valor do plano:", error.message);
        res.status(500).json({ error: "Erro ao buscar o valor do plano." });
    }
});

//Serve para salvar ususario durante o cadastro
app.post('/api/salvar-usuario', async (req, res) => {
    const { nome, sobrenome, email, cpf, login, senha, tipo, planoId, formaPagamento, dadosCartao } = req.body;

    console.log("Dados recebidos no backend:", req.body);
    console.log("Valor de email antes da verificação:", email);


    try {
        if (!email) {
    return res.status(400).json({ error: "Email não informado na requisição." });
}

const usuarioExistente = await prisma.usuario.findUnique({
    where: { email },
});

        
        // Verificar se o e-mail já existe
       /* const usuarioExistente = await prisma.usuario.findUnique({
            where: { email: email },
        });

        if (usuarioExistente) {
            return res.status(400).json({ error: "E-mail já cadastrado." });
        }*/

        const nomeCompleto = `${nome} ${sobrenome}`;

        // Criar o usuário fora da transação
        const novoUsuario = await prisma.usuario.create({
            data: {
                nome: nomeCompleto,
                email: email,
                senha: senha, // Use hash em produção
                cpf: cpf,
                tipo: tipo,
                planoId: planoId,
            },
        });

        console.log("Usuário criado:", novoUsuario);

        // Salvar a forma de pagamento separadamente
        if (formaPagamento === "CartaoCredito" && dadosCartao) {
            await prisma.formapagamento.create({
                data: {
                    tipo: formaPagamento,
                    titular: dadosCartao.titular,
                    numero: dadosCartao.numero,
                    validade: dadosCartao.validade,
                    cvv: dadosCartao.cvv,
                    parcelas: dadosCartao.parcelas,
                    usuarioId: novoUsuario.id,
                },
            });
        } else if (formaPagamento === "Boleto" || formaPagamento === "Pix") {
            await prisma.formapagamento.create({
                data: {
                    tipo: formaPagamento,
                    titular: nomeCompleto,
                    usuarioId: novoUsuario.id,
                },
            });
        }

        res.status(200).json({ message: "Usuário e forma de pagamento salvos com sucesso!" });
    } catch (error) {
        console.error("Erro ao salvar os dados no banco:", error.message, error.meta);
        res.status(500).json({ error: "Erro ao salvar os dados." });
    }
});

/*app.post('/api/salvar-usuario', async (req, res) => {
    const { nome, sobrenome, email, cpf, login, senha, tipo, planoId, formaPagamento, dadosCartao } = req.body;

    console.log("Dados recebidos no backend:", req.body);

    try {
        if (!email) {
            return res.status(400).json({ error: "O campo 'email' é obrigatório." });
        }

        const nomeCompleto = `${nome} ${sobrenome}`;

        const novoUsuario = await prisma.usuario.create({
            data: {
                nome: nomeCompleto,
                email: email,
                senha: senha,
                cpf: cpf,
                tipo: tipo,
                planoId: planoId,
            },
        });

        console.log("Usuário criado:", novoUsuario);

        res.status(200).json({ message: "Usuário salvo com sucesso!", usuario: novoUsuario });
    } catch (error) {
        console.error("Erro ao salvar os dados no banco:", error.message, error.meta);
        res.status(500).json({ error: "Erro ao salvar os dados." });
    }
});*/


fetch("http://localhost:3000/api/plano")
  .then(response => response.json())
  .then(data => {
    console.log('Planos recebidos:', data);
    // Aqui você pode manipular os dados recebidos e exibir no front-end
  })
  .catch(error => {
    console.error("Erro ao buscar planos:", error);
  });
  
  //para realizar login- post é uma forma segura
app.post('/api/login', async (req, res) => {
    const email = req.body.email.trim();
    const senha = req.body.senha.trim();

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { email },
        });

        if (!usuario || usuario.senha.trim() !== senha) {
            return res.status(401).json({ error: 'Email ou senha inválidos' });
        }

        res.status(200).json({ tipo: usuario.tipo });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

  app.get('/', (req, res) => {
    res.redirect('/login.html');
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
