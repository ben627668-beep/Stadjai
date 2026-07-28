export type Period = 'month' | 'year' | 'custom';

export interface CustomDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label?: string;
}

export type CategoryId = 'transport_school' | 'cantine' | 'food' | 'transport' | 'papotte' | 'reserve' | string;
export type MainCategoryId = 'transport_school' | 'cantine' | 'food' | 'transport' | 'papotte' | string;

export type EnabledCategories = Record<string, boolean>;

export type FrequencyType = 'daily' | 'school_days' | 'weekly' | 'monthly';

export interface CustomCategory {
  id: string;
  name: string;
  emoji: string;
  monthlyCost: number;
  enabled: boolean;
  description?: string;
  unitPrice?: number;
  frequencyType?: FrequencyType;
  frequencyValue?: number;
}

export interface SelectedMeals {
  matin: boolean;
  midi: boolean;
  soir: boolean;
}

export interface CategoryDetail {
  cantineSouches?: number; // souches de 10 tickets
  foodDailyAmount?: number; // Repas & boulangerie quotidien
  transportTripsCount?: number; // nombre de sorties à 1000F (A/R)
  papotteMonthlyCost?: number; // 2000F et plus pour savon, liquide, pâte, parfum
}

export interface MealBreakdown {
  label: string;
  ticketPrice: number;
  souchePrice: number;
  souchesCount: number;
  unitTicketsCount: number;
  totalTicketsCount: number;
  totalCost: number;
  enabled: boolean;
}

export interface CantineBreakdown {
  matin: MealBreakdown;
  midi: MealBreakdown;
  soir: MealBreakdown;
  totalSouches: number;
  totalTickets: number;
}

export interface BudgetCategory {
  id: CategoryId;
  name: string;
  subtitle: string;
  description: string;
  amount: number;
  percentage: number;
  color: string;
  badgeText: string;
  unitInfo: string;
  detailsText: string;
  isEssential: boolean;
  emoji?: string;
  priorityOrder?: number;
  biblicalVerse?: string;
  biblicalAdvice?: string;
  cantineBreakdown?: CantineBreakdown;
  enabled?: boolean;
  targetAmount?: number;
  startingPrice?: number;
  isShortfall?: boolean;
  shortfallExplanation?: string;
}

export interface BiblicalWisdom {
  reference: string;
  verseText: string;
  spiritualAdvice: string;
  antiWasteTip: string;
  encouragement: string;
  theme: string;
}

export interface BudgetCalculationResult {
  totalBudget: number;
  period: Period;
  monthsCount: number;
  daysCount: number;
  periodLabel: string;
  customDateRange?: CustomDateRange;
  isCiteUniversitaire: boolean;
  allocatedTotal: number;
  remainingAmount: number;
  categories: Record<CategoryId, BudgetCategory>;
  status: 'insufficient' | 'tight' | 'balanced' | 'comfortable';
  wisdom: BiblicalWisdom;
  enabledCategories: EnabledCategories;
  selectedMeals: SelectedMeals;
}

export interface ExpenseLog {
  id: string;
  title: string;
  categoryId: CategoryId;
  amount: number;
  date: string;
  note?: string;
}

export interface DailyExpenseRecord {
  date: string; // YYYY-MM-DD
  plannedTotal: number;
  actualTotal: number;
  logged: boolean;
  note?: string;
  categoryAmounts?: Partial<Record<MainCategoryId, number>>;
}

