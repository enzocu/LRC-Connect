"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiSend, FiCopy, FiVolume2, FiRefreshCw } from "react-icons/fi";
import { Lightbulb } from "lucide-react";
import callGemini from "../../controller/api/geminiAPI";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
	copyMessageToClipboard,
	toggleTextToSpeech,
} from "../../controller/custom/customFunction";

export function AIResourcesModal({ open, close, resourceDetails }) {
	const [inputValue, setInputValue] = useState("");
	const [messages, setMessages] = useState([]);
	const [isAiThinking, setIsAiThinking] = useState(false);
	const messagesEndRef = useRef(null);

	const quickActions = [
		{
			title: "Summarize Text",
			sub: "Provide a short summary of the current material or chapter.",
		},
		{
			title: "Explain a Word or Phrase",
			sub: "Define or explain the meaning of a specific word or sentence.",
		},
		{
			title: "Answer a Question",
			sub: "Respond to a question based on the reading content.",
		},
		{
			title: "Highlight Key Points",
			sub: "Show the main ideas or important concepts from the text.",
		},
		{
			title: "Show Related Picture",
			sub: "Display the image related to the current reading material.",
		},
		{
			title: "Author Information",
			sub: "Tell me who wrote this material.",
		},
		{
			title: "Quote from the Text",
			sub: "Show an important or meaningful quote from this material.",
		},
		{
			title: "Reading Summary with Picture",
			sub: "Summarize the content and include related images if available.",
		},
		{
			title: "Check Material Source",
			sub: "Display details about where this content came from.",
		},
	];

	const regenerateResponse = async (messageIndex) => {
		if (messageIndex <= 0) return;
		const newMessages = messages.filter((_, index) => index !== messageIndex);
		setMessages(newMessages);
		setIsAiThinking(true);

		const context = JSON.stringify(resourceDetails);
		await callGemini(
			newMessages,
			setMessages,
			context,
			setIsAiThinking,
			"resources"
		);
	};

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
		}
	}, [messages]);

	useEffect(() => {
		if (open) {
			setMessages([
				{
					role: "model",
					parts: [{ text: "Hello! How can I help you with this resource?" }],
				},
			]);
			setInputValue("");
		}
	}, [open]);

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!inputValue.trim() || isAiThinking) return;

		const userMessage = {
			role: "user",
			parts: [{ text: inputValue }],
		};

		const newMessages = [...messages, userMessage];
		setMessages(newMessages);

		setInputValue("");

		const context = JSON.stringify(resourceDetails);
		await callGemini(
			newMessages,
			setMessages,
			context,
			setIsAiThinking,
			"resources"
		);
	};

	const handleQuickActionClick = (question) => {
		setInputValue(question);
	};

	if (!open) return null;

	return (
		<Modal
			isOpen={open}
			onClose={close}
			title="AI Resource Assistant"
			size="lg"
		>
			<div className="border-t border-border pt-4 space-y-4 overflow-hidden scrollbar-none">
				<div
					className="flex-1 overflow-y-auto space-y-6  "
					style={{ minHeight: "350px", maxHeight: "500px" }}
					ref={messagesEndRef}
				>
					{messages.map((message, index) => {
						if (message.role === "user") {
							return (
								<div key={index} className="flex flex-col items-end p-6">
									<div className="text-[14px] text-muted-foreground mb-1 mr-1">
										You
									</div>
									<div className="max-w-[80%] bg-muted/70 rounded-2xl rounded-tr-sm px-4 py-2.5">
										<div className="whitespace-pre-line text-[13px]">
											{message.parts[0].text}
										</div>
									</div>
								</div>
							);
						}

						return (
							<div key={index} className="flex justify-start p-6">
								<div className="max-w-[80%] bg-primary-custom/10 rounded-2xl rounded-tl-sm ">
									<div className="flex items-center gap-2 mb-2">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 rounded-full  overflow-hidden flex items-center justify-center">
												<img
													src="/AI.png"
													alt="Butch AI"
													className="w-full h-full object-cover"
												/>
											</div>
											<div className="font-medium text-[14px]">Butch AI</div>
										</div>
									</div>

									<div className="text-[13px] ml-8">
										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
											components={{
												p: ({ node, ...props }) => (
													<p className="mb-2 text-[13px]" {...props} />
												),
												ul: ({ node, ...props }) => (
													<ul
														className="list-disc list-inside ml-4 mb-2 text-[13px]"
														{...props}
													/>
												),
												ol: ({ node, ...props }) => (
													<ol
														className="list-decimal list-inside ml-4 mb-2 text-[13px]"
														{...props}
													/>
												),
												table: ({ node, ...props }) => (
													<div className="overflow-x-auto my-4  text-[13px]">
														<table
															className="border border-gray-300 text-sm text-left w-full "
															{...props}
														/>
													</div>
												),
												th: ({ node, ...props }) => (
													<th
														className="border border-gray-300 bg-green-100 px-2 py-1 text-[13px] min-w-[120px]"
														{...props}
													/>
												),
												td: ({ node, ...props }) => (
													<td
														className="border border-gray-300 px-2 py-1 text-[13px]"
														{...props}
													/>
												),
												img: ({ node, ...props }) => (
													<img
														className="max-w-full h-auto my-2 rounded"
														style={{ maxHeight: "200px" }}
														{...props}
													/>
												),
												a: ({ node, ...props }) => (
													<a className="text-blue-600 underline" {...props} />
												),
												hr: ({ node, ...props }) => (
													<hr className="my-4 border-gray-300" {...props} />
												),
											}}
										>
											{message.parts[0].text}
										</ReactMarkdown>
									</div>

									<div className="flex items-center gap-3 mt-2   ml-8">
										<button
											className={`text-[12px] flex items-center gap-1 text-muted-foreground hover:text-foreground ${
												message.isSpeaking ? "text-primary-custom" : ""
											}`}
											onClick={() =>
												toggleTextToSpeech(index, messages, setMessages)
											}
										>
											<FiVolume2 className="w-3 h-3" />
											{message.isSpeaking ? "Stop" : "Listen"}
										</button>
										<button
											className="text-[12px] flex items-center gap-1 text-muted-foreground hover:text-foreground"
											onClick={() =>
												copyMessageToClipboard(message.parts[0].text)
											}
										>
											<FiCopy className="w-3 h-3" />
											Copy
										</button>
										<button
											className="text-[12px] flex items-center gap-1 text-muted-foreground hover:text-foreground"
											onClick={() => regenerateResponse(index)}
										>
											<FiRefreshCw className="w-3 h-3" />
											Regenerate
										</button>
									</div>
								</div>
							</div>
						);
					})}

					{isAiThinking && (
						<div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground p-6">
							<div className="flex items-center">
								<div className="w-6 h-6 rounded-full bg-primary-custom/20 flex items-center justify-center mr-2">
									<div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
										<img
											src="/AI.png"
											alt="Butch AI"
											className="w-full h-full object-cover"
										/>
									</div>
								</div>
								<span className="text-[13px]">Butch AI is thinking</span>
							</div>
							<div className="flex text-2xl leading-none">
								<span className="animate-bounce">.</span>
								<span className="animate-bounce delay-200">.</span>
								<span className="animate-bounce delay-400">.</span>
							</div>
						</div>
					)}
				</div>

				<div className="px-6 pb-6">
					<form
						onSubmit={handleSendMessage}
						className="relative flex items-center "
					>
						<Input
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							placeholder="Ask AI about this resource..."
							className="h-10 pr-12 "
							style={{ fontSize: "12px" }}
							disabled={isAiThinking}
						/>
						<Button
							type="submit"
							variant="ghost"
							size="icon"
							className="absolute right-2 h-8 w-8 text-muted-foreground hover:text-foreground"
							disabled={isAiThinking || !inputValue.trim()}
							aria-label="Send message"
						>
							<FiSend className="w-4 h-4" />
						</Button>
					</form>
				</div>
			</div>

			{quickActions.length > 0 && (
				<div className="border-t border-border pt-4 p-6">
					<div className="flex items-center gap-2 mb-2">
						<Lightbulb className="w-4 h-4 text-muted-foreground" />
						<span className="text-xs font-medium text-muted-foreground">
							Quick Actions
						</span>
					</div>
					<div className="flex flex-wrap gap-2">
						{quickActions.map((action, index) => (
							<button
								key={index}
								onClick={() => handleQuickActionClick(action.title)}
								className="px-2 py-1 text-xs bg-muted hover:bg-accent text-muted-foreground hover:text-foreground rounded-md border border-border transition-colors"
								title={action.sub}
							>
								{action.title}
							</button>
						))}
					</div>
				</div>
			)}
		</Modal>
	);
}

export default AIResourcesModal;
