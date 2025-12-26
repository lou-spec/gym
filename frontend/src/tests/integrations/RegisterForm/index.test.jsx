import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import RegisterForm from "../../../components/RegisterForm";
import { MemoryRouter } from "react-router-dom";

vi.mock("react-toastify", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <RegisterForm />
        </MemoryRouter>
    );
};

describe("RegisterForm Integration Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the registration form correctly", () => {
        renderComponent();

        expect(screen.getAllByText("Criar Conta").length).toBeGreaterThan(0);
        expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Palavra-passe/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirmar Palavra-passe/i)).toBeInTheDocument();
    });

    it("displays password requirements", () => {
        renderComponent();

        expect(screen.getByText(/Mín. 6 caracteres, maiúsculas, minúsculas, números e símbolos/i)).toBeInTheDocument();
    });

    it("has all required form fields", () => {
        renderComponent();

        const nameInput = screen.getByLabelText(/Nome Completo/i);
        const emailInput = screen.getByLabelText(/^Email/i);
        const passwordInput = screen.getByLabelText(/^Palavra-passe/i);
        const confirmPasswordInput = screen.getByLabelText(/Confirmar Palavra-passe/i);

        expect(nameInput).toBeRequired();
        expect(emailInput).toBeRequired();
        expect(passwordInput).toBeRequired();
        expect(confirmPasswordInput).toBeRequired();
    });
});
