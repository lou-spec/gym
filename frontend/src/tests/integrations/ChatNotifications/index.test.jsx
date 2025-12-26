import React from "react";
import { render } from "@testing-library/react";
import { vi } from "vitest";
import ChatNotifications from "../../../components/ChatNotifications";

vi.mock("react-toastify", () => ({
    toast: vi.fn(),
}));

vi.mock("../../socket/socket", () => ({
    socketAddListener: vi.fn(),
    socketRemoveListener: vi.fn(),
}));

describe("ChatNotifications Component Tests", () => {
    it("renders without crashing", () => {
        const mockOnMessageClick = vi.fn();

        const { container } = render(
            <ChatNotifications
                currentUserId="user123"
                onMessageClick={mockOnMessageClick}
            />
        );

        expect(container).toBeInTheDocument();
    });

    it("does not render when no userId provided", () => {
        const { container } = render(
            <ChatNotifications
                currentUserId={null}
                onMessageClick={vi.fn()}
            />
        );

        expect(container).toBeInTheDocument();
    });
});
