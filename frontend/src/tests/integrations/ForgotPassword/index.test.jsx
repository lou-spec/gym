import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ForgotPassword from "../../../components/ForgotPassword";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../hooks/useRedirectIfAuthenticated", () => ({
    useRedirectIfAuthenticated: () => ({ isFetching: false }),
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <ForgotPassword />
        </MemoryRouter>
    );
};

describe("ForgotPassword Integration Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the forgot password form correctly", () => {
        renderComponent();

        expect(screen.getByText("Recuperar Password")).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Introduz o teu email/i)).toBeInTheDocument();
        expect(screen.getByText(/Enviar Email de Recuperação/i)).toBeInTheDocument();
    });

    it("displays the back to login link", () => {
        renderComponent();

        const backLink = screen.getByRole("link", { name: /Voltar ao Login/i });
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute("href", "/login");
    });
});
