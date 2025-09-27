"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { FiSearch, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import EmptyState from "@/components/tags/empty";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";

import DeleteConfirmationModal from "@/components/modal/delete-confirmation-modal";
import { AddFaqModal } from "@/components/modal/faq-modal";
import PaginationControls from "@/components/tags/pagination";

import { getFeedbackList } from "../../controller/firebase/get/getFeedbackList";
import { getFaqsList } from "../../controller/firebase/get/getFaqsList";
import { updateFeedbackRead } from "../../controller/firebase/update/updateFeedback";

export default function FeedbackAndFAQs() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath, loading } = useLoading();

	const [searchQuery, setSearchQuery] = useState("");
	const [feedbackData, setFeedbackData] = useState([]);
	const [faqData, setFaqData] = useState([]);

	//MODAL
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [isAddFaqModalOpen, setIsAddFaqModalOpen] = useState(false);
	const [selectedFaq, setSelectedFaq] = useState(null);

	//PAGINATION
	const pageLimit = 5;
	const [pagination, setPagination] = useState({
		feedback: {
			currentPage: 1,
			pageCursors: [],
			ctrPages: 1,
		},
		faqs: {
			currentPage: 1,
			pageCursors: [],
			ctrPages: 1,
		},
	});

	const handleCheckboxChange = async (id, type, checked) => {
		if (!userDetails.uid) return;
		await updateFeedbackRead(
			id,
			userDetails.us_liID,
			type,
			checked,
			userDetails.uid,
			Alert
		);
	};

	useEffect(() => {
		setPath(pathname);
		let unsubscribe;

		if (userDetails && userDetails.us_liID) {
			unsubscribe = getFeedbackList(
				userDetails.us_liID,
				setFeedbackData,
				searchQuery,
				setLoading,
				Alert,
				pageLimit,
				pagination,
				setPagination
			);
		}

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [userDetails?.us_liID, searchQuery, pagination.feedback.currentPage]);

	useEffect(() => {
		let unsubscribe;

		if (userDetails?.us_liID) {
			unsubscribe = getFaqsList(
				userDetails.us_liID,
				setFaqData,
				setLoading,
				Alert,
				pageLimit,
				pagination,
				setPagination
			);
		}

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [userDetails?.us_liID, pagination.faqs.currentPage]);

	return (
		<ProtectedRoute allowedRoles={["USR-2", "USR-3"]}>
			<div className="flex h-screen bg-background transition-colors duration-300">
				<Sidebar />
				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />

					<main className="flex-1 overflow-auto p-6 pt-24 overflow-auto">
						<div className="mb-8 animate-slide-up">
							<h1 className="font-semibold text-foreground text-[20px]">
								Feedback & FAQs
							</h1>
							<p className="text-muted-foreground text-[14px]">
								Manage user feedback and frequently asked questions
							</p>
						</div>

						<div className="grid grid-cols-1 lg:grid-cols-2 gap-14 animate-slide-up-delay-1">
							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-6">
									<h3 className="text-foreground font-semibold text-[16px]">
										User Feedback
									</h3>
									<p className="text-muted-foreground mb-4 text-[12px]">
										View and manage feedback from users about the system
										application.
									</p>

									<div className="relative mb-6">
										<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
										<Input
											type="text"
											placeholder="Search feedback..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											className="pl-10 bg-card border-border text-foreground h-9"
											style={{ fontSize: "12px" }}
										/>
									</div>

									<div className="space-y-4">
										{feedbackData.map((feedback) => (
											<div
												key={feedback.id}
												className={`flex items-start gap-4 p-4 rounded-lg border ${
													feedback.fe_isRead
														? "bg-muted/20 border-border"
														: "bg-card border-primary/20 shadow-sm"
												} hover:border-primary/50 transition-colors`}
											>
												{userDetails &&
													["USR-2", "USR-3"].includes(userDetails.us_level) && (
														<Checkbox
															id={`feedback-${feedback.id}`}
															checked={feedback.fe_isRead}
															onCheckedChange={(checked) =>
																handleCheckboxChange(
																	feedback.id,
																	feedback.fe_type,
																	feedback.fe_isRead
																)
															}
															className="mt-1"
															title="Mark as read"
														/>
													)}
												<Avatar className="h-10 w-10">
													<AvatarImage
														src={feedback.fe_avatar || "/placeholder.svg"}
														alt={feedback.fe_sender}
													/>
													<AvatarFallback>
														{feedback.fe_sender.charAt(0)}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 space-y-2">
													<div className="flex items-start justify-between ">
														<div>
															<p className="text-foreground font-medium text-[14px]">
																{feedback.fe_sender}
															</p>

															<p className="text-primary-custom text-[12px]">
																{feedback.fe_ustype}
																<span className="text-muted-foreground">
																	{" • "}
																	{feedback.fe_schoolID}
																</span>
															</p>
														</div>
														<span className="text-muted-foreground text-[11px]">
															{feedback.fe_createdAtFormatted}
														</span>
													</div>

													<span className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[11px]">
														{feedback.fe_type}
													</span>

													<p className="text-muted-foreground text-[12px]">
														{feedback.fe_content}
													</p>

													{feedback.fe_screenshot && (
														<div>
															<p className="text-foreground font-medium mt-4 mb-2 text-[12px]">
																Screenshot:
															</p>
															<img
																src={
																	feedback.fe_screenshot || "/placeholder.svg"
																}
																alt="Feedback screenshot"
																className="w-full max-h-40 object-cover rounded-md border border-border"
															/>
														</div>
													)}
												</div>
											</div>
										))}

										<EmptyState data={feedbackData} loading={loading} />
									</div>

									<PaginationControls
										ctrPages={pagination.feedback.ctrPages}
										currentPage={pagination.feedback.currentPage}
										setCurrentPage={(val) =>
											setPagination((prev) => ({
												...prev,
												feedback: {
													...prev.feedback,
													currentPage:
														typeof val === "function"
															? val(prev.feedback.currentPage)
															: val,
												},
											}))
										}
									/>
								</CardContent>
							</Card>

							<Card className="bg-card border-border transition-colors duration-300 h-fit">
								<CardContent className="p-6">
									<div className="flex items-start justify-between mb-1  gap-6">
										<div>
											<h3 className="text-foreground font-semibold text-[16px]">
												Frequently Asked Questions
											</h3>
											<p className="text-muted-foreground mb-4 text-[12px]">
												Manage common questions and their answers.
											</p>
										</div>
										{userDetails &&
											["USR-2", "USR-3"].includes(userDetails.us_level) && (
												<Button
													className="bg-primary-custom hover:bg-secondary-custom text-white h-9 px-3 text-[12px]"
													onClick={() => {
														setSelectedFaq({});
														setIsAddFaqModalOpen(true);
													}}
												>
													<FiPlus className="h-4 w-4" />
													Add New FAQ
												</Button>
											)}
									</div>

									<Accordion type="single" collapsible className="w-full">
										{faqData.map((faq) => (
											<AccordionItem
												key={faq.id}
												value={faq.id}
												className="border-b border-border"
											>
												<AccordionTrigger className="text-left text-foreground hover:no-underline py-3 relative text-[12px]">
													<span>{faq.fa_question}</span>
												</AccordionTrigger>

												<AccordionContent className="text-muted-foreground pb-4 text-[12px]">
													<div className="flex justify-between items-start gap-2">
														<div className="flex-1">{faq.fa_answer}</div>
														{userDetails &&
															["USR-2", "USR-3"].includes(
																userDetails.us_level
															) && (
																<div className="flex gap-2">
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
																		title="Edit FAQ"
																		onClick={() => {
																			setSelectedFaq(faq);
																			setIsAddFaqModalOpen(true);
																		}}
																	>
																		<FiEdit2 className="w-3.5 h-3.5" />
																	</Button>
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
																		onClick={() => {
																			setSelectedFaq(faq);
																			setDeleteOpen(true);
																		}}
																		title="Delete FAQ"
																	>
																		<FiTrash2 className="w-3.5 h-3.5" />
																	</Button>
																</div>
															)}
													</div>
												</AccordionContent>
											</AccordionItem>
										))}

										<EmptyState data={faqData} loading={loading} />

										<PaginationControls
											ctrPages={pagination.faqs.ctrPages}
											currentPage={pagination.faqs.currentPage}
											setCurrentPage={(val) =>
												setPagination((prev) => ({
													...prev,
													faqs: {
														...prev.faqs,
														currentPage:
															typeof val === "function"
																? val(prev.faqs.currentPage)
																: val,
													},
												}))
											}
										/>
									</Accordion>
								</CardContent>
							</Card>
						</div>
					</main>
				</div>
				<AddFaqModal
					isOpen={isAddFaqModalOpen}
					onClose={() => setIsAddFaqModalOpen(false)}
					selectedFaqs={selectedFaq}
				/>

				<DeleteConfirmationModal
					isOpen={deleteOpen}
					onClose={() => setDeleteOpen(false)}
					type="Feedback"
					title={"Delete Feedback"}
					description="Are you sure you want to delete this feedback? This action cannot be undone."
					id={selectedFaq?.id}
				/>
			</div>
		</ProtectedRoute>
	);
}
