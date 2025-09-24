import "./globals.css";
import ClientLayout from "./clientLayout";

export const metadata = {
	generator: "LACUNANAN.dev",
	title: "LRC Connect",
	icons: {
		icon: "/logo.png",
	},
};

export default function RootLayout({ children }) {
	return <ClientLayout>{children}</ClientLayout>;
}
