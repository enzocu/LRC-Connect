"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb } from "lucide-react";
import {
	FiCopy,
	FiVolume2,
	FiRefreshCw,
	FiMic,
	FiMicOff,
	FiSend,
} from "react-icons/fi";
import { Maximize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";

import callGemini from "../../controller/api/geminiAPI";
import extractTextFromPdfUrl from "../../controller/custom/extractTextFromPdfUrl";
import { getDefault } from "../../controller/firebase/get/ai-report/default";
import {
	copyMessageToClipboard,
	toggleTextToSpeech,
	toggleSpeechRecognition,
} from "../../controller/custom/customFunction";

const AssistantPage = ({ transactionData, handleFocusAI }) => {
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const [inputValue, setInputValue] = useState("");
	const [messages, setMessages] = useState([
		{
			role: "model",
			parts: [
				{
					text: "Hi! I'm your study assistant. Ask me anything about this audiobook — summaries, key points, definitions, or references.",
				},
			],
		},
	]);
	const [isAiThinking, setIsAiThinking] = useState(false);
	const [speechSupported, setSpeechSupported] = useState(false);
	const [isListening, setIsListening] = useState(false);

	const [isFetching, setIsFetch] = useState(null);
	const [quickAction, setQuickAction] = useState({});

	const recommendations = [
		"Give me a one-sentence summary",
		"Highlight important quotes",
		"Describe the setting in detail",
		"Explain the character's motivation",
		"Predict what might happen next",
		"Break down complex sentences",
		"List important events in order",
		"Explain symbolism in the story",
		"Give background on the author",
		"Compare this to similar works",
		"Describe the tone or mood",
		"List any conflicts so far",
		"Highlight moral or lesson",
		"Identify point of view (POV)",
		"Explain cultural or historical references",
	];

	const messagesEndRef = useRef(null);
	const recognitionRef = useRef(null);

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!inputValue.trim()) return;

		const userMessage = {
			role: "user",
			parts: [{ text: inputValue }],
		};

		const newMessages = [...messages, userMessage];
		setMessages(newMessages);
		setInputValue("");

		let usDetails = "";
		if (!quickAction.userDetails && userDetails) {
			usDetails = await getDefault(userDetails, false, setIsFetch, Alert);
			setQuickAction((prev) => ({ ...prev, userDetails: usDetails }));
		}

		await callGemini(
			newMessages,
			setMessages,
			`${quickAction.userdetails || ""}  ${quickAction.pdfText || ""}`,
			setIsAiThinking,
			"reading"
		);
	};

	const regenerateResponse = async (messageIndex) => {
		if (messageIndex <= 0) return;
		const newMessages = messages.filter((_, index) => index !== messageIndex);
		setMessages(newMessages);
		setIsAiThinking(true);
		await callGemini(
			newMessages,
			setMessages,
			`${quickAction.userdetails || ""}  ${quickAction.pdfText || ""}`,
			setIsAiThinking,
			"reading"
		);
	};

	const handleRecommendationClick = (recommendation) => {
		setInputValue(recommendation);
	};

	useEffect(() => {
		if (!transactionData || !transactionData?.tr_resource?.ma_softURL) return;

		extractTextFromPdfUrl(
			transactionData,
			transactionData.tr_resource.ma_softURL,
			setQuickAction,
			setIsFetch
		);
	}, [transactionData]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			if (SpeechRecognition) {
				setSpeechSupported(true);
				recognitionRef.current = new SpeechRecognition();

				recognitionRef.current.continuous = true;
				recognitionRef.current.interimResults = true;
				recognitionRef.current.lang = "en-US";

				recognitionRef.current.onresult = (event) => {
					let finalTranscript = "";
					let interimTranscript = "";

					for (let i = event.resultIndex; i < event.results.length; i++) {
						const transcript = event.results[i][0].transcript;
						if (event.results[i].isFinal) {
							finalTranscript += transcript;
						} else {
							interimTranscript += transcript;
						}
					}

					if (finalTranscript) {
						setInputValue((prev) => prev + finalTranscript);
					}
				};

				recognitionRef.current.onerror = (event) => {
					console.error("Speech recognition error:", event.error);
					setIsListening(false);
				};

				recognitionRef.current.onend = () => {
					setIsListening(false);
				};
			}
		}

		return () => {
			if (recognitionRef.current) {
				recognitionRef.current.stop();
			}
		};
	}, []);

	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<Card className="bg-card border-border overflow-hidden h-fit ">
			<CardHeader className="pb-3 border-b border-border">
				<div>
					<div className="flex items-start justify-between gap-6">
						<div>
							<h2 className="font-semibold text-foreground text-[16px] mb-[5px]">
								{transactionData?.tr_format === "Audio Copy"
									? "Audio Assistant"
									: "Reading Assistant"}
							</h2>
							<p className="text-muted-foreground text-[12px]">
								{transactionData?.tr_format === "Audio Copy"
									? "Ask questions about this audio. Get summaries, key ideas, or clarifications."
									: "Ask questions about this text. Get summaries, key ideas, or clarifications."}
							</p>
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={handleFocusAI}
							className="h-8 px-3 flex items-center gap-2 bg-transparent"
						>
							<Maximize2 className="w-4 h-4" />
						</Button>
					</div>

					{messages.length > 1 && (
						<button
							onClick={() => {
								setMessages([messages[0]]);
							}}
							className="text-xs text-primary hover:underline"
						>
							Clear Chat
						</button>
					)}
				</div>
			</CardHeader>
			<CardContent className="pt-4 flex-1 flex flex-col">
				<div className="flex flex-col flex-1">
					{/* Messages */}
					<div
						className="flex-1 overflow-y-auto space-y-6 pr-1 pb-6"
						style={{ minHeight: "350px", maxHeight: "500px" }}
						ref={messagesEndRef}
					>
						{messages.map((message, index) => {
							if (message.role === "user") {
								return (
									<div key={index} className="flex flex-col items-end">
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
								<div key={index} className="flex justify-start">
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

						{(isAiThinking || isFetching != null) && (
							<div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
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
									<span className="text-[13px]">
										{isFetching != null ? isFetching : "Butch AI is thinking"}
									</span>
								</div>
								<div className="flex text-2xl leading-none">
									<span className="animate-bounce">.</span>
									<span className="animate-bounce delay-200">.</span>
									<span className="animate-bounce delay-400">.</span>
								</div>
							</div>
						)}
					</div>
					{/* Input form */}
					<form
						onSubmit={handleSendMessage}
						className="relative flex items-center"
					>
						<Input
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							placeholder="Ask about this audio…"
							className="h-9  pr-20"
							style={{ fontSize: "12px" }}
						/>
						<div className="absolute right-2 flex items-center ">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className={`h-9 w-9 p-0 transition-colors duration-200 ${
									isListening
										? "bg-red-100 hover:bg-red-200 text-red-600"
										: "hover:bg-muted"
								}`}
								onClick={() =>
									toggleSpeechRecognition(
										speechSupported,
										isListening,
										setIsListening,
										recognitionRef
									)
								}
								disabled={!speechSupported}
								title={
									!speechSupported
										? "Speech recognition not supported"
										: isListening
										? "Stop listening"
										: "Start voice input"
								}
							>
								{isListening ? (
									<FiMicOff className="w-4 h-4" />
								) : (
									<FiMic className="w-4 h-4 text-muted-foreground" />
								)}
							</Button>
							<Button
								type="submit"
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-muted-foreground hover:text-foreground"
								disabled={isAiThinking || !inputValue.trim()}
								aria-label="Send message"
							>
								<FiSend className="w-4 h-4" />
							</Button>
						</div>
					</form>
					{isListening && (
						<div className="mt-3 pt-3 border-t border-border">
							<div className="flex items-center gap-2  text-muted-foreground text-[12px]">
								<div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
								Listening... Click the microphone again to stop
							</div>
						</div>
					)}
					{/* Tip */}
					<div className="mt-2 text-muted-foreground text-[12px]">
						Tip: Try "Summarize the last minute," "Define telemetry," or "List 3
						key points from this chapter."
					</div>
					{/* Recommendations */}
					<div className="mt-6">
						<div className="flex items-center gap-2 mb-2">
							<Lightbulb className="w-4 h-4 text-muted-foreground" />
							<span className="text-[12px] font-medium text-muted-foreground">
								Quick suggestions
							</span>
						</div>
						<div className="flex flex-wrap gap-2">
							{recommendations.map((rec, index) => (
								<button
									key={index}
									onClick={() => handleRecommendationClick(rec)}
									className="px-2 py-1 text-[12px] bg-muted hover:bg-accent text-muted-foreground hover:text-foreground rounded-md border border-border transition-colors"
								>
									{rec}
								</button>
							))}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default AssistantPage;
