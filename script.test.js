/**
 * @jest-environment jsdom
 *
 * Testes unitários do formulário de cadastro de funcionário (script.js)
 * Casos de teste: CT-1 a CT-8 do Plano de Teste.
 *
 * Como rodar:
 *   npm install --save-dev jest jest-environment-jsdom
 *   npx jest script.test.js
 */

const HTML_FORMULARIO = `
<form id="employeeForm">
    <input type="text" id="nome" required>
    <input type="text" id="endereco" required>
    <input type="email" id="email" required>
    <input type="text" id="telefone" required>
    <select id="cargo" required>
        <option value="">Selecione</option>
        <option value="Analista">Analista</option>
        <option value="Gerente">Gerente</option>
    </select>
    <input type="text" id="salario" required>
    <input type="radio" name="turno" value="Manhã">
    <input type="radio" name="turno" value="Tarde">
    <input type="radio" name="turno" value="Noite">
    <button type="submit">Cadastrar</button>
    <button type="reset">Limpar</button>
</form>
<p id="mensagem"></p>
`;

let form, nome, endereco, email, telefone, cargo, salario, turnos, mensagem;

function digitar(campo, valor) {
    campo.value = valor;
    campo.dispatchEvent(new Event("input", { bubbles: true }));
}

function preencherFormularioValido() {
    digitar(nome, "João Silva");
    digitar(endereco, "Rua das Flores, 123");
    digitar(email, "joao@email.com");
    digitar(telefone, "11987654321");
    cargo.value = "Gerente";
    digitar(salario, "350000"); // R$ 3.500,00
    turnos[0].checked = true; // Manhã
}

function enviarFormulario() {
    const evento = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(evento);
    return evento;
}

beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = HTML_FORMULARIO;

    form = document.getElementById("employeeForm");
    nome = document.getElementById("nome");
    endereco = document.getElementById("endereco");
    email = document.getElementById("email");
    telefone = document.getElementById("telefone");
    cargo = document.getElementById("cargo");
    salario = document.getElementById("salario");
    turnos = [...document.querySelectorAll('input[name="turno"]')];
    mensagem = document.getElementById("mensagem");

    require("./script.js");
});

describe("Cadastro de funcionário", () => {
    test("CT-1: cadastro com todos os dados válidos exibe mensagem de sucesso", () => {
        preencherFormularioValido();

        const evento = enviarFormulario();

        expect(evento.defaultPrevented).toBe(true);
        expect(mensagem.textContent).toBe("Cadastro realizado: João Silva - Gerente - Manhã.");
        expect(mensagem.className).toBe("mensagem sucesso");
    });

    test("CT-2: nome com menos de 3 caracteres bloqueia o cadastro e solicita o nome completo", () => {
        preencherFormularioValido();
        digitar(nome, "Ana");

        let avisoExibido = "";
        const spy = jest.spyOn(nome, "reportValidity").mockImplementation(() => {
            avisoExibido = nome.validationMessage;
            return false;
        });

        enviarFormulario();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(avisoExibido).toBe("Informe o nome completo.");
        expect(mensagem.textContent).toBe("");
    });

    test("CT-3: telefone com apenas 8 dígitos bloqueia o cadastro e informa telefone válido com DDD", () => {
        preencherFormularioValido();
        digitar(telefone, "11987654");

        let avisoExibido = "";
        const spy = jest.spyOn(telefone, "reportValidity").mockImplementation(() => {
            avisoExibido = telefone.validationMessage;
            return false;
        });

        enviarFormulario();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(avisoExibido).toBe("Informe um telefone válido com DDD.");
        expect(mensagem.textContent).toBe("");
    });

    test("CT-4: e-mail em formato inválido (joaoemail.com) impede o envio pela validação do navegador", () => {
        preencherFormularioValido();
        digitar(email, "joaoemail.com");

        const spy = jest.spyOn(form, "reportValidity");

        enviarFormulario();

        expect(email.validity.typeMismatch).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(mensagem.textContent).toBe("");
    });

    test("CT-5: campo de endereço vazio impede o envio por ser obrigatório", () => {
        preencherFormularioValido();
        digitar(endereco, "");

        const spy = jest.spyOn(form, "reportValidity");

        enviarFormulario();

        expect(endereco.validity.valueMissing).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(mensagem.textContent).toBe("");
    });

    test("CT-6: cargo não selecionado impede o envio por ser obrigatório", () => {
        preencherFormularioValido();
        cargo.value = ""; // opção inicial

        const spy = jest.spyOn(form, "reportValidity");

        enviarFormulario();

        expect(cargo.validity.valueMissing).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(mensagem.textContent).toBe("");
    });

    test("CT-7: turno não selecionado impede o envio e solicita a seleção de um turno", () => {
        preencherFormularioValido();
        turnos.forEach((turno) => (turno.checked = false));

        const spy = jest.spyOn(form, "reportValidity");

        enviarFormulario();

        expect(turnos.every((turno) => turno.hasAttribute("required"))).toBe(true);
        expect(turnos[0].validity.valueMissing).toBe(true);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(mensagem.textContent).toBe("");
    });

    test("CT-8: salário igual a zero é aceito, pois o código atual não possui validação para isso", () => {
        preencherFormularioValido();
        digitar(salario, "0");

        expect(salario.value.replace(/\s/g, " ")).toBe("R$ 0,00");

        enviarFormulario();

        expect(mensagem.textContent).toBe("Cadastro realizado: João Silva - Gerente - Manhã.");
        expect(mensagem.className).toBe("mensagem sucesso");
    });
});