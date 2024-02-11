--
-- PostgreSQL database dump
--

-- Dumped from database version 12.15 (Ubuntu 12.15-1.pgdg20.04+1)
-- Dumped by pg_dump version 15.3 (Ubuntu 15.3-1.pgdg20.04+1)

-- Started on 2023-08-15 12:31:21 IDT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4532 (class 1262 OID 18119)
-- Name: libot; Type: DATABASE; Schema: -; Owner: -
--


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 14 (class 2615 OID 39131)
-- Name: ExportManager; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "ExportManager";


--
-- TOC entry 1983 (class 1247 OID 39195)
-- Name: task_status_enum; Type: TYPE; Schema: ExportManager; Owner: -
--

CREATE TYPE "ExportManager".task_status_enum AS ENUM (
    'IN_PROGRESS',
    'COMPLETED',
    'ABORTED',
    'PAUSED',
    'FAILED',
    'PENDING',
    'EXPIRED'
);


--
-- TOC entry 1975 (class 1247 OID 39167)
-- Name: webhook_events_enum; Type: TYPE; Schema: ExportManager; Owner: -
--

CREATE TYPE "ExportManager".webhook_events_enum AS ENUM (
    'TASK_STARTED',
    'TASK_UPDATED',
    'TASK_COMPLETED',
    'TASK_FAILED',
    'TASK_ABORTED',
    'TASK_EXPIRED',
    'TASK_PAUSED',
    'TASK_ARCHIVED'
);


SET default_table_access_method = heap;

--
-- TOC entry 241 (class 1259 OID 39233)
-- Name: aftifact_to_task; Type: TABLE; Schema: ExportManager; Owner: -
--

CREATE TABLE "ExportManager".aftifact_to_task (
    task_id integer NOT NULL,
    artifact_id integer NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 39156)
-- Name: artifact; Type: TABLE; Schema: ExportManager; Owner: -
--

CREATE TABLE "ExportManager".artifact (
    id integer NOT NULL,
    name character varying NOT NULL,
    url character varying NOT NULL,
    size numeric DEFAULT '0'::numeric NOT NULL,
    artifact_type_id integer NOT NULL
);


--
-- TOC entry 234 (class 1259 OID 39154)
-- Name: artifact_id_seq; Type: SEQUENCE; Schema: ExportManager; Owner: -
--

CREATE SEQUENCE "ExportManager".artifact_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4533 (class 0 OID 0)
-- Dependencies: 234
-- Name: artifact_id_seq; Type: SEQUENCE OWNED BY; Schema: ExportManager; Owner: -
--

ALTER SEQUENCE "ExportManager".artifact_id_seq OWNED BY "ExportManager".artifact.id;


--
-- TOC entry 233 (class 1259 OID 39145)
-- Name: artifact_type; Type: TABLE; Schema: ExportManager; Owner: -
--

CREATE TABLE "ExportManager".artifact_type (
    id integer NOT NULL,
    type character varying NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 39143)
-- Name: artifact_type_id_seq; Type: SEQUENCE; Schema: ExportManager; Owner: -
--

CREATE SEQUENCE "ExportManager".artifact_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4534 (class 0 OID 0)
-- Dependencies: 232
-- Name: artifact_type_id_seq; Type: SEQUENCE OWNED BY; Schema: ExportManager; Owner: -
--

ALTER SEQUENCE "ExportManager".artifact_type_id_seq OWNED BY "ExportManager".artifact_type.id;


--
-- TOC entry 239 (class 1259 OID 39211)
-- Name: task; Type: TABLE; Schema: ExportManager; Owner: -
--

CREATE TABLE "ExportManager".task (
    id integer NOT NULL,
    job_id uuid NOT NULL,
    catalog_record_id uuid NOT NULL,
    customer_name character varying NOT NULL,
    artifact_crs character varying NOT NULL,
    domain character varying NOT NULL,
    status "ExportManager".task_status_enum DEFAULT 'PENDING'::"ExportManager".task_status_enum NOT NULL,
    description character varying(2000),
    estimated_data_size numeric DEFAULT '0'::numeric,
    estimated_time numeric DEFAULT '0'::numeric,
    keywords jsonb,
    errorReason character varying,
    progress smallint DEFAULT '0'::smallint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    expired_at timestamp with time zone,
    finished_at timestamp with time zone
);


--
-- TOC entry 231 (class 1259 OID 39134)
-- Name: task_geometry; Type: TABLE; Schema: ExportManager; Owner: -
--

CREATE TABLE "ExportManager".task_geometry (
    id integer NOT NULL,
    wkt_geometry text,
    metadata jsonb
);


--
-- TOC entry 230 (class 1259 OID 39132)
-- Name: task_geometry_id_seq; Type: SEQUENCE; Schema: ExportManager; Owner: -
--

CREATE SEQUENCE "ExportManager".task_geometry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4535 (class 0 OID 0)
-- Dependencies: 230
-- Name: task_geometry_id_seq; Type: SEQUENCE OWNED BY; Schema: ExportManager; Owner: -
--

ALTER SEQUENCE "ExportManager".task_geometry_id_seq OWNED BY "ExportManager".task_geometry.id;


--
-- TOC entry 240 (class 1259 OID 39226)
-- Name: task_geometry_to_task; Type: TABLE; Schema: ExportManager; Owner: -
--

CREATE TABLE "ExportManager".task_geometry_to_task (
    task_id integer NOT NULL,
    task_geometry_id integer NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 39209)
-- Name: task_id_seq; Type: SEQUENCE; Schema: ExportManager; Owner: -
--

CREATE SEQUENCE "ExportManager".task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4536 (class 0 OID 0)
-- Dependencies: 238
-- Name: task_id_seq; Type: SEQUENCE OWNED BY; Schema: ExportManager; Owner: -
--

ALTER SEQUENCE "ExportManager".task_id_seq OWNED BY "ExportManager".task.id;


--
-- TOC entry 237 (class 1259 OID 39185)
-- Name: webhook; Type: TABLE; Schema: ExportManager; Owner: -
--

CREATE TABLE "ExportManager".webhook (
    id integer NOT NULL,
    url character varying NOT NULL,
    events "ExportManager".webhook_events_enum[] NOT NULL
);


--
-- TOC entry 236 (class 1259 OID 39183)
-- Name: webhook_id_seq; Type: SEQUENCE; Schema: ExportManager; Owner: -
--

CREATE SEQUENCE "ExportManager".webhook_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4537 (class 0 OID 0)
-- Dependencies: 236
-- Name: webhook_id_seq; Type: SEQUENCE OWNED BY; Schema: ExportManager; Owner: -
--

ALTER SEQUENCE "ExportManager".webhook_id_seq OWNED BY "ExportManager".webhook.id;


--
-- TOC entry 242 (class 1259 OID 39240)
-- Name: webhook_to_task; Type: TABLE; Schema: ExportManager; Owner: -
--

CREATE TABLE "ExportManager".webhook_to_task (
    task_id integer NOT NULL,
    webhook_id integer NOT NULL
);


--
-- TOC entry 4355 (class 2604 OID 39159)
-- Name: artifact id; Type: DEFAULT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".artifact ALTER COLUMN id SET DEFAULT nextval('"ExportManager".artifact_id_seq'::regclass);


--
-- TOC entry 4354 (class 2604 OID 39148)
-- Name: artifact_type id; Type: DEFAULT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".artifact_type ALTER COLUMN id SET DEFAULT nextval('"ExportManager".artifact_type_id_seq'::regclass);


--
-- TOC entry 4358 (class 2604 OID 39214)
-- Name: task id; Type: DEFAULT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".task ALTER COLUMN id SET DEFAULT nextval('"ExportManager".task_id_seq'::regclass);


--
-- TOC entry 4353 (class 2604 OID 39137)
-- Name: task_geometry id; Type: DEFAULT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".task_geometry ALTER COLUMN id SET DEFAULT nextval('"ExportManager".task_geometry_id_seq'::regclass);


--
-- TOC entry 4357 (class 2604 OID 39188)
-- Name: webhook id; Type: DEFAULT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".webhook ALTER COLUMN id SET DEFAULT nextval('"ExportManager".webhook_id_seq'::regclass);


--
-- TOC entry 4370 (class 2606 OID 39165)
-- Name: artifact PK_1f238d1d4ef8f85d0c0b8616fa3; Type: CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".artifact
    ADD CONSTRAINT "PK_1f238d1d4ef8f85d0c0b8616fa3" PRIMARY KEY (id);


--
-- TOC entry 4366 (class 2606 OID 39142)
-- Name: task_geometry PK_272fcc66b7ee91809977624b51a; Type: CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".task_geometry
    ADD CONSTRAINT "PK_272fcc66b7ee91809977624b51a" PRIMARY KEY (id);


--
-- TOC entry 4386 (class 2606 OID 39244)
-- Name: webhook_to_task PK_4e57116cd2dbd739cdd2b608040; Type: CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".webhook_to_task
    ADD CONSTRAINT "PK_4e57116cd2dbd739cdd2b608040" PRIMARY KEY (task_id, webhook_id);


--
-- TOC entry 4368 (class 2606 OID 39153)
-- Name: artifact_type PK_ae163e73ca0196fdb444350a29f; Type: CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".artifact_type
    ADD CONSTRAINT "PK_ae163e73ca0196fdb444350a29f" PRIMARY KEY (id);


--
-- TOC entry 4378 (class 2606 OID 39230)
-- Name: task_geometry_to_task PK_b5ee2f17de2c7cc478598e71c5e; Type: CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".task_geometry_to_task
    ADD CONSTRAINT "PK_b5ee2f17de2c7cc478598e71c5e" PRIMARY KEY (task_id, task_geometry_id);


--
-- TOC entry 4382 (class 2606 OID 39237)
-- Name: aftifact_to_task PK_d05c2b8f1c1e99ab04ef0decfc8; Type: CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".aftifact_to_task
    ADD CONSTRAINT "PK_d05c2b8f1c1e99ab04ef0decfc8" PRIMARY KEY (task_id, artifact_id);


--
-- TOC entry 4372 (class 2606 OID 39193)
-- Name: webhook PK_e6765510c2d078db49632b59020; Type: CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".webhook
    ADD CONSTRAINT "PK_e6765510c2d078db49632b59020" PRIMARY KEY (id);


--
-- TOC entry 4374 (class 2606 OID 39225)
-- Name: task PK_fb213f79ee45060ba925ecd576e; Type: CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".task
    ADD CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY (id);


--
-- TOC entry 4379 (class 1259 OID 39238)
-- Name: IDX_1c177bb0c24b5baebc3802d743; Type: INDEX; Schema: ExportManager; Owner: -
--

CREATE INDEX "IDX_1c177bb0c24b5baebc3802d743" ON "ExportManager".aftifact_to_task USING btree (task_id);


--
-- TOC entry 4380 (class 1259 OID 39239)
-- Name: IDX_6273570e11d08248138b31aa87; Type: INDEX; Schema: ExportManager; Owner: -
--

CREATE INDEX "IDX_6273570e11d08248138b31aa87" ON "ExportManager".aftifact_to_task USING btree (artifact_id);


--
-- TOC entry 4383 (class 1259 OID 39246)
-- Name: IDX_77da8001ed884572b05b2d5f9e; Type: INDEX; Schema: ExportManager; Owner: -
--

CREATE INDEX "IDX_77da8001ed884572b05b2d5f9e" ON "ExportManager".webhook_to_task USING btree (webhook_id);


--
-- TOC entry 4375 (class 1259 OID 39232)
-- Name: IDX_89b5f9165540da6b87aebd385f; Type: INDEX; Schema: ExportManager; Owner: -
--

CREATE INDEX "IDX_89b5f9165540da6b87aebd385f" ON "ExportManager".task_geometry_to_task USING btree (task_geometry_id);


--
-- TOC entry 4384 (class 1259 OID 39245)
-- Name: IDX_bca01caf646fa91378674022d0; Type: INDEX; Schema: ExportManager; Owner: -
--

CREATE INDEX "IDX_bca01caf646fa91378674022d0" ON "ExportManager".webhook_to_task USING btree (task_id);


--
-- TOC entry 4376 (class 1259 OID 39231)
-- Name: IDX_e8bd5ecc0a8c06dbe970e62adb; Type: INDEX; Schema: ExportManager; Owner: -
--

CREATE INDEX "IDX_e8bd5ecc0a8c06dbe970e62adb" ON "ExportManager".task_geometry_to_task USING btree (task_id);


--
-- TOC entry 4390 (class 2606 OID 39262)
-- Name: aftifact_to_task FK_1c177bb0c24b5baebc3802d7434; Type: FK CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".aftifact_to_task
    ADD CONSTRAINT "FK_1c177bb0c24b5baebc3802d7434" FOREIGN KEY (task_id) REFERENCES "ExportManager".task(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4391 (class 2606 OID 39267)
-- Name: aftifact_to_task FK_6273570e11d08248138b31aa877; Type: FK CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".aftifact_to_task
    ADD CONSTRAINT "FK_6273570e11d08248138b31aa877" FOREIGN KEY (artifact_id) REFERENCES "ExportManager".artifact(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4387 (class 2606 OID 39247)
-- Name: artifact FK_658d9f7207bdb6acb5236e9b16d; Type: FK CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".artifact
    ADD CONSTRAINT "FK_658d9f7207bdb6acb5236e9b16d" FOREIGN KEY (artifact_type_id) REFERENCES "ExportManager".artifact_type(id);


--
-- TOC entry 4392 (class 2606 OID 39277)
-- Name: webhook_to_task FK_77da8001ed884572b05b2d5f9ef; Type: FK CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".webhook_to_task
    ADD CONSTRAINT "FK_77da8001ed884572b05b2d5f9ef" FOREIGN KEY (webhook_id) REFERENCES "ExportManager".webhook(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4388 (class 2606 OID 39257)
-- Name: task_geometry_to_task FK_89b5f9165540da6b87aebd385fe; Type: FK CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".task_geometry_to_task
    ADD CONSTRAINT "FK_89b5f9165540da6b87aebd385fe" FOREIGN KEY (task_geometry_id) REFERENCES "ExportManager".task_geometry(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4393 (class 2606 OID 39272)
-- Name: webhook_to_task FK_bca01caf646fa91378674022d0e; Type: FK CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".webhook_to_task
    ADD CONSTRAINT "FK_bca01caf646fa91378674022d0e" FOREIGN KEY (task_id) REFERENCES "ExportManager".task(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4389 (class 2606 OID 39252)
-- Name: task_geometry_to_task FK_e8bd5ecc0a8c06dbe970e62adba; Type: FK CONSTRAINT; Schema: ExportManager; Owner: -
--

ALTER TABLE ONLY "ExportManager".task_geometry_to_task
    ADD CONSTRAINT "FK_e8bd5ecc0a8c06dbe970e62adba" FOREIGN KEY (task_id) REFERENCES "ExportManager".task(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2023-08-15 12:31:21 IDT

--
-- PostgreSQL database dump complete
--

