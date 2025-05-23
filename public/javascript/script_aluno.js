
document.addEventListener("DOMContentLoaded", function () {
    const btnAvancar = document.getElementById("btn_avancar");
    const tipoCadastro = document.getElementById("tipo_cadastro");
    const divPagamentos = document.getElementById("pagamentos");
    const planosContainer = document.getElementById("planos-container");

    const cartaoCheckbox = document.getElementById("cartao_credito");
    const boletoCheckbox = document.getElementById("boleto");
    const pixCheckbox = document.getElementById("pix");

    const dadosCartao = document.getElementById("dados_cartao");
    const parcelamento = document.getElementById("parcelamento");

    const pixJanela = document.getElementById("pix_janela");
    const btnFecharPix = document.getElementById("fechar_pix");

    const parcelasSelect = document.getElementById("parcelas");
    const valorParcela = document.createElement("p");
    dadosCartao.appendChild(valorParcela);

    // Mostrar planos e pagamento ao avançar
    btnAvancar.addEventListener("click", async function () {
        const tipo = tipoCadastro.value;
        if (tipo === "aluno") {
            divPagamentos.style.display = "block";
            try {
                const response = await fetch('http://localhost:3000/api/plano');
                const planos = await response.json();

                planosContainer.innerHTML = '';
                const tituloEscolherPlano = document.createElement('h2');
                tituloEscolherPlano.textContent = "Escolher um Plano";
                planosContainer.appendChild(tituloEscolherPlano);

                planos.forEach(plano => {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.name = 'plano';
                    checkbox.id = `plano_${plano.id}`;
                    checkbox.value = plano.valor;
                    checkbox.classList.add('plano-checkbox');

                    const label = document.createElement('label');
                    label.htmlFor = `plano_${plano.id}`;
                    label.textContent = plano.nome;

                    planosContainer.appendChild(checkbox);
                    planosContainer.appendChild(label);
                    planosContainer.appendChild(document.createElement('br'));
                });

                setTimeout(() => {
                    const planoCheckboxes = document.querySelectorAll('.plano-checkbox');
                    planoCheckboxes.forEach(checkbox => {
                        checkbox.addEventListener("change", function () {
                            if (this.checked) {
                                planoCheckboxes.forEach(cb => {
                                    if (cb !== this) cb.checked = false;
                                });
                                atualizarValorParcela(parseFloat(this.value));
                            }
                        });
                    });
                }, 100);
            } catch (error) {
                console.error('Erro ao carregar planos:', error);
            }
        } else {
            divPagamentos.style.display = "none";
        }
    });

    // Exclusividade dos métodos de pagamento
    function desmarcarOutros(marcado) {
        [pixCheckbox, boletoCheckbox, cartaoCheckbox].forEach(checkbox => {
            if (checkbox !== marcado) checkbox.checked = false;
        });

        if (marcado !== cartaoCheckbox) {
            dadosCartao.style.display = "none";
            parcelamento.style.display = "none";
        }
    }

    cartaoCheckbox.addEventListener("change", function () {
        if (this.checked) {
            desmarcarOutros(this);
            dadosCartao.style.display = "block";
            parcelamento.style.display = "block";
        } else {
            dadosCartao.style.display = "none";
            parcelamento.style.display = "none";
        }
    });

    boletoCheckbox.addEventListener("change", function () {
        if (this.checked) {
            desmarcarOutros(this);
            window.open("boleto.html", "_blank");
        }
    });

    pixCheckbox.addEventListener("change", function () {
        if (this.checked) {
            desmarcarOutros(this);
            pixJanela.style.display = "block";
        } else {
            pixJanela.style.display = "none";
        }
    });

    btnFecharPix.addEventListener("click", function () {
        pixJanela.style.display = "none";
        pixCheckbox.checked = false;
    });

    // Valor por parcela
    parcelasSelect.addEventListener("change", function () {
        const planoSelecionado = document.querySelector('input[name="plano"]:checked');
        if (planoSelecionado) {
            const planoValor = parseFloat(planoSelecionado.value);
            atualizarValorParcela(planoValor);
        }
    });

    function atualizarValorParcela(valorPlano) {
        const parcelas = parseInt(parcelasSelect.value);
        if (parcelas > 0) {
            const valor = valorPlano / parcelas;
            valorParcela.textContent = `Valor por parcela: R$ ${valor.toFixed(2)}`;
        } else {
            valorParcela.textContent = '';
        }
    }

    // Concluir cadastro
    const btnConcluir = document.getElementById("btn_concluir");

    btnConcluir.addEventListener("click", async function () {
        const nome = document.getElementById("nome_cadastro").value;
        const sobrenome = document.getElementById("sobrenome_cadastro").value;
        const email = document.getElementById("email_cadastro").value;
        const cpf = document.getElementById("cpf_cadastro").value;
        const senha = document.getElementById("password_cadastro").value;
        const tipo = tipoCadastro.value;

        if (!tipo) {
            alert("Por favor, selecione o tipo de cadastro.");
            return;
        }

        const planoSelecionado = document.querySelector('input[name="plano"]:checked');
        if (!planoSelecionado) {
            alert("Por favor, selecione um plano.");
            return;
        }

        const planoId = parseInt(planoSelecionado.id.replace("plano_", ""));
        let formaPagamento = null;
        let dadosCartaoObj = null;

        if (cartaoCheckbox.checked) {
            formaPagamento = "CartaoCredito";
            const titular = document.getElementById("titular_cartao").value;
            const numero = document.getElementById("numero_cartao").value;
            const validade = document.getElementById("validade_cartao").value;
            const cvv = document.getElementById("cvv_cartao").value;
            const parcelas = parseInt(parcelasSelect.value);

            if (!titular || !numero || !validade || !cvv || !parcelas) {
                alert("Por favor, preencha todos os campos do cartão.");
                return;
            }

            dadosCartaoObj = { titular, numero, validade, cvv, parcelas };
        } else if (boletoCheckbox.checked) {
            formaPagamento = "Boleto";
        } else if (pixCheckbox.checked) {
            formaPagamento = "Pix";
        }

        if (!formaPagamento) {
            alert("Por favor, selecione uma forma de pagamento.");
            return;
        }

        const dados = {
            nome,
            sobrenome,
            email,
            cpf,
            senha,
            tipo,
            planoId,
            formaPagamento,
            cartao: dadosCartaoObj,
        };

        try {
            const response = await fetch("http://localhost:3000/api/salvar-usuario", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados),
            });

            if (response.ok) {
                alert("Cadastro concluído com sucesso!");
                window.location.href = "login.html";
            } else {
                const erro = await response.json();
                alert(erro.error || "Erro ao salvar os dados.");
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro na conexão com o servidor.");
        }
    });
});
