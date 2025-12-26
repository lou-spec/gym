import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import QrcodeRead from "../../../components/QrcodeRead";

vi.mock("@yudiel/react-qr-scanner", () => ({
    Scanner: ({ onScan }) => {
        return <div data-testid="qr-scanner">QR Scanner Component</div>;
    },
}));

describe("QrcodeRead Component Tests", () => {
    it("renders QR scanner component", () => {
        const mockSetDataLogin = vi.fn();

        render(<QrcodeRead setDataLogin={mockSetDataLogin} />);

        expect(screen.getByTestId("qr-scanner")).toBeInTheDocument();
    });
});
