import type { Locale } from "@/lib/i18n";

const authCopy = {
  zh: {
    headerLogin: "登录 / 注册",
    headerAccount: "我的连接",
    authEyebrow: "Account Access",
    authTitle: "用邮箱建立一个可验证的连接",
    authBody:
      "匿名提交继续保留，但账户会把你的信号和一个真实可达的邮箱绑定起来。以后如果要把相同处境的人重新连接起来，账户会是第一层基础设施。",
    authSetupTitle: "当前还没有接通账户后端",
    authSetupBody:
      "要启用注册和登录，需要补齐 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY，并在 Supabase 里打开 Email Auth。",
    authSetupDetail:
      "同时把确认邮件模板里的链接改成 {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email。",
    loginTab: "登录",
    signupTab: "注册",
    emailLabel: "邮箱",
    passwordLabel: "密码",
    emailPlaceholder: "you@somewhere.com",
    passwordPlaceholder: "至少 8 位密码",
    loginButton: "进入账户",
    signupButton: "创建账户",
    pendingLogin: "正在登录...",
    pendingSignup: "正在创建账户...",
    invalidEmail: "请输入有效邮箱地址。",
    shortPassword: "密码至少需要 8 位。",
    loginFailed: "登录失败，请检查邮箱和密码。",
    signupFailed: "注册失败，请稍后再试。",
    signupCheckInbox:
      "注册成功。请去邮箱点击确认链接，确认后会回到站内账户页。",
    signupDirectSuccess: "账户已创建，正在进入账户页。",
    helper:
      "登录后提交的需求会私下关联到账户邮箱，但邮箱不会在公开页面展示。",
    switchToSignup: "还没有账户？去注册",
    switchToLogin: "已经有账户了？去登录",
    accountEyebrow: "Connected Identity",
    accountTitle: "你的账户已经和这张需求地图连上了",
    accountBody:
      "这里保存的不是公开社交资料，而是一个可以被验证、可以被重新联系的私人入口。公开页面仍然只展示“我是谁 / 我需要什么”。",
    emailStatusVerified: "邮箱已验证",
    emailStatusPending: "邮箱待验证",
    emailPrivacy:
      "邮箱仅用于登录、验证和后续可能的连接，不会公开展示。",
    submissionLinking:
      "登录后继续提交需求，系统会把该提交私下关联到账户，方便未来做更强的连接和回访。",
    logout: "退出登录",
    authRequiredTitle: "你还没有登录",
    authRequiredBody: "先登录或注册，再进入账户页。",
    mySignalsEyebrow: "My Signals",
    mySignalsTitle: "这些是你亲自送进地图的信号",
    mySignalsBody:
      "每一条都保留你当时写下的身份切片和需求表达，同时显示它后来被归到了哪个公共需求簇。",
    totalSignals: "已关联提交",
    totalClusters: "关联需求簇",
    risingSignals: "仍在升温的簇",
    latestLinked: "最近一次关联",
    linkedAt: "关联时间",
    clusterNow: "当前归入",
    openCluster: "查看该需求簇",
    noSignalsTitle: "你还没有留下已关联的信号",
    noSignalsBody:
      "登录后回到首页继续提交，新的需求会自动和这个账户私下绑定起来。",
    historyOfflineTitle: "历史信号暂时不可读",
    historyOfflineBody:
      "账户已经可用，但读取提交历史还需要服务端 Supabase 配置。",
  },
  en: {
    headerLogin: "Sign In / Register",
    headerAccount: "My Account",
    authEyebrow: "Account Access",
    authTitle: "Create a verified connection with your email",
    authBody:
      "Anonymous submission still stays, but an account binds your signals to a reachable, verified email. If the product later reconnects people in the same condition, this is the first layer of infrastructure.",
    authSetupTitle: "Auth backend is not connected yet",
    authSetupBody:
      "To enable signup and login, add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and enable Email Auth in Supabase.",
    authSetupDetail:
      "Also update the confirm-signup email template to use {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email.",
    loginTab: "Sign In",
    signupTab: "Register",
    emailLabel: "Email",
    passwordLabel: "Password",
    emailPlaceholder: "you@somewhere.com",
    passwordPlaceholder: "At least 8 characters",
    loginButton: "Enter Account",
    signupButton: "Create Account",
    pendingLogin: "Signing in...",
    pendingSignup: "Creating account...",
    invalidEmail: "Enter a valid email address.",
    shortPassword: "Password must be at least 8 characters.",
    loginFailed: "Sign-in failed. Check your email and password.",
    signupFailed: "Signup failed. Please try again.",
    signupCheckInbox:
      "Account created. Check your inbox, then use the confirmation link to return to your account page.",
    signupDirectSuccess: "Account created. Redirecting to your account.",
    helper:
      "When you submit while signed in, the system privately links the submission to your account email. The email never appears on public pages.",
    switchToSignup: "No account yet? Register",
    switchToLogin: "Already have an account? Sign in",
    accountEyebrow: "Connected Identity",
    accountTitle: "Your account is now attached to the demand atlas",
    accountBody:
      "What lives here is not a public profile. It is a private, verifiable way to reconnect with the person behind a signal. Public pages still show only Who am I / What do I need.",
    emailStatusVerified: "Email verified",
    emailStatusPending: "Email pending verification",
    emailPrivacy:
      "Your email is used for login, verification, and future contact only. It is never shown publicly.",
    submissionLinking:
      "If you keep submitting while signed in, those submissions can be privately linked back to this account for stronger future connection.",
    logout: "Sign Out",
    authRequiredTitle: "You are not signed in",
    authRequiredBody: "Sign in or register first, then open your account page.",
    mySignalsEyebrow: "My Signals",
    mySignalsTitle: "These are the signals you personally pushed into the atlas",
    mySignalsBody:
      "Each entry preserves the identity slice and the need you wrote at the time, while also showing which public demand cluster it eventually joined.",
    totalSignals: "Linked submissions",
    totalClusters: "Touched clusters",
    risingSignals: "Clusters still rising",
    latestLinked: "Latest linked",
    linkedAt: "Linked at",
    clusterNow: "Currently grouped into",
    openCluster: "Open cluster",
    noSignalsTitle: "You have not left any linked signals yet",
    noSignalsBody:
      "Go back to the homepage while signed in and submit a need. New submissions will link back to this account privately.",
    historyOfflineTitle: "Signal history is temporarily unavailable",
    historyOfflineBody:
      "The account layer works, but reading linked submission history still needs the server-side Supabase configuration.",
  },
} as const;

export function getAuthCopy(locale: Locale) {
  return authCopy[locale];
}
