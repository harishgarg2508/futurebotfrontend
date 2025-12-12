export interface PanchangMeta {
  location: { lat: number; lon: number };
  timezone: string;
  selected_date: string;
  display_date: string;
  current_time: string;
  is_daytime: boolean;
  navigation: {
      next_date: string;
      prev_date: string;
  };
}

export interface HeroSunArc {
  sunrise: string;
  sunset: string;
  sun_position_percent: number;
  is_today: boolean;
}

export interface ChaughadiyaSlot {
  slot: number;
  name: string;
  type: "Good" | "Bad" | "Neutral";
  color: string;
  meaning: string;
  start_time: string;
  end_time: string;
  is_night: boolean;
  is_active?: boolean;
}

export interface ChaughadiyaRoadmap {
  day: ChaughadiyaSlot[];
  night: ChaughadiyaSlot[];
  current: ChaughadiyaSlot | null;
}

export interface RahuKaal {
  start: string;
  end: string;
  status: string;
}

export interface SpecialMuhurats {
  brahma_muhurat: string;
  abhijit_muhurat: { start: string; end: string; note: string };
  nishita_muhurat: string;
}

export interface HazardItem {
  date: string;
  status?: string;
  avoid?: string;
}

export interface MonthlyHazards {
  panchak_dates: string[];
  bhadra_dates: HazardItem[];
}

export interface HoraSlot {
  slot: number;
  planet: string;
  start_time: string;
  end_time: string;
  is_night: boolean;
  color: string;
  type: string;
  meaning: string;
}

export interface Widgets {
  chaughadiya_roadmap: ChaughadiyaRoadmap;
  hora_roadmap: HoraSlot[]; // New Addition
  rahu_kaal: RahuKaal;
  special_muhurats: SpecialMuhurats;
  disha_shool: { direction: string; remedy: string };
  monthly_hazards: MonthlyHazards;
}

export interface CoreItem {
  index: number;
  name: string;
  ends_at: string;
  paksha: string;
}

export interface CoreData {
  tithi: CoreItem;
  nakshatra: CoreItem;
  yoga: CoreItem;
  // karana is missing in interface but might be in response
}

export interface PanchangResponse {
  meta: PanchangMeta;
  hero_sun_arc: HeroSunArc;
  widgets: Widgets;
  core_data: CoreData;
}
