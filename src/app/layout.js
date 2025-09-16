import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Startup Pitch Showcase",
  description: "A platform where founders submit pitches and reviewers rate them",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-gray-50 dark:bg-slate-900`}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
