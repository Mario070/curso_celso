        // Alternar o menu dropdown
        function toggleMenu() {
            const dropdown = document.getElementById('dropdownMenu');
            dropdown.classList.toggle('show');
        }
        
        // Fechar o dropdown ao clicar fora
        window.onclick = function(event) {
            if (!event.target.matches('.user-avatar')) {
                const dropdowns = document.getElementsByClassName('dropdown-menu');
                for (let i = 0; i < dropdowns.length; i++) {
                    const openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }
        
        // Mostrar a seção selecionada e esconder as outras
        function mostrarSecao(idSecao) {
            document.querySelectorAll('.secao').forEach(secao => {
                secao.hidden = true;
            });
            document.getElementById(idSecao).hidden = false;
        }
        
        // Mostrar "Seus cursos" por padrão ao carregar a página
        window.onload = function() {
            mostrarSecao('seus-cursos');
        };
        
        // Função de logout
        function logout() {
            // Adicione sua lógica de logout aqui
            alert('Você será desconectado.');
            // window.location.href = 'logout.php'; // Exemplo de redirecionamento
        }