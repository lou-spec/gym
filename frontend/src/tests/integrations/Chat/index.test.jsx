import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Chat from "../../../components/Chat";

vi.mock("socket.io-client", () => ({
    default: () => ({
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn(),
    }),
}));

vi.mock("../../../socket/socket", () => ({
    getSocket: () => ({
        emit: vi.fn(),
        on: vi.fn(),
        off: vi.fn(),
    }),
    socketAddListener: vi.fn(),
    socketRemoveListener: vi.fn(),
    initSocket: vi.fn(),
}));

global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
    })
);

const defaultProps = {
    currentUserId: "user123",
    currentUserName: "Test User",
    isTrainer: false,
};

describe("Chat Component Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the chat container", () => {
        render(<Chat {...defaultProps} />);
        expect(screen.getByText("Mensagens")).toBeInTheDocument();
    });

    it("displays conversation list header", () => {
        render(<Chat {...defaultProps} />);
        expect(screen.getByText("Conversas")).toBeInTheDocument();
    });

    it("shows clients header for trainers", () => {
        render(<Chat {...defaultProps} isTrainer={true} />);
        expect(screen.getByText("Clientes")).toBeInTheDocument();
    });
});
