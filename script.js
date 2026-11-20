const form = document.getElementById("employeeForm");
const nome = document.getElementById("nome");
const endereco = document.getElementById("endereco");
const email = document.getElementById("email");
const telefone = document.getElementById("telefone");
const cargo = document.getElementById("cargo");
const salario = document.getElementById("salario");
const turnos = [...document.querySelectorAll('input[name="turno"]')];
const mensagem = document.getElementById("mensagem");

if (form && nome && endereco && email && telefone && cargo && salario && mensagem) {
    nome.setAttribute("autocomplete", "name");
    email.setAttribute("autocomplete", "email");
    telefone.setAttribute("autocomplete", "tel");
    telefone.setAttribute("inputmode", "numeric");
    salario.setAttribute("inputmode", "numeric");
    turnos.forEach((turno) => turno.setAttribute("required", ""));

    function mostrarMensagem(texto, tipo = "") {
        mensagem.textContent = texto;
        mensagem.className = tipo ? `mensagem ${tipo}` : "mensagem";
    }

    nome.addEventListener("input", () => {
        nome.value = nome.value.replace(/[^A-Za-zÀ-ÿ' -]/g, "");
    });

    telefone.addEventListener("input", () => {
        const digitos = telefone.value.replace(/\D/g, "").slice(0, 11);

        if (digitos.length <= 2) {
            telefone.value = digitos ? `(${digitos}` : "";
        } else if (digitos.length <= 6) {
            telefone.value = `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
        } else if (digitos.length <= 10) {
            telefone.value = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
        } else {
            telefone.value = `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
        }
    });

    salario.addEventListener("input", () => {
        const centavos = salario.value.replace(/\D/g, "");
        const valor = Number(centavos || 0) / 100;

        salario.value = valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    });

    form.addEventListener("reset", () => {
        window.setTimeout(() => {
            telefone.setAttribute("placeholder", "(00) 00000-0000");
            salario.setAttribute("placeholder", "R$ 0,00");
            mostrarMensagem();
        });
    });

    form.addEventListener("submit", (evento) => {
        evento.preventDefault();

        nome.value = nome.value.trim().replace(/\s+/g, " ");
        endereco.value = endereco.value.trim();

        if (nome.value.length < 3) {
            nome.setCustomValidity("Informe o nome completo.");
            nome.reportValidity();
            nome.setCustomValidity("");
            return;
        }

        const telefoneNumeros = telefone.value.replace(/\D/g, "");
        if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
            telefone.setCustomValidity("Informe um telefone válido com DDD.");
            telefone.reportValidity();
            telefone.setCustomValidity("");
            return;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const turnoSelecionado = turnos.find((turno) => turno.checked);

        if (!turnoSelecionado) {
            mostrarMensagem("Selecione um turno de trabalho.", "erro");
            return;
        }

        mostrarMensagem(
            `Cadastro realizado: ${nome.value} - ${cargo.value} - ${turnoSelecionado.value}.`,
            "sucesso"
        );
    });
}
