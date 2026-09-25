-- Dashboard de Reels. Tudo fica no schema `videos`, isolado das tabelas da
-- calculadora em `public`. O papel anon não recebe nenhum acesso: o site da
-- calculadora expõe a chave pública, então só usuários logados e presentes em
-- videos.membros enxergam alguma coisa.

create schema if not exists videos;
-- Funções auxiliares ficam fora do schema exposto na API.
create schema if not exists videos_privado;

-- Lista de e-mails com acesso ao dashboard.
create table videos.membros (
  email text primary key check (email = lower(email)),
  nome text,
  criado_em timestamptz not null default now()
);

create function videos_privado.eh_membro()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from videos.membros m
    where m.email = lower((select auth.jwt()) ->> 'email')
  );
$$;

revoke all on function videos_privado.eh_membro() from public, anon;
grant usage on schema videos_privado to authenticated;
grant execute on function videos_privado.eh_membro() to authenticated;

create function videos_privado.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- Um Reel próprio (vindo da API da Meta) ou uma referência enviada à mão.
create table videos.reels (
  id bigint generated always as identity primary key,
  origem text not null check (origem in ('proprio', 'referencia')),
  ig_media_id text unique,
  permalink text,
  legenda text not null default '',
  publicado_em timestamptz,
  duracao_s numeric(6, 1) check (duracao_s >= 0),
  -- Caminhos no Storage: capas no bucket reels-capas, vídeos no reels-videos.
  capa_path text,
  video_path text,
  status text not null default 'pendente'
    check (status in ('pendente', 'analisando', 'pronta', 'erro', 'sem_video')),
  erro text,
  -- "O que chamou sua atenção", no envio de referência.
  nota text,
  enviado_por uuid references auth.users (id) on delete set null,
  -- Métricas básicas que vêm junto com a mídia. As de insights ficam na Fase 2.
  curtidas integer check (curtidas >= 0),
  comentarios integer check (comentarios >= 0),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint reels_proprio_tem_ig check (origem = 'referencia' or ig_media_id is not null)
);

create index reels_publicado_em_idx on videos.reels (publicado_em desc);
-- Fila de análise e filtro "precisam de atenção".
create index reels_status_pendente_idx on videos.reels (status) where status <> 'pronta';
create index reels_enviado_por_idx on videos.reels (enviado_por);

create trigger reels_atualizado_em
before update on videos.reels
for each row execute function videos_privado.tocar_atualizado_em();

-- A análise atual de cada Reel. As seções de texto ficam em `conteudo`; as
-- etiquetas ficam em colunas para a Fase 3 poder agrupar por estilo.
create table videos.analises (
  reel_id bigint primary key references videos.reels (id) on delete cascade,
  conteudo jsonb not null,
  tipo_gancho text not null check (
    tipo_gancho in ('pergunta', 'choque_visual', 'antes_depois', 'fala_direta', 'texto_na_tela', 'demonstracao', 'outro')
  ),
  ritmo text not null check (ritmo in ('lento', 'medio', 'rapido')),
  estilo_legenda text not null check (estilo_legenda in ('palavra_a_palavra', 'frase', 'sem_legenda')),
  tipo_transicao text not null check (tipo_transicao in ('corte_seco', 'whip', 'zoom', 'mista')),
  tipo_trilha text not null check (tipo_trilha in ('energetica', 'calma', 'tendencia', 'sem_trilha', 'nao_avaliado')),
  -- null = não avaliado
  tem_locucao boolean,
  tem_zoom boolean not null,
  modelo text not null,
  gerada_em timestamptz not null default now(),
  revisada_por uuid references auth.users (id) on delete set null,
  revisada_em timestamptz
);

create index analises_revisada_por_idx on videos.analises (revisada_por);

-- Acesso: só usuários logados. Sem anon.
grant usage on schema videos to authenticated, service_role;
grant select on videos.membros, videos.reels, videos.analises to authenticated;
grant insert (origem, permalink, legenda, duracao_s, capa_path, video_path, nota, enviado_por)
  on videos.reels to authenticated;
grant update (status, nota, permalink) on videos.reels to authenticated;
grant update (
  conteudo, tipo_gancho, ritmo, estilo_legenda, tipo_transicao, tipo_trilha,
  tem_locucao, tem_zoom, revisada_por, revisada_em
) on videos.analises to authenticated;
grant all on all tables in schema videos to service_role;
grant usage, select on all sequences in schema videos to authenticated, service_role;

alter table videos.membros enable row level security;
alter table videos.reels enable row level security;
alter table videos.analises enable row level security;

create policy "membros veem a lista" on videos.membros
  for select to authenticated
  using ((select videos_privado.eh_membro()));

create policy "membros veem os reels" on videos.reels
  for select to authenticated
  using ((select videos_privado.eh_membro()));

create policy "membros enviam referencias" on videos.reels
  for insert to authenticated
  with check (
    (select videos_privado.eh_membro())
    and origem = 'referencia'
    and enviado_por = (select auth.uid())
  );

create policy "membros atualizam reels" on videos.reels
  for update to authenticated
  using ((select videos_privado.eh_membro()))
  with check ((select videos_privado.eh_membro()));

create policy "membros veem as analises" on videos.analises
  for select to authenticated
  using ((select videos_privado.eh_membro()));

create policy "membros revisam analises" on videos.analises
  for update to authenticated
  using ((select videos_privado.eh_membro()))
  with check ((select videos_privado.eh_membro()) and revisada_por = (select auth.uid()));

insert into videos.membros (email, nome) values
  ('hudson@besserhome.com.br', 'Hudson'),
  ('guilherme130108@gmail.com', null);

-- Storage. Capas são frames de posts públicos: bucket público para leitura.
-- Vídeos de referência ficam em bucket privado.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('reels-capas', 'reels-capas', true, 2097152, array['image/jpeg', 'image/webp']),
  ('reels-videos', 'reels-videos', false, 209715200, array['video/mp4']);

create policy "membros enviam capas" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'reels-capas' and (select videos_privado.eh_membro()));

create policy "membros enviam videos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'reels-videos' and (select videos_privado.eh_membro()));

create policy "membros leem videos" on storage.objects
  for select to authenticated
  using (bucket_id = 'reels-videos' and (select videos_privado.eh_membro()));
