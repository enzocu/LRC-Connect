"use client";

import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
	FiMic,
	FiMicOff,
	FiSend,
	FiUsers,
	FiBookOpen,
	FiTrendingUp,
	FiBarChart2,
	FiAlertCircle,
	FiClipboard,
	FiUserCheck,
	FiUserX,
	FiBook,
	FiMonitor,
	FiMessageSquare,
	FiTrash2,
	FiCopy,
	FiVolume2,
	FiRefreshCw,
	FiCode,
} from "react-icons/fi";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";

import {
	copyMessageToClipboard,
	toggleTextToSpeech,
	toggleSpeechRecognition,
} from "../../../controller/custom/customFunction";
import callGemini from "../../../controller/api/geminiAPI";

import { getDefault } from "@/controller/firebase/get/ai-report/default";
import { getMaterialList } from "@/controller/firebase/get/ai-report/material/getMaterialList";
import { getFeedbackList } from "@/controller/firebase/get/ai-report/feedback/getFeedbackList";
import { getTransactionSummary } from "@/controller/firebase/get/ai-report/transaction/getSummary";
import { getReservedUtilized } from "@/controller/firebase/get/ai-report/transaction/getReservedUtilized";
import { getResourceTop10 } from "@/controller/firebase/get/ai-report/transaction/getResourcesTop10";
import { getReportSummary } from "@/controller/firebase/get/ai-report/reports/getSummary";
import { getActiveReport } from "@/controller/firebase/get/ai-report/reports/getActiveReport";
import { getStatusCount } from "@/controller/firebase/get/ai-report/entry-exit/getStatus";
import { getUserTop10 } from "@/controller/firebase/get/ai-report/entry-exit/getUserTop10";

export default function HomePage() {
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();

	const [findBookMode, setFindBookMode] = useState(false);
	const [inChatMode, setInChatMode] = useState(false);

	const [inputValue, setInputValue] = useState("");
	const [messages, setMessages] = useState([]);
	const [isAiThinking, setIsAiThinking] = useState(false);
	const [isFetching, setIsFetch] = useState(null);
	const [isListening, setIsListening] = useState(false);
	const [speechSupported, setSpeechSupported] = useState(false);
	const [quickAction, setQuickAction] = useState({});

	const recognitionRef = useRef(null);
	const chatContainerRef = useRef(null);
	const textareaRef = useRef(null);

	const handleSendMessage = async () => {
		if (!inputValue.trim()) return;

		const userMessage = {
			role: "user",
			parts: [{ text: inputValue }],
		};

		const newMessages = [...messages, userMessage];
		setMessages(newMessages);
		setInputValue("");
		setInChatMode(true);

		let usDetails = "";
		if (!quickAction.userDetails && userDetails) {
			usDetails = await getDefault(userDetails, true, setIsFetch, Alert);
			setQuickAction((prev) => ({ ...prev, userDetails: usDetails }));
		}

		let materialDetails = "";
		if (findBookMode && !quickAction.getMaterial && userDetails) {
			materialDetails = await getMaterialList(
				userDetails?.us_liID,
				setIsFetch,
				Alert
			);
			setQuickAction((prev) => ({ ...prev, getMaterial: materialDetails }));
		}

		await callGemini(
			newMessages,
			setMessages,
			`${quickAction.userDetails || usDetails}  ${
				quickAction.getMaterial || materialDetails
			}`,
			setIsAiThinking,
			"service"
		);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const regenerateResponse = async (messageIndex) => {
		if (messageIndex <= 0) return;
		const newMessages = messages.filter((msg, index) => index !== messageIndex);
		setMessages(newMessages);
		setIsAiThinking(true);
		await callGemini(
			newMessages,
			setMessages,
			`${quickAction.userdetails || ""}  ${quickAction.getMaterial || ""}`,
			setIsAiThinking,
			"service"
		);
	};

	const handleQuickActionMessage = async (prompt, action) => {
		if (!prompt.trim() || !userDetails) return;

		const usID = ["USR-5", "USR-6"].includes(userDetails?.us_level)
			? userDetails?.uid
			: null;
		const liID = !["USR-5", "USR-6"].includes(userDetails?.us_level)
			? userDetails?.us_liID
			: null;

		const userMessage = {
			role: "user",
			parts: [{ text: prompt }],
		};

		const newMessages = [...messages, userMessage];
		setMessages(newMessages);
		setInChatMode(true);
		let data = "";
		switch (action) {
			case "getFeedBack":
				if (!quickAction.getFeedBack) {
					data = await getFeedbackList(liID, setIsFetch, Alert);
					setQuickAction((prev) => ({ ...prev, getFeedBack: data }));
				}
				break;

			case "getTransactionSummary":
				if (!quickAction.getTransactionSummary) {
					data = await getTransactionSummary(usID, liID, setIsFetch, Alert);
					setQuickAction((prev) => ({ ...prev, getTransactionSummary: data }));
				}
				break;

			case "getResourceTop10Material":
				if (!quickAction.getResourceTop10Material) {
					data = await getResourceTop10(
						usID,
						liID,
						"Material",
						setIsFetch,
						Alert
					);
					setQuickAction((prev) => ({
						...prev,
						getResourceTop10Material: data,
					}));
				}
				break;

			case "getResourceTop10Discussion":
				if (!quickAction.getResourceTop10Discussion) {
					data = await getResourceTop10(
						usID,
						liID,
						"Discussion Room",
						setIsFetch,
						Alert
					);
					setQuickAction((prev) => ({
						...prev,
						getResourceTop10Discussion: data,
					}));
				}
				break;

			case "getResourceTop10Computer":
				if (!quickAction.getResourceTop10Computer) {
					data = await getResourceTop10(
						usID,
						liID,
						"Computer",
						setIsFetch,
						Alert
					);
					setQuickAction((prev) => ({
						...prev,
						getResourceTop10Computer: data,
					}));
				}
				break;

			case "getReservedUtilized":
				if (!quickAction.getReservedUtilized) {
					data = await getReservedUtilized(usID, liID, setIsFetch, Alert);
					setQuickAction((prev) => ({ ...prev, getReservedUtilized: data }));
				}
				break;

			case "getReportSummary":
				if (!quickAction.getReportSummary) {
					data = await getReportSummary(usID, liID, setIsFetch, Alert);
					setQuickAction((prev) => ({ ...prev, getReportSummary: data }));
				}
				break;

			case "getActiveReport":
				if (!quickAction.getActiveReport) {
					data = await getActiveReport(usID, liID, setIsFetch, Alert);
					setQuickAction((prev) => ({ ...prev, getActiveReport: data }));
				}
				break;

			case "getActiveOnsite":
				if (!quickAction.getActiveOnsite) {
					data = await getStatusCount(
						usID,
						liID,
						"Active",
						"onSite",
						setIsFetch,
						Alert
					);
					setQuickAction((prev) => ({ ...prev, getActiveOnsite: data }));
				}
				break;

			case "getInactiveOnsite":
				if (!quickAction.getInactiveOnsite) {
					data = await getStatusCount(
						usID,
						liID,
						"Inactive",
						"onSite",
						setIsFetch,
						Alert
					);
					setQuickAction((prev) => ({ ...prev, getInactiveOnsite: data }));
				}
				break;

			case "getActiveOnapp":
				if (!quickAction.getActiveOnapp) {
					data = await getStatusCount(
						usID,
						liID,
						"Active",
						"onApp",
						setIsFetch,
						Alert
					);
					setQuickAction((prev) => ({ ...prev, getActiveOnapp: data }));
				}
				break;

			case "getInactiveOnapp":
				if (!quickAction.getInactiveOnapp) {
					data = await getStatusCount(
						usID,
						liID,
						"Inactive",
						"onApp",
						setIsFetch,
						Alert
					);
					setQuickAction((prev) => ({ ...prev, getInactiveOnapp: data }));
				}
				break;
			case "getUserTop10Onsite":
				if (!quickAction.getUserTop10Onsite) {
					data = await getUserTop10(usID, liID, "onSite", setIsFetch, Alert);
					setQuickAction((prev) => ({ ...prev, getUserTop10Onsite: data }));
				}
				break;
			case "getUserTop10Onapp":
				if (!quickAction.getUserTop10Onapp) {
					data = await getUserTop10(usID, liID, "onApp", setIsFetch, Alert);
					setQuickAction((prev) => ({ ...prev, getUserTop10Onapp: data }));
				}

				console.warn(`No handler for action: ${action}`);
				break;
		}

		let usDetails = "";
		if (!quickAction.userDetails) {
			usDetails = await getDefault(userDetails, true, setIsFetch, Alert);
			setQuickAction((prev) => ({ ...prev, userDetails: usDetails }));
		}

		await callGemini(
			newMessages,
			setMessages,
			`${quickAction?.userdetails || usDetails}  ${
				quickAction?.[action] || data
			}`,
			setIsAiThinking,
			"service"
		);
	};

	const handleClearChat = () => {
		setMessages([]);
		setInChatMode(false);
		setInputValue("");
	};

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
		if (chatContainerRef.current && inChatMode) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	}, [messages, inChatMode]);

	const getQuickActions = (userdetails) => {
		const isPatron = ["USR-5", "USR-6"].includes(userDetails?.us_level);

		const quickActions = [
			!isPatron && {
				icon: FiMessageSquare,
				title: "Library Feedback",
				subtext: "Share suggestions or report issues",
				prompt:
					"Please provide feedback or suggestions regarding the library, if available.",
				action: "getFeedBack",
				bgColor: "bg-blue-100",
				hoverColor: "group-hover:bg-blue-200",
				textColor: "text-blue-600",
			},
			{
				icon: FiBarChart2,
				title: "Transaction Summary",
				subtext: "Quick stats overview",
				prompt: isPatron
					? "Show my transaction summary including reserved, utilized, cancelled, completed, and overdue counts"
					: "Give me a summary of all transactions including reserved, utilized, cancelled, completed, and overdue counts",
				action: "getTransactionSummary",
				bgColor: "bg-orange-100",
				hoverColor: "group-hover:bg-orange-200",
				textColor: "text-orange-600",
			},
			{
				icon: FiBook,
				title: "Top 10 Materials",
				subtext: "Most used physical materials",
				prompt: isPatron
					? "Show me the top 10 materials I frequently used with my transaction details"
					: "Provide a ranked list of the top 10 most frequently used materials with their transaction summaries and important details.",
				action: "getResourceTop10Material",
				bgColor: "bg-green-100",
				hoverColor: "group-hover:bg-green-200",
				textColor: "text-green-600",
			},
			{
				icon: FiMonitor,
				title: "Top 10 Computers",
				subtext: "Most used computer stations",
				prompt: isPatron
					? "Show me the top 10 computer resources I frequently used with my transaction details"
					: "Provide a ranked list of the top 10 most frequently used computer resources with their transaction summaries and important details.",
				action: "getResourceTop10Computer",
				bgColor: "bg-blue-100",
				hoverColor: "group-hover:bg-blue-200",
				textColor: "text-green-600",
			},
			{
				icon: FiTrendingUp,
				title: "Top 10 Discussion Rooms",
				subtext: "Most used discussion rooms",
				prompt: isPatron
					? "Show me the top 10 discussion rooms I frequently used with my transaction details"
					: "Provide a ranked list of the top 10 most frequently used discussion rooms with their transaction summaries and important details.",
				action: "getResourceTop10Discussion",
				bgColor: "bg-teal-100",
				hoverColor: "group-hover:bg-teal-200",
				textColor: "text-green-600",
			},
			{
				icon: FiBookOpen,
				title: "Reserved & Utilized Transactions",
				subtext: "Check current reservations and usage",
				prompt: isPatron
					? "Show my list of current reserved and utilized transactions with full resource details"
					: "Show me the list of current reserved and utilized transactions with full details of resources.",
				action: "getReservedUtilized",
				bgColor: "bg-purple-100",
				hoverColor: "group-hover:bg-purple-200",
				textColor: "text-purple-600",
			},
			{
				icon: FiAlertCircle,
				title: "Active Reports",
				subtext: "View pending issues",
				prompt: isPatron
					? "List all my active reports in the library with transaction details and associated resources."
					: "List all active reports in the library with transaction details, patron profiles, and associated resources. (List View)",
				action: "getActiveReport",
				bgColor: "bg-pink-100",
				hoverColor: "group-hover:bg-pink-200",
				textColor: "text-pink-600",
			},
			{
				icon: FiClipboard,
				title: "Report Summary",
				subtext: "Overview of reports",
				prompt: isPatron
					? "Show me the summary of my reports showing how many are active, resolved, and waived."
					: "Give me a summary of all reports showing how many are active, resolved, and waived, with totals",
				action: "getReportSummary",
				bgColor: "bg-indigo-100",
				hoverColor: "group-hover:bg-indigo-200",
				textColor: "text-indigo-600",
			},
			{
				icon: FiUserCheck,
				title: "Active Onsite Users",
				subtext: "View count of active onsite users",
				prompt: isPatron
					? "Show my status count report of my active onsite"
					: "Show me the status count report for active onsite users",
				action: "getActiveOnsite",
				bgColor: "bg-teal-100",
				hoverColor: "group-hover:bg-teal-200",
				textColor: "text-teal-600",
			},
			{
				icon: FiUserX,
				title: "Inactive Onsite Users",
				subtext: "View count of inactive onsite users",
				prompt: isPatron
					? "Show my status count report for inactive onsite"
					: "Show me the status count report for inactive onsite users",
				action: "getInactiveOnsite",
				bgColor: "bg-red-100",
				hoverColor: "group-hover:bg-red-200",
				textColor: "text-red-600",
			},
			{
				icon: FiUserCheck,
				title: "Active Onapp Users",
				subtext: "View count of active onapp users",
				prompt: isPatron
					? "Show my status count report of my active onapp"
					: "Show me the status count report for active onapp users",
				action: "getActiveOnapp",
				bgColor: "bg-cyan-100",
				hoverColor: "group-hover:bg-cyan-200",
				textColor: "text-cyan-600",
			},
			{
				icon: FiUserX,
				title: "Inactive Onapp Users",
				subtext: "View count of inactive onapp users",
				prompt: isPatron
					? "Show my status count report for inactive onapp"
					: "Show me the status count report for inactive onapp users",
				action: "getInactiveOnapp",
				bgColor: "bg-yellow-100",
				hoverColor: "group-hover:bg-yellow-200",
				textColor: "text-yellow-600",
			},
			{
				icon: FiUsers,
				title: "Top 10 by Onsite",
				subtext: "View most frequent onsite entries",
				prompt: isPatron
					? "Show me my onsite history with visit counts and durations"
					: "Show me the top 10 most frequent onsite entries with visit counts, durations, and details",
				action: "getUserTop10Onsite",
				bgColor: "bg-lime-100",
				hoverColor: "group-hover:bg-lime-200",
				textColor: "text-lime-600",
			},
			{
				icon: FiUsers,
				title: "Top 10 by Onapp",
				subtext: "View most frequent onapp entries",
				prompt: isPatron
					? "Show me my onapp history with visit counts and durations"
					: "Show me the top 10 most frequent onapp entries with visit counts, durations, and details",
				action: "getUserTop10Onapp",
				bgColor: "bg-emerald-100",
				hoverColor: "group-hover:bg-emerald-200",
				textColor: "text-emerald-600",
			},
			{
				icon: FiCode,
				title: "System Developer",
				subtext: "Know who developed this sysytem",
				prompt: isPatron
					? "Show me information about the developer of this system"
					: "Provide details about who developed and maintains the system",
				action: "getDeveloperInfo",
				bgColor: "bg-orange-100",
				hoverColor: "group-hover:bg-orange-200",
				textColor: "text-orange-600",
			},
		].filter(Boolean);

		return quickActions;
	};

	return (
		<ProtectedRoute
			allowedRoles={["USR-2", "USR-3", "USR-4", "USR-5", "USR-6"]}
		>
			<div className="flex h-screen bg-background transition-colors duration-300">
				<Sidebar />

				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />
					<main
						className={`flex-1 ${
							!inChatMode ? "overflow-auto" : "overflow-hidden"
						} pt-20`}
					>
						<div
							className={`p-6 max-w-5xl mx-auto ${
								inChatMode ? "h-full flex flex-col" : ""
							}`}
						>
							{!inChatMode ? (
								<>
									<div className="text-center pt-8 md:pt-16  pb-8 animate-fade-in">
										<h1 className="font-bold mb-3" style={{ fontSize: "32px" }}>
											<span className="text-foreground">How can I </span>
											<span className="text-primary-custom">
												help you today?
											</span>
										</h1>
										<p
											className="text-muted-foreground"
											style={{ fontSize: "16px" }}
										>
											Ask me anything or choose a task below
										</p>
									</div>

									<div className="mb-8 animate-slide-up">
										<InputField
											inputValue={inputValue}
											setInputValue={setInputValue}
											isListening={isListening}
											setIsListening={setIsListening}
											recognitionRef={recognitionRef}
											speechSupported={speechSupported}
											findBookMode={findBookMode}
											toggleSpeechRecognition={toggleSpeechRecognition}
											handleSendMessage={handleSendMessage}
											handleKeyDown={handleKeyDown}
											setFindBookMode={setFindBookMode}
											textareaRef={textareaRef}
										/>
									</div>

									<div className="animate-slide-up-delay-1">
										<div className="mb-6">
											<h1 className="font-semibold text-foreground text-[20px]">
												Quick Actions
											</h1>
											<p className="text-muted-foreground text-[14px]">
												Get started instantly with common library management
												tasks.
											</p>
										</div>
										<div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-6">
											{getQuickActions(userDetails).map((query, index) => {
												const IconComponent = query.icon;
												return (
													<Card
														key={index}
														onClick={() =>
															handleQuickActionMessage(
																query.prompt,
																query.action
															)
														}
														className="bg-card border border-border cursor-pointer hover:shadow-md hover:border-primary-custom/20 transition-all duration-200 group"
													>
														<CardContent className="p-6">
															<div className="flex flex-col items-start">
																<div
																	className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200 ${query.bgColor} ${query.hoverColor}`}
																>
																	<IconComponent
																		className={`w-5 h-5 transition-colors duration-200 ${query.textColor}`}
																	/>
																</div>
																<h4 className="font-medium text-[14px]">
																	{query.title}
																</h4>
																<p className="text-muted-foreground text-[12px]">
																	{query.subtext}
																</p>
															</div>
														</CardContent>
													</Card>
												);
											})}
										</div>
									</div>
								</>
							) : (
								<div className="flex flex-col h-full animate-fade-in">
									<div className="flex justify-between items-center">
										<h2 className="text-[18px] font-semibold">AI-Librarian</h2>

										<Button
											variant="ghost"
											size="sm"
											className="text-[12px] flex items-center gap-1 hover:bg-muted"
											onClick={handleClearChat}
										>
											<FiTrash2 className="w-3 h-3" />
											Clear Chat
										</Button>
									</div>

									<div
										ref={chatContainerRef}
										className="flex-1 overflow-y-auto pr-2 space-y-6"
										style={{ paddingBottom: "8px" }}
									>
										{messages.map((message, index) => {
											if (message.role === "user") {
												return (
													<div key={index} className="flex flex-col items-end">
														<div className="text-[14px] text-muted-foreground mb-1 mr-1">
															You
														</div>
														<div className="max-w-[80%] bg-muted/70 rounded-2xl rounded-tr-sm px-4 py-2.5">
															<div className="text-[13px] whitespace-pre-line">
																{message.parts[0].text}
															</div>
														</div>
													</div>
												);
											}

											return (
												<div key={index} className="flex justify-start">
													<div className="max-w-[90%] bg-primary-custom/10 rounded-2xl rounded-tl-sm ">
														<div className="flex items-center gap-2 mb-2">
															<div className="flex items-center gap-2">
																<div className="w-6 h-6 rounded-full  overflow-hidden flex items-center justify-center">
																	<img
																		src="/AI.png"
																		alt="AI-Librarian"
																		className="w-full h-full object-cover"
																	/>
																</div>
																<div className="text-[14px] font-medium">
																	AI-Librarian
																</div>
															</div>
														</div>

														<div className="text-[13px] ml-8">
															<ReactMarkdown
																remarkPlugins={[remarkGfm]}
																components={{
																	p: ({ node, ...props }) => (
																		<p
																			className="mb-2 text-[13px]"
																			{...props}
																		/>
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
																		<a
																			className="text-blue-600 underline"
																			target="_blank"
																			rel="noopener noreferrer"
																			{...props}
																		/>
																	),

																	hr: ({ node, ...props }) => (
																		<hr
																			className="my-4 border-gray-300"
																			{...props}
																		/>
																	),
																}}
															>
																{message.parts[0].text}
															</ReactMarkdown>
														</div>

														<div className="flex items-center gap-3 mt-2  ml-8">
															<button
																className={`text-[12px] flex items-center gap-1 text-muted-foreground hover:text-foreground ${
																	message.isSpeaking
																		? "text-primary-custom"
																		: ""
																}`}
																onClick={() =>
																	toggleTextToSpeech(
																		index,
																		messages,
																		setMessages
																	)
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
																alt="AI-Librarian"
																className="w-full h-full object-cover"
															/>
														</div>
													</div>
													<span className="text-[13px]">
														{isFetching != null
															? isFetching
															: "AI-Librarian is thinking"}
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

									<div>
										<InputField
											inputValue={inputValue}
											setInputValue={setInputValue}
											isListening={isListening}
											setIsListening={setIsListening}
											recognitionRef={recognitionRef}
											speechSupported={speechSupported}
											findBookMode={findBookMode}
											toggleSpeechRecognition={toggleSpeechRecognition}
											handleSendMessage={handleSendMessage}
											handleKeyDown={handleKeyDown}
											setFindBookMode={setFindBookMode}
											textareaRef={textareaRef}
										/>
									</div>
								</div>
							)}
						</div>
					</main>
				</div>
			</div>
		</ProtectedRoute>
	);
}

const InputField = ({
	inputValue,
	setInputValue,
	isListening,
	setIsListening,
	recognitionRef,
	speechSupported,
	findBookMode,
	toggleSpeechRecognition,
	handleSendMessage,
	handleKeyDown,
	setFindBookMode,
	textareaRef,
}) => (
	<div className="bg-card rounded-lg border border-border p-4 transition-colors duration-300">
		<div className="flex items-center gap-3">
			<div className="flex-1">
				<textarea
					ref={textareaRef}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={
						isListening
							? "Listening... Speak now"
							: findBookMode
							? "Describe the book you're looking for..."
							: "Type your message here..."
					}
					className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground text-[14px] min-h-[24px]"
					rows={1}
				/>
			</div>

			<div className="flex items-center gap-2">
				<Button
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
					variant="ghost"
					size="sm"
					className="h-9 w-9 p-0 hover:bg-primary-custom hover:text-white"
					disabled={!inputValue.trim()}
					onClick={handleSendMessage}
				>
					<FiSend className="w-4 h-4" />
				</Button>
			</div>
		</div>

		<div className="mt-3 pt-3 border-t border-border">
			<div className="flex items-center space-x-2">
				<Checkbox
					id="find-book"
					checked={findBookMode}
					onCheckedChange={setFindBookMode}
				/>
				<label
					htmlFor="find-book"
					className="text-foreground cursor-pointer text-[12px]"
				>
					I want to find a book
				</label>
			</div>
			{findBookMode && (
				<p className="text-muted-foreground mt-2 ml-6 text-[12px]">
					Describe the book by title, author, genre, or any details you
					remember.
				</p>
			)}
		</div>

		{isListening && (
			<div className="mt-3 pt-3 border-t border-border">
				<div className="flex items-center gap-2 text-muted-foreground text-[12px]">
					<div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
					Listening... Click the microphone again to stop
				</div>
			</div>
		)}
	</div>
);
