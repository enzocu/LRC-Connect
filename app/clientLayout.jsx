"use client";

import { useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { ColorProvider } from "@/contexts/ColorContext";
import { colorController } from "@/controller/custom/colorController";
import { AlertProvider } from "@/contexts/AlertContext";
import AlertDisplay from "@/components/ui/alert-display";
import { UserContextAuthProvider } from "@/contexts/UserContextAuth";
import { LoadingProvider } from "@/contexts/LoadingProvider";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

function ColorInitializer() {
	useEffect(() => {
		const initColors = async () => {
			try {
				await colorController.initialize();
			} catch (error) {
				console.error("Failed to initialize colors:", error);
			}
		};

		initColors();
	}, []);

	return null;
}

export default function ClientLayout({ children }) {
	const pathname = usePathname();
	const noWrapperRoutes = [
		"/audit",
		"/essential-report/material-statistics",
		"/essential-report/dr-statistics",
		"/essential-report/computer-statistics",
		"/essential-report/users-statistics",
		"/essential-report/entry-exit-statistics",
	];

	const shouldWrap = !noWrapperRoutes.includes(pathname);

	return (
		<html lang="en">
			<body className={inter.className}>
				<ColorProvider>
					<ColorInitializer />
					<AlertProvider>
						<UserContextAuthProvider>
							<LoadingProvider>
								{shouldWrap ? (
									<div className="max-w-screen-2xl mx-auto">{children}</div>
								) : (
									<>{children}</>
								)}
								<AlertDisplay />
							</LoadingProvider>
						</UserContextAuthProvider>
					</AlertProvider>
				</ColorProvider>
			</body>
		</html>
	);
}
