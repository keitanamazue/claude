-- user_idカラムを追加
alter table todos add column user_id uuid references auth.users(id) on delete cascade;

-- 既存のポリシーを削除
drop policy if exists "Allow all operations" on todos;

-- ユーザーごとのRLSポリシー
create policy "Users can view own todos" on todos
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own todos" on todos
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own todos" on todos
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own todos" on todos
  for delete
  using (auth.uid() = user_id);
