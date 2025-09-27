"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FiTrash2 } from "react-icons/fi";
import { FiImage, FiArrowLeft, FiUpload } from "react-icons/fi";

import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeactivateResourceModal } from "@/components/modal/deactivate-resource-modal";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";
import { useLoading } from "@/contexts/LoadingProvider";
import { LoadingSpinner } from "@/components/loading";

import { handleChange } from "@/controller/custom/customFunction";
import { insertComputer } from "../../../../controller/firebase/insert/insertComputer";
import { updateComputer } from "../../../../controller/firebase/update/updateComputer";
import { getComputer } from "../../../../controller/firebase/get/getComputer";

const defaultValues = {
	co_status: "Active",
	co_name: "",
	co_date: "",
	co_assetTag: "",
	co_description: "",
	co_minDuration: "",
	co_maxDuration: "",
	co_specifications: "",
	co_photoURL: "",
};
export default function RegisterComputer() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const type = searchParams.get("type");
	const id = searchParams.get("id");

	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const { setLoading, setPath } = useLoading();
	const [btnLoading, setBtnloading] = useState(false);

	const [formData, setFormData] = useState(defaultValues);

	const [showDeactivateModal, setShowDeactivateModal] = useState(false);

	const handleCancel = () => {
		router.back();
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!userDetails || !userDetails?.us_liID || !userDetails?.uid || !type)
			return;

		if (type == "register") {
			insertComputer(
				userDetails?.us_liID,
				userDetails?.uid,
				formData,
				setBtnloading,
				Alert
			);
			setFormData(defaultValues);
		} else if (type == "edit" && id) {
			updateComputer(
				id,
				userDetails?.us_liID,
				userDetails?.uid,
				formData,
				setBtnloading,
				Alert
			);
		}
	};

	useEffect(() => {
		setPath(pathname);
		if (userDetails && type && type == "edit" && id) {
			getComputer(id, setFormData, setLoading, Alert);
		}
	}, [userDetails, showDeactivateModal]);

	return (
		<ProtectedRoute allowedRoles={["USR-2", "USR-3", "USR-4"]}>
			<div className="min-h-screen bg-background transition-colors duration-300">
				<Header />
				<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
					<div className="mb-6 animate-fade-in">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-[11px]"
						>
							<FiArrowLeft className="w-4 h-4" />
							Back to Previous page
						</button>
					</div>

					<div className="mb-8 animate-slide-up">
						<h1 className="font-semibold text-foreground text-[20px]">
							{type === "register" ? "Register Computer" : "Update Computer"}
						</h1>
						<p className="text-muted-foreground text-[14px]">
							{type === "register"
								? "Add a new computer resource to the system with complete technical specifications"
								: "Update the computer resource information and modify technical specifications"}
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-14 animate-slide-up-delay-1 items-start">
							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-6">
									<h2 className="font-semibold text-foreground text-[16px]">
										Computer Information
									</h2>
									<p className="text-muted-foreground text-[12px] mb-4">
										Enter the technical details and specifications for the
										computer resource.
									</p>

									<div className="space-y-4">
										<div>
											<label className="block text-foreground font-medium mb-2 text-[12px]">
												Computer Name
											</label>
											<Input
												name="co_name"
												value={formData?.co_name}
												onChange={(e) => handleChange(e, setFormData)}
												placeholder="Computer Lab 01-A"
												className="bg-card border-border text-foreground h-9"
												style={{ fontSize: "11px" }}
												required
											/>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-foreground font-medium mb-2 text-[12px]">
													Date Added
												</label>
												<Input
													name="co_date"
													type="date"
													value={formData?.co_date}
													onChange={(e) => handleChange(e, setFormData)}
													className="bg-card border-border text-foreground h-9"
													style={{ fontSize: "11px" }}
													required
												/>
											</div>
											<div>
												<label className="block text-foreground font-medium mb-2 text-[12px]">
													Asset Tag
												</label>
												<Input
													name="co_assetTag"
													value={formData?.co_assetTag}
													onChange={(e) => handleChange(e, setFormData)}
													placeholder="CMP-001"
													className="bg-card border-border text-foreground h-9"
													style={{ fontSize: "11px" }}
													required
												/>
											</div>
										</div>

										<div>
											<label className="block text-foreground font-medium mb-2 text-[12px]">
												Description
											</label>
											<Textarea
												name="co_description"
												value={formData?.co_description}
												onChange={(e) => handleChange(e, setFormData)}
												placeholder="High-performance desktop computer..."
												rows={3}
												className="bg-card border-border text-foreground"
												style={{ fontSize: "12px" }}
												required
											/>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-foreground font-medium mb-2 text-[12px]">
													Min Duration
												</label>
												<Input
													type="time"
													name="co_minDuration"
													value={formData?.co_minDuration}
													onChange={(e) => handleChange(e, setFormData)}
													placeholder="1 hour"
													className="bg-card border-border text-foreground h-9"
													style={{ fontSize: "11px" }}
													required
												/>
											</div>
											<div>
												<label className="block text-foreground font-medium mb-2 text-[12px]">
													Max Duration
												</label>
												<Input
													type="time"
													name="co_maxDuration"
													value={formData?.co_maxDuration}
													onChange={(e) => handleChange(e, setFormData)}
													placeholder="4 hours"
													className="bg-card border-border text-foreground h-9"
													style={{ fontSize: "11px" }}
													required
												/>
											</div>
										</div>

										<div>
											<label className="block text-foreground font-medium mb-2 text-[12px]">
												Specifications
											</label>
											<Input
												name="co_specifications"
												value={formData?.co_specifications}
												onChange={(e) => handleChange(e, setFormData)}
												placeholder="Intel i7, 16GB RAM, GTX 1660"
												className="bg-card border-border text-foreground h-9"
												style={{ fontSize: "11px" }}
												required
											/>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border shadow-sm animate-slide-up-delay-2">
								<CardHeader className="pb-4">
									<CardTitle className="text-foreground flex items-center gap-2 text-[16px]">
										<FiImage className="w-4 h-4" />
										Cover Image
									</CardTitle>
									<p className="text-muted-foreground text-[12px]">
										Upload cover image (.jpg, .png)
									</p>
								</CardHeader>
								<CardContent className="pt-0 space-y-6">
									<label
										htmlFor="cover-image-upload"
										className="border-2 border-dashed border-border rounded-lg text-center transition-colors cursor-pointer block"
									>
										<input
											type="file"
											accept="image/jpeg,image/png"
											name="co_photoURL"
											className="hidden"
											onChange={(e) => handleChange(e, setFormData)}
											id="cover-image-upload"
										/>
										{formData?.co_photoURL ? (
											<div className="w-full h-[250px] bg-muted/30 rounded-md flex items-center justify-center overflow-hidden">
												<img
													src={
														formData?.co_photoURL instanceof File
															? URL.createObjectURL(formData?.co_photoURL)
															: formData?.co_photoURL
													}
													alt="Cover preview"
													className="w-full h-full object-cover rounded-md"
												/>
											</div>
										) : (
											<div className="space-y-2 m-8">
												<FiUpload className="w-6 h-6 mx-auto text-muted-foreground" />
												<p className="text-muted-foreground text-xs">
													Click to upload
												</p>
											</div>
										)}
									</label>

									<div className="flex justify-end gap-4 ">
										<Button
											type="button"
											variant="outline"
											onClick={handleCancel}
											className="bg-transparent hover:bg-accent text-foreground h-11 w-fit text-[12px]"
										>
											Cancel
										</Button>
										<Button
											type="submit"
											className="bg-primary-custom hover:bg-secondary-custom text-white h-11 w-fit text-[12px]"
											disabled={!type}
										>
											<LoadingSpinner loading={btnLoading} />
											{type && type == "register"
												? "Register Computer"
												: " Update Computer"}
										</Button>
									</div>

									{type && type == "edit" && id && (
										<div
											className="space-y-4 border-t pt-5"
											style={{ marginTop: "50px" }}
										>
											<div className="flex items-start gap-3">
												<div
													className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
														formData?.co_status === "Active"
															? "bg-red-50"
															: "bg-green-50"
													}`}
												>
													{formData?.co_status === "Active" ? (
														<FiTrash2 className="w-4 h-4 text-red-500" />
													) : (
														<IoMdCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
													)}
												</div>
												<div className="flex-1 space-y-1">
													<h2 className="font-semibold text-foreground text-[16px]">
														{formData?.co_status === "Active"
															? "Deactivate Material"
															: "Activate Material"}
													</h2>
													<p className="text-muted-foreground leading-relaxed text-[12px]">
														{formData?.co_status === "Active"
															? "This will remove the material from search results and circulation. The material can be reactivated later by an administrator."
															: "This will restore the material to be available again in search results and circulation."}
													</p>
												</div>
											</div>

											<div className="pt-2 border-t border-border">
												<Button
													type="button"
													variant="outline"
													onClick={() => setShowDeactivateModal(true)}
													className={`w-full h-9 transition-colors text-[12px] ${
														formData?.co_status === "Active"
															? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
															: "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
													}`}
												>
													{formData?.co_status === "Active" ? (
														<FiTrash2 className="w-4 h-4 mr-2" />
													) : (
														<IoMdCheckmarkCircleOutline className="w-4 h-4 mr-2" />
													)}
													{formData?.co_status === "Active"
														? "Deactivate Material"
														: "Activate Material"}
												</Button>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</form>
				</main>

				{showDeactivateModal && (
					<DeactivateResourceModal
						isOpen={showDeactivateModal}
						onClose={() => setShowDeactivateModal(false)}
						resourceType="computers"
						resourceId={formData?.id}
						resourceTitle={formData?.co_name || "Untitled Computer"}
						resourceStatus={formData?.co_status}
						resourceQr={formData?.co_qr}
					/>
				)}
			</div>
		</ProtectedRoute>
	);
}
