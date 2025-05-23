
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const formularioCadastro = document.getElementById('formulario-cadastro');
    const secaoPlanos = document.getElementById('secao-planos');
    const secaoPagamento = document.getElementById('secao-pagamento');
    const detalhesCartao = document.getElementById('detalhes-cartao');
    const tipoCadastro = document.getElementById('tipo_cadastro');
    const tituloFormulario = document.getElementById('titulo-formulario');
    
    // Botões
    const botaoAvancar = document.getElementById('botao-avancar');
    const botaoVoltarPlano = document.getElementById('botao-voltar-plano');
    const botaoProsseguir = document.getElementById('botao-prosseguir');
    const botaoVoltarPagamento = document.getElementById('botao-voltar-pagamento');
    const botaoConcluir = document.getElementById('botao-concluir');
    
    // Métodos de pagamento
    const metodosPagamento = document.querySelectorAll('input[name="metodo_pagamento"]');
    
    // Planos
    const opcoesPlano = document.querySelectorAll('.opcao-plano');
    
    // Configurar tipo de cadastro a partir da URL
    const urlParams = new URLSearchParams(window.location.search);
    const tipo = urlParams.get('tipo') || 'aluno';
    
    // Definir o valor do tipo de cadastro
    tipoCadastro.value = tipo;
    
    // Configurar título do formulário
    function atualizarTitulo() {
        tituloFormulario.textContent = tipoCadastro.value === 'aluno' ? 'CADASTRO DE ALUNO' : 'CADASTRO DE PROFESSOR';
    }
    
    atualizarTitulo();
    
    // Seleção de planos - efeito visual
    opcoesPlano.forEach(opcao => {
        opcao.addEventListener('click', function() {
            opcoesPlano.forEach(opt => opt.classList.remove('selecionado'));
            this.classList.add('selecionado');
        });
    });
    
    // Mostrar campos de cartão quando selecionado
    metodosPagamento.forEach(metodo => {
        metodo.addEventListener('change', function() {
            detalhesCartao.style.display = this.id === 'cartao_credito' ? 'block' : 'none';
        });
    });
    
    // Validação de campos
    function validarCampo(campoId, erroId, validacaoFn) {
        const campo = document.getElementById(campoId);
        const erro = document.getElementById(erroId);
        const valido = validacaoFn(campo.value);
        
        if (!valido) {
            campo.classList.add('invalido');
            erro.style.display = 'block';
            return false;
        } else {
            campo.classList.remove('invalido');
            erro.style.display = 'none';
            return true;
        }
    }
    
    // Validação do formulário principal
    function validarFormularioPrincipal() {
        let valido = true;
        
        valido &= validarCampo('nome_cadastro', 'erro-nome', valor => valor.trim() !== '');
        valido &= validarCampo('sobrenome_cadastro', 'erro-sobrenome', valor => valor.trim() !== '');
        valido &= validarCampo('email_cadastro', 'erro-email', valor => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor));
        valido &= validarCampo('cpf_cadastro', 'erro-cpf', valor => /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(valor));
        valido &= validarCampo('login_cadastro', 'erro-usuario', valor => valor.trim() !== '');
        valido &= validarCampo('password_cadastro', 'erro-senha', valor => valor.trim() !== '');
        
        return valido;
    }
    
    // Validação do plano selecionado
    function validarPlano() {
        const planoSelecionado = document.querySelector('input[name="plano"]:checked');
        
        if (!planoSelecionado) {
            alert('Por favor, selecione um plano.');
            return false;
        }
        
        return true;
    }
    
    // Validação dos dados do pagamento
    function validarPagamento() {
        const metodoSelecionado = document.querySelector('input[name="metodo_pagamento"]:checked');
        
        if (!metodoSelecionado) {
            alert('Por favor, selecione um método de pagamento.');
            return false;
        }
        
        if (metodoSelecionado.id === 'cartao_credito') {
            let valido = true;
            
            valido &= validarCampo('titular_cartao', 'erro-titular', valor => valor.trim() !== '');
            valido &= validarCampo('numero_cartao', 'erro-numero', valor => /^\d{16}$/.test(valor.replace(/\s/g, '')));
            valido &= validarCampo('validade_cartao', 'erro-validade', valor => valor.trim() !== '');
            valido &= validarCampo('cvv_cartao', 'erro-cvv', valor => /^\d{3}$/.test(valor));
            
            return valido;
        }
        
        return true;
    }
    
    // Evento do botão Avançar
    botaoAvancar.addEventListener('click', function() {
        if (validarFormularioPrincipal()) {
            if (tipoCadastro.value === 'aluno') {
                formularioCadastro.style.display = 'none';
                secaoPlanos.style.display = 'block';
            } else {
                enviarFormulario();
            }
        }
    });
    
    // Evento do botão Voltar (da seleção de planos)
    botaoVoltarPlano.addEventListener('click', function() {
        secaoPlanos.style.display = 'none';
        formularioCadastro.style.display = 'block';
    });
    
    // Evento do botão Prosseguir (para pagamento)
    botaoProsseguir.addEventListener('click', function() {
        if (validarPlano()) {
            secaoPlanos.style.display = 'none';
            secaoPagamento.style.display = 'block';
        }
    });
    
    // Evento do botão Voltar (do pagamento)
    botaoVoltarPagamento.addEventListener('click', function() {
        secaoPagamento.style.display = 'none';
        secaoPlanos.style.display = 'block';
    });
    
    // Evento do botão Concluir
    botaoConcluir.addEventListener('click', function() {
        if (validarPagamento()) {
            enviarFormulario();
        }
    });
    
    // Função para enviar o formulário
    function enviarFormulario() {
        // Simular envio do formulário
        alert('Cadastro realizado com sucesso!');
        
        // Redirecionar após 1 segundo (simulação)
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
    
    // Máscara para CPF
    document.getElementById('cpf_cadastro').addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        
        if (valor.length > 3) {
            valor = valor.replace(/^(\d{3})(\d)/, '$1.$2');
        }
        if (valor.length > 6) {
            valor = valor.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
        }
        if (valor.length > 9) {
            valor = valor.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
        }
        if (valor.length > 11) {
            valor = valor.substring(0, 14);
        }
        
        e.target.value = valor;
    });
    
    // Máscara para número do cartão
    document.getElementById('numero_cartao').addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        
        if (valor.length > 4) {
            valor = valor.replace(/^(\d{4})(\d)/, '$1 $2');
        }
        if (valor.length > 9) {
            valor = valor.replace(/^(\d{4})\s(\d{4})(\d)/, '$1 $2 $3');
        }
        if (valor.length > 14) {
            valor = valor.replace(/^(\d{4})\s(\d{4})\s(\d{4})(\d)/, '$1 $2 $3 $4');
        }
        if (valor.length > 19) {
            valor = valor.substring(0, 19);
        }
        
        e.target.value = valor;
    });
});
