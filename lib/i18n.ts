export type Locale = "zh" | "en";

export const localeCookieName = "site_lang";
export const defaultLocale: Locale = "zh";

export function normalizeLocale(value: string | undefined | null): Locale {
  if (!value) {
    return defaultLocale;
  }

  const normalized = value.toLowerCase();

  if (normalized === "en") {
    return "en";
  }

  if (normalized === "zh" || normalized === "ch" || normalized === "cn") {
    return "zh";
  }

  return defaultLocale;
}

export const messages = {
  zh: {
    meta: {
      title: "INeedThis | 人类需求地图",
      description:
        "一个把零散愿望聚成公共信号的网站原型。在 AI 时代，把真正值得被创造的东西重新看见。",
    },
    header: {
      home: "首页",
      ranking: "需求榜",
      method: "聚合方式",
    },
    footer: {
      line1: "人类未被满足的愿望，不该只以情绪的形式消失。",
      line2: "匿名提交、需求聚合、热度展示都已接通。",
    },
    notice: {
      eyebrow: "Backend Setup Needed",
      title: "当前仍在 Demo 数据模式",
      body: "当前没有可写入的后端，所以页面临时回退到了示例数据。",
      detail:
        "默认匿名版本会优先使用本地 SQLite 持久化；如果你后续要切到 Supabase + OpenAI 云端链路，再按 .env.example 和 supabase/schema.sql 配置。",
    },
    composer: {
      eyebrow: "Submit A Signal",
      title: "你想要什么存在于这个世界上？",
      anonymous: "匿名",
      whoLabel: "我是谁 / Who am I?",
      needLabel: "我需要什么 / What do I need?",
      whoPlaceholder: "比如：一个刚被裁、开始怀疑自己是否还会被需要的人。",
      needPlaceholder:
        "比如：我想要一种不靠运气也能被看见的创作者分发机制。",
      helper:
        "系统会把“我是谁”和“我需要什么”一起写入需求簇，并实时刷新榜单、详情和热度。",
      submit: "送入需求地图",
      submitting: "正在送入需求地图...",
      missingFields: "“我是谁”和“我需要什么”都需要填写。",
      writeUnavailable:
        "匿名写入链路暂时不可用，请稍后再试。",
      submitFailed: "提交失败，请稍后再试。",
      identitySlice: "提交身份切片",
      mergedInto: "已归入需求簇",
      newCluster:
        "这是一个新写入的需求簇，已经进入正式榜单数据。",
      currentSubmissions: "当前提交量",
      currentVotes: "赞同数",
      weeklyGrowth: "本周升温",
    },
    home: {
      eyebrow: "A Site For Unused Human Need",
      titleLead: "当技能被压成廉价供给，",
      titleAccent: "人的价值可能只剩下",
      titleTail: "知道什么值得存在。",
      intro:
        "INeedThis 不是许愿墙，也不是论坛。它把零散的“我想要”聚成公共信号，让那些尚未被满足、却被多人反复提起的愿望，浮出水面。",
      metricSignals: "匿名愿望信号",
      metricClusters: "已聚合需求簇",
      metricRising: "本周持续升温",
      enterRanking: "进入需求榜",
      seeMethod: "看它如何聚合",
      whyEyebrow: "Why This Exists",
      whyLead: "“如果未来不再缺会做事的人，那就会开始缺",
      whyAccent: "知道什么该被做出来的人",
      whyTail: "。”",
      whyBody:
        "这个站点想把那种无法直接赚钱、却不断真实出现的欲望保存下来。它们也许是产品机会，也许是制度缺口，也许只是人还不愿承认的绝望。",
      topEyebrow: "Top Signals",
      topTitle: "目前最强的需求信号",
      viewAll: "全部查看",
      submissionUnit: "次提交",
      voteUnit: "个赞同",
      risingEyebrow: "Rising This Week",
      thisWeek: "本周",
      detail: "查看簇详情",
      voicesEyebrow: "Raw Human Voices",
      voicesTitle: "被聚合之前，它们只是一些带着体温的原话",
      voicesBody:
        "归一化不是为了抹平语言，而是为了保留它们之间反复出现的共同缺口。",
      groupedInto: "归入",
      unknownVoice: "一个已经开始说出自己缺口的人",
      methodSteps: [
        {
          step: "01",
          title: "写下一个还不存在、但你真想要的东西",
          body:
            "自然语言输入，不要求产品术语。先保留人的原始表达，而不是一开始就让人学会写需求文档。",
        },
        {
          step: "02",
          title: "系统用语义相似度把重复欲望归为同一簇",
          body:
            "不是按字面去重，而是识别那些表述不同、底层缺口相同的愿望，让碎片信号开始累积。",
        },
        {
          step: "03",
          title: "提交量、赞同数和升温速度共同决定热度",
          body:
            "老需求不会永远霸榜，新出现的焦虑也会因为增长速度被看见。",
        },
        {
          step: "04",
          title: "把人类真正想要什么，展示成可阅读的地图",
          body:
            "给创作者、创业者和研究者一个问题导向的入口，而不是继续从流量噪音里猜测。",
        },
      ],
      previewEyebrow: "Signal Preview",
      previewTitle:
        "最后被留下来的，不是绝望本身，而是绝望指向了什么。",
      previewBody:
        "需求地图不承诺替你实现愿望，但它至少能证明：这不是你一个人的幻觉。同一种缺口被数百次说出来时，它就开始具有公共意义。",
      recentActive: "最近活跃",
    },
    ranking: {
      eyebrow: "Demand Ranking",
      titleLead: "不是最会发声的内容，",
      titleAccent: "而是被最多人反复需要的东西。",
      intro:
        "这里展示的是语义聚合后的需求簇。每一条下面都保留真实人话，因为统计结果必须能被情绪证实。",
      explorerEyebrow: "Demand Explorer",
      explorerTitle: "搜索还没人认真满足的人类愿望",
      explorerBody:
        "搜索词会匹配聚合标题、AI 摘要和原始人话。你看到的不是帖子，而是被多次指向的需求簇。",
      searchPlaceholder: "搜：赚钱、通勤、孤独、AI、创作者……",
      sortHot: "按热度",
      sortRecent: "按最近升温",
      sortVotes: "按赞同数",
      rank: "排名",
      score: "热度",
      recentActive: "最近活跃于",
      rawSample: "原始人话样本",
      thisWeek: "本周升温",
      detail: "查看详情",
      noResults:
        "没有找到匹配的需求簇。换个关键词，或者试试更具体的人类缺口。",
    },
    detail: {
      back: "返回需求榜",
      eyebrow: "Wish Cluster Detail",
      submissions: "次提交",
      votes: "个赞同",
      thisWeek: "本周",
      recent: "最近活跃于",
      signalScore: "语义聚合信号值",
      fullDescription: "完整描述",
      whyMerged: "Why Merged",
      snapshot: "Signal Snapshot",
      firstSeen: "首次出现",
      lastMentioned: "最近一次被提起",
      voteRatio: "赞同比率",
      originalEyebrow: "Original Submissions",
      originalTitle: "谁在说这句话，以及他们需要什么",
      readingEyebrow: "Reading",
      readingTitle: "这组愿望真正暴露的问题",
      readingBody:
        "这个需求簇之所以反复出现，不是因为它新鲜，而是因为它长期没有被认真满足。当不同背景的人开始用不同语言描述同一种缺口，它就开始具备公共问题的轮廓。",
      relatedEyebrow: "Related Signals",
      relatedEmpty:
        "这个需求簇还没有足够多的邻近信号。等更多提交进入后，相关簇会自动浮现。",
    },
    vote: {
      unavailable: "暂不可用",
      recorded: "信号已记录",
      pending: "记录中...",
      act: "我也想要",
      failed: "投票失败",
    },
  },
  en: {
    meta: {
      title: "INeedThis | Human Demand Atlas",
      description:
        "A public map of repeated human needs. In the AI era, surface what people actually want to exist.",
    },
    header: {
      home: "Home",
      ranking: "Ranking",
      method: "Method",
    },
    footer: {
      line1:
        "Unmet human desire should not disappear as nothing more than emotion.",
      line2:
        "Anonymous submission, clustering, and ranking are all live.",
    },
    notice: {
      eyebrow: "Backend Setup Needed",
      title: "The app is still running in demo-data mode",
      body:
        "No writable backend is available right now, so the site has temporarily fallen back to seeded example data.",
      detail:
        "The default anonymous build prefers local SQLite persistence. If you later want the Supabase + OpenAI cloud path, follow .env.example and supabase/schema.sql.",
    },
    composer: {
      eyebrow: "Submit A Signal",
      title: "What should exist in this world?",
      anonymous: "Anonymous",
      whoLabel: "Who am I?",
      needLabel: "What do I need?",
      whoPlaceholder:
        "For example: someone who was just laid off and is starting to doubt whether they will still be needed at all.",
      needPlaceholder:
        "For example: I need a distribution system where creators can still be found without luck.",
      helper:
        "The system writes identity and need into a demand cluster, then updates the ranking, detail pages, and heat signals live.",
      submit: "Send Into The Atlas",
      submitting: "Sending Into The Atlas...",
      missingFields: "Both “Who am I?” and “What do I need?” are required.",
      writeUnavailable:
        "Anonymous submission is temporarily unavailable. Please try again later.",
      submitFailed: "Submission failed. Please try again.",
      identitySlice: "Identity Slice",
      mergedInto: "Merged Into Cluster",
      newCluster:
        "This created a brand-new cluster and it is now part of the live ranking data.",
      currentSubmissions: "Submission Count",
      currentVotes: "Votes",
      weeklyGrowth: "Weekly Rise",
    },
    home: {
      eyebrow: "A Site For Unused Human Need",
      titleLead: "When skill becomes cheap supply,",
      titleAccent: "human value may collapse into",
      titleTail: "knowing what deserves to exist.",
      intro:
        "INeedThis is not a wish wall and not a forum. It compresses scattered “I want” statements into public signals, so repeated unmet desire can become visible.",
      metricSignals: "Anonymous Signals",
      metricClusters: "Demand Clusters",
      metricRising: "Still Rising This Week",
      enterRanking: "Open Ranking",
      seeMethod: "How It Clusters",
      whyEyebrow: "Why This Exists",
      whyLead: "“If the future no longer lacks people who can execute, it will begin to lack people who know",
      whyAccent: "what should be made",
      whyTail: ".”",
      whyBody:
        "This site tries to preserve the desires that keep showing up, even when they do not directly make money. They may be product opportunities, institutional gaps, or forms of despair people still refuse to name.",
      topEyebrow: "Top Signals",
      topTitle: "The strongest signals right now",
      viewAll: "View All",
      submissionUnit: "submissions",
      voteUnit: "votes",
      risingEyebrow: "Rising This Week",
      thisWeek: "This week",
      detail: "Open Cluster",
      voicesEyebrow: "Raw Human Voices",
      voicesTitle: "Before clustering, they are only warm fragments of human speech",
      voicesBody:
        "Normalization is not meant to flatten language. It is meant to preserve the repeated gap beneath different expressions.",
      groupedInto: "Grouped into",
      unknownVoice: "someone already trying to say what is missing",
      methodSteps: [
        {
          step: "01",
          title: "Write down something that does not exist yet, but should",
          body:
            "Natural language first, product jargon later. Preserve human expression before forcing people into requirement docs.",
        },
        {
          step: "02",
          title: "The system groups repeated desires by semantic similarity",
          body:
            "Not literal dedupe. It catches different phrasings that still point at the same underlying absence.",
        },
        {
          step: "03",
          title: "Volume, votes, and acceleration shape the ranking together",
          body:
            "Old needs do not stay on top forever. Newly rising anxieties get surfaced when their growth is fast enough.",
        },
        {
          step: "04",
          title: "The result is a readable map of what people actually want",
          body:
            "A question-driven entry point for builders, founders, and researchers instead of more guessing from noisy feeds.",
        },
      ],
      previewEyebrow: "Signal Preview",
      previewTitle:
        "What remains is not despair itself, but the direction despair points toward.",
      previewBody:
        "The atlas does not promise to fulfill desire. It at least proves that the absence is not your hallucination alone. Once hundreds of people point at the same gap, it becomes public meaning.",
      recentActive: "Recently active",
    },
    ranking: {
      eyebrow: "Demand Ranking",
      titleLead: "Not the loudest content,",
      titleAccent: "but the things people keep needing again and again.",
      intro:
        "This page shows semantically clustered demand signals. Every cluster still keeps raw human language underneath it, because statistics need emotional evidence.",
      explorerEyebrow: "Demand Explorer",
      explorerTitle: "Search for human desires nobody has properly fulfilled yet",
      explorerBody:
        "Search matches cluster titles, AI summaries, and raw language. What you see here is not posts, but repeated demand clusters.",
      searchPlaceholder:
        "Search: money, commute, loneliness, AI, creators...",
      sortHot: "By Heat",
      sortRecent: "By Recent Rise",
      sortVotes: "By Votes",
      rank: "Rank",
      score: "Score",
      recentActive: "Recently active",
      rawSample: "Raw human sample",
      thisWeek: "Weekly rise",
      detail: "Open Detail",
      noResults:
        "No matching cluster found. Try a different keyword or describe a more precise human gap.",
    },
    detail: {
      back: "Back To Ranking",
      eyebrow: "Wish Cluster Detail",
      submissions: "submissions",
      votes: "votes",
      thisWeek: "This week",
      recent: "Recently active",
      signalScore: "Semantic signal score",
      fullDescription: "Full Description",
      whyMerged: "Why Merged",
      snapshot: "Signal Snapshot",
      firstSeen: "First seen",
      lastMentioned: "Last mentioned",
      voteRatio: "Vote ratio",
      originalEyebrow: "Original Submissions",
      originalTitle: "Who is saying this, and what do they need?",
      readingEyebrow: "Reading",
      readingTitle: "What this cluster is actually exposing",
      readingBody:
        "This cluster repeats not because it is novel, but because it has stayed unresolved for too long. When people from different backgrounds use different language for the same gap, the problem starts to become public.",
      relatedEyebrow: "Related Signals",
      relatedEmpty:
        "This cluster does not have enough nearby signals yet. When more submissions arrive, related clusters will surface automatically.",
    },
    vote: {
      unavailable: "Unavailable",
      recorded: "Recorded",
      pending: "Saving...",
      act: "I Need This Too",
      failed: "Vote failed",
    },
  },
} as const;

export function getMessages(locale: Locale) {
  return messages[locale];
}
