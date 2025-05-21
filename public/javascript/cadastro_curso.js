// Credenciais do administrador
const credenciaisAdmin = {
    usuario: "admin",
    senha: "admin123"
};

// Array para armazenar os cursos
let cursos = [];
let cursoEmEdicao = null;

// Elementos do DOM
const secaoLogin = document.getElementById('secaoLogin');
const painelAdmin = document.getElementById('painelAdmin');
const formularioLogin = document.getElementById('formularioLogin');
const botaoSair = document.getElementById('botaoSair');
const corpoTabelaCursos = document.getElementById('corpoTabelaCursos');
const formularioCurso = document.getElementById('formularioCurso');
const erroLogin = document.getElementById('erroLogin');
const mensagemSucesso = document.getElementById('mensagemSucesso');
const botaoCancelar = document.getElementById('botaoCancelar');
const tituloFormulario = document.getElementById('tituloFormulario');

// Recursos temporários para o formulário
let videosTemp = [];
let apostilasTemp = [];
let avaliacoesTemp = [];

// Verificar se há um token de login no localStorage
if (localStorage.getItem('adminLogado') === 'true') {
    mostrarPainelAdmin();
}

// Evento de login
formularioLogin.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    if (usuario === credenciaisAdmin.usuario && senha === credenciaisAdmin.senha) {
        localStorage.setItem('adminLogado', 'true');
        mostrarPainelAdmin();
        erroLogin.style.display = 'none';
    } else {
        erroLogin.style.display = 'block';
    }
});

// Evento de logout
botaoSair.addEventListener('click', function() {
    localStorage.removeItem('adminLogado');
    mostrarSecaoLogin();
    formularioLogin.reset();
});

// Evento para cancelar edição
botaoCancelar.addEventListener('click', function() {
    limparFormulario();
    cursoEmEdicao = null;
    botaoCancelar.style.display = 'none';
    tituloFormulario.textContent = 'Adicionar Novo Curso';
});

// Evento para adicionar/editar curso
formularioCurso.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const categoria = document.getElementById('categoriacurso').value;
    const nome = document.getElementById('nomecurso').value;
    const descricao = document.getElementById('descricao_curso').value;
    
    const curso = {
        categoria,
        nome,
        descricao,
        videos: [...videosTemp],
        apostilas: [...apostilasTemp],
        avaliacoes: [...avaliacoesTemp]
    };
    
    if (cursoEmEdicao !== null) {
        // Editar curso existente
        curso.id = cursoEmEdicao.id;
        const index = cursos.findIndex(c => c.id === cursoEmEdicao.id);
        if (index !== -1) {
            cursos[index] = curso;
            mostrarMensagemSucesso('Curso atualizado com sucesso!');
        }
    } else {
        // Adicionar novo curso
        curso.id = cursos.length > 0 ? Math.max(...cursos.map(c => c.id)) + 1 : 1;
        cursos.push(curso);
        mostrarMensagemSucesso('Curso cadastrado com sucesso!');
    }
    
    renderizarTabelaCursos();
    limparFormulario();
});

// Função para adicionar vídeo
window.adicionarVideo = function() {
    const link = document.getElementById('linkvideo').value.trim();
    const tempo = document.getElementById('tempoVideo').value;
    
    if (link) {
        videosTemp.push({ link, tempo });
        document.getElementById('linkvideo').value = '';
        document.getElementById('tempoVideo').value = '';
        renderizarTabelaVideos();
    }
};

// Função para adicionar apostila
window.adicionarApostila = function() {
    const arquivoInput = document.getElementById('arquivoApostila');
    const nome = document.getElementById('nomeApostila').value.trim();
    
    if (arquivoInput.files.length > 0 && nome) {
        const arquivo = arquivoInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            apostilasTemp.push({
                nome,
                nomeArquivo: arquivo.name,
                dados: e.target.result.split(',')[1] // Remove o prefixo data:...
            });
            renderizarTabelaApostilas();
            document.getElementById('nomeApostila').value = '';
            arquivoInput.value = '';
        };
        
        reader.readAsDataURL(arquivo);
    }
};

// Função para adicionar avaliação
window.adicionarAvaliacao = function() {
    const titulo = document.getElementById('tituloAvaliacao').value.trim();
    const link = document.getElementById('linkAvaliacao').value.trim();
    
    if (titulo && link) {
        avaliacoesTemp.push({
            titulo,
            link
        });
        renderizarTabelaAvaliacoes();
        document.getElementById('tituloAvaliacao').value = '';
        document.getElementById('linkAvaliacao').value = '';
    }
};

// Função para remover vídeo
window.removerVideo = function(index) {
    videosTemp.splice(index, 1);
    renderizarTabelaVideos();
};

// Função para remover apostila
window.removerApostila = function(index) {
    apostilasTemp.splice(index, 1);
    renderizarTabelaApostilas();
};

// Função para remover avaliação
window.removerAvaliacao = function(index) {
    avaliacoesTemp.splice(index, 1);
    renderizarTabelaAvaliacoes();
};

// Função para exibir o painel do administrador
function mostrarPainelAdmin() {
    secaoLogin.style.display = 'none';
    painelAdmin.style.display = 'block';
    renderizarTabelaCursos();
}

// Função para exibir a seção de login
function mostrarSecaoLogin() {
    secaoLogin.style.display = 'block';
    painelAdmin.style.display = 'none';
}

// Função para renderizar a tabela de cursos
function renderizarTabelaCursos() {
    corpoTabelaCursos.innerHTML = '';
    
    if (cursos.length === 0) {
        corpoTabelaCursos.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum curso cadastrado</td></tr>';
        return;
    }
    
    cursos.forEach(curso => {
        const linha = document.createElement('tr');
        const cargaHoraria = calcularCargaHoraria(curso.videos);
        
        linha.innerHTML = `
            <td>${curso.id}</td>
            <td>${curso.categoria}</td>
            <td>${curso.nome}</td>
            <td>${curso.descricao.substring(0, 50)}${curso.descricao.length > 50 ? '...' : ''}</td>
            <td>${cargaHoraria}</td>
            <td>${curso.apostilas.length}</td>
            <td>${curso.avaliacoes.length}</td>
            <td>
                <button onclick="editarCurso(${curso.id})" class="botao-editar">Editar</button>
                <button onclick="excluirCurso(${curso.id})" class="botao-excluir">Excluir</button>
            </td>
        `;
        
        corpoTabelaCursos.appendChild(linha);
    });
}

// Função para renderizar a tabela de vídeos no formulário
function renderizarTabelaVideos() {
    const tabela = document.getElementById('tabelaVideos');
    tabela.innerHTML = '';
    
    if (videosTemp.length === 0) {
        tabela.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhum vídeo adicionado</td></tr>';
        return;
    }
    
    videosTemp.forEach((video, index) => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td><a href="${video.link}" target="_blank">Ver vídeo</a></td>
            <td>${video.tempo || '--:--:--'}</td>
            <td><button onclick="removerVideo(${index})" class="botao-excluir">Remover</button></td>
        `;
        tabela.appendChild(linha);
    });
}

// Função para renderizar a tabela de apostilas no formulário
function renderizarTabelaApostilas() {
    const tabela = document.getElementById('tabelaApostilas');
    tabela.innerHTML = '';
    
    if (apostilasTemp.length === 0) {
        tabela.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhuma apostila adicionada</td></tr>';
        return;
    }
    
    apostilasTemp.forEach((apostila, index) => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${apostila.nome}</td>
            <td>${apostila.nomeArquivo}</td>
            <td><button onclick="removerApostila(${index})" class="botao-excluir">Remover</button></td>
        `;
        tabela.appendChild(linha);
    });
}

// Função para renderizar a tabela de avaliações no formulário
function renderizarTabelaAvaliacoes() {
    const tabela = document.getElementById('tabelaAvaliacoes');
    tabela.innerHTML = '';
    
    if (avaliacoesTemp.length === 0) {
        tabela.innerHTML = '<tr><td colspan="3" style="text-align: center;">Nenhuma avaliação adicionada</td></tr>';
        return;
    }
    
    avaliacoesTemp.forEach((avaliacao, index) => {
        const linha = document.createElement('tr');
        linha.innerHTML = `
            <td>${avaliacao.titulo}</td>
            <td><a href="${avaliacao.link}" target="_blank">Acessar avaliação</a></td>
            <td><button onclick="removerAvaliacao(${index})" class="botao-excluir">Remover</button></td>
        `;
        tabela.appendChild(linha);
    });
}

// Função para editar curso
window.editarCurso = function(id) {
    const curso = cursos.find(c => c.id === id);
    
    if (curso) {
        cursoEmEdicao = curso;
        
        // Preencher campos básicos
        document.getElementById('categoriacurso').value = curso.categoria;
        document.getElementById('nomecurso').value = curso.nome;
        document.getElementById('descricao_curso').value = curso.descricao;
        
        // Preencher recursos
        videosTemp = [...curso.videos];
        apostilasTemp = [...curso.apostilas];
        avaliacoesTemp = [...curso.avaliacoes];
        
        renderizarTabelaVideos();
        renderizarTabelaApostilas();
        renderizarTabelaAvaliacoes();
        
        // Atualizar interface
        tituloFormulario.textContent = 'Editar Curso';
        botaoCancelar.style.display = 'inline-block';
        
        // Rolagem suave para o formulário
        document.querySelector('.formulario-adicionar-curso').scrollIntoView({ behavior: 'smooth' });
    }
};

// Função para excluir curso
window.excluirCurso = function(id) {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
        cursos = cursos.filter(c => c.id !== id);
        renderizarTabelaCursos();
        mostrarMensagemSucesso('Curso excluído com sucesso!');
        
        // Se estava editando o curso excluído, limpar o formulário
        if (cursoEmEdicao && cursoEmEdicao.id === id) {
            limparFormulario();
            cursoEmEdicao = null;
            botaoCancelar.style.display = 'none';
            tituloFormulario.textContent = 'Adicionar Novo Curso';
        }
    }
};



// Função para exibir mensagem de sucesso
function mostrarMensagemSucesso(mensagem) {
    mensagemSucesso.textContent = mensagem;
    mensagemSucesso.style.display = 'block';
    
    // Esconder a mensagem após 3 segundos
    setTimeout(() => {
        mensagemSucesso.style.display = 'none';
    }, 3000);
}

// Função para baixar arquivo (apostilas e avaliações)
window.baixarArquivo = function(dados, nomeArquivo) {
    const link = document.createElement('a');
    link.href = `data:application/octet-stream;base64,${dados}`;
    link.download = nomeArquivo;
    link.click();
}

function calcularCargaHoraria(videos) {
    if (!videos || videos.length === 0) return '00:00';
    
    let totalSegundos = 0;
    
    videos.forEach(video => {
        if (video.tempo) {
            const [horas = 0, minutos = 0, segundos = 0] = video.tempo.split(':').map(Number);
            totalSegundos += horas * 3600 + minutos * 60 + segundos;
        }
    });
    
    const horas = Math.floor(totalSegundos / 3600).toString().padStart(2, '0');
    const minutos = Math.floor((totalSegundos % 3600) / 60).toString().padStart(2, '0');
    
    return `${horas}:${minutos}`;
};