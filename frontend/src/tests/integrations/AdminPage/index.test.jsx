import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AdminPage from "../../../components/AdminPage";
import { TabContext } from "../../../components/AdminPage/contexts/TabProvider/TabContext"; // Adjust path if needed, assuming Context is used
import { UsersContext } from "../../../contexts/UsersProvider/UsersContext";
import { MemoryRouter } from "react-router-dom";

// Mock dependencies
vi.mock("../../../components/AdminPage/hooks/useGetData", () => ({ // Adjust path to where useGetData is relative to AdminPage or global
    useGetData: () => ({
        isError: false,
        isLoading: false,
        data: {
            users: [
                { _id: "1", name: "User One", email: "user1@test.com", address: "Rua 1", country: "Portugal", role: { scope: ["user"] } },
                { _id: "2", name: "Trainer One", email: "trainer1@test.com", address: "Rua 2", country: "Portugal", role: { scope: ["trainer"] }, trainer: true },
            ],
            pagination: { total: 2, pageSize: 5, hasMore: false }
        },
        load: vi.fn(),
    }),
}));

// Mock Swal
vi.mock("../../../utils/swalTheme", () => ({
    showSwalConfirm: vi.fn().mockResolvedValue({ isConfirmed: true }),
    showSwalSuccess: vi.fn(),
    showSwalError: vi.fn(),
    showSwalInput: vi.fn(),
}));

// Mock Socket.io
vi.mock("socket.io-client", () => ({
    default: () => ({
        on: vi.fn(),
        off: vi.fn(),
        disconnect: vi.fn(),
    }),
}));

// Mock DisassociationRequests component to prevent fetch errors
vi.mock("../../../components/AdminPage/components/DisassociationRequests", () => ({
    default: () => <div data-testid="disassociation-requests-mock">DisassociationRequests Mock</div>,
}));

// Mock Users Context
const mockSetUsers = vi.fn();
const mockCountUsers = 10;

const renderComponent = () => {
    return render(
        <UsersContext.Provider value={{ countUsers: mockCountUsers, setUsers: mockSetUsers, users: [] }}>
            <MemoryRouter>
                <AdminPage />
            </MemoryRouter>
        </UsersContext.Provider>
    );
};

describe("AdminPage Integration Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the dashboard correctly", () => {
        renderComponent();

        expect(screen.getByText("Admin")).toBeInTheDocument();
        expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Users")).toBeInTheDocument();
        expect(screen.getByText(mockCountUsers.toString())).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("renders the user table with data", async () => {
        renderComponent();

        expect(screen.getByText("User One")).toBeInTheDocument();
        expect(screen.getByText("user1@test.com")).toBeInTheDocument();
        expect(screen.getByText("Trainer One")).toBeInTheDocument();
    });

    it("handles promote user interaction", async () => {
        // Mock fetch for successful promotion
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            })
        );

        renderComponent();

        // Find promote button for User One (first user)
        // User One is index 0. The buttons are Promote (for User) and Demote (for Trainer).
        // identifying by title or icon might be safer.
        const promoteButtons = screen.getAllByTitle("Promote to Personal Trainer");
        fireEvent.click(promoteButtons[0]);

        // Expect Swal to be called
        // Since we mocked Swal to return isConfirmed: true, it should proceed to fetch
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/users/1"),
                expect.objectContaining({
                    method: "PUT",
                    body: expect.stringContaining("Trainer")
                })
            );
        });
    });

    it("handles demote trainer interaction", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            })
        );

        renderComponent();

        const demoteButtons = screen.getAllByTitle("Demote to regular user");
        fireEvent.click(demoteButtons[0]); // Trainer One is the second user, so it should be the first demote button found? No, User one has Promote, Trainer One has Demote.

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/users/2"),
                expect.objectContaining({
                    method: "PUT",
                    body: expect.stringContaining("User")
                })
            );
        });
    });

    it("handles delete user interaction", async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({}),
            })
        );

        renderComponent();

        const deleteButtons = screen.getAllByTitle("Delete user");
        fireEvent.click(deleteButtons[0]);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("/api/users/1"),
                expect.objectContaining({
                    method: "DELETE"
                })
            );
        });
    });
});
