
document.addEventListener('DOMContentLoaded', function() {
    const btnAvancarProfessor = document.getElementById('btn_avancar_professor');
    if (btnAvancarProfessor) {
        btnAvancarProfessor.addEventListener('click', function(e) {
            e.preventDefault();

            const nome = document.getElementById('nome_professor').value;
            const sobrenome = document.getElementById('sobrenome_professor').value;
            const email = document.getElementById('email_professor').value;
            const cpf = document.getElementById('cpf_professor').value;
            const senha = document.getElementById('password_professor').value;
            const tipo = "professor";

            if (!nome || !sobrenome || !email || !cpf || !senha) {
                alert('Preencha todos os campos!');
                return;
            }

            fetch('http://localhost:3000/api/salvar-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, sobrenome, email, cpf, senha, tipo })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('Cadastro de professor realizado com sucesso!');
                    // Redirecionar ou limpar formulário, se desejar
                }
            })
            .catch(err => alert('Erro ao cadastrar professor!'));
        });
    }
});
document.getElementById('botaoSair').addEventListener('click', function() {
    window.location.href = 'login.html';
});


/*document.addEventListener('DOMContentLoaded', function() {
    const btnAvancarProfessor = document.getElementById('btn_avancar_professor');

    if (btnAvancarProfessor) {
        btnAvancarProfessor.addEventListener('click', function(e) {
            e.preventDefault();

            const nome = document.getElementById('nome_professor').value.trim();
            const sobrenome = document.getElementById('sobrenome_professor').value.trim();
            const email = document.getElementById('email_professor').value.trim();
            const cpf = document.getElementById('cpf_professor').value.trim();
            const senha = document.getElementById('password_professor').value.trim();
            const tipo = 'professor';  // fixo

            if (!nome || !sobrenome || !email || !cpf || !senha) {
                alert('Por favor, preencha todos os campos.');
                return;
            }

            // Monta o nome completo juntando nome + sobrenome
            const nomeCompleto = `${nome} ${sobrenome}`;

            fetch('http://localhost:3000/api/salvar-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: nomeCompleto,
                    email,
                    cpf,
                    senha,
                    tipo
                })
            })
            .then(data => {
    console.log('Resposta do backend:', data);
    if (data.error) {
        alert(data.error);
    } else if (data.id) {
        professorIdCadastrado = data.id;
        alert('Cadastro de professor realizado com sucesso! ID: ' + professorIdCadastrado);
        // continuar o fluxo
    } else {
        alert('Erro inesperado: id do professor não retornado.');
    }
})

        });
    }
});

    const botaoSair = document.getElementById('botaoSair');
    if (botaoSair) {
        botaoSair.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    }
*/