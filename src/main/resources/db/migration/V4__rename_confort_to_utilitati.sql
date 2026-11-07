ALTER TABLE rating_detaliat DROP CONSTRAINT rating_detaliat_chk_3;
ALTER TABLE rating_detaliat CHANGE confort utilitati INT NULL;
ALTER TABLE rating_detaliat ADD CONSTRAINT rating_detaliat_chk_3 CHECK (utilitati BETWEEN 1 AND 10);
