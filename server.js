const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
const cors = require('cors');

app.use(cors({ origin: '*' })); // Permite requisições de qualquer origem

app.use(express.json());
app.use(express.static('public')); 
app.use(express.static('public'));


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
    const { nome, sobrenome, email, cpf, senha, tipo, planoId, formaPagamento, dadosCartao } = req.body;

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

app.post('/api/salvar-curso', async (req, res) => {
  const { titulo, descricao, categoria, cargaHoraria } = req.body;

  try {
    const novoCurso = await prisma.curso.create({
      data: {
        titulo,
        descricao,
        categoria,
        cargaHoraria: parseInt(cargaHoraria),
      },
    });

    // Retorna o id e a mensagem para o front
    res.status(200).json({ id: novoCurso.id, message: "Curso salvo com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar curso:", error.message, error.meta);
    res.status(500).json({ error: "Erro ao salvar o curso no banco de dados." });
  }
});

app.post('/api/salvar-video', async (req, res) => {
  const { titulovideo, linkvideo, tempoVideo, moduloId } = req.body;

  // Converter duração
  const [hora = "0", minuto = "0", segundo = "0"] = (tempoVideo || "00:00:00").split(':');
  const duracaoEmMinutos = parseInt(hora) * 60 + parseInt(minuto) + (parseInt(segundo) >= 30 ? 1 : 0);

  try {
    const novoVideo = await prisma.video.create({
      data: {
        moduloId,
        titulo: titulovideo,
        urlVideo: linkvideo,
        duracao: duracaoEmMinutos,
      },
    });

    res.status(200).json({ message: "Vídeo salvo com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar vídeo:", error.message, error.meta);
    res.status(500).json({ error: "Erro ao salvar o vídeo no banco de dados." });
  }
});

app.post('/api/salvar-modulo', async (req, res) => {
  const { cursoId, titulo, ordem } = req.body;

  if (!cursoId || !titulo || ordem === undefined) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const novoModulo = await prisma.modulo.create({
      data: {
        cursoId: parseInt(cursoId),
        titulo,
        ordem: parseInt(ordem),
      },
    });

    res.status(200).json({ message: 'Módulo salvo com sucesso!', modulo: novoModulo });
  } catch (error) {
    console.error('Erro ao salvar módulo:', error);
    res.status(500).json({ error: 'Erro ao salvar o módulo no banco de dados.' });
  }
});
app.post('/api/salvar-apostila', async (req, res) => {
  const { moduloId, titulo, arquivoUrl } = req.body;

  if (!moduloId || !titulo || !arquivoUrl) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const novaApostila = await prisma.apostila.create({
      data: {
        moduloId: parseInt(moduloId),
        titulo,
        arquivoUrl,
      },
    });

    res.status(200).json({ message: 'Apostila salva com sucesso!', apostila: novaApostila });
  } catch (error) {
    console.error('Erro ao salvar apostila:', error);
    res.status(500).json({ error: 'Erro ao salvar a apostila no banco de dados.' });
  }
});

app.post('/api/salvar-avaliacao', async (req, res) => {
  const { moduloId, titulo, url } = req.body;

  try {
    const novaAvaliacao = await prisma.avaliacao.create({
      data: {
        moduloId: parseInt(moduloId),
        titulo,
        url,
      },
    });

    res.status(200).json({ message: 'Avaliação salva com sucesso!' });
  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);
    res.status(500).json({ error: "Erro ao salvar a avaliação no banco de dados." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
