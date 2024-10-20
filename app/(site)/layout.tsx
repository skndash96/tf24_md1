import type { Metadata } from "next";
import Header from "../components/Header";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="h-screen flex flex-col">
            <Toaster />
            <Header />
            {children}
        </div>
    );
}
