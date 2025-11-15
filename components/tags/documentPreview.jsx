"use client";

import { Header } from "@/components/header";
import { FiArrowLeft } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiPrinter } from "react-icons/fi";

import { insertAudit } from "@/controller/firebase/insert/insertAudit";

export default function DocumentPreviewPage({
	title,
	activeFilters,
	renderTable,
	setViewMode,
	userDetails,
	Alert,
}) {
	let Personnel = `${userDetails?.us_fname} ${
		userDetails?.us_mname ? userDetails?.us_mname.charAt(0) + ". " : ""
	}${userDetails?.us_lname}`;

	const now = new Date();
	const formattedDate = now.toLocaleString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});

	const handlePrint = async () => {
		try {
			await insertAudit(
				userDetails?.us_liID,
				userDetails?.uid,
				"Print",
				`User '${Personnel}' generated a copy of a report on ${formattedDate}.`,
				Alert
			);

			window.print();
		} catch (error) {
			console.error("Print and audit error:", error);
			Alert.showDanger("Failed to log print action", "error");
		}
	};

	return (
		<div className="prev-container min-h-screen bg-background transition-colors duration-300">
			<Header />

			<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
				<div className="no-print mb-6 animate-fade-in">
					<button
						onClick={() => setViewMode("table")}
						className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-[11px]"
					>
						<FiArrowLeft className="w-4 h-4" />
						Back to Previous page
					</button>
				</div>

				<div className="flex items-start justify-between no-print mb-8 animate-slide-up gap-6">
					<div>
						<h1 className="font-semibold text-foreground text-[20px]">
							Document Preview
						</h1>
						<p className="text-muted-foreground text-[14px]">
							Ensure all data is correct before printing the official copy
						</p>
					</div>

					<Button
						onClick={() => handlePrint()}
						variant="outline"
						size="sm"
						className="h-9 bg-primary-custom hover:bg-secondary-custom text-white hover:text-white border-none text-[12px]"
					>
						<FiPrinter className="w-4 h-4 mr-1" />
						Print
					</Button>
				</div>

				<div className="relative min-h-[900px]   border border-border rounded-[7px]">
					<img
						src="/logo.png"
						alt="logo"
						className="absolute inset-0 m-auto w-[400px] opacity-5 z-0 pointer-events-none"
					/>

					<Card className="relative z-10 p-6 bg-transfarent border-none shadow-none  transition-colors duration-300 animate-slide-up animation-delay-400 ">
						<CardHeader className="p-0">
							<div className="flex flex-col items-center  text-center mb-[70px]">
								<img src="/logo.png" alt="logo" className="w-[90px] mb-2" />
								<div>
									<h1 className="text-primary-custom font-bold text-lg  text-[20px]">
										Dalubhasaang Politekniko ng Lungsod ng Baliwag
									</h1>
									<h3 className="text-[16px]">Baliwag Polytechnic College</h3>
									<h3
										className=" text-muted-foreground  text-[16px]"
										style={{ fontSize: "14px" }}
									>
										Tanggapan ng Aklatan ng Dalubhasaang
									</h3>
								</div>
							</div>

							<CardTitle className="text-foreground text-[18px]">
								{title}
							</CardTitle>

							{activeFilters.length > 0 && (
								<div className="flex items-center gap-4 flex-wrap">
									{activeFilters.map((filter) => (
										<span
											key={filter.key}
											className="bg-primary-custom/10 text-primary-custom rounded text-xs flex items-center gap-1"
										>
											{filter.label}: {filter.value}
										</span>
									))}
								</div>
							)}
						</CardHeader>

						<CardContent className="p-0 pt-[15px]">
							<div className="print-table overflow-x-auto">{renderTable()}</div>
							<div className="flex justify-between pt-[20px] text-muted-foreground text-[12px]">
								<div>Issue date: {formattedDate}</div>
								<div>Issued by: {Personnel}</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
