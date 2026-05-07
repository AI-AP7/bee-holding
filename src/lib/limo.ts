export type BookingServiceType = "hourly" | "point_to_point";

export type FleetVehicle = {
  id: string;
  name: string;
  slug: string;
  type: "stretch_limo" | "suv" | "sedan" | "party_bus";
  description: string | null;
  capacity: number;
  luggage_capacity: number;
  hourly_rate_local: number;
  hourly_rate_distance: number;
  four_hour_block_local: number | null;
  four_hour_block_distance: number | null;
  min_hours: number;
  image_url: string | null;
  features: string[];
  is_active: boolean;
  display_order: number;
  square_service_variation_id: string | null;
};

export type ServiceArea = {
  code: "MD" | "DC" | "VA" | "PA";
  name: string;
  baseFee: number;
};

export const SERVICE_AREAS: ServiceArea[] = [
  { code: "MD", name: "Maryland", baseFee: 0 },
  { code: "DC", name: "District of Columbia", baseFee: 25 },
  { code: "VA", name: "Virginia", baseFee: 50 },
  { code: "PA", name: "Pennsylvania", baseFee: 75 },
];

export const VEHICLE_TYPE_LABELS: Record<FleetVehicle["type"], string> = {
  stretch_limo: "Stretch Limo",
  suv: "SUV",
  sedan: "Sedan",
  party_bus: "Party Bus",
};

export const FUEL_FEE_RATE = 0.1;
export const TAX_RATE = 0.06;
export const DEFAULT_GRATUITY = 60;
export const INCLUDED_DESTINATION_MILES = 20;
export const DESTINATION_MILE_RATE = 3.5;

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculateBasePrice(
  vehicle: FleetVehicle | null | undefined,
  serviceType: BookingServiceType,
  selectedArea: string,
  selectedHours: number
) {
  if (!vehicle) {
    return 0;
  }

  const areaFee = SERVICE_AREAS.find((area) => area.code === selectedArea)?.baseFee ?? 0;
  const effectiveHours = Math.max(selectedHours, vehicle.min_hours);

  if (serviceType === "point_to_point") {
    return vehicle.hourly_rate_local + areaFee;
  }

  if (effectiveHours >= 4 && vehicle.four_hour_block_local) {
    return vehicle.four_hour_block_local + areaFee;
  }

  return vehicle.hourly_rate_local * effectiveHours + areaFee;
}

export function calculateBookingTotals(
  vehicle: FleetVehicle | null | undefined,
  serviceType: BookingServiceType,
  selectedArea: string,
  selectedHours: number,
  addOnsTotal: number,
  destinationMiles = 0
) {
  const basePrice = calculateBasePrice(vehicle, serviceType, selectedArea, selectedHours);
  const billableDestinationMiles = Math.max(0, destinationMiles - INCLUDED_DESTINATION_MILES);
  const destinationMileageFee = billableDestinationMiles * DESTINATION_MILE_RATE;
  const subtotal = basePrice + addOnsTotal + destinationMileageFee;
  const fuelFee = subtotal * FUEL_FEE_RATE;
  const tax = subtotal * TAX_RATE;
  const gratuity = DEFAULT_GRATUITY;

  return {
    basePrice,
    subtotal,
    addOnsTotal,
    destinationMiles,
    billableDestinationMiles,
    destinationMileageFee,
    fuelFee,
    tax,
    gratuity,
    total: subtotal + fuelFee + tax + gratuity,
  };
}

export function normalizeAddress(value: string | null | undefined) {
  return (value || "").trim().replace(/\s+/g, " ");
}

export function isLikelyExactAddress(value: string | null | undefined) {
  const address = normalizeAddress(value);
  const hasStreetNumber = /\b\d{1,6}[A-Za-z]?\b/.test(address);
  const hasStreetName = /\b[A-Za-z][A-Za-z.'-]*\s+(?:st|street|ave|avenue|rd|road|dr|drive|blvd|boulevard|ln|lane|ct|court|cir|circle|pl|place|pkwy|parkway|ter|terrace|hwy|highway|way|route|rte|sq|square|trail|trl)\b/i.test(address);
  const hasCityState =
    /,\s*[A-Za-z .'-]{2,},\s*(?:[A-Z]{2}|[A-Za-z .'-]{4,})(?:\s+\d{5}(?:-\d{4})?)?\b/.test(address) ||
    /\b[A-Za-z .'-]{2,},\s*(?:[A-Z]{2}|[A-Za-z .'-]{4,})(?:\s+\d{5}(?:-\d{4})?)?\b/.test(address) ||
    /\b(?:MD|DC|VA|PA|Maryland|Virginia|Pennsylvania|District of Columbia)\b(?:\s+\d{5}(?:-\d{4})?)?\b/i.test(address);

  return address.length >= 12 && hasStreetNumber && hasStreetName && hasCityState;
}

export function addHoursToTime(time: string, hours: number) {
  const [hourString, minuteString = "00"] = time.split(":");
  const hour = Number.parseInt(hourString, 10);
  const minute = Number.parseInt(minuteString, 10);
  const totalMinutes = hour * 60 + minute + hours * 60;
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const resultHour = Math.floor(normalizedMinutes / 60)
    .toString()
    .padStart(2, "0");
  const resultMinute = (normalizedMinutes % 60).toString().padStart(2, "0");

  return `${resultHour}:${resultMinute}:00`;
}

export function getTimeZoneOffset(date: string, time: string, timeZone: string) {
  const utcDate = new Date(`${date}T${time}:00Z`);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
    hour: "2-digit",
  });
  const timeZonePart = formatter.formatToParts(utcDate).find((part) => part.type === "timeZoneName")?.value;

  if (!timeZonePart) {
    return "-05:00";
  }

  return timeZonePart.replace("GMT", "");
}

export function buildSquareStartAt(date: string, time: string, timeZone: string) {
  return `${date}T${time}:00${getTimeZoneOffset(date, time, timeZone)}`;
}
