import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Footer from "../../../components/Footer";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../../contexts/ThemeProvider/ThemeProvider", () => ({
    useTheme: () => ({ isDarkMode: false }),
}));

const renderComponent = () => {
    return render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>
    );
};

describe("Footer Component Tests", () => {
    it("renders the footer correctly", () => {
        renderComponent();

        expect(screen.getByText("FitLife")).toBeInTheDocument();
        expect(screen.getByText(/Transforma o teu corpo/i)).toBeInTheDocument();
    });

    it("displays contact information", () => {
        renderComponent();

        expect(screen.getByText("Contactos")).toBeInTheDocument();
        expect(screen.getByText(/Felgueiras/i)).toBeInTheDocument();
        expect(screen.getByText("info@fitlife.pt")).toBeInTheDocument();
        expect(screen.getByText("+351 123 456 789")).toBeInTheDocument();
    });

    it("displays social media links", () => {
        renderComponent();

        expect(screen.getByText("Segue-nos")).toBeInTheDocument();
        const socialLinks = screen.getAllByRole("link");
        expect(socialLinks.length).toBeGreaterThan(0);
    });

    it("displays copyright information", () => {
        renderComponent();

        expect(screen.getByText(/© 2025 FitLife Gym/i)).toBeInTheDocument();
    });
});
