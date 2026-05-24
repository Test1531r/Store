import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'EGP'): string {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateOnly(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}${month}${day}-${random}`
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const paymentMethodLabels: Record<string, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  VODAFONE_CASH: 'Vodafone Cash',
  INSTAPAY: 'InstaPay',
  STC_PAY: 'STC Pay',
  BANK_TRANSFER: 'Bank Transfer',
  CREDIT: 'Credit',
  MIXED: 'Mixed',
}

export const repairStatusLabels: Record<string, { label: string; color: string }> = {
  RECEIVED: { label: 'Received', color: 'bg-blue-500' },
  DIAGNOSING: { label: 'Diagnosing', color: 'bg-yellow-500' },
  WAITING_PARTS: { label: 'Waiting Parts', color: 'bg-orange-500' },
  UNDER_REPAIR: { label: 'Under Repair', color: 'bg-purple-500' },
  COMPLETED: { label: 'Completed', color: 'bg-green-500' },
  DELIVERED: { label: 'Delivered', color: 'bg-gray-500' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500' },
}

export const transferStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-500' },
  APPROVED: { label: 'Approved', color: 'bg-blue-500' },
  IN_TRANSIT: { label: 'In Transit', color: 'bg-purple-500' },
  RECEIVED: { label: 'Received', color: 'bg-green-500' },
  REJECTED: { label: 'Rejected', color: 'bg-red-500' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-500' },
}
