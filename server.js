const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = express();
const cors = require('cors');

app.use(cors({ origin: '*' })); // Permite requisições de qualquer origem

app.use(express.json());
app.use(express.static('public')); 
app.use(express.static('public'));



// Buscar todos os cursos
app.get('/api/Mcursos', async (req, res) => {
  try {
    const cursos = await prisma.curso.findMany({
      include: {
        professores: {
          select: { nome: true },
        },
      },
    });
    res.json(cursos);
  } catch (err) {
    console.error('Erro ao buscar cursos:', err);
    res.status(500).json({ erro: 'Erro ao buscar cursos' });
  }
});

// Buscar o primeiro vídeo do primeiro módulo do curso
app.get('/api/Mvideos/:cursoId', async (req, res) => {
  const cursoId = parseInt(req.params.cursoId);

  try {
    const cursoComModulos = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        modulo: {
          include: {
            video: true
          }
        }
      }
    });

    const primeiroModulo = cursoComModulos?.modulo[0];
    if (!primeiroModulo || primeiroModulo.video.length === 0) {
      return res.status(404).json({ erro: 'Nenhum vídeo encontrado para esse curso' });
    }

    const primeiroVideo = primeiroModulo.video[0];

    res.json({
      id: primeiroVideo.id,
      titulo: primeiroVideo.titulo,
      url: primeiroVideo.urlVideo
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar vídeo do curso' });
  }
});

// Matricular usuário em curso
app.post('/api/Mmatricular', async (req, res) => {
  const { userId, cursoId } = req.body;

  if (!userId || !cursoId) {
    return res.status(400).json({ message: 'Parâmetros ausentes' });
  }

  try {
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        cursosMatriculados: {
          connect: { id: cursoId }
        }
      }
    });

    res.status(200).json({ message: 'Matrícula realizada com sucesso' });
  } catch (error) {
    console.error('Erro ao matricular:', error);
    res.status(500).json({ message: 'Erro ao matricular', error: error.message });
  }
});

// Buscar cursos matriculados do usuário
app.get('/api/Mmeus-cursos/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        cursosMatriculados: {
          include: {
            modulo: {
              include: {
                video: true
              }
            }
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(usuario.cursosMatriculados);
  } catch (error) {
    console.error('Erro ao buscar cursos do usuário:', error);
    res.status(500).json({ message: 'Erro interno', error: error.message });
  }
});

// Buscar apostilas
app.get('/api/Mapostilas/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const cursosMatriculados = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        cursosMatriculados: {
          include: {
            modulo: {
              include: {
                apostila: true
              }
            }
          }
        }
      }
    });

    const apostilas = cursosMatriculados.cursosMatriculados.flatMap(curso =>
      curso.modulo.flatMap(modulo =>
        modulo.apostila.map(apostila => ({
          cursoTitulo: curso.titulo,
          titulo: apostila.titulo,
          url: apostila.arquivoUrl
        }))
      )
    );

    res.json(apostilas);
  } catch (error) {
    console.error('Erro ao buscar apostilas:', error);
    res.status(500).json({ erro: 'Erro ao buscar apostilas' });
  }
});

// Buscar avaliações
app.get('/api/Mavaliacoes/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const cursosMatriculados = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        cursosMatriculados: {
          include: {
            modulo: {
              include: {
                avaliacao: true
              }
            }
          }
        }
      }
    });

    const avaliacoes = cursosMatriculados.cursosMatriculados.flatMap(curso =>
      curso.modulo.flatMap(modulo =>
        modulo.avaliacao.map(avaliacao => ({
          cursoTitulo: curso.titulo,
          titulo: avaliacao.titulo,
          url: avaliacao.url
        }))
      )
    );

    res.json(avaliacoes);
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    res.status(500).json({ erro: 'Erro ao buscar avaliações' });
  }
});

// Buscar progresso do vídeo
app.get('/api/Mprogresso-video/:alunoId/:videoId', async (req, res) => {
  const alunoId = parseInt(req.params.alunoId);
  const videoId = parseInt(req.params.videoId);

  try {
    const progresso = await prisma.progressovideo.findUnique({
      where: {
        alunoId_videoId: {
          alunoId,
          videoId
        }
      }
    });

    res.json(progresso || { progressoVideo: 0 });
  } catch (error) {
    console.error('Erro ao buscar progresso do vídeo:', error);
    res.status(500).json({ erro: 'Erro ao buscar progresso do vídeo' });
  }
});

// Atualizar progresso do vídeo
app.post('/api/Mprogresso-video', async (req, res) => {
  const { alunoId, videoId } = req.body;

  if (!alunoId || !videoId) {
    return res.status(400).json({ erro: 'Parâmetros ausentes' });
  }

  try {
    const progressoAtualizado = await prisma.progressovideo.upsert({
      where: {
        alunoId_videoId: {
          alunoId,
          videoId
        }
      },
      update: {
        progressoVideo: 100,
        dataUltimaInteracao: new Date()
      },
      create: {
        alunoId,
        videoId,
        progressoVideo: 100,
        dataUltimaInteracao: new Date()
      }
    });

    res.json(progressoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar progresso do vídeo:', error);
    res.status(500).json({ erro: 'Erro ao atualizar progresso do vídeo' });
  }
});

app.get('/api/plano', async (req, res) => {
    try {
        const planos = await prisma.plano.findMany(); // Busca os planos no banco de dados
        res.json(planos);
    } catch (error) {
        console.error('Erro ao buscar planos:', error);
        res.status(500).json({ error: 'Erro ao buscar planos' });
    }
});

app.get('/api/curso', async (req, res) => {
  try {
    const cursos = await prisma.curso.findMany(); // Corrija aqui para buscar cursos
    res.json(cursos);
  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    res.status(500).json({ error: 'Erro ao buscar cursos' });
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

app.post('/api/salvar-usuario', async (req, res) => {
    const {
        nome,
        sobrenome,
        email,
        cpf,
        senha,
        tipo,
        planoId,
        formaPagamento,
        dadosCartao
    } = req.body;

    console.log("Dados recebidos no backend:", req.body);
    console.log("Valor de email antes da verificação:", email);

    try {
        if (!email) {
            return res.status(400).json({ error: "Email não informado na requisição." });
        }

        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email },
        });

        if (usuarioExistente) {
            return res.status(400).json({ error: "E-mail já cadastrado." });
        }

        const nomeCompleto = `${nome} ${sobrenome}`;

        function limparCPF(cpf) {
            if (!cpf) return null;
            return cpf.replace(/\D/g, '');
        }

        const cpfLimpo = limparCPF(cpf);

        const dadosUsuario = {
            nome: nomeCompleto,
            email: email,
            senha: senha, // em produção, use hash com bcrypt
            cpf: cpfLimpo,
            tipo: tipo,
        };

        if (tipo !== "professor" && tipo !== "admin") {
            dadosUsuario.planoId = planoId;
        }

        const novoUsuario = await prisma.usuario.create({
            data: dadosUsuario,
        });

        console.log("Usuário criado com sucesso:", novoUsuario);

        // SALVAR FORMA DE PAGAMENTO apenas se NÃO for admin e NÃO for professor
        if (tipo !== "admin" && tipo !== "professor") {
            console.log("Forma de pagamento:", formaPagamento);
            console.log("Dados do cartão:", dadosCartao);

            if (formaPagamento === "CartaoCredito") {
                if (
                    !dadosCartao ||
                    !dadosCartao.titular ||
                    !dadosCartao.numero ||
                    !dadosCartao.validade ||
                    !dadosCartao.cvv
                ) {
                    return res.status(400).json({ error: "Dados do cartão de crédito estão incompletos." });
                }

                await prisma.formapagamento.create({
                    data: {
                        tipo: formaPagamento,
                        titular: dadosCartao.titular,
                        numero: dadosCartao.numero,
                        validade: dadosCartao.validade,
                        cvv: dadosCartao.cvv,
                        parcelas: dadosCartao.parcelas ?? 1,
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
            } else {
                return res.status(400).json({ error: "Forma de pagamento inválida." });
            }
        }

        let cursosProfessor = [];

        if (tipo === "professor") {
            const professorComCursos = await prisma.usuario.findUnique({
                where: { id: novoUsuario.id },
                include: {
                    cursosMinistrados: true
                }
            });

            if (professorComCursos) {
                cursosProfessor = professorComCursos.cursosMinistrados;
            }
        }

        res.status(200).json({
            message: "Usuário e forma de pagamento salvos com sucesso!",
            usuarioId: novoUsuario.id,
            cursos: cursosProfessor,
        });

    } catch (error) {
        console.error("Erro ao salvar os dados no banco:", error);
        res.status(500).json({
            error: "Erro ao salvar os dados.",
            detalhes: error.message || "Erro interno"
        });
    }
});


/*app.post('/api/salvar-usuario', async (req, res) => {
  
    const {
        nome,
        sobrenome,
        email,
        cpf,
        senha,
        tipo,
        planoId,
        formaPagamento,
        dadosCartao
    } = req.body;

    console.log("Dados recebidos no backend:", req.body);
    console.log("Valor de email antes da verificação:", email);

    try {
        if (!email) {
            return res.status(400).json({ error: "Email não informado na requisição." });
        }
        
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email },
        });

        if (usuarioExistente) {
            return res.status(400).json({ error: "E-mail já cadastrado." });
        }

        const nomeCompleto = `${nome} ${sobrenome}`;
        function limparCPF(cpf) {
    if (!cpf) return null;
    return cpf.replace(/\D/g, ''); // Remove tudo que não é número
    
}
// No seu endpoint, antes de montar dadosUsuario:
const cpfLimpo = limparCPF(cpf);
        const dadosUsuario = {
            nome: nomeCompleto,
            email: email,
            senha: senha, // em produção, usar bcrypt
            cpf: cpfLimpo,
            tipo: tipo,
        };

        if (tipo !== "professor" && tipo!== "admin") {
            dadosUsuario.planoId = planoId;
        }

        const novoUsuario = await prisma.usuario.create({
            data: dadosUsuario,
        });

        console.log("Usuário criado com sucesso:", novoUsuario);

        // SALVAR FORMA DE PAGAMENTO SE NÃO FOR PROFESSOR
        if (tipo !== "professor") {
            console.log("Forma de pagamento:", formaPagamento);
            console.log("Dados do cartão:", dadosCartao);

            if (formaPagamento === "CartaoCredito") {
                if (
                    !dadosCartao ||
                    !dadosCartao.titular ||
                    !dadosCartao.numero ||
                    !dadosCartao.validade ||
                    !dadosCartao.cvv
                ) {
                    return res.status(400).json({ error: "Dados do cartão de crédito estão incompletos." });
                }

                await prisma.formapagamento.create({
                    data: {
                        tipo: formaPagamento,
                        titular: dadosCartao.titular,
                        numero: dadosCartao.numero,
                        validade: dadosCartao.validade,
                        cvv: dadosCartao.cvv,
                        parcelas: dadosCartao.parcelas ?? 1,
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
            } else {
                return res.status(400).json({ error: "Forma de pagamento inválida." });
            }
        }

        let cursosProfessor = [];

        if (tipo === "professor") {
            const professorComCursos = await prisma.usuario.findUnique({
                where: { id: novoUsuario.id },
                include: {
                    cursosMinistrados: true // nome do relacionamento no Prisma
                }
            });

            if (professorComCursos) {
                cursosProfessor = professorComCursos.cursosMinistrados;
            }
        }

        // Aqui o res deve ser enviado para todos os casos
        res.status(200).json({
            message: "Usuário e forma de pagamento salvos com sucesso!",
            usuarioId: novoUsuario.id,
            cursos: cursosProfessor, // pode enviar cursos caso queira
        });

    } catch (error) {
        console.error("Erro ao salvar os dados no banco:", error);
        res.status(500).json({
            error: "Erro ao salvar os dados.",
            detalhes: error.message || "Erro interno"
        });
    }
});*/

app.get('/api/buscar-professor', async (req, res) => {
  console.log("Rota /api/buscar-professor foi chamada");

  const { nome, cpf } = req.query;
  try {
    const filtro = { tipo: 'professor' };

    if (nome) {
      filtro.nome = { contains: nome }; // sem `mode`, já que sua versão do Prisma não suporta
    }
    if (cpf) {
      filtro.cpf = cpf;
    }

    const usuarios = await prisma.usuario.findMany({ where: filtro });
    res.json(usuarios);
  } catch (error) {
    console.error("Erro ao buscar professor:", error);
    res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
});


app.get('/api/cursos-professor/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const cursos = await prisma.curso.findMany({
      where: {
        professores: {
          some: {
            id: Number(id)
          }
        }
      },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        cargaHoraria: true
      }
    });
    res.json(cursos);
  } catch (error) {
    console.error('Erro ao buscar cursos do professor:', error);
    res.status(500).json({ error: 'Erro ao buscar cursos do professor' });
  }
});

/*fetch("http://localhost:3000/api/plano")
  .then(response => response.json())
  .then(data => {
    console.log('Planos recebidos:', data);
    // Aqui você pode manipular os dados recebidos e exibir no front-end
  })
  .catch(error => {
    console.error("Erro ao buscar planos:", error);
  });*/
  
 
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

        res.status(200).json({ 
          id: usuario.id,  // enviar o id para o frontend
          tipo: usuario.tipo 
        });
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

app.get('/api/cursos-professor/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const cursos = await prisma.curso.findMany({
      where: {
        cursosMinistrados: {
          some: {
            id: Number(id)
          }
        }
      },
      select: {
        id: true,
        titulo: true,
        descricao: true,
        cargaHoraria: true
      }
    });
    res.json(cursos);
  } catch (error) {
    console.error('Erro ao buscar cursos do professor:', error);
    res.status(500).json({ error: 'Erro ao buscar cursos do professor' });
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

/*
app.post('/api/atribuir-cursos-professor', async (req, res) => {
  const { professorId, cursosIds } = req.body; // cursosIds: array de IDs dos cursos

  if (!professorId || !Array.isArray(cursosIds)) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  try {
    const professor = await prisma.usuario.update({
      where: { id: professorId },
      data: {
        cursosMinistrados: {
          set: cursosIds.map(id => ({ id })) // substitui todos os cursos ministrados por esses
        }
      }
    });
    res.json({ success: true, professor });
  } catch (error) {
    console.error('Erro ao atribuir cursos ao professor:', error);
    res.status(500).json({ error: 'Erro ao atribuir cursos ao professor.' });
  }
});*/

app.post('/api/atribuir-cursos-professor', async (req, res) => {
  const { professorId, cursosIds } = req.body;

  if (!professorId || !Array.isArray(cursosIds)) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }

  try {
    // Busca os cursos já associados ao professor
    const professorAtual = await prisma.usuario.findUnique({
      where: { id: professorId },
      include: { cursosMinistrados: true }
    });

    const cursosJaAssociados = professorAtual.cursosMinistrados.map(c => c.id);

    // Filtra apenas os cursos que ainda não estão associados
    const novosCursos = cursosIds.filter(id => !cursosJaAssociados.includes(id));

    // Se não houver novos cursos para associar, retorna sem erro
    if (novosCursos.length === 0) {
      return res.json({ success: true, message: 'Todos os cursos já estavam associados.' });
    }

    // Associa os cursos restantes
    const professor = await prisma.usuario.update({
      where: { id: professorId },
      data: {
        cursosMinistrados: {
          connect: novosCursos.map(id => ({ id }))
        }
      }
    });

    res.json({ success: true, professor });
  } catch (error) {
    console.error('Erro ao atribuir cursos ao professor:', error);
    res.status(500).json({ error: 'Erro ao atribuir cursos ao professor.' });
  }
});


// Exemplo: GET /api/cursos-professor?professorId=5
/*app.get('/api/cursos-professor', async (req, res) => {
    const professorId = Number(req.query.professorId);
    if (!professorId) {
        return res.status(400).json({ error: 'ID do professor não informado.' });
    }
    try {
        const professor = await prisma.usuario.findUnique({
            where: { id: professorId },
            include: {
                cursosMinistrados: {
                    include: {
                        professores: { select: { nome: true } }
                    }
                }
            }
        });
        if (!professor) return res.json([]);
        // Formata os cursos para o frontend
        const cursos = professor.cursosMinistrados.map(curso => ({
            id: curso.id,
            titulo: curso.titulo,
            descricao: curso.descricao,
            cargaHoraria: curso.cargaHoraria,
            professorNome: curso.professores.map(p => p.nome).join(', ')
        }));
        res.json(cursos);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cursos do professor.' });
    }
});*/

// Exemplo usando Express e Prisma
app.get('/api/cursos-professor', async (req, res) => {
  const { professorId } = req.query;

  if (!professorId) {
    return res.status(400).json({ error: 'ID do professor não fornecido.' });
  }

  try {
    const professor = await prisma.usuario.findUnique({
      where: { id: parseInt(professorId) },
      include: {
        cursosMinistrados: true, // campo definido no schema
      },
    });

    if (!professor) {
      return res.status(404).json({ error: 'Professor não encontrado.' });
    }

    res.json(professor.cursosMinistrados || []); // retornar array vazio se não houver
  } catch (error) {
    console.error('Erro ao buscar cursos do professor:', error);
    res.status(500).json({ error: 'Erro interno ao buscar cursos do professor.' });
  }
});

app.get('/api/modulos-curso/:id', async (req, res) => {
  const cursoId = parseInt(req.params.id);

  try {
    const curso = await prisma.curso.findUnique({
      where: { id: cursoId },
      include: {
        modulo: {
          orderBy: { ordem: 'asc' },
          include: {
            apostila: true,
            avaliacao: true,
            video: true
          }
        }
      }
    });

    if (!curso) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    res.json(curso.modulo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar módulos' });
  }
});

app.get('/api/modulo', async (req, res) => {
  const cursoId = parseInt(req.query.cursoId, 10);
  if (isNaN(cursoId)) {
    return res.status(400).json({ error: 'cursoId inválido' });
  }
  try {
    const modulos = await prisma.modulo.findMany({
      where: { cursoId },
      select: {
        id: true,
        titulo: true,
        ordem: true
      }
    });
    res.json(modulos);
  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    res.status(500).json({ error: 'Erro ao buscar módulos' });
  }
});

// Exemplo de rota no backend (Node + Express + Prisma)
app.get('/api/modulo/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const modulo = await prisma.modulo.findUnique({
      where: { id },
      include: {
        apostila: true,
        video: true,
        avaliacao: true,
      },
    });

    if (!modulo) {
      return res.status(404).json({ error: 'Módulo não encontrado' });
    }

    res.json(modulo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar módulo' });
  }
});

app.delete('/api/modulo/:id', async (req, res) => {
  const moduloid = parseInt(req.params.id, 10);
  if (isNaN(moduloid)) {
    return res.status(400).json({ error: 'ID de módulo inválido' });
  }
  try {
    await prisma.modulo.delete({ where: { id: moduloid } });
    res.status(200).json({ message: 'Módulo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir módulo:', error);
    res.status(500).json({ error: 'Erro ao excluir módulo' });
  }
});

/*app.put('/api/modulo/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { titulo, ordem } = req.body;
  if (isNaN(id) || !titulo || ordem === undefined) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }
  try {
    const atualizado = await prisma.modulo.update({
      where: { id },
      data: { titulo, ordem: parseInt(ordem, 10) }
    });
    res.json(atualizado);
  } catch (error) {
    console.error('Erro ao atualizar módulo:', error);
    res.status(500).json({ error: 'Falha na atualização.' });
  }
});*/


/*app.put('/api/modulo/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const {
    titulo,
    ordem,
    videoTitulo,
    videoLink,
    videoDuracao,
    apostilaTitulo,
    apostilaLink,
    avaliacaoTitulo,
    avaliacaoLink
  } = req.body;

  try {
    // Atualiza o módulo principal
    const moduloAtualizado = await prisma.modulo.update({
      where: { id },
      data: {
        titulo,
        ordem,
      }
    });

    // Atualiza o vídeo (assume-se que só há 1 por módulo)
    await prisma.video.upsert({
      where: { moduloId: id },
      update: {
        titulo: videoTitulo,
        link: videoLink,
        duracao: videoDuracao
      },
      create: {
        moduloId: id,
        titulo: videoTitulo,
        link: videoLink,
        duracao: videoDuracao
      }
    });

    // Atualiza a apostila
    await prisma.apostila.upsert({
      where: { moduloId: id },
      update: {
        titulo: apostilaTitulo,
        link: apostilaLink
      },
      create: {
        moduloId: id,
        titulo: apostilaTitulo,
        link: apostilaLink
      }
    });

    // Atualiza a avaliação
    await prisma.avaliacao.upsert({
      where: { moduloId: id },
      update: {
        titulo: avaliacaoTitulo,
        link: avaliacaoLink
      },
      create: {
        moduloId: id,
        titulo: avaliacaoTitulo,
        link: avaliacaoLink
      }
    });

    res.json({ success: true, moduloAtualizado });

  } catch (error) {
    console.error('Erro ao atualizar módulo e relações:', error);
    res.status(500).json({ error: 'Erro ao atualizar módulo e dados relacionados' });
  }
});*/

// Rota para buscar módulos com relações
app.get('/api/modulo', async (req, res) => {
  const cursoId = parseInt(req.query.cursoId);
  const includeRelations = req.query.includeRelations === 'true';

  try {
    let modulos;
    
    if (includeRelations) {
      modulos = await prisma.modulo.findMany({
        where: { cursoId },
        include: {
          video: true,
          apostila: true,
          avaliacao: true
        }
      });
    } else {
      modulos = await prisma.modulo.findMany({
        where: { cursoId }
      });
    }

    res.json(modulos);
  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    res.status(500).json({ error: 'Erro ao buscar módulos' });
  }
});

// Rota para buscar módulo completo
app.get('/api/modulo-completo/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const modulo = await prisma.modulo.findUnique({
      where: { id },
      include: {
        video: true,
        apostila: true,
        avaliacao: true
      }
    });

    if (!modulo) {
      return res.status(404).json({ 
        success: false,
        error: 'Módulo não encontrado'
      });
    }

    res.json({
      success: true,
      data: modulo
    });
  } catch (error) {
    console.error('Erro ao buscar módulo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno no servidor'
    });
  }
});

// Rota para atualizar módulo e relações
/*app.put('/api/modulo/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { titulo, ordem, video, apostila, avaliacao } = req.body;

  try {
    // Inicia transação
    const [moduloAtualizado] = await prisma.$transaction([
      // Atualiza módulo
      prisma.modulo.update({
        where: { id },
        data: { titulo, ordem }
      }),
      
      // Atualiza/insere vídeo (se existir)
      video?.titulo && prisma.video.upsert({
        where: { moduloId: id },
        update: {
          titulo: video.titulo,
          urlVideo: video.urlVideo,
          duracao: video.duracao
        },
        create: {
          moduloId: id,
          titulo: video.titulo,
          urlVideo: video.urlVideo,
          duracao: video.duracao
        }
      }),
      
      // Atualiza/insere apostila (se existir)
      apostila?.titulo && prisma.apostila.upsert({
        where: { moduloId: id },
        update: {
          titulo: apostila.titulo,
          arquivoUrl: apostila.arquivoUrl
        },
        create: {
          moduloId: id,
          titulo: apostila.titulo,
          arquivoUrl: apostila.arquivoUrl
        }
      }),
      
      // Atualiza/insere avaliação (se existir)
      avaliacao?.titulo && prisma.avaliacao.upsert({
        where: { moduloId: id },
        update: {
          titulo: avaliacao.titulo,
          url: avaliacao.url
        },
        create: {
          moduloId: id,
          titulo: avaliacao.titulo,
          url: avaliacao.url
        }
      })
    ].filter(Boolean)); // Remove operações nulas

    res.json({ success: true, modulo: moduloAtualizado });
  } catch (error) {
    console.error('Erro ao atualizar módulo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao atualizar módulo'
    });
  }
});

app.put('/api/modulo/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // Validação dos dados obrigatórios
  if (!req.body.titulo || req.body.ordem === undefined) {
    return res.status(400).json({ error: 'Título e ordem são obrigatórios' });
  }

  const {
    titulo,
    ordem,
    videoTitulo = null,
    videoLink = null,
    videoDuracao = null,
    apostilaTitulo = null,
    apostilaLink = null,
    avaliacaoTitulo = null,
    avaliacaoLink = null
  } = req.body;

  try {
    // Usando transaction para garantir atomicidade
    const [moduloAtualizado] = await prisma.$transaction([
      // Atualiza o módulo principal
      prisma.modulo.update({
        where: { id },
        data: { titulo, ordem }
      }),

      // Atualiza/Cria o vídeo
      prisma.video.upsert({
        where: { moduloId: id },
        update: { titulo: videoTitulo, link: videoLink, duracao: videoDuracao },
        create: { moduloId: id, titulo: videoTitulo, link: videoLink, duracao: videoDuracao }
      }),

      // Atualiza/Cria a apostila
      prisma.apostila.upsert({
        where: { moduloId: id },
        update: { titulo: apostilaTitulo, link: apostilaLink },
        create: { moduloId: id, titulo: apostilaTitulo, link: apostilaLink }
      }),

      // Atualiza/Cria a avaliação
      prisma.avaliacao.upsert({
        where: { moduloId: id },
        update: { titulo: avaliacaoTitulo, link: avaliacaoLink },
        create: { moduloId: id, titulo: avaliacaoTitulo, link: avaliacaoLink }
      })
    ]);

    // Busca o módulo atualizado com todas as relações
    const moduloCompleto = await prisma.modulo.findUnique({
      where: { id },
      include: {
        video: true,
        apostila: true,
        avaliacao: true
      }
    });

    res.json({ 
      success: true, 
      modulo: moduloCompleto,
      message: 'Módulo e recursos atualizados com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao atualizar módulo:', error);
    
    // Mensagens de erro mais específicas
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Módulo não encontrado' });
    }
    
    res.status(500).json({ 
      error: 'Erro ao atualizar módulo',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
*/

app.put('/api/modulo/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // Validação básica
  if (!req.body.titulo || req.body.ordem === undefined) {
    return res.status(400).json({ error: 'Título e ordem são obrigatórios' });
  }

  const { titulo, ordem } = req.body;

  try {
    // 1. Primeiro verifica se o módulo existe
    const moduloExistente = await prisma.modulo.findUnique({
      where: { id },
      include: {
        video: true,
        apostila: true,
        avaliacao: true
      }
    });

    if (!moduloExistente) {
      return res.status(404).json({ error: 'Módulo não encontrado' });
    }

    // 2. Atualiza apenas o módulo (operações relacionadas em endpoints separados)
    const moduloAtualizado = await prisma.modulo.update({
      where: { id },
      data: { titulo, ordem },
      include: {
        video: true,
        apostila: true,
        avaliacao: true
      }
    });

    res.json({
      success: true,
      data: moduloAtualizado,
      message: 'Módulo atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar módulo:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Módulo não encontrado' });
    }
    
    res.status(500).json({ 
      error: 'Erro interno no servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/modulo/:id/video', async (req, res) => {
  const moduloId = parseInt(req.params.id);
  const { titulo, urlVideo, duracao } = req.body;

  try {
    // Verifica se já existe vídeo para este módulo
    const videoExistente = await prisma.video.findFirst({
      where: { moduloId }
    });

    let video;
    if (videoExistente) {
      video = await prisma.video.update({
        where: { id: videoExistente.id },
        data: { titulo, urlVideo, duracao }
      });
    } else {
      video = await prisma.video.create({
        data: {
          titulo,
          urlVideo,
          duracao,
          moduloId
        }
      });
    }

    res.json(video);
  } catch (error) {
    console.error('Erro ao atualizar vídeo:', error);
    res.status(500).json({ error: 'Erro ao atualizar vídeo' });
  }
});

app.put('/api/modulo/:id/apostila', async (req, res) => {
  const moduloId = parseInt(req.params.id);
  const { titulo, arquivoUrl } = req.body;

  try {
    const apostilaExistente = await prisma.apostila.findFirst({
      where: { moduloId }
    });

    let apostila;
    if (apostilaExistente) {
      apostila = await prisma.apostila.update({
        where: { id: apostilaExistente.id },
        data: { titulo, arquivoUrl }
      });
    } else {
      apostila = await prisma.apostila.create({
        data: {
          titulo,
          arquivoUrl,
          moduloId
        }
      });
    }

    res.json(apostila);
  } catch (error) {
    console.error('Erro ao atualizar apostila:', error);
    res.status(500).json({ error: 'Erro ao atualizar apostila' });
  }
});

app.put('/api/modulo/:id/avaliacao', async (req, res) => {
  const moduloId = parseInt(req.params.id);
  const { titulo, url } = req.body;

  try {
    const avaliacaoExistente = await prisma.avaliacao.findFirst({
      where: { moduloId }
    });

    let avaliacao;
    if (avaliacaoExistente) {
      avaliacao = await prisma.avaliacao.update({
        where: { id: avaliacaoExistente.id },
        data: { titulo, url }
      });
    } else {
      avaliacao = await prisma.avaliacao.create({
        data: {
          titulo,
          url,
          moduloId
        }
      });
    }

    res.json(avaliacao);
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    res.status(500).json({ error: 'Erro ao atualizar avaliação' });
  }
});

app.get('/api/modulo-completo/:id', async (req, res) => {
  // Validação mais rigorosa do ID
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ 
      success: false,
      error: 'ID inválido',
      details: `O ID deve ser um número inteiro positivo. Recebido: ${req.params.id}`
    });
  }

  try {
    const modulo = await prisma.modulo.findUnique({
      where: { id },
      include: {
        video: {
          select: {
            id: true,
            titulo: true,
            link: true,
            duracao: true,
            moduloId: true
          }
        },
        apostila: {
          select: {
            id: true,
            titulo: true,
            link: true,
            moduloId: true
          }
        },
        avaliacao: {
          select: {
            id: true,
            titulo: true,
            link: true,
            moduloId: true
          }
        }
      }
    });

    if (!modulo) {
      return res.status(404).json({ 
        success: false,
        error: 'Módulo não encontrado',
        details: `Nenhum módulo encontrado com o ID: ${id}`
      });
    }

    // Formata a resposta de forma consistente
    res.json({
      success: true,
      data: {
        ...modulo,
        video: modulo.video || null,
        apostila: modulo.apostila || null,
        avaliacao: modulo.avaliacao || null
      }
    });

  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/usuarios', async (req, res) => {
  try {
    const query = req.query.query?.toLowerCase();

    if (!query) {
      return res.status(400).json({ error: 'Parâmetro "query" é obrigatório' });
    }

    const usuarios = await prisma.usuario.findMany({
      where: {
        OR: [
          { nome: { contains: query } },
      { email: { contains: query } }
    ]
  }
});
    res.json(usuarios);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/*app.put('/api/usuarios/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { nome, sobrenome, email, cpf, tipo } = req.body;

  try {
    // Atualiza o usuário no banco
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: { nome, sobrenome, email, cpf, tipo }
    });

    return res.json(usuarioAtualizado);
  } catch (erro) {
    console.error('Erro ao atualizar usuário:', erro);
    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});*/

app.put('/api/usuarios/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, sobrenome, email, cpf, tipo } = req.body;

    const nomeCompleto = `${nome} ${sobrenome}`;

    try {
        const usuarioAtualizado = await prisma.usuario.update({
            where: { id: Number(id) },
            data: {
                nome: nomeCompleto,
                email,
                cpf,
                tipo,
            },
        });

        res.json(usuarioAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário.' });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
