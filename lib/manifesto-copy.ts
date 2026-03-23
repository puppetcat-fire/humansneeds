import type { Locale } from "@/lib/i18n";

type ManifestoCard = {
  eyebrow: string;
  title: string;
  body: string;
};

type ManifestoCopy = {
  metaTitle: string;
  metaDescription: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  intro: string;
  triggerEyebrow: string;
  triggerTitle: string;
  triggerBody: string;
  triggerNote: string;
  cards: ManifestoCard[];
  noPromiseEyebrow: string;
  noPromiseTitle: string;
  noPromiseBody: string;
  noPromiseList: string[];
  emergenceEyebrow: string;
  emergenceTitle: string;
  emergenceBody: string;
  emergenceList: string[];
  disclaimerEyebrow: string;
  disclaimerTitle: string;
  disclaimerBody: string;
  disclaimerList: string[];
  closingEyebrow: string;
  closingTitle: string;
  closingBody: string;
  primaryAction: string;
  secondaryAction: string;
};

const manifestoCopy: Record<Locale, ManifestoCopy> = {
  zh: {
    metaTitle: "INeedThis | 宣言",
    metaDescription:
      "当人的技能不再被市场需要，人的需要本身更应该被看见。这是 AI 时代的人类需求宣言。",
    navLabel: "宣言",
    eyebrow: "Manifesto / 人类需求宣言",
    title: "当市场不再为你付费，它也会假装你的需求不存在。",
    intro:
      "当你掌握的技能被 AI 取代，它不再能从市场中获取回报，那么你的需求也会立刻被降级。不是因为它不真实，不是因为你不痛，不是因为问题不存在。只是因为你已经付不起让别人满足它的价格。",
    triggerEyebrow: "Direct Statement",
    triggerTitle:
      "当你不再有钱支付回报，市场就会顺手把你的需要定义成无关紧要。",
    triggerBody:
      "这就是 AI 时代最冷的暴力。它不是把你杀死，而是让你的饥饿、孤独、焦虑、迁移成本、照护缺口、创作欲望、重新开始的愿望，都一起掉出“有效需求”的表格。你还活着，但你的需要开始失去公共语言。",
    triggerNote:
      "所以这个站先做一件最基础、也最不体面的事：替那些即将被系统判成无关紧要的需要，留下证据。",
    cards: [
      {
        eyebrow: "01",
        title: "这不是许愿墙，这是需求遗嘱",
        body:
          "如果人类要在 AI 时代留下一份集体遗书，它不该只是感想，而该是一张需求清单。把还想要什么写下来，比继续假装自己没事更重要。",
      },
      {
        eyebrow: "02",
        title: "我们收集需要，不承诺立刻实现",
        body:
          "这里不是众筹页，不是福利审批口，也不是自动兑现机器。我们现在做的是收集、聚合、统计、公开展示。先让问题被看见，再让解决有可能开始。",
      },
      {
        eyebrow: "03",
        title: "支付能力不该决定可见性",
        body:
          "需求的真实性不由钱证明。它可以由持续表达、反复出现、共鸣密度、身份处境和时间投入来证明。市场不愿承认的信号，公共空间必须接住。",
      },
      {
        eyebrow: "04",
        title: "一旦被足够多人写下，解决只是时间问题",
        body:
          "当同一种缺口被反复写出来，自发满足就会出现。可能是以工代赈，可能是互助交换，可能是 token 实验，可能是 AI 红利回流。问题先被提出，解决才会追上来。",
      },
    ],
    noPromiseEyebrow: "No Promise",
    noPromiseTitle: "我们不承诺拯救你。我们先拒绝让你消失。",
    noPromiseBody:
      "这件事的第一阶段不是兑现，而是显影。我们不会假装现在就有能力满足所有需要，但我们拒绝让无支付能力者的需要继续被当作噪音。",
    noPromiseList: [
      "不承诺立即实现每一个需求。",
      "不假装已经有成熟分配机制。",
      "不把人的痛苦包装成轻盈的产品乐观主义。",
      "只先把它写下来、聚起来、公开给所有人看。",
    ],
    emergenceEyebrow: "What We Believe",
    emergenceTitle: "需求先被看见，满足才会变成一件可组织的事。",
    emergenceBody:
      "我相信当体量足够大之后，人会自发地开始回应这些需求。不是因为人性突然变好，而是因为清晰、密集、重复出现的缺口，本身就会吸引资源、实验和组织形式。",
    emergenceList: [
      "会有人把 token 丢进来，做人类需求实现实验。",
      "会有人拿技能换技能，形成新的互助交换市场。",
      "会有人把 AI 效率红利重新定向给这些被忽略的人。",
      "会有人把这些数据拿去推动政策、分配和技术方向改变。",
    ],
    disclaimerEyebrow: "Boundary / 免责声明",
    disclaimerTitle: "边界先说清楚：这里不是政治动员页，也不是极端行为出口。",
    disclaimerBody:
      "这个项目要拉高情绪强度，但不把情绪导向现实伤害。我们谈的是需求被抹掉这件事，收集的是处境与缺口，不是号召攻击、集结或越界行动。",
    disclaimerList: [
      "不涉及政治动员、现实组织煽动或任何形式的线下集结。",
      "不鼓励违法行为、自残、自伤、极端行为或针对任何个人与群体的攻击。",
      "不接受仇恨言论、骚扰、威胁、歧视性表达和煽动性暴力内容。",
      "当前阶段只做匿名收集、聚合、展示与讨论，不承诺立即实现、分配或兑现任何需求。",
    ],
    closingEyebrow: "Last Line",
    closingTitle: "我们真正要做的，不是先解决一切，而是先让一切都无法继续被假装没发生。",
    closingBody:
      "把需要说出来。把它钉在公共空间里。让越来越多相同的需要互相照亮。等到它大到无法被忽略，后面的资源、实验、制度和交易形式，才会开始出现。",
    primaryAction: "现在提交需求",
    secondaryAction: "查看需求榜",
  },
  en: {
    metaTitle: "INeedThis | Manifesto",
    metaDescription:
      "When the market stops paying for your skills, your needs become easier to ignore. This is a manifesto for making human need visible in the AI era.",
    navLabel: "Manifesto",
    eyebrow: "Manifesto / Human Need Declaration",
    title: "When the market stops paying for you, it also starts pretending your needs do not exist.",
    intro:
      "When the skills you sell are replaced by AI, they stop producing market reward. And once that happens, your needs are quietly downgraded too. Not because they are fake. Not because you do not hurt. Not because the problem disappeared. Only because you can no longer afford the price of having other people meet it.",
    triggerEyebrow: "Direct Statement",
    triggerTitle:
      "When you can no longer pay for relief, the market will try to classify your need as irrelevant.",
    triggerBody:
      "That is the coldest violence of the AI era. It does not have to kill you. It only has to push your hunger, loneliness, anxiety, care gap, commuting burden, creative desire, and wish to start over outside the table of effective demand. You are still alive, but your need starts losing public language.",
    triggerNote:
      "So this site begins with one basic and unglamorous act: leave evidence for needs the system is about to label irrelevant.",
    cards: [
      {
        eyebrow: "01",
        title: "This is not a wish wall. It is a demand testament.",
        body:
          "If humanity leaves one collective document in the AI era, it should not be a reflection. It should be a list of what people still need. Writing it down matters more than continuing to act fine.",
      },
      {
        eyebrow: "02",
        title: "We collect need. We do not promise immediate fulfillment.",
        body:
          "This is not a crowdfunding page, not a welfare intake, and not an automatic delivery machine. Right now we collect, cluster, count, and expose. The problem has to become visible before any solution can become organized.",
      },
      {
        eyebrow: "03",
        title: "Payment ability should not decide visibility.",
        body:
          "Need should not require money to become legible. It can be validated by repeated expression, sustained attention, situational intensity, identity context, and time invested. Signals the market refuses to recognize must still have a public surface.",
      },
      {
        eyebrow: "04",
        title: "Once enough people write the same need down, fulfillment becomes a question of time.",
        body:
          "When the same absence keeps getting named, spontaneous response starts to appear. It may be work-for-relief, mutual exchange, token-funded experiments, or redirected AI surplus. The problem has to be stated before the solution can catch up.",
      },
    ],
    noPromiseEyebrow: "No Promise",
    noPromiseTitle: "We do not promise to save you. We first refuse to let you disappear.",
    noPromiseBody:
      "The first stage of this project is not delivery but exposure. We are not pretending we can satisfy every need now. We are refusing to let people without purchasing power keep getting treated as noise.",
    noPromiseList: [
      "We do not promise immediate implementation for every need.",
      "We do not pretend a mature distribution mechanism already exists.",
      "We do not wrap pain in easy product optimism.",
      "We first write it down, cluster it, and make it impossible to look away.",
    ],
    emergenceEyebrow: "What We Believe",
    emergenceTitle: "Need has to become visible before fulfillment can become organizable.",
    emergenceBody:
      "I believe that once the volume is large enough, people will begin responding on their own. Not because human nature suddenly turns pure, but because clear, repeated, undeniable absence attracts resources, experiments, and new forms of coordination.",
    emergenceList: [
      "People will throw tokens into experiments that try to fulfill human needs.",
      "People will exchange skills for skills and build new mutual-aid markets.",
      "People will redirect AI efficiency gains back toward ignored lives.",
      "People will use this data to pressure policy, redistribution, and technical direction.",
    ],
    disclaimerEyebrow: "Boundary / Disclaimer",
    disclaimerTitle:
      "One line has to stay clear: this is not a page for political mobilization or real-world harm.",
    disclaimerBody:
      "The project is intentionally emotionally charged, but it does not route emotion toward offline aggression. It is about needs being erased, not about recruiting attacks, escalation, or crossing legal and ethical boundaries.",
    disclaimerList: [
      "No political mobilization, offline organizing, or real-world agitation.",
      "No encouragement of illegal acts, self-harm, extremism, or attacks against any individual or group.",
      "No hate speech, harassment, threats, discriminatory language, or violent incitement.",
      "At this stage the project only collects, clusters, displays, and discusses anonymous needs. It does not promise immediate fulfillment, allocation, or delivery.",
    ],
    closingEyebrow: "Last Line",
    closingTitle:
      "The real task is not solving everything first. It is making sure nothing can keep being treated as if it never happened.",
    closingBody:
      "Write the need down. Pin it into public space. Let matching absences illuminate each other. Once it grows too large to ignore, resources, experiments, institutions, and exchange mechanisms can finally begin to form around it.",
    primaryAction: "Submit A Need Now",
    secondaryAction: "Open The Ranking",
  },
};

export function getManifestoCopy(locale: Locale) {
  return manifestoCopy[locale];
}
