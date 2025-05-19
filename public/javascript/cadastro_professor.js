
// Credenciais do administrador (em um sistema real, isso viria de um servidor seguro)
const credenciaisAdmin = {
    usuario: "admin",
    senha: "admin123"
};

// Array para armazenar os professores (em um sistema real, isso viria de um banco de dados)
let professores = [
];

// Elementos do DOM
const secaoLogin = document.getElementById('secaoLogin');
const painelAdmin = document.getElementById('painelAdmin');
const formularioLogin = document.getElementById('formularioLogin');
const botaoSair = document.getElementById('botaoSair');
const corpoTabelaProfessores = document.getElementById('corpoTabelaProfessores');
const formularioProfessor = document.getElementById('formularioProfessor');
const erroLogin = document.getElementById('erroLogin');
const mensagemSucesso = document.getElementById('mensagemSucesso');

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
    // Limpar o formulário de login
    formularioLogin.reset();
});

// Evento para adicionar/editar professor
formularioProfessor.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nomeProfessor').value;
    const email = document.getElementById('emailProfessor').value;
    const telefone = document.getElementById('telefoneProfessor').value;
    const disciplina = document.getElementById('disciplinaProfessor').value;
    const formacao = document.getElementById('formacaoProfessor').value;
    
    // Verificar se é uma edição ou novo cadastro
    const idEdicao = formularioProfessor.getAttribute('data-id-edicao');
    
    if (idEdicao) {
        // Editar professor existente
        const indiceProfessor = professores.findIndex(p => p.id === parseInt(idEdicao));
        if (indiceProfessor !== -1) {
            professores[indiceProfessor] = {
                id: parseInt(idEdicao),
                nome,
                email,
                telefone,
                disciplina,
                formacao
            };
            
            mostrarMensagemSucesso('Professor atualizado com sucesso!');
        }
    } else {
        // Adicionar novo professor
        const novoId = professores.length > 0 ? Math.max(...professores.map(p => p.id)) + 1 : 1;
        
        professores.push({
            id: novoId,
            nome,
            email,
            telefone,
            disciplina,
            formacao
        });
        
        mostrarMensagemSucesso('Professor cadastrado com sucesso!');
    }
    
    // Atualizar a tabela e limpar o formulário
    renderizarTabelaProfessores();
    formularioProfessor.reset();
    formularioProfessor.removeAttribute('data-id-edicao');
});

// Função para exibir o painel do administrador
function mostrarPainelAdmin() {
    secaoLogin.style.display = 'none';
    painelAdmin.style.display = 'block';
    renderizarTabelaProfessores();
}

// Função para exibir a seção de login
function mostrarSecaoLogin() {
    secaoLogin.style.display = 'block';
    painelAdmin.style.display = 'none';
}

// Função para renderizar a tabela de professores
function renderizarTabelaProfessores() {
    corpoTabelaProfessores.innerHTML = '';
    
    if (professores.length === 0) {
        corpoTabelaProfessores.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum professor cadastrado</td></tr>';
        return;
    }
    
    professores.forEach(professor => {
        const linha = document.createElement('tr');
        
        linha.innerHTML = `
            <td>${professor.id}</td>
            <td>${professor.nome}</td>
            <td>${professor.email}</td>
            <td>${professor.telefone}</td>
            <td>${professor.disciplina}</td>
            <td>${professor.formacao}</td>
            <td>
                <button onclick="editarProfessor(${professor.id})" style="background-color: #f39c12; padding: 5px 10px; margin-right: 5px;">Editar</button>
                <button onclick="excluirProfessor(${professor.id})" style="background-color: #e74c3c; padding: 5px 10px;">Excluir</button>
            </td>
        `;
        
        corpoTabelaProfessores.appendChild(linha);
    });
}

// Função para editar professor
window.editarProfessor = function(id) {
    const professor = professores.find(p => p.id === id);
    
    if (professor) {
        document.getElementById('nomeProfessor').value = professor.nome;
        document.getElementById('emailProfessor').value = professor.email;
        document.getElementById('telefoneProfessor').value = professor.telefone;
        document.getElementById('disciplinaProfessor').value = professor.disciplina;
        document.getElementById('formacaoProfessor').value = professor.formacao;
        
        formularioProfessor.setAttribute('data-id-edicao', id);
        
        // Rolagem suave para o formulário
        document.querySelector('.formulario-adicionar-professor').scrollIntoView({ behavior: 'smooth' });
    }
};

// Função para excluir professor
window.excluirProfessor = function(id) {
    if (confirm('Tem certeza que deseja excluir este professor?')) {
        professores = professores.filter(p => p.id !== id);
        renderizarTabelaProfessores();
        mostrarMensagemSucesso('Professor excluído com sucesso!');
        
        // Se estava editando o professor excluído, limpar o formulário
        const idEdicao = formularioProfessor.getAttribute('data-id-edicao');
        if (idEdicao && parseInt(idEdicao) === id) {
            formularioProfessor.reset();
            formularioProfessor.removeAttribute('data-id-edicao');
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
