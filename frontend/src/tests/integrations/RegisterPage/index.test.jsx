import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import RegisterPage from "../../../components/RegisterPage";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../components/RegisterForm", () => ({
    default: () => <div data-testid="register-form-mock">Register Form</div>,
}));

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <RegisterPage />
        </MemoryRouter>
    );
};

describe("RegisterPage Integration Tests", () => {
    it("renders the register page correctly", () => {
        renderComponent();

        expect(screen.getByTestId("register-form-mock")).toBeInTheDocument();
        expect(screen.getByText(/Já tens conta\? Faz login/i)).toBeInTheDocument();
    });

    it("displays the login link", () => {
        renderComponent();

        const loginLink = screen.getByRole("link", { name: /Já tens conta/i });
        expect(loginLink).toBeInTheDocument();
        expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("renders the animation ball element", () => {
        renderComponent();

        const ball = document.getElementById("ball");
        expect(ball).toBeInTheDocument();
    });
});
