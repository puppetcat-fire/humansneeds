import type { WishCluster } from "@/lib/wish-types";

export const wishClusters: WishCluster[] = [
  {
    id: "paid-for-needing",
    slug: "paid-for-needing",
    title: "让提出需求本身可以换来收入",
    summary:
      "当执行被 AI 压到接近零成本，越来越多人开始焦虑: 如果技能不再稀缺，人还能因为什么被需要？这个需求簇指向同一件事: 发现值得被创造的东西，应该本身就是一种劳动。",
    content:
      "我想要一个世界，普通人不必先会写代码、做产品、跑融资，才算有价值。只要他能先看见真实需求，能把还不存在但应该存在的东西说清楚，他就应该从后续价值里获得回报。",
    count: 241,
    votes: 983,
    createdAt: "2026-01-11",
    latestAt: "2026-03-21",
    weeklyGrowth: 19,
    signalScore: "97 / 100",
    samplePhrases: [
      "我希望将来不是只有会实现的人有收入，能发现缺口的人也能赚钱。",
      "如果 AI 都能做了，人至少要因为看见别人没看见的需求而被需要。",
      "想要一个市场，谁先提出被验证的真实需求，谁就分到价值。",
    ],
    sampleIdentities: [
      "一个担心技能迅速贬值的普通上班族",
      "一个已经开始被 AI 替代感追上的创作者",
      "一个不想再靠出售熟练度定义自己的人",
    ],
    mergeReasons: [
      "这些表达都在讨论同一个底层焦虑: 技能贬值后，人的价值如何重新计价。",
      "提交者虽然用了“点子”“需求”“洞察”“愿望”等不同词，但都在指向需求发现的经济价值。",
    ],
    relatedSlugs: ["creator-discovery", "human-controlled-ai"],
  },
  {
    id: "frictionless-commute",
    slug: "frictionless-commute",
    title: "更便宜、更少损耗的跨城生活",
    summary:
      "大量愿望并不是宏大理想，而是非常具体的生活摩擦: 城市资源集中、房租过高、通勤耗尽精力。人们想要的不是更励志，而是更轻的代价。",
    content:
      "我想要一种跨城生活方式，不用为了工作机会被迫承受高房租、极长通勤和碎掉的日常。交通、短租和远程协作应该被重新组织。",
    count: 198,
    votes: 701,
    createdAt: "2026-01-24",
    latestAt: "2026-03-20",
    weeklyGrowth: 15,
    signalScore: "88 / 100",
    samplePhrases: [
      "想住在二线城市，但能像住在公司楼上一样低成本地来回。",
      "想要一种不把人榨干的通勤系统。",
      "如果工作机会都在大城市，至少别让迁移成本这么高。",
    ],
    sampleIdentities: [
      "一个被跨城通勤榨干的人",
      "一个想逃离高房租但不想放弃机会的人",
      "一个在地理绑定里消耗生活的人",
    ],
    mergeReasons: [
      "原始表述分别提到高铁票价、合租不稳定、异地办公摩擦，但核心都在降低跨城生存成本。",
      "这些愿望被聚合为一种共同诉求: 把机会和居住的地理绑定拆开。",
    ],
    relatedSlugs: ["public-stay-space", "affordable-companionship"],
  },
  {
    id: "human-controlled-ai",
    slug: "human-controlled-ai",
    title: "AI 替我处理琐事，但不要接管我的人生",
    summary:
      "很多人并不抗拒 AI，真正让人不安的是失控。这个需求簇表达的是一种复杂欲望: 希望被辅助、被减负，但不想交出判断权和生活节奏。",
    content:
      "我想要 AI 替我处理报销、排程、筛选、重复沟通这些消耗性的劳动，但它不应该替我决定我要见谁、做什么、成为什么样的人。",
    count: 173,
    votes: 648,
    createdAt: "2026-02-02",
    latestAt: "2026-03-21",
    weeklyGrowth: 23,
    signalScore: "91 / 100",
    samplePhrases: [
      "我想把杂事外包给 AI，但不想被它规划人生。",
      "想要高自动化，不想要高控制。",
      "希望 AI 管理任务，不要管理我。",
    ],
    sampleIdentities: [
      "一个愿意用 AI 但不想失去主权的人",
      "一个被效率系统追着跑的人",
      "一个想减负但不想被接管的人",
    ],
    mergeReasons: [
      "提交者表面上在聊效率工具，底层都在强调边界、控制权和人格主权。",
      "这类需求共享相同的判断标准: 减少负担，但不能让系统替代人的意志。",
    ],
    relatedSlugs: ["paid-for-needing", "affordable-companionship"],
  },
  {
    id: "affordable-companionship",
    slug: "affordable-companionship",
    title: "让孤独者快速获得可信陪伴与照护",
    summary:
      "在高压城市里，很多愿望最终都落回一个非常原始的缺口: 有事时有人在，崩溃时有人接住。它不是社交娱乐，而是低门槛、可信、非羞耻的陪伴基础设施。",
    content:
      "我想要一个系统，在人状态不好、独居、失业、病中或情绪崩塌的时候，能迅速获得可信的人类陪伴与照护，而不是被算法继续推内容消磨时间。",
    count: 149,
    votes: 590,
    createdAt: "2026-01-30",
    latestAt: "2026-03-19",
    weeklyGrowth: 12,
    signalScore: "84 / 100",
    samplePhrases: [
      "想要一个可以低成本获得真实陪伴的机制，不是心理测试题。",
      "希望独居不是把风险全部自己承担。",
      "我不想再靠刷视频把情绪拖过去。",
    ],
    sampleIdentities: [
      "一个独居且没有稳定支持系统的人",
      "一个情绪崩塌时只能硬扛的人",
      "一个不想再靠算法陪伴自己的人",
    ],
    mergeReasons: [
      "原始表述覆盖陪诊、陪吃饭、情绪陪伴、紧急求助，但都指向可信的人类在场。",
      "这组需求的共同点不是“交朋友”，而是建立一层最低限度的情感安全网。",
    ],
    relatedSlugs: ["public-stay-space", "human-controlled-ai"],
  },
  {
    id: "public-stay-space",
    slug: "public-stay-space",
    title: "把空置空间变成可停留的公共庇护所",
    summary:
      "城市里不缺建筑，缺的是无需消费也能停留的地方。这个愿望簇持续出现，说明人们正在寻找一种不以购买力为门票的城市归属感。",
    content:
      "我想要更多不用点单、不被赶走、可以临时休息、工作、发呆、等人的城市空间。它不必精致，但要稳定、可预期、对普通人友好。",
    count: 128,
    votes: 433,
    createdAt: "2026-02-14",
    latestAt: "2026-03-17",
    weeklyGrowth: 9,
    signalScore: "79 / 100",
    samplePhrases: [
      "想要城市里有能待着但不用一直花钱的地方。",
      "希望空商铺不要只是拉闸，能临时变成人能喘口气的空间。",
      "不是所有停留都应该被消费定义。",
    ],
    sampleIdentities: [
      "一个被城市消费门槛反复驱赶的人",
      "一个只想安静待着却总要付费的人",
      "一个想在城市里拥有最低停留权的人",
    ],
    mergeReasons: [
      "表面词汇包括自习角、休息站、夜间空间、避难点，但底层都是反消费门槛的停留权。",
      "这些提交共同表达了一个城市命题: 人需要被允许存在，而不是只被允许交易。",
    ],
    relatedSlugs: ["frictionless-commute", "affordable-companionship"],
  },
  {
    id: "creator-discovery",
    slug: "creator-discovery",
    title: "让普通创作者不靠运气也能被发现",
    summary:
      "当内容供应被无限放大，创作者最痛的不是不会做，而是没人看到。这个需求簇想解决的是分发失灵: 好东西太多，发现机制太差。",
    content:
      "我想要一种新的分发系统，不靠平台运气、刷屏频率和人格表演，也能让普通创作者、独立产品和小团队被真正需要他们的人发现。",
    count: 116,
    votes: 402,
    createdAt: "2026-02-19",
    latestAt: "2026-03-18",
    weeklyGrowth: 11,
    signalScore: "77 / 100",
    samplePhrases: [
      "想要让认真做东西的人不用变成内容机器。",
      "希望推荐系统能先看是否解决问题，而不是谁更会表演。",
      "需要一个不靠运气也能把好作品送到对的人手里的机制。",
    ],
    sampleIdentities: [
      "一个不想靠表演换流量的创作者",
      "一个作品有价值但长期没被看见的人",
      "一个厌倦平台运气机制的独立开发者",
    ],
    mergeReasons: [
      "这些表述表面上横跨内容平台、独立开发和艺术创作，但共同痛点都是被发现成本过高。",
      "被归一化为同一信号，是因为它们都在追问: 价值如何被更公平地看见。",
    ],
    relatedSlugs: ["paid-for-needing", "public-stay-space"],
  },
];

export function getWishBySlug(slug: string) {
  return wishClusters.find((wish) => wish.slug === slug);
}

export function getRelatedWishes(currentSlug: string) {
  const current = getWishBySlug(currentSlug);

  if (!current) {
    return [];
  }

  return current.relatedSlugs
    .map((slug) => getWishBySlug(slug))
    .filter((wish): wish is WishCluster => Boolean(wish));
}
