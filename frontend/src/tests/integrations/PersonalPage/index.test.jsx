import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import PersonalPage from "../../../components/PersonalPage";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../hooks/useGetPerfil", () => ({
    useGetPerfil: () => ({
        isError: false,
        isLoading: false,
        user: {
            data: {
                _id: "trainer123",
                name: "Test Trainer",
                email: "trainer@test.com",
                address: "Trainer Address",
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

vi.mock("../../../components/PersonalPage/components/Perfil", () => ({
    Perfil: () => <div data-testid="perfil-trainer-mock">Perfil Trainer</div>,
}));

vi.mock("../../../components/PersonalPage/components/Clients", () => ({
    Clients: () => <div data-testid="clients-mock">Clients Component</div>,
}));

vi.mock("../../../components/PersonalPage/components/WorkoutPlanner", () => ({
    default: () => <div data-testid="workout-planner-mock">WorkoutPlanner Component</div>,
}));

vi.mock("../../../components/Dashboard", () => ({
    default: () => <div data-testid="dashboard-trainer-mock">Dashboard Trainer</div>,
}));

vi.mock("../../../components/Chat", () => ({
    default: () => <div data-testid="chat-trainer-mock">Chat Trainer</div>,
}));

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <PersonalPage />
        </MemoryRouter>
    );
};

describe("PersonalPage Integration Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the trainer page correctly", () => {
        renderComponent();

        expect(screen.getByText(/Profile of Trainer Test Trainer/i)).toBeInTheDocument();
        expect(screen.getByText("Área do Treinador")).toBeInTheDocument();
        expect(screen.getByText("Perfil")).toBeInTheDocument();
        expect(screen.getByText("Clientes")).toBeInTheDocument();
        expect(screen.getByText("Planos de Treino")).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Mensagens")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("renders the navigation sidebar with trainer-specific items", () => {
        renderComponent();

        const navItems = screen.getAllByRole("listitem");
        expect(navItems.length).toBe(6);
    });

    it("displays the Perfil component by default", () => {
        renderComponent();

        expect(screen.getByTestId("perfil-trainer-mock")).toBeInTheDocument();
    });
});
