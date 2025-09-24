"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { colorController } from "@/controller/custom/colorController";

const ColorContext = createContext({
	currentPalette: {
		id: "default-blue",
		name: "Default Blue",
		primary: "#3b82f6",
		secondary: "#1e40af",
		accent: "#60a5fa",
		background: "#f8fafc",
	},
	isDarkMode: false,
	setPalette: () => {},
	toggleDarkMode: () => {},
	availablePalettes: [],
	isLoading: true,
});

export function ColorProvider({ children }) {
	const [currentPalette, setCurrentPalette] = useState(
		colorController.getCurrentPalette()
	);
	const [isDarkMode, setIsDarkMode] = useState(colorController.isDark());
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let didCancel = false;

		const initializeColorController = async () => {
			try {
				await colorController.initialize();

				if (!didCancel) {
					setCurrentPalette(colorController.getCurrentPalette());
					setIsDarkMode(colorController.isDark());
					setIsLoading(false);
				}
			} catch (e) {
				console.error("Failed to initialize color controller:", e);
				if (!didCancel) {
					setError(e);
					setIsLoading(false);
				}
			}
		};

		initializeColorController();

		const unsubscribePalette = colorController.subscribe((palette) => {
			if (!didCancel) {
				setCurrentPalette(palette);
			}
		});

		const unsubscribeDarkMode = colorController.subscribeDarkMode((isDark) => {
			if (!didCancel) {
				setIsDarkMode(isDark);
			}
		});

		return () => {
			didCancel = true;
			unsubscribePalette();
			unsubscribeDarkMode();
		};
	}, []);

	const setPalette = (paletteId) => {
		try {
			colorController.setPalette(paletteId);
		} catch (e) {
			console.error("Failed to set palette:", e);
			setError(e);
		}
	};

	const toggleDarkMode = () => {
		try {
			colorController.toggleDarkMode();
		} catch (e) {
			console.error("Failed to toggle dark mode:", e);
			setError(e);
		}
	};

	if (error) {
		return (
			<div style={{ color: "red", padding: "10px", border: "1px solid red" }}>
				Error: {error.message || "Failed to load color settings."}
			</div>
		);
	}

	return (
		<ColorContext.Provider
			value={{
				currentPalette,
				isDarkMode,
				setPalette,
				toggleDarkMode,
				availablePalettes: [currentPalette],
				isLoading,
			}}
		>
			{children}
		</ColorContext.Provider>
	);
}

export function useColor() {
	const context = useContext(ColorContext);
	if (context === undefined) {
		throw new Error("useColor must be used within a ColorProvider");
	}
	return context;
}
