// Insight types and interfaces

export type InsightType =
  | 'domain_collector'
  | 'group_champion'
  | 'voucher_hoarder'
  | 'spending_timeline'
  | 'split_partner'
  | 'reward_hunter'
  | 'expensive_day'
  | 'responsible_one'
  | 'money_network';

export type InsightTone = 'funny' | 'hard-hitting' | 'thoughtful' | 'social' | 'wholesome';

export interface Insight<T = any> {
  type: InsightType;
  title: string;
  data: T;
  message: string;
  tone?: InsightTone;
  aiMessage?: string | null;
  aiEnabled?: boolean;
}

// Specific insight data interfaces
export interface DomainInsightData {
  totalDomains: number;
  totalRenewals: number;
  totalSpent: number;
  mostRenewed: string | null;
  renewalCount: number;
}

export interface GroupChampionData {
  reliabilityScore: number;
  totalSplits: number;
  paidCount: number;
  totalCount: number;
}

export interface VoucherHoarderData {
  totalVouchers: number;
  expired: number;
  active: number;
  wastePercentage: number;
}

export interface SpendingTimelineData {
  firstDate: Date;
  lastDate: Date;
  daysSince: number;
  yearsSince: string;
}

export interface SplitPartnerData {
  partnerName: string;
  splitCount: number;
}

export interface RewardHunterData {
  totalRewards: number;
  rewardCount: number;
  avgReward: number;
}

export interface ExpensiveDayData {
  date: Date;
  amount: number;
}

export interface ResponsibleOneData {
  createdCount: number;
  totalAmount: number;
}

export interface MoneyNetworkData {
  peopleCount: number;
  groupCount: number;
  people: string[];
}
