create table inscriptions_ouverture (
    id bigserial primary key,
    email varchar(320) not null unique,
    token uuid not null unique,
    cree_le timestamptz not null
);
