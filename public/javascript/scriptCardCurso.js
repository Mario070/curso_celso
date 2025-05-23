document.addEventListener('DOMContentLoaded', async () => {
  const userIdStr = localStorage.getItem('usuarioId');
  const userId = userIdStr ? parseInt(userIdStr, 10) : null;

  if (!userId) {
    alert('Usuário não logado ou sessão expirada. Faça login novamente.');
    window.location.href = 'login.html';
    return;
  }

  await carregarCursosDisponiveis(userId);
  await carregarSeusCursos(userId);
  await carregarApostilas(userId);
  await carregarAvaliacoes(userId);

  async function carregarCursosDisponiveis() {
    try {
      const response = await fetch('http://localhost:3000/api/Mcursos');
      const cursos = await response.json();
      const container = document.getElementById('cursos-disponiveis');
      container.innerHTML = '';

      cursos.forEach(curso => {
        const div = document.createElement('div');
        div.classList.add('curso-card');
        div.innerHTML = `
          <h3>${curso.titulo}</h3>
          <p>${curso.descricao || 'Sem descrição'}</p>
          <p><strong>Categoria:</strong> ${curso.categoria}</p>
          <p><strong>Carga horária:</strong> ${curso.cargaHoraria} horas</p>
          <p><strong>Professor:</strong> ${curso.professores.map(p => p.nome).join(', ') || 'N/A'}</p>
          <button onclick="matricular(${curso.id})">Matricular-se</button>
        `;
        container.appendChild(div);
      });
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  }

  window.matricular = async function(cursoId) {
    try {
      const res = await fetch('http://localhost:3000/api/Mmatricular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cursoId })
      });

      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

      alert('Matrícula realizada com sucesso!');
      await carregarSeusCursos();
      await carregarApostilas(userId);
      await carregarAvaliacoes(userId);
    } catch (error) {
      console.error('Erro ao matricular:', error);
      alert('Erro ao realizar matrícula.');
    }
  };

  async function carregarSeusCursos() {
    const container = document.getElementById('seus-cursos-lista');
    container.innerHTML = '';

    try {
      const res = await fetch(`http://localhost:3000/api/Mmeus-cursos/${userId}`);
      const cursos = await res.json();

      for (const curso of cursos) {
        const card = document.createElement('div');
        card.classList.add('curso-card');

        const resVideo = await fetch(`http://localhost:3000/api/Mvideos/${curso.id}`);
        if (!resVideo.ok) {
          console.warn(`Vídeo não encontrado para o curso ${curso.titulo}`);
          continue;
        }
        const video = await resVideo.json();

        const resProgresso = await fetch(`http://localhost:3000/api/Mprogresso-video/${userId}/${video.id}`);
        let progresso = 0;
        if (resProgresso.ok) {
          const progressoData = await resProgresso.json();
          progresso = progressoData.progressoVideo || 0;
        }

        card.innerHTML = `
          <h3>${curso.titulo}</h3>
          <p>${curso.descricao || 'Sem descrição'}</p>
          <div class="progress-bar-container" style="background:#eee; width: 100%; height: 10px; border-radius: 5px; margin-bottom: 8px;">
            <div class="progress-bar" style="width: ${progresso}%; height: 100%; background: #4caf50; border-radius: 5px; transition: width 0.5s;"></div>
          </div>
          <button class="assistir-btn">Assistir</button>
        `;

        const btn = card.querySelector('.assistir-btn');
        btn.addEventListener('click', async () => {
          try {
            const updateRes = await fetch('http://localhost:3000/api/Mprogresso-video', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                alunoId: userId,
                videoId: video.id
              })
            });

            if (!updateRes.ok) throw new Error('Erro ao atualizar progresso');

            card.querySelector('.progress-bar').style.width = '100%';
            window.open(video.url, '_blank');
          } catch (err) {
            console.error('Erro ao atualizar progresso ou abrir vídeo:', err);
            alert('Erro ao carregar o vídeo ou atualizar progresso.');
          }
        });

        container.appendChild(card);
      }
    } catch (error) {
      console.error('Erro ao carregar cursos do aluno:', error);
    }
  }

  async function carregarApostilas() {
    const container = document.getElementById('apostilas-container');
    container.innerHTML = '';

    try {
      const res = await fetch(`http://localhost:3000/api/Mapostilas/${userId}`);
      const apostilas = await res.json();

      apostilas.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('curso-card');
        card.innerHTML = `
          <h3>${item.cursoTitulo}</h3>
          <p><strong>Apostila:</strong> ${item.titulo}</p>
          <a href="${item.url}" target="_blank"><button>Visualizar Apostila</button></a>
        `;
        container.appendChild(card);
      });
    } catch (error) {
      console.error('Erro ao carregar apostilas:', error);
    }
  }

  async function carregarAvaliacoes() {
    const container = document.getElementById('avaliacoes-container');
    container.innerHTML = '';

    try {
      const res = await fetch(`http://localhost:3000/api/Mavaliacoes/${userId}`);
      const avaliacoes = await res.json();

      avaliacoes.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('curso-card');
        card.innerHTML = `
          <h3>${item.cursoTitulo}</h3>
          <p><strong>Avaliação:</strong> ${item.titulo}</p>
          <a href="${item.url}" target="_blank"><button>Ir para Avaliação</button></a>
        `;
        container.appendChild(card);
      });
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    }
  }

  function mostrarVideosCurso(videoUrl, tituloCurso) {
    const videoFrame = document.getElementById('cursoVideo');
    const titulo = document.getElementById('cursoTitulo');
    const detalhes = document.getElementById('cursoDetalhes');

    videoFrame.src = videoUrl;
    titulo.textContent = tituloCurso;
    detalhes.hidden = false;
  }

  window.voltarParaCursos = () => {
    document.getElementById('cursoDetalhes').hidden = true;
  };
});
