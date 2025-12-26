import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../../../components/LandingPage";
import { ThemeProvider } from "../../../contexts/ThemeProvider/ThemeProvider";

describe("LandingPage", () => {

    it("renders correctly the component (Snapshot)", () => {
        const { container } = render(
            <ThemeProvider>
                <MemoryRouter>
                    <LandingPage />
                </MemoryRouter>
            </ThemeProvider>
        );
        expect(container).toMatchSnapshot();
    });

    it("renders main hero content", () => {
        render(
            <ThemeProvider>
                <MemoryRouter>
                    <LandingPage />
                </MemoryRouter>
            </ThemeProvider>
        );

      
        expect(screen.getByText((content, element) => {
            return element.tagName.toLowerCase() === 'span' && content.includes('FIT') && content.includes('LIFE');
        })).toBeInTheDocument();

        // Check for Hero Description
        expect(screen.getByText("TREINA. EVOLUI. DOMINA.")).toBeInTheDocument();

        // Check for CTA Button
        const linkElement = screen.getByRole('link', { name: /acessar/i });
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute('href', '/login');
    });

    it("renders features section", () => {
        render(
            <ThemeProvider>
                <MemoryRouter>
                    <LandingPage />
                </MemoryRouter>
            </ThemeProvider>
        );

        expect(screen.getByText("Porquê Nós?")).toBeInTheDocument();
        // Uses flexible matcher for broken text spanning multiple elements if needed, or just partial match
        expect(screen.getByText(/SUCESSO/i)).toBeInTheDocument();
    });
});

