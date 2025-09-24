"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { FiSettings, FiSave, FiRotateCcw } from "react-icons/fi";
import { colorPalettes } from "@/controller/custom/colorController";
import { useColor } from "@/contexts/ColorContext";

function Card({ className, children }) {
	return (
		<div
			className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
		>
			{children}
		</div>
	);
}

function CardHeader({ className, children }) {
	return (
		<div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
			{children}
		</div>
	);
}

function CardTitle({ className, children, style }) {
	return (
		<h3
			className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
			style={style}
		>
			{children}
		</h3>
	);
}

function CardContent({ className, children }) {
	return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

import { useAlertActions } from "@/contexts/AlertContext";

export default function SystemSettings() {
	const Alert = useAlertActions();
	const { currentPalette, setPalette } = useColor();
	const [selectedPalette, setSelectedPalette] = useState(currentPalette.id);
	const [systemActive, setSystemActive] = useState(true);
	const [deactivationReason, setDeactivationReason] = useState("");

	useEffect(() => {
		setSelectedPalette(currentPalette.id);
	}, [currentPalette]);

	const handlePaletteChange = (paletteId) => {
		setSelectedPalette(paletteId);
		setPalette(paletteId);
	};

	const handleSaveSettings = () => {
		console.log("Saving settings:", {
			colorPalette: selectedPalette,
			systemActive,
			deactivationReason: !systemActive ? deactivationReason : null,
		});
		Alert.showSuccess("Settings saved successfully!");
	};

	const handleResetSettings = () => {
		setSelectedPalette("default-blue");
		setPalette("default-blue");
		setSystemActive(true);
		setDeactivationReason("");
		setShowReasonInput(false);
	};

	const groupedPalettes = {
		blue: colorPalettes.filter((p) => p.name.toLowerCase().includes("blue")),
		red: colorPalettes.filter((p) => p.name.toLowerCase().includes("red")),
		pink: colorPalettes.filter(
			(p) =>
				p.name.toLowerCase().includes("pink") ||
				p.name.toLowerCase().includes("rose")
		),
		green: colorPalettes.filter(
			(p) =>
				p.name.toLowerCase().includes("green") ||
				p.name.toLowerCase().includes("emerald") ||
				p.name.toLowerCase().includes("teal")
		),
		purple: colorPalettes.filter((p) =>
			p.name.toLowerCase().includes("purple")
		),
		orange: colorPalettes.filter((p) =>
			p.name.toLowerCase().includes("orange")
		),
		yellow: colorPalettes.filter(
			(p) =>
				p.name.toLowerCase().includes("yellow") ||
				p.name.toLowerCase().includes("gold")
		),
		gray: colorPalettes.filter((p) => p.name.toLowerCase().includes("gray")),
	};

	return (
		<div className="flex h-screen bg-background transition-colors duration-300">
			<Sidebar />

			<div className="flex-1 flex flex-col overflow-hidden">
				<Header />

				<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
					<div className="mb-8 animate-fade-in">
						<h1 className="font-semibold text-foreground text-[20px]">
							Appearance Settings
						</h1>
						<p className="text-muted-foreground text-[14px]">
							Change the system colors and theme based on your personal
							preference.
						</p>
					</div>

					<div className="w-full animate-slide-up">
						<Card className="bg-card border-border transition-colors duration-300 animate-slide-up-delay-1">
							<CardHeader>
								<CardTitle
									className="flex items-center gap-2 text-foreground"
									style={{ fontSize: "14px" }}
								>
									<FiSettings className="w-5 h-5" />
									Color Palette Configuration
								</CardTitle>
								<p
									className="text-muted-foreground"
									style={{ fontSize: "11px" }}
								>
									Choose from different color themes for your system interface
								</p>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="p-4 border border-border rounded-lg bg-muted/30">
									<h3
										className="font-medium text-foreground mb-3"
										style={{ fontSize: "12px" }}
									>
										Current Selection: {currentPalette.name}
									</h3>
									<div className="flex gap-3">
										{currentPalette.preview.map((color, index) => (
											<div
												key={index}
												className="w-12 h-12 rounded-lg border border-border"
												style={{ backgroundColor: color }}
											/>
										))}
									</div>
								</div>

								{Object.entries(groupedPalettes).map(
									([colorFamily, palettes]) => (
										<div key={colorFamily} className="space-y-4">
											<h3
												className="font-medium text-foreground capitalize"
												style={{ fontSize: "12px" }}
											>
												{colorFamily} Themes
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
												{palettes.map((palette) => (
													<div
														key={palette.id}
														className={`p-3 border rounded-lg cursor-pointer transition-all ${
															selectedPalette === palette.id
																? "border-primary-custom bg-accent"
																: "border-border hover:border-muted-foreground hover:bg-muted/50"
														}`}
														onClick={() => handlePaletteChange(palette.id)}
													>
														<div className="flex items-center justify-between mb-3">
															<h4
																className="font-medium text-foreground"
																style={{ fontSize: "11px" }}
															>
																{palette.name}
															</h4>
															{selectedPalette === palette.id && (
																<div className="w-4 h-4 bg-primary-custom rounded-full flex items-center justify-center">
																	<div className="w-2 h-2 bg-white rounded-full" />
																</div>
															)}
														</div>
														<div className="flex gap-2">
															{palette.preview.map((color, index) => (
																<div
																	key={index}
																	className="w-6 h-6 rounded border border-border"
																	style={{ backgroundColor: color }}
																/>
															))}
														</div>
													</div>
												))}
											</div>
										</div>
									)
								)}

								<div className="border-t border-border pt-6">
									<h3
										className="font-medium text-foreground mb-3"
										style={{ fontSize: "12px" }}
									>
										Live Preview
									</h3>
									<div className="p-4 border border-border rounded-lg space-y-3 bg-muted/30">
										<div className="flex gap-3">
											<Button
												className="bg-primary-custom hover:bg-secondary-custom text-white h-9"
												style={{ fontSize: "11px" }}
											>
												Primary Button
											</Button>
											<Button
												variant="outline"
												className="border-primary-custom text-primary-custom hover:bg-accent h-9"
												style={{ fontSize: "11px" }}
											>
												Secondary Button
											</Button>
										</div>
										<div className="p-3 bg-accent border border-primary-custom/20 rounded">
											<p
												className="text-primary-custom font-medium"
												style={{ fontSize: "11px" }}
											>
												This is how your interface will look with the selected
												color palette.
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					<div className="flex gap-3 mt-8 animate-slide-up-delay-3">
						<Button
							onClick={handleSaveSettings}
							className="bg-primary-custom hover:bg-secondary-custom text-white h-9"
							style={{ fontSize: "11px" }}
							disabled={!systemActive && !deactivationReason.trim()}
						>
							<FiSave className="w-4 h-4 mr-2" />
							Save Settings
						</Button>
						<Button
							variant="outline"
							onClick={handleResetSettings}
							className="border-primary-custom text-primary-custom hover:bg-accent h-9"
							style={{ fontSize: "11px" }}
						>
							<FiRotateCcw className="w-4 h-4 mr-2" />
							Reset to Default
						</Button>
					</div>
				</main>
			</div>
		</div>
	);
}
