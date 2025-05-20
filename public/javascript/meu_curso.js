// MAIS OU MESNO QUE VAI SER USADO APRA CHAMA O CUROS CADASTRADO NO BANCO
//ESSE E MODELO QUE CHAMA O CURDOS CADASTRADO NO SERVE LOCALSTORAGE,
//  POSSO QUE QUE AUNDO FIZER PARA O BANCO MUDE.. MAAIS JA UM ABASE


/*
document.addEventListener('DOMContentLoaded', function () {
  // Recupera os cursos do localStorage
  const courses = JSON.parse(localStorage.getItem('courses')) || [];

  // Seleciona o elemento onde os cursos serão exibidos
  const coursesList = document.getElementById('coursesList');

  // Verifica se há cursos cadastrados
  if (courses.length === 0) {
    coursesList.innerHTML = '<p>Nenhum curso cadastrado.</p>';
  } else {
    // Itera sobre os cursos e cria cards
    courses.forEach(course => {
      const card = document.createElement('div');
      card.classList.add('course-card');

      // Adiciona uma imagem fictícia (você pode substituir por uma imagem real)
      card.innerHTML = `
        <img src="https://via.placeholder.com/300x200?text=Curso " alt="${course.title}">
        <h2>${course.title}</h2>
        <p>${course.instructor}</p>
        <button>Deixe uma classificação</button>
      `;

      // Adiciona o card à lista de cursos
      coursesList.appendChild(card);
    });
  }
});
*/


// Script hiden e video

/*
const cursos = {
  "1": {
    titulo: "Curso de Python",
    youtubeid: "VuKvR1J2LQE"
  },
  "2": {
    titulo: "Curso de JavaScript",
    youtubeid: "A1BaZr82XJI"
  }
};

function acessarCurso(id) {
  // Esconde a seção de todos os cursos
  document.getElementById("cursos").hidden = true;

  // Mostra a seção de detalhes do curso
  const details = document.getElementById("cursoDetalhes");
  details.hidden = false;

  // Atualiza os dados do curso
  const curso = cursos[id];
  document.getElementById("cursoTitulo").textContent = curso.titulo;

  // Carrega o vídeo do YouTube
  const videoFrame = document.getElementById("cursoVideo");
  videoFrame.src = `https://www.youtube.com/embed/${curso.youtubeid}`;
}

function voltarParaCursos() {
  // Volta para a seção de todos os cursos
  document.getElementById("cursos").hidden = false;
  document.getElementById("cursoDetalhes").hidden = true;

  // Limpa o vídeo para parar a reprodução
  document.getElementById("cursoVideo").src = "";
}
*/

const cursos = {
  "1": {
    titulo: "Curso de Python",
    youtubeid: "VuKvR1J2LQE"
  },
  "2": {
    titulo: "Curso de JavaScript",
    youtubeid: "dQw4w9WgXcQ"
  }
};

// Função chamada ao clicar em "Acessar curso"
function acessarCurso(id) {
  const curso = cursos[id];

  // Oculta a lista de cursos
  document.getElementById("seus-cursos").hidden = true;

  // Mostra a seção de detalhes
  const detalhes = document.getElementById("cursoDetalhes");
  detalhes.hidden = false;

  // Atualiza título e vídeo
  document.getElementById("cursoTitulo").textContent = curso.titulo;
  document.getElementById("cursoVideo").src = `https://www.youtube.com/embed/${curso.youtubeid}`;
}

// Função chamada ao clicar em "Voltar"
function voltarParaCursos() {
  // Limpa o vídeo
  document.getElementById("cursoVideo").src = "";

  // Volta para a lista de cursos
  document.getElementById("cursoDetalhes").hidden = true;
  document.getElementById("cursos").hidden = false;
}