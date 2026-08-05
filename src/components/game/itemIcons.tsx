import {
  Axe,
  CloudFog,
  HeartPulse,
  Lock,
  MessageCircle,
  ScanEye,
  Search,
  Shuffle,
  Syringe,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { ItemId } from "@/lib/game/types";

export const ITEM_ICONS: Record<ItemId, LucideIcon> = {
  loupe: Search,
  irons: Lock,
  hacksaw: Axe,
  flask: Wine,
  adrenal_shot: Syringe,
  marked_bullet: Shuffle,
  counterfeit_chip: ScanEye,
  smoke_bomb: CloudFog,
  silver_tongue: MessageCircle,
  second_wind: HeartPulse,
};
