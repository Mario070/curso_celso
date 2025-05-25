document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formularioAdministrador');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = document.getElementById('btn_avancar_administrador');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner">⏳</span> Salvando...';

        try {
            const dados = {
                nome: document.getElementById('nome_administrador').value.trim(),
                sobrenome: document.getElementById('sobrenome_administrador').value.trim(),
                email: document.getElementById('email_administrador').value.trim(),
                senha: document.getElementById('password_administrador').value,
                cpf: document.getElementById('cpf_administrador').value.replace(/\D/g, ''),
                tipo: 'admin'
            };

            console.log('Enviando dados:', dados);

            if (!dados.nome || !dados.sobrenome) throw new Error('Nome e sobrenome são obrigatórios');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) throw new Error('Email inválido');
            if (dados.senha.length < 6) throw new Error('Senha muito curta');
            if (dados.cpf.length !== 11) throw new Error('CPF inválido');

            const response = await fetch('http://localhost:3000/api/salvar-usuario', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            const data = await response.json();
            console.log('Resposta:', data);

            if (!response.ok) throw new Error(data.error || 'Erro ao cadastrar');

            alert('Administrador cadastrado com sucesso!');
            form.reset();
        } catch (error) {
            alert(error.message);
            console.error('Erro no cadastro:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Salvar Administrador';
        }
    });
});
