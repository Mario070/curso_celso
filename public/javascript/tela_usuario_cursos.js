// Dados dos cursos e estado do usuário
let cursosMatriculados = [];
let todosCursosDisponiveis = [];

// Elementos DOM
const btnCadastroCurso = document.getElementById('btncadastrocurso');

// Carregar cursos disponíveis
async function carregarCursosDisponiveis() {
    try {
        // Simulação - na prática viria de uma API
        todosCursosDisponiveis = JSON.parse(localStorage.getItem('cursos')) || [];
        
        if (todosCursosDisponiveis.length === 0) {
            document.querySelector('#cursos .lista-cursos').innerHTML = 
                '<li class="msg-sem-cursos">Nenhum curso disponível no momento.</li>';
            return;
        }
        
        renderizarCursosDisponiveis();
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
    }
}

// Renderizar cursos disponíveis
function renderizarCursosDisponiveis() {
    const listaCursos = document.querySelector('#cursos .lista-cursos');
    listaCursos.innerHTML = '';
    
    todosCursosDisponiveis.forEach((curso, index) => {
        const cardCurso = document.createElement('li');
        cardCurso.className = 'card-curso';
        cardCurso.innerHTML = `
            <div class="card-header" onclick="toggleDetalhesCurso(${index})">
                <input type="checkbox" id="curso-${index}" class="checkbox-curso">
                <label for="curso-${index}">
                    <h3>${curso.nome}</h3>
                    <p><strong>Categoria:</strong> ${curso.categoria}</p>
                    <p><strong>Carga Horária:</strong> ${calcularCargaHoraria(curso.videos)}</p>
                </label>
                <span class="seta">▼</span>
            </div>
            <div class="card-detalhes" id="detalhes-${index}" style="display: none;">
                <p><strong>Descrição:</strong> ${curso.descricao}</p>
                <p><strong>Conteúdo:</strong></p>
                <ul class="lista-conteudo">
                    ${curso.videos.map(video => `
                        <li>
                            Vídeo: <a href="${video.link}" target="_blank">Assistir</a> 
                            (${video.tempo || '--:--'})
                        </li>
                    `).join('')}
                    ${curso.apostilas.map(apostila => `
                        <li>Apostila: ${apostila.nome}</li>
                    `).join('')}
                    ${curso.avaliacoes.map(avaliacao => `
                        <li>Avaliação: <a href="${avaliacao.link}" target="_blank">${avaliacao.titulo}</a></li>
                    `).join('')}
                </ul>
            </div>
        `;
        listaCursos.appendChild(cardCurso);
    });
}

// Carregar cursos matriculados
function carregarCursosMatriculados() {
    cursosMatriculados = JSON.parse(localStorage.getItem('cursosMatriculados')) || [];
    
    // Inicializar progresso se não existir
    cursosMatriculados.forEach(curso => {
        if (typeof curso.progresso === 'undefined') {
            curso.progresso = 0;
        }
        if (curso.videos) {
            curso.videos.forEach(video => {
                if (typeof video.assistido === 'undefined') {
                    video.assistido = false;
                    video.percentualAssistido = 0;
                }
            });
        }
    });
    
    renderizarCursosMatriculados();
    atualizarResumoProgresso();
}

// Renderizar cursos matriculados
function renderizarCursosMatriculados() {
    const listaCursos = document.querySelector('#seus-cursos .lista-cursos-matriculados');
    listaCursos.innerHTML = '';
    
    if (cursosMatriculados.length === 0) {
        listaCursos.innerHTML = '<li class="msg-sem-cursos">Você não está matriculado em nenhum curso.</li>';
        return;
    }
    
    cursosMatriculados.forEach(curso => {
        const progresso = curso.progresso || 0;
        const cardCurso = document.createElement('li');
        cardCurso.className = 'card-curso';
        cardCurso.id = `curso-matriculado-${curso.id}`;
        cardCurso.innerHTML = `
            <div class="card-header" onclick="toggleDetalhesCursoMatriculado(${curso.id})">
                <h3>${curso.nome}</h3>
                <p><strong>Categoria:</strong> ${curso.categoria}</p>
                <div class="curso-progresso">
                    <progress value="${progresso}" max="100"></progress>
                    <span>${progresso}%</span>
                </div>
                <span class="seta">▼</span>
            </div>
            <div class="card-detalhes" id="detalhes-matriculado-${curso.id}" style="display: none;">
                <p><strong>Descrição:</strong> ${curso.descricao}</p>
                <p><strong>Carga Horária:</strong> ${calcularCargaHoraria(curso.videos)}</p>
                <p><strong>Conteúdo:</strong></p>
                <ul class="lista-conteudo">
                    ${curso.videos.map((video, i) => `
                        <li class="${video.assistido ? 'conteudo-completo' : ''}">
                            <input type="checkbox" id="video-${curso.id}-${i}" 
                                   ${video.assistido ? 'checked' : ''}
                                   onchange="marcarVideoAssistido(${curso.id}, ${i}, this.checked ? 100 : 0)">
                            <label for="video-${curso.id}-${i}">
                                Vídeo ${i+1}: <a href="${video.link}" target="_blank" 
                                onclick="registrarVisualizacao(event, ${curso.id}, ${i})">${video.titulo || 'Vídeo ' + (i+1)}</a> 
                                (${video.tempo || '--:--'})
                                ${video.assistido ? '<span class="status-concluido">✓ Concluído</span>' : ''}
                            </label>
                        </li>
                    `).join('')}
                    ${curso.apostilas.map((apostila, i) => `
                        <li class="${apostila.completo ? 'conteudo-completo' : ''}">
                            <input type="checkbox" id="apostila-${curso.id}-${i}" 
                                   ${apostila.completo ? 'checked' : ''}
                                   onchange="marcarApostilaCompleta(${curso.id}, ${i}, this.checked)">
                            <label for="apostila-${curso.id}-${i}">
                                Apostila: ${apostila.nome}
                                ${apostila.completo ? '<span class="status-concluido">✓ Concluído</span>' : ''}
                            </label>
                        </li>
                    `).join('')}
                    ${curso.avaliacoes.map((avaliacao, i) => `
                        <li class="${avaliacao.completo ? 'conteudo-completo' : ''}">
                            <input type="checkbox" id="avaliacao-${curso.id}-${i}" 
                                   ${avaliacao.completo ? 'checked' : ''}
                                   onchange="marcarAvaliacaoCompleta(${curso.id}, ${i}, this.checked)">
                            <label for="avaliacao-${curso.id}-${i}">
                                Avaliação: <a href="${avaliacao.link}" target="_blank">${avaliacao.titulo}</a>
                                ${avaliacao.completo ? '<span class="status-concluido">✓ Concluída</span>' : ''}
                            </label>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
        listaCursos.appendChild(cardCurso);
    });
}

// Matricular nos cursos selecionados
function matricularCursos() {
    const checkboxes = document.querySelectorAll('#cursos .checkbox-curso:checked');
    const cursosSelecionados = [];
    
    checkboxes.forEach(checkbox => {
        const index = checkbox.id.split('-')[1];
        const cursoSelecionado = todosCursosDisponiveis[index];
        
        // Verifica se o curso já está matriculado
        if (!cursosMatriculados.some(c => c.id === cursoSelecionado.id)) {
            // Adiciona informações de progresso ao curso
            const cursoComProgresso = {
                ...cursoSelecionado,
                progresso: 0,
                videos: cursoSelecionado.videos ? cursoSelecionado.videos.map(video => ({
                    ...video,
                    assistido: false,
                    percentualAssistido: 0
                })) : [],
                apostilas: cursoSelecionado.apostilas ? cursoSelecionado.apostilas.map(apostila => ({
                    ...apostila,
                    completo: false
                })) : [],
                avaliacoes: cursoSelecionado.avaliacoes ? cursoSelecionado.avaliacoes.map(avaliacao => ({
                    ...avaliacao,
                    completo: false
                })) : []
            };
            
            cursosSelecionados.push(cursoComProgresso);
        }
    });
    
    if (cursosSelecionados.length === 0) {
        alert('Selecione pelo menos um curso para se matricular ou você já está matriculado nos cursos selecionados.');
        return;
    }
    
    cursosMatriculados = [...cursosMatriculados, ...cursosSelecionados];
    localStorage.setItem('cursosMatriculados', JSON.stringify(cursosMatriculados));
    
    renderizarCursosMatriculados();
    mostrarSecao('seus-cursos');
    alert('Matrícula realizada com sucesso!');
}

// Funções para marcar conteúdo como completo
function marcarVideoAssistido(cursoId, videoIndex, percentual) {
    const curso = cursosMatriculados.find(c => c.id === cursoId);
    if (!curso || !curso.videos || !curso.videos[videoIndex]) return;
    
    curso.videos[videoIndex].assistido = percentual > 0;
    curso.videos[videoIndex].percentualAssistido = percentual;
    
    atualizarProgressoCurso(cursoId);
}

function marcarApostilaCompleta(cursoId, apostilaIndex, completo) {
    const curso = cursosMatriculados.find(c => c.id === cursoId);
    if (!curso || !curso.apostilas || !curso.apostilas[apostilaIndex]) return;
    
    curso.apostilas[apostilaIndex].completo = completo;
    atualizarProgressoCurso(cursoId);
}

function marcarAvaliacaoCompleta(cursoId, avaliacaoIndex, completo) {
    const curso = cursosMatriculados.find(c => c.id === cursoId);
    if (!curso || !curso.avaliacoes || !curso.avaliacoes[avaliacaoIndex]) return;
    
    curso.avaliacoes[avaliacaoIndex].completo = completo;
    atualizarProgressoCurso(cursoId);
}

// Registrar visualização de vídeo
function registrarVisualizacao(event, cursoId, videoIndex) {
    event.preventDefault();
    const link = event.currentTarget.href;
    
    // Simula que o usuário assistiu 100% do vídeo
    marcarVideoAssistido(cursoId, videoIndex, 100);
    
    // Em um sistema real, você abriria um player que reporta o progresso real
    // Aqui apenas abrimos a URL em nova aba
    window.open(link, '_blank');
}

// Atualizar progresso do curso
function atualizarProgressoCurso(cursoId) {
    const curso = cursosMatriculados.find(c => c.id === cursoId);
    if (!curso) return;
    
    curso.progresso = calcularProgressoCurso(curso);
    localStorage.setItem('cursosMatriculados', JSON.stringify(cursosMatriculados));
    
    // Atualizar exibição
    const progressElement = document.querySelector(`#curso-matriculado-${cursoId} progress`);
    if (progressElement) {
        progressElement.value = curso.progresso;
        const percentElement = progressElement.nextElementSibling;
        if (percentElement) {
            percentElement.textContent = `${curso.progresso}%`;
        }
    }
    
    atualizarResumoProgresso();
}

// Calcular progresso do curso
function calcularProgressoCurso(curso) {
    if (!curso.videos || curso.videos.length === 0) return 0;
    
    let totalSegundos = 0;
    let assistidoSegundos = 0;
    
    // Calcula progresso dos vídeos (70% do total)
    curso.videos.forEach(video => {
        if (video.tempo) {
            const [horas = 0, minutos = 0, segundos = 0] = video.tempo.split(':').map(Number);
            const videoSegundos = horas * 3600 + minutos * 60 + segundos;
            totalSegundos += videoSegundos;
            
            if (video.assistido) {
                assistidoSegundos += videoSegundos * (video.percentualAssistido || 0) / 100;
            }
        }
    });
    
    const progressoVideos = totalSegundos > 0 ? (assistidoSegundos / totalSegundos) * 70 : 0;
    
    // Calcula progresso de outros conteúdos (30% do total)
    const conteudoCompleto = 
        (curso.apostilas?.filter(a => a.completo).length || 0) + 
        (curso.avaliacoes?.filter(a => a.completo).length || 0);
    
    const totalConteudo = 
        (curso.apostilas?.length || 0) + 
        (curso.avaliacoes?.length || 0);
    
    const progressoConteudo = totalConteudo > 0 ? (conteudoCompleto / totalConteudo) * 30 : 0;
    
    return Math.min(100, Math.round(progressoVideos + progressoConteudo));
}

// Atualizar resumo de progresso
function atualizarResumoProgresso() {
    const container = document.getElementById('cursos-andamento');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (cursosMatriculados.length === 0) {
        container.innerHTML = '<p>Nenhum curso em andamento.</p>';
        return;
    }
    
    cursosMatriculados.forEach(curso => {
        const cursoElement = document.createElement('div');
        cursoElement.className = 'curso-andamento';
        cursoElement.innerHTML = `
            <h4>${curso.nome}</h4>
            <div class="progresso-bar">
                <progress value="${curso.progresso}" max="100"></progress>
                <span>${curso.progresso}%</span>
            </div>
        `;
        container.appendChild(cursoElement);
    });
    
    // Atualizar atividades recentes
    const atividadesRecentes = document.getElementById('atividades-recentes');
    if (atividadesRecentes) {
        atividadesRecentes.innerHTML = '';
        
        const atividades = [];
        
        cursosMatriculados.forEach(curso => {
            // Últimos vídeos assistidos
            curso.videos?.forEach(video => {
                if (video.assistido) {
                    atividades.push({
                        tipo: 'video',
                        curso: curso.nome,
                        titulo: video.titulo || 'Vídeo do curso',
                        data: video.ultimaVisualizacao || new Date().toISOString()
                    });
                }
            });
            
            // Apostilas completadas
            curso.apostilas?.forEach(apostila => {
                if (apostila.completo) {
                    atividades.push({
                        tipo: 'apostila',
                        curso: curso.nome,
                        titulo: apostila.nome,
                        data: apostila.dataCompleto || new Date().toISOString()
                    });
                }
            });
            
            // Avaliações completadas
            curso.avaliacoes?.forEach(avaliacao => {
                if (avaliacao.completo) {
                    atividades.push({
                        tipo: 'avaliacao',
                        curso: curso.nome,
                        titulo: avaliacao.titulo,
                        data: avaliacao.dataCompleto || new Date().toISOString()
                    });
                }
            });
        });
        
        // Ordena por data (mais recente primeiro)
        atividades.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Mostra as 5 mais recentes
        const recentes = atividades.slice(0, 5);
        
        if (recentes.length === 0) {
            atividadesRecentes.innerHTML = '<p>Nenhuma atividade recente.</p>';
        } else {
            recentes.forEach(atividade => {
                const item = document.createElement('div');
                item.className = 'atividade-item';
                
                let icone = '';
                if (atividade.tipo === 'video') icone = '🎬';
                else if (atividade.tipo === 'apostila') icone = '📚';
                else icone = '📝';
                
                item.innerHTML = `
                    <span class="atividade-icone">${icone}</span>
                    <span class="atividade-texto">
                        ${atividade.titulo} <small>(${atividade.curso})</small>
                    </span>
                    <span class="atividade-data">
                        ${new Date(atividade.data).toLocaleDateString()}
                    </span>
                `;
                atividadesRecentes.appendChild(item);
            });
        }
    }
}

// Funções auxiliares
function calcularCargaHoraria(videos) {
    if (!videos || videos.length === 0) return '0h';
    
    let totalSegundos = 0;
    
    videos.forEach(video => {
        if (video.tempo) {
            const [horas = 0, minutos = 0] = video.tempo.split(':').map(Number);
            totalSegundos += horas * 3600 + minutos * 60;
        }
    });
    
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    
    return minutos > 0 ? `${horas}h${minutos}m` : `${horas}h`;
}

function toggleDetalhesCurso(index) {
    const detalhes = document.getElementById(`detalhes-${index}`);
    const seta = document.querySelector(`#curso-${index} + label + .seta`);
    
    if (detalhes.style.display === 'none') {
        detalhes.style.display = 'block';
        seta.textContent = '▲';
    } else {
        detalhes.style.display = 'none';
        seta.textContent = '▼';
    }
}

function toggleDetalhesCursoMatriculado(cursoId) {
    const detalhes = document.getElementById(`detalhes-matriculado-${cursoId}`);
    const seta = document.querySelector(`#curso-matriculado-${cursoId} .seta`);
    
    if (detalhes.style.display === 'none') {
        detalhes.style.display = 'block';
        seta.textContent = '▲';
    } else {
        detalhes.style.display = 'none';
        seta.textContent = '▼';
    }
}

// ----carrossel------
const parceiros = [
    {
        nome: "Parceiro 1",
        logo: "../IMG/parceiro1.jpg",
        link: "https://parceiro1.com"
    },
    {
        nome: "Parceiro 2", 
        logo: "../IMG/parceiro2.jpg",
        link: "https://parceiro2.com"
    },
    {
        nome: "Parceiro 3",
        logo: "../IMG/parceiro3.jpg",
        link: "https://parceiro3.com"
    },
    {
        nome: "Parceiro 4",
        logo: "../IMG/parceiro4.jpg",
        link: "https://parceiro4.com"
    }
];

// Estado do carrossel
let carrosselState = {
    currentIndex: 0,
    totalItems: parceiros.length
};

// Inicializar carrossel
function initCarrossel() {
    document.querySelectorAll('.carrossel-container').forEach(container => {
        const carrosselInner = container.querySelector('.carrossel-inner');
        
        if (!carrosselInner || parceiros.length === 0) return;
        
        // Só cria os itens se ainda não foram criados
        if (carrosselInner.children.length === 0) {
            carrosselInner.innerHTML = '';
            parceiros.forEach((parceiro, index) => {
                const item = document.createElement('div');
                item.className = 'carrossel-item';
                item.innerHTML = `
                    <a href="${parceiro.link}" target="_blank">
                        <img src="${parceiro.logo}" alt="${parceiro.nome}">
                        <p>${parceiro.nome}</p>
                    </a>
                `;
                carrosselInner.appendChild(item);
            });
        }
        
        // Atualiza o estado específico para este carrossel
        const carrosselState = {
            currentIndex: 0,
            totalItems: parceiros.length,
            container: container
        };
        
        // Atualiza a posição inicial
        updateCarrosselPosition(carrosselState);
    });
}

// Mover carrossel
function moverCarrossel(direction) {
    document.querySelectorAll('.carrossel-container').forEach(container => {
        const state = {
            currentIndex: parseInt(container.dataset.currentIndex) || 0,
            totalItems: parceiros.length,
            container: container
        };
        
        state.currentIndex += direction;
        
        if (state.currentIndex >= state.totalItems) {
            state.currentIndex = 0;
        } else if (state.currentIndex < 0) {
            state.currentIndex = state.totalItems - 1;
        }
        
        container.dataset.currentIndex = state.currentIndex;
        updateCarrosselPosition(state);
        resetCarrosselAutoplay();
    });
}

function updateCarrosselPosition(state) {
    const carrossel = state.container.querySelector('.carrossel');
    if (carrossel) {
        const itemWidth = 100 / state.totalItems;
        carrossel.style.transform = `translateX(-${state.currentIndex * itemWidth}%)`;
    }
}
// Atualizar indicadores
function updateCarrosselIndicators() {
    const indicators = document.querySelectorAll('.carrossel-indicador');
    indicators.forEach((indicator, index) => {
        if (index === carrosselState.currentIndex) {
            indicator.classList.add('ativo');
        } else {
            indicator.classList.remove('ativo');
        }
    });
}

// Autoplay do carrossel
let carrosselInterval;

function startCarrosselAutoplay() {
    carrosselInterval = setInterval(() => {
        moverCarrossel(1);
    }, 5000); // Muda a cada 5 segundos
}

function resetCarrosselAutoplay() {
    clearInterval(carrosselInterval);
    startCarrosselAutoplay();
}

// Criar indicadores
function createCarrosselIndicators() {
    const container = document.querySelector('.carrossel-indicadores');
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 0; i < carrosselState.totalItems; i++) {
        const indicator = document.createElement('div');
        indicator.className = `carrossel-indicador ${i === 0 ? 'ativo' : ''}`;
        indicator.addEventListener('click', () => {
            carrosselState.currentIndex = i;
            updateCarrosselPosition();
            updateCarrosselIndicators();
            resetCarrosselAutoplay();
        });
        container.appendChild(indicator);
    }
}

// Atualizar a função de inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarCursosDisponiveis();
    carregarCursosMatriculados();
    initCarrossel();
    createCarrosselIndicators();
    
    btnCadastroCurso.addEventListener('click', matricularCursos);
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarCursosDisponiveis();
    carregarCursosMatriculados();
    
    // Inicializa os carrosseis apenas uma vez
    initCarrossel();
    createCarrosselIndicators();
    
    // Inicia o autoplay para o carrossel visível
    startCarrosselAutoplay();
    
    btnCadastroCurso.addEventListener('click', matricularCursos);
});