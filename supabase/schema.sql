create extension if not exists vector with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.wish_clusters (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  normalized text not null,
  representative_identity text not null,
  representative_need text not null,
  embedding extensions.vector(1536) not null,
  count integer not null default 1,
  votes integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  latest_submission_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.wish_submissions (
  id uuid primary key default extensions.gen_random_uuid(),
  cluster_id uuid not null references public.wish_clusters(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  contact_email text,
  who text not null,
  need text not null,
  language text not null default 'auto',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.wish_submissions
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.wish_submissions
  add column if not exists contact_email text;

create table if not exists public.wish_votes (
  id uuid primary key default extensions.gen_random_uuid(),
  cluster_id uuid not null references public.wish_clusters(id) on delete cascade,
  fingerprint text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique(cluster_id, fingerprint)
);

create index if not exists wish_clusters_embedding_hnsw
  on public.wish_clusters
  using hnsw (embedding extensions.vector_cosine_ops);

create index if not exists wish_clusters_latest_submission_at_idx
  on public.wish_clusters (latest_submission_at desc);

create index if not exists wish_submissions_cluster_id_created_at_idx
  on public.wish_submissions (cluster_id, created_at desc);

create index if not exists wish_submissions_user_id_created_at_idx
  on public.wish_submissions (user_id, created_at desc);

create or replace function public.match_wish_clusters(
  query_embedding extensions.vector(1536),
  match_threshold float,
  match_count int default 5
)
returns table (
  id uuid,
  slug text,
  title text,
  summary text,
  normalized text,
  representative_identity text,
  representative_need text,
  count integer,
  votes integer,
  created_at timestamptz,
  updated_at timestamptz,
  latest_submission_at timestamptz,
  similarity float
)
language sql
stable
as $$
  select
    wish_clusters.id,
    wish_clusters.slug,
    wish_clusters.title,
    wish_clusters.summary,
    wish_clusters.normalized,
    wish_clusters.representative_identity,
    wish_clusters.representative_need,
    wish_clusters.count,
    wish_clusters.votes,
    wish_clusters.created_at,
    wish_clusters.updated_at,
    wish_clusters.latest_submission_at,
    1 - (wish_clusters.embedding <=> query_embedding) as similarity
  from public.wish_clusters
  where 1 - (wish_clusters.embedding <=> query_embedding) >= match_threshold
  order by wish_clusters.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function public.related_wish_clusters(
  source_slug text,
  match_count int default 3
)
returns table (
  id uuid,
  slug text,
  title text,
  summary text,
  normalized text,
  representative_identity text,
  representative_need text,
  count integer,
  votes integer,
  created_at timestamptz,
  updated_at timestamptz,
  latest_submission_at timestamptz,
  similarity float
)
language sql
stable
as $$
  select
    target.id,
    target.slug,
    target.title,
    target.summary,
    target.normalized,
    target.representative_identity,
    target.representative_need,
    target.count,
    target.votes,
    target.created_at,
    target.updated_at,
    target.latest_submission_at,
    1 - (target.embedding <=> source.embedding) as similarity
  from public.wish_clusters as source
  join public.wish_clusters as target
    on source.slug = source_slug
   and target.id <> source.id
  order by target.embedding <=> source.embedding
  limit match_count;
$$;

create or replace function public.register_wish_vote(
  cluster_slug text,
  vote_fingerprint text
)
returns table (
  cluster_id uuid,
  votes integer,
  inserted boolean
)
language plpgsql
security definer
as $$
declare
  target_cluster_id uuid;
  current_votes integer;
begin
  select id, wish_clusters.votes
    into target_cluster_id, current_votes
  from public.wish_clusters
  where slug = cluster_slug
  limit 1;

  if target_cluster_id is null then
    raise exception 'wish cluster not found for slug %', cluster_slug;
  end if;

  insert into public.wish_votes (cluster_id, fingerprint)
  values (target_cluster_id, vote_fingerprint)
  on conflict (cluster_id, fingerprint) do nothing;

  if not found then
    return query
    select target_cluster_id, current_votes, false;
    return;
  end if;

  update public.wish_clusters
  set votes = public.wish_clusters.votes + 1,
      updated_at = timezone('utc', now())
  where id = target_cluster_id
  returning public.wish_clusters.votes into current_votes;

  return query
  select target_cluster_id, current_votes, true;
end;
$$;
