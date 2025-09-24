"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { handleChange } from "@/controller/custom/customFunction";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { LoadingSpinner } from "@/components/loading";

import { insertFaqs } from "../../controller/firebase/insert/insertFaqs";
import { updateFaqs } from "../../controller/firebase/update/updateFaqs";

import { isEmptyObject } from "../../controller/custom/customFunction";

export function AddFaqModal({ isOpen, onClose, selectedFaqs = null }) {
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const [btnLoading, setBtnLoading] = useState(false);

	const [formData, setFormData] = useState({
		fa_question: "",
		fa_answer: "",
	});

	const isEmpty = isEmptyObject(selectedFaqs);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!userDetails.uid) return;

		if (!formData.fa_question.trim() || !formData.fa_answer.trim()) {
			Alert.showWarning("Both question and answer are required.");
			return;
		}

		if (isEmpty) {
			await insertFaqs(
				userDetails.us_liID,
				userDetails.uid,
				formData,
				setBtnLoading,
				Alert
			);
		} else {
			await updateFaqs(
				selectedFaqs.id,
				userDetails.us_liID,
				formData,
				userDetails.uid,
				setBtnLoading,
				Alert
			);
		}

		setFormData({ fa_question: "", fa_answer: "" });
		onClose();
	};

	useEffect(() => {
		setFormData({
			fa_question: selectedFaqs?.fa_question || "",
			fa_answer: selectedFaqs?.fa_answer || "",
		});
	}, [isOpen, selectedFaqs]);

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={!isEmpty ? "Update FAQ" : "Add FAQ"}
			size="md"
		>
			<form onSubmit={handleSubmit}>
				<div className="flex-1 overflow-y-auto p-6 space-y-4">
					<p className="text-muted-foreground mb-4 text-[12px]">
						Enter the question and answer for the FAQ.
					</p>

					{/* Question */}
					<div className="space-y-1">
						<Label
							htmlFor="faq-question"
							className="text-[12px] font-medium text-foreground"
						>
							Question
						</Label>
						<Input
							id="faq-question"
							name="fa_question"
							value={formData.fa_question}
							onChange={(e) => handleChange(e, setFormData)}
							className="h-9 bg-background border-border text-foreground"
							style={{ fontSize: "12px" }}
							placeholder="e.g., How do I borrow a book?"
							required
						/>
					</div>

					{/* Answer */}
					<div className="space-y-1">
						<Label
							htmlFor="faq-answer"
							className="text-[12px] font-medium text-foreground"
						>
							Answer
						</Label>
						<Textarea
							id="faq-answer"
							name="fa_answer"
							value={formData.fa_answer}
							onChange={(e) => handleChange(e, setFormData)}
							className="h-24 bg-background border-border text-foreground"
							style={{ fontSize: "12px" }}
							placeholder="Provide a detailed answer here..."
							required
						/>
					</div>
				</div>

				<div className="flex items-center justify-end gap-3 px-6 py-4 bg-muted/30 border-t border-border">
					<Button
						type="button"
						onClick={() => onClose()}
						variant="outline"
						className="bg-transparent h-10 px-4 text-[12px]"
					>
						Cancel
					</Button>
					<Button
						type="submit"
						className="bg-primary-custom hover:bg-secondary-custom text-white text-[12px] h-10 px-4"
						disabled={btnLoading}
					>
						<LoadingSpinner loading={btnLoading} />
						{!isEmpty ? "Update FAQ" : "Add FAQ"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
