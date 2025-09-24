"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiMail, FiLock } from "react-icons/fi";
import { ArrowLeft } from "lucide-react";

import { useRouter } from "next/navigation";

import { useUserAuth } from "@/contexts/UserContextAuth";
import { useAlertActions } from "@/contexts/AlertContext";
import { LoadingSpinner } from "@/components/loading";
import { handleLogin } from "@/controller/auth/login";

export default function LoginPage() {
	const router = useRouter();
	const Alert = useAlertActions();
	const { setHasTriggered } = useUserAuth();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false,
	});

	const [btnLoading, setBtnlaoding] = useState(false);

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		handleLogin(formData, setBtnlaoding, Alert, setHasTriggered);
		setFormData({ email: "", password: "" });
	};

	return (
		<div className="min-h-screen bg-background  duration-300 ">
			<main className="p-6 sm:pt-20 pb-6 px-6 sm:px-6 md:px-16 lg:px-[100px] xl:px-[150px]">
				{/* Back to Welcome Button */}

				<div className="mb-8">
					<button
						onClick={() => router.push("/")}
						className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit text-[12px]"
					>
						<ArrowLeft className="w-3 h-3" />
						Back to Welcome Page
					</button>
				</div>

				<Card className="overflow-hidden border-0 shadow-none mt-28">
					<CardContent className="p-0 flex items-center justify-center ">
						<div className="flex items-center justify-center  w-full max-w-[380px] p-0">
							<div className="w-full">
								<div className="text-center mb-8 ">
									<h1 className=" text-[24px] font-bold text-foreground ">
										Welcome back
									</h1>
									<p className="text-muted-foreground text-[15px]">
										Please enter your details to sign in
									</p>
								</div>

								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="space-y-2">
										<Label
											htmlFor="email"
											className="text-sm font-medium text-foreground text-[13px]"
										>
											Email
										</Label>
										<div className="relative">
											<FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
											<Input
												id="email"
												type="email"
												placeholder="Enter your email"
												value={formData.email}
												onChange={(e) =>
													handleInputChange("email", e.target.value)
												}
												className="pl-10 pr-5 h-11 border-border focus:border-primary-custom"
												style={{ fontSize: "13px" }}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label
											htmlFor="password"
											className="text-sm font-medium text-foreground  text-[14px]"
										>
											Password
										</Label>
										<div className="relative">
											<FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
											<Input
												id="password"
												type="password"
												placeholder="Enter your password"
												value={formData.password}
												onChange={(e) =>
													handleInputChange("password", e.target.value)
												}
												className="pl-10 pr-5 h-11 border-border focus:border-primary-custom"
												style={{ fontSize: "13px" }}
											/>
										</div>
									</div>

									<Button
										type="submit"
										className="w-full h-11 text-white  bg-primary-custom hover:bg-secondary-custom transition-colors  text-[13px]"
									>
										<LoadingSpinner loading={btnLoading} />
										Sign In
									</Button>
								</form>
							</div>
						</div>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
