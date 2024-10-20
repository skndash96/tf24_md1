import type { Metadata } from "next";
import Header from "../components/Header";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="">
                <div className="h-screen flex flex-col">
                    <Header />
                    {children}
                </div>
            </body>
        </html>
    );
}
