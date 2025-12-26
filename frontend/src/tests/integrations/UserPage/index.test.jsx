import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import UserPage from "../../../components/UserPage";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../hooks/useGetPerfil", () => ({
    useGetPerfil: () => ({
        isError: false,
        isLoading: false,
        user: {
            data: {
                _id: "user123",
                name: "Test User",
                email: "testuser@test.com",
                address: "Test Address",
                country: "Portugal"
            }
        },
        load: vi.fn(),
    }),
}));

vi.mock("../../../socket/socket", () => ({
    initSocket: vi.fn(),
    socketAddListener: vi.fn(),
    socketRemoveListener: vi.fn(),
}));

vi.mock("../../../utils/swalTheme", () => ({
    showSwalSuccess: vi.fn(),
}));

vi.mock("../../../components/UserPage/components/Perfil", () => ({
    Perfil: () => <div data-testid="perfil-mock">Perfil Component</div>,
}));

vi.mock("../../../components/UserPage/components/WorkoutView", () => ({
    default: () => <div data-testid="workout-view-mock">WorkoutView Component</div>,
}));

vi.mock("../../../components/Dashboard", () => ({
    default: () => <div data-testid="dashboard-mock">Dashboard Component</div>,
}));

vi.mock("../../../components/Chat", () => ({
    default: () => <div data-testid="chat-mock">Chat Component</div>,
}));

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <UserPage />
        </MemoryRouter>
    );
};

describe("UserPage Integration Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the user page correctly", () => {
        renderComponent();

        expect(screen.getByText(/Profile of User Test User/i)).toBeInTheDocument();
        expect(screen.getAllByText("O Meu Perfil").length).toBeGreaterThan(0);
        expect(screen.getByText("O Meu Treino")).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Mensagens")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("renders the navigation sidebar", () => {
        renderComponent();

        const navItems = screen.getAllByRole("listitem");
        expect(navItems.length).toBe(5);
    });

    it("displays the Perfil component by default", () => {
        renderComponent();

        expect(screen.getByTestId("perfil-mock")).toBeInTheDocument();
    });
});
