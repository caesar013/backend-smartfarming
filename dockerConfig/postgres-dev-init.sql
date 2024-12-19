CREATE USER sf_adonis WITH ENCRYPTED PASSWORD 'pass_sf_adonis';

ALTER DATABASE sf_db OWNER TO sf_adonis;
ALTER SCHEMA "public" OWNER TO sf_adonis;
ALTER SCHEMA "user" OWNER TO sf_adonis;

ALTER TABLE "user"."account" OWNER TO sf_adonis;
ALTER TABLE "user"."role" OWNER TO sf_adonis;
ALTER TABLE "user"."api_tokens" OWNER TO sf_adonis;
