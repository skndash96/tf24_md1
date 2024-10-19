import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
    title: "MD1"
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <div className="h-screen flex flex-col">
                    <Toaster />
                    <Header />
                    {children}
                </div>
            </body>
        </html>
    );
}
