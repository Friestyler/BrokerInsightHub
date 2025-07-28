--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

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
-- Name: acme; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA acme;


ALTER SCHEMA acme OWNER TO neondb_owner;

--
-- Name: degoudse; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA degoudse;


ALTER SCHEMA degoudse OWNER TO neondb_owner;

--
-- Name: globex; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA globex;


ALTER SCHEMA globex OWNER TO neondb_owner;

--
-- Name: oceanic; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA oceanic;


ALTER SCHEMA oceanic OWNER TO neondb_owner;

--
-- Name: qollabi; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA qollabi;


ALTER SCHEMA qollabi OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_attachments; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.activity_attachments (
    id integer NOT NULL,
    activity_id integer,
    file_name text,
    file_path text,
    file_size integer,
    mime_type text,
    created_at timestamp without time zone DEFAULT now(),
    filename text,
    partner_id integer,
    uploaded_by_id integer,
    visible_to_partner boolean DEFAULT false
);


ALTER TABLE degoudse.activity_attachments OWNER TO neondb_owner;

--
-- Name: activity_attachments_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.activity_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.activity_attachments_id_seq OWNER TO neondb_owner;

--
-- Name: activity_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.activity_attachments_id_seq OWNED BY degoudse.activity_attachments.id;


--
-- Name: activity_comments; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.activity_comments (
    id integer NOT NULL,
    partner_id integer,
    content text NOT NULL,
    visible_to_partner boolean DEFAULT false,
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    synced_from_partner_id integer,
    is_synced boolean DEFAULT false,
    entity_type character varying(50),
    entity_id integer
);


ALTER TABLE degoudse.activity_comments OWNER TO neondb_owner;

--
-- Name: activity_comments_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.activity_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.activity_comments_id_seq OWNER TO neondb_owner;

--
-- Name: activity_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.activity_comments_id_seq OWNED BY degoudse.activity_comments.id;


--
-- Name: activity_reactions; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.activity_reactions (
    id integer NOT NULL,
    activity_type character varying(50) NOT NULL,
    activity_id integer NOT NULL,
    user_id integer NOT NULL,
    emoji character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE degoudse.activity_reactions OWNER TO neondb_owner;

--
-- Name: activity_reactions_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.activity_reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.activity_reactions_id_seq OWNER TO neondb_owner;

--
-- Name: activity_reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.activity_reactions_id_seq OWNED BY degoudse.activity_reactions.id;


--
-- Name: activity_tasks; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.activity_tasks (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'pending'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    assigned_to integer,
    entity_type character varying(50),
    entity_id integer,
    partner_id integer,
    due_date timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    completed boolean DEFAULT false,
    visible_to_partner boolean DEFAULT false,
    synced_from_partner_id integer,
    is_synced boolean DEFAULT false
);


ALTER TABLE degoudse.activity_tasks OWNER TO neondb_owner;

--
-- Name: activity_tasks_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.activity_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.activity_tasks_id_seq OWNER TO neondb_owner;

--
-- Name: activity_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.activity_tasks_id_seq OWNED BY degoudse.activity_tasks.id;


--
-- Name: broker_partner_mappings; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.broker_partner_mappings (
    id integer NOT NULL,
    broker_user_id integer NOT NULL,
    environment_id text NOT NULL,
    partner_id integer NOT NULL,
    broker_partner_name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.broker_partner_mappings OWNER TO neondb_owner;

--
-- Name: broker_partner_mappings_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.broker_partner_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.broker_partner_mappings_id_seq OWNER TO neondb_owner;

--
-- Name: broker_partner_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.broker_partner_mappings_id_seq OWNED BY degoudse.broker_partner_mappings.id;


--
-- Name: campaign_assignments; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.campaign_assignments (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    partner_id integer NOT NULL,
    assigned_by integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    access_level text DEFAULT 'edit'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    partner_status character varying(50) DEFAULT 'not_shared'::character varying
);


ALTER TABLE degoudse.campaign_assignments OWNER TO neondb_owner;

--
-- Name: campaign_assignments_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.campaign_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.campaign_assignments_id_seq OWNER TO neondb_owner;

--
-- Name: campaign_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.campaign_assignments_id_seq OWNED BY degoudse.campaign_assignments.id;


--
-- Name: campaign_follow_ups; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.campaign_follow_ups (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    subject text,
    email_body text,
    delay_days integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    attachment text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.campaign_follow_ups OWNER TO neondb_owner;

--
-- Name: campaign_follow_ups_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.campaign_follow_ups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.campaign_follow_ups_id_seq OWNER TO neondb_owner;

--
-- Name: campaign_follow_ups_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.campaign_follow_ups_id_seq OWNED BY degoudse.campaign_follow_ups.id;


--
-- Name: campaign_recipients; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.campaign_recipients (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    contact_id integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.campaign_recipients OWNER TO neondb_owner;

--
-- Name: campaign_recipients_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.campaign_recipients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.campaign_recipients_id_seq OWNER TO neondb_owner;

--
-- Name: campaign_recipients_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.campaign_recipients_id_seq OWNED BY degoudse.campaign_recipients.id;


--
-- Name: campaign_shares; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.campaign_shares (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    shared_with_type text NOT NULL,
    shared_with_id integer NOT NULL,
    access_level text DEFAULT 'view'::text NOT NULL,
    share_message text,
    shared_by_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.campaign_shares OWNER TO neondb_owner;

--
-- Name: campaign_shares_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.campaign_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.campaign_shares_id_seq OWNER TO neondb_owner;

--
-- Name: campaign_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.campaign_shares_id_seq OWNED BY degoudse.campaign_shares.id;


--
-- Name: campaigns; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.campaigns (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    type text NOT NULL,
    category text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by_id integer,
    sponsor_id integer,
    list_id integer,
    subject text,
    email_body text,
    email_logo text,
    from_name text,
    from_email text,
    scheduled_time timestamp without time zone,
    frequency text DEFAULT 'one_time'::text,
    is_shared boolean DEFAULT false,
    is_template boolean DEFAULT false,
    tags text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    heading text,
    button_link text,
    button_text text,
    button_color text,
    follow_up_emails json,
    objective text,
    target_entity_type text,
    recipients jsonb,
    emails_sent integer DEFAULT 0,
    emails_opened integer DEFAULT 0,
    open_rate numeric(5,2) DEFAULT 0.00,
    total_clicks integer DEFAULT 0,
    icon text,
    partner_id integer,
    environment_id text,
    collaboration_enabled boolean DEFAULT false,
    partner_status character varying(50) DEFAULT 'not_shared'::character varying
);


ALTER TABLE degoudse.campaigns OWNER TO neondb_owner;

--
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.campaigns_id_seq OWNER TO neondb_owner;

--
-- Name: campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.campaigns_id_seq OWNED BY degoudse.campaigns.id;


--
-- Name: categories; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.categories (
    id integer NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    description text,
    parent_id integer,
    level integer DEFAULT 1 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    icon text
);


ALTER TABLE degoudse.categories OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.categories_id_seq OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.categories_id_seq OWNED BY degoudse.categories.id;


--
-- Name: contact_relationships; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.contact_relationships (
    id integer NOT NULL,
    contact_id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    relationship_type text DEFAULT 'associated'::text NOT NULL,
    role text,
    is_primary boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT contact_relationships_entity_type_check CHECK ((entity_type = ANY (ARRAY['opportunity'::text, 'project'::text, 'customer'::text, 'partner'::text, 'contact'::text, 'vendor'::text])))
);


ALTER TABLE degoudse.contact_relationships OWNER TO neondb_owner;

--
-- Name: contact_relationships_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.contact_relationships_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.contact_relationships_id_seq OWNER TO neondb_owner;

--
-- Name: contact_relationships_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.contact_relationships_id_seq OWNED BY degoudse.contact_relationships.id;


--
-- Name: contact_tags; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.contact_tags (
    id integer NOT NULL,
    contact_id integer NOT NULL,
    tag_id integer NOT NULL,
    tagged_by_id integer,
    tagged_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.contact_tags OWNER TO neondb_owner;

--
-- Name: contact_tags_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.contact_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.contact_tags_id_seq OWNER TO neondb_owner;

--
-- Name: contact_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.contact_tags_id_seq OWNED BY degoudse.contact_tags.id;


--
-- Name: contacts; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.contacts (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text,
    job_title text,
    department text,
    company text,
    is_primary boolean DEFAULT false NOT NULL,
    notes text,
    tags text[],
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    reports_to integer
);


ALTER TABLE degoudse.contacts OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.contacts_id_seq OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.contacts_id_seq OWNED BY degoudse.contacts.id;


--
-- Name: customer_opportunities; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.customer_opportunities (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    opportunity_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.customer_opportunities OWNER TO neondb_owner;

--
-- Name: customer_opportunities_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.customer_opportunities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.customer_opportunities_id_seq OWNER TO neondb_owner;

--
-- Name: customer_opportunities_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.customer_opportunities_id_seq OWNED BY degoudse.customer_opportunities.id;


--
-- Name: customer_product_assignments; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.customer_product_assignments (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    product_template_id integer NOT NULL,
    custom_price numeric(12,2),
    custom_discount numeric(12,2),
    custom_discount_percentage numeric(5,2),
    custom_premium_percentage numeric(5,2),
    customer_contract_start_date date,
    customer_contract_end_date date,
    assigned_by integer,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.customer_product_assignments OWNER TO neondb_owner;

--
-- Name: customer_product_assignments_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.customer_product_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.customer_product_assignments_id_seq OWNER TO neondb_owner;

--
-- Name: customer_product_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.customer_product_assignments_id_seq OWNED BY degoudse.customer_product_assignments.id;


--
-- Name: customer_products; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.customer_products (
    id integer NOT NULL,
    customer_id integer,
    product_id integer,
    contract_start_date date,
    contract_end_date date,
    premium_value integer,
    premium_percentage integer,
    discount_percentage integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE degoudse.customer_products OWNER TO neondb_owner;

--
-- Name: customer_products_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.customer_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.customer_products_id_seq OWNER TO neondb_owner;

--
-- Name: customer_products_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.customer_products_id_seq OWNED BY degoudse.customer_products.id;


--
-- Name: customers; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.customers (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    owner_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    "ownerId" integer,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    industry text,
    status text DEFAULT 'Active'::text
);


ALTER TABLE degoudse.customers OWNER TO neondb_owner;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.customers_id_seq OWNER TO neondb_owner;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.customers_id_seq OWNED BY degoudse.customers.id;


--
-- Name: entity_logos; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.entity_logos (
    id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    environment_id text NOT NULL,
    logo_data text NOT NULL,
    mime_type text NOT NULL,
    original_filename text,
    file_size integer,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE degoudse.entity_logos OWNER TO neondb_owner;

--
-- Name: entity_logos_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.entity_logos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.entity_logos_id_seq OWNER TO neondb_owner;

--
-- Name: entity_logos_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.entity_logos_id_seq OWNED BY degoudse.entity_logos.id;


--
-- Name: list_collaborators; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.list_collaborators (
    id integer NOT NULL,
    list_id integer NOT NULL,
    user_id integer,
    email character varying(255) NOT NULL,
    name character varying(255),
    access_level character varying(20) DEFAULT 'viewer'::character varying,
    invited_by_id integer DEFAULT 1,
    invited_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT list_collaborators_access_level_check CHECK (((access_level)::text = ANY ((ARRAY['viewer'::character varying, 'commenter'::character varying, 'editor'::character varying])::text[])))
);


ALTER TABLE degoudse.list_collaborators OWNER TO neondb_owner;

--
-- Name: list_collaborators_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.list_collaborators_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.list_collaborators_id_seq OWNER TO neondb_owner;

--
-- Name: list_collaborators_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.list_collaborators_id_seq OWNED BY degoudse.list_collaborators.id;


--
-- Name: okr_metrics; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.okr_metrics (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    realized_value text DEFAULT '0'::text,
    target_value text,
    measure_unit text DEFAULT 'number'::text NOT NULL,
    currency_type text DEFAULT 'USD'::text,
    traffic_light_thresholds json,
    progress_bar_thresholds json,
    picklist_options text[] DEFAULT '{}'::text[],
    responsible_user_id integer,
    responsible_contact_ids integer[] DEFAULT '{}'::integer[],
    timeframe_start timestamp without time zone,
    timeframe_end timestamp without time zone,
    frequency text DEFAULT 'none'::text NOT NULL,
    attachment_url text,
    due_date timestamp without time zone,
    is_muted boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    is_shared boolean DEFAULT true,
    hierarchy text DEFAULT 'activity'::text NOT NULL,
    parent_id integer,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL,
    ytd_value text,
    last_year_value text
);


ALTER TABLE degoudse.okr_metrics OWNER TO neondb_owner;

--
-- Name: okr_metrics_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.okr_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.okr_metrics_id_seq OWNER TO neondb_owner;

--
-- Name: okr_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.okr_metrics_id_seq OWNED BY degoudse.okr_metrics.id;


--
-- Name: okr_tags; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.okr_tags (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    color character varying(20) DEFAULT '#3B82F6'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE degoudse.okr_tags OWNER TO neondb_owner;

--
-- Name: okr_tags_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.okr_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.okr_tags_id_seq OWNER TO neondb_owner;

--
-- Name: okr_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.okr_tags_id_seq OWNED BY degoudse.okr_tags.id;


--
-- Name: okr_template_assignments; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.okr_template_assignments (
    id integer NOT NULL,
    template_id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT now(),
    assigned_by integer NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    due_date timestamp without time zone,
    responsible_user_id integer,
    notes text
);


ALTER TABLE degoudse.okr_template_assignments OWNER TO neondb_owner;

--
-- Name: okr_template_assignments_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.okr_template_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.okr_template_assignments_id_seq OWNER TO neondb_owner;

--
-- Name: okr_template_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.okr_template_assignments_id_seq OWNED BY degoudse.okr_template_assignments.id;


--
-- Name: opportunities; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.opportunities (
    id integer NOT NULL,
    client_id integer NOT NULL,
    product_id integer NOT NULL,
    probability integer NOT NULL,
    estimated_value integer NOT NULL,
    title text,
    status text,
    stage text,
    type text,
    description text,
    notes text,
    expected_close_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    partner_id integer,
    owner_id integer,
    "estimatedValue" integer,
    "expectedCloseDate" timestamp without time zone,
    "clientId" integer,
    "partnerId" integer,
    "productId" integer,
    "ownerId" integer,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    start_date timestamp without time zone,
    account_manager_id integer,
    insurance_description text,
    assessment_status text DEFAULT 'pending'::text,
    assessment_date timestamp without time zone,
    assessed_by_id integer,
    withhold_reasons text[],
    withhold_comments text,
    assessment_notes text,
    interaction_count integer DEFAULT 0
);


ALTER TABLE degoudse.opportunities OWNER TO neondb_owner;

--
-- Name: opportunities_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.opportunities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.opportunities_id_seq OWNER TO neondb_owner;

--
-- Name: opportunities_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.opportunities_id_seq OWNED BY degoudse.opportunities.id;


--
-- Name: opportunity_products; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.opportunity_products (
    id integer NOT NULL,
    opportunity_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.opportunity_products OWNER TO neondb_owner;

--
-- Name: opportunity_products_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.opportunity_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.opportunity_products_id_seq OWNER TO neondb_owner;

--
-- Name: opportunity_products_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.opportunity_products_id_seq OWNED BY degoudse.opportunity_products.id;


--
-- Name: partner_customers; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.partner_customers (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    customer_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.partner_customers OWNER TO neondb_owner;

--
-- Name: partner_customers_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.partner_customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.partner_customers_id_seq OWNER TO neondb_owner;

--
-- Name: partner_customers_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.partner_customers_id_seq OWNED BY degoudse.partner_customers.id;


--
-- Name: partner_opportunities; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.partner_opportunities (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    opportunity_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.partner_opportunities OWNER TO neondb_owner;

--
-- Name: partner_opportunities_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.partner_opportunities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.partner_opportunities_id_seq OWNER TO neondb_owner;

--
-- Name: partner_opportunities_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.partner_opportunities_id_seq OWNED BY degoudse.partner_opportunities.id;


--
-- Name: partner_products; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.partner_products (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE degoudse.partner_products OWNER TO neondb_owner;

--
-- Name: partner_products_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.partner_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.partner_products_id_seq OWNER TO neondb_owner;

--
-- Name: partner_products_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.partner_products_id_seq OWNED BY degoudse.partner_products.id;


--
-- Name: partners; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.partners (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    owner_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'active'::text,
    location text,
    contact_email text,
    primary_contact text,
    region text,
    assigned_user_ids integer[] DEFAULT '{}'::integer[],
    linked_opportunity_ids integer[] DEFAULT '{}'::integer[]
);


ALTER TABLE degoudse.partners OWNER TO neondb_owner;

--
-- Name: partners_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.partners_id_seq OWNER TO neondb_owner;

--
-- Name: partners_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.partners_id_seq OWNED BY degoudse.partners.id;


--
-- Name: product_customers; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.product_customers (
    id integer NOT NULL,
    product_id integer NOT NULL,
    customer_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE degoudse.product_customers OWNER TO neondb_owner;

--
-- Name: product_customers_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.product_customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.product_customers_id_seq OWNER TO neondb_owner;

--
-- Name: product_customers_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.product_customers_id_seq OWNED BY degoudse.product_customers.id;


--
-- Name: product_templates; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.product_templates (
    id integer NOT NULL,
    product_id text NOT NULL,
    name text NOT NULL,
    description text,
    category_id integer,
    category text,
    provider_id integer,
    provider_type text,
    provider_name text,
    contract_start_date date,
    contract_end_date date,
    average_price numeric(12,2),
    premium_value numeric(12,2),
    premium_percentage numeric(5,2),
    discount numeric(12,2),
    discount_percentage numeric(5,2),
    vendor_id integer,
    is_active boolean DEFAULT true NOT NULL,
    notes text,
    tags text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.product_templates OWNER TO neondb_owner;

--
-- Name: product_templates_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.product_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.product_templates_id_seq OWNER TO neondb_owner;

--
-- Name: product_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.product_templates_id_seq OWNED BY degoudse.product_templates.id;


--
-- Name: products; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.products (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    vendor_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    category_id integer,
    tag_id integer,
    contract_start_date date,
    contract_end_date date,
    premium_value numeric(12,2),
    premium_percentage numeric(5,2),
    discount_percentage numeric(5,2),
    total_value numeric(10,2)
);


ALTER TABLE degoudse.products OWNER TO neondb_owner;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.products_id_seq OWNER TO neondb_owner;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.products_id_seq OWNED BY degoudse.products.id;


--
-- Name: projects; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.projects (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'active'::character varying,
    priority character varying(50) DEFAULT 'medium'::character varying,
    start_date date,
    end_date date,
    estimated_value numeric(15,2),
    actual_value numeric(15,2),
    customer_id integer,
    partner_id integer,
    project_manager_id integer,
    created_by_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE degoudse.projects OWNER TO neondb_owner;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.projects_id_seq OWNER TO neondb_owner;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.projects_id_seq OWNED BY degoudse.projects.id;


--
-- Name: saved_lists; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.saved_lists (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    type text NOT NULL,
    entity_type text NOT NULL,
    members integer[] DEFAULT '{}'::integer[],
    filters json NOT NULL,
    is_shared boolean DEFAULT false,
    is_default boolean DEFAULT false,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    partner_id integer
);


ALTER TABLE degoudse.saved_lists OWNER TO neondb_owner;

--
-- Name: saved_lists_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.saved_lists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.saved_lists_id_seq OWNER TO neondb_owner;

--
-- Name: saved_lists_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.saved_lists_id_seq OWNED BY degoudse.saved_lists.id;


--
-- Name: saved_views; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.saved_views (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    entity_type text NOT NULL,
    filters json NOT NULL,
    is_shared boolean DEFAULT false,
    is_default boolean DEFAULT false,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    members integer[],
    item_count integer DEFAULT 0
);


ALTER TABLE degoudse.saved_views OWNER TO neondb_owner;

--
-- Name: saved_views_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.saved_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.saved_views_id_seq OWNER TO neondb_owner;

--
-- Name: saved_views_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.saved_views_id_seq OWNED BY degoudse.saved_views.id;


--
-- Name: tag_categories; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.tag_categories (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    color character varying(7) DEFAULT '#6B7280'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE degoudse.tag_categories OWNER TO neondb_owner;

--
-- Name: tag_categories_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.tag_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.tag_categories_id_seq OWNER TO neondb_owner;

--
-- Name: tag_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.tag_categories_id_seq OWNED BY degoudse.tag_categories.id;


--
-- Name: tag_groups; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.tag_groups (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    color_scheme character varying(50),
    is_exclusive boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0,
    created_by_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.tag_groups OWNER TO neondb_owner;

--
-- Name: tag_groups_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.tag_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.tag_groups_id_seq OWNER TO neondb_owner;

--
-- Name: tag_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.tag_groups_id_seq OWNED BY degoudse.tag_groups.id;


--
-- Name: tag_types; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.tag_types (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.tag_types OWNER TO neondb_owner;

--
-- Name: tag_types_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.tag_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.tag_types_id_seq OWNER TO neondb_owner;

--
-- Name: tag_types_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.tag_types_id_seq OWNED BY degoudse.tag_types.id;


--
-- Name: tags; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.tags (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    tag_type_id integer,
    parent_tag_id integer,
    status text DEFAULT 'active'::text NOT NULL,
    color text DEFAULT '#3B82F6'::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    group_id integer,
    usage_count integer DEFAULT 0 NOT NULL,
    created_by_id integer,
    category_id integer,
    category character varying(50)
);


ALTER TABLE degoudse.tags OWNER TO neondb_owner;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.tags_id_seq OWNER TO neondb_owner;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.tags_id_seq OWNED BY degoudse.tags.id;


--
-- Name: unified_activities; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.unified_activities (
    id integer NOT NULL,
    activity_type character varying(50) NOT NULL,
    entity_type character varying(50),
    entity_id integer,
    partner_id integer,
    title character varying(255),
    description text,
    user_id integer,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE degoudse.unified_activities OWNER TO neondb_owner;

--
-- Name: unified_activities_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.unified_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.unified_activities_id_seq OWNER TO neondb_owner;

--
-- Name: unified_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.unified_activities_id_seq OWNED BY degoudse.unified_activities.id;


--
-- Name: users; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying,
    partner_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE degoudse.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.users_id_seq OWNED BY degoudse.users.id;


--
-- Name: vendors; Type: TABLE; Schema: degoudse; Owner: neondb_owner
--

CREATE TABLE degoudse.vendors (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    initials text,
    contact_name text,
    contact_email text,
    contact_phone text,
    owner_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE degoudse.vendors OWNER TO neondb_owner;

--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: degoudse; Owner: neondb_owner
--

CREATE SEQUENCE degoudse.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE degoudse.vendors_id_seq OWNER TO neondb_owner;

--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: degoudse; Owner: neondb_owner
--

ALTER SEQUENCE degoudse.vendors_id_seq OWNED BY degoudse.vendors.id;


--
-- Name: activity_attachments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activity_attachments (
    id integer NOT NULL,
    filename text NOT NULL,
    original_name text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    file_path text,
    url text,
    uploaded_by_id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    related_entity_type text,
    related_entity_id integer,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_attachments OWNER TO neondb_owner;

--
-- Name: activity_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.activity_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_attachments_id_seq OWNER TO neondb_owner;

--
-- Name: activity_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.activity_attachments_id_seq OWNED BY public.activity_attachments.id;


--
-- Name: activity_comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activity_comments (
    id integer NOT NULL,
    content text NOT NULL,
    author_id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    assigned_to_id integer,
    parent_comment_id integer,
    related_entity_type text,
    related_entity_id integer,
    is_internal boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_comments OWNER TO neondb_owner;

--
-- Name: activity_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.activity_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_comments_id_seq OWNER TO neondb_owner;

--
-- Name: activity_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.activity_comments_id_seq OWNED BY public.activity_comments.id;


--
-- Name: activity_reactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activity_reactions (
    id integer NOT NULL,
    activity_type text NOT NULL,
    activity_id integer NOT NULL,
    user_id integer NOT NULL,
    emoji text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_reactions OWNER TO neondb_owner;

--
-- Name: activity_reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.activity_reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_reactions_id_seq OWNER TO neondb_owner;

--
-- Name: activity_reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.activity_reactions_id_seq OWNED BY public.activity_reactions.id;


--
-- Name: activity_tasks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.activity_tasks (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    assigned_to_id integer,
    assigned_by_id integer,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    related_entity_type text,
    related_entity_id integer,
    due_date timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activity_tasks OWNER TO neondb_owner;

--
-- Name: activity_tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.activity_tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_tasks_id_seq OWNER TO neondb_owner;

--
-- Name: activity_tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.activity_tasks_id_seq OWNED BY public.activity_tasks.id;


--
-- Name: broker_partner_mappings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.broker_partner_mappings (
    id integer NOT NULL,
    broker_user_id integer NOT NULL,
    environment_id text NOT NULL,
    partner_id integer NOT NULL,
    broker_partner_name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.broker_partner_mappings OWNER TO neondb_owner;

--
-- Name: broker_partner_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.broker_partner_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.broker_partner_mappings_id_seq OWNER TO neondb_owner;

--
-- Name: broker_partner_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.broker_partner_mappings_id_seq OWNED BY public.broker_partner_mappings.id;


--
-- Name: campaign_assignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.campaign_assignments (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    partner_id integer NOT NULL,
    assigned_by integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    access_level text DEFAULT 'edit'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    partner_status text DEFAULT 'shared_with_partner'::text
);


ALTER TABLE public.campaign_assignments OWNER TO neondb_owner;

--
-- Name: campaign_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.campaign_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_assignments_id_seq OWNER TO neondb_owner;

--
-- Name: campaign_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.campaign_assignments_id_seq OWNED BY public.campaign_assignments.id;


--
-- Name: campaign_emails; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.campaign_emails (
    id integer NOT NULL,
    template_id integer NOT NULL,
    subject text NOT NULL,
    follow_up_days integer DEFAULT 0 NOT NULL,
    left_logo text,
    right_logo text,
    email_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.campaign_emails OWNER TO neondb_owner;

--
-- Name: campaign_emails_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.campaign_emails_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_emails_id_seq OWNER TO neondb_owner;

--
-- Name: campaign_emails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.campaign_emails_id_seq OWNED BY public.campaign_emails.id;


--
-- Name: campaign_follow_ups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.campaign_follow_ups (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    subject text NOT NULL,
    email_body text NOT NULL,
    delay_days integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.campaign_follow_ups OWNER TO neondb_owner;

--
-- Name: campaign_follow_ups_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.campaign_follow_ups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_follow_ups_id_seq OWNER TO neondb_owner;

--
-- Name: campaign_follow_ups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.campaign_follow_ups_id_seq OWNED BY public.campaign_follow_ups.id;


--
-- Name: campaign_recipients; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.campaign_recipients (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    contact_id integer NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    sent_at timestamp without time zone,
    opened_at timestamp without time zone,
    clicked_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.campaign_recipients OWNER TO neondb_owner;

--
-- Name: campaign_recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.campaign_recipients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_recipients_id_seq OWNER TO neondb_owner;

--
-- Name: campaign_recipients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.campaign_recipients_id_seq OWNED BY public.campaign_recipients.id;


--
-- Name: campaign_shares; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.campaign_shares (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    shared_with_type text NOT NULL,
    shared_with_id integer NOT NULL,
    access_level text DEFAULT 'view'::text NOT NULL,
    share_message text,
    shared_by_id integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.campaign_shares OWNER TO neondb_owner;

--
-- Name: campaign_shares_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.campaign_shares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_shares_id_seq OWNER TO neondb_owner;

--
-- Name: campaign_shares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.campaign_shares_id_seq OWNED BY public.campaign_shares.id;


--
-- Name: campaign_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.campaign_templates (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    objective text,
    entity text NOT NULL,
    icon text,
    status text DEFAULT 'draft'::text NOT NULL,
    attachments json DEFAULT '[]'::json,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    collaboration_enabled boolean DEFAULT false NOT NULL
);


ALTER TABLE public.campaign_templates OWNER TO neondb_owner;

--
-- Name: campaign_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.campaign_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_templates_id_seq OWNER TO neondb_owner;

--
-- Name: campaign_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.campaign_templates_id_seq OWNED BY public.campaign_templates.id;


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.campaigns (
    id integer NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'email'::text NOT NULL,
    description text,
    template_id integer,
    target_entity_type text NOT NULL,
    target_entity_id integer,
    partner_id integer,
    environment_id text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    send_at timestamp without time zone,
    shared_with text[] DEFAULT '{}'::text[],
    is_ai_generated boolean DEFAULT false NOT NULL,
    engagement_summary json,
    last_sent_at timestamp without time zone,
    emails_sent integer DEFAULT 0,
    emails_opened integer DEFAULT 0,
    open_rate numeric(5,2) DEFAULT 0.00,
    total_clicks integer DEFAULT 0,
    emails json NOT NULL,
    recipients json NOT NULL,
    settings json NOT NULL,
    icon text DEFAULT 'mail'::text NOT NULL,
    objective text,
    attachments json DEFAULT '[]'::json,
    partner_status text DEFAULT 'not_shared'::text
);


ALTER TABLE public.campaigns OWNER TO neondb_owner;

--
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaigns_id_seq OWNER TO neondb_owner;

--
-- Name: campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.campaigns_id_seq OWNED BY public.campaigns.id;


--
-- Name: catalogue_products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.catalogue_products (
    id integer NOT NULL,
    product_id integer NOT NULL,
    catalogue_id integer NOT NULL,
    category_id integer,
    visible boolean DEFAULT true,
    name_override text,
    price_override integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.catalogue_products OWNER TO neondb_owner;

--
-- Name: catalogue_products_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.catalogue_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.catalogue_products_id_seq OWNER TO neondb_owner;

--
-- Name: catalogue_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.catalogue_products_id_seq OWNED BY public.catalogue_products.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    icon text,
    description text,
    parent_id integer,
    level integer DEFAULT 1 NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: client_products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.client_products (
    id integer NOT NULL,
    client_id integer NOT NULL,
    product_id integer NOT NULL
);


ALTER TABLE public.client_products OWNER TO neondb_owner;

--
-- Name: client_products_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.client_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_products_id_seq OWNER TO neondb_owner;

--
-- Name: client_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.client_products_id_seq OWNED BY public.client_products.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    initials text NOT NULL
);


ALTER TABLE public.clients OWNER TO neondb_owner;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO neondb_owner;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: contact_tags; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contact_tags (
    id integer NOT NULL,
    contact_id integer NOT NULL,
    tag_id integer NOT NULL,
    tagged_by_id integer,
    tagged_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contact_tags OWNER TO neondb_owner;

--
-- Name: contact_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.contact_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_tags_id_seq OWNER TO neondb_owner;

--
-- Name: contact_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.contact_tags_id_seq OWNED BY public.contact_tags.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text,
    job_title text,
    department text,
    company text,
    linked_entity_type text,
    linked_entity_id integer,
    is_primary boolean DEFAULT false NOT NULL,
    notes text,
    tags text[],
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contacts OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contacts_id_seq OWNER TO neondb_owner;

--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: custom_environments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.custom_environments (
    id integer NOT NULL,
    name text NOT NULL,
    environment_id text NOT NULL,
    logo_url text,
    is_active boolean DEFAULT true NOT NULL,
    schema_name text NOT NULL,
    description text,
    created_by_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.custom_environments OWNER TO neondb_owner;

--
-- Name: custom_environments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.custom_environments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_environments_id_seq OWNER TO neondb_owner;

--
-- Name: custom_environments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.custom_environments_id_seq OWNED BY public.custom_environments.id;


--
-- Name: customer_partners; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customer_partners (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    partner_id integer NOT NULL
);


ALTER TABLE public.customer_partners OWNER TO neondb_owner;

--
-- Name: customer_partners_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.customer_partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_partners_id_seq OWNER TO neondb_owner;

--
-- Name: customer_partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customer_partners_id_seq OWNED BY public.customer_partners.id;


--
-- Name: customer_product_assignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customer_product_assignments (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    product_template_id integer NOT NULL,
    custom_price numeric(12,2),
    custom_discount numeric(12,2),
    custom_discount_percentage numeric(5,2),
    custom_premium_percentage numeric(5,2),
    customer_contract_start_date date,
    customer_contract_end_date date,
    assigned_by integer,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customer_product_assignments OWNER TO neondb_owner;

--
-- Name: customer_product_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.customer_product_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_product_assignments_id_seq OWNER TO neondb_owner;

--
-- Name: customer_product_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customer_product_assignments_id_seq OWNED BY public.customer_product_assignments.id;


--
-- Name: customer_team_members; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customer_team_members (
    id integer NOT NULL,
    customer_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.customer_team_members OWNER TO neondb_owner;

--
-- Name: customer_team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.customer_team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_team_members_id_seq OWNER TO neondb_owner;

--
-- Name: customer_team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customer_team_members_id_seq OWNED BY public.customer_team_members.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    owner_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO neondb_owner;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO neondb_owner;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    user_id integer NOT NULL,
    filename text NOT NULL,
    file_type text NOT NULL,
    file_size integer NOT NULL,
    content text NOT NULL,
    file_path text,
    upload_date timestamp without time zone DEFAULT now() NOT NULL,
    tags text[]
);


ALTER TABLE public.documents OWNER TO neondb_owner;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.documents_id_seq OWNER TO neondb_owner;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: email_blocks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_blocks (
    id integer NOT NULL,
    email_id integer NOT NULL,
    type text NOT NULL,
    content text NOT NULL,
    properties json,
    block_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_blocks OWNER TO neondb_owner;

--
-- Name: email_blocks_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.email_blocks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_blocks_id_seq OWNER TO neondb_owner;

--
-- Name: email_blocks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.email_blocks_id_seq OWNED BY public.email_blocks.id;


--
-- Name: entity_logos; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.entity_logos (
    id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    environment_id text NOT NULL,
    logo_data text NOT NULL,
    mime_type text NOT NULL,
    original_filename text,
    file_size integer,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.entity_logos OWNER TO neondb_owner;

--
-- Name: entity_logos_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.entity_logos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.entity_logos_id_seq OWNER TO neondb_owner;

--
-- Name: entity_logos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.entity_logos_id_seq OWNED BY public.entity_logos.id;


--
-- Name: file_comparisons; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.file_comparisons (
    id integer NOT NULL,
    user_id integer NOT NULL,
    document1_id integer NOT NULL,
    document2_id integer NOT NULL,
    comparison_date timestamp without time zone DEFAULT now() NOT NULL,
    differences_summary text NOT NULL,
    differences json NOT NULL
);


ALTER TABLE public.file_comparisons OWNER TO neondb_owner;

--
-- Name: file_comparisons_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.file_comparisons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.file_comparisons_id_seq OWNER TO neondb_owner;

--
-- Name: file_comparisons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.file_comparisons_id_seq OWNED BY public.file_comparisons.id;


--
-- Name: insurance_products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.insurance_products (
    id integer NOT NULL,
    name text NOT NULL,
    category text NOT NULL
);


ALTER TABLE public.insurance_products OWNER TO neondb_owner;

--
-- Name: insurance_products_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.insurance_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.insurance_products_id_seq OWNER TO neondb_owner;

--
-- Name: insurance_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.insurance_products_id_seq OWNED BY public.insurance_products.id;


--
-- Name: list_collaborators; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.list_collaborators (
    id integer NOT NULL,
    list_id integer NOT NULL,
    user_id integer,
    email text,
    name text,
    access_level text DEFAULT 'viewer'::text NOT NULL,
    invited_by_id integer NOT NULL,
    invited_at timestamp without time zone DEFAULT now() NOT NULL,
    accepted_at timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.list_collaborators OWNER TO neondb_owner;

--
-- Name: list_collaborators_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.list_collaborators_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.list_collaborators_id_seq OWNER TO neondb_owner;

--
-- Name: list_collaborators_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.list_collaborators_id_seq OWNED BY public.list_collaborators.id;


--
-- Name: news_articles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.news_articles (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    summary text NOT NULL,
    category text NOT NULL,
    image_url text NOT NULL,
    published_date timestamp without time zone NOT NULL
);


ALTER TABLE public.news_articles OWNER TO neondb_owner;

--
-- Name: news_articles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.news_articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_articles_id_seq OWNER TO neondb_owner;

--
-- Name: news_articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.news_articles_id_seq OWNED BY public.news_articles.id;


--
-- Name: next_best_actions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.next_best_actions (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    action_type text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    confidence numeric(3,2),
    reasoning text,
    status text DEFAULT 'pending'::text NOT NULL,
    context_data json,
    suggested_date timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.next_best_actions OWNER TO neondb_owner;

--
-- Name: next_best_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.next_best_actions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.next_best_actions_id_seq OWNER TO neondb_owner;

--
-- Name: next_best_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.next_best_actions_id_seq OWNED BY public.next_best_actions.id;


--
-- Name: okr_comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.okr_comments (
    id integer NOT NULL,
    metric_id integer NOT NULL,
    user_id integer NOT NULL,
    contact_id integer,
    partner_id integer,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.okr_comments OWNER TO neondb_owner;

--
-- Name: okr_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.okr_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.okr_comments_id_seq OWNER TO neondb_owner;

--
-- Name: okr_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.okr_comments_id_seq OWNED BY public.okr_comments.id;


--
-- Name: okr_metrics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.okr_metrics (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    realized_value text DEFAULT '0'::text,
    target_value text,
    ytd_value text,
    last_year_value text,
    measure_unit text DEFAULT 'number'::text NOT NULL,
    currency_type text DEFAULT 'USD'::text,
    traffic_light_thresholds json,
    progress_bar_thresholds json,
    picklist_options text[] DEFAULT '{}'::text[],
    responsible_user_id integer,
    responsible_contact_ids integer[] DEFAULT '{}'::integer[],
    timeframe_start timestamp without time zone,
    timeframe_end timestamp without time zone,
    frequency text DEFAULT 'none'::text NOT NULL,
    attachment_url text,
    due_date timestamp without time zone,
    is_muted boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    is_shared boolean DEFAULT true,
    hierarchy text DEFAULT 'activity'::text NOT NULL,
    parent_id integer,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by integer NOT NULL
);


ALTER TABLE public.okr_metrics OWNER TO neondb_owner;

--
-- Name: okr_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.okr_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.okr_metrics_id_seq OWNER TO neondb_owner;

--
-- Name: okr_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.okr_metrics_id_seq OWNED BY public.okr_metrics.id;


--
-- Name: okr_tags; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.okr_tags (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    color character varying(20) DEFAULT '#3B82F6'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.okr_tags OWNER TO neondb_owner;

--
-- Name: okr_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.okr_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.okr_tags_id_seq OWNER TO neondb_owner;

--
-- Name: okr_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.okr_tags_id_seq OWNED BY public.okr_tags.id;


--
-- Name: okr_template_assignments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.okr_template_assignments (
    id integer NOT NULL,
    template_id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT now(),
    assigned_by integer NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    due_date timestamp without time zone,
    responsible_user_id integer,
    notes text
);


ALTER TABLE public.okr_template_assignments OWNER TO neondb_owner;

--
-- Name: okr_template_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.okr_template_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.okr_template_assignments_id_seq OWNER TO neondb_owner;

--
-- Name: okr_template_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.okr_template_assignments_id_seq OWNED BY public.okr_template_assignments.id;


--
-- Name: opportunities; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.opportunities (
    id integer NOT NULL,
    client_id integer NOT NULL,
    product_id integer NOT NULL,
    probability integer NOT NULL,
    estimated_value integer NOT NULL,
    title text,
    status text,
    stage text,
    type text,
    description text,
    notes text,
    insurance_description text,
    expected_close_date timestamp without time zone,
    start_date timestamp without time zone,
    partner_id integer,
    owner_id integer,
    account_manager_id integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone,
    assessment_status text DEFAULT 'pending'::text,
    assessment_date timestamp without time zone,
    assessed_by_id integer,
    withhold_reasons text[],
    withhold_comments text,
    assessment_notes text,
    interaction_count integer DEFAULT 0
);


ALTER TABLE public.opportunities OWNER TO neondb_owner;

--
-- Name: opportunities_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.opportunities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.opportunities_id_seq OWNER TO neondb_owner;

--
-- Name: opportunities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.opportunities_id_seq OWNED BY public.opportunities.id;


--
-- Name: opportunity_assessment_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.opportunity_assessment_history (
    id integer NOT NULL,
    opportunity_id integer NOT NULL,
    previous_status text,
    new_status text NOT NULL,
    changed_by_id integer NOT NULL,
    reasons text[],
    comments text,
    changed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.opportunity_assessment_history OWNER TO neondb_owner;

--
-- Name: opportunity_assessment_history_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.opportunity_assessment_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.opportunity_assessment_history_id_seq OWNER TO neondb_owner;

--
-- Name: opportunity_assessment_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.opportunity_assessment_history_id_seq OWNED BY public.opportunity_assessment_history.id;


--
-- Name: opportunity_withhold_reasons; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.opportunity_withhold_reasons (
    id integer NOT NULL,
    category text NOT NULL,
    display_name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.opportunity_withhold_reasons OWNER TO neondb_owner;

--
-- Name: opportunity_withhold_reasons_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.opportunity_withhold_reasons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.opportunity_withhold_reasons_id_seq OWNER TO neondb_owner;

--
-- Name: opportunity_withhold_reasons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.opportunity_withhold_reasons_id_seq OWNED BY public.opportunity_withhold_reasons.id;


--
-- Name: partners; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.partners (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    status text DEFAULT 'active'::text NOT NULL,
    location text,
    contact_email text,
    primary_contact text,
    partner_type text,
    region text,
    assigned_user_ids integer[],
    linked_opportunity_ids integer[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.partners OWNER TO neondb_owner;

--
-- Name: partners_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.partners_id_seq OWNER TO neondb_owner;

--
-- Name: partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.partners_id_seq OWNED BY public.partners.id;


--
-- Name: product_catalog; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_catalog (
    id integer NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    category text NOT NULL,
    category_id integer,
    color_code text DEFAULT '#3B82F6'::text NOT NULL,
    ai_context text DEFAULT ''::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_catalog OWNER TO neondb_owner;

--
-- Name: product_catalog_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.product_catalog_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_catalog_id_seq OWNER TO neondb_owner;

--
-- Name: product_catalog_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.product_catalog_id_seq OWNED BY public.product_catalog.id;


--
-- Name: product_catalogues; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_catalogues (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    status text DEFAULT 'active'::text,
    effective_from date,
    effective_to date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_catalogues OWNER TO neondb_owner;

--
-- Name: product_catalogues_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.product_catalogues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_catalogues_id_seq OWNER TO neondb_owner;

--
-- Name: product_catalogues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.product_catalogues_id_seq OWNED BY public.product_catalogues.id;


--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_categories (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    parent_id integer,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_categories OWNER TO neondb_owner;

--
-- Name: product_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.product_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_categories_id_seq OWNER TO neondb_owner;

--
-- Name: product_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.product_categories_id_seq OWNED BY public.product_categories.id;


--
-- Name: product_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.product_templates (
    id integer NOT NULL,
    product_id text NOT NULL,
    name text NOT NULL,
    description text,
    category_id integer,
    category text,
    provider_id integer,
    provider_type text,
    provider_name text,
    contract_start_date date,
    contract_end_date date,
    average_price numeric(12,2),
    premium_value numeric(12,2),
    premium_percentage numeric(5,2),
    discount numeric(12,2),
    discount_percentage numeric(5,2),
    vendor_id integer,
    is_active boolean DEFAULT true NOT NULL,
    notes text,
    tags text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_templates OWNER TO neondb_owner;

--
-- Name: product_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.product_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_templates_id_seq OWNER TO neondb_owner;

--
-- Name: product_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.product_templates_id_seq OWNED BY public.product_templates.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.products (
    id integer NOT NULL,
    product_id text NOT NULL,
    name text NOT NULL,
    description text,
    category_id integer,
    category text,
    provider_id integer,
    provider_type text,
    provider_name text,
    contract_start_date date,
    contract_end_date date,
    total_value numeric(12,2),
    premium_value numeric(12,2),
    premium_percentage numeric(5,2),
    discount numeric(12,2),
    discount_percentage numeric(5,2),
    vendor_id integer,
    customer_id integer,
    opportunity_id integer,
    partner_id integer,
    is_active boolean DEFAULT true NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    tags text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.products OWNER TO neondb_owner;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO neondb_owner;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: saved_lists; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.saved_lists (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    type text NOT NULL,
    entity_type text NOT NULL,
    members integer[] DEFAULT '{}'::integer[],
    filters json NOT NULL,
    is_shared boolean DEFAULT false,
    is_default boolean DEFAULT false,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.saved_lists OWNER TO neondb_owner;

--
-- Name: saved_lists_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.saved_lists_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_lists_id_seq OWNER TO neondb_owner;

--
-- Name: saved_lists_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.saved_lists_id_seq OWNED BY public.saved_lists.id;


--
-- Name: saved_views; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.saved_views (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    entity_type text NOT NULL,
    filters json NOT NULL,
    is_shared boolean DEFAULT false,
    is_default boolean DEFAULT false,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.saved_views OWNER TO neondb_owner;

--
-- Name: saved_views_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.saved_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_views_id_seq OWNER TO neondb_owner;

--
-- Name: saved_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.saved_views_id_seq OWNED BY public.saved_views.id;


--
-- Name: tag_groups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tag_groups (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    color_scheme character varying(50),
    is_exclusive boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0,
    created_by_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tag_groups OWNER TO neondb_owner;

--
-- Name: tag_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.tag_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tag_groups_id_seq OWNER TO neondb_owner;

--
-- Name: tag_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.tag_groups_id_seq OWNED BY public.tag_groups.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    color character varying(7) DEFAULT '#3B82F6'::character varying NOT NULL,
    group_id integer,
    usage_count integer DEFAULT 0 NOT NULL,
    created_by_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tags OWNER TO neondb_owner;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO neondb_owner;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: transformation_scripts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transformation_scripts (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    entity_type text NOT NULL,
    environment_id text NOT NULL,
    script_content text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transformation_scripts OWNER TO neondb_owner;

--
-- Name: transformation_scripts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.transformation_scripts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transformation_scripts_id_seq OWNER TO neondb_owner;

--
-- Name: transformation_scripts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.transformation_scripts_id_seq OWNED BY public.transformation_scripts.id;


--
-- Name: upload_errors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.upload_errors (
    id integer NOT NULL,
    session_id text NOT NULL,
    row_number integer NOT NULL,
    error_type text NOT NULL,
    error_message text NOT NULL,
    problematic_data json,
    resolution_action text,
    is_resolved boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.upload_errors OWNER TO neondb_owner;

--
-- Name: upload_errors_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.upload_errors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upload_errors_id_seq OWNER TO neondb_owner;

--
-- Name: upload_errors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.upload_errors_id_seq OWNED BY public.upload_errors.id;


--
-- Name: upload_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.upload_sessions (
    id integer NOT NULL,
    session_id text NOT NULL,
    entity_type text NOT NULL,
    environment_id text NOT NULL,
    file_name text NOT NULL,
    status text DEFAULT 'uploading'::text NOT NULL,
    current_step integer DEFAULT 1 NOT NULL,
    error_log json,
    processed_rows integer DEFAULT 0,
    total_rows integer DEFAULT 0,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.upload_sessions OWNER TO neondb_owner;

--
-- Name: upload_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.upload_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upload_sessions_id_seq OWNER TO neondb_owner;

--
-- Name: upload_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.upload_sessions_id_seq OWNED BY public.upload_sessions.id;


--
-- Name: upload_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.upload_settings (
    id integer NOT NULL,
    environment_id text NOT NULL,
    entity_type text NOT NULL,
    attribute_name text NOT NULL,
    is_mandatory boolean DEFAULT false NOT NULL,
    data_type text,
    validation_rules json,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.upload_settings OWNER TO neondb_owner;

--
-- Name: upload_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.upload_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upload_settings_id_seq OWNER TO neondb_owner;

--
-- Name: upload_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.upload_settings_id_seq OWNED BY public.upload_settings.id;


--
-- Name: upload_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.upload_templates (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    entity_type text NOT NULL,
    environment_id text NOT NULL,
    column_mappings json NOT NULL,
    is_shared boolean DEFAULT false NOT NULL,
    usage_count integer DEFAULT 0 NOT NULL,
    last_used_at timestamp without time zone,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.upload_templates OWNER TO neondb_owner;

--
-- Name: upload_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.upload_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.upload_templates_id_seq OWNER TO neondb_owner;

--
-- Name: upload_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.upload_templates_id_seq OWNED BY public.upload_templates.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    full_name text NOT NULL,
    first_name text,
    last_name text,
    avatar_initials text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    department text,
    job_title text,
    phone text,
    is_active boolean DEFAULT true NOT NULL,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vendors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendors (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    initials text,
    contact_name text,
    contact_email text,
    contact_phone text,
    owner_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.vendors OWNER TO neondb_owner;

--
-- Name: vendors_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.vendors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendors_id_seq OWNER TO neondb_owner;

--
-- Name: vendors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.vendors_id_seq OWNED BY public.vendors.id;


--
-- Name: okr_metrics; Type: TABLE; Schema: qollabi; Owner: neondb_owner
--

CREATE TABLE qollabi.okr_metrics (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    template_id integer,
    target_value integer,
    realized_value integer,
    unit text DEFAULT 'number'::text,
    progress integer,
    status text DEFAULT 'on_track'::text,
    responsible_id integer,
    due_date timestamp without time zone,
    timeframe text,
    frequency text DEFAULT 'once'::text,
    parent_id integer,
    hierarchy text DEFAULT 'activity'::text,
    tags text[] DEFAULT '{}'::text[],
    type text DEFAULT 'number'::text,
    target integer,
    tag text,
    milestone_frequency text,
    is_expanded boolean DEFAULT false,
    nested_count integer DEFAULT 0,
    traffic_lights boolean DEFAULT false,
    traffic_light_style text DEFAULT 'system'::text,
    progress_bar boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE qollabi.okr_metrics OWNER TO neondb_owner;

--
-- Name: okr_metrics_id_seq; Type: SEQUENCE; Schema: qollabi; Owner: neondb_owner
--

CREATE SEQUENCE qollabi.okr_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE qollabi.okr_metrics_id_seq OWNER TO neondb_owner;

--
-- Name: okr_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: qollabi; Owner: neondb_owner
--

ALTER SEQUENCE qollabi.okr_metrics_id_seq OWNED BY qollabi.okr_metrics.id;


--
-- Name: okr_templates; Type: TABLE; Schema: qollabi; Owner: neondb_owner
--

CREATE TABLE qollabi.okr_templates (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    created_by integer
);


ALTER TABLE qollabi.okr_templates OWNER TO neondb_owner;

--
-- Name: okr_templates_id_seq; Type: SEQUENCE; Schema: qollabi; Owner: neondb_owner
--

CREATE SEQUENCE qollabi.okr_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE qollabi.okr_templates_id_seq OWNER TO neondb_owner;

--
-- Name: okr_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: qollabi; Owner: neondb_owner
--

ALTER SEQUENCE qollabi.okr_templates_id_seq OWNED BY qollabi.okr_templates.id;


--
-- Name: activity_attachments id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.activity_attachments ALTER COLUMN id SET DEFAULT nextval('degoudse.activity_attachments_id_seq'::regclass);


--
-- Name: activity_comments id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.activity_comments ALTER COLUMN id SET DEFAULT nextval('degoudse.activity_comments_id_seq'::regclass);


--
-- Name: activity_reactions id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.activity_reactions ALTER COLUMN id SET DEFAULT nextval('degoudse.activity_reactions_id_seq'::regclass);


--
-- Name: activity_tasks id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.activity_tasks ALTER COLUMN id SET DEFAULT nextval('degoudse.activity_tasks_id_seq'::regclass);


--
-- Name: broker_partner_mappings id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.broker_partner_mappings ALTER COLUMN id SET DEFAULT nextval('degoudse.broker_partner_mappings_id_seq'::regclass);


--
-- Name: campaign_assignments id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_assignments ALTER COLUMN id SET DEFAULT nextval('degoudse.campaign_assignments_id_seq'::regclass);


--
-- Name: campaign_follow_ups id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_follow_ups ALTER COLUMN id SET DEFAULT nextval('degoudse.campaign_follow_ups_id_seq'::regclass);


--
-- Name: campaign_recipients id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_recipients ALTER COLUMN id SET DEFAULT nextval('degoudse.campaign_recipients_id_seq'::regclass);


--
-- Name: campaign_shares id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_shares ALTER COLUMN id SET DEFAULT nextval('degoudse.campaign_shares_id_seq'::regclass);


--
-- Name: campaigns id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaigns ALTER COLUMN id SET DEFAULT nextval('degoudse.campaigns_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.categories ALTER COLUMN id SET DEFAULT nextval('degoudse.categories_id_seq'::regclass);


--
-- Name: contact_relationships id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.contact_relationships ALTER COLUMN id SET DEFAULT nextval('degoudse.contact_relationships_id_seq'::regclass);


--
-- Name: contact_tags id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.contact_tags ALTER COLUMN id SET DEFAULT nextval('degoudse.contact_tags_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.contacts ALTER COLUMN id SET DEFAULT nextval('degoudse.contacts_id_seq'::regclass);


--
-- Name: customer_opportunities id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customer_opportunities ALTER COLUMN id SET DEFAULT nextval('degoudse.customer_opportunities_id_seq'::regclass);


--
-- Name: customer_product_assignments id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customer_product_assignments ALTER COLUMN id SET DEFAULT nextval('degoudse.customer_product_assignments_id_seq'::regclass);


--
-- Name: customer_products id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customer_products ALTER COLUMN id SET DEFAULT nextval('degoudse.customer_products_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customers ALTER COLUMN id SET DEFAULT nextval('degoudse.customers_id_seq'::regclass);


--
-- Name: entity_logos id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.entity_logos ALTER COLUMN id SET DEFAULT nextval('degoudse.entity_logos_id_seq'::regclass);


--
-- Name: list_collaborators id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.list_collaborators ALTER COLUMN id SET DEFAULT nextval('degoudse.list_collaborators_id_seq'::regclass);


--
-- Name: okr_metrics id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.okr_metrics ALTER COLUMN id SET DEFAULT nextval('degoudse.okr_metrics_id_seq'::regclass);


--
-- Name: okr_tags id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.okr_tags ALTER COLUMN id SET DEFAULT nextval('degoudse.okr_tags_id_seq'::regclass);


--
-- Name: okr_template_assignments id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.okr_template_assignments ALTER COLUMN id SET DEFAULT nextval('degoudse.okr_template_assignments_id_seq'::regclass);


--
-- Name: opportunities id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.opportunities ALTER COLUMN id SET DEFAULT nextval('degoudse.opportunities_id_seq'::regclass);


--
-- Name: opportunity_products id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.opportunity_products ALTER COLUMN id SET DEFAULT nextval('degoudse.opportunity_products_id_seq'::regclass);


--
-- Name: partner_customers id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partner_customers ALTER COLUMN id SET DEFAULT nextval('degoudse.partner_customers_id_seq'::regclass);


--
-- Name: partner_opportunities id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partner_opportunities ALTER COLUMN id SET DEFAULT nextval('degoudse.partner_opportunities_id_seq'::regclass);


--
-- Name: partner_products id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partner_products ALTER COLUMN id SET DEFAULT nextval('degoudse.partner_products_id_seq'::regclass);


--
-- Name: partners id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partners ALTER COLUMN id SET DEFAULT nextval('degoudse.partners_id_seq'::regclass);


--
-- Name: product_customers id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.product_customers ALTER COLUMN id SET DEFAULT nextval('degoudse.product_customers_id_seq'::regclass);


--
-- Name: product_templates id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.product_templates ALTER COLUMN id SET DEFAULT nextval('degoudse.product_templates_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.products ALTER COLUMN id SET DEFAULT nextval('degoudse.products_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.projects ALTER COLUMN id SET DEFAULT nextval('degoudse.projects_id_seq'::regclass);


--
-- Name: saved_lists id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.saved_lists ALTER COLUMN id SET DEFAULT nextval('degoudse.saved_lists_id_seq'::regclass);


--
-- Name: saved_views id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.saved_views ALTER COLUMN id SET DEFAULT nextval('degoudse.saved_views_id_seq'::regclass);


--
-- Name: tag_categories id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tag_categories ALTER COLUMN id SET DEFAULT nextval('degoudse.tag_categories_id_seq'::regclass);


--
-- Name: tag_groups id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tag_groups ALTER COLUMN id SET DEFAULT nextval('degoudse.tag_groups_id_seq'::regclass);


--
-- Name: tag_types id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tag_types ALTER COLUMN id SET DEFAULT nextval('degoudse.tag_types_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tags ALTER COLUMN id SET DEFAULT nextval('degoudse.tags_id_seq'::regclass);


--
-- Name: unified_activities id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.unified_activities ALTER COLUMN id SET DEFAULT nextval('degoudse.unified_activities_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.users ALTER COLUMN id SET DEFAULT nextval('degoudse.users_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.vendors ALTER COLUMN id SET DEFAULT nextval('degoudse.vendors_id_seq'::regclass);


--
-- Name: activity_attachments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_attachments ALTER COLUMN id SET DEFAULT nextval('public.activity_attachments_id_seq'::regclass);


--
-- Name: activity_comments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_comments ALTER COLUMN id SET DEFAULT nextval('public.activity_comments_id_seq'::regclass);


--
-- Name: activity_reactions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_reactions ALTER COLUMN id SET DEFAULT nextval('public.activity_reactions_id_seq'::regclass);


--
-- Name: activity_tasks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_tasks ALTER COLUMN id SET DEFAULT nextval('public.activity_tasks_id_seq'::regclass);


--
-- Name: broker_partner_mappings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.broker_partner_mappings ALTER COLUMN id SET DEFAULT nextval('public.broker_partner_mappings_id_seq'::regclass);


--
-- Name: campaign_assignments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_assignments ALTER COLUMN id SET DEFAULT nextval('public.campaign_assignments_id_seq'::regclass);


--
-- Name: campaign_emails id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_emails ALTER COLUMN id SET DEFAULT nextval('public.campaign_emails_id_seq'::regclass);


--
-- Name: campaign_follow_ups id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_follow_ups ALTER COLUMN id SET DEFAULT nextval('public.campaign_follow_ups_id_seq'::regclass);


--
-- Name: campaign_recipients id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_recipients ALTER COLUMN id SET DEFAULT nextval('public.campaign_recipients_id_seq'::regclass);


--
-- Name: campaign_shares id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_shares ALTER COLUMN id SET DEFAULT nextval('public.campaign_shares_id_seq'::regclass);


--
-- Name: campaign_templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_templates ALTER COLUMN id SET DEFAULT nextval('public.campaign_templates_id_seq'::regclass);


--
-- Name: campaigns id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);


--
-- Name: catalogue_products id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.catalogue_products ALTER COLUMN id SET DEFAULT nextval('public.catalogue_products_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: client_products id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.client_products ALTER COLUMN id SET DEFAULT nextval('public.client_products_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: contact_tags id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contact_tags ALTER COLUMN id SET DEFAULT nextval('public.contact_tags_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: custom_environments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_environments ALTER COLUMN id SET DEFAULT nextval('public.custom_environments_id_seq'::regclass);


--
-- Name: customer_partners id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_partners ALTER COLUMN id SET DEFAULT nextval('public.customer_partners_id_seq'::regclass);


--
-- Name: customer_product_assignments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_product_assignments ALTER COLUMN id SET DEFAULT nextval('public.customer_product_assignments_id_seq'::regclass);


--
-- Name: customer_team_members id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_team_members ALTER COLUMN id SET DEFAULT nextval('public.customer_team_members_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: email_blocks id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_blocks ALTER COLUMN id SET DEFAULT nextval('public.email_blocks_id_seq'::regclass);


--
-- Name: entity_logos id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.entity_logos ALTER COLUMN id SET DEFAULT nextval('public.entity_logos_id_seq'::regclass);


--
-- Name: file_comparisons id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.file_comparisons ALTER COLUMN id SET DEFAULT nextval('public.file_comparisons_id_seq'::regclass);


--
-- Name: insurance_products id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.insurance_products ALTER COLUMN id SET DEFAULT nextval('public.insurance_products_id_seq'::regclass);


--
-- Name: list_collaborators id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.list_collaborators ALTER COLUMN id SET DEFAULT nextval('public.list_collaborators_id_seq'::regclass);


--
-- Name: news_articles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.news_articles ALTER COLUMN id SET DEFAULT nextval('public.news_articles_id_seq'::regclass);


--
-- Name: next_best_actions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.next_best_actions ALTER COLUMN id SET DEFAULT nextval('public.next_best_actions_id_seq'::regclass);


--
-- Name: okr_comments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_comments ALTER COLUMN id SET DEFAULT nextval('public.okr_comments_id_seq'::regclass);


--
-- Name: okr_metrics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_metrics ALTER COLUMN id SET DEFAULT nextval('public.okr_metrics_id_seq'::regclass);


--
-- Name: okr_tags id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_tags ALTER COLUMN id SET DEFAULT nextval('public.okr_tags_id_seq'::regclass);


--
-- Name: okr_template_assignments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_template_assignments ALTER COLUMN id SET DEFAULT nextval('public.okr_template_assignments_id_seq'::regclass);


--
-- Name: opportunities id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunities ALTER COLUMN id SET DEFAULT nextval('public.opportunities_id_seq'::regclass);


--
-- Name: opportunity_assessment_history id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunity_assessment_history ALTER COLUMN id SET DEFAULT nextval('public.opportunity_assessment_history_id_seq'::regclass);


--
-- Name: opportunity_withhold_reasons id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunity_withhold_reasons ALTER COLUMN id SET DEFAULT nextval('public.opportunity_withhold_reasons_id_seq'::regclass);


--
-- Name: partners id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.partners ALTER COLUMN id SET DEFAULT nextval('public.partners_id_seq'::regclass);


--
-- Name: product_catalog id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_catalog ALTER COLUMN id SET DEFAULT nextval('public.product_catalog_id_seq'::regclass);


--
-- Name: product_catalogues id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_catalogues ALTER COLUMN id SET DEFAULT nextval('public.product_catalogues_id_seq'::regclass);


--
-- Name: product_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_categories ALTER COLUMN id SET DEFAULT nextval('public.product_categories_id_seq'::regclass);


--
-- Name: product_templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_templates ALTER COLUMN id SET DEFAULT nextval('public.product_templates_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: saved_lists id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_lists ALTER COLUMN id SET DEFAULT nextval('public.saved_lists_id_seq'::regclass);


--
-- Name: saved_views id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_views ALTER COLUMN id SET DEFAULT nextval('public.saved_views_id_seq'::regclass);


--
-- Name: tag_groups id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tag_groups ALTER COLUMN id SET DEFAULT nextval('public.tag_groups_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: transformation_scripts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transformation_scripts ALTER COLUMN id SET DEFAULT nextval('public.transformation_scripts_id_seq'::regclass);


--
-- Name: upload_errors id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_errors ALTER COLUMN id SET DEFAULT nextval('public.upload_errors_id_seq'::regclass);


--
-- Name: upload_sessions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_sessions ALTER COLUMN id SET DEFAULT nextval('public.upload_sessions_id_seq'::regclass);


--
-- Name: upload_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_settings ALTER COLUMN id SET DEFAULT nextval('public.upload_settings_id_seq'::regclass);


--
-- Name: upload_templates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_templates ALTER COLUMN id SET DEFAULT nextval('public.upload_templates_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vendors id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors ALTER COLUMN id SET DEFAULT nextval('public.vendors_id_seq'::regclass);


--
-- Name: okr_metrics id; Type: DEFAULT; Schema: qollabi; Owner: neondb_owner
--

ALTER TABLE ONLY qollabi.okr_metrics ALTER COLUMN id SET DEFAULT nextval('qollabi.okr_metrics_id_seq'::regclass);


--
-- Name: okr_templates id; Type: DEFAULT; Schema: qollabi; Owner: neondb_owner
--

ALTER TABLE ONLY qollabi.okr_templates ALTER COLUMN id SET DEFAULT nextval('qollabi.okr_templates_id_seq'::regclass);


--
-- Data for Name: activity_attachments; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.activity_attachments (id, activity_id, file_name, file_path, file_size, mime_type, created_at, filename, partner_id, uploaded_by_id, visible_to_partner) FROM stdin;
\.


--
-- Data for Name: activity_comments; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.activity_comments (id, partner_id, content, visible_to_partner, user_id, created_at, updated_at, synced_from_partner_id, is_synced, entity_type, entity_id) FROM stdin;
1	1	Partnership performance is exceeding expectations this quarter	t	1	2025-06-16 14:34:44.119749	2025-06-16 14:34:44.119749	\N	f	\N	\N
2	1	Testing comment creation after endpoint fix	f	1	2025-06-16 14:42:47.215746	2025-06-16 14:42:47.215746	\N	f	\N	\N
5	12	Just activated our social media campaign - already seeing good engagement on that industry-specific content we planned.	t	1	2025-01-08 10:30:00	2025-06-17 12:42:49.998065	\N	f	\N	\N
6	12	Great! I've got those solar panel leads ready for you. 12 clients without environmental coverage - want me to prep the specialized quotes?	t	2	2025-01-08 14:15:00	2025-06-17 12:42:49.998065	\N	f	\N	\N
7	12	Perfect timing. Also, confirmed that networking event for next Thursday. Should be good for our motor/legal assistance cross-sell strategy.	t	1	2025-01-09 09:40:00	2025-06-17 12:42:49.998065	\N	f	\N	\N
8	12	Excellent. Quick update - I've set up the auto-steps for those GL clients missing PI coverage. Should streamline the process.	t	2	2025-01-10 11:00:00	2025-06-17 12:42:49.998065	\N	f	\N	\N
9	12	Nice! Speaking of streamlining, how's that Boris tool training coming along? My team could use a refresher.	t	1	2025-01-13 16:25:00	2025-06-17 12:42:49.998065	\N	f	\N	\N
10	12	Already scheduled for next week. Also, that growth financing package got approved - your client can move forward with the acquisition.	t	2	2025-01-14 13:20:00	2025-06-17 12:42:49.998065	\N	f	\N	\N
11	12	Fantastic news! By the way, our retention model is working - only had 2 cancellations this month versus 8 last month.	t	1	2025-01-17 10:05:00	2025-06-17 12:42:49.998065	\N	f	\N	\N
12	12	Love to hear it! I'm organizing that regional meeting for March. Want to showcase these success stories to the other brokers.	t	2	2025-01-20 15:10:00	2025-06-17 12:42:49.998065	\N	f	\N	\N
13	12	Absolutely. This transition plan is really paying off - our collaboration numbers are through the roof.	t	1	2025-01-23 11:45:00	2025-06-17 12:42:49.998065	\N	f	\N	\N
18	4	Just activated our social media campaign - already seeing good engagement on that industry-specific content we planned.	t	1	2025-01-08 10:30:00	2025-06-17 12:42:49.998065	12	t	\N	\N
19	4	Great! I've got those solar panel leads ready for you. 12 clients without environmental coverage - want me to prep the specialized quotes?	t	2	2025-01-08 14:15:00	2025-06-17 12:42:49.998065	12	t	\N	\N
20	4	Perfect timing. Also, confirmed that networking event for next Thursday. Should be good for our motor/legal assistance cross-sell strategy.	t	1	2025-01-09 09:40:00	2025-06-17 12:42:49.998065	12	t	\N	\N
21	4	Excellent. Quick update - I've set up the auto-steps for those GL clients missing PI coverage. Should streamline the process.	t	2	2025-01-10 11:00:00	2025-06-17 12:42:49.998065	12	t	\N	\N
22	4	Nice! Speaking of streamlining, how's that Boris tool training coming along? My team could use a refresher.	t	1	2025-01-13 16:25:00	2025-06-17 12:42:49.998065	12	t	\N	\N
23	4	Already scheduled for next week. Also, that growth financing package got approved - your client can move forward with the acquisition.	t	2	2025-01-14 13:20:00	2025-06-17 12:42:49.998065	12	t	\N	\N
24	4	Fantastic news! By the way, our retention model is working - only had 2 cancellations this month versus 8 last month.	t	1	2025-01-17 10:05:00	2025-06-17 12:42:49.998065	12	t	\N	\N
25	4	Love to hear it! I'm organizing that regional meeting for March. Want to showcase these success stories to the other brokers.	t	2	2025-01-20 15:10:00	2025-06-17 12:42:49.998065	12	t	\N	\N
26	4	Absolutely. This transition plan is really paying off - our collaboration numbers are through the roof.	t	1	2025-01-23 11:45:00	2025-06-17 12:42:49.998065	12	t	\N	\N
30	6	Test comment from opportunity	f	1	2025-06-25 15:50:45.836261	2025-06-25 15:50:45.836261	\N	f	\N	\N
31	1	Test comment from partner	f	1	2025-06-25 15:55:13.069943	2025-06-25 15:55:13.069943	\N	f	\N	\N
33	6	Test comment	f	1	2025-06-25 15:59:10.600717	2025-06-25 15:59:10.600717	\N	f	\N	\N
35	6	Test comment with proper content	f	1	2025-06-25 16:03:08.529698	2025-06-25 16:03:08.529698	\N	f	\N	\N
36	6	Testing timeline display	t	1	2025-06-25 16:05:10.726541	2025-06-25 16:05:10.726541	\N	f	\N	\N
37	6	Test comment to verify endpoint	t	1	2025-06-25 16:08:39.375883	2025-06-25 16:08:39.375883	\N	f	\N	\N
38	6	comment 101	f	1	2025-06-25 16:09:55.714194	2025-06-25 16:09:55.714194	\N	f	\N	\N
39	1	Testing comment with real user name from Albrecht Bouwman	t	4	2025-06-25 16:19:43.772206	2025-06-25 16:19:43.772206	\N	f	\N	\N
40	1	Another comment from Alex Salden to test user names	t	5	2025-06-25 16:19:44.986167	2025-06-25 16:19:44.986167	\N	f	\N	\N
41	6	add a comment	f	1	2025-06-26 10:25:44.992829	2025-06-26 10:25:44.992829	\N	f	\N	\N
42	\N	Initial assessment completed for Amazon CS IT infrastructure requirements	t	4	2025-07-16 08:44:06.49872	2025-07-16 08:44:06.49872	\N	f	partner	1
43	\N	Accenture team expressed strong interest in cyber security package	t	4	2025-07-16 08:44:06.49872	2025-07-16 08:44:06.49872	\N	f	partner	1
44	\N	ABN AMRO meeting scheduled for next week to discuss financial services coverage	f	4	2025-07-16 08:44:06.49872	2025-07-16 08:44:06.49872	\N	f	partner	1
45	\N	Boston Consulting Group requesting additional risk assessment documentation	t	4	2025-07-16 08:44:06.49872	2025-07-16 08:44:06.49872	\N	f	partner	1
46	\N	Willis partnership showing strong performance this quarter	f	4	2025-07-16 08:44:06.49872	2025-07-16 08:44:06.49872	\N	f	partner	1
47	\N	Initial assessment completed for Amazon CS IT infrastructure requirements	t	4	2025-07-16 08:44:06.49872	2025-07-16 08:44:06.49872	\N	f	partner	43
48	\N	Accenture team expressed strong interest in cyber security package	t	4	2025-07-16 08:44:06.49872	2025-07-16 08:44:06.49872	\N	f	partner	43
49	\N	ABN AMRO meeting scheduled for next week to discuss financial services coverage	f	4	2025-07-16 08:44:06.49872	2025-07-16 08:44:06.49872	\N	f	partner	43
50	\N	Boston Consulting Group requesting additional risk assessment documentation	t	4	2025-07-16 08:44:06.49872	2025-07-16 08:44:06.49872	\N	f	partner	43
51	\N	Willis partnership showing strong performance this quarter	f	4	2025-07-16 08:44:06.49872	2025-07-16 08:44:06.49872	\N	f	partner	43
52	\N	Initial assessment completed for Amazon CS IT infrastructure requirements	t	4	2025-07-16 14:14:33.668991	2025-07-16 14:14:33.668991	\N	f	partner	26
53	\N	Accenture team expressed strong interest in cyber security package	t	4	2025-07-16 14:14:33.668991	2025-07-16 14:14:33.668991	\N	f	partner	26
54	\N	ABN AMRO meeting scheduled for next week to discuss financial services coverage	f	4	2025-07-16 14:14:33.668991	2025-07-16 14:14:33.668991	\N	f	partner	26
55	\N	Boston Consulting Group requesting additional risk assessment documentation	t	4	2025-07-16 14:14:33.668991	2025-07-16 14:14:33.668991	\N	f	partner	26
56	\N	Willis partnership showing strong performance this quarter	f	4	2025-07-16 14:14:33.668991	2025-07-16 14:14:33.668991	\N	f	partner	26
57	\N	Opportunity accepted. Notes: This looks like a good opportunity	t	4	2025-07-20 13:28:01.174335	2025-07-20 13:28:01.174335	\N	f	opportunity	162
58	\N	Opportunity withheld. Reasons: Resource constraints, Existing client relationship conflicts. Comments: Not a good fit at this time	t	4	2025-07-20 13:28:07.299041	2025-07-20 13:28:07.299041	\N	f	opportunity	169
59	\N	Opportunity withheld. Reasons: Existing client relationship conflicts. Comments: Test	t	1	2025-07-20 13:29:48.059164	2025-07-20 13:29:48.059164	\N	f	opportunity	162
60	\N	Opportunity withheld. Reasons: Resource constraints. Comments: Test	t	1	2025-07-20 13:38:41.582485	2025-07-20 13:38:41.582485	\N	f	opportunity	162
61	\N	Opportunity withheld. Reasons: Existing client relationship conflicts. Comments: Test	t	1	2025-07-20 13:41:18.993646	2025-07-20 13:41:18.993646	\N	f	opportunity	162
62	\N	Opportunity accepted	t	1	2025-07-20 13:45:45.462504	2025-07-20 13:45:45.462504	\N	f	opportunity	162
63	\N	Opportunity withheld. Reasons: Strong competition. Comments: Test	t	1	2025-07-20 13:45:51.537368	2025-07-20 13:45:51.537368	\N	f	opportunity	163
64	\N	Opportunity accepted	t	1	2025-07-20 13:51:51.580167	2025-07-20 13:51:51.580167	\N	f	opportunity	445
65	\N	Opportunity withheld. Reasons: Strong competition. Comments: Test	t	1	2025-07-20 13:51:59.529278	2025-07-20 13:51:59.529278	\N	f	opportunity	446
66	\N	Opportunity accepted	t	4	2025-07-20 13:55:43.965851	2025-07-20 13:55:43.965851	\N	f	opportunity	376
67	\N	Opportunity accepted	t	4	2025-07-20 13:57:05.834215	2025-07-20 13:57:05.834215	\N	f	opportunity	376
68	\N	Opportunity accepted	t	4	2025-07-20 14:01:44.821927	2025-07-20 14:01:44.821927	\N	f	opportunity	376
69	\N	Opportunity accepted	t	4	2025-07-20 14:02:00.85609	2025-07-20 14:02:00.85609	\N	f	opportunity	376
70	\N	Opportunity accepted	t	4	2025-07-20 14:06:10.126696	2025-07-20 14:06:10.126696	\N	f	opportunity	376
71	\N	Opportunity accepted	t	4	2025-07-20 14:06:27.628457	2025-07-20 14:06:27.628457	\N	f	opportunity	376
72	\N	Opportunity accepted	t	4	2025-07-20 14:09:01.973823	2025-07-20 14:09:01.973823	\N	f	opportunity	376
73	\N	Opportunity accepted	t	4	2025-07-20 14:09:09.661345	2025-07-20 14:09:09.661345	\N	f	opportunity	377
74	\N	Opportunity accepted	t	1	2025-07-20 14:14:21.343022	2025-07-20 14:14:21.343022	\N	f	opportunity	376
75	\N	Opportunity withheld. Reasons: Technical Concerns. Comments: test	t	1	2025-07-20 14:14:30.428779	2025-07-20 14:14:30.428779	\N	f	opportunity	377
76	\N	Opportunity accepted	t	1	2025-07-20 14:17:35.465489	2025-07-20 14:17:35.465489	\N	f	opportunity	376
77	\N	Opportunity withheld. Reasons: Budget Constraints. Comments: test	t	1	2025-07-20 14:17:43.836421	2025-07-20 14:17:43.836421	\N	f	opportunity	377
78	\N	Opportunity accepted	t	1	2025-07-20 14:22:10.79269	2025-07-20 14:22:10.79269	\N	f	opportunity	376
79	\N	Opportunity withheld. Reasons: Timing Issues. Comments: test	t	1	2025-07-20 14:22:18.749511	2025-07-20 14:22:18.749511	\N	f	opportunity	377
80	\N	Opportunity accepted	t	1	2025-07-20 14:23:02.567963	2025-07-20 14:23:02.567963	\N	f	opportunity	376
81	\N	Opportunity withheld. Reasons: Not a Priority. Comments: Test Frie	t	1	2025-07-20 14:23:17.834326	2025-07-20 14:23:17.834326	\N	f	opportunity	376
82	\N	Opportunity accepted	t	1	2025-07-20 14:31:00.335584	2025-07-20 14:31:00.335584	\N	f	opportunity	379
83	\N	Opportunity accepted	t	1	2025-07-22 08:27:50.309872	2025-07-22 08:27:50.309872	\N	f	opportunity	377
84	\N	Opportunity withheld. Reasons: Budget Constraints. Comments: Test Comment	t	1	2025-07-22 08:28:08.323311	2025-07-22 08:28:08.323311	\N	f	opportunity	377
85	\N	Opportunity accepted	t	1	2025-07-22 08:45:24.314916	2025-07-22 08:45:24.314916	\N	f	opportunity	378
86	\N	Opportunity withheld. Reasons: Not a Priority	t	1	2025-07-22 08:45:52.469823	2025-07-22 08:45:52.469823	\N	f	opportunity	378
87	\N	Opportunity accepted	t	1	2025-07-22 08:46:43.409747	2025-07-22 08:46:43.409747	\N	f	opportunity	376
88	\N	Opportunity accepted	t	1	2025-07-22 10:26:08.927088	2025-07-22 10:26:08.927088	\N	f	opportunity	377
89	\N	Opportunity accepted	t	1	2025-07-22 12:07:22.375438	2025-07-22 12:07:22.375438	\N	f	opportunity	121
90	\N	Opportunity withheld. Reasons: Timing Issues. Comments: Test	t	1	2025-07-22 13:53:33.196671	2025-07-22 13:53:33.196671	\N	f	opportunity	396
91	\N	Opportunity accepted	t	1	2025-07-25 09:49:25.05088	2025-07-25 09:49:25.05088	\N	f	opportunity	172
92	\N	Opportunity withheld. Reasons: Poor timing. Comments: somethinh	t	1	2025-07-28 08:13:39.680459	2025-07-28 08:13:39.680459	\N	f	opportunity	173
\.


--
-- Data for Name: activity_reactions; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.activity_reactions (id, activity_type, activity_id, user_id, emoji, created_at) FROM stdin;
1	comment	1	1	👍	2025-06-25 22:12:48.65995
3	comment	39	1	👍	2025-06-25 22:12:57.382217
4	comment	39	1	💪	2025-06-25 22:13:05.653367
5	comment	40	1	👍	2025-06-25 22:16:53.286907
7	comment	31	1	👍	2025-06-25 22:28:12.068141
9	comment	30	1	💪	2025-06-25 22:30:03.497604
10	comment	33	1	👍	2025-06-25 22:30:11.760541
11	comment	33	1	💪	2025-06-25 22:30:15.706803
12	task	32	1	👍	2025-06-25 22:41:21.173269
\.


--
-- Data for Name: activity_tasks; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.activity_tasks (id, title, description, status, priority, assigned_to, entity_type, entity_id, partner_id, due_date, completed_at, created_at, updated_at, completed, visible_to_partner, synced_from_partner_id, is_synced) FROM stdin;
45	Review IT Infrastructure Proposal	Review and finalize the IT infrastructure insurance proposal for Amazon CS	pending	high	4	partner	43	43	\N	\N	2025-07-16 08:43:55.238024	2025-07-16 08:43:55.238024	f	t	\N	f
46	Follow up on Cyber Security Quote	Follow up with Accenture regarding their cyber security package decision	pending	medium	4	partner	43	43	\N	\N	2025-07-16 08:43:55.238024	2025-07-16 08:43:55.238024	f	t	\N	f
47	Prepare Financial Services Presentation	Prepare comprehensive presentation for ABN AMRO Bank meeting	pending	high	4	partner	43	43	\N	\N	2025-07-16 08:43:55.238024	2025-07-16 08:43:55.238024	f	f	\N	f
48	Schedule Risk Assessment Meeting	Schedule risk assessment meeting with Boston Consulting Group	pending	medium	4	partner	43	43	\N	\N	2025-07-16 08:43:55.238024	2025-07-16 08:43:55.238024	f	t	\N	f
5	Test partnership review	Review Q4 performance metrics	pending	high	1	\N	\N	1	\N	\N	2025-06-16 14:34:10.63736	2025-06-16 14:34:10.63736	f	f	\N	f
6	Test task creation	Testing the fixed endpoint	pending	medium	\N	\N	\N	1	\N	\N	2025-06-16 14:42:40.388713	2025-06-16 14:42:40.388713	f	f	\N	f
11	Prepare talking points for the networking event (motor/legal cross-sell focus)	\N	completed	high	1	\N	\N	12	\N	2025-01-02 09:50:00	2025-01-02 09:50:00	2025-01-02 09:50:00	t	t	\N	f
12	Identify top 5 clients to invite for the regional March meeting	\N	pending	medium	1	\N	\N	12	\N	\N	2025-02-20 11:40:00	2025-02-20 11:40:00	f	t	\N	f
13	Prepare specialized quotes for 12 solar panel leads	\N	completed	high	2	\N	\N	12	\N	2024-12-18 14:30:00	2024-12-18 14:30:00	2024-12-18 14:30:00	t	t	\N	f
14	Finalize auto-step setup for GL clients missing PI coverage	\N	completed	medium	2	\N	\N	12	\N	2025-01-09 10:45:00	2025-01-09 10:45:00	2025-01-09 10:45:00	t	t	\N	f
15	Draft content for March regional broker meeting (success stories)	\N	pending	high	2	\N	\N	12	\N	\N	2025-02-25 13:10:00	2025-02-25 13:10:00	f	t	\N	f
16	Schedule Boris tool training for broker teams	\N	completed	medium	3	\N	\N	12	\N	2024-12-21 16:20:00	2024-12-21 16:20:00	2024-12-21 16:20:00	t	t	\N	f
17	Review effectiveness of new retention model with data team	\N	pending	low	3	\N	\N	12	\N	\N	2025-01-28 15:35:00	2025-01-28 15:35:00	f	t	\N	f
18	Conduct Q1 collaboration health check with Mevas BV stakeholders	\N	pending	medium	3	\N	\N	12	\N	\N	2025-03-10 09:00:00	2025-03-10 09:00:00	f	t	\N	f
10	Share performance data from the social media campaign	\N	completed	medium	1	\N	\N	12	\N	\N	2024-12-14 10:15:00	2024-12-14 10:15:00	f	t	\N	f
21	Prepare talking points for the networking event (motor/legal cross-sell focus)	\N	pending	high	1	\N	\N	4	\N	2025-01-02 09:50:00	2025-01-02 09:50:00	2025-01-02 09:50:00	t	t	12	t
22	Identify top 5 clients to invite for the regional March meeting	\N	pending	medium	1	\N	\N	4	\N	\N	2025-02-20 11:40:00	2025-02-20 11:40:00	f	t	12	t
23	Prepare specialized quotes for 12 solar panel leads	\N	pending	high	2	\N	\N	4	\N	2024-12-18 14:30:00	2024-12-18 14:30:00	2024-12-18 14:30:00	t	t	12	t
24	Finalize auto-step setup for GL clients missing PI coverage	\N	pending	medium	2	\N	\N	4	\N	2025-01-09 10:45:00	2025-01-09 10:45:00	2025-01-09 10:45:00	t	t	12	t
25	Draft content for March regional broker meeting (success stories)	\N	pending	high	2	\N	\N	4	\N	\N	2025-02-25 13:10:00	2025-02-25 13:10:00	f	t	12	t
26	Schedule Boris tool training for broker teams	\N	pending	medium	3	\N	\N	4	\N	2024-12-21 16:20:00	2024-12-21 16:20:00	2024-12-21 16:20:00	t	t	12	t
27	Review effectiveness of new retention model with data team	\N	pending	low	3	\N	\N	4	\N	\N	2025-01-28 15:35:00	2025-01-28 15:35:00	f	t	12	t
28	Conduct Q1 collaboration health check with Mevas BV stakeholders	\N	pending	medium	3	\N	\N	4	\N	\N	2025-03-10 09:00:00	2025-03-10 09:00:00	f	t	12	t
29	Share performance data from the social media campaign	\N	pending	medium	1	\N	\N	4	\N	\N	2024-12-14 10:15:00	2024-12-14 10:15:00	f	t	12	t
30	Team task	\N	pending	medium	\N	\N	\N	12	\N	\N	2025-06-19 09:57:46.004397	2025-06-19 09:57:46.004397	f	f	\N	f
31	Team task	\N	pending	medium	\N	\N	\N	4	\N	\N	2025-06-19 09:57:46.068609	2025-06-19 09:57:46.068609	f	f	12	t
32	Test task	Test description	pending	high	1	\N	\N	1	\N	\N	2025-06-25 15:53:14.06474	2025-06-25 15:53:14.06474	f	t	\N	f
34	task	\N	pending	medium	\N	\N	\N	1	\N	2025-06-25 22:32:01.291	2025-06-25 22:21:16.668882	2025-06-25 22:21:16.668882	t	f	\N	f
33	Test Task with User Assignment	Testing real user names in timeline	pending	medium	4	\N	\N	1	\N	2025-06-25 22:37:26.792	2025-06-25 16:19:46.701274	2025-06-25 16:19:46.701274	t	t	\N	f
37	Test task for partner 6	\N	pending	medium	\N	\N	\N	6	\N	\N	2025-06-26 11:00:45.490579	2025-06-26 11:00:45.490579	f	f	\N	f
38	Test New Task Creation	Testing direct API call	pending	medium	\N	\N	\N	1	\N	\N	2025-06-26 11:05:26.720525	2025-06-26 11:05:26.720525	f	f	\N	f
39	third task	\N	pending	medium	\N	\N	\N	1	\N	\N	2025-06-26 11:25:53.151093	2025-06-26 11:25:53.151093	f	t	\N	f
40	Review IT Infrastructure Proposal	Review and finalize the IT infrastructure insurance proposal for Amazon CS	pending	high	4	partner	1	1	\N	\N	2025-07-16 08:43:49.533141	2025-07-16 08:43:49.533141	f	t	\N	f
41	Follow up on Cyber Security Quote	Follow up with Accenture regarding their cyber security package decision	pending	medium	4	partner	1	1	\N	\N	2025-07-16 08:43:49.533141	2025-07-16 08:43:49.533141	f	t	\N	f
42	Prepare Financial Services Presentation	Prepare comprehensive presentation for ABN AMRO Bank meeting	pending	high	4	partner	1	1	\N	\N	2025-07-16 08:43:49.533141	2025-07-16 08:43:49.533141	f	f	\N	f
43	Schedule Risk Assessment Meeting	Schedule risk assessment meeting with Boston Consulting Group	pending	medium	4	partner	1	1	\N	\N	2025-07-16 08:43:49.533141	2025-07-16 08:43:49.533141	f	t	\N	f
44	Update Portfolio Analysis	Update quarterly portfolio analysis for Willis partnership	pending	low	4	partner	1	1	\N	\N	2025-07-16 08:43:49.533141	2025-07-16 08:43:49.533141	f	f	\N	f
49	Update Portfolio Analysis	Update quarterly portfolio analysis for Willis partnership	pending	low	4	partner	43	43	\N	\N	2025-07-16 08:43:55.238024	2025-07-16 08:43:55.238024	f	f	\N	f
50	Review IT Infrastructure Proposal	Review and finalize the IT infrastructure insurance proposal for Amazon CS	pending	high	4	partner	26	26	\N	\N	2025-07-16 14:14:33.668991	2025-07-16 14:14:33.668991	f	t	\N	f
51	Follow up on Cyber Security Quote	Follow up with Accenture regarding their cyber security package decision	pending	medium	4	partner	26	26	\N	\N	2025-07-16 14:14:33.668991	2025-07-16 14:14:33.668991	f	t	\N	f
52	Prepare Financial Services Presentation	Prepare comprehensive presentation for ABN AMRO Bank meeting	pending	high	4	partner	26	26	\N	\N	2025-07-16 14:14:33.668991	2025-07-16 14:14:33.668991	f	f	\N	f
53	Schedule Risk Assessment Meeting	Schedule risk assessment meeting with Boston Consulting Group	pending	medium	4	partner	26	26	\N	\N	2025-07-16 14:14:33.668991	2025-07-16 14:14:33.668991	f	t	\N	f
54	Update Portfolio Analysis	Update quarterly portfolio analysis for Willis partnership	pending	low	4	partner	26	26	\N	\N	2025-07-16 14:14:33.668991	2025-07-16 14:14:33.668991	f	f	\N	f
\.


--
-- Data for Name: broker_partner_mappings; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.broker_partner_mappings (id, broker_user_id, environment_id, partner_id, broker_partner_name, is_active, created_at, updated_at) FROM stdin;
1	1	degoudse	4	De Goudse	t	2025-06-10 10:51:31.867553	2025-06-10 10:51:31.867553
\.


--
-- Data for Name: campaign_assignments; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.campaign_assignments (id, campaign_id, partner_id, assigned_by, assigned_at, access_level, status, notes, created_at, updated_at, partner_status) FROM stdin;
1	26	26	1	2025-07-15 11:03:41.004179	edit	active	\N	2025-07-15 11:03:41.004179	2025-07-15 11:03:41.004179	not_shared
\.


--
-- Data for Name: campaign_follow_ups; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.campaign_follow_ups (id, campaign_id, subject, email_body, delay_days, status, attachment, created_at) FROM stdin;
1	8	Did you see our income protection opportunity?	[{"id":"block1","type":"text","content":"We noticed you may have missed our previous email about protecting your business income. As a valued client, we want to ensure you have comprehensive coverage.","properties":{}},{"id":"block2","type":"button","content":"Review AOV Options Now","properties":{"link":"#aov-review","color":"#DC2626"}}]	7	scheduled	\N	2025-03-28 10:30:00
2	8	Case Study: How AOV saved a business like yours	[{"id":"block1","type":"text","content":"See how Vermeulen Engineering protected their €2.3M annual revenue with our AOV coverage. When their key engineer was injured, AOV coverage kept their business running.","properties":{}},{"id":"block2","type":"button","content":"Get My Custom Quote","properties":{"link":"#custom-quote","color":"#059669"}}]	14	scheduled	\N	2025-03-28 10:30:00
3	8	Final reminder: Income protection deadline approaching	[{"id":"block1","type":"text","content":"This is your final opportunity to secure income protection at preferential rates. Our underwriting team has reserved capacity specifically for existing clients.","properties":{}},{"id":"block2","type":"button","content":"Claim My Spot","properties":{"link":"#claim-spot","color":"#DC2626"}}]	21	scheduled	\N	2025-03-28 10:30:00
\.


--
-- Data for Name: campaign_recipients; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.campaign_recipients (id, campaign_id, contact_id, status, created_at) FROM stdin;
1	8	1	opened	2025-03-28 10:15:23
2	8	2	clicked	2025-03-28 10:22:45
3	8	3	sent	2025-03-28 10:00:00
\.


--
-- Data for Name: campaign_shares; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.campaign_shares (id, campaign_id, shared_with_type, shared_with_id, access_level, share_message, shared_by_id, is_active, created_at, updated_at) FROM stdin;
3	17	partner	12	view	\N	1	t	2025-06-17 20:54:29.362915	2025-06-17 20:54:29.362915
4	17	system	1	view	\N	1	t	2025-06-17 21:10:58.850084	2025-06-17 21:10:58.850084
5	22	partner	26	view	\N	1	t	2025-06-23 11:28:54.992454	2025-06-23 11:28:54.992454
6	24	partner	26	view	\N	1	t	2025-07-18 14:07:18.119001	2025-07-18 14:07:18.119001
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.campaigns (id, name, description, type, category, status, created_by_id, sponsor_id, list_id, subject, email_body, email_logo, from_name, from_email, scheduled_time, frequency, is_shared, is_template, tags, created_at, updated_at, heading, button_link, button_text, button_color, follow_up_emails, objective, target_entity_type, recipients, emails_sent, emails_opened, open_rate, total_clicks, icon, partner_id, environment_id, collaboration_enabled, partner_status) FROM stdin;
1	health coverage	description goes here [ARCHIVED - for degoudse]	cross_sell		archived	1	\N	\N	subject	our products are great - buy them				\N	one_time	f	t	\N	2025-04-15 14:22:18	2025-04-15 14:22:18	a heading		Click Here	#3CA2E0	[]	\N	\N	\N	0	0	0.00	0	heart	\N	degoudse	f	not_shared
10	Auto + Legal Campaign	Auto insurance with legal protection add-on campaign	email	\N	draft	1	\N	\N	Protected on the road, but what about legal disputes?	Get Your Legal Coverage Quote	\N	\N	\N	\N	one_time	f	t	\N	2025-04-03 16:18:44	2025-04-03 16:18:44	\N	\N	\N	\N	[{"subject": "Don't let legal costs catch you off-guard - complete your protection today", "body": null, "send_after_days": 3}]	\N	opportunities	\N	0	0	0.00	0	car	\N	degoudse	f	not_shared
17	Solar Panel Protection Campaign	Clients with solar installations but no environmental coverage [ARCHIVED - for degoudse]	email	\N	archived	1	\N	\N	Your solar investment is paying off - but is it fully protected?	[{"id":"block1","type":"text","content":"Dear [customer name], congratulations on your smart solar investment! However, we've noticed you may not have environmental coverage to protect this valuable asset from weather damage, theft, or technical failures.","properties":{}},{"id":"block2","type":"button","content":"Check My Environmental Coverage","properties":{"link":"#","color":"#DC2626"}}]	\N	\N	\N	\N	one_time	f	f	\N	2025-03-29 14:51:22	2025-06-17 20:54:31.384392	\N	\N	\N	\N	\N	\N	opportunities	[{"id": 26, "name": "Closed (Won) Opportunities", "type": "entity", "filters": {}, "members": [152, 153, 156, 157, 158, 161, 170, 191, 192], "is_shared": false, "created_at": "2025-06-17T12:01:06.074Z", "created_by": 1, "is_default": false, "partner_id": 12, "updated_at": "2025-06-17T12:01:06.074Z", "description": "", "entity_type": "opportunities", "recipientKey": "entity-26"}, {"id": 34, "name": "Zonnepanelen", "type": "entity", "filters": {}, "members": [155, 162, 164, 166, 168, 172, 177, 179, 183, 189, 194, 195, 196, 202, 203, 205, 206, 210, 163, 174, 186, 187, 190, 198], "is_shared": true, "created_at": "2025-06-17T14:20:01.801Z", "created_by": 1, "is_default": false, "partner_id": 12, "updated_at": "2025-06-17T14:20:12.349Z", "description": "", "entity_type": "opportunities", "recipientKey": "entity-34"}]	0	0	0.00	0	\N	12	degoudse	f	not_shared
20	Van pensioenverzekering naar Lange Termijnsparen	Pension to long-term savings transition campaign	email	\N	published	1	\N	\N	Optimalisatie van jouw belastingbrief 	[{"id":"ykdbfz12a","type":"text","content":"Dag {{naam}}, de berekening van jouw belastingbrief komt er weer aan. Met pensioensparen heb je al een fiscale optimalisatie. Ben je benieuwd hoe je jouw belastingbrief nog meer kan optimaliseren? ","properties":{}},{"id":"jc4m3lnpz","type":"text","content":"Er zijn zeker nog opties, bv. Lange termijn sparen.","properties":{}},{"id":"anrl06wqm","type":"text","content":"Benieuwd welke impact dit kan hebben in jouw situatie. Twijfel niet om een moment in te plannen met ons kantoor zodat we dit voor jou kunnen inschatten ","properties":{}},{"id":"jnh7ww5q3","type":"button","content":"Kalendar link","properties":{"url":"calendar link"}}]	\N	\N	\N	\N	one_time	f	t	\N	2025-06-23 09:44:34.722862	2025-06-23 09:44:34.722862	\N	\N	\N	\N	[]		opportunities	\N	0	0	0.00	0	calendar	\N	\N	f	not_shared
23	Van pensioenverzekering naar Lange Termijnsparen Campaign	Pension to long-term savings transition campaign	email	\N	draft	1	\N	\N	Optimalisatie van jouw belastingbrief 	[{"id":"ykdbfz12a","type":"text","content":"Dag {{naam}}, de berekening van jouw belastingbrief komt er weer aan. Met pensioensparen heb je al een fiscale optimalisatie. Ben je benieuwd hoe je jouw belastingbrief nog meer kan optimaliseren? ","properties":{}},{"id":"jc4m3lnpz","type":"text","content":"Er zijn zeker nog opties, bv. Lange termijn sparen.","properties":{}},{"id":"anrl06wqm","type":"text","content":"Benieuwd welke impact dit kan hebben in jouw situatie. Twijfel niet om een moment in te plannen met ons kantoor zodat we dit voor jou kunnen inschatten ","properties":{}},{"id":"jnh7ww5q3","type":"button","content":"Kalendar link","properties":{"url":"calendar link"}}]	\N	\N	\N	\N	one_time	f	f	\N	2025-06-23 10:06:44.22431	2025-07-14 10:49:57.598224	\N	\N	\N	\N	\N	\N	opportunities	[]	0	0	0.00	0	\N	\N	\N	f	not_shared
26	Car & Legal Summer Campaign		email	\N	draft	1	\N	\N	Klaar voor een zorgeloze zomer op de weg? Nez	[{"id":"rr6vtm5t1","type":"text","content":"Beste {{name}}","properties":{}},{"id":"iykbt08af","type":"text","content":"De zomer is in aantocht – hét moment om eropuit te trekken met de wagen. \\nMaar wist je dat niet alles met een autoverzekering alleen gedekt is?\\n\\nVoor een paar euro per maand rijd je met een gerust gevoel.\\nWil je weten wat rechtsbijstand voor jou betekent? Wij leggen het graag uit.\\n","properties":{}},{"id":"262kdnap5","type":"button","content":"Klik hier voor een gesprek","properties":{"url":""}},{"id":"gt1keonww","type":"text","content":"Geniet van de zomer – wij zorgen voor de rest.\\n\\nVriendelijke groeten,\\n[Naam afzender]\\n[Verzekeringsmaatschappij]","properties":{}}]	\N	\N	\N	\N	one_time	f	f	\N	2025-07-15 11:03:33.014818	2025-07-23 15:15:38.182508	\N	\N	\N	\N	\N	\N	opportunities	[{"id": 152, "type": "opportunity", "stage": "proposal", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 52, "createdAt": "2025-06-16T20:56:52.513Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:02.433Z", "clientName": "GMB (Geraedts Metaal", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerInfo": {"id": 52, "name": "GMB (Geraedts Metaal", "ownerId": null, "initials": "G(", "createdAt": "2025-06-16T20:55:58.341Z", "updatedAt": "2025-06-16T20:55:58.341Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "GMB (Geraedts Metaal", "productCount": 0, "productNames": "", "recipientKey": "opportunity-152", "estimated_value": 46906, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 52, "name": "GMB (Geraedts Metaal", "type": "customer", "ownerId": null, "initials": "G(", "createdAt": "2025-06-16T20:55:58.341Z", "partnerId": 12, "updatedAt": "2025-06-16T20:55:58.341Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-52", "opportunityInfo": {"id": 152, "type": "New Business", "stage": "proposal", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 52, "createdAt": "2025-06-16T20:56:52.513Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:02.433Z", "clientName": "GMB (Geraedts Metaal", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "GMB (Geraedts Metaal", "productCount": 0, "productNames": "", "estimated_value": 46906, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 12, "tags": null, "type": "contact", "email": "james.deboer@company.nl", "notes": null, "phone": "+31 15 901 2345", "company": "GMB (Geraedts Metaal", "full_name": "James de Boer", "is_active": true, "job_title": "Project Manager", "last_name": "de Boer", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "James", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 52, "name": "GMB (Geraedts Metaal", "ownerId": null, "initials": "G(", "createdAt": "2025-06-16T20:55:58.341Z", "updatedAt": "2025-06-16T20:55:58.341Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-12", "opportunityInfo": {"id": 152, "type": "New Business", "stage": "proposal", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 52, "createdAt": "2025-06-16T20:56:52.513Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:02.433Z", "clientName": "GMB (Geraedts Metaal", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "GMB (Geraedts Metaal", "productCount": 0, "productNames": "", "estimated_value": 46906, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 52, "linked_entity_type": "customer"}, {"id": 153, "type": "opportunity", "stage": "closed_lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 24, "createdAt": "2025-06-16T20:56:52.588Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:05.522Z", "clientName": "Bruins Betonstaalvlechtbedrijf", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerInfo": {"id": 24, "name": "Bruins Betonstaalvlechtbedrijf", "ownerId": null, "initials": "BB", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Bruins Betonstaalvlechtbedrijf", "productCount": 0, "productNames": "", "recipientKey": "opportunity-153", "estimated_value": 22283, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 24, "name": "Bruins Betonstaalvlechtbedrijf", "type": "customer", "ownerId": null, "initials": "BB", "createdAt": "2025-06-16T20:52:24.296Z", "partnerId": 12, "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-24", "opportunityInfo": {"id": 153, "type": "New Business", "stage": "closed_lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 24, "createdAt": "2025-06-16T20:56:52.588Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:05.522Z", "clientName": "Bruins Betonstaalvlechtbedrijf", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Bruins Betonstaalvlechtbedrijf", "productCount": 0, "productNames": "", "estimated_value": 22283, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 159, "tags": [], "type": "contact", "email": "debug@test.com", "notes": null, "phone": null, "company": "Bruins Betonstaalvlechtbedrijf", "full_name": "Debug Test", "is_active": true, "job_title": "Testing", "last_name": "Test", "partnerId": 26, "created_at": "2025-07-14T13:00:50.177Z", "department": null, "first_name": "Debug", "is_primary": false, "updated_at": "2025-07-14T13:00:50.177Z", "partnerName": "Induver", "customerInfo": {"id": 24, "name": "Bruins Betonstaalvlechtbedrijf", "ownerId": null, "initials": "BB", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-159", "opportunityInfo": {"id": 153, "type": "New Business", "stage": "closed_lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 24, "createdAt": "2025-06-16T20:56:52.588Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:05.522Z", "clientName": "Bruins Betonstaalvlechtbedrijf", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Bruins Betonstaalvlechtbedrijf", "productCount": 0, "productNames": "", "estimated_value": 22283, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 24, "linked_entity_type": "customer"}, {"id": 158, "tags": [], "type": "contact", "email": "sarah.kim@fintechsolutions.com", "notes": null, "phone": null, "company": "Bruins Betonstaalvlechtbedrijf", "full_name": "Sarah Kim", "is_active": true, "job_title": "Chief Technology Officer", "last_name": "Kim", "partnerId": 12, "created_at": "2025-07-14T12:58:41.147Z", "department": null, "first_name": "Sarah", "is_primary": false, "updated_at": "2025-07-14T12:58:41.147Z", "partnerName": "Mevas BV", "customerInfo": {"id": 24, "name": "Bruins Betonstaalvlechtbedrijf", "ownerId": null, "initials": "BB", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-158", "opportunityInfo": {"id": 153, "type": "New Business", "stage": "closed_lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 24, "createdAt": "2025-06-16T20:56:52.588Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:05.522Z", "clientName": "Bruins Betonstaalvlechtbedrijf", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Bruins Betonstaalvlechtbedrijf", "productCount": 0, "productNames": "", "estimated_value": 22283, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 24, "linked_entity_type": "customer"}, {"id": 157, "tags": [], "type": "contact", "email": "fjkjl@kjk.com", "notes": null, "phone": null, "company": "Bruins Betonstaalvlechtbedrijf", "full_name": "test frie", "is_active": true, "job_title": null, "last_name": "frie", "partnerId": 12, "created_at": "2025-07-14T12:58:35.781Z", "department": null, "first_name": "test", "is_primary": false, "updated_at": "2025-07-14T12:58:35.781Z", "partnerName": "Mevas BV", "customerInfo": {"id": 24, "name": "Bruins Betonstaalvlechtbedrijf", "ownerId": null, "initials": "BB", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-157", "opportunityInfo": {"id": 153, "type": "New Business", "stage": "closed_lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 24, "createdAt": "2025-06-16T20:56:52.588Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:05.522Z", "clientName": "Bruins Betonstaalvlechtbedrijf", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Bruins Betonstaalvlechtbedrijf", "productCount": 0, "productNames": "", "estimated_value": 22283, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 24, "linked_entity_type": "customer"}, {"id": 154, "type": "opportunity", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 25, "createdAt": "2025-06-16T20:56:52.665Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.665Z", "clientName": "Van Seters Metaaltechniek", "description": null, "partnerName": "Mevas BV", "probability": 0, "customerInfo": {"id": 25, "name": "Van Seters Metaaltechniek", "ownerId": null, "initials": "VS", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Van Seters Metaaltechniek", "productCount": 0, "productNames": "", "recipientKey": "opportunity-154", "estimated_value": 52158, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 25, "name": "Van Seters Metaaltechniek", "type": "customer", "ownerId": null, "initials": "VS", "createdAt": "2025-06-16T20:52:24.296Z", "partnerId": 12, "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-25", "opportunityInfo": {"id": 154, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 25, "createdAt": "2025-06-16T20:56:52.665Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.665Z", "clientName": "Van Seters Metaaltechniek", "description": null, "partnerName": "Mevas BV", "probability": 0, "customerName": "Van Seters Metaaltechniek", "productCount": 0, "productNames": "", "estimated_value": 52158, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 160, "tags": [], "type": "contact", "email": "sarah.kim@fintechsolutions.com", "notes": null, "phone": null, "company": "Van Seters Metaaltechniek", "full_name": "Sarah Kim", "is_active": true, "job_title": "Chief Technology Officer", "last_name": "Kim", "partnerId": 1, "created_at": "2025-07-14T13:02:31.021Z", "department": null, "first_name": "Sarah", "is_primary": false, "updated_at": "2025-07-14T13:02:31.021Z", "partnerName": "Willis B.V", "customerInfo": {"id": 25, "name": "Van Seters Metaaltechniek", "ownerId": null, "initials": "VS", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-160", "opportunityInfo": {"id": 154, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 25, "createdAt": "2025-06-16T20:56:52.665Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.665Z", "clientName": "Van Seters Metaaltechniek", "description": null, "partnerName": "Mevas BV", "probability": 0, "customerName": "Van Seters Metaaltechniek", "productCount": 0, "productNames": "", "estimated_value": 52158, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 25, "linked_entity_type": "customer"}, {"id": 155, "type": "opportunity", "stage": "qualification", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 26, "createdAt": "2025-06-16T20:56:52.740Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-18T11:17:41.500Z", "clientName": "Lasklus Nederland B.V.", "description": null, "partnerName": "Mevas BV", "probability": 30, "customerInfo": {"id": 26, "name": "Lasklus Nederland B.V.", "ownerId": null, "initials": "LN", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Lasklus Nederland B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-155", "estimated_value": 32571, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 26, "name": "Lasklus Nederland B.V.", "type": "customer", "ownerId": null, "initials": "LN", "createdAt": "2025-06-16T20:52:24.296Z", "partnerId": 12, "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-26", "opportunityInfo": {"id": 155, "type": "New Business", "stage": "qualification", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 26, "createdAt": "2025-06-16T20:56:52.740Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-18T11:17:41.500Z", "clientName": "Lasklus Nederland B.V.", "description": null, "partnerName": "Mevas BV", "probability": 30, "customerName": "Lasklus Nederland B.V.", "productCount": 0, "productNames": "", "estimated_value": 32571, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 57, "tags": null, "type": "contact", "email": "sophie.deboer@company.nl", "notes": null, "phone": "+31 50 456 7890", "company": "Lasklus Nederland B.V.", "full_name": "Sophie de Boer", "is_active": true, "job_title": "Financial Controller", "last_name": "de Boer", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Sophie", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 26, "name": "Lasklus Nederland B.V.", "ownerId": null, "initials": "LN", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-57", "opportunityInfo": {"id": 155, "type": "New Business", "stage": "qualification", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 26, "createdAt": "2025-06-16T20:56:52.740Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-18T11:17:41.500Z", "clientName": "Lasklus Nederland B.V.", "description": null, "partnerName": "Mevas BV", "probability": 30, "customerName": "Lasklus Nederland B.V.", "productCount": 0, "productNames": "", "estimated_value": 32571, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 26, "linked_entity_type": "customer"}, {"id": 156, "type": "opportunity", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 27, "createdAt": "2025-06-16T20:56:52.815Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.815Z", "clientName": "Maco Metaal B.V.", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerInfo": {"id": 27, "name": "Maco Metaal B.V.", "ownerId": null, "initials": "MM", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Maco Metaal B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-156", "estimated_value": 37442, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 27, "name": "Maco Metaal B.V.", "type": "customer", "ownerId": null, "initials": "MM", "createdAt": "2025-06-16T20:52:24.296Z", "partnerId": 12, "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-27", "opportunityInfo": {"id": 156, "type": "New Business", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 27, "createdAt": "2025-06-16T20:56:52.815Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.815Z", "clientName": "Maco Metaal B.V.", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Maco Metaal B.V.", "productCount": 0, "productNames": "", "estimated_value": 37442, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 157, "type": "opportunity", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 28, "createdAt": "2025-06-16T20:56:52.890Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.890Z", "clientName": "Mulders Metaal op Maat", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerInfo": {"id": 28, "name": "Mulders Metaal op Maat", "ownerId": null, "initials": "MM", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "Mulders Metaal op Maat", "productCount": 0, "productNames": "", "recipientKey": "opportunity-157", "estimated_value": 29676, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 28, "name": "Mulders Metaal op Maat", "type": "customer", "ownerId": null, "initials": "MM", "createdAt": "2025-06-16T20:52:24.296Z", "partnerId": 12, "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-28", "opportunityInfo": {"id": 157, "type": "New Business", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 28, "createdAt": "2025-06-16T20:56:52.890Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.890Z", "clientName": "Mulders Metaal op Maat", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Mulders Metaal op Maat", "productCount": 0, "productNames": "", "estimated_value": 29676, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 2, "totalOpportunityValue": 0}, {"id": 73, "tags": null, "type": "contact", "email": "anna.mulder@company.nl", "notes": null, "phone": "+31 25 012 3456", "company": "Mulders Metaal op Maat", "full_name": "Anna Mulder", "is_active": true, "job_title": "Business Development", "last_name": "Mulder", "partnerId": 2, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Anna", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Quick Insurance Solutions", "customerInfo": {"id": 28, "name": "Mulders Metaal op Maat", "ownerId": null, "initials": "MM", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "recipientKey": "contact-73", "opportunityInfo": {"id": 157, "type": "New Business", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 28, "createdAt": "2025-06-16T20:56:52.890Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.890Z", "clientName": "Mulders Metaal op Maat", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Mulders Metaal op Maat", "productCount": 0, "productNames": "", "estimated_value": 29676, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 28, "linked_entity_type": "customer"}, {"id": 158, "type": "opportunity", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 28, "createdAt": "2025-06-16T20:56:52.967Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.967Z", "clientName": "Mulders Metaal op Maat", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerInfo": {"id": 28, "name": "Mulders Metaal op Maat", "ownerId": null, "initials": "MM", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "Mulders Metaal op Maat", "productCount": 0, "productNames": "", "recipientKey": "opportunity-158", "estimated_value": 51264, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 159, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 29, "createdAt": "2025-06-16T20:56:53.041Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.041Z", "clientName": "Hauwlo Zonweringen", "description": null, "partnerName": "Induver", "probability": 60, "customerInfo": {"id": 29, "name": "Hauwlo Zonweringen", "ownerId": null, "initials": "HZ", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Hauwlo Zonweringen", "productCount": 0, "productNames": "", "recipientKey": "opportunity-159", "estimated_value": 41807, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 29, "name": "Hauwlo Zonweringen", "type": "customer", "ownerId": null, "initials": "HZ", "createdAt": "2025-06-16T20:52:24.296Z", "partnerId": 12, "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-29", "opportunityInfo": {"id": 159, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 29, "createdAt": "2025-06-16T20:56:53.041Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:53.041Z", "clientName": "Hauwlo Zonweringen", "description": null, "partnerName": "Mevas BV", "probability": 60, "customerName": "Hauwlo Zonweringen", "productCount": 0, "productNames": "", "estimated_value": 41807, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 81, "tags": null, "type": "contact", "email": "laura.janssen@company.nl", "notes": null, "phone": "+31 10 890 1234", "company": "Hauwlo Zonweringen", "full_name": "Laura Janssen", "is_active": true, "job_title": "Financial Controller", "last_name": "Janssen", "partnerId": 12, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Laura", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Mevas BV", "customerInfo": {"id": 29, "name": "Hauwlo Zonweringen", "ownerId": null, "initials": "HZ", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-81", "opportunityInfo": {"id": 159, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 29, "createdAt": "2025-06-16T20:56:53.041Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:53.041Z", "clientName": "Hauwlo Zonweringen", "description": null, "partnerName": "Mevas BV", "probability": 60, "customerName": "Hauwlo Zonweringen", "productCount": 0, "productNames": "", "estimated_value": 41807, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 29, "linked_entity_type": "customer"}, {"id": 160, "type": "opportunity", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 53, "createdAt": "2025-06-16T20:56:53.117Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:53.117Z", "clientName": "Landman Siermetaal B.V.", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerInfo": {"id": 53, "name": "Landman Siermetaal B.V.", "ownerId": null, "initials": "LS", "createdAt": "2025-06-16T20:55:58.861Z", "updatedAt": "2025-06-16T20:55:58.861Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "Landman Siermetaal B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-160", "estimated_value": 76161, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 53, "name": "Landman Siermetaal B.V.", "type": "customer", "ownerId": null, "initials": "LS", "createdAt": "2025-06-16T20:55:58.861Z", "partnerId": 12, "updatedAt": "2025-06-16T20:55:58.861Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-53", "opportunityInfo": {"id": 160, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 53, "createdAt": "2025-06-16T20:56:53.117Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:53.117Z", "clientName": "Landman Siermetaal B.V.", "description": null, "partnerName": "Mevas BV", "probability": 0, "customerName": "Landman Siermetaal B.V.", "productCount": 0, "productNames": "", "estimated_value": 76161, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 2, "totalOpportunityValue": 0}, {"id": 148, "tags": null, "type": "contact", "email": "sarah.devries@landman-siermetaal.nl", "notes": null, "phone": null, "company": null, "full_name": "Sarah de Vries", "is_active": true, "job_title": null, "last_name": "de Vries", "partnerId": 12, "created_at": "2025-07-12T13:00:22.508Z", "department": null, "first_name": "Sarah", "is_primary": true, "updated_at": "2025-07-12T13:00:22.508Z", "partnerName": "Mevas BV", "customerInfo": {"id": 53, "name": "Landman Siermetaal B.V.", "ownerId": null, "initials": "LS", "createdAt": "2025-06-16T20:55:58.861Z", "updatedAt": "2025-06-16T20:55:58.861Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "recipientKey": "contact-148", "opportunityInfo": {"id": 160, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 53, "createdAt": "2025-06-16T20:56:53.117Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:53.117Z", "clientName": "Landman Siermetaal B.V.", "description": null, "partnerName": "Mevas BV", "probability": 0, "customerName": "Landman Siermetaal B.V.", "productCount": 0, "productNames": "", "estimated_value": 76161, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 53, "linked_entity_type": "customer"}, {"id": 161, "type": "opportunity", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 53, "createdAt": "2025-06-16T20:56:53.193Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:53.193Z", "clientName": "Landman Siermetaal B.V.", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerInfo": {"id": 53, "name": "Landman Siermetaal B.V.", "ownerId": null, "initials": "LS", "createdAt": "2025-06-16T20:55:58.861Z", "updatedAt": "2025-06-16T20:55:58.861Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "Landman Siermetaal B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-161", "estimated_value": 67600, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 162, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 54, "createdAt": "2025-06-16T20:56:53.268Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.268Z", "clientName": "Ruud van Laer las en montagewerk", "description": null, "partnerName": "Induver", "probability": 30, "customerInfo": {"id": 54, "name": "Ruud van Laer las en montagewerk", "ownerId": null, "initials": "RV", "createdAt": "2025-06-16T20:55:58.936Z", "updatedAt": "2025-06-16T20:55:58.936Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Ruud van Laer las en montagewerk", "productCount": 0, "productNames": "", "recipientKey": "opportunity-162", "estimated_value": 74081, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 54, "name": "Ruud van Laer las en montagewerk", "type": "customer", "ownerId": null, "initials": "RV", "createdAt": "2025-06-16T20:55:58.936Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:58.936Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-54", "opportunityInfo": {"id": 162, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 54, "createdAt": "2025-06-16T20:56:53.268Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.268Z", "clientName": "Ruud van Laer las en montagewerk", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "Ruud van Laer las en montagewerk", "productCount": 0, "productNames": "", "estimated_value": 74081, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 82, "tags": null, "type": "contact", "email": "chris.vandermeer@company.nl", "notes": null, "phone": "+31 15 901 2345", "company": "Ruud van Laer las en montagewerk", "full_name": "Chris van der Meer", "is_active": true, "job_title": "Risk Manager", "last_name": "van der Meer", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Chris", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 54, "name": "Ruud van Laer las en montagewerk", "ownerId": null, "initials": "RV", "createdAt": "2025-06-16T20:55:58.936Z", "updatedAt": "2025-06-16T20:55:58.936Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-82", "opportunityInfo": {"id": 162, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 54, "createdAt": "2025-06-16T20:56:53.268Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.268Z", "clientName": "Ruud van Laer las en montagewerk", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "Ruud van Laer las en montagewerk", "productCount": 0, "productNames": "", "estimated_value": 74081, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 54, "linked_entity_type": "customer"}, {"id": 163, "type": "opportunity", "stage": "discovery", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 55, "createdAt": "2025-06-16T20:56:53.343Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-17T15:42:21.497Z", "clientName": "Duinhouwer BV", "description": null, "partnerName": "Induver", "probability": 75, "customerInfo": {"id": 55, "name": "Duinhouwer BV", "ownerId": null, "initials": "DB", "createdAt": "2025-06-16T20:55:59.011Z", "updatedAt": "2025-06-16T20:55:59.011Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Duinhouwer BV", "productCount": 0, "productNames": "", "recipientKey": "opportunity-163", "estimated_value": 75488, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 55, "name": "Duinhouwer BV", "type": "customer", "ownerId": null, "initials": "DB", "createdAt": "2025-06-16T20:55:59.011Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.011Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-55", "opportunityInfo": {"id": 163, "type": "New Business", "stage": "discovery", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 55, "createdAt": "2025-06-16T20:56:53.343Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-17T15:42:21.497Z", "clientName": "Duinhouwer BV", "description": null, "partnerName": "Induver", "probability": 75, "customerName": "Duinhouwer BV", "productCount": 0, "productNames": "", "estimated_value": 75488, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 164, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 56, "createdAt": "2025-06-16T20:56:53.418Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.418Z", "clientName": "TVG Las- en Montagetechniek", "description": null, "partnerName": "Induver", "probability": 30, "customerInfo": {"id": 56, "name": "TVG Las- en Montagetechniek", "ownerId": null, "initials": "TL", "createdAt": "2025-06-16T20:55:59.086Z", "updatedAt": "2025-06-16T20:55:59.086Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "TVG Las- en Montagetechniek", "productCount": 0, "productNames": "", "recipientKey": "opportunity-164", "estimated_value": 32036, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 56, "name": "TVG Las- en Montagetechniek", "type": "customer", "ownerId": null, "initials": "TL", "createdAt": "2025-06-16T20:55:59.086Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.086Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-56", "opportunityInfo": {"id": 164, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 56, "createdAt": "2025-06-16T20:56:53.418Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.418Z", "clientName": "TVG Las- en Montagetechniek", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "TVG Las- en Montagetechniek", "productCount": 0, "productNames": "", "estimated_value": 32036, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 77, "tags": null, "type": "contact", "email": "sophie.peters@company.nl", "notes": null, "phone": "+31 50 456 7890", "company": "TVG Las- en Montagetechniek", "full_name": "Sophie Peters", "is_active": true, "job_title": "CFO", "last_name": "Peters", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Sophie", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 56, "name": "TVG Las- en Montagetechniek", "ownerId": null, "initials": "TL", "createdAt": "2025-06-16T20:55:59.086Z", "updatedAt": "2025-06-16T20:55:59.086Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-77", "opportunityInfo": {"id": 164, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 56, "createdAt": "2025-06-16T20:56:53.418Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.418Z", "clientName": "TVG Las- en Montagetechniek", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "TVG Las- en Montagetechniek", "productCount": 0, "productNames": "", "estimated_value": 32036, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 56, "linked_entity_type": "customer"}, {"id": 165, "type": "opportunity", "stage": "Lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 57, "createdAt": "2025-06-16T20:56:53.494Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.494Z", "clientName": "Konstruktiebedrijf W. Verweij", "description": null, "partnerName": "Induver", "probability": 0, "customerInfo": {"id": 57, "name": "Konstruktiebedrijf W. Verweij", "ownerId": null, "initials": "KW", "createdAt": "2025-06-16T20:55:59.161Z", "updatedAt": "2025-06-16T20:55:59.161Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Konstruktiebedrijf W. Verweij", "productCount": 0, "productNames": "", "recipientKey": "opportunity-165", "estimated_value": 47666, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 57, "name": "Konstruktiebedrijf W. Verweij", "type": "customer", "ownerId": null, "initials": "KW", "createdAt": "2025-06-16T20:55:59.161Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.161Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-57", "opportunityInfo": {"id": 165, "type": "New Business", "stage": "Lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 57, "createdAt": "2025-06-16T20:56:53.494Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.494Z", "clientName": "Konstruktiebedrijf W. Verweij", "description": null, "partnerName": "Induver", "probability": 0, "customerName": "Konstruktiebedrijf W. Verweij", "productCount": 0, "productNames": "", "estimated_value": 47666, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 62, "tags": null, "type": "contact", "email": "chris.peters@company.nl", "notes": null, "phone": "+31 15 901 2345", "company": "Konstruktiebedrijf W. Verweij", "full_name": "Chris Peters", "is_active": true, "job_title": "Office Manager", "last_name": "Peters", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Chris", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 57, "name": "Konstruktiebedrijf W. Verweij", "ownerId": null, "initials": "KW", "createdAt": "2025-06-16T20:55:59.161Z", "updatedAt": "2025-06-16T20:55:59.161Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-62", "opportunityInfo": {"id": 165, "type": "New Business", "stage": "Lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 57, "createdAt": "2025-06-16T20:56:53.494Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.494Z", "clientName": "Konstruktiebedrijf W. Verweij", "description": null, "partnerName": "Induver", "probability": 0, "customerName": "Konstruktiebedrijf W. Verweij", "productCount": 0, "productNames": "", "estimated_value": 47666, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 57, "linked_entity_type": "customer"}, {"id": 166, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 58, "createdAt": "2025-06-16T20:56:53.569Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.569Z", "clientName": "AL 13 Architectural Facades", "description": null, "partnerName": "Induver", "probability": 30, "customerInfo": {"id": 58, "name": "AL 13 Architectural Facades", "ownerId": null, "initials": "A1", "createdAt": "2025-06-16T20:55:59.235Z", "updatedAt": "2025-06-16T20:55:59.235Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "AL 13 Architectural Facades", "productCount": 0, "productNames": "", "recipientKey": "opportunity-166", "estimated_value": 62229, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 58, "name": "AL 13 Architectural Facades", "type": "customer", "ownerId": null, "initials": "A1", "createdAt": "2025-06-16T20:55:59.235Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.235Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-58", "opportunityInfo": {"id": 166, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 58, "createdAt": "2025-06-16T20:56:53.569Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.569Z", "clientName": "AL 13 Architectural Facades", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "AL 13 Architectural Facades", "productCount": 0, "productNames": "", "estimated_value": 62229, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 167, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 59, "createdAt": "2025-06-16T20:56:53.645Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.645Z", "clientName": "Alutech Arnhem", "description": null, "partnerName": "Induver", "probability": 60, "customerInfo": {"id": 59, "name": "Alutech Arnhem", "ownerId": null, "initials": "AA", "createdAt": "2025-06-16T20:55:59.310Z", "updatedAt": "2025-06-16T20:55:59.310Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Alutech Arnhem", "productCount": 0, "productNames": "", "recipientKey": "opportunity-167", "estimated_value": 33931, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 59, "name": "Alutech Arnhem", "type": "customer", "ownerId": null, "initials": "AA", "createdAt": "2025-06-16T20:55:59.310Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.310Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-59", "opportunityInfo": {"id": 167, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 59, "createdAt": "2025-06-16T20:56:53.645Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.645Z", "clientName": "Alutech Arnhem", "description": null, "partnerName": "Induver", "probability": 60, "customerName": "Alutech Arnhem", "productCount": 0, "productNames": "", "estimated_value": 33931, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 29, "tags": null, "type": "contact", "email": "emma.degroot@company.nl", "notes": null, "phone": "+31 80 678 9012", "company": "Alutech Arnhem", "full_name": "Emma de Groot", "is_active": true, "job_title": "CFO", "last_name": "de Groot", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Emma", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 59, "name": "Alutech Arnhem", "ownerId": null, "initials": "AA", "createdAt": "2025-06-16T20:55:59.310Z", "updatedAt": "2025-06-16T20:55:59.310Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-29", "opportunityInfo": {"id": 167, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 59, "createdAt": "2025-06-16T20:56:53.645Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.645Z", "clientName": "Alutech Arnhem", "description": null, "partnerName": "Induver", "probability": 60, "customerName": "Alutech Arnhem", "productCount": 0, "productNames": "", "estimated_value": 33931, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 59, "linked_entity_type": "customer"}, {"id": 168, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 60, "createdAt": "2025-06-16T20:56:53.720Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.720Z", "clientName": "KO-MA Holding B.V.", "description": null, "partnerName": "Induver", "probability": 30, "customerInfo": {"id": 60, "name": "KO-MA Holding B.V.", "ownerId": null, "initials": "KH", "createdAt": "2025-06-16T20:55:59.385Z", "updatedAt": "2025-06-16T20:55:59.385Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "KO-MA Holding B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-168", "estimated_value": 37982, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 60, "name": "KO-MA Holding B.V.", "type": "customer", "ownerId": null, "initials": "KH", "createdAt": "2025-06-16T20:55:59.385Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.385Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-60", "opportunityInfo": {"id": 168, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 60, "createdAt": "2025-06-16T20:56:53.720Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.720Z", "clientName": "KO-MA Holding B.V.", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "KO-MA Holding B.V.", "productCount": 0, "productNames": "", "estimated_value": 37982, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 22, "tags": null, "type": "contact", "email": "chris.vandermeer@company.nl", "notes": null, "phone": "+31 15 901 2345", "company": "KO-MA Holding B.V.", "full_name": "Chris van der Meer", "is_active": true, "job_title": "Risk Manager", "last_name": "van der Meer", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Chris", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 60, "name": "KO-MA Holding B.V.", "ownerId": null, "initials": "KH", "createdAt": "2025-06-16T20:55:59.385Z", "updatedAt": "2025-06-16T20:55:59.385Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-22", "opportunityInfo": {"id": 168, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 60, "createdAt": "2025-06-16T20:56:53.720Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.720Z", "clientName": "KO-MA Holding B.V.", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "KO-MA Holding B.V.", "productCount": 0, "productNames": "", "estimated_value": 37982, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 60, "linked_entity_type": "customer"}, {"id": 169, "type": "opportunity", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 61, "createdAt": "2025-06-16T20:56:53.796Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.796Z", "clientName": "RS-Lastechniek", "description": null, "partnerName": "Induver", "probability": 0, "customerInfo": {"id": 61, "name": "RS-Lastechniek", "ownerId": null, "initials": "R", "createdAt": "2025-06-16T20:55:59.460Z", "updatedAt": "2025-06-16T20:55:59.460Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "RS-Lastechniek", "productCount": 0, "productNames": "", "recipientKey": "opportunity-169", "estimated_value": 75926, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 61, "name": "RS-Lastechniek", "type": "customer", "ownerId": null, "initials": "R", "createdAt": "2025-06-16T20:55:59.460Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.460Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-61", "opportunityInfo": {"id": 169, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 61, "createdAt": "2025-06-16T20:56:53.796Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.796Z", "clientName": "RS-Lastechniek", "description": null, "partnerName": "Induver", "probability": 0, "customerName": "RS-Lastechniek", "productCount": 0, "productNames": "", "estimated_value": 75926, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 2, "totalOpportunityValue": 0}, {"id": 65, "tags": null, "type": "contact", "email": "sarah.dejong@company.nl", "notes": null, "phone": "+31 30 234 5678", "company": "RS-Lastechniek", "full_name": "Sarah de Jong", "is_active": true, "job_title": "CFO", "last_name": "de Jong", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Sarah", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 61, "name": "RS-Lastechniek", "ownerId": null, "initials": "R", "createdAt": "2025-06-16T20:55:59.460Z", "updatedAt": "2025-06-16T20:55:59.460Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "recipientKey": "contact-65", "opportunityInfo": {"id": 169, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 61, "createdAt": "2025-06-16T20:56:53.796Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.796Z", "clientName": "RS-Lastechniek", "description": null, "partnerName": "Induver", "probability": 0, "customerName": "RS-Lastechniek", "productCount": 0, "productNames": "", "estimated_value": 75926, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 61, "linked_entity_type": "customer"}, {"id": 170, "type": "opportunity", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 61, "createdAt": "2025-06-16T20:56:53.872Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.872Z", "clientName": "RS-Lastechniek", "description": null, "partnerName": "Induver", "probability": 100, "customerInfo": {"id": 61, "name": "RS-Lastechniek", "ownerId": null, "initials": "R", "createdAt": "2025-06-16T20:55:59.460Z", "updatedAt": "2025-06-16T20:55:59.460Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "RS-Lastechniek", "productCount": 0, "productNames": "", "recipientKey": "opportunity-170", "estimated_value": 44400, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 171, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 62, "createdAt": "2025-06-16T20:56:53.946Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.946Z", "clientName": "Reparatiebedrijf H. Kelderman", "description": null, "partnerName": "Induver", "probability": 60, "customerInfo": {"id": 62, "name": "Reparatiebedrijf H. Kelderman", "ownerId": null, "initials": "RH", "createdAt": "2025-06-16T20:55:59.535Z", "updatedAt": "2025-06-16T20:55:59.535Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Reparatiebedrijf H. Kelderman", "productCount": 0, "productNames": "", "recipientKey": "opportunity-171", "estimated_value": 73145, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 62, "name": "Reparatiebedrijf H. Kelderman", "type": "customer", "ownerId": null, "initials": "RH", "createdAt": "2025-06-16T20:55:59.535Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.535Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-62", "opportunityInfo": {"id": 171, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 62, "createdAt": "2025-06-16T20:56:53.946Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.946Z", "clientName": "Reparatiebedrijf H. Kelderman", "description": null, "partnerName": "Induver", "probability": 60, "customerName": "Reparatiebedrijf H. Kelderman", "productCount": 0, "productNames": "", "estimated_value": 73145, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 172, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 63, "createdAt": "2025-06-16T20:56:54.023Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.023Z", "clientName": "M. van Es", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerInfo": {"id": 63, "name": "M. van Es", "ownerId": null, "initials": "MV", "createdAt": "2025-06-16T20:55:59.609Z", "updatedAt": "2025-06-16T20:55:59.609Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "M. van Es", "productCount": 0, "productNames": "", "recipientKey": "opportunity-172", "estimated_value": 37611, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 63, "name": "M. van Es", "type": "customer", "ownerId": null, "initials": "MV", "createdAt": "2025-06-16T20:55:59.609Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.609Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-63", "opportunityInfo": {"id": 172, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 63, "createdAt": "2025-06-16T20:56:54.023Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.023Z", "clientName": "M. van Es", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "M. van Es", "productCount": 0, "productNames": "", "estimated_value": 37611, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 2, "totalOpportunityValue": 0}, {"id": 90, "tags": null, "type": "contact", "email": "robert.bos@company.nl", "notes": null, "phone": "+31 90 789 0123", "company": "M. van Es", "full_name": "Robert Bos", "is_active": true, "job_title": "Operations Manager", "last_name": "Bos", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Robert", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 63, "name": "M. van Es", "ownerId": null, "initials": "MV", "createdAt": "2025-06-16T20:55:59.609Z", "updatedAt": "2025-06-16T20:55:59.609Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "recipientKey": "contact-90", "opportunityInfo": {"id": 172, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 63, "createdAt": "2025-06-16T20:56:54.023Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.023Z", "clientName": "M. van Es", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "M. van Es", "productCount": 0, "productNames": "", "estimated_value": 37611, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 63, "linked_entity_type": "customer"}, {"id": 173, "type": "opportunity", "stage": "Lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 63, "createdAt": "2025-06-16T20:56:54.099Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.099Z", "clientName": "M. van Es", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerInfo": {"id": 63, "name": "M. van Es", "ownerId": null, "initials": "MV", "createdAt": "2025-06-16T20:55:59.609Z", "updatedAt": "2025-06-16T20:55:59.609Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "M. van Es", "productCount": 0, "productNames": "", "recipientKey": "opportunity-173", "estimated_value": 65902, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 174, "type": "opportunity", "stage": "proposal", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 64, "createdAt": "2025-06-16T20:56:54.175Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-17T15:42:28.590Z", "clientName": "Duinhouwer Onroerend Goed BV", "description": null, "partnerName": "Willis B.V", "probability": 75, "customerInfo": {"id": 64, "name": "Duinhouwer Onroerend Goed BV", "ownerId": null, "initials": "DO", "createdAt": "2025-06-16T20:55:59.686Z", "updatedAt": "2025-06-16T20:55:59.686Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Duinhouwer Onroerend Goed BV", "productCount": 0, "productNames": "", "recipientKey": "opportunity-174", "estimated_value": 56721, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 64, "name": "Duinhouwer Onroerend Goed BV", "type": "customer", "ownerId": null, "initials": "DO", "createdAt": "2025-06-16T20:55:59.686Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.686Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-64", "opportunityInfo": {"id": 174, "type": "New Business", "stage": "proposal", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 64, "createdAt": "2025-06-16T20:56:54.175Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-17T15:42:28.590Z", "clientName": "Duinhouwer Onroerend Goed BV", "description": null, "partnerName": "Willis B.V", "probability": 75, "customerName": "Duinhouwer Onroerend Goed BV", "productCount": 0, "productNames": "", "estimated_value": 56721, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 175, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 65, "createdAt": "2025-06-16T20:56:54.251Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.251Z", "clientName": "R. Schouten Beheer B.V.", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerInfo": {"id": 65, "name": "R. Schouten Beheer B.V.", "ownerId": null, "initials": "RS", "createdAt": "2025-06-16T20:55:59.761Z", "updatedAt": "2025-06-16T20:55:59.761Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "R. Schouten Beheer B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-175", "estimated_value": 38266, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 65, "name": "R. Schouten Beheer B.V.", "type": "customer", "ownerId": null, "initials": "RS", "createdAt": "2025-06-16T20:55:59.761Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.761Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-65", "opportunityInfo": {"id": 175, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 65, "createdAt": "2025-06-16T20:56:54.251Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.251Z", "clientName": "R. Schouten Beheer B.V.", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "R. Schouten Beheer B.V.", "productCount": 0, "productNames": "", "estimated_value": 38266, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 31, "tags": null, "type": "contact", "email": "maria.vos@company.nl", "notes": null, "phone": "+31 10 890 1234", "company": "R. Schouten Beheer B.V.", "full_name": "Maria Vos", "is_active": true, "job_title": "HR Manager", "last_name": "Vos", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Maria", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 65, "name": "R. Schouten Beheer B.V.", "ownerId": null, "initials": "RS", "createdAt": "2025-06-16T20:55:59.761Z", "updatedAt": "2025-06-16T20:55:59.761Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-31", "opportunityInfo": {"id": 175, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 65, "createdAt": "2025-06-16T20:56:54.251Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.251Z", "clientName": "R. Schouten Beheer B.V.", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "R. Schouten Beheer B.V.", "productCount": 0, "productNames": "", "estimated_value": 38266, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 65, "linked_entity_type": "customer"}, {"id": 176, "type": "opportunity", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 66, "createdAt": "2025-06-16T20:56:54.325Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.325Z", "clientName": "VR Steel", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerInfo": {"id": 66, "name": "VR Steel", "ownerId": null, "initials": "VS", "createdAt": "2025-06-16T20:55:59.835Z", "updatedAt": "2025-06-16T20:55:59.835Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "VR Steel", "productCount": 0, "productNames": "", "recipientKey": "opportunity-176", "estimated_value": 56623, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 66, "name": "VR Steel", "type": "customer", "ownerId": null, "initials": "VS", "createdAt": "2025-06-16T20:55:59.835Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.835Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-66", "opportunityInfo": {"id": 176, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 66, "createdAt": "2025-06-16T20:56:54.325Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.325Z", "clientName": "VR Steel", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerName": "VR Steel", "productCount": 0, "productNames": "", "estimated_value": 56623, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 177, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 67, "createdAt": "2025-06-16T20:56:54.400Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.400Z", "clientName": "Winters Metaaltechniek", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerInfo": {"id": 67, "name": "Winters Metaaltechniek", "ownerId": null, "initials": "WM", "createdAt": "2025-06-16T20:55:59.911Z", "updatedAt": "2025-06-16T20:55:59.911Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Winters Metaaltechniek", "productCount": 0, "productNames": "", "recipientKey": "opportunity-177", "estimated_value": 54991, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 67, "name": "Winters Metaaltechniek", "type": "customer", "ownerId": null, "initials": "WM", "createdAt": "2025-06-16T20:55:59.911Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.911Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-67", "opportunityInfo": {"id": 177, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 67, "createdAt": "2025-06-16T20:56:54.400Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.400Z", "clientName": "Winters Metaaltechniek", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "Winters Metaaltechniek", "productCount": 0, "productNames": "", "estimated_value": 54991, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 89, "tags": null, "type": "contact", "email": "emma.degroot@company.nl", "notes": null, "phone": "+31 80 678 9012", "company": "Winters Metaaltechniek", "full_name": "Emma de Groot", "is_active": true, "job_title": "CFO", "last_name": "de Groot", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Emma", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 67, "name": "Winters Metaaltechniek", "ownerId": null, "initials": "WM", "createdAt": "2025-06-16T20:55:59.911Z", "updatedAt": "2025-06-16T20:55:59.911Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-89", "opportunityInfo": {"id": 177, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 67, "createdAt": "2025-06-16T20:56:54.400Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.400Z", "clientName": "Winters Metaaltechniek", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "Winters Metaaltechniek", "productCount": 0, "productNames": "", "estimated_value": 54991, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 67, "linked_entity_type": "customer"}, {"id": 178, "type": "opportunity", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 68, "createdAt": "2025-06-16T20:56:54.476Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.476Z", "clientName": "Hofmeijer Las- en", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerInfo": {"id": 68, "name": "Hofmeijer Las- en", "ownerId": null, "initials": "HL", "createdAt": "2025-06-16T20:55:59.986Z", "updatedAt": "2025-06-16T20:55:59.986Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Hofmeijer Las- en", "productCount": 0, "productNames": "", "recipientKey": "opportunity-178", "estimated_value": 38113, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 68, "name": "Hofmeijer Las- en", "type": "customer", "ownerId": null, "initials": "HL", "createdAt": "2025-06-16T20:55:59.986Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.986Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-68", "opportunityInfo": {"id": 178, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 68, "createdAt": "2025-06-16T20:56:54.476Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.476Z", "clientName": "Hofmeijer Las- en", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerName": "Hofmeijer Las- en", "productCount": 0, "productNames": "", "estimated_value": 38113, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 8, "tags": null, "type": "contact", "email": "david.bakker@company.nl", "notes": null, "phone": "+31 70 567 8901", "company": "Hofmeijer Las- en", "full_name": "David Bakker", "is_active": true, "job_title": "Sales Manager", "last_name": "Bakker", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "David", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 68, "name": "Hofmeijer Las- en", "ownerId": null, "initials": "HL", "createdAt": "2025-06-16T20:55:59.986Z", "updatedAt": "2025-06-16T20:55:59.986Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-8", "opportunityInfo": {"id": 178, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 68, "createdAt": "2025-06-16T20:56:54.476Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.476Z", "clientName": "Hofmeijer Las- en", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerName": "Hofmeijer Las- en", "productCount": 0, "productNames": "", "estimated_value": 38113, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 68, "linked_entity_type": "customer"}, {"id": 179, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 69, "createdAt": "2025-06-16T20:56:54.552Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.552Z", "clientName": "Timmerman Techniek Assen B.V.", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerInfo": {"id": 69, "name": "Timmerman Techniek Assen B.V.", "ownerId": null, "initials": "TT", "createdAt": "2025-06-16T20:56:00.061Z", "updatedAt": "2025-06-16T20:56:00.061Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Timmerman Techniek Assen B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-179", "estimated_value": 20407, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 69, "name": "Timmerman Techniek Assen B.V.", "type": "customer", "ownerId": null, "initials": "TT", "createdAt": "2025-06-16T20:56:00.061Z", "partnerId": 1, "updatedAt": "2025-06-16T20:56:00.061Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-69", "opportunityInfo": {"id": 179, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 69, "createdAt": "2025-06-16T20:56:54.552Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.552Z", "clientName": "Timmerman Techniek Assen B.V.", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "Timmerman Techniek Assen B.V.", "productCount": 0, "productNames": "", "estimated_value": 20407, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 19, "tags": null, "type": "contact", "email": "julia.vandenberg@company.nl", "notes": null, "phone": "+31 80 678 9012", "company": "Timmerman Techniek Assen B.V.", "full_name": "Julia van den Berg", "is_active": true, "job_title": "HR Manager", "last_name": "van den Berg", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Julia", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 69, "name": "Timmerman Techniek Assen B.V.", "ownerId": null, "initials": "TT", "createdAt": "2025-06-16T20:56:00.061Z", "updatedAt": "2025-06-16T20:56:00.061Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-19", "opportunityInfo": {"id": 179, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 69, "createdAt": "2025-06-16T20:56:54.552Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.552Z", "clientName": "Timmerman Techniek Assen B.V.", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "Timmerman Techniek Assen B.V.", "productCount": 0, "productNames": "", "estimated_value": 20407, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 69, "linked_entity_type": "customer"}, {"id": 180, "type": "opportunity", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 70, "createdAt": "2025-06-16T20:56:54.627Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.627Z", "clientName": "Elektim-Techniek B.V.", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerInfo": {"id": 70, "name": "Elektim-Techniek B.V.", "ownerId": null, "initials": "EB", "createdAt": "2025-06-16T20:56:00.135Z", "updatedAt": "2025-06-16T20:56:00.135Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Elektim-Techniek B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-180", "estimated_value": 42446, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 70, "name": "Elektim-Techniek B.V.", "type": "customer", "ownerId": null, "initials": "EB", "createdAt": "2025-06-16T20:56:00.135Z", "partnerId": 1, "updatedAt": "2025-06-16T20:56:00.135Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-70", "opportunityInfo": {"id": 180, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 70, "createdAt": "2025-06-16T20:56:54.627Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.627Z", "clientName": "Elektim-Techniek B.V.", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerName": "Elektim-Techniek B.V.", "productCount": 0, "productNames": "", "estimated_value": 42446, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 13, "tags": null, "type": "contact", "email": "anna.mulder@company.nl", "notes": null, "phone": "+31 25 012 3456", "company": "Elektim-Techniek B.V.", "full_name": "Anna Mulder", "is_active": true, "job_title": "Business Development", "last_name": "Mulder", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Anna", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 70, "name": "Elektim-Techniek B.V.", "ownerId": null, "initials": "EB", "createdAt": "2025-06-16T20:56:00.135Z", "updatedAt": "2025-06-16T20:56:00.135Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-13", "opportunityInfo": {"id": 180, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 70, "createdAt": "2025-06-16T20:56:54.627Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.627Z", "clientName": "Elektim-Techniek B.V.", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerName": "Elektim-Techniek B.V.", "productCount": 0, "productNames": "", "estimated_value": 42446, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 70, "linked_entity_type": "customer"}, {"id": 181, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 71, "createdAt": "2025-06-16T20:56:54.702Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.702Z", "clientName": "Gelderland Hekwerken B.V.", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerInfo": {"id": 71, "name": "Gelderland Hekwerken B.V.", "ownerId": null, "initials": "GH", "createdAt": "2025-06-16T20:56:00.211Z", "updatedAt": "2025-06-16T20:56:00.211Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Gelderland Hekwerken B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-181", "estimated_value": 30385, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 71, "name": "Gelderland Hekwerken B.V.", "type": "customer", "ownerId": null, "initials": "GH", "createdAt": "2025-06-16T20:56:00.211Z", "partnerId": 1, "updatedAt": "2025-06-16T20:56:00.211Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-71", "opportunityInfo": {"id": 181, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 71, "createdAt": "2025-06-16T20:56:54.702Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.702Z", "clientName": "Gelderland Hekwerken B.V.", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "Gelderland Hekwerken B.V.", "productCount": 0, "productNames": "", "estimated_value": 30385, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 6, "tags": null, "type": "contact", "email": "michael.janssen@company.nl", "notes": null, "phone": "+31 40 345 6789", "company": "Gelderland Hekwerken B.V.", "full_name": "Michael Janssen", "is_active": true, "job_title": "Operations Manager", "last_name": "Janssen", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Michael", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 71, "name": "Gelderland Hekwerken B.V.", "ownerId": null, "initials": "GH", "createdAt": "2025-06-16T20:56:00.211Z", "updatedAt": "2025-06-16T20:56:00.211Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-6", "opportunityInfo": {"id": 181, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 71, "createdAt": "2025-06-16T20:56:54.702Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.702Z", "clientName": "Gelderland Hekwerken B.V.", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "Gelderland Hekwerken B.V.", "productCount": 0, "productNames": "", "estimated_value": 30385, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 71, "linked_entity_type": "customer"}, {"id": 182, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 72, "createdAt": "2025-06-16T20:56:54.778Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.778Z", "clientName": "Stephan Borgers", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerInfo": {"id": 72, "name": "Stephan Borgers", "ownerId": null, "initials": "SB", "createdAt": "2025-06-16T20:56:00.337Z", "updatedAt": "2025-06-16T20:56:00.337Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Stephan Borgers", "productCount": 0, "productNames": "", "recipientKey": "opportunity-182", "estimated_value": 47722, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 72, "name": "Stephan Borgers", "type": "customer", "ownerId": null, "initials": "SB", "createdAt": "2025-06-16T20:56:00.337Z", "partnerId": 1, "updatedAt": "2025-06-16T20:56:00.337Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-72", "opportunityInfo": {"id": 182, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 72, "createdAt": "2025-06-16T20:56:54.778Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.778Z", "clientName": "Stephan Borgers", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "Stephan Borgers", "productCount": 0, "productNames": "", "estimated_value": 47722, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 60, "tags": null, "type": "contact", "email": "andreas.bos@company.nl", "notes": null, "phone": "+31 90 789 0123", "company": "Stephan Borgers", "full_name": "Andreas Bos", "is_active": true, "job_title": "Project Manager", "last_name": "Bos", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Andreas", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 72, "name": "Stephan Borgers", "ownerId": null, "initials": "SB", "createdAt": "2025-06-16T20:56:00.337Z", "updatedAt": "2025-06-16T20:56:00.337Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-60", "opportunityInfo": {"id": 182, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 72, "createdAt": "2025-06-16T20:56:54.778Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.778Z", "clientName": "Stephan Borgers", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "Stephan Borgers", "productCount": 0, "productNames": "", "estimated_value": 47722, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 72, "linked_entity_type": "customer"}, {"id": 183, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 73, "createdAt": "2025-06-16T20:56:54.853Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.853Z", "clientName": "Gartech", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerInfo": {"id": 73, "name": "Gartech", "ownerId": null, "initials": "G", "createdAt": "2025-06-16T20:56:00.412Z", "updatedAt": "2025-06-16T20:56:00.412Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Gartech", "productCount": 0, "productNames": "", "recipientKey": "opportunity-183", "estimated_value": 42844, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 73, "name": "Gartech", "type": "customer", "ownerId": null, "initials": "G", "createdAt": "2025-06-16T20:56:00.412Z", "partnerId": 2, "updatedAt": "2025-06-16T20:56:00.412Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Quick Insurance Solutions", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-73", "opportunityInfo": {"id": 183, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 73, "createdAt": "2025-06-16T20:56:54.853Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.853Z", "clientName": "Gartech", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "Gartech", "productCount": 0, "productNames": "", "estimated_value": 42844, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 36, "tags": null, "type": "contact", "email": "thomas.janssen@company.nl", "notes": null, "phone": "+31 40 345 6789", "company": "Gartech", "full_name": "Thomas Janssen", "is_active": true, "job_title": "Project Manager", "last_name": "Janssen", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Thomas", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 73, "name": "Gartech", "ownerId": null, "initials": "G", "createdAt": "2025-06-16T20:56:00.412Z", "updatedAt": "2025-06-16T20:56:00.412Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-36", "opportunityInfo": {"id": 183, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 73, "createdAt": "2025-06-16T20:56:54.853Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.853Z", "clientName": "Gartech", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "Gartech", "productCount": 0, "productNames": "", "estimated_value": 42844, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 73, "linked_entity_type": "customer"}, {"id": 184, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 74, "createdAt": "2025-06-16T20:56:54.928Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.928Z", "clientName": "Amuko Service", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerInfo": {"id": 74, "name": "Amuko Service", "ownerId": null, "initials": "AS", "createdAt": "2025-06-16T20:56:00.487Z", "updatedAt": "2025-06-16T20:56:00.487Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "Amuko Service", "productCount": 0, "productNames": "", "recipientKey": "opportunity-184", "estimated_value": 24140, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 74, "name": "Amuko Service", "type": "customer", "ownerId": null, "initials": "AS", "createdAt": "2025-06-16T20:56:00.487Z", "partnerId": 1, "updatedAt": "2025-06-16T20:56:00.487Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-74", "opportunityInfo": {"id": 184, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 74, "createdAt": "2025-06-16T20:56:54.928Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.928Z", "clientName": "Amuko Service", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "Amuko Service", "productCount": 0, "productNames": "", "estimated_value": 24140, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 2, "totalOpportunityValue": 0}, {"id": 80, "tags": null, "type": "contact", "email": "andreas.dejong@company.nl", "notes": null, "phone": "+31 90 789 0123", "company": "Amuko Service", "full_name": "Andreas de Jong", "is_active": true, "job_title": "Sales Manager", "last_name": "de Jong", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Andreas", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 74, "name": "Amuko Service", "ownerId": null, "initials": "AS", "createdAt": "2025-06-16T20:56:00.487Z", "updatedAt": "2025-06-16T20:56:00.487Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "recipientKey": "contact-80", "opportunityInfo": {"id": 184, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 74, "createdAt": "2025-06-16T20:56:54.928Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.928Z", "clientName": "Amuko Service", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "Amuko Service", "productCount": 0, "productNames": "", "estimated_value": 24140, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 74, "linked_entity_type": "customer"}, {"id": 185, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 74, "createdAt": "2025-06-16T20:56:55.003Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:55.003Z", "clientName": "Amuko Service", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerInfo": {"id": 74, "name": "Amuko Service", "ownerId": null, "initials": "AS", "createdAt": "2025-06-16T20:56:00.487Z", "updatedAt": "2025-06-16T20:56:00.487Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "Amuko Service", "productCount": 0, "productNames": "", "recipientKey": "opportunity-185", "estimated_value": 53268, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 468, "type": "opportunity", "stage": "initial_contact", "title": "IT Infrastructure Upgrade", "status": "Active", "ownerId": null, "clientId": 264, "createdAt": "2025-07-15T12:57:05.703Z", "partnerId": null, "productId": 55, "updatedAt": "2025-07-15T12:57:05.703Z", "clientName": "TechFlow Solutions", "description": "Complete infrastructure modernization project", "partnerName": "", "probability": 25, "customerName": "TechFlow Solutions", "productCount": 0, "productNames": "NN Premie Pensioen Plan", "recipientKey": "opportunity-468", "estimated_value": 45000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 469, "type": "opportunity", "stage": "proposal", "title": "Green Building Certification", "status": "Active", "ownerId": null, "clientId": 265, "createdAt": "2025-07-15T12:57:05.703Z", "partnerId": null, "productId": 55, "updatedAt": "2025-07-15T12:57:05.703Z", "clientName": "GreenBuild Construction", "description": "Sustainable construction certification process", "partnerName": "", "probability": 60, "customerName": "GreenBuild Construction", "productCount": 0, "productNames": "NN Premie Pensioen Plan", "recipientKey": "opportunity-469", "estimated_value": 35000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 470, "type": "opportunity", "stage": "negotiation", "title": "Data Migration Project", "status": "Active", "ownerId": null, "clientId": 266, "createdAt": "2025-07-15T12:57:05.703Z", "partnerId": null, "productId": 55, "updatedAt": "2025-07-15T12:57:05.703Z", "clientName": "DataVault Systems", "description": "Legacy system data migration to cloud", "partnerName": "", "probability": 40, "customerName": "DataVault Systems", "productCount": 0, "productNames": "NN Premie Pensioen Plan", "recipientKey": "opportunity-470", "estimated_value": 28000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 471, "type": "opportunity", "stage": "initial_contact", "title": "Fleet Management System", "status": "Active", "ownerId": null, "clientId": 267, "createdAt": "2025-07-15T12:57:05.703Z", "partnerId": null, "productId": 55, "updatedAt": "2025-07-15T12:57:05.703Z", "clientName": "EcoLogistics BV", "description": "Eco-friendly logistics optimization", "partnerName": "", "probability": 30, "customerName": "EcoLogistics BV", "productCount": 0, "productNames": "NN Premie Pensioen Plan", "recipientKey": "opportunity-471", "estimated_value": 52000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 472, "type": "opportunity", "stage": "proposal", "title": "Smart Home Integration", "status": "Active", "ownerId": null, "clientId": 268, "createdAt": "2025-07-15T12:57:05.703Z", "partnerId": null, "productId": 55, "updatedAt": "2025-07-15T12:57:05.703Z", "clientName": "SmartHome Innovations", "description": "Residential automation system installation", "partnerName": "", "probability": 70, "customerName": "SmartHome Innovations", "productCount": 0, "productNames": "NN Premie Pensioen Plan", "recipientKey": "opportunity-472", "estimated_value": 18000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 473, "type": "opportunity", "stage": "negotiation", "title": "Cloud Migration Services", "status": "Active", "ownerId": null, "clientId": 269, "createdAt": "2025-07-15T12:57:05.703Z", "partnerId": null, "productId": 55, "updatedAt": "2025-07-15T12:57:05.703Z", "clientName": "CloudFirst Technologies", "description": "Enterprise cloud infrastructure setup", "partnerName": "", "probability": 45, "customerName": "CloudFirst Technologies", "productCount": 0, "productNames": "NN Premie Pensioen Plan", "recipientKey": "opportunity-473", "estimated_value": 75000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 474, "type": "opportunity", "stage": "initial_contact", "title": "Laboratory Equipment Insurance", "status": "Active", "ownerId": null, "clientId": 270, "createdAt": "2025-07-15T12:57:05.703Z", "partnerId": null, "productId": 55, "updatedAt": "2025-07-15T12:57:05.703Z", "clientName": "BioTech Research Lab", "description": "Specialized equipment protection plan", "partnerName": "", "probability": 35, "customerName": "BioTech Research Lab", "productCount": 0, "productNames": "NN Premie Pensioen Plan", "recipientKey": "opportunity-474", "estimated_value": 22000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 475, "type": "opportunity", "stage": "proposal", "title": "Urban Development Insurance", "status": "Active", "ownerId": null, "clientId": 271, "createdAt": "2025-07-15T12:57:05.703Z", "partnerId": null, "productId": 55, "updatedAt": "2025-07-15T12:57:05.703Z", "clientName": "Urban Planning Group", "description": "City planning project coverage", "partnerName": "", "probability": 50, "customerName": "Urban Planning Group", "productCount": 0, "productNames": "NN Premie Pensioen Plan", "recipientKey": "opportunity-475", "estimated_value": 48000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 396, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Lynn Vandenbosch", "status": null, "ownerId": null, "clientId": 226, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 30, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Lynn Vandenbosch", "description": "Cybersecurity insurance upsell", "partnerName": "", "probability": 60, "customerName": "Lynn Vandenbosch", "productCount": 0, "productNames": "", "recipientKey": "opportunity-396", "estimated_value": 42000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 397, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Rudi Verschueren", "status": null, "ownerId": null, "clientId": 227, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 30, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Rudi Verschueren", "description": "Cybersecurity insurance upsell", "partnerName": "", "probability": 60, "customerName": "Rudi Verschueren", "productCount": 0, "productNames": "", "recipientKey": "opportunity-397", "estimated_value": 40000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 398, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Nele Blomme", "status": null, "ownerId": null, "clientId": 228, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 30, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Nele Blomme", "description": "Cybersecurity insurance upsell", "partnerName": "", "probability": 60, "customerName": "Nele Blomme", "productCount": 0, "productNames": "", "recipientKey": "opportunity-398", "estimated_value": 38000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 399, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Stephan Vandaele", "status": null, "ownerId": null, "clientId": 229, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 30, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Stephan Vandaele", "description": "Cybersecurity insurance upsell", "partnerName": "", "probability": 60, "customerName": "Stephan Vandaele", "productCount": 0, "productNames": "", "recipientKey": "opportunity-399", "estimated_value": 36000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 400, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Tinne Versluys", "status": null, "ownerId": null, "clientId": 230, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 30, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Tinne Versluys", "description": "Cybersecurity insurance upsell", "partnerName": "", "probability": 60, "customerName": "Tinne Versluys", "productCount": 0, "productNames": "", "recipientKey": "opportunity-400", "estimated_value": 34000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 401, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Technolab", "status": null, "ownerId": null, "clientId": 231, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 31, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Technolab", "description": "Cybersecurity insurance upsell", "partnerName": "Helix Verzekeringen", "probability": 60, "customerName": "Technolab", "productCount": 0, "productNames": "", "recipientKey": "opportunity-401", "estimated_value": 32000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 402, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Barco", "status": null, "ownerId": null, "clientId": 232, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 31, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Barco", "description": "Cybersecurity insurance upsell", "partnerName": "Helix Verzekeringen", "probability": 60, "customerName": "Barco", "productCount": 0, "productNames": "", "recipientKey": "opportunity-402", "estimated_value": 30000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 403, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Agfa-Gevaert", "status": null, "ownerId": null, "clientId": 233, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 31, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Agfa-Gevaert", "description": "Cybersecurity insurance upsell", "partnerName": "Helix Verzekeringen", "probability": 60, "customerName": "Agfa-Gevaert", "productCount": 0, "productNames": "", "recipientKey": "opportunity-403", "estimated_value": 28000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 404, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Umicore", "status": null, "ownerId": null, "clientId": 234, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 31, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Umicore", "description": "Cybersecurity insurance upsell", "partnerName": "Helix Verzekeringen", "probability": 60, "customerName": "Umicore", "productCount": 0, "productNames": "", "recipientKey": "opportunity-404", "estimated_value": 26000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 405, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Accenture", "status": null, "ownerId": null, "clientId": 235, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 31, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Accenture", "description": "Cybersecurity insurance upsell", "partnerName": "Helix Verzekeringen", "probability": 60, "customerName": "Accenture", "productCount": 0, "productNames": "", "recipientKey": "opportunity-405", "estimated_value": 24000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 406, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Deloitte", "status": null, "ownerId": null, "clientId": 236, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 31, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Deloitte", "description": "Cybersecurity insurance upsell", "partnerName": "Helix Verzekeringen", "probability": 60, "customerName": "Deloitte", "productCount": 0, "productNames": "", "recipientKey": "opportunity-406", "estimated_value": 22000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 407, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Proximus", "status": null, "ownerId": null, "clientId": 237, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 31, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Proximus", "description": "Cybersecurity insurance upsell", "partnerName": "Helix Verzekeringen", "probability": 60, "customerName": "Proximus", "productCount": 0, "productNames": "", "recipientKey": "opportunity-407", "estimated_value": 20000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 408, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Zetes Industries", "status": null, "ownerId": null, "clientId": 238, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 31, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Zetes Industries", "description": "Cybersecurity insurance upsell", "partnerName": "Helix Verzekeringen", "probability": 60, "customerName": "Zetes Industries", "productCount": 0, "productNames": "", "recipientKey": "opportunity-408", "estimated_value": 2400, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 409, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Intermodalics", "status": null, "ownerId": null, "clientId": 239, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 31, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Intermodalics", "description": "Cybersecurity insurance upsell", "partnerName": "Helix Verzekeringen", "probability": 60, "customerName": "Intermodalics", "productCount": 0, "productNames": "", "recipientKey": "opportunity-409", "estimated_value": 1800, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 410, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Sirris", "status": null, "ownerId": null, "clientId": 240, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 32, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Sirris", "description": "Cybersecurity insurance upsell", "partnerName": "BARBUSS", "probability": 60, "customerName": "Sirris", "productCount": 0, "productNames": "", "recipientKey": "opportunity-410", "estimated_value": 1200, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 411, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Agoria", "status": null, "ownerId": null, "clientId": 241, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 32, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Agoria", "description": "Cybersecurity insurance upsell", "partnerName": "BARBUSS", "probability": 60, "customerName": "Agoria", "productCount": 0, "productNames": "", "recipientKey": "opportunity-411", "estimated_value": 1000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 412, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Anju Life Sciences Software", "status": null, "ownerId": null, "clientId": 242, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 33, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Anju Life Sciences Software", "description": "Cybersecurity insurance upsell", "partnerName": "Concordia NV", "probability": 60, "customerName": "Anju Life Sciences Software", "productCount": 0, "productNames": "", "recipientKey": "opportunity-412", "estimated_value": 4000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 413, "type": "opportunity", "stage": "Proposal Sent", "title": "cyberverzekering - Cenexi", "status": null, "ownerId": null, "clientId": 243, "createdAt": "2025-06-23T10:17:30.592Z", "partnerId": 31, "productId": 3, "updatedAt": "2025-06-23T10:17:30.592Z", "clientName": "Cenexi", "description": "Cybersecurity insurance upsell", "partnerName": "Helix Verzekeringen", "probability": 60, "customerName": "Cenexi", "productCount": 0, "productNames": "", "recipientKey": "opportunity-413", "estimated_value": 7000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 415, "type": "opportunity", "stage": "Negotiation", "title": "cyberverzekering - Qollabi", "status": null, "ownerId": null, "clientId": 244, "createdAt": "2025-06-23T12:50:44.073Z", "partnerId": 26, "productId": 3, "updatedAt": "2025-06-23T12:50:44.073Z", "clientName": "Qollabi", "description": null, "partnerName": "Induver", "probability": 50, "customerName": "Qollabi", "productCount": 0, "productNames": "", "recipientKey": "opportunity-415", "estimated_value": 10000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 416, "type": "opportunity", "stage": "Proposal", "title": "cyberverzekering - Coca Cola", "status": null, "ownerId": null, "clientId": 245, "createdAt": "2025-06-23T12:50:44.073Z", "partnerId": 26, "productId": 3, "updatedAt": "2025-06-23T12:50:44.073Z", "clientName": "Coca Cola", "description": null, "partnerName": "Induver", "probability": 40, "customerName": "Coca Cola", "productCount": 0, "productNames": "", "recipientKey": "opportunity-416", "estimated_value": 10000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 417, "type": "opportunity", "stage": "Qualified", "title": "cyberverzekering - Bpost", "status": null, "ownerId": null, "clientId": 246, "createdAt": "2025-06-23T12:50:44.073Z", "partnerId": 26, "productId": 3, "updatedAt": "2025-06-23T12:50:44.073Z", "clientName": "Bpost", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "Bpost", "productCount": 0, "productNames": "", "recipientKey": "opportunity-417", "estimated_value": 10000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 418, "type": "opportunity", "stage": "Lead", "title": "cyberverzekering - Proximus", "status": null, "ownerId": null, "clientId": 237, "createdAt": "2025-06-23T12:50:44.073Z", "partnerId": 26, "productId": 3, "updatedAt": "2025-06-23T12:50:44.073Z", "clientName": "Proximus", "description": null, "partnerName": "Induver", "probability": 20, "customerName": "Proximus", "productCount": 0, "productNames": "", "recipientKey": "opportunity-418", "estimated_value": 10000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 432, "type": "opportunity", "stage": "prospecting", "title": "Cyber Security Insurance", "status": "Active", "ownerId": null, "clientId": 30, "createdAt": "2025-07-14T13:05:00.868Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T13:05:00.868Z", "clientName": "TechVision Solutions", "description": "Cybersecurity insurance package for IT company", "partnerName": "Mevas BV", "probability": 25, "customerInfo": {"id": 30, "name": "TechVision Solutions", "ownerId": null, "initials": "TS", "createdAt": "2025-07-14T13:05:22.530Z", "updatedAt": "2025-07-14T13:05:22.530Z", "partnerIds": "", "description": "Technology consulting and software development", "partnerCount": 0, "partnerNames": "", "productCount": 0, "opportunityCount": 0, "totalOpportunityValue": 0}, "customerName": "TechVision Solutions", "productCount": 0, "productNames": "", "recipientKey": "opportunity-432", "estimated_value": 45000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 30, "name": "TechVision Solutions", "type": "customer", "ownerId": null, "initials": "TS", "createdAt": "2025-07-14T13:05:22.530Z", "partnerId": 12, "updatedAt": "2025-07-14T13:05:22.530Z", "partnerIds": "", "description": "Technology consulting and software development", "partnerName": "Mevas BV", "partnerCount": 0, "partnerNames": "", "productCount": 0, "recipientKey": "customer-30", "opportunityInfo": {"id": 432, "type": null, "stage": "prospecting", "title": "Cyber Security Insurance", "status": "Active", "ownerId": null, "clientId": 30, "createdAt": "2025-07-14T13:05:00.868Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T13:05:00.868Z", "clientName": "TechVision Solutions", "description": "Cybersecurity insurance package for IT company", "partnerName": "Mevas BV", "probability": 25, "customerName": "TechVision Solutions", "productCount": 0, "productNames": "", "estimated_value": 45000, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 0, "totalOpportunityValue": 0}, {"id": 437, "type": "opportunity", "stage": "negotiation", "title": "Cyber Security Insurance", "status": "Active", "ownerId": null, "clientId": 259, "createdAt": "2025-07-15T09:48:42.425Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-15T09:48:42.425Z", "clientName": "TechCorp Solutions", "description": "Cyber security coverage for tech infrastructure", "partnerName": "Mevas BV", "probability": 80, "customerName": "TechCorp Solutions", "productCount": 0, "productNames": "", "recipientKey": "opportunity-437", "estimated_value": 25000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 464, "type": "opportunity", "stage": "negotiation", "title": "Cyber Risk Finance", "status": "Active", "ownerId": null, "clientId": 263, "createdAt": "2025-07-15T09:48:42.425Z", "partnerId": 26, "productId": 8, "updatedAt": "2025-07-15T09:48:42.425Z", "clientName": "Financial Services Amsterdam", "description": "Cyber risk insurance for financial data", "partnerName": "Induver", "probability": 80, "customerName": "Financial Services Amsterdam", "productCount": 0, "productNames": "", "recipientKey": "opportunity-464", "estimated_value": 28000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 478, "type": "opportunity", "stage": "closed-won", "title": "Cyber Security Package", "status": null, "ownerId": 4, "clientId": 249, "createdAt": "2025-07-16T08:42:58.328Z", "partnerId": 1, "productId": 73, "updatedAt": "2025-07-16T08:42:58.328Z", "clientName": "Accenture B.V. (211601345)", "description": "Advanced cyber security insurance for Accenture B.V.", "partnerName": "Willis B.V", "probability": 80, "customerName": "Accenture B.V. (211601345)", "productCount": 0, "productNames": "Keymanverzekering Directie", "recipientKey": "opportunity-478", "estimated_value": 150000, "expectedCloseDate": null, "accountManagerName": "Albrecht Bouwman"}, {"id": 514, "type": "opportunity", "stage": "closed-won", "title": "Cyber Security Package", "status": null, "ownerId": 4, "clientId": 249, "createdAt": "2025-07-16T08:43:07.472Z", "partnerId": 43, "productId": 73, "updatedAt": "2025-07-16T08:43:07.472Z", "clientName": "Accenture B.V. (211601345)", "description": "Advanced cyber security insurance for Accenture B.V.", "partnerName": "Concordia Brussel", "probability": 80, "customerName": "Accenture B.V. (211601345)", "productCount": 0, "productNames": "Keymanverzekering Directie", "recipientKey": "opportunity-514", "estimated_value": 150000, "expectedCloseDate": null, "accountManagerName": "Albrecht Bouwman"}, {"id": 260, "type": "opportunity", "stage": null, "title": "Zonnepanelen onbekend", "status": "prospect", "ownerId": null, "clientId": 111, "createdAt": "2025-06-16T23:09:30.041Z", "partnerId": 19, "productId": 13, "updatedAt": "2025-06-16T23:09:30.041Z", "clientName": "KERAF BV", "description": "Solar panel insurance opportunity: Zonnepanelen onbekend", "partnerName": "Aon Risico Management", "probability": 25, "customerInfo": {"id": 111, "name": "KERAF BV", "ownerId": null, "initials": "KB", "createdAt": "2025-06-16T23:05:13.575Z", "updatedAt": "2025-06-16T23:05:13.575Z", "partnerIds": "19", "description": "Insurance client for Inventaris/Goederen Conversie", "partnerCount": 1, "partnerNames": "Aon Risico Management", "productCount": 0, "opportunityCount": 0, "totalOpportunityValue": 0}, "customerName": "KERAF BV", "productCount": 0, "productNames": "", "recipientKey": "opportunity-260", "estimated_value": 47166, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 111, "name": "KERAF BV", "type": "customer", "ownerId": null, "initials": "KB", "createdAt": "2025-06-16T23:05:13.575Z", "partnerId": 19, "updatedAt": "2025-06-16T23:05:13.575Z", "partnerIds": "19", "description": "Insurance client for Inventaris/Goederen Conversie", "partnerName": "Aon Risico Management", "partnerCount": 1, "partnerNames": "Aon Risico Management", "productCount": 0, "recipientKey": "customer-111", "opportunityInfo": {"id": 260, "type": null, "stage": null, "title": "Zonnepanelen onbekend", "status": "prospect", "ownerId": null, "clientId": 111, "createdAt": "2025-06-16T23:09:30.041Z", "partnerId": 19, "productId": 13, "updatedAt": "2025-06-16T23:09:30.041Z", "clientName": "KERAF BV", "description": "Solar panel insurance opportunity: Zonnepanelen onbekend", "partnerName": "Aon Risico Management", "probability": 25, "customerName": "KERAF BV", "productCount": 0, "productNames": "", "estimated_value": 47166, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 0, "totalOpportunityValue": 0}, {"id": 261, "type": "opportunity", "stage": "Lost", "title": "Zonnepanelen onbekend", "status": "prospect", "ownerId": null, "clientId": 111, "createdAt": "2025-06-16T23:09:30.188Z", "partnerId": 19, "productId": 13, "updatedAt": "2025-06-16T23:09:30.188Z", "clientName": "KERAF BV", "description": "Solar panel insurance opportunity: Zonnepanelen onbekend", "partnerName": "Aon Risico Management", "probability": 0, "customerInfo": {"id": 111, "name": "KERAF BV", "ownerId": null, "initials": "KB", "createdAt": "2025-06-16T23:05:13.575Z", "updatedAt": "2025-06-16T23:05:13.575Z", "partnerIds": "19", "description": "Insurance client for Inventaris/Goederen Conversie", "partnerCount": 1, "partnerNames": "Aon Risico Management", "productCount": 0, "opportunityCount": 0, "totalOpportunityValue": 0}, "customerName": "KERAF BV", "productCount": 0, "productNames": "", "recipientKey": "opportunity-261", "estimated_value": 48910, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 262, "type": "opportunity", "stage": "Lost", "title": "Zonnepanelen onbekend", "status": "prospect", "ownerId": null, "clientId": 111, "createdAt": "2025-06-16T23:09:30.333Z", "partnerId": 19, "productId": 13, "updatedAt": "2025-06-16T23:09:30.333Z", "clientName": "KERAF BV", "description": "Solar panel insurance opportunity: Zonnepanelen onbekend", "partnerName": "Aon Risico Management", "probability": 0, "customerInfo": {"id": 111, "name": "KERAF BV", "ownerId": null, "initials": "KB", "createdAt": "2025-06-16T23:05:13.575Z", "updatedAt": "2025-06-16T23:05:13.575Z", "partnerIds": "19", "description": "Insurance client for Inventaris/Goederen Conversie", "partnerCount": 1, "partnerNames": "Aon Risico Management", "productCount": 0, "opportunityCount": 0, "totalOpportunityValue": 0}, "customerName": "KERAF BV", "productCount": 0, "productNames": "", "recipientKey": "opportunity-262", "estimated_value": 53445, "expectedCloseDate": null, "accountManagerName": ""}]	0	0	0.00	0	\N	\N	degoudse	t	not_shared
12	Solar Panel Protection Campaign	Clients with solar installations but no environmental coverage [ARCHIVED - for degoudse]	email	\N	archived	1	\N	\N	Your solar investment is paying off - but is it fully protected?	Check My Environmental Coverage	\N	\N	\N	\N	one_time	f	t	\N	2025-04-08 13:42:17	2025-04-08 13:42:17	\N	\N	\N	\N	[{"subject": "Environmental damage claims are rising - don't let your green investment become a liability", "body": null, "send_after_days": 3}]	\N	opportunities	\N	0	0	0.00	0	sun	\N	degoudse	f	not_shared
13	Annual Policy Review Campaign	All clients (retention focused) [ARCHIVED - for degoudse]	email	\N	archived	1	\N	\N	Has your business changed? Let's make sure your coverage hasn't fallen behind	Schedule My Review	\N	\N	\N	\N	one_time	f	t	\N	2025-03-31 10:15:29	2025-03-31 10:15:29	\N	\N	\N	\N	[{"subject": "Don't wait for a claim to discover gaps - let's review your coverage this month", "body": null, "send_after_days": 3}]	\N	customers	\N	0	0	0.00	0	calendar	\N	degoudse	f	not_shared
19	Einde Termijn IPT	Term end renewal campaign for life insurance policies	email	\N	published	1	\N	\N	Proficiat met jouw pensioen!	[{"id":"xs0vcu9t5","type":"heading","content":"Proficiat met jouw pensioen!","properties":{}},{"id":"60207khoa","type":"text","content":"Beste {{name}}","properties":{}},{"id":"k7jmc8at5","type":"text","content":"Proficiat met jouw welverdiende pensioen! Je kan je afvragen: \\"wat nu?\\" ","properties":{}},{"id":"89rkdl68m","type":"text","content":"Wel, we gaan over tot het uitkeren van jouw IPT fonds aan jou. Graag hadden we hiervoor kort besproken welke opties er voor jou zijn. Boek een moment met ons hier: ","properties":{}},{"id":"6pwewvxfc","type":"button","content":"Kalendar link","properties":{"url":"Kalendar link here"}}]	\N	\N	\N	\N	one_time	f	t	\N	2025-06-23 09:04:22.258069	2025-07-09 06:40:25.289338	\N	\N	\N	\N	[{"subject":"Mail 2","body":"[]","send_after_days":7}]	Term end renewal campaign for life insurance policies	opportunities	\N	0	0	0.00	0	calendar	\N	\N	f	not_shared
14	Industry-Specific Proposition Campaign	Sector-specific client segments [ARCHIVED - for degoudse]	email	\N	archived	1	\N	\N	New coverage designed specifically for [industry] businesses like yours	See My Industry Solutions	\N	\N	\N	\N	one_time	f	t	\N	2025-04-12 15:58:03	2025-04-12 15:58:03	\N	\N	\N	\N	[{"subject": "Your competitors are already protected - don't get left behind", "body": null, "send_after_days": 3}]	\N	customers	\N	0	0	0.00	0	building	\N	degoudse	f	not_shared
15	Industry-Specific Proposition Campaign	Sector-specific client segments [ARCHIVED - for degoudse]	email	\N	archived	1	\N	\N	New coverage designed specifically for [industry] businesses like yours	[{"id":"block1","type":"text","content":"Dear [customer name], we have new industry-specific coverage options designed specifically for businesses like yours in the [industry] sector.","properties":{}},{"id":"block2","type":"button","content":"See My Industry Solutions","properties":{"link":"#","color":"#4F46E5"}}]	\N	\N	\N	\N	one_time	f	f	\N	2025-03-25 08:33:41	2025-03-25 08:33:41	\N	\N	\N	\N	\N	\N	opportunities	[]	0	0	0.00	0	\N	\N	degoudse	f	not_shared
16	Annual Policy Review Campaign	All clients (retention focused) [ARCHIVED - for degoudse]	email	\N	archived	1	\N	\N	Has your business changed? Let's make sure your coverage hasn't fallen behind	[{"id":"block1","type":"text","content":"Dear [customer name], as your business evolves, so should your insurance coverage. Let's schedule a comprehensive review to ensure you're fully protected.","properties":{}},{"id":"block2","type":"button","content":"Schedule My Review","properties":{"link":"#","color":"#059669"}}]	\N	\N	\N	\N	one_time	f	f	\N	2025-04-01 12:27:58	2025-04-01 12:27:58	\N	\N	\N	\N	\N	\N	customers	[]	0	0	0.00	0	\N	\N	degoudse	f	not_shared
11	Professional Liability Upgrade Campaign	Clients with general liability but no professional indemnity [ARCHIVED - for degoudse]	email	\N	archived	1	\N	\N	Your business liability is covered, but is your professional advice protected?	Assess My Professional Risk	\N	\N	\N	\N	one_time	f	t	\N	2025-03-22 11:30:55	2025-03-22 11:30:55	\N	\N	\N	\N	[{"subject": "One client complaint could cost thousands - secure your professional indemnity now", "body": null, "send_after_days": 3}]	\N	opportunities	\N	0	0	0.00	0	briefcase	\N	degoudse	f	not_shared
21	Cyber upsell	Cybersecurity upsell targeting opportunities with digital vulnerabilities	email	\N	published	1	\N	\N	60% van cyberaanvallen in België gericht op KM)	[{"id":"xau4vcsfl","type":"text","content":"Dag {{naam}}, 💻 Wist je dat 60% van de cyberaanvallen in België gericht zijn op KMO’s?","properties":{}},{"id":"7z8dxj567","type":"text","content":"En dat de gemiddelde kostprijs van een aanval boven de €20.000 ligt — inclusief herstel, reputatieschade en juridische kosten?","properties":{}},{"id":"tw8zzhorh","type":"text","content":"Jouw brandverzekering dekt je gebouw. Maar wie dekt je data? We willen alvast voor jou een analyse inplannen om te kijken welke risico’s je loopt ","properties":{}},{"id":"8fjdnqcs3","type":"button","content":"Kalendar link","properties":{"url":"calendar link"}}]	\N	\N	\N	\N	one_time	f	t	\N	2025-06-23 09:45:51.996951	2025-06-23 09:45:51.996951	\N	\N	\N	\N	[]		opportunities	\N	0	0	0.00	0	star	\N	\N	f	not_shared
24	Cyber upsell Campaign	Cybersecurity upsell targeting opportunities with digital vulnerabilities	email	\N	draft	1	\N	\N	60% van cyberaanvallen in België gericht op KM)	[{"id":"xau4vcsfl","type":"text","content":"Dag {{naam}}, 💻 Wist je dat 60% van de cyberaanvallen in België gericht zijn op KMO’s?","properties":{}},{"id":"7z8dxj567","type":"text","content":"En dat de gemiddelde kostprijs van een aanval boven de €20.000 ligt — inclusief herstel, reputatieschade en juridische kosten?","properties":{}},{"id":"tw8zzhorh","type":"text","content":"Jouw brandverzekering dekt je gebouw. Maar wie dekt je data? We willen alvast voor jou een analyse inplannen om te kijken welke risico’s je loopt ","properties":{}},{"id":"8fjdnqcs3","type":"button","content":"Kalendar link","properties":{"url":"calendar link"}}]	\N	\N	\N	\N	one_time	f	f	\N	2025-06-23 10:06:51.866545	2025-07-15 11:01:48.316594	\N	\N	\N	\N	\N	\N	opportunities	[{"id": 152, "type": "opportunity", "stage": "proposal", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 52, "createdAt": "2025-06-16T20:56:52.513Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:02.433Z", "clientName": "GMB (Geraedts Metaal", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerInfo": {"id": 52, "name": "GMB (Geraedts Metaal", "ownerId": null, "initials": "G(", "createdAt": "2025-06-16T20:55:58.341Z", "updatedAt": "2025-06-16T20:55:58.341Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "GMB (Geraedts Metaal", "productCount": 0, "productNames": "", "recipientKey": "opportunity-152", "estimated_value": 46906, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 52, "name": "GMB (Geraedts Metaal", "type": "customer", "ownerId": null, "initials": "G(", "createdAt": "2025-06-16T20:55:58.341Z", "partnerId": 12, "updatedAt": "2025-06-16T20:55:58.341Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-52", "opportunityInfo": {"id": 152, "type": "New Business", "stage": "proposal", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 52, "createdAt": "2025-06-16T20:56:52.513Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:02.433Z", "clientName": "GMB (Geraedts Metaal", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "GMB (Geraedts Metaal", "productCount": 0, "productNames": "", "estimated_value": 46906, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 12, "tags": null, "type": "contact", "email": "james.deboer@company.nl", "notes": null, "phone": "+31 15 901 2345", "company": "GMB (Geraedts Metaal", "full_name": "James de Boer", "is_active": true, "job_title": "Project Manager", "last_name": "de Boer", "partnerId": 12, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "James", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Mevas BV", "customerInfo": {"id": 52, "name": "GMB (Geraedts Metaal", "ownerId": null, "initials": "G(", "createdAt": "2025-06-16T20:55:58.341Z", "updatedAt": "2025-06-16T20:55:58.341Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-12", "opportunityInfo": {"id": 152, "type": "New Business", "stage": "proposal", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 52, "createdAt": "2025-06-16T20:56:52.513Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:02.433Z", "clientName": "GMB (Geraedts Metaal", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "GMB (Geraedts Metaal", "productCount": 0, "productNames": "", "estimated_value": 46906, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 52, "linked_entity_type": "customer"}, {"id": 153, "type": "opportunity", "stage": "closed_lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 24, "createdAt": "2025-06-16T20:56:52.588Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:05.522Z", "clientName": "Bruins Betonstaalvlechtbedrijf", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerInfo": {"id": 24, "name": "Bruins Betonstaalvlechtbedrijf", "ownerId": null, "initials": "BB", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Bruins Betonstaalvlechtbedrijf", "productCount": 0, "productNames": "", "recipientKey": "opportunity-153", "estimated_value": 22283, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 24, "name": "Bruins Betonstaalvlechtbedrijf", "type": "customer", "ownerId": null, "initials": "BB", "createdAt": "2025-06-16T20:52:24.296Z", "partnerId": 12, "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-24", "opportunityInfo": {"id": 153, "type": "New Business", "stage": "closed_lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 24, "createdAt": "2025-06-16T20:56:52.588Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:05.522Z", "clientName": "Bruins Betonstaalvlechtbedrijf", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Bruins Betonstaalvlechtbedrijf", "productCount": 0, "productNames": "", "estimated_value": 22283, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 159, "tags": [], "type": "contact", "email": "debug@test.com", "notes": null, "phone": null, "company": "Bruins Betonstaalvlechtbedrijf", "full_name": "Debug Test", "is_active": true, "job_title": "Testing", "last_name": "Test", "partnerId": 12, "created_at": "2025-07-14T13:00:50.177Z", "department": null, "first_name": "Debug", "is_primary": false, "updated_at": "2025-07-14T13:00:50.177Z", "partnerName": "Mevas BV", "customerInfo": {"id": 24, "name": "Bruins Betonstaalvlechtbedrijf", "ownerId": null, "initials": "BB", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-159", "opportunityInfo": {"id": 153, "type": "New Business", "stage": "closed_lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 24, "createdAt": "2025-06-16T20:56:52.588Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:05.522Z", "clientName": "Bruins Betonstaalvlechtbedrijf", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Bruins Betonstaalvlechtbedrijf", "productCount": 0, "productNames": "", "estimated_value": 22283, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 24, "linked_entity_type": "customer"}, {"id": 158, "tags": [], "type": "contact", "email": "sarah.kim@fintechsolutions.com", "notes": null, "phone": null, "company": "Bruins Betonstaalvlechtbedrijf", "full_name": "Sarah Kim", "is_active": true, "job_title": "Chief Technology Officer", "last_name": "Kim", "partnerId": 12, "created_at": "2025-07-14T12:58:41.147Z", "department": null, "first_name": "Sarah", "is_primary": false, "updated_at": "2025-07-14T12:58:41.147Z", "partnerName": "Mevas BV", "customerInfo": {"id": 24, "name": "Bruins Betonstaalvlechtbedrijf", "ownerId": null, "initials": "BB", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-158", "opportunityInfo": {"id": 153, "type": "New Business", "stage": "closed_lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 24, "createdAt": "2025-06-16T20:56:52.588Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:05.522Z", "clientName": "Bruins Betonstaalvlechtbedrijf", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Bruins Betonstaalvlechtbedrijf", "productCount": 0, "productNames": "", "estimated_value": 22283, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 24, "linked_entity_type": "customer"}, {"id": 157, "tags": [], "type": "contact", "email": "fjkjl@kjk.com", "notes": null, "phone": null, "company": "Bruins Betonstaalvlechtbedrijf", "full_name": "test frie", "is_active": true, "job_title": null, "last_name": "frie", "partnerId": 12, "created_at": "2025-07-14T12:58:35.781Z", "department": null, "first_name": "test", "is_primary": false, "updated_at": "2025-07-14T12:58:35.781Z", "partnerName": "Mevas BV", "customerInfo": {"id": 24, "name": "Bruins Betonstaalvlechtbedrijf", "ownerId": null, "initials": "BB", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-157", "opportunityInfo": {"id": 153, "type": "New Business", "stage": "closed_lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 24, "createdAt": "2025-06-16T20:56:52.588Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-07-14T11:10:05.522Z", "clientName": "Bruins Betonstaalvlechtbedrijf", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Bruins Betonstaalvlechtbedrijf", "productCount": 0, "productNames": "", "estimated_value": 22283, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 24, "linked_entity_type": "customer"}, {"id": 154, "type": "opportunity", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 25, "createdAt": "2025-06-16T20:56:52.665Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.665Z", "clientName": "Van Seters Metaaltechniek", "description": null, "partnerName": "Mevas BV", "probability": 0, "customerInfo": {"id": 25, "name": "Van Seters Metaaltechniek", "ownerId": null, "initials": "VS", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Van Seters Metaaltechniek", "productCount": 0, "productNames": "", "recipientKey": "opportunity-154", "estimated_value": 52158, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 25, "name": "Van Seters Metaaltechniek", "type": "customer", "ownerId": null, "initials": "VS", "createdAt": "2025-06-16T20:52:24.296Z", "partnerId": 12, "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-25", "opportunityInfo": {"id": 154, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 25, "createdAt": "2025-06-16T20:56:52.665Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.665Z", "clientName": "Van Seters Metaaltechniek", "description": null, "partnerName": "Mevas BV", "probability": 0, "customerName": "Van Seters Metaaltechniek", "productCount": 0, "productNames": "", "estimated_value": 52158, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 160, "tags": [], "type": "contact", "email": "sarah.kim@fintechsolutions.com", "notes": null, "phone": null, "company": "Van Seters Metaaltechniek", "full_name": "Sarah Kim", "is_active": true, "job_title": "Chief Technology Officer", "last_name": "Kim", "partnerId": 12, "created_at": "2025-07-14T13:02:31.021Z", "department": null, "first_name": "Sarah", "is_primary": false, "updated_at": "2025-07-14T13:02:31.021Z", "partnerName": "Mevas BV", "customerInfo": {"id": 25, "name": "Van Seters Metaaltechniek", "ownerId": null, "initials": "VS", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-160", "opportunityInfo": {"id": 154, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 25, "createdAt": "2025-06-16T20:56:52.665Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.665Z", "clientName": "Van Seters Metaaltechniek", "description": null, "partnerName": "Mevas BV", "probability": 0, "customerName": "Van Seters Metaaltechniek", "productCount": 0, "productNames": "", "estimated_value": 52158, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 25, "linked_entity_type": "customer"}, {"id": 155, "type": "opportunity", "stage": "qualification", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 26, "createdAt": "2025-06-16T20:56:52.740Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-18T11:17:41.500Z", "clientName": "Lasklus Nederland B.V.", "description": null, "partnerName": "Mevas BV", "probability": 30, "customerInfo": {"id": 26, "name": "Lasklus Nederland B.V.", "ownerId": null, "initials": "LN", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Lasklus Nederland B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-155", "estimated_value": 32571, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 26, "name": "Lasklus Nederland B.V.", "type": "customer", "ownerId": null, "initials": "LN", "createdAt": "2025-06-16T20:52:24.296Z", "partnerId": 12, "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-26", "opportunityInfo": {"id": 155, "type": "New Business", "stage": "qualification", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 26, "createdAt": "2025-06-16T20:56:52.740Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-18T11:17:41.500Z", "clientName": "Lasklus Nederland B.V.", "description": null, "partnerName": "Mevas BV", "probability": 30, "customerName": "Lasklus Nederland B.V.", "productCount": 0, "productNames": "", "estimated_value": 32571, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 57, "tags": null, "type": "contact", "email": "sophie.deboer@company.nl", "notes": null, "phone": "+31 50 456 7890", "company": "Lasklus Nederland B.V.", "full_name": "Sophie de Boer", "is_active": true, "job_title": "Financial Controller", "last_name": "de Boer", "partnerId": 12, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Sophie", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Mevas BV", "customerInfo": {"id": 26, "name": "Lasklus Nederland B.V.", "ownerId": null, "initials": "LN", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-57", "opportunityInfo": {"id": 155, "type": "New Business", "stage": "qualification", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 26, "createdAt": "2025-06-16T20:56:52.740Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-18T11:17:41.500Z", "clientName": "Lasklus Nederland B.V.", "description": null, "partnerName": "Mevas BV", "probability": 30, "customerName": "Lasklus Nederland B.V.", "productCount": 0, "productNames": "", "estimated_value": 32571, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 26, "linked_entity_type": "customer"}, {"id": 156, "type": "opportunity", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 27, "createdAt": "2025-06-16T20:56:52.815Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.815Z", "clientName": "Maco Metaal B.V.", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerInfo": {"id": 27, "name": "Maco Metaal B.V.", "ownerId": null, "initials": "MM", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Maco Metaal B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-156", "estimated_value": 37442, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 27, "name": "Maco Metaal B.V.", "type": "customer", "ownerId": null, "initials": "MM", "createdAt": "2025-06-16T20:52:24.296Z", "partnerId": 12, "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-27", "opportunityInfo": {"id": 156, "type": "New Business", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 27, "createdAt": "2025-06-16T20:56:52.815Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.815Z", "clientName": "Maco Metaal B.V.", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Maco Metaal B.V.", "productCount": 0, "productNames": "", "estimated_value": 37442, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 157, "type": "opportunity", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 28, "createdAt": "2025-06-16T20:56:52.890Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.890Z", "clientName": "Mulders Metaal op Maat", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerInfo": {"id": 28, "name": "Mulders Metaal op Maat", "ownerId": null, "initials": "MM", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "Mulders Metaal op Maat", "productCount": 0, "productNames": "", "recipientKey": "opportunity-157", "estimated_value": 29676, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 28, "name": "Mulders Metaal op Maat", "type": "customer", "ownerId": null, "initials": "MM", "createdAt": "2025-06-16T20:52:24.296Z", "partnerId": 12, "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-28", "opportunityInfo": {"id": 157, "type": "New Business", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 28, "createdAt": "2025-06-16T20:56:52.890Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.890Z", "clientName": "Mulders Metaal op Maat", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Mulders Metaal op Maat", "productCount": 0, "productNames": "", "estimated_value": 29676, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 2, "totalOpportunityValue": 0}, {"id": 73, "tags": null, "type": "contact", "email": "anna.mulder@company.nl", "notes": null, "phone": "+31 25 012 3456", "company": "Mulders Metaal op Maat", "full_name": "Anna Mulder", "is_active": true, "job_title": "Business Development", "last_name": "Mulder", "partnerId": 12, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Anna", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Mevas BV", "customerInfo": {"id": 28, "name": "Mulders Metaal op Maat", "ownerId": null, "initials": "MM", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "recipientKey": "contact-73", "opportunityInfo": {"id": 157, "type": "New Business", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 28, "createdAt": "2025-06-16T20:56:52.890Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.890Z", "clientName": "Mulders Metaal op Maat", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerName": "Mulders Metaal op Maat", "productCount": 0, "productNames": "", "estimated_value": 29676, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 28, "linked_entity_type": "customer"}, {"id": 158, "type": "opportunity", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 28, "createdAt": "2025-06-16T20:56:52.967Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:52.967Z", "clientName": "Mulders Metaal op Maat", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerInfo": {"id": 28, "name": "Mulders Metaal op Maat", "ownerId": null, "initials": "MM", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "Mulders Metaal op Maat", "productCount": 0, "productNames": "", "recipientKey": "opportunity-158", "estimated_value": 51264, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 159, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 29, "createdAt": "2025-06-16T20:56:53.041Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:53.041Z", "clientName": "Hauwlo Zonweringen", "description": null, "partnerName": "Mevas BV", "probability": 60, "customerInfo": {"id": 29, "name": "Hauwlo Zonweringen", "ownerId": null, "initials": "HZ", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Hauwlo Zonweringen", "productCount": 0, "productNames": "", "recipientKey": "opportunity-159", "estimated_value": 41807, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 29, "name": "Hauwlo Zonweringen", "type": "customer", "ownerId": null, "initials": "HZ", "createdAt": "2025-06-16T20:52:24.296Z", "partnerId": 12, "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-29", "opportunityInfo": {"id": 159, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 29, "createdAt": "2025-06-16T20:56:53.041Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:53.041Z", "clientName": "Hauwlo Zonweringen", "description": null, "partnerName": "Mevas BV", "probability": 60, "customerName": "Hauwlo Zonweringen", "productCount": 0, "productNames": "", "estimated_value": 41807, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 81, "tags": null, "type": "contact", "email": "laura.janssen@company.nl", "notes": null, "phone": "+31 10 890 1234", "company": "Hauwlo Zonweringen", "full_name": "Laura Janssen", "is_active": true, "job_title": "Financial Controller", "last_name": "Janssen", "partnerId": 12, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Laura", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Mevas BV", "customerInfo": {"id": 29, "name": "Hauwlo Zonweringen", "ownerId": null, "initials": "HZ", "createdAt": "2025-06-16T20:52:24.296Z", "updatedAt": "2025-06-16T20:52:24.296Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-81", "opportunityInfo": {"id": 159, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 29, "createdAt": "2025-06-16T20:56:53.041Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:53.041Z", "clientName": "Hauwlo Zonweringen", "description": null, "partnerName": "Mevas BV", "probability": 60, "customerName": "Hauwlo Zonweringen", "productCount": 0, "productNames": "", "estimated_value": 41807, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 29, "linked_entity_type": "customer"}, {"id": 160, "type": "opportunity", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 53, "createdAt": "2025-06-16T20:56:53.117Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:53.117Z", "clientName": "Landman Siermetaal B.V.", "description": null, "partnerName": "Mevas BV", "probability": 0, "customerInfo": {"id": 53, "name": "Landman Siermetaal B.V.", "ownerId": null, "initials": "LS", "createdAt": "2025-06-16T20:55:58.861Z", "updatedAt": "2025-06-16T20:55:58.861Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "Landman Siermetaal B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-160", "estimated_value": 76161, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 53, "name": "Landman Siermetaal B.V.", "type": "customer", "ownerId": null, "initials": "LS", "createdAt": "2025-06-16T20:55:58.861Z", "partnerId": 12, "updatedAt": "2025-06-16T20:55:58.861Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Mevas BV", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-53", "opportunityInfo": {"id": 160, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 53, "createdAt": "2025-06-16T20:56:53.117Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:53.117Z", "clientName": "Landman Siermetaal B.V.", "description": null, "partnerName": "Mevas BV", "probability": 0, "customerName": "Landman Siermetaal B.V.", "productCount": 0, "productNames": "", "estimated_value": 76161, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 2, "totalOpportunityValue": 0}, {"id": 148, "tags": null, "type": "contact", "email": "sarah.devries@landman-siermetaal.nl", "notes": null, "phone": null, "company": null, "full_name": "Sarah de Vries", "is_active": true, "job_title": null, "last_name": "de Vries", "partnerId": 12, "created_at": "2025-07-12T13:00:22.508Z", "department": null, "first_name": "Sarah", "is_primary": true, "updated_at": "2025-07-12T13:00:22.508Z", "partnerName": "Mevas BV", "customerInfo": {"id": 53, "name": "Landman Siermetaal B.V.", "ownerId": null, "initials": "LS", "createdAt": "2025-06-16T20:55:58.861Z", "updatedAt": "2025-06-16T20:55:58.861Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "recipientKey": "contact-148", "opportunityInfo": {"id": 160, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 53, "createdAt": "2025-06-16T20:56:53.117Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:53.117Z", "clientName": "Landman Siermetaal B.V.", "description": null, "partnerName": "Mevas BV", "probability": 0, "customerName": "Landman Siermetaal B.V.", "productCount": 0, "productNames": "", "estimated_value": 76161, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 53, "linked_entity_type": "customer"}, {"id": 161, "type": "opportunity", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 53, "createdAt": "2025-06-16T20:56:53.193Z", "partnerId": 12, "productId": 1, "updatedAt": "2025-06-16T20:56:53.193Z", "clientName": "Landman Siermetaal B.V.", "description": null, "partnerName": "Mevas BV", "probability": 100, "customerInfo": {"id": 53, "name": "Landman Siermetaal B.V.", "ownerId": null, "initials": "LS", "createdAt": "2025-06-16T20:55:58.861Z", "updatedAt": "2025-06-16T20:55:58.861Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "Landman Siermetaal B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-161", "estimated_value": 67600, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 162, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 54, "createdAt": "2025-06-16T20:56:53.268Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.268Z", "clientName": "Ruud van Laer las en montagewerk", "description": null, "partnerName": "Induver", "probability": 30, "customerInfo": {"id": 54, "name": "Ruud van Laer las en montagewerk", "ownerId": null, "initials": "RV", "createdAt": "2025-06-16T20:55:58.936Z", "updatedAt": "2025-06-16T20:55:58.936Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Ruud van Laer las en montagewerk", "productCount": 0, "productNames": "", "recipientKey": "opportunity-162", "estimated_value": 74081, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 54, "name": "Ruud van Laer las en montagewerk", "type": "customer", "ownerId": null, "initials": "RV", "createdAt": "2025-06-16T20:55:58.936Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:58.936Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-54", "opportunityInfo": {"id": 162, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 54, "createdAt": "2025-06-16T20:56:53.268Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.268Z", "clientName": "Ruud van Laer las en montagewerk", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "Ruud van Laer las en montagewerk", "productCount": 0, "productNames": "", "estimated_value": 74081, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 82, "tags": null, "type": "contact", "email": "chris.vandermeer@company.nl", "notes": null, "phone": "+31 15 901 2345", "company": "Ruud van Laer las en montagewerk", "full_name": "Chris van der Meer", "is_active": true, "job_title": "Risk Manager", "last_name": "van der Meer", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Chris", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 54, "name": "Ruud van Laer las en montagewerk", "ownerId": null, "initials": "RV", "createdAt": "2025-06-16T20:55:58.936Z", "updatedAt": "2025-06-16T20:55:58.936Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-82", "opportunityInfo": {"id": 162, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 54, "createdAt": "2025-06-16T20:56:53.268Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.268Z", "clientName": "Ruud van Laer las en montagewerk", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "Ruud van Laer las en montagewerk", "productCount": 0, "productNames": "", "estimated_value": 74081, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 54, "linked_entity_type": "customer"}, {"id": 163, "type": "opportunity", "stage": "discovery", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 55, "createdAt": "2025-06-16T20:56:53.343Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-17T15:42:21.497Z", "clientName": "Duinhouwer BV", "description": null, "partnerName": "Induver", "probability": 75, "customerInfo": {"id": 55, "name": "Duinhouwer BV", "ownerId": null, "initials": "DB", "createdAt": "2025-06-16T20:55:59.011Z", "updatedAt": "2025-06-16T20:55:59.011Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Duinhouwer BV", "productCount": 0, "productNames": "", "recipientKey": "opportunity-163", "estimated_value": 75488, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 55, "name": "Duinhouwer BV", "type": "customer", "ownerId": null, "initials": "DB", "createdAt": "2025-06-16T20:55:59.011Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.011Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-55", "opportunityInfo": {"id": 163, "type": "New Business", "stage": "discovery", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 55, "createdAt": "2025-06-16T20:56:53.343Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-17T15:42:21.497Z", "clientName": "Duinhouwer BV", "description": null, "partnerName": "Induver", "probability": 75, "customerName": "Duinhouwer BV", "productCount": 0, "productNames": "", "estimated_value": 75488, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 164, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 56, "createdAt": "2025-06-16T20:56:53.418Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.418Z", "clientName": "TVG Las- en Montagetechniek", "description": null, "partnerName": "Induver", "probability": 30, "customerInfo": {"id": 56, "name": "TVG Las- en Montagetechniek", "ownerId": null, "initials": "TL", "createdAt": "2025-06-16T20:55:59.086Z", "updatedAt": "2025-06-16T20:55:59.086Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "TVG Las- en Montagetechniek", "productCount": 0, "productNames": "", "recipientKey": "opportunity-164", "estimated_value": 32036, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 56, "name": "TVG Las- en Montagetechniek", "type": "customer", "ownerId": null, "initials": "TL", "createdAt": "2025-06-16T20:55:59.086Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.086Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-56", "opportunityInfo": {"id": 164, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 56, "createdAt": "2025-06-16T20:56:53.418Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.418Z", "clientName": "TVG Las- en Montagetechniek", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "TVG Las- en Montagetechniek", "productCount": 0, "productNames": "", "estimated_value": 32036, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 77, "tags": null, "type": "contact", "email": "sophie.peters@company.nl", "notes": null, "phone": "+31 50 456 7890", "company": "TVG Las- en Montagetechniek", "full_name": "Sophie Peters", "is_active": true, "job_title": "CFO", "last_name": "Peters", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Sophie", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 56, "name": "TVG Las- en Montagetechniek", "ownerId": null, "initials": "TL", "createdAt": "2025-06-16T20:55:59.086Z", "updatedAt": "2025-06-16T20:55:59.086Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-77", "opportunityInfo": {"id": 164, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 56, "createdAt": "2025-06-16T20:56:53.418Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.418Z", "clientName": "TVG Las- en Montagetechniek", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "TVG Las- en Montagetechniek", "productCount": 0, "productNames": "", "estimated_value": 32036, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 56, "linked_entity_type": "customer"}, {"id": 165, "type": "opportunity", "stage": "Lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 57, "createdAt": "2025-06-16T20:56:53.494Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.494Z", "clientName": "Konstruktiebedrijf W. Verweij", "description": null, "partnerName": "Induver", "probability": 0, "customerInfo": {"id": 57, "name": "Konstruktiebedrijf W. Verweij", "ownerId": null, "initials": "KW", "createdAt": "2025-06-16T20:55:59.161Z", "updatedAt": "2025-06-16T20:55:59.161Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Konstruktiebedrijf W. Verweij", "productCount": 0, "productNames": "", "recipientKey": "opportunity-165", "estimated_value": 47666, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 57, "name": "Konstruktiebedrijf W. Verweij", "type": "customer", "ownerId": null, "initials": "KW", "createdAt": "2025-06-16T20:55:59.161Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.161Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-57", "opportunityInfo": {"id": 165, "type": "New Business", "stage": "Lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 57, "createdAt": "2025-06-16T20:56:53.494Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.494Z", "clientName": "Konstruktiebedrijf W. Verweij", "description": null, "partnerName": "Induver", "probability": 0, "customerName": "Konstruktiebedrijf W. Verweij", "productCount": 0, "productNames": "", "estimated_value": 47666, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 62, "tags": null, "type": "contact", "email": "chris.peters@company.nl", "notes": null, "phone": "+31 15 901 2345", "company": "Konstruktiebedrijf W. Verweij", "full_name": "Chris Peters", "is_active": true, "job_title": "Office Manager", "last_name": "Peters", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Chris", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 57, "name": "Konstruktiebedrijf W. Verweij", "ownerId": null, "initials": "KW", "createdAt": "2025-06-16T20:55:59.161Z", "updatedAt": "2025-06-16T20:55:59.161Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-62", "opportunityInfo": {"id": 165, "type": "New Business", "stage": "Lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 57, "createdAt": "2025-06-16T20:56:53.494Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.494Z", "clientName": "Konstruktiebedrijf W. Verweij", "description": null, "partnerName": "Induver", "probability": 0, "customerName": "Konstruktiebedrijf W. Verweij", "productCount": 0, "productNames": "", "estimated_value": 47666, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 57, "linked_entity_type": "customer"}, {"id": 166, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 58, "createdAt": "2025-06-16T20:56:53.569Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.569Z", "clientName": "AL 13 Architectural Facades", "description": null, "partnerName": "Induver", "probability": 30, "customerInfo": {"id": 58, "name": "AL 13 Architectural Facades", "ownerId": null, "initials": "A1", "createdAt": "2025-06-16T20:55:59.235Z", "updatedAt": "2025-06-16T20:55:59.235Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "AL 13 Architectural Facades", "productCount": 0, "productNames": "", "recipientKey": "opportunity-166", "estimated_value": 62229, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 58, "name": "AL 13 Architectural Facades", "type": "customer", "ownerId": null, "initials": "A1", "createdAt": "2025-06-16T20:55:59.235Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.235Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-58", "opportunityInfo": {"id": 166, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 58, "createdAt": "2025-06-16T20:56:53.569Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.569Z", "clientName": "AL 13 Architectural Facades", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "AL 13 Architectural Facades", "productCount": 0, "productNames": "", "estimated_value": 62229, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 167, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 59, "createdAt": "2025-06-16T20:56:53.645Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.645Z", "clientName": "Alutech Arnhem", "description": null, "partnerName": "Induver", "probability": 60, "customerInfo": {"id": 59, "name": "Alutech Arnhem", "ownerId": null, "initials": "AA", "createdAt": "2025-06-16T20:55:59.310Z", "updatedAt": "2025-06-16T20:55:59.310Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Alutech Arnhem", "productCount": 0, "productNames": "", "recipientKey": "opportunity-167", "estimated_value": 33931, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 59, "name": "Alutech Arnhem", "type": "customer", "ownerId": null, "initials": "AA", "createdAt": "2025-06-16T20:55:59.310Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.310Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-59", "opportunityInfo": {"id": 167, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 59, "createdAt": "2025-06-16T20:56:53.645Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.645Z", "clientName": "Alutech Arnhem", "description": null, "partnerName": "Induver", "probability": 60, "customerName": "Alutech Arnhem", "productCount": 0, "productNames": "", "estimated_value": 33931, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 29, "tags": null, "type": "contact", "email": "emma.degroot@company.nl", "notes": null, "phone": "+31 80 678 9012", "company": "Alutech Arnhem", "full_name": "Emma de Groot", "is_active": true, "job_title": "CFO", "last_name": "de Groot", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Emma", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 59, "name": "Alutech Arnhem", "ownerId": null, "initials": "AA", "createdAt": "2025-06-16T20:55:59.310Z", "updatedAt": "2025-06-16T20:55:59.310Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-29", "opportunityInfo": {"id": 167, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 59, "createdAt": "2025-06-16T20:56:53.645Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.645Z", "clientName": "Alutech Arnhem", "description": null, "partnerName": "Induver", "probability": 60, "customerName": "Alutech Arnhem", "productCount": 0, "productNames": "", "estimated_value": 33931, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 59, "linked_entity_type": "customer"}, {"id": 168, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 60, "createdAt": "2025-06-16T20:56:53.720Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.720Z", "clientName": "KO-MA Holding B.V.", "description": null, "partnerName": "Induver", "probability": 30, "customerInfo": {"id": 60, "name": "KO-MA Holding B.V.", "ownerId": null, "initials": "KH", "createdAt": "2025-06-16T20:55:59.385Z", "updatedAt": "2025-06-16T20:55:59.385Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "KO-MA Holding B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-168", "estimated_value": 37982, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 60, "name": "KO-MA Holding B.V.", "type": "customer", "ownerId": null, "initials": "KH", "createdAt": "2025-06-16T20:55:59.385Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.385Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-60", "opportunityInfo": {"id": 168, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 60, "createdAt": "2025-06-16T20:56:53.720Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.720Z", "clientName": "KO-MA Holding B.V.", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "KO-MA Holding B.V.", "productCount": 0, "productNames": "", "estimated_value": 37982, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 22, "tags": null, "type": "contact", "email": "chris.vandermeer@company.nl", "notes": null, "phone": "+31 15 901 2345", "company": "KO-MA Holding B.V.", "full_name": "Chris van der Meer", "is_active": true, "job_title": "Risk Manager", "last_name": "van der Meer", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Chris", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 60, "name": "KO-MA Holding B.V.", "ownerId": null, "initials": "KH", "createdAt": "2025-06-16T20:55:59.385Z", "updatedAt": "2025-06-16T20:55:59.385Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-22", "opportunityInfo": {"id": 168, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 60, "createdAt": "2025-06-16T20:56:53.720Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.720Z", "clientName": "KO-MA Holding B.V.", "description": null, "partnerName": "Induver", "probability": 30, "customerName": "KO-MA Holding B.V.", "productCount": 0, "productNames": "", "estimated_value": 37982, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 60, "linked_entity_type": "customer"}, {"id": 169, "type": "opportunity", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 61, "createdAt": "2025-06-16T20:56:53.796Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.796Z", "clientName": "RS-Lastechniek", "description": null, "partnerName": "Induver", "probability": 0, "customerInfo": {"id": 61, "name": "RS-Lastechniek", "ownerId": null, "initials": "R", "createdAt": "2025-06-16T20:55:59.460Z", "updatedAt": "2025-06-16T20:55:59.460Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "RS-Lastechniek", "productCount": 0, "productNames": "", "recipientKey": "opportunity-169", "estimated_value": 75926, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 61, "name": "RS-Lastechniek", "type": "customer", "ownerId": null, "initials": "R", "createdAt": "2025-06-16T20:55:59.460Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.460Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-61", "opportunityInfo": {"id": 169, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 61, "createdAt": "2025-06-16T20:56:53.796Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.796Z", "clientName": "RS-Lastechniek", "description": null, "partnerName": "Induver", "probability": 0, "customerName": "RS-Lastechniek", "productCount": 0, "productNames": "", "estimated_value": 75926, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 2, "totalOpportunityValue": 0}, {"id": 65, "tags": null, "type": "contact", "email": "sarah.dejong@company.nl", "notes": null, "phone": "+31 30 234 5678", "company": "RS-Lastechniek", "full_name": "Sarah de Jong", "is_active": true, "job_title": "CFO", "last_name": "de Jong", "partnerId": 26, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Sarah", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Induver", "customerInfo": {"id": 61, "name": "RS-Lastechniek", "ownerId": null, "initials": "R", "createdAt": "2025-06-16T20:55:59.460Z", "updatedAt": "2025-06-16T20:55:59.460Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "recipientKey": "contact-65", "opportunityInfo": {"id": 169, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 61, "createdAt": "2025-06-16T20:56:53.796Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.796Z", "clientName": "RS-Lastechniek", "description": null, "partnerName": "Induver", "probability": 0, "customerName": "RS-Lastechniek", "productCount": 0, "productNames": "", "estimated_value": 75926, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 61, "linked_entity_type": "customer"}, {"id": 170, "type": "opportunity", "stage": "Closed (Won)", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 61, "createdAt": "2025-06-16T20:56:53.872Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.872Z", "clientName": "RS-Lastechniek", "description": null, "partnerName": "Induver", "probability": 100, "customerInfo": {"id": 61, "name": "RS-Lastechniek", "ownerId": null, "initials": "R", "createdAt": "2025-06-16T20:55:59.460Z", "updatedAt": "2025-06-16T20:55:59.460Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "RS-Lastechniek", "productCount": 0, "productNames": "", "recipientKey": "opportunity-170", "estimated_value": 44400, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 171, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 62, "createdAt": "2025-06-16T20:56:53.946Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.946Z", "clientName": "Reparatiebedrijf H. Kelderman", "description": null, "partnerName": "Induver", "probability": 60, "customerInfo": {"id": 62, "name": "Reparatiebedrijf H. Kelderman", "ownerId": null, "initials": "RH", "createdAt": "2025-06-16T20:55:59.535Z", "updatedAt": "2025-06-16T20:55:59.535Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Reparatiebedrijf H. Kelderman", "productCount": 0, "productNames": "", "recipientKey": "opportunity-171", "estimated_value": 73145, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 62, "name": "Reparatiebedrijf H. Kelderman", "type": "customer", "ownerId": null, "initials": "RH", "createdAt": "2025-06-16T20:55:59.535Z", "partnerId": 26, "updatedAt": "2025-06-16T20:55:59.535Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Induver", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-62", "opportunityInfo": {"id": 171, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 62, "createdAt": "2025-06-16T20:56:53.946Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-16T20:56:53.946Z", "clientName": "Reparatiebedrijf H. Kelderman", "description": null, "partnerName": "Induver", "probability": 60, "customerName": "Reparatiebedrijf H. Kelderman", "productCount": 0, "productNames": "", "estimated_value": 73145, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 172, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 63, "createdAt": "2025-06-16T20:56:54.023Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.023Z", "clientName": "M. van Es", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerInfo": {"id": 63, "name": "M. van Es", "ownerId": null, "initials": "MV", "createdAt": "2025-06-16T20:55:59.609Z", "updatedAt": "2025-06-16T20:55:59.609Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "M. van Es", "productCount": 0, "productNames": "", "recipientKey": "opportunity-172", "estimated_value": 37611, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 63, "name": "M. van Es", "type": "customer", "ownerId": null, "initials": "MV", "createdAt": "2025-06-16T20:55:59.609Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.609Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-63", "opportunityInfo": {"id": 172, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 63, "createdAt": "2025-06-16T20:56:54.023Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.023Z", "clientName": "M. van Es", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "M. van Es", "productCount": 0, "productNames": "", "estimated_value": 37611, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 2, "totalOpportunityValue": 0}, {"id": 90, "tags": null, "type": "contact", "email": "robert.bos@company.nl", "notes": null, "phone": "+31 90 789 0123", "company": "M. van Es", "full_name": "Robert Bos", "is_active": true, "job_title": "Operations Manager", "last_name": "Bos", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Robert", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 63, "name": "M. van Es", "ownerId": null, "initials": "MV", "createdAt": "2025-06-16T20:55:59.609Z", "updatedAt": "2025-06-16T20:55:59.609Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "recipientKey": "contact-90", "opportunityInfo": {"id": 172, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 63, "createdAt": "2025-06-16T20:56:54.023Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.023Z", "clientName": "M. van Es", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "M. van Es", "productCount": 0, "productNames": "", "estimated_value": 37611, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 63, "linked_entity_type": "customer"}, {"id": 173, "type": "opportunity", "stage": "Lost", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 63, "createdAt": "2025-06-16T20:56:54.099Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.099Z", "clientName": "M. van Es", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerInfo": {"id": 63, "name": "M. van Es", "ownerId": null, "initials": "MV", "createdAt": "2025-06-16T20:55:59.609Z", "updatedAt": "2025-06-16T20:55:59.609Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "M. van Es", "productCount": 0, "productNames": "", "recipientKey": "opportunity-173", "estimated_value": 65902, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 174, "type": "opportunity", "stage": "proposal", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 64, "createdAt": "2025-06-16T20:56:54.175Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-17T15:42:28.590Z", "clientName": "Duinhouwer Onroerend Goed BV", "description": null, "partnerName": "Willis B.V", "probability": 75, "customerInfo": {"id": 64, "name": "Duinhouwer Onroerend Goed BV", "ownerId": null, "initials": "DO", "createdAt": "2025-06-16T20:55:59.686Z", "updatedAt": "2025-06-16T20:55:59.686Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Duinhouwer Onroerend Goed BV", "productCount": 0, "productNames": "", "recipientKey": "opportunity-174", "estimated_value": 56721, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 64, "name": "Duinhouwer Onroerend Goed BV", "type": "customer", "ownerId": null, "initials": "DO", "createdAt": "2025-06-16T20:55:59.686Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.686Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-64", "opportunityInfo": {"id": 174, "type": "New Business", "stage": "proposal", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 64, "createdAt": "2025-06-16T20:56:54.175Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-17T15:42:28.590Z", "clientName": "Duinhouwer Onroerend Goed BV", "description": null, "partnerName": "Willis B.V", "probability": 75, "customerName": "Duinhouwer Onroerend Goed BV", "productCount": 0, "productNames": "", "estimated_value": 56721, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 175, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 65, "createdAt": "2025-06-16T20:56:54.251Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.251Z", "clientName": "R. Schouten Beheer B.V.", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerInfo": {"id": 65, "name": "R. Schouten Beheer B.V.", "ownerId": null, "initials": "RS", "createdAt": "2025-06-16T20:55:59.761Z", "updatedAt": "2025-06-16T20:55:59.761Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "R. Schouten Beheer B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-175", "estimated_value": 38266, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 65, "name": "R. Schouten Beheer B.V.", "type": "customer", "ownerId": null, "initials": "RS", "createdAt": "2025-06-16T20:55:59.761Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.761Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-65", "opportunityInfo": {"id": 175, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 65, "createdAt": "2025-06-16T20:56:54.251Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.251Z", "clientName": "R. Schouten Beheer B.V.", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "R. Schouten Beheer B.V.", "productCount": 0, "productNames": "", "estimated_value": 38266, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 31, "tags": null, "type": "contact", "email": "maria.vos@company.nl", "notes": null, "phone": "+31 10 890 1234", "company": "R. Schouten Beheer B.V.", "full_name": "Maria Vos", "is_active": true, "job_title": "HR Manager", "last_name": "Vos", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Maria", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 65, "name": "R. Schouten Beheer B.V.", "ownerId": null, "initials": "RS", "createdAt": "2025-06-16T20:55:59.761Z", "updatedAt": "2025-06-16T20:55:59.761Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-31", "opportunityInfo": {"id": 175, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 65, "createdAt": "2025-06-16T20:56:54.251Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.251Z", "clientName": "R. Schouten Beheer B.V.", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "R. Schouten Beheer B.V.", "productCount": 0, "productNames": "", "estimated_value": 38266, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 65, "linked_entity_type": "customer"}, {"id": 176, "type": "opportunity", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 66, "createdAt": "2025-06-16T20:56:54.325Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.325Z", "clientName": "VR Steel", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerInfo": {"id": 66, "name": "VR Steel", "ownerId": null, "initials": "VS", "createdAt": "2025-06-16T20:55:59.835Z", "updatedAt": "2025-06-16T20:55:59.835Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "VR Steel", "productCount": 0, "productNames": "", "recipientKey": "opportunity-176", "estimated_value": 56623, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 66, "name": "VR Steel", "type": "customer", "ownerId": null, "initials": "VS", "createdAt": "2025-06-16T20:55:59.835Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.835Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-66", "opportunityInfo": {"id": 176, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 66, "createdAt": "2025-06-16T20:56:54.325Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.325Z", "clientName": "VR Steel", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerName": "VR Steel", "productCount": 0, "productNames": "", "estimated_value": 56623, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 177, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 67, "createdAt": "2025-06-16T20:56:54.400Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.400Z", "clientName": "Winters Metaaltechniek", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerInfo": {"id": 67, "name": "Winters Metaaltechniek", "ownerId": null, "initials": "WM", "createdAt": "2025-06-16T20:55:59.911Z", "updatedAt": "2025-06-16T20:55:59.911Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Winters Metaaltechniek", "productCount": 0, "productNames": "", "recipientKey": "opportunity-177", "estimated_value": 54991, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 67, "name": "Winters Metaaltechniek", "type": "customer", "ownerId": null, "initials": "WM", "createdAt": "2025-06-16T20:55:59.911Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.911Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-67", "opportunityInfo": {"id": 177, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 67, "createdAt": "2025-06-16T20:56:54.400Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.400Z", "clientName": "Winters Metaaltechniek", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "Winters Metaaltechniek", "productCount": 0, "productNames": "", "estimated_value": 54991, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 89, "tags": null, "type": "contact", "email": "emma.degroot@company.nl", "notes": null, "phone": "+31 80 678 9012", "company": "Winters Metaaltechniek", "full_name": "Emma de Groot", "is_active": true, "job_title": "CFO", "last_name": "de Groot", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Emma", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 67, "name": "Winters Metaaltechniek", "ownerId": null, "initials": "WM", "createdAt": "2025-06-16T20:55:59.911Z", "updatedAt": "2025-06-16T20:55:59.911Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-89", "opportunityInfo": {"id": 177, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 67, "createdAt": "2025-06-16T20:56:54.400Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.400Z", "clientName": "Winters Metaaltechniek", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "Winters Metaaltechniek", "productCount": 0, "productNames": "", "estimated_value": 54991, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 67, "linked_entity_type": "customer"}, {"id": 178, "type": "opportunity", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 68, "createdAt": "2025-06-16T20:56:54.476Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.476Z", "clientName": "Hofmeijer Las- en", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerInfo": {"id": 68, "name": "Hofmeijer Las- en", "ownerId": null, "initials": "HL", "createdAt": "2025-06-16T20:55:59.986Z", "updatedAt": "2025-06-16T20:55:59.986Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Hofmeijer Las- en", "productCount": 0, "productNames": "", "recipientKey": "opportunity-178", "estimated_value": 38113, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 68, "name": "Hofmeijer Las- en", "type": "customer", "ownerId": null, "initials": "HL", "createdAt": "2025-06-16T20:55:59.986Z", "partnerId": 1, "updatedAt": "2025-06-16T20:55:59.986Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-68", "opportunityInfo": {"id": 178, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 68, "createdAt": "2025-06-16T20:56:54.476Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.476Z", "clientName": "Hofmeijer Las- en", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerName": "Hofmeijer Las- en", "productCount": 0, "productNames": "", "estimated_value": 38113, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 8, "tags": null, "type": "contact", "email": "david.bakker@company.nl", "notes": null, "phone": "+31 70 567 8901", "company": "Hofmeijer Las- en", "full_name": "David Bakker", "is_active": true, "job_title": "Sales Manager", "last_name": "Bakker", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "David", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 68, "name": "Hofmeijer Las- en", "ownerId": null, "initials": "HL", "createdAt": "2025-06-16T20:55:59.986Z", "updatedAt": "2025-06-16T20:55:59.986Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-8", "opportunityInfo": {"id": 178, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 68, "createdAt": "2025-06-16T20:56:54.476Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.476Z", "clientName": "Hofmeijer Las- en", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerName": "Hofmeijer Las- en", "productCount": 0, "productNames": "", "estimated_value": 38113, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 68, "linked_entity_type": "customer"}, {"id": 179, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 69, "createdAt": "2025-06-16T20:56:54.552Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.552Z", "clientName": "Timmerman Techniek Assen B.V.", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerInfo": {"id": 69, "name": "Timmerman Techniek Assen B.V.", "ownerId": null, "initials": "TT", "createdAt": "2025-06-16T20:56:00.061Z", "updatedAt": "2025-06-16T20:56:00.061Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Timmerman Techniek Assen B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-179", "estimated_value": 20407, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 69, "name": "Timmerman Techniek Assen B.V.", "type": "customer", "ownerId": null, "initials": "TT", "createdAt": "2025-06-16T20:56:00.061Z", "partnerId": 1, "updatedAt": "2025-06-16T20:56:00.061Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-69", "opportunityInfo": {"id": 179, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 69, "createdAt": "2025-06-16T20:56:54.552Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.552Z", "clientName": "Timmerman Techniek Assen B.V.", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "Timmerman Techniek Assen B.V.", "productCount": 0, "productNames": "", "estimated_value": 20407, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 19, "tags": null, "type": "contact", "email": "julia.vandenberg@company.nl", "notes": null, "phone": "+31 80 678 9012", "company": "Timmerman Techniek Assen B.V.", "full_name": "Julia van den Berg", "is_active": true, "job_title": "HR Manager", "last_name": "van den Berg", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Julia", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 69, "name": "Timmerman Techniek Assen B.V.", "ownerId": null, "initials": "TT", "createdAt": "2025-06-16T20:56:00.061Z", "updatedAt": "2025-06-16T20:56:00.061Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-19", "opportunityInfo": {"id": 179, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 69, "createdAt": "2025-06-16T20:56:54.552Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.552Z", "clientName": "Timmerman Techniek Assen B.V.", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "Timmerman Techniek Assen B.V.", "productCount": 0, "productNames": "", "estimated_value": 20407, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 69, "linked_entity_type": "customer"}, {"id": 180, "type": "opportunity", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 70, "createdAt": "2025-06-16T20:56:54.627Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.627Z", "clientName": "Elektim-Techniek B.V.", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerInfo": {"id": 70, "name": "Elektim-Techniek B.V.", "ownerId": null, "initials": "EB", "createdAt": "2025-06-16T20:56:00.135Z", "updatedAt": "2025-06-16T20:56:00.135Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Elektim-Techniek B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-180", "estimated_value": 42446, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 70, "name": "Elektim-Techniek B.V.", "type": "customer", "ownerId": null, "initials": "EB", "createdAt": "2025-06-16T20:56:00.135Z", "partnerId": 1, "updatedAt": "2025-06-16T20:56:00.135Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-70", "opportunityInfo": {"id": 180, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 70, "createdAt": "2025-06-16T20:56:54.627Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.627Z", "clientName": "Elektim-Techniek B.V.", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerName": "Elektim-Techniek B.V.", "productCount": 0, "productNames": "", "estimated_value": 42446, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 13, "tags": null, "type": "contact", "email": "anna.mulder@company.nl", "notes": null, "phone": "+31 25 012 3456", "company": "Elektim-Techniek B.V.", "full_name": "Anna Mulder", "is_active": true, "job_title": "Business Development", "last_name": "Mulder", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Anna", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 70, "name": "Elektim-Techniek B.V.", "ownerId": null, "initials": "EB", "createdAt": "2025-06-16T20:56:00.135Z", "updatedAt": "2025-06-16T20:56:00.135Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-13", "opportunityInfo": {"id": 180, "type": "New Business", "stage": "Rejected", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 70, "createdAt": "2025-06-16T20:56:54.627Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.627Z", "clientName": "Elektim-Techniek B.V.", "description": null, "partnerName": "Willis B.V", "probability": 0, "customerName": "Elektim-Techniek B.V.", "productCount": 0, "productNames": "", "estimated_value": 42446, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 70, "linked_entity_type": "customer"}, {"id": 181, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 71, "createdAt": "2025-06-16T20:56:54.702Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.702Z", "clientName": "Gelderland Hekwerken B.V.", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerInfo": {"id": 71, "name": "Gelderland Hekwerken B.V.", "ownerId": null, "initials": "GH", "createdAt": "2025-06-16T20:56:00.211Z", "updatedAt": "2025-06-16T20:56:00.211Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Gelderland Hekwerken B.V.", "productCount": 0, "productNames": "", "recipientKey": "opportunity-181", "estimated_value": 30385, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 71, "name": "Gelderland Hekwerken B.V.", "type": "customer", "ownerId": null, "initials": "GH", "createdAt": "2025-06-16T20:56:00.211Z", "partnerId": 1, "updatedAt": "2025-06-16T20:56:00.211Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-71", "opportunityInfo": {"id": 181, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 71, "createdAt": "2025-06-16T20:56:54.702Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.702Z", "clientName": "Gelderland Hekwerken B.V.", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "Gelderland Hekwerken B.V.", "productCount": 0, "productNames": "", "estimated_value": 30385, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 6, "tags": null, "type": "contact", "email": "michael.janssen@company.nl", "notes": null, "phone": "+31 40 345 6789", "company": "Gelderland Hekwerken B.V.", "full_name": "Michael Janssen", "is_active": true, "job_title": "Operations Manager", "last_name": "Janssen", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Michael", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 71, "name": "Gelderland Hekwerken B.V.", "ownerId": null, "initials": "GH", "createdAt": "2025-06-16T20:56:00.211Z", "updatedAt": "2025-06-16T20:56:00.211Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-6", "opportunityInfo": {"id": 181, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 71, "createdAt": "2025-06-16T20:56:54.702Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.702Z", "clientName": "Gelderland Hekwerken B.V.", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "Gelderland Hekwerken B.V.", "productCount": 0, "productNames": "", "estimated_value": 30385, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 71, "linked_entity_type": "customer"}, {"id": 182, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 72, "createdAt": "2025-06-16T20:56:54.778Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.778Z", "clientName": "Stephan Borgers", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerInfo": {"id": 72, "name": "Stephan Borgers", "ownerId": null, "initials": "SB", "createdAt": "2025-06-16T20:56:00.337Z", "updatedAt": "2025-06-16T20:56:00.337Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Stephan Borgers", "productCount": 0, "productNames": "", "recipientKey": "opportunity-182", "estimated_value": 47722, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 72, "name": "Stephan Borgers", "type": "customer", "ownerId": null, "initials": "SB", "createdAt": "2025-06-16T20:56:00.337Z", "partnerId": 1, "updatedAt": "2025-06-16T20:56:00.337Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-72", "opportunityInfo": {"id": 182, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 72, "createdAt": "2025-06-16T20:56:54.778Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.778Z", "clientName": "Stephan Borgers", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "Stephan Borgers", "productCount": 0, "productNames": "", "estimated_value": 47722, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 60, "tags": null, "type": "contact", "email": "andreas.bos@company.nl", "notes": null, "phone": "+31 90 789 0123", "company": "Stephan Borgers", "full_name": "Andreas Bos", "is_active": true, "job_title": "Project Manager", "last_name": "Bos", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Andreas", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 72, "name": "Stephan Borgers", "ownerId": null, "initials": "SB", "createdAt": "2025-06-16T20:56:00.337Z", "updatedAt": "2025-06-16T20:56:00.337Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-60", "opportunityInfo": {"id": 182, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 72, "createdAt": "2025-06-16T20:56:54.778Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.778Z", "clientName": "Stephan Borgers", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "Stephan Borgers", "productCount": 0, "productNames": "", "estimated_value": 47722, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 72, "linked_entity_type": "customer"}, {"id": 183, "type": "opportunity", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 73, "createdAt": "2025-06-16T20:56:54.853Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.853Z", "clientName": "Gartech", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerInfo": {"id": 73, "name": "Gartech", "ownerId": null, "initials": "G", "createdAt": "2025-06-16T20:56:00.412Z", "updatedAt": "2025-06-16T20:56:00.412Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "customerName": "Gartech", "productCount": 0, "productNames": "", "recipientKey": "opportunity-183", "estimated_value": 42844, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 73, "name": "Gartech", "type": "customer", "ownerId": null, "initials": "G", "createdAt": "2025-06-16T20:56:00.412Z", "partnerId": 1, "updatedAt": "2025-06-16T20:56:00.412Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-73", "opportunityInfo": {"id": 183, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 73, "createdAt": "2025-06-16T20:56:54.853Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.853Z", "clientName": "Gartech", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "Gartech", "productCount": 0, "productNames": "", "estimated_value": 42844, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 1, "totalOpportunityValue": 0}, {"id": 36, "tags": null, "type": "contact", "email": "thomas.janssen@company.nl", "notes": null, "phone": "+31 40 345 6789", "company": "Gartech", "full_name": "Thomas Janssen", "is_active": true, "job_title": "Project Manager", "last_name": "Janssen", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Thomas", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 73, "name": "Gartech", "ownerId": null, "initials": "G", "createdAt": "2025-06-16T20:56:00.412Z", "updatedAt": "2025-06-16T20:56:00.412Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 1, "totalOpportunityValue": 0}, "recipientKey": "contact-36", "opportunityInfo": {"id": 183, "type": "New Business", "stage": "Validated", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 73, "createdAt": "2025-06-16T20:56:54.853Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.853Z", "clientName": "Gartech", "description": null, "partnerName": "Willis B.V", "probability": 30, "customerName": "Gartech", "productCount": 0, "productNames": "", "estimated_value": 42844, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 73, "linked_entity_type": "customer"}, {"id": 184, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 74, "createdAt": "2025-06-16T20:56:54.928Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.928Z", "clientName": "Amuko Service", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerInfo": {"id": 74, "name": "Amuko Service", "ownerId": null, "initials": "AS", "createdAt": "2025-06-16T20:56:00.487Z", "updatedAt": "2025-06-16T20:56:00.487Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "Amuko Service", "productCount": 0, "productNames": "", "recipientKey": "opportunity-184", "estimated_value": 24140, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 74, "name": "Amuko Service", "type": "customer", "ownerId": null, "initials": "AS", "createdAt": "2025-06-16T20:56:00.487Z", "partnerId": 1, "updatedAt": "2025-06-16T20:56:00.487Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerName": "Willis B.V", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "recipientKey": "customer-74", "opportunityInfo": {"id": 184, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 74, "createdAt": "2025-06-16T20:56:54.928Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.928Z", "clientName": "Amuko Service", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "Amuko Service", "productCount": 0, "productNames": "", "estimated_value": 24140, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 2, "totalOpportunityValue": 0}, {"id": 80, "tags": null, "type": "contact", "email": "andreas.dejong@company.nl", "notes": null, "phone": "+31 90 789 0123", "company": "Amuko Service", "full_name": "Andreas de Jong", "is_active": true, "job_title": "Sales Manager", "last_name": "de Jong", "partnerId": 1, "created_at": "2025-07-09T10:16:29.058Z", "department": null, "first_name": "Andreas", "is_primary": true, "updated_at": "2025-07-09T10:16:29.058Z", "partnerName": "Willis B.V", "customerInfo": {"id": 74, "name": "Amuko Service", "ownerId": null, "initials": "AS", "createdAt": "2025-06-16T20:56:00.487Z", "updatedAt": "2025-06-16T20:56:00.487Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "recipientKey": "contact-80", "opportunityInfo": {"id": 184, "type": "New Business", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 74, "createdAt": "2025-06-16T20:56:54.928Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:54.928Z", "clientName": "Amuko Service", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerName": "Amuko Service", "productCount": 0, "productNames": "", "estimated_value": 24140, "expectedCloseDate": null, "accountManagerName": ""}, "linked_entity_id": 74, "linked_entity_type": "customer"}, {"id": 185, "type": "opportunity", "stage": "Proposal Sent to Client", "title": "Zonnepanelen", "status": "Active", "ownerId": null, "clientId": 74, "createdAt": "2025-06-16T20:56:55.003Z", "partnerId": 1, "productId": 1, "updatedAt": "2025-06-16T20:56:55.003Z", "clientName": "Amuko Service", "description": null, "partnerName": "Willis B.V", "probability": 60, "customerInfo": {"id": 74, "name": "Amuko Service", "ownerId": null, "initials": "AS", "createdAt": "2025-06-16T20:56:00.487Z", "updatedAt": "2025-06-16T20:56:00.487Z", "partnerIds": "12", "description": "Customer created from Excel import", "partnerCount": 1, "partnerNames": "Mevas BV", "productCount": 0, "opportunityCount": 2, "totalOpportunityValue": 0}, "customerName": "Amuko Service", "productCount": 0, "productNames": "", "recipientKey": "opportunity-185", "estimated_value": 53268, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 376, "type": "opportunity", "stage": "proposal", "title": "Einde termijn IPT - Bart De Smet", "status": null, "ownerId": null, "clientId": 206, "createdAt": "2025-06-23T10:16:44.407Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-07-11T12:23:14.355Z", "clientName": "Bart De Smet", "description": "End-term life insurance renewal", "partnerName": "Induver", "probability": 75, "customerName": "Bart De Smet", "productCount": 0, "productNames": "", "recipientKey": "opportunity-376", "estimated_value": 100000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 377, "type": "opportunity", "stage": "qualification", "title": "Einde termijn IPT - Sofie Peeters", "status": null, "ownerId": null, "clientId": 207, "createdAt": "2025-06-23T10:16:44.407Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-07-09T13:43:41.945Z", "clientName": "Sofie Peeters", "description": "End-term life insurance renewal", "partnerName": "Induver", "probability": 75, "customerName": "Sofie Peeters", "productCount": 0, "productNames": "", "recipientKey": "opportunity-377", "estimated_value": 100000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 378, "type": "opportunity", "stage": "Negotiation", "title": "Einde termijn IPT - Tom Vermeulen", "status": null, "ownerId": null, "clientId": 208, "createdAt": "2025-06-23T10:16:44.407Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-23T10:16:44.407Z", "clientName": "Tom Vermeulen", "description": "End-term life insurance renewal", "partnerName": "Induver", "probability": 75, "customerName": "Tom Vermeulen", "productCount": 0, "productNames": "", "recipientKey": "opportunity-378", "estimated_value": 100000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 379, "type": "opportunity", "stage": "Negotiation", "title": "Einde termijn IPT - Elke Janssens", "status": null, "ownerId": null, "clientId": 209, "createdAt": "2025-06-23T10:16:44.407Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-23T10:16:44.407Z", "clientName": "Elke Janssens", "description": "End-term life insurance renewal", "partnerName": "Induver", "probability": 75, "customerName": "Elke Janssens", "productCount": 0, "productNames": "", "recipientKey": "opportunity-379", "estimated_value": 100000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 260, "type": "opportunity", "stage": null, "title": "Zonnepanelen onbekend", "status": "prospect", "ownerId": null, "clientId": 111, "createdAt": "2025-06-16T23:09:30.041Z", "partnerId": 19, "productId": 13, "updatedAt": "2025-06-16T23:09:30.041Z", "clientName": "KERAF BV", "description": "Solar panel insurance opportunity: Zonnepanelen onbekend", "partnerName": "Aon Risico Management", "probability": 25, "customerInfo": {"id": 111, "name": "KERAF BV", "ownerId": null, "initials": "KB", "createdAt": "2025-06-16T23:05:13.575Z", "updatedAt": "2025-06-16T23:05:13.575Z", "partnerIds": "19", "description": "Insurance client for Inventaris/Goederen Conversie", "partnerCount": 1, "partnerNames": "Aon Risico Management", "productCount": 0, "opportunityCount": 0, "totalOpportunityValue": 0}, "customerName": "KERAF BV", "productCount": 0, "productNames": "", "recipientKey": "opportunity-260", "estimated_value": 47166, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 111, "name": "KERAF BV", "type": "customer", "ownerId": null, "initials": "KB", "createdAt": "2025-06-16T23:05:13.575Z", "partnerId": 19, "updatedAt": "2025-06-16T23:05:13.575Z", "partnerIds": "19", "description": "Insurance client for Inventaris/Goederen Conversie", "partnerName": "Aon Risico Management", "partnerCount": 1, "partnerNames": "Aon Risico Management", "productCount": 0, "recipientKey": "customer-111", "opportunityInfo": {"id": 260, "type": null, "stage": null, "title": "Zonnepanelen onbekend", "status": "prospect", "ownerId": null, "clientId": 111, "createdAt": "2025-06-16T23:09:30.041Z", "partnerId": 19, "productId": 13, "updatedAt": "2025-06-16T23:09:30.041Z", "clientName": "KERAF BV", "description": "Solar panel insurance opportunity: Zonnepanelen onbekend", "partnerName": "Aon Risico Management", "probability": 25, "customerName": "KERAF BV", "productCount": 0, "productNames": "", "estimated_value": 47166, "expectedCloseDate": null, "accountManagerName": ""}, "opportunityCount": 0, "totalOpportunityValue": 0}, {"id": 261, "type": "opportunity", "stage": "Lost", "title": "Zonnepanelen onbekend", "status": "prospect", "ownerId": null, "clientId": 111, "createdAt": "2025-06-16T23:09:30.188Z", "partnerId": 19, "productId": 13, "updatedAt": "2025-06-16T23:09:30.188Z", "clientName": "KERAF BV", "description": "Solar panel insurance opportunity: Zonnepanelen onbekend", "partnerName": "Aon Risico Management", "probability": 0, "customerInfo": {"id": 111, "name": "KERAF BV", "ownerId": null, "initials": "KB", "createdAt": "2025-06-16T23:05:13.575Z", "updatedAt": "2025-06-16T23:05:13.575Z", "partnerIds": "19", "description": "Insurance client for Inventaris/Goederen Conversie", "partnerCount": 1, "partnerNames": "Aon Risico Management", "productCount": 0, "opportunityCount": 0, "totalOpportunityValue": 0}, "customerName": "KERAF BV", "productCount": 0, "productNames": "", "recipientKey": "opportunity-261", "estimated_value": 48910, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 262, "type": "opportunity", "stage": "Lost", "title": "Zonnepanelen onbekend", "status": "prospect", "ownerId": null, "clientId": 111, "createdAt": "2025-06-16T23:09:30.333Z", "partnerId": 19, "productId": 13, "updatedAt": "2025-06-16T23:09:30.333Z", "clientName": "KERAF BV", "description": "Solar panel insurance opportunity: Zonnepanelen onbekend", "partnerName": "Aon Risico Management", "probability": 0, "customerInfo": {"id": 111, "name": "KERAF BV", "ownerId": null, "initials": "KB", "createdAt": "2025-06-16T23:05:13.575Z", "updatedAt": "2025-06-16T23:05:13.575Z", "partnerIds": "19", "description": "Insurance client for Inventaris/Goederen Conversie", "partnerCount": 1, "partnerNames": "Aon Risico Management", "productCount": 0, "opportunityCount": 0, "totalOpportunityValue": 0}, "customerName": "KERAF BV", "productCount": 0, "productNames": "", "recipientKey": "opportunity-262", "estimated_value": 53445, "expectedCloseDate": null, "accountManagerName": ""}]	0	0	0.00	0	\N	\N	\N	f	not_shared
22	Einde Termijn IPT Campaign	Term end renewal campaign for life insurance policies	email	\N	draft	1	\N	\N	Proficiat met jouw pensioen!	[{"id":"xs0vcu9t5","type":"heading","content":"Proficiat met jouw pensioen!","properties":{}},{"id":"60207khoa","type":"text","content":"Beste {{name}}","properties":{}},{"id":"k7jmc8at5","type":"text","content":"Proficiat met jouw welverdiende pensioen! Je kan je afvragen: \\"wat nu?\\" ","properties":{}},{"id":"89rkdl68m","type":"text","content":"Wel, we gaan over tot het uitkeren van jouw IPT fonds aan jou. Graag hadden we hiervoor kort besproken welke opties er voor jou zijn. Boek een moment met ons hier: ","properties":{}},{"id":"6pwewvxfc","type":"button","content":"Kalendar link","properties":{"url":"Kalendar link here"}}]	\N	\N	\N	\N	one_time	f	f	\N	2025-06-23 10:06:36.432564	2025-06-23 11:29:00.079948	\N	\N	\N	\N	\N	\N	opportunities	[{"id": 39, "name": "Einde Termijn", "type": "entity", "filters": {}, "members": [376, 377, 378, 379], "is_shared": true, "created_at": "2025-06-23T11:25:53.989Z", "created_by": 1, "is_default": false, "partner_id": 26, "updated_at": "2025-06-23T11:26:19.230Z", "description": "", "entity_type": "opportunities", "recipientKey": "entity-39"}, {"id": 376, "type": "entity", "stage": "Negotiation", "title": "Einde termijn IPT - Bart De Smet", "status": null, "ownerId": null, "clientId": 206, "createdAt": "2025-06-23T10:16:44.407Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-23T10:16:44.407Z", "clientName": "Bart De Smet", "description": "End-term life insurance renewal", "partnerName": "Induver", "probability": 75, "customerName": "Bart De Smet", "productNames": "Property Insurance", "recipientKey": "entity-376", "estimated_value": 100000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 377, "type": "entity", "stage": "Negotiation", "title": "Einde termijn IPT - Sofie Peeters", "status": null, "ownerId": null, "clientId": 207, "createdAt": "2025-06-23T10:16:44.407Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-23T10:16:44.407Z", "clientName": "Sofie Peeters", "description": "End-term life insurance renewal", "partnerName": "Induver", "probability": 75, "customerName": "Sofie Peeters", "productNames": "Property Insurance", "recipientKey": "entity-377", "estimated_value": 100000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 378, "type": "entity", "stage": "Negotiation", "title": "Einde termijn IPT - Tom Vermeulen", "status": null, "ownerId": null, "clientId": 208, "createdAt": "2025-06-23T10:16:44.407Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-23T10:16:44.407Z", "clientName": "Tom Vermeulen", "description": "End-term life insurance renewal", "partnerName": "Induver", "probability": 75, "customerName": "Tom Vermeulen", "productNames": "Property Insurance", "recipientKey": "entity-378", "estimated_value": 100000, "expectedCloseDate": null, "accountManagerName": ""}, {"id": 379, "type": "entity", "stage": "Negotiation", "title": "Einde termijn IPT - Elke Janssens", "status": null, "ownerId": null, "clientId": 209, "createdAt": "2025-06-23T10:16:44.407Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-23T10:16:44.407Z", "clientName": "Elke Janssens", "description": "End-term life insurance renewal", "partnerName": "Induver", "probability": 75, "customerName": "Elke Janssens", "productNames": "Property Insurance", "recipientKey": "entity-379", "estimated_value": 100000, "expectedCloseDate": null, "accountManagerName": ""}]	0	0	0.00	0	\N	\N	\N	f	not_shared
8	Secure Your Income – AOV Upsell Drive	This campaign helps identify and approach clients who currently hold life or basic health insurance, but are not yet covered for income loss due to disability. The aim is to position De Goudse’s AOV (arbeidsongeschiktheidsverzekering) product as an essential complement to their existing coverage.	email	\N	draft	1	\N	\N	Is uw inkomen beschermd als u niet kunt werken?	[{"id":"6hgntumij","type":"heading","content":"Een kleine stap vandaag voor gemoedsrust morgen.","properties":{}},{"id":"ql9o8knfi","type":"text","content":"Beste {{naam}},","properties":{}},{"id":"7xdnhseho","type":"spacer","content":"","properties":{}},{"id":"0whae6m5m","type":"text","content":"Heeft u er weleens bij stilgestaan wat er gebeurt als u tijdelijk of langdurig niet kunt werken door ziekte of een ongeval?","properties":{}},{"id":"tz32m67zt","type":"text","content":"Veel van onze klanten hebben al een goede basisverzekering, maar zonder een arbeidsongeschiktheidsverzekering (AOV) is hun inkomen vaak niet volledig beschermd. Bij De Goudse bieden we oplossingen die ervoor zorgen dat u financieel stabiel blijft – wat er ook gebeurt.","properties":{}},{"id":"ncnbhnfbd","type":"text","content":"Laten we kort afstemmen welke dekking het beste bij uw situatie past. Ik bezorg u graag vrijblijvend een persoonlijk voorstel.","properties":{}},{"id":"vznc4lcom","type":"spacer","content":"","properties":{}},{"id":"ywg1ovl2s","type":"text","content":"Bescherm uw inkomen. Zeker uw toekomst.","properties":{}},{"id":"5m4snt5f7","type":"spacer","content":"","properties":{}},{"id":"hg9js2rd8","type":"text","content":"Met vriendelijke groet,","properties":{}},{"id":"a9t22gg9b","type":"text","content":"{{Naam tussenpersoon}}","properties":{}},{"id":"lbcc1hn0b","type":"text","content":"{{Naam kantoor / Contactgegevens}}","properties":{}}]	\N	\N	\N	\N	one_time	f	f	\N	2025-03-28 09:45:32	2025-07-01 14:48:22.151628	\N	\N	\N	\N	\N	Increase AOV policy adoption by 20% among eligible clients within Q3 by proactively targeting them through personalized outreach.	opportunities	[{"id": 1, "type": "entity", "stage": "closed_won", "title": "ABC Property Portfolio Renewal", "status": "active", "ownerId": null, "clientId": 1, "createdAt": "2025-06-05T13:59:18.048Z", "partnerId": null, "productId": 1, "updatedAt": "2025-06-05T13:59:18.048Z", "clientName": "RGO Makelaars B.V.", "description": "Annual renewal of commercial property portfolio", "probability": 75, "contactCount": 3, "partnerCount": 1, "partnerNames": "Regional Insurance Partners", "productCount": 1, "productNames": "Property Insurance", "recipientKey": "entity-1", "customerCount": 1, "customerNames": "RGO Makelaars B.V.", "estimatedValue": 500000, "expectedCloseDate": null}, {"id": 1, "tags": null, "type": "contact", "email": "john.smith@rgo-makelaars.nl", "notes": null, "phone": "+31 20 123 4567", "company": "RGO Makelaars B.V.", "full_name": "John Smith", "is_active": true, "job_title": "CEO", "last_name": "Smith", "created_at": "2025-06-11T12:12:55.965Z", "department": "Management", "first_name": "John", "is_primary": true, "updated_at": "2025-06-11T12:12:55.965Z", "recipientKey": "contact-1", "linked_entity_id": 1, "linked_entity_type": "customer"}, {"id": 3, "tags": null, "type": "contact", "email": "michel.jansen@rgo-makelaars.nl", "notes": null, "phone": "+31 20 123 4569", "company": "RGO Makelaars B.V.", "full_name": "Michel Jansen", "is_active": true, "job_title": "Account Manager", "last_name": "Jansen", "created_at": "2025-06-11T12:12:55.965Z", "department": "Sales", "first_name": "Michel", "is_primary": false, "updated_at": "2025-06-11T12:12:55.965Z", "recipientKey": "contact-3", "linked_entity_id": 1, "linked_entity_type": "customer"}, {"id": 2, "tags": null, "type": "contact", "email": "sarah.vandeberg@rgo-makelaars.nl", "notes": null, "phone": "+31 20 123 4568", "company": "RGO Makelaars B.V.", "full_name": "Sarah van der Berg", "is_active": true, "job_title": "Operations Manager", "last_name": "van der Berg", "created_at": "2025-06-11T12:12:55.965Z", "department": "Operations", "first_name": "Sarah", "is_primary": false, "updated_at": "2025-06-11T12:12:55.965Z", "recipientKey": "contact-2", "linked_entity_id": 1, "linked_entity_type": "customer"}, {"id": 1, "name": "RGO Makelaars B.V.", "type": "customer", "ownerId": 1, "initials": "RM", "createdAt": "2025-06-05T13:59:18.048Z", "updatedAt": "2025-06-05T13:59:18.048Z", "description": "Real estate brokerage and property services", "partnerCount": 2, "partnerNames": "Quick Insurance Solutions, Regional Insurance Partners", "recipientKey": "customer-1", "opportunityCount": 2}, {"id": 1, "tags": null, "type": "contact", "email": "john.smith@rgo-makelaars.nl", "notes": null, "phone": "+31 20 123 4567", "company": "RGO Makelaars B.V.", "full_name": "John Smith", "is_active": true, "job_title": "CEO", "last_name": "Smith", "created_at": "2025-06-11T12:12:55.965Z", "department": "Management", "first_name": "John", "is_primary": true, "updated_at": "2025-06-11T12:12:55.965Z", "recipientKey": "contact-1", "linked_entity_id": 1, "linked_entity_type": "customer"}, {"id": 3, "tags": null, "type": "contact", "email": "michel.jansen@rgo-makelaars.nl", "notes": null, "phone": "+31 20 123 4569", "company": "RGO Makelaars B.V.", "full_name": "Michel Jansen", "is_active": true, "job_title": "Account Manager", "last_name": "Jansen", "created_at": "2025-06-11T12:12:55.965Z", "department": "Sales", "first_name": "Michel", "is_primary": false, "updated_at": "2025-06-11T12:12:55.965Z", "recipientKey": "contact-3", "linked_entity_id": 1, "linked_entity_type": "customer"}, {"id": 2, "tags": null, "type": "contact", "email": "sarah.vandeberg@rgo-makelaars.nl", "notes": null, "phone": "+31 20 123 4568", "company": "RGO Makelaars B.V.", "full_name": "Sarah van der Berg", "is_active": true, "job_title": "Operations Manager", "last_name": "van der Berg", "created_at": "2025-06-11T12:12:55.965Z", "department": "Operations", "first_name": "Sarah", "is_primary": false, "updated_at": "2025-06-11T12:12:55.965Z", "recipientKey": "contact-2", "linked_entity_id": 1, "linked_entity_type": "customer"}, {"id": 166, "type": "entity", "stage": "Prospecting", "title": "Zonnepanelen", "status": "active", "clientId": 58, "partnerId": 12, "productId": 1, "clientName": "AL 13 Architectural Facades", "description": "Solar panel insurance opportunity", "partnerName": "Mevas BV", "probability": 75, "productName": "Property Insurance", "recipientKey": "entity-166", "estimatedValue": 50000}, {"id": 39, "name": "Einde Termijn", "type": "entity", "filters": {}, "members": [376, 377, 378, 379], "is_shared": true, "created_at": "2025-06-23T11:25:53.989Z", "created_by": 1, "is_default": false, "partner_id": 26, "updated_at": "2025-06-24T12:22:58.290Z", "description": "", "entity_type": "opportunities", "recipientKey": "entity-39"}, {"id": 376, "type": "entity", "stage": "Closed (Won)", "title": "Einde termijn IPT - Bart De Smet", "status": null, "ownerId": null, "clientId": 206, "createdAt": "2025-06-23T10:16:44.407Z", "partnerId": 26, "productId": 1, "updatedAt": "2025-06-24T12:31:47.823Z", "clientName": "Bart De Smet", "description": "End-term life insurance renewal", "partnerName": "Induver", "probability": 75, "customerName": "Bart De Smet", "productCount": 4, "productNames": "Property Insurance", "recipientKey": "entity-376", "estimated_value": 100000, "expectedCloseDate": null, "accountManagerName": ""}]	45	23	51.11	12	\N	\N	degoudse	f	not_shared
25	Test	test	email	\N	published	1	\N	\N	Test Camp	[]	\N	\N	\N	\N	one_time	f	t	\N	2025-07-01 15:14:33.667941	2025-07-01 15:14:33.667941	\N	\N	\N	\N	[{"subject":"","body":"[]","send_after_days":7}]	test	customers	\N	0	0	0.00	0	star	\N	\N	f	not_shared
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.categories (id, name, color, description, parent_id, level, sort_order, is_active, created_at, updated_at, icon) FROM stdin;
79	Overige	#F59E0B	\N	\N	1	0	t	2025-07-06 15:04:37.021956	2025-07-06 15:04:37.021956	\N
76	Pensioen	#8B5CF6	\N	\N	1	0	t	2025-07-06 15:04:36.789752	2025-07-06 15:04:36.789752	\N
77	Inkomen Collectief	#06B6D4	\N	\N	1	0	t	2025-07-06 15:04:36.865853	2025-07-06 15:04:36.865853	\N
78	Schade Zakelijk	#EF4444	\N	\N	1	0	t	2025-07-06 15:04:36.94651	2025-07-06 15:04:36.94651	\N
80	NN PPP	#8B5CF6	\N	76	2	0	t	2025-07-06 15:04:37.097765	2025-07-06 15:04:37.097765	\N
81	Bewust Pensioen Plus	#8B5CF6	\N	76	2	0	t	2025-07-06 15:04:37.175035	2025-07-06 15:04:37.175035	\N
82	Netto Pensioen	#8B5CF6	\N	76	2	0	t	2025-07-06 15:04:37.249813	2025-07-06 15:04:37.249813	\N
83	Garant Pensioen Plan	#8B5CF6	\N	76	2	0	t	2025-07-06 15:04:37.3264	2025-07-06 15:04:37.3264	\N
84	PPPc	#8B5CF6	\N	76	2	0	t	2025-07-06 15:04:37.402721	2025-07-06 15:04:37.402721	\N
85	WGA ERD	#06B6D4	\N	77	2	0	t	2025-07-06 15:04:37.478912	2025-07-06 15:04:37.478912	\N
86	WGA Hiaat	#06B6D4	\N	77	2	0	t	2025-07-06 15:04:37.554218	2025-07-06 15:04:37.554218	\N
87	WIA Excedent	#06B6D4	\N	77	2	0	t	2025-07-06 15:04:37.629488	2025-07-06 15:04:37.629488	\N
88	WIA ERD	#06B6D4	\N	77	2	0	t	2025-07-06 15:04:37.704349	2025-07-06 15:04:37.704349	\N
89	Verzuimverzekering	#06B6D4	\N	77	2	0	t	2025-07-06 15:04:37.778474	2025-07-06 15:04:37.778474	\N
90	Ziektewet ERD	#06B6D4	\N	77	2	0	t	2025-07-06 15:04:37.854025	2025-07-06 15:04:37.854025	\N
91	Transport-Goederen	#EF4444	\N	78	2	0	t	2025-07-06 15:04:37.929866	2025-07-06 15:04:37.929866	\N
92	Aansprakelijkheid Bedrijven	#EF4444	\N	78	2	0	t	2025-07-06 15:04:38.011792	2025-07-06 15:04:38.011792	\N
93	Bedrijfsschadeverzekering	#EF4444	\N	78	2	0	t	2025-07-06 15:04:38.090862	2025-07-06 15:04:38.090862	\N
94	Brandverzekering	#EF4444	\N	78	2	0	t	2025-07-06 15:04:38.165084	2025-07-06 15:04:38.165084	\N
95	Wagenparkverzekering	#EF4444	\N	78	2	0	t	2025-07-06 15:04:38.240361	2025-07-06 15:04:38.240361	\N
96	Construction All Risk	#EF4444	\N	78	2	0	t	2025-07-06 15:04:38.315012	2025-07-06 15:04:38.315012	\N
97	Machinebreukverzekering	#EF4444	\N	78	2	0	t	2025-07-06 15:04:38.389393	2025-07-06 15:04:38.389393	\N
98	Keymanverzekering	#F59E0B	\N	79	2	0	t	2025-07-06 15:04:38.463425	2025-07-06 15:04:38.463425	\N
99	Kredietverzekering	#F59E0B	\N	79	2	0	t	2025-07-06 15:04:38.538015	2025-07-06 15:04:38.538015	\N
100	Cyberverzekering	#F59E0B	\N	79	2	0	t	2025-07-06 15:04:38.612435	2025-07-06 15:04:38.612435	\N
101	Rechtsbijstandverzekering Zakelijk	#F59E0B	\N	79	2	0	t	2025-07-06 15:04:38.687383	2025-07-06 15:04:38.687383	\N
\.


--
-- Data for Name: contact_relationships; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.contact_relationships (id, contact_id, entity_type, entity_id, relationship_type, role, is_primary, notes, created_at, updated_at) FROM stdin;
1	5	project	1	project_stakeholder	Technical Lead	t	Primary technical contact for digital transformation	2025-07-22 06:56:45.737445+00	2025-07-22 06:56:45.737445+00
2	5	project	2	project_stakeholder	Security Consultant	f	Advising on cybersecurity implementation	2025-07-22 06:56:45.737445+00	2025-07-22 06:56:45.737445+00
3	6	project	3	project_stakeholder	Project Manager	t	Leading cloud migration efforts	2025-07-22 06:56:45.737445+00	2025-07-22 06:56:45.737445+00
4	7	project	4	project_stakeholder	Business Analyst	f	Process analysis and requirements gathering	2025-07-22 06:56:45.737445+00	2025-07-22 06:56:45.737445+00
5	8	project	5	project_stakeholder	Data Scientist	t	Analytics platform development lead	2025-07-22 06:56:45.737445+00	2025-07-22 06:56:45.737445+00
7	5	vendor	1	vendor_contact	Account Manager	t	Primary contact for vendor services	2025-07-22 06:57:10.24816+00	2025-07-22 06:57:10.24816+00
8	6	vendor	2	vendor_contact	Technical Specialist	f	Technical support and integration	2025-07-22 06:57:10.24816+00	2025-07-22 06:57:10.24816+00
9	7	vendor	3	vendor_contact	Sales Representative	f	Handles procurement and contracts	2025-07-22 06:57:10.24816+00	2025-07-22 06:57:10.24816+00
10	5	opportunity	121	opportunity_contact	Decision Maker	t	Primary decision maker for solar panel opportunity	2025-07-22 06:57:13.078533+00	2025-07-22 06:57:13.078533+00
11	6	opportunity	122	opportunity_contact	Technical Evaluator	f	Technical evaluation for IT infrastructure	2025-07-22 06:57:13.078533+00	2025-07-22 06:57:13.078533+00
12	7	opportunity	123	opportunity_contact	Budget Approver	t	Has budget approval authority	2025-07-22 06:57:13.078533+00	2025-07-22 06:57:13.078533+00
13	8	opportunity	124	opportunity_contact	End User	f	Will be using the new system	2025-07-22 06:57:13.078533+00	2025-07-22 06:57:13.078533+00
14	5	customer	18	customer_contact	Primary Contact	t	Main point of contact for Amazon CS account	2025-07-22 06:57:16.383726+00	2025-07-22 06:57:16.383726+00
15	6	customer	19	customer_contact	Technical Contact	f	Technical liaison for implementation	2025-07-22 06:57:16.383726+00	2025-07-22 06:57:16.383726+00
16	7	partner	1	partner_contact	Account Manager	t	Manages relationship with Willis B.V	2025-07-22 06:57:16.383726+00	2025-07-22 06:57:16.383726+00
17	8	partner	2	partner_contact	Business Development	f	Handles new business opportunities	2025-07-22 06:57:16.383726+00	2025-07-22 06:57:16.383726+00
18	5	contact	6	colleague	Team Lead	f	Reports to Sara in project management	2025-07-22 06:57:16.383726+00	2025-07-22 06:57:16.383726+00
19	12	customer	18	customer_contact	CEO	t	Chief Executive Officer at Amazon CS Netherlands	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
20	16	customer	18	customer_contact	CTO	f	Chief Technology Officer	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
21	25	customer	18	customer_contact	CFO	f	Chief Financial Officer	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
22	30	customer	18	customer_contact	VP of Operations	f	Vice President of Operations	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
23	35	customer	18	customer_contact	VP of Sales	f	Vice President of Sales	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
24	40	customer	18	customer_contact	IT Director	f	Director of Information Technology	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
25	45	customer	18	customer_contact	HR Director	f	Director of Human Resources	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
26	50	customer	18	customer_contact	Finance Director	f	Director of Finance	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
27	55	customer	18	customer_contact	Project Manager	f	Senior Project Manager	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
28	60	customer	18	customer_contact	Operations Manager	f	Operations Manager	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
29	65	customer	18	customer_contact	IT Manager	f	IT Infrastructure Manager	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
30	70	customer	18	customer_contact	Sales Manager	f	Regional Sales Manager	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
31	75	customer	18	customer_contact	Business Analyst	f	Senior Business Analyst	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
32	80	customer	18	customer_contact	Technical Lead	f	Lead Software Engineer	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
33	85	customer	18	customer_contact	Account Coordinator	f	Customer Account Coordinator	2025-07-26 12:22:55.818152+00	2025-07-26 12:22:55.818152+00
\.


--
-- Data for Name: contact_tags; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.contact_tags (id, contact_id, tag_id, tagged_by_id, tagged_at) FROM stdin;
49	176	35	1	2025-07-21 12:11:04.360503
50	176	41	1	2025-07-21 12:11:04.360503
51	177	32	1	2025-07-21 12:11:04.360503
52	177	40	1	2025-07-21 12:11:04.360503
53	178	34	1	2025-07-21 12:11:04.360503
54	178	38	1	2025-07-21 12:11:04.360503
55	179	33	1	2025-07-21 12:11:04.360503
56	179	37	1	2025-07-21 12:11:04.360503
57	5	32	\N	2025-07-21 12:28:56.164854
58	5	39	\N	2025-07-21 12:28:56.164854
59	6	35	\N	2025-07-21 12:28:56.164854
60	6	40	\N	2025-07-21 12:28:56.164854
61	7	35	\N	2025-07-21 12:28:56.164854
62	7	39	\N	2025-07-21 12:28:56.164854
63	8	35	\N	2025-07-21 12:28:56.164854
64	8	38	\N	2025-07-21 12:28:56.164854
65	9	35	\N	2025-07-21 12:28:56.164854
67	10	35	\N	2025-07-21 12:28:56.164854
68	10	40	\N	2025-07-21 12:28:56.164854
69	11	35	\N	2025-07-21 12:28:56.164854
70	11	40	\N	2025-07-21 12:28:56.164854
71	12	35	\N	2025-07-21 12:28:56.164854
72	12	41	\N	2025-07-21 12:28:56.164854
73	13	34	\N	2025-07-21 12:28:56.164854
74	13	38	\N	2025-07-21 12:28:56.164854
75	14	35	\N	2025-07-21 12:28:56.164854
77	15	35	\N	2025-07-21 12:29:02.773175
78	15	38	\N	2025-07-21 12:29:02.773175
79	16	32	\N	2025-07-21 12:29:02.773175
81	17	32	\N	2025-07-21 12:29:02.773175
83	18	35	\N	2025-07-21 12:29:02.773175
84	18	40	\N	2025-07-21 12:29:02.773175
85	19	35	\N	2025-07-21 12:29:02.773175
86	19	39	\N	2025-07-21 12:29:02.773175
87	20	35	\N	2025-07-21 12:29:02.773175
88	20	38	\N	2025-07-21 12:29:02.773175
89	21	35	\N	2025-07-21 12:29:02.773175
91	22	34	\N	2025-07-21 12:29:02.773175
92	22	40	\N	2025-07-21 12:29:02.773175
93	23	35	\N	2025-07-21 12:29:02.773175
94	23	40	\N	2025-07-21 12:29:02.773175
95	24	35	\N	2025-07-21 12:29:02.773175
96	24	41	\N	2025-07-21 12:29:02.773175
97	25	33	\N	2025-07-21 12:29:08.126047
98	25	37	\N	2025-07-21 12:29:08.126047
99	26	34	\N	2025-07-21 12:29:08.126047
100	26	38	\N	2025-07-21 12:29:08.126047
101	27	33	\N	2025-07-21 12:29:08.126047
102	27	40	\N	2025-07-21 12:29:08.126047
103	28	34	\N	2025-07-21 12:29:08.126047
104	28	41	\N	2025-07-21 12:29:08.126047
105	29	35	\N	2025-07-21 12:29:08.126047
106	29	37	\N	2025-07-21 12:29:08.126047
107	30	36	\N	2025-07-21 12:29:08.126047
109	12	54	1	2025-07-21 19:16:14.108572
110	13	55	1	2025-07-21 19:16:14.108572
111	14	56	1	2025-07-21 19:16:14.108572
112	15	54	1	2025-07-21 19:16:14.108572
113	16	56	1	2025-07-21 19:16:14.108572
114	17	55	1	2025-07-21 19:16:14.108572
115	18	56	1	2025-07-21 19:16:14.108572
116	19	54	1	2025-07-21 19:16:14.108572
117	20	55	1	2025-07-21 19:16:14.108572
118	21	56	1	2025-07-21 19:16:14.108572
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.contacts (id, first_name, last_name, full_name, email, phone, job_title, department, company, is_primary, notes, tags, is_active, created_at, updated_at, reports_to) FROM stdin;
13	Anna	Mulder	Anna Mulder	anna.mulder@company.nl	+31 25 012 3456	Business Development	\N	Elektim-Techniek B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
14	Peter	de Groot	Peter de Groot	peter.degroot@company.nl	+31 20 123 4567	Office Manager	\N	Rjw De Graaff	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
15	Linda	Bos	Linda Bos	linda.bos@company.nl	+31 30 234 5678	Account Manager	\N	AanZet Staal-Bouw-Techniek B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
17	Sophie	Peters	Sophie Peters	sophie.peters@company.nl	+31 50 456 7890	CFO	\N	Proximus	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
18	Mark	Hendriks	Mark Hendriks	mark.hendriks@company.nl	+31 70 567 8901	Operations Manager	\N	Jeanneke Bosch Vakantie	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
19	Julia	van den Berg	Julia van den Berg	julia.vandenberg@company.nl	+31 80 678 9012	HR Manager	\N	Timmerman Techniek Assen B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
20	Andreas	de Jong	Andreas de Jong	andreas.dejong@company.nl	+31 90 789 0123	Sales Manager	\N	VvE Hof van Delftlaan 74	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
21	Laura	Janssen	Laura Janssen	laura.janssen@company.nl	+31 10 890 1234	Financial Controller	\N	Van den Bergh Beheer BV	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
22	Chris	van der Meer	Chris van der Meer	chris.vandermeer@company.nl	+31 15 901 2345	Risk Manager	\N	KO-MA Holding B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
23	Nina	Bakker	Nina Bakker	nina.bakker@company.nl	+31 25 012 3456	Purchase Manager	\N	Elbouw G/E Kombinatie BV	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
24	John	Visser	John Visser	john.visser@company.nl	+31 20 123 4567	Project Manager	\N	Zetes Industries	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
26	Michael	Meijer	Michael Meijer	michael.meijer@company.nl	+31 40 345 6789	Office Manager	\N	P.J.G. Peeters	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
27	Lisa	de Boer	Lisa de Boer	lisa.deboer@company.nl	+31 50 456 7890	Account Manager	\N	Installatie-en Servicebedrijf	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
28	David	Mulder	David Mulder	david.mulder@company.nl	+31 70 567 8901	CEO	\N	BRN Parket B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
29	Emma	de Groot	Emma de Groot	emma.degroot@company.nl	+31 80 678 9012	CFO	\N	Alutech Arnhem	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
31	Maria	Vos	Maria Vos	maria.vos@company.nl	+31 10 890 1234	HR Manager	\N	R. Schouten Beheer B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
32	James	Peters	James Peters	james.peters@company.nl	+31 15 901 2345	Sales Manager	\N	Claviesta Piano &	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
33	Anna	Hendriks	Anna Hendriks	anna.hendriks@company.nl	+31 25 012 3456	Financial Controller	\N	Christengemeente Den Haag	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
34	Peter	van den Berg	Peter van den Berg	peter.vandenberg@company.nl	+31 20 123 4567	Risk Manager	\N	Rudi Verschueren	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
36	Thomas	Janssen	Thomas Janssen	thomas.janssen@company.nl	+31 40 345 6789	Project Manager	\N	Gartech	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
37	Sophie	van der Meer	Sophie van der Meer	sophie.vandermeer@company.nl	+31 50 456 7890	Business Development	\N	Bercx Klimaattechniek	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
38	Mark	Bakker	Mark Bakker	mark.bakker@company.nl	+31 70 567 8901	Office Manager	\N	Dickhoff Installaties	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
39	Julia	Visser	Julia Visser	julia.visser@company.nl	+31 80 678 9012	Account Manager	\N	J.W. Scheffer	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
41	Laura	Meijer	Laura Meijer	laura.meijer@company.nl	+31 10 890 1234	CFO	\N	Accenture	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
42	Chris	de Boer	Chris de Boer	chris.deboer@company.nl	+31 15 901 2345	Operations Manager	\N	R.J. Hogervorst	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
43	Nina	Mulder	Nina Mulder	nina.mulder@company.nl	+31 25 012 3456	HR Manager	\N	Van der Krans Import VOF	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
44	John	de Groot	John de Groot	john.degroot@company.nl	+31 20 123 4567	Sales Manager	\N	Retsok Norg BV	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
6	Michael	Janssen	Michael Janssen	michael.janssen@company.nl	+31 40 345 6789	Operations Manager	\N	Gelderland Hekwerken B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	5
7	Lisa	van der Meer	Lisa van der Meer	lisa.vandermeer@company.nl	+31 50 456 7890	HR Manager	\N	Stephan Vandaele	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	5
8	David	Bakker	David Bakker	david.bakker@company.nl	+31 70 567 8901	Sales Manager	\N	Hofmeijer Las- en	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	5
9	Emma	Visser	Emma Visser	emma.visser@company.nl	+31 80 678 9012	Financial Controller	\N	PIMM Solutions B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	16
5	Sara	Dejong	Sara Dejong	sarah.dejong@company.nl	+31 30 234 5678	People Manager	\N	O.F.M. Brekelmans	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-21 18:54:13.428452	93
12	James	de Boer	James de Boer	james.deboer@company.nl	+31 15 901 2345	Chief Executive Officer	Executive	GMB (Geraedts Metaal	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
16	Thomas	Vos	Thomas Vos	thomas.vos@company.nl	+31 40 345 6789	Chief Technology Officer	Technology	DKM Tec	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	12
30	Robert	Bos	Robert Bos	robert.bos@company.nl	+31 90 789 0123	VP of Operations	Operations	Arto Vastgoed BV	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	12
35	Linda	de Jong	Linda de Jong	linda.dejong@company.nl	+31 30 234 5678	VP of Sales	Sales	G. Leijten	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	12
40	Andreas	Smit	Andreas Smit	andreas.smit@company.nl	+31 90 789 0123	IT Director	Technology	Intermodalics	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	16
25	Sarah	Smit	Sarah Smit	sarah.smit@company.nl	+31 30 234 5678	Chief Financial Officer	Finance	Deloitte	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	12
46	Michael	Vos	Michael Vos	michael.vos@company.nl	+31 40 345 6789	Risk Manager	\N	R de Boer/de Boer Montage	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
47	Lisa	Peters	Lisa Peters	lisa.peters@company.nl	+31 50 456 7890	Purchase Manager	\N	J.G. Meerburg Beheer B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
48	David	Hendriks	David Hendriks	david.hendriks@company.nl	+31 70 567 8901	Project Manager	\N	Heerenleed Damesmode VOF	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
49	Emma	van den Berg	Emma van den Berg	emma.vandenberg@company.nl	+31 80 678 9012	Business Development	\N	Sirris	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
51	Maria	Janssen	Maria Janssen	maria.janssen@company.nl	+31 10 890 1234	Account Manager	\N	Pieter Declercq	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
52	James	van der Meer	James van der Meer	james.vandermeer@company.nl	+31 15 901 2345	CEO	\N	Timmerfabriek Precisie 90	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
53	Anna	Bakker	Anna Bakker	anna.bakker@company.nl	+31 25 012 3456	CFO	\N	VvE Marktweg 360 t/m 396	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
54	Peter	Visser	Peter Visser	peter.visser@company.nl	+31 20 123 4567	Operations Manager	\N	SLAGHUIS Veelzijdig in	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
56	Thomas	Meijer	Thomas Meijer	thomas.meijer@company.nl	+31 40 345 6789	Sales Manager	\N	Wim Claes	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
57	Sophie	de Boer	Sophie de Boer	sophie.deboer@company.nl	+31 50 456 7890	Financial Controller	\N	Lasklus Nederland B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
58	Mark	Mulder	Mark Mulder	mark.mulder@company.nl	+31 70 567 8901	Risk Manager	\N	Tolhuis 'n Tol	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
59	Julia	de Groot	Julia de Groot	julia.degroot@company.nl	+31 80 678 9012	Purchase Manager	\N	AanZet Holding B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
61	Laura	Vos	Laura Vos	laura.vos@company.nl	+31 10 890 1234	Business Development	\N	R. Schouten Beheer BV	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
62	Chris	Peters	Chris Peters	chris.peters@company.nl	+31 15 901 2345	Office Manager	\N	Konstruktiebedrijf W. Verweij	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
63	Nina	Hendriks	Nina Hendriks	nina.hendriks@company.nl	+31 25 012 3456	Account Manager	\N	RBSS Vastgoed B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
64	John	van den Berg	John van den Berg	john.vandenberg@company.nl	+31 20 123 4567	CEO	\N	M Trompetter	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
66	Michael	Janssen	Michael Janssen	michael.janssen@company.nl	+31 40 345 6789	Operations Manager	\N	Qollabi	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
67	Lisa	van der Meer	Lisa van der Meer	lisa.vandermeer@company.nl	+31 50 456 7890	HR Manager	\N	Barco	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
68	David	Bakker	David Bakker	david.bakker@company.nl	+31 70 567 8901	Sales Manager	\N	De Werelth	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
69	Emma	Visser	Emma Visser	emma.visser@company.nl	+31 80 678 9012	Financial Controller	\N	Avifit Beauty Equipment BV	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
71	Maria	Meijer	Maria Meijer	maria.meijer@company.nl	+31 10 890 1234	Purchase Manager	\N	Vishandel sperling	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
72	James	de Boer	James de Boer	james.deboer@company.nl	+31 15 901 2345	Project Manager	\N	Koen Maes	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
73	Anna	Mulder	Anna Mulder	anna.mulder@company.nl	+31 25 012 3456	Business Development	\N	Mulders Metaal op Maat	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
74	Peter	de Groot	Peter de Groot	peter.degroot@company.nl	+31 20 123 4567	Office Manager	\N	Anju Life Sciences Software	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
76	Thomas	Vos	Thomas Vos	thomas.vos@company.nl	+31 40 345 6789	CEO	\N	Cronofy B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
77	Sophie	Peters	Sophie Peters	sophie.peters@company.nl	+31 50 456 7890	CFO	\N	TVG Las- en Montagetechniek	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
78	Mark	Hendriks	Mark Hendriks	mark.hendriks@company.nl	+31 70 567 8901	Operations Manager	\N	Wildenborg Haardendesign B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
79	Julia	van den Berg	Julia van den Berg	julia.vandenberg@company.nl	+31 80 678 9012	HR Manager	\N	Elke Janssens	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
81	Laura	Janssen	Laura Janssen	laura.janssen@company.nl	+31 10 890 1234	Financial Controller	\N	Hauwlo Zonweringen	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
82	Chris	van der Meer	Chris van der Meer	chris.vandermeer@company.nl	+31 15 901 2345	Risk Manager	\N	Ruud van Laer las en montagewerk	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
83	Nina	Bakker	Nina Bakker	nina.bakker@company.nl	+31 25 012 3456	Purchase Manager	\N	TOPHOLD International B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
84	John	Visser	John Visser	john.visser@company.nl	+31 20 123 4567	Project Manager	\N	Gert Pauwels	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
86	Michael	Meijer	Michael Meijer	michael.meijer@company.nl	+31 40 345 6789	Office Manager	\N	Coca Cola	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
87	Lisa	de Boer	Lisa de Boer	lisa.deboer@company.nl	+31 50 456 7890	Account Manager	\N	Joosten Metaal	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
88	David	Mulder	David Mulder	david.mulder@company.nl	+31 70 567 8901	CEO	\N	Cristel vd sanden Interieur	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
89	Emma	de Groot	Emma de Groot	emma.degroot@company.nl	+31 80 678 9012	CFO	\N	Winters Metaaltechniek	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
90	Robert	Bos	Robert Bos	robert.bos@company.nl	+31 90 789 0123	Operations Manager	\N	M. van Es	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
91	Maria	Vos	Maria Vos	maria.vos@company.nl	+31 10 890 1234	HR Manager	\N	Bakker Protech	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
92	James	Peters	James Peters	james.peters@company.nl	+31 15 901 2345	Sales Manager	\N	Van den Broek Hoveniersbedrijf	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
93	Anna	Hendriks	Anna Hendriks	anna.hendriks@company.nl	+31 25 012 3456	Financial Controller	\N	Jens Van Damme	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
94	Peter	van den Berg	Peter van den Berg	peter.vandenberg@company.nl	+31 20 123 4567	Risk Manager	\N	Resu Beheer B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
95	Linda	de Jong	Linda de Jong	linda.dejong@company.nl	+31 30 234 5678	Purchase Manager	\N	Lien Van den Broeck	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
96	Thomas	Janssen	Thomas Janssen	thomas.janssen@company.nl	+31 40 345 6789	Project Manager	\N	LTW Leenders en HGJ Gielen	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
97	Sophie	van der Meer	Sophie van der Meer	sophie.vandermeer@company.nl	+31 50 456 7890	Business Development	\N	Agfa-Gevaert	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
98	Mark	Bakker	Mark Bakker	mark.bakker@company.nl	+31 70 567 8901	Office Manager	\N	Cire BV	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
99	Julia	Visser	Julia Visser	julia.visser@company.nl	+31 80 678 9012	Account Manager	\N	Kurt Van der Linden	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
100	Andreas	Smit	Andreas Smit	andreas.smit@company.nl	+31 90 789 0123	CEO	\N	GB Hoogwerkers B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
101	Laura	Meijer	Laura Meijer	laura.meijer@company.nl	+31 10 890 1234	CFO	\N	Schieland Borsboom Makelaars	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
102	Chris	de Boer	Chris de Boer	chris.deboer@company.nl	+31 15 901 2345	Operations Manager	\N	Isabelle Wauters	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
103	Nina	Mulder	Nina Mulder	nina.mulder@company.nl	+31 25 012 3456	HR Manager	\N	Hinneman Engineering B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	\N
104	Alex	van Dijk	Alex van Dijk	alex.vandijk@partner.nl	+31 20 555 0101	Insurance Broker	\N	Quick Insurance Solutions	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
105	Barbara	Jansen	Barbara Jansen	barbara.jansen@partner.nl	+31 30 555 0202	Senior Account Manager	\N	Premium Risk Management	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
106	Carlos	van Leeuwen	Carlos van Leeuwen	carlos.vanleeuwen@partner.nl	+31 40 555 0303	Risk Advisor	\N	Mevas BV	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
107	Diana	van der Laan	Diana van der Laan	diana.vanderlaan@partner.nl	+31 50 555 0404	Claims Specialist	\N	Independent Insurance Advisors	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
108	Erik	Dekker	Erik Dekker	erik.dekker@partner.nl	+31 70 555 0505	Business Development Manager	\N	Willis B.V	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
109	Fiona	Brouwer	Fiona Brouwer	fiona.brouwer@partner.nl	+31 80 555 0606	Client Relationship Manager	\N	Regional Insurance Partners	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
110	George	Jacobs	George Jacobs	george.jacobs@partner.nl	+31 90 555 0707	Insurance Consultant	\N	Aon (v.h.Meeus)	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
111	Hannah	de Wit	Hannah de Wit	hannah.dewit@partner.nl	+31 10 555 0808	Partner Manager	\N	HDB Risicobeheer BV	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
112	Ivan	Haan	Ivan Haan	ivan.haan@partner.nl	+31 20 555 0101	Regional Director	\N	Klap B.V.	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
113	Jessica	van Dongen	Jessica van Dongen	jessica.vandongen@partner.nl	+31 30 555 0202	Sales Director	\N	Leenders & Gielen Assurantien	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
114	Kevin	Vermeulen	Kevin Vermeulen	kevin.vermeulen@partner.nl	+31 40 555 0303	Insurance Broker	\N	Meijers Assurantien	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
115	Laura	Schouten	Laura Schouten	laura.schouten@partner.nl	+31 50 555 0404	Senior Account Manager	\N	Schouten Zekerheid Mak in Ass BV	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
116	Marco	van Dijk	Marco van Dijk	marco.vandijk@partner.nl	+31 70 555 0505	Risk Advisor	\N	Van den Berk Assurantien B.V.	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
117	Nicole	Jansen	Nicole Jansen	nicole.jansen@partner.nl	+31 80 555 0606	Claims Specialist	\N	Wonen & Welzijn Assurantien BV	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
118	Oscar	van Leeuwen	Oscar van Leeuwen	oscar.vanleeuwen@partner.nl	+31 90 555 0707	Business Development Manager	\N	Zicht B.V.	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
119	Alex	van der Laan	Alex van der Laan	alex.vanderlaan@partner.nl	+31 10 555 0808	Client Relationship Manager	\N	Aon Consulting Corp. Wellness	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
120	Barbara	Dekker	Barbara Dekker	barbara.dekker@partner.nl	+31 20 555 0101	Insurance Consultant	\N	Aon Risico Management	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
121	Carlos	Brouwer	Carlos Brouwer	carlos.brouwer@partner.nl	+31 30 555 0202	Partner Manager	\N	Techniek Nederland Verz.	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
122	Diana	Jacobs	Diana Jacobs	diana.jacobs@partner.nl	+31 40 555 0303	Regional Director	\N	Eijgendaal & van Romondt B.V.	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
123	Erik	de Wit	Erik de Wit	erik.dewit@partner.nl	+31 50 555 0404	Sales Director	\N	Induver	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
124	Fiona	Haan	Fiona Haan	fiona.haan@partner.nl	+31 70 555 0505	Insurance Broker	\N	Van Breda	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
125	George	van Dongen	George van Dongen	george.vandongen@partner.nl	+31 80 555 0606	Senior Account Manager	\N	Hermans Financial Agents	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
126	Hannah	Vermeulen	Hannah Vermeulen	hannah.vermeulen@partner.nl	+31 90 555 0707	Risk Advisor	\N	Helix Verzekeringen	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
127	Ivan	Schouten	Ivan Schouten	ivan.schouten@partner.nl	+31 10 555 0808	Claims Specialist	\N	BARBUSS	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
128	Jessica	van Dijk	Jessica van Dijk	jessica.vandijk@partner.nl	+31 20 555 0101	Business Development Manager	\N	Concordia NV	t	\N	\N	t	2025-07-09 10:17:09.166237	2025-07-09 10:17:09.166237	\N
129	David	Hansen	David Hansen	david.hansen@ohpen.com	\N	CEO	\N	\N	t	\N	\N	t	2025-07-12 12:36:54.72453	2025-07-12 12:36:54.72453	\N
130	Sarah	van der Berg	Sarah van der Berg	sarah.vandeberg@blauwtust.nl	\N	CFO	\N	\N	t	\N	\N	t	2025-07-12 12:36:54.72453	2025-07-12 12:36:54.72453	\N
131	Michael	Johnson	Michael Johnson	michael.johnson@bcg.com	\N	Partner	\N	\N	t	\N	\N	t	2025-07-12 12:36:54.72453	2025-07-12 12:36:54.72453	\N
132	Lisa	Williams	Lisa Williams	lisa.williams@accenture.com	\N	Managing Director	\N	\N	t	\N	\N	t	2025-07-12 12:36:54.72453	2025-07-12 12:36:54.72453	\N
133	Robert	Anderson	Robert Anderson	robert.anderson@pwc.com	\N	Senior Partner	\N	\N	t	\N	\N	t	2025-07-12 12:36:54.72453	2025-07-12 12:36:54.72453	\N
134	Emma	Bakker	Emma Bakker	emma.bakker@spinpompen.nl	\N	Operations Manager	\N	\N	t	\N	\N	t	2025-07-12 12:36:54.72453	2025-07-12 12:36:54.72453	\N
135	Nathalie	Goossens	Nathalie Goossens	nathalie@goossens.be	\N	Director	\N	\N	t	\N	\N	t	2025-07-12 12:36:54.72453	2025-07-12 12:36:54.72453	\N
136	Marc	Verheyen	Marc Verheyen	marc.verheyen@agoria.be	\N	Business Development	\N	\N	t	\N	\N	t	2025-07-12 12:36:54.72453	2025-07-12 12:36:54.72453	\N
137	Jennifer	Peters	Jennifer Peters	jennifer.peters@milliman.com	\N	Principal	\N	\N	t	\N	\N	t	2025-07-12 12:36:54.72453	2025-07-12 12:36:54.72453	\N
138	Els	Vandenberghe	Els Vandenberghe	els.vandenberghe@consultant.be	\N	Independent Consultant	\N	\N	t	\N	\N	t	2025-07-12 12:36:54.72453	2025-07-12 12:36:54.72453	\N
139	Tom	Verschuren	Tom Verschuren	tom.verschuren@spinpompen.nl	\N	Technical Manager	\N	\N	f	\N	\N	t	2025-07-12 12:38:14.429818	2025-07-12 12:38:14.429818	\N
140	Anna	Smeets	Anna Smeets	anna.smeets@agoria.be	\N	Project Manager	\N	\N	f	\N	\N	t	2025-07-12 12:38:14.429818	2025-07-12 12:38:14.429818	\N
141	Peter	Janssen	Peter Janssen	peter.janssen@bcg.com	\N	Senior Consultant	\N	\N	f	\N	\N	t	2025-07-12 12:38:14.429818	2025-07-12 12:38:14.429818	\N
142	Maria	van Houten	Maria van Houten	maria.vanhouten@pwc.com	\N	Tax Manager	\N	\N	f	\N	\N	t	2025-07-12 12:38:14.429818	2025-07-12 12:38:14.429818	\N
143	Frank	Cornelis	Frank Cornelis	frank.cornelis@ohpen.com	\N	CTO	\N	\N	f	\N	\N	t	2025-07-12 12:38:14.429818	2025-07-12 12:38:14.429818	\N
145	Carlos	Rodriguez	Carlos Rodriguez	carlos.rodriguez@tex-mex.nl	\N	\N	\N	\N	t	\N	\N	t	2025-07-12 13:00:22.508336	2025-07-12 13:00:22.508336	\N
146	Sophie	Peeters	Sophie Peeters	sophie.peeters@sofie-peeters.nl	\N	\N	\N	\N	t	\N	\N	t	2025-07-12 13:00:22.508336	2025-07-12 13:00:22.508336	\N
147	Tom	Vermeulen	Tom Vermeulen	tom.vermeulen@tom-vermeulen.nl	\N	\N	\N	\N	t	\N	\N	t	2025-07-12 13:00:22.508336	2025-07-12 13:00:22.508336	\N
148	Sarah	de Vries	Sarah de Vries	sarah.devries@landman-siermetaal.nl	\N	\N	\N	\N	t	\N	\N	t	2025-07-12 13:00:22.508336	2025-07-12 13:00:22.508336	\N
149	Mark	Gelder	Mark Gelder	mark.gelder@gelder-holding.nl	\N	\N	\N	\N	t	\N	\N	t	2025-07-12 13:00:22.508336	2025-07-12 13:00:22.508336	\N
150	Anna	Janssen	Anna Janssen	anna.janssen@rgo-makelaars.nl	\N	\N	\N	\N	f	\N	\N	t	2025-07-12 13:00:22.508336	2025-07-12 13:00:22.508336	\N
151	Peter	van Dam	Peter van Dam	peter.vandam@tex-mex.nl	\N	\N	\N	\N	f	\N	\N	t	2025-07-12 13:00:22.508336	2025-07-12 13:00:22.508336	\N
152	Lisa	Bakker	Lisa Bakker	lisa.bakker@vishandel-sperling.nl	\N	\N	\N	\N	f	\N	\N	t	2025-07-12 13:00:22.508336	2025-07-12 13:00:22.508336	\N
153	Sofie	Peeters	Sofie Peeters	sofie.peeters@iptverzekeringen.nl	\N	\N	\N	\N	t	\N	\N	t	2025-07-12 13:06:00.714042	2025-07-12 13:06:00.714042	\N
154	Elke	Janssens	Elke Janssens	elke.janssens@iptverzekeringen.nl	\N	\N	\N	\N	t	\N	\N	t	2025-07-12 13:06:00.714042	2025-07-12 13:06:00.714042	\N
155	Wim	Claes	Wim Claes	wim.claes@iptverzekeringen.nl	\N	\N	\N	\N	t	\N	\N	t	2025-07-12 13:06:00.714042	2025-07-12 13:06:00.714042	\N
157	test	frie	test frie	fjkjl@kjk.com	\N	\N	\N	Bruins Betonstaalvlechtbedrijf	f	\N	{}	t	2025-07-14 12:58:35.781046	2025-07-14 12:58:35.781046	\N
158	Sarah	Kim	Sarah Kim	sarah.kim@fintechsolutions.com	\N	Chief Technology Officer	\N	Bruins Betonstaalvlechtbedrijf	f	\N	{}	t	2025-07-14 12:58:41.147547	2025-07-14 12:58:41.147547	\N
159	Debug	Test	Debug Test	debug@test.com	\N	Testing	\N	Bruins Betonstaalvlechtbedrijf	f	\N	{}	t	2025-07-14 13:00:50.17738	2025-07-14 13:00:50.17738	\N
160	Sarah	Kim	Sarah Kim	sarah.kim@fintechsolutions.com	\N	Chief Technology Officer	\N	Van Seters Metaaltechniek	f	\N	{}	t	2025-07-14 13:02:31.021516	2025-07-14 13:02:31.021516	\N
161	Sarah	Johnson	Sarah Johnson	sarah.johnson@techcorp.com	+31 20 555 1234	Chief Technology Officer	\N	TechCorp Solutions	t	\N	\N	t	2025-07-15 09:49:05.352149	2025-07-15 09:49:05.352149	\N
162	Mike	Chen	Mike Chen	mike.chen@techcorp.com	+31 20 555 1235	IT Security Manager	\N	TechCorp Solutions	f	\N	\N	t	2025-07-15 09:49:05.352149	2025-07-15 09:49:05.352149	\N
163	Hans	van der Berg	Hans van der Berg	hans.vandenberg@industrial-mfg.nl	+31 10 444 5678	Operations Director	\N	Industrial Manufacturing BV	t	\N	\N	t	2025-07-15 09:49:05.352149	2025-07-15 09:49:05.352149	\N
164	Emma	Bakker	Emma Bakker	emma.bakker@industrial-mfg.nl	+31 10 444 5679	Safety Manager	\N	Industrial Manufacturing BV	f	\N	\N	t	2025-07-15 09:49:05.352149	2025-07-15 09:49:05.352149	\N
165	Peter	Janssen	Peter Janssen	peter.janssen@greenenergy.nl	+31 30 666 7890	Project Manager	\N	Green Energy Systems	t	\N	\N	t	2025-07-15 09:49:05.352149	2025-07-15 09:49:05.352149	\N
166	Lisa	de Vries	Lisa de Vries	lisa.devries@greenenergy.nl	+31 30 666 7891	Technical Director	\N	Green Energy Systems	f	\N	\N	t	2025-07-15 09:49:05.352149	2025-07-15 09:49:05.352149	\N
167	Michael	Chen	Michael Chen	michael.chen@techflow.com	+31 20 123 4567	CTO	\N	TechFlow Solutions	t	\N	\N	t	2025-07-15 12:57:30.6867	2025-07-15 12:57:30.6867	\N
168	Sarah	van Berg	Sarah van Berg	sarah.vanberg@greenbuild.nl	+31 30 234 5678	Project Manager	\N	GreenBuild Construction	t	\N	\N	t	2025-07-15 12:57:30.6867	2025-07-15 12:57:30.6867	\N
169	David	Kumar	David Kumar	david.kumar@datavault.com	+31 40 345 6789	Data Architect	\N	DataVault Systems	t	\N	\N	t	2025-07-15 12:57:30.6867	2025-07-15 12:57:30.6867	\N
170	Emma	Jansen	Emma Jansen	emma.jansen@ecologistics.nl	+31 50 456 7890	Operations Director	\N	EcoLogistics BV	t	\N	\N	t	2025-07-15 12:57:30.6867	2025-07-15 12:57:30.6867	\N
171	Lars	Hendriksen	Lars Hendriksen	lars.hendriksen@smarthome.nl	+31 70 567 8901	Sales Manager	\N	SmartHome Innovations	t	\N	\N	t	2025-07-15 12:57:30.6867	2025-07-15 12:57:30.6867	\N
172	Anna	Petersen	Anna Petersen	anna.petersen@cloudfirst.com	+31 80 678 9012	DevOps Lead	\N	CloudFirst Technologies	t	\N	\N	t	2025-07-15 12:57:30.6867	2025-07-15 12:57:30.6867	\N
173	Robert	Schmidt	Robert Schmidt	\N	+31 90 789 0123	Research Director	\N	BioTech Research Lab	t	\N	\N	t	2025-07-15 12:57:30.6867	2025-07-15 12:57:30.6867	\N
174	Lisa	de Vries	Lisa de Vries	lisa.devries@urbanplanning.nl	+31 60 890 1234	Urban Planner	\N	Urban Planning Group	t	\N	\N	t	2025-07-15 12:57:30.6867	2025-07-15 12:57:30.6867	\N
175	Stephon	Borgers	Stephon Borgers	stephon@borgers.nl	+31 20 123 4567	CEO	General	Stephon Borgers	t	Independent consultant and business owner	\N	t	2025-07-21 12:00:42.409268	2025-07-21 12:00:42.409268	\N
176	Mike	Johnson	Mike Johnson	mike.johnson@techcorp.com	+31 20 123 4567	Senior Software Engineer	Engineering	TechCorp Inc.	t	Technical lead	\N	t	2025-07-21 12:05:02.043913	2025-07-21 12:05:02.043913	\N
178	David	Brown	David Brown	david.brown@salescorp.com	+31 20 123 4569	Sales Manager	Sales	SalesCorp Ltd.	t	Sales manager and influencer	\N	t	2025-07-21 12:05:02.043913	2025-07-21 12:05:02.043913	\N
179	Lisa	Wang	Lisa Wang	lisa.wang@salescorp.com	+31 20 123 4570	VP of Sales	Sales	SalesCorp Ltd.	t	VP and decision maker	\N	t	2025-07-21 12:05:02.043913	2025-07-21 12:05:02.043913	\N
10	Robert	Smit	Robert Smit	robert.smit@company.nl	+31 90 789 0123	Risk Manager	\N	Y.M. Scheffer-Maarschalk	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	16
11	Maria	Meijer	Maria Meijer	maria.meijer@company.nl	+31 10 890 1234	Purchase Manager	\N	W. Verweij Beheer BV	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	17
180	TestUser	Senior	TestUser Senior	test.senior.updated@techcorp.com	+1-555-0199	Senior Software Engineer	Engineering	TechCorp Inc	f	Updated test contact with new supervisor	\N	t	2025-07-21 18:02:38.328229	2025-07-21 18:02:44.344593	119
177	sarah	Chen	sarah Chen	sarah.chen@techcorp.com	+31 20 123 4568	\N	Technology	TechCorp Inc.	t	CTO and decision maker	\N	t	2025-07-21 12:05:02.043913	2025-07-21 18:43:45.695141	\N
45	Sarah	Bos	Sarah Bos	sarah.bos@company.nl	+31 30 234 5678	HR Director	Human Resources	Vermeulen Ingenieursbureau B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	30
50	Robert	de Jong	Robert de Jong	robert.dejong@company.nl	+31 90 789 0123	Finance Director	Finance	VvE Gezelstraat 3, 3A t/m 3D	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	25
65	Sarah	de Jong	Sarah de Jong	sarah.dejong@company.nl	+31 30 234 5678	IT Manager	Technology	RS-Lastechniek	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	40
60	Andreas	Bos	Andreas Bos	andreas.bos@company.nl	+31 90 789 0123	Operations Manager	Operations	Stephan Borgers	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	45
70	Robert	Smit	Robert Smit	robert.smit@company.nl	+31 90 789 0123	Sales Manager	Sales	PenDik Beheer BV	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	35
55	Linda	Smit	Linda Smit	linda.smit@company.nl	+31 30 234 5678	Project Manager	Operations	Lynn Vandenbosch	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	50
80	Andreas	de Jong	Andreas de Jong	andreas.dejong@company.nl	+31 90 789 0123	Technical Lead	Technology	Amuko Service	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	65
75	Linda	Bos	Linda Bos	linda.bos@company.nl	+31 30 234 5678	Business Analyst	Operations	Het Gouden Woud B.V.	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	60
85	Sarah	Smit	Sarah Smit	sarah.smit@company.nl	+31 30 234 5678	Account Coordinator	Sales	T.S.O. VOF	t	\N	\N	t	2025-07-09 10:16:29.058802	2025-07-09 10:16:29.058802	70
\.


--
-- Data for Name: customer_opportunities; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.customer_opportunities (id, customer_id, opportunity_id, created_at) FROM stdin;
119	1	121	2025-06-16 22:14:52.906077
120	2	122	2025-06-16 22:14:52.906077
121	3	123	2025-06-16 22:14:52.906077
122	3	124	2025-06-16 22:14:52.906077
123	4	125	2025-06-16 22:14:52.906077
124	5	126	2025-06-16 22:14:52.906077
125	7	127	2025-06-16 22:14:52.906077
126	8	128	2025-06-16 22:14:52.906077
127	9	129	2025-06-16 22:14:52.906077
128	18	130	2025-06-16 22:14:52.906077
129	18	131	2025-06-16 22:14:52.906077
130	19	132	2025-06-16 22:14:52.906077
131	20	133	2025-06-16 22:14:52.906077
132	21	134	2025-06-16 22:14:52.906077
133	21	135	2025-06-16 22:14:52.906077
134	22	136	2025-06-16 22:14:52.906077
135	23	137	2025-06-16 22:14:52.906077
136	41	138	2025-06-16 22:14:52.906077
137	42	139	2025-06-16 22:14:52.906077
138	42	140	2025-06-16 22:14:52.906077
139	43	141	2025-06-16 22:14:52.906077
140	44	142	2025-06-16 22:14:52.906077
141	44	143	2025-06-16 22:14:52.906077
142	45	144	2025-06-16 22:14:52.906077
143	46	145	2025-06-16 22:14:52.906077
144	46	146	2025-06-16 22:14:52.906077
145	47	147	2025-06-16 22:14:52.906077
146	48	148	2025-06-16 22:14:52.906077
147	49	149	2025-06-16 22:14:52.906077
148	50	150	2025-06-16 22:14:52.906077
149	51	151	2025-06-16 22:15:17.413729
150	52	152	2025-06-16 22:15:17.413729
151	24	153	2025-06-16 22:15:17.413729
152	25	154	2025-06-16 22:15:17.413729
153	26	155	2025-06-16 22:15:17.413729
154	27	156	2025-06-16 22:15:17.413729
155	28	157	2025-06-16 22:15:17.413729
156	28	158	2025-06-16 22:15:17.413729
157	29	159	2025-06-16 22:15:17.413729
158	53	160	2025-06-16 22:15:17.413729
159	53	161	2025-06-16 22:15:17.413729
160	54	162	2025-06-16 22:15:17.413729
161	55	163	2025-06-16 22:15:17.413729
162	56	164	2025-06-16 22:15:17.413729
163	57	165	2025-06-16 22:15:17.413729
164	58	166	2025-06-16 22:15:17.413729
165	59	167	2025-06-16 22:15:17.413729
166	60	168	2025-06-16 22:15:17.413729
167	61	169	2025-06-16 22:15:17.413729
168	61	170	2025-06-16 22:15:17.413729
169	62	171	2025-06-16 22:15:17.413729
170	63	172	2025-06-16 22:15:17.413729
171	63	173	2025-06-16 22:15:17.413729
172	64	174	2025-06-16 22:15:17.413729
173	65	175	2025-06-16 22:15:17.413729
174	66	176	2025-06-16 22:15:17.413729
175	67	177	2025-06-16 22:15:17.413729
176	68	178	2025-06-16 22:15:17.413729
177	69	179	2025-06-16 22:15:17.413729
178	70	180	2025-06-16 22:15:17.413729
179	71	181	2025-06-16 22:16:05.373245
180	72	182	2025-06-16 22:16:05.373245
181	73	183	2025-06-16 22:16:05.373245
182	74	184	2025-06-16 22:16:05.373245
183	74	185	2025-06-16 22:16:05.373245
184	75	186	2025-06-16 22:16:05.373245
185	76	187	2025-06-16 22:16:05.373245
186	77	188	2025-06-16 22:16:05.373245
187	78	189	2025-06-16 22:16:05.373245
188	79	190	2025-06-16 22:16:05.373245
189	79	191	2025-06-16 22:16:05.373245
190	80	192	2025-06-16 22:16:05.373245
191	81	193	2025-06-16 22:16:05.373245
192	82	194	2025-06-16 22:16:05.373245
193	82	195	2025-06-16 22:16:05.373245
194	83	196	2025-06-16 22:16:05.373245
195	84	197	2025-06-16 22:16:05.373245
196	85	198	2025-06-16 22:16:05.373245
197	86	199	2025-06-16 22:16:05.373245
198	87	200	2025-06-16 22:16:05.373245
199	88	201	2025-06-16 22:16:05.373245
200	89	202	2025-06-16 22:16:05.373245
201	90	203	2025-06-16 22:16:05.373245
202	90	204	2025-06-16 22:16:05.373245
203	91	205	2025-06-16 22:16:05.373245
204	92	206	2025-06-16 22:16:05.373245
205	93	207	2025-06-16 22:16:05.373245
206	94	208	2025-06-16 22:16:05.373245
207	95	209	2025-06-16 22:16:05.373245
208	96	210	2025-06-16 22:16:05.373245
209	97	211	2025-06-16 22:16:18.729798
210	98	212	2025-06-16 22:16:18.729798
211	99	213	2025-06-16 22:16:18.729798
212	99	214	2025-06-16 22:16:18.729798
213	100	215	2025-06-16 22:16:18.729798
214	101	216	2025-06-16 22:16:18.729798
215	102	217	2025-06-16 22:16:18.729798
216	103	218	2025-06-16 22:16:18.729798
217	104	219	2025-06-16 22:16:18.729798
218	105	220	2025-06-16 22:16:18.729798
219	106	221	2025-06-16 22:16:18.729798
220	107	222	2025-06-16 22:16:18.729798
221	108	223	2025-06-16 22:16:18.729798
222	272	130	2025-06-16 22:14:52.906077
223	272	131	2025-06-16 22:14:52.906077
\.


--
-- Data for Name: customer_product_assignments; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.customer_product_assignments (id, customer_id, product_template_id, custom_price, custom_discount, custom_discount_percentage, custom_premium_percentage, customer_contract_start_date, customer_contract_end_date, assigned_by, assigned_at, is_active, notes, created_at, updated_at) FROM stdin;
261	54	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
262	55	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
263	56	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
264	57	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
265	58	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
266	59	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
267	60	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
268	61	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
269	62	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
270	206	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
271	207	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
272	208	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
273	209	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
274	237	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
275	244	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
276	245	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
277	246	64	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
278	54	70	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
279	55	70	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
280	56	70	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
281	57	70	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
282	58	70	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
283	59	70	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
27	18	64	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:53:37.108872	t	\N	2025-07-08 16:53:37.108872	2025-07-08 16:53:37.108872
28	18	67	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:53:37.108872	t	\N	2025-07-08 16:53:37.108872	2025-07-08 16:53:37.108872
29	18	72	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:53:37.108872	t	\N	2025-07-08 16:53:37.108872	2025-07-08 16:53:37.108872
30	248	65	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:53:42.415363	t	\N	2025-07-08 16:53:42.415363	2025-07-08 16:53:42.415363
31	248	70	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:53:42.415363	t	\N	2025-07-08 16:53:42.415363	2025-07-08 16:53:42.415363
32	249	68	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:53:48.287585	t	\N	2025-07-08 16:53:48.287585	2025-07-08 16:53:48.287585
33	249	71	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:53:48.287585	t	\N	2025-07-08 16:53:48.287585	2025-07-08 16:53:48.287585
34	250	66	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:53:54.017721	t	\N	2025-07-08 16:53:54.017721	2025-07-08 16:53:54.017721
35	251	69	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:53:59.577482	t	\N	2025-07-08 16:53:59.577482	2025-07-08 16:53:59.577482
37	253	64	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:54:09.99466	t	\N	2025-07-08 16:54:09.99466	2025-07-08 16:54:09.99466
38	253	67	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:54:09.99466	t	\N	2025-07-08 16:54:09.99466	2025-07-08 16:54:09.99466
39	254	70	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:54:18.368101	t	\N	2025-07-08 16:54:18.368101	2025-07-08 16:54:18.368101
40	255	65	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:54:23.61768	t	\N	2025-07-08 16:54:23.61768	2025-07-08 16:54:23.61768
41	256	68	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:54:28.827924	t	\N	2025-07-08 16:54:28.827924	2025-07-08 16:54:28.827924
42	248	67	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:07.818009	t	\N	2025-07-08 17:11:07.818009	2025-07-08 17:11:07.818009
43	250	67	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:07.818009	t	\N	2025-07-08 17:11:07.818009	2025-07-08 17:11:07.818009
44	252	69	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:07.818009	t	\N	2025-07-08 17:11:07.818009	2025-07-08 17:11:07.818009
45	257	68	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:07.818009	t	\N	2025-07-08 17:11:07.818009	2025-07-08 17:11:07.818009
46	258	69	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:07.818009	t	\N	2025-07-08 17:11:07.818009	2025-07-08 17:11:07.818009
47	249	64	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:15.394581	t	\N	2025-07-08 17:11:15.394581	2025-07-08 17:11:15.394581
48	251	65	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:15.394581	t	\N	2025-07-08 17:11:15.394581	2025-07-08 17:11:15.394581
51	256	65	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:15.394581	t	\N	2025-07-08 17:11:15.394581	2025-07-08 17:11:15.394581
53	258	64	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:15.394581	t	\N	2025-07-08 17:11:15.394581	2025-07-08 17:11:15.394581
54	18	71	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:26.154189	t	\N	2025-07-08 17:11:26.154189	2025-07-08 17:11:26.154189
55	250	70	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:26.154189	t	\N	2025-07-08 17:11:26.154189	2025-07-08 17:11:26.154189
56	253	71	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:26.154189	t	\N	2025-07-08 17:11:26.154189	2025-07-08 17:11:26.154189
57	256	70	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:26.154189	t	\N	2025-07-08 17:11:26.154189	2025-07-08 17:11:26.154189
58	249	73	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:31.541139	t	\N	2025-07-08 17:11:31.541139	2025-07-08 17:11:31.541139
59	251	72	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:31.541139	t	\N	2025-07-08 17:11:31.541139	2025-07-08 17:11:31.541139
60	272	64	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:53:37.108872	t	\N	2025-07-08 16:53:37.108872	2025-07-08 16:53:37.108872
61	272	67	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:53:37.108872	t	\N	2025-07-08 16:53:37.108872	2025-07-08 16:53:37.108872
62	272	72	\N	\N	\N	\N	\N	\N	\N	2025-07-08 16:53:37.108872	t	\N	2025-07-08 16:53:37.108872	2025-07-08 16:53:37.108872
63	272	71	\N	\N	\N	\N	\N	\N	\N	2025-07-08 17:11:26.154189	t	\N	2025-07-08 17:11:26.154189	2025-07-08 17:11:26.154189
284	60	70	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
285	61	70	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
286	62	70	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
287	206	70	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
288	207	70	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
289	54	67	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
290	55	67	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
291	56	67	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
292	57	67	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
293	58	67	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
294	59	67	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
295	60	67	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
296	61	67	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
297	54	72	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
298	55	72	\N	\N	\N	\N	\N	\N	\N	2025-07-16 15:00:44.491273	t	\N	2025-07-16 15:00:44.491273	2025-07-16 15:00:44.491273
\.


--
-- Data for Name: customer_products; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.customer_products (id, customer_id, product_id, contract_start_date, contract_end_date, premium_value, premium_percentage, discount_percentage, status, created_at, updated_at) FROM stdin;
374	18	55	2024-02-29	2025-08-22	44611	19	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
375	18	58	2024-11-03	2025-07-14	38323	18	12	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
376	18	62	2024-06-21	2025-02-03	37470	13	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
377	18	65	2024-10-14	2025-03-16	38972	16	2	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
378	18	67	2024-11-08	2025-09-27	57113	17	4	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
379	18	68	2024-03-23	2025-10-10	15305	6	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
380	248	56	2024-07-18	2025-03-29	21490	17	4	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
381	248	58	2024-12-03	2025-06-05	50172	14	9	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
382	248	60	2024-10-16	2025-07-22	35947	19	9	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
383	248	64	2024-11-02	2025-01-20	44202	7	7	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
384	248	74	2024-09-29	2025-08-14	28703	11	10	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
385	249	68	2024-10-16	2025-07-25	22649	18	11	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
386	249	75	2024-05-18	2025-06-04	13692	13	9	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
387	249	76	2024-01-28	2025-04-19	48703	11	9	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
388	250	57	2024-04-05	2025-12-10	34174	10	2	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
389	250	60	2024-06-23	2025-02-20	10663	6	4	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
390	250	63	2024-10-04	2025-06-10	28508	10	10	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
391	250	76	2024-09-04	2025-09-01	23911	15	5	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
392	251	55	2024-08-03	2025-11-18	30506	9	4	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
393	251	56	2024-11-28	2025-10-21	15857	9	7	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
394	251	62	2024-03-16	2025-03-28	29205	9	8	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
395	251	68	2024-01-21	2025-12-14	32730	13	10	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
396	251	70	2024-02-23	2025-01-15	10328	15	9	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
397	251	71	2024-10-22	2025-04-26	31290	11	10	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
398	252	60	2024-06-07	2025-02-10	57144	20	7	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
399	252	66	2024-06-21	2025-10-07	47230	16	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
400	252	69	2024-05-29	2025-06-04	50671	20	5	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
401	252	70	2024-07-10	2025-11-01	36741	19	7	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
402	252	72	2024-04-27	2025-05-03	27958	9	3	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
403	252	74	2024-09-14	2025-11-08	14097	18	12	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
404	253	58	2024-02-29	2025-09-04	54628	8	12	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
405	253	75	2024-08-01	2025-07-04	50729	9	9	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
406	254	56	2024-04-29	2025-11-04	25419	14	10	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
407	254	57	2024-01-17	2025-12-16	47213	18	11	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
408	254	58	2024-02-26	2025-03-22	18097	13	5	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
409	254	60	2024-10-03	2025-02-24	13875	8	12	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
410	254	67	2024-08-25	2025-08-07	13009	10	9	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
411	255	57	2024-11-01	2025-03-08	39355	17	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
412	255	58	2024-02-23	2025-06-30	37284	18	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
413	255	64	2024-07-31	2025-08-27	19793	18	4	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
414	255	68	2024-04-10	2025-04-09	48258	14	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
415	255	72	2024-01-30	2025-01-28	11227	10	12	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
416	255	76	2024-01-14	2025-12-30	41028	15	5	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
417	256	58	2024-04-04	2025-11-09	37975	7	7	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
418	256	64	2024-03-21	2025-11-18	45122	16	3	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
419	256	66	2024-08-31	2025-10-31	10746	12	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
420	256	68	2024-01-20	2025-02-13	28436	19	5	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
421	256	69	2024-04-18	2025-11-28	42581	12	4	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
422	256	72	2024-02-13	2025-07-13	28807	12	4	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
423	256	73	2024-02-06	2025-05-20	44855	13	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
424	256	75	2024-08-01	2025-01-01	19194	19	3	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
425	257	56	2024-01-22	2025-09-14	29702	8	8	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
426	257	63	2024-08-13	2025-05-19	55910	7	11	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
427	257	64	2024-01-06	2025-09-01	14952	11	8	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
428	257	70	2024-12-24	2025-09-28	21406	18	7	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
429	257	71	2024-10-08	2025-02-21	18364	16	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
430	257	74	2024-12-01	2025-07-20	41085	11	8	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
431	258	57	2024-06-04	2025-02-19	56896	20	8	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
432	258	58	2024-01-05	2025-07-24	59649	8	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
433	258	62	2024-05-03	2025-10-11	12609	5	10	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
434	258	67	2024-05-05	2025-02-04	21338	19	12	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
435	258	71	2024-02-25	2025-06-28	35845	8	7	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
436	258	76	2024-05-14	2025-07-28	28351	19	9	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
437	272	55	2024-02-29	2025-08-22	44611	19	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
438	272	58	2024-11-03	2025-07-14	38323	18	12	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
439	272	62	2024-06-21	2025-02-03	37470	13	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
440	272	65	2024-10-14	2025-03-16	38972	16	2	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
441	272	67	2024-11-08	2025-09-27	57113	17	4	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
442	272	68	2024-03-23	2025-10-10	15305	6	6	Active	2025-07-06 15:09:12.485235	2025-07-06 15:09:12.485235
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.customers (id, name, description, owner_id, created_at, updated_at, "ownerId", "createdAt", "updatedAt", industry, status) FROM stdin;
206	Bart De Smet	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
207	Sofie Peeters	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
208	Tom Vermeulen	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
209	Elke Janssens	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
210	Wim Claes	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
211	Anke De Wilde	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
212	Koen Maes	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
213	Lien Van den Broeck	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
214	Pieter Declercq	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
215	Karen De Cock	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
216	Jens Van Damme	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
217	Sara Michiels	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
218	Bram Willems	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
219	Nathalie Goossens	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
220	Kurt Van der Linden	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
221	Els Vandenberghe	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
222	Dieter De Vos	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
223	Isabelle Wauters	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
224	Mieke Van Laere	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
225	Gert Pauwels	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
226	Lynn Vandenbosch	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
227	Rudi Verschueren	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
228	Nele Blomme	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
229	Stephan Vandaele	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
230	Tinne Versluys	Individual customer	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
231	Technolab	Technology company	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
232	Barco	Technology company	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
233	Agfa-Gevaert	Technology company	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
234	Umicore	Materials technology company	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
235	Accenture	Professional services company	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
236	Deloitte	Professional services company	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
237	Proximus	Telecommunications company	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
238	Zetes Industries	Technology solutions company	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
239	Intermodalics	Robotics company	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
240	Sirris	Technology research organization	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
241	Agoria	Technology federation	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
242	Anju Life Sciences Software	Life sciences software company	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
243	Cenexi	Pharmaceutical services company	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	2025-06-23 10:15:15.735406	2025-06-23 10:15:15.735406	\N	Active
244	Qollabi	AI-powered business intelligence platform	\N	2025-06-23 12:49:27.254302	2025-06-23 12:49:27.254302	\N	2025-06-23 12:49:27.254302	2025-06-23 12:49:27.254302	Technology	Active
245	Coca Cola	Global beverage company	\N	2025-06-23 12:49:27.254302	2025-06-23 12:49:27.254302	\N	2025-06-23 12:49:27.254302	2025-06-23 12:49:27.254302	Beverages	Active
246	Bpost	Belgian postal and logistics services	\N	2025-06-23 12:49:27.254302	2025-06-23 12:49:27.254302	\N	2025-06-23 12:49:27.254302	2025-06-23 12:49:27.254302	Logistics	Active
247	Microsoft Netherlands B.V.	Leading technology company providing cloud services and software solutions	\N	2025-07-05 17:08:31.816321	2025-07-05 17:08:31.816321	\N	2025-07-05 17:08:31.816321	2025-07-05 17:08:31.816321	Technology	Active
248	SimCorp Benelux SA/NV (206967000)	Customer imported from Willis tab	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	active
249	Accenture B.V. (211601345)	Customer imported from Willis tab	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	active
250	msg global solutions Benelux B.V. (206948407)	Customer imported from Willis tab	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	active
251	The Boston Consulting Group B.V. (200378349)	Customer imported from Willis tab	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	active
252	Milliman B.V. (200504247)	Customer imported from Willis tab	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	active
253	ABN AMRO Bank N.V. (207322746)	Customer imported from Willis tab	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	active
254	Intervall Holding B.V. (216430974)	Customer imported from Willis tab	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	active
255	PricewaterhouseCoopers Accountants N.V. (206581035)	Customer imported from Willis tab	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	active
256	Oracle Nederland B.V. (206434821)	Customer imported from Willis tab	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	active
257	Blauwtust Holding B.V. (218356329)	Customer imported from Willis tab	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	active
258	Stichting Administratiekantoor OHPEN Expeditions (207322395)	Customer imported from Willis tab	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	2025-07-06 12:06:43.948281	2025-07-06 12:06:43.948281	\N	active
45	Industrial Manufacturing Co.	Customer created from Excel import	\N	2025-06-16 20:55:57.813227	2025-06-16 20:55:57.813227	\N	2025-06-16 20:55:57.813227	2025-06-16 20:55:57.813227	Real Estate & Property Management	Active
259	TechCorp Solutions	Technology company specializing in software development	\N	2025-07-15 09:47:12.525799	2025-07-15 09:47:12.525799	\N	2025-07-15 09:47:12.525799	2025-07-15 09:47:12.525799	Technology	active
42	J.W. Scheffer	Customer created from Excel import	\N	2025-06-16 20:55:57.588142	2025-06-16 20:55:57.588142	\N	2025-06-16 20:55:57.588142	2025-06-16 20:55:57.588142	Professional Services	Active
43	VvE Gezelstraat 3, 3A t/m 3D	Customer created from Excel import	\N	2025-06-16 20:55:57.663167	2025-06-16 20:55:57.663167	\N	2025-06-16 20:55:57.663167	2025-06-16 20:55:57.663167	Property Association	Inactive
44	Dickhoff Installaties	Customer created from Excel import	\N	2025-06-16 20:55:57.738108	2025-06-16 20:55:57.738108	\N	2025-06-16 20:55:57.738108	2025-06-16 20:55:57.738108	Construction & Maintenance	Prospect
46	Bakker Wijnand Vof	Customer created from Excel import	\N	2025-06-16 20:55:57.888322	2025-06-16 20:55:57.888322	\N	2025-06-16 20:55:57.888322	2025-06-16 20:55:57.888322	Retail & Food Service	Active
47	Slagerij Boeve	Customer created from Excel import	\N	2025-06-16 20:55:57.964529	2025-06-16 20:55:57.964529	\N	2025-06-16 20:55:57.964529	2025-06-16 20:55:57.964529	Professional Services	Inactive
30	TechVision Solutions	Technology consulting and software development	\N	2025-07-14 13:05:22.530029	2025-07-14 13:05:22.530029	\N	2025-07-14 13:05:22.530029	2025-07-14 13:05:22.530029	\N	Active
35	LogiTrans B.V.	Logistics and transportation services	\N	2025-07-14 13:05:22.530029	2025-07-14 13:05:22.530029	\N	2025-07-14 13:05:22.530029	2025-07-14 13:05:22.530029	\N	Active
40	Strategic Consulting Partners	Management consulting and advisory services	\N	2025-07-14 13:05:22.530029	2025-07-14 13:05:22.530029	\N	2025-07-14 13:05:22.530029	2025-07-14 13:05:22.530029	\N	Active
260	Industrial Manufacturing BV	Large manufacturing company with industrial processes	\N	2025-07-15 09:47:12.525799	2025-07-15 09:47:12.525799	\N	2025-07-15 09:47:12.525799	2025-07-15 09:47:12.525799	Manufacturing	active
261	Rotterdam Logistics Group	Logistics and transport company	\N	2025-07-15 09:47:12.525799	2025-07-15 09:47:12.525799	\N	2025-07-15 09:47:12.525799	2025-07-15 09:47:12.525799	Logistics	active
262	Green Energy Systems	Renewable energy solutions provider	\N	2025-07-15 09:47:12.525799	2025-07-15 09:47:12.525799	\N	2025-07-15 09:47:12.525799	2025-07-15 09:47:12.525799	Energy	active
263	Financial Services Amsterdam	Financial consulting and services	\N	2025-07-15 09:47:12.525799	2025-07-15 09:47:12.525799	\N	2025-07-15 09:47:12.525799	2025-07-15 09:47:12.525799	Financial Services	active
264	TechFlow Solutions	Technology consulting company	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	Active
265	GreenBuild Construction	Sustainable construction company	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	Active
266	DataVault Systems	Data management solutions	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	Active
267	EcoLogistics BV	Eco-friendly logistics provider	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	Active
268	SmartHome Innovations	Home automation specialists	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	Active
269	CloudFirst Technologies	Cloud infrastructure services	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	Active
270	BioTech Research Lab	Biotechnology research facility	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	Active
271	Urban Planning Group	City development consultancy	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	2025-07-15 12:56:33.910013	2025-07-15 12:56:33.910013	\N	Active
272	Lotus Bakeries	Customer created from Excel import	\N	2025-06-16 20:52:14.547512	2025-06-16 20:52:14.547512	\N	2025-06-16 20:52:14.547512	2025-06-16 20:52:14.547512	Professional Services	Active
18	Amazon CS Netherlands B.V	Customer created from Excel import	\N	2025-06-16 20:52:14.547512	2025-06-16 20:52:14.547512	\N	2025-06-16 20:52:14.547512	2025-06-16 20:52:14.547512	Professional Services	Active
50	InnovateTech Startup	Customer created from Excel import	\N	2025-06-16 20:55:58.191465	2025-06-16 20:55:58.191465	\N	2025-06-16 20:55:58.191465	2025-06-16 20:55:58.191465	Real Estate & Property Management	Active
48	Tolhuis 'n Tol	Customer created from Excel import	\N	2025-06-16 20:55:58.041563	2025-06-16 20:55:58.041563	\N	2025-06-16 20:55:58.041563	2025-06-16 20:55:58.041563	Professional Services	Prospect
49	Kindernet Deventer B.V.	Customer created from Excel import	\N	2025-06-16 20:55:58.116271	2025-06-16 20:55:58.116271	\N	2025-06-16 20:55:58.116271	2025-06-16 20:55:58.116271	Real Estate & Property Management	Active
51	PIMM Solutions B.V.	Customer created from Excel import	\N	2025-06-16 20:55:58.266452	2025-06-16 20:55:58.266452	\N	2025-06-16 20:55:58.266452	2025-06-16 20:55:58.266452	Real Estate & Property Management	Inactive
7	Thema Timmerwerken	Construction and carpentry services	\N	2025-06-06 12:18:09.135486	2025-06-06 12:18:09.135486	\N	2025-06-06 12:18:09.135486	2025-06-06 12:18:09.135486	Professional Services	Inactive
8	Tibben Tapijt en	Carpet and flooring specialist	\N	2025-06-06 12:18:09.135486	2025-06-06 12:18:09.135486	\N	2025-06-06 12:18:09.135486	2025-06-06 12:18:09.135486	Professional Services	Prospect
9	Timmerfabriek Precisie 90	Precision carpentry and woodworking	\N	2025-06-06 12:18:09.135486	2025-06-06 12:18:09.135486	\N	2025-06-06 12:18:09.135486	2025-06-06 12:18:09.135486	Professional Services	Active
1	RGO Makelaars B.V.	Real estate brokerage and property services	1	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	1	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	Real Estate & Property Management	Active
2	Tex-Mex Streetfood	Mexican street food restaurant and catering	1	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	1	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	Professional Services	Active
3	Vishandel sperling	Fish trading and seafood distribution	1	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	1	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	Professional Services	Inactive
4	TOPHOLD International B.V.	International holding and investment company	1	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	1	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	Real Estate & Property Management	Prospect
5	Cronofy B.V.	Scheduling and appointment management software	1	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	1	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	Real Estate & Property Management	Active
19	M Trompetter	Customer created from Excel import	\N	2025-06-16 20:52:14.547512	2025-06-16 20:52:14.547512	\N	2025-06-16 20:52:14.547512	2025-06-16 20:52:14.547512	Professional Services	Inactive
20	Brink Eibergen B.V.	Customer created from Excel import	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	Real Estate & Property Management	Prospect
21	Avifit Beauty Equipment BV	Customer created from Excel import	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	Professional Services	Active
22	BRN Parket B.V.	Customer created from Excel import	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	Real Estate & Property Management	Active
23	G.C. Lettinga	Customer created from Excel import	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	Professional Services	Inactive
24	Bruins Betonstaalvlechtbedrijf	Customer created from Excel import	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	Professional Services	Prospect
25	Van Seters Metaaltechniek	Customer created from Excel import	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	Professional Services	Active
26	Lasklus Nederland B.V.	Customer created from Excel import	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	Real Estate & Property Management	Active
27	Maco Metaal B.V.	Customer created from Excel import	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	Real Estate & Property Management	Inactive
28	Mulders Metaal op Maat	Customer created from Excel import	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	Professional Services	Prospect
29	Hauwlo Zonweringen	Customer created from Excel import	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	\N	2025-06-16 20:52:24.296019	2025-06-16 20:52:24.296019	Professional Services	Active
41	J.M. von Meijenfeldt-Boter	Customer created from Excel import	\N	2025-06-16 20:55:57.505295	2025-06-16 20:55:57.505295	\N	2025-06-16 20:55:57.505295	2025-06-16 20:55:57.505295	Professional Services	Active
52	GMB (Geraedts Metaal	Customer created from Excel import	\N	2025-06-16 20:55:58.341039	2025-06-16 20:55:58.341039	\N	2025-06-16 20:55:58.341039	2025-06-16 20:55:58.341039	Professional Services	Prospect
53	Landman Siermetaal B.V.	Customer created from Excel import	\N	2025-06-16 20:55:58.861444	2025-06-16 20:55:58.861444	\N	2025-06-16 20:55:58.861444	2025-06-16 20:55:58.861444	Real Estate & Property Management	Active
54	Ruud van Laer las en montagewerk	Customer created from Excel import	\N	2025-06-16 20:55:58.93681	2025-06-16 20:55:58.93681	\N	2025-06-16 20:55:58.93681	2025-06-16 20:55:58.93681	Professional Services	Active
55	Duinhouwer BV	Customer created from Excel import	\N	2025-06-16 20:55:59.011656	2025-06-16 20:55:59.011656	\N	2025-06-16 20:55:59.011656	2025-06-16 20:55:59.011656	Professional Services	Inactive
56	TVG Las- en Montagetechniek	Customer created from Excel import	\N	2025-06-16 20:55:59.086414	2025-06-16 20:55:59.086414	\N	2025-06-16 20:55:59.086414	2025-06-16 20:55:59.086414	Professional Services	Prospect
57	Konstruktiebedrijf W. Verweij	Customer created from Excel import	\N	2025-06-16 20:55:59.161341	2025-06-16 20:55:59.161341	\N	2025-06-16 20:55:59.161341	2025-06-16 20:55:59.161341	Professional Services	Active
58	AL 13 Architectural Facades	Customer created from Excel import	\N	2025-06-16 20:55:59.235866	2025-06-16 20:55:59.235866	\N	2025-06-16 20:55:59.235866	2025-06-16 20:55:59.235866	Professional Services	Active
59	Alutech Arnhem	Customer created from Excel import	\N	2025-06-16 20:55:59.310617	2025-06-16 20:55:59.310617	\N	2025-06-16 20:55:59.310617	2025-06-16 20:55:59.310617	Professional Services	Inactive
60	KO-MA Holding B.V.	Customer created from Excel import	\N	2025-06-16 20:55:59.385712	2025-06-16 20:55:59.385712	\N	2025-06-16 20:55:59.385712	2025-06-16 20:55:59.385712	Real Estate & Property Management	Prospect
61	RS-Lastechniek	Customer created from Excel import	\N	2025-06-16 20:55:59.460329	2025-06-16 20:55:59.460329	\N	2025-06-16 20:55:59.460329	2025-06-16 20:55:59.460329	Professional Services	Active
62	Reparatiebedrijf H. Kelderman	Customer created from Excel import	\N	2025-06-16 20:55:59.535141	2025-06-16 20:55:59.535141	\N	2025-06-16 20:55:59.535141	2025-06-16 20:55:59.535141	Professional Services	Active
63	M. van Es	Customer created from Excel import	\N	2025-06-16 20:55:59.609782	2025-06-16 20:55:59.609782	\N	2025-06-16 20:55:59.609782	2025-06-16 20:55:59.609782	Professional Services	Inactive
64	Duinhouwer Onroerend Goed BV	Customer created from Excel import	\N	2025-06-16 20:55:59.686178	2025-06-16 20:55:59.686178	\N	2025-06-16 20:55:59.686178	2025-06-16 20:55:59.686178	Professional Services	Prospect
65	R. Schouten Beheer B.V.	Customer created from Excel import	\N	2025-06-16 20:55:59.761044	2025-06-16 20:55:59.761044	\N	2025-06-16 20:55:59.761044	2025-06-16 20:55:59.761044	Real Estate & Property Management	Active
66	VR Steel	Customer created from Excel import	\N	2025-06-16 20:55:59.835641	2025-06-16 20:55:59.835641	\N	2025-06-16 20:55:59.835641	2025-06-16 20:55:59.835641	Professional Services	Active
67	Winters Metaaltechniek	Customer created from Excel import	\N	2025-06-16 20:55:59.911746	2025-06-16 20:55:59.911746	\N	2025-06-16 20:55:59.911746	2025-06-16 20:55:59.911746	Professional Services	Inactive
68	Hofmeijer Las- en	Customer created from Excel import	\N	2025-06-16 20:55:59.986667	2025-06-16 20:55:59.986667	\N	2025-06-16 20:55:59.986667	2025-06-16 20:55:59.986667	Professional Services	Prospect
69	Timmerman Techniek Assen B.V.	Customer created from Excel import	\N	2025-06-16 20:56:00.061164	2025-06-16 20:56:00.061164	\N	2025-06-16 20:56:00.061164	2025-06-16 20:56:00.061164	Real Estate & Property Management	Active
70	Elektim-Techniek B.V.	Customer created from Excel import	\N	2025-06-16 20:56:00.135836	2025-06-16 20:56:00.135836	\N	2025-06-16 20:56:00.135836	2025-06-16 20:56:00.135836	Real Estate & Property Management	Active
71	Gelderland Hekwerken B.V.	Customer created from Excel import	\N	2025-06-16 20:56:00.211188	2025-06-16 20:56:00.211188	\N	2025-06-16 20:56:00.211188	2025-06-16 20:56:00.211188	Real Estate & Property Management	Inactive
72	Stephan Borgers	Customer created from Excel import	\N	2025-06-16 20:56:00.337462	2025-06-16 20:56:00.337462	\N	2025-06-16 20:56:00.337462	2025-06-16 20:56:00.337462	Professional Services	Prospect
73	Gartech	Customer created from Excel import	\N	2025-06-16 20:56:00.412576	2025-06-16 20:56:00.412576	\N	2025-06-16 20:56:00.412576	2025-06-16 20:56:00.412576	Professional Services	Active
74	Amuko Service	Customer created from Excel import	\N	2025-06-16 20:56:00.487072	2025-06-16 20:56:00.487072	\N	2025-06-16 20:56:00.487072	2025-06-16 20:56:00.487072	Professional Services	Active
75	SH Vastgoed BV	Customer created from Excel import	\N	2025-06-16 20:56:00.561382	2025-06-16 20:56:00.561382	\N	2025-06-16 20:56:00.561382	2025-06-16 20:56:00.561382	Professional Services	Inactive
76	Van der Kroon Metaal en	Customer created from Excel import	\N	2025-06-16 20:56:00.636336	2025-06-16 20:56:00.636336	\N	2025-06-16 20:56:00.636336	2025-06-16 20:56:00.636336	Professional Services	Prospect
77	De Werelth	Customer created from Excel import	\N	2025-06-16 20:56:00.71153	2025-06-16 20:56:00.71153	\N	2025-06-16 20:56:00.71153	2025-06-16 20:56:00.71153	Professional Services	Active
78	M.Oomen techniek	Customer created from Excel import	\N	2025-06-16 20:56:00.786342	2025-06-16 20:56:00.786342	\N	2025-06-16 20:56:00.786342	2025-06-16 20:56:00.786342	Professional Services	Active
79	SLAGHUIS Veelzijdig in	Customer created from Excel import	\N	2025-06-16 20:56:00.860842	2025-06-16 20:56:00.860842	\N	2025-06-16 20:56:00.860842	2025-06-16 20:56:00.860842	Professional Services	Inactive
80	W. Verweij Beheer BV	Customer created from Excel import	\N	2025-06-16 20:56:00.935727	2025-06-16 20:56:00.935727	\N	2025-06-16 20:56:00.935727	2025-06-16 20:56:00.935727	Real Estate & Property Management	Prospect
81	RBSS Vastgoed B.V.	Customer created from Excel import	\N	2025-06-16 20:56:01.010841	2025-06-16 20:56:01.010841	\N	2025-06-16 20:56:01.010841	2025-06-16 20:56:01.010841	Real Estate & Property Management	Active
82	Vermeulen Ingenieursbureau B.V.	Customer created from Excel import	\N	2025-06-16 20:56:01.086191	2025-06-16 20:56:01.086191	\N	2025-06-16 20:56:01.086191	2025-06-16 20:56:01.086191	Real Estate & Property Management	Active
83	Cristel vd sanden Interieur	Customer created from Excel import	\N	2025-06-16 20:56:01.162249	2025-06-16 20:56:01.162249	\N	2025-06-16 20:56:01.162249	2025-06-16 20:56:01.162249	Professional Services	Inactive
84	AanZet Staal-Bouw-Techniek B.V.	Customer created from Excel import	\N	2025-06-16 20:56:01.236799	2025-06-16 20:56:01.236799	\N	2025-06-16 20:56:01.236799	2025-06-16 20:56:01.236799	Real Estate & Property Management	Prospect
85	AanZet Holding B.V.	Customer created from Excel import	\N	2025-06-16 20:56:01.311632	2025-06-16 20:56:01.311632	\N	2025-06-16 20:56:01.311632	2025-06-16 20:56:01.311632	Real Estate & Property Management	Active
86	GB Hoogwerkers B.V.	Customer created from Excel import	\N	2025-06-16 20:56:01.388278	2025-06-16 20:56:01.388278	\N	2025-06-16 20:56:01.388278	2025-06-16 20:56:01.388278	Real Estate & Property Management	Active
87	S. van Bergeijk Heftruck VOF	Customer created from Excel import	\N	2025-06-16 20:56:01.463595	2025-06-16 20:56:01.463595	\N	2025-06-16 20:56:01.463595	2025-06-16 20:56:01.463595	Professional Services	Inactive
88	Retsok Norg BV	Customer created from Excel import	\N	2025-06-16 20:56:01.546381	2025-06-16 20:56:01.546381	\N	2025-06-16 20:56:01.546381	2025-06-16 20:56:01.546381	Professional Services	Prospect
89	Spin Pompen BV	Customer created from Excel import	\N	2025-06-16 20:56:01.621039	2025-06-16 20:56:01.621039	\N	2025-06-16 20:56:01.621039	2025-06-16 20:56:01.621039	Professional Services	Active
90	Bakker Protech	Customer created from Excel import	\N	2025-06-16 20:56:01.695878	2025-06-16 20:56:01.695878	\N	2025-06-16 20:56:01.695878	2025-06-16 20:56:01.695878	Retail & Food Service	Active
91	Wildenborg Haardendesign B.V.	Customer created from Excel import	\N	2025-06-16 20:56:01.770731	2025-06-16 20:56:01.770731	\N	2025-06-16 20:56:01.770731	2025-06-16 20:56:01.770731	Real Estate & Property Management	Inactive
92	DKM Tec	Customer created from Excel import	\N	2025-06-16 20:56:01.845425	2025-06-16 20:56:01.845425	\N	2025-06-16 20:56:01.845425	2025-06-16 20:56:01.845425	Professional Services	Prospect
93	Hinneman Engineering B.V.	Customer created from Excel import	\N	2025-06-16 20:56:01.920233	2025-06-16 20:56:01.920233	\N	2025-06-16 20:56:01.920233	2025-06-16 20:56:01.920233	Real Estate & Property Management	Active
94	Lift Products	Customer created from Excel import	\N	2025-06-16 20:56:01.995429	2025-06-16 20:56:01.995429	\N	2025-06-16 20:56:01.995429	2025-06-16 20:56:01.995429	Professional Services	Active
95	R. Schouten Beheer BV	Customer created from Excel import	\N	2025-06-16 20:56:02.070847	2025-06-16 20:56:02.070847	\N	2025-06-16 20:56:02.070847	2025-06-16 20:56:02.070847	Real Estate & Property Management	Inactive
96	Joosten Metaal	Customer created from Excel import	\N	2025-06-16 20:56:02.14647	2025-06-16 20:56:02.14647	\N	2025-06-16 20:56:02.14647	2025-06-16 20:56:02.14647	Professional Services	Prospect
97	Elbouw G/E Kombinatie BV	Customer created from Excel import	\N	2025-06-16 20:56:02.221312	2025-06-16 20:56:02.221312	\N	2025-06-16 20:56:02.221312	2025-06-16 20:56:02.221312	Professional Services	Active
98	G. Leijten	Customer created from Excel import	\N	2025-06-16 20:56:02.296024	2025-06-16 20:56:02.296024	\N	2025-06-16 20:56:02.296024	2025-06-16 20:56:02.296024	Professional Services	Active
99	R Leijten	Customer created from Excel import	\N	2025-06-16 20:56:02.370839	2025-06-16 20:56:02.370839	\N	2025-06-16 20:56:02.370839	2025-06-16 20:56:02.370839	Professional Services	Inactive
100	Coach 27	Customer created from Excel import	\N	2025-06-16 20:56:02.44609	2025-06-16 20:56:02.44609	\N	2025-06-16 20:56:02.44609	2025-06-16 20:56:02.44609	Professional Services	Prospect
101	Jeanneke Bosch Vakantie	Customer created from Excel import	\N	2025-06-16 20:56:02.520955	2025-06-16 20:56:02.520955	\N	2025-06-16 20:56:02.520955	2025-06-16 20:56:02.520955	Professional Services	Active
102	Fidatrade BV	Customer created from Excel import	\N	2025-06-16 20:56:02.597604	2025-06-16 20:56:02.597604	\N	2025-06-16 20:56:02.597604	2025-06-16 20:56:02.597604	Professional Services	Active
103	Bercx Klimaattechniek	Customer created from Excel import	\N	2025-06-16 20:56:02.673126	2025-06-16 20:56:02.673126	\N	2025-06-16 20:56:02.673126	2025-06-16 20:56:02.673126	Professional Services	Inactive
104	Het Gouden Woud B.V.	Customer created from Excel import	\N	2025-06-16 20:56:02.748271	2025-06-16 20:56:02.748271	\N	2025-06-16 20:56:02.748271	2025-06-16 20:56:02.748271	Real Estate & Property Management	Prospect
105	Van den Broek Hoveniersbedrijf	Customer created from Excel import	\N	2025-06-16 20:56:02.823038	2025-06-16 20:56:02.823038	\N	2025-06-16 20:56:02.823038	2025-06-16 20:56:02.823038	Construction & Maintenance	Active
106	G.F.J. Pijnenburg	Customer created from Excel import	\N	2025-06-16 20:56:02.897651	2025-06-16 20:56:02.897651	\N	2025-06-16 20:56:02.897651	2025-06-16 20:56:02.897651	Professional Services	Active
107	LTW Leenders en HGJ Gielen	Customer created from Excel import	\N	2025-06-16 20:56:02.972646	2025-06-16 20:56:02.972646	\N	2025-06-16 20:56:02.972646	2025-06-16 20:56:02.972646	Professional Services	Inactive
108	P.J.G. Peeters	Customer created from Excel import	\N	2025-06-16 20:56:03.051552	2025-06-16 20:56:03.051552	\N	2025-06-16 20:56:03.051552	2025-06-16 20:56:03.051552	Professional Services	Prospect
109	Bint advocaten	Insurance client for Inventaris/Goederen Zak. Dienstverlening	\N	2025-06-16 23:05:12.26973	2025-06-16 23:05:12.26973	\N	2025-06-16 23:05:12.26973	2025-06-16 23:05:12.26973	Professional Services	Active
110	Bilderdijkkade 16a	Insurance client for Bedrijfsgebouwen Verhuur onroerend goed	\N	2025-06-16 23:05:12.949971	2025-06-16 23:05:12.949971	\N	2025-06-16 23:05:12.949971	2025-06-16 23:05:12.949971	Professional Services	Active
111	KERAF BV	Insurance client for Inventaris/Goederen Conversie	\N	2025-06-16 23:05:13.575773	2025-06-16 23:05:13.575773	\N	2025-06-16 23:05:13.575773	2025-06-16 23:05:13.575773	Professional Services	Inactive
112	Installatie-en Servicebedrijf	Insurance client for Inventaris/Goederen Bouwnijver	\N	2025-06-16 23:05:16.3957	2025-06-16 23:05:16.3957	\N	2025-06-16 23:05:16.3957	2025-06-16 23:05:16.3957	Professional Services	Prospect
113	R de Boer/de Boer Montage	Insurance client for Inventaris/Goederen Bouwnijver	\N	2025-06-16 23:05:17.612104	2025-06-16 23:05:17.612104	\N	2025-06-16 23:05:17.612104	2025-06-16 23:05:17.612104	Professional Services	Active
114	Van den Bergh Beheer BV	Insurance client for Bedrijfsgebouwen Detailhandel	\N	2025-06-16 23:06:23.022984	2025-06-16 23:06:23.022984	\N	2025-06-16 23:06:23.022984	2025-06-16 23:06:23.022984	Real Estate & Property Management	Active
115	VvE Hof van Delftlaan 74	Insurance client for Bedrijfsgebouwen	\N	2025-06-16 23:06:24.220241	2025-06-16 23:06:24.220241	\N	2025-06-16 23:06:24.220241	2025-06-16 23:06:24.220241	Property Association	Inactive
116	O.F.M. Brekelmans	Insurance client for Bedrijfsgebouwen Verhuur onroerend goed	\N	2025-06-16 23:06:24.818745	2025-06-16 23:06:24.818745	\N	2025-06-16 23:06:24.818745	2025-06-16 23:06:24.818745	Professional Services	Prospect
117	R.J. Hogervorst	Insurance client for Bedrijfsgebouwen Conversie	\N	2025-06-16 23:06:25.407461	2025-06-16 23:06:25.407461	\N	2025-06-16 23:06:25.407461	2025-06-16 23:06:25.407461	Professional Services	Active
118	Kamm Mode	Insurance client for Inventaris/Goederen Detailhand	\N	2025-06-16 23:06:26.002808	2025-06-16 23:06:26.002808	\N	2025-06-16 23:06:26.002808	2025-06-16 23:06:26.002808	Professional Services	Active
119	Heerenleed Damesmode VOF	Insurance client for Inventaris/Goederen Detailhand	\N	2025-06-16 23:06:26.592342	2025-06-16 23:06:26.592342	\N	2025-06-16 23:06:26.592342	2025-06-16 23:06:26.592342	Professional Services	Inactive
120	VvE Marktweg 360 t/m 396	Insurance client for Bedrijfsgebouwen Verhuur onroerend goed	\N	2025-06-16 23:09:13.006948	2025-06-16 23:09:13.006948	\N	2025-06-16 23:09:13.006948	2025-06-16 23:09:13.006948	Property Association	Prospect
121	Van der Krans Import VOF	Insurance client for Inventaris/Goederen Groothand	\N	2025-06-16 23:09:32.362455	2025-06-16 23:09:32.362455	\N	2025-06-16 23:09:32.362455	2025-06-16 23:09:32.362455	Professional Services	Active
122	J. Gordijn h.o.d.n. Gordijn	Insurance client for Inventaris/Goederen Conversie	\N	2025-06-16 23:09:32.579521	2025-06-16 23:09:32.579521	\N	2025-06-16 23:09:32.579521	2025-06-16 23:09:32.579521	Professional Services	Active
123	Cromvoirtse Fanfare	Insurance client for Inventaris/Goederen Conversie	\N	2025-06-16 23:09:32.795681	2025-06-16 23:09:32.795681	\N	2025-06-16 23:09:32.795681	2025-06-16 23:09:32.795681	Professional Services	Inactive
124	Christengemeente Den Haag	Insurance client for Bedrijfsgebouwen Conversie	\N	2025-06-16 23:09:33.013017	2025-06-16 23:09:33.013017	\N	2025-06-16 23:09:33.013017	2025-06-16 23:09:33.013017	Professional Services	Prospect
125	J.G. Meerburg Beheer B.V.	Insurance client for Bedrijfsgebouwen Conversie	\N	2025-06-16 23:09:33.228287	2025-06-16 23:09:33.228287	\N	2025-06-16 23:09:33.228287	2025-06-16 23:09:33.228287	Real Estate & Property Management	Active
126	Apm Malherbe	Insurance client for Bedrijfsgebouwen Conversie	\N	2025-06-16 23:09:33.876698	2025-06-16 23:09:33.876698	\N	2025-06-16 23:09:33.876698	2025-06-16 23:09:33.876698	Professional Services	Active
127	Claviesta Piano &	Insurance client for Inventaris/Goederen Groothand	\N	2025-06-16 23:09:34.093356	2025-06-16 23:09:34.093356	\N	2025-06-16 23:09:34.093356	2025-06-16 23:09:34.093356	Professional Services	Inactive
128	Pendik Midden B.V.	Insurance client for Inventaris/Goederen Bouwnijver	\N	2025-06-16 23:09:34.308845	2025-06-16 23:09:34.308845	\N	2025-06-16 23:09:34.308845	2025-06-16 23:09:34.308845	Real Estate & Property Management	Prospect
129	G. en A. van Osch	Insurance client for Bedrijfsgebouwen Horeca	\N	2025-06-16 23:09:34.523845	2025-06-16 23:09:34.523845	\N	2025-06-16 23:09:34.523845	2025-06-16 23:09:34.523845	Professional Services	Active
130	J. Griffioen	Insurance client for Bedrijfsgebouwen Conversie	\N	2025-06-16 23:09:34.73984	2025-06-16 23:09:34.73984	\N	2025-06-16 23:09:34.73984	2025-06-16 23:09:34.73984	Professional Services	Active
131	PenDik Beheer BV	Insurance client for Bedrijfsgebouwen Conversie	\N	2025-06-16 23:09:34.95467	2025-06-16 23:09:34.95467	\N	2025-06-16 23:09:34.95467	2025-06-16 23:09:34.95467	Real Estate & Property Management	Inactive
132	Rjw De Graaff	Insurance client for Inventaris/Goederen Bouwnijver	\N	2025-06-16 23:09:35.169666	2025-06-16 23:09:35.169666	\N	2025-06-16 23:09:35.169666	2025-06-16 23:09:35.169666	Professional Services	Prospect
133	Fanfare St Cornelis	Insurance client for Inventaris/Goederen Conversie	\N	2025-06-16 23:09:35.385127	2025-06-16 23:09:35.385127	\N	2025-06-16 23:09:35.385127	2025-06-16 23:09:35.385127	Professional Services	Active
134	Cire BV	Insurance client for Inventaris/Goederen Conversie	\N	2025-06-16 23:09:35.601219	2025-06-16 23:09:35.601219	\N	2025-06-16 23:09:35.601219	2025-06-16 23:09:35.601219	Professional Services	Active
135	Arto Vastgoed BV	Insurance client for Bedrijfsgebouwen Detailhandel	\N	2025-06-16 23:09:35.818849	2025-06-16 23:09:35.818849	\N	2025-06-16 23:09:35.818849	2025-06-16 23:09:35.818849	Professional Services	Inactive
136	Buijtels Buizen B V	Insurance client for Inventaris/Goederen Conversie	\N	2025-06-16 23:09:36.035636	2025-06-16 23:09:36.035636	\N	2025-06-16 23:09:36.035636	2025-06-16 23:09:36.035636	Professional Services	Prospect
137	J.H. van Beek	Insurance client for Bedrijfsgebouwen Conversie	\N	2025-06-16 23:09:36.251269	2025-06-16 23:09:36.251269	\N	2025-06-16 23:09:36.251269	2025-06-16 23:09:36.251269	Professional Services	Active
138	T.S.O. VOF	Insurance client for Inventaris/Goederen Detailhand	\N	2025-06-16 23:09:36.467438	2025-06-16 23:09:36.467438	\N	2025-06-16 23:09:36.467438	2025-06-16 23:09:36.467438	Professional Services	Active
139	M de Gelder Holding B.V	Insurance client for Inventaris/Goederen Conversie	\N	2025-06-16 23:09:36.683059	2025-06-16 23:09:36.683059	\N	2025-06-16 23:09:36.683059	2025-06-16 23:09:36.683059	Professional Services	Inactive
140	Gebr. Hummel Recycling B.V.	Insurance client for Inventaris/Goederen Conversie	\N	2025-06-16 23:09:36.898423	2025-06-16 23:09:36.898423	\N	2025-06-16 23:09:36.898423	2025-06-16 23:09:36.898423	Real Estate & Property Management	Prospect
141	V.O.F. Diamant	Insurance client for Inventaris/Goederen Conversie	\N	2025-06-16 23:09:37.115247	2025-06-16 23:09:37.115247	\N	2025-06-16 23:09:37.115247	2025-06-16 23:09:37.115247	Professional Services	Active
142	Svolta B.V.	Insurance client for Inventaris/Goederen Detailhand	\N	2025-06-16 23:09:37.473971	2025-06-16 23:09:37.473971	\N	2025-06-16 23:09:37.473971	2025-06-16 23:09:37.473971	Real Estate & Property Management	Active
143	Loe van Doren Juwelier	Insurance client for Bedrijfsgebouwen Detailhandel	\N	2025-06-16 23:09:37.697289	2025-06-16 23:09:37.697289	\N	2025-06-16 23:09:37.697289	2025-06-16 23:09:37.697289	Professional Services	Inactive
144	Schieland Borsboom Makelaars	Insurance client for Inventaris/Goederen Zak. Dienstverlening	\N	2025-06-16 23:09:38.056104	2025-06-16 23:09:38.056104	\N	2025-06-16 23:09:38.056104	2025-06-16 23:09:38.056104	Professional Services	Prospect
145	J.T. Kramer	Insurance client for Bedrijfsgebouwen Verhuur onroerend goed	\N	2025-06-16 23:09:38.271718	2025-06-16 23:09:38.271718	\N	2025-06-16 23:09:38.271718	2025-06-16 23:09:38.271718	Professional Services	Active
146	Y.M. Scheffer-Maarschalk	Insurance client for Bedrijfsgebouwen Conversie	\N	2025-06-16 23:09:38.487171	2025-06-16 23:09:38.487171	\N	2025-06-16 23:09:38.487171	2025-06-16 23:09:38.487171	Professional Services	Active
\.


--
-- Data for Name: entity_logos; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.entity_logos (id, entity_type, entity_id, environment_id, logo_data, mime_type, original_filename, file_size, uploaded_by, created_at, updated_at) FROM stdin;
1	partner	1	degoudse	data:image/svg+xml;base64,CiAgICAgIDxzdmcgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICAgIDxkZWZzPgogICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkMSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMyNTYzZWI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFkNGVkODtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxwYXRoIGQ9Ik01MCAxMCBMMjAgMjUgTDIwIDU1IFEyMCA3NSA1MCA5MCBRODAgNzUgODAgNTUgTDgwIDI1IFoiIGZpbGw9InVybCgjZ3JhZDEpIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgICAgIDx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPkFJPC90ZXh0PgogICAgICA8L3N2Zz4=	image/svg+xml	abc_insurance_brokers_logo.svg	902	1	2025-06-11 23:32:43.027442	2025-06-11 23:32:43.027442
2	partner	2	degoudse	data:image/svg+xml;base64,CiAgICAgIDxzdmcgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICAgIDxkZWZzPgogICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkMiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNkYzI2MjY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2I5MWMxYztzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBmaWxsPSJ1cmwoI2dyYWQyKSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz4KICAgICAgICA8dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5RSTwvdGV4dD4KICAgICAgPC9zdmc+	image/svg+xml	quick_insurance_solutions_logo.svg	854	1	2025-06-11 23:32:57.546639	2025-06-11 23:32:57.546639
3	partner	3	degoudse	data:image/svg+xml;base64,CiAgICAgIDxzdmcgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICAgIDxkZWZzPgogICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkMSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNTk2Njk7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzA0Nzg1NztzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxwYXRoIGQ9Ik01MCAxMCBMMjAgMjUgTDIwIDU1IFEyMCA3NSA1MCA5MCBRODAgNzUgODAgNTUgTDgwIDI1IFoiIGZpbGw9InVybCgjZ3JhZDEpIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgICAgIDx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPlBSPC90ZXh0PgogICAgICA8L3N2Zz4=	image/svg+xml	premium_risk_management_logo.svg	902	1	2025-06-11 23:33:19.281417	2025-06-11 23:33:19.281417
4	partner	4	degoudse	data:image/svg+xml;base64,CiAgICAgIDxzdmcgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICAgIDxkZWZzPgogICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkMiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM3YzNhZWQ7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzZkMjhkOTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBmaWxsPSJ1cmwoI2dyYWQyKSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz4KICAgICAgICA8dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5SSTwvdGV4dD4KICAgICAgPC9zdmc+	image/svg+xml	regional_insurance_partners_logo.svg	854	1	2025-06-11 23:33:19.281417	2025-06-11 23:33:19.281417
5	customer	1	degoudse	data:image/svg+xml;base64,CiAgICAgIDxzdmcgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICAgIDxkZWZzPgogICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkMyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlYTU4MGM7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2MyNDEwYztzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxwYXRoIGQ9Ik01MCAxNSBMMjUgMzUgTDI1IDgwIEw3NSA4MCBMNzUgMzUgWiIgZmlsbD0idXJsKCNncmFkMykiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICAgICAgPHJlY3QgeD0iNDAiIHk9IjUwIiB3aWR0aD0iMjAiIGhlaWdodD0iMzAiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjMiLz4KICAgICAgICA8dGV4dCB4PSI1MCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5STTwvdGV4dD4KICAgICAgPC9zdmc+	image/svg+xml	rgo_makelaars_b.v._logo.svg	982	1	2025-06-11 23:33:48.648002	2025-06-11 23:33:48.648002
6	customer	2	degoudse	data:image/svg+xml;base64,CiAgICAgIDxzdmcgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICAgIDxkZWZzPgogICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkMiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNjYThhMDQ7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ExNjIwNztzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBmaWxsPSJ1cmwoI2dyYWQyKSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz4KICAgICAgICA8dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5UUzwvdGV4dD4KICAgICAgPC9zdmc+	image/svg+xml	tex-mex_streetfood_logo.svg	854	1	2025-06-11 23:33:48.648002	2025-06-11 23:33:48.648002
7	customer	3	degoudse	data:image/svg+xml;base64,CiAgICAgIDxzdmcgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICAgIDxkZWZzPgogICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkMiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwODkxYjI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzBlNzQ5MDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBmaWxsPSJ1cmwoI2dyYWQyKSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz4KICAgICAgICA8dGV4dCB4PSI1MCIgeT0iNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5WUzwvdGV4dD4KICAgICAgPC9zdmc+	image/svg+xml	vishandel_sperling_logo.svg	854	1	2025-06-11 23:33:48.648002	2025-06-11 23:33:48.648002
8	customer	4	degoudse	data:image/svg+xml;base64,CiAgICAgIDxzdmcgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICAgIDxkZWZzPgogICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkNSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0MzM4Y2E7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzM3MzBhMztzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxyZWN0IHg9IjE1IiB5PSIyNSIgd2lkdGg9IjcwIiBoZWlnaHQ9IjUwIiByeD0iOCIgZmlsbD0idXJsKCNncmFkNSkiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICAgICAgPHRleHQgeD0iNTAiIHk9IjYwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+VEk8L3RleHQ+CiAgICAgIDwvc3ZnPg==	image/svg+xml	tophold_international_b.v._logo.svg	844	1	2025-06-11 23:34:38.085718	2025-06-11 23:34:38.085718
9	customer	5	degoudse	data:image/svg+xml;base64,CiAgICAgIDxzdmcgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICAgIDxkZWZzPgogICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkNCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNjMjQxMGM7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzlhMzQxMjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxwYXRoIGQ9Ik01MCwyMCBMNjAsMzAgTDcwLDI1IEw3NSwzNSBMODUsNDAgTDgwLDUwIEw4NSw2MCBMNTE2NSBMMCxNIDMwLDc1IEwyNSw2NSBMMTUsNjAgTDIwLDUwIEwxNSw0MCBMMjUsUnlpGQwIDUwIFoiIGZpbGw9InVybCgjZ3JhZDQpIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+CiAgICAgICAgPHRleHQgeD0iNTAiIHk9IjU4IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjYzI0MTBjIj5DQjwvdGV4dD4KICAgICAgPC9zdmc+	image/svg+xml	cronofy_b.v._logo.svg	986	1	2025-06-11 23:34:38.085718	2025-06-11 23:34:38.085718
10	customer	7	degoudse	data:image/svg+xml;base64,CiAgICAgIDxzdmcgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICAgIDxkZWZzPgogICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkNCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwNTk2Njk7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzA0Nzg1NztzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxwYXRoIGQ9Ik01MCwyMCBMNjAsMzAgTDcwLDI1IEw3NSwzNSBMODUsNDAgTDgwLDUwIEw4NSw2MCBMNTE2NSBMMCw3NSBMMzAsNzUgTDI1LDY1IEwxNSw2MCBMMjAsNTAgTDE1LDQwIEwyNSwzNSBMMzAsMjUgTDQwLDMwIFoiIGZpbGw9InVybCgjZ3JhZDQpIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjE1IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+CiAgICAgICAgPHRleHQgeD0iNTAiIHk9IjU4IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDU5NjY5Ij5UVDwvdGV4dD4KICAgICAgPC9zdmc+	image/svg+xml	thema_timmerwerken_logo.svg	982	1	2025-06-11 23:35:01.688529	2025-06-11 23:35:01.688529
11	customer	8	degoudse	data:image/svg+xml;base64,CiAgICAgIDxzdmcgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICAgIDxkZWZzPgogICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkNSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM3YzJkMTI7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY1MWEwYjtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPC9kZWZzPgogICAgICAgIDxyZWN0IHg9IjE1IiB5PSIyNSIgd2lkdGg9IjcwIiBoZWlnaHQ9IjUwIiByeD0iOCIgZmlsbD0idXJsKCNncmFkNSkiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICAgICAgPHRleHQgeD0iNTAiIHk9IjYwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+VFQ8L3RleHQ+CiAgICAgIDwvc3ZnPg==	image/svg+xml	tibben_tapijt_en_logo.svg	844	1	2025-06-11 23:35:01.688529	2025-06-11 23:35:01.688529
12	partner	6	degoudse	data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABAAEADASIAAhEBAxEB/8QAGQABAAMBAQAAAAAAAAAAAAAAAAUGBwgB/8QAKxAAAQMDAgMIAwEAAAAAAAAAAQACAwQFEQYSEyExBxQiQVFhcYEVMpFi/8QAGAEBAQEBAQAAAAAAAAAAAAAAAAUEAgb/xAAlEQACAgECBAcAAAAAAAAAAAAAAgEDBBESITFBYQUTIlFxgcH/2gAMAwEAAhEDEQA/AOqUREAREQBERAEREAREQBQ7fzk16ORR01rjdy6ySzDH0Gc/nr7LO+2e5TyXehs4e5lLwRUSNB5SEuIGfjaf6oam7Q7vZaB1FT8Otf0jkqHFzoz6f6HsVuTBdq4sXqZ0zlS6atvPhrJatY62vmk9VMpZ7fHX2uqLXU5ia5sgGcPaOoc7py+PVXqwXikvtsjr7e55geS3D2lrmuBwQQfMFULTGthq4S2u5UMdPcmji0+3mH4Hi255h2C76JUzoukqoL7XSxuHcJIwJGnIPFBG3A6Zxuz8NXnrsm3G8RXDsX0tGsT346wXGii/G3Qu1159/r3/AEuqIipksIiIDFe32iqKS4269xskdTGLu0rgPDGQ4lufnc7+e6yD8tsuEUu/w8QOJ64Gea66v1nob9ap7ddIGz0szcOaeo9CD5EeRWH3nsNrKOsfNp+pgqYeKHQsqZHMkjGM/sORwR6Kti5yJXsfoTcqmUbzUWW7RzLR2f6fnn1LT3uKIw0ELXFjntIMu5hA2+3POVq6yTTOi9cd+ZLetSz00UbgQ2GpfMX/AE7l1x1BWtMbtY1pcXEDG49T7qY9s2zumNDVRc9saukr8nqIi4NAREQBERAEREAREQH/2Q==	image/png	company-logo-transparent-png-19.png	256751	1	2025-06-19 09:23:09.686845	2025-06-19 09:23:09.686845
\.


--
-- Data for Name: list_collaborators; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.list_collaborators (id, list_id, user_id, email, name, access_level, invited_by_id, invited_at, is_active, created_at, updated_at) FROM stdin;
14	36	\N	arnould@qollabi.com	Arnould	editor	1	2025-06-18 08:46:22.219924	t	2025-06-18 08:46:22.219924	2025-06-18 08:46:22.219924
15	37	\N	arnould@qollabi.com	Arnould	editor	1	2025-06-18 11:16:01.307332	t	2025-06-18 11:16:01.307332	2025-06-18 11:16:01.307332
13	34	\N	john.smith@partner.com	John Smith	editor	1	2025-06-17 14:20:12.200989	f	2025-06-17 14:20:12.200989	2025-06-17 14:20:12.200989
16	36	\N	john.smith@partner.com	John Smith	editor	1	2025-06-19 09:32:38.403156	f	2025-06-19 09:32:38.403156	2025-06-19 09:32:38.403156
17	39	\N	john.smith@partner.com	John Smith	viewer	1	2025-06-23 11:26:19.081289	f	2025-06-23 11:26:19.081289	2025-06-23 11:26:19.081289
18	39	\N	john.smith@partner.com	John Smith	editor	1	2025-06-23 12:52:15.862266	f	2025-06-23 12:52:15.862266	2025-06-23 12:52:15.862266
19	39	\N	john.smith@partner.com	John Smith	viewer	1	2025-06-24 12:22:58.187636	t	2025-06-24 12:22:58.187636	2025-06-24 12:22:58.187636
20	46	\N	arnould@qollabi.com	Arnould	editor	1	2025-07-14 11:09:24.872861	t	2025-07-14 11:09:24.872861	2025-07-14 11:09:24.872861
21	50	\N	john.smith@partner.com	John Smith	editor	1	2025-07-22 12:02:20.730826	t	2025-07-22 12:02:20.730826	2025-07-22 12:02:20.730826
22	51	\N	john.smith@partner.com	John Smith	editor	1	2025-07-22 12:02:20.730826	t	2025-07-22 12:02:20.730826	2025-07-22 12:02:20.730826
23	36	\N	john.smith@partner.com	John Smith	editor	1	2025-07-22 12:02:20.730826	t	2025-07-22 12:02:20.730826	2025-07-22 12:02:20.730826
24	37	\N	john.smith@partner.com	John Smith	editor	1	2025-07-22 12:02:20.730826	t	2025-07-22 12:02:20.730826	2025-07-22 12:02:20.730826
25	46	\N	john.smith@partner.com	John Smith	editor	1	2025-07-22 12:02:20.730826	t	2025-07-22 12:02:20.730826	2025-07-22 12:02:20.730826
\.


--
-- Data for Name: okr_metrics; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.okr_metrics (id, name, description, realized_value, target_value, measure_unit, currency_type, traffic_light_thresholds, progress_bar_thresholds, picklist_options, responsible_user_id, responsible_contact_ids, timeframe_start, timeframe_end, frequency, attachment_url, due_date, is_muted, is_archived, is_shared, hierarchy, parent_id, tags, created_at, updated_at, created_by, ytd_value, last_year_value) FROM stdin;
1	Q1 Premium Revenue	Total premium revenue for Q1	0	2500000	currency	USD	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	objective	\N	{Revenue}	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	1	\N	\N
2	New Customer Acquisition	Number of new customers acquired	0	25	number	USD	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	activity	\N	{Revenue,"Market Expansion"}	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	1	\N	\N
3	Customer Retention Rate	Percentage of customers retained	0	95	percent	USD	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	activity	\N	{"Customer Satisfaction"}	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	1	\N	\N
4	Claims Processing Time	Average time to process claims in days	0	5	number	USD	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	activity	\N	{"Operational Efficiency"}	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	1	\N	\N
5	Risk Assessment Accuracy	Percentage of accurate risk assessments	0	90	percent	USD	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	activity	\N	{"Risk Management"}	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	1	\N	\N
6	Omvang Portefeuille – Schade Zakelijk	Portfolio size for commercial damage insurance	0	\N	currency	EUR	\N	\N	{}	\N	{}	\N	\N	yearly	\N	\N	f	f	t	objective	\N	{"Productie Dashboard - Schade Zakelijk 2025"}	2025-06-17 18:25:10.69685	2025-06-17 18:25:10.69685	2	742.301,32 €	700.599 €
9	Nieuwe Productie – Schade Zakelijk	\N	0	\N	currency	EUR	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	objective	\N	{"Productie Dashboard - Schade Zakelijk 2025"}	2025-06-17 18:41:17.144902	2025-06-17 18:41:17.144902	2	376.138,18 €	836.496 €
10	Royement – Schade Zakelijk	\N	0	\N	currency	EUR	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	objective	\N	{"Productie Dashboard - Schade Zakelijk 2025"}	2025-06-17 18:41:17.144902	2025-06-17 18:41:17.144902	2	-29.138,18 €	-84.496 €
11	Schaderatio – Schade Zakelijk	\N	0	\N	percent	\N	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	objective	\N	{"Productie Dashboard - Schade Zakelijk 2025"}	2025-06-17 18:41:17.144902	2025-06-17 18:41:17.144902	2	19,74 %	22,04 %
12	Schadelast Jaar	\N	0	\N	currency	EUR	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	objective	\N	{"Productie Dashboard - Schade Zakelijk 2025"}	2025-06-17 18:41:17.144902	2025-06-17 18:41:17.144902	2	60.128,83 €	145.504 €
13	Schadefrequentie	\N	0	\N	percent	\N	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	objective	\N	{"Productie Dashboard - Schade Zakelijk 2025"}	2025-06-17 18:41:17.144902	2025-06-17 18:41:17.144902	2	5,36 %	6,01 %
14	Aantal Unieke Proefberekeningen – Schade Zakelijk	\N	0	\N	number	\N	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	objective	\N	{"Werk in Uitvoering - Schade Zakelijk 2025"}	2025-06-17 18:45:36.577108	2025-06-17 18:45:36.577108	2	32 #	84 #
15	Premie Unieke Offertes – Schade Zakelijk	\N	0	\N	currency	EUR	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	objective	\N	{"Werk in Uitvoering - Schade Zakelijk 2025"}	2025-06-17 18:45:36.577108	2025-06-17 18:45:36.577108	2	139.508 €	1.251.644 €
16	Aantal Unieke Offertes – Schade Zakelijk	\N	0	\N	number	\N	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	objective	\N	{"Werk in Uitvoering - Schade Zakelijk 2025"}	2025-06-17 18:49:07.642177	2025-06-17 18:49:07.642177	2	32 #	109 #
17	Conversieratio – Schade Zakelijk	\N	0	\N	percent	\N	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	objective	\N	{"Werk in Uitvoering - Schade Zakelijk 2025"}	2025-06-17 18:49:07.642177	2025-06-17 18:49:07.642177	2	47,65 %	11,64 %
18	Verbeterpunten	\N	0	\N	traffic_light	\N	\N	\N	{}	\N	{}	\N	\N	none	\N	\N	f	f	t	objective	\N	{"Werk in Uitvoering - Schade Zakelijk 2025"}	2025-06-17 18:49:07.642177	2025-06-17 18:49:07.642177	2	\N	\N
\.


--
-- Data for Name: okr_tags; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.okr_tags (id, name, color, created_at, updated_at) FROM stdin;
1	Revenue	#10B981	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785
2	Customer Satisfaction	#3B82F6	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785
3	Market Expansion	#8B5CF6	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785
4	Operational Efficiency	#F59E0B	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785
5	Risk Management	#EF4444	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785
\.


--
-- Data for Name: okr_template_assignments; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.okr_template_assignments (id, template_id, entity_type, entity_id, assigned_at, assigned_by, status, due_date, responsible_user_id, notes) FROM stdin;
1	1	customer	1	2025-06-05 14:14:00.171067	1	active	\N	\N	\N
2	2	customer	2	2025-06-05 14:14:00.171067	1	active	\N	\N	\N
3	3	partner	1	2025-06-05 14:14:00.171067	1	active	\N	\N	\N
4	4	partner	2	2025-06-05 14:14:00.171067	1	active	\N	\N	\N
5	5	customer	3	2025-06-05 14:14:00.171067	1	active	\N	\N	\N
6	3	partner	4	2025-06-09 15:13:06.308587	1	active	\N	\N	\N
7	6	partner	12	2025-06-17 18:25:46.521267	2	active	\N	\N	YTD/Last Year comparison OKR for Schade Zakelijk portfolio
8	7	partner	12	2025-06-17 18:25:46.521267	2	active	\N	\N	YTD/Last Year comparison OKR for Schade Zakelijk new production
9	9	partner	12	2025-06-17 18:42:12.196445	2	active	\N	\N	\N
10	10	partner	12	2025-06-17 18:42:12.196445	2	active	\N	\N	\N
11	11	partner	12	2025-06-17 18:42:12.196445	2	active	\N	\N	\N
12	12	partner	12	2025-06-17 18:42:12.196445	2	active	\N	\N	\N
13	13	partner	12	2025-06-17 18:42:12.196445	2	active	\N	\N	\N
14	14	partner	12	2025-06-17 18:45:52.487217	2	active	\N	\N	\N
15	15	partner	12	2025-06-17 18:45:52.487217	2	active	\N	\N	\N
16	16	partner	12	2025-06-17 18:49:21.107042	2	active	\N	\N	\N
17	17	partner	12	2025-06-17 18:49:21.107042	2	active	\N	\N	\N
18	18	partner	12	2025-06-17 18:49:21.107042	2	active	\N	\N	\N
19	5	partner	1	2025-07-04 13:34:28.546004	1	active	\N	\N	Assigned from Partners page
20	2	partner	26	2025-07-16 20:13:02.370208	1	active	\N	\N	Assigned from Goals-OKR Metrics page to Induver for partner goal tracking
21	1	partner	26	2025-07-17 07:24:51.683661	1	active	\N	\N	Assigned from Partners page
22	2	partner	26	2025-07-17 07:24:51.767212	1	active	\N	\N	Assigned from Partners page
23	3	partner	26	2025-07-17 07:24:51.841427	1	active	\N	\N	Assigned from Partners page
24	4	partner	26	2025-07-17 07:24:51.915676	1	active	\N	\N	Assigned from Partners page
25	5	partner	26	2025-07-17 07:24:51.989912	1	active	\N	\N	Assigned from Partners page
26	6	partner	26	2025-07-17 07:24:52.064414	1	active	\N	\N	Assigned from Partners page
27	9	partner	26	2025-07-17 07:24:52.138597	1	active	\N	\N	Assigned from Partners page
28	10	partner	26	2025-07-17 07:24:52.212903	1	active	\N	\N	Assigned from Partners page
29	11	partner	26	2025-07-17 07:24:52.287233	1	active	\N	\N	Assigned from Partners page
30	12	partner	26	2025-07-17 07:24:52.36128	1	active	\N	\N	Assigned from Partners page
31	13	partner	26	2025-07-17 07:24:52.434441	1	active	\N	\N	Assigned from Partners page
32	14	partner	26	2025-07-17 07:24:52.509086	1	active	\N	\N	Assigned from Partners page
33	15	partner	26	2025-07-17 07:24:52.583194	1	active	\N	\N	Assigned from Partners page
34	16	partner	26	2025-07-17 07:24:52.657358	1	active	\N	\N	Assigned from Partners page
35	17	partner	26	2025-07-17 07:24:52.730708	1	active	\N	\N	Assigned from Partners page
36	18	partner	26	2025-07-17 07:24:52.804808	1	active	\N	\N	Assigned from Partners page
\.


--
-- Data for Name: opportunities; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.opportunities (id, client_id, product_id, probability, estimated_value, title, status, stage, type, description, notes, expected_close_date, created_at, updated_at, partner_id, owner_id, "estimatedValue", "expectedCloseDate", "clientId", "partnerId", "productId", "ownerId", "createdAt", "updatedAt", start_date, account_manager_id, insurance_description, assessment_status, assessment_date, assessed_by_id, withhold_reasons, withhold_comments, assessment_notes, interaction_count) FROM stdin;
291	133	13	25	42463	Zonnepanelen onbekend	prospect	\N	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:35.457128	2025-06-16 23:09:35.457128	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:35.457128	2025-06-16 23:09:35.457128	\N	\N	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
278	123	13	0	30927	Zonnepanelen onbekend	prospect	Rejected	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:32.868207	2025-06-16 23:09:32.868207	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:32.868207	2025-06-16 23:09:32.868207	\N	\N	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
169	61	1	0	75926	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:53.79688	2025-07-20 13:28:07.225174	26	\N	\N	\N	61	12	\N	\N	2025-06-16 20:56:53.79688	2025-06-16 21:58:34.017227	2018-11-01 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	withheld	2025-07-20 13:28:07.225174	4	{"Resource constraints","Existing client relationship conflicts"}	Not a good fit at this time		1
263	111	13	0	38299	Zonnepanelen onbekend	prospect	Rejected	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:30.4772	2025-06-16 23:09:30.4772	19	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:30.4772	2025-06-16 23:09:30.4772	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
287	129	13	0	27953	Zonnepanelen onbekend	prospect	Rejected	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:34.595654	2025-06-16 23:09:34.595654	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:34.595654	2025-06-16 23:09:34.595654	\N	\N	Bedrijfsgebouwen Horeca	pending	\N	\N	\N	\N	\N	0
144	45	1	0	24537	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:51.911664	2025-06-16 20:56:51.911664	7	\N	\N	\N	45	7	\N	\N	2025-06-16 20:56:51.911664	2025-06-16 21:58:34.017227	2018-03-01 00:00:00	4	Bedrijfsgebouwen Verhuur onroerend goed	pending	\N	\N	\N	\N	\N	0
154	25	1	0	52158	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:52.665316	2025-06-16 20:56:52.665316	12	\N	\N	\N	25	12	\N	\N	2025-06-16 20:56:52.665316	2025-06-16 21:58:34.017227	2019-05-07 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
138	41	1	0	26475	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:51.459759	2025-06-16 20:56:51.459759	17	\N	\N	\N	41	17	\N	\N	2025-06-16 20:56:51.459759	2025-06-16 21:58:34.017227	2024-04-01 00:00:00	4	Bedrijfsgebouwen Verhuur onroerend goed	pending	\N	\N	\N	\N	\N	0
293	135	13	0	48290	Zonnepanelen onbekend	prospect	Rejected	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:35.890686	2025-06-16 23:09:35.890686	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:35.890686	2025-06-16 23:09:35.890686	\N	\N	Bedrijfsgebouwen Detailhandel	pending	\N	\N	\N	\N	\N	0
292	134	13	0	33413	Zonnepanelen onbekend	prospect	Rejected	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:35.673914	2025-06-16 23:09:35.673914	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:35.673914	2025-06-16 23:09:35.673914	\N	\N	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
1	1	1	75	500000	ABC Property Portfolio Renewal	active	discovery	renewal	Annual renewal of commercial property portfolio	Client very satisfied with current coverage	\N	2025-06-05 13:59:18.048785	2025-06-17 13:43:38.960384	4	\N	500000	\N	1	9	1	\N	2025-06-05 13:59:18.048785	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
7	1	1	65	75000	Commercial Property Coverage Expansion	Active	proposal	New Business	Expanding property insurance coverage for real estate portfolio	\N	2025-08-15 00:00:00	2025-06-06 12:39:22.128239	2025-06-17 13:44:52.104504	4	\N	\N	\N	87	14	\N	\N	2025-06-06 12:39:22.128239	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
160	53	1	0	76161	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:53.117386	2025-06-16 20:56:53.117386	12	\N	\N	\N	53	12	\N	\N	2025-06-16 20:56:53.117386	2025-06-16 21:58:34.017227	2017-09-01 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
151	51	1	0	31647	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:52.438292	2025-06-16 20:56:52.438292	9	\N	\N	\N	51	9	\N	\N	2025-06-16 20:56:52.438292	2025-06-16 21:58:34.017227	2023-12-13 00:00:00	4	Inventaris/Goederen Detailhand	pending	\N	\N	\N	\N	\N	0
220	105	1	30	24109	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:57.752191	2025-06-16 20:56:57.752191	10	\N	\N	\N	105	10	\N	\N	2025-06-16 20:56:57.752191	2025-06-16 21:58:34.017227	2017-05-01 00:00:00	5	Bedrijfsgebouwen Bouwnijverhei	pending	\N	\N	\N	\N	\N	0
222	107	1	30	64472	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:57.90221	2025-06-16 20:56:57.90221	10	\N	\N	\N	107	10	\N	\N	2025-06-16 20:56:57.90221	2025-06-16 21:58:34.017227	2018-01-05 00:00:00	5	Bedrijfsgebouwen Zakelijke Dienstverlening	pending	\N	\N	\N	\N	\N	0
2	1	3	60	100000	ABC Cyber Security Enhancement	active	\N	new	New cyber insurance to complement existing coverage	Recent security audit revealed gaps	\N	2025-06-05 13:59:18.048785	2025-06-12 07:45:01.455607	4	\N	100000	\N	1	2	3	\N	2025-06-05 13:59:18.048785	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
3	2	2	85	250000	Quick Insurance Liability Expansion	active	Validated	expansion	Expanding liability coverage for new business lines	Client expanding into new markets	\N	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	4	\N	250000	\N	2	11	2	\N	2025-06-05 13:59:18.048785	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
4	3	4	45	150000	Premium Fleet Insurance	active	\N	new	Commercial auto coverage for executive fleet	Luxury vehicle fleet needs specialized coverage	\N	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	4	\N	150000	\N	3	15	4	\N	2025-06-05 13:59:18.048785	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
5	4	5	70	300000	Regional Workers Comp Program	active	Proposal Sent to Client	new	Multi-state workers compensation program	Standardizing coverage across all locations	\N	2025-06-05 13:59:18.048785	2025-06-05 13:59:18.048785	4	\N	300000	\N	4	14	5	\N	2025-06-05 13:59:18.048785	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
8	2	2	75	45000	Restaurant Liability Protection	Active	Validated	Cross-sell	Enhanced liability coverage for food service operations	\N	2025-07-30 00:00:00	2025-06-06 12:39:22.128239	2025-06-06 12:39:22.128239	4	\N	\N	\N	53	5	\N	\N	2025-06-06 12:39:22.128239	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
9	3	3	40	35000	Seafood Business Cyber Security	Active	\N	New Business	Cyber insurance package for seafood distribution company	\N	2025-09-10 00:00:00	2025-06-06 12:39:22.128239	2025-06-06 12:39:22.128239	4	\N	\N	\N	40	1	\N	\N	2025-06-06 12:39:22.128239	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
10	4	2	60	85000	International Trade Liability	Active	Proposal Sent to Client	Upsell	Professional liability coverage for international business operations	\N	2025-08-25 00:00:00	2025-06-06 12:39:22.128239	2025-06-06 12:39:22.128239	4	\N	\N	\N	100	10	\N	\N	2025-06-06 12:39:22.128239	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
175	65	1	60	38266	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:54.251202	2025-07-28 08:16:13.741142	1	\N	\N	\N	65	12	\N	\N	2025-06-16 20:56:54.251202	2025-06-16 21:58:34.017227	2019-05-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
266	112	13	25	75079	Zonnepanelen onbekend	prospect	\N	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:30.91088	2025-06-16 23:09:30.91088	20	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:30.91088	2025-06-16 23:09:30.91088	\N	\N	Bedrijfsgebouwen Bouwnijverhei	pending	\N	\N	\N	\N	\N	0
274	119	13	25	21336	Zonnepanelen onbekend	prospect	\N	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:32.069902	2025-06-16 23:09:32.069902	13	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:32.069902	2025-06-16 23:09:32.069902	\N	\N	Inventaris/Goederen Detailhand	pending	\N	\N	\N	\N	\N	0
268	114	13	25	75606	Zonnepanelen onbekend	prospect	\N	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:31.19801	2025-06-16 23:09:31.19801	21	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:31.19801	2025-06-16 23:09:31.19801	\N	\N	Bedrijfsgebouwen Detailhandel	pending	\N	\N	\N	\N	\N	0
276	121	13	25	36158	Zonnepanelen onbekend	prospect	\N	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:32.435875	2025-06-16 23:09:32.435875	13	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:32.435875	2025-06-16 23:09:32.435875	\N	\N	Inventaris/Goederen Groothand	pending	\N	\N	\N	\N	\N	0
260	111	13	25	47166	Zonnepanelen onbekend	prospect	\N	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:30.041721	2025-06-16 23:09:30.041721	19	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:30.041721	2025-06-16 23:09:30.041721	\N	\N	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
272	117	13	25	61410	Zonnepanelen onbekend	prospect	\N	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:31.777088	2025-06-16 23:09:31.777088	21	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:31.777088	2025-06-16 23:09:31.777088	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
258	109	13	0	31886	Zonnepanelen onbekend	prospect	Rejected	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:29.731412	2025-06-16 23:09:29.731412	18	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:29.731412	2025-06-16 23:09:29.731412	\N	\N	Inventaris/Goederen Zak. Dienstverlening	pending	\N	\N	\N	\N	\N	0
181	71	1	60	30385	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:54.702738	2025-06-16 20:56:54.702738	1	\N	\N	\N	71	12	\N	\N	2025-06-16 20:56:54.702738	2025-06-16 21:58:34.017227	2020-08-01 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
184	74	1	60	24140	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:54.928554	2025-06-16 20:56:54.928554	1	\N	\N	\N	74	12	\N	\N	2025-06-16 20:56:54.928554	2025-06-16 21:58:34.017227	2020-10-13 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
182	72	1	60	47722	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:54.778084	2025-06-16 20:56:54.778084	1	\N	\N	\N	72	12	\N	\N	2025-06-16 20:56:54.778084	2025-06-16 21:58:34.017227	2021-05-31 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
185	74	1	60	53268	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:55.003609	2025-06-16 20:56:55.003609	1	\N	\N	\N	74	12	\N	\N	2025-06-16 20:56:55.003609	2025-06-16 21:58:34.017227	2020-10-13 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
162	54	1	30	74081	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:53.268509	2025-07-20 13:45:45.377297	26	\N	\N	\N	54	12	\N	\N	2025-06-16 20:56:53.268509	2025-06-16 21:58:34.017227	2017-09-04 00:00:00	4	Inventaris/Goederen Metaalbew.	accepted	2025-07-20 13:45:45.377297	1	{}	\N	\N	8
277	122	13	30	53802	Zonnepanelen onbekend	prospect	Validated	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:32.652137	2025-06-16 23:09:32.652137	13	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:32.652137	2025-06-16 23:09:32.652137	\N	\N	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
202	89	1	30	29207	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:56.285362	2025-06-16 20:56:56.285362	12	\N	\N	\N	89	12	\N	\N	2025-06-16 20:56:56.285362	2025-06-16 21:58:34.017227	2023-01-01 00:00:00	4	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
149	49	1	60	50611	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:52.287866	2025-06-16 20:56:52.287866	7	\N	\N	\N	49	7	\N	\N	2025-06-16 20:56:52.287866	2025-06-16 21:58:34.017227	2023-12-18 00:00:00	4	Inventaris/Goederen Pers. Dienstverlening	pending	\N	\N	\N	\N	\N	0
135	21	1	60	27897	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:51.233741	2025-06-16 20:56:51.233741	17	\N	\N	\N	21	17	\N	\N	2025-06-16 20:56:51.233741	2025-06-16 21:58:34.017227	2023-01-01 00:00:00	4	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
299	141	13	60	74123	Zonnepanelen onbekend	prospect	Proposal Sent to Client	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:37.186836	2025-06-16 23:09:37.186836	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:37.186836	2025-06-16 23:09:37.186836	\N	\N	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
264	111	13	60	69148	Zonnepanelen onbekend	prospect	Proposal Sent to Client	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:30.621248	2025-06-16 23:09:30.621248	19	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:30.621248	2025-06-16 23:09:30.621248	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
140	42	1	60	58651	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:51.609832	2025-06-16 20:56:51.609832	17	\N	\N	\N	42	17	\N	\N	2025-06-16 20:56:51.609832	2025-06-16 21:58:34.017227	2024-09-19 00:00:00	4	Bedrijfsgebouwen Verhuur onroerend goed	pending	\N	\N	\N	\N	\N	0
146	46	1	60	49956	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:52.061957	2025-06-16 20:56:52.061957	7	\N	\N	\N	46	7	\N	\N	2025-06-16 20:56:52.061957	2025-06-16 21:58:34.017227	2022-01-26 00:00:00	4	Bedrijfsgebouwen Detailhandel	pending	\N	\N	\N	\N	\N	0
300	141	13	60	39721	Zonnepanelen onbekend	prospect	Proposal Sent to Client	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:37.330351	2025-06-16 23:09:37.330351	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:37.330351	2025-06-16 23:09:37.330351	\N	\N	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
271	116	13	60	45825	Zonnepanelen onbekend	prospect	Proposal Sent to Client	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:31.63052	2025-06-16 23:09:31.63052	21	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:31.63052	2025-06-16 23:09:31.63052	\N	\N	Bedrijfsgebouwen Verhuur onroerend goed	pending	\N	\N	\N	\N	\N	0
221	106	1	60	48961	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:57.827456	2025-06-16 20:56:57.827456	10	\N	\N	\N	106	10	\N	\N	2025-06-16 20:56:57.827456	2025-06-16 21:58:34.017227	2018-02-01 00:00:00	5	Bedrijfsgebouwen Bouwnijverhei	pending	\N	\N	\N	\N	\N	0
286	128	13	60	20931	Zonnepanelen onbekend	prospect	Proposal Sent to Client	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:34.380709	2025-06-16 23:09:34.380709	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:34.380709	2025-06-16 23:09:34.380709	\N	\N	Inventaris/Goederen Bouwnijver	pending	\N	\N	\N	\N	\N	0
285	127	13	60	22964	Zonnepanelen onbekend	prospect	Proposal Sent to Client	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:34.165158	2025-06-16 23:09:34.165158	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:34.165158	2025-06-16 23:09:34.165158	\N	\N	Inventaris/Goederen Groothand	pending	\N	\N	\N	\N	\N	0
142	44	1	60	29365	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:51.760681	2025-06-16 20:56:51.760681	7	\N	\N	\N	44	7	\N	\N	2025-06-16 20:56:51.760681	2025-06-16 21:58:34.017227	2017-11-22 00:00:00	4	Bedrijfsgebouwen Bouwnijverhei	pending	\N	\N	\N	\N	\N	0
134	21	1	60	74004	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:51.158756	2025-06-16 20:56:51.158756	17	\N	\N	\N	21	17	\N	\N	2025-06-16 20:56:51.158756	2025-06-16 21:58:34.017227	2023-01-01 00:00:00	4	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
121	1	1	60	47312	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:50.176932	2025-07-22 12:07:22.288968	13	\N	\N	\N	1	13	\N	\N	2025-06-16 20:56:50.176932	2025-06-16 21:58:34.017227	2019-03-01 00:00:00	4	Inventaris/Goederen Zak. Dienstverlening	accepted	2025-07-22 12:07:22.288968	1	{}	\N	\N	1
172	63	1	30	37611	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:54.023761	2025-07-25 09:49:24.999545	1	\N	\N	\N	63	12	\N	\N	2025-06-16 20:56:54.023761	2025-06-16 21:58:34.017227	2019-03-01 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	accepted	2025-07-25 09:49:24.999545	1	{}	\N	\N	1
168	60	1	30	37982	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:53.720622	2025-06-16 20:56:53.720622	26	\N	\N	\N	60	12	\N	\N	2025-06-16 20:56:53.720622	2025-06-16 21:58:34.017227	2018-06-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
167	59	1	60	33931	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:53.645106	2025-06-16 20:56:53.645106	26	\N	\N	\N	59	12	\N	\N	2025-06-16 20:56:53.645106	2025-06-16 21:58:34.017227	2018-04-01 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
174	64	1	75	56721	Zonnepanelen	Active	proposal	New Business	\N	\N	\N	2025-06-16 20:56:54.175352	2025-06-17 15:42:28.590625	1	\N	\N	\N	64	12	\N	\N	2025-06-16 20:56:54.175352	2025-06-16 21:58:34.017227	2019-03-10 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
176	66	1	0	56623	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:54.325609	2025-06-16 20:56:54.325609	1	\N	\N	\N	66	12	\N	\N	2025-06-16 20:56:54.325609	2025-06-16 21:58:34.017227	2019-12-16 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
180	70	1	0	42446	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:54.627673	2025-06-16 20:56:54.627673	1	\N	\N	\N	70	12	\N	\N	2025-06-16 20:56:54.627673	2025-06-16 21:58:34.017227	2020-05-19 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
178	68	1	0	38113	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:54.476529	2025-06-16 20:56:54.476529	1	\N	\N	\N	68	12	\N	\N	2025-06-16 20:56:54.476529	2025-06-16 21:58:34.017227	2020-06-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
183	73	1	30	42844	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:54.853644	2025-06-16 20:56:54.853644	1	\N	\N	\N	73	12	\N	\N	2025-06-16 20:56:54.853644	2025-06-16 21:58:34.017227	2020-11-15 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
186	75	1	75	29244	Zonnepanelen	Active	\N	New Business	\N	\N	\N	2025-06-16 20:56:55.078594	2025-06-16 20:56:55.078594	12	\N	\N	\N	75	12	\N	\N	2025-06-16 20:56:55.078594	2025-06-16 21:58:34.017227	2020-11-01 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
187	76	1	75	28080	Zonnepanelen	Active	\N	New Business	\N	\N	\N	2025-06-16 20:56:55.15326	2025-06-16 20:56:55.15326	12	\N	\N	\N	76	12	\N	\N	2025-06-16 20:56:55.15326	2025-06-16 21:58:34.017227	2021-04-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
282	125	13	25	41403	Zonnepanelen onbekend	prospect	\N	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:33.589453	2025-06-16 23:09:33.589453	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:33.589453	2025-06-16 23:09:33.589453	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
190	79	1	75	49170	Zonnepanelen	Active	\N	New Business	\N	\N	\N	2025-06-16 20:56:55.385291	2025-06-16 20:56:55.385291	12	\N	\N	\N	79	12	\N	\N	2025-06-16 20:56:55.385291	2025-06-16 21:58:34.017227	2022-01-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
280	125	13	25	68544	Zonnepanelen onbekend	prospect	\N	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:33.300698	2025-06-16 23:09:33.300698	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:33.300698	2025-06-16 23:09:33.300698	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
188	77	1	0	23831	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:55.234371	2025-06-16 20:56:55.234371	12	\N	\N	\N	77	12	\N	\N	2025-06-16 20:56:55.234371	2025-06-16 21:58:34.017227	2021-07-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
275	120	13	30	71962	Zonnepanelen onbekend	prospect	Validated	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:32.215062	2025-06-16 23:09:32.215062	13	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:32.215062	2025-06-16 23:09:32.215062	\N	\N	Bedrijfsgebouwen Verhuur onroerend goed	pending	\N	\N	\N	\N	\N	0
137	23	1	30	62958	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:51.384673	2025-06-16 20:56:51.384673	17	\N	\N	\N	23	17	\N	\N	2025-06-16 20:56:51.384673	2025-06-16 21:58:34.017227	2024-03-14 00:00:00	4	Bedrijfsgebouwen Verhuur onroerend goed	pending	\N	\N	\N	\N	\N	0
279	124	13	30	68572	Zonnepanelen onbekend	prospect	Validated	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:33.084671	2025-06-16 23:09:33.084671	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:33.084671	2025-06-16 23:09:33.084671	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
284	126	13	30	34032	Zonnepanelen onbekend	prospect	Validated	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:33.948453	2025-06-16 23:09:33.948453	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:33.948453	2025-06-16 23:09:33.948453	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
273	118	13	60	63744	Zonnepanelen onbekend	prospect	Proposal Sent to Client	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:31.921421	2025-06-16 23:09:31.921421	13	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:31.921421	2025-06-16 23:09:31.921421	\N	\N	Inventaris/Goederen Detailhand	pending	\N	\N	\N	\N	\N	0
132	19	1	60	41456	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:51.007997	2025-06-16 20:56:51.007997	17	\N	\N	\N	19	17	\N	\N	2025-06-16 20:56:51.007997	2025-06-16 21:58:34.017227	2022-10-01 00:00:00	4	Bedrijfsgebouwen Zakelijke Dienstverlening	pending	\N	\N	\N	\N	\N	0
128	8	1	60	39519	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:50.703696	2025-06-16 20:56:50.703696	17	\N	\N	\N	8	17	\N	\N	2025-06-16 20:56:50.703696	2025-06-16 21:58:34.017227	2019-05-01 00:00:00	4	Inventaris/Goederen Detailhand	pending	\N	\N	\N	\N	\N	0
294	136	13	60	74102	Zonnepanelen onbekend	prospect	Proposal Sent to Client	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:36.107517	2025-06-16 23:09:36.107517	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:36.107517	2025-06-16 23:09:36.107517	\N	\N	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
11	5	3	70	55000	Tech Startup Cyber Protection	Active	Validated	New Business	Comprehensive cyber insurance for technology company	\N	2025-07-15 00:00:00	2025-06-06 12:39:22.128239	2025-06-06 12:39:22.128239	4	\N	\N	\N	87	11	\N	\N	2025-06-06 12:39:22.128239	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
12	7	4	45	65000	Construction Vehicle Fleet	Active	Validated	Cross-sell	Auto insurance for construction company vehicle fleet	\N	2025-10-20 00:00:00	2025-06-06 12:39:22.128239	2025-06-11 23:16:32.326474	4	\N	\N	\N	100	13	\N	\N	2025-06-06 12:39:22.128239	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
13	8	5	55	42000	Carpet Installation Workers Coverage	Active	Proposal Sent to Client	New Business	Workers compensation for carpet installation business	\N	2025-09-05 00:00:00	2025-06-06 12:39:22.128239	2025-06-06 12:39:22.128239	4	\N	\N	\N	95	6	\N	\N	2025-06-06 12:39:22.128239	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
14	9	1	80	95000	Precision Manufacturing Property	Active	Validated	Renewal	Property insurance for specialized manufacturing facility	\N	2025-08-01 00:00:00	2025-06-06 12:39:22.128239	2025-06-06 12:39:22.128239	4	\N	\N	\N	97	14	\N	\N	2025-06-06 12:39:22.128239	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
15	1	1	50	120000	Multi-Location Property Portfolio	Active	\N	Upsell	Comprehensive property coverage for multiple business locations	\N	2025-11-30 00:00:00	2025-06-06 12:39:22.128239	2025-06-06 12:39:22.128239	4	\N	\N	\N	56	2	\N	\N	2025-06-06 12:39:22.128239	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
16	5	2	65	68000	Technology Business Liability Suite	Active	Proposal Sent to Client	Cross-sell	Complete liability package for technology services company	\N	2025-09-20 00:00:00	2025-06-06 12:39:22.128239	2025-06-06 12:39:22.128239	4	\N	\N	\N	106	14	\N	\N	2025-06-06 12:39:22.128239	2025-06-16 21:58:34.017227	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
133	20	1	75	57165	Zonnepanelen	Active	\N	New Business	\N	\N	\N	2025-06-16 20:56:51.083729	2025-06-16 20:56:51.083729	17	\N	\N	\N	20	17	\N	\N	2025-06-16 20:56:51.083729	2025-06-16 21:58:34.017227	2022-11-19 00:00:00	4	Bedrijfsgebouwen Groothandel	pending	\N	\N	\N	\N	\N	0
127	7	1	75	67303	Zonnepanelen	Active	\N	New Business	\N	\N	\N	2025-06-16 20:56:50.628557	2025-06-16 20:56:50.628557	17	\N	\N	\N	7	17	\N	\N	2025-06-16 20:56:50.628557	2025-06-16 21:58:34.017227	2015-02-13 00:00:00	4	Inventaris/Goederen Bouwnijver	pending	\N	\N	\N	\N	\N	0
126	5	1	0	65173	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:50.553548	2025-06-16 20:56:50.553548	13	\N	\N	\N	5	13	\N	\N	2025-06-16 20:56:50.553548	2025-06-16 21:58:34.017227	2024-11-11 00:00:00	4	Inventaris/Goederen Zak. Dienstverlening	pending	\N	\N	\N	\N	\N	0
122	2	1	0	53755	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:50.253198	2025-06-16 20:56:50.253198	13	\N	\N	\N	2	13	\N	\N	2025-06-16 20:56:50.253198	2025-06-16 21:58:34.017227	2020-09-25 00:00:00	4	Inventaris/Goederen Horeca	pending	\N	\N	\N	\N	\N	0
124	3	1	0	69850	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:50.402945	2025-06-16 20:56:50.402945	13	\N	\N	\N	3	13	\N	\N	2025-06-16 20:56:50.402945	2025-06-16 21:58:34.017227	2021-07-01 00:00:00	4	Bedrijfsgebouwen Groothandel	pending	\N	\N	\N	\N	\N	0
123	3	1	0	54153	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:50.327993	2025-06-16 20:56:50.327993	13	\N	\N	\N	3	13	\N	\N	2025-06-16 20:56:50.327993	2025-06-16 21:58:34.017227	2021-07-01 00:00:00	4	Inventaris/Goederen Groothand	pending	\N	\N	\N	\N	\N	0
129	9	1	0	71618	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:50.779479	2025-06-16 20:56:50.779479	17	\N	\N	\N	9	17	\N	\N	2025-06-16 20:56:50.779479	2025-06-16 21:58:34.017227	2022-12-19 00:00:00	4	Bedrijfsgebouwen Productie	pending	\N	\N	\N	\N	\N	0
125	4	1	30	41451	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:50.478039	2025-06-16 20:56:50.478039	13	\N	\N	\N	4	13	\N	\N	2025-06-16 20:56:50.478039	2025-06-16 21:58:34.017227	2023-09-01 00:00:00	4	Bedrijfsgebouwen Zakelijke Dienstverlening	pending	\N	\N	\N	\N	\N	0
298	140	13	30	55766	Zonnepanelen onbekend	prospect	Validated	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:36.971447	2025-06-16 23:09:36.971447	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:36.971447	2025-06-16 23:09:36.971447	\N	\N	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
147	47	1	30	51115	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:52.137641	2025-06-16 20:56:52.137641	7	\N	\N	\N	47	7	\N	\N	2025-06-16 20:56:52.137641	2025-06-16 21:58:34.017227	2019-06-01 00:00:00	4	Bedrijfsgebouwen Detailhandel	pending	\N	\N	\N	\N	\N	0
148	48	1	30	78444	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:52.212824	2025-06-16 20:56:52.212824	7	\N	\N	\N	48	7	\N	\N	2025-06-16 20:56:52.212824	2025-06-16 21:58:34.017227	2019-10-11 00:00:00	4	Bedrijfsgebouwen Horeca	pending	\N	\N	\N	\N	\N	0
136	22	1	30	46518	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:51.308728	2025-06-16 20:56:51.308728	17	\N	\N	\N	22	17	\N	\N	2025-06-16 20:56:51.308728	2025-06-16 21:58:34.017227	2023-01-01 00:00:00	4	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
143	44	1	30	74622	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:51.836708	2025-06-16 20:56:51.836708	7	\N	\N	\N	44	7	\N	\N	2025-06-16 20:56:51.836708	2025-06-16 21:58:34.017227	2018-06-21 00:00:00	4	Inventaris/Goederen Bouwnijver	pending	\N	\N	\N	\N	\N	0
155	26	1	30	32571	Zonnepanelen	Active	qualification	New Business	\N	\N	\N	2025-06-16 20:56:52.740373	2025-06-18 11:17:41.500644	12	\N	\N	\N	26	12	\N	\N	2025-06-16 20:56:52.740373	2025-06-16 21:58:34.017227	2016-10-12 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
164	56	1	30	32036	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:53.418946	2025-06-16 20:56:53.418946	26	\N	\N	\N	56	12	\N	\N	2025-06-16 20:56:53.418946	2025-06-16 21:58:34.017227	2018-01-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
166	58	1	30	62229	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:53.569808	2025-06-16 20:56:53.569808	26	\N	\N	\N	58	12	\N	\N	2025-06-16 20:56:53.569808	2025-06-16 21:58:34.017227	2018-04-01 00:00:00	4	Inventaris/Goederen Bouwnijver	pending	\N	\N	\N	\N	\N	0
209	95	1	0	68382	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:56.878585	2025-06-16 20:56:56.878585	12	\N	\N	\N	95	12	\N	\N	2025-06-16 20:56:56.878585	2025-06-16 21:58:34.017227	2023-12-07 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
208	94	1	0	70457	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:56.803811	2025-06-16 20:56:56.803811	12	\N	\N	\N	94	12	\N	\N	2025-06-16 20:56:56.803811	2025-06-16 21:58:34.017227	2023-07-01 00:00:00	4	Bedrijfsgebouwen Zakelijke Dienstverlening	pending	\N	\N	\N	\N	\N	0
217	102	1	30	28475	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:57.524859	2025-06-16 20:56:57.524859	16	\N	\N	\N	102	16	\N	\N	2025-06-16 20:56:57.524859	2025-06-16 21:58:34.017227	2024-11-14 00:00:00	5	Bedrijfsgebouwen Verhuur onroerend goed	pending	\N	\N	\N	\N	\N	0
210	96	1	30	67737	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:56.956325	2025-06-16 20:56:56.956325	12	\N	\N	\N	96	12	\N	\N	2025-06-16 20:56:56.956325	2025-06-16 21:58:34.017227	2024-04-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
216	101	1	30	40517	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:57.449624	2025-06-16 20:56:57.449624	8	\N	\N	\N	101	8	\N	\N	2025-06-16 20:56:57.449624	2025-06-16 21:58:34.017227	2020-11-18 00:00:00	5	Bedrijfsgebouwen Horeca	pending	\N	\N	\N	\N	\N	0
211	97	1	30	45297	Zonnepanelen	Active	Closed (Won)	New Business	\N	\N	\N	2025-06-16 20:56:57.031256	2025-07-01 15:46:27.028153	6	\N	\N	\N	97	6	\N	\N	2025-06-16 20:56:57.031256	2025-06-16 21:58:34.017227	2023-02-01 00:00:00	4	Inventaris/Goederen Bouwnijver	pending	\N	\N	\N	\N	\N	0
179	69	1	30	20407	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:54.552247	2025-06-16 20:56:54.552247	1	\N	\N	\N	69	12	\N	\N	2025-06-16 20:56:54.552247	2025-06-16 21:58:34.017227	2020-05-11 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
177	67	1	30	54991	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:54.400952	2025-06-16 20:56:54.400952	1	\N	\N	\N	67	12	\N	\N	2025-06-16 20:56:54.400952	2025-06-16 21:58:34.017227	2023-10-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
206	92	1	30	42336	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:56.652374	2025-06-16 20:56:56.652374	12	\N	\N	\N	92	12	\N	\N	2025-06-16 20:56:56.652374	2025-06-16 21:58:34.017227	2023-01-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
215	100	1	30	76384	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:57.37508	2025-06-16 20:56:57.37508	8	\N	\N	\N	100	8	\N	\N	2025-06-16 20:56:57.37508	2025-06-16 21:58:34.017227	2024-05-31 00:00:00	5	Inventaris/Goederen Pers. Dienstverlening	pending	\N	\N	\N	\N	\N	0
205	91	1	30	76895	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:56.57747	2025-06-16 20:56:56.57747	12	\N	\N	\N	91	12	\N	\N	2025-06-16 20:56:56.57747	2025-06-16 21:58:34.017227	2022-12-15 00:00:00	4	Bedrijfsgebouwen Bouwnijverhei	pending	\N	\N	\N	\N	\N	0
203	90	1	30	42127	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:56.360593	2025-06-16 20:56:56.360593	12	\N	\N	\N	90	12	\N	\N	2025-06-16 20:56:56.360593	2025-06-16 21:58:34.017227	2023-01-01 00:00:00	4	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
290	132	13	30	54389	Zonnepanelen onbekend	prospect	Validated	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:35.241464	2025-06-16 23:09:35.241464	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:35.241464	2025-06-16 23:09:35.241464	\N	\N	Inventaris/Goederen Bouwnijver	pending	\N	\N	\N	\N	\N	0
139	42	1	30	53149	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:51.534678	2025-06-16 20:56:51.534678	17	\N	\N	\N	42	17	\N	\N	2025-06-16 20:56:51.534678	2025-06-16 21:58:34.017227	2024-07-05 00:00:00	4	Bedrijfsgebouwen Verhuur onroerend goed	pending	\N	\N	\N	\N	\N	0
212	98	1	30	62583	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:57.106706	2025-06-16 20:56:57.106706	11	\N	\N	\N	98	11	\N	\N	2025-06-16 20:56:57.106706	2025-06-16 21:58:34.017227	2022-07-22 00:00:00	4	Bedrijfsgebouwen Bouwnijverhei	pending	\N	\N	\N	\N	\N	0
189	78	1	30	66684	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:55.309531	2025-06-16 20:56:55.309531	12	\N	\N	\N	78	12	\N	\N	2025-06-16 20:56:55.309531	2025-06-16 21:58:34.017227	2021-08-27 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
150	50	1	30	31019	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:52.363002	2025-06-16 20:56:52.363002	9	\N	\N	\N	50	9	\N	\N	2025-06-16 20:56:52.363002	2025-06-16 21:58:34.017227	2019-01-01 00:00:00	4	Inventaris/Goederen Groothand	pending	\N	\N	\N	\N	\N	0
171	62	1	60	73145	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:53.946424	2025-06-16 20:56:53.946424	26	\N	\N	\N	62	12	\N	\N	2025-06-16 20:56:53.946424	2025-06-16 21:58:34.017227	2018-10-17 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
159	29	1	60	41807	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:53.041967	2025-06-16 20:56:53.041967	12	\N	\N	\N	29	12	\N	\N	2025-06-16 20:56:53.041967	2025-06-16 21:58:34.017227	2017-04-01 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
214	99	1	60	41127	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:57.300203	2025-06-16 20:56:57.300203	11	\N	\N	\N	99	11	\N	\N	2025-06-16 20:56:57.300203	2025-06-16 21:58:34.017227	2022-07-22 00:00:00	4	Bedrijfsgebouwen Bouwnijverhei	pending	\N	\N	\N	\N	\N	0
288	130	13	60	23513	Zonnepanelen onbekend	prospect	Proposal Sent to Client	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:34.81142	2025-06-16 23:09:34.81142	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:34.81142	2025-06-16 23:09:34.81142	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
267	113	13	60	27761	Zonnepanelen onbekend	prospect	Proposal Sent to Client	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:31.054387	2025-06-16 23:09:31.054387	20	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:31.054387	2025-06-16 23:09:31.054387	\N	\N	Inventaris/Goederen Bouwnijver	pending	\N	\N	\N	\N	\N	0
283	22	13	60	75264	Zonnepanelen onbekend	prospect	Proposal Sent to Client	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:33.733204	2025-06-16 23:09:33.733204	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:33.733204	2025-06-16 23:09:33.733204	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
204	90	1	60	31500	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:56.435549	2025-06-16 20:56:56.435549	12	\N	\N	\N	90	12	\N	\N	2025-06-16 20:56:56.435549	2025-06-16 21:58:34.017227	2023-01-01 00:00:00	4	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
157	28	1	100	29676	Zonnepanelen	Active	Closed (Won)	New Business	\N	\N	\N	2025-06-16 20:56:52.890656	2025-06-16 20:56:52.890656	12	\N	\N	\N	28	12	\N	\N	2025-06-16 20:56:52.890656	2025-06-16 21:58:34.017227	2017-03-01 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
161	53	1	100	67600	Zonnepanelen	Active	Closed (Won)	New Business	\N	\N	\N	2025-06-16 20:56:53.193146	2025-06-16 20:56:53.193146	12	\N	\N	\N	53	12	\N	\N	2025-06-16 20:56:53.193146	2025-06-16 21:58:34.017227	2017-09-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
141	43	1	100	49321	Zonnepanelen	Active	Closed (Won)	New Business	\N	\N	\N	2025-06-16 20:56:51.685908	2025-06-16 20:56:51.685908	17	\N	\N	\N	43	17	\N	\N	2025-06-16 20:56:51.685908	2025-06-16 21:58:34.017227	2025-01-01 00:00:00	4	Bedrijfsgebouwen Verhuur onroerend goed	pending	\N	\N	\N	\N	\N	0
259	110	13	100	54155	Zonnepanelen onbekend	prospect	Closed (Won)	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:29.89771	2025-06-16 23:09:29.89771	18	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:29.89771	2025-06-16 23:09:29.89771	\N	\N	Bedrijfsgebouwen Verhuur onroerend goed	pending	\N	\N	\N	\N	\N	0
153	24	1	100	22283	Zonnepanelen	Active	closed_lost	New Business	\N	\N	\N	2025-06-16 20:56:52.58846	2025-07-14 11:10:05.522338	12	\N	\N	\N	24	12	\N	\N	2025-06-16 20:56:52.58846	2025-06-16 21:58:34.017227	2019-11-01 00:00:00	4	Bedrijfsgebouwen Bouwnijverhei	pending	\N	\N	\N	\N	\N	0
170	61	1	100	44400	Zonnepanelen	Active	Closed (Won)	New Business	\N	\N	\N	2025-06-16 20:56:53.872081	2025-06-16 20:56:53.872081	26	\N	\N	\N	61	12	\N	\N	2025-06-16 20:56:53.872081	2025-06-16 21:58:34.017227	2018-11-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
152	52	1	100	46906	Zonnepanelen	Active	proposal	New Business	\N	\N	\N	2025-06-16 20:56:52.513164	2025-07-14 11:10:02.433504	12	\N	\N	\N	52	12	\N	\N	2025-06-16 20:56:52.513164	2025-06-16 21:58:34.017227	2013-11-19 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
165	57	1	0	47666	Zonnepanelen	Active	Lost	New Business	\N	\N	\N	2025-06-16 20:56:53.494581	2025-06-16 20:56:53.494581	26	\N	\N	\N	57	12	\N	\N	2025-06-16 20:56:53.494581	2025-06-16 21:58:34.017227	2018-01-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
173	63	1	0	65902	Zonnepanelen	Active	Lost	New Business	\N	\N	\N	2025-06-16 20:56:54.09982	2025-07-28 08:13:39.62323	1	\N	\N	\N	63	12	\N	\N	2025-06-16 20:56:54.09982	2025-06-16 21:58:34.017227	2019-03-01 00:00:00	4	Inventaris/Goederen Metaalbew.	withheld	2025-07-28 08:13:39.62323	1	{"Poor timing"}	somethinh		1
158	28	1	100	51264	Zonnepanelen	Active	Closed (Won)	New Business	\N	\N	\N	2025-06-16 20:56:52.967188	2025-06-16 20:56:52.967188	12	\N	\N	\N	28	12	\N	\N	2025-06-16 20:56:52.967188	2025-06-16 21:58:34.017227	2017-03-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
145	46	1	100	33037	Zonnepanelen	Active	Closed (Won)	New Business	\N	\N	\N	2025-06-16 20:56:51.986948	2025-06-16 20:56:51.986948	7	\N	\N	\N	46	7	\N	\N	2025-06-16 20:56:51.986948	2025-06-16 21:58:34.017227	2022-01-26 00:00:00	4	Inventaris/Goederen Detailhand	pending	\N	\N	\N	\N	\N	0
198	85	1	75	49592	Zonnepanelen	Active	\N	New Business	\N	\N	\N	2025-06-16 20:56:55.985623	2025-06-16 20:56:55.985623	12	\N	\N	\N	85	12	\N	\N	2025-06-16 20:56:55.985623	2025-06-16 21:58:34.017227	2022-11-10 00:00:00	4	Bedrijfsgebouwen Bouwnijverhei	pending	\N	\N	\N	\N	\N	0
201	88	1	0	53781	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:56.210316	2025-06-16 20:56:56.210316	12	\N	\N	\N	88	12	\N	\N	2025-06-16 20:56:56.210316	2025-06-16 21:58:34.017227	2023-01-01 00:00:00	4	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
219	104	1	60	33407	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:57.67652	2025-06-16 20:56:57.67652	15	\N	\N	\N	104	15	\N	\N	2025-06-16 20:56:57.67652	2025-06-16 21:58:34.017227	2023-01-01 00:00:00	5	Bedrijfsgebouwen Horeca	pending	\N	\N	\N	\N	\N	0
199	86	1	60	41833	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:56.060498	2025-06-16 20:56:56.060498	12	\N	\N	\N	86	12	\N	\N	2025-06-16 20:56:56.060498	2025-06-16 21:58:34.017227	2022-11-17 00:00:00	4	Inventaris/Goederen Groothand	pending	\N	\N	\N	\N	\N	0
297	139	13	100	66791	Zonnepanelen onbekend	prospect	Closed (Won)	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:36.754773	2025-06-16 23:09:36.754773	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:36.754773	2025-06-16 23:09:36.754773	\N	\N	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
281	125	13	100	45997	Zonnepanelen onbekend	prospect	Closed (Won)	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:33.444819	2025-06-16 23:09:33.444819	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:33.444819	2025-06-16 23:09:33.444819	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
156	27	1	100	37442	Zonnepanelen	Active	Closed (Won)	New Business	\N	\N	\N	2025-06-16 20:56:52.815892	2025-06-16 20:56:52.815892	12	\N	\N	\N	27	12	\N	\N	2025-06-16 20:56:52.815892	2025-06-16 21:58:34.017227	2017-02-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
289	131	13	100	76306	Zonnepanelen onbekend	prospect	Closed (Won)	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:35.026431	2025-06-16 23:09:35.026431	17	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:35.026431	2025-06-16 23:09:35.026431	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
269	114	13	100	22699	Zonnepanelen onbekend	prospect	Closed (Won)	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:31.342769	2025-06-16 23:09:31.342769	21	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:31.342769	2025-06-16 23:09:31.342769	\N	\N	Bedrijfsgebouwen Detailhandel	pending	\N	\N	\N	\N	\N	0
270	115	13	100	54298	Zonnepanelen onbekend	prospect	Closed (Won)	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:31.487009	2025-06-16 23:09:31.487009	21	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:31.487009	2025-06-16 23:09:31.487009	\N	\N	Bedrijfsgebouwen	pending	\N	\N	\N	\N	\N	0
296	138	13	100	53427	Zonnepanelen onbekend	prospect	Closed (Won)	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:36.53943	2025-06-16 23:09:36.53943	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:36.53943	2025-06-16 23:09:36.53943	\N	\N	Inventaris/Goederen Detailhand	pending	\N	\N	\N	\N	\N	0
301	142	13	0	67323	Zonnepanelen onbekend	prospect	Lost	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:37.553185	2025-06-16 23:09:37.553185	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:37.553185	2025-06-16 23:09:37.553185	\N	\N	Inventaris/Goederen Detailhand	pending	\N	\N	\N	\N	\N	0
295	137	13	0	50528	Zonnepanelen onbekend	prospect	Lost	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:36.323427	2025-06-16 23:09:36.323427	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:36.323427	2025-06-16 23:09:36.323427	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
213	99	1	0	30234	Zonnepanelen	Active	Lost	New Business	\N	\N	\N	2025-06-16 20:56:57.181739	2025-06-16 20:56:57.181739	11	\N	\N	\N	99	11	\N	\N	2025-06-16 20:56:57.181739	2025-06-16 21:58:34.017227	2022-07-22 00:00:00	4	Bedrijfsgebouwen Bouwnijverhei	pending	\N	\N	\N	\N	\N	0
265	112	13	0	28334	Zonnepanelen onbekend	prospect	Lost	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:30.765074	2025-06-16 23:09:30.765074	20	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:30.765074	2025-06-16 23:09:30.765074	\N	\N	Inventaris/Goederen Bouwnijver	pending	\N	\N	\N	\N	\N	0
218	103	1	0	29159	Zonnepanelen	Active	Lost	New Business	\N	\N	\N	2025-06-16 20:56:57.600698	2025-06-16 20:56:57.600698	15	\N	\N	\N	103	15	\N	\N	2025-06-16 20:56:57.600698	2025-06-16 21:58:34.017227	2020-10-14 00:00:00	5	Inventaris/Goederen Bouwnijver	pending	\N	\N	\N	\N	\N	0
200	87	1	0	45526	Zonnepanelen	Active	Lost	New Business	\N	\N	\N	2025-06-16 20:56:56.135173	2025-06-16 20:56:56.135173	12	\N	\N	\N	87	12	\N	\N	2025-06-16 20:56:56.135173	2025-06-16 21:58:34.017227	2023-01-01 00:00:00	4	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
207	93	1	0	42978	Zonnepanelen	Active	Lost	New Business	\N	\N	\N	2025-06-16 20:56:56.72814	2025-06-16 20:56:56.72814	12	\N	\N	\N	93	12	\N	\N	2025-06-16 20:56:56.72814	2025-06-16 21:58:34.017227	2023-05-01 00:00:00	4	Inventaris/Goederen Metaalbew.	pending	\N	\N	\N	\N	\N	0
262	111	13	0	53445	Zonnepanelen onbekend	prospect	Lost	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:30.333653	2025-06-16 23:09:30.333653	19	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:30.333653	2025-06-16 23:09:30.333653	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
261	111	13	0	48910	Zonnepanelen onbekend	prospect	Lost	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:30.188254	2025-06-16 23:09:30.188254	19	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:30.188254	2025-06-16 23:09:30.188254	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
197	84	1	0	61426	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:55.91022	2025-06-16 20:56:55.91022	12	\N	\N	\N	84	12	\N	\N	2025-06-16 20:56:55.91022	2025-06-16 21:58:34.017227	2022-11-08 00:00:00	4	Inventaris/Goederen Bouwnijver	pending	\N	\N	\N	\N	\N	0
193	81	1	0	47928	Zonnepanelen	Active	Rejected	New Business	\N	\N	\N	2025-06-16 20:56:55.609578	2025-06-16 20:56:55.609578	12	\N	\N	\N	81	12	\N	\N	2025-06-16 20:56:55.609578	2025-06-16 21:58:34.017227	2022-03-11 00:00:00	4	Bedrijfsgebouwen Persoonlijke Dienstverlening	pending	\N	\N	\N	\N	\N	0
195	82	1	30	58683	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:55.760033	2025-06-16 20:56:55.760033	12	\N	\N	\N	82	12	\N	\N	2025-06-16 20:56:55.760033	2025-06-16 21:58:34.017227	2022-07-01 00:00:00	4	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
194	82	1	30	40817	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:55.685178	2025-06-16 20:56:55.685178	12	\N	\N	\N	82	12	\N	\N	2025-06-16 20:56:55.685178	2025-06-16 21:58:34.017227	2022-07-01 00:00:00	4	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
196	83	1	30	30117	Zonnepanelen	Active	Validated	New Business	\N	\N	\N	2025-06-16 20:56:55.835013	2025-06-16 20:56:55.835013	12	\N	\N	\N	83	12	\N	\N	2025-06-16 20:56:55.835013	2025-06-16 21:58:34.017227	2022-07-22 00:00:00	4	Inventaris/Goederen Detailhand	pending	\N	\N	\N	\N	\N	0
439	259	3	70	18000	Data Breach Coverage	Active	negotiation	upsell	Data breach insurance for client data protection	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	26	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
191	79	1	100	44292	Zonnepanelen	Active	Closed (Won)	New Business	\N	\N	\N	2025-06-16 20:56:55.459858	2025-06-16 20:56:55.459858	12	\N	\N	\N	79	12	\N	\N	2025-06-16 20:56:55.459858	2025-06-16 21:58:34.017227	2022-01-01 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
192	80	1	100	27991	Zonnepanelen	Active	Closed (Won)	New Business	\N	\N	\N	2025-06-16 20:56:55.534869	2025-06-16 20:56:55.534869	12	\N	\N	\N	80	12	\N	\N	2025-06-16 20:56:55.534869	2025-06-16 21:58:34.017227	2022-01-01 00:00:00	4	Bedrijfsgebouwen Metaalbewerki	pending	\N	\N	\N	\N	\N	0
223	108	1	60	63807	Zonnepanelen	Active	Proposal Sent to Client	New Business	\N	\N	\N	2025-06-16 20:56:57.977605	2025-06-16 20:56:57.977605	10	\N	\N	\N	108	10	\N	\N	2025-06-16 20:56:57.977605	2025-06-16 21:58:34.017227	2018-07-28 00:00:00	5	Bedrijfsgebouwen Verhuur onroerend goed	pending	\N	\N	\N	\N	\N	0
386	216	1	50	60000	Langetermijn sparen - Jens Van Damme	\N	Qualified Lead	Savings Insurance	Long-term savings product cross-sell	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	28	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
387	217	1	50	60000	Langetermijn sparen - Sara Michiels	\N	Qualified Lead	Savings Insurance	Long-term savings product cross-sell	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	28	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
388	218	1	50	58000	Langetermijn sparen - Bram Willems	\N	Qualified Lead	Savings Insurance	Long-term savings product cross-sell	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	28	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
389	219	1	50	56000	Langetermijn sparen - Nathalie Goossens	\N	Qualified Lead	Savings Insurance	Long-term savings product cross-sell	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	28	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
390	220	1	50	54000	Langetermijn sparen - Kurt Van der Linden	\N	Qualified Lead	Savings Insurance	Long-term savings product cross-sell	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	28	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
391	221	1	50	52000	Langetermijn sparen - Els Vandenberghe	\N	Qualified Lead	Savings Insurance	Long-term savings product cross-sell	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	28	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
392	222	1	50	50000	Langetermijn sparen - Dieter De Vos	\N	Qualified Lead	Savings Insurance	Long-term savings product cross-sell	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	28	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
393	223	1	50	48000	Langetermijn sparen - Isabelle Wauters	\N	Qualified Lead	Savings Insurance	Long-term savings product cross-sell	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	28	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
394	224	1	50	46000	Langetermijn sparen - Mieke Van Laere	\N	Qualified Lead	Savings Insurance	Long-term savings product cross-sell	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	29	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
395	225	1	50	44000	Langetermijn sparen - Gert Pauwels	\N	Qualified Lead	Savings Insurance	Long-term savings product cross-sell	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	29	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:02.828586	2025-06-23 10:17:02.828586	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
445	260	9	55	28000	Environmental Liability	Active	proposal	upsell	Environmental liability coverage	\N	\N	2025-07-15 09:48:42.425101	2025-07-20 13:51:51.496702	26	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	accepted	2025-07-20 13:51:51.496702	1	{}	\N	\N	1
432	30	1	25	45000	Cyber Security Insurance	Active	prospecting	\N	Cybersecurity insurance package for IT company	\N	\N	2025-07-14 13:05:00.868864	2025-07-14 13:05:00.868864	12	\N	\N	\N	\N	\N	\N	\N	2025-07-14 13:05:00.868864	2025-07-14 13:05:00.868864	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
433	35	1	40	32000	Fleet Management Insurance	Active	qualified	\N	Commercial vehicle insurance for logistics company	\N	\N	2025-07-14 13:05:00.868864	2025-07-14 13:05:00.868864	12	\N	\N	\N	\N	\N	\N	\N	2025-07-14 13:05:00.868864	2025-07-14 13:05:00.868864	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
434	40	1	60	28000	Professional Liability	Active	proposal	\N	Professional indemnity insurance for consulting firm	\N	\N	2025-07-14 13:05:00.868864	2025-07-14 13:05:00.868864	12	\N	\N	\N	\N	\N	\N	\N	2025-07-14 13:05:00.868864	2025-07-14 13:05:00.868864	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
435	45	1	75	55000	Property Insurance Expansion	Active	negotiation	\N	Additional property coverage for manufacturing	\N	\N	2025-07-14 13:05:00.868864	2025-07-14 13:05:00.868864	12	\N	\N	\N	\N	\N	\N	\N	2025-07-14 13:05:00.868864	2025-07-14 13:05:00.868864	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
436	50	1	30	38000	Directors & Officers Insurance	Active	prospecting	\N	D&O insurance for growing tech startup	\N	\N	2025-07-14 13:05:00.868864	2025-07-14 13:05:00.868864	12	\N	\N	\N	\N	\N	\N	\N	2025-07-14 13:05:00.868864	2025-07-14 13:05:00.868864	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
437	259	1	80	25000	Cyber Security Insurance	Active	negotiation	upsell	Cyber security coverage for tech infrastructure	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	12	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
438	259	2	60	15000	Professional Liability	Active	proposal	cross-sell	Professional liability for software development	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	12	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
441	259	5	90	35000	Directors & Officers	Active	closed-won	upsell	D&O insurance for executive team	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	1	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
442	259	6	40	12000	Employment Practices	Active	proposal	cross-sell	Employment practices liability insurance	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	1	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
443	260	7	85	45000	Industrial Equipment	Active	negotiation	renewal	Industrial equipment insurance renewal	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	12	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
444	260	8	75	38000	Product Liability	Active	proposal	cross-sell	Product liability for manufactured goods	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	12	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
440	259	4	50	22000	Business Interruption	Active	proposal	cross-sell	Business interruption insurance for tech operations	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	26	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
488	71	1	60	30385	Zonnepanelen	\N	Proposal Sent to Client	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
489	65	1	60	38266	Zonnepanelen	\N	Proposal Sent to Client	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
490	74	1	60	24140	Zonnepanelen	\N	Proposal Sent to Client	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
491	72	1	60	47722	Zonnepanelen	\N	Proposal Sent to Client	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
492	74	1	60	53268	Zonnepanelen	\N	Proposal Sent to Client	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
493	64	1	75	56721	Zonnepanelen	\N	proposal	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
494	66	1	0	56623	Zonnepanelen	\N	Rejected	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
495	70	1	0	42446	Zonnepanelen	\N	Rejected	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
496	68	1	0	38113	Zonnepanelen	\N	Rejected	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
497	63	1	30	37611	Zonnepanelen	\N	Validated	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
498	73	1	30	42844	Zonnepanelen	\N	Validated	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
499	69	1	30	20407	Zonnepanelen	\N	Validated	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
500	67	1	30	54991	Zonnepanelen	\N	Validated	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
501	63	1	0	65902	Zonnepanelen	\N	Lost	New Business	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
502	259	5	90	35000	Directors & Officers	\N	closed-won	upsell	D&O insurance for executive team	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
503	259	6	40	12000	Employment Practices	\N	proposal	cross-sell	Employment practices liability insurance	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
504	260	11	65	25000	Marine Cargo	\N	proposal	cross-sell	Marine cargo insurance for exports	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
505	260	12	70	42000	Property Insurance	\N	negotiation	renewal	Property insurance for manufacturing facilities	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
506	261	17	50	18000	Third Party Liability	\N	proposal	cross-sell	Third party liability for logistics operations	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
507	261	18	65	15000	Equipment Breakdown	\N	proposal	upsell	Equipment breakdown insurance	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
508	262	3	55	28000	Performance Guarantee	\N	proposal	upsell	Performance guarantee insurance	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
509	262	4	80	22000	Maintenance Coverage	\N	negotiation	cross-sell	Maintenance and service coverage	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
510	263	9	55	25000	Client Fund Protection	\N	proposal	upsell	Client fund protection insurance	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
511	263	10	70	18000	Regulatory Defense	\N	proposal	cross-sell	Regulatory defense insurance	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	\N	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
512	18	71	75	125000	IT Infrastructure Insurance	\N	proposal	Cyber Security	Comprehensive IT infrastructure coverage for Amazon CS Netherlands	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
513	248	72	60	85000	Professional Liability Coverage	\N	negotiation	Professional Liability	Professional liability insurance for SimCorp Benelux consulting services	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
514	249	73	80	150000	Cyber Security Package	\N	closed-won	Cyber Security	Advanced cyber security insurance for Accenture B.V.	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
515	250	74	70	95000	Technology Errors & Omissions	\N	Validated	Professional Liability	E&O coverage for msg global solutions technology services	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
516	251	75	85	180000	Management Liability Suite	\N	Proposal Sent to Client	Management Liability	Comprehensive management liability for Boston Consulting Group	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
517	252	76	65	110000	Actuarial Professional Coverage	\N	negotiation	Professional Liability	Specialized professional liability for Milliman actuarial services	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
518	253	77	90	250000	Financial Institution Package	\N	closed-won	Financial Services	Comprehensive financial services coverage for ABN AMRO Bank	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
519	254	78	55	75000	Directors & Officers Insurance	\N	proposal	Management Liability	D&O coverage for Intervall Holding executive team	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
520	255	79	75	135000	Audit Professional Liability	\N	Validated	Professional Liability	Professional liability for PricewaterhouseCoopers auditing services	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
521	256	80	70	120000	Technology Professional Liability	\N	negotiation	Professional Liability	Professional liability coverage for Oracle Nederland	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
522	257	81	60	90000	Investment Advisory Coverage	\N	proposal	Professional Liability	Professional liability for Blauwtust Holding investment services	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
523	258	82	65	100000	Fiduciary Liability Insurance	\N	Validated	Fiduciary Liability	Fiduciary liability coverage for OHPEN Expeditions	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	43	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:43:07.472842	2025-07-16 08:43:07.472842	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
163	55	1	75	75488	Zonnepanelen	Active	discovery	New Business	\N	\N	\N	2025-06-16 20:56:53.343784	2025-07-20 13:45:51.460185	26	\N	\N	\N	55	12	\N	\N	2025-06-16 20:56:53.343784	2025-06-16 21:58:34.017227	2018-01-01 00:00:00	4	Inventaris/Goederen Metaalbew.	withheld	2025-07-20 13:45:51.460185	1	{"Strong competition"}	Test		1
379	209	1	75	100000	Einde termijn IPT - Elke Janssens	\N	Negotiation	Life Insurance	End-term life insurance renewal	\N	\N	2025-06-23 10:16:44.407523	2025-07-20 14:31:00.255543	26	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	\N	\N	\N	accepted	2025-07-20 14:31:00.255543	1	{}	\N	\N	1
376	206	1	75	100000	Einde termijn IPT - Bart De Smet	\N	closed_won	Life Insurance	End-term life insurance renewal	\N	\N	2025-06-23 10:16:44.407523	2025-07-22 10:25:57.65036	26	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	\N	\N	\N	accepted	2025-07-22 08:46:43.364321	1	{}	\N	\N	13
396	226	3	60	42000	cyberverzekering - Lynn Vandenbosch	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-07-22 13:53:33.113427	30	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	withheld	2025-07-22 13:53:33.113427	1	{"Timing Issues"}	Test	\N	1
415	244	3	50	10000	cyberverzekering - Qollabi	\N	Negotiation	Cyber Insurance	\N	\N	\N	2025-06-23 12:50:44.073056	2025-06-23 12:50:44.073056	26	\N	\N	\N	\N	\N	\N	\N	2025-06-23 12:50:44.073056	2025-06-23 12:50:44.073056	\N	7	Cyberverzekering	pending	\N	\N	\N	\N	\N	0
416	245	3	40	10000	cyberverzekering - Coca Cola	\N	Proposal	Cyber Insurance	\N	\N	\N	2025-06-23 12:50:44.073056	2025-06-23 12:50:44.073056	26	\N	\N	\N	\N	\N	\N	\N	2025-06-23 12:50:44.073056	2025-06-23 12:50:44.073056	\N	7	Cyberverzekering	pending	\N	\N	\N	\N	\N	0
306	146	13	0	31572	Zonnepanelen onbekend	prospect	Rejected	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:38.558806	2025-06-16 23:09:38.558806	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:38.558806	2025-06-16 23:09:38.558806	\N	\N	Bedrijfsgebouwen Conversie	pending	\N	\N	\N	\N	\N	0
304	144	13	30	33828	Zonnepanelen onbekend	prospect	Validated	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:38.127899	2025-06-16 23:09:38.127899	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:38.127899	2025-06-16 23:09:38.127899	\N	\N	Inventaris/Goederen Zak. Dienstverlening	pending	\N	\N	\N	\N	\N	0
305	145	13	30	64196	Zonnepanelen onbekend	prospect	Validated	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:38.343485	2025-06-16 23:09:38.343485	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:38.343485	2025-06-16 23:09:38.343485	\N	\N	Bedrijfsgebouwen Verhuur onroerend goed	pending	\N	\N	\N	\N	\N	0
303	143	13	60	69022	Zonnepanelen onbekend	prospect	Proposal Sent to Client	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:37.912819	2025-06-16 23:09:37.912819	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:37.912819	2025-06-16 23:09:37.912819	\N	\N	Inventaris/Goederen Conversie	pending	\N	\N	\N	\N	\N	0
302	143	13	0	63912	Zonnepanelen onbekend	prospect	Lost	\N	Solar panel insurance opportunity: Zonnepanelen onbekend	\N	\N	2025-06-16 23:09:37.768985	2025-06-16 23:09:37.768985	7	\N	\N	\N	\N	\N	\N	\N	2025-06-16 23:09:37.768985	2025-06-16 23:09:37.768985	\N	\N	Bedrijfsgebouwen Detailhandel	pending	\N	\N	\N	\N	\N	0
380	210	1	75	100000	Einde termijn IPT - Wim Claes	\N	Negotiation	Life Insurance	End-term life insurance renewal	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	27	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
381	211	1	75	100000	Einde termijn IPT - Anke De Wilde	\N	Negotiation	Life Insurance	End-term life insurance renewal	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	27	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
382	212	1	75	100000	Einde termijn IPT - Koen Maes	\N	Negotiation	Life Insurance	End-term life insurance renewal	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	27	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
383	213	1	75	70000	Einde termijn IPT - Lien Van den Broeck	\N	Negotiation	Life Insurance	End-term life insurance renewal	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	28	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
384	214	1	75	60000	Einde termijn IPT - Pieter Declercq	\N	Negotiation	Life Insurance	End-term life insurance renewal	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	28	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
385	215	1	75	70000	Einde termijn IPT - Karen De Cock	\N	Negotiation	Life Insurance	End-term life insurance renewal	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	28	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
397	227	3	60	40000	cyberverzekering - Rudi Verschueren	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	30	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
398	228	3	60	38000	cyberverzekering - Nele Blomme	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	30	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
399	229	3	60	36000	cyberverzekering - Stephan Vandaele	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	30	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
400	230	3	60	34000	cyberverzekering - Tinne Versluys	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	30	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
401	231	3	60	32000	cyberverzekering - Technolab	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	31	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
402	232	3	60	30000	cyberverzekering - Barco	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	31	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
403	233	3	60	28000	cyberverzekering - Agfa-Gevaert	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	31	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
404	234	3	60	26000	cyberverzekering - Umicore	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	31	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
405	235	3	60	24000	cyberverzekering - Accenture	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	31	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
406	236	3	60	22000	cyberverzekering - Deloitte	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	31	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
407	237	3	60	20000	cyberverzekering - Proximus	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	31	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
408	238	3	60	2400	cyberverzekering - Zetes Industries	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	31	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
409	239	3	60	1800	cyberverzekering - Intermodalics	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	31	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
410	240	3	60	1200	cyberverzekering - Sirris	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	32	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
411	241	3	60	1000	cyberverzekering - Agoria	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	32	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
412	242	3	60	4000	cyberverzekering - Anju Life Sciences Software	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	33	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
413	243	3	60	7000	cyberverzekering - Cenexi	\N	Proposal Sent	Cyber Insurance	Cybersecurity insurance upsell	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	31	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:17:30.592135	2025-06-23 10:17:30.592135	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
417	246	3	30	10000	cyberverzekering - Bpost	\N	Qualified	Cyber Insurance	\N	\N	\N	2025-06-23 12:50:44.073056	2025-06-23 12:50:44.073056	26	\N	\N	\N	\N	\N	\N	\N	2025-06-23 12:50:44.073056	2025-06-23 12:50:44.073056	\N	7	Cyberverzekering	pending	\N	\N	\N	\N	\N	0
418	237	3	20	10000	cyberverzekering - Proximus	\N	Lead	Cyber Insurance	\N	\N	\N	2025-06-23 12:50:44.073056	2025-06-23 12:50:44.073056	26	\N	\N	\N	\N	\N	\N	\N	2025-06-23 12:50:44.073056	2025-06-23 12:50:44.073056	\N	7	Cyberverzekering	pending	\N	\N	\N	\N	\N	0
377	207	1	75	100000	Einde termijn IPT - Sofie Peeters	\N	qualification	Life Insurance	End-term life insurance renewal	\N	\N	2025-06-23 10:16:44.407523	2025-07-22 10:26:08.879173	26	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	\N	\N	\N	accepted	2025-07-22 10:26:08.879173	1	{}	\N	\N	7
378	208	1	75	100000	Einde termijn IPT - Tom Vermeulen	\N	Negotiation	Life Insurance	End-term life insurance renewal	\N	\N	2025-06-23 10:16:44.407523	2025-07-22 08:45:52.42122	26	\N	\N	\N	\N	\N	\N	\N	2025-06-23 10:16:44.407523	2025-06-23 10:16:44.407523	\N	\N	\N	withheld	2025-07-22 08:45:52.42122	1	{"Not a Priority"}		\N	2
447	260	11	65	25000	Marine Cargo	Active	proposal	cross-sell	Marine cargo insurance for exports	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	1	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
448	260	12	70	42000	Property Insurance	Active	negotiation	renewal	Property insurance for manufacturing facilities	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	1	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
449	261	13	90	55000	Fleet Insurance	Active	closed-won	renewal	Fleet insurance for logistics vehicles	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	12	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
450	261	14	80	35000	Cargo Insurance	Active	negotiation	cross-sell	Cargo insurance for transported goods	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	12	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
453	261	17	50	18000	Third Party Liability	Active	proposal	cross-sell	Third party liability for logistics operations	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	1	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
454	261	18	65	15000	Equipment Breakdown	Active	proposal	upsell	Equipment breakdown insurance	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	1	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
455	262	19	85	48000	Solar Panel Insurance	Active	negotiation	upsell	Solar panel installation insurance	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	12	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
456	262	20	70	65000	Wind Turbine Coverage	Active	proposal	cross-sell	Wind turbine insurance coverage	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	12	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
459	262	3	55	28000	Performance Guarantee	Active	proposal	upsell	Performance guarantee insurance	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	1	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
460	262	4	80	22000	Maintenance Coverage	Active	negotiation	cross-sell	Maintenance and service coverage	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	1	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
461	263	5	90	45000	Financial Planning E&O	Active	closed-won	renewal	E&O insurance for financial planning	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	12	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
462	263	6	75	38000	Investment Advisory	Active	negotiation	cross-sell	Investment advisory liability	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	12	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
465	263	9	55	25000	Client Fund Protection	Active	proposal	upsell	Client fund protection insurance	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	1	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
466	263	10	70	18000	Regulatory Defense	Active	proposal	cross-sell	Regulatory defense insurance	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	1	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
451	261	15	60	28000	Warehouse Insurance	Active	proposal	upsell	Warehouse and storage facility insurance	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	26	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
452	261	16	75	22000	Transit Insurance	Active	negotiation	cross-sell	Goods in transit insurance	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	26	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
457	262	1	60	25000	Green Technology E&O	Active	proposal	upsell	Errors & omissions for green tech solutions	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	26	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
458	262	2	75	32000	Installation Liability	Active	negotiation	cross-sell	Installation liability insurance	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	26	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
463	263	7	65	35000	Fiduciary Liability	Active	proposal	upsell	Fiduciary liability insurance	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	26	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
464	263	8	80	28000	Cyber Risk Finance	Active	negotiation	cross-sell	Cyber risk insurance for financial data	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	26	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
468	264	55	25	45000	IT Infrastructure Upgrade	Active	initial_contact	\N	Complete infrastructure modernization project	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
469	265	55	60	35000	Green Building Certification	Active	proposal	\N	Sustainable construction certification process	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
470	266	55	40	28000	Data Migration Project	Active	negotiation	\N	Legacy system data migration to cloud	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
471	267	55	30	52000	Fleet Management System	Active	initial_contact	\N	Eco-friendly logistics optimization	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
472	268	55	70	18000	Smart Home Integration	Active	proposal	\N	Residential automation system installation	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
473	269	55	45	75000	Cloud Migration Services	Active	negotiation	\N	Enterprise cloud infrastructure setup	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
474	270	55	35	22000	Laboratory Equipment Insurance	Active	initial_contact	\N	Specialized equipment protection plan	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
475	271	55	50	48000	Urban Development Insurance	Active	proposal	\N	City planning project coverage	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	\N	\N	\N	\N	\N	2025-07-15 12:57:05.703768	2025-07-15 12:57:05.703768	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
476	18	71	75	125000	IT Infrastructure Insurance	\N	proposal	Cyber Security	Comprehensive IT infrastructure coverage for Amazon CS Netherlands	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	1	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
477	248	72	60	85000	Professional Liability Coverage	\N	negotiation	Professional Liability	Professional liability insurance for SimCorp Benelux consulting services	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	1	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
478	249	73	80	150000	Cyber Security Package	\N	closed-won	Cyber Security	Advanced cyber security insurance for Accenture B.V.	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	1	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
479	250	74	70	95000	Technology Errors & Omissions	\N	Validated	Professional Liability	E&O coverage for msg global solutions technology services	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	1	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
480	251	75	85	180000	Management Liability Suite	\N	Proposal Sent to Client	Management Liability	Comprehensive management liability for Boston Consulting Group	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	1	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
481	252	76	65	110000	Actuarial Professional Coverage	\N	negotiation	Professional Liability	Specialized professional liability for Milliman actuarial services	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	1	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
482	253	77	90	250000	Financial Institution Package	\N	closed-won	Financial Services	Comprehensive financial services coverage for ABN AMRO Bank	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	1	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
483	254	78	55	75000	Directors & Officers Insurance	\N	proposal	Management Liability	D&O coverage for Intervall Holding executive team	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	1	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
484	255	79	75	135000	Audit Professional Liability	\N	Validated	Professional Liability	Professional liability for PricewaterhouseCoopers auditing services	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	1	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
485	256	80	70	120000	Technology Professional Liability	\N	negotiation	Professional Liability	Professional liability coverage for Oracle Nederland	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	1	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
486	257	81	60	90000	Investment Advisory Coverage	\N	proposal	Professional Liability	Professional liability for Blauwtust Holding investment services	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	1	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
487	258	82	65	100000	Fiduciary Liability Insurance	\N	Validated	Fiduciary Liability	Fiduciary liability coverage for OHPEN Expeditions	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	1	4	\N	\N	\N	\N	\N	\N	2025-07-16 08:42:58.328599	2025-07-16 08:42:58.328599	\N	\N	\N	pending	\N	\N	\N	\N	\N	0
446	260	10	80	32000	Workers Compensation	Active	negotiation	renewal	Workers compensation insurance renewal	\N	\N	2025-07-15 09:48:42.425101	2025-07-20 13:51:59.451313	26	\N	\N	\N	\N	\N	\N	\N	2025-07-15 09:48:42.425101	2025-07-15 09:48:42.425101	\N	\N	\N	withheld	2025-07-20 13:51:59.451313	1	{"Strong competition"}	Test		1
\.


--
-- Data for Name: opportunity_products; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.opportunity_products (id, opportunity_id, product_id, created_at) FROM stdin;
\.


--
-- Data for Name: partner_customers; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.partner_customers (id, partner_id, customer_id, created_at) FROM stdin;
129	13	1	2025-06-16 22:17:43.754159
130	13	2	2025-06-16 22:17:43.754159
131	13	3	2025-06-16 22:17:43.754159
132	13	4	2025-06-16 22:17:43.754159
133	13	5	2025-06-16 22:17:43.754159
134	17	7	2025-06-16 22:17:43.754159
135	17	8	2025-06-16 22:17:43.754159
136	17	9	2025-06-16 22:17:43.754159
137	17	18	2025-06-16 22:17:43.754159
138	17	19	2025-06-16 22:17:43.754159
139	17	20	2025-06-16 22:17:43.754159
140	17	21	2025-06-16 22:17:43.754159
141	17	22	2025-06-16 22:17:43.754159
142	17	23	2025-06-16 22:17:43.754159
143	17	41	2025-06-16 22:17:43.754159
144	17	42	2025-06-16 22:17:43.754159
145	17	43	2025-06-16 22:17:43.754159
146	7	44	2025-06-16 22:17:43.754159
147	7	45	2025-06-16 22:17:43.754159
148	7	46	2025-06-16 22:17:43.754159
149	7	47	2025-06-16 22:18:06.950694
150	7	48	2025-06-16 22:18:06.950694
151	7	49	2025-06-16 22:18:06.950694
152	9	50	2025-06-16 22:18:06.950694
153	9	51	2025-06-16 22:18:06.950694
154	12	52	2025-06-16 22:18:06.950694
155	12	24	2025-06-16 22:18:06.950694
156	12	25	2025-06-16 22:18:06.950694
157	12	26	2025-06-16 22:18:06.950694
158	12	27	2025-06-16 22:18:06.950694
159	12	28	2025-06-16 22:18:06.950694
160	12	29	2025-06-16 22:18:06.950694
161	12	53	2025-06-16 22:18:06.950694
162	12	54	2025-06-16 22:18:06.950694
163	12	55	2025-06-16 22:18:06.950694
164	12	56	2025-06-16 22:18:06.950694
165	12	57	2025-06-16 22:18:06.950694
166	12	58	2025-06-16 22:18:06.950694
167	12	59	2025-06-16 22:18:06.950694
168	12	60	2025-06-16 22:18:06.950694
169	12	61	2025-06-16 22:18:24.236921
170	12	62	2025-06-16 22:18:24.236921
171	12	63	2025-06-16 22:18:24.236921
172	12	64	2025-06-16 22:18:24.236921
173	12	65	2025-06-16 22:18:24.236921
174	12	66	2025-06-16 22:18:24.236921
175	12	67	2025-06-16 22:18:24.236921
176	12	68	2025-06-16 22:18:24.236921
177	12	69	2025-06-16 22:18:24.236921
178	12	70	2025-06-16 22:18:24.236921
179	12	71	2025-06-16 22:18:24.236921
180	12	72	2025-06-16 22:18:24.236921
181	12	73	2025-06-16 22:18:24.236921
182	12	74	2025-06-16 22:18:24.236921
183	12	75	2025-06-16 22:18:24.236921
184	12	76	2025-06-16 22:18:24.236921
185	12	77	2025-06-16 22:18:24.236921
186	12	78	2025-06-16 22:18:24.236921
187	12	79	2025-06-16 22:18:24.236921
188	12	80	2025-06-16 22:18:24.236921
189	12	81	2025-06-16 22:19:03.349752
190	12	82	2025-06-16 22:19:03.349752
191	12	83	2025-06-16 22:19:03.349752
192	12	84	2025-06-16 22:19:03.349752
193	12	85	2025-06-16 22:19:03.349752
194	12	86	2025-06-16 22:19:03.349752
195	12	87	2025-06-16 22:19:03.349752
196	12	88	2025-06-16 22:19:03.349752
197	12	89	2025-06-16 22:19:03.349752
198	12	90	2025-06-16 22:19:03.349752
199	12	91	2025-06-16 22:19:03.349752
200	12	92	2025-06-16 22:19:03.349752
201	12	93	2025-06-16 22:19:03.349752
202	12	94	2025-06-16 22:19:03.349752
203	12	95	2025-06-16 22:19:03.349752
204	12	96	2025-06-16 22:19:03.349752
205	6	97	2025-06-16 22:19:03.349752
206	11	98	2025-06-16 22:19:03.349752
207	11	99	2025-06-16 22:19:03.349752
208	8	100	2025-06-16 22:19:03.349752
209	8	101	2025-06-16 22:19:14.360922
210	16	102	2025-06-16 22:19:14.360922
211	15	103	2025-06-16 22:19:14.360922
212	15	104	2025-06-16 22:19:14.360922
213	10	105	2025-06-16 22:19:14.360922
214	10	106	2025-06-16 22:19:14.360922
215	10	107	2025-06-16 22:19:14.360922
216	10	108	2025-06-16 22:19:14.360922
217	18	109	2025-06-16 23:09:29.820847
218	18	110	2025-06-16 23:09:29.969488
219	19	111	2025-06-16 23:09:30.113447
224	20	112	2025-06-16 23:09:30.836739
226	20	113	2025-06-16 23:09:31.126207
227	21	114	2025-06-16 23:09:31.26978
229	21	115	2025-06-16 23:09:31.558763
230	21	116	2025-06-16 23:09:31.702897
231	21	117	2025-06-16 23:09:31.849616
232	13	118	2025-06-16 23:09:31.994927
233	13	119	2025-06-16 23:09:32.143246
234	13	120	2025-06-16 23:09:32.288263
235	13	121	2025-06-16 23:09:32.507744
236	13	122	2025-06-16 23:09:32.723777
237	17	123	2025-06-16 23:09:32.94028
238	17	124	2025-06-16 23:09:33.15645
239	17	125	2025-06-16 23:09:33.372208
243	17	126	2025-06-16 23:09:34.020495
244	17	127	2025-06-16 23:09:34.236693
245	17	128	2025-06-16 23:09:34.452155
246	17	129	2025-06-16 23:09:34.667794
247	17	130	2025-06-16 23:09:34.88306
248	17	131	2025-06-16 23:09:35.09791
249	17	132	2025-06-16 23:09:35.313117
250	7	133	2025-06-16 23:09:35.528776
251	7	134	2025-06-16 23:09:35.746579
252	7	135	2025-06-16 23:09:35.963513
253	7	136	2025-06-16 23:09:36.17947
254	7	137	2025-06-16 23:09:36.395121
255	7	138	2025-06-16 23:09:36.611109
256	7	139	2025-06-16 23:09:36.826466
257	7	140	2025-06-16 23:09:37.04328
258	7	141	2025-06-16 23:09:37.258338
260	7	142	2025-06-16 23:09:37.625034
261	7	143	2025-06-16 23:09:37.84078
263	7	144	2025-06-16 23:09:38.199917
264	7	145	2025-06-16 23:09:38.415307
322	7	146	2025-06-17 11:07:03.749644
323	1	18	2025-07-01 09:47:18.104084
325	1	248	2025-07-06 12:07:13.073875
326	1	249	2025-07-06 12:07:13.073875
327	1	250	2025-07-06 12:07:13.073875
328	1	251	2025-07-06 12:07:13.073875
329	1	252	2025-07-06 12:07:13.073875
330	1	253	2025-07-06 12:07:13.073875
331	1	254	2025-07-06 12:07:13.073875
332	1	255	2025-07-06 12:07:13.073875
333	1	256	2025-07-06 12:07:13.073875
334	1	257	2025-07-06 12:07:13.073875
335	1	258	2025-07-06 12:07:13.073875
338	37	272	2025-07-16 08:07:27.150649
339	36	272	2025-07-16 08:07:27.150649
352	43	18	2025-07-16 08:44:55.714064
353	43	248	2025-07-16 08:44:55.714064
354	43	249	2025-07-16 08:44:55.714064
355	43	250	2025-07-16 08:44:55.714064
356	43	251	2025-07-16 08:44:55.714064
357	43	252	2025-07-16 08:44:55.714064
358	43	253	2025-07-16 08:44:55.714064
359	43	254	2025-07-16 08:44:55.714064
360	43	255	2025-07-16 08:44:55.714064
361	43	256	2025-07-16 08:44:55.714064
362	43	257	2025-07-16 08:44:55.714064
363	43	258	2025-07-16 08:44:55.714064
376	26	207	2025-07-16 14:14:52.612809
377	26	62	2025-07-16 14:14:52.612809
378	26	246	2025-07-16 14:14:52.612809
379	26	55	2025-07-16 14:14:52.612809
380	26	208	2025-07-16 14:14:52.612809
381	26	56	2025-07-16 14:14:52.612809
382	26	58	2025-07-16 14:14:52.612809
383	26	261	2025-07-16 14:14:52.612809
384	26	57	2025-07-16 14:14:52.612809
385	26	61	2025-07-16 14:14:52.612809
386	26	237	2025-07-16 14:14:52.612809
387	26	244	2025-07-16 14:14:52.612809
388	26	209	2025-07-16 14:14:52.612809
389	26	259	2025-07-16 14:14:52.612809
390	26	54	2025-07-16 14:14:52.612809
391	26	262	2025-07-16 14:14:52.612809
392	26	206	2025-07-16 14:14:52.612809
393	26	60	2025-07-16 14:14:52.612809
394	26	245	2025-07-16 14:14:52.612809
395	26	263	2025-07-16 14:14:52.612809
396	26	59	2025-07-16 14:14:52.612809
397	26	260	2025-07-16 14:14:52.612809
398	1	52	2025-07-18 09:02:23.89428
399	2	52	2025-07-18 09:18:24.638596
404	26	52	2025-07-18 14:04:02.217779
405	26	24	2025-07-18 14:06:18.656936
406	1	25	2025-07-18 14:19:59.483644
407	2	25	2025-07-18 14:24:53.419685
409	1	28	2025-07-18 14:29:06.661748
410	1	26	2025-07-18 14:32:31.528409
411	2	28	2025-07-18 14:35:06.95879
\.


--
-- Data for Name: partner_opportunities; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.partner_opportunities (id, partner_id, opportunity_id, created_at) FROM stdin;
140	13	121	2025-06-16 22:16:36.874049
141	13	122	2025-06-16 22:16:36.874049
142	13	123	2025-06-16 22:16:36.874049
143	13	124	2025-06-16 22:16:36.874049
144	13	125	2025-06-16 22:16:36.874049
145	13	126	2025-06-16 22:16:36.874049
146	17	127	2025-06-16 22:16:36.874049
147	17	128	2025-06-16 22:16:36.874049
148	17	129	2025-06-16 22:16:36.874049
149	17	130	2025-06-16 22:16:36.874049
150	17	131	2025-06-16 22:16:36.874049
151	17	132	2025-06-16 22:16:36.874049
152	17	133	2025-06-16 22:16:36.874049
153	17	134	2025-06-16 22:16:36.874049
154	17	135	2025-06-16 22:16:36.874049
155	17	136	2025-06-16 22:16:36.874049
156	17	137	2025-06-16 22:16:36.874049
157	17	138	2025-06-16 22:16:36.874049
158	17	139	2025-06-16 22:16:36.874049
159	17	140	2025-06-16 22:16:36.874049
160	17	141	2025-06-16 22:16:36.874049
161	7	142	2025-06-16 22:16:36.874049
162	7	143	2025-06-16 22:16:36.874049
163	7	144	2025-06-16 22:16:36.874049
164	7	145	2025-06-16 22:16:36.874049
165	7	146	2025-06-16 22:16:36.874049
166	7	147	2025-06-16 22:16:36.874049
167	7	148	2025-06-16 22:16:36.874049
168	7	149	2025-06-16 22:16:36.874049
169	9	150	2025-06-16 22:16:36.874049
170	9	151	2025-06-16 22:16:53.22022
171	12	152	2025-06-16 22:16:53.22022
172	12	153	2025-06-16 22:16:53.22022
173	12	154	2025-06-16 22:16:53.22022
174	12	155	2025-06-16 22:16:53.22022
175	12	156	2025-06-16 22:16:53.22022
176	12	157	2025-06-16 22:16:53.22022
177	12	158	2025-06-16 22:16:53.22022
178	12	159	2025-06-16 22:16:53.22022
179	12	160	2025-06-16 22:16:53.22022
180	12	161	2025-06-16 22:16:53.22022
181	12	162	2025-06-16 22:16:53.22022
182	12	163	2025-06-16 22:16:53.22022
183	12	164	2025-06-16 22:16:53.22022
184	12	165	2025-06-16 22:16:53.22022
185	12	166	2025-06-16 22:16:53.22022
186	12	167	2025-06-16 22:16:53.22022
187	12	168	2025-06-16 22:16:53.22022
188	12	169	2025-06-16 22:16:53.22022
189	12	170	2025-06-16 22:16:53.22022
190	12	171	2025-06-16 22:16:53.22022
191	12	172	2025-06-16 22:16:53.22022
192	12	173	2025-06-16 22:16:53.22022
193	12	174	2025-06-16 22:16:53.22022
194	12	175	2025-06-16 22:16:53.22022
195	12	176	2025-06-16 22:16:53.22022
196	12	177	2025-06-16 22:16:53.22022
197	12	178	2025-06-16 22:16:53.22022
198	12	179	2025-06-16 22:16:53.22022
199	12	180	2025-06-16 22:16:53.22022
200	12	181	2025-06-16 22:17:08.86642
201	12	182	2025-06-16 22:17:08.86642
202	12	183	2025-06-16 22:17:08.86642
203	12	184	2025-06-16 22:17:08.86642
204	12	185	2025-06-16 22:17:08.86642
205	12	186	2025-06-16 22:17:08.86642
206	12	187	2025-06-16 22:17:08.86642
207	12	188	2025-06-16 22:17:08.86642
208	12	189	2025-06-16 22:17:08.86642
209	12	190	2025-06-16 22:17:08.86642
210	12	191	2025-06-16 22:17:08.86642
211	12	192	2025-06-16 22:17:08.86642
212	12	193	2025-06-16 22:17:08.86642
213	12	194	2025-06-16 22:17:08.86642
214	12	195	2025-06-16 22:17:08.86642
215	12	196	2025-06-16 22:17:08.86642
216	12	197	2025-06-16 22:17:08.86642
217	12	198	2025-06-16 22:17:08.86642
218	12	199	2025-06-16 22:17:08.86642
219	12	200	2025-06-16 22:17:08.86642
220	12	201	2025-06-16 22:17:08.86642
221	12	202	2025-06-16 22:17:08.86642
222	12	203	2025-06-16 22:17:08.86642
223	12	204	2025-06-16 22:17:08.86642
224	12	205	2025-06-16 22:17:08.86642
225	12	206	2025-06-16 22:17:08.86642
226	12	207	2025-06-16 22:17:08.86642
227	12	208	2025-06-16 22:17:08.86642
228	12	209	2025-06-16 22:17:08.86642
229	12	210	2025-06-16 22:17:08.86642
230	6	211	2025-06-16 22:17:20.704123
231	11	212	2025-06-16 22:17:20.704123
232	11	213	2025-06-16 22:17:20.704123
233	11	214	2025-06-16 22:17:20.704123
234	8	215	2025-06-16 22:17:20.704123
235	8	216	2025-06-16 22:17:20.704123
236	16	217	2025-06-16 22:17:20.704123
237	15	218	2025-06-16 22:17:20.704123
238	15	219	2025-06-16 22:17:20.704123
239	10	220	2025-06-16 22:17:20.704123
240	10	221	2025-06-16 22:17:20.704123
241	10	222	2025-06-16 22:17:20.704123
242	10	223	2025-06-16 22:17:20.704123
243	19	262	2025-06-17 11:09:24.332001
244	19	260	2025-06-17 11:09:24.332001
245	13	274	2025-06-17 11:09:24.332001
246	7	294	2025-06-17 11:09:24.332001
247	17	289	2025-06-17 11:09:24.332001
248	20	265	2025-06-17 11:09:24.332001
249	18	259	2025-06-17 11:09:24.332001
250	17	282	2025-06-17 11:09:24.332001
251	7	298	2025-06-17 11:09:24.332001
252	20	266	2025-06-17 11:09:24.332001
253	19	263	2025-06-17 11:09:24.332001
254	7	304	2025-06-17 11:09:24.332001
255	7	296	2025-06-17 11:09:24.332001
256	7	297	2025-06-17 11:09:24.332001
257	7	292	2025-06-17 11:09:24.332001
258	7	302	2025-06-17 11:09:24.332001
259	17	283	2025-06-17 11:09:24.332001
260	17	281	2025-06-17 11:09:24.332001
261	17	279	2025-06-17 11:09:24.332001
262	7	300	2025-06-17 11:09:24.332001
263	17	285	2025-06-17 11:09:24.332001
264	13	273	2025-06-17 11:09:24.332001
265	17	280	2025-06-17 11:09:24.332001
266	7	306	2025-06-17 11:09:24.332001
267	21	270	2025-06-17 11:09:24.332001
268	13	276	2025-06-17 11:09:24.332001
269	17	278	2025-06-17 11:09:24.332001
270	7	293	2025-06-17 11:09:24.332001
271	21	271	2025-06-17 11:09:24.332001
272	19	261	2025-06-17 11:09:24.332001
273	18	258	2025-06-17 11:09:24.332001
274	7	303	2025-06-17 11:09:24.332001
275	7	295	2025-06-17 11:09:24.332001
276	17	284	2025-06-17 11:09:24.332001
277	7	305	2025-06-17 11:09:24.332001
278	17	287	2025-06-17 11:09:24.332001
279	13	275	2025-06-17 11:09:24.332001
280	21	272	2025-06-17 11:09:24.332001
281	21	268	2025-06-17 11:09:24.332001
282	17	286	2025-06-17 11:09:24.332001
283	20	267	2025-06-17 11:09:24.332001
284	13	277	2025-06-17 11:09:24.332001
285	21	269	2025-06-17 11:09:24.332001
286	19	264	2025-06-17 11:09:24.332001
287	7	299	2025-06-17 11:09:24.332001
288	7	291	2025-06-17 11:09:24.332001
289	17	290	2025-06-17 11:09:24.332001
290	17	288	2025-06-17 11:09:24.332001
291	7	301	2025-06-17 11:09:24.332001
\.


--
-- Data for Name: partner_products; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.partner_products (id, partner_id, product_id, created_at, updated_at) FROM stdin;
52	1	55	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
53	1	56	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
54	1	57	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
55	1	58	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
56	1	60	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
57	1	61	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
58	1	62	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
59	1	63	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
60	1	64	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
61	1	65	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
62	1	66	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
63	1	67	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
64	1	68	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
65	1	69	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
66	1	70	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
67	1	71	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
68	1	72	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
69	1	73	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
70	1	74	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
71	1	75	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
72	1	76	2025-07-06 15:06:56.87506	2025-07-06 15:06:56.87506
73	43	55	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
74	43	56	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
75	43	57	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
76	43	58	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
77	43	60	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
78	43	61	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
79	43	62	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
80	43	63	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
81	43	64	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
82	43	65	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
83	43	66	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
84	43	67	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
85	43	68	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
86	43	69	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
87	43	70	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
88	43	71	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
89	43	72	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
90	43	73	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
91	43	74	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
92	43	75	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
93	43	76	2025-07-16 08:42:06.194738	2025-07-16 08:42:06.194738
115	26	55	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
116	26	56	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
117	26	57	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
118	26	58	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
119	26	60	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
120	26	61	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
121	26	62	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
122	26	63	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
123	26	64	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
124	26	65	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
125	26	66	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
126	26	67	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
127	26	68	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
128	26	69	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
129	26	70	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
130	26	71	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
131	26	72	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
132	26	73	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
133	26	74	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
134	26	75	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
135	26	76	2025-07-16 14:14:52.612809	2025-07-16 14:14:52.612809
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.partners (id, name, description, owner_id, created_at, updated_at, status, location, contact_email, primary_contact, region, assigned_user_ids, linked_opportunity_ids) FROM stdin;
2	Quick Insurance Solutions	Fast-growing agency specializing in personal lines	1	2025-06-05 14:01:21.867762	2025-06-05 14:01:21.867762	active	Rotterdam	info@quickinsurance.nl	Maria van der Berg	North	{}	{}
3	Premium Risk Management	High-end risk management consultancy	1	2025-06-05 14:01:21.867762	2025-06-05 14:01:21.867762	active	Utrecht	contact@premiumrisk.nl	Pieter Janssen	Central	{}	{}
12	Mevas BV	Insurance services from Excel import	6	2025-06-16 21:25:59.816768	2025-06-17 14:28:18.175409	active	Netherlands	contact@mevas.nl	Contact Person	Central	{}	{165,166,167,168,169,170,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,198,199,200,201,202,203,204,205,206,207,208,209,210,152,153,154,155,156,157,158,159,160,161,162,163,164,171,172,173,191,192,193,194,195,196,197}
5	Independent Insurance Advisors	Boutique advisory firm for complex risks	1	2025-06-05 14:01:21.867762	2025-06-05 14:01:21.867762	active	Eindhoven	contact@independent-advisors.nl	Tom Smit	South	{}	{}
1	Willis B.V	Large insurance brokerage with focus on commercial lines	1	2025-06-05 14:01:21.867762	2025-06-05 14:01:21.867762	active	Amsterdam	contact@abc-insurance.nl	Jan de Vries	North	{}	{}
4	Regional Insurance Partners	Multi-location insurance agency group	1	2025-06-05 14:01:21.867762	2025-06-05 14:01:21.867762	active	The Hague	info@regionalpartners.nl	Anna Bakker	Central	{}	{1,2,3,4,5,7,8,9,10,11,12,13,14,15,16}
6	Aon (v.h.Meeus)	Insurance broker from Excel import	1	2025-06-16 21:25:59.816768	2025-06-16 21:25:59.816768	active	Netherlands	contact@aon.nl	Contact Person	Central	{}	{211}
8	HDB Risicobeheer BV	Risk management from Excel import	1	2025-06-16 21:25:59.816768	2025-06-16 21:25:59.816768	active	Netherlands	contact@hdb.nl	Contact Person	Central	{}	{215,216}
9	Klap B.V.	Insurance services from Excel import	1	2025-06-16 21:25:59.816768	2025-06-16 21:25:59.816768	active	Netherlands	contact@klap.nl	Contact Person	Central	{}	{150,151}
10	Leenders & Gielen Assurantien	Insurance broker from Excel import	1	2025-06-16 21:25:59.816768	2025-06-16 21:25:59.816768	active	Netherlands	contact@leendersgielen.nl	Contact Person	Central	{}	{220,221,222,223}
11	Meijers Assurantien	Insurance services from Excel import	1	2025-06-16 21:25:59.816768	2025-06-16 21:25:59.816768	active	Netherlands	contact@meijers.nl	Contact Person	Central	{}	{212,213,214}
13	Schouten Zekerheid Mak in Ass BV	Insurance broker from Excel import	1	2025-06-16 21:25:59.816768	2025-06-16 21:25:59.816768	active	Netherlands	contact@schoutenzekerheid.nl	Contact Person	Central	{}	{121,122,123,124,125,126,273,274,275,276,277}
15	Van den Berk Assurantien B.V.	Insurance broker from Excel import	1	2025-06-16 21:25:59.816768	2025-06-16 21:25:59.816768	active	Netherlands	contact@vandenberk.nl	Contact Person	Central	{}	{218,219}
16	Wonen & Welzijn Assurantien BV	Specialized insurance from Excel import	1	2025-06-16 21:25:59.816768	2025-06-16 21:25:59.816768	active	Netherlands	contact@wonenwelzijn.nl	Contact Person	Central	{}	{217}
17	Zicht B.V.	Insurance services from Excel import	1	2025-06-16 21:25:59.816768	2025-06-16 21:25:59.816768	active	Netherlands	contact@zicht.nl	Contact Person	Central	{}	{138,139,140,141,127,128,129,130,131,132,133,134,135,278,279,280,281,282,283,284,285,286,287,288,289,290,136,137}
18	Aon Consulting Corp. Wellness	Insurance broker specializing in solar panel coverage	\N	2025-06-16 23:05:12.355575	2025-06-16 23:05:12.355575	active	\N	\N	\N	\N	{}	{258,259}
19	Aon Risico Management	Insurance broker specializing in solar panel coverage	\N	2025-06-16 23:05:13.650866	2025-06-16 23:05:13.650866	active	\N	\N	\N	\N	{}	{260,261,262,263,264}
20	Techniek Nederland Verz.	Insurance broker specializing in solar panel coverage	\N	2025-06-16 23:05:16.472128	2025-06-16 23:05:16.472128	active	\N	\N	\N	\N	{}	{265,266,267}
21	Eijgendaal & van Romondt B.V.	Insurance broker specializing in solar panel coverage	\N	2025-06-16 23:06:23.095679	2025-06-16 23:06:23.095679	active	\N	\N	\N	\N	{}	{268,269,270,271,272}
26	Induver	Insurance broker	\N	2025-06-23 10:15:55.401676	2025-06-23 10:15:55.401676	active	\N	\N	\N	\N	{}	{}
27	Van Breda	Insurance broker	\N	2025-06-23 10:15:55.401676	2025-06-23 10:15:55.401676	active	\N	\N	\N	\N	{}	{}
28	Hermans Financial Agents	Financial services broker	\N	2025-06-23 10:15:55.401676	2025-06-23 10:15:55.401676	active	\N	\N	\N	\N	{}	{}
31	Helix Verzekeringen	Insurance broker	\N	2025-06-23 10:15:55.401676	2025-06-23 10:15:55.401676	active	\N	\N	\N	\N	{}	{}
32	BARBUSS	Insurance broker	\N	2025-06-23 10:15:55.401676	2025-06-23 10:15:55.401676	active	\N	\N	\N	\N	{}	{}
33	Concordia NV	Insurance services	\N	2025-06-23 10:15:55.401676	2025-06-23 10:15:55.401676	active	\N	\N	\N	\N	{}	{}
35	De Goudse	Dutch insurance company	\N	2025-07-16 08:06:43.053703	2025-07-16 08:06:43.053703	active	Netherlands	\N	\N	Europe	{}	{}
36	NN Group	Dutch insurance and investment company	\N	2025-07-16 08:06:43.053703	2025-07-16 08:06:43.053703	active	Netherlands	\N	\N	Europe	{}	{}
37	Allianz	European insurance and asset management company	\N	2025-07-16 08:06:43.053703	2025-07-16 08:06:43.053703	active	Germany	\N	\N	Europe	{}	{}
38	Baloise	Swiss insurance company	\N	2025-07-16 08:06:43.053703	2025-07-16 08:06:43.053703	active	Switzerland	\N	\N	Europe	{}	{}
39	AG Insurance	Belgian insurance company	\N	2025-07-16 08:06:43.053703	2025-07-16 08:06:43.053703	active	Belgium	\N	\N	Europe	{}	{}
40	Concordia Gent	Concordia insurance office in Gent	\N	2025-07-16 08:35:12.068768	2025-07-16 08:35:12.068768	active	Gent, Belgium	gent@concordia.be	Jan Vermeulen	Flanders	{}	{}
41	Concordia NATO	Concordia insurance office serving NATO personnel	\N	2025-07-16 08:35:12.068768	2025-07-16 08:35:12.068768	active	Brussels, Belgium	nato@concordia.be	Marie Dubois	Brussels	{}	{}
42	Concordia Antwerpen	Concordia insurance office in Antwerp	\N	2025-07-16 08:35:12.068768	2025-07-16 08:35:12.068768	active	Antwerpen, Belgium	antwerpen@concordia.be	Pieter De Vries	Flanders	{}	{}
43	Concordia Brussel	Concordia insurance office in Brussels	\N	2025-07-16 08:35:12.068768	2025-07-16 08:35:12.068768	active	Brussels, Belgium	brussel@concordia.be	Sophie Laurent	Brussels	{}	{}
44	Concordia Oostende	Concordia insurance office in Oostende	\N	2025-07-16 08:35:12.068768	2025-07-16 08:35:12.068768	active	Oostende, Belgium	oostende@concordia.be	Koen Janssens	Flanders	{}	{}
45	Concordia Mont-Saint-Guibert	Concordia insurance office in Mont-Saint-Guibert	\N	2025-07-16 08:35:12.068768	2025-07-16 08:35:12.068768	active	Mont-Saint-Guibert, Belgium	msg@concordia.be	Isabelle Martin	Wallonia	{}	{}
46	Concordia Liège	Concordia insurance office in Liège	\N	2025-07-16 08:35:18.732505	2025-07-16 08:35:18.732505	active	Liège, Belgium	liege@concordia.be	François Dupont	Wallonia	{}	{}
\.


--
-- Data for Name: product_customers; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.product_customers (id, product_id, customer_id, created_at) FROM stdin;
2840	57	207	2025-07-16 14:35:12.820759
2841	60	207	2025-07-16 14:35:12.820759
2842	62	207	2025-07-16 14:35:12.820759
2843	63	207	2025-07-16 14:35:12.820759
2844	66	207	2025-07-16 14:35:12.820759
2845	67	207	2025-07-16 14:35:12.820759
2846	69	207	2025-07-16 14:35:12.820759
2847	72	207	2025-07-16 14:35:12.820759
2848	73	207	2025-07-16 14:35:12.820759
2849	75	207	2025-07-16 14:35:12.820759
2850	56	62	2025-07-16 14:35:12.820759
2851	57	62	2025-07-16 14:35:12.820759
2852	62	62	2025-07-16 14:35:12.820759
2853	64	62	2025-07-16 14:35:12.820759
2854	65	62	2025-07-16 14:35:12.820759
2855	67	62	2025-07-16 14:35:12.820759
2856	68	62	2025-07-16 14:35:12.820759
2857	71	62	2025-07-16 14:35:12.820759
2858	72	62	2025-07-16 14:35:12.820759
2859	74	62	2025-07-16 14:35:12.820759
2860	55	246	2025-07-16 14:35:12.820759
2861	56	246	2025-07-16 14:35:12.820759
2862	57	246	2025-07-16 14:35:12.820759
2863	60	246	2025-07-16 14:35:12.820759
2864	61	246	2025-07-16 14:35:12.820759
2865	62	246	2025-07-16 14:35:12.820759
2866	63	246	2025-07-16 14:35:12.820759
2867	66	246	2025-07-16 14:35:12.820759
2868	69	246	2025-07-16 14:35:12.820759
2869	71	246	2025-07-16 14:35:12.820759
2870	72	246	2025-07-16 14:35:12.820759
2871	75	246	2025-07-16 14:35:12.820759
2872	76	246	2025-07-16 14:35:12.820759
2873	55	55	2025-07-16 14:35:12.820759
2874	57	55	2025-07-16 14:35:12.820759
2875	58	55	2025-07-16 14:35:12.820759
2876	60	55	2025-07-16 14:35:12.820759
2877	61	55	2025-07-16 14:35:12.820759
2878	64	55	2025-07-16 14:35:12.820759
2879	65	55	2025-07-16 14:35:12.820759
2880	67	55	2025-07-16 14:35:12.820759
2881	70	55	2025-07-16 14:35:12.820759
2882	71	55	2025-07-16 14:35:12.820759
2883	73	55	2025-07-16 14:35:12.820759
2884	75	55	2025-07-16 14:35:12.820759
2885	76	55	2025-07-16 14:35:12.820759
2886	55	208	2025-07-16 14:35:12.820759
2887	58	208	2025-07-16 14:35:12.820759
2888	61	208	2025-07-16 14:35:12.820759
2889	63	208	2025-07-16 14:35:12.820759
2890	64	208	2025-07-16 14:35:12.820759
2891	65	208	2025-07-16 14:35:12.820759
2892	67	208	2025-07-16 14:35:12.820759
2893	68	208	2025-07-16 14:35:12.820759
2894	70	208	2025-07-16 14:35:12.820759
2895	72	208	2025-07-16 14:35:12.820759
2896	73	208	2025-07-16 14:35:12.820759
2897	76	208	2025-07-16 14:35:12.820759
2898	56	56	2025-07-16 14:35:12.820759
2899	61	56	2025-07-16 14:35:12.820759
2900	62	56	2025-07-16 14:35:12.820759
2901	63	56	2025-07-16 14:35:12.820759
2902	65	56	2025-07-16 14:35:12.820759
2903	66	56	2025-07-16 14:35:12.820759
2904	68	56	2025-07-16 14:35:12.820759
2905	70	56	2025-07-16 14:35:12.820759
2906	71	56	2025-07-16 14:35:12.820759
2907	74	56	2025-07-16 14:35:12.820759
2908	76	56	2025-07-16 14:35:12.820759
2909	55	58	2025-07-16 14:35:12.820759
2910	58	58	2025-07-16 14:35:12.820759
2911	61	58	2025-07-16 14:35:12.820759
2912	63	58	2025-07-16 14:35:12.820759
2913	64	58	2025-07-16 14:35:12.820759
2914	67	58	2025-07-16 14:35:12.820759
2915	68	58	2025-07-16 14:35:12.820759
2916	70	58	2025-07-16 14:35:12.820759
2917	73	58	2025-07-16 14:35:12.820759
2918	75	58	2025-07-16 14:35:12.820759
2919	76	58	2025-07-16 14:35:12.820759
2920	56	261	2025-07-16 14:35:12.820759
2921	57	261	2025-07-16 14:35:12.820759
2922	60	261	2025-07-16 14:35:12.820759
2923	61	261	2025-07-16 14:35:12.820759
2924	63	261	2025-07-16 14:35:12.820759
2925	66	261	2025-07-16 14:35:12.820759
2926	68	261	2025-07-16 14:35:12.820759
2927	69	261	2025-07-16 14:35:12.820759
2928	71	261	2025-07-16 14:35:12.820759
2929	72	261	2025-07-16 14:35:12.820759
2930	75	261	2025-07-16 14:35:12.820759
2931	76	261	2025-07-16 14:35:12.820759
2932	55	57	2025-07-16 14:35:12.820759
2933	57	57	2025-07-16 14:35:12.820759
2934	60	57	2025-07-16 14:35:12.820759
2935	62	57	2025-07-16 14:35:12.820759
2936	63	57	2025-07-16 14:35:12.820759
2937	66	57	2025-07-16 14:35:12.820759
2938	67	57	2025-07-16 14:35:12.820759
2939	69	57	2025-07-16 14:35:12.820759
2940	72	57	2025-07-16 14:35:12.820759
2941	75	57	2025-07-16 14:35:12.820759
2942	76	57	2025-07-16 14:35:12.820759
2943	55	61	2025-07-16 14:35:12.820759
2944	56	61	2025-07-16 14:35:12.820759
2945	58	61	2025-07-16 14:35:12.820759
2946	61	61	2025-07-16 14:35:12.820759
2947	64	61	2025-07-16 14:35:12.820759
2948	65	61	2025-07-16 14:35:12.820759
2949	66	61	2025-07-16 14:35:12.820759
2950	67	61	2025-07-16 14:35:12.820759
2951	70	61	2025-07-16 14:35:12.820759
2952	71	61	2025-07-16 14:35:12.820759
2953	72	61	2025-07-16 14:35:12.820759
2954	73	61	2025-07-16 14:35:12.820759
2955	76	61	2025-07-16 14:35:12.820759
2956	57	237	2025-07-16 14:35:12.820759
2957	60	237	2025-07-16 14:35:12.820759
2958	62	237	2025-07-16 14:35:12.820759
2959	63	237	2025-07-16 14:35:12.820759
2960	64	237	2025-07-16 14:35:12.820759
2961	66	237	2025-07-16 14:35:12.820759
2962	67	237	2025-07-16 14:35:12.820759
2963	69	237	2025-07-16 14:35:12.820759
2964	71	237	2025-07-16 14:35:12.820759
2965	72	237	2025-07-16 14:35:12.820759
2966	75	237	2025-07-16 14:35:12.820759
2967	55	244	2025-07-16 14:35:12.820759
2968	57	244	2025-07-16 14:35:12.820759
2969	58	244	2025-07-16 14:35:12.820759
2970	61	244	2025-07-16 14:35:12.820759
2971	64	244	2025-07-16 14:35:12.820759
2972	67	244	2025-07-16 14:35:12.820759
2973	69	244	2025-07-16 14:35:12.820759
2974	70	244	2025-07-16 14:35:12.820759
2975	71	244	2025-07-16 14:35:12.820759
2976	73	244	2025-07-16 14:35:12.820759
2977	74	244	2025-07-16 14:35:12.820759
2978	76	244	2025-07-16 14:35:12.820759
2979	56	209	2025-07-16 14:35:12.820759
2980	57	209	2025-07-16 14:35:12.820759
2981	62	209	2025-07-16 14:35:12.820759
2982	64	209	2025-07-16 14:35:12.820759
2983	65	209	2025-07-16 14:35:12.820759
2984	68	209	2025-07-16 14:35:12.820759
2985	69	209	2025-07-16 14:35:12.820759
2986	71	209	2025-07-16 14:35:12.820759
2987	74	209	2025-07-16 14:35:12.820759
2988	55	259	2025-07-16 14:35:12.820759
2989	56	259	2025-07-16 14:35:12.820759
2990	58	259	2025-07-16 14:35:12.820759
2991	61	259	2025-07-16 14:35:12.820759
2992	63	259	2025-07-16 14:35:12.820759
2993	64	259	2025-07-16 14:35:12.820759
2994	67	259	2025-07-16 14:35:12.820759
2995	69	259	2025-07-16 14:35:12.820759
2996	70	259	2025-07-16 14:35:12.820759
2997	73	259	2025-07-16 14:35:12.820759
2998	74	259	2025-07-16 14:35:12.820759
2999	76	259	2025-07-16 14:35:12.820759
3000	57	54	2025-07-16 14:35:12.820759
3001	58	54	2025-07-16 14:35:12.820759
3002	60	54	2025-07-16 14:35:12.820759
3003	63	54	2025-07-16 14:35:12.820759
3004	64	54	2025-07-16 14:35:12.820759
3005	65	54	2025-07-16 14:35:12.820759
3006	66	54	2025-07-16 14:35:12.820759
3007	69	54	2025-07-16 14:35:12.820759
3008	72	54	2025-07-16 14:35:12.820759
3009	74	54	2025-07-16 14:35:12.820759
3010	75	54	2025-07-16 14:35:12.820759
3011	55	262	2025-07-16 14:35:12.820759
3012	57	262	2025-07-16 14:35:12.820759
3013	58	262	2025-07-16 14:35:12.820759
3014	60	262	2025-07-16 14:35:12.820759
3015	61	262	2025-07-16 14:35:12.820759
3016	62	262	2025-07-16 14:35:12.820759
3017	64	262	2025-07-16 14:35:12.820759
3018	67	262	2025-07-16 14:35:12.820759
3019	70	262	2025-07-16 14:35:12.820759
3020	72	262	2025-07-16 14:35:12.820759
3021	73	262	2025-07-16 14:35:12.820759
3022	74	262	2025-07-16 14:35:12.820759
3023	76	262	2025-07-16 14:35:12.820759
3024	56	206	2025-07-16 14:35:12.820759
3025	60	206	2025-07-16 14:35:12.820759
3026	61	206	2025-07-16 14:35:12.820759
3027	62	206	2025-07-16 14:35:12.820759
3028	65	206	2025-07-16 14:35:12.820759
3029	66	206	2025-07-16 14:35:12.820759
3030	67	206	2025-07-16 14:35:12.820759
3031	68	206	2025-07-16 14:35:12.820759
3032	71	206	2025-07-16 14:35:12.820759
3033	74	206	2025-07-16 14:35:12.820759
3034	76	206	2025-07-16 14:35:12.820759
3035	55	60	2025-07-16 14:35:12.820759
3036	57	60	2025-07-16 14:35:12.820759
3037	60	60	2025-07-16 14:35:12.820759
3038	63	60	2025-07-16 14:35:12.820759
3039	65	60	2025-07-16 14:35:12.820759
3040	66	60	2025-07-16 14:35:12.820759
3041	69	60	2025-07-16 14:35:12.820759
3042	70	60	2025-07-16 14:35:12.820759
3043	72	60	2025-07-16 14:35:12.820759
3044	73	60	2025-07-16 14:35:12.820759
3045	75	60	2025-07-16 14:35:12.820759
3046	55	245	2025-07-16 14:35:12.820759
3047	56	245	2025-07-16 14:35:12.820759
3048	60	245	2025-07-16 14:35:12.820759
3049	62	245	2025-07-16 14:35:12.820759
3050	63	245	2025-07-16 14:35:12.820759
3051	65	245	2025-07-16 14:35:12.820759
3052	68	245	2025-07-16 14:35:12.820759
3053	70	245	2025-07-16 14:35:12.820759
3054	71	245	2025-07-16 14:35:12.820759
3055	74	245	2025-07-16 14:35:12.820759
3056	75	245	2025-07-16 14:35:12.820759
3057	56	263	2025-07-16 14:35:12.820759
3058	58	263	2025-07-16 14:35:12.820759
3059	62	263	2025-07-16 14:35:12.820759
3060	63	263	2025-07-16 14:35:12.820759
3061	65	263	2025-07-16 14:35:12.820759
3062	66	263	2025-07-16 14:35:12.820759
3063	68	263	2025-07-16 14:35:12.820759
3064	71	263	2025-07-16 14:35:12.820759
3065	73	263	2025-07-16 14:35:12.820759
3066	74	263	2025-07-16 14:35:12.820759
3067	56	59	2025-07-16 14:35:12.820759
3068	60	59	2025-07-16 14:35:12.820759
3069	62	59	2025-07-16 14:35:12.820759
3070	64	59	2025-07-16 14:35:12.820759
3071	65	59	2025-07-16 14:35:12.820759
3072	67	59	2025-07-16 14:35:12.820759
3073	68	59	2025-07-16 14:35:12.820759
3074	69	59	2025-07-16 14:35:12.820759
3075	71	59	2025-07-16 14:35:12.820759
3076	74	59	2025-07-16 14:35:12.820759
3077	55	260	2025-07-16 14:35:12.820759
3078	56	260	2025-07-16 14:35:12.820759
3079	60	260	2025-07-16 14:35:12.820759
3080	62	260	2025-07-16 14:35:12.820759
3081	65	260	2025-07-16 14:35:12.820759
3082	68	260	2025-07-16 14:35:12.820759
3083	69	260	2025-07-16 14:35:12.820759
3084	70	260	2025-07-16 14:35:12.820759
3085	71	260	2025-07-16 14:35:12.820759
3086	74	260	2025-07-16 14:35:12.820759
3087	75	260	2025-07-16 14:35:12.820759
3088	76	260	2025-07-16 14:35:12.820759
\.


--
-- Data for Name: product_templates; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.product_templates (id, product_id, name, description, category_id, category, provider_id, provider_type, provider_name, contract_start_date, contract_end_date, average_price, premium_value, premium_percentage, discount, discount_percentage, vendor_id, is_active, notes, tags, created_at, updated_at) FROM stdin;
64	BEDR-001	Bedrijfsaansprakelijkheid Basis	Basis bedrijfsaansprakelijkheidsverzekering	78	\N	\N	\N	De Goudse	2024-01-01	2024-12-31	1250.00	75000.00	2.50	\N	0.00	\N	t	\N	\N	2025-07-08 16:52:59.222581	2025-07-08 16:52:59.222581
65	BEDR-002	Bedrijfsaansprakelijkheid Premium	Premium bedrijfsaansprakelijkheidsverzekering	78	\N	\N	\N	NN Group	2024-01-01	2024-12-31	2150.00	135000.00	3.20	\N	10.00	\N	t	\N	\N	2025-07-08 16:52:59.222581	2025-07-08 16:52:59.222581
66	BRAND-001	Brandverzekering Kantoor	Brandverzekering voor kantoorpanden	78	\N	\N	\N	NN Group	2024-01-01	2024-12-31	890.00	65000.00	1.80	\N	5.00	\N	t	\N	\N	2025-07-08 16:52:59.222581	2025-07-08 16:52:59.222581
67	COLL-001	Collectieve Zorgverzekering	Collectieve zorgverzekering voor werknemers	77	\N	\N	\N	NN Group	2024-01-01	2024-12-31	2850.00	125000.00	4.10	\N	15.00	\N	t	\N	\N	2025-07-08 16:52:59.222581	2025-07-08 16:52:59.222581
68	PENS-001	Pensioenregeling Basis	Basis pensioenregeling voor werknemers	77	\N	\N	\N	NN Group	2024-01-01	2024-12-31	4200.00	210000.00	5.50	\N	0.00	\N	t	\N	\N	2025-07-08 16:52:59.222581	2025-07-08 16:52:59.222581
69	AO-001	Arbeidsongeschiktheid Collectief	Collectieve arbeidsongeschiktheidsverzekering	77	\N	\N	\N	NN Group	2024-01-01	2024-12-31	1680.00	89000.00	3.80	\N	8.00	\N	t	\N	\N	2025-07-08 16:52:59.222581	2025-07-08 16:52:59.222581
70	PENS-002	Pensioen Individueel	Individuele pensioenregeling	76	\N	\N	\N	NN Group	2024-01-01	2024-12-31	3500.00	280000.00	6.20	\N	0.00	\N	t	\N	\N	2025-07-08 16:52:59.222581	2025-07-08 16:52:59.222581
71	LIJF-001	Lijfrente Verzekering	Individuele lijfrenteverzekering	76	\N	\N	\N	NN Group	2024-01-01	2024-12-31	2900.00	340000.00	4.90	\N	12.00	\N	t	\N	\N	2025-07-08 16:52:59.222581	2025-07-08 16:52:59.222581
72	RECHT-001	Rechtsbijstand Bedrijf	Rechtsbijstandsverzekering voor bedrijven	79	\N	\N	\N	NN Group	2024-01-01	2024-12-31	450.00	45000.00	1.20	\N	0.00	\N	t	\N	\N	2025-07-08 16:52:59.222581	2025-07-08 16:52:59.222581
73	CYBER-001	Cyber Risico Verzekering	Cyberverzekering voor bedrijven	79	\N	\N	\N	NN Group	2024-01-01	2024-12-31	1850.00	180000.00	7.50	\N	20.00	\N	t	\N	\N	2025-07-08 16:52:59.222581	2025-07-08 16:52:59.222581
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.products (id, name, description, category, vendor_id, created_at, updated_at, category_id, tag_id, contract_start_date, contract_end_date, premium_value, premium_percentage, discount_percentage, total_value) FROM stdin;
55	NN Premie Pensioen Plan	Flexibel premiepensioen voor werkgevers	NN PPP	\N	2025-07-06 15:04:38.763065	2025-07-06 15:04:38.763065	80	\N	2024-01-01	2025-12-31	30645.00	15.00	4.00	35241.75
56	Bewust Pensioen Plus Regeling	Duurzaam pensioen met ESG-investeringen	Bewust Pensioen Plus	\N	2025-07-06 15:04:38.837297	2025-07-06 15:04:38.837297	81	\N	2024-01-01	2025-12-31	20788.00	11.00	1.00	23074.68
57	Netto Pensioen Arrangement	Fiscaal voordelige pensioenregeling	Netto Pensioen	\N	2025-07-06 15:04:38.912359	2025-07-06 15:04:38.912359	82	\N	2024-01-01	2025-12-31	35625.00	9.00	5.00	38831.25
58	Garant Pensioen Plan Basis	Gegarandeerde pensioenopbouw	Garant Pensioen Plan	\N	2025-07-06 15:04:38.986357	2025-07-06 15:04:38.986357	83	\N	2024-01-01	2025-12-31	55013.00	17.00	5.00	64365.21
59	Premie Pensioen Plan Collectief	Collectieve premieregeling voor bedrijven	PPPc	\N	2025-07-06 15:04:39.06054	2025-07-06 15:04:39.06054	84	\N	2024-01-01	2025-12-31	27175.00	6.00	2.00	28805.50
60	WGA Eigen Risico Drager	WGA eigenrisicodragerschap verzekering	WGA ERD	\N	2025-07-06 15:04:39.135588	2025-07-06 15:04:39.135588	85	\N	2024-01-01	2025-12-31	49608.00	15.00	3.00	57049.20
61	WGA Hiaatverzekering	Aanvulling op WGA-uitkering	WGA Hiaat	\N	2025-07-06 15:04:39.210186	2025-07-06 15:04:39.210186	86	\N	2024-01-01	2025-12-31	44597.00	8.00	1.00	48164.76
62	WIA Excedentdekking	Aanvullende WIA-dekking boven wettelijk kader	WIA Excedent	\N	2025-07-06 15:04:39.284743	2025-07-06 15:04:39.284743	87	\N	2024-01-01	2025-12-31	41826.00	5.00	5.00	43917.30
63	WIA Eigen Risico Dekking	WIA eigenrisicodragerschap	WIA ERD	\N	2025-07-06 15:04:39.359945	2025-07-06 15:04:39.359945	88	\N	2024-01-01	2025-12-31	32347.00	10.00	1.00	35581.70
64	Collectieve Verzuimverzekering	Verzekering tegen ziekteverzuim	Verzuimverzekering	\N	2025-07-06 15:04:39.435582	2025-07-06 15:04:39.435582	89	\N	2024-01-01	2025-12-31	57819.00	10.00	0.00	63600.90
65	Ziektewet Eigen Risico	Ziektewet eigenrisicodragerschap	Ziektewet ERD	\N	2025-07-06 15:04:39.512378	2025-07-06 15:04:39.512378	90	\N	2024-01-01	2025-12-31	58353.00	5.00	1.00	61270.65
66	Transport Goederenverzekering	Verzekering voor transport van goederen	Transport-Goederen	\N	2025-07-06 15:04:39.586904	2025-07-06 15:04:39.586904	91	\N	2024-01-01	2025-12-31	32008.00	18.00	4.00	37769.44
67	Bedrijfsaansprakelijkheid	Algemene aansprakelijkheidsverzekering	Aansprakelijkheid Bedrijven	\N	2025-07-06 15:04:39.661751	2025-07-06 15:04:39.661751	92	\N	2024-01-01	2025-12-31	41230.00	6.00	9.00	43703.80
68	Bedrijfsschade Continuïteit	Verzekering tegen bedrijfsonderbreking	Bedrijfsschadeverzekering	\N	2025-07-06 15:04:39.736145	2025-07-06 15:04:39.736145	93	\N	2024-01-01	2025-12-31	11660.00	10.00	5.00	12826.00
69	Brandverzekering Zakelijk	Uitgebreide brandverzekering voor bedrijven	Brandverzekering	\N	2025-07-06 15:04:39.811426	2025-07-06 15:04:39.811426	94	\N	2024-01-01	2025-12-31	47017.00	7.00	0.00	50308.19
70	Wagenpark All-Risk	Volledige dekking voor bedrijfswagens	Wagenparkverzekering	\N	2025-07-06 15:04:39.885697	2025-07-06 15:04:39.885697	95	\N	2024-01-01	2025-12-31	13753.00	15.00	2.00	15815.95
71	CAR Bouwprojecten	Verzekering voor bouwprojecten	Construction All Risk	\N	2025-07-06 15:04:39.96051	2025-07-06 15:04:39.96051	96	\N	2024-01-01	2025-12-31	48484.00	8.00	6.00	52362.72
72	Machinebreuk Industrieel	Verzekering tegen machinebreuk	Machinebreukverzekering	\N	2025-07-06 15:04:40.036209	2025-07-06 15:04:40.036209	97	\N	2024-01-01	2025-12-31	39263.00	11.00	2.00	43581.93
73	Keymanverzekering Directie	Verzekering sleutelpersonen	Keymanverzekering	\N	2025-07-06 15:04:40.117255	2025-07-06 15:04:40.117255	98	\N	2024-01-01	2025-12-31	23613.00	6.00	4.00	25029.78
74	Handelskrediet Verzekering	Bescherming tegen wanbetaling	Kredietverzekering	\N	2025-07-06 15:04:40.191869	2025-07-06 15:04:40.191869	99	\N	2024-01-01	2025-12-31	11588.00	13.00	4.00	13094.44
75	Cyber Security Dekking	Uitgebreide cyberverzekering	Cyberverzekering	\N	2025-07-06 15:04:40.267928	2025-07-06 15:04:40.267928	100	\N	2024-01-01	2025-12-31	19596.00	18.00	0.00	23123.28
76	Rechtsbijstand Ondernemers	Juridische bijstand voor bedrijven	Rechtsbijstandverzekering Zakelijk	\N	2025-07-06 15:04:40.342739	2025-07-06 15:04:40.342739	101	\N	2024-01-01	2025-12-31	38962.00	7.00	9.00	41689.34
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.projects (id, name, description, status, priority, start_date, end_date, estimated_value, actual_value, customer_id, partner_id, project_manager_id, created_by_id, created_at, updated_at) FROM stdin;
1	Digital Transformation Initiative	Complete digital overhaul of customer systems	active	high	2025-01-15	2025-06-30	150000.00	\N	18	1	\N	\N	2025-07-22 06:56:41.991766	2025-07-22 06:56:41.991766
2	Cybersecurity Enhancement Project	Implementing advanced security measures	active	urgent	2025-02-01	2025-04-30	75000.00	\N	19	2	\N	\N	2025-07-22 06:56:41.991766	2025-07-22 06:56:41.991766
3	Cloud Migration Project	Moving infrastructure to cloud services	completed	medium	2024-10-01	2024-12-31	95000.00	\N	20	3	\N	\N	2025-07-22 06:56:41.991766	2025-07-22 06:56:41.991766
4	Process Automation Initiative	Automating manual business processes	active	medium	2025-03-01	2025-08-31	120000.00	\N	21	1	\N	\N	2025-07-22 06:56:41.991766	2025-07-22 06:56:41.991766
5	Data Analytics Platform	Building comprehensive analytics dashboard	on_hold	low	2025-04-01	2025-09-30	80000.00	\N	22	2	\N	\N	2025-07-22 06:56:41.991766	2025-07-22 06:56:41.991766
6	Website Redesign Project	Complete website overhaul for better UX	active	medium	2025-02-15	2025-05-31	45000.00	\N	23	3	\N	\N	2025-07-22 06:56:41.991766	2025-07-22 06:56:41.991766
7	Mobile App Development	Creating customer-facing mobile application	active	high	2025-03-15	2025-07-31	180000.00	\N	24	1	\N	\N	2025-07-22 06:56:41.991766	2025-07-22 06:56:41.991766
8	ERP System Implementation	Implementing new enterprise resource planning system	planning	high	2025-06-01	2025-12-31	250000.00	\N	25	2	\N	\N	2025-07-22 06:56:41.991766	2025-07-22 06:56:41.991766
\.


--
-- Data for Name: saved_lists; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.saved_lists (id, name, description, type, entity_type, members, filters, is_shared, is_default, created_by, created_at, updated_at, partner_id) FROM stdin;
23	Medium-Size Brokers		selection	partners	{6,18,19,7,21,8,9,10,11,12,4,13,20,14,15,17}	{}	f	f	1	2025-06-17 11:44:43.484322	2025-06-17 11:44:43.484322	\N
24	Brokers with 5+ opportunities		selection	partners	{19,21,7,12,13,17}	{}	f	f	1	2025-06-17 11:48:10.56768	2025-06-17 11:48:10.56768	\N
26	Closed (Won) Opportunities		selection	opportunities	{152,153,156,157,158,161,170,191,192}	{}	f	f	1	2025-06-17 12:01:06.074144	2025-06-17 12:01:06.074144	12
31	Rejected opportunities		selection	opportunities	{126,124,123,122}	{}	f	f	1	2025-06-17 12:26:55.907221	2025-06-17 12:26:55.907221	13
50	Cyberverzekering Opportunities	All opportunities related to cyber security and cyber insurance products	search	opportunities	{2,9,11,432,437,514,415,416,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,417,418,464,478}	{"search": "cyberverzekering cyber", "entity_type": "opportunities"}	t	f	1	2025-07-16 14:27:19.969205	2025-07-16 14:27:19.969205	\N
34	Zonnepanelen		selection	opportunities	{155,162,164,166,168,172,177,179,183,189,194,195,196,202,203,205,206,210,163,174,186,187,190,198}	{}	f	f	1	2025-06-17 14:20:01.801623	2025-06-23 11:52:54.789671	12
51	Zonnepanelen Opportunities	All opportunities related to solar panel insurance and renewable energy coverage	search	opportunities	{291,278,263,287,144,154,138,293,292,169,160,151,220,222,162,266,274,268,276,260,272,258,181,175,184,182,185,277,202,121,149,135,299,264,140,146,300,271,221,286,285,142,134,168,167,174,176,180,178,172,183,186,187,282,190,280,188,275,137,279,284,273,132,128,294,133,127,126,122,124,123,129,125,298,147,148,136,143,155,164,166,209,208,217,210,216,211,179,177,206,215,205,203,290,139,212,189,150,171,159,214,288,267,283,204,157,161,141,259,153,170,152,165,173,158,145,198,201,219,199,297,281,156,289,269,270,296,301,295,213,265,218,200,207,262,261,197,193,195,194,196,191,192,223,488,489,163,490,491,492,493,494,495,496,497,498,499,500,501,306,304,305,303,302,455}	{"search": "zonnepanelen solar", "entity_type": "opportunities"}	t	f	1	2025-07-16 14:27:19.969205	2025-07-16 14:27:19.969205	\N
36	Zonnepanelen - 18/6		selection	opportunities	{152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210}	{}	t	f	1	2025-06-18 08:45:37.745944	2025-06-23 11:53:26.361964	12
37	Zonnepanelen - nieuwe lijst		selection	opportunities	{152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210}	{}	t	f	1	2025-06-18 11:15:16.380662	2025-06-18 11:16:01.415687	12
16	Top Partners		selection	partners	{15,16,17,13}	{}	f	f	1	2025-06-17 00:56:25.432769	2025-06-17 00:56:25.432769	\N
38	Team list		selection	partners	{6,7,8,9,10,11,12,4,13,14,15,16,17}	{}	f	f	1	2025-06-19 08:52:19.093198	2025-06-19 08:52:19.093198	\N
39	Einde Termijn		selection	opportunities	{376,377,378,379}	{}	t	f	1	2025-06-23 11:25:53.989039	2025-06-24 12:22:58.290695	26
40	Shared opportunities list		selection	opportunities	{260,261,262}	{}	f	f	1	2025-07-09 08:25:51.018815	2025-07-09 08:25:51.018815	19
42	Retirement Prospects	Find customers approaching retirement who need pension planning	selection	customers	{}	{}	f	f	1	2025-07-12 14:37:14.132703	2025-07-12 14:37:14.132703	\N
43	Retirement Prospects	Find customers approaching retirement who need pension planning	selection	customers	{}	{}	f	f	1	2025-07-12 14:37:16.525589	2025-07-12 14:37:16.525589	\N
44	Retirement Prospects	Find customers approaching retirement who need pension planning	selection	customers	{}	{}	f	f	1	2025-07-12 14:37:56.739592	2025-07-12 14:37:56.739592	\N
46	Test 14/7		selection	opportunities	{152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,468,469,470,471,472,473,474,475}	{}	t	f	1	2025-07-14 11:08:43.36345	2025-07-15 12:57:39.12353	12
47	Insurance Partners	Major insurance companies	selection	partners	{35,36,37,38,39}	{}	f	f	1	2025-07-16 08:04:34.404182	2025-07-16 08:06:49.629778	\N
48	Concordia Offices		selection	partners	{42,43,40,46,45,41,33,44}	{}	f	f	1	2025-07-16 08:39:21.239618	2025-07-16 08:39:21.239618	\N
\.


--
-- Data for Name: saved_views; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.saved_views (id, name, description, entity_type, filters, is_shared, is_default, created_by, created_at, updated_at, members, item_count) FROM stdin;
2	Active Broker		partners	{"status":"active","type":"Broker"}	f	f	1	2025-06-17 01:12:21.32776	2025-06-17 01:12:21.32776	\N	0
4	Team view		partners	{"industry":"Central"}	f	f	1	2025-06-19 08:59:32.290228	2025-06-19 08:59:32.290228	\N	0
5	High Value Prospects	Opportunities in negotiation or proposal stages with high estimated value	opportunities	{"stage": "Negotiation", "searchText": ""}	f	f	1	2025-07-09 09:58:22.999289	2025-07-09 09:58:22.999289	\N	0
6	Active Validated Leads	All validated opportunities that are actively being pursued	opportunities	{"stage": "Validated", "status": "Active", "searchText": ""}	f	f	1	2025-07-09 09:58:22.999289	2025-07-09 09:58:22.999289	\N	0
7	Proposals Sent	All opportunities where proposals have been sent to clients	opportunities	{"stage": "Proposal Sent to Client", "searchText": ""}	f	f	1	2025-07-09 09:58:22.999289	2025-07-09 09:58:22.999289	\N	0
8	Won Opportunities	All closed and won opportunities for analysis	opportunities	{"stage": "Closed (Won)", "searchText": ""}	f	f	1	2025-07-09 09:58:22.999289	2025-07-09 09:58:22.999289	\N	0
9	Rejected Leads Follow-up	Previously rejected opportunities that might be re-approached	opportunities	{"stage": "Rejected", "searchText": ""}	f	f	1	2025-07-09 09:58:22.999289	2025-07-09 09:58:22.999289	\N	0
10	Professional Services Clients	All customers in the professional services industry	customers	{"industry": "Professional Services", "searchText": ""}	f	f	1	2025-07-09 09:58:32.908601	2025-07-09 09:58:32.908601	\N	0
11	Real Estate Portfolio	Customers in real estate and property management sector	customers	{"industry": "Real Estate & Property Management", "searchText": ""}	f	f	1	2025-07-09 09:58:32.908601	2025-07-09 09:58:32.908601	\N	0
12	High-Value Accounts	Premium customers with multiple opportunities	customers	{"searchText": "", "type": "all"}	f	f	1	2025-07-09 09:58:32.908601	2025-07-09 09:58:32.908601	\N	0
13	Construction & Retail Mix	Customers from construction and retail sectors	customers	{"searchText": "construction", "type": "all"}	f	f	1	2025-07-09 09:58:32.908601	2025-07-09 09:58:32.908601	\N	0
14	Technology Sector	All technology-related customers	customers	{"industry": "Technology", "searchText": ""}	f	f	1	2025-07-09 09:58:32.908601	2025-07-09 09:58:32.908601	\N	0
15	Central Region Partners	All active partners in the central region	partners	{"region": "Central", "status": "active", "searchText": ""}	f	f	1	2025-07-09 09:58:43.80711	2025-07-09 09:58:43.80711	\N	0
16	North Region Network	Partnership network in the northern region	partners	{"region": "North", "status": "active", "searchText": ""}	f	f	1	2025-07-09 09:58:43.80711	2025-07-09 09:58:43.80711	\N	0
18	South Region Expansion	Partners in the southern expansion territory	partners	{"region": "South", "searchText": ""}	f	f	1	2025-07-09 09:58:43.80711	2025-07-09 09:58:43.80711	\N	0
19	Key Account Partners	Strategic partnership accounts for major campaigns	partners	{"searchText": "B.V", "status": "active"}	f	f	1	2025-07-09 09:58:43.80711	2025-07-09 09:58:43.80711	\N	0
17	Active Partner Network	All currently active partners across all regions	partners	{"status":"active"}	f	f	1	2025-07-09 09:58:43.80711	2025-07-09 12:55:27.399639	\N	0
20	High-Value Prospects	Opportunities above €50,000 in estimated value	opportunities	{"estimatedValue": {"min": 50000}}	f	f	1	2025-07-12 12:54:05.04866	2025-07-12 12:54:05.04866	{1,5,3,4,15,2,378,377,379,380}	10
21	Cyber Insurance Leads	Opportunities related to cyber security insurance products	opportunities	{"title": {"contains": "cyber"}}	f	f	1	2025-07-12 12:54:05.04866	2025-07-12 12:54:05.04866	{2,11,396,397,398,399,9,400,401,402}	10
22	Recent Opportunities	Opportunities created in the last 30 days	opportunities	{"dateRange": "last30days"}	f	f	1	2025-07-12 12:54:05.04866	2025-07-12 12:54:05.04866	{416,415,417,418,400,401,402,397,398,396}	10
23	Hot Prospects	High probability opportunities (80%+) ready to close	opportunities	{"probability": {"min": 80}}	f	f	1	2025-07-12 12:54:05.04866	2025-07-12 12:54:05.04866	{289,161,297,270,259,296,158,141,152,281}	10
\.


--
-- Data for Name: tag_categories; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.tag_categories (id, name, description, color, created_at, updated_at) FROM stdin;
2	Department	Department and functional area	#3B82F6	2025-07-21 11:56:23.523675	2025-07-21 11:56:23.523675
1	Role	Leadership level and role hierarchy	#8B5CF6	2025-07-21 11:56:23.523675	2025-07-21 11:56:23.523675
3	Type	Contact type classification	#3B82F6	2025-07-21 19:15:45.162403	2025-07-21 19:15:45.162403
\.


--
-- Data for Name: tag_groups; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.tag_groups (id, name, description, color_scheme, is_exclusive, sort_order, created_by_id, created_at, updated_at) FROM stdin;
1	Department	Department tags	blue	t	1	1	2025-07-21 11:31:24.237142	2025-07-21 11:31:24.237142
2	Priority	Priority level tags	red	t	2	1	2025-07-21 11:33:06.717826	2025-07-21 11:33:06.717826
3	Influence	\N	\N	f	3	\N	2025-07-21 11:45:55.509431	2025-07-21 11:45:55.509431
\.


--
-- Data for Name: tag_types; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.tag_types (id, name, description, status, created_at, updated_at) FROM stdin;
1	Product Category	Tags for categorizing products	active	2025-06-20 14:51:12.863242	2025-06-20 14:51:12.863242
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.tags (id, name, description, tag_type_id, parent_tag_id, status, color, created_at, updated_at, group_id, usage_count, created_by_id, category_id, category) FROM stdin;
37	Marketing	\N	1	\N	active	#EC4899	2025-07-21 12:10:58.442178	2025-07-21 12:10:58.442178	\N	0	\N	2	Department
38	Sales	\N	1	\N	active	#10B981	2025-07-21 12:10:58.442178	2025-07-21 12:10:58.442178	\N	0	\N	2	Department
39	HR	\N	1	\N	active	#8B5CF6	2025-07-21 12:10:58.442178	2025-07-21 12:10:58.442178	\N	0	\N	2	Department
40	Operations	\N	1	\N	active	#F59E0B	2025-07-21 12:10:58.442178	2025-07-21 12:10:58.442178	\N	0	\N	2	Department
41	IT	\N	1	\N	active	#3B82F6	2025-07-21 12:10:58.442178	2025-07-21 12:10:58.442178	\N	0	\N	2	Department
53	General Dept	General department category	\N	\N	active	#6B7280	2025-07-21 18:04:47.971286	2025-07-21 18:04:47.971286	\N	0	\N	\N	Department
32	Executive	\N	1	\N	active	#DC2626	2025-07-21 12:10:58.442178	2025-07-21 12:10:58.442178	\N	0	\N	1	Role
33	VP	\N	1	\N	active	#EA580C	2025-07-21 12:10:58.442178	2025-07-21 12:10:58.442178	\N	0	\N	1	Role
35	Manager	\N	1	\N	active	#16A34A	2025-07-21 12:10:58.442178	2025-07-21 12:10:58.442178	\N	0	\N	1	Role
47	Other Role	Other role categories	\N	\N	active	#6B7280	2025-07-21 18:04:47.971286	2025-07-21 18:04:47.971286	\N	0	\N	\N	Role
34	Director		1	\N	active	#0891B2	2025-07-21 12:10:58.442178	2025-07-21 18:33:39.302274	\N	0	\N	1	Role
36	Other	\N	1	\N	active	#6B7280	2025-07-21 12:10:58.442178	2025-07-21 12:10:58.442178	\N	0	\N	1	General
54	User	\N	\N	\N	active	#10B981	2025-07-21 19:15:51.899163	2025-07-21 19:15:51.899163	\N	0	\N	3	\N
55	Guest	\N	\N	\N	active	#F59E0B	2025-07-21 19:15:51.899163	2025-07-21 19:15:51.899163	\N	0	\N	3	\N
56	Customer	\N	\N	\N	active	#3B82F6	2025-07-21 19:15:51.899163	2025-07-21 19:15:51.899163	\N	0	\N	3	\N
\.


--
-- Data for Name: unified_activities; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.unified_activities (id, activity_type, entity_type, entity_id, partner_id, title, description, user_id, metadata, created_at, updated_at) FROM stdin;
1	opportunity_shared	partner	1	4	Opportunities Shared	De Goudse shared 5 opportunities with Regional Insurance Partners	1	{"list_id": 2, "shared_with": "Regional Insurance Partners", "opportunity_count": 5}	2025-06-06 09:50:56.226622	2025-06-06 09:50:56.226622
2	partnership_initiated	partner	1	4	Partnership Initiated	Started collaboration with Regional Insurance Partners	1	{"partner": "Regional Insurance Partners", "collaboration_type": "opportunity_sharing"}	2025-06-06 09:50:56.226622	2025-06-06 09:50:56.226622
3	meeting_scheduled	partner	1	4	Meeting Scheduled	Partnership meeting with Regional Insurance Partners completed	1	{"status": "completed", "meeting_type": "partnership_review"}	2025-06-06 09:50:56.226622	2025-06-06 09:50:56.226622
4	document_shared	partner	1	4	Documents Shared	Shared partnership documents with Regional Insurance Partners	1	{"document_type": "collaboration_terms"}	2025-06-06 09:50:56.226622	2025-06-06 09:50:56.226622
5	status_updated	partner	1	4	Status Updated	Partnership with Regional Insurance Partners updated to active	1	{"new_status": "active", "previous_status": "pending"}	2025-06-06 09:50:56.226622	2025-06-06 09:50:56.226622
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.users (id, name, email, role, partner_id, created_at, updated_at) FROM stdin;
1	John Smith	john.smith@regionalinsurance.com	partner_user	4	2025-06-06 11:27:24.727373	2025-06-06 11:27:24.727373
2	De Goudse Admin	admin@degoudse.nl	admin	1	2025-06-06 11:27:24.727373	2025-06-06 11:27:24.727373
3	Partnership Manager	partnerships@degoudse.nl	partner_manager	1	2025-06-06 11:27:24.727373	2025-06-06 11:27:24.727373
4	Albrecht Bouwman	albrecht.bouwman@degoudse.nl	user	\N	2025-06-16 20:51:55.736507	2025-06-16 20:51:55.736507
5	Alex Salden	alex.salden@degoudse.nl	user	\N	2025-06-16 20:51:55.736507	2025-06-16 20:51:55.736507
6	Arnould de Wasseige	arnould.wasseige@mevas.nl	user	\N	2025-06-17 14:28:11.666696	2025-06-17 14:28:11.666696
7	Eline Segers	eline.segers@degoudse.be	account_manager	\N	2025-06-23 12:49:20.552931	2025-06-23 12:49:20.552931
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: degoudse; Owner: neondb_owner
--

COPY degoudse.vendors (id, name, description, initials, contact_name, contact_email, contact_phone, owner_id, created_at, updated_at) FROM stdin;
1	TechSecure Solutions	Leading cybersecurity technology provider	\N	John Smith	\N	\N	1	2025-06-05 14:14:00.171067	2025-06-05 14:14:00.171067
2	AutoFleet Systems	Commercial vehicle tracking and management	\N	Sarah Johnson	\N	\N	1	2025-06-05 14:14:00.171067	2025-06-05 14:14:00.171067
3	PropertyGuard Inc	Property protection and risk assessment	\N	Michael Brown	\N	\N	1	2025-06-05 14:14:00.171067	2025-06-05 14:14:00.171067
4	WorkSafe Technologies	Workplace safety and compliance solutions	\N	Emily Davis	\N	\N	1	2025-06-05 14:14:00.171067	2025-06-05 14:14:00.171067
5	RiskAnalytics Pro	Advanced risk modeling and analytics	\N	David Wilson	\N	\N	1	2025-06-05 14:14:00.171067	2025-06-05 14:14:00.171067
\.


--
-- Data for Name: activity_attachments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.activity_attachments (id, filename, original_name, file_type, file_size, file_path, url, uploaded_by_id, entity_type, entity_id, related_entity_type, related_entity_id, description, created_at) FROM stdin;
\.


--
-- Data for Name: activity_comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.activity_comments (id, content, author_id, entity_type, entity_id, assigned_to_id, parent_comment_id, related_entity_type, related_entity_id, is_internal, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: activity_reactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.activity_reactions (id, activity_type, activity_id, user_id, emoji, created_at) FROM stdin;
\.


--
-- Data for Name: activity_tasks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.activity_tasks (id, title, description, status, priority, assigned_to_id, assigned_by_id, entity_type, entity_id, related_entity_type, related_entity_id, due_date, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: broker_partner_mappings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.broker_partner_mappings (id, broker_user_id, environment_id, partner_id, broker_partner_name, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: campaign_assignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.campaign_assignments (id, campaign_id, partner_id, assigned_by, assigned_at, access_level, status, notes, created_at, updated_at, partner_status) FROM stdin;
\.


--
-- Data for Name: campaign_emails; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.campaign_emails (id, template_id, subject, follow_up_days, left_logo, right_logo, email_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: campaign_follow_ups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.campaign_follow_ups (id, campaign_id, subject, email_body, delay_days, status, created_at) FROM stdin;
\.


--
-- Data for Name: campaign_recipients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.campaign_recipients (id, campaign_id, contact_id, email, name, status, sent_at, opened_at, clicked_at, created_at) FROM stdin;
\.


--
-- Data for Name: campaign_shares; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.campaign_shares (id, campaign_id, shared_with_type, shared_with_id, access_level, share_message, shared_by_id, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: campaign_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.campaign_templates (id, name, description, objective, entity, icon, status, attachments, created_by, created_at, updated_at, collaboration_enabled) FROM stdin;
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.campaigns (id, name, type, description, template_id, target_entity_type, target_entity_id, partner_id, environment_id, status, created_by, created_at, updated_at, send_at, shared_with, is_ai_generated, engagement_summary, last_sent_at, emails_sent, emails_opened, open_rate, total_clicks, emails, recipients, settings, icon, objective, attachments, partner_status) FROM stdin;
\.


--
-- Data for Name: catalogue_products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.catalogue_products (id, product_id, catalogue_id, category_id, visible, name_override, price_override, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name, color, icon, description, parent_id, level, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: client_products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.client_products (id, client_id, product_id) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.clients (id, name, type, initials) FROM stdin;
\.


--
-- Data for Name: contact_tags; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.contact_tags (id, contact_id, tag_id, tagged_by_id, tagged_at) FROM stdin;
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.contacts (id, first_name, last_name, full_name, email, phone, job_title, department, company, linked_entity_type, linked_entity_id, is_primary, notes, tags, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: custom_environments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.custom_environments (id, name, environment_id, logo_url, is_active, schema_name, description, created_by_id, created_at, updated_at) FROM stdin;
10	Test Environment 4	test-env-4		f	degoudse	Testing 4	2	2025-07-25 10:01:49.89728	2025-07-25 10:01:49.89728
11	Acme TechCorp	Acme-TechCorp	data:image/png;base64,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	t	degoudse	Technology corporation focused on innovation and digital transformation	2	2025-07-25 10:31:50.517816	2025-07-25 15:36:10.988664
12	Qollabi	test-dropdown		f	degoudse	Testing dropdown	2	2025-07-25 10:34:15.828813	2025-07-25 16:39:17.09617
16	Baloise	baloise	@assets/Baloise_1750499789244.png	t	degoudse	Built-in environment - Baloise insurance platform	2	2025-07-25 16:53:42.234967	2025-07-25 16:53:42.234967
17	Nationale Nederlanden	nn	@assets/NN_Group_logo_1751474283145.jpeg	t	degoudse	Built-in environment - NN insurance platform	2	2025-07-25 16:53:42.234967	2025-07-25 16:53:42.234967
18	Concordia	concordia	@assets/images-Concordia_1752649338540.png	t	degoudse	Built-in environment - Concordia insurance platform	2	2025-07-25 16:53:42.234967	2025-07-25 16:53:42.234967
15	De Goudse	degoudse	data:image/jpeg;base64,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	t	degoudse	Built-in environment - De Goudse insurance platform	2	2025-07-25 16:53:42.234967	2025-07-25 17:06:56.184711
13	VanBreda-Huysmans	Qollabi-Test		t	degoudse		2	2025-07-25 16:41:01.760265	2025-07-28 07:23:55.594737
\.


--
-- Data for Name: customer_partners; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customer_partners (id, customer_id, partner_id) FROM stdin;
\.


--
-- Data for Name: customer_product_assignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customer_product_assignments (id, customer_id, product_template_id, custom_price, custom_discount, custom_discount_percentage, custom_premium_percentage, customer_contract_start_date, customer_contract_end_date, assigned_by, assigned_at, is_active, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: customer_team_members; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customer_team_members (id, customer_id, user_id) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.customers (id, name, description, owner_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.documents (id, user_id, filename, file_type, file_size, content, file_path, upload_date, tags) FROM stdin;
\.


--
-- Data for Name: email_blocks; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_blocks (id, email_id, type, content, properties, block_order, created_at) FROM stdin;
\.


--
-- Data for Name: entity_logos; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.entity_logos (id, entity_type, entity_id, environment_id, logo_data, mime_type, original_filename, file_size, uploaded_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: file_comparisons; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.file_comparisons (id, user_id, document1_id, document2_id, comparison_date, differences_summary, differences) FROM stdin;
\.


--
-- Data for Name: insurance_products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.insurance_products (id, name, category) FROM stdin;
\.


--
-- Data for Name: list_collaborators; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.list_collaborators (id, list_id, user_id, email, name, access_level, invited_by_id, invited_at, accepted_at, is_active) FROM stdin;
\.


--
-- Data for Name: news_articles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.news_articles (id, title, content, summary, category, image_url, published_date) FROM stdin;
\.


--
-- Data for Name: next_best_actions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.next_best_actions (id, partner_id, action_type, title, description, priority, confidence, reasoning, status, context_data, suggested_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: okr_comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.okr_comments (id, metric_id, user_id, contact_id, partner_id, comment, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: okr_metrics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.okr_metrics (id, name, description, realized_value, target_value, ytd_value, last_year_value, measure_unit, currency_type, traffic_light_thresholds, progress_bar_thresholds, picklist_options, responsible_user_id, responsible_contact_ids, timeframe_start, timeframe_end, frequency, attachment_url, due_date, is_muted, is_archived, is_shared, hierarchy, parent_id, tags, created_at, updated_at, created_by) FROM stdin;
\.


--
-- Data for Name: okr_tags; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.okr_tags (id, name, color, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: okr_template_assignments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.okr_template_assignments (id, template_id, entity_type, entity_id, assigned_at, assigned_by, status, due_date, responsible_user_id, notes) FROM stdin;
\.


--
-- Data for Name: opportunities; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.opportunities (id, client_id, product_id, probability, estimated_value, title, status, stage, type, description, notes, insurance_description, expected_close_date, start_date, partner_id, owner_id, account_manager_id, created_at, updated_at, assessment_status, assessment_date, assessed_by_id, withhold_reasons, withhold_comments, assessment_notes, interaction_count) FROM stdin;
\.


--
-- Data for Name: opportunity_assessment_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.opportunity_assessment_history (id, opportunity_id, previous_status, new_status, changed_by_id, reasons, comments, changed_at) FROM stdin;
\.


--
-- Data for Name: opportunity_withhold_reasons; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.opportunity_withhold_reasons (id, category, display_name, description, is_active, sort_order, created_at) FROM stdin;
1	not_in_target_market	Not in target market	Opportunity falls outside our target market segment	t	1	2025-07-20 13:04:18.599888
2	budget_doesnt_align	Budget doesn't align	Client budget does not match our pricing requirements	t	2	2025-07-20 13:04:18.759662
3	poor_timing	Poor timing	Timing is not suitable for this opportunity	t	3	2025-07-20 13:04:18.905404
4	strong_competition	Strong competition	High competitive pressure affecting win probability	t	4	2025-07-20 13:04:19.053196
5	resource_constraints	Resource constraints	Insufficient internal resources to pursue effectively	t	5	2025-07-20 13:04:19.200149
6	existing_client_relationship_conflicts	Existing client relationship conflicts	Conflicts with existing client relationships	t	6	2025-07-20 13:04:19.347259
7	product_service_doesnt_fit	Product/service doesn't fit	Our products/services don't align with client needs	t	7	2025-07-20 13:04:19.493378
8	other	Other	Other reasons not covered above	t	8	2025-07-20 13:04:19.639435
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.partners (id, name, description, status, location, contact_email, primary_contact, partner_type, region, assigned_user_ids, linked_opportunity_ids, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_catalog; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_catalog (id, name, description, category, category_id, color_code, ai_context, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_catalogues; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_catalogues (id, name, description, status, effective_from, effective_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_categories (id, name, description, parent_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.product_templates (id, product_id, name, description, category_id, category, provider_id, provider_type, provider_name, contract_start_date, contract_end_date, average_price, premium_value, premium_percentage, discount, discount_percentage, vendor_id, is_active, notes, tags, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.products (id, product_id, name, description, category_id, category, provider_id, provider_type, provider_name, contract_start_date, contract_end_date, total_value, premium_value, premium_percentage, discount, discount_percentage, vendor_id, customer_id, opportunity_id, partner_id, is_active, status, notes, tags, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: saved_lists; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.saved_lists (id, name, description, type, entity_type, members, filters, is_shared, is_default, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: saved_views; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.saved_views (id, name, description, entity_type, filters, is_shared, is_default, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tag_groups; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tag_groups (id, name, description, color_scheme, is_exclusive, sort_order, created_by_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.tags (id, name, color, group_id, usage_count, created_by_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transformation_scripts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transformation_scripts (id, name, description, entity_type, environment_id, script_content, is_active, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: upload_errors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.upload_errors (id, session_id, row_number, error_type, error_message, problematic_data, resolution_action, is_resolved, created_at) FROM stdin;
\.


--
-- Data for Name: upload_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.upload_sessions (id, session_id, entity_type, environment_id, file_name, status, current_step, error_log, processed_rows, total_rows, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: upload_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.upload_settings (id, environment_id, entity_type, attribute_name, is_mandatory, data_type, validation_rules, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: upload_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.upload_templates (id, name, description, entity_type, environment_id, column_mappings, is_shared, usage_count, last_used_at, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, email, password, full_name, first_name, last_name, avatar_initials, role, department, job_title, phone, is_active, last_login_at, created_at, updated_at) FROM stdin;
2	admin	admin@qollabi.com	temp_password	System Administrator	\N	\N	SA	user	\N	\N	\N	t	\N	2025-07-25 10:01:00.861395	2025-07-25 10:01:00.861395
\.


--
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.vendors (id, name, description, initials, contact_name, contact_email, contact_phone, owner_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: okr_metrics; Type: TABLE DATA; Schema: qollabi; Owner: neondb_owner
--

COPY qollabi.okr_metrics (id, title, description, template_id, target_value, realized_value, unit, progress, status, responsible_id, due_date, timeframe, frequency, parent_id, hierarchy, tags, type, target, tag, milestone_frequency, is_expanded, nested_count, traffic_lights, traffic_light_style, progress_bar, created_at, updated_at) FROM stdin;
1	Increase Annual Revenue	\N	\N	1000000	\N	currency	\N	on_track	\N	\N	this-year	monthly	\N	objective	{}	currency	1000000	Revenue Growth	Monthly	f	2	t	system	t	2025-06-22 16:41:51.85588	2025-06-22 16:41:51.85588
2	Expand Market Share	\N	\N	15	\N	percent	\N	on_track	\N	\N	this-year	quarterly	\N	objective	{}	percent	15	Market Growth	Quarterly	f	1	t	system	t	2025-06-22 16:41:51.85588	2025-06-22 16:41:51.85588
5	Launch 3 New Products	\N	\N	3	\N	number	\N	on_track	\N	\N	this-year	quarterly	\N	objective	{}	number	3	Product Development	Quarterly	f	0	f	system	t	2025-06-22 16:41:51.85588	2025-06-22 16:41:51.85588
3	Q1 Sales Target	\N	\N	250000	\N	currency	\N	on_track	\N	\N	Q1 2024	monthly	1	activity	{}	currency	250000	Revenue Growth	Monthly	f	0	t	system	t	2025-06-22 16:41:51.85588	2025-06-22 16:41:51.85588
4	Q2 Sales Target	\N	\N	250000	\N	currency	\N	on_track	\N	\N	Q2 2024	monthly	1	activity	{}	currency	250000	Revenue Growth	Monthly	f	0	t	system	t	2025-06-22 16:41:51.85588	2025-06-22 16:41:51.85588
6	Acquire 500 New Customers	\N	\N	500	\N	number	\N	on_track	\N	\N	H1 2024	monthly	2	activity	{}	number	500	Customer Acquisition	Monthly	f	0	t	system	t	2025-06-22 16:41:51.85588	2025-06-22 16:41:51.85588
\.


--
-- Data for Name: okr_templates; Type: TABLE DATA; Schema: qollabi; Owner: neondb_owner
--

COPY qollabi.okr_templates (id, name, description, tags, created_at, updated_at, created_by) FROM stdin;
\.


--
-- Name: activity_attachments_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.activity_attachments_id_seq', 1, false);


--
-- Name: activity_comments_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.activity_comments_id_seq', 92, true);


--
-- Name: activity_reactions_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.activity_reactions_id_seq', 14, true);


--
-- Name: activity_tasks_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.activity_tasks_id_seq', 54, true);


--
-- Name: broker_partner_mappings_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.broker_partner_mappings_id_seq', 1, true);


--
-- Name: campaign_assignments_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.campaign_assignments_id_seq', 1, true);


--
-- Name: campaign_follow_ups_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.campaign_follow_ups_id_seq', 3, true);


--
-- Name: campaign_recipients_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.campaign_recipients_id_seq', 3, true);


--
-- Name: campaign_shares_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.campaign_shares_id_seq', 6, true);


--
-- Name: campaigns_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.campaigns_id_seq', 32, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.categories_id_seq', 101, true);


--
-- Name: contact_relationships_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.contact_relationships_id_seq', 33, true);


--
-- Name: contact_tags_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.contact_tags_id_seq', 118, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.contacts_id_seq', 184, true);


--
-- Name: customer_opportunities_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.customer_opportunities_id_seq', 223, true);


--
-- Name: customer_product_assignments_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.customer_product_assignments_id_seq', 298, true);


--
-- Name: customer_products_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.customer_products_id_seq', 442, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.customers_id_seq', 271, true);


--
-- Name: entity_logos_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.entity_logos_id_seq', 12, true);


--
-- Name: list_collaborators_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.list_collaborators_id_seq', 25, true);


--
-- Name: okr_metrics_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.okr_metrics_id_seq', 18, true);


--
-- Name: okr_tags_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.okr_tags_id_seq', 5, true);


--
-- Name: okr_template_assignments_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.okr_template_assignments_id_seq', 36, true);


--
-- Name: opportunities_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.opportunities_id_seq', 523, true);


--
-- Name: opportunity_products_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.opportunity_products_id_seq', 684, true);


--
-- Name: partner_customers_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.partner_customers_id_seq', 411, true);


--
-- Name: partner_opportunities_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.partner_opportunities_id_seq', 291, true);


--
-- Name: partner_products_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.partner_products_id_seq', 135, true);


--
-- Name: partners_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.partners_id_seq', 46, true);


--
-- Name: product_customers_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.product_customers_id_seq', 3088, true);


--
-- Name: product_templates_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.product_templates_id_seq', 73, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.products_id_seq', 76, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.projects_id_seq', 8, true);


--
-- Name: saved_lists_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.saved_lists_id_seq', 51, true);


--
-- Name: saved_views_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.saved_views_id_seq', 23, true);


--
-- Name: tag_categories_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.tag_categories_id_seq', 3, true);


--
-- Name: tag_groups_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.tag_groups_id_seq', 2, true);


--
-- Name: tag_types_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.tag_types_id_seq', 1, true);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.tags_id_seq', 56, true);


--
-- Name: unified_activities_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.unified_activities_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.users_id_seq', 7, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: degoudse; Owner: neondb_owner
--

SELECT pg_catalog.setval('degoudse.vendors_id_seq', 5, true);


--
-- Name: activity_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.activity_attachments_id_seq', 1, false);


--
-- Name: activity_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.activity_comments_id_seq', 1, false);


--
-- Name: activity_reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.activity_reactions_id_seq', 1, false);


--
-- Name: activity_tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.activity_tasks_id_seq', 1, false);


--
-- Name: broker_partner_mappings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.broker_partner_mappings_id_seq', 1, false);


--
-- Name: campaign_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.campaign_assignments_id_seq', 1, false);


--
-- Name: campaign_emails_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.campaign_emails_id_seq', 1, false);


--
-- Name: campaign_follow_ups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.campaign_follow_ups_id_seq', 1, false);


--
-- Name: campaign_recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.campaign_recipients_id_seq', 1, false);


--
-- Name: campaign_shares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.campaign_shares_id_seq', 1, false);


--
-- Name: campaign_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.campaign_templates_id_seq', 1, false);


--
-- Name: campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.campaigns_id_seq', 1, false);


--
-- Name: catalogue_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.catalogue_products_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.categories_id_seq', 1, false);


--
-- Name: client_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.client_products_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.clients_id_seq', 1, false);


--
-- Name: contact_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.contact_tags_id_seq', 1, false);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.contacts_id_seq', 1, false);


--
-- Name: custom_environments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.custom_environments_id_seq', 18, true);


--
-- Name: customer_partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customer_partners_id_seq', 1, false);


--
-- Name: customer_product_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customer_product_assignments_id_seq', 1, false);


--
-- Name: customer_team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customer_team_members_id_seq', 1, false);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.customers_id_seq', 1, false);


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.documents_id_seq', 1, false);


--
-- Name: email_blocks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.email_blocks_id_seq', 1, false);


--
-- Name: entity_logos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.entity_logos_id_seq', 1, false);


--
-- Name: file_comparisons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.file_comparisons_id_seq', 1, false);


--
-- Name: insurance_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.insurance_products_id_seq', 1, false);


--
-- Name: list_collaborators_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.list_collaborators_id_seq', 1, false);


--
-- Name: news_articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.news_articles_id_seq', 1, false);


--
-- Name: next_best_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.next_best_actions_id_seq', 1, false);


--
-- Name: okr_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.okr_comments_id_seq', 1, false);


--
-- Name: okr_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.okr_metrics_id_seq', 1, false);


--
-- Name: okr_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.okr_tags_id_seq', 1, false);


--
-- Name: okr_template_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.okr_template_assignments_id_seq', 1, false);


--
-- Name: opportunities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.opportunities_id_seq', 1, false);


--
-- Name: opportunity_assessment_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.opportunity_assessment_history_id_seq', 1, false);


--
-- Name: opportunity_withhold_reasons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.opportunity_withhold_reasons_id_seq', 8, true);


--
-- Name: partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.partners_id_seq', 1, false);


--
-- Name: product_catalog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.product_catalog_id_seq', 1, false);


--
-- Name: product_catalogues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.product_catalogues_id_seq', 1, false);


--
-- Name: product_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.product_categories_id_seq', 1, false);


--
-- Name: product_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.product_templates_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: saved_lists_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.saved_lists_id_seq', 1, false);


--
-- Name: saved_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.saved_views_id_seq', 1, false);


--
-- Name: tag_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.tag_groups_id_seq', 1, false);


--
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.tags_id_seq', 1, false);


--
-- Name: transformation_scripts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.transformation_scripts_id_seq', 1, false);


--
-- Name: upload_errors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.upload_errors_id_seq', 1, false);


--
-- Name: upload_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.upload_sessions_id_seq', 1, false);


--
-- Name: upload_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.upload_settings_id_seq', 1, false);


--
-- Name: upload_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.upload_templates_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: vendors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.vendors_id_seq', 1, false);


--
-- Name: okr_metrics_id_seq; Type: SEQUENCE SET; Schema: qollabi; Owner: neondb_owner
--

SELECT pg_catalog.setval('qollabi.okr_metrics_id_seq', 1, false);


--
-- Name: okr_templates_id_seq; Type: SEQUENCE SET; Schema: qollabi; Owner: neondb_owner
--

SELECT pg_catalog.setval('qollabi.okr_templates_id_seq', 1, false);


--
-- Name: activity_attachments activity_attachments_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.activity_attachments
    ADD CONSTRAINT activity_attachments_pkey PRIMARY KEY (id);


--
-- Name: activity_comments activity_comments_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.activity_comments
    ADD CONSTRAINT activity_comments_pkey PRIMARY KEY (id);


--
-- Name: activity_reactions activity_reactions_activity_type_activity_id_user_id_emoji_key; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.activity_reactions
    ADD CONSTRAINT activity_reactions_activity_type_activity_id_user_id_emoji_key UNIQUE (activity_type, activity_id, user_id, emoji);


--
-- Name: activity_reactions activity_reactions_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.activity_reactions
    ADD CONSTRAINT activity_reactions_pkey PRIMARY KEY (id);


--
-- Name: activity_tasks activity_tasks_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.activity_tasks
    ADD CONSTRAINT activity_tasks_pkey PRIMARY KEY (id);


--
-- Name: broker_partner_mappings broker_partner_mappings_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.broker_partner_mappings
    ADD CONSTRAINT broker_partner_mappings_pkey PRIMARY KEY (id);


--
-- Name: campaign_assignments campaign_assignments_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_assignments
    ADD CONSTRAINT campaign_assignments_pkey PRIMARY KEY (id);


--
-- Name: campaign_follow_ups campaign_follow_ups_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_follow_ups
    ADD CONSTRAINT campaign_follow_ups_pkey PRIMARY KEY (id);


--
-- Name: campaign_recipients campaign_recipients_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_recipients
    ADD CONSTRAINT campaign_recipients_pkey PRIMARY KEY (id);


--
-- Name: campaign_shares campaign_shares_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_shares
    ADD CONSTRAINT campaign_shares_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: contact_relationships contact_relationships_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.contact_relationships
    ADD CONSTRAINT contact_relationships_pkey PRIMARY KEY (id);


--
-- Name: contact_tags contact_tags_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.contact_tags
    ADD CONSTRAINT contact_tags_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: customer_opportunities customer_opportunities_customer_id_opportunity_id_key; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customer_opportunities
    ADD CONSTRAINT customer_opportunities_customer_id_opportunity_id_key UNIQUE (customer_id, opportunity_id);


--
-- Name: customer_opportunities customer_opportunities_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customer_opportunities
    ADD CONSTRAINT customer_opportunities_pkey PRIMARY KEY (id);


--
-- Name: customer_product_assignments customer_product_assignments_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customer_product_assignments
    ADD CONSTRAINT customer_product_assignments_pkey PRIMARY KEY (id);


--
-- Name: customer_products customer_products_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customer_products
    ADD CONSTRAINT customer_products_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: entity_logos entity_logos_entity_type_entity_id_environment_id_key; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.entity_logos
    ADD CONSTRAINT entity_logos_entity_type_entity_id_environment_id_key UNIQUE (entity_type, entity_id, environment_id);


--
-- Name: entity_logos entity_logos_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.entity_logos
    ADD CONSTRAINT entity_logos_pkey PRIMARY KEY (id);


--
-- Name: list_collaborators list_collaborators_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.list_collaborators
    ADD CONSTRAINT list_collaborators_pkey PRIMARY KEY (id);


--
-- Name: okr_metrics okr_metrics_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.okr_metrics
    ADD CONSTRAINT okr_metrics_pkey PRIMARY KEY (id);


--
-- Name: okr_tags okr_tags_name_key; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.okr_tags
    ADD CONSTRAINT okr_tags_name_key UNIQUE (name);


--
-- Name: okr_tags okr_tags_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.okr_tags
    ADD CONSTRAINT okr_tags_pkey PRIMARY KEY (id);


--
-- Name: okr_template_assignments okr_template_assignments_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.okr_template_assignments
    ADD CONSTRAINT okr_template_assignments_pkey PRIMARY KEY (id);


--
-- Name: opportunities opportunities_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.opportunities
    ADD CONSTRAINT opportunities_pkey PRIMARY KEY (id);


--
-- Name: opportunity_products opportunity_products_opportunity_id_product_id_key; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.opportunity_products
    ADD CONSTRAINT opportunity_products_opportunity_id_product_id_key UNIQUE (opportunity_id, product_id);


--
-- Name: opportunity_products opportunity_products_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.opportunity_products
    ADD CONSTRAINT opportunity_products_pkey PRIMARY KEY (id);


--
-- Name: partner_customers partner_customers_partner_id_customer_id_key; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partner_customers
    ADD CONSTRAINT partner_customers_partner_id_customer_id_key UNIQUE (partner_id, customer_id);


--
-- Name: partner_customers partner_customers_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partner_customers
    ADD CONSTRAINT partner_customers_pkey PRIMARY KEY (id);


--
-- Name: partner_opportunities partner_opportunities_partner_id_opportunity_id_key; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partner_opportunities
    ADD CONSTRAINT partner_opportunities_partner_id_opportunity_id_key UNIQUE (partner_id, opportunity_id);


--
-- Name: partner_opportunities partner_opportunities_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partner_opportunities
    ADD CONSTRAINT partner_opportunities_pkey PRIMARY KEY (id);


--
-- Name: partner_products partner_products_partner_id_product_id_key; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partner_products
    ADD CONSTRAINT partner_products_partner_id_product_id_key UNIQUE (partner_id, product_id);


--
-- Name: partner_products partner_products_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partner_products
    ADD CONSTRAINT partner_products_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: product_customers product_customers_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.product_customers
    ADD CONSTRAINT product_customers_pkey PRIMARY KEY (id);


--
-- Name: product_customers product_customers_product_id_customer_id_key; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.product_customers
    ADD CONSTRAINT product_customers_product_id_customer_id_key UNIQUE (product_id, customer_id);


--
-- Name: product_templates product_templates_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.product_templates
    ADD CONSTRAINT product_templates_pkey PRIMARY KEY (id);


--
-- Name: product_templates product_templates_product_id_key; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.product_templates
    ADD CONSTRAINT product_templates_product_id_key UNIQUE (product_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: saved_lists saved_lists_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.saved_lists
    ADD CONSTRAINT saved_lists_pkey PRIMARY KEY (id);


--
-- Name: saved_views saved_views_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.saved_views
    ADD CONSTRAINT saved_views_pkey PRIMARY KEY (id);


--
-- Name: tag_categories tag_categories_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tag_categories
    ADD CONSTRAINT tag_categories_pkey PRIMARY KEY (id);


--
-- Name: tag_groups tag_groups_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tag_groups
    ADD CONSTRAINT tag_groups_pkey PRIMARY KEY (id);


--
-- Name: tag_types tag_types_name_key; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tag_types
    ADD CONSTRAINT tag_types_name_key UNIQUE (name);


--
-- Name: tag_types tag_types_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tag_types
    ADD CONSTRAINT tag_types_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: unified_activities unified_activities_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.unified_activities
    ADD CONSTRAINT unified_activities_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: activity_attachments activity_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_attachments
    ADD CONSTRAINT activity_attachments_pkey PRIMARY KEY (id);


--
-- Name: activity_comments activity_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_comments
    ADD CONSTRAINT activity_comments_pkey PRIMARY KEY (id);


--
-- Name: activity_reactions activity_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_reactions
    ADD CONSTRAINT activity_reactions_pkey PRIMARY KEY (id);


--
-- Name: activity_tasks activity_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_tasks
    ADD CONSTRAINT activity_tasks_pkey PRIMARY KEY (id);


--
-- Name: broker_partner_mappings broker_partner_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.broker_partner_mappings
    ADD CONSTRAINT broker_partner_mappings_pkey PRIMARY KEY (id);


--
-- Name: campaign_assignments campaign_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_assignments
    ADD CONSTRAINT campaign_assignments_pkey PRIMARY KEY (id);


--
-- Name: campaign_emails campaign_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_emails
    ADD CONSTRAINT campaign_emails_pkey PRIMARY KEY (id);


--
-- Name: campaign_follow_ups campaign_follow_ups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_follow_ups
    ADD CONSTRAINT campaign_follow_ups_pkey PRIMARY KEY (id);


--
-- Name: campaign_recipients campaign_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_recipients
    ADD CONSTRAINT campaign_recipients_pkey PRIMARY KEY (id);


--
-- Name: campaign_shares campaign_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_shares
    ADD CONSTRAINT campaign_shares_pkey PRIMARY KEY (id);


--
-- Name: campaign_templates campaign_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_templates
    ADD CONSTRAINT campaign_templates_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: catalogue_products catalogue_products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.catalogue_products
    ADD CONSTRAINT catalogue_products_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: client_products client_products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.client_products
    ADD CONSTRAINT client_products_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: contact_tags contact_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contact_tags
    ADD CONSTRAINT contact_tags_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: custom_environments custom_environments_environment_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_environments
    ADD CONSTRAINT custom_environments_environment_id_key UNIQUE (environment_id);


--
-- Name: custom_environments custom_environments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_environments
    ADD CONSTRAINT custom_environments_pkey PRIMARY KEY (id);


--
-- Name: customer_partners customer_partners_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_partners
    ADD CONSTRAINT customer_partners_pkey PRIMARY KEY (id);


--
-- Name: customer_product_assignments customer_product_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_product_assignments
    ADD CONSTRAINT customer_product_assignments_pkey PRIMARY KEY (id);


--
-- Name: customer_team_members customer_team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_team_members
    ADD CONSTRAINT customer_team_members_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: email_blocks email_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_blocks
    ADD CONSTRAINT email_blocks_pkey PRIMARY KEY (id);


--
-- Name: entity_logos entity_logos_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.entity_logos
    ADD CONSTRAINT entity_logos_pkey PRIMARY KEY (id);


--
-- Name: file_comparisons file_comparisons_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.file_comparisons
    ADD CONSTRAINT file_comparisons_pkey PRIMARY KEY (id);


--
-- Name: insurance_products insurance_products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.insurance_products
    ADD CONSTRAINT insurance_products_pkey PRIMARY KEY (id);


--
-- Name: list_collaborators list_collaborators_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.list_collaborators
    ADD CONSTRAINT list_collaborators_pkey PRIMARY KEY (id);


--
-- Name: news_articles news_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.news_articles
    ADD CONSTRAINT news_articles_pkey PRIMARY KEY (id);


--
-- Name: next_best_actions next_best_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.next_best_actions
    ADD CONSTRAINT next_best_actions_pkey PRIMARY KEY (id);


--
-- Name: okr_comments okr_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_comments
    ADD CONSTRAINT okr_comments_pkey PRIMARY KEY (id);


--
-- Name: okr_metrics okr_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_metrics
    ADD CONSTRAINT okr_metrics_pkey PRIMARY KEY (id);


--
-- Name: okr_tags okr_tags_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_tags
    ADD CONSTRAINT okr_tags_name_unique UNIQUE (name);


--
-- Name: okr_tags okr_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_tags
    ADD CONSTRAINT okr_tags_pkey PRIMARY KEY (id);


--
-- Name: okr_template_assignments okr_template_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_template_assignments
    ADD CONSTRAINT okr_template_assignments_pkey PRIMARY KEY (id);


--
-- Name: opportunities opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_pkey PRIMARY KEY (id);


--
-- Name: opportunity_assessment_history opportunity_assessment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunity_assessment_history
    ADD CONSTRAINT opportunity_assessment_history_pkey PRIMARY KEY (id);


--
-- Name: opportunity_withhold_reasons opportunity_withhold_reasons_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunity_withhold_reasons
    ADD CONSTRAINT opportunity_withhold_reasons_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: product_catalog product_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_catalog
    ADD CONSTRAINT product_catalog_pkey PRIMARY KEY (id);


--
-- Name: product_catalogues product_catalogues_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_catalogues
    ADD CONSTRAINT product_catalogues_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: product_templates product_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_templates
    ADD CONSTRAINT product_templates_pkey PRIMARY KEY (id);


--
-- Name: product_templates product_templates_product_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_templates
    ADD CONSTRAINT product_templates_product_id_unique UNIQUE (product_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_product_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_product_id_unique UNIQUE (product_id);


--
-- Name: saved_lists saved_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_lists
    ADD CONSTRAINT saved_lists_pkey PRIMARY KEY (id);


--
-- Name: saved_views saved_views_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_views
    ADD CONSTRAINT saved_views_pkey PRIMARY KEY (id);


--
-- Name: tag_groups tag_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tag_groups
    ADD CONSTRAINT tag_groups_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: transformation_scripts transformation_scripts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transformation_scripts
    ADD CONSTRAINT transformation_scripts_pkey PRIMARY KEY (id);


--
-- Name: upload_errors upload_errors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_errors
    ADD CONSTRAINT upload_errors_pkey PRIMARY KEY (id);


--
-- Name: upload_sessions upload_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_sessions
    ADD CONSTRAINT upload_sessions_pkey PRIMARY KEY (id);


--
-- Name: upload_sessions upload_sessions_session_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_sessions
    ADD CONSTRAINT upload_sessions_session_id_unique UNIQUE (session_id);


--
-- Name: upload_settings upload_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_settings
    ADD CONSTRAINT upload_settings_pkey PRIMARY KEY (id);


--
-- Name: upload_templates upload_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_templates
    ADD CONSTRAINT upload_templates_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: okr_metrics okr_metrics_pkey; Type: CONSTRAINT; Schema: qollabi; Owner: neondb_owner
--

ALTER TABLE ONLY qollabi.okr_metrics
    ADD CONSTRAINT okr_metrics_pkey PRIMARY KEY (id);


--
-- Name: okr_templates okr_templates_pkey; Type: CONSTRAINT; Schema: qollabi; Owner: neondb_owner
--

ALTER TABLE ONLY qollabi.okr_templates
    ADD CONSTRAINT okr_templates_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_attachments_partner_id; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_activity_attachments_partner_id ON degoudse.activity_attachments USING btree (partner_id);


--
-- Name: idx_activity_attachments_uploaded_by_id; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_activity_attachments_uploaded_by_id ON degoudse.activity_attachments USING btree (uploaded_by_id);


--
-- Name: idx_customers_name; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_customers_name ON degoudse.customers USING btree (name);


--
-- Name: idx_okr_template_assignments_entity_type; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_okr_template_assignments_entity_type ON degoudse.okr_template_assignments USING btree (entity_type);


--
-- Name: idx_opportunities_status; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_opportunities_status ON degoudse.opportunities USING btree (status);


--
-- Name: idx_opportunities_title; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_opportunities_title ON degoudse.opportunities USING btree (title);


--
-- Name: idx_partner_customers_customer_id; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_partner_customers_customer_id ON degoudse.partner_customers USING btree (customer_id);


--
-- Name: idx_partner_customers_partner_id; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_partner_customers_partner_id ON degoudse.partner_customers USING btree (partner_id);


--
-- Name: idx_partner_opportunities_opportunity_id; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_partner_opportunities_opportunity_id ON degoudse.partner_opportunities USING btree (opportunity_id);


--
-- Name: idx_partner_opportunities_partner_id; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_partner_opportunities_partner_id ON degoudse.partner_opportunities USING btree (partner_id);


--
-- Name: idx_partners_name; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_partners_name ON degoudse.partners USING btree (name);


--
-- Name: idx_partners_status; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_partners_status ON degoudse.partners USING btree (status);


--
-- Name: idx_saved_lists_entity_type; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_saved_lists_entity_type ON degoudse.saved_lists USING btree (entity_type);


--
-- Name: idx_saved_views_entity_type; Type: INDEX; Schema: degoudse; Owner: neondb_owner
--

CREATE INDEX idx_saved_views_entity_type ON degoudse.saved_views USING btree (entity_type);


--
-- Name: activity_comments activity_comments_partner_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.activity_comments
    ADD CONSTRAINT activity_comments_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES degoudse.partners(id);


--
-- Name: broker_partner_mappings broker_partner_mappings_broker_user_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.broker_partner_mappings
    ADD CONSTRAINT broker_partner_mappings_broker_user_id_fkey FOREIGN KEY (broker_user_id) REFERENCES degoudse.users(id);


--
-- Name: campaign_assignments campaign_assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_assignments
    ADD CONSTRAINT campaign_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES degoudse.users(id);


--
-- Name: campaign_assignments campaign_assignments_campaign_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_assignments
    ADD CONSTRAINT campaign_assignments_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES degoudse.campaigns(id);


--
-- Name: campaign_follow_ups campaign_follow_ups_campaign_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_follow_ups
    ADD CONSTRAINT campaign_follow_ups_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES degoudse.campaigns(id);


--
-- Name: campaign_recipients campaign_recipients_campaign_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_recipients
    ADD CONSTRAINT campaign_recipients_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES degoudse.campaigns(id);


--
-- Name: campaign_shares campaign_shares_campaign_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_shares
    ADD CONSTRAINT campaign_shares_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES degoudse.campaigns(id);


--
-- Name: campaign_shares campaign_shares_shared_by_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.campaign_shares
    ADD CONSTRAINT campaign_shares_shared_by_id_fkey FOREIGN KEY (shared_by_id) REFERENCES degoudse.users(id);


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES degoudse.categories(id);


--
-- Name: contact_relationships contact_relationships_contact_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.contact_relationships
    ADD CONSTRAINT contact_relationships_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES degoudse.contacts(id);


--
-- Name: contact_tags contact_tags_contact_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.contact_tags
    ADD CONSTRAINT contact_tags_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES degoudse.contacts(id);


--
-- Name: contact_tags contact_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.contact_tags
    ADD CONSTRAINT contact_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES degoudse.tags(id);


--
-- Name: contact_tags contact_tags_tagged_by_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.contact_tags
    ADD CONSTRAINT contact_tags_tagged_by_id_fkey FOREIGN KEY (tagged_by_id) REFERENCES degoudse.users(id);


--
-- Name: contacts contacts_reports_to_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.contacts
    ADD CONSTRAINT contacts_reports_to_fkey FOREIGN KEY (reports_to) REFERENCES degoudse.contacts(id);


--
-- Name: customer_product_assignments customer_product_assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customer_product_assignments
    ADD CONSTRAINT customer_product_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES degoudse.users(id);


--
-- Name: customer_product_assignments customer_product_assignments_customer_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customer_product_assignments
    ADD CONSTRAINT customer_product_assignments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES degoudse.customers(id);


--
-- Name: customer_product_assignments customer_product_assignments_product_template_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customer_product_assignments
    ADD CONSTRAINT customer_product_assignments_product_template_id_fkey FOREIGN KEY (product_template_id) REFERENCES degoudse.product_templates(id);


--
-- Name: customer_products customer_products_customer_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customer_products
    ADD CONSTRAINT customer_products_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES degoudse.customers(id) ON DELETE CASCADE;


--
-- Name: customer_products customer_products_product_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.customer_products
    ADD CONSTRAINT customer_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES degoudse.products(id) ON DELETE CASCADE;


--
-- Name: list_collaborators list_collaborators_list_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.list_collaborators
    ADD CONSTRAINT list_collaborators_list_id_fkey FOREIGN KEY (list_id) REFERENCES degoudse.saved_lists(id) ON DELETE CASCADE;


--
-- Name: opportunities opportunities_account_manager_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.opportunities
    ADD CONSTRAINT opportunities_account_manager_id_fkey FOREIGN KEY (account_manager_id) REFERENCES degoudse.users(id);


--
-- Name: opportunities opportunities_assessed_by_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.opportunities
    ADD CONSTRAINT opportunities_assessed_by_id_fkey FOREIGN KEY (assessed_by_id) REFERENCES degoudse.users(id);


--
-- Name: partner_products partner_products_partner_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partner_products
    ADD CONSTRAINT partner_products_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES degoudse.partners(id) ON DELETE CASCADE;


--
-- Name: partner_products partner_products_product_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.partner_products
    ADD CONSTRAINT partner_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES degoudse.products(id) ON DELETE CASCADE;


--
-- Name: product_customers product_customers_customer_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.product_customers
    ADD CONSTRAINT product_customers_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES degoudse.customers(id);


--
-- Name: product_customers product_customers_product_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.product_customers
    ADD CONSTRAINT product_customers_product_id_fkey FOREIGN KEY (product_id) REFERENCES degoudse.products(id);


--
-- Name: product_templates product_templates_category_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.product_templates
    ADD CONSTRAINT product_templates_category_id_fkey FOREIGN KEY (category_id) REFERENCES degoudse.categories(id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES degoudse.categories(id);


--
-- Name: products products_tag_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.products
    ADD CONSTRAINT products_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES degoudse.tags(id);


--
-- Name: projects projects_customer_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.projects
    ADD CONSTRAINT projects_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES degoudse.customers(id);


--
-- Name: projects projects_partner_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.projects
    ADD CONSTRAINT projects_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES degoudse.partners(id);


--
-- Name: tag_groups tag_groups_created_by_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tag_groups
    ADD CONSTRAINT tag_groups_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES degoudse.users(id);


--
-- Name: tags tags_category_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tags
    ADD CONSTRAINT tags_category_id_fkey FOREIGN KEY (category_id) REFERENCES degoudse.tag_categories(id) ON DELETE CASCADE;


--
-- Name: tags tags_created_by_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tags
    ADD CONSTRAINT tags_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES degoudse.users(id);


--
-- Name: tags tags_group_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tags
    ADD CONSTRAINT tags_group_id_fkey FOREIGN KEY (group_id) REFERENCES degoudse.tag_groups(id);


--
-- Name: tags tags_parent_tag_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tags
    ADD CONSTRAINT tags_parent_tag_id_fkey FOREIGN KEY (parent_tag_id) REFERENCES degoudse.tags(id);


--
-- Name: tags tags_tag_type_id_fkey; Type: FK CONSTRAINT; Schema: degoudse; Owner: neondb_owner
--

ALTER TABLE ONLY degoudse.tags
    ADD CONSTRAINT tags_tag_type_id_fkey FOREIGN KEY (tag_type_id) REFERENCES degoudse.tag_types(id);


--
-- Name: activity_attachments activity_attachments_uploaded_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_attachments
    ADD CONSTRAINT activity_attachments_uploaded_by_id_users_id_fk FOREIGN KEY (uploaded_by_id) REFERENCES public.users(id);


--
-- Name: activity_comments activity_comments_assigned_to_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_comments
    ADD CONSTRAINT activity_comments_assigned_to_id_users_id_fk FOREIGN KEY (assigned_to_id) REFERENCES public.users(id);


--
-- Name: activity_comments activity_comments_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_comments
    ADD CONSTRAINT activity_comments_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: activity_reactions activity_reactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_reactions
    ADD CONSTRAINT activity_reactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: activity_tasks activity_tasks_assigned_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_tasks
    ADD CONSTRAINT activity_tasks_assigned_by_id_users_id_fk FOREIGN KEY (assigned_by_id) REFERENCES public.users(id);


--
-- Name: activity_tasks activity_tasks_assigned_to_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.activity_tasks
    ADD CONSTRAINT activity_tasks_assigned_to_id_users_id_fk FOREIGN KEY (assigned_to_id) REFERENCES public.users(id);


--
-- Name: broker_partner_mappings broker_partner_mappings_broker_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.broker_partner_mappings
    ADD CONSTRAINT broker_partner_mappings_broker_user_id_users_id_fk FOREIGN KEY (broker_user_id) REFERENCES public.users(id);


--
-- Name: campaign_assignments campaign_assignments_assigned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_assignments
    ADD CONSTRAINT campaign_assignments_assigned_by_users_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: campaign_assignments campaign_assignments_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_assignments
    ADD CONSTRAINT campaign_assignments_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: campaign_emails campaign_emails_template_id_campaign_templates_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_emails
    ADD CONSTRAINT campaign_emails_template_id_campaign_templates_id_fk FOREIGN KEY (template_id) REFERENCES public.campaign_templates(id) ON DELETE CASCADE;


--
-- Name: campaign_follow_ups campaign_follow_ups_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_follow_ups
    ADD CONSTRAINT campaign_follow_ups_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: campaign_recipients campaign_recipients_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_recipients
    ADD CONSTRAINT campaign_recipients_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: campaign_shares campaign_shares_campaign_id_campaigns_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_shares
    ADD CONSTRAINT campaign_shares_campaign_id_campaigns_id_fk FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);


--
-- Name: campaign_shares campaign_shares_shared_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_shares
    ADD CONSTRAINT campaign_shares_shared_by_id_users_id_fk FOREIGN KEY (shared_by_id) REFERENCES public.users(id);


--
-- Name: campaign_templates campaign_templates_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaign_templates
    ADD CONSTRAINT campaign_templates_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: campaigns campaigns_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: catalogue_products catalogue_products_catalogue_id_product_catalogues_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.catalogue_products
    ADD CONSTRAINT catalogue_products_catalogue_id_product_catalogues_id_fk FOREIGN KEY (catalogue_id) REFERENCES public.product_catalogues(id);


--
-- Name: catalogue_products catalogue_products_category_id_product_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.catalogue_products
    ADD CONSTRAINT catalogue_products_category_id_product_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.product_categories(id);


--
-- Name: catalogue_products catalogue_products_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.catalogue_products
    ADD CONSTRAINT catalogue_products_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: categories categories_parent_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_categories_id_fk FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- Name: contact_tags contact_tags_contact_id_contacts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contact_tags
    ADD CONSTRAINT contact_tags_contact_id_contacts_id_fk FOREIGN KEY (contact_id) REFERENCES public.contacts(id);


--
-- Name: contact_tags contact_tags_tag_id_tags_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contact_tags
    ADD CONSTRAINT contact_tags_tag_id_tags_id_fk FOREIGN KEY (tag_id) REFERENCES public.tags(id);


--
-- Name: contact_tags contact_tags_tagged_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contact_tags
    ADD CONSTRAINT contact_tags_tagged_by_id_users_id_fk FOREIGN KEY (tagged_by_id) REFERENCES public.users(id);


--
-- Name: custom_environments custom_environments_created_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_environments
    ADD CONSTRAINT custom_environments_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: customer_partners customer_partners_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_partners
    ADD CONSTRAINT customer_partners_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_product_assignments customer_product_assignments_assigned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_product_assignments
    ADD CONSTRAINT customer_product_assignments_assigned_by_users_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: customer_product_assignments customer_product_assignments_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_product_assignments
    ADD CONSTRAINT customer_product_assignments_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_product_assignments customer_product_assignments_product_template_id_product_templa; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_product_assignments
    ADD CONSTRAINT customer_product_assignments_product_template_id_product_templa FOREIGN KEY (product_template_id) REFERENCES public.product_templates(id);


--
-- Name: customer_team_members customer_team_members_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_team_members
    ADD CONSTRAINT customer_team_members_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: customer_team_members customer_team_members_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customer_team_members
    ADD CONSTRAINT customer_team_members_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: customers customers_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: email_blocks email_blocks_email_id_campaign_emails_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_blocks
    ADD CONSTRAINT email_blocks_email_id_campaign_emails_id_fk FOREIGN KEY (email_id) REFERENCES public.campaign_emails(id) ON DELETE CASCADE;


--
-- Name: entity_logos entity_logos_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.entity_logos
    ADD CONSTRAINT entity_logos_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: list_collaborators list_collaborators_invited_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.list_collaborators
    ADD CONSTRAINT list_collaborators_invited_by_id_users_id_fk FOREIGN KEY (invited_by_id) REFERENCES public.users(id);


--
-- Name: list_collaborators list_collaborators_list_id_saved_lists_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.list_collaborators
    ADD CONSTRAINT list_collaborators_list_id_saved_lists_id_fk FOREIGN KEY (list_id) REFERENCES public.saved_lists(id) ON DELETE CASCADE;


--
-- Name: list_collaborators list_collaborators_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.list_collaborators
    ADD CONSTRAINT list_collaborators_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: okr_comments okr_comments_metric_id_okr_metrics_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_comments
    ADD CONSTRAINT okr_comments_metric_id_okr_metrics_id_fk FOREIGN KEY (metric_id) REFERENCES public.okr_metrics(id);


--
-- Name: okr_comments okr_comments_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_comments
    ADD CONSTRAINT okr_comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: okr_metrics okr_metrics_responsible_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_metrics
    ADD CONSTRAINT okr_metrics_responsible_user_id_users_id_fk FOREIGN KEY (responsible_user_id) REFERENCES public.users(id);


--
-- Name: okr_template_assignments okr_template_assignments_assigned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_template_assignments
    ADD CONSTRAINT okr_template_assignments_assigned_by_users_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: okr_template_assignments okr_template_assignments_responsible_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.okr_template_assignments
    ADD CONSTRAINT okr_template_assignments_responsible_user_id_users_id_fk FOREIGN KEY (responsible_user_id) REFERENCES public.users(id);


--
-- Name: opportunities opportunities_account_manager_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_account_manager_id_users_id_fk FOREIGN KEY (account_manager_id) REFERENCES public.users(id);


--
-- Name: opportunities opportunities_assessed_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunities
    ADD CONSTRAINT opportunities_assessed_by_id_users_id_fk FOREIGN KEY (assessed_by_id) REFERENCES public.users(id);


--
-- Name: opportunity_assessment_history opportunity_assessment_history_changed_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunity_assessment_history
    ADD CONSTRAINT opportunity_assessment_history_changed_by_id_users_id_fk FOREIGN KEY (changed_by_id) REFERENCES public.users(id);


--
-- Name: opportunity_assessment_history opportunity_assessment_history_opportunity_id_opportunities_id_; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.opportunity_assessment_history
    ADD CONSTRAINT opportunity_assessment_history_opportunity_id_opportunities_id_ FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id);


--
-- Name: product_catalog product_catalog_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_catalog
    ADD CONSTRAINT product_catalog_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: product_templates product_templates_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_templates
    ADD CONSTRAINT product_templates_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: product_templates product_templates_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.product_templates
    ADD CONSTRAINT product_templates_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: products products_category_id_product_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_product_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.product_categories(id);


--
-- Name: products products_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: saved_lists saved_lists_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_lists
    ADD CONSTRAINT saved_lists_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: saved_views saved_views_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_views
    ADD CONSTRAINT saved_views_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: tag_groups tag_groups_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tag_groups
    ADD CONSTRAINT tag_groups_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: tags tags_created_by_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_created_by_id_users_id_fk FOREIGN KEY (created_by_id) REFERENCES public.users(id);


--
-- Name: tags tags_group_id_tag_groups_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_group_id_tag_groups_id_fk FOREIGN KEY (group_id) REFERENCES public.tag_groups(id);


--
-- Name: transformation_scripts transformation_scripts_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transformation_scripts
    ADD CONSTRAINT transformation_scripts_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: upload_errors upload_errors_session_id_upload_sessions_session_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_errors
    ADD CONSTRAINT upload_errors_session_id_upload_sessions_session_id_fk FOREIGN KEY (session_id) REFERENCES public.upload_sessions(session_id);


--
-- Name: upload_sessions upload_sessions_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_sessions
    ADD CONSTRAINT upload_sessions_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: upload_templates upload_templates_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.upload_templates
    ADD CONSTRAINT upload_templates_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: vendors vendors_owner_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_owner_id_users_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

