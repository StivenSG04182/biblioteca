--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Debian 16.6-1.pgdg120+1)
-- Dumped by pg_dump version 17rc1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY "public"."user_settings" DROP CONSTRAINT IF EXISTS "user_settings_user_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."recovery_codes" DROP CONSTRAINT IF EXISTS "recovery_codes_user_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."media_files" DROP CONSTRAINT IF EXISTS "media_files_question_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."chats" DROP CONSTRAINT IF EXISTS "chats_user_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."chat_questions" DROP CONSTRAINT IF EXISTS "chat_questions_question_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."chat_questions" DROP CONSTRAINT IF EXISTS "chat_questions_chat_id_fkey";
DROP TRIGGER IF EXISTS "questions_updated_at" ON "public"."questions";
ALTER TABLE IF EXISTS ONLY "public"."visits" DROP CONSTRAINT IF EXISTS "visits_visitor_ip_visit_date_key";
ALTER TABLE IF EXISTS ONLY "public"."visits" DROP CONSTRAINT IF EXISTS "visits_pkey";
ALTER TABLE IF EXISTS ONLY "public"."users" DROP CONSTRAINT IF EXISTS "users_pkey";
ALTER TABLE IF EXISTS ONLY "public"."users" DROP CONSTRAINT IF EXISTS "users_email_key";
ALTER TABLE IF EXISTS ONLY "public"."user_settings" DROP CONSTRAINT IF EXISTS "user_settings_user_id_key";
ALTER TABLE IF EXISTS ONLY "public"."user_settings" DROP CONSTRAINT IF EXISTS "user_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."recovery_codes" DROP CONSTRAINT IF EXISTS "recovery_codes_pkey";
ALTER TABLE IF EXISTS ONLY "public"."questions" DROP CONSTRAINT IF EXISTS "questions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."media_files" DROP CONSTRAINT IF EXISTS "media_files_pkey";
ALTER TABLE IF EXISTS ONLY "public"."chats" DROP CONSTRAINT IF EXISTS "chats_pkey";
ALTER TABLE IF EXISTS ONLY "public"."chat_questions" DROP CONSTRAINT IF EXISTS "chat_questions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."activity_log" DROP CONSTRAINT IF EXISTS "activity_log_pkey";
ALTER TABLE IF EXISTS "public"."visits" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."users" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."user_settings" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."recovery_codes" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."questions" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."media_files" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."chats" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."chat_questions" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE IF EXISTS "public"."activity_log" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "public"."visits_id_seq";
DROP TABLE IF EXISTS "public"."visits";
DROP SEQUENCE IF EXISTS "public"."users_id_seq";
DROP TABLE IF EXISTS "public"."users";
DROP SEQUENCE IF EXISTS "public"."user_settings_id_seq";
DROP TABLE IF EXISTS "public"."user_settings";
DROP SEQUENCE IF EXISTS "public"."recovery_codes_id_seq";
DROP TABLE IF EXISTS "public"."recovery_codes";
DROP SEQUENCE IF EXISTS "public"."questions_id_seq";
DROP TABLE IF EXISTS "public"."questions";
DROP SEQUENCE IF EXISTS "public"."media_files_id_seq";
DROP TABLE IF EXISTS "public"."media_files";
DROP SEQUENCE IF EXISTS "public"."chats_id_seq";
DROP TABLE IF EXISTS "public"."chats";
DROP SEQUENCE IF EXISTS "public"."chat_questions_id_seq";
DROP TABLE IF EXISTS "public"."chat_questions";
DROP SEQUENCE IF EXISTS "public"."activity_log_id_seq";
DROP TABLE IF EXISTS "public"."activity_log";
DROP FUNCTION IF EXISTS "public"."update_updated_at"();
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: activity_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."activity_log" (
    "id" integer NOT NULL,
    "action" character varying(255) NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: activity_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."activity_log_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."activity_log_id_seq" OWNED BY "public"."activity_log"."id";


--
-- Name: chat_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chat_questions" (
    "id" integer NOT NULL,
    "chat_id" integer,
    "question_id" integer,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: chat_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."chat_questions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chat_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."chat_questions_id_seq" OWNED BY "public"."chat_questions"."id";


--
-- Name: chats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chats" (
    "id" integer NOT NULL,
    "user_id" integer,
    "title" character varying(255) NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: chats_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."chats_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."chats_id_seq" OWNED BY "public"."chats"."id";


--
-- Name: media_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."media_files" (
    "id" integer NOT NULL,
    "question_id" integer,
    "file_path" character varying(1000) NOT NULL,
    "file_name" character varying(255) NOT NULL,
    "file_size" bigint NOT NULL,
    "mime_type" character varying(100) NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: media_files_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."media_files_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: media_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."media_files_id_seq" OWNED BY "public"."media_files"."id";


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."questions" (
    "id" integer NOT NULL,
    "question" "text" NOT NULL,
    "answer" "text" NOT NULL,
    "content" character varying(1000),
    "content_type" character varying(50),
    "file_path" character varying(1000),
    "file_name" character varying(255),
    "file_size" bigint,
    "mime_type" character varying(100),
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "questions_content_type_check" CHECK ((("content_type")::"text" = ANY ((ARRAY['pdf'::character varying, 'video'::character varying, 'audio'::character varying, 'youtube'::character varying, 'image'::character varying])::"text"[])))
);


--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."questions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."questions_id_seq" OWNED BY "public"."questions"."id";


--
-- Name: recovery_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."recovery_codes" (
    "id" integer NOT NULL,
    "user_id" integer,
    "code" character varying(6) NOT NULL,
    "expires_at" timestamp without time zone NOT NULL,
    "used" boolean DEFAULT false
);


--
-- Name: recovery_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."recovery_codes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recovery_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."recovery_codes_id_seq" OWNED BY "public"."recovery_codes"."id";


--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."user_settings" (
    "id" integer NOT NULL,
    "user_id" integer,
    "dark_mode" boolean DEFAULT true,
    "voice_enabled" boolean DEFAULT true
);


--
-- Name: user_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."user_settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."user_settings_id_seq" OWNED BY "public"."user_settings"."id";


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."users" (
    "id" integer NOT NULL,
    "email" character varying(255) NOT NULL,
    "password" character varying(255) NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."users_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."users_id_seq" OWNED BY "public"."users"."id";


--
-- Name: visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."visits" (
    "id" integer NOT NULL,
    "visitor_ip" character varying(45),
    "visit_date" "date",
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: visits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."visits_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: visits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."visits_id_seq" OWNED BY "public"."visits"."id";


--
-- Name: activity_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."activity_log" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."activity_log_id_seq"'::"regclass");


--
-- Name: chat_questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_questions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."chat_questions_id_seq"'::"regclass");


--
-- Name: chats id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chats" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."chats_id_seq"'::"regclass");


--
-- Name: media_files id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."media_files" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."media_files_id_seq"'::"regclass");


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."questions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."questions_id_seq"'::"regclass");


--
-- Name: recovery_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."recovery_codes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."recovery_codes_id_seq"'::"regclass");


--
-- Name: user_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_settings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_settings_id_seq"'::"regclass");


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."users_id_seq"'::"regclass");


--
-- Name: visits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."visits" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."visits_id_seq"'::"regclass");


--
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."activity_log" ("id", "action", "created_at") FROM stdin;
\.


--
-- Data for Name: chat_questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."chat_questions" ("id", "chat_id", "question_id", "created_at") FROM stdin;
\.


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."chats" ("id", "user_id", "title", "created_at") FROM stdin;
\.


--
-- Data for Name: media_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."media_files" ("id", "question_id", "file_path", "file_name", "file_size", "mime_type", "created_at") FROM stdin;
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."questions" ("id", "question", "answer", "content", "content_type", "file_path", "file_name", "file_size", "mime_type", "usage_count", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: recovery_codes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."recovery_codes" ("id", "user_id", "code", "expires_at", "used") FROM stdin;
\.


--
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."user_settings" ("id", "user_id", "dark_mode", "voice_enabled") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."users" ("id", "email", "password", "created_at") FROM stdin;
1	biblioteca9101@sena.edu.co	123456	2025-02-17 03:59:06.107851
2	stivensg04182@gmail.com	$2a$10$SQZ05Sr9RKw9MBKLdnQsZ.QwoIxINNsFUKl296i0NzCXTd2uzU/gm	2025-02-17 03:59:06.107851
\.


--
-- Data for Name: visits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."visits" ("id", "visitor_ip", "visit_date", "created_at") FROM stdin;
1	::1	2025-02-17	2025-02-17 04:00:17.369111
2	::1	2025-02-19	2025-02-19 14:33:53.907071
\.


--
-- Name: activity_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."activity_log_id_seq"', 1, false);


--
-- Name: chat_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."chat_questions_id_seq"', 1, false);


--
-- Name: chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."chats_id_seq"', 1, false);


--
-- Name: media_files_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."media_files_id_seq"', 1, false);


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."questions_id_seq"', 1, false);


--
-- Name: recovery_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."recovery_codes_id_seq"', 1, false);


--
-- Name: user_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."user_settings_id_seq"', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."users_id_seq"', 1, false);


--
-- Name: visits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."visits_id_seq"', 2, true);


--
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."activity_log"
    ADD CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id");


--
-- Name: chat_questions chat_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_questions"
    ADD CONSTRAINT "chat_questions_pkey" PRIMARY KEY ("id");


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_pkey" PRIMARY KEY ("id");


--
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."media_files"
    ADD CONSTRAINT "media_files_pkey" PRIMARY KEY ("id");


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");


--
-- Name: recovery_codes recovery_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."recovery_codes"
    ADD CONSTRAINT "recovery_codes_pkey" PRIMARY KEY ("id");


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");


--
-- Name: user_settings user_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_key" UNIQUE ("user_id");


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


--
-- Name: visits visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_pkey" PRIMARY KEY ("id");


--
-- Name: visits visits_visitor_ip_visit_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."visits"
    ADD CONSTRAINT "visits_visitor_ip_visit_date_key" UNIQUE ("visitor_ip", "visit_date");


--
-- Name: questions questions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "questions_updated_at" BEFORE UPDATE ON "public"."questions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: chat_questions chat_questions_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_questions"
    ADD CONSTRAINT "chat_questions_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE CASCADE;


--
-- Name: chat_questions chat_questions_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_questions"
    ADD CONSTRAINT "chat_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id");


--
-- Name: chats chats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chats"
    ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");


--
-- Name: media_files media_files_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."media_files"
    ADD CONSTRAINT "media_files_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;


--
-- Name: recovery_codes recovery_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."recovery_codes"
    ADD CONSTRAINT "recovery_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");


--
-- PostgreSQL database dump complete
--
