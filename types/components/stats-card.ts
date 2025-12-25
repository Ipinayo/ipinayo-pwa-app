import { LucideIcon } from "lucide-react";

export interface Metric {
    title: string;
    value: number;
    icon: LucideIcon;
    description?: string;
    href?: string;
    color?: string;
}