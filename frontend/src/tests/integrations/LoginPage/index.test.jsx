import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import LoginPage from "../../../components/LoginPage";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../components/LoginForm", () => ({
    default: ({ role }) => <div data-testid="login-form-mock">Login Form - Role: {role}</div>,
}));

vi.mock("../../../components/QrcodeRead", () => ({
    default: () => <div data-testid="qr-reader-mock">QR Code Reader</div>,
}));

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <LoginPage />
        </MemoryRouter>
    );
};

describe("LoginPage Integration Tests", () => {
    it("renders the login page correctly", () => {
        renderComponent();

        expect(screen.getByTestId("login-form-mock")).toBeInTheDocument();
        expect(screen.getByText(/Login with QR Code/i)).toBeInTheDocument();
    });

    it("toggles QR code reader", () => {
        renderComponent();

        expect(screen.queryByTestId("qr-reader-mock")).not.toBeInTheDocument();

        const qrButton = screen.getByText(/Login with QR Code/i);
        fireEvent.click(qrButton);

        expect(screen.getByTestId("qr-reader-mock")).toBeInTheDocument();
    });

    it("displays password recovery link", () => {
        renderComponent();

        const forgotLink = screen.getByRole("link", { name: /Esqueci a password/i });
        expect(forgotLink).toBeInTheDocument();
        expect(forgotLink).toHaveAttribute("href", "/forgotpassword");
    });

    it("displays register link", () => {
        renderComponent();

        const registerLink = screen.getByRole("link", { name: /Não tens conta/i });
        expect(registerLink).toBeInTheDocument();
        expect(registerLink).toHaveAttribute("href", "/register");
    });
});
