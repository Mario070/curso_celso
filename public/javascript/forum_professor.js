        // Dados do fórum
        const forumData = {
            categories: [
                { id: 1, name: "Planejamento de Aulas", description: "Discuta estratégias e métodos de ensino"},
                { id: 2, name: "Recursos Didáticos", description: "Compartilhe materiais e ferramentas úteis"},
                { id: 3, name: "Dúvidas Técnicas", description: "Tire dúvidas sobre a plataforma" }
            ],
            topics: [
             
            ]
        };

        // Função para renderizar categorias
        function renderCategories() {
            const container = document.getElementById('categories-container');
            container.innerHTML = '';
            
            forumData.categories.forEach(category => {
                const categoryElement = document.createElement('div');
                categoryElement.className = 'category';
                categoryElement.innerHTML = `
                    <h2>${category.name}</h2>
                    <p title="${category.description}">${category.description}</p>

                `;
                categoryElement.addEventListener('click', () => filterTopicsByCategory(category.id));
                container.appendChild(categoryElement);
            });
        }

        // Função para renderizar tópicos
        function renderTopics(topics = forumData.topics) {
            const container = document.getElementById('topics-container');
            container.innerHTML = '';
            
            if (topics.length === 0) {
                container.innerHTML = '<p>Nenhum tópico encontrado nesta categoria.</p>';
                return;
            }
            
            topics.forEach(topic => {
                const category = forumData.categories.find(c => c.id === topic.categoryId);
                const topicElement = document.createElement('div');
                topicElement.className = 'topic';
                topicElement.innerHTML = `
                    <h2>${topic.title}</h2>
                    <div class="topic-meta">
                        <span class="author">Por ${topic.author}</span>
                        <span class="date">${topic.date}</span>
                        <span class="replies">${topic.replies} respostas</span>
                        <span class="category">Categoria: ${category.name}</span>
                    </div>
                    <p>${topic.content}</p>
                    <a href="#" class="btn-reply">Responder</a>
                `;
                container.appendChild(topicElement);
            });
        }

        // Função para filtrar tópicos por categoria
        function filterTopicsByCategory(categoryId) {
            const filteredTopics = forumData.topics.filter(topic => topic.categoryId === categoryId);
            renderTopics(filteredTopics);
        }

        // Função para popular o select de categorias
        function populateCategorySelect() {
            const select = document.getElementById('topic-category');
            select.innerHTML = '<option value="">Selecione uma categoria</option>';
            
            forumData.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        }

        // Função para adicionar um novo tópico
        function addNewTopic(event) {
            event.preventDefault();
            
            const title = document.getElementById('topic-title').value;
            const categoryId = parseInt(document.getElementById('topic-category').value);
            const content = document.getElementById('topic-content').value;
            
            if (!title || !categoryId || !content) {
                alert('Preencha todos os campos!');
                return;
            }
            
            // Criar novo tópico
            const newTopic = {
                id: forumData.topics.length + 1,
                categoryId,
                title,
                author: "Você",
                date: new Date().toLocaleDateString('pt-BR'),
                replies: 0,
                content
            };
            
            // Adicionar ao array de tópicos
            forumData.topics.unshift(newTopic);
            
            // Atualizar contagem na categoria
            const categoryIndex = forumData.categories.findIndex(c => c.id === categoryId);
            if (categoryIndex !== -1) {
                forumData.categories[categoryIndex].topics++;
            }
            
            // Resetar formulário
            document.getElementById('new-topic-form').reset();
            
            // Atualizar exibição
            renderCategories();
            renderTopics();
            
            alert('Tópico publicado com sucesso!');
        }

        // Função para mostrar seções
        function mostrarSecao(secaoId) {
            // Esconde todas as seções
            document.querySelectorAll('.secao').forEach(secao => {
                secao.classList.remove('ativa');
                secao.hidden = true;
            });
            
            // Mostra a seção selecionada
            const secaoAtiva = document.getElementById(secaoId);
            secaoAtiva.classList.add('ativa');
            secaoAtiva.hidden = false;
            
            // Se for o fórum, renderiza os dados
            if (secaoId === 'forum') {
                renderCategories();
                renderTopics();
                populateCategorySelect();
            }
        }
        
        // Função para alternar o menu do usuário
        function toggleMenu() {
            const menu = document.getElementById('dropdownMenu');
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }
        
        // Fechar menu quando clicar fora
        window.onclick = function(event) {
            if (!event.target.matches('.user-avatar')) {
                const dropdowns = document.getElementsByClassName('dropdown-menu');
                for (let i = 0; i < dropdowns.length; i++) {
                    const openDropdown = dropdowns[i];
                    if (openDropdown.style.display === 'block') {
                        openDropdown.style.display = 'none';
                    }
                }
            }
        }
        
        // Função de logout (exemplo)
        function logout() {
            alert('Você foi desconectado');
            // Aqui você adicionaria a lógica real de logout
        }
        
        // Event Listeners
        document.getElementById('new-topic-form').addEventListener('submit', addNewTopic);
        
        // Mostrar a seção inicial ao carregar a página
        document.addEventListener('DOMContentLoaded', function() {
            mostrarSecao('seus-cursos');
        });