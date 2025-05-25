// Variável global para o curso atual
let cursoAtual = null;

// Busca curso e carrega módulos
async function buscarCursoECarregarModulos() {
  const q = document.getElementById('buscaCursoCards').value.trim();
  const msg = document.getElementById('mensagemCursoCards');
  if (!q) return alert('Digite nome ou ID do curso.');

  try {
    // Busca curso
    const resCursos = await fetch('http://localhost:3000/api/curso');
    const cursos = await resCursos.json();
    const idBusca = Number(q);
    const curso = cursos.find(c => 
      (!isNaN(idBusca) && c.id === idBusca) ||
      (c.titulo && c.titulo.toLowerCase().includes(q.toLowerCase()))
    );
    
    if (!curso) throw new Error('Curso não encontrado');

    cursoAtual = curso;
    mostrarMensagem(`<strong>ID:</strong> ${curso.id} — <strong>${curso.titulo}</strong>`, 'sucesso');

    // Busca módulos com relações
    const resMods = await fetch(`http://localhost:3000/api/modulo?cursoId=${curso.id}&includeRelations=true`);
    const modulos = await resMods.json();

    // Renderiza cards
    renderizarCardsModulos(modulos);

  } catch (err) {
    console.error(err);
    mostrarMensagem(
      err.message === 'Curso não encontrado' ? 'Curso não encontrado.' : 'Erro ao buscar cursos/módulos.',
      'erro'
    );
  }
}

// Mostra mensagem na interface
function mostrarMensagem(texto, tipo) {
  const msg = document.getElementById('mensagemCursoCards');
  msg.className = `mensagem ${tipo}`;
  msg.innerHTML = texto;
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
}

// Renderiza os cards dos módulos
function renderizarCardsModulos(modulos) {
  const container = document.getElementById('cardsModulosContainer');
  const lista = document.getElementById('listaCardsModulos');
  lista.innerHTML = '';

  if (!modulos.length) {
    container.style.display = 'block';
    lista.innerHTML = '<div class="mensagem info">Nenhum módulo cadastrado para este curso.</div>';
    return;
  }

  modulos.sort((a, b) => a.ordem - b.ordem).forEach(m => {
    const card = document.createElement('div');
    card.className = 'card-modulo';
    card.style = `
      border: 1px solid #ddd; padding: 15px; border-radius: 8px; 
      width: 250px; margin-bottom: 15px; position: relative;
    `;
    
    // Mostra primeiro vídeo/apostila/avaliação se existirem
    const primeiroVideo = m.video?.length > 0 ? m.video[0] : null;
    const primeiraApostila = m.apostila?.length > 0 ? m.apostila[0] : null;
    const primeiraAvaliacao = m.avaliacao?.length > 0 ? m.avaliacao[0] : null;

    card.innerHTML = `
      <h5 style="margin: 0 0 10px 0;">${m.titulo}</h5>
      <p style="margin: 5px 0;"><strong>Ordem:</strong> ${m.ordem}</p>
      ${primeiroVideo ? `<p style="margin: 5px 0;"><strong>Vídeo:</strong> ${primeiroVideo.titulo}</p>` : ''}
      
      <button onclick="abrirEdicaoModulo(${m.id})" 
        style="background: #3498db; color: white; border: none; 
        padding: 8px 12px; border-radius: 4px; cursor: pointer; width: 100%; margin-top: 10px;">
        Abrir
      </button>
    `;
    lista.appendChild(card);
  });

  container.style.display = 'block';
}
let modoEdicao = false;

// Abre o módulo para edição
async function abrirEdicaoModulo(moduloId) {
  try {
    // Busca dados completos do módulo com relações
    const response = await fetch(`http://localhost:3000/api/modulo-completo/${moduloId}`);
    if (!response.ok) throw new Error('Erro ao carregar módulo');
    
    const { data: modulo } = await response.json();
    
    // Preenche o formulário com os primeiros itens de cada relação
    document.getElementById('editarModuloId').value = modulo.id;
    document.getElementById('editarTituloModulo').value = modulo.titulo || '';
    document.getElementById('editarOrdemModulo').value = modulo.ordem || '';
    
    // Primeiro vídeo (se existir)
    const primeiroVideo = modulo.video?.length > 0 ? modulo.video[0] : {};
    document.getElementById('editarTituloVideo').value = primeiroVideo.titulo || '';
    document.getElementById('editarLinkVideo').value = primeiroVideo.urlVideo || '';
    document.getElementById('editarDuracaoVideo').value = primeiroVideo.duracao || '';
    
    // Primeira apostila (se existir)
    const primeiraApostila = modulo.apostila?.length > 0 ? modulo.apostila[0] : {};
    document.getElementById('editarTituloApostila').value = primeiraApostila.titulo || '';
    document.getElementById('editarLinkApostila').value = primeiraApostila.arquivoUrl || '';
    
    // Primeira avaliação (se existir)
    const primeiraAvaliacao = modulo.avaliacao?.length > 0 ? modulo.avaliacao[0] : {};
    document.getElementById('editarTituloAvaliacao').value = primeiraAvaliacao.titulo || '';
    document.getElementById('editarLinkAvaliacao').value = primeiraAvaliacao.url || '';
    
    // Exibe o formulário
    document.getElementById('formEditarModulo').style.display = 'block';
    document.getElementById('cardsModulosContainer').style.opacity = '0.5';
    
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao carregar detalhes: ' + error.message);
  }
}

// Fecha o formulário
function fecharEdicao() {
  document.getElementById('formEditarModulo').style.display = 'none';
  document.getElementById('cardsModulosContainer').style.opacity = '1';
}

// Salva as alterações
/*async function salvarEdicao() {
  const id = document.getElementById('editarModuloId').value;
  const dados = {
    titulo: document.getElementById('editarTituloModulo').value.trim(),
    ordem: parseInt(document.getElementById('editarOrdemModulo').value),
    video: {
      titulo: document.getElementById('editarTituloVideo').value.trim(),
      urlVideo: document.getElementById('editarLinkVideo').value.trim(),
      duracao: parseInt(document.getElementById('editarDuracaoVideo').value) || 0
    },
    apostila: {
      titulo: document.getElementById('editarTituloApostila').value.trim(),
      arquivoUrl: document.getElementById('editarLinkApostila').value.trim()
    },
    avaliacao: {
      titulo: document.getElementById('editarTituloAvaliacao').value.trim(),
      url: document.getElementById('editarLinkAvaliacao').value.trim()
    }
  };

  try {
    const response = await fetch(`http://localhost:3000/api/modulo/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao salvar');
    }
    
    alert('Alterações salvas com sucesso!');
    fecharEdicao();
    buscarCursoECarregarModulos();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert(error.message || 'Erro ao salvar alterações');
  }
}*/

// Substitua a função salvarEdicao existente por esta versão melhorada
/*async function salvarEdicao() {
  if (!modoEdicao) return;
  
  const id = document.getElementById('editarModuloId').value;
  const dados = {
    titulo: document.getElementById('editarTituloModulo').value.trim(),
    ordem: parseInt(document.getElementById('editarOrdemModulo').value),
    video: {
      titulo: document.getElementById('editarTituloVideo').value.trim(),
      urlVideo: document.getElementById('editarLinkVideo').value.trim(),
      duracao: parseInt(document.getElementById('editarDuracaoVideo').value) || 0
    },
    apostila: {
      titulo: document.getElementById('editarTituloApostila').value.trim(),
      arquivoUrl: document.getElementById('editarLinkApostila').value.trim()
    },
    avaliacao: {
      titulo: document.getElementById('editarTituloAvaliacao').value.trim(),
      url: document.getElementById('editarLinkAvaliacao').value.trim()
    }
  };

  try {
    // Chama a função de atualização completa
    await atualizarModuloCompleto(id, dados);
    
    alert('Alterações salvas com sucesso!');
    fecharFormulario();
    buscarCursoECarregarModulos(); // Recarrega a lista
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar alterações: ' + error.message);
  }
}*/

// Adicione esta nova função (ela pode ficar junto com as outras funções)
/*async function atualizarModuloCompleto(id, dados) {
  try {
    // 1. Atualiza módulo básico
    const resModulo = await fetch(`http://localhost:3000/api/modulo/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: dados.titulo,
        ordem: dados.ordem
      })
    });
    if (!resModulo.ok) throw new Error('Erro ao atualizar módulo');

    // 2. Atualiza vídeo (se existirem dados)
    if (dados.video && dados.video.titulo) {
      const resVideo = await fetch(`http://localhost:3000/api/modulo/${id}/video`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados.video)
      });
      if (!resVideo.ok) throw new Error('Erro ao atualizar vídeo');
    }

    // 3. Atualiza apostila (se existirem dados)
    if (dados.apostila && dados.apostila.titulo) {
      const resApostila = await fetch(`http://localhost:3000/api/modulo/${id}/apostila`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados.apostila)
      });
      if (!resApostila.ok) throw new Error('Erro ao atualizar apostila');
    }

    // 4. Atualiza avaliação (se existirem dados)
    if (dados.avaliacao && dados.avaliacao.titulo) {
      const resAvaliacao = await fetch(`http://localhost:3000/api/modulo/${id}/avaliacao`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados.avaliacao)
      });
      if (!resAvaliacao.ok) throw new Error('Erro ao atualizar avaliação');
    }

  } catch (error) {
    console.error('Erro ao atualizar módulo:', error);
    throw error; // Re-lança o erro para ser tratado pela função chamadorasdsdsadda
  }
}*/
// Adiciona animação
document.addEventListener('DOMContentLoaded', () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .card-modulo {
      animation: fadeIn 0.3s ease forwards;
    }
    .mensagem {
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .mensagem.sucesso {
      background-color: #d4edda;
      color: #155724;
    }
    .mensagem.erro {
      background-color: #f8d7da;
      color: #721c24;
    }
    .mensagem.info {
      background-color: #e2e3e5;
      color: #383d41;
    }
  `;
  document.head.appendChild(style);
});

// Função para abrir os detalhes do módulo (modo visualização)
async function abrirDetalhesModulo(moduloId) {
  try {
    const response = await fetch(`http://localhost:3000/api/modulo-completo/${moduloId}`);
    if (!response.ok) throw new Error('Erro ao carregar módulo');
    
    const { data: modulo } = await response.json();
    
    // Preenche o formulário
    preencherFormulario(modulo);
    
    // Configura modo visualização
    alternarModoEdicao(false);
    
    // Exibe o formulário
    document.getElementById('formEditarModulo').style.display = 'block';
    document.getElementById('cardsModulosContainer').style.opacity = '0.5';
    
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao carregar detalhes: ' + error.message);
  }
}

// Função para alternar entre modos visualização/edição
function alternarModoEdicao(editar = true) {
  modoEdicao = editar;
  const form = document.getElementById('formEditarModulo');
  
  if (modoEdicao) {
    // Modo edição
    document.querySelector('#formEditarModulo h4').textContent = 'Editar Módulo';
    document.getElementById('btnEditar').style.display = 'none';
    document.getElementById('btnSalvar').style.display = 'inline-block';
    document.getElementById('btnCancelar').style.display = 'inline-block';
  } else {
    // Modo visualização
    document.querySelector('#formEditarModulo h4').textContent = 'Detalhes do Módulo';
    document.getElementById('btnEditar').style.display = 'inline-block';
    document.getElementById('btnSalvar').style.display = 'none';
    document.getElementById('btnCancelar').style.display = 'none';
  }
  
  // Alterna estado dos campos
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.readOnly = !modoEdicao;
    input.style.backgroundColor = modoEdicao ? 'white' : '#f5f5f5';
    input.style.cursor = modoEdicao ? 'text' : 'not-allowed';
  });
}

// Função para preencher o formulário
function preencherFormulario(modulo) {
  // Dados básicos
  document.getElementById('editarModuloId').value = modulo.id || '';
  document.getElementById('editarTituloModulo').value = modulo.titulo || '';
  document.getElementById('editarOrdemModulo').value = modulo.ordem || '';
  
  // Vídeo (primeiro da lista)
  const video = modulo.video?.[0] || {};
  document.getElementById('editarTituloVideo').value = video.titulo || '';
  document.getElementById('editarLinkVideo').value = video.urlVideo || '';
  document.getElementById('editarDuracaoVideo').value = video.duracao || '';
  
  // Apostila (primeira da lista)
  const apostila = modulo.apostila?.[0] || {};
  document.getElementById('editarTituloApostila').value = apostila.titulo || '';
  document.getElementById('editarLinkApostila').value = apostila.arquivoUrl || '';
  
  // Avaliação (primeira da lista)
  const avaliacao = modulo.avaliacao?.[0] || {};
  document.getElementById('editarTituloAvaliacao').value = avaliacao.titulo || '';
  document.getElementById('editarLinkAvaliacao').value = avaliacao.url || '';
}

// Função para fechar o formulário
function fecharFormulario() {
  document.getElementById('formEditarModulo').style.display = 'none';
  document.getElementById('cardsModulosContainer').style.opacity = '1';
  modoEdicao = false;
}

// Função para salvar as alterações
/*async function salvarEdicao() {
  if (!modoEdicao) return;
  
  const id = document.getElementById('editarModuloId').value;
  const dados = {
    titulo: document.getElementById('editarTituloModulo').value.trim(),
    ordem: parseInt(document.getElementById('editarOrdemModulo').value),
    video: {
      titulo: document.getElementById('editarTituloVideo').value.trim(),
      urlVideo: document.getElementById('editarLinkVideo').value.trim(),
      duracao: parseInt(document.getElementById('editarDuracaoVideo').value) || 0
    },
    apostila: {
      titulo: document.getElementById('editarTituloApostila').value.trim(),
      arquivoUrl: document.getElementById('editarLinkApostila').value.trim()
    },
    avaliacao: {
      titulo: document.getElementById('editarTituloAvaliacao').value.trim(),
      url: document.getElementById('editarLinkAvaliacao').value.trim()
    }
  };

  try {
    const response = await fetch(`http://localhost:3000/api/modulo/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    
    if (!response.ok) throw new Error('Erro ao salvar');
    
    alert('Alterações salvas com sucesso!');
    fecharFormulario();
    buscarCursoECarregarModulos(); // Recarrega a lista
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar alterações: ' + error.message);
  }
}*/

async function salvarEdicao() {
  if (!modoEdicao) return;
  
  const id = document.getElementById('editarModuloId').value;
  const dados = {
    titulo: document.getElementById('editarTituloModulo').value.trim(),
    ordem: parseInt(document.getElementById('editarOrdemModulo').value),
    video: {
      titulo: document.getElementById('editarTituloVideo').value.trim(),
      urlVideo: document.getElementById('editarLinkVideo').value.trim(),
      duracao: parseInt(document.getElementById('editarDuracaoVideo').value) || 0
    },
    apostila: {
      titulo: document.getElementById('editarTituloApostila').value.trim(),
      arquivoUrl: document.getElementById('editarLinkApostila').value.trim()
    },
    avaliacao: {
      titulo: document.getElementById('editarTituloAvaliacao').value.trim(),
      url: document.getElementById('editarLinkAvaliacao').value.trim()
    }
  };

  try {
    // Adicione um timestamp para evitar cache
    const timestamp = new Date().getTime();
    
    await atualizarModuloCompleto(id, dados);
    
    alert('Alterações salvas com sucesso!');
    fecharFormulario();
    
    // Força recarregamento limpando cursoAtual primeiro
    cursoAtual = null;
    buscarCursoECarregarModulos();
    
    // Debug: Verifique no console se os dados foram atualizados
    console.log('Dados enviados:', dados);
    
  } catch (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar alterações: ' + error.message);
  }
}
async function atualizarModuloCompleto(id, dados) {
  try {
    // 1. Atualiza módulo básico
    const resModulo = await fetch(`http://localhost:3000/api/modulo/${id}?_=${new Date().getTime()}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: dados.titulo,
        ordem: dados.ordem
      })
    });
    
    const moduloData = await resModulo.json();
    if (!resModulo.ok) throw new Error(moduloData.error || 'Erro ao atualizar módulo');
    console.log('Módulo atualizado:', moduloData);

    // 2. Atualiza vídeo
    if (dados.video && dados.video.titulo) {
      const resVideo = await fetch(`http://localhost:3000/api/modulo/${id}/video?_=${new Date().getTime()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados.video)
      });
      const videoData = await resVideo.json();
      if (!resVideo.ok) throw new Error(videoData.error || 'Erro ao atualizar vídeo');
      console.log('Vídeo atualizado:', videoData);
    }

    // 3. Atualiza apostila
    if (dados.apostila && dados.apostila.titulo) {
      const resApostila = await fetch(`http://localhost:3000/api/modulo/${id}/apostila?_=${new Date().getTime()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados.apostila)
      });
      const apostilaData = await resApostila.json();
      if (!resApostila.ok) throw new Error(apostilaData.error || 'Erro ao atualizar apostila');
      console.log('Apostila atualizada:', apostilaData);
    }

    // 4. Atualiza avaliação
    if (dados.avaliacao && dados.avaliacao.titulo) {
      const resAvaliacao = await fetch(`http://localhost:3000/api/modulo/${id}/avaliacao?_=${new Date().getTime()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados.avaliacao)
      });
      const avaliacaoData = await resAvaliacao.json();
      if (!resAvaliacao.ok) throw new Error(avaliacaoData.error || 'Erro ao atualizar avaliação');
      console.log('Avaliação atualizada:', avaliacaoData);
    }

  } catch (error) {
    console.error('Erro detalhado:', error);
    throw error;
  }
}