
document.addEventListener('DOMContentLoaded', function() {
    
    // Função para atualizar a foto de perfil
    function atualizarFotoPerfil(event) {
        const arquivo = event.target.files[0];
        if (arquivo) {
            if (!arquivo.type.match('image.*')) {
                alert('Por favor, selecione uma imagem válida!');
                return;
            }
            
            if (arquivo.size > 2 * 1024 * 1024) {
                alert('A imagem deve ter menos de 2MB!');
                return;
            }
            
            const leitor = new FileReader();
            leitor.onload = function(e) {
                fotoPerfil.src = e.target.result;
                // Simular upload para o servidor
                setTimeout(() => {
                    console.log('Foto atualizada no servidor');
                }, 1000);
            };
            leitor.readAsDataURL(arquivo);
        }
    }

    // Carrega os dados do usuário na página
    function carregarDadosUsuario() {
        document.getElementById('nomeUsuario').textContent = dadosUsuario.nome;
        document.getElementById('tituloUsuario').textContent = dadosUsuario.titulo;
        document.getElementById('emailUsuario').textContent = dadosUsuario.email;
        document.getElementById('telefoneUsuario').textContent = dadosUsuario.telefone;
        document.getElementById('curso').textContent = dadosUsuario.curso;
        document.getElementById('empresaUsuario').textContent = dadosUsuario.empresa;
        document.getElementById('cargoUsuario').textContent = dadosUsuario.cargo;
        document.getElementById('instituicaoUsuario').textContent = dadosUsuario.instituicao;
    }
    
    // Event Listeners
    botaoAlterarFoto.addEventListener('click', function() {
        inputArquivo.click();
    });
    
    inputArquivo.addEventListener('change', atualizarFotoPerfil);
    
    // Carregar dados iniciais
    carregarDadosUsuario();
});