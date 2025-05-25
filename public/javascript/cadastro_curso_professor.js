
function buscarProfessorReal() {
    const query = document.getElementById('buscarProfessor').value.trim();

    if (query === "") {
        alert("Digite o nome ou CPF do professor.");
        return;
    }

    let nome = ""; // aqui inicializa como string vazia
    let cpf = "";

    if (/^\d+$/.test(query)) {
        cpf = query;
    } else {
        nome = query;
    }

    // Construção da URL com base nos parâmetros
    let url = 'http://localhost:3000/api/buscar-professor';

    // Adiciona os parâmetros na query string
    const params = new URLSearchParams();
    if (nome) params.append('nome', nome);
    if (cpf) params.append('cpf', cpf);

    url += `?${params.toString()}`;

    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Resposta inválida do servidor.");
        }
        return res.json();
    })
    .then(data => {
        const container = document.getElementById("resultadoBuscaProfessor");
        container.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            container.innerHTML = "<p>Nenhum professor encontrado.</p>";
            return;
        }

        data.forEach(prof => {
            const profDiv = document.createElement("div");
            profDiv.classList.add("professor-box");
            profDiv.dataset.professorId = prof.id;

            profDiv.innerHTML = `
                <p><strong>Nome:</strong> ${prof.nome}</p>
                <p><strong>CPF:</strong> ${prof.cpf}</p>
                <p><strong>Email:</strong> ${prof.email}</p>
                <button onclick="carregarCursos(${prof.id})">Cadastrar a um curso</button>
                <div id="cursos-professor-${prof.id}" class="cursos-container"></div>
            `;

            container.appendChild(profDiv);
        });
    })
    .catch(err => {
        console.error("Erro ao buscar professor:", err);
        alert("Erro ao buscar professor.");
    });
}

function carregarCursos(professorId) {
    const containerCursos = document.getElementById(`cursos-professor-${professorId}`);
    containerCursos.innerHTML = "<p>Carregando cursos...</p>";

    fetch('http://localhost:3000/api/curso', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Erro ao buscar cursos.");
        }
        return res.json();
    })
    .then(cursos => {
        containerCursos.innerHTML = ""; // Limpa o loading

        if (!Array.isArray(cursos) || cursos.length === 0) {
            containerCursos.innerHTML = "<p>Nenhum curso disponível.</p>";
            return;
        }

        cursos.forEach(curso => {
            const cursoDiv = document.createElement("div");
            cursoDiv.classList.add("curso-item");

            cursoDiv.innerHTML = `
                <p><strong>Curso:</strong> ${curso.titulo}</p>
                <button onclick="associarProfessorCurso(${professorId}, ${curso.id})">Associar</button>
            `;

            containerCursos.appendChild(cursoDiv);
        });
    })
    .catch(err => {
        console.error(err);
        containerCursos.innerHTML = "<p>Erro ao carregar cursos.</p>";
    });
}

/*async function associarProfessorCurso(professorId, cursoId) {
    try {
        const response = await fetch(`http://localhost:3000/api/cursos-professor?professorId=${professorId}`);
        const cursos = await response.json();

        console.log("Cursos recebidos:", cursos); // VERIFICAÇÃO IMPORTANTE

        if (!Array.isArray(cursos)) {
            throw new Error("Resposta inesperada: cursos não é um array");
        }

        const jaAssociado = cursos.some(curso => curso.id === cursoId);
        if (jaAssociado) {
            alert("Esse curso já foi associado ao professor.");
            return;
        }

        const res = await fetch('http://localhost:3000/api/atribuir-cursos-professor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ professorId, cursosIds: [cursoId] })
        });

        if (!res.ok) throw new Error("Erro ao associar curso.");

        const data = await res.json();
        alert("Curso associado com sucesso!");
        console.log("Professor atualizado:", data.professor);

    } catch (error) {
        console.error("Erro ao associar curso:", error);
        alert("Erro ao associar curso ao professor.");
    }
}

*/

async function associarProfessorCurso(professorId, cursoId) {
    try {
        const response = await fetch(`http://localhost:3000/api/cursos-professor?professorId=${professorId}`);
        const data = await response.json();

        // Extrair os cursos corretamente, seja direto (array) ou dentro de um objeto
        let cursos = [];

        if (Array.isArray(data)) {
            cursos = data;
        } else if (Array.isArray(data.cursosMinistrados)) {
            cursos = data.cursosMinistrados;
        } else {
            cursos = data.cursosMinistrados || data; // fallback
        }

        // Garante que seja um array, mesmo que só tenha um curso
        if (!Array.isArray(cursos)) {
            cursos = [cursos];
        }

        const jaAssociado = cursos.some(curso => curso.id === cursoId);
        if (jaAssociado) {
            alert("Esse curso já foi associado ao professor.");
            return;
        }

        const res = await fetch('http://localhost:3000/api/atribuir-cursos-professor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ professorId, cursosIds: [cursoId] })
        });

        if (!res.ok) throw new Error("Erro ao associar curso.");

        const resData = await res.json();
        alert("Curso associado com sucesso!");
        console.log("Professor atualizado:", resData.professor);

    } catch (error) {
        console.error("Erro ao associar curso:", error.message || error);
        alert("Erro ao associar curso ao professor.");
    }
}
