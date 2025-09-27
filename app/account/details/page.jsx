"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiArrowLeft, FiImage, FiUpload } from "react-icons/fi";
import { ExternalLink } from "lucide-react";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { useLoading } from "@/contexts/LoadingProvider";
import { CodeModal } from "@/components/modal/code-modal";
import { handleChange } from "@/controller/custom/customFunction";
import { LoadingSpinner } from "@/components/loading";

import {
	fetchProvinces,
	fetchCitiesOrMunicipalities,
	fetchBarangays,
} from "@/controller/custom/address";
import { getUser } from "../../../controller/firebase/get/getUser";
import {
	updateUser,
	updateAcademic,
	updateAddress,
} from "@/controller/firebase/update/updateUser";

export default function AccountDetails() {
	const router = useRouter();
	const { userDetails } = useUserAuth();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");

	const Alert = useAlertActions();
	const { setLoading, setPath } = useLoading();
	const [btnLoading, setBtnloading] = useState(false);

	const superadmin = userDetails && userDetails?.us_level == "USR-1";
	const [isCodeOpen, setCodeOpen] = useState(false);
	const [editMode, setEditMode] = useState("");

	const [formData, setFormData] = useState({});
	const [academicData, setAcademicData] = useState({});
	const [addressData, setAddressData] = useState({});
	const [associatedLibraries, setAssociatedLibraries] = useState([]);
	const [provinces, setProvinces] = useState([]);
	const [municipals, setMunicipals] = useState([]);
	const [barangays, setBarangays] = useState([]);

	const handleSubmitDetails = async (e) => {
		e.preventDefault();
		if (!userDetails || !userDetails?.uid) return;
		await updateUser(
			associatedLibraries,
			userDetails?.uid,
			id,
			formData,
			setBtnloading,
			Alert
		);
		setEditMode("");
	};

	const handleSubmitAcademic = async (e) => {
		e.preventDefault();
		if (!userDetails || !userDetails?.uid) return;
		await updateAcademic(
			associatedLibraries,
			userDetails?.uid,
			id,
			`${formData?.us_fname}  ${formData?.us_mname} ${formData?.us_lname}`,
			academicData,
			setBtnloading,
			Alert
		);
		setEditMode("");
	};

	const handleSubmitAddress = async (e) => {
		e.preventDefault();
		if (!userDetails || !userDetails?.uid) return;
		await updateAddress(
			associatedLibraries,
			userDetails?.uid,
			id,
			`${formData?.us_fname}  ${formData?.us_mname} ${formData?.us_lname}`,
			addressData,
			setBtnloading,
			Alert
		);
		setEditMode("");
	};

	useEffect(() => {
		setPath(pathname);
		if (id) {
			const unsubscribe = getUser(
				id,
				true,
				setFormData,
				setAcademicData,
				setAddressData,
				setAssociatedLibraries,
				setLoading,
				Alert
			);
			return () => unsubscribe && unsubscribe();
		}
	}, [id, pathname]);

	useEffect(() => {
		fetchProvinces(setProvinces);
	}, []);

	useEffect(() => {
		if (addressData.us_province && addressData.us_province.includes("|")) {
			const provinceCode = addressData.us_province.split("|")[0];
			fetchCitiesOrMunicipalities(provinceCode, setMunicipals);
			setAddressData((prev) => ({
				...prev,
				us_municipal: "",
				us_barangay: "",
			}));
		}
	}, [addressData.us_province]);

	useEffect(() => {
		if (addressData.us_municipal && addressData.us_municipal.includes("|")) {
			const municipalCode = addressData.us_municipal.split("|")[0];
			fetchBarangays(municipalCode).then((barangayList) => {
				setBarangays(barangayList);
				setAcademicData((prev) => ({
					...prev,
					us_barangay: "",
				}));
			});
		}
	}, [addressData.us_municipal]);

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

				<div className="mb-8 animate-slide-up">
					<h1 className="font-semibold text-foreground text-[20px]">
						Account Details
					</h1>
					<p className="text-muted-foreground text-[14px]">
						Edit and manage user account information and settings
					</p>
				</div>

				<Tabs
					defaultValue="details"
					className="w-full animate-slide-up-delay-1"
				>
					<TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
						<TabsTrigger value="details" className="text-[12px]">
							Details
						</TabsTrigger>
						<TabsTrigger value="Academic & Address" className="text-[12px]">
							{["USR-6", "USR-5"].includes(formData?.us_level)
								? "Academic & Address"
								: "Address"}
						</TabsTrigger>
					</TabsList>

					<TabsContent value="details">
						<form onSubmit={handleSubmitDetails}>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-14 animate-slide-up-delay-2">
								<Card className="h-fit bg-card border-border transition-colors duration-300">
									<CardContent className="p-6">
										<h2 className="font-semibold text-foreground text-[16px] mb-2">
											Basic Information
										</h2>
										<p className="text-muted-foreground text-[12px] mb-4">
											View the personal details associated with this account.
										</p>

										<div className="space-y-4">
											<div>
												<label className="block text-foreground font-medium mb-2 text-[12px]">
													School ID
												</label>
												<Input
													name="us_schoolID"
													value={formData?.us_schoolID || ""}
													onChange={(e) => handleChange(e, setFormData)}
													placeholder="Enter school ID"
													className="bg-card border-border text-foreground h-9"
													style={{ fontSize: "12px" }}
													required
													disabled={editMode == ""}
												/>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-foreground font-medium mb-2 text-[12px]">
														First name
													</label>
													<Input
														name="us_fname"
														value={formData?.us_fname || ""}
														onChange={(e) => handleChange(e, setFormData)}
														placeholder="Enter your first name"
														className="bg-card border-border text-foreground h-9"
														style={{ fontSize: "12px" }}
														required
														disabled={editMode == ""}
													/>
												</div>

												<div>
													<label className="block text-foreground font-medium mb-2 text-[12px]">
														Middle name
													</label>
													<Input
														name="us_mname"
														value={formData?.us_mname || ""}
														onChange={(e) => handleChange(e, setFormData)}
														placeholder="Enter your middle name"
														className="bg-card border-border text-foreground h-9"
														style={{ fontSize: "12px" }}
														required
														disabled={editMode == ""}
													/>
												</div>
											</div>
											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-foreground font-medium mb-2 text-[12px]">
														Last name
													</label>
													<Input
														name="us_lname"
														value={formData?.us_lname || ""}
														onChange={(e) => handleChange(e, setFormData)}
														placeholder="Enter your last name"
														className="bg-card border-border text-foreground h-9"
														style={{ fontSize: "12px" }}
														required
														disabled={editMode == ""}
													/>
												</div>

												<div>
													<label className="block text-foreground font-medium mb-2 text-[12px]">
														Suffix
													</label>
													<Input
														name="us_suffix"
														value={formData?.us_suffix || ""}
														onChange={(e) => handleChange(e, setFormData)}
														placeholder="Jr., Sr., III (optional)"
														className="bg-card border-border text-foreground h-9"
														style={{ fontSize: "12px" }}
														disabled={editMode == ""}
													/>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-foreground font-medium mb-2 text-[12px]">
														Sex
													</label>
													<select
														name="us_sex"
														value={formData?.us_sex || ""}
														onChange={(e) => handleChange(e, setFormData)}
														className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 text-[12px]"
														required
														disabled={editMode == ""}
													>
														<option value="Male">Male</option>
														<option value="Female">Female</option>
													</select>
												</div>
												<div>
													<label className="block text-foreground font-medium mb-2 text-[12px]">
														Birthday
													</label>
													<Input
														name="us_birthday"
														type="date"
														value={formData?.us_birthday || ""}
														onChange={(e) => handleChange(e, setFormData)}
														className="bg-card border-border text-foreground h-9"
														style={{ fontSize: "12px" }}
														required
														disabled={editMode == ""}
													/>
												</div>
											</div>

											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-foreground font-medium mb-2 text-[12px]">
														Email
													</label>
													<Input
														name="us_email"
														type="email"
														value={formData?.us_email || ""}
														onChange={(e) => handleChange(e, setFormData)}
														placeholder="@gmail.com"
														className="bg-card border-border text-foreground h-9"
														style={{ fontSize: "12px" }}
														required
														disabled={editMode == ""}
													/>
												</div>
												<div>
													<label className="block text-foreground font-medium mb-2 text-[12px]">
														Phone Number
													</label>
													<Input
														name="us_phoneNumber"
														value={formData?.us_phoneNumber || ""}
														onChange={(e) => handleChange(e, setFormData)}
														placeholder="+639xxxxxxxxx"
														className="bg-card border-border text-foreground h-9"
														style={{ fontSize: "12px" }}
														required
														pattern="^\+639\d{9}$"
														title="Enter a valid Philippine mobile number (e.g., +639123456789)"
														disabled={editMode == ""}
													/>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="bg-card border-border transition-colors duration-300 h-fit">
									<CardHeader className="pb-4">
										<CardTitle className="text-foreground flex items-center gap-2 text-[16px] m">
											<FiImage className="w-4 h-4" />
											Profile Picture
										</CardTitle>
										<p className="text-muted-foreground text-[12px] mb-4">
											Note: Format photos SVG, PNG, or JPG Max size 2mb
										</p>
									</CardHeader>
									<CardContent className="pt-0 space-y-6">
										<label
											htmlFor="cover-image-upload"
											className="w-[200px] h-[200px] mx-auto border-2 border-dashed border-border rounded-full text-center transition-colors cursor-pointer flex items-center justify-center overflow-hidden bg-muted/30"
										>
											<input
												type="file"
												accept="image/jpeg,image/png"
												name="us_photoURL"
												className="hidden"
												onChange={(e) => handleChange(e, setFormData)}
												id="cover-image-upload"
												disabled={editMode == ""}
											/>
											{formData?.us_photoURL ? (
												<div className="w-full h-[250px] bg-muted/30 rounded-md flex items-center justify-center overflow-hidden">
													<img
														src={
															formData?.us_photoURL instanceof File
																? URL.createObjectURL(formData?.us_photoURL)
																: formData?.us_photoURL
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

										<div className="flex gap-3 justify-end mt-8">
											{editMode != "basicinfo" && superadmin && (
												<Button
													type="button"
													className="w-fit bg-primary-custom hover:bg-secondary-custom text-white h-11 text-[12px]"
													onClick={() => {
														setEditMode("basicinfo");
													}}
												>
													Edit Details
												</Button>
											)}

											{editMode === "basicinfo" && (
												<>
													<Button
														className="w-fit bg-primary-custom hover:bg-secondary-custom text-white h-11 text-[12px]"
														onClick={() => {}}
													>
														<LoadingSpinner loading={btnLoading} />
														Save Changes
													</Button>

													<Button
														variant="outline"
														onClick={() => setEditMode("")}
														className="w-fit border-border text-foreground hover:bg-accent h-11 text-[12px]"
													>
														Cancel
													</Button>
												</>
											)}
										</div>

										{associatedLibraries?.length > 0 &&
											formData?.us_level != "USR-1" && (
												<div className="mt-8">
													<div className="flex items-center justify-between">
														<h2 className="font-semibold text-foreground text-[16px] mb-2">
															Associated{" "}
															{associatedLibraries?.length === 1
																? "Library"
																: "Libraries"}
														</h2>
													</div>
													<p className="text-muted-foreground text-[12px] mb-4">
														{associatedLibraries?.length === 1
															? "View the library this account is linked with, including its type."
															: "View the list of libraries this account is linked with, including their type."}
													</p>

													<div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
														{associatedLibraries?.map((library, index) => (
															<div
																key={index}
																className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30"
															>
																<div className="flex items-start gap-3 w-full">
																	<div className="w-[120px] h-[80px] bg-muted rounded-sm flex items-center justify-center overflow-hidden">
																		{library?.li_photoURL ? (
																			<img
																				src={library?.li_photoURL}
																				alt={library?.li_name}
																				className="w-full h-full object-cover rounded-md"
																			/>
																		) : (
																			<FiImage className="w-4 h-4 text-muted-foreground" />
																		)}
																	</div>

																	<div className="flex flex-col justify-between flex-1">
																		<div>
																			<p className="font-medium text-foreground text-[14px]">
																				{library?.li_name || ""}
																			</p>
																			<p className="text-primary-custom text-[12px]">
																				Type: {library?.us_type || ""}
																			</p>
																		</div>

																		<div className="flex items-center gap-1 mt-2">
																			<Button
																				type="button"
																				variant="ghost"
																				size="sm"
																				className="hover:bg-accent h-7 w-7 p-0"
																				title="View Library Details"
																				onClick={() =>
																					router.push(
																						`/library/details?id=${library?.id}`
																					)
																				}
																			>
																				<ExternalLink className="w-3 h-3" />
																			</Button>
																		</div>
																	</div>
																</div>
															</div>
														))}
													</div>
												</div>
											)}
									</CardContent>
								</Card>
							</div>
						</form>
					</TabsContent>

					<TabsContent value="Academic & Address">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-14 animate-slide-up-delay-2">
							{["USR-6", "USR-5"].includes(formData?.us_level) && (
								<form onSubmit={handleSubmitAcademic}>
									<Card className="bg-card border-border transition-colors duration-300 max-w-full animate-slide-up-delay-2">
										<CardContent className="p-6">
											<h2 className="font-semibold text-foreground text-[16px] mb-2">
												Academic
											</h2>
											<p className="text-muted-foreground text-[12px] mb-4">
												Includes section, year level, and program information.
											</p>

											<div className="space-y-4">
												<div className="grid grid-cols-2 gap-4">
													<div>
														<label className="block text-foreground font-medium mb-2 text-[12px]">
															Section
														</label>
														<Input
															name="us_section"
															value={academicData?.us_section || ""}
															onChange={(e) => handleChange(e, setAcademicData)}
															placeholder="ITE 222"
															className="bg-card border-border text-foreground h-9"
															style={{ fontSize: "12px" }}
															required
															disabled={editMode == ""}
														/>
													</div>
													<div>
														<label className="block text-foreground font-medium mb-2 text-[12px]">
															Year
														</label>
														<Input
															name="us_year"
															value={academicData?.us_year || ""}
															onChange={(e) => handleChange(e, setAcademicData)}
															placeholder="1st year"
															className="bg-card border-border text-foreground h-9"
															style={{ fontSize: "12px" }}
															required
															disabled={editMode == ""}
														/>
													</div>

													<div>
														<label className="block text-foreground font-medium mb-2 text-[12px]">
															Program
														</label>
														<Input
															name="us_program"
															value={academicData?.us_program || ""}
															onChange={(e) => handleChange(e, setAcademicData)}
															placeholder="BSIT"
															className="bg-card border-border text-foreground h-9"
															style={{ fontSize: "12px" }}
															required
															disabled={editMode == ""}
														/>
													</div>
													<div>
														<label className="block text-foreground font-medium mb-2 text-[12px]">
															School
														</label>
														<Input
															name="us_school"
															value={academicData?.us_school || ""}
															onChange={(e) => handleChange(e, setAcademicData)}
															placeholder="SET"
															className="bg-card border-border text-foreground h-9"
															style={{ fontSize: "12px" }}
															required
															disabled={editMode == ""}
														/>
													</div>
												</div>
											</div>
											{superadmin && (
												<div className="flex gap-3 justify-end mt-8">
													{editMode != "academic" && (
														<Button
															type="button"
															className="w-fit bg-primary-custom hover:bg-secondary-custom text-white h-11 text-[12px]"
															onClick={() => {
																setEditMode("academic");
															}}
														>
															Edit Academic
														</Button>
													)}

													{editMode === "academic" && (
														<>
															<Button
																className="w-fit bg-primary-custom hover:bg-secondary-custom text-white h-11 text-[12px]"
																onClick={() => {}}
															>
																<LoadingSpinner loading={btnLoading} />
																Save Changes
															</Button>

															<Button
																variant="outline"
																onClick={() => setEditMode("")}
																className="w-fit border-border text-foreground hover:bg-accent h-11 text-[12px]"
															>
																Cancel
															</Button>
														</>
													)}
												</div>
											)}
										</CardContent>
									</Card>
								</form>
							)}

							<form onSubmit={handleSubmitAddress}>
								<Card className="bg-card border-border transition-colors duration-300 max-w-full animate-slide-up-delay-2">
									<CardContent className="p-6">
										<h2 className="font-semibold text-foreground text-[16px] mb-2">
											Address
										</h2>
										<p className="text-muted-foreground text-[12px] mb-4">
											Details such as street, barangay, municipal, and province.
										</p>

										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-foreground font-medium mb-2 text-[12px]">
													Street
												</label>
												<Input
													name="us_street"
													value={addressData?.us_street || ""}
													onChange={(e) => handleChange(e, setAddressData)}
													placeholder="Purok 2"
													className="bg-card border-border text-foreground h-9"
													style={{ fontSize: "12px" }}
													required
													disabled={editMode == ""}
												/>
											</div>
											<select
												name="us_province"
												value={addressData?.us_province || ""}
												onChange={(e) => handleChange(e, setAddressData)}
												className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2  h-9 mt-6 text-[12px]"
												required
												disabled={editMode == ""}
											>
												<option value={addressData?.us_province || ""}>
													{extractProvinceName(addressData?.us_province)}
												</option>
												{provinces.map((p) => (
													<option key={p.code} value={`${p.code}|${p.name}`}>
														{p.name}
													</option>
												))}
											</select>

											<select
												name="us_municipal"
												value={addressData?.us_municipal || ""}
												onChange={(e) => handleChange(e, setAddressData)}
												className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 text-[12px]"
												required
												disabled={editMode == ""}
											>
												<option value={addressData?.us_municipal || ""}>
													{extractProvinceName(addressData.us_municipal)}
												</option>
												{municipals.map((m) => (
													<option key={m.code} value={`${m.code}|${m.name}`}>
														{m.name}
													</option>
												))}
											</select>
											<select
												name="us_barangay"
												value={addressData?.us_barangay || ""}
												onChange={(e) => handleChange(e, setAddressData)}
												className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 text-[12px]"
												required
												disabled={editMode == ""}
											>
												<option value={addressData?.us_barangay || ""}>
													{extractProvinceName(addressData.us_barangay)}
												</option>
												{barangays.map((b) => (
													<option key={b.code} value={`${b.code}|${b.name}`}>
														{b.name}
													</option>
												))}
											</select>
										</div>

										{superadmin && (
											<div className="flex gap-3 justify-end mt-8">
												{editMode != "address" && (
													<Button
														type="button"
														className="w-fit bg-primary-custom hover:bg-secondary-custom text-white h-11 text-[12px]"
														onClick={() => {
															setEditMode("address");
														}}
													>
														Edit Address
													</Button>
												)}

												{editMode === "address" && (
													<>
														<Button
															className="w-fit bg-primary-custom hover:bg-secondary-custom text-white h-11 text-[12px]"
															onClick={() => {}}
														>
															<LoadingSpinner loading={btnLoading} />
															Save Changes
														</Button>

														<Button
															variant="outline"
															onClick={() => setEditMode("")}
															className="w-fit border-border text-foreground hover:bg-accent h-9 text-[12px]"
														>
															Cancel
														</Button>
													</>
												)}
											</div>
										)}
									</CardContent>
								</Card>
							</form>
						</div>
					</TabsContent>
				</Tabs>
			</main>

			<CodeModal
				isOpen={isCodeOpen}
				onClose={() => setCodeOpen(false)}
				value={formData?.us_qr}
				showQR={true}
				title={`Patron Code: ${formData?.us_qr}`}
			/>
		</div>
	);
}

export const extractProvinceName = (provinceString) => {
	if (!provinceString) return "";
	return provinceString.includes("|")
		? provinceString.split("|")[1]
		: provinceString;
};
