"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
	FiTrash2,
	FiArrowLeft,
	FiImage,
	FiUpload,
	FiMapPin,
} from "react-icons/fi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { useLoading } from "@/contexts/LoadingProvider";
import { LoadingSpinner } from "@/components/loading";

import { PinLocation } from "@/components/modal/pinLocation";
import { DeactivateResourceModal } from "@/components/modal/deactivate-resource-modal";
import { handleChange } from "@/controller/custom/customFunction";

import { updateLibrary } from "@/controller/firebase/update/updateLibrary";
import { getLibrary } from "@/controller/firebase/get/getLibrary";

const defaultValues = {
	li_status: "Active",
	li_schoolID: "",
	li_name: "",
	li_schoolname: "",
	li_description: "",
	li_email: "",
	li_phone: "",
	li_address: "",
	li_latlng: "",
	li_photoURL: "",
};

export default function LibraryDetails() {
	const router = useRouter();
	const pathname = usePathname();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");
	const { setLoading, setPath } = useLoading();
	const [isEditing, setIsEditing] = useState(false);
	const [btnLoading, setBtnloading] = useState(false);

	const [formData, setFormData] = useState(defaultValues);
	const [showDeactivateModal, setShowDeactivateModal] = useState(false);
	const [showPinModal, setShowPinModal] = useState(false);

	//LEVEL
	const [isAllowed, setIsAllowed] = useState(false);

	const handleSave = async () => {
		if (id && userDetails?.uid) {
			await updateLibrary(id, userDetails.uid, formData, setBtnloading, Alert);
		}
		setIsEditing(false);
	};

	useEffect(() => {
		setIsAllowed(["USR-1", "USR-2", "USR-3"].includes(userDetails.us_level));
	}, [userDetails]);

	useEffect(() => {
		if (!id) return;
		setPath(pathname);
		const unsubscribe = getLibrary(id, setFormData, setLoading, Alert);
		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [id]);

	return (
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

				<div className="w-fit mb-8 animate-slide-up">
					<h1 className="font-semibold text-foreground text-[20px]">
						Library Details
					</h1>
					<p className="text-muted-foreground text-[14px]">
						View and edit detailed library information and settings
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-14 animate-slide-up-delay-2">
					<Card className="h-fit bg-card border-border transition-colors duration-300">
						<CardContent className="p-6">
							<h2 className="font-semibold text-foreground text-[16px]">
								Library Information
							</h2>
							<p className="text-muted-foreground text-[12px] mb-4">
								Here’s everything you need to know about this library.
							</p>

							<div className="space-y-4">
								<div>
									<label className="block text-foreground font-medium mb-2 text-[12px]">
										Library Name
									</label>
									<Input
										name="li_name"
										value={formData.li_name || ""}
										onChange={(e) => handleChange(e, setFormData)}
										placeholder="e.g., NU Baliwag Learning Hub"
										className="bg-card border-border text-foreground h-9"
										style={{ fontSize: "12px" }}
										disabled={!isEditing}
										required
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-foreground font-medium mb-2 text-[12px]">
											School Name
										</label>
										<Input
											name="li_schoolname"
											value={formData.li_schoolname || ""}
											onChange={(e) => handleChange(e, setFormData)}
											placeholder="e.g., National University Baliwag"
											className="bg-card border-border text-foreground h-9"
											style={{ fontSize: "12px" }}
											disabled={!isEditing}
											required
										/>
									</div>
									<div>
										<label className="block text-foreground font-medium mb-2 text-[12px]">
											School ID
										</label>
										<Input
											name="li_schoolID"
											value={formData.li_schoolID || ""}
											onChange={(e) => handleChange(e, setFormData)}
											placeholder="e.g., 2022-001234"
											className="bg-card border-border text-foreground h-9"
											style={{ fontSize: "12px" }}
											disabled={!isEditing}
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-foreground font-medium mb-2 text-[12px]">
											School Email
										</label>
										<Input
											type="email"
											name="li_email"
											value={formData.li_email || ""}
											onChange={(e) => handleChange(e, setFormData)}
											placeholder="e.g., library@nubal.edu.ph"
											className="bg-card border-border text-foreground h-9"
											style={{ fontSize: "12px" }}
											disabled={!isEditing}
											required
										/>
									</div>
									<div>
										<label className="block text-foreground font-medium mb-2 text-[12px]">
											Phone Number
										</label>
										<Input
											name="li_phone"
											value={formData.li_phone || ""}
											onChange={(e) => handleChange(e, setFormData)}
											placeholder="e.g., +639123456789"
											className="bg-card border-border text-foreground h-9"
											style={{ fontSize: "12px" }}
											pattern="^\+639\d{9}$"
											title="Format must be +639 followed by 9 digits (e.g., +639123456789)"
											disabled={!isEditing}
											required
										/>
									</div>
								</div>

								<div>
									<label className="block text-foreground font-medium mb-2 text-[12px]">
										Description
									</label>
									<Textarea
										name="li_description"
										value={formData.li_description || ""}
										onChange={(e) => handleChange(e, setFormData)}
										placeholder="Brief description of the library’s services, facilities, or location."
										rows={3}
										className="bg-card border-border text-foreground"
										disabled={!isEditing}
										style={{ fontSize: "12px" }}
									/>
								</div>

								<div>
									<label className="block text-foreground font-medium mb-2 text-[12px]">
										Address
									</label>
									<Input
										name="li_address"
										value={formData.li_address || ""}
										onChange={(e) => handleChange(e, setFormData)}
										placeholder="e.g., Purok 2, Sto. Niño, Baliwag"
										className="bg-card border-border text-foreground h-9"
										style={{ fontSize: "12px" }}
										disabled={!isEditing}
										required
										readOnly
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-foreground font-medium mb-2 text-[12px]">
											Latitude & Longitude
										</label>
										<Input
											name="li_latlng"
											value={formData.li_latlng || ""}
											onChange={(e) => handleChange(e, setFormData)}
											placeholder="e.g., 14.9545, 120.8962"
											className="bg-card border-border text-foreground h-9"
											style={{ fontSize: "12px" }}
											disabled={!isEditing}
										/>
									</div>
									{isAllowed && (
										<div className="flex items-end">
											<Button
												type="button"
												className="w-full bg-red-600 hover:bg-red-700 text-white h-9 text-[12px] flex items-center gap-2"
												onClick={() => setShowPinModal(true)}
												disabled={!isEditing}
											>
												<FiMapPin className="w-4 h-4" /> Pin Address
											</Button>
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-card border-border transition-colors duration-300 h-fit">
						<CardHeader className="pb-4">
							<CardTitle className="text-foreground flex items-center gap-2 text-[16px]">
								<FiImage className="w-4 h-4" />
								Cover Image
							</CardTitle>
							<p className="text-muted-foreground text-[12px]">
								Take a look at the library’s cover image.
							</p>
						</CardHeader>
						<CardContent className="pt-0 space-y-6">
							<label
								htmlFor={isAllowed ? "cover-image-upload" : ""}
								className="border-2 border-dashed border-border rounded-lg text-center transition-colors cursor-pointer block"
							>
								<input
									type="file"
									accept="image/jpeg,image/png"
									name="li_photoURL"
									className="hidden"
									onChange={(e) => handleChange(e, setFormData)}
									id="cover-image-upload"
								/>
								{formData.li_photoURL ? (
									<div className="w-full h-[250px] bg-muted/30 rounded-md flex items-center justify-center overflow-hidden">
										<img
											src={
												formData.li_photoURL instanceof File
													? URL.createObjectURL(formData.li_photoURL)
													: formData.li_photoURL
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

							{isAllowed && (
								<>
									<div className="flex justify-end gap-4">
										{isEditing ? (
											<>
												<Button
													type="submit"
													className="bg-primary-custom hover:bg-secondary-custom text-white h-11 w-fit text-[12px]"
													onClick={handleSave}
												>
													<LoadingSpinner loading={btnLoading} />
													Update Library
												</Button>
												<Button
													type="button"
													variant="outline"
													className="bg-transparent hover:bg-accent text-foreground h-11 w-fit text-[12px]"
													onClick={() => setIsEditing(false)}
												>
													Cancel
												</Button>
											</>
										) : (
											<Button
												type="button"
												className="w-fit bg-primary-custom hover:bg-secondary-custom text-white h-11 text-[12px]"
												onClick={() => setIsEditing(true)}
											>
												Edit Details
											</Button>
										)}
									</div>

									<div
										className="space-y-4 border-t pt-6"
										style={{ marginTop: "50px" }}
									>
										<div className="flex items-start gap-3">
											<div
												className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
													formData.li_status === "Active"
														? "bg-red-50"
														: "bg-green-50"
												}`}
											>
												{formData.li_status === "Active" ? (
													<FiTrash2 className="w-4 h-4 text-red-500" />
												) : (
													<IoMdCheckmarkCircleOutline className="w-4 h-4 text-green-500" />
												)}
											</div>
											<div className="flex-1">
												<h2 className="font-semibold text-foreground text-[16px]">
													{formData.li_status === "Active"
														? "Deactivate Material"
														: "Activate Material"}
												</h2>
												<p className="text-muted-foreground leading-relaxed text-[12px]">
													{formData.co_status === "Active"
														? "This will remove the material from search results and circulation. The material can be reactivated later by an administrator."
														: "This will restore the material to be available again in search results and circulation."}
												</p>
											</div>
										</div>

										<div className="pt-2  border-border">
											<Button
												type="button"
												variant="outline"
												onClick={() => setShowDeactivateModal(true)}
												className={`w-full h-9 transition-colors text-[12px] ${
													formData.li_status === "Active"
														? "border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
														: "border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
												}`}
											>
												{formData.li_status === "Active" ? (
													<FiTrash2 className="w-4 h-4 mr-2" />
												) : (
													<IoMdCheckmarkCircleOutline className="w-4 h-4 mr-2" />
												)}
												{formData.li_status === "Active"
													? "Deactivate Material"
													: "Activate Material"}
											</Button>
										</div>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</div>

				{isAllowed && (
					<>
						<DeactivateResourceModal
							isOpen={showDeactivateModal}
							onClose={() => setShowDeactivateModal(false)}
							resourceType="library"
							resourceId={formData.id}
							resourceTitle={formData.li_name || "Untitled Library"}
							resourceStatus={formData.li_status}
							resourceQr={formData.li_qr}
						/>

						<PinLocation
							isOpen={showPinModal}
							onClose={setShowPinModal}
							setFormData={setFormData}
						/>
					</>
				)}
			</main>
		</div>
	);
}
