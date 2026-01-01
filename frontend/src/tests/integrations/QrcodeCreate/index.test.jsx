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
            _id: "694deefea683fab73553f57d",
            name: "Test User",
        };

        render(<QrcodeCreate user={mockUser} />);

        const qrCode = screen.getByTestId("qr-code");
        expect(qrCode).toBeInTheDocument();
        expect(qrCode.textContent).toContain("QRLOGIN:694deefea683fab73553f57d");
    });

    it("handles empty user data", () => {
        render(<QrcodeCreate user={{ _id: "", name: "" }} />);

        expect(screen.getByTestId("qr-code")).toBeInTheDocument();
    });
});
