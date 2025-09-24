import { Geist_Mono, Pattaya, Playfair_Display, Source_Sans_3 } from "next/font/google";

export const pattaya = Pattaya({
  variable: "--font-pattaya",
  subsets: ["latin"],
  weight: "400",
  display: 'swap'
});

export const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  display: 'swap'
});

export const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: 'swap'
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
