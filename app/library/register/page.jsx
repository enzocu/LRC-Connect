"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FiImage, FiUpload, FiMapPin } from "react-icons/fi";
import { ArrowLeft } from "lucide-react";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";

import { PinLocation } from "@/components/modal/pinLocation";
import { handleChange } from "@/controller/custom/customFunction";
import { LoadingSpinner } from "@/components/loading";
import { insertLibrary } from "@/controller/firebase/insert/insertLibrary";

const defaultValues = {
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

export default function RegisterLibrary() {
	const router = useRouter();
	const { userDetails } = useUserAuth();
	const Alert = useAlertActions();
	const [btnLoading, setBtnloading] = useState(false);
	const [formData, setFormData] = useState(defaultValues);
	const [showPinModal, setShowPinModal] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();

		if (userDetails && userDetails?.uid) {
			insertLibrary(userDetails?.uid, formData, setBtnloading, Alert);
		}

		setFormData(defaultValues);
	};

	const handleCancel = () => {
		setFormData(defaultValues);
	};

	return (
		<ProtectedRoute allowedRoles={["USR-1"]}>
			<div className="min-h-screen bg-background transition-colors duration-300">
				<Header />

				<main className="pt-28 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
					<div className="mb-6">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-[11px]"
						>
							<ArrowLeft className="w-3 h-3" />
							Back to Library Management
						</button>
					</div>

					<div className="mb-8 animate-slide-up">
						<h1 className="font-semibold text-foreground text-[20px]">
							Register Library
						</h1>
						<p className="text-muted-foreground text-[14px]">
							Add a new library to the system with complete institutional
							information
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-14 animate-slide-up-delay-1">
							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-6">
									<h2 className="font-semibold text-foreground text-[16px]">
										Library Information
									</h2>
									<p className="text-muted-foreground text-[12px] mb-4">
										Please provide complete and accurate details of the library
										and institution to be added to the system.
									</p>

									<div className="space-y-4">
										<div>
											<label className="block text-foreground font-medium mb-2 text-[12px]">
												Library Name
											</label>
											<Input
												name="li_name"
												value={formData?.li_name}
												onChange={(e) => handleChange(e, setFormData)}
												placeholder="Riverdale Public Library"
												className="bg-card border-border text-foreground h-9"
												style={{ fontSize: "12px" }}
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
													value={formData?.li_schoolname}
													onChange={(e) => handleChange(e, setFormData)}
													placeholder="Riverdale University"
													className="bg-card border-border text-foreground h-9"
													style={{ fontSize: "12px" }}
													required
												/>
											</div>
											<div>
												<label className="block text-foreground font-medium mb-2 text-[12px]">
													School ID
												</label>
												<Input
													name="li_schoolID"
													value={formData?.li_schoolID}
													onChange={(e) => handleChange(e, setFormData)}
													placeholder="RU-00123"
													className="bg-card border-border text-foreground h-9"
													style={{ fontSize: "12px" }}
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
													value={formData?.li_email}
													onChange={(e) => handleChange(e, setFormData)}
													placeholder="library@riverdale.edu"
													className="bg-card border-border text-foreground h-9"
													style={{ fontSize: "12px" }}
													required
												/>
											</div>
											<div>
												<label className="block text-foreground font-medium mb-2 text-[12px]">
													Phone Number
												</label>
												<Input
													name="li_phone"
													value={formData?.li_phone}
													onChange={(e) => handleChange(e, setFormData)}
													placeholder="+63917 123 4567"
													className="bg-card border-border text-foreground h-9"
													style={{ fontSize: "12px" }}
													pattern="^\+639\d{2} \d{3} \d{4}$"
													title="Format must be +639XX XXX XXXX"
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
												value={formData?.li_description}
												onChange={(e) => handleChange(e, setFormData)}
												placeholder="A modern academic library serving students and faculty with digital and physical resources."
												rows={3}
												className="bg-card border-border text-foreground"
												style={{ fontSize: "12px" }}
											/>
										</div>

										<div>
											<label className="block text-foreground font-medium mb-2 text-[12px]">
												Address
											</label>
											<Input
												name="li_address"
												value={formData?.li_address || ""}
												onChange={(e) => handleChange(e, setFormData)}
												placeholder="e.g., Purok 2, Sto. Niño, Baliwag"
												className="bg-card border-border text-foreground h-9"
												style={{ fontSize: "12px" }}
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
													value={formData?.li_latlng || ""}
													onChange={(e) => handleChange(e, setFormData)}
													placeholder="e.g., 14.9545, 120.8962"
													className="bg-card border-border text-foreground h-9"
													style={{ fontSize: "12px" }}
												/>
											</div>
											<div className="flex items-end">
												<Button
													type="button"
													className="w-full bg-red-600 hover:bg-red-700 text-white h-9 text-[12px] flex items-center gap-2"
													onClick={() => setShowPinModal(true)}
												>
													<FiMapPin className="w-4 h-4" /> Pin Address
												</Button>
											</div>
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
											name="li_photoURL"
											className="hidden"
											onChange={(e) => handleChange(e, setFormData)}
											id="cover-image-upload"
										/>
										{formData?.li_photoURL ? (
											<div className="w-full h-[250px] bg-muted/30 rounded-md flex items-center justify-center overflow-hidden">
												<img
													src={
														formData?.li_photoURL instanceof File
															? URL.createObjectURL(formData?.li_photoURL)
															: formData?.li_photoURL
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

									<div className="flex justify-end gap-4">
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
										>
											<LoadingSpinner loading={btnLoading} />
											Register Library
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</form>

					<PinLocation
						isOpen={showPinModal}
						onClose={setShowPinModal}
						setFormData={setFormData}
					/>
				</main>
			</div>
		</ProtectedRoute>
	);
}
