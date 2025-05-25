async function buscarUsuario() {
  const termoBusca = document.getElementById('buscaUsuario').value.trim();

  if (!termoBusca) {
    alert('Digite o nome ou email do usuário.');
    return;
  }

  try {
    const resposta = await fetch(`http://localhost:3000/api/usuarios?query=${encodeURIComponent(termoBusca)}`);
    const usuarios = await resposta.json();

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      alert('Usuário não encontrado.');
      document.getElementById('formEditarUsuario').style.display = 'none';
      return;
    }

    const usuario = usuarios[0]; // Pega o primeiro usuário encontrado

    // Preenche os campos com os dados
    document.getElementById('usuarioIdEdit').value = usuario.id;
    document.getElementById('nomeUsuarioEdit').value = usuario.nome;
    document.getElementById('sobrenomeUsuarioEdit').value = usuario.sobrenome || '';
    document.getElementById('emailUsuarioEdit').value = usuario.email;
    document.getElementById('cpfUsuarioEdit').value = usuario.cpf || '';
    document.getElementById('tipoUsuarioEdit').value = usuario.tipo || '';

    // Mostra o formulário
    document.getElementById('formEditarUsuario').style.display = 'block';

    // Desabilita os campos e habilita o botão editar (caso tenha sido editado antes)
    toggleCampos(false);
    document.getElementById('btnEditar').disabled = false;
  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
    alert('Erro ao buscar usuário.');
  }
}

function ativarEdicao() {
  toggleCampos(true); // habilita os campos
  document.getElementById('btnEditar').disabled = true; // desabilita botão editar enquanto edita
}

async function salvarEdicaoUsuario() {
  const id = document.getElementById('usuarioIdEdit').value;
  const nome = document.getElementById('nomeUsuarioEdit').value;
  const sobrenome = document.getElementById('sobrenomeUsuarioEdit').value;
  const email = document.getElementById('emailUsuarioEdit').value;
  const cpf = document.getElementById('cpfUsuarioEdit').value;
  const tipo = document.getElementById('tipoUsuarioEdit').value;

  try {
   const resposta = await fetch(`http://localhost:3000/api/usuarios/${id}`, {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nome, sobrenome, email, cpf, tipo })
});

    if (!resposta.ok) {
      throw new Error('Erro ao salvar as alterações.');
    }

    alert('Usuário atualizado com sucesso!');
    document.getElementById('formEditarUsuario').style.display = 'none';
  } catch (erro) {
    console.error('Erro ao salvar:', erro);
    alert('Erro ao salvar as alterações.');
  }
}

function cancelarEdicaoUsuario() {
  document.getElementById('formEditarUsuario').style.display = 'none';
}

// Função auxiliar para habilitar/desabilitar campos do formulário
function toggleCampos(habilitar) {
  const campos = document.querySelectorAll('#formEditarUsuario input, #formEditarUsuario select');

  campos.forEach(campo => {
    // Não mexe no input hidden (id)
    if (campo.type !== 'hidden') {
      campo.disabled = !habilitar;
    }
  });
}
