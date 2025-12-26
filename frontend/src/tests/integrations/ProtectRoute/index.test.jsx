import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ProtectedRoute from "../../../components/ProtectRoute";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("../../../components/ProtectRoute/hooks/useAuth", () => ({
    useAuth: () => ({
        isValidLogin: true,
        isFetching: false,
        hasLogin: vi.fn(),
        user: ["user"],
    }),
}));

describe("ProtectedRoute Component Tests", () => {
    it("renders children when user is authenticated", () => {
        render(
            <MemoryRouter>
                <ProtectedRoute>
                    <div>Protected Content</div>
                </ProtectedRoute>
            </MemoryRouter>
        );

        expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
});
