"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FiArrowLeft, FiMessageCircle, FiExternalLink } from "react-icons/fi";
import ProtectedRoute from "@/contexts/ProtectedRoute";

export default function CongressDetailsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const co_url = searchParams.get("co_id");
	const co_title = searchParams.get("co_title");

	const [showAIDialog, setShowAIDialog] = useState(false);
	const [aiInput, setAiInput] = useState("");

	if (!co_url) {
		return (
			<div className="min-h-screen bg-background transition-colors duration-300">
				<Header />
				<main className="pt-24 pb-10">
					<div
						style={{
							paddingLeft: "150px",
							paddingRight: "150px",
							paddingTop: "20px",
						}}
					>
						<div className="text-center py-16">
							<h1 className="text-2xl font-semibold text-foreground mb-4">
								Resource Not Found
							</h1>
							<Button
								onClick={() => router.back()}
								className="bg-primary-custom text-white"
								style={{ fontSize: "11px" }}
							>
								Go Back
							</Button>
						</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background transition-colors duration-300">
			<Header />

			<main className="pt-24 pb-10">
				<div
					style={{
						paddingLeft: "150px",
						paddingRight: "150px",
						paddingTop: "20px",
					}}
				>
					{/* Back Navigation */}
					<div className="mb-6 animate-fade-in">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
							style={{ fontSize: "11px" }}
						>
							<FiArrowLeft className="w-4 h-4" />
							Back to Library of Congress
						</button>
					</div>

					{/* Page Title and AI Button */}
					<div className="mb-8 animate-slide-up">
						<div className="flex items-center justify-between">
							<div>
								<h1
									className="font-semibold text-foreground"
									style={{ fontSize: "20px" }}
								>
									Library of Congress Details
								</h1>
								<p
									className="text-muted-foreground "
									style={{ fontSize: "11px" }}
								>
									Access official Library of Congress resources and archives
								</p>
							</div>

							{/* AI Assistant Button */}
							<Button
								onClick={() => setShowAIDialog(true)}
								className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
								style={{ fontSize: "11px" }}
							>
								<FiMessageCircle className="w-4 h-4 mr-2" />
								AI Assistant
							</Button>
						</div>
					</div>

					{/* Resource Title and External Link */}
					<div className="mb-6 animate-slide-up-delay-1">
						<div className="flex items-center justify-between p-6 bg-card border border-border rounded-lg shadow-sm">
							<div>
								<h2
									className="font-semibold text-foreground mb-2"
									style={{ fontSize: "16px" }}
								>
									{co_title}
								</h2>
								<p
									className="text-muted-foreground"
									style={{ fontSize: "11px" }}
								>
									Click below to access this resource on the official Library of
									Congress website
								</p>
							</div>
							<Button
								onClick={() => window.open(co_url, "_blank")}
								className="bg-primary-custom text-white hover:opacity-90 transition-all duration-200"
								style={{ fontSize: "11px" }}
							>
								<FiExternalLink className="w-4 h-4 mr-2" />
								View on LOC Website
							</Button>
						</div>
					</div>

					{/* Embedded Content */}
					<div className="animate-slide-up-delay-2">
						<div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
							<div className="p-4 bg-muted/30 border-b border-border">
								<h3
									className="font-medium text-foreground"
									style={{ fontSize: "14px" }}
								>
									Library of Congress Resource
								</h3>
								<p
									className="text-muted-foreground mt-1"
									style={{ fontSize: "10px" }}
								>
									Content provided by the Library of Congress
								</p>
							</div>
							<div className="relative">
								<iframe
									src={co_url}
									className="w-full h-[700px] border-none"
									title={co_title}
									loading="lazy"
								/>
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* AI Assistant Dialog */}
			<Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
				<DialogContent className="sm:max-w-md bg-card border-border">
					<DialogHeader>
						<DialogTitle
							className="text-foreground"
							style={{ fontSize: "14px" }}
						>
							AI Assistant - Library of Congress
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<label
								className="text-sm font-medium text-foreground"
								style={{ fontSize: "11px" }}
							>
								Ask about this Library of Congress resource:
							</label>
							<textarea
								value={aiInput}
								onChange={(e) => setAiInput(e.target.value)}
								placeholder="Ask about the content, historical context, related resources, or research guidance..."
								className="w-full h-24 px-3 py-2 border border-border bg-background text-foreground rounded-md resize-none focus:ring-2 focus:ring-primary-custom focus:border-transparent"
								style={{ fontSize: "11px" }}
							/>
						</div>
						<div className="flex justify-end space-x-2">
							<Button
								variant="outline"
								onClick={() => setShowAIDialog(false)}
								className="border-border text-foreground hover:bg-accent"
								style={{ fontSize: "11px" }}
							>
								Cancel
							</Button>
							<Button
								onClick={() => {
									// Handle AI query here
									console.log("AI Query:", aiInput);
									setShowAIDialog(false);
									setAiInput("");
								}}
								className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
								style={{ fontSize: "11px" }}
							>
								Ask AI
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
