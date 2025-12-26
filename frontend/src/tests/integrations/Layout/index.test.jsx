import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Layout from "../../../components/Layout";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../components/Header", () => ({
    default: () => <div data-testid="header">Header</div>,
}));

vi.mock("../../../components/Footer", () => ({
    default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock("../../../components/ChatNotifications", () => ({
    default: () => null,
}));

vi.mock("../../../socket/socket", () => ({
    initSocket: vi.fn(),
}));

global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
    })
);

describe("Layout Component Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders header and footer", () => {
        render(
            <MemoryRouter>
                <Layout />
            </MemoryRouter>
        );

        expect(screen.getByTestId("header")).toBeInTheDocument();
        expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("renders main content area", () => {
        const { container } = render(
            <MemoryRouter>
                <Layout />
            </MemoryRouter>
        );

        const mainElement = container.querySelector("main");
        expect(mainElement).toBeInTheDocument();
    });
});
