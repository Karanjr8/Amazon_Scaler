--
-- PostgreSQL database dump
--

\restrict C5N6yPLndCeSFav1V2FONlADwpnuHgltUmdLgnUfXWZy5SAtAf5MA5hIx4L1ix5

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer,
    product_name character varying(255) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT order_items_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    total numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    delivery_address jsonb,
    payment_method character varying(100),
    CONSTRAINT orders_total_check CHECK ((total >= (0)::numeric))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    category text NOT NULL,
    image_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    brand character varying(255),
    seller_name character varying(255),
    original_price numeric(10,2),
    images jsonb,
    stock integer DEFAULT 0,
    CONSTRAINT products_price_check CHECK ((price >= (0)::numeric))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    product_id integer NOT NULL,
    user_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Name: reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(120) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wishlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.wishlist OWNER TO postgres;

--
-- Name: wishlist_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wishlist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlist_id_seq OWNER TO postgres;

--
-- Name: wishlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wishlist_id_seq OWNED BY public.wishlist.id;


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wishlist id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist ALTER COLUMN id SET DEFAULT nextval('public.wishlist_id_seq'::regclass);


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, product_name, unit_price, quantity) FROM stdin;
1	11	26	Nothing Phone (3a) Lite (White, 128 GB) (8 GB RAM)	20530.00	1
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, user_id, total, created_at, delivery_address, payment_method) FROM stdin;
11	1	24225.00	2026-03-29 11:32:56.372586	{"city": "Gharuan", "phone": "70188-21259", "state": "PUNJAB", "pincode": "140413", "fullName": "Karan", "addressLine": "Home"}	COD
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, price, category, image_url, created_at, brand, seller_name, original_price, images, stock) FROM stdin;
1	Apple AirPods Pro (2nd Gen)	Premium true wireless earbuds with active noise cancellation and adaptive audio.	249.00	Electronics	https://m.media-amazon.com/images/I/61SUj2aKoEL._SL1500_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
2	Sony WH-1000XM5 Wireless Headphones	Industry-leading noise canceling headphones with rich sound and long battery life.	399.99	Electronics	https://m.media-amazon.com/images/I/61BGLYEN-xL._SL1500_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
3	Samsung Galaxy Watch 6	Smartwatch with advanced fitness tracking, sleep insights, and AMOLED display.	299.99	Electronics	https://m.media-amazon.com/images/I/71sRBqqrOpL._SL1500_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
4	Apple iPad 10th Gen	Powerful tablet with 10.9-inch Liquid Retina display and all-day battery life.	449.00	Electronics	https://m.media-amazon.com/images/I/61kMIKm23VL._SL1500_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
5	Kindle Paperwhite 11th Gen	Glare-free e-reader with adjustable warm light and waterproof design.	149.99	Electronics	https://m.media-amazon.com/images/I/516ioi1kzGL._SL1001_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
6	Nike Air Zoom Pegasus 40	Responsive running shoes with breathable upper and plush cushioning.	129.99	Fashion	https://m.media-amazon.com/images/I/71TtKQpoy7L._AC_SL1500_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
7	Adidas Ultraboost Light	Premium running sneakers with lightweight boost cushioning.	189.99	Fashion	https://m.media-amazon.com/images/I/41DO-+a4oiL._SY695_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
8	Levi's 511 Slim Fit Jeans	Classic slim-fit denim with stretch comfort for everyday wear.	69.50	Fashion	https://m.media-amazon.com/images/I/517gApRgvhL._SX679_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
9	Calvin Klein Crew T-Shirt (3-Pack)	Soft cotton tees with modern fit for daily comfort.	39.99	Fashion	https://m.media-amazon.com/images/I/51CqvmY0WUL._SX679_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
10	Ray-Ban Wayfarer Sunglasses	Iconic square-frame sunglasses with UV protection.	159.00	Fashion	https://m.media-amazon.com/images/I/51GYi1kNaBL._SX679_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
11	Dyson V15 Detect Vacuum	Powerful cordless vacuum with intelligent suction and HEPA filtration.	749.99	Home	https://m.media-amazon.com/images/I/31DMXHLTSWL._SY300_SX300_QL70_FMwebp_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
12	Ninja Air Fryer Max XL	Large-capacity air fryer for crisp results with less oil.	169.99	Home	https://m.media-amazon.com/images/I/71rvI+9E0QL._AC_UY436_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
13	Instant Pot Duo 7-in-1	Multi-cooker for pressure cooking, steaming, sautéing, and slow cooking.	119.95	Home	https://m.media-amazon.com/images/I/71Z401LjFFL._AC_UY436_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
14	Philips Hue Starter Kit	Smart lighting kit with millions of colors and app control.	199.99	Home	https://m.media-amazon.com/images/I/51u3-6AeGiL._AC_UL640_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
15	Keurig K-Supreme Coffee Maker	Single-serve coffee maker with multi-stream brew technology.	149.99	Home	https://m.media-amazon.com/images/I/61sG7DQyMGL._AC_UY436_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
16	CeraVe Hydrating Facial Cleanser	Gentle cleanser with ceramides and hyaluronic acid.	169.99	Beauty	https://m.media-amazon.com/images/I/61pwYY8Hp7L._AC_UL640_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
17	La Roche-Posay Anthelios SPF 50	Lightweight sunscreen with high UVA/UVB protection.	369.99	Beauty	https://m.media-amazon.com/images/I/713bb29Zu8L._AC_UL640_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
18	The Ordinary Niacinamide 10% + Zinc 1%	Daily serum for balancing skin tone and texture.	8.90	Beauty	https://m.media-amazon.com/images/I/410oRKu+XvL._AC_UL640_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
19	Neutrogena Hydro Boost Water Gel	Oil-free moisturizer with long-lasting hydration.	23.99	Beauty	https://m.media-amazon.com/images/I/51YTdG8RPSL._AC_UL640_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
20	Maybelline Sky High Mascara	Lengthening mascara with flexible precision brush.	12.99	Beauty	https://m.media-amazon.com/images/I/512zBYEenoL._AC_UL640_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
21	Atomic Habits - James Clear	Practical framework for building good habits and breaking bad ones.	18.99	Books	https://m.media-amazon.com/images/I/81HdJPJMiYL._AC_UY436_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
22	The Psychology of Money - Morgan Housel	Timeless lessons on wealth, greed, and happiness.	16.99	Books	https://m.media-amazon.com/images/I/71X8D5N+FkL._AC_UY436_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
23	Deep Work - Cal Newport	Guide to focused success in a distracted world.	17.50	Books	https://m.media-amazon.com/images/I/61zt25yYrCL._AC_UY436_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
24	The Lean Startup - Eric Ries	Startup methodology for rapid experimentation and validation.	21.00	Books	https://m.media-amazon.com/images/I/614XDBst7RL._AC_UY436_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
25	Clean Code - Robert C. Martin	Best practices for writing maintainable, readable software.	34.99	Books	https://m.media-amazon.com/images/I/71nj3JM-igL._AC_UY436_FMwebp_QL65_.jpg	2026-03-29 01:28:57.321012	\N	\N	\N	\N	0
26	Nothing Phone (3a) Lite (White, 128 GB) (8 GB RAM)	6.77-inch FHD+ 120Hz AMOLED display MediaTek Dimensity 7300 Pro processor, 8GB of RAM with virtual RAM expansion 5000mAh battery with 33W fast charging 50MP main rear camera with OIS Nothing OS 3.5 based on Android 15\n\nShips from: India	20530.00	Electronics	https://m.media-amazon.com/images/I/717B2B7Hm8L._SL1500_.jpg	2026-03-29 10:45:07.257167	Nothing	Karan	22999.00	["https://m.media-amazon.com/images/I/717B2B7Hm8L._SL1500_.jpg"]	10
27	Neon Demo Product	Testing Neon DB Connectivity	99.99	Electronics	https://neon.tech/favicon.ico	2026-03-29 11:39:05.333207	\N	\N	\N	\N	10
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, product_id, user_id, rating, comment, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, created_at) FROM stdin;
1	Karan	krnjr8@gmail.com	$2b$10$xJCuAdqlBCrOo.e2gH.Bl.nY84YmJcHlelhP/oRxsNOSfCjYpXctK	2026-03-29 11:32:46.05856
\.


--
-- Data for Name: wishlist; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist (id, user_id, product_id, created_at) FROM stdin;
\.


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 11, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 27, true);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: wishlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wishlist_id_seq', 1, false);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_name_key UNIQUE (name);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlist wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_pkey PRIMARY KEY (id);


--
-- Name: wishlist wishlist_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wishlist wishlist_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist
    ADD CONSTRAINT wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict C5N6yPLndCeSFav1V2FONlADwpnuHgltUmdLgnUfXWZy5SAtAf5MA5hIx4L1ix5

