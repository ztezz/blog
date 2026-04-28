--
-- PostgreSQL database dump
--

\restrict 3zKO5Z2DgUAoQqD1XS9NEk8ded5wIqmFVu0kcaTcJs6VwMHSbC1qgkh0W7Yt22z

-- Dumped from database version 14.22 (Ubuntu 14.22-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.22 (Ubuntu 14.22-0ubuntu0.22.04.1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id character varying(50) NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    name character varying(255),
    email character varying(255),
    subject character varying(255),
    message text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    read_status boolean DEFAULT false
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    excerpt text,
    content text,
    author character varying(100),
    date character varying(20),
    category character varying(50),
    tags text[],
    image_url text,
    read_time character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    site_name_prefix character varying(50),
    site_name_suffix character varying(50),
    footer_description text,
    footer_copyright character varying(255),
    navigation jsonb,
    social_links jsonb,
    logo_url text,
    favicon_url text,
    about_content text,
    contact_content text,
    page_title character varying(255)
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.settings_id_seq OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(50) NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    display_name character varying(100),
    role character varying(20) DEFAULT 'editor'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name) FROM stdin;
gis-basic	GIS Cơ Bản & Nâng Cao
earth-obs	Quan Sát Trái Đất
solar-system	Hệ Mặt Trời
space-tech	Công Nghệ Vũ Trụ
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, name, email, subject, message, created_at, read_status) FROM stdin;
2	Trần Hồng Hà	thha.snnmt@tphcm.gov.vn	Test	Thử nghiệm	2025-12-14 15:23:42.318658	f
3	admin	admin@gisvn.space	thái test	thái test	2025-12-15 03:45:26.33431	f
4	thái	thaaai@g.com	thái	thái	2025-12-29 01:42:09.567336	f
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posts (id, title, excerpt, content, author, date, category, tags, image_url, read_time, created_at) FROM stdin;
4	Vệ tinh Viễn thám: Mắt thần thu thập dữ liệu không gian	Từ Landsat đến Sentinel - Cách các cảm biến thu thập dữ liệu đa phổ để phân tích sức khỏe hành tinh.	<p class="mb-4">Viễn thám (Remote Sensing) là xương sống của GIS hiện đại. Không cần chạm vào đối tượng, chúng ta vẫn hiểu rõ về nó nhờ sóng điện từ.</p><h3 class="text-xl font-bold text-space-neon mb-2">Cảm biến thụ động và chủ động</h3><p class="mb-4">Vệ tinh quang học (như Landsat 9) là thụ động, dựa vào ánh sáng mặt trời. Vệ tinh Radar (như Sentinel-1) là chủ động, tự phát sóng và thu hồi tín hiệu phản xạ, cho phép nhìn xuyên mây và đêm tối.</p><h3 class="text-xl font-bold text-space-neon mb-2">Chỉ số thực vật NDVI</h3><p class="mb-4">Một trong những ứng dụng phổ biến nhất: Tính toán sức khỏe thảm thực vật từ vũ trụ bằng cách so sánh dải sóng Đỏ (Red) và Cận hồng ngoại (NIR).</p>	Eng. Cosmo	2023-11-05	earth-obs	{"Remote Sensing",Satellite,Data}	https://picsum.photos/800/400?random=4	5 phút	2025-12-14 13:32:06.756537
5	Tương lai của GIS trong kỷ nguyên du hành liên sao	Khi con người rời khỏi Hệ Mặt Trời, bản đồ sẽ trông như thế nào? AI và Deep Learning sẽ thay đổi cách lập bản đồ ra sao?	<p class="mb-4">Chúng ta đang đứng trước ngưỡng cửa của việc trở thành giống loài đa hành tinh. GIS sẽ tiến hóa như thế nào?</p><h3 class="text-xl font-bold text-space-neon mb-2">Bản đồ tự hành thời gian thực</h3><p class="mb-4">Tàu vũ trụ tương lai sẽ không thể chờ lệnh từ Trái Đất (do độ trễ tín hiệu). Hệ thống GIS tích hợp AI trên tàu sẽ phải tự động lập bản đồ địa hình (SLAM) và ra quyết định điều hướng trong mili giây.</p><h3 class="text-xl font-bold text-space-neon mb-2">Dữ liệu lớn không gian (Spatial Big Data)</h3><p class="mb-4">Với hàng nghìn vệ tinh vệ tinh Starlink và các chòm sao vệ tinh quan sát Trái Đất, việc xử lý hàng Petabyte dữ liệu mỗi ngày đòi hỏi các thuật toán Cloud GIS và Deep Learning tiên tiến nhất.</p>	Dr. Orion Nguyen	2023-11-12	space-tech	{Future,AI,Interstellar}	https://picsum.photos/800/400?random=5	8 phút	2025-12-14 13:32:06.756537
2	Khám phá Sao Hỏa: Ứng dụng bản đồ không gian tìm sự sống	Làm thế nào dữ liệu quang phổ và bản đồ địa hình giúp chúng ta xác định dấu vết của nước cổ đại trên Hành tinh Đỏ.	<p class="mb-4">Sao Hỏa là mục tiêu lớn nhất của loài người trong thế kỷ 21. Nhưng trước khi con người đặt chân đến đó, GIS đã "đến" trước.</p><h3 class="text-xl font-bold text-space-neon mb-2">Phân tích Quang phổ (Spectral Analysis)</h3><p class="mb-4">Sử dụng dữ liệu từ máy quang phổ CRISM trên tàu MRO, các nhà khoa học GIS đã lập bản đồ phân bố khoáng chất. Các lớp đất sét (Phyllosilicates) và muối (Carbonates) được định vị chính xác, cho thấy nơi đây từng có nước lỏng.</p><h3 class="text-xl font-bold text-space-neon mb-2">Lựa chọn bãi đáp (Landing Site Selection)</h3><p class="mb-4">Quy trình chọn bãi đáp là một bài toán GIS điển hình: Chồng lớp (Overlay) các lớp dữ liệu về độ cao (DEM), độ dốc, mật độ đá và độ thú vị về mặt khoa học. Chỉ những vùng thỏa mãn tất cả tiêu chí mới được chọn.</p><p class="mb-4">Thái</p>	Sarah Nova	2023-10-20	solar-system	{Mars,Rover,Mapping}	https://picsum.photos/800/400?random=2	1 phút	2025-12-14 13:32:06.756537
1	GIS là gì? Tại sao GIS cần thiết cho nghiên cứu vũ trụ?	Khám phá định nghĩa về GIS và sự chuyển dịch từ bản đồ 2D trên mặt đất sang hệ tọa độ không gian 3D phức tạp.	<p class="mb-4">Hệ thống thông tin địa lý (GIS) không chỉ giới hạn ở việc vẽ bản đồ đường đi trên Google Maps. Trong kỷ nguyên không gian mới (New Space Age), GIS đóng vai trò cốt lõi trong việc quản lý dữ liệu vị trí của hàng triệu thiên thể.</p><h3 class="text-xl font-bold text-space-neon mb-2">Từ Geoid đến Ellipsoid</h3><p class="mb-4">Trên Trái Đất, chúng ta sử dụng Geoid để mô phỏng mực nước biển. Nhưng trên Mặt Trăng hay Sao Hỏa, không có biển để làm chuẩn. Các nhà khoa học phải xây dựng các bề mặt tham chiếu (Reference Surfaces) hoàn toàn mới dựa trên trường trọng lực và dữ liệu đo cao từ vệ tinh (Altimetry).</p><h3 class="text-xl font-bold text-space-neon mb-2">GIS Đa Hành Tinh</h3><p class="mb-4">NASA và ESA sử dụng các phần mềm GIS chuyên dụng để lập bản đồ bề mặt các hành tinh. Ví dụ, để hạ cánh tàu Perseverance lên miệng núi lửa Jezero, các kỹ sư đã phải xây dựng một bản đồ độ dốc (Slope Map) và độ gồ ghề (Roughness Map) cực kỳ chi tiết từ dữ liệu HiRISE.</p><p>Kết luận, GIS trong vũ trụ không chỉ là công cụ, nó là ngôn ngữ để chúng ta hiểu vị trí của mình giữa các vì sao.</p><p>Nguồn; Internet</p>	Dr. Orion Nguyen	2023-10-15	gis-basic	{GIS,Introduction,"Space Science"}	https://picsum.photos/800/400?random=1	1 phút	2025-12-14 13:32:06.756537
3	So sánh Hệ quy chiếu Trái Đất và Bản đồ Thiên văn	Sự khác biệt cơ bản giữa Latitude/Longitude trên Trái Đất và Right Ascension/Declination trên bầu trời.	<p class="mb-4">Khi nhìn lên bầu trời, các quy tắc của bản đồ học truyền thống thay đổi hoàn toàn. Chúng ta không còn dùng vĩ độ/kinh độ theo nghĩa đen nữa.</p><h3 class="text-xl font-bold text-space-neon mb-2">Hệ tọa độ Xích đạo (Equatorial Coordinate System)</h3><p class="mb-4">Trong thiên văn học, chúng ta dùng Góc giờ (Right Ascension - RA) và Độ xích vĩ (Declination - Dec). Đây là sự mở rộng của kinh vĩ độ Trái Đất ra quả cầu thiên thể (Celestial Sphere).</p><h3 class="text-xl font-bold text-space-neon mb-2">Thách thức về Thời gian</h3><p class="mb-4">Trái Đất quay, các ngôi sao có vẻ đứng yên nhưng thực ra chúng có chuyển động riêng (Proper Motion). Bản đồ vũ trụ là bản đồ 4D, nơi thời gian (Epoch) đóng vai trò quan trọng để xác định vị trí chính xác của một ngôi sao tại thời điểm quan sát. Thái</p>	Prof. Stardust	2023-11-01	gis-basic	{"Coordinate Systems",Astronomy,Math}	https://picsum.photos/800/400?random=3	1 phút	2025-12-14 13:32:06.756537
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, site_name_prefix, site_name_suffix, footer_description, footer_copyright, navigation, social_links, logo_url, favicon_url, about_content, contact_content, page_title) FROM stdin;
1	GISVN		Khám phá vũ trụ thông qua lăng kính dữ liệu không gian.	© 2025 by Thượng Hồng Thái.	[{"id": "home", "path": "/", "label": "Trang Chủ", "isExternal": false}, {"id": "blog", "path": "/blog", "label": "Bài Viết", "isExternal": false}, {"id": "about", "path": "/about", "label": "Giới Thiệu", "isExternal": false}, {"id": "contact", "path": "/contact", "label": "Liên Hệ", "isExternal": false}, {"id": "nav-1765725137799", "path": "Geo.gisvn.space", "label": "Webgis", "isExternal": true}, {"id": "nav-1765725173551", "path": "https://gisvn.space/solar", "label": "Giả lập hệ mặt trời 3D", "isExternal": true}]	{"twitter": "#", "facebook": "https://www.facebook.com/thuonghongthai97/", "linkedin": "#"}	/api/uploads/file-1765723761923-866221827.png	/api/uploads/file-1765723754803-371110777.png	\n<div class="text-center mb-16">\n  <h1 class="text-4xl md:text-6xl font-display font-bold text-white mb-6">\n    Về <span class="text-space-neon">GISVN</span>\n  </h1>\n  <p class="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">\n    Chúng tôi là những nhà khoa học dữ liệu, kỹ sư bản đồ và những người yêu thiên văn, cùng nhau xây dựng cầu nối giữa Trái Đất và Vũ Trụ thông qua ngôn ngữ của bản đồ.\n  </p>\n</div>\n<div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">\n  <div class="order-2 md:order-1">\n    <h2 class="text-3xl font-display font-bold text-white mb-4">Sứ Mệnh</h2>\n    <div class="w-16 h-1 bg-space-purple mb-6"></div>\n    <p class="text-gray-400 mb-4 leading-relaxed">\n      Vũ trụ quá rộng lớn để có thể hiểu hết chỉ bằng quan sát thông thường. Chúng tôi tin rằng <strong>Spatial Data (Dữ liệu không gian)</strong> chính là chìa khóa.\n    </p>\n    <p class="text-gray-400 leading-relaxed">\n      Sứ mệnh của GISVN là phổ cập kiến thức về GIS trong thiên văn học, cung cấp cái nhìn sâu sắc về cách các tàu vũ trụ định vị, cách chúng ta vẽ bản đồ Sao Hỏa, và cách công nghệ viễn thám bảo vệ Trái Đất.\n    </p>\n  </div>\n  <div class="order-1 md:order-2 bg-gradient-to-br from-space-neon/20 to-space-purple/20 p-1 rounded-2xl">\n    <div class="bg-space-900 rounded-xl p-8 h-full flex flex-col items-center justify-center text-center border border-white/10">\n      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-space-neon mb-4 animate-pulse-slow"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>\n      <h3 class="text-xl font-bold text-white">Định vị Chính xác</h3>\n      <p class="text-gray-500 mt-2">Dù ở bất cứ đâu trong dải Ngân Hà</p>\n    </div>\n  </div>\n</div>\n	\n<h3 class="text-2xl font-bold text-white mb-6">Thông tin liên hệ</h3>\n<div class="space-y-6">\n  <div class="flex items-start">\n    <div class="bg-space-neon/10 p-3 rounded-full mr-4 text-space-neon">\n       📍\n    </div>\n    <div>\n      <h4 class="text-white font-semibold">Trụ sở chính</h4>\n      <p class="text-gray-400 mt-1">Tầng 3A, Tòa nhà Trung tâm hành chính Bình Dương,đường Lê Lợi, phường Bình Dương, Thành phố Hồ Chí Minh</p>\n    </div>\n  </div>\n  <div class="flex items-start">\n    <div class="bg-space-purple/10 p-3 rounded-full mr-4 text-space-purple">\n       ✉️\n    </div>\n    <div>\n      <h4 class="text-white font-semibold">Email</h4>\n      <p class="text-gray-400 mt-1">ththai@gmail.com</p>\n      <p class="text-gray-400"> </p>\n    </div>\n  </div>\n  <div class="flex items-start">\n    <div class="bg-blue-500/10 p-3 rounded-full mr-4 text-blue-400">\n       📞\n    </div>\n    <div>\n      <h4 class="text-white font-semibold">Điện thoại</h4>\n      <p class="text-gray-400 mt-1">(+84) 354733505</p>\n    </div>\n  </div>\n</div>\n	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, display_name, role) FROM stdin;
user-1765722145228	thai	123@	Thượng Hồng Thái	admin
admin-1	admin	543457	Super Admin	admin
\.


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 4, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 1, false);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- PostgreSQL database dump complete
--

\unrestrict 3zKO5Z2DgUAoQqD1XS9NEk8ded5wIqmFVu0kcaTcJs6VwMHSbC1qgkh0W7Yt22z

