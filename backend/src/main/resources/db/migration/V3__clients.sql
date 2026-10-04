create table clients (
    id bigserial primary key,
    email varchar(320) not null unique,
    premium_jusqu_au date
);

create table alertes_differees (
    id bigserial primary key,
    abonnement_id bigint not null references abonnements (id) on delete cascade,
    disponibilite_id bigint not null references disponibilites (id) on delete cascade,
    detectee_le timestamptz not null,
    envoyee_le timestamptz,
    unique (abonnement_id, disponibilite_id)
);
