ALTER TABLE abonnements ADD COLUMN token UUID;

UPDATE abonnements SET token = gen_random_uuid() WHERE token IS NULL;

ALTER TABLE abonnements ALTER COLUMN token SET NOT NULL;

ALTER TABLE abonnements ADD CONSTRAINT abonnements_token_uk UNIQUE (token);
