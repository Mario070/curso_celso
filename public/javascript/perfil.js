document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const fotoPerfil = document.getElementById('fotoPerfil');
    const botaoAlterarFoto = document.getElementById('botaoAlterarFoto');
    const inputArquivo = document.getElementById('inputArquivo');
    
    // Dados mockados (substituir por chamada API real)
    const dadosUsuario = {
        nome: "Maria Mota",
        titulo: "Professora de Biomedicina",
        email: "maria.brisa@example.com",
        telefone: "(71) 98765-4321",
        curso: "Bioimagem Avançada",
        empresa: "Minerva's Academy",
        cargo: "Professor",
        bio: "Professora com 10 anos de experiência em educação..."
    };

    // Função para atualizar a foto de perfil
    async function atualizarFotoPerfil(event) {
        const arquivo = event.target.files[0];
        if (!arquivo) return;

        try {
            // Validações
            if (!arquivo.type.match('image.*')) {
                throw new Error('Por favor, selecione uma imagem válida!');
            }
            
            if (arquivo.size > 2 * 1024 * 1024) {
                throw new Error('A imagem deve ter menos de 2MB!');
            }

            // Feedback visual
            botaoAlterarFoto.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            botaoAlterarFoto.disabled = true;

            // Ler e exibir prévia
            const leitor = new FileReader();
            
            leitor.onload = function(e) {
                fotoPerfil.src = e.target.result;
                
                // Simular upload (substituir por chamada API real)
                setTimeout(async () => {
                    try {
                        // Aqui viria a chamada real para a API
                        // await api.uploadFotoPerfil(arquivo);
                        console.log('Foto atualizada no servidor');
                    } catch (error) {
                        console.error('Erro no upload:', error);
                        alert('Erro ao enviar foto: ' + error.message);
                    } finally {
                        botaoAlterarFoto.innerHTML = '<i class="fas fa-camera"></i>';
                        botaoAlterarFoto.disabled = false;
                    }
                }, 1000);
            };
            
            leitor.onerror = () => {
                throw new Error('Erro ao ler a imagem');
            };
            
            leitor.readAsDataURL(arquivo);
            
        } catch (error) {
            console.error(error);
            alert(error.message);
            botaoAlterarFoto.innerHTML = '<i class="fas fa-camera"></i>';
            botaoAlterarFoto.disabled = false;
        }
    }

    // Carrega os dados do usuário na página
    function carregarDadosUsuario() {
        try {
            document.getElementById('nomeUsuario').textContent = dadosUsuario.nome;
            document.getElementById('tituloUsuario').textContent = dadosUsuario.titulo;
            document.getElementById('emailUsuario').textContent = dadosUsuario.email;
            document.getElementById('telefoneUsuario').textContent = dadosUsuario.telefone;
            document.getElementById('curso').textContent = dadosUsuario.curso;
            document.getElementById('empresaUsuario').textContent = dadosUsuario.empresa;
            document.getElementById('cargoUsuario').textContent = dadosUsuario.cargo;
            document.getElementById('bioUsuario').textContent = dadosUsuario.bio;
            
            // Carregar foto do perfil se existir
            if (dadosUsuario.fotoUrl) {
                fotoPerfil.src = dadosUsuario.fotoUrl;
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }
    
    // Event Listeners
    botaoAlterarFoto.addEventListener('click', function() {
        inputArquivo.click();
    });
    
    inputArquivo.addEventListener('change', atualizarFotoPerfil);
    
    // Carregar dados iniciais
    carregarDadosUsuario();

    // Exemplo de como seria uma chamada real à API
    async function carregarDadosReais() {
        try {
            /*
            const response = await fetch('/api/usuario');
            if (!response.ok) throw new Error('Erro ao carregar dados');
            const dados = await response.json();
            dadosUsuario = dados;
            carregarDadosUsuario();
            */
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
        }
    }
});