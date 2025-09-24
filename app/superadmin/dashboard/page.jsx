import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { FiTrendingUp } from "react-icons/fi";
import ProtectedRoute from "@/contexts/ProtectedRoute";

export default function Dashboard() {
	return (
		<ProtectedRoute allowedRoles={["USR-1"]}>
			<div className="flex h-screen bg-background transition-colors duration-300">
				<Sidebar />

				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />

					<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
						<div className="mb-8 animate-fade-in">
							<h1 className="font-semibold text-foreground text-[20px]">
								Dashboard
							</h1>
							<p className="text-muted-foreground text-[14px]">
								Overview of library system statistics and key metrics
							</p>
						</div>

						<div className="w-full animate-slide-up-delay-3">
							<h2
								className="font-semibold text-foreground mb-4"
								style={{ fontSize: "16px" }}
							>
								Library Statistics
							</h2>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 w-full">
								<Card className="bg-card border border-border transition-colors duration-300">
									<CardContent className="p-4">
										<div className="flex items-center justify-between mb-2">
											<p
												className="text-muted-foreground"
												style={{ fontSize: "10px" }}
											>
												Active Library
											</p>
											<FiTrendingUp className="w-4 h-4 text-muted-foreground" />
										</div>
										<p
											className="font-bold text-primary-custom mb-2"
											style={{ fontSize: "22px" }}
										>
											10
										</p>
										<div className="flex items-center gap-1">
											<FiTrendingUp className="w-4 h-4 text-green-500" />
											<span
												className="text-green-500 font-medium"
												style={{ fontSize: "10px" }}
											>
												1.5%
											</span>
											<span
												className="text-muted-foreground"
												style={{ fontSize: "10px" }}
											>
												From last week
											</span>
										</div>
									</CardContent>
								</Card>

								<Card className="bg-card border border-border transition-colors duration-300">
									<CardContent className="p-4">
										<div className="flex items-center justify-between mb-2">
											<p
												className="text-muted-foreground"
												style={{ fontSize: "10px" }}
											>
												Inactive Library
											</p>
											<FiTrendingUp className="w-4 h-4 text-muted-foreground" />
										</div>
										<p
											className="font-bold text-primary-custom mb-2"
											style={{ fontSize: "22px" }}
										>
											2
										</p>
										<div className="flex items-center gap-1">
											<FiTrendingUp className="w-4 h-4 text-green-500" />
											<span
												className="text-green-500 font-medium"
												style={{ fontSize: "10px" }}
											>
												1.5%
											</span>
											<span
												className="text-muted-foreground"
												style={{ fontSize: "10px" }}
											>
												From last week
											</span>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>

						<div className="w-full animate-slide-up-delay-3">
							<h2
								className="font-semibold text-foreground mb-4"
								style={{ fontSize: "16px" }}
							>
								Account Statistics
							</h2>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 w-full">
								<Card className="bg-card border border-border transition-colors duration-300">
									<CardContent className="p-4">
										<div className="flex items-center justify-between mb-2">
											<p
												className="text-muted-foreground"
												style={{ fontSize: "10px" }}
											>
												Active Account
											</p>
											<FiTrendingUp className="w-4 h-4 text-muted-foreground" />
										</div>
										<p
											className="font-bold text-primary-custom mb-2"
											style={{ fontSize: "22px" }}
										>
											10
										</p>
										<div className="flex items-center gap-1">
											<FiTrendingUp className="w-4 h-4 text-green-500" />
											<span
												className="text-green-500 font-medium"
												style={{ fontSize: "10px" }}
											>
												1.5%
											</span>
											<span
												className="text-muted-foreground"
												style={{ fontSize: "10px" }}
											>
												From last week
											</span>
										</div>
									</CardContent>
								</Card>

								<Card className="bg-card border border-border transition-colors duration-300">
									<CardContent className="p-4">
										<div className="flex items-center justify-between mb-2">
											<p
												className="text-muted-foreground"
												style={{ fontSize: "10px" }}
											>
												Inactive Account
											</p>
											<FiTrendingUp className="w-4 h-4 text-muted-foreground" />
										</div>
										<p
											className="font-bold text-primary-custom mb-2"
											style={{ fontSize: "22px" }}
										>
											2
										</p>
										<div className="flex items-center gap-1">
											<FiTrendingUp className="w-4 h-4 text-green-500" />
											<span
												className="text-green-500 font-medium"
												style={{ fontSize: "10px" }}
											>
												1.5%
											</span>
											<span
												className="text-muted-foreground"
												style={{ fontSize: "10px" }}
											>
												From last week
											</span>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</main>
				</div>
			</div>
		</ProtectedRoute>
	);
}
