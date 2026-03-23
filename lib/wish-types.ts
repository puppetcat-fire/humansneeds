export type WishCluster = {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  normalized?: string;
  count: number;
  votes: number;
  createdAt: string;
  latestAt: string;
  weeklyGrowth: number;
  signalScore: string;
  samplePhrases: string[];
  sampleIdentities: string[];
  mergeReasons: string[];
  relatedSlugs: string[];
};

export type WishSubmissionSample = {
  id: string;
  who: string;
  need: string;
  createdAt: string;
};

export type WishListPayload = {
  wishes: WishCluster[];
  backendConfigured: boolean;
  usingDemoData: boolean;
};

export type WishDetailPayload = {
  wish: WishCluster;
  related: WishCluster[];
  submissions: WishSubmissionSample[];
  backendConfigured: boolean;
  usingDemoData: boolean;
};

export type WishSubmissionResult = {
  wish: WishCluster;
  createdNewCluster: boolean;
};

export type ViewerWishSignal = {
  submission: WishSubmissionSample;
  wish: WishCluster;
};

export type ViewerWishSignalsPayload = {
  signals: ViewerWishSignal[];
  totalSubmissions: number;
  uniqueClusters: number;
  risingClusters: number;
  latestSubmissionAt: string | null;
  backendConfigured: boolean;
  usingDemoData: boolean;
};
