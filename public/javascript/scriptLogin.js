document.getElementById('btnLogin').addEventListener('click', () => {
  const email = document.getElementById('login_user').value;
  const senha = document.getElementById('password_user').value;

  fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  })
  .then(response => {
    if (!response.ok) throw new Error('Email ou senha inválidos');
    return response.json();
  })
  .then(data => {
    console.log('Dados recebidos no login:', data);  // Verifique aqui no console
    localStorage.setItem('usuarioId', data.id);       // Salva o ID no localStorage

    if (data.tipo === 'admin') {
      window.location.href = 'cadastro_adm.html';
    } else if (data.tipo === 'aluno') {
      window.location.href = 'tela_usuario.html';
    } else if (data.tipo === 'professor') {
      window.location.href = 'tela_professor.html';
    } else {
      alert('Tipo de usuário desconhecido.');
    }
  })
  .catch(error => {
    alert(error.message);
  });
});
