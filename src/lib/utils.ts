import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Hilfsfunktion um Referral-Code zu Amazon-Links hinzuzufügen
export function addReferralCode(link: string): string {
  const referralCode = '?tag=50674-21';

  // Prüfen ob bereits ein Referral-Code vorhanden ist
  if (link.includes('tag=50674-21')) {
    return link;
  }

  // Prüfen ob bereits andere Parameter vorhanden sind
  if (link.includes('?')) {
    return link + '&tag=50674-21';
  } else {
    return link + referralCode;
  }
}
