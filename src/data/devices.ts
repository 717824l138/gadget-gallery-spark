import {
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Watch,
  Router,
  Printer,
  ScanLine,
  Projector,
  Tv,
  Camera,
  Plane,
  Gamepad2,
  Speaker,
  Radio,
  type LucideIcon,
} from "lucide-react";

export type DeviceCategory =
  | "Computer"
  | "Mobile"
  | "Networking"
  | "Home Appliance"
  | "Wearable"
  | "Imaging"
  | "Entertainment"
  | "IoT";

export interface Device {
  id: string;
  name: string;
  category: DeviceCategory;
  description: string;
  applications: string[];
  icon: LucideIcon;
}

export const CATEGORIES: DeviceCategory[] = [
  "Computer",
  "Mobile",
  "Networking",
  "Home Appliance",
  "Wearable",
  "Imaging",
  "Entertainment",
  "IoT",
];

export const devices: Device[] = [
  {
    id: "smartphone",
    name: "Smartphone",
    category: "Mobile",
    description: "A handheld personal computer with mobile connectivity, touchscreen, and a rich app ecosystem.",
    applications: ["Communication", "Photography", "Mobile banking", "Navigation", "Entertainment"],
    icon: Smartphone,
  },
  {
    id: "laptop",
    name: "Laptop",
    category: "Computer",
    description: "Portable personal computer combining display, keyboard, and battery in a single clamshell unit.",
    applications: ["Productivity", "Software development", "Remote work", "Education", "Design"],
    icon: Laptop,
  },
  {
    id: "desktop",
    name: "Desktop Computer",
    category: "Computer",
    description: "Stationary high-performance computer designed for sustained workloads at a desk.",
    applications: ["Gaming", "Video editing", "3D rendering", "Office work", "Servers"],
    icon: Monitor,
  },
  {
    id: "tablet",
    name: "Tablet",
    category: "Mobile",
    description: "Slim touchscreen device sitting between a smartphone and a laptop in size and capability.",
    applications: ["Reading", "Sketching", "Note taking", "Streaming", "Field work"],
    icon: Tablet,
  },
  {
    id: "smartwatch",
    name: "Smartwatch",
    category: "Wearable",
    description: "Wrist-worn computer that pairs with a phone to surface notifications and track health metrics.",
    applications: ["Fitness tracking", "Notifications", "Heart-rate monitoring", "Contactless payments"],
    icon: Watch,
  },
  {
    id: "router",
    name: "Wi-Fi Router",
    category: "Networking",
    description: "Networking device that forwards data packets between a local network and the internet.",
    applications: ["Home internet", "Office networks", "Mesh Wi-Fi", "VPN gateways"],
    icon: Router,
  },
  {
    id: "printer",
    name: "Printer",
    category: "Imaging",
    description: "Output device that produces physical copies of digital documents and images.",
    applications: ["Document printing", "Photo printing", "Shipping labels", "Office workflows"],
    icon: Printer,
  },
  {
    id: "scanner",
    name: "Scanner",
    category: "Imaging",
    description: "Input device that converts physical pages and photos into digital files.",
    applications: ["Digitizing documents", "Archiving", "OCR", "Photo preservation"],
    icon: ScanLine,
  },
  {
    id: "projector",
    name: "Projector",
    category: "Entertainment",
    description: "Optical device that projects an image onto a screen or wall at large scale.",
    applications: ["Presentations", "Home theater", "Classrooms", "Events"],
    icon: Projector,
  },
  {
    id: "television",
    name: "Television",
    category: "Entertainment",
    description: "Large display for broadcasting, streaming, and connected smart-TV applications.",
    applications: ["Streaming", "Live sports", "Gaming", "News", "Smart home hub"],
    icon: Tv,
  },
  {
    id: "camera",
    name: "Digital Camera",
    category: "Imaging",
    description: "Dedicated imaging device with interchangeable or fixed lenses and a sensor for high-quality capture.",
    applications: ["Photography", "Videography", "Journalism", "Content creation"],
    icon: Camera,
  },
  {
    id: "drone",
    name: "Drone",
    category: "Imaging",
    description: "Remotely piloted aerial vehicle, typically equipped with a stabilized camera.",
    applications: ["Aerial photography", "Mapping", "Inspection", "Agriculture", "Delivery"],
    icon: Plane,
  },
  {
    id: "console",
    name: "Gaming Console",
    category: "Entertainment",
    description: "Purpose-built computer optimized for running interactive games on a television.",
    applications: ["Gaming", "Streaming media", "Online multiplayer", "VR experiences"],
    icon: Gamepad2,
  },
  {
    id: "speaker",
    name: "Smart Speaker",
    category: "Home Appliance",
    description: "Voice-activated speaker with a built-in assistant for hands-free control.",
    applications: ["Music playback", "Voice assistants", "Smart home control", "Timers and reminders"],
    icon: Speaker,
  },
  {
    id: "iot",
    name: "IoT Sensor",
    category: "IoT",
    description: "Small connected device that measures environmental data and reports it to a network.",
    applications: ["Temperature monitoring", "Security", "Industrial automation", "Smart agriculture"],
    icon: Radio,
  },
];