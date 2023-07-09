-- v1.0.0 db creation script --
-- please note that the update date is updated by typeOrm and not by trigger --
SET search_path TO public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SET search_path TO "ExportManager", public; -- CHANGE SCHEMA NAME TO MATCH ENVIRONMENT

DROP TYPE IF EXISTS operation_status_enum;
CREATE TYPE "operation_status_enum" AS ENUM
    ('Pending', 'In-Progress', 'Completed', 'Failed', 'Expired', 'Aborted');
DROP TYPE IF EXISTS domain_enum;
CREATE TYPE "domain_enum" AS ENUM
    ('Raster', 'Dem', '3D', 'Vector');
DROP TYPE IF EXISTS webhook_event_enum;
CREATE TYPE "webhook_event_enum" AS ENUM
    ('TASK_STARTED', 'TASK_COMPLETED', 'TASK_FAILED', 'TASK_ABORTED', 'TASK_EXPIRED', 'TASK_ARCHIVED', 'TASK_PAUSED');
DROP TYPE IF EXISTS epsg_enum;
CREATE TYPE "epsg_enum" AS ENUM
    ('EPSG:4326', 'EPSG:3857');
    

CREATE TABLE "Task"
(
  "id" serial NOT NULL,
  "jobId" uuid NOT NULL,
  "catalogRecordId" uuid NOT NULL,
  "artifactCRS" "epsg_enum" NOT NULL,
  "domain" "domain_enum" NOT NULL,
  "status" "operation_status_enum" NOT NULL DEFAULT 'Pending'::"operation_status_enum",
  "description" character varying(2000) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
  "keywords" jsonb,
  "reason" text COLLATE pg_catalog."default" NOT NULL DEFAULT ''::text,
  "percentage" smallint,
  "createdAt" timestamp with time zone,
  "expiredAt" timestamp with time zone,
  "finishedAt" timestamp with time zone,
  CONSTRAINT "PK_export_task_id" PRIMARY KEY (id)
);

CREATE TABLE "TaskGeometry"
(
  "id" serial NOT NULL,
  "exportTaskId" bigint UNIQUE NOT NULL,
  "wkt_geometry" text COLLATE pg_catalog."default",
  "wkb_geometry" geometry(Geometry,4326),
  "footprint_geojson" text COLLATE pg_catalog."default" NOT NULL,
  "metadata" jsonb,
  CONSTRAINT "PK_task_geometry_id" PRIMARY KEY (id),
  CONSTRAINT "FK_task_geometry_export_task_id" FOREIGN KEY ("exportTaskId") REFERENCES "Task" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Trigger function : task_geometry_update_geometry
CREATE FUNCTION task_geometry_update_geometry() RETURNS trigger
    SET search_path FROM CURRENT
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.wkt_geometry IS NULL THEN
        RETURN NEW;
    END IF;
    NEW.wkb_geometry := ST_GeomFromText(NEW.wkt_geometry,4326);
    RETURN NEW;
END;
$$;

-- Trigger: task_geometry_update_geometry
-- DROP TRIGGER task_geometry_update_geometry ON taskgeometry;
CREATE TRIGGER task_geometry_update_geometry
    BEFORE INSERT OR UPDATE
    ON "TaskGeometry"
    FOR EACH ROW
    EXECUTE PROCEDURE task_geometry_update_geometry();


CREATE TABLE "ArtifactType"
(
  "id" serial PRIMARY KEY ,
  "type" text COLLATE pg_catalog."default"
  -- CONSTRAINT "PK_artifact_type_id" PRIMARY KEY (id)
);

CREATE TABLE "Artifact"
(
  "id" serial PRIMARY KEY ,
  "name" text COLLATE pg_catalog."default",
  "artifactTypeId" bigint NOT NULL,
  "url" text COLLATE pg_catalog."default" NOT NULL,
  "size" bigint,
  -- CONSTRAINT "PK_artifact_id" PRIMARY KEY (id),
  CONSTRAINT "FK_artifact_to_artifact_type_id" FOREIGN KEY ("artifactTypeId") REFERENCES "ArtifactType" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE "ArtifactToTask"
(
  "id" serial PRIMARY KEY ,
  "artifactId" int NOT NULL,
  "exportTaskId" int NOT NULL,
  -- CONSTRAINT "PK_artifact_to_task_id" PRIMARY KEY (id),
  CONSTRAINT "FK_artifact_to_export_task_id" FOREIGN KEY ("exportTaskId") REFERENCES "Task" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "FK_export_task_id_to_artifact" FOREIGN KEY ("artifactId") REFERENCES "Artifact" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE "Webhook"
(
  "id" serial PRIMARY KEY,
  "event" "webhook_event_enum" NOT NULL,
  "url" text COLLATE pg_catalog."default" NOT NULL
);

CREATE TABLE "WebhookToTask"
(
  "id" serial PRIMARY KEY,
  "webhookId" int NOT NULL,SADF
  "exportTaskId" int NOT NULL,
  -- CONSTRAINT "PK_artifact_to_task_id" PRIMARY KEY (id),
  CONSTRAINT "FK_webhook_to_export_task_id" FOREIGN KEY ("exportTaskId") REFERENCES "Task" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "FK_export_task_id_to_webhook" FOREIGN KEY ("webhookId") REFERENCES "Webhook" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);
