create table todos (
  id bigint primary key generated always as identity,
  text text not null,
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security
alter table todos enable row level security;

-- 全ての操作を許可（開発用）
create policy "Allow all operations" on todos
  for all
  using (true)
  with check (true);
