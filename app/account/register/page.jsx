"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiImage, FiArrowLeft, FiUpload } from "react-icons/fi";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import ProtectedRoute from "@/contexts/ProtectedRoute";

import { handleChange } from "../../../controller/custom/customFunction";
import { LoadingSpinner } from "@/components/loading";

import { insertUser } from "@/controller/firebase/insert/insertUser";
import {
	getProgramRealtime,
	getSchoolRealtime,
} from "../../../controller/firebase/get/getAcademic";
import {
	fetchProvinces,
	fetchCitiesOrMunicipalities,
	fetchBarangays,
} from "@/controller/custom/address";

import { ProgramSchoolModal } from "@/components/modal/academic-modal";

const defaultValue = {
	us_type: "",
	us_schoolID: "",
	us_status: "Active",
	us_fname: "",
	us_mname: "",
	us_lname: "",
	us_suffix: "",
	us_sex: "",
	us_birthday: "",
	us_email: "",
	us_phoneNumber: "",
	us_street: "",
	us_barangay: "",
	us_municipal: "",
	us_province: "",
	us_year: "",
	us_program: "",
	us_school: "",
	us_photoURL: "",
};

export default function RegisterAccount() {
	const { userDetails } = useUserAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const id = searchParams.get("id");
	const type = searchParams.get("type");

	const Alert = useAlertActions();
	const [btnLoading, setBtnLoading] = useState(false);
	const [formData, setFormData] = useState(defaultValue);

	const [acadType, setAcadType] = useState("Program");
	const [program, setProgram] = useState([]);
	const [school, setSchool] = useState([]);
	const [provinces, setProvinces] = useState([]);
	const [municipals, setMunicipals] = useState([]);
	const [barangays, setBarangays] = useState([]);

	//MODAL
	const [showAcademicModal, setShowAcademicModal] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!id || !userDetails?.uid || !type) return;
		await insertUser(id, userDetails?.uid, formData, setBtnLoading, Alert);
		setFormData(defaultValue);
	};

	const handleCancel = () => {
		router.back();
	};

	useEffect(() => {
		fetchProvinces(setProvinces);

		let unsubscribeProgram;
		let unsubscribeSchool;

		if (id && type === "patron") {
			unsubscribeProgram = getProgramRealtime(id, setProgram, Alert);
			unsubscribeSchool = getSchoolRealtime(id, setSchool, Alert);
		}

		return () => {
			if (unsubscribeProgram) unsubscribeProgram();
			if (unsubscribeSchool) unsubscribeSchool();
		};
	}, [id]);

	useEffect(() => {
		if (formData?.us_province) {
			const provinceCode = formData?.us_province.split("|")[0];
			fetchCitiesOrMunicipalities(provinceCode, setMunicipals);
			setFormData((prev) => ({
				...prev,
				us_municipal: "",
				us_barangay: "",
			}));
		}
	}, [formData?.us_province]);

	useEffect(() => {
		if (formData?.us_municipal) {
			const municipalCode = formData?.us_municipal.split("|")[0];
			fetchBarangays(municipalCode).then((barangayList) => {
				setBarangays(barangayList);
				setFormData((prev) => ({
					...prev,
					us_barangay: "",
				}));
			});
		}
	}, [formData?.us_municipal]);

	return (
		<ProtectedRoute allowedRoles={["USR-1"]}>
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
							Register Account
						</h1>
						<p className="text-muted-foreground text-[14px]">
							Add a new user account to the system with complete personal
							information
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-14 animate-slide-up-delay-1">
							<Card className="bg-card border-border transition-colors duration-300">
								<CardContent className="p-6">
									<h2 className="font-semibold text-foreground text-[16px] mb-[5px]">
										Account Information
									</h2>
									<p className="text-muted-foreground text-[12px] mb-4">
										Complete the form below to add a new user account.
									</p>

									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-foreground font-medium mb-2 text-[12px]">
													User Type
												</label>
												<select
													name="us_type"
													value={formData?.us_type || ""}
													onChange={(e) => handleChange(e, setFormData)}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9"
													style={{ fontSize: "12px" }}
													required
												>
													<option value="">Select User Type</option>
													{type && type === "patron" && (
														<optgroup label="Patrons">
															<option value="Student">Student</option>
															<option value="Faculty">Faculty</option>
															<option value="Administrator">
																Administrator
															</option>
														</optgroup>
													)}{" "}
													{type && type === "personnel" && (
														<>
															<optgroup label="Assistants">
																<option value="Student Assistant">
																	Student Assistant
																</option>
																<option value="Administrative Assistant">
																	Administrative Assistant
																</option>
															</optgroup>
															<optgroup label="Librarians">
																<option value="Chief Librarian">
																	Chief Librarian
																</option>
																<option value="Head Librarian">
																	Head Librarian
																</option>
															</optgroup>
														</>
													)}
												</select>
											</div>
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
												/>
											</div>
										</div>

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
											/>
										</div>

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
											/>
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
												>
													<option value="">Select</option>
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
													max={
														new Date(
															new Date().setFullYear(
																new Date().getFullYear() - 16
															)
														)
															.toISOString()
															.split("T")[0]
													}
												/>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-4 ">
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
													pattern="^\+639\d{9}$"
													title="Enter a valid Philippine mobile number (e.g., +639123456789)"
												/>
											</div>
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
												/>
											</div>
										</div>

										{type && type == "patron" && (
											<div className="pt-8">
												<h2 className="font-semibold text-foreground text-[16px] mb-[5px]">
													Academic
												</h2>
												<p className="text-muted-foreground text-[12px] mb-4">
													Provide province, municipality, and barangay for
													accurate location data.
												</p>

												<div className="space-y-4">
													<div className="grid grid-cols-2 gap-4">
														<div>
															<label className="block text-foreground font-medium mb-2 text-[12px]">
																Section
															</label>
															<Input
																name="us_section"
																value={formData?.us_section || ""}
																onChange={(e) => handleChange(e, setFormData)}
																placeholder="Enter section"
																className="bg-card border-border text-foreground h-9"
																style={{ fontSize: "12px" }}
																required
															/>
														</div>
														<div>
															<label className="block text-foreground font-medium mb-2 text-[12px]">
																Year
															</label>
															<select
																name="us_year"
																value={formData?.us_year}
																onChange={(e) => handleChange(e, setFormData)}
																className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 text-[12px]"
																required
															>
																<option value="">Select Year</option>
																{["1st", "2nd", "3rd", "4th"].map(
																	(ye, index) => (
																		<option key={index} value={ye}>
																			{ye}
																		</option>
																	)
																)}
															</select>
														</div>
													</div>

													<div className="grid grid-cols-2 gap-4">
														<div>
															<label className="block text-foreground font-medium mb-2 text-[12px]">
																Program
																<button
																	type="button"
																	onClick={() => {
																		setAcadType("program");
																		setShowAcademicModal(true);
																	}}
																	className="text-primary-custom hover:underline transition-colors ml-2 text-[12px]"
																>
																	Register Program
																</button>
															</label>
															<select
																name="us_program"
																value={formData?.us_program}
																onChange={(e) => handleChange(e, setFormData)}
																className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2  h-9 text-[12px]"
																required
															>
																<option value="">Select Program</option>
																{program.map((pr) => (
																	<option key={pr.id} value={pr.id}>
																		{pr.pr_name}
																	</option>
																))}
															</select>
														</div>

														<div>
															<label className="block text-foreground font-medium mb-2 text-[12px]">
																School
																<button
																	type="button"
																	onClick={() => {
																		setAcadType("school");
																		setShowAcademicModal(true);
																	}}
																	className="text-primary-custom hover:underline transition-colors ml-2 text-[12px]"
																>
																	Register School
																</button>
															</label>
															<select
																name="us_school"
																value={formData?.us_school}
																onChange={(e) => handleChange(e, setFormData)}
																className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2  h-9 text-[12px]"
																required
															>
																<option value="">Select School</option>
																{school.map((sc) => (
																	<option key={sc.id} value={sc.id}>
																		{sc.sc_name}
																	</option>
																))}
															</select>
														</div>
													</div>
												</div>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							<Card className="bg-card border-border transition-colors duration-300 h-fit">
								<CardHeader className="pb-4">
									<CardTitle className="text-foreground flex items-center gap-2 text-[16px]">
										<FiImage className="w-4 h-4" />
										Profile Picture
									</CardTitle>
									<p className="text-muted-foreground text-[12px]">
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
										/>
										{formData?.us_photoURL ? (
											<img
												src={
													formData?.us_photoURL instanceof File
														? URL.createObjectURL(formData?.us_photoURL)
														: formData?.us_photoURL
												}
												alt="Profile preview"
												className="w-full h-full object-cover rounded-full"
											/>
										) : (
											<div className="space-y-1 text-center">
												<FiUpload className="w-5 h-5 mx-auto text-muted-foreground" />
												<p className="text-muted-foreground text-[11px]">
													Click to upload
												</p>
											</div>
										)}
									</label>

									<div className="mb-6">
										<h2 className="font-semibold text-foreground text-[16px] mb-[5px]">
											Address
										</h2>
										<p className="text-muted-foreground text-[12px] mb-4">
											Provide province, municipality, and barangay for accurate
											location data.
										</p>

										<div className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="block text-foreground font-medium mb-2 text-[12px]">
														Street
													</label>
													<Input
														name="us_street"
														value={formData?.us_street || ""}
														onChange={(e) => handleChange(e, setFormData)}
														placeholder="e.g., 123 Sampaguita St."
														className="bg-card border-border text-foreground h-9"
														style={{ fontSize: "12px" }}
														required
													/>
												</div>

												<select
													name="us_province"
													value={formData?.us_province}
													onChange={(e) => handleChange(e, setFormData)}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2  h-9 mt-6 text-[12px]"
													required
												>
													<option value="">Select Province</option>
													{provinces.map((p) => (
														<option key={p.code} value={`${p.code}|${p.name}`}>
															{p.name}
														</option>
													))}
												</select>

												<select
													name="us_municipal"
													value={formData?.us_municipal}
													onChange={(e) => handleChange(e, setFormData)}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 text-[12px]"
													required
												>
													<option value="">Select Municipality</option>
													{municipals.map((m) => (
														<option key={m.code} value={`${m.code}|${m.name}`}>
															{m.name}
														</option>
													))}
												</select>
												<select
													name="us_barangay"
													value={formData?.us_barangay}
													onChange={(e) => handleChange(e, setFormData)}
													className="w-full border border-border bg-card text-foreground rounded-md px-3 py-2 h-9 text-[12px]"
													required
												>
													<option value="">Select Barangay</option>
													{barangays.map((b) => (
														<option key={b.code} value={`${b.code}|${b.name}`}>
															{b.name}
														</option>
													))}
												</select>
											</div>
										</div>
									</div>

									<div className="flex gap-3 justify-end">
										<Button
											type="submit"
											className="bg-primary-custom hover:bg-secondary-custom text-white h-11 w-fit text-[12px]"
										>
											<LoadingSpinner loading={btnLoading} />
											Register Account
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={handleCancel}
											className="bg-transparent hover:bg-accent text-foreground h-11 w-fit text-[12px]"
										>
											Cancel
										</Button>
									</div>
								</CardContent>
							</Card>
						</div>
					</form>
				</main>
				<ProgramSchoolModal
					isOpen={showAcademicModal}
					onClose={() => setShowAcademicModal(false)}
					li_id={id}
					records={acadType == "program" ? program : school}
					type={acadType}
				/>
			</div>
		</ProtectedRoute>
	);
}
