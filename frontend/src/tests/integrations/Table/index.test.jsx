import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Table from "../../../components/Table";

describe("Table Component Tests", () => {
    const mockColumns = ["Name", "Email", "Actions"];
    const mockData = [
        { name: "João Silva", email: "joao@test.com" },
        { name: "Maria Santos", email: "maria@test.com" },
    ];

    const mockOnPageChange = vi.fn();
    const mockOnSort = vi.fn();

    it("renders table with data correctly", () => {
        render(
            <Table
                columns={mockColumns}
                rows={{ data: mockData, pagination: {} }}
            />
        );

        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByText("João Silva")).toBeInTheDocument();
        expect(screen.getByText("maria@test.com")).toBeInTheDocument();
    });

    it("displays empty state when no data", () => {
        render(
            <Table
                columns={mockColumns}
                rows={{ data: [], pagination: {} }}
            />
        );

        expect(screen.getByText("Sem dados disponíveis")).toBeInTheDocument();
    });

    it("renders pagination controls when pagination data provided", () => {
        const paginationData = {
            page: 0,
            pageSize: 10,
            total: 25,
            hasMore: true,
        };

        render(
            <Table
                columns={mockColumns}
                rows={{ data: mockData, pagination: paginationData }}
                onPageChange={mockOnPageChange}
            />
        );

        expect(screen.getByText(/Página 1 de 3/i)).toBeInTheDocument();
        expect(screen.getByText("Anterior")).toBeInTheDocument();
        expect(screen.getByText("Próxima")).toBeInTheDocument();
    });

    it("handles sorting when column header is clicked", () => {
        render(
            <Table
                columns={mockColumns}
                rows={{ data: mockData, pagination: {} }}
                onSort={mockOnSort}
            />
        );

        fireEvent.click(screen.getByText("Name"));
        expect(mockOnSort).toHaveBeenCalledWith("Name");
    });
});
