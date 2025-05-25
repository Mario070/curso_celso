// arrays temporários
let apostilas = [];
let avaliacoes = [];
let videosModulo = [];
let cursoModulo = null;


// quando o curso for encontrado, exiba o form
function buscarCursoModulo() {
  const q = document.getElementById('buscaCursoModulo').value.trim();
  if (!q) return alert('Digite nome ou ID do curso.');
  fetch('http://localhost:3000/api/curso')
    .then(r => r.json())
    .then(cursos => {
      const idBusca = Number(q);
      const curso = cursos.find(c => (!isNaN(idBusca) && c.id === idBusca) ||
                                      (c.titulo && c.titulo.toLowerCase().includes(q.toLowerCase())));
      const msg = document.getElementById('cursoModuloEncontrado');
      if (curso) {
        cursoModulo = curso;
        msg.className = 'mensagem sucesso';
        msg.innerHTML = `<strong>ID:</strong> ${curso.id}<br>
                         <strong>Título:</strong> ${curso.titulo}<br>
                         <strong>Descrição:</strong> ${curso.descricao || '<i>sem descrição</i>'}`;
        document.getElementById('formCadastroModulo').style.display = 'block';
      } else {
        cursoModulo = null;
        msg.className = 'mensagem erro';
        msg.innerText = 'Curso não encontrado.';
      }
      msg.style.display = 'block';
      setTimeout(() => msg.style.display = 'none', 4000);
    })
    .catch(() => alert('Erro ao buscar cursos.'));
}

function adicionarApostila() {
  const link = document.getElementById('linkApostila').value.trim();
  const nome = document.getElementById('nomeApostilaNovo').value.trim();
  if (!link || !nome) return alert('Preencha link e nome da apostila.');
  apostilas.push({ arquivoUrl: link, titulo: nome });
  atualizarTabela('tabelaApostilasModulo', apostilas, ['arquivoUrl','titulo']);
  document.getElementById('linkApostila').value = '';
  document.getElementById('nomeApostilaNovo').value = '';
}

function adicionarAvaliacao() {
  const link = document.getElementById('linkAvaliacaoNovo').value.trim();
  const titulo = document.getElementById('nomeAvaliacaoNovo').value.trim();
  if (!link || !titulo) return alert('Preencha link e título da avaliação.');
  avaliacoes.push({ url: link, titulo });
  atualizarTabela('tabelaAvaliacoesModulo', avaliacoes, ['url','titulo']);
  document.getElementById('linkAvaliacao').value = '';
  document.getElementById('nomeAvaliacaoNovo').value = '';
}

function adicionarVideoModulo() {
  const link = document.getElementById('linkVideoNovo').value.trim();
  const titulo = document.getElementById('tituloVideoNovo').value.trim();
  const tempo = document.getElementById('tempoVideoNovo').value;
  if (!link || !titulo || !tempo) return alert('Preencha link, título e duração do vídeo.');
  videosModulo.push({ linkvideo: link, titulovideo: titulo, tempoVideo: tempo });
  atualizarTabela('tabelaVideosModulo', videosModulo, ['linkvideo','titulovideo','tempoVideo']);
  document.getElementById('linkVideoNovo').value = '';
  document.getElementById('tituloVideoNovo').value = '';
  document.getElementById('tempoVideoNovo').value = '';
}

function atualizarTabela(id, arr, campos) {
  const tbody = document.getElementById(id).querySelector('tbody');
  tbody.innerHTML = '';
  arr.forEach((item, i) => {
    const tr = document.createElement('tr');
    campos.forEach(c => {
      const td = document.createElement('td');
      td.textContent = item[c];
      tr.appendChild(td);
    });
    const tdA = document.createElement('td');
    tdA.innerHTML = `<button onclick="${id}.splice(${i},1); atualizarTabela('${id}', ${id.replace('tabela','').toLowerCase()}, ${JSON.stringify(campos)});">Remover</button>`;
    tr.appendChild(tdA);
    tbody.appendChild(tr);
  });
}

async function salvarNovoModulo() {
  if (!cursoModulo) return alert('Busque antes o curso.');
  const titulo = document.getElementById('tituloNovoModulo').value.trim();
  const ordem = parseInt(document.getElementById('ordemNovoModulo').value,10);
  if (!titulo || !ordem) return alert('Preencha título e ordem.');

  try {
    // 1) salva o módulo
    const resModulo = await fetch('http://localhost:3000/api/salvar-modulo', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        cursoId: cursoModulo.id,
        titulo,
        ordem
      })
    });
    if (!resModulo.ok) throw new Error();
    const { modulo } = await resModulo.json();

    // 2) salva cada apostila
    for (let a of apostilas) {
      await fetch('http://localhost:3000/api/salvar-apostila', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ moduloId: modulo.id, titulo: a.titulo, arquivoUrl: a.arquivoUrl })
      });
    }
    // 3) cada avaliação
    for (let av of avaliacoes) {
      await fetch('http://localhost:3000/api/salvar-avaliacao', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ moduloId: modulo.id, titulo: av.titulo, url: av.url })
      });
    }
    // 4) cada vídeo
    for (let v of videosModulo) {
      await fetch('http://localhost:3000/api/salvar-video', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ moduloId: modulo.id, ...v })
      });
    }

    alert('Módulo e recursos salvos com sucesso!');
    // limpa tudo
    apostilas = []; avaliacoes = []; videosModulo = []; cursoModulo = null;
    document.getElementById('formCadastroModulo').reset();
    document.getElementById('formCadastroModulo').style.display = 'none';
    atualizarTabela('tabelaApostilasModulo', [], ['arquivoUrl','titulo']);
    atualizarTabela('tabelaAvaliacoesModulo', [], ['url','titulo']);
    atualizarTabela('tabelaVideosModulo', [], ['linkvideo','titulovideo','tempoVideo']);
  } catch (e) {
    console.error(e);
    alert('Erro ao salvar módulo completo.');
  }
}


// --- FUNÇÕES DE BUSCA E RENDERIZAÇÃO DE CARDS ---

// 1) Busca curso e módulos
async function buscarCursoECarregarModulos() {
  const q = document.getElementById('buscaCursoCards').value.trim();
  if (!q) return alert('Digite nome ou ID do curso.');

  const msg = document.getElementById('mensagemCursoCards');
  let curso;
  try {
    // obtém lista de cursos
    const resCursos = await fetch('http://localhost:3000/api/curso');
    if (!resCursos.ok) throw new Error();
    const cursos = await resCursos.json();
    const idBusca = Number(q);
    curso = cursos.find(c =>
      (!isNaN(idBusca) && c.id === idBusca) ||
      (c.titulo && c.titulo.toLowerCase().includes(q.toLowerCase()))
    );
  } catch (e) {
    console.error(e);
    return alert('Erro ao buscar cursos.');
  }

  if (!curso) {
    msg.className = 'mensagem erro';
    msg.innerText = 'Curso não encontrado.';
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 3000);
    return;
  }

  // mostra mensagem de sucesso
  msg.className = 'mensagem sucesso';
  msg.innerHTML = `<strong>ID:</strong> ${curso.id} — <strong>${curso.titulo}</strong>`;
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);

  // 2) carrega os módulos desse curso
  let modulos = [];
  try {
    const resMods = await fetch(`http://localhost:3000/api/modulo?cursoId=${curso.id}`);
    if (!resMods.ok) throw new Error();
    modulos = await resMods.json();
  } catch (e) {
    console.error(e);
    return alert('Erro ao buscar módulos.');
  }

  // 3) renderiza os cards
  renderizarCardsModulos(modulos);
}

// 2) Função de renderização de cards
function renderizarCardsModulos(modulos) {
  const container = document.getElementById('cardsModulosContainer');
  const lista = document.getElementById('listaCardsModulos');
  lista.innerHTML = '';

  if (!modulos.length) {
    container.style.display = 'none';
    return alert('Nenhum módulo cadastrado para este curso.');
  }

  modulos.forEach(m => {
    const card = document.createElement('div');
    card.className = 'card-modulo';  // veja CSS sugerido abaixo
    card.innerHTML = `
      <h5>${m.titulo}</h5>
      <p><strong>Ordem:</strong> ${m.ordem}</p>
      <div class="acoes">
        <button onclick="editarModulo(${m.id})">✏️ Editar</button>
        <button onclick="excluirModulo(${m.id})">🗑️ Excluir</button>
      </div>
    `;
    lista.appendChild(card);
  });

  container.style.display = 'block';
}

// 3) Funções de editar e excluir
function editarModulo(id) {
  // redirecione ou abra um modal para edição
  window.location.href = `/editar-modulo.html?id=${id}`;
}

async function excluirModulo(id) {
  if (!confirm('Confirma exclusão deste módulo?')) return;
  try {
    const res = await fetch(`http://localhost:3000/api/modulo/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    alert('Módulo excluído com sucesso.');
    // após exclusão, recarrega a lista
    buscarCursoECarregarModulos();
  } catch (e) {
    console.error(e);
    alert('Erro ao excluir módulo.');
  }
}
