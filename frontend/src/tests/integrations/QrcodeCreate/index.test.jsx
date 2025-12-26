import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import QrcodeCreate from "../../../components/QrcodeCreate";

vi.mock("react-qr-code", () => ({
    default: ({ value }) => <div data-testid="qr-code">QR Code: {value}</div>,
}));

describe("QrcodeCreate Component Tests", () => {
    it("renders QR code with user data", () => {
        const mockUser = {
            name: "Test User",
            password: "testpass123",
        };

        render(<QrcodeCreate user={mockUser} />);

        const qrCode = screen.getByTestId("qr-code");
        expect(qrCode).toBeInTheDocument();
        expect(qrCode.textContent).toContain("Test%20User");
    });

    it("handles empty user data", () => {
        render(<QrcodeCreate user={{ name: "", password: "" }} />);

        expect(screen.getByTestId("qr-code")).toBeInTheDocument();
    });
});
