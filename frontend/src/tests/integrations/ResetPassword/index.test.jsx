import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ResetPassword from "../../../components/ResetPassword";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mockNavigate = vi.fn();

vi.mock("react- router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const renderComponent = (token = "test-token-123") => {
    return render(
        <MemoryRouter initialEntries={[`/reset-password/${token}`]}>
            <Routes>
                <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Routes>
        </MemoryRouter>
    );
};

describe("ResetPassword Integration Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the reset password form correctly", () => {
        renderComponent();

        expect(screen.getAllByText("Redefinir Password").length).toBeGreaterThan(0);
        expect(screen.getByLabelText(/Nova Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirmar Password/i)).toBeInTheDocument();
    });

    it("displays the back to  login link", () => {
        renderComponent();

        const backLink = screen.getByRole("link", { name: /Voltar ao Login/i });
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute("href", "/login");
    });
});
